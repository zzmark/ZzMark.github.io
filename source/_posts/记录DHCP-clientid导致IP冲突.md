---
title: 记录DHCP-clientid导致IP冲突
date: 2020-05-06 17:43:44
updated: 2020-05-18
tags:
categories:
cover: /gallery/ubuntu.png
thumbnail: /gallery/ubuntu.png
---

本次问题基于 ubuntu 1804, centos用户不要对坐(号)入号(座)

最近弄了一台物理服务器，复制了几个 ubuntu 1804，但出了一个神奇问题，这几台机器无一例外，dhcp获取的都是同一个ip

百思不得其解的问题，明明 mac 地址不同，为何会出这种事情

然后开始了排查历程

先做几个备忘：
 - ubuntu 1804，废弃了 ifupdown，改用 netplan 配置网络，学习成本不高，配置文件在 /etc/netplan/*.yaml，语法比较简单
 - 可能用到的命令行 
   * netplan ip leases `<device>` 查看网卡信息
   * netplan try 执行配置

排查过程中，做了以下尝试：

- 尝试了重启网卡
- 重启网络服务
- 重启机器
- dhclient 重新分配 ip

无果

重启网卡时，还遇到了 ifdown 不存在，原来是被废弃了，用 netplan 替代

但在 netplan ip leases 中，发现了一个参数， CLIENTID，这几台虚机的id是完全一致的

我的直觉告诉我，问题就在这里

翻到了靠谱的 [RFC-4361 Node-specific Client Identifiers for Dynamic Host Configuration Protocol Version Four (DHCPv4)](https://tools.ietf.org/html/rfc4361) 规范

知其所以然，还是不知道咋解决……

netplan 提供了这个参数 [dhcp-identifier](http://manpages.ubuntu.com/manpages/cosmic/man5/netplan.5.html)

提供了可以用 mac 当作 dhcp clientid 的配置，尝试一番，可行

剩下的基础知识，有空再补充

---

2020-05-18 更新

dhcp clientid 的默认值会根据 machine id 变更，克隆出的几台机器完全一致，所以这里才是真正的祸根

```sh
# 查看 machine-id
cat /etc/machine-id
```

可以使用 dbus-uuidgen 来重新生成一个 machine-id

```sh
sudo rm -f /etc/machine-id
sudo dbus-uuidgen --ensure=/etc/machine-id
```

https://unix.stackexchange.com/questions/402999/is-it-ok-to-change-etc-machine-id

然后重新使用 netplan apply 获取ip，收工。

然后，写了个一次性脚本来做这个工作。方式多的很，自行研究了
