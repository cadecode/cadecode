---

title: JavaScript DOM 鼠标拖拽
date: 2020/4/5
description: 本文介绍 JavaScript DOM 事件中获取鼠标位置的各种属性及其兼容性、拖拽功能的实现以及拖拽函数的封装
tag: [前端基础, JavaScript]

---



# JavaScript DOM 鼠标拖拽

## 鼠标行为坐标系

1. 鼠标行为触发事件时，事件对象上会有一些属性提供鼠标的位置信息

   |   属性    |                功能                |         兼容性          |
   | :-------: | :--------------------------------: | :---------------------: |
   | clientX/Y |       鼠标相对可视区域的坐标       |            /            |
   |    x/y    |       与 clientX/Y 功能相同        |  firefox 低版本不支持   |
   |  pageX/Y  |       鼠标相对整个文档的坐标       |     兼容 IE9 及以上     |
   | layerX/Y  |        与 pageX/Y 功能相同         | IE10 及以下同 clientX/Y |
   | screenX/Y |        鼠标位置相对屏幕坐标        |            /            |
   | offsetX/Y | 鼠标位置相对块元素的坐标(包含边框) |    safari 不包含边框    |

2. 获取鼠标相对整个文档的坐标

   pageX/Y 兼容性差，需要进行封装
   
   鼠标相对整个文档的坐标 = 鼠标相对可视区域的坐标 + 滚动条滚动距离 - 文档偏移
   
   注：document.documentElement.clientTop 获取文档偏移，在 IE 一些版本中为 undefined
   
   ```javascript
   function pagePos(ev) {
       var sTop = getScrollOffset().top,
           sLeft = getScrollOffset().left,
           cTop = document.documentElement.clientTop || 0,
           cLeft = document.documentElement.clientLeft || 0;
       return {
           X: ev.clientX + sLeft - cLeft,
           Y: ev.clientY + sTop - cTop
       }
   }
   // 封装的函数：获取滚动条滚动距离
   function getScrollOffset() {
       if (window.pageXOffset) {
           return {
               top: window.pageYOffset,
               left: window.pageXOffset
           }
       }
       else return {
           top:document.body.scrollTop || document.documentElement.scrollTop,
           left:document.body.scrollLeft || document.documentElement.scrollLeft
       }
   }
   ```
   
   

## 拖拽函数封装

1. 拖拽效果基于鼠标事件：mousedown、mousemove、mouseup

   分别为鼠标按下、鼠标移动、鼠标松开

2. 原理

   鼠标按下时，添加鼠标移动、鼠标松开的事件处理函数

   鼠标移动时获取鼠标坐标，改变元素样式

   鼠标松开时清除鼠标移动和鼠标松开的事件处理函数

   ```html
   <!doctype html>
   <html lang="zh">
   <head>
       <meta charset="UTF-8">
       <title>Index</title>
       <style type="text/css">
           .box {
               position: absolute;
               top: 0;
               left: 0;
               width: 100px;
               height: 100px;
               background-color: red;
           }
       </style>
   </head>
   <body>
   <div class="box"></div>
   <script>
       var box = document.getElementsByTagName('div')[0];
   
       box.onmousedown = function (ev) {
           var ev = ev || window.event,
               x = pagePos(ev).X - parseInt(getStyles(box)['left']),
               y = pagePos(ev).Y - parseInt(getStyles(box)['top']);
   
           document.onmousemove = function (ev) {
               var ev = ev || window.event,
                   mPos = pagePos(ev);
               box.style.left = mPos.X - x + 'px';
               box.style.top = mPos.Y - y + 'px';
           }
           document.onmouseup = function () {
               this.onmousemove = null;
               this.onmouseup = null;
           }
       }
   
       // 封装的函数：获取鼠标相对整个文档的坐标
       function pagePos(ev) {
           var sTop = getScrollOffset().top,
               sLeft = getScrollOffset().left,
               cTop = document.documentElement.clientTop || 0,
               cLeft = document.documentElement.clientLeft || 0;
           return {
               X: ev.clientX + sLeft - cLeft,
               Y: ev.clientY + sTop - cTop
           }
       }
   	// 封装的函数：获取滚动条滚动距离
       function getScrollOffset() {
           if (window.pageXOffset) {
               return {
                   top: window.pageYOffset,
                   left: window.pageXOffset
               }
           } else return {
               top: document.body.scrollTop || document.documentElement.scrollTop,
               left: document.body.scrollLeft || document.documentElement.scrollLeft
           }
       }
   
       // 封装的函数：获取元素样式的类数组
       function getStyles(elem) {
           if (window.getComputedStyle) {
               return window.getComputedStyle(elem, null);
           } else return elem.currentStyle;
       }
   </script>
   </body>
   </html>
   ```

