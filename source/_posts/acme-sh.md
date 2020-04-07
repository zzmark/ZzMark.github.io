---
title: acme.sh配置记录
date: 2018-02-18 00:00:00
tags: 
 - https
categories:
 - 运维
---

实际上这是个很简单又完善的工具，不过官网手册我看了好半天才理解，绕了很大的弯子

本文基于 CentOS 7 1708, nginx 1.12.2，acme.sh v2.8.0，环境和我的不相符也无所谓，但请不要完全照抄

文中的域名，均替换为了 example.com，伸手党注意鉴别。

本博目前使用的是 caddy，并没有用这个脚本，这是公司测试环境使用的东西

## info

ACME 协议: Automated Certificate Management Environment(自动证书管理环境)
acme.sh: 一个自动管理证书的工具，可以用来自动申请和续期 Let’s Encrypt 证书

## install

首先安装工具，一行命令就能搞定，如果想要采用 standalone 模式（也就是不需要现有的web服务器，有80端口就可以申请），还需要安装 socat，使用包管理工具一行命令就能搞定 ，不过我用不到就没有装这个。

安装命令：
```
curl  https://get.acme.sh | sh
```

安装好后，重新登陆 ssh 让 alias 生效，可以使用 acme.sh 这个指令，方便操作

安装会写入一条 crontab 定时任务，这就是迷惑人的重点，稍后讲。

## 注册(issue)

工具的用词是 `issue`，用语和 Let’s Encrypt 对应。在这个工具上，我最终的理解就是注册，有对 nginx 的特殊配置，不会更改配置文件（最终），需要80端口直通（公网ip:80对应机器:80），如果有特殊需求，比如映射端口，那应该是可以的，不过没找到直接描述的手册

```sh
acme.sh --issue -d example.com --nginx
```

这个语句会注册这个任务，并当即申请一个证书，托管到自己的文件夹下

## 发布(nginx reload)

以下指令，会注册一个任务，任务会将证书发布到指定位置，执行任务所设置的 reload 命令。

nginx 使用的证书需要有完整的证书链，手动处理的话，就是将 CA.cer 和 domain.cer 按照顺序拼装起来，不过这个工具提供了自动手段，配置即可，命令一眼就能看懂不多说。

因为他不会改变 nginx 的配置，所以说发布证书之后，如何使用证书需要自行配置，这个上网找就可以了，不难。
```sh
acme.sh --installcert -d example.com --key-file /etc/ssl/www/example.com.key --fullchain-file /etc/ssl/www/example.com.cer --reloadcmd "service nginx force-reload"
```

## 重点

这个工具最迷惑人的地方就是他那全自动的系统，那两个步骤执行语句的时候都是当即生效，让人觉得自己要手动执行，甚至考虑要怎么设置定时来执行这两句话，实际上这两句话执行的逻辑是注册，将任务注册到 acme.sh 工具上，然后利用安装时候设定好的 acme.sh 定时任务来执行已注册的任务，所以说实际上只需要执行一次，日后的动作都是全自动的。

为什么当即生效，就理解成添加任务的时候需要一个初始化状态吧

## 另一个坑

在自己的测试环境上，这样就算完成了，但是实际环境上又遇到了一个问题

```
Verify error:Invalid response from http://example.com/.well-known/acme-challenge/8VdhXwwueFAe6lqmCpNDtESnkoWiTjhK6afT_nE8hoQ:
```

怀疑了一圈，最后发现，我们的 http 使用了 rewrite 跳转到 https 的，导致了acme.sh 的配置无法正确更改，有人提出了 [issue](https://github.com/Neilpang/acme.sh/issues/1115) 但到现在还没有什么措施

所以放弃了使用 –nginx 指令，改用 –webroot 指令，不过这个是否成功，得等过一阵子才能知道，因为写这个说明的时候，提示了这个

```
www.example.com is already verified, skip http-01.
```

可能 Let’s Encrypt 那边有缓存吧，无法得知是不是真的好用了
