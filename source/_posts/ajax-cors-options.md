---
title: AJAX在跨域时请求OPTIONS
date: 2017-08-26 00:00:00
tags: 
 - HTML
categories:
 - 运维
---

这个问题早就遇到了，今天又一次遇到而且需要用另一个角度去解决，所以写下来这些总结

AJAX 是个很方便的东西，不过工具性能越好，就会越难以控制，AJAX 就有着种种安全相关的问题，所以浏览器对此做了诸多限制，这些限制也对我们编写带来了一定的约束和限制

最常见的问题应该就是跨域问题，老的解决方法有 `iframe`, `jsonp`，但是这两个方法前者有着很大的安全隐患，后者并没有规范标准，很多地方并不兼容而且需要后端对数据做特殊的处理。

如今有了新的 `CORS` 来解决，十分简单稳定，不过对古董浏览器的兼容性差，在这里不讨论。

先说 CORS 复杂请求的问题：

AJAX 请求可以分为简单请求和复杂请求（依照AJAX请求时是否会触发OPTIONS请求来划分，并非 http 规范的称呼）

简单请求需要符合下列三种要求

1. 请求类型为 Get Post
2. 请求的Content-Type为下列三种之一
    - application/x-www-form-urlencoded
    - multipart/form-data
    - text/plain
3. HTTP请求的头部信息不超过这几种字段
    - Accept
    - Accept-Language
    - Content-Language
    - Last-Event-ID
    - Content-Type

简单请求，浏览器可以直接发送

具体来说就是自动在头部信息中自动增加一个 Origin 字段用来说明本次请求的源（协议、域名、端口）

如果服务器不允许这个源，则返回结果的 Header 中不包括 `Access-Control-Allow-Origin`，浏览器没有找到 `Access-Control-Allow-Origin` 则会让这次请求失败，若允许则返回正常结果集并多出几个字段：

1. `Access-Control-Allow-Origin` 必须。返回 Origin 字段的值
1. `Access-Control-Allow-Credentials` 是否允许包含 Cookie
1. `Access-Control-Expose-Headers` 默认情况下，AJAX 只能拿到上标准的 header，若需要其他的值则需要这个属性指定，否则无法通过验证

复杂请求，浏览器会先发送一个 OPTIONS 请求，该请求服务器应返回一个 HTTP 204，携带`Access-Control-Allow-Origin`，同上如果不存在则不允许

复杂请求的OPTIONS可能会返回以下字段：

1. `Access-Control-Allow-Methods` 必须。返回支持的HTTP请求方法
1. `Access-Control-Allow-Origin` 必须。返回Origin字段的值
1. `Access-Control-Allow-Headers` 如果请求中包含该字段，则返回时必须有该字段。表明服务器支持的所有头信息字段
1. `Access-Control-Max-Age` 用来指定本次预检请求的有效期，单位为秒
1. `Access-Control-Allow-Credentials` 是否允许包含Cookie

这些东西，结合返回头部来看会更好，但是目前我没有很好的抓包手段（我指的是抓服务器传入值），等找到更好的抓包方法再进行补充。
