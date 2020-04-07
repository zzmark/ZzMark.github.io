---
title: 博客更换至caddy
date: 2018-12-24 00:00:00
tags: 
 - caddy
 - nginx
categories:
 - 运维
---

最近想要搞一个下载文件的页面，又不想自己写前端，nginx 的 autoindex 太难看，想要使用 fancyindex 却还需要编译 nginx 才能开启这功能，目前在 docker 上懒得自己搞，想起了 caddy 这个东西带这个功能并且还算看得过去，就有想法去搞 caddy。

### before

CentOS7 docker，nginx 使用了官方 docker 镜像

暴露80、443端口，挂载本地文件夹，网页内容放在本地，配置方面也只是设置了 `http -> https`，还有 `TLS` 证书，证书使用 `Let's Encrypt` 通配符证书，开启 http2，算法方面该默认都默认没有什么特殊的

### after

CentOS7 docker，caddy 使用了 [abiosoft/caddy](https://hub.docker.com/r/abiosoft/caddy)

暴露80、443端口，挂载本地文件夹，使用 caddy/git 插件拉取 github 仓库内容，方便日后更换博客前端，也方便当前 hexo 内容同步，稍后把 github 的 homepage 改到自己的域名上

caddy 配置了自动的 TLS 证书，默认开启 http2 (不过在我浏览器上，http2并没有生效，SSLlabs倒是通过了，可能本地环境问题)，默认使用 TLS 1.2，想要使用 TLS 1.3 需要自行编译 golang 运行环境，想要启动 QUIC 需要手动加一个启动指令，不过这个 docker image 没提供这个，想搞就要自行 build 一个，或许过几天手痒痒就去搞起。

### 赠品

caddy 的文档，建议去看官方文档，英文也没几个词翻翻字典就当学英语了

[官方文档](https://caddyserver.com/docs)
[中文翻译文档-旧](https://dengxiaolong.com/caddy/zh/)
