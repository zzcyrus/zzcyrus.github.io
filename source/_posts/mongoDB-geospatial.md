---
title: mongoDB中地理空间查询指北
date: 2019-01-20 17:41:24
tags: [GIS]
categories: Node
---


现在地理空间查询是越来越常见的一种需求，实现的方式也有很多种，相较于PostGIS，mongoDB既可以直接存储GeoJSON对象，又支持地理空间索引，可以满足高效的常见地理空间服务。

<!-- more -->


[一个可供参考的案例仓库](https://github.com/zzcyrus/mongoDB-geospatial-demos)


## 索引方式介绍

### 2d 索引

[官方介绍](https://docs.mongodb.com/manual/core/2d/)

2d index 通常用在2维平面上的点数据，如果你的MongoDB 版本小于2.2或者你不使用一些GeoJSON类型的数据，官方推荐你使用2d index。

### 2dsphere 索引

[官方介绍](https://docs.mongodb.com/manual/core/2dsphere/)

2dsphere index 支持所有的mongoDB空间查询，支持类地球的球面上几何要素的查询，支持数据存储为GeoJSON或者是传统坐标。


*所以如果你正在做一个现代化的GIS应用，建议直接采取2dsphere索引，这将会非常方便，GeoJSON格式的直接导入，配合WebGIS的直接查询或插入*


## 查询方法介绍

[官方介绍](https://docs.mongodb.com/manual/reference/operator/query-geospatial/)


下面这个表格包含了一些个人的总结和官方的说明，具体查询的作用其实通过查询方法的名字就能猜测出来，所以不详细介绍了


|查询方式|2d索引|sphere索引|几何类型（2d/sphere）|
| --- | :-: | :-: | :-: | --- |
|$near| ✅ | ✅ | 平面/球面 |
|$nearSphere | ✅ | ✅ | 球面 |
|$geoWithin:{$center:...}| ✅ | ⚠️ | 平面 |
|$geoWithin:{$centerSphere:...} | ✅ | ✅ | 球面 |
|$geoWithin:{$box:...}| ✅ | ⚠️ | 平面 |
|$geoWithin:{$polygon:...}| ✅ | ⚠️ | 平面 |
|$geoWithin:{$geometry:...}| ❎ | ✅ | 球面 |
|$geoIntersects | ❎ | ✅ | 球面 |

> 说明： ✅ 支持 ❎ 不支持 ⚠️ 官方文档说不支持，但测试发现可以使用


## 使用注意事项

1. 在2dsphere索引中使用$geometry去查询，如果自己构造$geometry，要注意geometry的coordinates必须是一个`闭合`的数组，首尾两项要一致。
2. 与此同时，在使用$polygon去查询时，`不必`是一个闭合的坐标数组列，mongoDB会自动帮我们关闭这个图形
3. 在使用$near或者$geoWithin之类的查询中会涉及到距离、半径定义，这里如果你使用经纬度作为坐标，使用m（米）作为距离、半径单位，那么要进行`转换`，具体的转换规则可以参考下面两段代码示例：


```js
/**
 * 1度大致对应111千米，所以需要/111000,具体可以细化
 * @param {*} meter 米
 */
const m2degree = (meter) => {
  return meter / 111000
}

const query = {
  location: {
    $geoWithin: {
      $center: [[lon, lat], m2degree(radius)]
    }
  }
}
```

```js
/**
 * 米转换成弧度，需要除以地球半径，大约6378100米
 * @param {*} meter
 */
const m2rad = (meter) => {
  return meter / 6378100
}

const query = {
  location: {
    $nearSphere: [lon, lat],
    $maxDistance: m2rad(maxDistance)
  }
}

```

## demo

这里提供[一个可供参考的简单的案例仓库](https://github.com/zzcyrus/mongoDB-geospatial-demos)
案例中使用了中国天气网上的749个气象站点温度数据作为数据源，分别建立两种类型的索引，对每种地理查询都做了接口化，你可以**自行运行探索**，或者为其增加一个WebGIS的界面，直接进行操作，体验一下mongoDB地理查询的快捷。
