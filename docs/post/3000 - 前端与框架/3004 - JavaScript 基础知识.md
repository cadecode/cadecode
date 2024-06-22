---


title: JavaScript 基础知识
date: 2020/3/16
description: 本文介绍 JavaSCript 基础知识，如变量、关键字和保留字、原始值和引用值、运算符、条件控制以及类型转换等
tag: [前端基础, JavaScript]

---

# JavaScript 基础知识

## 变量

```javascript
var a; // 声明
a = 1; // 赋值
var b = 2; // 声明并赋值
var x = 1,
    y，
	z = 3; // 单一声明方式
```

## 关键字

> 不能将关键字和保留字用作变量名或函数名

```javascript
break
case
catch
continue
default
delete
do
else
finally
for
function
if
in
instanceof
new
return
switch
this
throw
try
typeof
var
void
while
with
```

## 保留字

> 一些保留字已经在 ES6 语法中使用

```javascript
abstract
boolean
byte
char
class
const
debugger
double
enum
export
extends
final
float
goto
implements
import
int
interface
long
native
package
private
protected
public
short
static
super
synchronized
throws
transient
volatile
```

## 原始值

1. JavaScript 有 5 种原始值，即 5 种基本类型

   ```javascript
   Number String Boolean undefined null
   ```

2. 基本类型根据声明后所赋的值自动确定，称之为弱类型语言

   ```javascript
   var a = 1;
   var str = "lean javascript";
   var flag = true;
   var u = undefined; // 未定义，等同于只声明不赋值
   var n = null; // 空值，常用于初始化组件、销毁函数
   ```

3. 原始值存放在栈内存

   ```javascript
   var a = 1; // 在栈内存中开辟空间，存储 1 指向 a
   var b = a; // 复制 a 的值，在栈内存开辟空间存储，指向 b
   var a = 2; // 重新开辟一个栈内存空间，存储 2 指向 a，原来的空间等待覆盖
   ```

## 引用值

1. 常用的引用值，即引用类型

   ```javascript
   object array function data RegExp
   ```

2. 引用值存放在堆内存

   ```java
   var arr1 = [1,2,3,4]; // [1,2,3,4] 存放在堆内存中，栈内存中存放指向该数组的地址
   var arr2 = arr1; // arr1，arr2 都指向堆中的 [1,2,3,4]
   arr1.push(5); // push，对堆中的数组进行操作
   console.log(arr2); // 打印出 [1,2,3,4,5]
   arr1 = [1,2,3,4,5,6]; // 重新指向了堆内存中的 [1,2,3,4,5,6]
   console.log(arr2); // 依然打印出 [1,2,3,4,5]
   ```

## 错误

1. 语法错误

   一个代码块里代码都不会执行

   ```javascript
   console.log(1); // 不会执行
   console.log(2)；// 使用中文分号，语法错误
   console.log(3); // 不会执行
   ```

2. 通用错误

   前面会执行，后面不会

   ```javascript
   console.log(1); // 会执行
   console.log(a);// a 未声明，通用错误之引用错误
   console.log(3); // 不会执行
   ```

3. 一个 `<script>` 代码块发生错误，其他没有发生错误的代码块可以照常执行

## 运算符

1. 赋值

   ```javascript
   var a = 1, // 赋值
       b = 2,
       c = 3;
   var d = (a + b) * d; 
   // 声明 d -> 计算 -> 赋值
   // 括号运算 > 普通运算 > 赋值
   ```

2. 加法

   ```javascript
   var a = 1 + 1; // 2，加运算
   var b = "str1" + "str2"; // str1str2,字符串拼接
   var c = "str1" + 1; // str11，字符串拼接
   var d = "str" + null + undefined + NaN; // 字符串 + 任何类型都是字符串
   var e = 1 + 1 + "str" + (1 + 1); // 2str2
   ```

3. 除法

   ```javascript
   var a = 0 / 0; // NaN，非数，数字类型 Number
   // 与 NaN 做任何运算都得出 NaN
   var b = "a" / "b"; // NaN
   var c = 1 / 0; // Infinity，无穷，数字类型 Number
   Var d = -1 / 0; // -Infinity
   ```

4. 取模

   ```javascript
   // 取模（取余）
   var a = 4 % 6; // 4
   var b = 6 % a; // 2
   var c = 4 % 0; // NaN，非数
   ```

5. 比较

   ```javascript
   var a = 1 > 0, // true
       b = 1 > "0", // true，先把字符串转换成数字再比较
       c = "a" > "b", // false，按照 ASCII 码
       d = "4.5" > "11"， // true，按照 ASCII 码，'4' > '1'，后面不用比
       e = "1.5" > "11"; // false，'1' = '1'，'.' < '1' 
   var bool = 1 == 1; // true
   var bool = 1 == "1"; // true，相等不要求数据类型
   var bool = 1 === "1"; // false，全等要数据类型一致
   var bool = NaN == NaN; // false，NaN 与任何值不相等，包括它自己
   ```

6. 逻辑

   ```javascript
   /*
    * 为假的值：undefined null "" 0 NaN flase
    * 除了上述，全部为真
    */ 
   var a = 1 && 2; // 2
   var b = 1 || 2; // 1
   // &&，遇真往后走，遇假或走完，返回当前值
   // ||，遇假往后走，遇真或走完，返回当前值
   var c = !1; // false
   ```

## 条件控制

