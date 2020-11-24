---
title: gitlab升级记录
date: 2020-11-06 12:01:02
updated: 2020-11-23 18:16:00
tags:
categories:
cover: /gallery/gitlab升级记录-1.png
thumbnail: /gallery/gitlab升级记录-2.png
---

公司用的版本是 8.17.4 ，研发部门用不惯，恰好内网服务器重新部署，决定升级

本文中，所有版本号均为编写时的版本参考，必要的地方贴了地址，记得去看新的文档

本文撰写时，最新版本为 13.5.1，封面截图时最新版本已经是13.6.0，由于没有升级计划，所以并没有使用最新的图

## 备份

首先，备份，并把备份文件拖回本地

- 备份本体
  ```sh
  gitlab-rake gitlab:backup:create
  ```
  默认情况下，备份结果会在 /var/opt/gitlab/backups

- 将配置文件进行备份
  - /etc/gitlab/gitlab.rb 配置文件
  - /var/opt/gitlab/nginx/conf nginx配置文件
  - /etc/postfix/main.cfpostfix 邮件配置备份(可选)
  - /etc/gitlab/gitlab-secrets.json 密钥文件，里面有数据库的密码

## 升级

gitlab 要按照版本逐个升级，官方给出了[升级路线](https://docs.gitlab.com/13.5/ee/policy/maintenance.html#example-upgrade-paths)，

大概意思就是，跨版本升级，要升级到当前主要版本最新的版本，才能跨入下一个版本

我们的版本是 8.17.4，最终的升级路线为

```
8.17.4 -> 8.17.7 -> 9.5.10 -> 10.8.7 -> 11.3.4 -> 11.11.8 -> 12.0.12 -> 12.10.14 -> 13.0.14 -> 13.5.1(当前最新)
```

极其漫长……

### pre

首先一个误区，升级不能关闭 gitlab

如果以前改动过某些配置文件，中间可能会有询问，所以盯着点

执行 upgrade 时，系统的部分也会升级，如果用的系统已经不在维护期内，比如ubuntu 1710(我们就是这傻逼东西)，最好先解决系统问题

我的做法是，拉个新虚拟机，ubuntu 1604 lts(截止到2021年4月)，不选1804纯是因为手上只有这现成的，之后会考虑迁移到 centos7.8(EOL 2024年6月)

记得替换源（我用的是 清华）

执行命令时，最好给 ssh 工具开个日志记录，我用的 xshell，记录下过程中的日志，避免出了问题不好排查

### 各路升级命令

很复制粘贴，直接升级上来就行

```sh
sudo apt-get upgrade gitlab-ce=8.17.7-ce.0
sudo apt-get upgrade gitlab-ce=9.5.10-ce.0
sudo apt-get upgrade gitlab-ce=10.8.7-ce.0
sudo apt-get upgrade gitlab-ce=11.3.4-ce.0
sudo apt-get upgrade gitlab-ce=11.11.8-ce.0
sudo apt-get upgrade gitlab-ce=12.0.12-ce.0
sudo apt-get upgrade gitlab-ce=12.10.14-ce.0
sudo apt-get upgrade gitlab-ce=13.0.14-ce.0
sudo apt-get upgrade gitlab-ce=13.5.1-ce.0
```

感谢多年前部署该系统的人，没有给我留什么配置文件上的大坑

## 迁移到docker中

为了方便日后维护，新开了个靠谱的虚拟机，专门用于 gitlab (以前的gitlab连raid都没有)。

迁移过程如下

配置块存储、mount、fstab、docker/daemon.json、net优化，宿主机该做的都做完后，用 docker-compose 启动 gitlab

```yaml
version: '3.7'
services:
  web:
    image: gitlab/gitlab-ce:13.5.1-ce.0
    restart: always
    hostname: 'gitlab.vajra.ltd'
    shm_size: 256M
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url 'http://gitlab.vajra.ltd';
        gitlab_rails['gitlab_default_projects_features_builds'] = false;
        gitlab_rails['lfs_enabled'] = true;
        nginx['custom_gitlab_server_config'] = "location /-/plantuml/ { \n    proxy_cache off; \n    proxy_pass  http://plantuml:8080/; \n}\n";
        gitlab_rails['ldap_enabled'] = true;
        gitlab_rails['prevent_ldap_sign_in'] = false;
        gitlab_rails['ldap_servers'] = {
          'main' => {
            'label' => 'LDAP',
            'host' =>  'ldap.vajra.ltd',
            'port' => 389,
            'uid' => 'uid',
            'encryption' => 'plain',
            'bind_dn' => 'cn=admin,dc=vajra,dc=ltd',
            'password' => '123456',
            'timeout' => 10,
            'active_directory' => false,
            'allow_username_or_email_login' => true,
            'block_auto_created_users' => false,
            'base' => 'ou=Users,dc=vajra,dc=ltd',
            'attributes' => {
              'username' => ['uid', 'userid', 'sAMAccountName'],
              'email' => ['mail', 'email', 'userPrincipalName'],
              'name' => 'cn',
              'first_name' => 'givenName',
              'last_name' => 'sn'
            },
            'lowercase_usernames' => false
          }
        }
    ports:
      - '80:80'
      - '443:443'
      - '22:22'
    volumes:
      - '/data/gitlab/config:/etc/gitlab'
      - '/data/gitlab/logs:/var/log/gitlab'
      - '/data/gitlab/data:/var/opt/gitlab'

  plantuml:
    image: 'plantuml/plantuml-server:jetty'
    container_name: plantuml
    restart: always
```

docker中安装相同版本，然后按照传统步骤执行。

1. 先确保 gitlab-secrets.json 一致
2. 将备份文件复制到 docker 容器的映射目录中
3. 修复权限(因为是直接目录挂载到了容器内，没有用 volume，为的是日后提取东西方便，虽然这样也脆弱了很多)

参考 [官方文档-docker恢复步骤](https://docs.gitlab.com/ee/raketasks/backup_restore.html#restore-for-docker-image-and-gitlab-helm-chart-installations)，按步骤执行即可
```bash
> docker exec -it xxxxx bash

# 停止相关服务
$ gitlab-ctl stop unicorn
$ gitlab-ctl stop puma
$ gitlab-ctl stop sidekiq

# 检查状态
$ gitlab-ctl status
run: alertmanager: (pid 1001) 1719s; run: log: (pid 695) 1765s
run: gitaly: (pid 1021) 1718s; run: log: (pid 301) 1898s
run: gitlab-exporter: (pid 626) 1787s; run: log: (pid 640) 1783s
run: gitlab-workhorse: (pid 966) 1720s; run: log: (pid 588) 1802s
run: grafana: (pid 1029) 1718s; run: log: (pid 745) 1755s
run: logrotate: (pid 609) 1793s; run: log: (pid 621) 1789s
run: nginx: (pid 591) 1799s; run: log: (pid 602) 1795s
run: postgres-exporter: (pid 1010) 1718s; run: log: (pid 719) 1761s
run: postgresql: (pid 392) 1893s; run: log: (pid 478) 1891s
run: prometheus: (pid 983) 1719s; run: log: (pid 678) 1771s
down: puma: 11s, normally up; run: log: (pid 528) 1814s
run: redis: (pid 258) 1905s; run: log: (pid 265) 1904s
run: redis-exporter: (pid 976) 1720s; run: log: (pid 659) 1777s
down: sidekiq: 4s, normally up; run: log: (pid 553) 1808s
run: sshd: (pid 27) 1925s; run: log: (pid 26) 1925s

$ gitlab-backup restore BACKUP=1604455708_2020_11_04_13.5.1
```

完成上述动作后，重启容器，等待服务正常运转后，执行以下命令
```bash
# Check GitLab
docker exec -it <name of container> gitlab-rake gitlab:check SANITIZE=true
```

完全通过后，迁移完成，后续升级按照 [docker 升级流程](https://docs.gitlab.com/omnibus/docker/README.html#update)，就是按照版本，直接删掉旧容器，换成新的启动，即可

gitlab 配置了 LDAP，这部分之后新开文章记录

## FAQ

整合后，途中断过一次电，发现 docker 容器整个都丢了……

虽然不晓得怎么回事，不过好在恢复起来不是太难，重新创建一个容器就好了

但创建容器后，并没有启动，查询日志发现，容器出现了几个问题

### 权限问题 `Permission Denied`

很容易解决
```bash
docker exec -it gitlab update-permissions
```

### Redis RDB 无法读取

具体日志忘了存留
解决方法也很简单，摸到 redis 日志位置，直接删掉，收工，连容器都不用重启

### alertmanager unexpected EOF

```
caller=main.go:261 err="unexpected EOF"
```

解法同上，摸过去删掉，反正 alertmanager 的存储只有告警历史和 since 配置，这些都可以重来

gitlab 的容器十分完备，连 `ps aux | grep alertmanager` 这命令都能执行，追查起来和宿主机一样
