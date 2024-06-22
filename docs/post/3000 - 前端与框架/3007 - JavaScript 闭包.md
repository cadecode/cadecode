---


title: JavaScript 闭包
date: 2020/3/19
description: 闭包是将函数内部和函数外部连接起来的桥梁，当一个内部函数被返回到外部使用，就会产生闭包，本文介绍闭包的概念以及如何从作用域链出发理解闭包
tag: [前端基础, JavaScript]

---



# JavaScript 闭包

## 闭包问题引入

1. JavaScript 预编译和作用域链知识告诉我们，一个函数在声明时，生成一个叫 [[scope]] 的类数组的属性，从 0 位往后，由内到外的存储外层函数的执行期上下文和全局执行期上下文，即 AO 和 GO
2. 函数访问一个声明时，会从 [[scope]] 0 位开始寻找，即先找自身范围内，再看外层函数，最后看全局上下文
3. 内部函数被返回到外部使用，就会产生闭包，闭包会保持作用域链不释放，可能导致内存泄漏或过载

## 闭包代码示例

1. 内部函数保持外部函数的 AO

   ```javascript
   function test1() {
       function test2() {
           var b = 2;
           a = 4;
           console.log(a);
       }
       var a = 1;
       return test2;
   }
   var c = 3; // (1)
   var test3 = test1(); 
   test3(); 
   // 全局预编译
   // -> GO{c: undefined, test3: undefinedd, test1: test1(){}}
   // -> test1.SCOPE = [
   //					GO{c: undefined, test3: undefinedd, test1: test1(){}}
   //			]
   // 全局执行
   // 执行 (1)
   // -> GO{c: 3, test: undefined, test1: test1(){}}
   // -> test1.SCOPE = [
   //					GO{c: 3, test3: undefined, test1: test1(){}}
   //			]
   // 执行 test1()，函数 test1 预编译
   // -> test1.SCOPE = [
   //					test1_AO{a: undefined, test2: test2(){}},
   //					GO{c: 3, test3: undefined, test1: test1(){}}
   //			]
   // -> test2.SCOPE = [
   //					test1_AO{a: undefined, test2: test2(){}},
   //					GO{c: 3, test: undefined, test1: test1(){}}
   //			]
   // 函数 test1 执行
   // -> test1.SCOPE = [
   //					test1_AO{a: 1, test2: test2(){}},
   //					GO{c: 3, test3: undefined, test1: test1(){}}
   //			]
   // -> test2.SCOPE = [
   //					test1_AO{a: 1, test2: test2(){}},
   //					GO{c: 3, test: undefined, test1: test1(){}}
   //			]
   // 函数 test1 执行完毕，test1_AO 被销毁
   // 但 test2.SCOPE 中保持了 test1_AO，这个 test1_AO 将与 test1 再无关系
   // test2 被返回到外部，用 test3 接收
   // -> GO{c: 3, test3: test2(){}, test1: test1(){}}
   // -> test1.SCOPE = [
   //					GO{c: 3, test3: test2(){}, test1: test1(){}}
   //			]
   // 执行 test3()，即 test2()，test2 预编译
   // -> test2.SCOPE = [
   //					test2_AO{b: undefined},
   //					test1_AO{a: 1, test2: test2(){}},
   //					GO{c: 3, test3: test2(){}, test1: test1(){}}
   //			]
   // 函数 test2 预编译
   // -> test2.SCOPE = [
   //					test2_AO{b: 2},
   //					test1_AO{a: 1, test2: test2(){}},
   //					GO{c: 3, test3: test2(){}, test1: test1(){}}
   //			]
   // 函数 test2 执行，修改 b，a 的值，打印 4
   // -> test2.SCOPE = [
   //					test2_AO{b: 2},
   //					test1_AO{a: 4, test2: test2(){}},
   //					GO{c: 3, test3: test2(){}, test1: test1(){}}
   //			]
   // 函数 test2 执行完毕，test2_AO 销毁
   // -> test2.SCOPE = [
   //					test1_AO{a: 4, test2: test2(){}},
   //					GO{c: 3, test3: test2(){}, test1: test1(){}}
   //			]
   ```

