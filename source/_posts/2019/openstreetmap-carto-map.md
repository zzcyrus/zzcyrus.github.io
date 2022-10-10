---
title: 制作openstreetmap-carto风格离线瓦片地图
date: 2019-06-06 15:13:27
tags: [GIS]
categories: PostGIS
---

[openstreetmap-carto](https://github.com/gravitystorm/openstreetmap-carto)是[openstreetmap](https://www.openstreetmap.org)的默认地图风格，广受好评，各方面均衡，是离线地图的常用选择。

<!-- more -->

搭建的主要步骤基本围绕[使用 osm 数据做一个自己的 PostGIS 数据库](https://kaely.net/2019/03/12/osm-PostGIS-setup/)这篇文章展开。

我们完成**1、2、3**步骤后，再导入 osm 数据前要做一些修改

# 4. 依据 openstreetmap-carto 样式导入数据

仍然是安装好 osm2pgsql 工具，下载好中国区 pbf 数据，之后我们要准备样式包

```bash
# 下载openstreetmap-carto相关数据文件
git clone https://github.com/gravitystorm/openstreetmap-carto.git

# 导入数据，手动指定carto样式文件
osm2pgsql -c -d china -G --slim --hstore --style /home/openstreetmap-carto/openstreetmap-carto.style --tag-transform-script /home/openstreetmap-carto/openstreetmap-carto.lua -C 2000 -p china -r pbf /home/CN
```

# 5. 执行各种脚本

进入 clone 下来的`openstreetmap-carto`文件夹

## 5.1 索引

首先是建立数据库索引，可以加快渲染访问的速度，这步是**可选**的

```bash
psql -d gis -f indexes.sql
```

## 5.2 下载 shapefile

样式中用到了海岸线、水域等 shp 文件，需要手动下载，文件较大，`openstreetmap-carto`已经提供了下载脚本

```bash
scripts/get-shapefiles.py
```

如果下载出错，加上`-s`关闭 shapeindex

```bash
scripts/get-shapefiles.py -s
```

如果实在网络不行，可以根据[安装指南](https://github.com/gravitystorm/openstreetmap-carto/blob/master/INSTALL.md#manual-download)中说明手动下载这些文件，放在`openstreetmap-carto/data`目录下就好

## 5.3 下载字体

如果是用了 Ubuntu/Debian 服务器，可以直接安装

```bash
sudo apt-get install fonts-noto-cjk fonts-noto-hinted fonts-noto-unhinted fonts-hanazono ttf-unifont
```

其他系统也可以[手动下载字体文件并安装](https://github.com/gravitystorm/openstreetmap-carto/blob/master/INSTALL.md#installation-on-other-operation-systems)

# 6. 渲染

准备好`nodejs`环境，渲染工具使用 tilestrata 这个服务端工具，配合 tilestrata-mapnik 插件就可以生成供地图调用的瓦片。

具体的 demo 项目可以参考[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)

对应的文章可以看一下这篇[tilestrata-mapnik 使用](https://kaely.net/2019/06/11/tilestrata-mapnik/)

## 6.1 准备 mapnik 配置文件

因为使用了 mapnik，要将`openstreetmap-carto`的[project.mml](https://github.com/gravitystorm/openstreetmap-carto/blob/master/project.mml)转换成 mapnik 可识别的 xml 文件

打开文件夹下面的`project.mml`文件，找到如下字段，修改成你数据库的相关配置信息

![](http://blog-img-1255388623.cossh.myqcloud.com/carto_project_mml.png)

安装`carto`工具包进行转换

```
sudo npm install -g carto
carto project.mml > osm.xml
```

## 6.2 准备服务端

clone 项目[tilestrata-sample-code](https://github.com/zzcyrus/tilestrata-sample-code)，将项目里面`/src/mapnik/`目录下[index.js](https://github.com/zzcyrus/tilestrata-sample-code/blob/master/src/mapnik/index.js)增加以下内容

```
server
  .layer('osm')
  .route('tile.png')
  .use(
    mapnik({
      pathname: 'style/osm.xml'
    })
  )
```

将`openstreetmap-carto`文件夹下面的`data，symbols，osm.xml（刚生成的）`三个文件（夹）拷贝到`tilestrata-sample-code`的`style`文件夹下，拷贝完成的目录结构如下所示：

![](http://blog-img-1255388623.cossh.myqcloud.com/osm_mapnik_folder.png)

安装相关依赖并启动项目

```
npm install
npm start
```

将`/example/mapnik.html`文件里的 tileLayer 地址换成`"http://127.0.0.1:9527/osm/{z}/{x}/{y}/tile.png",`，打开文件即可看到效果

# 7 对比结果

官网
![官网效果](http://blog-img-1255388623.cossh.myqcloud.com/osm.png)

我们自己生成的
![](http://blog-img-1255388623.cossh.myqcloud.com/osm_mapnik.png)
