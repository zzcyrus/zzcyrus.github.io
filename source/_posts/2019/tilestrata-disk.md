---
title: tilestrata-disk 插件使用及浅析
date: 2019-07-15 21:39:59
tags: [GIS]
categories: TileStrata
---

[tilestrata-disk](https://github.com/naturalatlas/tilestrata-disk)插件可以在磁盘中存储/检索瓦片。它可以兼顾瓦片缓存和瓦片提供两个功能，代码虽简单，但是功能十分全面，个人感觉非常的实用，很值得推荐。

用它来缓存瓦片时，一定要为每个图层使用不同的目录（例如："tiles/layer_a", "tiles/layer_b"）。如果设置了`maxage`参数，插件会检查瓦片的最近一次修改时间，如果间隔过长，将返回`null`。如果 设置`maxage=0`，就相当于没有开启缓存功能。

<!--more-->

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

# 1. 安装

```sh
$ npm install tilestrata-disk --save
```

# 2. 使用

```js
const tilestrata = require('tilestrata')
const mapnik = require('tilestrata-mapnik')
const disk = require('tilestrata-disk')
const server = tilestrata()

server
  .layer('world_merc')
  .route('tile.png')
  // 直接缓存
  .use(disk.cache({ dir: 'tilecache/world' }))
  .use(
    mapnik({
      pathname: 'style/world.xml'
    })
  )

server
  .layer('province')
  .route('tile.png')
  // 不同图层使用不同目录，同时设置最大缓存时间3600秒
  .use(disk.cache({ maxage: 3600, dir: 'tilecache/province' }))
  .use(
    mapnik({
      pathname: 'style/province.xml'
    })
  )

server.listen(9527)
```

此外，disk 插件的功能远不止如此：

```js
// 设置maxage为function，控制不同层级的过期时间
server
  .layer('mylayer')
  .route('tile.png')
  .use(/* some provider */)
  .use(
    disk.cache({
      dir: './tiles/mylayer',
      maxage: function(server, req) {
        if (req.z > 15) return 0 // 不缓存
        if (req.z > 13) return 3600
        return 3600 * 24
      }
    })
  )

// 可以通过path自定义缓存的结构和文件名
server
  .layer('mylayer')
  .route('tile.png')
  .use(/* some provider */)
  .use(disk.cache({ path: './tiles/{layer}/{z}/{x}/{y}-{filename}' }))

// 通过callback的方式来设置
server
  .layer('mylayer')
  .route('tile.png')
  .use(/* some provider */)
  .use(
    disk.cache({
      path: function(tile) {
        return './tiles/' + tile.layer + '/' + tile.z + '/' /* ... */
      }
    })
  )

// 直接使用缓存下来的文件当作provider，这样就不调用服务器生成图片了
server
  .layer('mylayer')
  .route('tile.png')
  .use(disk.provider('/path/to/dir/{z}/{x}/{y}/file.png'))
```

甚至在`0.6.0`及其以上的 tilestrata 版本中，你还可以通过设定`refreshage`来控制缓存数据的寿命，这个参数需要与`maxage`一起设设置：

```js
.use(disk.cache({
    dir: './tiles/mylayer',
    refreshage: 3600, // 1 hour
    maxage: 3600*24*7 // 1 week
}));

refreshage: null  // 永远不刷新缓存
refreshage: 0     // 命中一次后就刷新
refreshage: 1800  // 半小时后刷新
```

# 3. 效果

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

下图中设置了`tilecache`缓存目录，可以看到瓦片会按照层级建立对应的目录结构并保存图片：

![](http://blog-img-1255388623.cossh.myqcloud.com/tilestrata-disk-20190705160620.png)

# 4. 代码浅析

因为插件即提供了`cache`功能，也提供了`Provider`功能，所以其实它是这两种类型插件的组合，作为`Provider`还是比较简单的，核心是 serve 方法:

```js
serve: function(server, tile, callback) {
  // 解析路径
  var file = template
    .replace('{layer}', tile.layer)
    .replace('{filename}', tile.filename)
    .replace('{x}', tile.x)
    .replace('{y}', tile.y)
    .replace('{z}', tile.z);

  // 根绝路径读取文件为buffer
  fs.readFile(file, function(err, buffer) {
    if (err) {
      if (err.code === 'ENOENT') {
        var err = new Error('File not found');
        err.statusCode = 404;
        return callback(err);
      }
      return callback(err);
    }
    // 返回buffer给tilestrata
    callback(null, buffer, {'Content-Type': mime(file)});
  });
}
```

在`cache`功能中，需要提供 get 和 set 方法，主要就是在 set 方法中保存文件，在 get 方法中判断是否过期，是否文件名命中缓存，收否需要刷新，之后再返回对应结果的内容：

```js
// set 方法
FileSystemCache.prototype.set = function(
  server,
  req,
  buffer,
  headers,
  callback
) {
  var maxage = this.ageTolerance('maxage', req)
  if (maxage === 0) return callback()
  // 只要maxage不为0，就在文件系统上存储图片，this._file是根据path或者dir设置计算出来的存储路径
  fs.outputFile(this._file(req), buffer, callback)
}
```

```js
// get 方法（有所精简）
FileSystemCache.prototype.get = function(server, req, callback) {
  var maxage = this.ageTolerance('maxage', req)
  // maxage为0，直接结束
  if (maxage === 0) return done()

  var self = this
  // 获取缓存文件路径
  var file = this._file(req)
  fs.open(file, 'r', function(err, fd) {
    fs.fstat(fd, function(err, stats) {
      if (err) return done(err)
      var mtime = stats.mtime.getTime()

      // 根据maxage是否过期判断是否直接结束
      var shouldServe = self.shouldServe(mtime, req)
      if (!shouldServe) return done()

      // 根据refreshage判断是否刷新
      var shouldRefresh = self.shouldRefresh(mtime, req)
      var headers = { 'Content-Type': mime(file) }
      var buffer = new Buffer(stats.size)

      // 如果没有这个文件，直接结束
      if (!stats.size) {
        return done(null, buffer, headers, shouldRefresh)
      }

      // 如果前面的都通过则读取文件为buffer
      fs.read(fd, buffer, 0, stats.size, 0, function(err) {
        if (err) return done(err)
        // 返回buffer
        done(null, buffer, headers, shouldRefresh)
      })
    })
  })
}
```
