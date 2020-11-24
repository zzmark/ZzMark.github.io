---
title: TIME_WAIT 过高排查记录
date: 2020-07-27 16:11:45
tags: 
 - 运维
 - nginx
 - Linux
categories:
 - 运维
cover: /gallery/2.png
---


线上服务器遇到了 TIME_WAIT 很高的情况，虽然服务没什么问题，机器剩余的配置很大(总计占用还不足机器的五分之一)，不过这问题很可能成为隐患，所以排查了一番，记录如下：

## 基础知识

1. TIME_WAIT 的来源
  {% asset_img 1.png TCP三次握手、四次挥手 %}
  TCP 的三次握手、四次挥手，
  常用的三个状态是：`ESTABLISHED` 表示正在通信，`TIME_WAIT` 表示主动关闭，`CLOSE_WAIT` 表示被动关闭
  三次握手：
  第一次，主动端发送`SYN`给 `LISTEN` 中的被动端，自己切换至 `SYN-SENT` 状态；
  第二次，被动端发送`ACK`确认收到信号和`SYN`；
  第三次，主动端发送`ACK`确认收到被动端`SYN`。
  完成上述动作后，两端进入enblished

  四次挥手中，
  第一次是主动端断开，发送`FIN`信号，切换至`FIN-WAIT-1`状态；
  第二次是被动端收到`FIN`信号，切换至`CLOSE-WAIT`状态，然后发送`ACK`至主动端，主动端收到后切换至`FIN-WAIT-2`；
  第三次是被动端等自己的应用断开连接时，发送`FIN`信号给主动端，被动端切换至`LAST-ACK`；
  第四次是主动端收到被动端的`FIN`信号，然后发送`ACK`信号，切换至`TIME-WAIT`状态，等待内核回收。

## 百度带来的坑

随手搜索问题之后，无论是 baidu 还是 google，搜到的大量内容，都是叫你优化 `net.ipv4` 这种治标不治本的方法，什么加快 TIME_WAIT 回收啊，增大量级啊

但是，问题的来源并没有解决，以往的经验表明，这么调整或许能解决问题，但连接反复开闭产生的资源消耗依然很大

## 定位 TIME_WAIT 原因

根据 TCP 握手规则，谁有`TIME-WAIT`，谁就是主动端。这点可以排除用户频繁访问或错误的释放连接的可能。

意思就是说这都是服务器主动请求断开连接的，而`TIME-WAIT`状态的链接也没有回收。

服务端可能产生的请求，也就只有服务间互相调用、访问第三方 API、反向代理

其实到这里已经快要破案了，要么是程序的 bug，要么是反向代理配置带来的大量 TIME_WAIT

接下来就是具体定位，连接到底是谁产生的了。

### 拓扑

目前线上很精简，只有一台机器，使用 docker 作为业务容器，外侧 nginx 做入口
```
              (docker)
       |-----------------|
nginx -> traefik -> api
       |-----------------|
```

nginx 持有 80 443 端口，traefik 通过 12500 暴露到主机，docker内的服务不对主机暴露端口

为啥这么设计？

Let's encrypt 的证书最近因 akamai 被墙导致 OCSP 无法执行，iOS 端首次请求会等待数秒钟，这对于用户不可接受，而我们又没有购买证书或者更换国内证书的打算(子域名有点多，申请起来太累，还是 acme.sh 来得爽)(还是穷的)

然而 traefik 并不能处理 `OCSP stapling`，只好让 nginx 扛起 `https` 的大任

### 命令排查

(因为执行时的命令结果没有保存，所以这里只有看出情况的命令行了)

查看 TIME_WAIT 属于哪个连接

```sh
netstat -tn|grep TIME_WAIT|awk '{print $4}'|sort|uniq -c|sort -nr|head
```

```
[root@m ~]# netstat -tn|grep TIME_WAIT|awk '{print $4}'|sort|uniq -c|sort -nr|head
   2703 127.0.0.1:12500
      2 172.17.3.142:3306
```

可以看出，`127.0.0.1:12500` 持有 2703个 TIME_WAIT，这个端口是后端API服务的监听端口。因为 TIME_WAIT 都是主动方持有，也就是说请求是由本机的程序发往后端 API 的，也就是猜测中的第三种-反向代理的请求

