(window.webpackJsonp=window.webpackJsonp||[]).push([[26],{560:function(t,a,s){"use strict";s.r(a);var n=s(2),e=Object(n.a)({},(function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h1",{attrs:{id:"javascript-dom-常用尺寸"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#javascript-dom-常用尺寸"}},[t._v("#")]),t._v(" JavaScript DOM 常用尺寸")]),t._v(" "),s("h2",{attrs:{id:"怪异和标准模式"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#怪异和标准模式"}},[t._v("#")]),t._v(" 怪异和标准模式")]),t._v(" "),s("ol",[s("li",[t._v("浏览器在解析 CSS 时有怪异和标准两种模式，目的是为了向旧版本兼容")]),t._v(" "),s("li",[t._v("标准模式下浏览器会按 w3c 规范解析代码")]),t._v(" "),s("li",[t._v("怪异模式下按浏览器自身规范解析代码，一般会向后兼容 5 个版本")]),t._v(" "),s("li",[t._v("首句使用 "),s("code",[t._v("<!DOCTYPE html>")]),t._v("，则使用 HTML5 规范，即标准模式，不加这句则使用怪异模式")]),t._v(" "),s("li",[t._v("使用"),s("code",[t._v("document.compatMode")]),t._v(" 返回 CSS1Compat 表示处于标准模式，返回 BackCompat 则为怪异模式")])]),t._v(" "),s("h2",{attrs:{id:"滚动条滚动距离"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#滚动条滚动距离"}},[t._v("#")]),t._v(" 滚动条滚动距离")]),t._v(" "),s("ol",[s("li",[s("p",[t._v("常见写法")]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 获取滚动条和上侧/左侧的距离，即页面滚动距离")]),t._v("\nwindow"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("pageYOffset"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("pageXOffset \ndocument"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("bady"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("scrollTop"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("scrollLeft\ndocument"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("documentElement"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("scrollTop"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("scrollLeft\nwindow"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("scrollY"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("scollX\n")])])])]),t._v(" "),s("li",[s("p",[t._v("兼容性表")]),t._v(" "),s("p",[t._v("(b) 代表怪异模式，(s) 代表标准模式，C 代表 chrome，F 代表 firefox，O 代表 opera")]),t._v(" "),s("table",[s("thead",[s("tr",[s("th",{staticStyle:{"text-align":"center"}},[t._v("浏览器")]),t._v(" "),s("th",{staticStyle:{"text-align":"center"}},[t._v("IE6789(b)")]),t._v(" "),s("th",{staticStyle:{"text-align":"center"}},[t._v("IE678(s)")]),t._v(" "),s("th",{staticStyle:{"text-align":"center"}},[t._v("IE9(s)")]),t._v(" "),s("th",{staticStyle:{"text-align":"center"}},[t._v("C(bs)")]),t._v(" "),s("th",{staticStyle:{"text-align":"center"}},[t._v("O/F(b)")]),t._v(" "),s("th",{staticStyle:{"text-align":"center"}},[t._v("O/F(s)")])])]),t._v(" "),s("tbody",[s("tr",[s("td",{staticStyle:{"text-align":"center"}},[t._v("documentElement")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("0")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("可用")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("可用")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("0")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("0")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("可用")])]),t._v(" "),s("tr",[s("td",{staticStyle:{"text-align":"center"}},[t._v("body")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("可用")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("0")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("0")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("可用")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("可用")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("0")])]),t._v(" "),s("tr",[s("td",{staticStyle:{"text-align":"center"}},[t._v("pageOffset")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("undefined")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("undefined")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("可用")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("可用")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("可用")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("可用")])]),t._v(" "),s("tr",[s("td",{staticStyle:{"text-align":"center"}},[t._v("scroll")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("undefined")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("undefined")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("undefined")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("可用")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("可用")]),t._v(" "),s("td",{staticStyle:{"text-align":"center"}},[t._v("可用")])])])])]),t._v(" "),s("li",[s("p",[t._v("兼容性写法")]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("getScrollOffset")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("window"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("pageXOffset"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n            top"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" window"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("pageYOffset"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n            left"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" window"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("pageXOffset\n        "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("else")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        top"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v("document"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("body"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("scrollTop "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("||")]),t._v(" document"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("documentElement"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("scrollTop"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        left"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v("document"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("body"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("scrollLeft "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("||")]),t._v(" document"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("documentElement"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("scrollLeft\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])])]),t._v(" "),s("h2",{attrs:{id:"窗口可视尺寸"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#窗口可视尺寸"}},[t._v("#")]),t._v(" 窗口可视尺寸")]),t._v(" "),s("ol",[s("li",[s("p",[t._v("常见写法")]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 获取窗口可视区域宽高")]),t._v("\nwindow"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("innerWidth"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("innerHeight "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 包括滚动条 兼容 IE9 及以上")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// window.outerWidrh/outerHeight 包含工具栏和滚动条，即浏览器窗口大小")]),t._v("\ndocument"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("documentElement"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("clientWidth"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("clientHeight "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 不包括滚动条 兼容标准模式")]),t._v("\ndocument"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("body"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("clientWidth"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("clientHeight "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 包括滚动条 兼容怪异模式")]),t._v("\n")])])])]),t._v(" "),s("li",[s("p",[t._v("兼容性写法")]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("getViewportSize")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("window"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("innerWidth"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n                width"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" window"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("innerWidth"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n                height"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" window"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("innerHeight\n            "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("else")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("document"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("compatMode "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("===")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'BackCompat'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n                "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n                    width"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" document"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("body"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("clientWidth"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n                    height"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" document"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("body"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("clientHeight\n                "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("else")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n                "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n                    width"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" document"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("documentElement"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("clientWidth"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n                    height"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" document"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("documentElement"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("clientHeight\n                "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])])]),t._v(" "),s("h2",{attrs:{id:"文档滚动尺寸"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#文档滚动尺寸"}},[t._v("#")]),t._v(" 文档滚动尺寸")]),t._v(" "),s("ol",[s("li",[s("p",[t._v("常见写法")]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 获取文档可滚动的总尺寸")]),t._v("\ndocument"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("body"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("scrollHeight"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("scrollWidth\ndocument"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("documentElement"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("scrollHeight"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("scrollWidth\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 优先使用 body.scrollHeight")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// documentElement.scrollHeight 在低版本 IE 存在问题")]),t._v("\n")])])])]),t._v(" "),s("li",[s("p",[t._v("兼容性写法")]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("getScrollSize")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("document"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("body"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("scrollHeight"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n            width"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" document"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("body"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("scrollWidth"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n            height"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" document"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("body"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("scrollHeight\n        "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("else")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        width"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" document"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("documentElement"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("scrollWidth"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        height"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" document"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("documentElement"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("scrollHeight\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])])]),t._v(" "),s("h2",{attrs:{id:"元素文档坐标"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#元素文档坐标"}},[t._v("#")]),t._v(" 元素文档坐标")]),t._v(" "),s("ol",[s("li",[s("p",[t._v("offsetParent")]),t._v(" "),s("p",[t._v("元素无 fixed 定位时，offsetParent 为最近的非默认定位的父级元素，没有则返回 body")]),t._v(" "),s("p",[t._v("元素有 fixed 定位时，offsetParent 返回 null")]),t._v(" "),s("p",[t._v("body 的 offsetParent 为 null")])]),t._v(" "),s("li",[s("p",[t._v("offsetTop/offsetLeft")]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")]),t._v(" div "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" document"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("getElementById")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"box"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\ndiv"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("offsetTop"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("offsetLeft "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 相对 offsetParent 元素的偏移")]),t._v("\n")])])])]),t._v(" "),s("li",[s("p",[t._v("获取元素在文档中的坐标")]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("getElemPositionInDoc")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("elem")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")]),t._v(" parent "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" elem"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("offsetParent"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        top "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" elem"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("offsetTop"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        left "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" elem"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("offsetLeft"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("while")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("parent"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        top "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+=")]),t._v(" parent"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("offsetTop"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n        left "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+=")]),t._v(" parent"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("offsetLeft"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n        parent "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" parent"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("offsetParent"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        top"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" top"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        left"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" left\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])])]),t._v(" "),s("h2",{attrs:{id:"窗口滚动"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#窗口滚动"}},[t._v("#")]),t._v(" 窗口滚动")]),t._v(" "),s("ol",[s("li",[s("p",[t._v("常见写法")]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 滚动到 (x, y) 坐标")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// window.scroll() 和 scrollTo() 功能相同")]),t._v("\nwindow"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("scrollTo")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("x"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" y"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\nwindow"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("scrollTo")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n   top"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("100")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n   behavior"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'smooth'")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 平滑滚动")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])])]),t._v(" "),s("li",[s("p",[t._v("滚动到低部判断方法")]),t._v(" "),s("div",{staticClass:"language-javascript extra-class"},[s("pre",{pre:!0,attrs:{class:"language-javascript"}},[s("code",[t._v("window"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("innerHeight "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+")]),t._v(" window"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("pageYOffset "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">=")]),t._v(" document"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("body"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("scrollHeight\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 窗口可视高度 + 垂直滚动条滚动距离 >= 文档滚动高度")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 注意写兼容性")]),t._v("\n")])])])])])])}),[],!1,null,null,null);a.default=e.exports}}]);