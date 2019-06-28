---
title: tilestrata-postgismvt 插件使用及浅析
date: 2019-06-13 16:02:44
tags: [GIS]
categories: TileStrata
---

[tilestrata-postgismvt](https://github.com/Stezii/tilestrata-postgismvt)是一个用来从 PostGIS 数据库中检索出 mvt 格式矢量瓦片的插件。PostGIS 在 2.4.0 版本后支持了直接生成 mvt 数据，这让我们更方便的加工出矢量瓦片。

<!--more-->

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

# 1. 基本要求

PostGIS 需要在[2.4.0](https://postgis.net/2017/09/30/postgis-2.4.0/)版本及以上

# 2. 安装

```bash
## 不推荐
npm install tilestrata-postgismvt --save
```

在 ST_AsMVT 方法更新后 ，虽然作者更新了代码，但是 npm 包并不是最新的，建议用下面的方法安装最新版，或者直接去 Github 上下载

```bash
## 推荐
npm install --save https://github.com/Stezii/tilestrata-postgismvt
```

或者通过 package.json

```json
"tilestrata-postgismvt": "github:Stezii/tilestrata-postgismvt"
```

# 3. 使用

前提：一个导入了 osm 数据的支持 PostGIS 2.4.0 的数据服务器

执行 mapbox 的脚本[TileBBox.sql](https://github.com/mapbox/postgis-vt-util/blob/master/src/TileBBox.sql)添加`TileBBox`函数

## 3.1 普通模式

```js
var tilestrata = require("tilestrata");
var postgismvt = require("tilestrata-postgismvt");
var headers = require("tilestrata-headers");

server = tilestrata();

server
  .layer("osm_mvt")
  .route("tile.mvt")
  .use(
    headers({
      "Access-Control-Allow-Origin": "*"
    })
  )
  .use(
    postgismvt({
      lyr: {
        table: "import.osm_buildings", // 表名
        geometry: "geometry", // geometry在表中的字段名
        srid: 3857, // 坐标系
        minZoom: 3,
        maxZoom: 19,
        buffer: 10, // 裁剪geometry时的缓冲距离，PostGIS默认为256
        fields: "name", // 额外字段名
        resolution: 256 // 分辨率，可以是function
      },
      pgConfig: {
        // 通过`pgConfig`属性配置PostGIS相关属性
        host: "localhost",
        user: "gis",
        password: "gis",
        database: "gis",
        port: "6543"
      }
    })
  );

server.listen(8080);
```

## 3.2 点云数据

如果是点要素，可以使用 cluster 模式，只要定义`lry`中的`mode`属性为`cluster_fields、cluster或function`,注意的是需要同时定义`type`为`circle`

```js
server.layer('layer_name').route('tile.mvt')
  .use(postgismvt({
    lyr: {
      ...
      mode: 'cluster' // or 'cluster_fields'
    },
    pgConfig: {
      ...
    }}))
  );
```

`mode`和`resolution`都支持是一个函数。通过这种方式可以手动指定一些缩放级别，用来控制精度

```js
server.layer('layer_name').route('tile.mvt')
  .use(postgismvt({
    lyr: {
      resolution: function(server, req) {
        if (req.z > 12) return 512;
        return 256;
      },
      mode: function(server, req) {
        if (req.z > 15) return null;
        if (req.z > 13) return 'cluster_fields';
        return 'cluster';
      }
    },
    pgConfig: {
      ...
    }}))
  );
```

# 4. 效果

demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

![](http://blog-img-1255388623.cossh.myqcloud.com/tilestrata-postgismvt20190606111135.png)

# 5. 代码浅析

其实核心的方法就是用到了 PostGIS 的`ST_AsMVT`和`ST_AsMVTGeom`函数。mapbox 提供[TileBBox.sql](https://github.com/mapbox/postgis-vt-util/blob/master/src/TileBBox.sql)用来计算 zxy 位置的瓦片对应的 box 边界，再查询出其中的 geom，转换成 mvt 格式。

比如说 `z=14,x=12917,y=6430`的瓦片对应的 sql 如下：

```sql
SELECT ST_AsMVT(q, 'osm_mvt', 256, 'geom') AS mvt
FROM (
  SELECT ST_AsMVTGeom(
    ST_Transform(
	  import.osm_buildings.geometry, 3857),
	  TileBBox(14, 12917, 6430, 3857),
	  256,
	  10,
      true
	) geom ,name
    FROM import.osm_buildings
    WHERE ST_Intersects(TileBBox(14, 12917, 6430, 3857), import.osm_buildings.geometry)
) AS q
```

此外，`fields`是可以用逗号分割传递多个想要的字段名的。
