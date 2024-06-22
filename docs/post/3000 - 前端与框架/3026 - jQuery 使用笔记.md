---

title: jQuery 使用笔记
date: 2020/2/23
description: 本文介绍 jQuery 选择器、属性操作、样式操作、DOM 操作、事件处理、Ajax、动画等 API 的使用的方法
tag: [前端框架, jQuery]

---



# jQuery 使用笔记

## jQuery 基础

1. jQuery 介绍
   - 一个快速、轻量、丰富的 JavaScript 类库
   - jQuery 官方网站：https://jquery.com
   - jQuery 开发文档：http://www.bejson.com/apidoc/jquery
   
2. jQuery 优点
   
   - 开源、免费、易学
   - 兼容性好
   - 强大的选择器
   - 链式操作
   - 便捷的的 dom 操作
   - 可靠的事件机制
   - 简单的 ajax 
   - 丰富的动画和特效插件
   
   ```javascript
   $(document).ready(funtion(){
                     $("#box").html("Hello").width(400).height(300).css("border","1px solid #ccc").css("padding","10px").append("<p>Hello</p>");
   })
   ```
   
3. 获取 jQuery 

   - 官网下载所需版本

   - 从 CDN 服务器上引用，如  www.bootcdn.cn/jquery

     ```html
     <script src="https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js"></script>
     ```

   - npm 中运行 `npm install jquery` 命令自动下载

4. jQuery 版本

   - jQuery 2.0 及以上版本，不兼容 IE 8
   - jQuery 2.0 以下版本兼容 IE 8
   - jQuery 开发版本：jquery.js，有详细的注释，帮助开发者学习和理解
   - jQuery 压缩版本：jquery.min.js，经过压缩，体积小，加载快

5. jQuery 的兼容性引入

   ```html
   <!--使用 IE  浏览器的条件注释-->
   <!--chrome、firefox、safari、opera、ie9 及以上-->
   <!--[if gt IE 8]>-->
   <script src="https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js"></script>
   <!--<![endif]-->
   
   <!--ie8 及以下-->
   <!--[if lte IE 8]>
   <script src="https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js"></script>
   <![endif]-->
   ```

6. jQuery 的使用

   ```javascript
    // jQuery 入口函数
       $(document).ready(function () {
           // code...
       });
       $(function () {
           // code...
       });
   ```

   $(document).ready() 和 window.onload 功能相似，但存在差异

   - ready 在 dom 绘制完毕后执行
   - onload 在图片以及其他外部文件全部加载完毕后执行

7. jQuery Dom 对象

   - querySelector("#box")：原生 js dom 对象

   - $("#box")：jquery dom 对象，不能使用原生方法

   - 相互转换

     ```javascript
     let jsBox = document.querySelector("#box");
     $(jsBox).html("Hello");// 使用 $()，js dom object -> jq dom object
     let jqBox=$("#box");// 获取到的是一个 dom object 的集合
     jqBox[0].innerHTML="Hello";// 使用 [下标]，jq dom object -> js dom object
     ```

8. jQuery 全局对象
   - jQuery，别名 $
   - $ 的功能
     - 参数为 js dom object，将其转换为 jquery dom object
     - 参数为 选择器，获取 jquery dom object
     - 参数为以 `<` 开头的标签，创建元素，可使用 `appendTo` 加入到页面中

## jQuery 选择器

1. 基本选择器

   ```javascript
   $("#box") // id selector 选择 id 为 box 的标签
   $(".item") // class selector 选择 class 为 item 的标签
   $("li") // tag name selector 选择全部 li 标签
   $("*") // gloal selector 选择全部标签
   $("li.item") // combo selector 选择 clss 为 item 的 li 标签
   $("li,p") // multi selector 选择所有 li 和 p 标签
   ```

2. 层级选择器

   ```javascript
   $("ul li") // 选择 ul 后代元素中的 li
   $("ul>li") // 选择 ul 子元素中的 li
   $("#item+li") // 选择 #item 后一个兄弟元素 
   $("#item~li") // 选择 #item 后所有兄弟元素
   ```

3. 筛选选择器

    ```javascript
    $("ul li:first") // 选择 li 中的第一个 li 标签
    $("ul li:last") // 选择 li 中的最后一个 li 标签
    $("ul li:eq(i)") // 选择 li 中第 i 个，从 0 开始
    $("ul li:lt(i)") // 选择 li 中小于 i 的，从 0 开始
    $("ul li:gt(i)") // 选择 li 中大于 i 的，从 0 开始
    $("ul li:odd") // 选择奇数次序的元素，从 0 开始
    $("ul li:even") // 选择偶数次序的元素，从 0 开始
    $("ul li:not(.item)") // 选择 li 中 class 不是 item 的元素
    $(":header") // 选择所有标题标签
    $(":focus") // 选择获取焦点的元素
    $(":target") // 选择 url 指向的锚点元素，锚点可以是 a 标签，也可以是 id
    ```

