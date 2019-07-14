---
title: tilestrata-gm 插件使用及浅析
date: 2019-07-14 20:54:50
tags: [GIS]
categories: TileStrata
---

[tilestrata-gm](https://github.com/naturalatlas/tilestrata-gm)插件和 tilestrata-sharp 功能上类似，背后使用的依赖[graphicsmagick](http://www.graphicsmagick.org/)的[gm](http://aheckmann.github.io/gm/docs.html)库来做图像处理，所以具体能够实现的哪些功可以去 gm 的文档中查询。

<!--more-->

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

# 安装

由于插件依赖于[graphicsmagick](http://www.graphicsmagick.org/)，需要根据[安装指南](http://www.graphicsmagick.org/README.html)在各个平台下进行安装，MacOS 可以直接用 brew 安装

```sh
$ brew install graphicsmagick
# 再安装插件
$ npm install tilestrata-gm --save
```

# 使用

```js
const tilestrata = require('tilestrata')
const mapnik = require('tilestrata-mapnik')
const gm = require('tilestrata-gm')
const server = tilestrata()

server
  .layer('world_merc_gm')
  .route('tile.png')
  .use(
    // 定义数据源
    mapnik({
      pathname: 'style/world.xml'
    })
  )
  .use(
    gm(function(image) {
      return image
        .blur(7, 3) // 模糊处理
        .rotate('green', 45) // 旋转，配色
    })
  )

// 可以同时能处理的任务的个数
gm.setMaxConcurrency(2)

// 启动服务
server.listen(9527)
```

# 效果

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

下图是原始的瓦片样式：

![](http://blog-img-1255388623.cossh.myqcloud.com/tilestrata-sharp-original-20190705114413.png)

使用 gm 插件进行了模糊处理，旋转了 45°，背景填充为绿色后的结果：

![](http://blog-img-1255388623.cossh.myqcloud.com/tilestrata-gm-result-20190705135250.png)

# 代码浅析

插件的整体逻辑和 tilestrata-sharp 基本一致，在`toBuffer`阶段有所不同，gm 选择了在`async.queue`队列中逐步转化成 buffer 再返回给 tiletrata，这也是为什么会有`setMaxConcurrency`这个方法的原因。

```js
// 代码有所精简
// toBuffer队列
var gmQueue = async.queue(function(image, callback) {
	image.toBuffer(function(err, buffer) {
		callback(err, buffer);
	});
}, concurrency);

transform: function(server, req, buffer, headers, callback) {
    var image;

    try {
        // 创建gm对象
        image = gm(buffer);
        // 执行回调函数里面的处理规则
        fn(image);
    }
    catch (err) { return callback(err); }

    // 放入async.queue中，逐步执行
    gmQueue.push(image, function(err, buffer) {
        if (err) return callback(err);
        if (image._outputFormat) {
            headers['Content-Type'] = 'image/' + image._outputFormat;
        }
        callback(null, buffer, headers);
    });
}
```
