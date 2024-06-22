---

title: JavaScript 数组
date: 2020/3/23
description: 本文介绍 JavaScript 数组的声明以及常用的数组操作方法 push、pop、shift、unshift、slice、splice 等的使用
tag: [前端基础, JavaScript]

---



# JavaScript 数组

## 数组的声明和读写

1. 数组字面量声明

	```javascript
	var arr = [1, 2, 3, 4];
	```

2. 构造函数声明

	```javascript
	var arr = new Array(1, 2, 3);
	```

3. 类型转换声明

	```javascript
	var arr = Array(1, 2, 3);
	```
	
	所有数组都继承于 Array.prototype
	
	如果只给构造函数一个参数 num，则是声明一个长度为 num 的数组，内容都为 empty，即 undefined
	
4. 稀松数组

	```javascript
	var arr = [, 2, , 4,];
	console.log(arr);
	// empty, 2, empty, 4
	```

	数组字面量可以定义稀松数组，打印数组未给值处打印出 empty，实际上是 undefined，需要注意最后一个 “,” 不算

5. 数组基于对象的键值对

	```javascript
	var arr = [1, 2, 3, 4, 5];
	var obj = {
		0: 1,
		1: 2,
		2: 3,
		3: 4
	};
	```
	
	Array 重写了 Object 的 toString 方法

6. 数组的读写

   使用下标（索引），读对应位置的数据，没有则返回 undefined

    ```javascript
    var arr = [, 2, , 4,];
    arr[0] = 1;
    ```

## push() 和 unshift()

push、unshift 方法继承自 Array.prototype

push 在数组最后一位后添加一位，unshift 在第一位前添加一位

参数为要添加的内容，可以是多个

返回数组添加后的长度

```javascript
var arr = [1, 2, 3];
arr.push(4, 5);
arr.unshift(0);
console.log(arr);
// [0, 1, 2, 3, 4, 5]
```

## pop() 和 shift()

pop、shift 方法继承自 Array.prototype

pop 删除数组最后，shift 删除第一位

返回被删除的数值

```javascript
var arr = [1, 2, 3];
console.log(arr.pop());
console.log(arr);
console.log(arr.shift());
console.log(arr);
// 3
// 1, 2
// 1
// 2
```

## reverse()

reverse 方法继承自 Array.prototype

颠倒原数组内容并返回颠倒后的数组

```javascript
var arr = [1, 2, 3];
console.log(arr.reverse());
// [3, 2, 1]
```

## splice()

splice 方法继承自 Array.prototype

剪切数组中内容，可以剪切位置添加数据，会影响原数组

参数：开始的下标，剪切的长度，在开始下标位置添加的数据

返回剪切下的子数组

```javascript
var arr = [1, 2, 3];
console.log(arr.splice(1));
console.log(arr);
// [2, 3]
// [1]
```

只给第一个参数，剪切从开始下标到最后的所有数据

如果是负数，则从 -1 开始由后往前数

```javascript
var arr = [1, 2, 3];
console.log(arr.splice(1, 1));
console.log(arr);
// [2]
// [1, 3]
```

给两个参数，代表开始下标和剪切长度

```javascript
var arr = [1, 2, 3];
console.log(arr.splice(1, 1, 100, 101));
console.log(arr);
// [2]
// [1, 100 ,101, 3]
```

给三个参数，剪切后在开始下标位置后添加数据

## slice()

和 splice() 功能相似，复制数组中内容并返回，但是不会影响到原数组

参数：开始下标，结束下标，不包括结束下标，左闭右开

```javascript
var arr = [1, 2, 3];
console.log(arr.slice(0, 2));
console.log(arr);
// [1, 2]
// [1, 2, 3]
```

## sort()

sort 方法用于数组排序，继承自 Array.prototype

默认按照 ASCII 码进行排序

改变原数组内容并返回排序以后的数组

	```javascript
	var arr = [1, 4, 2, 3, 30];
	console.log(arr.sort());
	// [1, 2, 3, 30, 4]
	```

sort 方法给一个函数 function(a, b){}，如果返回正数，则将 a 排在 b 后，否则 a 排在 b 前

```javascript
var arr = [1, 3, 14, 27, 5, 4];
console.log(arr.sort(function(a, b) {
	return a - b;
}));
// [1, 3, 4, 5, 14, 27]
```

利用 Math.random() 返回 (0, 1) 之间的随机数结合 sort 方法实现数组随机排序
因为 Math.random() - 0.5 返回一个 (-0.5, 0.5) 之间的随机数

```javascript
var arr = [1, 2, 3, 4, 5, 6];
console.log(arr.sort(function(a, b) {
	return Math.random() - 0.5;
}));
```

## concat()

用于连接两个数组，返回拼接后的数组，参数为要在后面拼接的数组

```javascript
var arr1 = [1, 2, 3];
var arr2 = [4, 5, 6];
console.log(arr1.concat(arr2));
// [1, 2, 3, 4, 5, 6]
```

## toSting()

将数组转换成字符串，返回该字符串，用逗号分隔

```javascript
var arr = [1, 2, 3];
console.log(arr.toString());
```

## jion() 和 split()

1. jion 方法将数组转换成字符串，返回该字符串，参数作为分隔符

2. split() 方法将字符串装换成数组，返回该数组第一个参数作为分隔符，第二个参数表示返回前几位，不给则全部返回

   ```javascript
   var arr = [1, 2, 3];
   str = arr.join('-');
   console.log(str);
   console.log(str.split('-'));
   console.log(str.split('-', 2));
   // 1-2-3
   // [1, 2, 3]
   // [1, 2]
   ```

## filter()

兼容 IE9 及以上

用于对数组内容进行过滤，参数方法返回值决定对应元素的去留，若返回 false 则剔除该元素

```javascript
// 数组去重示例
var arr = [0, 1, 2, 2, 3, 4, 4, 0, 1];
funtion uniqe(arr) {
 return arr.filter(function(item, index, arr) {
    //当前元素在数组中的第一个索引 === 当前索引值，则该元素没有重复
    return arr.indexOf(item) === index;
  });
}
// 方法缺陷：不能去除 [{}, {}]
```

## 类数组

1. 类数组是是一种类似数组，如 arguments、NodeList 等，它们有 length 属性，甚至有 forEach 属性

2. 类数组没有继承 Array.prototype，没有 push、splice 等方法

3. 类数组和数组的底层都是基于对象的键值对

4. 不支持数组方法的类数组，可以通过借用 Array.prototype 实现操作

   ```javascript
   var obj = {
       2: 3,
       3: 4,
       length: 2,
       push: Array.prototype.push
   }
   obj.push(1);
   obj.push(2);
   console.log(obj);
   // {
   //	2: 1,
   //	3: 2,
   //	length: 4,
   //	push: push(){}
   //	__poroto__: {...}
   // }
   ```

   对于这是道题，首先我们要明白数组的 push 方法继承于 Array.prototype，其次要了解 push 方法的内部过程，即在 length 位置存数据，然后 length 加一

   ```javascript
   Array.prototype.push = function (elem) {
       this[this.length++] = elem;
   }
   ```

