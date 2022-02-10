---
title: Cesium 开发系列8 贴地展示-自定义canvas
date: 2022-02-10 23:30:22
tags: [GIS, Cesium]
categories: Cesium
---

在Cesium中对点、线、面不同类型feature做贴地的具体操作，就不再赘述了，我们在二维的地图sdk使用过程中经常会开发一些自定义图层，大多基于canvas来实现，例如热力图、色板图、echarts图等，像leaflet中通常是一个新的dom来与主地图做同步，mapbox等新生代选手则可以直接添加到主地图的dom中。

对于这类自定义的canvas图层，在cesium中想要贴在地形之上进行展示，其实也很简单，**GroundPrimitive**配合上自定义**material**就好了，具体过程可以参考代码的注释。

<!-- more -->

# 实现

```js
// 创建贴地的primitive
new Cesium.GroundPrimitive({
  geometryInstances: new Cesium.GeometryInstance({
    // 和二维类似，本质上还是一个矩形
    geometry: new Cesium.RectangleGeometry({
      rectangle: Cesium.Rectangle.fromDegrees(
        // 提供矩形的四至经纬度
        lonMin,
        latMin,
        lonMax,
        latMax,
      ),
    }),
  }),
  appearance: new Cesium.Appearance({
    // 创建一个完全自定义的material
    material: new Cesium.Material({
      fabric: {
        type: 'Custom-Canvas',
        uniforms: {
		  // textureCanvas就是在二维sdk中绘制出来的自定义canvas图层
          image: textureCanvas,
        },
	    // 这里是cesium原始的source内容，没有修改
        source: `
            uniform sampler2D image;

            czm_material czm_getMaterial(czm_materialInput materialInput){
              czm_material material = czm_getDefaultMaterial(materialInput);
              vec2 st = materialInput.st;
              vec4 colorImage = texture2D(image,st);
              material.diffuse = colorImage.rgb;
              material.alpha = colorImage.a;
              return material;
            }
           `,
      },
    }),
    flat: true,
  }),
})
```

Cesium对Material是具备一定的开放性的，你可以在source中去对原始的canvas做二次加工，或者把一些消耗性能的绘制操作直接放在source中（需要一定的webgl基础）。

# 注意

在二维sdk中绘制自定义图层时，我们通常会使用类似`map.latLngToContainerPoint`的方法来将经纬度坐标转化为二维平面坐标，这是因为二维地图大多采用了墨卡托投影，而在上述贴地操作中，原始的canvas不需要做这一步转换，把它假设成一个等经纬度的网格来绘制就好了。Cesium会在加载的时候自动重投影，可以将这个过程理解成通过`SingleTileImageryProvider`来加载一张图片。**（目前我的测试是这样，如果这个理解有误，后期会更新这个观点）**
