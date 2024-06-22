---


title: JavaScript 错误处理
date: 2020/6/8
description: 本文介绍 JavaSCript 中的六大错误类型及常见场景、try catch finally 的使用以及 ES5 严格模式下的禁止使用的语法和注意事项
tag: [前端基础, JavaScript]

---



# JavaScript 错误处理

## 错误类型

1. SyntaxError 语法错误
   - 变量名不规范
   - 关键字赋值
   - 基本语法错误
2. ReferenceError 引用错误
   - 变量或函数未被声明
   - 给无法被赋值的对象赋值

3. RangeError 范围错误
   - 数组长度赋值为负
   - 对象方法参数超出可行范围

4. TypeError 类型错误
   - 调用不存在的方法
   - 实例化一个非构造函数

5. URIError URI 错误
   - decodeURI 参数不符合

6. EvalError eval 函数执行错误

## 处理错误

1. try...catch

   try 块中出错，catch 块中获取错误信息

   ```javascript
   try {
       console.log(a)
   } catch (e) {
       console.log(e)
       console.log(e.name)
       console.log(e.message)
   }
   ```

2. finally 

   finally 包含一定要执行的语句

   ```javascript
   try {
       console.log(a)
   } catch (e) {
       console.log(e)
   } finally {
       console.log('over')
   }
   ```

3. throw

   抛出一个可以捕获的错误，可指定错误信息和错误类型

   - throw new Error('一个错误被抛出')
   - throw '一个错误被抛出'   

   ```javascript
   try {
       throw '一个错误被抛出'
   } catch (e) {
       console.log(e)
   } finally {
       console.log('over')
   }
   ```

## ES5 严格模式

1. ES3.0 存在以下问题
   - 语法严谨和合理性
   - 语法怪异行为
   - 安全性效率

2. 3.0 基础上推出严格模式，IE9 及以下不支持严格模式

3. 使用严格模式

   可以全局使用严格模式，也可以在单独作用域中使用

   ```html
   <script type="text/javascript">
       'use strict'
   
       function test() {
           'use strict'
       }
   
       var test = (function () {
           'use strict'
       })()
   </script>
   ```

4. 严格模式不能使用 with 方法，语法错误

   with 方法用于改变作用域

   ```javascript
   var obj = {
       a : 1
   }
   function test() {
       var a = 2
       with (obj) {
           console.log(a)
       }
   }
   test()
   ```

5. 严格模式下不能使用 arguments 的callee 和 caller 属性，类型错误

6. 严格模式下，不允许不声明直接赋值

   ```javascript
   // 严格模式下报引用错误
   a = 1 
   var b = c = 2
   ```

7. 严格模式下函数内部 this 为 undefined

   ```javascript
   function test() {
       console.log(this)
   }
   test() // undefined
   var t = new test() // {}
   test.call(1) // 1
   ```

8. 严格模式下不允许函数参数重复，报语法错误

9. 严格模式拒绝使用重复的对象属性名，但不报错

10. 严格模式下 eval 函数问题

    ```javascript
    eval('var a = 1')
    console.log(a) 
    // 非严格模式下，a 挂在 window 上，打印出 1，
    // 严格模式下，eval 有自己的作用域，在 window 下打印 a 报引用错误
    ```

    

