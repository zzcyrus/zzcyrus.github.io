---
title: 【译】Vue中父子组件的生命周期函数
date: 2018-6-29 15:42:41
tags: [FE,Vue]
categories: 前端
---

&nbsp;&nbsp;最近项目中遇到了地图模块挂载到DOM节点并进行初始化的问题，背后其实就是Vue中父子组件初始化的顺序问题，发现这篇文章的例子通俗易懂，遂翻译一下，如果错误还请指正。

<!-- more -->

[原文链接](https://medium.com/@brockreece/vue-parent-and-child-lifecycle-hooks-5d6236bd561f)


如果你在项目中使用Vue，那么我肯定你很熟悉组件生命周期内的钩子函数，但是你未必清楚父子组件内生命周期钩子触发的顺序和对属性（props）的影响

<p style="text-align:center;"><img src="lifecircle.png" width="50%" height="50%"></p>

## 父/子组件内的生命周期钩子

下面的例子在父子组件的**Mounted**和**Created**两个钩子触发时会给出相应的提示。如你所见，**Created**是正常的先父后子的顺序触发，但**Mounted**钩子则正好相反

<iframe src="https://codesandbox.io/embed/j38wnqjy65" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

一开始这可能很难很难理解，但如果我们通过逻辑的角度去遵循组件初始化工作流程，就能理解这种顺序。我们只要记住，父组件在其挂载template到DOM之前必须等待所有的子组件都完成挂载（mounted）操作。


<p style="text-align:center;"><img src="parent-child-hooks.png" width="50%" height="50%"></p>

若果你的组件通过属性（props）来通讯，以上钩子的执行顺序会很重要。

## 属性（props）的响应式（reactivity）

一个组件在**Created**钩子触发之前就可以是响应式的，这意味在其父组件的**Mounted**钩子触发之前它就能够开始追踪属性（props）的变化。如果你在父组件的**Mounted**钩子中去设置一些属性的值，你一定要牢记这一点。

下面的例子展示了如果在父组件的**Created**和**Mounted**两个钩子中都去设置子组件的属性值会发生什么。如你所见，在子组件的**Mounted**钩子中我们监测到了两次对属性值的改变操作（个人补充：父组件**Mounted**之前的data里面对属性赋值触发了一次，父组件**Mounted**时候的改变属性值又让子组件触发了一次）

<iframe src="https://codesandbox.io/embed/z2yonj9kq4" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

假设你的子组件在属性值改变的时候会进行一次Ajax请求，这样就会触发两次请求，甚至造成请求的未响应。

## 总结

如果你想深入的了解Vue的生命周期钩子，我强烈建议你读一下[这篇文章](https://alligator.io/vuejs/component-lifecycle/)。


但通常来说，我建议如果你只在组件的**Mounted**钩子进行需要和DOM交互的操作，而其他的操作都放在**Created**钩子中


### 个人总结

从生命周期的角度来看： 父 Created - 子 Created - 子 Mounted - 父 Mounted
对应过程Props的改变： 子 prop 改变 --------- 子 prop 改变 --------- 子 prop 改变  