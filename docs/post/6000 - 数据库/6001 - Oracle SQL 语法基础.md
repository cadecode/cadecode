---

title: Oracle SQL 语法基础
date: 2021/3/9
description: 本文介绍 Oracle 数据库相关的基本概念，建库建表、增删改查的基本写法，以及高级查询和常用工具函数
tag: [数据库, Oracle]

---

# Oracle SQL 语法基础

## 基本概念

1. SQL：Structured Query Language

   结构化查询语言，是用于访问和处理数据库的标准的计算机语言，不同数据库间语言存在差异

2. SQL 分为 DML、DCL、DQL、DDL 等
   - DQL，Data Query Language，数据库查询语言，即查询语句
   - DML，Data Manipulation Language，数据库操纵语言，即增加、删除、更新
   - DDL，Data Definition Language，数据库定义语言，即建库、建表等
   - DCL，Data Control Language，数据库控制语言，即角色、权限控制相关等

3. Oracle Database，甲骨文公司提供的通用数据库，是当前最流行的数据库之一

4. 数据文件（dbf）

   数据存储在数据库中，终究是存储在物理磁盘之上，数据文件就是数据库的物理存储单位

5. 表空间（tablespace）

   表空间是数据库对物理存储上相关数据文件的映射

   一个数据库被划分为一到若干个表空间，至少有一个表空间

   每个表空间由磁盘上一个或多个数据文件组成

   一个数据文件只能属于一个表空间

6. 用户（user）和模式（schema）

   用户是用来连接数据库和访问数据库对象的，持有系统的权限及资源

   schema 是数据对象的集合，包含了表、函数、包等等对象

   Oracle 中的 schema 就是指一个用户下所有对象的集合

   一个用户一般对应一个 schema，该用户的 schema 名等于用户名，并作为该用户缺省 schema

## 建库建表

1. 创建用户

   ```sql
   create user 用户名 identified by 密码;
   ```

2. 查看表空间信息

   ```sql
   SELECT
   	*
   FROM
   	Dba_Tablespaces;
   ```

3. 查看表空间配置文件信息

   ```sql
   SELECT
   	*
   FROM
   	Dba_data_files;
   ```

3. 创建表空间

   ```sql
   CREATE TABLESPACE 表空间名 DATAFILE 配置文件存放位置 SIZE 配置文件大小
   ```

5. 指定默认表空间

   ```sql
   # 设置指定用户的默认表空间
   ALTER USER 用户名 DEFAULT TABLESPACE 表空间名;
   
   # 设置数据库的默认临时表空间
   ALTER DATABASE DEFAULT TEMPORARY TABLESPACE temp_tbs_name;
   ```

5. 查看默认表空间

   ```sql
   SELECT
   	default_tablespace
   FROM
   	user_users;
   ```

6. 给用户授权

   ```sql
   GRANT DBA TO 用户名
   ```

8. 创建数据表

   ```sql
   CREATE TABLE USER(
   	ID NUMBER,
       NAME VARCHAR2(32),
       AGE NUMBER,
       BIRTH DATE
   )
   ```
   
   > 几种字符串类型：
   >
   > - CHAR(n) 
   >
   >   长度固定，不足自动补空格，汉字占 2 字节，字母 1 字节，n 为字节数
   >
   > - VARCHAR(n)
   >
   >   可变长度，汉字占 2 字节，字母 1 字节，n 为字节数
   >
   > - VARCHAR2(n)  
   >
   >   非工业标准，保证版本兼容，占用与字符集相关，空串处理为 null，n 为字节数，最大 4000
   >
   > - NVARCHAR(n)
   >
   >   可变长度，Unicode 编码，n 为字符数
   >
   > - NVARCHAR2
   >
   >   汉字和字母统一占用两个字节

