---
title: i18n-Accept-Language相关研究
date: 2020-09-23
tags:
categories:
cover: /gallery/Accept-Language相关研究.png
thumbnail: /gallery/Accept-Language相关研究.png
---

网页端 i18n 必然会涉及到的 header 就是 Accept-Language

相关内容可以直接参考 [MDN Accept-Language](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Accept-Language)

不过这个字段对于中文，有许多历史遗留问题，这里只讲最终结论

关于 Accept-Language 以及各种操作系统 lang 的取值，遵守的标准是 [ieft-BCP47 Tags for Identifying Languages](https://tools.ietf.org/html/bcp47)

## zh, zh-CN, zh-Hans, zh-Hant 之间的关系

如果你的系统语言环境是 `简体中文`，那么 chrome 浏览器会默认将 Accept-Language 填写为 `zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7,zh-HK;q=0.6`

![Chrome 请求 Header](0.png)

这其中有很多有趣的点可以解读

首先，`zh-CH,zh;q=0.9`，这其实是两部分，写完整的话应该是 `zh-CH;q=1.0,zh;q=0.9` 用q做了一个优先度

但这俩都是中文，目前大多数的服务端，都会将 zh-CN 当作 `简体中文`，但实际上并不正确，这就是历史遗留问题
第二种 zh 实际上也是废弃标准，但绝大多数服务端，都没有舍弃这两种废弃标准的使用。

类似的还有很多，如
```
zh-Hans, zh-Hans-CN, zh-cmn, zh-cmn-Hans, zh-wuu, zh-yue, zh-gan
zh-Hans-HK、zh-Hans-MO、zh-Hans-TW、zh-Hant
```

严格上来说，语言的标记格式为 
```
language    -extlang         -script  -region    -variant -extension -privateuse
语言文字种类 -扩展语言文字种类 -书写格式 -国家和地区 -变体     -扩展      -私有
```

```
zh 中文，因为无法指代语言，所以废弃。但大部分服务端将此认定为 zh-Hans
zh-Hans 汉语-简体(han 汉语, s Simplified_Chinese)
zh-Hant 汉语-繁体(t Traditional_Chinese)
```

实际上还有一些极为不常用的中文语种
```
zh-cmm
```

还有同样不常用，而且不符合标准，但还是有用到的
```
zh-SG
zh-TW
zh-HK
```

还有些符合标准，但并不在 Accept-Language 中受到支持的完整写法(我是不知道啥服务器认这个)
```
zh-cmn-Hans 国语-简体中文
zh-cmn-Hant 国语-繁体中文
zh-yue-Hant 粤语-繁体中文
zh-wuu-Hans 上海话-简体中文
```

其中 cmn 是国语，yue 是粤语，wuu 是上海话

## 后端如何做适配

长远打算，最好兼容 BCP47，不过现阶段有很多历史遗留用法反而是主流

目前来说，做好这些兼容就是

```
zh, zh-CN, zh-Hans, zh-cmn-Hans, Hans   都解析成中文
```

不过这是一己之见，没有什么依据

短期来看，支持个 zh, zh-CN, zh-Hans 其实就够了

![ios语言列表](1.png)

### springboot

我们的后端使用这个，所以特意说一手

默认情况下，springboot 会将 `Accept-Language: zh-CN` 解析成 `Accept-Language: zh-Hans`

匹配 message_zh_Hans.properties

若不存在，降级到 zh_CN

观测结果

简单追查，可以得出 zh-Hans 继承于 zh-CN 

不过这个机制，并不是 springboot 或者 spring 的机制，是jre机制

java.util.ResourceBundle.Control#getCandidateLocales 方法的注释中，有写明对于 Chinese 的特殊处理
在线版本可以参考 https://docs.oracle.com/javase/8/docs/api/java/util/ResourceBundle.Control.html
```
Special cases for Chinese. When an input Locale has the language "zh" (Chinese)
and an empty script value, either "Hans" (Simplified) or "Hant" (Traditional)
might be supplied, depending on the country. When the country is "CN" (China)
or "SG" (Singapore), "Hans" is supplied. When the country is "HK" (Hong Kong
SAR China), "MO" (Macau SAR China), or "TW" (Taiwan), "Hant" is supplied. 
For all other countries or when the country is empty, no script is supplied.
For example, for Locale("zh", "CN") , the candidate list will be:
    [L("zh"), S("Hans"), C("CN")]
    [L("zh"), S("Hans")]
    [L("zh"), C("CN")]
    [L("zh")]
    Locale.ROOT
For Locale("zh", "TW"), the candidate list will be:
    [L("zh"), S("Hant"), C("TW")]
    [L("zh"), S("Hant")]
    [L("zh"), C("TW")]
    [L("zh")]
    Locale.ROOT
```

## 过于前沿，还没啥用的知识

BCP47 在 2009年，将 zh 废弃，把 Hans, Hant 提升到了 language 层级
也就是说，zh-Hans 应写成 Hans

不过这个设定，没有程序认……