3. 封装拖拽函数

   先封装几个工具函数，如绑定事件处理函数、获取滚动条滚动距离、获取元素样式、阻止冒泡和默认事件等

   ```java
   // 绑定事件处理函数
   function addEvent(elem, type, fn) {
       if (elem.addEventListener) {
           elem.addEventListener(type, fn);
       } else if (elem.attachEvent) {
           elem.attachEvent('on' + type, function (ev) {
               fn.call(elem, ev); // call 兼容性比 bind 好
           });
       } else {
           elem['on' + type] = fn;
       }
   }
   // 解绑事件处理函数
   function removeEvent(elem, type, fn) {
       if (elem.addEventListener) {
           elem.removeEventListener(type, fn);
       } else if (elem.attachEvent) {
           elem.detachEvent('on' + type, fn);
       } else {
           elem['on' + type] = null;
       }
   }
   // 获取鼠标在整个文档中的坐标
   function pagePos(ev) {
       var sTop = getScrollOffset().top,
           sLeft = getScrollOffset().left,
           cTop = document.documentElement.clientTop || 0,
           cLeft = document.documentElement.clientLeft || 0;
       return {
           X: ev.clientX + sLeft - cLeft,
           Y: ev.clientY + sTop - cTop
       }
   }
   // 获取滚动条滚动距离
   function getScrollOffset() {
       if (window.pageXOffset) {
           return {
               top: window.pageYOffset,
               left: window.pageXOffset
           }
       } else return {
           top: document.body.scrollTop || document.documentElement.scrollTop,
           left: document.body.scrollLeft || document.documentElement.scrollLeft
       }
   }
   // 获取元素样式的类数组
   function getStyles(elem) {
       if (window.getComputedStyle) {
           return window.getComputedStyle(elem, null);
       } else return elem.currentStyle;
   }
   // 阻止冒泡
   function cancelBubble(ev) {
       if (ev.stopPropagation) {
           ev.stopPropagation();
       } else ev.cancelBubble = true; // 兼容 IE8 及以下
   }
   // 阻止默认事件
   function preventDefaultEvent(ev) {
       if (ev.preventDefault) {
           ev.preventDefault();
       } else ev.returnValue = false; // 兼容 IE8 及以下
   }  
   ```

   按下鼠标`mousedown`事件触发，通过事件对象获取鼠标位置，注意减去元素的尺寸

   移动鼠标`mousemove`事件触发，改变目标元素的行内样式，达到移动位置的效果

   松开鼠标`mouseup`事件触发，解绑`mousedown`和`mousemove`事件

   ```javascript
   var box = document.getElementsByTagName('div')[0];
   elemDrag(box);
   
   // 封装的拖拽函数
   function elemDrag(elem) {
       var x,
           y;
       addEvent(elem, 'mousedown', function (ev) {
           var ev = ev || window.event;
           x = pagePos(ev).X - parseInt(getStyles(elem)['left']);
           y = pagePos(ev).Y - parseInt(getStyles(elem)['top']);
           addEvent(document, 'mousemove', mousemove);
           addEvent(document, 'mouseup', mouseup);
           cancelBubble(ev);
           preventDefaultEvent(ev);
       });
   
       function mousemove(ev) {
           var ev = ev || window.event;
           elem.style.left = pagePos(ev).X - x + 'px';
           elem.style.top = pagePos(ev).Y - y + 'px';
       }
   
       function mouseup(ev) {
           var ev = ev || window.event;
           removeEvent(document, 'mousemove', mousemove);
           removeEvent(document, 'mouseup', mouseup);
       }
   
   } 
   ```
