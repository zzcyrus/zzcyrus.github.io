---
title: openlayers 从台风风圈绘制到canvas样式和图层的应用
date: 2017-07-31 22:31:02
tags: [FE,GIS,OpenLayers]
categories: OpenLayers
---
本文中所使用的数据来源于[温州台风网](http://www.wztf121.com/typhoon.html)，通过F12抓取，你可以在我的[GitHub](
https://github.com/zzcyrus/openlayers-demos
)上查看数据和本文源代码

&nbsp;&nbsp;台风的风圈是一种不常见但算的上规则的图形，在上面的网站可以看到最终效果，简单的解剖下其实就是四个1/4圆

![](goal.png)

从数据结构上也可以看出来：
```js
        var radius_quad = {
            "ne": 250, //单位为KM
            "se": 250,
            "sw": 180,
            "nw": 150
        }
```
在某个固定经纬度点上，以此点为圆心组合成了一个所谓的风圈形状，四个方向分别代表每个1/4圆的半径。刚开始是为了实现这种效果进行了研究，后来发现openlayers对于这种效果的支持还挺有意思，记录下来已做分享。

<!-- more -->


# 通过自定义geometry的实现
&nbsp;&nbsp;最原始的思路也是最容易切入的点，就是去看openlayers中怎么实现圆形的画法，在ol中，有`createRegularPolygon`这个类，原理就是给定一些参数，用点去填充我们想要的形状，当填进去点达到一定密集度，自然就能得到一个近似的圆。
&nbsp;&nbsp;通过这个思路我们可以计算台风风圈的每个1/4圆的坐标，用点去占位，最终实现绘制出想要的图形。

具体代码可以去看某大牛的博客，这里只给出一个传送门，写的很详细了：
[点我乘坐飞机](http://blog.csdn.net/gisshixisheng/article/details/76397068) **这个算法还有些不完善，就是在每个1/4圆结束时候少计算了一个点，导致看着有点不对劲**


**特点:** 这种方式画出来的图形是一个图层中的一个feature，好处自然不用多说，基本上feature支持的功能都能满足！


# 通过canvas类型的symbol实现
&nbsp;&nbsp;在点密集的情况下，用上面的方式其实效果已经很不错了，但是有些细（tiao）心（ci）的使用者，非要放大到一定程度，然后说你这个不够圆，那。。。。。

&nbsp;&nbsp;那我们就用canvas画出来，openlayers中，要素的样式是有这么一种方式`ol.style.Icon`来实现，我们可以把绘制好的元素作为`Icon`的参数
```js
        var style = new ol.style.Style({
            image: new ol.style.Icon({
                opacity: 0.3,
                img: canvas,
                imgSize: [canvas.width, canvas.height],
            })
        })
```
canvans绘制的方法：
```js
        function createTyphoon(radius, radius_quad) {
            var canvas = document.createElement('canvas');
            canvas.width = canvas.height = 2 * radius;
            var context = canvas.getContext("2d");
            context.fillStyle = "#0000ff";
            context.strokeStyle = "#ff0000";
            context.lineWidth = 3;
            context.beginPath();
            context.arc(radius, radius, radius_quad.se, 0, 0.5 * Math.PI);
            context.lineTo(radius, radius + radius_quad.sw);
            context.arc(radius, radius, radius_quad.sw, 0.5 * Math.PI, Math.PI);
            context.lineTo(radius - radius_quad.nw, radius);
            context.arc(radius, radius, radius_quad.nw, Math.PI, 1.5 * Math.PI);
            context.lineTo(radius, radius - radius_quad.ne);
            context.arc(radius, radius, radius_quad.ne, 1.5 * Math.PI, 0);
            context.lineTo(radius + radius_quad.se, radius);
            context.fill();
            context.stroke();
            return canvas;
        }
```
效果如下图：
![](canvasSymbol.png)


[本方法完整代码](
https://github.com/zzcyrus/openlayers-demos/blob/master/0.typhoon/canvasSymbol.html
)

**特点：** 这种方式，绘制出来的台风风圈其实只是一个symbol符号，需要把这个符号赋给一个具体的要素，比如一个点，一个圆之类的，而且根据分辨率还要去调整样式的缩放
```js
        map.getView().on('change:resolution', function () {
            var style = shape.getStyle();
            // 重新设置图标的缩放率
            style.getImage().setScale(this.getZoom() / 8);
            shape.setStyle(style);
        })
```

# 通过canvas图层的方式实现
&nbsp;&nbsp;再后来转念一想，既然支持canvas的symbol，为何不直接使用canvas绘制固定元素呢，果然在API中找到了`ol.source.ImageCanvas`，直接把canvas要素当作图层来使用！

`ol.source.ImageCanvas`的绘制有点需要特别注意的点，这里给出重要代码片段，完整demo可以去[GitHub](
https://github.com/zzcyrus/openlayers-demos/blob/master/0.typhoon/canvasLayer.html
)查看

## 创建图层，在canvasFunction中写具体的绘图方法
```js
        var canvasLayer = new ol.layer.Image({
            source: new ol.source.ImageCanvas({
                canvasFunction: canvasFunction,
                projection: 'EPSG:3857'
            })
        });
```

## canvasFunction中一定要注意画布和地图的偏移处理，还要通过分辨率计算实际风圈大小

```js
        //计算画布和地图四至的偏移量
        var mapExtent = map.getView().calculateExtent(map.getSize())
        var canvasOrigin = map.getPixelFromCoordinate([extent[0], extent[3]]);
        var mapOrigin = map.getPixelFromCoordinate([mapExtent[0], mapExtent[3]]);
        var delta = [mapOrigin[0] - canvasOrigin[0], mapOrigin[1] - canvasOrigin[1]]
```
```js
        //在计算台风风圈的中心点时要补充计算偏移量
        var point = ol.proj.transform(coordinate, 'EPSG:4326', 'EPSG:3857');
        var pixel = map.getPixelFromCoordinate(point);
        var cX = pixel[0] + delta[0], cY = pixel[1] + delta[1];
```
```js
        //利用canvasFunction提供的默认参数分辨率，计算准确的坐标
        var radius_quad = {
            "ne": 250000 / resolution,
            "se": 250000 / resolution,
            "sw": 180000 / resolution,
            "nw": 150000 / resolution
        }
```
最终效果如下，我在同一图层中绘制了多个：
![](canvasLayer.png)


至于绘制canvas的方法和上面的symbol是一样的。具体代码还请移步[GitHub](
https://github.com/zzcyrus/openlayers-demos/blob/master/0.typhoon/canvasLayer.html
)(原谅我厚颜无耻的屡次打广告！)

**特点：**这种方式可以在一个图层中添加多个风圈要素，同时图层支持的功能也比较多，基本满足需求，效果也还行


&nbsp;&nbsp;这篇应用主要是从一个基本的需求所拓展开来的，canvas图层的应用我想应该很强大，刚开始研究openlyaers，相比于arcgis，ol很多功能可能要自己实现，但似乎效果上还是能让人满意的，欢迎大家讨论。