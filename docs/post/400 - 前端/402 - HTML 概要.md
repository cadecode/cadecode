---

title: HTML 概要
date: 2020/3/1
description: HTML 基础知识概要
tag: [HTML/CSS]

---



# HTML 概要

## HTML 基础

### 概念

1. 超文本标记语言
2. 用于 web 开发，由浏览器解析

### 版本

1. HTML 4.01

   ```html
   <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
           "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
   ```

2. HTML 5

   ```html
   <!doctype html>
   ```

   - HTML5 弃用了许多标签，如 iframe/center/s/u
   - 新增结构化标签，如 header/footer/aside/nav 
   - 新增媒体标签，如 vedio/audio
   - 开放了一些 JavaScript api
   - CSS3 技术：过渡、动画、转换 

### 标签

1. 双标签

   开放标签-闭合标签，头标签-尾标签

   ```html
   <P>文本</P>
   <div></div>
   ```

2. 单标签

   为了符合 XHTML 规范，单标签也需要闭合

   ```html
   <br>
   <br />
   ```

## HTML 标签

### head

```html
<meta charset="UTF-8" />
<title>Index</title>
<meta name="keywords" content="" />
<meta name="description" content="" />
```

1. title

   主页：网站名称 + 关键词描述

   详情页：详情名称 + 网站名称 + 简介

   列表页： 分类名称 + 关键字 + 网站名称

   文章页：标题 + 分类 + 网站名称

2. keywords

   100 个字符，用英文逗号隔开

   网站名称 + 分类信息 + 网站名称

3. description

   网站描述信息，80 - 120 汉字

   综合 title + keywords 的简单描述

> 搜索引擎认知的优先级：
>
> title > description > keywords

4. charset
   - gb2312：中国国家信息处理标准码，简体中文编码
   - GBK：汉字扩展规范，扩大汉字收录，增加繁体字以及藏蒙回等少数名字文字
   - UTF-8：万国码。收录了世界上几乎所有正在使用的文字

### h1-h6

1. heading 标签，标题标签
2. 粗体，独占一行，上下 margin 约为 21 px
3. h1 字体大小为 2 em，默认为 16 * 2 = 32 px

### p

1. 独占一行，上下 margin 16px
2. 缩进使用样式 text-indent: 2em

### b 和 strong

1. 加粗
2. b 是物理标签，strong 是语义化标签
3. 推荐使用 strong

### i 和 em

1. 强调，斜体，emphasize
2. i 是物理标签，em 是语义化标签
3. 推荐使用 em

### del 和 ins

1. del：删除线
2. del 相当于 p 加样式 text-decoration: line-through
3. ins：下划线
4. ins 相当于 p 加样式 text-decoration: underline

### address

1. 表示地址，强调
2. 斜体

### div

1. 盒子、容器，块状的，division
2. 网页结构标签，用于布局

### br 和 hr

1. br：换行
2. hr：分割线
3. 不推荐在正式开发场合使用

### img

```html
<img src="" alt="" title="">
```

1. src：资源路径，可以是网络路径、相对路径、绝对路径
2. alt：资源加载失败时显示的内容
3. title：鼠标在图片上短暂停留显示的内容

### a

```html
<a href="http://baidu.com" target="_blank">去百度</a>
<a href="tel:12345678910">打电话</a>
<a href="mailto:test@qq.com">发邮件</a>
<a href="#box">定位到 id 为 box 的元素</a>
<a href="javascript:alert(1);"弹出></a>
```

1. a：anchor，锚点

2. 功能

   超链接、打电话、发邮件、定位、协议限定符

3. target 属性值为 _blank，在新页面打开

### sup 和 sub

1. sup: 上标标签，superscript
2. sub: 下标标签，subscript

### span

1. 内联元素
2. 默认没用任何样式

### ol 和 ul

1. ol：有序列表，ordered list

   ```html
   <ol type="1" start="10" reversed></ol>
   ```

   使用 type 属性选择序号类型，如 1，a，A，i，I

   使用 start 属性定义开始序号，只对数字生效

   reversed 可以倒序

