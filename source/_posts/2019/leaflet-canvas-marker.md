---
title: Leaflet.Canvas-Marker-Layer 图层的诞生
date: 2019-11-18 16:49:18
tags: [GIS, Leaflet]
categories: WebGIS
---

之前写过一个基于 Leaflet 的标注点图层插件，[Leaflet.Canvas-Marker-Layer](https://github.com/zzcyrus/Leaflet.Canvas-Marker-Layer)，今天简单的说一下为什么需要用到它。在 Leaflet 中如果你需要渲染 marker，有两种方式：

- 一种是基于 dom 的[UI-Marker](https://leafletjs.com/reference-1.6.0.html#marker)
- 另一种是基于 canvas 的[CircleMarker](https://leafletjs.com/reference-1.6.0.html#circlemarker)。

可想而知：

- dom 提供了强大的自定义能力，我们可以通过 css 绘制出各种想要的效果，填充各种想要的数据内容，但问题在于 marker 过多就会导致页面特别的卡顿，当然官方也悉心的给出了许多[cluster 解决方案](https://leafletjs.com/plugins.html#clusteringdecluttering)，通过聚类或者碰撞检测，只展示一部分内容，根据缩放等级来调整展示内容的数量。
- canvas 则提供了非常高的渲染性能，但不足的是`CircleMarker`仅仅是在地图上绘制了一个矢量图形，比如圆，矩形等，灵活性比较差，通常是通过点击事件或 popup 来展示具体的内容。

# 起源

那么如果我想两者兼得呢？实际上 canvas 本身的功能是很强大的，可以绘制各种图案，甚至各种颜色的文字，所以我们要做的其实就是拓展官方`CircleMarker`的功能，让它自定义程度更高，有点类似于[DivIcon](https://leafletjs.com/reference-1.6.0.html#divicon)的概念。

在 github 上搜寻类似功能时候，我找到了[eJuke 的 Leaflet.Canvas-Markers](https://github.com/eJuke/Leaflet.Canvas-Markers)这个库，和我想要的功能基本类似，采用 canvas 来绘制大量的 maker，但是他只提供了图片类型的 marker，所以我们稍加改动就好。

# 源码说明

`ejuke`的库对于图层创建、事件处理已经比较完善，我们只要修改下`_drawMarker`方法就好：

```js
_drawMarker: function (marker, pointPos) {
    const self = this

    if (!this._imageLookup) this._imageLookup = {}
    if (!pointPos) {
      pointPos = self._map.latLngToContainerPoint(marker.getLatLng())
    }

    // 支持通过userDrawFunc返回layer（this）对象给用户
    // 通过layer._context就可以画出任何自定义的marker
    if (this.options.userDrawFunc && typeof (this.options.userDrawFunc) === 'function') {
      const size = marker.options.icon.options.iconSize
      this.options.userDrawFunc(this, marker, pointPos, size)
    } else {
      self._drawIcon(marker, pointPos)
    }
}
```

# 使用说明

```js
/** userDrawFunc提供的参数说明
 * @param layer      图层对象，layer._context即canvas的context
 * @param marker     当前marker上存储的信息
 * @param pointPos   当前marker的像素坐标
 * @param size       当前marker的大小
 */

// 你可以简单的画一个圆
var layer = L.canvasMarkerLayer({
  userDrawFunc: function (layer, marker, pointPos, size) {
    var ctx = layer._context;
    ctx.beginPath();
    ctx.arc(pointPos.x, pointPos.y, size[0] / 2, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(255,12,0,0.4)";
    ctx.fill();
    ctx.closePath();
  },
}).addTo(map);

// 你也可以画一个矩形里面再配上文字
const ciLayer = L.canvasMarkerLayer({
  userDrawFunc: function (layer, marker, pointPos, size) {
    const ctx = layer._context;
    const number = marker.properties.number;
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,0,0,0.8)";
    ctx.fillRect(
      pointPos.x - size[0] / 2,
      pointPos.y - size[1] / 2,
      size[0],
      size[1]
    );
    ctx.font = "12px Helvetica Neue";
    ctx.fillStyle = "#000";
    ctx.fillText(number, pointPos.x, pointPos.y + size[1] / 4);
    ctx.textAlign = "center";
    ctx.closePath();
  },
}).addTo(map);
```

[demo](https://kael.top/Leaflet.Canvas-Marker-Layer/example/text.html)

通过这样在 canvas 上绘制大量 marker 的效果就大大改善了。

[仓库](https://github.com/zzcyrus/Leaflet.Canvas-Marker-Layer)
