---
title: tilestrata-vtile-composite 插件使用及浅析
date: 2019-07-07 16:56:34
tags: [GIS]
categories: TileStrata
---

[tilestrata-vtile-composite](https://github.com/naturalatlas/tilestrata-vtile-composite)插件用来合并多个矢量瓦片图层，这些矢量瓦片图层来自于[tilestrata-vtile](https://github.com/naturalatlas/tilestrata-vtile)插件。使用这个插件必须安装依赖[node-mapnik](https://github.com/mapnik/node-mapnik)。
这个插件的作用和[tilestrata-blend](https://github.com/naturalatlas/tilestrata-blend)类似，只是适用对象是 vtile 生产出来的矢量瓦片。

<!--more-->

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

# 1. 安装

```sh
$ npm install tilestrata-vtile-composite --save
```

# 2. 使用

```js
const tilestrata = require('tilestrata')
const vtile = require('tilestrata-vtile')
const vtilecomposite = require('tilestrata-vtile-composite')
const headers = require('tilestrata-headers')

const server = tilestrata()

// 省界边界源
const provinceXml = {
  xml: 'style/province.xml',
  tileSize: 256,
  metatile: 1,
  bufferSize: 128
}

// 世界边界源
const worldXml = {
  xml: 'style/world.xml',
  tileSize: 256,
  metatile: 1,
  bufferSize: 128
}

// 定义第一个数据源
server
  .layer('province_pbf')
  .route('t.pbf')
  .use(vtile(provinceXml))

// 定义第一个数据源
server
  .layer('world_pbf')
  .route('t.pbf')
  .use(vtile(worldXml))

// 合并两个数据源，开启跨域访问
server
  .layer('combined_pbf')
  .route('combined.pbf')
  .use(
    headers({
      'Access-Control-Allow-Origin': '*'
    })
  )
  .use(vtilecomposite([['world_pbf', 't.pbf'], ['province_pbf', 't.pbf']]))

// 启动服务
server.listen(9527)
```

# 3. 效果

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

这是单独的中国区域 pbf：

![](http://blog-img-1255388623.cossh.myqcloud.com/v-tile-composite-pro-20190704173456.png)

这是单独的世界区域 pbf：

![](http://blog-img-1255388623.cossh.myqcloud.com/v-tile-composite-world-20190704173556.png)

合并之后的图层：

![](http://blog-img-1255388623.cossh.myqcloud.com/v-tile-composite-20190704173718.png)

# 4. 代码浅析

其实原理也就解释了为什么官方说明中一定要在依赖中加入`node-mapnik`。核心代码如下：

```js
function compositeTiles(callback) {
  if (vtiles.length === 0) return callback()

  var merged = new mapnik.VectorTile(req.z, req.x, req.y)
  // 我是关键
  merged.composite(vtiles, function(err) {
    vtiles = null
    if (err) return callback(err)

    result = merged.getData(dataopts)
    result._vtile = merged
    result._vx = req.x
    result._vy = req.y
    result._vz = req.z
    callback()
  })
}
```

在连续请求完两个数据源的数据之后，新建 mapnik 的`VectorTile`对象，并调用其[VectorTile.composite](http://mapnik.org/documentation/node-mapnik/3.6/#VectorTile.composite)方法，对两个数据源请求来的数据进行合并，最后再`getData`输出结果就好。
