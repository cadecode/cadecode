---

title: Linux Shell 基本语法
date: 2022/7/17
description: 本文介绍了 Linux Shell 脚本的基本语法，包括变量、数组、传参、运算符、条件、循环，以及函数的定义和调用
tag: [容器化与运维, linux]

---

# Linux Shell 基本语法

## Linux Shell 介绍

1. Linux Shell 是 Linux 操作系统外壳，是用户和系统内核之间的接口程序

2. Bash 是一种 Shell，也可以说是一种 Shell 命令的解释器

3. 什么是 Shell 脚本？

   由 Shell 命令组成的可执行文件，通过解释器解释运行

   Shell 脚本的开头使用`#!/bin/bash` 可指定解释器为 Bash

4. Shell 支持单行注释，以 # 开头
5. Shell 不需要以分号结尾，除非一行书写多条语句

## 变量与数组

1. 变量类型

   局部变量：在脚本中声明，只在当前 Shell 实例中生效

   环境变量：所有 Shell 启动的程序，都能访问的变量

2. 环境变量

   一般使用 export 命令声明环境变量，使用 export -p 或者 env 命令可查看当前生效的环境变量

   脚本默认是在子 Shell 环境下运行的，执行完毕自动退出，子 Shell 环境可以访问父级 Shell 的所有环境变量，也可以使用 source 命令可以让脚本在当前 Shell 中执行

3. 变量的操作

   创建变量

   ```shell
   # 等号两边不能有空格
   myName="Cade"
   # local 表示只能在函数体中使用的局部变量
   local myAge=23
   ```

   变量重新赋值

   ```shell
   myName="Bob"
   ```

   只读变量

   ```shell
   myName="Cade"
   readonly myName
   ```

   删除变量

   ```shell
   unset myName
   ```

   使用变量

   ```shell
   # 输出变量，推荐使用 ${}
   echo $myName
   echo${myName}
   ```

4. 字符串

   声明一个字符串

   ```shell
   myName="Cade"
   # 只有一个单词时可以不写引号
   myName1=Cade
   myName2="Cade Li"
   myName3='Cade Li'
   ```

   单引号不会解析其中的变量，只会原样输出，单引号中不能出现单独的单引号，转义也不行

   双引号会解析变量内容，可以使用转义

   ```shell
   myName="Cade Li"
   echo "${myName}"
   ```

   拼接字符串

   ```shell
   myName="Cade Li"
   myAge="23"
   str=${myName}${myAge}
   # 出现空格时
   str="${myName} ${myAge}"
   
   # 等效于
   str=${myName}" ${myAge}"
   ```

   操作字符串

   ```shell
   # 获取长度
   myName="ABCDE"
   echo ${#myName}
   # 截取子串，从 1 位置开始，向后截取 4 个字符
   echo ${myName:1:4} # 输出 BCDE
   ```

5. 数组

   定义数组

   Bash 中数组从 0 开始，其他 Shell 可能从 1 开始

   ```shell
   # 使用小括号定义，空格分隔
   arr=("Bob" "Lily" "Candy")
   # 直接定义数组元素
   arr[0]="Bob"
   arr[3]="Candy"
   ```

   数组操作

   ```shell
   # 获取元素
   echo ${arr[0]}
   # 输出所有元素
   echo ${arr[@]}
   # 输出元素个数
   echo ${#arr}
   echo ${#arr[@]}
   # 输出单元素长度
   echo ${#arr[1]}
   ```

## 参数传递

1. 如果传递参数？

   ```shell
   # 脚本传参 1 2 3
   ./mySh.sh 1 2 3
   
   # 函数传参 a b c
   myFunc a b c
   ```

2. 获取参数

   ```
   $0 执行的文件名
   $1 第一个参数，$9 第九个参数，${10} 第十个参数，以此类推
   $# 参数个数
   $* 一个单字符串显示全部参数，`"$*"` 表示`"$1 $2 $3 ..."`
   $@ 一个单字符串显示全部参数，`"$@"` 表示`"$1" "$2" "$3" ...`
   $$ 脚本运行的进程号
   $? 上一次执行的命令的退出状态，0 表示正常
   ```

## 运算符

