---
title: 用PostGIS生成mvt格式的矢量瓦片
date: 2019-06-10 15:05:16
tags: [GIS]
categories: PostGIS
---

PostGIS 从 2.4.0 版本开始支持通过 box 生成 mvt 数据，我们用尽可能简单的方法搭建一个生产 mvt 数据的测试数据库。

<!-- more -->

基础工作环境：

1. [docker](https://docs.docker.com/install/)
2. [nodejs 8](https://nodejs.org/en/)

# 1. 数据源

从[geofabrik](http://download.geofabrik.de/)上我们可以下载的分好地区的[OpenStreetMap](https://www.openstreetmap.org/)数据，这样可以得到一个比较小的测试数据集。可以通过下面的地址下载到最新的中国区域数据：

```bash
# 直接下载国区的数据
http://download.geofabrik.de/asia/china-latest.osm.pbf
```

# 2. 准备 PostGIS 环境

我们直接用[mdillon/postgis](https://hub.docker.com/r/mdillon/postgis/)的 docker 镜像跑一个 PostGIS 数据库：

```bash
# 创建一个名称为gis网络
docker network create gis
docker run -d --name postgis -e POSTGRES_USER=gis --network gis -p 6543:5432 mdillon/postgis:10
```

这个镜像可以通过`POSTGRES_PASSWORD`指定数据库密码，如果没指定的话，密码会和`POSTGRES_USER`即用户名保持一致。

建议通过`-p 5432:5432`映射下端口，方便我们在宿主机上直接连接调试。

# 3. 导入 osm 数据到 PostGIS

我们用[imposm3](https://github.com/omniscale/imposm3)来导入 osm 数据到库中。

imposm3 主要需要配置 cache 目录（可选），connection 链接地址（必须）和 mapping 映射文件（必须）三个参数，官方仓库提供了一个[mapping 样例](https://github.com/omniscale/imposm3/blob/master/example-mapping.json)供参考。这里我们方便测试，就用这个[简单版本](mapping.json)，定义了`admim、amenities、buildings`三张表。

准备一个文件夹，把下载的 pbf 和 mapping 文件丢进去，再创建 cache 目录

依然用上强大的 docker，[jawg/imposm3](https://hub.docker.com/r/jawg/imposm3/)可以帮助我们方便的执行 imposm3 操作。

```
docker run --network gis --rm \
-v $(pwd)/cache:/tmp/imposm3 \
-v $(pwd)/china-latest.osm.pbf:/opt/imposm3/china-latest.osm.pbf \
-v $(pwd)/mapping.json:/opt/imposm3/mapping.json \
jawg/imposm3 import \
-mapping mapping.json \
-read china-latest.osm.pbf \
-overwritecache -write -connection 'postgis://gis:gis@postgis/gis'
```

耐心等待导入完成，可以直接进入 docker 查看数据情况：

```
docker exec -it postgis psql gis gis
```

或者通过第三方软件连接数据库，可以看到 import 导入的三张表：

![](http://blog-img-1255388623.cossh.myqcloud.com/osm_mvt_postgis.png)

# 4. 执行 SQL 脚本

在数据库中执行 mapbox 提供的[TileBBox](https://github.com/mapbox/postgis-vt-util/blob/master/src/TileBBox.sql)脚本，创建 TileBBox 函数

```
https://github.com/mapbox/postgis-vt-util/blob/master/src/TileBBox.sql
```

这个函数的作用就是传入指定的`x,y,z`瓦片序列，转换成 MVT 需要的`tile coordinate space`，通常是 4096x4096 的网格

# 5. 测试数据结果

mvt 瓦片生成的关键就是[ST_AsMVT](https://postgis.net/docs/ST_AsMVT.html)和[ST_AsMVTGeom](https://postgis.net/docs/ST_AsMVTGeom.html)两个函数，所以可以直接调用来做个测试，这里查询`z=14,y=12917,6430`的瓦片对应的 mvt 数据

先查询出范围内的 geometry，并转化成 mvt 需要的格式

```sql
SELECT ST_AsMVTGeom(
   ST_Transform(
	  import.osm_buildings.geometry, 3857),
	  TileBBox(14, 12917, 6430, 3857),
	  256,
	  10,
      true
   ) geom, name
FROM import.osm_buildings
WHERE ST_Intersects(TileBBox(14, 12917, 6430, 3857), import.osm_buildings.geometry)
```

得到结果应该如下：

![](http://blog-img-1255388623.cossh.myqcloud.com/asmvtgeom_result.png)

再使用 ST_AsMVT 进行转换就行，完成的合并后的 sql 如下：

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
  ) geom , name
  FROM import.osm_buildings
  WHERE ST_Intersects(TileBBox(14, 12917, 6430, 3857), import.osm_buildings.geometry)
) AS q
```

# 6. 数据展示

完整的地图区域数据前端展示可以使用 tilestrata 这个服务端工具，配合 tilestrata-postgismvt 插件就可以生成供地图调用的瓦片。

具体的 demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

对应的文章可以看一下这篇[tilestrata-postgismvt 使用](http://kael.top/2019/06/13/tilestrata-postgismvt/)

clone 项目[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)，将项目里面`src/mvt/`目录下[index.js](https://github.com/zzcyrus/tilestrata-sample-code/blob/master/src/mvt/index.js)的`pgConfig`改成你的设置

安装依赖，启动项目

```
npm install
npm start
```

访问`example/mvt.html`就可以看到结果了。

我们导入了三张表，分别是边界数据（蓝色）、设施（红点）和建筑（紫色），全部叠加之后如下图所示：

![](http://blog-img-1255388623.cossh.myqcloud.com/mvt_preview.png)

# 参考文档

[https://blog.jawg.io/how-to-make-mvt-with-postgis/](https://blog.jawg.io/how-to-make-mvt-with-postgis/)
