---
title: Java 获取客户端真实 IP
date: 2020-02-22 21:28:59
tags: 
 - Java
 - 后端
 - tomcat
categories:
 - Java
---

一般来讲，获取客户端 ip 很容易。但是现在的部署结构，服务端都是在各层反向代理之后，直接获取的 ip 都是反向代理的 ip。

现在，主流的做法有两种


## 根正苗红的 RFC 7239 Forwarded

2014年 IETF 组织提出了 `[RFC 7239](https://tools.ietf.org/html/rfc7239)` 解决这一问题。

但这玩意太新了，目前 Java 阵营，没几个支持的……

这里有热心网友的统计[https://c960657.github.io/forwarded.html](https://c960657.github.io/forwarded.html)

就说 spring 一家，除 webflux 天生支持外，基于 servlet 的全都不认这东西。
也就是说，spring-mvc, springboot 等目前还不支持

不过有开源的 filter 提供了相应的支持代码，可以尝试一下，因为我没有测试过，这里并没有地址可贴，自行寻找。

大概看起来就是这样的
`Forwarded: for=192.0.2.60; proto=http; by=203.0.113.43`

可以参考 [Forwarded - HTTP | MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Forwarded)

## 社区方案 X-Forwarded-*

为了解决这个问题，社区推出了一个方案，将各层反向代理的 ip 都写在祖传属性 http.Header: X-Forwarded-* 属性中

因为 RFC 7239 推广程度还不够乐观，所以，现阶段靠谱点的做法还是用这祖传的东西

Java 端用起来也很方便，这里提供两个推荐方案

1. tomcat filter

    tomcat 提供了一个 RemoteIpFilter 可以支持 X-Forwarded-* 的请求头部，自动根据这个修改 ServletRequest 中 getRemoteAddr 方法返回值，只需要启用该 filter 即可实现

    这个方法十分简单，spring boot / springMVC 均适用，强烈推荐。但局限于标准的 X-Forwarded-* 规则，所以有复杂需求的话，还是选择下面的方法吧

2. springboot + tomcat 适用

    tomcat 在 springboot 中提供了以下配置，可以配置用于传输"x-forwarded"信息的headers名：

    server.tomcat.remote-ip-header=x-your-remote-ip-header
    server.tomcat.protocol-header=x-your-protocol-header

什么？你说你用 Jetty？那可以试试这个 ForwardedRequestCustomizer，效果更好。

什么？你说你用睾贵的 Undertow？自己找吧，这东西我么用过。
