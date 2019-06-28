---
title: 矢量切片的使用尝试1—openlayers应用
date: 2017-11-12 10:54:57
tags: [GIS,OpenLayers]
categories: OpenLayers
---

&nbsp;&nbsp;对于GIS行业来说，栅格切片已经处于垄断地位很长时间了，但随着mapbox的发展，矢量切片越来越勾引起大家探究的欲望，最近我也小小的观望了下，发现现在技术还是比较成熟了，使用上却不是很广泛，遂分享下自己瞎折腾的一些路，想着帮助大家少踩点坑，本文将介绍下服务端和网页端中OpenLayers对于矢量切片的一些应用。

<!-- more -->

&nbsp;&nbsp;在项目实际使用中还是建议大家首先了解下矢量和栅格切片的优缺点，网上能搜到的很多，水平有限，这里不献丑了。对于我个人来说吸引我的无非三点：1.支持大数据；2.自定义渲染；3.要素交互。

&nbsp;&nbsp;不多说了进入主题吧，OpenLayers中支持`ol.source.VectorTile`,对于我们来说想使用它无非就是创造这一类型的`source`，目前来说想要自定义矢量切片源我探索的有以下几种方式：

# geoserver中的vectortiles-plugin插件

这种方式网上教程很多，是大家目前常用的，优点是支持的数据格式比较多，输出的数据格式也很多，geojson、topojson、mvt都能做到，不做过多介绍

# mapbox开发的geojson-vt库

这个库可能大家不去仔细关注都不会发现，mapbox推出，[geojson-vt](https://github.com/mapbox/geojson-vt)，作用很简单，官方说明简单明了，把geojson转换成mvt格式的矢量数据源。

翻译一下使用：

````js
// 通过geojson数据源构建切片索引
var tileIndex = geojsonvt(geoJSON);

// 通过z,x,y来在切片索引中请求某个具体瓦片
var features = tileIndex.getTile(z, x, y).features;
````

拿到features后无非就是做样式调整之类的工作了。OpenLayers官方也有一个demo，叫做[geojson-vt integration](https://openlayers.org/en/latest/examples/geojson-vt.html)，详细介绍了怎么在OpenLayers中结合使用该库。

我在实际使用中发现，这个库可以说很imba了，有测试200M以上的geojson源文件，都能流畅的展示出来。mapbox官方对于这个库的说明是，把geojson切割成矢量切片在**浏览器端**使用，所以我觉得因为**网络传输**的不确定性，对于**小一点**的数据量，可以考虑直接在浏览器端使用这个库。

# geojson-vt的nodejs服务端实现

(｡･∀･)ﾉﾞ嗨，既然是js，那就意味着，我们可以用nodejs搭建服务端呀，在浏览到某个层级时候，只请求当前需要的瓦片，不就能解决大数据的传输问题了，nodejs大法好！

具体的代码可以移步[github](https://github.com/zzcyrus/openlayers-demos/tree/master/1.vector_tile)

这里对一些主要部分做一些说明

````js
// 读取数据源文件，构建切片索引
const dataFile = "./data/world.json";
const dataSource = JSON.parse(fs.readFileSync(dataFile));
const tileIndex = geojsonvt(dataSource, {
    extent: 4096,
    debug: 1
});
````

````js
// 从url中解析瓦片请求位置的x，y，z
app.use(async (ctx, next) => {
    let path = ctx.request.path.toString()
    ctx.response.type = 'application/json';
    if (path.indexOf('.vector') !== -1) {
        const pathArr = path.substring(1, path.indexOf('.vector')).split('/')
        const z = pathArr[pathArr.length - 3]
        const x = pathArr[pathArr.length - 2]
        const y = pathArr[pathArr.length - 1]
        const data = tileIndex.getTile(Number(z), Number(x), Number(y));
        const features = JSON.stringify({
            type: 'FeatureCollection',
            features: data ? data.features : []
        }, replacer)  // replacer 是geojson格式转换函数
        ctx.response.body = features
        await next()
    } else {
        ctx.response.body = 'Error'
    }
});
````

接下来是浏览器中的调用

````js
var vectorSource = new ol.source.VectorTile({
        // 因为转换函数是geojson格式，所以这里format为geojson
        format: new ol.format.GeoJSON({
            // 要定义数据源的坐标系为瓦片像素
            defaultDataProjection: new ol.proj.Projection({
                code: 'TILE_PIXELS',
                units: 'tile-pixels'
            })
        }),
        // 调用时候要注意z，x，y 的位置，实际上是与服务端相对应的
        url: 'http://localhost:3000/gettile/{z}/{x}/{y}.vector',
    });
````

你可以在 [github](https://github.com/zzcyrus/openlayers-demos) 上看到demo，执行安装启动

````cl
cd ./1.vector_tile
npm install
npm start
````

打开vectortile.hmtl可以在network中看到瓦片请求了。

![](network.png)