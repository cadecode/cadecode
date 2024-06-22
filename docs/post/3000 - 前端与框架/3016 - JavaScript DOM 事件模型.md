---

title: JavaScript DOM 事件模型
date: 2020/4/3
description: 本文介绍 JavaScript 中的事件驱动机制、事件反馈的几种方法、事件冒和捕获、阻止冒泡和默认事件以及事件委托
tag: [前端基础, JavaScript]

---



# JavaScript DOM 事件模型

## 事件驱动机制

1. 当事件发生时，我们收到事件的反馈，在 JavaScript 中，事件反馈是我们自行定义的事件处理函数
2. 事件，如点击事件、鼠标移入事件等，是每一个元素与生俱来的能力
3. 通常说的绑定事件，实际上是绑定事件的反馈，即事件处理函数
4. 例如点击一个按钮，按钮元素对象是事件发送器或事件源，事件是鼠标点击事件，事件处理函数是侦听器
5. 元素对象发出事件，事件处理函数做出反应，这就是 JS 的事件驱动机制

> 在观察者模式中，事件发送器就是主题，事件处理函数即侦听器就是观察者

## 绑定事件反馈

1. 内联属性

   ```html
   <button onclick="test()">按钮</button>
   ```

   介于结构和逻辑要相分离，不建议使用内联方式绑定

2. 事件句柄 

   ```javascript
   var oBtn = document.getElementsByTagName('button')[0];
   oBtn.onclick = function() {
       // this -> oBtn
   }
   ```

   兼容性好，但是重复绑定会覆盖

3. 事件监听器

   ```javascript
   var oBtn = document.getElementsByTagName('button')[0];
   oBtn.addEventListener("click", funtion(){
       // this -> oBtn
    }, false);
   oBtn.addEventListener("click", test, false);
   funtion test(){ 
       // 事件处理函数
   }
   ```

   重复添加，不会覆盖之前添加的监听器，但是如果事件类型、事件处理函数和最后一个布尔参数都相同，则不会重复执行

   IE8 及以下不支持 addEventListener，可用 attachEvent 代替

   ```javascript
   var oBtn = document.getElementsByTagName('button')[0];
   oBtn.attachEvent("onclick", funtion(){
   	// this -> window
       }); 
   // 区别于 addEventListener，第一个参数使用 'onclick'，而不是 'click'
   // 并且内部 this 指向 window
   // 对于 attachEvent，如果事件类型、事件处理函数都相同，还是会重复执行
   ```

   兼容性封装

   ```javascript
   function addEvent(elem, type, fn) {
       if (elem.addEventListener) {
           elem.addEventListener(type, fn, false);
       } else if (elem.attachEvent) {
           elem.attachEvent('on' + type, function(ev) {
                   fn.call(elem, ev); // call 兼容性比 bind 好
               });
       } else {
           elem['on' + type] = fn;
       }
   }
   ```

4. 解除绑定

   ```javascript
   oBtn.onclik = null;
   oBtn.removeEventListener("click", test, false); // 解除 addEventListener
   oBtn.detachEvent('onclick', test); // 解除 attachEvent
   ```

   示例：点击一次后清除事件反馈

   ```javascript
   oBtn.onclik = function() {
   	// ...
       this.onclick = null;
   }
   // 非严格模式
   oBtn.addEventListener("click", funtion() {
   	// ...
       this.removEventListener('cilck', arguments.callee, false);
   	}, false);
   // 严格模式
   oBtn.addEventListener("click", funtion temp() {
   	// ...
       this.removeEventListener('click', temp, false);
   	}, false);
   ```

## 事件冒泡和捕获

1. 事件冒泡：当一个元素发生事件时，该事件会向父级元素传递，按由子到父的顺序触发一连串的事件反馈，称之为事件冒泡

   DOM 上的嵌套关系会产生事件冒泡，例如两个 div 嵌套，点击内部的 div，触发内部 div 的点击事件，内部 div 的点击事件处理函数进行响应，这个事件向其父级即外部 div 传递，外部 div 也有点击事件，外部 div 所绑定的点击事件反馈也会响应

   ```html
   <div class="outer">
       <div class="inner"></div>
   </div>
   ```

   ```javascript
   var outer = document.getElementsByClassName('outer')[0],
       inner = outer.getElementsByClassName('inner')[0];
   outer.addEventListener('click', function () {
       console.log('bubble outer');
   }, false);
   inner.addEventListener('click', function () {
       console.log('bubble inner');
   }, false);
   // addEventListener 最后一个参数默认值为 false，表示事件冒泡
   // 点击 inner，打印出
   // bubble inner 
   // bubble outer
   ```

