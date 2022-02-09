---
title: tilestrata-vtile 插件使用及浅析
date: 2019-07-04 17:39:41
tags: [GIS]
categories: TileStrata
---

[tilestrata-vtile](https://github.com/naturalatlas/tilestrata-vtile)插件可以通过 mapnik 数据源生成`pbf`格式的矢量瓦片。如果需要对瓦片做放大倍数，交互这些操作，矢量瓦片不需要再额外的请求数据，使用起来非常方便。后续还可以通过配套的[tilestrata-vtile-raster](https://github.com/naturalatlas/tilestrata-vtile-raster)插件来将矢量数据渲染成普通的图片瓦片。使用这个插件必须安装依赖[node-mapnik](https://github.com/mapnik/node-mapnik)。

<!--more-->

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

# 1. 安装

```sh
$ npm install tilestrata-vtile --save
```

# 2. 使用

```js
const tilestrata = require('tilestrata')
const vtile = require('tilestrata-vtile')
const headers = require('tilestrata-headers')

const server = tilestrata()

// 定义省界边界数据源
const common = {
  xml: 'style/province.xml',
  tileSize: 256,
  metatile: 1,
  bufferSize: 128
}

// 开启跨域，定义图层
server
  .layer('province_pbf')
  .route('tile.pbf')
  .use(
    headers({
      'Access-Control-Allow-Origin': '*'
    })
  )
  .use(vtile(common))

// 启动服务
server.listen(9527)
```

插件还提供了`overrideRenderOptions`配置项，用来做层级的精确控制，控制瓦片的返回内容

```js
server
  .layer('mylayer')
  .route('t.pbf')
  .use(
    vtile({
      xml: '/path/to/map.xml',
      tileSize: 256,
      metatile: 1,
      bufferSize: 128,
      overrideRenderOptions: function(opts, z, maxz) {
        opts.simplify_distance = z < maxz ? 8 : 1
        return opts
      }
    })
  )
```

回调函数的第一个参数`opts`包含了以下内容，可以在[第四节](#4-代码浅析)的代码分析中看到这些值是怎么来的：

```js
{
  simplify_distance,
  path_multiplier, 
  buffer_size, 
  scale_denominator
}
```

# 3. 效果

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

![](http://blog-img-1255388623.cossh.myqcloud.com/v-tile-result-20190704171541.png)

# 4. 代码浅析

原理上很简单，从代码上就能看出来，传入了 mapnik 需要的`xml`配置文件，所以其实是利用了 mapnik 的[VectorTile](http://mapnik.org/documentation/node-mapnik/3.6/#VectorTile)功能，代码如下：

```js
// 新建VectorTile源，options也和传入的otps息息相关
map.render(new mapnik.VectorTile(z, x, y), options, function(err, image) {
  self.pool.release(map)
  if (err) return callback(err)

  if (image.empty()) {
    err = new Error('No data')
    err.statusCode = 204
    return callback(err)
  }

  // 通过getdata方法获取数据并返回给tilestrata
  var buffer = image.getData(self.dataopts)
  buffer.metatile = self.metatile
  buffer._vtile = image
  buffer._vx = x
  buffer._vy = y
  buffer._vz = z

  callback(null, buffer)
})
```

第二节使用中提到的`opts`的参数实际上是 mapnik 中[Map.render](http://mapnik.org/documentation/node-mapnik/3.6/#Map.render)方法的几个可选参数，他们会在 tilestrata-vtile 中被合并使用：

```js
var options = self.overrideRenderOptions(
  {
    simplify_distance: real_z < self.maxzoom ? 8 : 1,
    path_multiplier: 16 * self.metatile,
    buffer_size: self.bufferSize,
    scale_denominator: 559082264.028 / (1 << real_z)
  },
  real_z,
  self.maxzoom
)
```
