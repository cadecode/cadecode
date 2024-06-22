---

title: ES6 Promise
date: 2020/8/25
description: 本文介绍 ES6 中异步 API - Promise，如 Promise 构造方法、then 方法和 catch 方法、Promise.all、Promise.race 以及 async/await 的使用
tag: [前端基础, ECMAScript, JavaScript]

---

# ES6 Promise

## new Promise 

1. Promise API 用于创建一个异步的任务——承诺

   承诺有三种状态：pending、fulfilled、rejected，即等待、实现、拒绝

2. new Promise 接受一个 excutor 函数作为参数，创建承诺（pending 状态）

3. excutor 函数接受 resolve，reject 函数作为参数，任务的执行器

4. resolve 函数执行意味着承诺实现（fulfilled），传入承诺实现后的信息 value

   reject 函数执行意味着承诺拒绝（rejected），传入函数拒绝后的原因 reason

5. excutor 函数内部代码在创建 Promise 实例时同步执行

   ```javascript
   const promise = new Promise(executor)
   
   function executor(resolve, reject) {
       // 同步执行
       console.log('executor：执行器执行')
       // 使用延时器模拟异步
       setTimeout(() => {
           console.log('executor: 异步任务执行')
           resolve('executor: resolve 方法执行')
           // reject('executor: reject 方法执行')
       }, 1000)
   }
   ```

6. Promise.resolve(value) 直接返回一个被实现的承诺

   Promise.reject(reason) 直接返回一个被拒绝的承诺

   ```javascript
   Promise.resolve('承诺实现') // 返回 fulfilled 状态的 Promise 对象
   ```

## then 方法

1. Promise 对象调用 then 方法处理异步任务执行结果

2. then 方法返回新的 Promise 对象，可以链式调用

3. then 方法接受 onFulfilled 和 onRejected 函数作为参数

4. onFulfilled 函数在 resolve 执行后执行，接受 value 作为参数

5. onRejected 函数在 reject 执行后执行，接受 reason 作为参数

6. 没有指定 onFulfilled 或 onRejected 则忽略，交由下个 then 处理

   ```javascript
   new Promise((resolve, reject) => {
       setTimeout(() => {
         resolve('executor: resolve 方法执行')
         // reject('executor: reject 方法执行')
       }, 1000)
     })
     .then(onFulfilled, onRejected)
     .then(value => {
       console.log(vlaue)
     }, reason => {
       console.log(reason)
     })
   
     function onFulfilled(value) {
       console.log(value)
       // 返回 rejected 状态的承诺
       return Promise.reject('onFulfilled: Promise.reject')
     }
   
     function onRejected(reason) {
       console.log(reason)
     }
   // 控制台
   // executor: resolve 方法执行
   // onFulfilled: Promise.reject
   ```

7. 对于 onFulfilled 和 onRejected 函数的返回值，分情况如下：

   - 没有返回值，then 方法返回一个已实现的承诺，下个 then 中 onFulfilled 接受 undefined 作为参数

   - 返回一个值，then 方法返回一个已实现的承诺，下个 then 中 onFulfiled 接受该值作为参数

   - 抛出一个错误，then 方法返回一个被拒绝的承诺，下个 then 中 onRejected 接受该错误作为参数

   - 返回一个 Promise 对象，then 方法直接返回该承诺，下个 then 中对返回的 Promise 对象进行处理

## catch 方法

1. Promise 对象调用 then 方法，其中，then 方法中 onRejected 函数的功能也可以使用 catch 方法来实现

2. catch 方法用于捕获被拒绝的承诺，接受 reject 方法的参数或then 方法抛出的错误作为参数

3. 如果存在 onRejected 函数，则后一个 catch 将无法获取该次 reject 传入的 reason，当然，如果 onRejected 函数返回了被拒绝的承诺，后一个 catch 将捕获其传入的 reason

4. 同样的，finally 方法可保证 fulfilled 和 rejected 状态都会执行回调函数，常用来做最后的处理或清理工作

   ```javascript
   new Promise((resolve, reject) => {
       setTimeout(() => {
         // resolve('executor: resolve 方法执行')
         reject("executor: reject 方法执行")
       }, 1000);
     })
       .then(
         value => {
           console.log("then onFulfilled: " + value)
         },
         reason => {
           console.log("then onRejected: " + reason);
           throw new Error("then onRejected throw error")
         }
       )
       .catch(reason => {
         console.log("catch: " + reason)
       })
       .finally(() => {
         console.log("finally")
       })
   // 控制台
   // then onRejected: executor: reject 方法执行
   // catch: Error: then onRejected throw error
   // finally
   ```