2. 事件捕获：当一个元素发生事件时，该事件会向父级元素传递，按由父到子的顺序触发一连串的事件反馈，称之为事件捕获

   事件捕获与事件冒泡的触发顺序相反，同样需要 DOM 上的嵌套关系

   ```javascript
   outer.addEventListener('click', function () {
       console.log('outer');
   }, true);
   inner.addEventListener('click', function () {
       console.log('inner');
   }, true);
   // addEventListener 最后一个参数使用 true，表示事件捕获
   // 点击 inner，打印出
   // outer
   // in
   ```

3. 捕获和冒泡的执行顺序

   ```javascript
   outer.addEventListener('click', function () {
       console.log('bubble outer');
   }, false); // 冒泡
   inner.addEventListener('click', function () {
       console.log('bubble inner');
   }, false); // 冒泡
   outer.addEventListener('click', function () {
       console.log('outer');
   }, true); // 捕获
   inner.addEventListener('click', function () {
       console.log('inner');
   }, true); // 捕获
   // 点击 inner，打印出
   // outer
   // bubble inner
   // inner
   // bubble outer
   ```

   点击一个元素，元素即事件源，若事件源绑定了事件处理函数，且设定了事件捕获，则先执行捕获，捕获执行完毕后，按照绑定顺序执行该事件源绑定的事件，如果设定了事件冒泡，再执行冒泡

4. focus blur change submit reset select 事件没有冒泡和捕获，IE 浏览器没有事件捕获

## 阻止事件冒泡

1. 阻止冒泡的方法

   Event 的原型上有 stopPropagation 方法，可以阻止冒泡，是 w3c 的规范

   Event 的原型上有 cancleBubble 属性，赋值为 true，可以阻止冒泡

2. addEventListener 绑定事件处理函数，拿到事件对象

   ```javascript
   var outer = document.getElementsByClassName('outer')[0],
       inner = outer.getElementsByClassName('inner')[0];
   inner.addEventListener('click', function (ev) {
       	console.log(ev); // 事件对象 ev
       	ev.stopPropagation(); // 阻止事件冒泡
       }, false);
   ```

3. IE 浏览器没有 stopPropagation 方法，可以使用 cancelBubble 属性

   注意：IE 浏览器中事件对象存放在 window.event 中。IE8 不支持 addEventListener 方法

   ```javascript
   // 封装阻止冒泡的方法
   function cancelBubble(ev) {
       if (ev.stopPropagation) {
           ev.stopPropagation();
       } else ev.cancelBubble = true; // 兼容 IE8 及以下
   }
   // 使用上文中封装好的 addEvent 方法
   function addEvent(elem, type, fn) {
       if (elem.addEventListener) {
           elem.addEventListener(type, fn);
       } else if (elem.attachEvent) {
           elem.attachEvent('on' + type, function (ev) {
               fn.call(elem, ev);
           });
       } else {
           elem['on' + type] = fn;
       }
   }
   // 绑定事件处理函数
   var outer = document.getElementsByClassName('outer')[0],
       inner = outer.getElementsByClassName('inner')[0];
   addEvent(inner, 'click', function (ev) {
           var ev = ev || window.event; // IE 兼容性写法
       	cancelBubble(ev); // 阻止冒泡
       });
   ```

## 阻止默认事件

1. 三种方法

   - 事件对象 preventDefault() 方法，兼容 IE9 及以上
   - 事件对象 returnValue = false，兼容 IE8 及以下
   - 事件处理函数 return false

2. 兼容性写法

   ```javascript
   function preventDefaultEvent(ev) {
       if (ev.preventDefault) {
           ev.preventDefault();
       } else ev.returnValue = false; // 兼容 IE8 及以下
   }
   ```
   
