---

title: JavaScript 日期与计时器
date: 2020/3/31
description: 本文介绍 JavaScript 中日期类构造函数 Date 的使用和时间戳的概念，以及设置计时器和清除计时器的方法
tag: [前端基础, JavaScript]

---



# JavaScript 日期与计时器

## Date

1. Date 是一个构造函数，其原型上定义了一些日期方法

2. Date()

   执行 Date()，返回表示日期的字符串

3. new Date()

   没有参数，返回当前日期实例对象

   ```javascript
   var date = new Date();
   console.log(Object.prototype.toString.call(date)); // [Object Date]
   date.getFullYear() // 返回年份，如 2020
   dae.getMonth() // 返回月份减一，加一得到月份
   date.getDate() // 返回几号，1 到 31
   date.getDay() // 返回周几，0 到 7，周日开始
   date.getHours() // 返回小时
   date.getMinutes() // 返回分钟
   date.getSeconds() // 返回秒数
   date.getMilliseconds() // 返回毫秒数
   // 有 get 同样有 set 方法
   ```
   
   有参数，返回对应的日期
   
   ```javascript
   var date = new Date(2020, 1, 1, 8, 30, 10);
   var date = new Date('2020/1/1 8:30:10');
   var date = new Date('2020/01/01 08:30:10');
   var date = new Date('2020-1-1 8:30:10');
   // Sat Feb 01 2020 8:30:10 GMT+0800 (中国标准时间)
   ```

4. getTime()

   返回时间戳，即毫秒数

   计算机纪元时间 1970 年 1 月 1 日 0 点 0 分 0 秒

   时间戳：某个时间距离计算机纪元时间的经过的毫秒数

   ```javascript
   var dateTime = new Date().getTime(); // 返回当前时间的时间戳
   var date = new Date(dateTime); // 返回时间戳对应时间
   date.setTime(dateTime); // 以时间戳为标准设置时间
   ```

## 计时器

1. setInterval

   每隔特定的毫秒数执行一次内部函数，从当前开始计时

   返回一个数字，是计时器的唯一标识，代表在所有计时器和延时器中的序号

   是 window 下的方法

   ```javascript
   setInterval(function(){
       
   }, 1000) // 匿名函数
   funtion Test() {
       
   }
   setInterval(test, 1000);
   setInterval('test()', 1000); // 字符串形式传入方法
   ```

2. clearInterval

   清除计时器

   ```javascript
   var timer = setInterval(function(){}, 1000); // timer 是唯一标识，代表在所有计时器中的序号
   clearInterval(timer);
   ```

## 延时器

1. setTimout

   延迟指定时间执行一次内部函数

   返回一个数字，是延时器的唯一标识，代表在所有计时器中和延时器的序号

   ```javascript
   setTimeout(function(){
       
   }, 1000) // 匿名函数
   funtion Test() {
       
   }
   setTimeout(test, 1000);
   ```

2. clearTimeout

   清除延时器

   ```javascript
   var timer = setTimeout(function(){}, 1000); // timer 是唯一标识，代表在所有计时器中的序号
   clearTimeout(timer);
   ```

## 定时任务

1. 功能

   等待条件满足时执行任务，设定时间内条件未满足则执行回调函数

2. 参数 

   - re: 判断条件函数，return 要执行 fn 的条件
   - fn: 等待执行的目标函数
   - space: setInterVal 的间隔时间，space || 100
   - wait: setTimeOut 的等待时间，wait || 3000
   - back: fn 未成功执行时回调函数

3. 代码

   ```javascript
   function timer(re, fn, space, wait, back) {
       if (re()) {
           fn();
       } else {
           var interval = setInterval(function() {
               if (re()) {
                   fn();
                   clearInterval(interval);
                   interval = null;
               }
           }, space || 100);
           setTimeout(function() {
               if (interval) {
                   clearInterval(interval);
                   interval = null;
                   back && back();
               }
           }, wait || 3000);
       }
   }
   ```

