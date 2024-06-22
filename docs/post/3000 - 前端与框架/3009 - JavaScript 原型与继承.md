---


title: JavaScript 原型与继承
date: 2020/3/21
description: 本文介绍 JavaScript 中 prototype、construct、__proto__、原型链的含义，以及如何基于函数原型实现继承
tag: [前端基础, JavaScript]

---



# JavaScript 原型与继承

## prototype

1. 原型即 prototype，是函数的一个属性，是一个对象

	```javascript
	function Car() {}
	console.log(typeof Car.prototype);
	console.log(Car.prototype);
	// object
	// {...}
	```

2. 所有被构造函数构造出的对象都能访问 prototype 上定义的属性和方法

	```javascript
	function Car() {
		this.brand = "BMW";
		this.color = "red";
	}
	Car.prototype.price = "100 万";
	var car1 = new Car();
	var car2 = new Car();
	console.log(car1.price);
	console.log(car2.price);
	// 100 万
	// 100 万
	```
	
3. 构造函数内部和 prototype 定义了同名属性，实例对象会优先调用构造函数中的属性

	```javascript
	function Car() {
		this.price = "10 万";
	}
	Car.prototype.price = "100 万";
	var car1 = new Car();
	console.log(car1.price);
	// 10 万
	```

4. 通过实例对象不能更改 prototype 上的属性

	```javascript
	function Car() {}
	Car.prototype.price = "100 万";
	var car1 = new Car();
	car1.price = "10 万";
	console.log(Car.prototype.price);
	// 100 万 
	```

> 一般将不变化的内容或方法放在 prototype 下，需要动态变化的放在构造方法内，通过参数配置

## constructor

1. constructor 指向构造函数本身

	实例对象的 constructor 属性指向构造函数

	```javascript
	function Car() {}
	var car = new Car();
	console.log(car.constructor);
	console.log(Car)
	// Car(){}
	// Car(){}
	```
	
2. constructor 可以被更改

	constructor 可以被修改，但是并不会影响实例化对象

	```javascript
	function Bike() {
		this.name = "bike";
	}
	Bike.prototype.name = "Bike";
	function Car() {}
	Car.prototype = {
		constructor: Bike
	}
	var car = new Car();
	console.log(Car.prototype);
	console.log(car.name);
	// {constructor: Bike(){}, ...} 
	// undefined
	```
## `__proto__`

1. 构造函数在实例化时，将其 prototype 挂载到函数内 this 的 `__proto__` 下

	```javascript
	function Car() {}
	Car.prototype.name = "Jett";
	var car = new Car();
	console.log(Car.prototype);
	console.log(car.__proto__);
	// Car.prototype ->
	// {
	//	name: "Jett", 
	//	construct: Car(){}
	//	_proto_: {...}
	//	}
	// car._proto_ ->
	// {
	//	name: "Jett",
	//	construct: Car(){}
	//	_proto_: {...}			
	// }
	// 
	```

	可以看到，打印出的 Car.prototype 和 car.`__proto__` 内容一致。因为在实例化对象时，Car.prototype 被挂载到函数内的 this.`__proto__` 上，即实例对象的 `__proto__` 属性上
	
	prototype 是构造函数的属性，`__proto__` 属于每个实例对象的，是一个内部属性，它们指向相同的内容

2. 可以通过实例对象访问 `__proto__` 属性，并对其进行修改

	```javascript
	function Car() {}
	Car.prototype.name = 'BWM';
	var car = new Car();
	console.log(car.name);
	car.__proto__= {
		name:"Benz"
	}
	console.log(car.name);
	// BWM
	// Benz
	```

	也可以更改 prototype 的属性到达效果

	```javascript
	function Car() {}
	Car.prototype.name = 'BWM';
	var car = new Car();
	console.log(car.name);
	Car.prototype.name = 'Benz';
	console.log(car.name);
	// BWM
	// Benz
	```
	
	但是，将 prototype 重新赋值并不能对之前实例化的对象造成影响

	```javascript
	function Car() {}
	Car.prototype.name = 'BWM';
	var car = new Car();
	console.log(car.name);
	Car.prototype = {
		name: "Benz"
	}	
	console.log(car.name);
	// BWM
	// BWM
	```
	
	这是因为重新赋值相当于创建新对象，使 prototype 指向的新的对象，而实例对象的 `__proto__` 属性依然指向原来的内容，相当于一个对象的两个引用，其中一个不在指向该对象，而且指向了新对象
	
	这不能对已经实例化出的对象造成影响，但是后面再实例化对象则可以造成影响，因为实例化过程中将修改后的 prototype 挂载到了实例对象的 `__proto__` 属性下，二者指向同一对象
