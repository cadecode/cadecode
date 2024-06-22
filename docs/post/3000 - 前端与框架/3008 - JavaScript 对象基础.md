---


title: JavaScript 对象基础
date: 2020/3/20
description: 本文介绍 JavaScript 中对象的基本格式、对象的创建方式、构造函数的原理、包装类、方法链式调用以及属性的枚举
tag: [前端基础, JavaScript]

---



# JavaScript 对象基础

## 对象的格式

1. 基本格式

	对象使用一个`{}`进行包裹，内部属性以键值对形式声明  
	
2. 示例

	```javascript
	var teacher = {
		name: "pgjett",
		age: "22",
		teach: function () {
			console.log("I teach javascript");
		},
		drink: function () {
			console.log("I drink beer");
		}
	}
	```

## 对象的的属性

1. 属性的增删改查

	```javascript
	var teacher = {
		name: "pgjett",
		var teacher = {
			name: "pgjett",
			age: "22",
			teach: function() {
				console.log("I teach javascript");
			},
			drink: function() {
				console.log("I drink beer");
			}
		}
		// 增加
		teacher.smook = function(){
			console.log("I smook");
		}
		// 删除
		delete teacher.name;
		// 改变
		teacher.teach =function() {
			console.log("I teach java");
		}
		// 查找/访问
		console.log(teacher.name);	
		console.log(teacher["name"]);
	    // 最早的 JS 引擎使用 obj["name"] 访问
		// 使用 obj.name 会自动转换成 obj["name"]
	```
	
2. 对象方法访问属性

	一般将普通函数称之为函数，对象内的函数称之为方法
	

	```javascript
	var teacher = {
		name: "pgjett",
		age: "22",
		weight: "65",
		teach: function() {
			console.log("I teach javascript");
		},
		eat: function() {
			this.weight++;
			console.log("I eat, my weight is " + this.weight);
		}
	}
	teacher.eat();
	```

3. 带参数的对象方法

	```javascript
	var attendance = {
		students: [],
		join: function(name) {
			this.students.push(name);
			console.log(name + " 已到课");
		},
		leave: function(name) {
			var idx = this.students.indexOf(name);
			if (idx != -1) {
				this.students.splice(idx, 1);
				console.log(name + "早退");
			}
		}
	}
	attendance.join("张三");
	attendance.join("李四");
	attendance.join("王五");
	attendance.join("赵六");
	attendance.join("孙七");
	attendance.leave("李四");
	// 张三 已到课
	// 李四 已到课
	// 王五 已到课
	// 赵六 已到课
	// 孙七 已到课
	// 李四早退
	```
## 对象的创建方式

1. 对象字面量  

	也叫对象直接量

	```javascript
	var obj = {
		name: "Jett",
		age: 22""
	}
	```

2. 内置构造函数

	使用 new Object()，与对象直接量没什么区别

	```javascript
	var obj = new Object();
	obj.name = "Jett";
	obj.age = "22";
	```
	
3. 自定义构造函数

	自定义构造函数使用大驼峰命名，通过 new 创建对象实例，且 new 出的示例是不同对象，有各自的属性 
	
	自定义构造函数是 javascript 模块化、插件化的重要内容

	```javascript
	function Teacher(){
		this.name = "Jett";
		this.age = 22;
		this.teach =function(){
			console.log("I teach javascipt");
		}
	}
	var teacher1 = new Teacher();
	var teacher2 = new Teacher();
	teacher2.name = "John";
	console.log(teacher1);
	console.log(teacher2);
	// Teacher{name: "Jett", age: 22, teach: teach(){}}
	// Teacher{name: "John", age: 22, teach: teach(){}}
	```
	自定义构造函数传入参数

	```javascript
	function Teacher(opt) {
		this.name = opt.name
		this.age = opt.age;
		this.teach = function() {
			console.log("I teach " + opt.course);
		}
	}
	var teacher1 = new Teacher({
		name: "Jett",
		age: 22,
		course: "javascript"
	});
	var teacher2 = new Teacher({
		name: "John",
		age: 25,
		course: "java"
	});
	```
## 构造函数原理

1. this 的指向

	不使用 new，直接执行，根据预编译原理，this 默认指向 window
	
	在全局作用域中，this 代表 window

	```javascript
	function Car() {
		this.color = "red";
		this.brand = "BMW";
	}
	Car();
	console.log(window.color);
	console.log(this.color);
	// red
	// red
	```
	
	使用 new 实例化对象，this 指向该实例

	```javascript
	function Car() {
		this.color = "red";
		this.brand = "BMW";
	}
	var car = new Car();
	console.log(car.color);
	```
	
2. this 转变的过程
	
	当 new 一个构造函数时，就相当于该构造函数执行，它的 AO 中会有一个 this 指向一个默认的属性
	
	当执行 

	```javascript
	this.color = "red";
	this.brand = "BMW";
	```
	
	相当于在 this 上添加属性
	
	使用 new 关键字后会将 this 抛出，赋值给一个引用
	
	这就是一个实例对象，这个实例可以访问 color、brand 属性
	
3. 构造函数中的 return

	new 一个构造函数默认会隐式 return this
	
	如果显式 return 一个原始值，实例对象不受影响
	
	如果显式 retrn 一个引用值，new 出的实例将指向该引用值

	```javascript
	function Car() {
		this.color = "red";
		this.brand = "BMW";
		
		return 1;
	}
	var car = new Car();
	console.log(car.color);
	// red
	```

## 包装类

1. Number

	通过构造函数创建数字对象，可以设置属性
	
	在运算中可以自动解包装
	
	与此类似的还有 String，Boolean

	```javascript
	var a = new Number(1);
	a.name = "a";
	console.log(a);
	console.log(a + 1);
	// 打印
	// Number{1, name: "a"}
	// 2
	```
	
	原始值自定义方法和属性，每次访问都会被包装成相应类型的对象，仅仅是临时容器，执行后则销毁，再次访问又重新包装，只能访问到 undefined

	```javascript
	var a = 1;
	a.name = "a"; 
	// js 引擎将 a 包装成数字对象，
	// 即 new Number(a).len = 3
	// 临时容器没有变量保存，执行 delete，删除该 len 属性
	console.log(a.name);
	// 即 console.log(new Number(a).len)
	// 打印 undefined
	```

2. String

	字符串原始值并没有 length 属性，实际上是包装成字符串对象后访问 length 属性

	```javascript
	// js 引擎将 "123" 包装成字符串对象
	var str = "123";
	str.length = 1; 
	// 即 new String(str).length = 1;
	console.log(str.length);
	// 即 console.log(new String(str).length)
	// 打印 3
	```
## 对象链式调用

通过 return this 将对象抛出，以调用其他函数

```javascript
var sched = {
	marning:function(){
		console.log("marning studying");
		return this;
	},
	noon:function(){
		console.log("noon sleeping");
		return this;
	},
	afternoon:function(){
		console.log("afernoon shopping");
		return this;
	}
}
sched.marning().noon().afternoon();
```


## 对象属性枚举

1. for in 遍历对象属性

	```javascript
	var obj = {
		name: "Jett",
		age: 22,
		address: "安徽"
	}
	for( var key in obj) {
		console.log(key, obj[key]);
	}
	// name Jett
	// age 22
	// address 安徽
	```

2. 用 in 判断对象是否有某个属性

	```javascript
	var obj = {
			name: "Jett",
			age: 22,
			address: "安徽"
		}
	console.log("name" in obj);
	// true
	```

