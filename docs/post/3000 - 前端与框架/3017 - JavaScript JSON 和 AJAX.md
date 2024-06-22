---

title: JavaScript JSON 与 AJAX
date: 2020/4/4
description: 本文介绍 JSON 的概念和基本格式、JSON 与对象的转换、原生 AJAX 的使用、JSONP 解决跨域的方法以及 AJAX 和 JSONP 工具函数的封装
tag: [前端基础, JavaScript]

---



# JavaScript JSON 与 AJAX

## JSON 的概念

1. 所有编程语言都离不开的三大数据结构

   scalar 标量：数字和字符串

   sequence 序列：数组和列表

   mapping 映射：键值对

2. JSON：JavaScript Object Notation，轻量级的数据交互格式

3. JSON 数据是没有方法的普通对象，或者是包含这种对象的数组

   ```javascript
   var person = {
       "name": "jett",
       "age": "22",
       "sex": "男"
   }
   var persons = [
       {
       "name": "jett",
       "age": "22",
       "sex": "男"
   	},
       {
       "name": "lily",
       "age": "20",
       "sex": "女"
   	}
   ]
   ```

## JSON 的基本格式

1. 键值对以冒号隔开
2. 键名强制使用双引号
3. 并列数据用逗号隔开
4. 并列数据集合用`[]`包围

## JSON 与对象的转换

1. JSON 转换成 JS 对象

   JSON.parse()

   ```html
   <div id='box' data-info='{"name":"Jett","age":"22"}'></div>
   ```

   ```javascript
   // JSON.parse(str) str -> object
   var box = document.getElementById('box');
   var jsonData = box.getAttribute('data-info');
   var obj = JSON.parse(jsonData);
   console.log(obj);
   // {name:"Jett",age:"22"}
   ```

   eval()

   ```javascript
   var obj = eval('('+jsonData+')');
   // eval 可以执行任何 JS 代码，所以可以将 jsonData 当作代码执行
   // 为安全性考虑，最好使用 JSON.parse()
   ```

2. JS 对象转换 JSON

   JSON.stringify()

   ```javascript
   var obj = {
           name: 'Jett',
           age: 22,
           sex: '男'
       }
   var jsonData  = JSON.stringify(obj);
   console.log(jsonData);
   // {"name":"Jett","age":22,"sex":"男"}
   ```

## AJAX 的概念

1. AJAX：Asynchronous JavaScript and XML，异步的 JavaScript 和 XML

2. AJAX 不是新的编程语言，而是一种使用现有标准的新方法

3. AJAX 最大的优点是在不重新加载整个页面的情况下，可以与服务器交换数据并更新部分网页内容

4. AJAX 工作原理

   浏览器创建 XMLHttpRequest 对象，发送 AJAX 请求

   服务器接收请求，创建响应，返回数据

   浏览器接收数据，动态渲染页面

## AJAX 的基本写法

1. 创建 XMLHttpRequest 对象

   XMLHttpRequest 用于在后台与服务器交换数据

   兼容 IE7 及以上 

   ```javascript
   var xmlhttp;
   if (window.XMLHttpRequest) {
       xmlhttp = new XMLHttpRequest();
   } else {
       // 兼容 IE6/5
       xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
   }
   ```

2. 发送 AJAX 请求

   GET 请求

   url 为请求地址，在地址后使用 `?` 拼接消息内容，如 ?name=Jett&age=22

   ```java
   xmlhttp.open('GET',url, true);
   xmlhttp.send();
   ```

   POST 请求

   send 方法内传入消息内容，如：name=Jett&age=22

   ```javascript
   xmlhttp.open('POST',url, true);
   // xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
   // 通过 setRequestHeader 设置请求头
   xmlhttp.send(data);
   ```

   GET 请求比 POST 更快，但安全性低，且传输数据的大小有限制

   第三参数 true 代表异步，fasle 代表同步

3. 监听响应状态

   XMLHttpRequest 对象有 readystatechange 事件，用于监听 readystate 的改变

   XMLHttpRequest 对象的 readystate 表示 AJAX 请求的状态

   ```javascript
   0: 请求未初始化
   1: 服务器连接已建立
   2: 请求已接收
   3: 请求处理中
   4: 请求已完成，且响应已就绪
   ```

   XMLHttpRequest 对象的 status 表示 http 请求的状态码

   ```javascript
   200: 请求
   404: 未找到页面
   ```

   监听 readystatachange 事件，并判断状态

   当 xmlhttp.readyState 为 4，xmlhttp.status 为 200 时，代表请求成功且响应就绪

   ```javascript
   xmlhttp.onreadystatechange=function() {
       if (xmlhttp.readyState==4 && xmlhttp.status==200) {
           // ...
       }
   }
   ```

