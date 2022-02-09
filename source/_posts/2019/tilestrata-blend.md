---
title: tilestrata-blend 插件使用及浅析
date: 2019-07-08 15:19:26
tags: [GIS]
categories: TileStrata
---

[tilestrata-blend](https://github.com/naturalatlas/tilestrata-blend)插件可以将多个栅格瓦片图层合并成一个 png 图层，并且支持透明度、混合模式、图层过滤等选项。使用这个插件必须安装依赖[node-mapnik](https://github.com/mapnik/node-mapnik)。这个插件依然是一个利用 mapnik 强大的功能的`Provider`类型的插件，甚至可以基于 mapnik 增强它已有的功能。

<!--more-->

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

# 1. 安装

```sh
$ npm install tilestrata-blend --save
```

# 2. 使用

```js
const tilestrata = require('tilestrata')
const mapnik = require('tilestrata-mapnik')
const blend = require('tilestrata-blend')
const server = tilestrata()

// 定义第一个世界边界图层
server
  .layer('world_merc')
  .route('tile.png')
  .use(disk.cache({ dir: 'tilecache' }))
  .use(
    mapnik({
      pathname: 'style/world.xml'
    })
  )

// 定义第二个中国省界图层
server
  .layer('province')
  .route('tile.png')
  .use(
    mapnik({
      pathname: 'style/province.xml'
    })
  )

// 定义混合图层
server
  .layer('blend_layer')
  .route('combined.png')
  .use(
    blend(
      [
        ['world_merc', 'tile.png'],
        [
          'province',
          'tile.png',
          // 配置一些省界图层合并时候的参数
          {
            opacity: 0.5,
            comp_op: 'multiply',
            image_filters: 'agg-stack-blur(10,10)'
          }
        ]
      ],
      // 给合并后的图层设置一个可选的填充色
      {
        matte: 'ffffff'
      }
    )
  )

// 启动服务
server.listen(9527)
```

# 3. 效果

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

可以在同一张瓦片上看到黄色的中国省界图层和世界边界图层，下图是没有配置仍和`options`：

![](http://blog-img-1255388623.cossh.myqcloud.com/tilestrata-blend-no-option-20190705113008.png)

下图是像上面演示的那样，给省界图层加入了一些`options`，例如 image_filters 和 opacity：

![](http://blog-img-1255388623.cossh.myqcloud.com/tilestrata-blend-20190705102810.png)

# 4. 代码浅析

这个插件在背后依赖了[tilestrata-dependency](https://github.com/naturalatlas/tilestrata-dependency)，所以配置里面的`['world_merc', 'tile.png']`实际上是通过执行了`.use(dependency('world_merc_png', 'tile.png'))`操作来获取数据源：

```js
// 找到每个图层的数据源（代码有所精简）
var layers = layers.map(function(pair) {
  var layer = pair[0]
  var filename = pair[1]
  var comp_options = pair[2] || {}
  return [dependency(layer, filename), comp_options]
})
```

当请求某个瓦片时候，对每个`layers`依次执行`fetchTile`获取对应图片和`prepareImage`预处理图片

```js
// 对每个数据源，获取数据，预处理图片（代码有所精简）
async.series(
  [
    function fetchTile(callback) {
      callback(err)
    },
    function prepareImage(callback) {
      // 这一步会创建new mapnik.Image
      generateMatte(noop)
    }
  ],
  function(err) {
    callback(err, image ? [image, options] : null)
  }
)
```

完成每个数据源的单独处理后就是合并操作了，利用 mapnik 的[omposite](http://mapnik.org/documentation/node-mapnik/3.6/#Image.composite)方法来依次合并创建的每个`mapnik.Image`对象，最后再利用[demultiply](http://mapnik.org/documentation/node-mapnik/3.6/#Image.demultiply)解构为 buffer 返回给 tilestrata 就好了。

```js
// （代码有所精简）
async.eachSeries(images, function(res, callback) {
    // 依次合并图片
    intermediate.composite(image, res[1], callback);
}, function(err) {
    // 结构返回buffer
    intermediate.demultiply(function(err) {
            callback(null, buffer, {'Content-Type': 'image/png'});
        });
    });
});
```
