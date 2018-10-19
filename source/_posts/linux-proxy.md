---
title: Linux下代理的多种方式尝试
date: 2018-05-10 23:04:10
tags: [Linux]
categories: Linux
---

&emsp;&emsp;为进行学术研究，一些数据来自美国、欧洲的大学公开资料，中国境内下载速度较慢，遂考虑通过VPS代理的方式去尝试解决，主要类型为http及ftp，于是便有了如下的含泪采坑历程：

<!--more--> 

# 前提准备

有一个`远离海岸线`的服务器,或者有一个海外的Socks5加速服务，下文中用55描述该服务器，用本机（CentOS7）代表境内的服务器

# Socks5 + Polipo
首先加速的第一个想法是55中开启Socks5代理，本机中通过Polipo将Socks5转发成Http代理，进行加速下载

首先本机中安装shadowsocks服务，这里跳过了55中安装Socks5服务，只讨论本机
```bash
# 安装
sudo yum -y install epel-release
sudo yum -y install python-pip
sudo pip install shadowsocks

# 新建配置文件
sudo mkdir /etc/shadowsocks
sudo vim /etc/shadowsocks/shadowsocks.json

# 修改配置信息
{
  "server":"x.x.x.x",  # 55地址 或 加速服务提供的地址
  "server_port":443,  # 55端口 或 加速服务提供的端口
  "local_address": "127.0.0.1",
  "local_port":1080,
  "password":"password",
  "timeout":300,
  "method":"aes-256-cfb"
}

# 新建启动服务
sudo vim /etc/systemd/system/shadowsocks.service

# 修改服务内容
[Unit]
Description=Shadowsocks
[Service]
TimeoutStartSec=0
ExecStart=/usr/bin/sslocal -c /etc/shadowsocks/shadowsocks.json
[Install]
WantedBy=multi-user.target

# 启动服务
systemctl enable shadowsocks.service
systemctl start shadowsocks.service
systemctl status shadowsocks.service
```

接下来就是我们轻量级的Polipo了

```bash
# 安装依赖
yum install texinfo

# 源码编译
git clone https://github.com/jech/polipo.git
cd polipo
make all
su -c 'make install'

#增加配置文件
touch /var/log/polipo.log
mkdir /opt/polipo
vim /opt/polipo/config

# 配置文件内容
logSyslog = true
socksParentProxy = "localhost:1080"
socksProxyType = socks5
logFile = /var/log/polipo.log
logLevel = 4
proxyAddress = "0.0.0.0"
proxyPort = 8123
chunkHighMark = 50331648
objectHighMark = 16384

serverMaxSlots = 64
serverSlots = 16
serverSlots1 = 32

# 新建启动服务
vim /etc/systemd/system/polipo.service

# 修改服务内容
[Unit]
Description=polipo web proxy
After=network.target

[Service]
Type=simple
WorkingDirectory=/tmp
User=root
Group=root
ExecStart=/usr/local/bin/polipo -c /opt/polipo/config
Restart=always
SyslogIdentifier=Polipo

[Install]
WantedBy=multi-user.target

# 关闭SELINUX
vim /etc/selinux/config
SELINUX=disable

# 启动服务
systemctl start polipo.service
systemctl enable polipo
```
好了，至此我们可以使用代理去加速文件的下载了
```bash
# 测试是否成功
curl ip.gs  #查看IP地址

http_proxy=http://localhost:8123 curl ip.gs #查看代理后IP地址

http_proxy=http://localhost:8123 wget url # 通过代理去下载
```

但是后来发现巨坑的是。。。polipo只支持http和https代理，ftp没法代理！

# Socks5 + Privoxy

&emsp;&emsp;又去网上找了找，这个Privoxy看上去是个好东西啊，用的人也多，随便找了个安装教程一通配置，人家可是能配置`export ftp_proxy=http://$PROXY_HOST:8118`呢，可我实际测试下来，还是对ftp效果不大啊，我就纳闷了，咋回事，跑去官网一看，人家说我们任性，不想支持ftp代理，工作量太大了，心头一口老血。。。

# Socks5 + Squid

&emsp;&emsp;我又去网上找了找，找到一个看着巨牛逼但是似乎很蛮烦的Squid，相关资料也不多，没办法，就算是坑也得跳啊

这玩意我是装在55上的，本机连接它暴露出来的服务

```bash
# 安装居然这么简单
yum install squid -y

# 配置起来似乎也不复杂
vim /etc/squid/squid.conf 

# 修改这一行中的deny为allow（当然这是不安全的，建议指定好端口之类的）
http_access allow all

# 防火墙开放3128端口重启服务，ok了居然
#本机使用
ftp_proxy="55IP:3128" wget url 
```

总算有效果了，数据开始起飞

# 总结

`python`大法好

```python
import urllib.request
from urllib import request as urlrequest

localPath = '/data/'
url = 'ftp://url'
proxy_host = '55地址:3128'

req = urlrequest.Request(url)
req.set_proxy(proxy_host, 'ftp')

local_filename, headers = urllib.request.urlretrieve(url, localPath)

```

