---
title: tilestrata-jsonp 插件使用及浅析
date: 2019-06-23 20:15:44
tags: [GIS]
categories: TileStrata
---

[tilestrata-jsonp](https://github.com/naturalatlas/tilestrata-jsonp)插件可以将一些网格（utfgrids）的 json 请求包装成 jsonp，使你不必配置 CORS 也可以跨域访问这些资源。这是除了 tilestrata-headers 以外的另一个实用型插件。

<!--more-->

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

# 1. 安装

```bash
npm install tilestrata-jsonp --save
```

# 2. 使用

```js
var tilestrata = require("tilestrata");
var jsonp = require("tilestrata-jsonp");
var tilestrataPostGISGeoJSON = require("tilestrata-postgis-geojson-tiles");

server = tilestrata();

server
  .layer("geojson_tiles_jsonp")
  .route("tile.json")
  .use(jsonp({ variable: "callback" }))
  .use(
    // Provider 这里用tilestrataPostGISGeoJSON做示例
    tilestrataPostGISGeoJSON({
      geometryField: "geom",
      sql: function(server, req) {
        return "select name, {geojson} from (select name, ST_Transform(way,4326) as geom from osm_polygon where name ~ '上海') as a1 WHERE ST_Intersects(geom, {bbox})";
      },
      pgConfig: {
        username: "postgres",
        password: "postgres",
        host: "localhost",
        port: "5432",
        database: "osm"
      }
    })
  );

server.listen(9527);
```

# 3. 效果

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

在启动 server 后，我们可以直接用`jquery`请求某个固定层级的瓦片，来测试是否成功触发`callbak`函数

```js
$.ajax({
  url: "http://127.0.0.1:9527/geojson_tiles_jsonp/4/15/8/tile.json",
  type: "GET",
  dataType: "jsonp",
  success: function(data) {
    console.log("jsonp使用成功");
  }
});
```

结果

![](http://blog-img-1255388623.cossh.myqcloud.com/tilestrata-jsonp-result-20190606145036.png)

# 4. 代码浅析

原理比较简单，和 headers 插件类似，在`tilestrata`的设计中，会使用`use`去注册各种类型的插件，`tilestrata-headers`就是`reshook`类型的插件，在初始化的过程中会被注册

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

通过这种方式，插件会设置响应内容为`Content-Type: text/javascript;`，给我们返回一段包含了回调函数的代码，来执行我们预先定义好的 callbak 函数。
