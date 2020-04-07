---
title: SSL证书配置
date: 2018-01-15 00:00:00
tags: 
 - https
categories:
 - 运维
---

最近给自己的域名弄了SSL证书，却也不难，Let’s Encrypt的证书，免费，几分钟就可以弄下来。
至于SSL证书是什么、DV证、申请证书的方法很多这里不做讲解，想知道的话，百度就行了（这种问题都不必去问谷歌）。

接下来说下我遇到的一些问题

首先我的证书是使用[www.sslforfree.com](https://www.sslforfree.com/) 申请的Let's Encrypt，nginx做静态服务器，下发的压缩包中有三个文件，分别为ca中间证、域名证书、私钥

  - ca_bundle.crt
  - certificate.crt
  - private.key

直接将域名证书 certificate.crt 配置后，能通过浏览器，但是使用curl无法通过，报错为

```
curl: (60) SSL certificate problem: unable to get local More details here: https://curl.haxx.se/docs/sslcerts.html
```

这个错误的原因基本就是，CA里没有根证书或者没有中间某层的证书（不晓得浏览器为啥没事）

此时使用openssl验证
```shell
openssl s_client -host <host> -port 443
```

会在前几行出现这个错误：
```
verify error:num=20:unable to get local issuer certificate
```
还有这个
```
verify error:num=21:unable to verify the first certificate
```

这两条和上面一样，不过理由明确了，无本地证书，无法验证当前证书，也就是说我缺少一个证书。。。（还是不知道缺哪个）

仔细观察证书信息，web的证书有一层中间证，在申请之后也随压缩包下发了，即 ca_bundle.crt，使用
```shell
openssl verifly <file>
```

验证两个证书，发现ca_bundle可以通过，而web会显示缺少上级证书

问题明确了，验证的链路上缺少的就是这个中间证（verify可以验证当前证书能否通过验证，若缺少证书即签署该证的证书不存在）

然后我们将两个证书装在一起，构成证书链，注意顺序

nginx启动时出现这个错误：
```
X509_check_private_key:key values mismatch
```

这个错误即当前证书无法验证，大多数都出现于拼装证书时顺序错了，调整下顺序即可。
