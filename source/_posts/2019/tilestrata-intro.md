---
title: tilestrata 入门指南
date: 2019-07-18 18:13:53
tags: [GIS]
categories: TileStrata
---

简单来说[**Tilestrata**](https://github.com/naturalatlas/tilestrata)就是一个瓦片地图服务器。根据其自身的介绍，它有如下的特点：零配置，简洁，测试覆盖率高，性能高，拓展性强。可以通过[TileStrata Balancer](https://github.com/naturalatlas/tilestrata-balancer)实现负载均衡，无缝伸缩。可以通过内置[控制台](https://github.com/naturalatlas/tilestrata#profiling--debugging-performance)去调试查看渲染时间。

<!--more-->

本文主要基于官方的文档介绍及部分使用心得，旨在帮助大家快速上手，进阶使用会后续说明。

安装：

```sh
$ npm install tilestrata --save
```

## 1. 主要结构

TileStrata 的结构上有以下五个主要组成部分，通常用来实现各种插件，我个人习惯把它们看作是生命周期流程，正是由于这些 hook 的存在，我们就可以在 TileStrata 生命周期的各个阶段去实现各种巧妙的功能：

- `request hook` – 请求预处理
- `cache` – 缓存控制
- `provider` – 数据源，比如 mapnik
- `transform` – 最关键的阶段，可以在瓦片输出的过程中对其做各种加工，比如旋转，染色
- `response hook` – 响应后处理，比如 headers、jsonp 插件

官方提供了一张很直观的流程图：

![](https://camo.githubusercontent.com/67abe0f563502d78ef12b4ce20cba57222dfcf6f/68747470733a2f2f63646e2e7261776769742e636f6d2f6e61747572616c61746c61732f74696c657374726174612f6d61737465722f6d6973632f67726170686963732f726571666c6f772e737667)

## 2. 常用插件

- [tilestrata-mapnik](https://github.com/naturalatlas/tilestrata-mapnik) – 使用 [mapnik](http://mapnik.org/)做数据源进行渲染
- [tilestrata-disk](https://github.com/naturalatlas/tilestrata-disk) – 服务端缓存插件
- [tilestrata-dependency](https://github.com/naturalatlas/tilestrata-dependency) – 直接使用其他定义好的图层来获取数据，而不是定义一个 provider
- [tilestrata-sharp](https://github.com/naturalatlas/tilestrata-sharp) – 用 [libvips](https://www.npmjs.com/package/sharp)来做一些图片的处理，比如压缩，旋转，转换类型
- [tilestrata-gm](https://github.com/naturalatlas/tilestrata-gm) – 使用 [GraphicsMagick](https://www.npmjs.com/package/gm)来对图片做处理，大体上和上面类似
- [tilestrata-headers](https://github.com/naturalatlas/tilestrata-headers) – 设置请求的响应头，可以解决跨域问题
- [tilestrata-blend](https://github.com/naturalatlas/tilestrata-blend) – 合成多个瓦片图层为一个图层，比方组合道路+建筑为一个图层
- [tilestrata-jsonp](https://github.com/naturalatlas/tilestrata-jsonp) – 使 utfgrids 类的 json 数据支持 jsonp 请求方式
- [tilestrata-datadog](https://github.com/naturalatlas/tilestrata-datadog) – 继承数据到[Datadog](https://www.datadoghq.com/)服务
- [tilestrata-utfmerge](https://github.com/naturalatlas/tilestrata-utfmerge) – 合并两个 utfgrids 类图层为一个图层
- [tilestrata-vtile](https://github.com/naturalatlas/tilestrata-vtile) – 输出 mapnik 数据为矢量切片 pbf 格式
- [tilestrata-vtile-raster](https://github.com/naturalatlas/tilestrata-vtile-raster) – 将上面的 pbf 的是瓦片转换成栅格瓦片
- [tilestrata-vtile-composite](https://github.com/naturalatlas/tilestrata-vtile-composite) – 合并多个矢量瓦片图层
- [tilestrata-proxy](https://github.com/naturalatlas/tilestrata-proxy) – 为其他瓦片服务器提供代理
- [tilestrata-lru](https://github.com/naturalatlas/tilestrata-lru) – 在内存中缓存瓦片数据
- [tilestrata-etag](https://github.com/naturalatlas/tilestrata-etag) – 让瓦片图层支持自定义 ETag 标签，一般用来处理 http 缓存
- [tilestrata-bing](https://github.com/naturalatlas/tilestrata-bing) – Bing 地图的 provider
- [tilestrata-underzoom](https://github.com/naturalatlas/tilestrata-underzoom) - Build mosaics of higher-zoom tiles
- [tilestrata-postgismvt](https://github.com/Stezii/tilestrata-postgismvt) – 使用 PostGIS 数据库输出 mvt 格式的瓦片
- [tilestrata-postgis-geojson-tiles](https://github.com/naturalatlas/tilestrata-postgis-geojson-tiles) – 使用 PostGIS 数据库输出 GeoJSON 格式的瓦片

## 3. 基本使用

```js
var tilestrata = require('tilestrata')
var disk = require('tilestrata-disk')
var sharp = require('tilestrata-sharp')
var mapnik = require('tilestrata-mapnik')
var dependency = require('tilestrata-dependency')
var strata = tilestrata()

// 定义一个图层
strata
  .layer('layerName')
  // 设置第一个瓦片路径
  .route('tileName.png')
  // 设置缓存目录
  .use(disk.cache({ dir: '/var/lib/tiles/basemap' }))
  // 设置数据源mapnik
  .use(
    mapnik({
      pathname: '/path/to/map.xml',
      tileSize: 512,
      scale: 2
    })
  )
  // 设置第二个瓦片路径
  .route('tileSharp.png')
  .use(disk.cache({ dir: '/var/lib/tiles/basemap' }))
  // 用dependency插件直接使用layerName的源
  .use(dependency('layerName', 'tileName.png'))
  // 用sharp插件resize每个瓦片的大小
  .use(
    sharp(function(image, sharp) {
      return image.resize(256)
    })
  )

// 启动服务
strata.listen(8080)
```

服务启动后，可以通过下面的地址来访问瓦片数据：

```
/layerName/:z/:x:/:y/tileName.png
```

### 3.1 不定义瓦片名称

从 [2.1.0](https://github.com/naturalatlas/tilestrata/releases/tag/v2.1.0)版本开始, 在设置`route`名称的时候，可以直接采用下面的形式，更加符合通用的瓦片格式：

```js
.route('*.png') // /layer/0/0/0.png
.route('*@2x.png') // /layer/0/0/0@2x.png
```

### 3.2 整合 [Express.js](http://expressjs.com/) / [Connect](https://github.com/senchalabs/connect)

TileStrata 可以定义成 Express 的一个中间件去使用，不必通过执行`strata.listen(8080)`来启动一个 server 服务，

```js
var tilestrata = require('tilestrata')
var strata = tilestrata()
strata.layer('basemap') /* ... */
strata.layer('contours') /* ... */

app.use(
  tilestrata.middleware({
    server: strata,
    prefix: '/maps'
  })
)
```

## 4. 使用说明

### 4.1 支持 Metatile 的负载均衡和图层共享

TileStrata 从 [2.0.0](https://github.com/naturalatlas/tilestrata/releases/tag/v2.0.0) 版本开始支持集成[TileStrata Balancer](https://github.com/naturalatlas/tilestrata-balancer), 这是一个专门针对瓦片服务中的[metatiles](http://wiki.openstreetmap.org/wiki/Meta_tiles)设计的弹性负载均衡器，一般的负载均衡器并没有`metatiles`这个概念，所以会简单的把瓦片请求的分散到多个服务器，这样会导致冗余的渲染，不仅速度慢还会造成服务器资源浪费。

需要额外注意的是，均衡器并不会假设负载池中的所有服务器都提供了相同的图层， 它会持续追踪每个节点上提供的所有的图层，因此他知道某个图层明确的访问路径。

- **Fully elastic** （最小化配置）
- **Consistent routing** (提高本地缓存命中率)
- **Metatile-aware** (防止冗余渲染)
- **Layer-aware** (支持图层的异构分布)

[**TileStrata Balancer 详细文档 →**](https://github.com/naturalatlas/tilestrata-balancer)

### 4.2 重建瓦片缓存

在更新了图层的样式或者数据源后，你需要更新瓦片。这时候不必立刻删掉所有旧缓存，可以在请求头中设置`X-TileStrata-SkipCache`，逐步请求这些瓦片让服务器重新构建它们。[TileMantle](https://github.com/naturalatlas/tilemantle)工作可以让这个过程十分简单：

```sh
npm install -g tilemantle
tilemantle http://myhost.com/mylayer/{z}/{x}/{y}/t.png \
    -p 44.9457507,-109.5939822 -b 30mi -z 10-14 \
    -H "X-TileStrata-SkipCache:mylayer/t.png"
```

如果你使用了 [tilestrata-dependency](https://github.com/naturalatlas/tilestrata-dependency) 插件, 请求头则需要设置成如下形式：

```
X-TileStrata-SkipCache:*
X-TileStrata-SkipCache:[layer]/[file],[layer]/[file],...
```

在一些高级的使用场景中，为了确保瓦片在缓存实际写入文件系统之前不要从服务器返回请求，需要额外做如下设置：

```
X-TileStrata-CacheWait:1
```

### 4.1 健康检查

TileStrata 包含一个名为`/health`内置路径，如果服务器连接正常，你会收到`200 OK`的返回值。这可以用来自定义一些错误和成功提醒，设置想要的返回值。只要在初始化 tilestrata 时，给选项中的 healthy 设置一个回调函数即可。

```js
// 不健康状态
var strata = tilestrata({
  healthy: function(callback) {
    callback(new Error('CPU is too high'), { loadavg: 3 })
  }
})

// 错误信息'CPU is too high'会包装在message字段中返回

// 健康状态
var strata = tilestrata({
  healthy: function(callback) {
    callback(null, { loadavg: 1 })
  }
})

// 正确的返回值中将会额外的多一个loadavg字段，这将是你自定义的内容
```