9. 设置自增 ID 

   用来获取 ID 的自增序列

   ```sql
   CREATE SEQUENCE SQ_USER_ID
   MINVALUE 1 MAXVALUE 99999999
   INCREMENT BY 1 START WITH 1
   ```

   自动填充 ID 的触发器

   ```sql
   CREATE OR REPLACE TRIGGER USER
       BEFORE INSERT
       ON USER
       FOR EACH ROW
   BEGIN
       SELECT SQ_USER_ID.NEXTVAL INTO :NEW.ID FROM DUAL;
   END;
   ```

## 增删改查

1. insert

   ```sql
   INSERT INTO table_name VALUES(value_1, value_2, value_3);
   INSERT INTO table_name(column_1, column_3) VALUES(value_1, value_3);
   ```

2. delete

   ```sql
   DELETE FROM 
   	table_name 
   WHERE 
   	column_1='xxx';
   ```

3. update

   ```sql
   UPDATE 
   	table_name 
   SET 
   	column_1="xxx", 
   	column_2="xxx" 
   WHERE column_3="xxx"
   ```

4. select

   ```sql
   SELECT
     column_1, 
     column_2
   FROM
     table_name;
   ```

## 高级查询

1. where

   表示查询条件，与 and/or 配合使用

   ```sql
   SELECT 
   	*
   FROM
   	table_name
   WHERE 
   	(column_1='xxx'
   	AND column_2='xxx')
   	OR column_3='xxx';
   ```

2. distinct 

   用于获得唯一性记录，可以限制多个列

   ```sql
   SELECT 
   	DISTINCT column_1
   FROM
   	table_name
   ```

3. order by

   将查询的结果，按照一定的顺序进行排序，ASC 升序（默认），DESC 降序

   如果是字符串，则按字母表顺序排序

   order by 一般用在 SQL 语句的最后

   ```sql
   SELECT 
   	column_1, column_2
   FROM
   	table_name
   ORDER BY
       column_1 DESC
   ```

4. group by 

   对记录集合进行分组

   group by 后的字段表示按这些字段分组，按照这些字段组成一条记录，重复的属于同一组，最后返回这些分组

   ```sql
   SELECT
   	name, age, sex
   WHERE
   	sex='男'
   GROUP BY
   	name, age, sex
   ```

   分组之后 select 语句的真实操作目标为各个分组数据，每次循环处理的也是各个分组，而不是单条记录

5. having

   having 多用于 group by 后对分组的筛选，功能类似 where，但是只能筛选分组后的查询结果中的字段

   例如，查看 person 表的男生中每个名字的同名次数，并且展示次数大于 2 的分组

   ```sql
   SELECT
   	name, COUNT(*) num
   FROM
   	person
   WHERE
   	sex='男'
   GROUP BY
   	name
   having 
   	num > 2
   ```

6. 嵌套查询

   子查询是嵌套在查询语句中的查询语句，是完整的查询语句

   子查询的结果集除了可以作为父查询 from 的数据表，还可以作为 where 子句查询条件

   结果集只有一行，通常使用`=`判断 

   结果集为单行单列，即一个值

   ```sql
   SELECT
   	*
   FROM
   	table_1 t1
   WHERE
   	t1.t1_colum_1 = (
       	SELECT
   			t2_colum_1
   		FROM
   			table_2
       )
   ```

   结果集为单行多列，即一行记录

   ```sql
   SELECT
   	*
   FROM
   	table_1 t1
   WHERE
   	(t1.t1_colum_1, t1.t1_colum_2) = (
       	SELECT
   			t2_colum_1, t2_colum_2
   		FROM
   			table_2
       )
   ```

   结果集有多行，主要使用三种操作符：IN、ANY、ALL

   结果集为多行单列，即多个值

   ```sql
   SELECT
   	*
   FROM
   	table_1 t1
   WHERE
   	t1.t1_colum_1 IN (
       	SELECT
   			t2_colum_1
   		FROM
   			table_2
       )
   ```

   结果集为多行多列，即多行记录

   ```sql
   SELECT
   	*
   FROM
   	table_1 t1
   WHERE
   	(t1.t1_colum_1, t1.t1_colum_2) IN (
       	SELECT
   			t2_colum_1, t2_colum_1
   		FROM
   			table_2
       )
   ```

   > IN 表示在多个值中进行匹配
   >
   > = ANY 等价于 IN
   >
   > < ANY 表示比子查询结果集中的最大的小
   >
   > \> ANY 表示比子查询中结果集中最小的大
   >
   > <> ALL 等价于 NOT IN
   >
   > < ALL 表示比子查询结果集中的最小的小
   >
   > \> ALL 表示比子查询中结果集中最大的大
   >
   > 需要注意：
   >
   > 	<> ANY 表示与结果集中任意一条记录不等就返回真
   > 				
   > 	<> ALL 表示与每一条记录都不等才返回真

   此外，EXSITS 构用于判断子查询是否有数据返回，如果有则返回 true

   ```sql
   SELECT
   	*
   FROM 
   	table_1
   WHERE
   	EXSITS (
           SELECT
               column_1, 
               column_2
           FROM
           	table_name
   	)
   ```

