---
title: 前端项目迁移至 nuxt.js
date: 2020-02-22 21:29:29
tags: 
 - Vue.js
 - Nuxt.js
 - 前端
 - SEO
 - SSR
categories:
 - 前端
---


文章书写于 2019-09-06，改造是8月中旬，使用的 nuxt.js 版本为 2.8.1，后升级到2.9.0，文中可能包含两个版本的内容，区别不是太大，关于版本差距详见[nuxt/nuxt.js](https://github.com/nuxt/nuxt.js/releases)

目前项有 SEO 的需求，而前端是纯正的 SPA 应用，国内的搜索引擎目前对这些东西都没有办法，所以考虑启用 SSR 服务端渲染方案

官方提供了三种可行方案
- [vue-server-renderer 服务端方案](https://ssr.vuejs.org/)
- [prerender-spa-plugin webpack预渲染插件](https://github.com/chrisvfritz/prerender-spa-plugin)
- [nuxt.js](https://nuxtjs.org/)

如果页面较少并且固定，那还是推荐使用预渲染方案，不过我们有详情页面需要渲染，所以这个方案无法实现，而 vue-server-renderer 因为要搭建太多内容，我们追求快速落地，所以该方案 pass。

我们最终选用了 nuxt.js，本文记录整个迁移过程和遇到的坑

## intro

目前项目结构为
- webpack, typescript, sass
- vue, vuex, vue-router
- element-ui
- axios
- baidu-map

没有 jquery，手脚架为 vue-cli3 的官方手脚架(用 vue-cli-service 启动的)。

项目中大部分数据都放进了 vuex，包括登录，vuex 的数据自动保存到 localStorage 中

注意，本文的大部分说法，都是基于 typeScript，有些说法可能在 js 环境不适用，请自行测试

还要说一句，typeScript 搞这东西，真不太好用

## nuxt.js

看官网吧

加一些我自己的补充

nuxt 的工作模式，按照我自己的话来说就是混合渲染，只有页面在首次加载时会触发服务端渲染，前端的交互操作依然遵照 SPA 的方式。

这个逻辑必须要理解，不然会遇到各种数据不加载、undefined、页面多次渲染等等一系列问题。

对新手说的话，就是浏览器刷新、地址栏敲回车。

然后，nuxt 的 asyncData 和 fetch 两部分，可能在服务端执行可能在客户端执行，但一定只执行一次，所以 asyncData 和 fetch 必须要设计成服务端和客户端都可以执行的结构。

### 生命周期

nuxt.js 的生命周期
![img](https://zh.nuxtjs.org/nuxt-schema.png)

vue.js 的生命周期
![img](https://vuejs.org/images/lifecycle.png)

其中，nuxt.js 的 Render 部分，后续会接上 vue.js 的生命周期，包含 beforeCreate 和 created，而浏览器端也会再执行 beforeCreate 和 created 两个钩子，这是服务端渲染的性质。

## 框架搭建

不建议自行添加依赖，最好是直接官方手脚架生成，然后将现有项目迁移上去

原有项目的目录结构如下
```
├─public
├─scripts
├─src
│  ├─api
│  ├─assets
│  │  ├─font
│  │  ├─images
│  │  └─scss
│  ├─components
│  ├─config
│  ├─router
│  ├─store
│  │  └─module
│  ├─types
│  │  ├─components
│  │  └─views
│  ├─utils
│  ├─views
│  │  └─index
│  ├─App.vue
│  └─main.ts
├─tslint.json
├─tsconfig.json
├─vue.config.js
├─package.json
```

因为 nuxt.js 的目录结构有规范，可以用来实现很多功能，所以基本上遵照了目录结构
新的目录结构为
```
├─.nuxt
├─server
│  ├─middleware
|  └─index.js
├─src
│  ├─api
│  ├─assets
│  │  ├─font
│  │  ├─images
│  │  └─scss
│  ├─components
│  ├─config
│  ├─layouts
│  ├─middleware
│  ├─pages
│  │  ├─index
│  │  └─index.vue
│  ├─plugins
│  ├─static
│  ├─store
│  ├─types
│  │  ├─components
│  │  │  └─userCenter
│  │  └─views
│  └─utils
├─tslint.json
├─tsconfig.json
├─vue.config.js
├─package.json
├─nuxt.config.js
```

这样调整尽量符合原有结构，为了这个目录结构还需要配置几个属性

nuxt.config.js
```js
module.exports = {
  mode: 'universal',
  srcDir: 'src', // 将源码路径指向 src，默认同 rootDir 为项目根目录
  // other...
}
```

nuxt.js 是自动生成路由的，所以取消了 router 目录，如果要干预可以在 nuxt.config.js 手动注入额外部分，但自动部分还是会工作；
如果要对路由进行影响可以增加 middleware，在路由响应时改变上下文或者改变路由目的地；
对于动态菜单这种需求，那种后管平台没有 SSR 的必要，建议放弃

原有项目的 views 更名为 page，因为自动生成路由，所以目录结构要按照 nuxt.js 的规则来，详见 [迁移指南-pages](#pages)

assert 和 static 都是放置静态资源的地方，区别在于 assert 通过 loader 加载，可以解析 sass 等格式，而 static 为纯静态资源

components 为组件，这部分不会受到 nuxt.js 加强，也就是没有 nuxt.js 的生命周期钩子。注意该部分打包时会全部封进 app.js，如果组件是某个页面专用，就请移动到 pages 中，不要放在这里

layouts 作为布局，所有渲染的页面都要有一个对应布局，默认的布局名称为 default.vue，就是渲染模板，这里可以一定程度代替 App.vue 和 main.ts

middleware 放置路由中间件，中间的 js 文件会自动以文件名为 name 注册进 nuxt.js，在 nuxt.config.js、layouts、pages 中可以使用中间件。
layouts、pages 中，使用属性 `middleware: {{name}}` 即可；
nuxt.config.js 中按照这个格式注入
```js
module.exports = {
  router: {
    middleware: 'stats'
  }
}
```

plugins 文件夹内的文件会做为定制原型链的插件。因为渲染机制问题，Vue 的实例初始化没有暴露出来，nuxt 提供的方案是使用 plugins。
但是有很多插件注入后会出现问题影响 nuxt 正常工作，谨慎使用

store 为 vuex 的目录，nuxt 会自动生成 vuex 树，只要将 store 文件直接放入 store 目录就行，nuxt 会根据文件名生成 modules

## 迁移指南

迁移方案选择新搭建框架，再将业务代码迁移上去。

第一步迁移的是基础工具和接口代码。

然后迁入基础结构，首先处理 App.vue 和 main.ts

App.vue 对应到 layouts/default.vue 中，根据 nuxt.js 的结构做一些替换。概念不同，但结果一致。
日后还是更建议将 header、footer 分发到 layouts 中，可以更好的规划布局和统一布局

整体的代码执行顺序如下，自行对照到生命周期中：

nuxt.js => plugins => router => router-middleware => layout => asyncData/fetch => create

### store

store 会自动按照名字分 modules，所以要确保 store 文件的命名和以前引用的模块名一致，不然就要大片的改动代码

服务端渲染需要 state部分返回一个无参方法，这里用的 ES6 语法
```js
const state = () => ({
  recentContactList: [],
  chatRecordList: []
})
```

根据服务端渲染的逻辑，每次服务端渲染，vuex 都会重新初始化，vuex 的初始化在服务端，时机很早(应该是nuxtServletInit就有)，也就是说没有以前的数据。针对这一点有一些解决方案，但强烈不推荐将用户端的 vuex 同步到服务端这一做法，看似很美好但同步方面坑相当多。

对于服务端没有 vuex 数据的问题，我建议针对性的处理，如用户 token、用户关键信息 可存放到 cookie 中，一些整个项目随处都要用的数据也可以存放到 cookie 中。但注意容量，cookie 的空间很宝贵

对于 vuex 的一些初始化动作，举个例子，用户信息存放在 vuex 中，业务方都是在 vuex 中获取，我们可以在 middleware 中将用户信息从 cookie 中读出，存放到 vuex 中。

目前的前端有 localStorage 来保存 vuex 数据，但是要考虑数据合并造成的冲突，因为服务端渲染会将 服务端vuex 中的数据带到客户端，客户端会使用这些数据做初始化，确切的说是 初始化 => 合并服务端vuex，如果客户端从 localStorage 做了本地化，切记在合并数据时注意不要将服务端某些关键数据覆盖掉。

对于那些过度依赖 vuex 的功能，比如列表翻页的页码存放到 vuex，我建议着手拆除这类业务对 vuex 的依赖，vuex 不是这样的工具

### pages

pages 为页面入口文件夹

服务端渲染的改造基本都在这里

根据路由生成规则，pages/index.vue 是首页入口

layouts 中的文件代替了 App.vue。

其中 layouts/error.vue 文件比较特别，这个是错误页面，后端渲染错误、后端路由错误，都会跳转至此。

#### Router

nuxt 会根据放入 pages 中的 文件夹/文件 来生成路由Router

规则为：

{{文件夹}}/{{文件夹}}/{{文件名}}

若 vue 文件为 index.vue，则不会生成文件名层级

在 Nuxt.js 里面定义带参数的动态路由，需要创建对应的以下划线作为前缀的 Vue 文件 或 目录。

以下[官网样例](https://zh.nuxtjs.org/guide/routing)：

e.g.

假设目录结构为
```
pages/
--| about/
-----| index.vue
-----| one.vue
--| users
-----| _id.vue
--| _slug
-----| comments.vue
-----| index.vue
--| index.vue
```

生成的路由为

```
routes: [
  {
    name: 'index',
    path: '/',
    component: 'pages/index.vue'
  },
  {
    name: 'about',
    path: '/about',
    component: 'pages/about/index.vue'
  },
  {
    name: 'about-one',
    path: '/about/one',
    component: 'pages/about/one.vue'
  },
  {
      name: 'users-id',
      path: '/users/:id?',
      component: 'pages/users/_id.vue'
  },
  {
      name: 'slug',
      path: '/:slug',
      component: 'pages/_slug/index.vue'
  },
  {
      name: 'slug-comments',
      path: '/:slug/comments',
      component: 'pages/_slug/comments.vue'
  }
]
```

#### 生命周期钩子

nuxt 的 SSR 可以说成是混合渲染，首次加载时由服务端渲染，其余的时间点都和 SPA 一致。

为了让服务端渲染时能将数据渲染到 html 中，就需要在 render 前将数据填充到应该放置的地方(data 或者 vuex)

再强调一次，vuex 在初始化时，是空的。

整体的流程可以参照生命周期的图

asyncData 和 fetch 两个步骤可以对数据进行影响，fetch 设计的功能就是填充 vuex。
asyncData 还额外的有一个特点，就是该步骤的返回值会合并到该页面的 data 属性中(ts语法可能不太明显，js 语法的 data 就比较容易理解了)。

这样就可以通过 asyncData 和 fetch 控制服务端渲染时，数据的范围

注意，asyncData 早于 render，所以这时还没有 this 使用，也就是和 vue 实例挂钩的内容都用不了。虽然 context 中提供了一个叫 app 的实例，但那个是 nuxt 的实例，不是当前页面的

还要注意，asyncData 和 fetch 都有可能在客户端执行，两者在整个流程中都只会执行一次。但是 create 生命周期在两端各会执行一次，如果可能的话，可以将 created 中的代码移植到 mounted 中。若还是需要使用 created(毕竟mounted慢一步)，可以选择使用以下代码做判断
```js
if (process.client) {
  // 
}
```

ts 的写法与 js 不同，ts 中，asyncData 和 fetch 需要写在 @Components 中，如下所示，其中 asyncData 和 fetch 的入参 context 中包含的内容参见 [Context](https://zh.nuxtjs.org/api/context)
```ts
@Component({
  components: { Footer, QuickBar, NoData },
  async asyncData ({ params, store, error }) {
    if(params.id) {
      let a = await store.dispatch('AModules/ACTION_A', {
        id: params.id,
      }).catch((err) => {
        error({ statusCode: 500, message: '数据异常' })
      })
      return a
    }
  },
  async fetch() {
    await 
  }
})
export default class SecondDetails extends Vue {
  // other
}
```

#### meta 标签

nuxt 内部引入了 vue-meta 插件来做 meta，除了默认的命名外，使用方法完全相同，和 vuex 一样需要返回的是一个方法。具体参见 (Vue Meta)[https://vue-meta.nuxtjs.org/guide/metainfo.html]
以下官网样例: 

```ts
@Component({ 
  head () {
    return {
      title: `Page 1 (${this.name}-side)`,
      meta: [
        { hid: 'description', name: 'description', content: "Page 1 description" }
      ],
    }
  }
}
```

head 的执行时机为 render，这时是可以使用 this 的

#### keep-alive

先说一下，nuxt 是有 keep-alive 的，layout.vue 的 template 部分如下：

```vue
<template>
  <div id="app">
    <Login v-show="isLoginShow" @close="onLogin(false)"></Login>
    <nuxt keep-alive/>
  </div>
</template>
```

这一点不得不埋怨一下官方手册，好多东西真的是找不到，还是翻阅 changelog 和 issue 才得到的解决方案

### 调试服务端

调试分为两部分，log 和 debug

log 可以直接在控制台看到。nuxt 2.9.0 以后新增了 ssrLog 功能，可以将服务端的 log 打印到浏览器的 console 中


debug 部分，这部分有点玄学，因为有时候代码 debugger 抓不住，我也说不太清楚

方案为，借助 node 的参数 `--inspect` 将实例的 debug 功能打开，然后使用 chrome 浏览器进行调试，本机环境只要点击 F12 就能在 Elements 选项卡左边看到 node 的图标

成功的话，在启动时就可以看到日志
```
Debugger listening on ws://127.0.0.1:9229/61388480-18e2-4f4d-8373-f7b9909d8011
For help, see: https://nodejs.org/en/docs/inspector
```

## 一些使用技巧

**js-cookie**

提供一个修改过的 js-cookie，可以在服务端渲染时提供相同的 api，cookie 为空时会默认读取 document

[https://gist.github.com/ZzMark/d93bbcbbf3b6e763062c977c269edcbf](https://gist.github.com/ZzMark/d93bbcbbf3b6e763062c977c269edcbf)

在 asyncData 中的用法样例如下
```js
asyncData({req}) {
  let cookie
  if(process.server) {
    cookie = req.headers.cookie
  }

  const userInfo = Cookies.getJSON('userInfo', cookie) || {}
  // ...
}
```

**按需渲染**

有的地方没有必要让服务端渲染，SSR 针对性的将有必要的东西放到服务端即可。不过话是这么说，实际上反而是将不必要的去掉

不需要服务端渲染的地方，用 <no-ssr></no-ssr> 嵌套起来。

但要注意，如果不想让某个组件加载，需要在引用组件的地方用 no-ssr，不能在组件上。

典型的场景是，某个组件需要数据，没有数据导致了服务端渲染时出现了 undefined，直接用 no-ssr 将那一块套起来是没有用的

对了，no-ssr 在 nuxt3 就会被移除，尽快迁移到 <client-only></client-only> 吧

**全局加载scss**

SPA 场景下，直接 import 即可，但这里不行

可以使用 module: @nuxtjs/style-resources

在 nuxt.config.js 中配置
```js
module.exports = {
  modules: [
    '@nuxtjs/style-resources',
  ],
  styleResources: {
    scss: ['./src/assets/scss/common.scss', './src/assets/scss/font.scss']
  },
  // ...
}
```

## 打包、优化

开发环境，建议使用 nuxt 来启动，生产环境更换为 express，方便在 express 中增加一些定制信息（我们在 express 中做了压缩相关的内容，这个下面会讲）。

附上我的启动指令
```
"dev": "cross-env NODE_ENV=development DEBUG=nuxt:* node node_modules/nuxt/bin/nuxt",
"debug": "cross-env NODE_ENV=development DEBUG=nuxt:* node --inspect node_modules/nuxt/bin/nuxt",
"build": "nuxt build --profile",
"start": "cross-env NODE_ENV=production node server/index.js",
```

### 项目精简

这个问题，仁者见仁。

大部分会遇到的应该都是按需加载，这个要挨个去试。

build 时候可以增加参数来触发 nuxt 提供的 analyze 功能(其实就是 webpack-bundle-analyzer，用过 webpack 的人都知道)

用我的命令就是
`npm run build -- -a`

剩下的看着来吧

### 静态压缩

目前项目短期内没有使用 CDN 的打算，所以首屏加载速度的一个大头就要靠自己了。

直接使用 nuxt 的 render.compressor 只能做到首屏的 html 压缩，其余的 js 都是动态压缩，消耗过多的资源，所以打算像 SPA 那样，部署时直接放入 .gz 和 .br 文件，节约算力。但 nuxt 并没有这方面支持，所以只得靠 express 来直接返回资源。

整个改动分为两部分。1. build 时生成静态压缩文件; 2. 让 express 返回静态压缩文件

第一部分我编写了一个 middleware，代码贴在这里。实际上逻辑很简单，就是调用了 compression-webpack-plugin 生成 gzip，brotli-webpack-plugin 生成 brotli。

`npm install -D brotli-webpack-plugin compression-webpack-plugin`

`/server/compressModule.js`
```js
let CompressionPlugin;
let BrotliPlugin;

const gzip = {
  test: /\.(js|css|html|svg)$/
};

function getPlugin() {
  if(!CompressionPlugin) {
    CompressionPlugin = require("compression-webpack-plugin");
  }
  if(!BrotliPlugin) {
    BrotliPlugin = require("brotli-webpack-plugin");
  }
}

function compressionModule() {
  this.extendBuild((config, { isDev, isServer}) => {
    if (isDev || isServer) {
      return;
    }
    getPlugin()
    const options = this.options["nuxt-compress"];

    const gzipConfig = options ? { ...gzip, ...options.gzip } : gzip;
    const brotliConfig = options && options.brotli ? options.brotli : {};

    config.plugins.push(
      new CompressionPlugin(gzipConfig),
      new BrotliPlugin(brotliConfig)
    );
  });
}

module.exports = compressionModule;
```

然后在 nuxt.config.js 中添加以下配置
```js
module.exports = {
  // version < 2.9.0 使用 devModules 替换 buildModules
  buildModules: [
    '~~/server/compressModule',
  ],
}
```

第二部分要让 express 读取静态压缩文件，借助了 express-static-gzip 这个中间件。这个中间件做了比较完善的处理，放心使用

在 express 入口，注册这个中间件
```js
  // 加载 static gzip br 并优先提供 brotli 压缩
  app.use("/_nuxt/", expressStaticGzip('./.nuxt/dist/client', {
    enableBrotli: true,
    orderPreference: ['br']
  }));
```

该配置基于默认情况，build 后访问的 js 路径为 `example.com/_nuxt/xxxxxxxxxxxxxxx.js`

### css 分离

nuxt 提供了配置，直接使用即可实现大概的效果

build.extractCSS = true

如果要精确来，就自行研究吧，反正这个是实现我们想要的样子了

## 其他 nuxt.js 的坑

- layout 如果在 <nuxt/> 下方有组件，会出现两次渲染的问题，这个问题我也解释不了，我是直接绕开了这个。有发生相同情况的小伙伴就去提 issue 吧

- nuxt.js 选用了 axios，依赖为 `@nuxtjs/axios`，官网说不需要自行再引入 axios，但我这里不引入什么都干不了……
  nuxt.config.js 中要加入 modules 配置，手脚架已经给出了配置
  我们的业务会通过API封装执行 http，所以不需要进一步处理

  服务端的 axios 不会自动携带 Cookie。如果想要优雅的解决，那就在 axios 封装那里新增一个接口来注入 Cookie，然后靠 router-middleware 从 context.headers.cookie 获取并注入

- vuex 在服务端初始化，然后将数据递交给前端，不清楚客户端初始化时会不会再初始化插件

- 引入许多代码都会出现 unexpected identifier，可以在调用栈中看到是哪个 loader 加载哪个文件时发生的问题，调用栈可以看报错时的网页。
  但并不好解决，一般时候都是因为组件注册，引入时调用了某些代码，目前的解法都是改为直接引用组件，让整条链路避开 Vue.use 和 Vue.component。

- 凡是动用 window 或 document 以及下设对象的代码，都要避免让服务端执行。

- Vue.use() 有不少组件无法引入，解决方案为局部引入。但也有组件局部引入就无法工作，这时候可能就要全局引入。

- 目前有一个最坑的东西，not matching，服务端渲染结果与浏览器渲染结果不匹配。
  开发环境会导致浏览器抛弃冲突的标签重新再渲染一次，并抛出警告；生产环境不会有处理。官方讲最常见的是 table 中的 tbody，实际场景中，服务端 render 和客户端 render 不匹配就会出现这个，比如客户端因为数据不同重新渲染的结果不一致
  这个问题尽量避免，因为可能会出现因数据异常导致页面直接卡住(常见于 v-if 使用不当)

- 如果出现这个警告
  `WARN: Please use build.postcss in your nuxt.config.js instead of an external config file. Support for such files will be removed in Nuxt 3 as they remove all defaults set by Nuxt and can cause severe problems with features like alias resolving inside your CSS.`
  
  实际上是很小的事，就是告诉你 postcss 要配置到 nuxt.config.js 中了，把 postcss 的配置文件中所有内容配置到 build.postcss 中即可。

## 后记

关于这次迁移，满网搜索都是 nuxt 的 demo，就没有一个拿出点干货。

现在做技术，实在是有点太浮躁了，自以为写个 demo 就是会了一切。

其实整个迁移过程中，遇到的坑还有很多，但是有许多都是前端代码写的不够严谨，用法不规范导致，也不好意思拿出来。看到这篇文章的有缘人如果遇到什么问题无法解决，欢迎叨扰，或多或少我会帮得到您。
