---
title: Leaflet常用的一些插件
date: 2017-09-17 13:48:15
tags: [FE, GIS, Leaflet]
categories: WebGIS
---

Leaflet 中常用的 gis 功能可以满足一般使用，有些特殊需求，官方也有[插件系统](http://leafletjs.com/plugins.html)，本文会挑选一些常用的，经过测试可用的插件单独放出来使用方法和一些注意事项，希望能够帮助到同僚们。

<!-- more -->

[Leaflet 系列地址](https://github.com/zzcyrus/Leaflet-demos)
[本文 demo 地址](https://github.com/zzcyrus/Leaflet-demos/blob/master/1.plugins/plugins.html)

# ImageWMS

&nbsp;&nbsp;在 openlayers 中，wms 图层的调用了提供了 IamgeWMS 和 tileWMS 两种方式，通常情况下，如果 wms 服务作为底图，由于数据量大，我们采用瓦片的方式加载十分有利，如果数据量小，我们采用单张 image 的方式无论从请求发送上和显示的效果上都更好。
![](tileWMS.png)
&nbsp;&nbsp;~~可以发现，瓦片会发出多次请求，每次请求都会包含该瓦片上涉及到的信息，数据量小十分没必要~~

&nbsp;&nbsp;Leaflet 中只提供了 tile 瓦片的方式加载 WMS 图层，在使用了很多第三方解决方案后，我发现了这款插件[nonTiledLayer](https://github.com/ptv-logistics/Leaflet.NonTiledLayer)，使用之后的效果基本上可以达到 openlaysers 中的要求，更多情况可以点击链接进去了解。

调用方式

```js
var layer = L.nonTiledLayer
  .wms(url, {
    maxZoom: 19,
    minZoom: 0,
    opacity: 1.0,
    layers: "xmap-gravelpit-fg",
    format: "image/png",
    transparent: true,
    attribution: "",
    pane: "tilePane",
    zIndex: 3,
  })
  .addTo(map);
```

[nonTiledLayer](https://github.com/ptv-logistics/Leaflet.NonTiledLayer)调用方式基本沿用 Leaflet 自身的 wms 调用，提供的属性也很全面

```
    attribution - 图层数据来源.Default:'
    opacity - 透明度.Default: 1
    minZoom - 最小缩放. Default: 0
    maxZoom - 最大缩放. Default: 18
    bounds - 边界条件. Default: L.latLngBounds([-180, -85.05], [180, 85.05])
    zIndex - 位置. Default: undefined
    pane - 插入的div的名称. Default: 'overlayPane'
    pointerEvents - 鼠标事件的样式. Default: null
    errorImageUrl - 默认错误图层. Default: 1px transparent gif data:image/gif;base64,R0lGODlhAQABAHAAACH5BAUAAAAALAAAAAABAAEAAAICRAEAOw==
    useCanvas - 渲染方式. Default: undefined
```

具体的使用效果可以移步 demo

# WKT 数据插件

&nbsp;&nbsp;wkt 作为 GIS 常用的一种地理数据格式，因为通用性需求度也很高,Leaflet 官方插件中提供了许多支持 wkt 的第三方解决方案，使用下来，发现 mapbox 出品的[leaflet-omnivore](https://github.com/mapbox/leaflet-omnivore)效果可以说是目前最满足要求的了。

`omnivore`支持的功能比较强大

```js
omnivore.csv("a.csv").addTo(map);
omnivore.gpx("a.gpx").addTo(map);
omnivore.kml("a.kml").addTo(map);
omnivore.wkt("a.wkt").addTo(map);
omnivore.topojson("a.topojson").addTo(map);
omnivore.geojson("a.geojson").addTo(map);
omnivore.polyline("a.txt").addTo(map);
```

其中对于 wkt 的加载有两种方式。
其中，`customlayer`是通过`L.geojson`图层来为加载进来的 wkt 数据设置样式

```js
let customLayer = L.geoJson(null, {
  style: function () {
    return { color: "#0ff" };
  },
});
```

- `omnivore.wkt(url, parser_options?, customLayer?)`: 通过 url 加载

- `omnivore.wkt.parse(wktString，parser_options?, customLayer?)`: 通过转换 wkt 字符串加载

具体的使用效果可以移步[demo](https://github.com/zzcyrus/Leaflet-demos/blob/master/1.plugins/plugins.html)