7. 联合查询

   UNION：将两个结果集进行并集操作，并剔除重复记录

   UNION ALL：并集操作但不剔除重复记录，比 UNION 要快

   ```sql
   SELECT column_1 FROM table_name1
   UNION ALL
   SELECT column_1 FROM table_name2
   ```

   UNION 需要两个结果集拥有同样的列数，不要求列名相同

   UNION 结果集中的列名总是等于 UNION 中第一个 SELECT 语句中的列名

   同样的，INTERSECT 用于交集操作，MINUS 用于差集操作

8. 连接查询

   左连接：LEFT JOIN，返回左表所有行，取右表数据进行匹配，匹配不到的为空

   右连接：RIGHT JOIN，返回右表所有行，取左表数据进行匹配，匹配不到的为空

   内连接：INNER JOIN，返回两个表中匹配的行

   ```sql
   SELECT 
   	t1.cloumn_1,
   	t2.cloumn_1,
   	t2.cloumn_2
   FROM 
   	table_1 t1
   LEFT JOIN 
   	table_2 t2
   ON 
   	table_name1.cloumn_1 = table_name2.cloumn_1
   ```

   自身连接：

   ```sql
   SELECT 
   	t1.id,
   	t2.id
   FROM 
   	table1 t1, table_1 t2
   WHERE 
   	t1.id = t2.parentId
   ```

## 工具函数

1. 聚合函数

   AVG：求平均值

   SUM：求和

   COUNT：统计数量

   MIN、MAX：求最大、最小记录

   > 聚合函数对一组数据进行操作，返回一行结果
   >
   > 当需要返回其他字段时，需要按该字段分组

   ```sql
   SELECT
   	SUM(cloumn_1)
   FROM
   	table_1;
   	
   SELECT
   	cloumn_1, SUM(cloumn_2)
   FROM
   	table_1
   GROUP BY
   	cloumn_1;
   ```

2. 字符串

   LENGTH(str)：返回字符串长度

   SUBSTR(str, start[, length])：从 start 处开始，截取 length 个字符，缺省 length 默认到结尾

   ```sql
   SELECT
   	*
   FROM
   	table_1
   WHERE
   	SUBSTR(id, 2) = 'xxx' 
   ```

   > SUBSTR 的第二个参数从 1 开始，表示第一个字符。若是 -1 则表示倒数第一个，以此类推

   INSTR：查询字符串在另一字符串中的位置

   ```sql
   SELECT 
   	INSTR('hello', 'l', 1, 2)
   FROM 
   	DUAL;
   ```

   > INSTR(orign, target[, start, nth])：查询在 origin 中 target 的位置，从 start 开始，查找第 nth 个 target
   >
   > 若 start 为负数，则从后往前查找，但返回值还是从前往后数，返回 0 表示没有查到



