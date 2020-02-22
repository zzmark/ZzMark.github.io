---
title: VS Code 使用记录
date: 2020-02-22 21:24:02
tags: 
 - vscode
 - ide
 - 环境
categories:
 - 环境
---

本文记录个人使用 VS Code 时发现的易用插件、遇到的问题、解决方案。

长期更新

## 配置、插件 同步插件 Settings Sync

最近发现了一个好东西，可以借助 github gist 给 vscode 提供一个配置同步，这款插件名为 `Settings Sync`

使用十分方便，在新安装好的 vscode 上安装这款插件，登录 github 账号，并配置 gist 地址，就可以同步配置

## Markdown 转换为 PDF

Markdown 转换为 PDF 的思路，是借助工具，转换为 html，然后通过浏览器的 `打印为 PDF` 生成 PDF 文件
```
markdown -> html -> pdf
```

方案可行，缺点是不灵活，虽然写成脚本也没差。

为此诞生了很多方便的工具

这里记录一款 vscode 的插件 [yzane/Markdown PDF](https://marketplace.visualstudio.com/items?itemName=yzane.markdown-pdf) 扩展，可以很容易的将 markdown 转换为 PDF。

注意：这个工具依赖于 chromium，说白了就是要个浏览器。插件安装后会自动下载 Chromium，但是很慢，而且很大，如果电脑中有 Chrome，可以直接配置以下信息

```json
"markdown-pdf.executablePath": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
```

让插件使用现有的浏览器，节约时间节约空间。

顺便还有一些我平常使用的配置：
```json
"markdown-pdf.styles": [
    "markdown-pdf.css"
],
"markdown-pdf.executablePath": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
"markdown-pdf.includeDefaultStyles": false,
"markdown-pdf.displayHeaderFooter": false,
```
