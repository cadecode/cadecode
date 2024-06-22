---


title: JavaScript 预编译与作用域
date: 2020/3/18
description: 本文介绍如何分析 JavaScript 预编译的过程和作用域，帮助我们理清代码的执行顺序，更好理解闭包的概念
tag: [前端基础, JavaScript]

---



# JavaScript 预编译与作用域

## 预编译

1. JavaScript 执行步骤

   检查通篇的语法错误 -> 预编译 -> 解释执行

2. 暗示全局变量

   变量不声明直接赋值，挂载到 window 对象下

   ```javascript
   a = 1;
   console.log(a); // 1
   
   function test() {
       var b = c = 1;
   }
   test();
   console.log(c); // 打印 1，c 未声明，直接赋值，暗示全局变量
   console.log(window.b); // undefined，打印对象不存在属性，返回 undefined
   console.log(b); // 报错
   ```

3. 预编译过程

   函数声明整体提升

   变量声明提升，赋值不提升

   ```javascript
   test(); // 放在前面可以执行
   function test() {
       
   }
   console.log(a); // 打印出 undefined
   var a = 1; // 声明提升，赋值不提升
   ```

## GO

1. global object，全局上下文，即 window 对象

2. 在全局执行的前一刻，生成 GO，即变量声明提升和函数声明提升

3. 步骤：寻找变量声明 -> 寻找函数声明 -> 顺序执行（同名覆盖）

    ```javascript
   var a = 1; // (1)
   function a() {
       console.log(2);
   }
   console.log(a); // (2)
   // 全局预编译
   // 变量声明 a -> GO{a: undefined} 
   // 函数声明 a(){} -> GO{a: a(){}} 
   // 全局执行
   // 执行 (1) -> GO{a: 1}
   // 执行 (2)，打印 1
   ```

    ```javascript
   console.log(a); // (1)
   var a = 1; // (2)
   console.log(a); // (3)
   function a() {
       console.log(2);
   }
   // 全局预编译
   // 变量声明 a -> GO{a: undefined} 
   // 函数声明 a(){} -> GO{a: a(){}}
   // 全局执行
   // 执行 (1)，打印 a(){...}
   // 执行 (2) -> GO{a: 1}
   // 执行 (3)，打印 1
    ```
## AO

1. activation object，函数上下文，即活跃对象
2. 每个函数都有自己的 AO，函数执行前一刻生成，执行完以后销毁
3. 步骤：寻找变量声明 -> 寻找形参 -> 形参实参映射 ->寻找函数声明 -> 顺序执行（同名覆盖）
4. 注意：AO 中有 var a 声明，不会找 GO 里的 a

    ```javascript
    function test(a) {
        console.log(a); // (1)
        var a = 1; // (2)
        console.log(a); // (3)
        function a() {}
        console.log(a); // (4)
        var b = function() {} // (5)
        console.log(b); // (6)
        function d() {}
    }
    test(2); 
    // 全局预编译
    // 函数声明 test(){} -> GO{a: test(){}} 
    // 全局执行
    // 执行到 test(2)，函数 test 预编译
    // 变量声明 a, b -> test_AO{a: undefined, b: undefined}
    // 参数映射 -> test_AO{a: 2, b: undefined}
    // 函数声明 -> test_AO{a: a(){}, b:undefined, d: d(){}}
    // 函数 test 执行
    // 执行 (1)，打印 a(){}
    // 执行 (2) -> test_AO{a: 1, b: undefined, d: d(){}}
    // 执行 (3)，打印 1
    // 执行 (4)，打印 1
    // 执行 (5) -> test_AO{a: 1, b: (){}, d: d(){}}
    // 执行 (6)，打印 (){}
    // 函数 test 执行完毕，test_AO 销毁
    ```

5. 练习

    ```javascript
    a = 1; // (1)
    function test() {
        console.log(a); // (2)
        a = 2; // (3)
        console.log(a); // (4)
        if(a) { // (5)，预编译时不看 if，因为没有执行该句
            var a = 3; 
        }
        console.log(a); // (6)
    }
    test();
    var a;
    // 全局预编译
    // 变量声明、函数声明 -> GO{a: undefined, test: test(){}}
    // 全局执行
    // 执行 (1) -> GO{a: 1, test: test(){}}
    // 执行到 test()，函数 test 预编译
    // 变量声明 -> test_AO{a: undefined}
    // 函数 test 执行
    // 执行 (2)，打印 undefined
    // 执行 (3) -> AO{a: 2}
    // 执行 (4)，打印 2
    // 执行 (5) -> AO{a: 3}
    // 执行 (6) -> 打印 3
    // 函数 test 执行完毕，test_AO 销毁
    ```

## 作用域

1. 函数的属性

   函数是一种引用类型

   有一些原生属性可以利用，也有一些属性不能访问，是 js 引擎内部固有的隐式属性

   [[scope]] 就是 JS 内部隐式属性，是函数存储作用域链的容器

   ```javascript
   function test() {
       
   }
   console.log(test.name); // test
   console.log(test.length); // 0
   ```

2. 作用域链

   在函数声明时，生成 JS 内部隐式属性 [[scope]]，该属性的第 0 位保存全局执行期上下文 GO 的一个引用

   在函数执行前一刻，[[scope]] 第 0 位保存函数执行期上下文 AO，后一位保存外层函数的 AO，最后保存 GO 引用。如果没有外层函数，则第 0 位 AO，第 1 位 GO。在寻找声明时，都会由 0 位向后寻找，即先看自己，再看外层，最后看全局

   在函数执行完毕时，从 [[scope]] 中销毁 AO
   
   ```javascript
   function a() {
       funtion b() {
           var b = 2; // (3)
       }
       var a = 1; // (2)
       b(); 
   }
   var c = 3; // (1)
   a();
   // 全局预编译
   // -> GO{c: undefined, a: a(){}}
   // -> a.SCOPE = [
   //				GO{c: undefined, a: a(){}}
   //		]
   // 全局执行
   // 执行 (1)
   // -> GO{c: 3, z a(){}}
   // -> a.SCOPE = [
   //				GO{c: 3, a: a(){}}
   //		]
   // 执行到 a()，函数 a 预编译
   // -> a.SCOPE = [
   //				a_AO{a: undefined, b: b(){}}, 
   //				GO{c: 3, a: a(){}}
   //		]
   // -> b.SCOPE = [
   //				a_AO{a: undefined, b: b(){}}, 
   //				GO{c: 3, a: a(){}}
   //		]
   // 函数 a 执行
   // 执行 (2)
   // -> a.SCOPE = [
   //				a_AO{a: 1, b: b(){}}, 
   //				GO{c: 3, a: a(){}}
   //		]
   // 执行到 b()，函数 b 预编译
   // -> b.SCOPE = [
   //				b_AO{b: undefined}, 
   //				a_AO{a: 1, b: b(){}}, 
   //				GO{c: 3, a: a(){}}
   //		]
   // 执行 (3)
   // -> b.SCOPE = [
   //				b_AO{b: 3}, 
   //				a_AO{a: 1, b: b(){}}, 
   //				GO{c: 3, a: a(){}}
   //		]
   // 函数 b 执行完毕，b_AO 销毁
   // -> b.SCOPE = [
   //				a_AO{a: 1, b: b(){}}, 
   //				GO{c: 3, a: a(){}}
   //		]
   // 函数 a 执行完毕，a_AO 销毁
   // -> b.SCOPE 销毁
   // -> a.SCOPE = [
   //				GO{c: 3, a: a(){}}
   //		]
   ```
   
   
   
   