4. 内容选择器

    ```javascript
    $("li:contains(str)") // 选择内部包含 str 的 li 标签
    $("li:has(.item)") // 选择包含 class 是 item 的后代元素的 li 标签
    $("ul li:empty") // 选择没有内容的 li，innerHTML.length = 0
    $("ul li:parent") // 选择有内容（文本或子元素）的 li，innHTML.length != 0
    ```

5. 可见性选择器

    ```javascript
    $(":visible") // 选择可见元素
    $(":hidden") // 选择不可见元素
    ```

6. 属性选择器

    ```javascript
    $("img[alt]") // 选择有 alt 属性的 img 标签
    $("img[alt='str']") // 选择有 alt = 'str' 的 img 标签
    $("img[alt!='str']") // 选择有 alt != 'str' 的 img 标签
    $("img[alt^='s']") // 选择有 alt 以 s 开头的 img 标签
    $("img[alt$='r']") // 选择有 alt 以 r 结尾的 img 标签
    $("img[alt][title]") // 选择同时具有 alt、title 属性的 img 标签
    ```

7. 子元素选择器

    ```javascript
    // -child 对所有兄弟元素排序，从 1 开始
    $("li:first-child") // 选择是 li 且排在所有兄弟元素第一个的 li 标签
    $("li:last-child") // 选择是 li 且排在所有兄弟元素最后一个的 li 标签
    $("li:nth-child(i)") // 选择是 li 且排在所有兄弟元素第 i 个的 li 标签
    $("li:nth-last-child(i)") // 选择 li 且排在所有兄弟元素倒数第 i 个 li 标签
    $("li:only-child") // 选择没有兄弟元素的 li 标签
    // -of-type 对指定标签元素排序，从 1 开始
    $("li:first-of-type") // 选择是 li 且排在所有兄弟 li 第一个的 li 标签
    $("li:last-of-type") // 选择是 li 且排在所有兄弟 li 最后一个的 li 标签
    $("li:nth-of-type(i)") // 选择是 li 且排在所有兄弟 li 第 i 个的 li 标签
    $("li:nth-last-of-type(i)") // 选择是 li 且排在所有兄弟 li 倒数第 i 个的 li 标签
    $("li:only-of-type") // 选择可以有兄弟元素，但同标签元素只有它一个的 li 标签
    ```

8. 表单选择器

    ```javascript
    // 表单控件选择器
    $(":input") //选择所有表单控件 input/select/textarea/button...
    $(":text") // 选择文本框
    $(":password") // 选择密码框
    $(":radio") //选择单选按钮
    $(":checkbox") // 选择多选按钮
    $(":file") //选择文本域
    $(":submit") // 选择 input（type=submit）、button（不指定 type 或 type=submit）
    $(":reset") // 选择 input（type=reset）、button（type=reset）
    $(":button") // 选择 button、input（type=button）
    // 表单对象选择器
    $(":disabled") // 选择不可用元素
    $(":enabled") // 选择可用元素
    $(":checked") // 选择 radio、checkbox 被选中的元素
    $(":selected") // 选择下拉列表被选中的元素
    ```

## jQuery 属性与样式

1. 属性操作

   ```javascript
   attr(attrName[,attrValue]) // 操作所有属性，包括自定义属性
   prop(attrName[,attrValue]) //操作符合规范的属性
   removeAttr((attrName) // 删除属性
   removeProp((attrName) // 删除通过 prop() 添加的属性
   attr("class",value) // 属性设置
   hasClass(className) // 判断是否有相应 class
   addClass(className) // 添加 class
   removeClass(className) // 移除 class
   toggleClass(className) // 该 class 存在就移除，没有就添加
   ```

   for example

   ```html
   <img id="img-item" src="" testAttr="str"></img>
   <script src="/lib/jQuery-3.4.1.js"></script>
   <script type="text/javascript">
       // 获取属性
       $("#img-item").attr("src"); // 获取 src
       $("#img-item").prop("src"); // 获取 src
       $("#img-item").attr("testAttr"); // 获取 testAttr
       $("#img-item").prop("testAttr");// 获取不到不符合规范的属性，undefined
       // 设置属性
       $("#img-item").attr("src", "..."); // 设置 src
       $("#img-item").prop("src", "..."); // 设置 src
   </script>
   ```