4. 处理响应

   XMLHttpRequest 对象的 responseText 或 responseXML 属性用于接收服务端返回的数据

   顾名思义，respnseXML 用于接收 XML 格式的响应数据，responseText 用于接收一般数据

   ```javascript
   xmlhttp.onreadystatechange=function() {
       if (xmlhttp.readyState==4 && xmlhttp.status==200) {
           console.log(xmlhttp.responseText);
           // 获得响应数据并使用
       }
   }
   ```

## JSONP 的概念

1. 跨域请求

   URL = 协议名 + 主机名 + 端口号 + 资源名称

   域 = 协议名 + 主机名 + 端口号

   出于安全性考虑，只有当页面所在域和请求的目的地址在同一域才允许访问

2. JSONP 是一种跨域解决方案

   目前解决浏览器跨域问题的方法有 JSONP、cors 策略等，cors 策略是 HTML5 的新特性，老版本浏览器可能不支持，JSONP 是最常用的处理方式

## JSONP 的原理

1. 在 HTML 众多标签中，有些标签具有跨域功能，如 script、img、iframe

2. JSONP 就是利用 script 标签的跨域能力，动态生成一个 script 标签，指定 src 为请求地址

   页面中定义的方法

   ```html
   <scrip type="text/javascript">
       funtion test(data) {
       	console.log(data);
       }
   </scrip>
   <!--动态生成的 script 标签-->
   <script type="text/javascript" src="htpp://localhost:8888"></script>
   ```

   htpp://localhost:8888 地址返回的数据

   ```javascript
   test('这是请求返回的数据')
   ```

   将生成的 script 标签添加到 DOM 中，浏览器根据 src 请求目的地址，得到返回的数据，因为是 script 标签，浏览器会将返回的数据当成 JS 代码来执行，就是执行页面中定义的方法，刚好可以将其中的参数顺利带到页面中

3. 我们在页面上定义一个函数，将其函数名通过 URL 查询字符串传到服务端，服务端拼接字符串，返回执行该函数的 JS 代码，并将要传递的数据放在参数中，这样在页面上定义好的函数就可以被执行，并且得到了服务端传来的数据，在该函数内执行成功回调，就可以对服务端数据进行处理了

## JSONP 回调函数

1. 对于普通 AJAX 请求我们可以通过监听 XMLHttpRequest 的 readystatechange 事件，判断 readystate 和 status 来知晓请求和响应是否完成，以执行成功回调或出错回调

2. JSONP 方式本质上是利用 script 标签的 src 进行请求，响应情况如下：

- 如果 src 指向资源存在，且其返回的字符串被当成 JS 代码成功执行

    即页面内定义好的函数被成功执行，该函数内的成功回调函数可以通过参数拿到数据进行处理

- 如果 src 指向的目的资源访问不到

    script 标签会触发 error 事件，监听此事件可以获得执行出错回调的时机

    ```javascript
    var script = document.createElement('script');
    script.onerror = funtion() {
        // 执行出错回调函数
    }
    ```

- 如果 src 指向资源存在，返回的字符串会因为是 script 标签而被执行，执行过程中出错

    在执行成功回调函数前，对 script 标签对象添加一个标记属性，监听 script 的 load 事件发生时对象是否有该标签属性

    因为 onload 函数在 script 标签加载完成后执行，script 标签在其引入的代码执行后，才会响应 onload 处理函数，通过判断标记属性是否添加成功，可以知晓 script 标签引入的代码是否成功执行，如果标记属性为 undefined，则执行出错回调

    > 如果触发 error 事件，onerror 事件处理函数将执行，但 onload 将不执行，因为目标资源访问出错，并没有加载完成
    
    ```javascript
    var script = document.createElement('script');
    window.callback = function (res) {
        script['jsonp'] = 1;
        // 执行成功回调函数
    }
    script.onload = function () {
        if (typeof script['jsonp'] === 'undefined') {
            // 执行出错回调函数
        }
    }
    ```

3. 需要注意的是，IE8 及以下 script 标签对象不支持 onerror，也不支持 onload，但支持 onreadystatechange

   通过判断 readystate 来知晓 script 标签的加载状态，当 readystate 为 loaded 或 complete 时，表示 script 标签加载完成，即 script 标签引入的代码已经执行，同样的，在成功回调函数前为 script 对象添加标记属性，通过判断标记属性是否添加成功，可以知晓 script 标签引入的代码是否成功执行，如果标记属性为 undefined，则执行出错回调

   ```javascript
   script.onreadystatechange = function () {
       // 正则表达式判断 readystate 是否为 loaded 或 complete
       if (/loaded|complete/i.test(this.readyState)) {
           if (typeof script['jsonp'] === 'undefined') {
               // 执行出错回调函数
           }
       }
   }}
   ```

