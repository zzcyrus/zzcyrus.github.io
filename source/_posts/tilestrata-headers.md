---
title: tilestrata-headers 插件使用及浅析
date: 2019-06-26 11:25:05
tags: [GIS]
categories: TileStrata
---

[tilestrata-headers](https://github.com/naturalatlas/tilestrata-headers)插件用来设置请求的响应头`response headers`，常用的可以解决缓存控制、跨域等问题，实用性很高。

<!--more-->

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

# 1. 安装

```bash
npm install tilestrata-headers --save
```

# 2. 使用

```js
var headers = require("tilestrata-headers");
var tilestrata = require("tilestrata");

server = tilestrata();

server
  .layer("osm_mvt_amenities")
  .route("tile.mvt")
  .use(
    headers({
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "max-age=3600"
    })
  );

server.listen(8080);
```

# 3. 效果

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

未开启

![](http://blog-img-1255388623.cossh.myqcloud.com/tilestrata-headers-null-20190606114255.png)

开启

![](http://blog-img-1255388623.cossh.myqcloud.com/tilestrata-headers-result-20190606114432.png)

# 4. 代码浅析

原理比较简单，在`tilestrata`的设计中，会使用`use`去注册各种类型的插件，`tilestrata-headers`就是`reshook`类型的插件，在初始化的过程中会被注册

```js
TileRequestHandler.prototype.use = function(plugin) {
  if (!plugin) return this;
  // ...简化后的代码
  if (plugin.reshook) return this._registerResponseHook(plugin);
};

TileRequestHandler.prototype._registerResponseHook = function(plugin) {
  var id = "reshook#" + this.responseHooks.length;
  if (!plugin) throw new Error("Falsy value passed to registerResponseHook()");
  if (typeof plugin.reshook !== "function")
    throw new Error(
      "Attempted to register a response hook with no reshook() method"
    );
  this.responseHooks.push({ id: id, plugin: plugin });
  return this;
};
```

通过这种方式，插件劫持每个 response，给每个 response header 加上我们自定义的内容。
