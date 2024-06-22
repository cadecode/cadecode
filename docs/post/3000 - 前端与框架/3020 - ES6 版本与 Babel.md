---

title: ES6 版本与 Babel
date: 2020/6/9
description: 本文介绍 ECMAScript6，版本历史、Babel 安装配置、在浏览器中使用 Babel，以及使用 babel-plyfill 支持 ES6 新增 API
tag: [前端基础, ECMAScript, JavaScript]

---

# ES6 版本与 Babel 

## ECMAScript 版本历史

1. HTML

   HTML1，HTML2，HTML3，1991 - 1997 由 IETF 组织制定

   IETF：The Internet Engineering Task Force，国际互联网工程任务组

2. HTML3.2

   1997.1 发布，至今归属于 W3C 组织（万维网联盟）

3. JavaScript 

   1995，网景公司推出 LiveScript，为蹭 Java 热度，联合发布 JavaScript

   1996，JavaScript1.0、1.1 发布

   1997，微软 JScript 发布（完全照抄 JavaScript）

   1997.6，ECMAScript1.0 发布（以 JavaScript1.0 为蓝本）

   1998.6，ECMAScript2.0 发布

   1999.12，ECMAScript3.0 发布

   2000，ECMAScript4.0 草案没有被通过，调整幅度太大

   2007，ECMAScript4.0 准备发布，依然没有通过

   2008.7，在 3.0 基础上推出 ECMAScript3.1，更名为 ECMAScript5

   2009.12，将 4.0 分为三部分，一部分作为 ES5 正式发布，另外 javascript.next，javascript.next.next 两部分放入草案中

   2011.6，ECMAScript5.1 发布，成为 ISO 标准

   2013.3，javascript.next 草案冻结

   2013.6，javascript.next 草案发布

   2015.6，ECMAScript6 正式发布

4. ECMAScript

   ECMA 即欧洲计算机制造联合会，制定脚本语言规范了 ECMA-262，遵从该规范的脚本语言成为 ECMAScript

   ECMAScript2015/2016/2017 等都属于 ES6，每年都会有小版本的改动

## Babel 搭建环境

### Babel 介绍

1. Babel 用于将 ES6 代码转译为浏览器可执行的 ES5 代码
2. 参考网站：[Babel 中文网](https://www.babeljs.cn/)

### 安装配置

1. 首先使用 npm init 将项目交由 npm 管理依赖（生成 package.json 文件）

2. 安装 babel 转译规则集和脚手架

   ```javascript
   npm i -D babel-preset-env
   npm i -D babel-cli
   ```

3. 项目根目录创建 .babelrc 文件，指定规则集

   ```javascript
   {
     "presets": ["babel-preset-env"]
   }
   ```

4. package.json 的 scripts 属性中添加命令

   ```javascript
   "scripts": {
       "test": "echo \"Error: no test specified\" && exit 1",
       "babel-build": "babel app.js"
     }
   ```

5. 根目录下的 app.js 中使用了 ec6 语法

   ```javascript
   const fnc = () => {
       console.log('es6 箭头函数')
   }
   
   fnc();
   ```

6. 执行 npm run babel-build 后根目录下生成 bundle.js

   ```javascript
   'use strict';
   
   var fnc = function fnc() {
       console.log('es6 箭头函数');
   };
   
   fnc();
   ```

7. 同理，使用 babel src -d lib 指令可以将 src 下的 js 文件全部转译到 lib 文件夹下

   ```javascript
   "scripts": {
       "babel-build-src": "babel src -d lib"
     }
   ```

8. 使用 babel-node 执行代码

   ```javascript
   "scripts": {
       "babel-node": "babel-node ./src/app.js"
     }
   ```

   npm run babel-node 即可执行 app.js（node 环境）

### 浏览器中使用

1. 使用 babel-standalone 在浏览器中转译 es6 语法

2. 使用 cdn 方式引入，将 es6 代码 script 标签指定为 text/babel

   ```javascript
   <div id="js-box"></div>
   <script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.11.6/babel.min.js"></script>
   <script type="text/babel">
       const getMsg = ()=> {
           return 'Message'
       }
       document.getElementById('js-box').innerHTML = getMsg()
   </script>
   ```

### 使用 ES6 API

1. Babel 默认只对 ES6 语法进行转译，不包含 ES6 的新增 API

   如 Iterator、Generator、Set、Maps、Proxy、Reflect、Symbol、Promise 等全局对象，以及一些定义在全局对象上的方法（Object.assign...）

2. 使用 babel-plyfill 提供新增 API 的支持

   ```javascript
   npm install --S babel-polyfill
   ```

   引入 babel-plyfill

   ```javascript
   require("babel-polyfill")
   // 或
   import "babel-polyfill"
   ```

   