4. 函数名动态生成，利用 onload 配合 onreadystate 判断加载状态，执行完毕后 delete 对应函数，并 remove 对应 script 标签节点

   在自己封装 JSONP 函数时，我们可能会在 window 对象下动态添加函数如 callback，这样 script 的 src 指定资源返回形如 callback('数据') 的字符串数据，就可以直接执行此函数并获取数据，但是我们在优化 JSONP 函数时，会希望将动态创建的函数删除，在 IE8 中 delete window 下的属性会报不支持，我们可以在 Window.prototype 上添加函数，同样可以在直接执行，且支持 delete

## AJAX 与 JSONP 的封装

1. 封装一个 ajax 函数，支持 get、post、jsonp 三种形式的请求，以对象形式传入参数

2. 配置项

   ```javascript
   var opt = {
       type: 'get', 
   	url: 'http://...',
   	data: { // 数据使用对象形式
         name: 'zzh',
         age: '21'
       },
   	async: true, // 默认 true
   	success: function(res) {
           
       },
   	error: function() {
           
       },
   	timeout: 3000 // 默认 60000
   }
   ```

3. 代码

   ```javascript
   function ajax(option) {
       // 设置默认参数
       var opt = {
           type: option.type.toUpperCase(),
           url: option.url,
           data: option.data || null,
           async: option.async || false,
           success: option.success,
           error: option.error,
           timeout: option.timeout || 60000
       };
       // 用于 jsonp 的回调函数名
       var callback = 'callback' + new Date().getTime();
   
       var type = opt.type,
           success = opt.success,
           error = opt.error,
           data = parseData(opt.data); // 将 data 对象装换成查询字符串
   
       if (type === 'GET' || type === 'POST') {
           var xhr = new XMLHttpRequest();
           xhr.onreadystatechange = function () {
               if (xhr.readyState === 4 && xhr.status === 200) {
                   success && success(xhr.responseText, xhr.status);
               } else {
                   error && error(xhr.status);
               }
           }
           if (type == 'GET') {
               opt.url += data;
               data = null;
           }
           xhr.open(type, opt.url, opt.async);
           xhr.send(data);
           setTimeout(function () {
               xhr.abort();
               console.error(opt.url + '请求超时');
           }, opt.timeout);
       } else if (type === 'JSONP') {
           var script = document.createElement('script');
           script.src = opt.url + data;
           // 选则存放在 Window 原型上，window 下可以使用
           // 如果直接存放在 window 上，IE8 window 属性不支持 dalete
           Window.prototype[callback] = function (res) {
               script['jsonp'] = 1;
               success && success(res);
           }
           document.body.appendChild(script);
   
           // -[1,] 在 IE8 返回 NaN，IE9 及以上返回 -1
           if (-[1,]) {
               // IE9 及以上支持 onerror
               // onerror 用于请求失败，未执行 callback
               // onload 用于请求成功,但执行 callback 出错
               script.onerror = script.onload = function () {
                   if (typeof script['jsonp'] === 'undefined') {
                       error && error();
                   }
                   script.parentNode.removeChild(script);
                   delete  Window.prototype[callback];
               }
           } else {
               // script.onreadystatechange 兼容 IE8
               script.onreadystatechange = function () {
                   // -[1,] 在 IE8 返回 NaN，IE9 及以上返回 -1
                   if (/loaded|complete/i.test(this.readyState)) {
                       if (typeof script['jsonp'] === 'undefined') {
                           error && error();
                       }
                       script.parentNode.removeChild(script);
                       delete  Window.prototype[callback];
                   }
               }
           }
   
       }
   
       function parseData(data) {
           var arr = [],
               str;
           if (type === 'GET') {
               str = '?';
           } else if (type === 'POST') {
               str = '';
           } else if (type === 'JSONP') {
               str = '?callback=' + callback + '&';
           }
           for (var k in data) {
               arr.push(k + '=' + data[k]);
           }
           return str + arr.join('&');
       }
   }
   // 使用示例
   ajax({
       type: 'jsonp',
       url: 'http://127.0.0.1:8888/',
       data: {
           name: 'jett',
           age: 22
       },
       success: function (res) {
           console.log('接收数据：' + res);
       },
       error: function () {
           console.log('error() 执行了');
       }
   })
   ```

   

