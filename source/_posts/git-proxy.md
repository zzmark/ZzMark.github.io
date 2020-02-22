---
title: git 配置代理
date: 2020-02-22 21:22:58
tags: 
 - git
 - 环境
categories:
 - 环境
---

最近有远程办公的需要，整理了一下如何通过代理使用git

- 代理是通过 ssh 构建的 socks5 代理，http 还可以用 http 代理，但 ssh 不行，命令不兼容，我懒得去搞那么全
- 环境 windows，也会提供 linux/mac 的配置

连接 git 的方式有两种，http 和 ssh，两种设置不同，所以分开说

## http.proxy

http 连接的代理不区分系统

git 的配置会写在 `%USERPROFILE%/.gitconfig` 文件中，命令设置后可以看一眼，很容易懂

如果连接 git 使用了 http 连接，则只需要 http.proxy 配置项即可，最简单粗暴的配置如下：

```sh
git config --global http.proxy socks5h://127.0.0.1:1080
```

这样不优雅，git 提供了更精细的代理配置，可针对域名设置代理，例如单独为 github 配置代理：

```sh
git config --global http.https://github.com.proxy socks5h://127.0.0.1:1080
```

修改后，最好看一眼配置文件，明白这其中的细节和原理

## ssh  proxy

如果通过 ssh 连接，代理不归 git 管，而是要配置给 ssh。

这里需要区分系统

### windows

windows 的 ssh 配置文件在 `%USERPROFILE%/.ssh/config` 文件中，如果不存在自行创建，记得删除后缀名。
搞不懂后缀名的人，可以通过这个命令来创建文件，记得删除文件中的内容

```cmd
echo "" >> %USERPROFILE%/.ssh/config
```

然后，举例说明，给 github.com 设置代理，配置文件的格式如下

```conf
Host github.com
    User git
    ProxyCommand connect -S 127.0.0.1:1080 %h %p
```

### linux/mac

linux 和 mac 系统，需要使用 nc 工具，请先确保有这个东西。

配置文件在 `~/.ssh/config`，可以用类似于 windows 的命令创建文件，不过更推荐直接用 vim 编辑

```sh
vim ~/.ssh/config
```

```conf
Host github.com
    User git
    ProxyCommand nc -v -x 127.0.0.1:1080 %h %p
```


## 取消代理

很容易的，直接到配置文件中删除掉相应的配置即可。

http 代理可以用以下命令抹除配置：

```sh
git config --global --unset http.proxy
```