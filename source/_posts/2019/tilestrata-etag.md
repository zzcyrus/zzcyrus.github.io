---
title: tilestrata-etag 插件使用及浅析
date: 2019-07-15 21:39:54
tags: [GIS]
categories: TileStrata
---

[tilestrata-etag](https://github.com/naturalatlas/tilestrata-etag)插件可以在 tilestrata 的请求中设置 ETag，可以让服务缓存变得更加高效可控，节省带宽。如果客户端的 ETag 的版本和服务器要发送的一致，则可以直接使用缓存中的数据，不再重新发送数据。

<!--more-->

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

# 1. 安装

```sh
$ npm install tilestrata-etag --save
```

# 2. 使用

默认情况下，插件不会对所有大于 512kb 的数据启用，因为在 large buffers 上 ETag 的计算会很占用 CPU 的时间。但你也可以通过`limit`选项来更改这一默认设置，例如设置为`null`将会无视文件的大小上限，设置为一个文件大小的字符串或者数字，则会以此为上限。

```js
const tilestrata = require('tilestrata')
const etag = require('tilestrata-etag')
const dependency = require('tilestrata-dependency')
const mapnik = require('tilestrata-mapnik')
const server = tilestrata()

// 用mapnik数据源做一个普通的图层来对比
server
  .layer('world_merc')
  .route('tile.png')
  .use(disk.cache({ dir: 'tilecache' }))
  .use(
    mapnik({
      pathname: 'style/world.xml'
    })
  )

// 用相同的数据源设置etag后做一个新图层来对比
server
  .layer('etag')
  .route('tile.png')
  .use(dependency('world_merc', 'tile.png'))
  .use(etag({ limit: '1mb' }))

// 启动服务
server.listen(9527)
```

# 3. 效果

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

可以看到 etag 图层所有 response 中已经带上了`ETag`

![](http://blog-img-1255388623.cossh.myqcloud.com/tilestrata-etag-result-20190705101438.png)

# 4. 代码浅析

首先定义插件类型，这其实是一个`Response Hooks`类型的插件，劫持修改了正常的服务返回值。插件引入了`filesize-parser`用来计算文件大小，设置上限`max_length`，使用[etag](https://www.npmjs.com/package/etag)来生成 etag。

```js
// max_length由limit设置得出
if (status_type === 2 && result.buffer && result.buffer.length < max_length) {
  var resultEtag = result.headers['etag'] || result.headers['ETag']
  // 如果没有etag，就使用etag库生成
  if (!resultEtag) {
    resultEtag = etag(result.buffer)
    result.headers['ETag'] = resultEtag
  }
  // 插件还会判断是否有设置if-none-match
  var ifnonematch = req.headers['if-none-match']
  if (ifnonematch && ifnonematch === resultEtag) {
    result.status = 304
    result.buffer = new Buffer([])
  }
}
```
