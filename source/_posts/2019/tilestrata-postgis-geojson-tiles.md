---
title: tilestrata-postgis-geojson-tiles 插件使用及浅析
date: 2019-07-02 21:42:51
tags: [GIS]
categories: TileStrata
---

[tilestrata-postgis-geojson-tiles](https://github.com/naturalatlas/tilestrata-postgis-geojson-tiles)插件以 PostGIS 为数据源，生成 GeoJSON 格式的矢量瓦片。轻量但功能强大，配置项丰富，效果拔群。

<!--more-->

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

# 1. 安装

```sh
$ npm install tilestrata-postgis-geojson-tiles --save
```

# 2. 使用

插件的配置比较复杂：

- `geometryField` _( string, 必选)_ : 数据表中存储地理数据的列名。 (默认 = `"geom"`)
- `sql` _( function, 必选)_ : 一个返回 PostGIS 查询语句的函数。 _注意防治 sql 注入。_ 查询语句包含以下内容:
  - `{bbox}` (box2d): 缓冲区的 bbox 范围
  - `{geojson}` (text): 被裁剪出来的地理信息数据
- `pgConfig` _( object, 必选)_ : postgres 数据库配置：
  - `{host}` (string)
  - `{password}` (string)
  - `{user}` (string)
  - `{port}` (string)
  - `{database}` (string)
- `simplifyFactor` _( number, 可选 )_ : 地理数据简化程度的参数。 (默认 = `0.75`)
- `buffer` _( number, 可选)_ : 围绕每个切片的缓冲大小，以像素为单位 (默认 = `16`)
- `collectGeometry` _( boolean, 可选 )_ : 在转换成 GeoJson 之前是用 ST_Collect 把多个图形合并成一个简单图形。 (默认 = `false`)
- `mergeMultiLineStrings` _( boolean, 可选 )_ : 在转换成 GeoJson 之前是和否用 ST_LineMerge 合并 MultiLineStrings 数据。 (默认 = `false`)
- `dumpGeometry` _( boolean, 可选 )_ : 是否用 ST_Dump 来拆分图形 (默认 = `false`)

这里我使用了 demo 中的 world_merc.shp 数据导入了 PostGIS 中作为测试数据源

```js
const tilestrata = require('tilestrata')
const tilestrataPostGISGeoJSON = require('tilestrata-postgis-geojson-tiles')
const headers = require('tilestrata-headers')

const server = tilestrata()

server
  .layer('geojson-tiles')
  .route('tile.json')
  // 配置跨域
  .use(
    headers({
      'Access-Control-Allow-Origin': '*'
    })
  )
  // 定义数据源
  .use(
    tilestrataPostGISGeoJSON({
      geometryField: 'geom',
      sql: function(server, req) {
        return 'select name, {geojson} from world_merc WHERE ST_Intersects(geom, {bbox})'
      },
      pgConfig: {
        username: 'postgres',
        password: 'postgres',
        host: '10.211.55.4',
        port: '5432',
        database: 'shapefile'
      }
    })
  )

server.listen(9527)
```

# 3. 效果

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

`http://127.0.0.1:9527/world_merc/6/55/25/tile.png`对应的栅格瓦片的结果如下图所示

![](http://blog-img-1255388623.cossh.myqcloud.com/geojson-tile-png-20190701212419.png)

`http://127.0.0.1:9527/geojson-tiles/6/55/25/tile.json`请求对应的地址获取 GeoJSON 格式的矢量数据：

![](http://blog-img-1255388623.cossh.myqcloud.com/geojson-tile-json-20190701212838.png)

在[geojson.io](http://geojson.io)查看效果如下图所示：

![](http://blog-img-1255388623.cossh.myqcloud.com/geojson-tile-result-20190701212926.png)

GeoJSON 结果和渲染出来的 png 的图形基本是一致。

# 4. 代码浅析

从插件功能可以看出来属于`Providers`类型的插件，那么核心就是 serve 方法。首先插件会根据我们传入的数据库信息来建立 Postgres 对象，这个不需要展开讲。

当请求某个瓦片的时候，插件根据传入的 zxy 信息，调用了`@mapbox/sphericalmercator`库来把 zxy 坐标转换成 bbox 对象

```js
var sm = new SphericalMercator({ size: 256 })
var bbox = sm.bbox(tile.x, tile.y, tile.z)

var w = bbox[2] - bbox[0]
var h = bbox[3] - bbox[1]
var bufferX = (buffer * w) / 256
var bufferY = (buffer * h) / 256
bbox[0] -= bufferX
bbox[1] -= bufferY
bbox[2] += bufferX
bbox[3] += bufferY
```

在定义图层的时候会传入一个`sql`函数，里面包含了`{bbox}`和`{geojson}`两个预设的字段，在源代码中这两个字段将会分别被计算出来，合成一个 sql 在数据库中进行查询

```js
// 代码为了便于理解有所精简改动

// 利用上面计算的bbox来组装bboxsql
var bboxSQL =
  "ST_SetSRID('BOX(" +
  bbox[0] +
  ' ' +
  bbox[1] +
  ',' +
  bbox[2] +
  ' ' +
  bbox[3] +
  " )'::box2d, 4326)"

// 根据传入的geomField等字段组装geojsonSQL
var geojsonSQL =
  'ST_MakeValid(ST_SimplifyPreserveTopology(' +
  geomField +
  ', ' +
  simplifyTolerance +
  ')) ST_Intersection(' +
  geojsonSQL +
  ', {bbox}) ST_AsGeoJSON(' +
  geojsonSQL +
  ') AS geojson'

sql = sql.replace(/{geojson}/g, geojsonSQL).replace(/{bbox}/g, bboxSQL)

// 查询
pgPool.query(sql, callback)
```

最后把查询出来的结果封装在`FeatureCollection`中形成一个完整的 GeoJSON 返回给 tilestrata 就可以了。

```js
// 组装GeoJSON
var outputText =
  '{"type": "FeatureCollection", "features": [' +
  result.rows
    .map(function(row) {
      if (row.geojson) {
        var featureString = '{"type": "Feature", "geometry": ' + row.geojson
        delete row.geojson
        return featureString + ', "properties": ' + JSON.stringify(row) + '}'
      }
    })
    .join(',') +
  ']}'
// 返回结果
callback(null, outputText, { 'Content-Type': 'application/json' })
```
