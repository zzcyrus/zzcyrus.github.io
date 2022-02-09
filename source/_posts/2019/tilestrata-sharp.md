---
title: tilestrata-sharp 插件使用及浅析
date: 2019-07-14 20:54:55
tags: [GIS]
categories: TileStrata
---

[tilestrata-sharp](https://github.com/naturalatlas/tilestrata-sharp)插件通过使用[libvips](https://github.com/jcupitt/libvips)的[sharp](https://github.com/lovell/sharp)库来转换处理图片。对于图片处理的一些方法参数都可以从 sharp 的[官方文档](https://sharp.pixelplumbing.com/en/stable/)中来找寻，这个插件相当于起到了一个搭桥铺路的作用，核心依然是 sharp。

<!--more-->

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

# 1. 安装

```sh
$ npm install sharp --save
$ npm install tilestrata-sharp --save
```

# 2. 使用

插件官网中对于使用的说明非常简单，因为插件本身不包含处理图片的逻辑，所以更多的使用方法得去[sharp](https://sharp.pixelplumbing.com/en/stable/)中找寻

```js
const tilestrata = require('tilestrata')
const mapnik = require('tilestrata-mapnik')
const sharp = require('tilestrata-sharp')
const server = tilestrata()

server
  .layer('world_merc_sharp')
  .route('tile.png')
  .use(
    // 定义数据源
    mapnik({
      pathname: 'style/world.xml'
    })
  )
  .use(
    sharp(function(image, sharp) {
      return image
        .resize(256) // 重新设置大小
        .rotate(180) // 旋转
        .greyscale() // 灰度处理
    })
  )

// 启动服务
server.listen(9527)
```

# 3. 效果

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

下图是原始的瓦片样式：

![](http://blog-img-1255388623.cossh.myqcloud.com/tilestrata-sharp-original-20190705114413.png)

在使用了 sharp 插件进行了旋转 180°，灰度处理之后，如下所示：

![](http://blog-img-1255388623.cossh.myqcloud.com/tilestrata-sharp-result-20190705113728.png)

# 4. 代码浅析

这个插件比较简单，属于`transform`类型，返回 buffer 给 tilestrata 之前会根据用户设置的回调函数里面的处理规则，调用`sharp`处理成新的 buffer，然后再返回。

```js
transform: function(server, req, buffer, headers, callback) {
    var image;

    try {
        // 用原buffer生成sharp对象
        image = sharp(buffer);
        // 执行回调里面的处理规则
        fn(image, sharp);
    }
    catch (err) { return callback(err); }

    // 转化回buffer
    image.toBuffer(function(err, buffer, info) {
        if (err) return callback(err);
        headers['Content-Type'] = 'image/' + info.format;
        // 还给tilestrata
        callback(null, buffer, headers);
    });
}
```