2. ul：无序列表，unordered list

   type：可选 disc、square、circle，分别为小圆点、方点、圆圈

3. ul、ol、li 都是块级元素

### table

```html
<table border="1" cellpadding="10" cellspacing="10">
    <caption>表的标题</caption>
    <thead>
        <tr>
            <th>id</th>
            <th>name</th>
        </tr>
    </thead>
    <tbody>
    <tr>
    	<td>1</td>
        <td>Jett</td>
    </tr>
    <tr>
    	<td>2</td>
        <td>John</td>
    </tr>
    </tbody>
    <tfoot>
        <tr>
            <td colspan="2">信息</td>
        </tr>
    </tfoot>
</table>
```

1. caption：标题
2. tr：行标签
3. th：表头
4. td：单元格
5. table 属性
   - cellpadding：单元格内边距
   - cellspacing ：单元格间距
6. tr 属性：
   - colspan：列合并
   - rowspan：行合并

7. 推荐使用 thead、tfoot、tbody 语义化标签

### frameset 和 iframe

```html
<frameset rows="10%, 90%">
    <frame src="top.html"/>
    <frame src="left.html"/>
    <frame name="mainFrame" src="mian.html"/>
</frameset>
```

1. frameset：不推荐使用
   - 不能写在 body 中
   - 不同 frame 之间数据交互不方便
   - frame 链接到的页面多时，加重请求负担
   - 对搜索引擎不友好

2. iframe：内联框架

   - 对搜索引擎不友好

   - 滚动条混乱
   - 加载过程不容易监控

## HTML 表单

> 表单用于用户提交数据
>
> 数据 = 数据名 +  数据值

### form

```html
<form action="" method="get">
</form>
```

1. form：表单，块级元素
2. method：请求方法，get/post
3. action：提交数据的目的地址

### input

1. input：表单输入控件
2. type：输入类型，text/password 等
3. value：输入的值
4. maxlength：最大字符数
5. readonly 只读控件，提交时可提交数据
6. disabled 禁用控件，提交时不提交数据

### label 

label 的 for 属性与控件的 id 相同时，点击 label 可以使控件获取焦点

### radio

1. radio：单选按钮
2. 相同 name 的单选按钮为一组，同时只能选择一个
3. checked 属性设置默认选中

### checkbox

1. checkbox：多选按钮
2. 相同 name 的多选按钮提交到后端时可用数组接收
3. checked 属性设置默认选中

### select

```html
<select name="lang">
    <option value="">请选择</option>
    <option value="java">Java</option>
    <option value="js">JavaScript</option>
</select>
```

1. selcet：下拉选择框，name 为提交时的数据名称
2. option：选项，不给 value 属性时，提交 option 标签内文本
3. select 使用 multiple 属性可以多选，提交到后端时可用数组接收

### textarea

1. textarea：文本域
2. cols 属性即平均字符数，控制宽度，一般默认英文字符宽度  8px  * cols + 滚动条宽度 17px
3. rows 属性即行数控制高度
4. textarea 头尾标签之间不能有空格或换行，否知当成文本显示

### fieldset 和 legend

```html
<form action="" method="get">
    <fieldset>
        <legend>用户登录</legend>
        用户名：<input type="text" name="username" />
        密码：<input type="password" name="password" />
        <input type="submit" value="提交" />
    </fieldset>
</form>
```

1. fieldset：用于表单的分组，块级元素
2. lengend：显示分组的标题，块级元素

## HTML 元素

1. 内联元素

   也叫行内元素、行间元素

   不独占一行，不可以定义宽高

   如 span、strong、em、del、ins、del、ins、sub、sup、a

2. 块级元素

   独占一行，可以定义宽高

   如 p、div、h1、address、ul、ol、li、table、form

3. 内联块级元素

   如 img，input、select、textarea、iframe

4. 注意：

   内联元素可以嵌套内联元素，块级元素可以嵌套任何元素

   p 标签不能嵌套 div，a 标签不能嵌套 a 标签



