---
title: Leaflet多种基础图层加载
date: 2017-09-17 13:46:08
tags: [FE, GIS, Leaflet]
categories: WebGIS
---

最近项目中有移动端的开发需求，自然就用到了最轻量级的 gis 组件——Leaflet，100 多 k 的体积，五脏俱全，丰富的第三方插件，虽然开发者数量上不及大哥级产品 Arcigs，但也基本够用，对于 esri 的自家系统支持好，svg 和 canvas 两种渲染方式，让数据量大的要素图层渲染也不是那么吃力。

这里把自己对于 Leaflet 的一些探索研究记录一下，一方面便于自己后期回顾，另一方面也希望和大家一起探讨学习。

<!-- more -->

[Leaflet 系列地址](https://github.com/zzcyrus/Leaflet-demos)
[本文 demo 地址](https://github.com/zzcyrus/Leaflet-demos/blob/master/0.basemap/basemap.html)

# 基础图层的加载

基础图层的加载都是通过`L.tileLayer`的方式，所以加载的难点不在于 api 的使用，是一些常用的基础瓦片的收集，这里给出一些常用的地址

```js
mapRadios: [
  {
    label: "高德地图",
    value: "1",
    url:
      "http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
  },
  {
    label: "Esri地图",
    value: "2",
    url:
      "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}",
  },
  {
    label: "天地图道路",
    value: "3",
    url: "http://t0.tianditu.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}",
  },
  {
    label: "天地图标注",
    value: "4",
    url: "http://t5.tianditu.cn/DataServer?T=cva_w&X={x}&Y={y}&L={z}",
  },
  {
    label: "天地图影像",
    value: "5",
    url:
      "http://t1.tianditu.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles",
  },
  {
    label: "谷歌地形",
    value: "6",
    url:
      "http://mt3.google.cn/vt/lyrs=t@131&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Ga",
  },
  {
    label: "谷歌影像",
    value: "7",
    url: "http://mt3.google.cn/vt/lyrs=s&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}",
  },
  {
    label: "谷歌标注",
    value: "8",
    url:
      "http://mt2.google.cn/vt/lyrs=m@167000000&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}",
  },
];
```

更多的瓦片地址可以在 demo 中找到，具体的使用效果也可以移步[demo](https://github.com/zzcyrus/Leaflet-demos/blob/master/0.basemap/basemap.html)
