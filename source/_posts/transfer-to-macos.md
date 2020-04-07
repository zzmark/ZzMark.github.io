---
title: 迁移到 Mac
date: 2018-04-11 00:00:00
tags: 
 - 环境
categories:
 - 环境
---

最近重新搬出了黑苹果，打算把工作环境迁上去。

有些东西还是挺麻烦的，本想直接安装 docker 解决一些环境问题，后来觉得这玩意，笔记本内存并不大，也就只能拿来启动个 mysql，放弃了 docker

## [Homebrew](https://brew.sh/)

Mac 系统中的 apt、yum，感觉应该是个十分方便的东西。可是实装后，我用来装了个 node，就出了许多问题

1. node 装好后没有 npm，不晓得是不是我版本的问题
1. 不能很好的定制版本，至少没有让我这个没接触过的很容易的选择版本
1. 软链接还出了问题，虽然提供了解决方法，但是你都提供方法了为啥不自己修复一下

总而言之，体验不好，最后node环境还是手工解决的，LTS版本

本想用来装个Java，然后发现里面并没有Oracle jdk，emmm……

到最后还是自行下载了pkg版本，虽然确实想试试 openjdk 来着

不了解Mac的服务管理，最后选择了手动下载二进制MySQL

## iTerm2 + [Oh My ZSH](https://ohmyz.sh/)

这个组合是一个产品小哥和数据大佬的推荐，Oh My ZSH实装之后觉得，zsh可定制性和各种插件好评，虽然我也用不上什么，不过tab的提示和自带主题真的可以

然而iTerm2就只能说一般了，没感觉到那种眼前一亮，跟系统自带的相比功能也好强度也好，也就那样，可能我还是用不到那些高大上的功能。

## 常用工具

  - [IntelliJ IDEA Ultimate](https://www.jetbrains.com/)
    直接用 Jetbrains toolbox 安装，省时省力，还有中国 CDN，就是速度很看人品，太慢的话暂停重开可能就会好

  - [VSCode](https://code.visualstudio.com/)
    微软爸爸的记事本，轻量级开发 IDE，插件很多，底层据说是 Atom 魔改过的，不过那跟我没啥关系

  - 印象笔记
    安卓、win、mac 三平台同步，虽然最近没写过什么正经笔记

  - [Chrome](https://www.google.cn/chrome/)
    重度谷歌用户必须要有的东西，安卓、win、mac 三平台同步，什么都方便
    如今也能在国内直接下载了

  - SS
    用谷歌的怎么能没有这个，顺便一提最近打算自己架设线路，如有定时的轻度用户欢迎合作

  - 微信、QQ
    必须要有的聊天工具，不然自己就像与世隔绝了一样

  - [MacDown](https://macdown.uranusjr.com/)
    Mac 系统上的 markdown 编辑器，在我心中他只是第二，mou 还是比这个好用，可惜 mou 只支持到10.11
    不过最近也很少用这东西，反而是 VSCode 一步到位了

  - [Alfred](https://www.alfredapp.com/)
    Mac 上的神器，能设置许多的方便功能，强于 Mac 的 Spotlight。我加装了有道插件、几个快捷启动、颜色编码识别插件。不过收费产品，暂时还没宽裕到支持正版，请允许我厚颜无耻一次。
    win 上的 Wox 就是参照这个软件的模式做的。

  - [office](https://www.office.com/?auth=2)
    office365 套件，跟 win 上用的同一套，一个账户直接通用

## 朋友推荐的东西

这里的东西我并没有使用

  - [Quiver](http://happenapps.com/)
    用于代替印象笔记，markdown编写，笔记该有的他都有，是个中国人开发的有GitHub仓库不过没开源，收费软件，再加上没有印象那么强劲的全平台，而且我印象会员还有很久，就没考虑

  - MWeb
    比上面那个更强的笔记软件，markdown编写，还支持生成hexo博客，IOS和Mac客户端，也是中国人开发的，看着官网感觉不错，可是理由同上。
    
如有其他日后补充。