3. 右键菜单事件

   ```javascript
   document.oncontextmenu = function (ev) {
       var ev = ev || window.event;
       // 1. ev.preventDefault();  // IE9 及以上
       // 2. ev.returnValue = false; // IE8 及以下
       // 3. return false;
   }
   ```

4. a 标签跳转事件

   href 使用伪协议

   ```html
   <a href="javascript:void(0);">a 标签</a> 
   <a href="javascript:;">a 标签</a> 
   <a href="#">a 标签</a> <!--跳转到当前页面顶部-->
   ```

   onclick 事件 return false

   ```html
   <a href="http://www.baidu.com" onclick="return false">a 标签</a>
   <a href="http://www.baidu.com" onclick="return test(),false">a 标签</a>
   <!--第二个是利用了 “,” 分隔符会返回最后一个的特点，与 test 方法无关-->
   ```

   绑定事件处理函数

   ```html
   <!--内联绑定-->
   <a id='taga' href="http://www.baidu.com" onclick="return test()">a 标签</a>
   <!--句柄绑定-->
   <script>
       document.getElementById('taga').onclick = test;
       function test(ev) {
          var ev = ev || window.event;
       	// 1. ev.preventDefault();  // IE9 及以上
       	// 2. ev.returnValue = false; // IE8 及以下
       	// 3. return false;
       }
       // 前两种方式在使用内联属性绑定时，不需要在属性上加 return，第三种则需要
   </script>
   ```

   > 表单的 action 属性支持 `javascript:` 伪协议，onsubmit 或者提交按钮点击事件都可以绑定处理函数，阻止提交的方法和阻止 a 标签跳转的方法类似

## 冒泡捕获流

1. 事件流：描述从页面中接收事件的顺序

2. 事件冒泡流：微软 IE 提出，Event Bubbling

3. 事件捕获流：网景 Netscape 提出，Event Capturing

4. 事件流三个阶段：事件捕获阶段、处于目标阶段、事件冒泡阶段

   元素触发事件时，首先事件捕获阶段，由父到子的执行事件处理函数，然后处于目标阶段，该元素的事件处理函数按绑定顺序执行，最后事件冒泡阶段，由子到父的执行事件处理函数

## 事件和事件源

1. 事件即事件对象，可以由事件处理函数的参数拿到

   IE8 及以下中事件对象存放在 window.event 中

   ```javascript
   // btn 按钮元素
   btn.onclick = function(ev) {
       var ev = ev || window.event; // IE8 兼容性写法
   }
   ```

2. 事件源即事件源对象，是发生事件的元素，即事件发送器，可以从事件对象中获取

   IE8 及以下只有 srcElement，firefox 低版本只有 target，chrome 两者都有

   ```javascript
   // btn 按钮元素
   btn.onclick = function(ev) {
       var ev = ev || window.event; // IE8 兼容性写法
       var tar = ev.target || ev.srcElement; // 获取事件源的兼容性写法
   }
   ```

## 事件委托

1. 事件委托也叫事件代理，指对父级元素绑定事件处理函数，通过获取事件源来处理子元素

2. 示例：点击按钮使列表 ul 增加 li 元素，点击每个 li 元素打印出其中的内容（innerHTML）

   如果不使用事件委托，需要循环对每个 li 进行绑定，点击按钮添加新的 li 元素后也要进行绑定，效率低下

   使用事件委托，直接对 ul 绑定点击事件处理函数，获取事件对象、事件源对象，再对源对象进行处理

   ```html
   <body>
   <button>btn</button>
   <ul>
       <li>1</li>
       <li>2</li>
       <li>3</li>
       <li>4</li>
   </ul>
   <script>
       var oBtn = document.getElementsByTagName('button')[0],
           oList = document.getElementsByTagName('ul')[0],
           oLi = oList.getElementsByTagName('li');
       oBtn.onclick = function () {
           var li = document.createElement('li');
           li.innerText = oLi.length + 1;
           oList.appendChild(li);
       }
       oList.onclick = function (ev) {
           var ev = ev || window.event,
               tar = ev.target || ev.srcElement;
           // tar 即为被点击的 li 元素
           console.log(tar.innerHTML); 
           // 返回在所有兄弟元素中的索引，借用数组 indexOf 方法
           console.log(Array.prototype.indexOf.call(oLi, tar));
       }
   </script>
   </body>
   ```

