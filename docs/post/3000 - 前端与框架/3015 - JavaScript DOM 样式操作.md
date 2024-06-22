---


title: JavaScript DOM 样式操作
date: 2020/4/2
description: 本文介绍 JavaScript 的样式操作，如改变元素内联样式、使用 getComputedStyle 获取生效样式、改变伪元素样式、以及计时器实现动画
tag: [前端基础, JavaScript]

---



# JavaScript DOM 样式操作

## style 属性

1. DOM 不能直接操作 CSS 文件，通过操作元素的 style 属性间接操作样式

   ```javascript
   var oDiv = document.getElementsByTagName('div')[0];
   oDiv.style.width = '100px';
   oDiv.style.backgroundColor = 'red';
   // style 属性即内联样式，不能得出 CSS 文件定义的内容
   // 如果没有对应内联样式，则返回空字符串
   ```

2. 注意
   - 属性使用小驼峰写法
   - 赋值使用字符串
   - 复合值最好拆解，有利于提高性能，如 border
   - style.float 使用 style.cssFloat 代替，不冲突保留字

## getComputedStyle 方法

1. window 下的 getComputedStyle，返回元素生效的样式属性

   ```javascript
   window.getComputedStyle(elem, null);
   var width = window.getComputedStyle(div, null)['width']; // 返回字符串
   window.getComputedStyle(elem, 'after'); // 返回 after 伪元素的样式属性
   ```

2. getComputedStyle 返回的数据会被转换成特定的单位，如 em 会转换为 px，十六进制颜色会转换为 rgb/rgba 等

3. IE8 及以下不支持 getComputedStyle，可以使用 elem.currentStyle 代替

   ```javascript
   function getStyles(elem) {
       if (window.getComputedStyle) {
           return window.getComputedStyle(elem, null);
       } else return elem.currentStyle;
   }
   ```

## offsetWidth 属性

1. offsetWidth、offsetHeight 可以获得元素的物理尺寸

   ```javascript
   var oDiv = document.getElementsByTagName('div')[0];
   oDiv.offsetWidth; 
   oDiv.offsetHeight; 
   // offsetWidth = border + padding + width
   ```

2. offsetWidth、offsetHeight 包括了 padding，对一些开发场景造成不便，最好使用  getComputedStyle 方法

## 伪元素样式

1. ::berfore，::after 伪元素的样式无法通过方法直接改变

2. 通常修改关联元素的 clssName 改变伪元素的样式

   ```css
   .box1::after{
       content: "";
       background-color: red;
   }
   .box2::after{
       content: "";
       background-color: black;
   }
   ```

   ```javascript
   var oDiv = document.getElementsByClassName('box1')[0];
   oDiv.className = 'box2';
   // after 伪元素的样式也随之改变
   ```

## 样式动画

1. 元素运动

   通过改变元素的样式属性使其显示内容发生改变，如下拉菜单、侧边抽屉、弹出信息框等

   我们经常使用 CSS3 或者一些封装好的框架来实现动画，动画效果可以给页面带来更好的交互体验

2. 原生 JS 实现样式动画
   - 获取要运动的元素节点
   - 明确要改变的样式属性
   - 确定动画时间，动画速度和动画终止条件
   - 创建计时器，终止条件下清除计时器

3. 下拉菜单示例

   html
   
   ```html
   <div class="dropdown">
       <a href="javascript:;" class="main">下拉菜单</a>
       <ul class="list">
           <li>1</li>
           <li>2</li>
           <li>3</li>
           <li>4</li>
       </ul>
   </div>
   <script type="text/javascript">
   
       var dropdown = document.getElementsByClassName('dropdown')[0],
           oList = dropdown.getElementsByClassName('list')[0],
           timer = null,
           listHeight = 0,
           speed = 2;
   
       dropdown.onmouseenter = function () {
           clearInterval(timer);
           timer = setInterval(function () {
               if (listHeight >= 200) {
                   clearInterval(timer);
               } else {
                   listHeight = parseInt(getStyles(oList)['height']) + speed;
                   oList.style.height = listHeight + 'px';
               }
           }, 1);
       }
   
       dropdown.onmouseleave = function () {
           clearInterval(timer);
           timer = setInterval(function () {
               if (listHeight <= 0) {
                   clearInterval(timer);
               } else {
                   listHeight = parseInt(getStyles(oList)['height']) - speed;
                   oList.style.height = listHeight + 'px';
               }
           }, 1);
       }
   
       function getStyles(elem) { 
           if (window.getComputedStyle) {
               return window.getComputedStyle(elem, null);
           } else return elem.currentStyle;
       }
   </script>
   ```
   
   css
   
   ```css
   <style>
           .dropdown {
               width: 100px;
           }
   
           .dropdown .main {
               display: block;
               height: 50px;
               background-color: black;
               color: white;
               text-align: center;
               text-decoration: none;
               line-height: 50px;
           }
   
           .dropdown .list {
               overflow: hidden;
               height: 0;
               margin: 0;
               padding: 0;
               list-style: none;
           }
   
           .list li {
               height: 50px;
               background-color: #999;
               text-align: center;
               line-height: 50px;
           }
   
           .dropdown li:hover {
               background-color: black;
               color: white;
           }
       </style>
   ```
   
   
   
   