## 原型链

1. prototype 中的 `__proto__` 属性

	```javascript
	function Car() {}
	var car = new Car();
	console.log(Car.prototype);
	```
	
	当我们打印构造函数的 prototype 属性时,可以看到

	```javascript
	{
		constructor: Car(),
		__proto__: {...}
	}
	```
	
	prototype 中也有 `__proto__` 属性，实例化过程 protorype 被挂载到实例对象的 `__proto__` 下，这就意味着实例对象的 `__proto__` 中也有一个 `__proto__` 属性
	
	因为这里的 prototype 是一个非空对象，是由 new Object() 或者其他自定义构造方法实例化出的，自然也有 `__proto__` 属性
	
2. 链式的 `__proto__`

	原型链是由 `__proto__` 组成的链接，原型链的顶端是 Object.prototype

	```javascript
	JuniorCoder.prototype.basicSkill = "html/css";
	function JuniorCoder() {
		this.lowerSkill = "javascript"
	}
	var junior = new JuniorCoder();
	SeniorCoder.prototype = junior;
	function SeniorCoder() {
		this.advancedSkill = "vue";
	}
	var senior = new SeniorCoder();
	console.log(senior);
	```

	这里将 JuniorCoder() 的实例对象赋值给 SeniorCoder.prototype，打印出

	```javascript
	SeniorCoder {
		advcedSkill: "vue",
		__proto__: { // senior.__proto__ ，即 SeniorCoder.protoype
			lowerSkill: "javascript",
			__proto__: { // junior.__proto__ ，即 JuniorCoder.prototype
				basicSkill: "html/css",
				__proto__: { // Object.prototype
					constructor: Object(),
					toString: toString()
					// ...
				}
			}
		}
	}
	```

	可以看出，senior 的 `__proto__` 属性指向 JuniorCoder() 实例 junior，这是因为之前 将 junior 赋值给了 SeniorCoder.prototype
	
	此外，junior 的 `__proto__` 也指向了一个对象，这个对象就是 JuniorCoder.porotype，相当于 new Object() 得出的，所以 junior 的 `__proto__` 下的 `__proto__` 就是 Object.prototype，这就是原型链的顶端，在里面我们还可以看到 toString 方法等等
	
3. 访问原型链上属性

	```javascript
	JuniorCoder.prototype.basicSkill = "html/css";
	JuniorCoder.prototype.sex = "man";
	function JuniorCoder() {
		this.lowerSkill = "javascript"
		this.age = 22;
	}
	var junior = new JuniorCoder();
	SeniorCoder.prototype = junior;
	function SeniorCoder() {
		this.advancedSkill = "vue";
	}
	var senior = new SeniorCoder();
	console.log(senior.age);
	console.log(senior.sex);
	// 22
	// man
	```
	
	senior 可以访问 junior 本身的属性，也可以访问 JuniorCoder.prototype 上的属性，因为 junior 被挂载到了 SeniorCoder.prototype 上

	```javascript
	JuniorCoder.prototype.basicSkill = "html/css";
	function JuniorCoder() {
		this.lowerSkill = "javascript";
		this.years = 3;
	}
	var junior = new JuniorCoder();
	SeniorCoder.prototype = junior;
	function SeniorCoder() {
		this.advancedSkill = "vue";
	}
	var senior = new SeniorCoder();
	senior.years++;
	// 等同于 senior.years = senior.years + 1;
	console.log(senior.years);
	console.log(junior.years);
	// 4
	// 3
	```
	
	可以看到，通过 senior 试图改变 years 属性并不能真正影响 junior 的 years 属性，实际上只是在 senior 下创建了新的 years 属性，并将 junior.years 加一的结果赋值给它
## Object.creat()

1. Object 的 creat 方法用于创建对象，参数指定 prototype，可以为对象或 null

	```javascript
	var test = {
		name: "obj"
	}
	var obj = Object.create(test);
	console.log(obj.name);
	console.log(obj.__proto__ == test);
	// obj
	// true
	```
	