2. 同级内部函数共享外部函数的 AO

   ```javascript
   function cal() {
       var num = 10;
       function plus() {
           num ++;
           console.log(num);
       }
       function minus() {
           num --;
           console.log(num);
       }
       return  [plus, minus];
   }
   var c = cal();
   c[0]();
   c[1]();
   c[1]();
   // 打印 11 10 9
   // 分析过程
   // GO{c: undefined, cal: cal(){}}
   // -> cal.SCOPE = [
   //					cal.AO{num: undefined, plus: plus(){}, minus: minus()},
   //		  			GO{c: undefined, cal: cal(){}}
   //			]
   // -> cal.SCOPE = [
   //					cal.AO{num: 10, plus: plus(){}, minus: minus()},
   //		  			GO{c: undefined, cal: cal(){}}
   //			]
   // -> GO{c: [plus, minus], cal: cal(){}}
   //    cal.SCOPE = [
   //		  			GO{c: [plus, minus], cal: cal(){}}
   //			]
   // -> plus.SCOPE = [
   //					plus.AO{},
   //					cal.AO{num: 10, plus: plus(){}, minus: minus()},
   //		  			GO{c: [plus, minus], cal: cal(){}}
   //			]
   // -> plus.SCOPE = [
   //					plus.AO{},
   //					cal.AO{num: 11, plus: plus(){}, minus: minus()},
   //		  			GO{c: [plus, minus], cal: cal(){}}
   //			]
   // -> minus.SCOPE = [
   //					minus.AO{},
   //					cal.AO{num: 10, plus: plus(){}, minus: minus()},
   //		  			GO{c: [plus, minus], cal: cal(){}}
   //			]
   // -> minus.SCOPE = [
   //					minus.AO{},
   //					cal.AO{num: 9, plus: plus(){}, minus: minus()},
   //		  			GO{c: [plus, minus], cal: cal(){}}
   //			]
   ```

## 循环中的闭包

1. 循环生成的内部函数，共享外部函数的 AO

   循环完毕后，内部函数装在数组中被抛出，其中每个函数的 [[scope]] 中都保持了 test 函数的 AO

   并且这个 AO 是共享的，在这个 AO 中，保存着 i = 10；

   ```javascript
   function test() {
   	var arr = [];
       var i = 0; // 放在 for 外效果一样
       for(; i < 10; i++) {
           arr[i] = function() {
               console.log(i);
           }
       }
       return arr;
   }
   var fnArr = test();
   fnArr[0]();
   fnArr[1]();
   fnArr[2]();
   fnArr[3]();
   // 发现打印出的都是 10
   // test_AO{arr: [...], i: 10}
   ```

2. 使用立即执行函数解决循环闭包

   立即执行函数直接将参数传入到内部，也就是说内部的函数保持了各自外层的自执行函数的 AO，这些 AO 保存的 j 是不同的 

   ```javascript
   function test() {
   	var arr = [];
       var i = 0;
       for(; i < 10; i++) {
           (function(j) {
           	arr[j] = function() {
               	console.log(j);
               }
           })(i);
       }
       return arr;
   }
   var fnArr = test();
   fnArr[0]();
   fnArr[1]();
   fnArr[2]();
   fnArr[3]();
   // 打印出 0 1 2 3
   ```

## 闭包的缓存特性

1. 闭包中内部函数共享外部函数的 AO，就可以共享其局部变量

   ```javascript
   function myClass() {
       var students = [];
       return {
           join: function(name) {
               students.push(name);
           },
           out: function(name) {
               var idx = students.indexOf(name);
               if(idx != -1) {
                   students.splice(idx,1);
               }
           },
           show:function() {
               console.log(students);
           }
       }
   }
   var c = myClass();
   c.join("张三");
   c.show();
   c.join("李四");
   c.show();
   c.out("李四");
   c.show();
   // ["张三"]
   // ["张三", "李四"]
   // ["张三"]
   ```