## Promise.all

1. Promise.all() 接受一个可迭代数据类型（Array, Map, Set），即 Promise 对象集合

   等待集合中所有承诺 resolve 之后返回一个装有各个承诺返回信息的数组

2. Promise.all() 接受的集合中有不是 Promise 对象的，将直接用 Promise.resovle 抛出

3. Promise.all() 接受空集合，返回空数组

4. Promise.all() 接受的集合中第一个被拒绝的承诺的将会被当做 Promise.all 的返回值返回

   ```javascript
   Promise.all([
       '这是字符串，不是 Promise 对象',
       new Promise((resovle, reject) => {
         setTimeout(() => {
           resovle('promise 1 resovle')
           // reject('promise 1 reject') (1)
         }, 500)
       }),
       new Promise((resovle, reject) => {
         setTimeout(() => {
           resovle('promise 2 resovle')
         }, 700)
       }),
       new Promise((resovle, reject) => {
         setTimeout(() => {
           resovle('promise 3 resovle')
         }, 600)
       })
     ])
     .then(value => {
       console.log(value)
     })
     .catch(reason => {
       console.log(reason)
     })
   // 控制台
   // ["这是字符串，不是 Promise 对象", "promise 1 resovle", "promise 2 resovle", "promise 3 resovle"]
   // 若语句 (1) 打开，输出
   // promise 1 reject
   ```

## Promise.race

1. Promise.race() 接受一个可迭代数据类型（Array, Map, Set），即 Promise 对象集合

   返回集合中最先完成的承诺，无论是 fulfilled 还是 rejcted 状态

2. Promise.race() 接受的集合中有不是 Promise 对象的，将直接用 Promise.resovle 抛出，并作为 Promise.race 的返回值返回

3. Promise.race() 接受空集合，返回 pending 状态的 Promise 对象

   ```javascript
    Promise.race([
       new Promise((resovle, reject) => {
     	    //'这是字符串，不是 Promise 对象', (1)
         setTimeout(() => {
           // resovle('promise 1 resovle')
           reject('promise 1 reject')
         }, 500)
       }),
       new Promise((resovle, reject) => {
         setTimeout(() => {
           resovle('promise 2 resovle')
         }, 700)
       }),
       new Promise((resovle, reject) => {
         setTimeout(() => {
           resovle('promise 3 resovle')
         }, 600)
       })
     ])
     .then(value =>{
       console.log(value)
     })
     .catch(reason => {
       console.log(reason)
     })
   // 控制台
   // promise 1 reject
   // 若语句 (1) 打开，输出
   // 这是字符串，不是 Promise 对象
   ```

## async 与 await

1. async 将当前函数标记为与作用域内其他函数为异步关系

   - 如果函数返回一个 Promise 对象，则返回的结果就是这个 Promise 对象
   - 如果函数返回值不是 Promise 对象，则使用 Promise.resolve 方法包装返回值后返回
   - 如果抛出错误，则使用 Promise.reject 方法包装错误对象后返回

2. await 是一个操作符，用于暂停 async 函数的执行，待 Promise 对象的结果

3. 如果 await 等待的承诺被拒绝，会抛出异常，可以使用 try catch 处理

   ```javascript
   function creatPromise() {
     return new Promise((resolve, reject) => {
       setTimeout(() => {
         resolve('resolve')
         // reject('reject')
       }, 1000)
     })
     .catch(reason => {
       return '2'
       // 相当于
       // return Promise.resolve('2')
     })
   }
   
   async function test() {
       try {
           const val = await creatPromise()
           console.log('val: ' + val)
       } catch (e) {
           console.log('e: ' + e)
       }
   }
   
   // 以下为同步代码
   const result = test()
   console.log('async 返回值类型：' + result)
   console.log('2333') 
   // 控制台
   // async 返回值类型：[object Promise]
   // 2333
   // Val: resolve
   ```

