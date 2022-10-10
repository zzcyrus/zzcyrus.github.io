---
title: 在web中渲染格点数据探讨（1）
date: 2020-05-17 16:18:51
tags: [GIS, Leaflet]
categories: WebGIS
---

在地理信息行业中，我们常遇见的数据中有这么两类：

- 一类是站点（散点）数据。地图上分布着位置不均匀的各种站点，比方说气象站，水文站，如果我们需要查看站点数值趋势，就可以通过等值线图等方式，比如[d3 的 contour](https://github.com/d3/d3-contour)，[turf 的 isolines](https://turfjs.org/docs/#isolines)，还可以通过插值方法将站点插值到网格上，转化成格点数据，后面我们也会讨论。
- 也有一类是格点数据。这个在气象上就非常常见，气象预报数据通常是模式跑出来的，如同渔网一样的格点，这种数据提供了查询任意位置数值的作用，它的渲染也同样常见，传统的方法是在服务器端生成好对应图片，在浏览器上贴图，这里追求实现的是`前端渲染`。

<!-- more -->

太长不看可以直接[项目仓库](https://github.com/zzcyrus/Leaflet.Tile.PixelLayer)

# 背景

格点数据的特点往往是数据量大，蕴含的信息量大，不仅包含着某个点的数值，同时还有这个点的经纬度，时间维度信息，空间高度信息，所以我们通常会听见学气象的同学说某个数据有四个维度。随着计算机的发展，图形学的发展，想要全部展示这些时空数据变得越来越可能，我会在这个系列中逐步的提出一些我的探索，希望能给大家带来帮助。

格点数据有很多格式，我们可能常接触到的一些格点数据文件比方说[GeoTIFF](https://en.wikipedia.org/wiki/GeoTIFF)，气象里面有[GRIB](https://en.wikipedia.org/wiki/GRIB)，nc 等等，甚至一张简单的 png 也可以是由格点数据转换成的，它会包含基本的**格点数量和值**，比方说在经度方向有 300 个点，纬度方向有 200 个点，那么整个文件包含了 6w 个格点的数值，还通常包含一些**经纬度信息**，比方说每个点的经纬度值，也有可能只是四个顶点的经纬度信息，所以 raster（栅格）图层也在我的讨论范围之内。

# 思路

我会以 Leaflet 为主要的实现手段，个人觉得它的灵活性比较强，功能虽然基础，但是利于拓展，所以各类图层插件也层出不穷。
假设我想要在地图上渲染一组格点数据，数据长 300，宽 200，一共 60000 个点，从原理上分析无非就是把一个个的点钉在了地图上，我们可以清楚的**读取或者推算**出每个点的经纬度，要解决的就是点与点之间的空白怎么办，毕竟每个点从经纬度上来看即使只差了 1 度，算上比例尺，在地图上也是不等的像素点，所以我们需要通过**插值计算**来补齐点与点之间的空白。于是我就有了大致如下的想法：

> 准备基础数据和图例等信息 => 准备 canvas 图层 => 找到初始点 => 根据数值和图例找到对应颜色 => 渲染颜色 => 循环直至画完所有的点

# 开发

按照上面的思路一步步开始，我已经准备好了一个[温度相关的数据](https://github.com/zzcyrus/Leaflet.Tile.PixelLayer/blob/master/demo/data.json)和图例信息，后面也会再讨论数据的生成和优化，所以直接从第二步开始，这里只说大致的流程，具体的算法可以去看[源代码](https://github.com/zzcyrus/Leaflet.Tile.PixelLayer/blob/master/src/index.js)

> 创建 TilePixelLayer 图层并继承基础的`TileLayer`，需要重写`createTile`方法，每一个 tile 最终都返回一个我们自己绘制出来的 canvas

```js

L.TilePixelLayer = L.TileLayer.extend({
    createTile: function(coords) {
      var dom = L.DomUtil.create('canvas', 'leafvar-pixel-tile')
      var ctx = dom.getContext('2d')
      //  bounds为当前tile的一些边界信息，绘制时候要用到
      this.interpolateTile(ctx,  'bounds')
      return dom
    }
}
```

> 我们在每一个 tile 对应的 canvas 中，从 0 点开始，分别循环 256 像素的行和列，然后通过插值得到像素对应的数值，再找到数值对应的颜色，直至完成整个 canvas 的上色过程。

```js
interpolateTile: function(ctx, bounds) {  // 逐像素绘制每一个tile
  var x = bounds.x                 // x坐标为当前瓦片在地图上的初始像素x
  var tileX = 0                       // tileX为当前瓦片canvas的坐标，在0~256之间循环
  var gap = 4                        // 每隔四个点计算一次加快渲染速度，这个数值可以自己设置
  var colorImageData = new ImageData(256, 256)  // 创建一个imageData接收颜色

  // 循环行
  var batchInterpolate = () => {
    while (tileX < bounds.w) {
      interpolateColumn(x, tileX)
      x += gap
      tileX += gap
    }
    ctx.putImageData(colorImageData, 0, 0)
  }

  // 循环列
  var interpolateColumn = (x, tileX) => {
   for (                                   // y坐标为当前瓦片在地图上的初始像素y
      var defaultColor = [0, 0, 0, 1], y = bounds.y, height = 0;
      height <= bounds.h;
      y += gap, height += gap
    ) {
      // 把循环到的某个点的像素坐标转化为经纬度
      var location = this.map.unproject(L.point(x, y), zoom)
      var coord = [location.lng, location.lat]

      // 找到经纬度对应的周围四个点的坐标，通过双线性插值算出一个近似值作为当前像素点的数值
      var gridValue = this.gridInterpolate(coord)

      // 用简单的线性插值通过图例得到数值对应的颜色
      var color = this.gradient(gridValue)

      // 因为设置了gap，gap范围内的每一个像素点都用这个颜色，如果gap设置为1，那么每个像素都独立参与了计算，性能有所慢，但是精度高
      for (var i = 0; i < gap; i++) {
        for (var j = 0; j < gap; j++) {
          this.setColor(colorImageData, i, j, color)  // 上色
        }
      }
    }
  }

  // 开始绘制
  batchInterpolate()
}
```

> 总结一下，每一个瓦片都对应了一个 canvas，每个 canvas 我们都逐像素处理，先把像素转化为经纬度，通过插值得到一个比较精确的对应格点数值，再通过图例进行了上色。最终就把所有的格点数据都渲染了出来。

# 使用

完整的代码可以在[github](https://github.com/zzcyrus/Leaflet.Tile.PixelLayer)上看到。`dist`目录下有编译好的 js 文件，在项目中引入就好。

```js
var tilePixelLayer = L.tilePixelLayer({
  data: data,
  overlayAlpha: 230, // 透明度
  gradient: [
    [233.15, [56, 4, 45]],
    [243.15, [48, 0, 106]],
    [253.15, [0, 14, 134]],
    [256.15, [3, 44, 144]],
    // ......
  ], // 准备一组图例
  clickEvt: function (e, gridValue) {
    alert(`该地点温度:${Math.round(gridValue - 273.15)}°`);
  }, // 事件
});
map.addLayer(tilePixelLayer); // 添加到地图上
```

效果：

 <iframe  
 height=400 
 width=100% 
 src="https://kaely.net/Leaflet.Tile.PixelLayer/demo/"  
 frameborder=0  
 allowfullscreen>
 </iframe>

[在线 demo](https://kaely.net/Leaflet.Tile.PixelLayer/demo/)

# 后续

这样我们已经初步在浏览器上完成了一个前端完全可控的格点数据渲染，当然对整个过程是否有更好的优化方法，我们后面会继续展开讨论。
