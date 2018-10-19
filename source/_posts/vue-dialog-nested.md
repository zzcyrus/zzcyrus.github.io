---
title: element dialog组件嵌套问题的临时方案
date: 2017-06-23 22:09:55
tags: [FE,Vue]
categories: 前端
---

&emsp;&emsp;最近用 Vue+element 开发项目时，在dialog组件上嵌套使用dialog组件或是MessageBox这类弹框组件，发现会出现遮罩层重合之类的问题，导致很多人只能选择关闭遮罩层。GitHub上就此问题也出现过类似讨论。有几种解决方案：

<!--more--> 


1. 按照官方所说，将多个dialog类组件全部移动至**<body**>标签下

2. Github上某位大牛给出了不完全解决方案，基本思路仍然是将添加在**<el-dialog**>内的dom结构自动移动至**<body**>标签下。这个方式测试了下，似乎纯dialog嵌套问题不大，但是如果dialog内部包含了其他组件会有点问题，智者见智，自行探索了

&emsp;&emsp;[附上连接](https://github.com/foolishchow/element-dialog2)

3. 编写自己modal遮罩层，这里给出个不完全临时代码仅供参考

```js
    Vue.prototype.$Modal = {
        open(element) {
            var index = 1;
            var wrapper = element.querySelector('.el-dialog__wrapper');
            if (wrapper) {
                index = wrapper.style.zIndex - 1;
            }
            var modalDom = document.createElement('div');
            modalDom.className = 'v-modal';
            element.appendChild(modalDom);
            modalDom.style.zIndex = index;
        },
        close() {
            var modal = document.getElementsByClassName('v-modal')[0;
            modal.parentNode.removeChild(modal);
        }
    }

```
&emsp;&emsp;一般调用方法
```js
    mounted: function () {
        var that = this;
        this.$nextTick(function () {
            //遮罩层
            that.$nextTick(function () {
                that.$Modal.open(that.$el);
            });
        });
    },
```

&emsp;&emsp;主要想法就是在组件mounted完成的nextTick后，为页面中添加一个div，样式就直接采用element自己的了，因为遮罩层是添加在dialog组件下的，因此组件销毁后也会自己销毁，close方法也没用上，但也应该会遇到有用上的时候吧。
