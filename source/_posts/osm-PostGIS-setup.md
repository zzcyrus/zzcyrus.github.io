---
title: 使用osm数据做一个自己的PostGIS数据库
date: 2019-03-12 19:54:08
tags: [GIS]
categories: PostGIS
---

PostGIS是目前开源方案里面使用广泛的一种地理信息数据库，可玩性很强，实用性也很强，为了实现更多的地理信息操作，我们先来搭建一个简单的PostGIS数据库。

<!-- more -->


## 安装步骤

1. 准备一个 CentOS 7.x x64 环境
2. 安装数据库 PostgreSQL 9.6
3. 安装对应版本的 PostGIS 2.2.2
4. 导入openstreetmap的中国区域数据


## PostgreSQL 9.6

```bash
# 安装数据库
yum install https://download.postgresql.org/pub/repos/yum/9.6/redhat/rhel-7-x86_64/pgdg-centos96-9.6-3.noarch.rpm

yum install postgresql96

yum install postgresql96-server

# 初始化数据库及服务
/usr/pgsql-9.6/bin/postgresql96-setup initdb
systemctl enable postgresql-9.6
systemctl start postgresql-9.6

# 配置环境变量
export PATH=/usr/pgsql-9.6/bin:$PATH
export LD_LIBRARY_PATH=/usr/pgsql-9.6/lib:$LD_LIBRARY_PATH
export PGDATA=/home/postgres/postgresql_data


# 以下可选

# 为数据库设置密码
su - postgres 
psql
postgres=# ALTER USER postgres WITH PASSWORD 'postgres'; 
postgres=# \q

# 开放防火墙端口
firewall-cmd --permanent --add-port=5432/tcp  
firewall-cmd --reload  

# 修改配置文件允许外部使用密码访问
vim /var/lib/pgsql/9.6/data/postgresql.conf
listen_addresses = 'localhost'  为  listen_addresses='*'

vim /var/lib/pgsql/9.6/data/pg_hba.conf
host    all            all      0.0.0.0/0      md5

```

## PostGIS

```bash
# 安装PostGIS
sudo yum -y install epel-release
sudo yum install postgis24_96

# 初始化数据库osm
createdb osm

psql -h 127.0.0.1 -d osm -U postgres -f /usr/pgsql-9.6/share/contrib/postgis-2.4/postgis.sql
psql -h 127.0.0.1 -d osm -U postgres -f /usr/pgsql-9.6/share/contrib/postgis-2.4/spatial_ref_sys.sql

# 可以基于osm创建china数据库（把osm作为一个可重复备份的库）
createdb -T osm china

```

## osm数据导入

```bash
# 安装导入工具osm2pgsql
yum install osm2pgsql

# 下载中国区域的公开数据
wget http://download.gisgraphy.com/openstreetmap/pbf/CN.tar.bz2   

# 解压数据通过工具导入数据到china数据库
tar jxvf CN.tar.bz2
osm2pgsql -c -d china --slim -C 2000 -p china -r pbf /home/parallels/Downloads/CN

```


## 测试
至此，我们已经基于osm的数据有了一个地理信息库，我们可以通过以下sql做一些简单的测试


```sql
SELECT name FROM china_polygon WHERE name ~ '南京';
```

结果：
![](polygon.png)


```sql
SELECT p1.name,p2.name,ST_Distance(p1.way,p2.way) FROM    
(SELECT * FROM china_point WHERE place='city' AND name = '南京市') p1 ,     
(SELECT * FROM china_point WHERE place='city' AND name = '北京市') p2
```

结果：
![](distance.png)


```sql
SELECT name, ST_AsText(ST_Transform(way,4326)) FROM china_point WHERE place='city';
```

结果：
![](point.png)


当然数据库的功能不局限于此，基于此数据库我们可以做些更有趣的事情，今后我们会慢慢探讨。



## 参考文档
[digoal的博客](https://github.com/digoal/blog/blob/master/201609/20160906_01.md)