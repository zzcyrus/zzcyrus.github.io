---
title: tilestrata 插件发开指南
date: 2019-07-22 18:16:33
tags: [GIS]
categories: TileStrata
---

[Tilestrata](https://github.com/naturalatlas/tilestrata)的插件开发基本围绕着生命周期各个阶段展开，如果要开发一个自己的插件，首先想清楚插件的功能属于生命周期的哪个阶段，依据官方规定好的该阶段代码结构，写好插件内容，在服务端利用`use`进行注册就好。个人觉得`Tilestrata`吸引人的一个地方就是在于插件机制非常的灵活和便捷，十分好上手。

<!--more-->

这篇文章主要基于官方文档说明。

生命周期的各个阶段如下：

- `request hook` – 请求预处理
- `cache` – 缓存控制
- `provider` – 数据源，比如 mapnik
- `transform` – 最关键的阶段，可以在瓦片输出的过程中对其做各种加工，比如旋转，染色
- `response hook` – 响应后处理，比如 headers、jsonp 插件

# 1. 插件共有部分

所有的插件都可以拥有`init`和`destroy`两个生命周期方法，分别在插件的启动和结束时触发。这个两个方法的第一个参数是当前`tilestrata`实例，第二个参数是`callback`回调函数。

```js
init: function(server, callback) {
    callback(err);
},
```

# 2. request 请求插件

request 类型的插件必须提供`reqhook`方法，参数如下。其中`req`参数代表[http.IncomingMessage](http://nodejs.org/api/http.html#http_http_incomingmessage) ，`res`参数代表[http.ServerResponse](http://nodejs.org/api/http.html#http_class_http_serverresponse)。 如果不执行里面的`callback`回调函数，甚至这个请求都不会进入后续`server`的处理逻辑中，所以千万别忘了它。

```js
module.exports = function(options) {
  return {
    name: 'myplugin',
    init: function(server, callback) {
      callback(err)
    },
    // 我是必须提供的核心方法
    reqhook: function(server, tile, req, res, callback) {
      callback()
    },
    destroy: function(server, callback) {
      callback(err)
    }
  }
}
```

# 3. Caches 缓存插件

Caches 类型的插件必须提供`get`和`set`方法，参数分别如下。当你的缓存过程失败出错的时候，tilestrata 会忽略错误，无视这段逻辑，尝试直接从数据源获取数据。

```js
module.exports = function(options) {
  return {
    name: 'myplugin',
    init: function(server, callback) {
      callback(err)
    },
    // 我是必须提供的核心方法
    get: function(server, tile, callback) {
      callback(err, buffer, headers /* refresh */)
    },
    // 我是必须提供的核心方法
    set: function(server, tile, buffer, headers, callback) {
      callback(err)
    },
    destroy: function(server, callback) {
      callback(err)
    }
  }
}
```

有一种特殊的场景：虽然请求命中了缓存，仍然需要在后台生成一张新的瓦片。比方说某一张瓦片已经很久没更新了，需要重新生成，但又不是那么着急，一定要用户等着这个新瓦片渲染出来，所以其实我们需要的是返回缓存结果，同时更新瓦片缓存。这种情况下为`get()`方法的`callback`增加第四个参数`true`就好了。

```js
callback(null, buffer, headers, true)
```

# 4. Providers 数据源插件

Providers 类型的插件必须提供`serve`方法，参数如下。主要作用就是提供**数据源**，数据可以来源于第本地的某个功能模块比方说 mapnik 服务，可以来源于在线的第三方服务，比如说对 bing 地图服务做了一个代理转发。

```js
module.exports = function(options) {
  return {
    name: 'myplugin',
    init: function(server, callback) {
      callback(err)
    },
    // 我是必须提供的核心方法
    serve: function(server, tile, callback) {
      callback(err, buffer, headers)
    },
    destroy: function(server, callback) {
      callback(err)
    }
  }
}
```

# 5. Transforms 数据处理插件

Transforms 类型的插件必须提供`transform`方法，参数如下。它的主要作用是在数据从 provider 取出来之后，做一些额外的处理，比方说加一个水印，调整一下透明度，再把处理后的结果输出出去。要注意下这个过程是发生在**缓存之前**的。

```js
module.exports = function(options) {
  return {
    name: 'myplugin',
    init: function(server, callback) {
      callback(err)
    },
    // 我是必须提供的核心方法
    transform: function(server, tile, buffer, headers, callback) {
      callback(err, buffer, headers)
    },
    destroy: function(server, callback) {
      callback(err)
    }
  }
}
```

# 6. Response 响应插件

Response 类型的插件必须提供`reshook`方法，参数如下，其中参数里面的`result`包含了三个属性：`headers`, `buffer`和 `status`，这三个属性在返回真正的结果之前都是可以被修改的。比方说在返回结果之前，给每一个`headers`都加上`'Access-Control-Allow-Origin': '*'`来让请求支持跨域访问。此外`req`参数代表[http.IncomingMessage](http://nodejs.org/api/http.html#http_http_incomingmessage) ，`res`参数代表[http.ServerResponse](http://nodejs.org/api/http.html#http_class_http_serverresponse)。

```js
module.exports = function(options) {
  return {
    name: 'myplugin',
    init: function(server, callback) {
      callback(err)
    },
    // 我是必须提供的核心方法
    reshook: function(server, tile, req, res, result, callback) {
      callback()
    },
    destroy: function(server, callback) {
      callback(err)
    }
  }
}
```

# 7. 同时提供多个功能的插件

有时候一个插件由多个部分组成，所以你可以把多个功能放进一个数组传递给 TileStrata。例如我想做一个插件记录响应时间，那既要在 request 时做出记录，也要在 response 时做出记录，把它俩放进数组就 ok 了。

```js
module.exports = function() {
    return [
        //  第一个插件
        {name: 'myplugin', reqhook: function(...) { /* ... */ }},
        //  第一个插件
        {name: 'myplugin', reshook: function(...) { /* ... */ }}
    ];
};
```

通观下来，整个 Tilestrata 插件开发的流程其实是非常舒畅和自由的，可以充分的发挥创造力。