不过这还没法破案，然后是分析请求来源

```sh
netstat -ant|grep 127.0.0.1:12500
```

```
[root@m ~]# netstat -antp|grep 127.0.0.1:12500
tcp        0      0 127.0.0.1:37860         127.0.0.1:12500         TIME_WAIT  -
tcp6       0      0 127.0.0.1:12500         127.0.0.1:37828         TIME_WAIT  -
tcp6       0      0 127.0.0.1:12500         127.0.0.1:37748         TIME_WAIT  -
tcp6       0      0 127.0.0.1:12500         127.0.0.1:37782         TIME_WAIT  -
tcp6       0      0 127.0.0.1:12500         127.0.0.1:37728         TIME_WAIT  -
tcp6       0      0 127.0.0.1:12500         127.0.0.1:37802         TIME_WAIT  -
tcp6       0      0 127.0.0.1:12500         127.0.0.1:37864         TIME_WAIT  -
tcp6       0      0 127.0.0.1:12500         127.0.0.1:37720         TIME_WAIT  -
tcp6       0      0 127.0.0.1:12500         127.0.0.1:37770         TIME_WAIT  -
tcp6       0      0 127.0.0.1:12500         127.0.0.1:37844         TIME_WAIT  -
tcp6       0      0 127.0.0.1:12500         127.0.0.1:37810         TIME_WAIT  -
tcp6       0      0 127.0.0.1:12500         127.0.0.1:37852         TIME_WAIT  -
tcp6       0      0 127.0.0.1:12500         127.0.0.1:37752         TIME_WAIT  -
tcp6       0      0 127.0.0.1:12500         127.0.0.1:37742         TIME_WAIT  -
tcp6       0      0 127.0.0.1:12500         127.0.0.1:37870         TIME_WAIT  -
tcp6       0      0 127.0.0.1:12500         127.0.0.1:37832         TIME_WAIT  -
tcp6       0      0 127.0.0.1:12500         127.0.0.1:37762         TIME_WAIT  -
...
```

因为都在本地，这命令下去根本看不出啥来
如果是外来请求，或者其他 ip 的请求，那么后方的 127.0.0.1 就会显示那一方的 ip

如果运气好，能看到 127.0.0.1:12500 在后边，也就是第五个参数位置，那么可以尝试翻一翻是否有最后一个参数，若 TIME_WAIT 占比不是特别绝望，应该能看到几个。
而这几个很有可能就是发起者。也算是种猜测了。

到这里我也没什么排查手段了，因为请求来源是 127.0.0.1，不好确认是哪里来的请求。
这也就是单节点带来的痛苦……

不过按照前面的线索，nginx 的可能性很大

## nginx 带来的 TIME_WAIT

1. 导致 nginx端出现大量TIME_WAIT的情况有两种：

  keepalive_requests设置比较小，高并发下超过此值后nginx会强制关闭和客户端保持的keepalive长连接；（主动关闭连接后导致nginx出现TIME_WAIT）
  keepalive设置的比较小（空闲数太小），导致高并发下nginx会频繁出现连接数震荡（超过该值会关闭连接），不停的关闭、开启和后端server保持的keepalive长连接；

2. 解决方案

  对于反向代理，nginx 提供了一个 upstream 的参数：
  ```conf
  upstream http_backend {
    server 127.0.0.1:12500;
    keepalive 50;
  }
  ```

  这样便能解决问题。

  下面是该参数的相关逻辑以及官方对此的说明：

  [http://nginx.org/en/docs/http/ngx_http_upstream_module.html#keepalive](http://nginx.org/en/docs/http/ngx_http_upstream_module.html#keepalive)

  1. The connections parameter sets the maximum number of idle keepalive connections to upstream servers that are preserved in the cache of each worker process. When this number is exceeded, the least recently used connections are closed.（设置每个 worker 进程保留与上游服务器的 keepalive 连接最大数量。超过此数量时，将关闭最近最少使用的连接。）
  2. It should be particularly noted that the keepalive directive does not limit the total number of connections to upstream servers that an nginx worker process can open.（特别提醒：keepalive指令不会限制一个nginx worker到 upstream 连接的总数量）
