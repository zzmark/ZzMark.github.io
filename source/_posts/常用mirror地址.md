---
title: 常用环境 mirror 地址
date: 2020-02-22 21:25:29
tags: 
 - tools
 - 环境
categories:
 - 环境
thumbnail: /2020/02/常用mirror地址/logo.png
---


主要覆盖了我可能会去使用的 mirror。长期更新。

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
export NVM_IOJS_ORG_MIRROR=https://npm.taobao.org/mirrors/iojs
export NVM_NODEJS_ORG_MIRROR=http://npm.taobao.org/mirrors/node

# 以下安装 lts 版本 node 命令
nvm install --lts
nvm use --lts
```

nvm-windows:
```bat
REM nvm-windows 贴心的给我们提供了文档 https://github.com/coreybutler/nvm-windows#usage
nvm node_mirror https://npm.taobao.org/mirrors/node/
nvm npm_mirror https://npm.taobao.org/mirrors/npm/

nvm list available

REM 安装版本需要自行填写
nvm install %VERSION%
nvm use %VERSION%
```

### npm

```sh
# 必备的、或许有用的、应该有用的，都在这了
npm config set registry=https://registry.npm.taobao.org/
npm config set electron-mirror=https://npm.taobao.org/mirrors/electron/
npm config set phantomjs_cdnurl=https://npm.taobao.org/mirrors/phantomjs/
npm config set chromedriver_cdnurl=http://npm.taobao.org/mirrors/chromedriver
npm config set sass-binary-site=https://npm.taobao.org/mirrors/node-sass/
npm config set SELENIUM_CDNURL=http://npm.taobao.org/mirrorss/selenium/
npm config set profiler_binary_host_mirror=http://npm.taobao.org/mirrors/node-inspector/
```

### Yarn

```sh
yarn config set registry http://registry.npm.taobao.org

# 以下未经测试
yarn config set electron-mirror=https://npm.taobao.org/mirrors/electron/
yarn config set phantomjs_cdnurl=https://npm.taobao.org/mirrors/phantomjs/
yarn config set chromedriver_cdnurl=http://npm.taobao.org/mirrors/chromedriver
yarn config set sass-binary-site=https://npm.taobao.org/mirrors/node-sass/
yarn config set SELENIUM_CDNURL=http://npm.taobao.org/mirrorss/selenium/
yarn config set profiler_binary_host_mirror=http://npm.taobao.org/mirrors/node-inspector/
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