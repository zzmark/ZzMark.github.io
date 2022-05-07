# 个人博客

基于 hexo

## usage

博客使用了以下插件

- dotenv-cli
- hexo-all-minifier
- hexo-deployer-git
- [lxl80/hexo-deployer-cos-cdn](https://github.com/lxl80/hexo-deployer-cos-cdn)
- [zzmark/hexo-mod-abbrlink](https://github.com/zzmark/hexo-mod-abbrlink.git)
- hexo-generator-sitemap
- hexo-generator-baidu-sitemap
- hexo-generator-category
- hexo-generator-feed

## deploy

使用了 腾讯云 cos + cdn 部署

自己魔改了 abbrlink 生成

## _deploy before script

为了保护 secret 信息，利用几个环节从环境变量绕了一圈

详见 `generateDeploy.js`

hexo 可以从多个配置文件出发，合并多个文件，详见[文档](https://hexo.io/zh-cn/docs/configuration.html#%E4%BD%BF%E7%94%A8%E4%BB%A3%E6%9B%BF%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6)

根据此原理，加了个脚本，用于生成配置文件
