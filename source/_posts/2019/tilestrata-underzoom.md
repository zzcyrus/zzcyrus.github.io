---
title: tilestrata-underzoom  插件使用及浅析
date: 2019-07-11 22:44:51
tags: [GIS]
categories: TileStrata
---

[tilestrata-underzoom](https://github.com/naturalatlas/tilestrata-underzoom)插件从介绍上看就是在请求高级别瓦片时，用低级别的瓦片进行拼接，而不是直接生产指定级别的瓦片。使用这个插件必须安装依赖[node-mapnik](https://github.com/mapnik/node-mapnik)。

<!--more-->

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

# 0. 发生了什么

比方说我们请求了`4/13/6`瓦片，即`x=13,y=6,z=4`，插件会分别找到`[[26,12,5],[27,12,5],[27,13,5],[26,13,5]]`四个瓦片，获取数据，然后把四张图片进行合并，而不是直接渲染出`4/13/6`对应的图像。我个人的理解中，在向外缩放的过程中，人眼可视区域内的地图范围越来越大，对于 server 来说要渲染的内容也就越来越多，这个时候就要既保证渲染的展现结果，又要保证渲染过程对服务器资源的占用，`underzoom`对于瓦片地图来说就是针对这一问题的探索。

# 1. 安装

```sh
$ npm install tilestrata-underzoom --save
```

# 2. 使用

```js
const tilestrata = require('tilestrata')
const dependency = require('tilestrata-dependency')
const underzoom = require('tilestrata-underzoom')
const mapnik = require('tilestrata-mapnik')
const server = tilestrata()

// 用mapnik定义一个世界范围地图
server
  .layer('world_merc')
  .route('tile.png')
  .use(
    mapnik({
      pathname: 'style/world.xml'
    })
  )

// 定义underzoom图层
server
  .layer('underzoom')
  .route('tile@2x.png')
  .use(
    underzoom({
      source: dependency('world_merc', 'tile.png'),
      inputSize: 256,
      outputSize: 512,
      zooms: 1 // 1以下层级全部采用underzoom的方式拼接
    })
  )

// 启动服务
server.listen(9527)
```

# 3. 效果

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

不启用 underzoom 的效果：

![](http://blog-img-1255388623.cossh.myqcloud.com/tilestrata-underzoom-original-20190708145711.png)

underzoom 放大两倍的效果：

![](http://blog-img-1255388623.cossh.myqcloud.com/tilestrata-underzoom-result-20190708145813.png)

可以看到，整个地图看上去**清晰了很多，边缘更加明显**，这是因为低级别瓦片本身的精细程度就高，合并成大图后的对于细节的效果也会更好。
但是地图左边区域原先就基本上是只由线勾勒出的**白色区域**，在低瓦片中可以看到，合并成大图后就基本上看不清了，这是因为本身线宽是很细的，比如说是 1px 宽度，合并大图的过程中这个宽度并不会增加，但图片整个的像素变大了，所以细线就基本看不清了，这也是插件不好的地方。

# 4. 代码浅析

说到合并图片，就能想到之前我们说过的`tilestrata-blend`插件，它是将两个不同数据源的结果图片进行了合并，而这个插件是将同一个数据源的四个低级别瓦片合并成了一个。

根据 underzoom 的`inputSize、zooms`的配置项，先准备好一个`Mapnik.Image`对象：

```js
var canvas = new Mapnik.Image(canvasSize, canvasSize)
```

之后使用`@mapbox/tilebelt`库获取请求地址的下属四个低级别瓦片地址，分别请求数据，利用上面准备好的`Mapnik.Image`对象，使用[Image.composite](http://mapnik.org/documentation/node-mapnik/3.6/#Image.composite)方法来合并四张图片，最后返回结果就好。

```js
// 代码有所精简
function startFetchAndComposite(callback) {
  // 例如请求 4/13/6
  // 此时coordList就是 [[26,12,5],[27,12,5],[27,13,5],[26,13,5]]
  var coordList = getTileCoords(req.x, req.y, req.z, underzoomLevels)
  // 遍历coordList
  async.each(
    coordList,
    function(coords, callback) {
      // clone一个新的请求
      var childReq = req.clone()
      childReq.x = coords[0]
      childReq.y = coords[1]
      childReq.z = coords[2]
      options.source.serve(server, childReq, function(
        err,
        childBuffer,
        childHeaders
      ) {
        // 获取数据
        Mapnik.Image.fromBytes(childBuffer, function(err, image) {
          // 执行合并操作
          canvas.composite(
            image,
            {
              comp_op: Mapnik.compositeOp.src_over,
              dx: x,
              dy: y,
              opacity: 1
            },
            callback
          )
        })
      })
    },
    callback
  )
}
```