2. 样式操作

   ```javascript
   // css
   css("background-color","#ccc") // 设置或获取 css 属性
   css({"width":"400px","height":"200px"}) // 一次设置多个 css 属性
   // 位置
   offset() // 获取或设置元素在文档中的坐标 (top,left)
   position() // 元素在定位的祖先元素中的坐标 (top,left)
   srollTop() // 获取或设置 Y 滚动条位置
   scrollLeft() // 获取或设置 X 滚动条位置
   // 尺寸
   width(),height() // 设置或获取内容尺寸
   innerWidth(),innerHeight() // 设置或获取 内容尺寸与 padding 的和
   outerWidth(),outHeight() //设置或获取盒子尺寸
   ```

3. 文本操作

   ```javascript
   html([str]) // 设置或获取 html 代码，innerHTML
   text([str]) // 设置或获取文本内容，innerText
   val([str]) // 获取或设置文本框、文本域，相当于 attr("value")
   ```

## jQuery 筛选

1. 过滤

   ```javascript
   // jq dom object function
   $("ul li").first() // 返回第一个 jq dom object
   $("ul li").last() // 返回最后一个 jq dom object
   $("ul li").eq(i) // 返回第 i 个 jq dom object
   $("ul li").not(".itme") // 排除满足 class = item 的对象后，返回集合
   $("ul li").filter(".item") // 返回满足 class = item 条件的对象集合
   $("ul li").slice(a[,b]) // 返回 a 到最后一个元素或 a 到 b（左闭右开）的对象集合
   $("ul li").has('.item') // 返回有 class 为 item 的子元素的对象集合
   ```

2. 查找

   ```javascript
   $("ul").children([selector]) // 选取满足条件的子元素
   $("ul").find("li") // 选取满足条件的后代元素
   $("ul").parent([selector]) // 选取满足条件的父元素
   $("ul").parents([selector]) // 选取满足条件的祖先元素
   $("ul").parentsUntil([selector]) // 选取所有祖先元素直到 selector（不包括 selector）
   $("ul").offsetParent() // 选取第一个定位的祖先元素，没有则选中 html 标签
   $(".item").next([selector]) // 选取满足条件的后一个兄弟元素
   $(".item").nextAll([selector]) // 选取满足条件的后面所有兄弟元素
   $(".item").nextUntil([selector]) // 选取后面所有兄弟元素直到 selector（不包括 selector）
   $(".item").prev([selector]) // 选取满足条件的前一个兄弟元素
   $(".item").prevAll([selector]) //  选取满足条件的前面所有兄弟元素
   $(".item").prevUntil([selector]) // 选取前面所有兄弟元素直到 selector（不包括 selector）
   $(".item").siblings([selector]) // 选取所有兄弟元素
   ```

3. 串联

   ```javascript
   $("ul").find("li").add("p") // 将选中元素加入到当前对象集合
   $("ul").find("li").addBack("p") // 将调用者加入当前对象集合
   $("ul").find("li"),end() // 返回最后一次破坏性操作之前的集合
   ```

4. 遍历

   ```javascript
   $("ul li").each(function(index,ele){
       // 对序号 index 和 元素对象 ele 进行处理 
   })
   $("ul li").map(function(index,ele){
       // 对序号 index 和 元素对象 ele 进行处理
       // 并产生新的集合
       return $(ele).html();
   })
   $("ul li").length // 返回集合元素个数
   $("ul li").index() // 返回元素在兄弟元素中的索引
   $("ul li").get([i]) // 返回集合中对应索引的原生 dom 对象，不给参数则返回原生对象数组
   $("ul li").eq(i) // 返回集合中对应索引的 jquery dom 对象
   ```

## jQuery DOM 操作

1. 创建

   ```javascript
   var $img = $("<img src='...'>") // 创建 img 标签元素
   ```

2. 插入

   ```javascript
   // 成为子元素最后一个
   $("#box").append($img) 
   $("#box").append("<img src='...' />")
   $("<img>").appendTo("#box")
   // 成为子元素的第一个
   $("#box").prepend($img) 
   $("#box").prepend("<img src='...' />")
   $("<img>").prependTo("#box")
   // 成为后一个兄弟元素
   $("#box").after($img) 
   $("<img>").insertAfter("#box")
   // 成为前一个兄弟元素
   $("#box").before($img)
   $("<img>").insertbefore("#box")
   ```

3. 包裹

   ```javascript
   $("#box img").warp("<li>") // 每个 img 都被 li 包裹
   $("#box img").warpAll("<li>") // 使用一个 li 包裹 img 
   $("#box").warpInner("<li>") // 用 li 包裹所有子元素
   $("#box img").unwarp(); // 去掉 img 的父元素
   ```

4. 替换

   ```javascript
   $("#item").replaceWith($("<img src='...' />"))
   $("<img src='...' />").replaceAll("#item")
   ```

