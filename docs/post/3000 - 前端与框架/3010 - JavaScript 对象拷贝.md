---


title: JavaScript 对象拷贝
date: 2020/3/22
description: 本文介绍 JavaScript 中如何复制一个对象，浅拷贝的含义和弊端、深拷贝的含义以及如何封装深拷贝的方法
tag: [前端基础, JavaScript]

---



# JavaScript 对象拷贝

## 问题引入

```javascript
var person1 = {
	name: '张三',
	age: "22"
}
var person2 = person1;
```

我们希望拷贝一份 person1 的属性给 person2，赋值是最简单的做法，但是这并不是我们想要的结果。	因为这仅仅是将 person1、person2 指向了同一对象，修改其一，会相互影响

## 对象浅拷贝

```javascript
var person1 = {
	name: '张三',
	age: 22,
	son: {
		name: '张小三',
		age: 1
	}
}
var person2 = {};
for (var key in person1) {
	person2[key] = person1[key];
}
```

循环将 person1 的属性取出赋值给 person2，对于原始类型属性，不相互影响，可以成功拷贝，但是对于引用类型的属性，如 person2.son 和 person1.son 指向了同一对象，修改其一，会相互影响

如果不需要 person1 原型链上的属性，赋值时使用 hasOwnProperty() 判断

> Object.assign() 拷贝的是属性值。
>
> 假如源对象的属性值是一个对象的引用，那么它也只指向那个引用，是一种浅拷贝

## 对象深拷贝

浅拷贝复制引用值只是将引用指向这个值，并不是复制了一份，修改其一，会相互影响。我们可以将属性中的引用值也循环其属性，复制到目标对象的属性

递归实现：

```javascript
var person1 = {
	name: '张三',
	age: 30,
	son: {
		first: {
			name: '小一',
			age: 3
		}
	}
}

function deepClone(origin) {
    var target = Array.isArray(origin) ? [] : {};
    for (var key in origin) {
        if (!origin.hasOwnProperty(key)) continue;
        if (typeof origin[key] === 'object') {
            target[key] = deepClone(origin[key]);
            continue;
        }
        target[key] = origin[key];
    }
    return target;
}

var person2 = deepClone(person1);
person2.son.sencond = {
	name: '小二',
	age: 2
}
console.log(person2);
console.log(person1);
```

person2 含有 person1 的所有属性，对于原始值属性进行修改，不会相互影响

> 对于没有函数属性的对象，可以使用 JSON.parse 方法和 JSON.stringify 先转为字符串再转为对象，可以得到一个互不关联的新对象
