---
title: HTML 中常用的 Meta 标签
date: 2017-04-03 16:31:25
tags: 
 - HTML
 - 前端
 - meta
categories:
 - 前端
---

整理手机端适配时常用的 META 标签，留作备用

```html
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="format-detection" content="telephone=no">
<meta name="format-detection" content="email=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="full-screen" content="yes">
<meta name="browsermode" content="application">
<meta name="x5-orientation" content="portrait">
<meta name="x5-fullscreen" content="true">
<meta name="x5-page-mode" content="app">
<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,minimal-ui">
```

从上到下：

* 网页字符集编码，这里使用了UTF8
* X-UA-Compatible: 文档兼容定义，IE=edge IE以最高模式渲染
* format-detection: 规定文中的 telephone, email 和 adress 是否被系统接管，即手机访问时会不会出现点击一串数字跳转到拨号界面
* apple-mobile-web-app-capable, apple-mobile-web-app-status-bar-style: 苹果IOS专用，是否使用 web app 标准显示该网页，具体内容 google
* full-screen: UC浏览器私有 meta，强制全屏
* browsermode: UC浏览器私有 meta，页面默认全屏（会覆盖系统状态栏），禁止长按菜单，禁止收拾(?)，标准排版，以及强制图片显示
* x5-orientation: QQ浏览器私有 meta，屏幕方向
* x5-fullscreen: QQ浏览器私有 meta，设置全屏
* x5-page-mode: QQ浏览器私有 meta，设置屏幕模式（会保留系统状态栏）
* viewport 显示设置:
 * width: 宽度，device-width 设备宽度，值和body给了CSS 100%相同
 * initial-scale, minimum-scale, maximum-scale: 初始缩放比例、最小缩放比例、最大缩放比例，全是1则禁止缩放（不完全）
 * user-scalable: 用户缩放 no则禁止缩放，配合上条完全禁止缩放
 * minimal-ui: IOS7专用标签，隐藏工具栏、地址栏，IOS8 废弃

### META标签的属性:

对于META标签，必要的属性只有一个content，用于声明描述内容

所描述的选项可以由两种属性来声明

* name
* http-equiv

其中http-equiv会将该条META写入请求Header中，用法多样，比如设置缓存、刷新时间、请求类型等

### SEO相关

```html
<meta name="keywords" content="your keywords">
<meta name="description" content="your description">
<meta name="author" content="author,email address">
<meta name="robots" content="index,follow">
```

大概从英文是可以看出功能
* keywords，页面关键词
* description，页面内容描述
* author: 作者
* robots: 告诉搜索引擎索引对网站的索引程度，默认值为`index`索引本页面，可以设置多个值，除此之外有如下常见值（不完全）
 * noindex: 禁止搜索引擎索引
 * noimageindex: 禁止搜索引擎索引本页面上的图片
 * follow/nofollow: 允许/不允许爬虫去爬本页面上的链接
 * none: none是noindex,nofollow的缩写
 * noarchive: 阻止搜索引擎显示该页面的缓存版本，就是快照
 * nocache: 同上

### DNS 预读取

```html
<meta http-equiv="x-dns-prefetch-control" content="on">
<link rel="dns-prefetch" href="//www.spreadfirefox.com">
```

可以强制让页面内加载时，同时请求列表中的 DNS，让浏览器提前缓存目标 url 的 DNS 解析，减少请求时间

使用场景：
- 一些静态资源域名(超链接浏览器会自动处理)
- 登录页面，可以将要访问的地址和即将跳转的地址加入，加快请求速度

该参数还可以使用 Header 来赋予