5. 删除

   ```javascript
   $("#box").empty() // 清空所有内容
   $("#box").remove() // 删除调用者
   $("#box").detach() // 删除调用者
   // 将 romove() 和 detach() 返回值重新 append 到指定位置，可以实现恢复
// 区别是 detach() 保留事件，remove() 不保留
   ```

6. 克隆

   ```javascript
   $("#box").clone() // 返回完整复制的 jq dom object
   ```

## jQuery 事件处理

1. 事件绑定

   ```javascript
   // 事件名方法 支持链式操作
   $("#btn").click(function(){})
   $("#btn").mouseover(function(){}).mouseout(function(){})
   // on 方法 可以用 {} 绑定多个事件
   $("#btn").on("click",function(){})
   // one 方法 只会绑定一次，触发后失效
   $("#btn").one("dblclick"function(){})
   // 解除事件
   $("#btn").off("click") // 不指定事件名则解除全部事件
   ```

2. 事件委派

   ```javascript
   // jquery 中许多事件委派方法都被弃用了，可以使用 on() 代替
   $("#box").on("click","li",function(){})
   // 给 div#box 中的每一个 li 添加 click 方法，包括新 append 进去的 li
   ```

3. 事件对象

   ```javascript
   $("#box").on("click",function(event){
       console.log(event.type); // 事件名称
    console.log(event.pageX); // 鼠标在文档横坐标
       console.log(event.pageY); // 鼠标在文档众坐标
       console.log(event.target) // 触发事件的元素
       console.log(event.which) // 按下键盘的 ascii 码
       event.prevent(); // 阻止默认操作，如 a 标签的 href
       event.stopPropagation(); // 阻止事件冒泡，即不会触发父级元素的事件
       // return false 既可以阻止事件冒泡，又可以阻止默认操作
   })
   ```

## jQuery 动画

1. 基本效果

   ```javascript
   // 变化：透明度、大小相关的属性、外边距
   // 参数：speed：normal，fast，slow 或数值（毫秒数）|| callback：回调方法
   hide(); // 显示
   show(); // 隐藏
   toggle(); // 显示和隐藏切换
   ```

2. 滑动

   ```javascript
   // 变化：垂直方向上的属性
   // 参数：speed || callback
   slideUp(); // 展开
   slideDown(); // 收起
   slideToggle(); // 展开和收起切换
   ```

3. 淡出淡入

   ```javascript
   // 变化：透明度
   // 参数：speed || callback
   fadeIn(); // 淡入
   fadeOut(); // 淡出
   fadeToggle(); // 状态切换
   ```

4. 自定义动画

   ```javascript
   // 参数：{} || speed || caback
   animate({"width":500,"padding":20},3000,function(){
       // callback...
   })
   ```

## jQuery Ajax

1. get/post 方法

   ```javascript
   // get 请求 数据包含在 url
   $.get(url,function(){
       // callback...
   },dataType)
   // post 请求 不指定 data 则不传递数据
   // data 格式：{name:"Jett",password:"1234"} || name=Jett&&password=1234
   $.post(url,data,function(){
       // callback...
   },dataType)
   ```

2. ajax 方法

   ```javascript
   $.ajax({
       url:"...",
       type:"get",
       asny:true,
       dataType:"json" // 指定为 json，会自动转换成 js object
       data:{name:"Jett",password:"1234"} // 或 "name=Jett&&password:1234"
       success:function(){
           // callback...
       }
       error:function(){
           // callback
       }
   })
   ```

3. serialize()

   ```javascript
   $("#myForm").serilaze()
   // 返回 form 中 指定 name 的控件内容组成的字符串
   ```

## jQuery 工具方法

1. 数组

   ```javascript
   // $.each()：遍历数组和类数组
   var list = [1,2,3,4];
   $.each(,funtion(index,item){
   	console.log(index,item);
   })
   // $.map：操作数组和类数组，返回新的集合
   list = $.map(,funtion(index,item){
       return item + 1; // 将 list 每个元素 +1
   })
   ```

2. 函数

   ```javascript
   // 相当于原生 js bind() 方法
   function test(){
       // this -> window
   }
   $.proxy(test,{name:"Jett"}); //将 test 函数内部 this 指向 {name:"Jett"} 对象
   ```

3. 判断

   ```javascript
   $.type(); // 返回类型
   $.isFunction(); // 是否是方法
   $.isWindow(); // 是否是 window 对象
   $.isNumberic(); // 是否是数字（不一定是数字类型，NaN 返回 false）
   ```

4. 字符串

   ```javascript
   $.trim(); // 去掉字符串两边空格
   $.param({name:"Jett",age:"22"}); // 对象 -> 字符串 name=Jett&&age=22
   ```

   

   

