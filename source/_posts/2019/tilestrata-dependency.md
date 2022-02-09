---
title: tilestrata-dependency 插件使用及浅析
date: 2019-07-07 17:02:17
tags: [GIS]
categories: TileStrata
---

[tilestrata-dependency](https://github.com/naturalatlas/tilestrata-dependency)插件其实就是共享其他图层的数据源，如果你想定义两个不同格式的图层，例如分别是 png 和 jpg，这个插件就会非常的便利。你甚至可以传入一个 function 来精确控制不同层级使用不同图层的数据源。

<!--more-->

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

# 1. 安装

```sh
$ npm install tilestrata-dependency --save
```

# 2. 使用

```js
const tilestrata = require('tilestrata')
const dependency = require('tilestrata-dependency')
const mapnik = require('tilestrata-mapnik')

const server = tilestrata()

server
  // 定义世界边界png图层
  .layer('world_merc_png')
  .route('tile.png')
  .use(
    mapnik({
      pathname: 'style/world.xml'
    })
  )

server
  // 定义世界边界jpg图层
  .layer('world_merc_jpg')
  .route('tile.jpg')
  // 直接用png的源
  .use(dependency('world_merc_png', 'tile.png'))

server
  .layer('function_layer')
  .route('tile.jpg')
  // 不同层级用不同的源
  .use(dependency(function(req) {
    if (req.z < 5) {
      return ['world_merc_png', 'tile.png'];
    }
    return ['world_merc_jpg', 'tile.jpg'];
  });

// 启动服务
server.listen(9527)
```

# 3. 效果

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

`world_merc_png`和`world_merc_jpg`使用了相同的源，展示的内容一模一样：

![](http://blog-img-1255388623.cossh.myqcloud.com/tilestrata-dependency-20190705152851.png)

# 4. 代码浅析

要弄清楚`dependency`插件的实现，首先要弄清楚它的类型，dependency 源代码很简单，它属于`Providers`类型的插件:

```js
// Providers 类型插件需要提供serve方法
serve: function(server, tile, callback) {
    callback(err, buffer, headers);
},
```

接下来的代码主要逻辑就是如何利用指定的图层源创造一个`buffer`返回给新图层，以下代码就是 server 函数，有所精简：

```js
// req 即上面的tile参数，包含请求的瓦片地址和类型，例如tile.jpg
var mock = req.clone()
// source 即指定的其他图层的数据源['world_merc_png', 'tile.png']
var source = getSource(req)

// 分别把当前tile的layer和filename替换成指定源的对应值
mock.layer = source[0]
mock.filename = source[1]

// server 即上面的server参数，代表整个tilestrata服务
server.serve(mock, false, function(status, buffer, headers) {
  if (status === 200) {
    // 利用伪造出来的指定源的请求内容去向服务器请求数据，获取buffer后返回给当前源
    callback(null, buffer, headers)
  } else {
    callback(err)
  }
})
```

当前图层拿到了 buffer 内容，只要再进入自己后续的加工逻辑，处理成指定格式返回就好了。
