---

title: ES6 Symbol 类型
date: 2021/6/10
description: 本文介绍 ES6 中新增的原始数据类型 Symbol，Symbol.for 的使用和 Symbol 的使用场景，以及内置的一些系统 Symbol
tag: [前端基础, ECMAScript, JavaScript]

---

# ES6 Symbol 类型

## 概述

1. ES5 的对象属性名都是字符串，容易造成属性名的冲突

2. ES6 引入了一种新的原始数据类型 Symbol，表示独一无二的值

3. Symbol 是 JavaScript 语言的第七种数据类型，前六种是：undefined、null、布尔值（Boolean）、字符串（String）、数值（Number）、对象（Object）

   ```javascript
   console.log(typeof Symbol());
   // symbol
   ```

## Symbol

1. 使用 Symbol() 产生唯一值

   ```javascript
   // 不可使用 new 命令
   const a = Symbol();
   const b = Symbol();
   console.log(a === b);
   // false
   ```

2. Symbol 类型不可以添加属性

   ```javascript
   const a = Symbol();
   a.name = 'a';
   console.log(a.name); 
   // undefined
   ```

3. Symbol 函数可添加描述，相同描述返回值并不相同

   ```javascript
   const a = Symbol('a');
   console.log(a.toString());
   // Symbol(a)
   ```

4. Symbol 不能与其他值混合运算，但可以显式转换为字符串、布尔值

## Symbol.for

1. 当我们需要重复使用一个 Symbol 值，可以使用 Symbol.for 进行全局登记

   ```javascript
   const a = Symbol.for("123");
   const b = Symbol.for("123");
   console.log(a === b);
   // true
   ```

2. Sybmol.keyFor 可以返回一个已登记的 Symbol 的 Key

   ```javascript
   const a = Symbol.for("123");
   console.log(Symbol.keyFor(a));
   // 123
   ```

## 使用示例

1. Symbol 作为属性名解决名称冲突

   ```javascript
   // 作为属性名时，须使用 [] 进行声明和取值
   const name = Symbol.for("name");
   const person = {
       [name]: 'Cade'
   }
   console.log(person[name]);
   // cade
   ```

2.   缓存操作中解决名称冲突问题

   ```javascript
   class Cache {
       static data = {};
       static set(name, value) {
           this.data[name] = value;
       }
       static get(name) {
           return this.data[name];
       }
   }
   let user = {
       name: 'Cade',
       key: Symbol('user')
   };
   let cart = {
       name: '购物车',
       key: Symbol('cart')
   };
   Cache.set(user.key, user);
   Cache.set(cart.key, cart);
   console.log(Cache.get(user.key));
   ```

3. Symbol 作为属性名不能被遍历得到

   不能通过 for in、Object.keys 获取 Symbol 类型属性名

   ```javascript
   let symbol = Symbol("123");
   let obj = {
     name: "Cade",
     [symbol]: "abc"
   };
   
   for (const key in obj) {
     console.log(key); 
   }
   // name
   for (const key of Object.keys(obj)) {
     console.log(key); 
   }
   // name
   ```

   可以使用 Object.getOwnPropertySymbols 获取所有 Symbol 属性

   ```text
   for (const key of Object.getOwnPropertySymbols(obj)) {
     console.log(key);
   }
   ```

   也可以使用 Reflect.ownKeys(obj) 获取所有属性包括 Symbol

   ```text
   for (const key of Reflect.ownKeys(obj)) {
     console.log(key);
   }
   ```

## 内置 Symbol

1. JavaScript 内置了许多系统 Symbol，以使用它们来微调对象的各个方面

2. Symbol.hasInstance

   使用 a instanceof A 时，实际上执行的是 A\[Symbol.hasInstance](a)

   ```javascript
   class A {
       static [Symbol.hasInstance](val) {
           return val instanceof Array;
       }
   }
   
   console.log([1, 2, 3] instanceof A);
   // true
   ```

3. Symbol.toPrimitive

   当对象被转为原始类型的值时，会调用 Symbol.toPrimitive 方法，返回该对象对应的原始类型值

   Symbol.toPrimitive 被调用时，会接受一个字符串参数，表示当前运算的模式，一共有三种模式

   - Number：该场合需要转成数值
   - String：该场合需要转成字符串
   - Default：该场合可以转成数值，也可以转成字符串

   ```javascript
   const obj = {
     [Symbol.toPrimitive](hint) {
       switch (hint) {
         case 'number':
           return 123;
         case 'string':
           return 'str';
         case 'default':
           return 'default';
         default:
           throw new Error();
        }
      }
   };
   console.log(2 * obj); 
   // 246
   console.log(3 + obj); 
   // '3default'
   console.log(obj == 'default'); 
   // true
   console.log(String(obj)); 
   // 'str'

3. 其他内置 Symbol 参见 [Well-Known Symbols](https://tc39.github.io/ecma262/#sec-well-known-symbols)

