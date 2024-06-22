---

title: JavaScript 基本常识
date: 2020/3/15
description: 本文介绍了 JavaScript 的基本常识，如浏览器内核、浏览器发展历史、ECMAScript、语言类型以及 单线程性质
tag: [前端基础, JavaScript]

---



# JavaScript 基本常识

## 浏览器内核

| 五大主流浏览器 |     内核     |
| :------------: | :----------: |
|       IE       |   trident    |
|     Chrome     | webkit/blink |
|     safari     |    webkit    |
|    firefox     |    geoko     |
|     opera      |   peresto    |

## 浏览器历史

1. 1990，蒂姆 伯纳斯 李，第一个使用超文本分享资讯的人，开发出了最早的浏览器 word wide web，移植到 C 语言平台后称为 libwww，后改名为 nexus
2. 1993，美国伊利诺大学的国家超级计算应用中心的成员马克安德森开发出了 MOSIAC 浏览器，可以显示图片，真正意义上的的图形化浏览器
3. 1994，马克安德森与 SGI（硅图）公司的吉姆克拉克成立了 MOSIAC Communication Corporation。但是 MOSIAC 商标权在伊利诺大学，后被转让给 spy glass 公司。马克安德森只能将公司改名为 Netscape Communication Corporation，开发出了 Netscape Navigator，即网景浏览器
4. 1996
   - 微软收购 spy glass，在 MOSIAC 基础上开发出 IE（inernet exploror）
   - 1996，微软发布 IE3 及脚本语言 JScript
   - 1996，网景公司的 Brendan Eich 在 Netscape Navigator 基础上开发出 livescript
   - 1996，sun 公司的 java 语言兴起，网景 livescript 不温不火，于是网景与 sun 公司合作，推出 JavaScript，促进了 JavaScript 的发展

5. 2001，IE6 与 XP 系统诞生，搭载了 JavaScript 引擎
6. 2003，mozilla 公司根据 netscape navigator 开放的源码翻版出了 firefox，
7. 2008，google 基于 webkit/blink 内核，推出了 chrome 浏览器，搭载了 JavaScript V8 引擎，V8 引擎可以直接翻译机器码，可以独立于浏览器运行，是一场空前的技术革命
8. 2009，oracle 收购 sun 公司，获得了 JavaScript 语言的版权

## ECMAScript

1. ECMA，European Computer Manufactures Association，欧洲计算机制造联合会，评估、开发、认可电信、计算机行业的标准和规范
2. ECMA-262，脚本语言的规范
3. ECMAScript，规范化脚本语言，如 JavaScript，微软的 JScript 都遵从此规范

## 语言类型

1. 高级和低级语言

   高级语言：Java、C/C++、Python 等

   低级语言：汇编语言、机器语言

2. 解释型和编译型语言

   解释性语言

   - 不需要根据不同的系统平台进行移植
   - 源码 -> 解释器 -> 解释执行

   编译性语言

   - 跨平台性较差，性能较好

   - 编译：源码 -> 编译器 -> 机器语言 -> 可执行文件
   - 如 c++ ：.cpp 源码 -> 编译器 -> .s 汇编 -> 汇编器 -> .obj 目标代码 -> 链接器 -> 可执行文件

3. 脚本语言

   - 脚本语言是解释型语言，或者动态语言

   - 由解释器（脚本引擎）解释执行
   - 如：JavaScript 浏览器脚本语言，PHP 服务端脚本语言

## JavaScript 三大块

1. ECMAScript
   - 规范化脚本语言
   - 规定了语法、变量、保留字、数据类型、运算、对象、继承、函数等内容
2. BOM
   - 浏览器对象模型
   - 没有相同的规范，需要写兼容性，与浏览器本身内容相关，如滚动条、键盘鼠标事件等
3. DOM
   - 文档对象模型
   - 遵从一套 W3C 的规范，与文档内元素的操作相关

## JavaScript 线程

1. 在浏览器中 JavaScript 是单线程的

   JS 引擎是单线程的，但是可以模拟多线程

2. 时间片轮转

   短时间内执行多个任务片段

3. 模拟过程

   多个任务 -> 切分成多个任务片段 -> 随机排列成队列 -> 按顺序将片段送入 JS 进程中执行