2. Object.creat(null)

	```javascript
	var obj = Object.create(null);
	console.log(obj);
	document.write(obj);
	// {}
	// 报错
	```
	
	控制台显示 obj 是一个空对象，没有任何属性，包括 `__proto__`，如果使用 document.write(obj) 则会报错，因为 document.write 方法会把参数转成字符串再打印在页面，默认调用 toString() 方法，toString 方法需要从原型链上继承而来，而 obj 是一个完全的空对象，没有原型链，也没有 toString 方法，所以会报错

## 基于原型的继承

1. 利用原型链实现继承

	```javascript
	JuniorCoder.prototype.basicSkill = "html/css";
	function JuniorCoder() {
		this.lowerSkill = "javascript"
		this.age = 22;
	}
	var junior = new JuniorCoder();
	SeniorCoder.prototype = junior;
	function SeniorCoder() {
		this.advancedSkill = "vue";
	}
	var senior = new SeniorCoder();
	```

	senior 继承了 junior 的自身属性及原型链

2. call/apply 实现继承

	```javascript
	function JuniorCoder(lowerSkill) {
		this.lowerSkill = lowerSkill;
	}
	function SeniorCoder(lowerSkill, advancedSkill) {
		JuniorCoder.apply(this, [lowerSkill]);
		this.advancedSkill = advancedSkill;
	}
	var senior = new SeniorCoder("javascript", "vue");
	```

	继承了 JuniorCoder 实例的自身属性，不能继承原型链

3. 公共原型继承

	```javascript
	JuniorCoder.prototype.basicSkill = "html/css";
	function JuniorCoder() {
		this.lowerSkill = "javascript"
	}
	SeniorCoder.prototype = JuniorCoder.prototype;
	function SeniorCoder() {
		this.advancedSkill = "vue";
	}
	var senior = new SeniorCoder();
	```
	
	senior 继承 JuniorCoder 实例的原型链，不继承自身属性，但是改动 SeniorCoder.prototype 会影响 JuniorCoder.prototype
	
4. 中间对象继承（圣杯模式）

	```javascript
	JuniorCoder.prototype.basicSkill = "html/css";
	function JuniorCoder() {
		this.lowerSkill = "javascript"
	}
	Buffer.prototype = JuniorCoder.prototype;
	function Buffer() {}
	SeniorCoder.prototype = new Buffer();
	function SeniorCoder() {
		this.advancedSkill = "vue";
	}
	SeniorCoder.prototype.basicSkill = "markdown";
	console.log(SeniorCoder.prototype.basicSkill);
	console.log(JuniorCoder.prototype.basicSkill);
	// markdown
	// html/css
	```
	
	继承原型链，不继承自身属性，prototype 不相互影响，这种继承方式更为实用
	
	进行封装以后，更适应企业级开发

	```javascript
	JuniorCoder.prototype.basicSkill = "html/css";
	
	function JuniorCoder() {
		this.lowerSkill = "javascript"
	}
	
	function SeniorCoder() {
		this.advancedSkill = "vue";
	}
	inherit(SeniorCoder, JuniorCoder);
	SeniorCoder.prototype.basicSkill = "markdown";
	console.log(new SeniorCoder());
	console.log(new JuniorCoder());
	
	function inherit(Target, Origin) {
		Target.prototype = Object.create(Origin.prototype);
		Target.prototype.constructor = Target;
		Target.prototype.superClass = Origin;
	}
	```
	
	使用 Object 的 creat 方法直接创建中间对象，将 construtor、superClass 属性设置好，便于分析和维护
## hasOwnProperty()

判断属性是否是实例对象本身的，如果是则返回 true

```javascript
Car.prototype.brand = "BMW";
function Car() {
	this.color = "red";
}
var car = new Car();
console.log(car.hasOwnProperty("brand"));
console.log(car.hasOwnProperty("color"));
// false
// true
```

## instanceOf

判断实例对象的原型链上是否有某个构造方法

```javascript
JuniorCoder.prototype.basicSkill = "html/css";

function JuniorCoder() {
	this.lowerSkill = "javascript"
}

function SeniorCoder() {
	this.advancedSkill = "vue";
}
inherit(SeniorCoder, JuniorCoder);

function inherit(Target, Origin) {
	Target.prototype = Object.create(Origin.prototype);
	Target.prototype.constructor = Target;
	Target.prototype.superClass = Origin;
}

var senior = new SeniorCoder();

console.log(senior instanceof SeniorCoder);
console.log(senior instanceof JuniorCoder);
console.log(senior instanceof Object);
// true
// true
// true
```
