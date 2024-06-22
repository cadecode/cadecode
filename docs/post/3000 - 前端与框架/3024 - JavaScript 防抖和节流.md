---

title: JavaScript 防抖和节流
date: 2020/9/1
description: 本文介绍 JavaScript 中优化高频率代码的手段 - 函数防抖和节流，防抖函数的封装（需要立即执行和不需要两个版本版）和节流函数的封装（Date 和计时器两个版本）
tag: [前端基础, JavaScript]

---

# JavaScript 防抖和节流

## 函数防抖

### 防抖概念

1. 事件触发后 n 秒后开始执行，n 秒内再次触发则重新计时
2. 如果一直在 n 秒内触发事件，则回调一直不会执行
3. 联想公交车上客场景，上完一波人，长时间没有人上了，就会关门出发
4. 一般用于提交数据、ajax 请求、输入验证等

### 防抖函数封装

1. 不需要立即执行

   利用闭包，设置 timer 保存计时器状态

   每次触发事件时，无论如何先清空计时器，再开新计时器

   ```javascript
   function debounce(fn, delay) {
       let timer;
       return function() {
           const _args = arguments;
           clearTimeout(timer);
           timer = setTimeout(() => {
               fn.apply(this, _args);
           }, delay);
       };
   }
   ```
   
2. 需要立即执行

   核心是有计时器就清除，并开启新计时器

   立即执行的逻辑是执行后开启一个定时器保持不可执行状态

   ```javascript
   /**
    * 防抖函数：每一次的高频触发只执行一次
    *
    * @param fn 目标函数
    * @param delay 延迟时间
    * @param triggerNow 是否立即执行
    * @return {(function(): void)|*}
    */
   function debounce(fn, delay, triggerNow) {
       let timer = 0;
       let executed = false;
       return function () {
           const _args = arguments;
           clearTimeout(timer);
           // 先关闭定时器
           if (triggerNow) {
               // 如果需要立即执行
               // 判断 executed 是否为 false，为 false 则执行
               // 开启新定时器防止短时间内再次触发
               if (!executed) {
                   fn.apply(this, _args);
                   executed = true;
               }
               timer = setTimeout(function () {
                   executed = false;
               }, delay);
           } else {
               // 如果不需要立即执行
               // 每次触发开启新定时器即可
               timer = setTimeout(function () {
                   fn.apply(this, _args);
               }, delay);
           }
       };
   }
   ```

## 函数节流

### 节流概念

1. 事件触发后 n 秒内只执行一次， n 秒内再次触发则不执行
2. 如果一直触发事件，则会间隔 n 秒执行一次
3. 联想地址过闸场景，不管多少人等待，都要一个一个、开闸关闸有序通过
4. 一般用于输入验证、搜索框提示等

### 节流函数封装

1. 计算时间差实现

   ```javascript
   function throttle(fn, interval) {
     let begin = new Date().getTime()
   
     return function() {
       const _args = arguments
       
       const cur = new Date().getTime()
   
       // 过了指定长的时间才执行
       if(cur - begin >= interval) {
         fn.apply(this, _args)
         begin = cur
       } 
     }
   }
   ```

2. 计时器实现

   核心是有计时器就 return
   
   ```javascript
   /**
    * 节流函数：高频触发时，按指定间隔执行
    * 
    * @param fn 目标函数
    * @param interval 时间间隔
    * @return {(function(): void)|*}
    */
   function throttle(fn, interval) {
       let timer = 0;
   
       return function () {
           const _args = arguments;
   
           // 有定时器则返回
           if (timer) {
               return;
           }
           timer = setTimeout(() => {
               fn.apply(this, _args);
               timer = 0;
           }, interval);
       };
   }
   ```
   