4. 格式化

   TO_DATE(str[, fmt])：将字符串以 fmt 格式转为日期类型

   TO_CHAR(d[, fmt])：将日期或数字转为 fmt 格式的字符串

   ```sql
   SELECT 
   	TO_CHAR(TO_DATE('20210314', 'yyyymmdd'))
   FROM 
   	DUAL;
   ```

   > TO_CHAR 的 fmt 参数：
   >
   > - iw：获取是第几周
   > - yyyy：获取年
   > - mm：获取月
   > - dd：获取日
   > - day：获取是周几
   > - hh24：获取 24 制小时
   > - mi：获取分种
   > - ss：获取秒

5. 日期

      SYSDATE：获取当前时间

      ADD_MONTHS(d,n)：d 指定日期，n 表示要加的月数量，可为负数

      LAST_DAY(d)：获取指定时间当月的最后一天

      NEXT_DAY(d, '星期一')：获取下一周的周一

      TRUNC(d[, fmt])：截取时间，常用来获取时间范围的第一天

      > TRUNC(SYSDATE, 'yy') 本年第一天
      >
      > TRUNC(SYSDATE, 'q') 本季度第一天
      >
      > TRUNC(SYSDATE, 'mm') 本月第一天
      >
      > TRUNC(SYSDATE, 'd') 本周第一天，周日开始

      举例：

      - 获取最近 7 天（包括当天）

        ```sql
        SELECT 
        	TO_CHAR(SYSDATE - 6, 'yyyy-mm-dd hh24:mi:ss') 
        FROM 
        	dual;
        ```

      - 获取最近 4 周（包括当前周）

        ```sql
        SELECT 
        	TO_CHAR(TRUNC(SYSDATE - 21, 'd') + 1, 'yyyy-mm-dd hh24:mi:ss') 
        FROM 
        	dual;
        ```

      - 获取最近 3 个月（包括当前月）

        ```sql
        SELECT 
        	TO_CHAR(TRUNC(ADD_MONTHS(SYSDATE, -2), 'mm'), 'yyyy-mm-dd hh24:mi:ss') 
        FROM 
        	dual;
        ```

   - 获取当前季度第一天

     ```sql
     SELECT 
     	TO_CHAR(TRUNC(SYSDATE, 'q'), 'yyyy-mm-dd hh24:mi:ss') 
     FROM 
     	dual;
     ```

   - 获取上个季度第一天

     ```java
     SELECT 
     	TO_CHAR(ADD_MONTHS(TRUNC(SYSDATE, 'q'), -3), 'yyyy-mm-dd hh24:mi:ss') 
     FROM 
     	dual;
     ```

6. 数字

   ABS：求绝对值

   CEIL：向上取整

   FLOOR：向下取整

   ROUND(x, y)：x 在第 y 位四舍五入

7. 判断

   NVL(x, v)：x 为空，返回 v，否则返回 x

   NVL2(x, v1, v2)：x 为空，返回 v2，否则返回 v1

   DECODE(x, v1, r1, v2, r2, ...vn, rn, default)：类似于 if-else，x 等于 v1 则返回 r1，以此类推，直到缺省值

   示例，查询学生，要求年龄在 20 以上的显示 20 以上，20 以下的显示 20 以下，20 的显示正好 20：

   ```sql
   select t.id,
          t.name,
          t.age,
          DECODE(SIGN(t.age - 20),
                 1,
                 '20 以上',
                 -1,
                 '20 以下',
                 0,
                 '正好 20',
                 '未知') sex
     from student t
   ```

   CASE WHEN：类似于 switch-case，比 DECODE 复杂且灵活，在其他数据库中也有该函数

   上面示例用 case when 实现：

   ```sql
   select t.id,
          t.name,
          t.age,
          (CASE 
          		WHEN t.age = 20 THEN '正好 20'
          		WHEN t.age < 20 THEN '20 以下'
          	ELSE '20 以上'
          END) sex
     from student t
   ```

   
