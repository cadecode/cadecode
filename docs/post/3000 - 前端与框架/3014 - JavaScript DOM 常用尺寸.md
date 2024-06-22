---


title: JavaScript DOM 常用尺寸
date: 2020/4/1
description: 本文介绍 JavaScript 操作 DOM 时常用的尺寸 API，如怪异模式和标准模式下的滚动条距离、窗口尺寸、文档尺寸、元素文档坐标的兼容性写法以及窗口滚动到指定位置的方法等
tag: [前端基础, JavaScript]

---



# JavaScript DOM 常用尺寸

## 怪异和标准模式

1. 浏览器在解析 CSS 时有怪异和标准两种模式，目的是为了向旧版本兼容
2. 标准模式下浏览器会按 w3c 规范解析代码
3. 怪异模式下按浏览器自身规范解析代码，一般会向后兼容 5 个版本
4. 首句使用 `<!DOCTYPE html>`，则使用 HTML5 规范，即标准模式，不加这句则使用怪异模式
5. 使用`document.compatMode` 返回 CSS1Compat 表示处于标准模式，返回 BackCompat 则为怪异模式

## 滚动条滚动距离

1. 常见写法

   ```javascript
   // 获取滚动条和上侧/左侧的距离，即页面滚动距离
   window.pageYOffset/pageXOffset 
   document.bady.scrollTop/scrollLeft
   document.documentElement.scrollTop/scrollLeft
   window.scrollY/scollX
   ```

2. 兼容性表

   (b) 代表怪异模式，(s) 代表标准模式，C 代表 chrome，F 代表 firefox，O 代表 opera

   |     浏览器      | IE6789(b) | IE678(s)  |  IE9(s)   | C(bs) | O/F(b) | O/F(s) |
   | :-------------: | :-------: | :-------: | :-------: | :---: | :----: | :----: |
   | documentElement |     0     |   可用    |   可用    |   0   |   0    |  可用  |
   |      body       |   可用    |     0     |     0     | 可用  |  可用  |   0    |
   |   pageOffset    | undefined | undefined |   可用    | 可用  |  可用  |  可用  |
   |     scroll      | undefined | undefined | undefined | 可用  |  可用  |  可用  |

3. 兼容性写法

   ```javascript
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

## 窗口可视尺寸

1. 常见写法

   ```javascript
   // 获取窗口可视区域宽高
   window.innerWidth/innerHeight // 包括滚动条 兼容 IE9 及以上
   // window.outerWidrh/outerHeight 包含工具栏和滚动条，即浏览器窗口大小
   document.documentElement.clientWidth/clientHeight // 不包括滚动条 兼容标准模式
   document.body.clientWidth/clientHeight // 包括滚动条 兼容怪异模式
   ```

2. 兼容性写法

   ```javascript
   function getViewportSize() {
           if (window.innerWidth) {
               return {
                   width: window.innerWidth,
                   height: window.innerHeight
               }
           } else {
               if (document.compatMode === 'BackCompat') {
                   return {
                       width: document.body.clientWidth,
                       height: document.body.clientHeight
                   }
               } else {
                   return {
                       width: document.documentElement.clientWidth,
                       height: document.documentElement.clientHeight
                   }
               }
           }
       }
   ```

## 文档滚动尺寸

1. 常见写法

   ```javascript
   // 获取整个文档的总尺寸
   document.body.scrollHeight/scrollWidth
   document.documentElement.scrollHeight/scrollWidth
   // 优先使用 body.scrollHeight
   // documentElement.scrollHeight 在低版本 IE 存在问题
   ```

2. 兼容性写法

   ```javascript
   function getScrollSize() {
       if (document.body.scrollHeight) {
           return {
               width: document.body.scrollWidth,
               height: document.body.scrollHeight
           }
       } else return {
           width: document.documentElement.scrollWidth,
           height: document.documentElement.scrollHeight
       }
   }
   ```

## 元素文档坐标

1. offsetParent

   元素无 fixed 定位时，offsetParent 为最近的非默认定位的父级元素，没有则返回 body

   元素有 fixed 定位时，offsetParent 返回 null

   body 的 offsetParent 为 null

2. offsetTop/offsetLeft

   ```javascript
   var div = document.getElementById("box");
   div.offsetTop/offsetLeft // 相对 offsetParent 元素的偏移
   ```

3. 获取元素在文档中的坐标

   ```javascript
   function getElemPositionInDoc(elem) {
       var parent = elem.offsetParent,
           top = elem.offsetTop,
           left = elem.offsetLeft;
       while (parent) {
           top += parent.offsetTop;
           left += parent.offsetLeft;
           parent = parent.offsetParent;
       }
       return {
           top: top,
           left: left
       }
   }
   ```

## 窗口滚动

1. 常见写法

   ```javascript
   // 滚动到 (x, y) 坐标
   // window.scroll() 和 scrollTo() 功能相同
   window.scrollTo(x, y);
   window.scrollTo({
      top: 100,
      behavior: 'smooth' // 平滑滚动
   });
   ```

2. 滚动到低部判断方法

   ```javascript
   window.innerHeight + window.pageYOffset >= document.body.scrollHeight
   // 窗口可视高度 + 垂直滚动条滚动距离 >= 文档滚动高度
   // 注意写兼容性
   ```

   