1. 四则运算

   +、-、*、/，乘号需要转义

   ```shell
   num=`expr 2 + 2` # 注意空格
   num=$[2+2]
   num=$((2+2))
   ```

2. 数学关系运算

   ```
   [ $a -eq $b ] 检查相等
   [ $a -ne $b ] 检查不等
   ```

   同理 -gt、-lt、-ge、-le

3. 字符串运算

   ```
   [ $a = $b ] 检查相等，等效于 [ $a == $b ]，等号两边需要空格
   [ $a != $b ] 检查不等
   [ -z $a ] 检查是否为空，为空返回 true
   [ -n "$a" ] 检查是否为空，不为空返回 true
   [[ $a > $b ]] 按 ASCII 表顺序比较
   ```

4. 布尔和逻辑运算

   ```
   非：[ ! -z $a ]
   与：[ $a -lt 100 -o $b -gt 100 ]
   或：[ $a -lt 100 -a $b -gt 100 ]
   逻辑与：[[ $a -lt 100 && $b -gt 100 ]]
   逻辑或：[[ $a -lt 100 || $b -gt 100 ]]
   ```

5. 文件运算

   ```
   [ -d $file ] 是否目录
   [ -f $file ] 是否文件
   [ -e $file ] 是否存在
   [ -r $file ] 是否可读，同理 -w、-x
   ```

6. 命令替换

   ```shell
   a=`echo 123`
   b=$(echo 123) # 推荐
   echo ${a}
   echo ${b}
   # 打印出 123
   ```

## 条件与循环

1. if

   ```shell
   a=1
   
   if [[ $a -eq 0 ]]; then :
   	echo "0"
   elif [[ $a -eq 1 ]]; then :
   	echo "1"
   else
   	echo "NAN"
   fi
   ```

   if then 中的执行内容不能为空，除非 then 后面加了冒号，冒号代表空执行

   推荐使用 [[]]，比 [] 功能更强，支持 &&、||、>、< 等

2. case

   ```shell
   # read 获取键盘输入
   reap -p "Input a num: " > num
   
   case $num in
       1)
           echo "0"
           ;;
       2)
           echo "1"
           ;;
       *)
           echo "NAN"
   esac
   ```

   双分号表示跳出，*) 表示模式匹配

3. for

   数字性循环

   ```shell
   # 示例 1
   for((i=1;i<=10;i++));  
   do   
   	echo ${i};  
   done
   # 示例 2
   for i in $(seq 1 10); 
   do   
   	echo ${i};  
   done
   # 示例 3
   for i in {1..10};
   do  
   	echo ${i};
   done
   ```

   字符性循环

   ```shell
   # 示例 1
   for i in "a" "b" "c" ;  
   do  
   	echo ${i} 
   done
   # 示例 2
   str="a b c"
   for i in str;  
   do  
   	echo ${i}"x"
   done
   # 输出 axbxcx
   ```

   路径查找

   ```shell
   # 示例 1
   for file in ~/*.sh;  
   do  
   	echo $file  
   done
   # 示例 2
   for file in $(ls ~/*.sh);  
   do  
   	echo $file;  
   done
   ```

4. while

   ```shell
   # 示例 1
   i=0
   while [[ ${i} -lt 10  ]];
   do
           i=$[${i}+1]
           echo ${i}
   done
   # 示例 2
   while ((i < 10));
   do
           i=$[${i}+1]
           echo ${i}
   done
   ```

> 双中括号 [[]] 扩展了字符串操作、逻辑运算等
>
> 1. 支持正则匹配
> 2. 支持 &&、||、<、> 等，不需要转义 
>
> 双小括号 (()) 扩展了数字运算
>
> 1. 可以使用 C 语言规范的表达式，a++ 等甚至是三目
> 2. 可以不加 $ 获取变量
> 3. 对空格没有强制要求

## 函数

1. 定义函数

   ```shell
   function myFunc() {
   	# 语句 ...
   	local a=$1
   	local b=$2
   	echo $[${a}+${b}]
   	return 0
   }
   ```

   function 关键字可以省略

   echo 表示函数输出，可以用一个变量接收

   return 返回值 0-255，在函数调用后用紧随其后的 $? 可以获取 return 值，可以省略

2. 调用函数

   ```shell
   myFunc 1 2
   ```

   参数跟着函数名的后面，用空格分隔