1. if

   ```javascript
   var a = 65;
   if(a >= 60 && a <= 100) {
         console.log("及格");
   }
   else if(a >= 0 && a < 60) {
         console.log("不及格");
   }
   else {
         console.log("分数有误");
   }
   // 自上而下判断，一旦满足，后面不看
   ```

2. switch

   ```javascript
   var a = 65;
   switch(true) { // 用 switch 实现 if
       case a >= 60 && a <= 100:
           console.log("及格");
           break;
       case a >= 0 && a < 60:
           console.log("不及格");
           break;
       default:
           console.log("分数有误");
   }
   // 如果不加 break，后面的 case 块都会执行
   ```

## 循环

1. if

   ```javascript
   for(var i = 0; i < 10; i++) {
       // ...
   }
   /*
    * 1.声明变量
    * 2.判断条件
    * 3.执行代码
    * 4.后续动作
    * 重复 2 3 4，一旦判断条件为 flase，结束循环
    */
   ```

   打印出 100 以内的质数

   ```javascript
   var c = 0;
   for(var i = 2; i < 100; i++) { // 1 不是质数
   	for(var j = 1; j <= i; j++) {
           if(i % j == 0){
               c++;
           }
       }
       if(c == 2) {
           console.log(i);
       }
   }
   ```

2. while

   ```javascript
   var i = 0; 
   // while
   while( i < 10) {
       // ...
       i++;
   }
   // do...while 先执行一次代码块，再判断是否后续
   do {
       i++;
   }while(i < 10);
   
   ```

   

## typeof

1. typeof 是一个运算符，用来判断数据类型

2. typeof 的使用

   ```javascript
   typeof(1); // 对表达式做运算，推荐写法
   typeof 1; // 对变量做运算
   ```

3. typeof 的返回值

   ```javascript
   typeof(123); // number
   typeof("123"); // string
   typeof(true) // boolean
   typeof(a); // undefined，a 未定义
   typeof({}); // object
   typeof([]); // object
   typeof(new Array(1,2,3)); // object
   /*
    *这里返回的 object 是包含 普通 object、array 的一个大的概念
    */
   typeof(null); // object，理解为空对象
   typeof(Array) // function，理解为对象的构造方法
   ```

## 类型转换

1. 显示类型转换

   Number

   ```javascript
   Number("123"); // 123
   Number("a"); // NaN
   Number(true); // 1
   Number(undefined); // NaN
   Number(null); // 0
   ```

   parseInt

   ```javascript
   parseInt(”123.99“); // 123，取整数部分
   parseInt("a"); // NaN
   parseInt(true); // NaN
   parseInt(undefined); // NaN
   parseInt(null); // NaN
   // 第二参数，给定进制
   parseInt(10,16); // 16，16 进制的 10 -> 10 进制的 16
   parseInt("b",16); // 11，16 进制的 b -> 10 进制的 11
   // 以数字或正负号开头，提取前面的数字
   parseInt("abc123"); // NaN
   parseInt("-123abc"); // -123
   ```

   parseFloat

   ```javascript
   parseFloat("3.1415"); // 3.1415
   parseFloat("3.145").toFixed(2); // 3.15，四舍五入，保留两位
   // 以数字或正负号开头，提取前面的数字
   parseFloat("3abc"); // 
   ```

   toString

   ```javascript
   parseInt("100").toString(16) // "64"，字符串 “100” -> 数字 100 -> 16 进制数的字符串
   Boolean("abc"); // true
   Boolean("abc").toString(); // "true"
   ```

2. 隐式类型转换

   string 转换 number
   
   ```javascript
   // 正负号 string -> number
   console.log(+"123"); // 123
   console.log(typeof(-"123"); // number
   // 自增、自减 string -> number
   var a = "1";
   a++;
   // 减、乘、除、取模 string -> number
   var c = "3" * 2; // 6
   // 数字与字符串比大小 string -> number
   var d = 1 > "2"; // false
   // 数字与字符串是否相等 string -> number
   var e = 1 == "1"; // true
   var f = 1 != "2"; // true
   // 数字与字符串是否全等 不进行转换
   var e = 1 === "1"; // false
   ```
   
   number 转换 string
   
   ```javascript
   // 字符串拼接 number -> string
   var b = "str" + 1; // str1
   ```
   
   boolean 转换 number
   
   ```javascript
   // 布尔隐式转换为数字
   var g = 2 > 1 = 1; // true，2 > 1 -> true -> 1，1 = 1 -> true
   ```
   
   undefined 和 null
   
   ```javascript
   // undefined、null 
   var h = undefined > 0, // false
       i = undefined < 0, // false
       j = undefined == 0; // false
   // undefined 和 0 比较都返回 false，null 也是如此
   var k = undefined + undefined; // NaN
   var l = null + null; // 0
   var m = null + undefined; // NaN
   var o = undefined == null; // true
   ```
   
   isNaN()
   
   ```javascript
   // isNaN()，首先经过 Number()，判断结果是否是 NaN
   isNaN("123"); // false
   isNaN("123abc"); // true
   isNaN(null); // false，null -> 0
   isNaN(undefined); // true，undefined -> NaN
   ```

## ASCII 与 Unicode

1. ASCII 码
   - 表一 0 - 127，表二 128 - 255
   - 每个字符一个字节

2. Unicode
   - 前 255 位是 ASCII 码，每个字符一个字节
   - 256 位及之后，每个字符占两个字节

3. 获取 Unicode 编码

   ```javascript
   // string 的方法 charCodeAt(index)
   "a".charCodeAt(0); // a -> 97
   ```
