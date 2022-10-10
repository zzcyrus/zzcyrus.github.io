---
title: tilestrata-vtile-raster 插件使用及浅析
date: 2019-07-05 14:05:38
tags: [GIS]
categories: TileStrata
---

[tilestrata-vtile-raster](https://github.com/naturalatlas/tilestrata-vtile-raster)是配合`tilestrata-vtile`插件用来将 mapnik 的`pbf`格式的矢量瓦片转换成栅格图片。使用这个插件必须安装依赖[node-mapnik](https://github.com/mapnik/node-mapnik)。

<!--more-->

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

# 1. 安装

```sh
$ npm install tilestrata-vtile-raster --save
```

# 2. 使用

```js
const tilestrata = require('tilestrata')
const vtile = require('tilestrata-vtile')
const vtileraster = require('tilestrata-vtile-raster')
const headers = require('tilestrata-headers')

const server = tilestrata()

// 定义省界边界数据源
const common = {
  xml: 'style/province.xml',
  tileSize: 256,
  metatile: 1,
  bufferSize: 128
}

server
  .layer('osm_pbf_raster')
  .route('tile.pbf') // 定义vtile pbf图层做对比
  .use(
    headers({
      'Access-Control-Allow-Origin': '*'
    })
  )
  .use(vtile(common))
  .route('tile.png') // 定义vtile-raster png图层做对比
  .use(
    vtileraster(common, {
      tilesource: ['osm_pbf_raster', 'tile.pbf']
    })
  )
  .route('tile.json')
  .use(
    vtileraster(common, {
      tilesource: ['osm_pbf_raster', 'tile.pbf']
    })
  )

// 启动服务
server.listen(9527)
```

# 3. 效果

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

可以直接使用常规的栅格瓦片加载方式来加载`tile.png`图层，无须使用矢量瓦片的加载方式。可以和[tilestrata-vtile 插件浅析](https://kaely.net/2019/07/04/tilestrata-vtile/)对比观看。

![](http://blog-img-1255388623.cossh.myqcloud.com/v-tile-raster-result-20190704172822.png)

# 4. 代码浅析

核心仍然是 mapnik 的功能，过程上大体是和 tilestrata-vtile 插件类似的，不同的地方在当请求图层的时候，不再单纯的使用[VectorTile](http://mapnik.org/documentation/node-mapnik/3.6/#VectorTile)的`getData`方法，首先代码会依据是否可交互属性`interactivity`来构造一个类型是`mapnik.Image`的`surface`参数

```js
if (self.interactivity) {
  surface = new mapnik.Grid(dim, dim)
  // ... 省略
} else {
  surface = new mapnik.Image(dim, dim)
}
```

然后使用[VectorTile.render](http://mapnik.org/documentation/node-mapnik/3.6/#VectorTile.render)这个方法，通过 xml 构建出来的 map 和上面的 surface 参数，就可以将矢量数据转化为栅格图片：

```js
vectorTile.render(self.map, surface, options, callback)
```
