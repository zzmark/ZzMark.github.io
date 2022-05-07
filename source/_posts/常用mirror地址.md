---
title: 常用环境 mirror 地址
tags:
  - tools
  - 环境
categories:
  - 环境
thumbnail: /2020/02/常用mirror地址/logo.png
abbrlink: 428d5fa5
date: 2020-02-22 21:25:29
updated: 2021-09-06 12:15:00
---


主要覆盖了我可能会去使用的 mirror。长期更新。

## 部分工具设置方法

参见 [hedzr/mirror-list](https://github.com/hedzr/mirror-list#china-mirrors)

## github

> 截止到 2021年9月6日12点16分 可用

- fastgit.org

  > 支持 raw , web , git clone , ssh 甚至支持 git push
  >
  > 但这是个第三方的东西，不要用来登陆自己的账号


  公益项目 [FastGitORG](https://github.com/FastGitORG) 所架设，服务器疑似在东京，作者甚至连 状态检测 都提供了

  功能支持很全面，甚至 ssh 都支持了

  使用方法：
  ```
  github.com  替换为 hub.fastgit.org 即可

  raw.githubusercontent.com  替换为  raw.fastgit.org
  ```

  更多的详见 [doc.fastgit.org](https://doc.fastgit.org/)

- cnpmjs.org

  > 支持  web , git clone
  
  阿里的服务，可用性、速度都算是很有保障。

  服务和 cnpm  register.taobao.com 是一套(虽然这个镜像貌似也被废弃了)

  但是支持的功能很少，也就拿来 clone 比较方便，

  使用方法：
  ```
  github.com  替换为  github.com.cnpmjs.org  即可
  ```

- mirror.ghproxy.com

  > 支持 release , git clone ，CDN 处理很好，速度很快

  个人持有，资料很少，但解析的地址是 cnpmjs 和 jsdelivr ，速度有保证
  没有 web ，不是太方便，仅用于 release 下载和 clone 即可

  使用方法：
  ```
  支持的域名为：
  https://github.com/
  https://raw.githubusercontent.com/
  https://gist.githubusercontent.com/
  https://gist.github.com/

  在几个域名前面加上   https://mirror.ghproxy.com/ 

  例如：

  git clone https://mirror.ghproxy.com/https://github.com/stilleshan/ServerStatus

  wget https://mirror.ghproxy.com/https://github.com/stilleshan/ServerStatus/archive/master.zip

  curl -O https://mirror.ghproxy.com/https://github.com/stilleshan/ServerStatus/archive/master.zip

  wget https://github.com/stilleshan/ServerStatus/archive/master.zip
  ```

## 前端 node 管理以及常用 mirror 地址

总共分三个部分，nvm、npm、其他镜像

我选镜像的原则是，阿里、华为、清华，哪个好用就哪个

最近没有对 yarn 的使用，这部分暂且省略

### nvm

对于安装 node 环境，无论是 win/Linux，均推荐使用 nvm 安装环境，方便、稳妥、麻烦少

### 目标环境

- node LTS 版本
- npm 而非 cnpm (个人不喜欢cnpm)
- (可选) yarn 包管理工具
- 安装位置均为默认位置，对 C盘 有强迫症的，请自行前往 nvm项目页面 寻找定制路径的方案

nvm 有两个版本，nvm-windows 和 nvm。

最近 nodejs.org 的 cdn 也很不错了，不设置 mirror 很多时候是能下载得动

nvm：
```sh
# install nvm, 安装后记得重启终端让环境变量生效
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.1/install.sh | bash

# nvm 不支持配置 mirror，但提供了环境变量来影响配置
export NVM_IOJS_ORG_MIRROR=https://npmmirror.com/mirrors/iojs
export NVM_NODEJS_ORG_MIRROR=http://npmmirror.com/mirrors/node

# 以下安装 lts 版本 node 命令
nvm install --lts
nvm use --lts
```

nvm-windows:
```bat
REM nvm-windows 贴心的给我们提供了文档 https://github.com/coreybutler/nvm-windows#usage
nvm node_mirror https://npmmirror.com/mirrors/node/
nvm npm_mirror https://npmmirror.com/mirrors/npm/

nvm list available

REM 安装版本需要自行填写
nvm install %VERSION%
nvm use %VERSION%

REM 有必要的话，直接上代理
REM nvm proxy xxxxxx
```

### npm

```sh
# 必备的、或许有用的、应该有用的，都在这了
npm config set registry=https://registry.npmmirror.com/
npm config set electron-mirror=https://npmmirror.com/mirrors/electron/
npm config set phantomjs_cdnurl=https://npmmirror.com/mirrors/phantomjs/
npm config set chromedriver_cdnurl=http://npmmirror.com/mirrors/chromedriver
npm config set sass-binary-site=https://npmmirror.com/mirrors/node-sass
npm config set SELENIUM_CDNURL=http://npmmirror.com/mirrorss/selenium/
npm config set profiler_binary_host_mirror=http://npmmirror.com/mirrors/node-inspector/
```

```sh
# 有必要的话，直接上代理
# 假设本地socks5代理端口为1812
# http代理伺服
npm install -g http-proxy-to-socks
# 8002 http代理 转发到 socks5://127.0.0.1:1812
hpts -s 127.0.0.1:1812 -p 8002
# 设置 npm 代理为8002
npm config set proxy http://127.0.0.1:8002
npm config set https-proxy http://127.0.0.1:8002
```

### Yarn

```sh
yarn config set registry http://registry.npmmirror.com

# 以下未经测试
yarn config set electron-mirror=https://npmmirror.com/mirrors/electron/
yarn config set phantomjs_cdnurl=https://npmmirror.com/mirrors/phantomjs/
yarn config set chromedriver_cdnurl=http://npmmirror.com/mirrors/chromedriver
yarn config set sass-binary-site=https://npmmirror.com/mirrors/node-sass
yarn config set SELENIUM_CDNURL=http://npmmirror.com/mirrorss/selenium/
yarn config set profiler_binary_host_mirror=http://npmmirror.com/mirrors/node-inspector/
```

## Java

### maven

```xml
<mirror>
    <id>huaweicloud</id>
    <mirrorOf>*</mirrorOf>
    <url>https://mirrors.huaweicloud.com/repository/maven/</url>
</mirror>
```

或者使用这个

```sh
curl -o ~/.m2/settings.xml https://mirrors.huaweicloud.com/v1/configurations/maven?
```

```bat
curl -o %USERPROFILE%/.m2/settings.xml https://mirrors.huaweicloud.com/v1/configurations/maven?
```

## python

### pip(pypi)

```sh
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```
