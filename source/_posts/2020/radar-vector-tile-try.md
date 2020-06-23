---
title: 试着还原下墨迹mapbox合作的雷达图展示
date: 2020-06-23 14:58:12
tags: [GIS]
categories: WebGIS
---

在[四步走，墨迹天气雷达数据可视化指南](https://juejin.im/post/5d4e8572e51d453c12504dd4)这篇文章中，提到了用**矢量瓦片**代替传统传统栅格图像可视化方案，可以达到更流程的性能，更高清的数据展示，更灵活的样式表达。感觉挺有意思，同时也为了考察这么做的成本，就试着还原做了下。

从文章来看整个过程总结起来就是准备数据`geojson`，切成`pbf`或者`mbtiles`在 mapbox 中展示。

<!--more-->

# 背景

按惯例先解释下雷达数据。我之前通俗的把气象数据划分为了站点（散点）和格点两类，暂且不细说雷达数据到底属于哪类，但最终都可以通过比方说插值来得到一份格点数据。传统的`栅格图像`可视化方案是基于格点数据利用[matplotlib.pyplot.contourf](https://matplotlib.org/3.2.1/api/_as_gen/matplotlib.pyplot.contourf.html)这类工具，依据一定标准的图例，生成出来的一张等值面图，考虑到网络的传输，这种图片得体积小，分辨率就会下降，所以在缩放时候会失真，出现马赛克，矢量瓦片的出现就可以很自然的解决这个问题。

我会用降水格点数据来代替雷达数据进行了测试，二者数据格式内容上来说都相差不大，且都能用来反映未来降水的趋势。

# 开发

选用了 10 个时次的降水格点数据，格点大小为`511*581`，经度范围为`113.2, 119.4`，纬度范围为`37.4, 42.7`。

## 生成 geojson

这一步其实有很多选择，文章里面也提到了一些，我都做了一些尝试，列一下尝试结果：

- [d3-contour](https://github.com/d3/d3-contour)

```js
const contour = require("d3-contour").contours;

const levels = [
  0.0,
  0.0001,
  0.5,
  1.0,
  2.0,
  3.0,
  5.0,
  7.0,
  10.0,
  13.0,
  16.0,
  20.0,
  25.0,
  40.0,
  9999.0,
];
const lonRange = [113.2, 119.4];
const latRange = [37.4, 42.7];

// 生成等值面，data为格点数据数组
const contours = contour().size([511, 581]).thresholds(levels)(data);

const geojson = [];
// d3用的是平面坐标，需要转换成经纬度
for (let i = 0; i < contours.length; i++) {
  const item = contours[i];
  const { coordinates } = item;
  if (coordinates.length === 0) {
    continue;
  }
  const coords = coordinates.map((item) => {
    return item.map((ele) => {
      return ele.map((e) => {
        const [x, y] = e;
        return [
          lonRange[0] + ((511 - x) * (lonRange[1] - lonRange[0])) / 511,
          latRange[0] + ((581 - y) * (latRange[1] - latRange[0])) / 581,
        ];
      });
    });
  });
  geojson.push({
    type: "Feature",
    geometry: {
      type: item.type,
      coordinates: coords,
    },
    properties: {
      value: item.value,
    },
  });
}

// 最终结果
const isoFc = {
  type: "FeatureCollection",
  features: geojson,
};
```

- [turf-isobands](http://turfjs.org/docs/#isobands)

```js
const point = require("@turf/helpers").point;
const featureCollection = require("@turf/helpers").featureCollection;
const isobands = require("@turf/isobands");

const levels = [
  0.0,
  0.0001,
  0.5,
  1.0,
  2.0,
  3.0,
  5.0,
  7.0,
  10.0,
  13.0,
  16.0,
  20.0,
  25.0,
  40.0,
  9999.0,
];
const lonRange = [113.2, 119.4];
const latRange = [37.4, 42.7];

// 把格点数据数组转换成feature类型为point的数组
const pointArray = [];
for (let j = 0; j < 581; j++) {
  for (let i = 0; i < 511; i++) {
    const lon = lonRange[0] + ((511 - i) * (lonRange[1] - lonRange[0])) / 511;
    const lat = latRange[0] + ((581 - j) * (latRange[1] - latRange[0])) / 581;
    // data 是格点数据数组
    const value = data[j * 511 + i];
    pointArray.push(point([lon, lat], { value }));
  }
}
const gridFc = featureCollection(pointArray);

// 生成等值面
const isoFc = isobands(gridFc, levels, {
  zProperty: "value",
});

// isoFc 就是生成的geojson内容，保存成文件即可
```

上面两种方式生成的结果，偶尔会出现的不同级别等值面重叠的情况，这样在前端渲染的时候，由于颜色通道的叠加，会导致重叠部分数据渲染错误的情况，不知道是我使用时候生成方法的弄错还是渲染方法弄错了，效果不太满意。

- **[geojsoncounter（建议）](https://github.com/bartromgens/geojsoncontour)**

```python
import matplotlib.pyplot as plt
import numpy as np
import geojsoncontour

levels = [0.0, 0.0001, 0.5, 1.0, 2.0, 3.0, 5.0, 7.0, 10.0, 13.0, 16.0, 20.0, 25.0, 40.0, 9999.0]
size = [511, 581]
lon_range = [113.2, 119.4]
lat_range = [37.4, 42.7]

lons = np.linspace(lon_range[0], lon_range[1], size[0])
lats = np.linspace(lat_range[0], lat_range[1], size[1])

# pre为格点数据数组
data = np.array(pre)
# 生成等直面图
contour = plt.contourf(lons, lats, data, levels=levels)
geojson_filepath = 'output/'
# 转换成geojson
geojsoncontour.contourf_to_geojson(contourf=contour, ndigits=20,geojson_filepath=geojson_filepath)
```

实践下来感觉这个方法生成的 geojson 效果会更好，我个人比较推荐使用。原理上就是先生成了传统等值面图片，把像素结果转换成了 geojson 数据。

## 合并 geojson（可选）

这一步很有趣，如果把每个时刻的降水数据做成单独的 geojson，在根据时序进行播放的时候就需要每次移除、加载图层，会有卡顿的效果，而看文章里面墨迹使用了 mapbox 的`setFilter`功能，所以猜测是对 geojson 进行了合并。

在 QGIS 中打开了已经生成的 10 个 geojson 进行了合并，可以在属性表里面看到，每个图层的顺序是通过`layer`字段进行区分的，后面会用上。

![](http://blog-img-1255388623.cossh.myqcloud.com/merge-geojson-20200622155323.png)

## 生成矢量瓦片

使用[mapbox/tippecanoe](https://github.com/mapbox/tippecanoe)这个官方工具就好了。如果在上面选择了合并 geojson，那么只需要对合并后的单个文件切瓦片就好了，不然就是对每个时刻的数据单独执行以下切瓦片的命令。

```bash
tippecanoe -e /Downloads/pbf --no-tile-compression -zg --drop-densest-as-needed -l pre merge.geojson
```

> -e 是生成目录
> --no-tile-compression 是不对生成的 pbf 进行压缩，否则加载时候会报错
> -zg --drop-densest-as-needed 是自动去判断瓦片的最大最小级别
> -l 是手动指定图层名字

## 展示

- 在 leaflet 加载使用插件[Leaflet.VectorGrid](https://github.com/Leaflet/Leaflet.VectorGrid)就好

```js
const map = L.map("map", {
  center: [40.03193433735177, 118.03342979913123],
  zoom: 6,
});

const vectorTileOptions = {
  rendererFactory: L.canvas.tile,
  // 设置生成的pbf的最大zoom
  maxNativeZoom: 7,
  vectorTileLayerStyles: {
    // pre 是 -l 参数的图层名称
    pre: function (properties, zoom) {
      // 找到属性中对应降水量的属性设置图例
      const level = parseFloat(properties.title).toString();
      let color = "rgba(0, 0, 0, 0)";
      switch (level) {
        case "0.0001":
          color = "rgba(153,255,153,255)";
          break;
        case "0.5":
          color = "rgba(51,204,102,255)";
          break;
        case "1":
          color = "rgba(51,153,0,255)";
          break;
        // ......
      }
      return {
        weight: 1,
        color: color,
        opacity: 1,
        fillColor: color,
        fill: true,
        fillOpacity: 0.7,
      };
    },
  },
};

new L.vectorGrid.protobuf(
  `http://localhost:8080/assets/pbf/{z}/{x}/{y}.pbf`,
  vectorTileOptions
).addTo(map);
```

- 在 mapbox 中加载直接定义一个自定义 source，并加载

```js
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v10",
  zoom: 6,
  center: [118.03342979913123, 40.03193433735177],
  antialias: true,
});

map.on("load", function () {
  map.addSource("radar-pbf", {
    type: "vector",
    tiles: [`http://localhost:8080/assets/collection/{z}/{x}/{y}.pbf`],
    maxzoom: 7, // 设置生成的pbf的最大zoom
  });

  pbfMap.addLayer({
    id: "radar-pbf",
    type: "fill",
    source: "radar-pbf",
    filter: ["==", "layer", "1"], // 合并的话可以使用过滤
    "source-layer": "pre", // pre 是 -l 参数的图层名称
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-opacity": 0.7,
      "fill-color": [
        "match",
        ["get", "title"],
        ["0.000100 "],
        "rgba(153,255,153,255)",
        ["0.500000 "],
        "rgba(51,204,102,255)",
        ["1.000000 "],
        "rgba(51,153,0,255)",
        // ......
        "rgba(0, 0, 0, 0)", // 默认color
      ],
    },
  });
});
```

# 待优化

其实还有个工作没有尝试就是原文里面说的，对两个相邻间隔时间的数据做插值处理，以追求更加平滑的播放效果。个人感觉这个处理对于面向大众的场景比较实用，但在专业方面，有待使用更科学的方法进行处理。
