---
title: tilestrata-lru  插件使用及浅析
date: 2019-07-11 22:51:22
tags: [GIS]
categories: TileStrata
---

[tilestrata-lru](https://github.com/naturalatlas/tilestrata-lru)插件使用内存来缓存瓦片。所以使用起来需要额外的小心，如果没有仔细的配置它有可能导致内存溢出。但若果你需要在不同的图层或者路径中共享某个资源，这个插件就是为此而生的。

<!--more-->

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

# 1. 安装

```sh
$ npm install tilestrata-lru --save
```

# 2. 使用

```js
const tilestrata = require('tilestrata')
const lru = require('tilestrata-lru')
const mapnik = require('tilestrata-mapnik')
const headers = require('tilestrata-headers')

const server = tilestrata()

const provider = mapnik({
  pathname: 'style/province.xml'
})

// 设置最大占用20mb的内存
server
  .layer('lru_layer_size')
  .route('tile.png')
  .use(provider)
  .use(
    headers({
      'Access-Control-Allow-Origin': '*'
    })
  )
  .use(lru({ size: '20mb', ttl: 30 })) // ttl in seconds

// 设置最多缓存20个数据
server
  .layer('lru_layer_number')
  .route('tile.png')
  .use(provider)
  .use(
    headers({
      'Access-Control-Allow-Origin': '*'
    })
  )
  .use(lru({ size: 20, ttl: 30 }))

// 手动设置cache中数据对应key的结构
server
  .layer('lru_layer_key')
  .route('tile.png')
  .use(provider)
  .use(
    headers({
      'Access-Control-Allow-Origin': '*'
    })
  )
  .use(
    lru({
      key: function(req) {
        return (
          req.z +
          ',' +
          req.x +
          ',' +
          req.y +
          ',' +
          req.layer +
          ',' +
          req.filename +
          ',' +
          'lru_layer_custom_key'
        )
      }
    })
  )

// 启动服务
server.listen(9527)
```

# 3. 效果

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

多次访问某个瓦片，如`http://127.0.0.1:9527/lru_layer_number/4/12/6/tile.png`，可以发现插件会在后几次从`cache`中直接 get 获取数据：

![](http://blog-img-1255388623.cossh.myqcloud.com/tilestrata-lru-20190705162618.png)

# 4. 代码浅析

首先定义插件类型，`Caches`类型的插件需要给 tilestrata 提供`set`和`get`两个回调函数，核心是[lru-cache](https://www.npmjs.com/package/lru-cache)库

```js
// 代码有所精简
// 设置缓存用到的key，如果没有自己设置key的结构，那默认将采用如下的结构
var key =
  opts.key ||
  function(req) {
    return (
      req.z + ',' + req.x + ',' + req.y + ',' + req.layer + ',' + req.filename
    )
  }

// 判断设置的是数量还是内存大小
if (typeof opts.size === 'string') {
  lruopts.max = filesizeParser(opts.size)
  lruopts.length = function(item) {
    return item.buffer.length
  }
} else if (typeof opts.size === 'number') {
  lruopts.max = opts.size
}

// 根据options创建lru-cache对象
var cache = new SyncCache(lruopts)

return {
  get: function(server, req, callback) {
    // 获取数据
    var item = cache.get(key(req))
    if (item) return callback(null, item.buffer, item.headers)
    callback()
  },
  set: function(server, req, buffer, headers, callback) {
    // 缓存数据
    cache.set(key(req), { buffer: buffer, headers: headers })
    callback()
  }
}
```
