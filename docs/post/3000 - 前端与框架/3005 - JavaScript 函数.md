---


title: JavaScript 函数
date: 2020/3/17
description: 本文介绍 JavaScript 函数的组成，函数的递归、立即执行函数、call/appaly/bind、caller/callee
tag: [前端基础, JavaScript]

---



# JavaScript 函数

## 函数的意义

1. 数学中的函数

   $y=f(x)$，对于一个 x 变量有唯一一个 y 与之对应

2. 编程中的函数

   即函数式编程 -> 模块的单一责任制

   一个功能或程序段被封装的过程

   好处：低耦合，高类聚，易复用

   ```javascript
   var test = function(){
       // ... 
       return;
   }
   ```

3. JavaScript 函数的组成

   函数名、参数、返回值

## 函数的声明

1. 声明方式

   ```javascript
   // 第一种，一般声明式
   funtion test1(){
   
   }
   // 第二种，函数字面量赋值式
   var test2 = function(){
       
   }
   ```

   注意：

   ```javascript
   var test = function test1(){
       // ...
       test1()// 内部可调用
   }
   console.log(test.name); // 打印出 test1
   test(); // 可以执行
   test1(); // 外部不可见，报错
   ```

2. 函数命名
   - 以字母、$、下划线开头，可包含数字
   - 小驼峰命名，`myTestFunction`
   - 工具方法可以使用下划线连接多单词

## 函数的参数

2. 形式参数

   ```javascript
   // 未传入的形式参数，默认 undefined
   function test(a, b, c) {
   	console.log(a, b, c);
   }
   test(1,2); // 1 2 undefined
   ```
2. 实际参数

    通过 arguments 可以获取传入的实际参数数组

   ```javascript
   function test(a, b) {
       console.log(arguments.length); // 3
       console.log(arguments); // [1,2,3]
   }
   test(1,2,3);
   ```

      在函数内部可以更改实际参数数组的内容

   ```javascript
   function test(a, b) {
   a = 10; // 可以更改
   b = 11; // 不能更改，没有传入该参数，默认 undefined
   console.log(arguments[0]); // 10
   console.log(arguments[1]); // undefined
   }
   test(1);
   ```

   > arguments 是数组，存在堆内存中
   >
   > 形式参数和 arguments 成员是具有映射关系的

4. 参数默认值

   ```javascript
   // es6 语法
   // es2015 支持，不兼容低版本浏览器
   function test(a = 1, b = 2) {
       console.log(a,b);
   }
   test(); // 打印 1 2，相当于 test(undefined,undefined)
   test(NaN); // 打印 NaN，2
   // es5 语法
   function test(a, b) {
       var a = arguments[0] === undefined || 1;
       var b = arguments[0] === undefined || 2;
       console.log(a,b);
   }
   test(); // 打印 1 2，相当于 test(undefined,undefined)
   test(NaN); // 打印 NaN，2
   ```

## 函数的返回值

> 终止函数执行，返回一个值

1. 不写 return，默认返回 undefined

   ```javascript
   // 默认 return undefined 即 retuen;
   function test(){
       // ...
   }
   console.log(test()); // undefined
   ```

2. 可以返回任何值

   ```javascript
   return 1;
   return false;
   // 返回数组
   return [1,2,3];
   // 返回方法
   return funtion(){}
   ```

## 全局变量

1. 函数体内部可以访问外部声明的变量

    ```javascript
    var a = 1; // 全局变量
    function test1() {
    	var b = 2; // 局部变量
    	console.log(a); // 1
    	funtion test2() {
    		var c = 3; // 局部变量
    		console.log(b); // 2
    	}
    	test2();
    	console.log(c); // 报错
    }
    test1();
    ```

2. 同级函数内部的局部变量不能相互访问

   ```javascript
   function test1() {
       var a = 1;
   }
   function test2() {
       console.log(a);
   }
   test2(); // 报错
   ```

## 函数的递归

1. 递归算法

   大问题可以划分小问题

   大问题与小问题解决思路一致

   写出递推公式

   找出终止条件

   实现递归代码

2. 递归示例

   求 n 的阶层
   
   ```javascript
   function fact(n) {
       return n === 0 || n === 1 ? 1 : n * fact(n - 1);
   }
   ```
   
   斐波那契数列
   
   ```javascript
   function fb(n) {
          n <= 0 : return 0 ："";
          n <= 2 : return 1 : "";
          return fb(n - 1) + fb(n - 2);
   }
   ```

## 立即执行函数

1. IIFE

   IIFE，immediately-invoked funtion，也叫自执行函数

2. 特点

   立即执行，自动销毁

3. 写法

   > 函数声明式 ->  表达式 -> () -> 执行

   常用写法

   ```javascript
   (function(){
       
   })(); // 常用写法
   (function(){
       
   }()); // w3c 建议写法
   ```

   其他写法

   ```javascript
   !function(){
       
   }();
   +function(){
       
   }();
   -function(){
       
   }();
   0 || function(){
       
   }();
   1 && funtion(){
       
   }()
   ```

   需要递归可以命名，但是外部访问不到

   ```javascript
   (function test(){
       test();
   })(); // 需要递归可以命名，但是外部访问不到
   test(); // 报错
   ```

   注意：

   ```javascript
   function test(a) {
       console.log(a);
   }(); // 报错
   function test(a) {
       console.log(a);
   }(1); // 不报错，也不打印
   // 因为浏览器将 (1) 解析成表达式，前面解析成函数声明式
   ```

4. 返回值

   ```javascript
   var test = (function() {
       return 1; // 用外部变量接收
   })
   ```

## call、apply 与 bind

> 改变函数的 this 指向

1. call

   ```javascript
   function test() {
       
   }
   test(); // 浏览器隐式执行为 test.call()
   ```

   改变 this 指向

   ```javascript
   function Car(color, price){
       this.color = color;
       this.price = price;
   }
   var myCar = {};
   Car.call(myCar, "black", "20 万");
   Car.apply(myCar, ["black", "20 万"]);
   console.log(myCar); // {color : "black", price : "20 万"}
   ```

2. apply

   ```javascript
   function Car(color, price){
       this.color = color;
       this.price = price;
   }
   var myCar = {};
   Car.apply(myCar, ["black", "20 万"]); // 用数组装参数
   console.log(myCar); // {color : "black", price : "20 万"}
   ```

3. bind

   与 call、apply 不同的是，bind 改变指向后不会执行，可以加 () 执行

   兼容 IE9 及以上
   
   ```javascript
   function Car(color, price){
       this.color = color;
       this.price = price;
   }
   var myCar = {};
   Car.bind(myCar)("black", "20 万"); // 用数组装参数
   console.log(myCar); // {color : "black", price : "20 万"}
   ```

## caller 和 callee

1. callee

   返回 arguments 对应的函数

   ```javascript
   function test(a, b, c){
       console.log(arguments.callee.length); // 函数有 length 属性，返回形参列表长度
   }
   test(1, 2, 3); 
   ```

   自执行函数中使用递归

   ```javascript
   // 计算 1 + 2 + ... + 100
   (function(n) {
       if(n <= 1) {
           return 1;
       }
       return n + arguments.callee(n - 1);
   })(100);
   ```

2. caller

   返回调用当前函数的函数

   ```javascript
   function test1() {
       test2();
   }
   function test2() {
   	console.log(test2.caller);
   }
   test1(); // 打印出 test1
   ```

   

