---

title: MyBatis 基础
date: 2020/7/3
description: 本文介绍持久层框架 MyBatis 的配置和使用，如配置文件、XML 映射器、生命周期、日志、分页、注解及动态 SQL 等 
tag: [Java 框架, MyBatis, Java]

---

# MyBatis 基础

## 简介

1. 来源

   MyBatis 本是 apache 的一个开源项目 iBatis

   2010 年 由 apache software foundation 迁移到了 google code，并且改名为 MyBatis

   2013 年 11 月迁移到 Github

2. 作用

   MyBatis 是一款优秀的持久层框架

   它支持自定义 SQL、存储过程以及高级映射

   MyBatis 免除了几乎所有的 JDBC 代码以及设置参数和获取结果集的工作

3. 地址

   中文简介：https://mybatis.org/mybatis-3/zh/index.html

    GitHub：https://github.com/mybatis

    Maven：

   ```xml
   <!-- https://mvnrepository.com/artifact/org.mybatis/mybatis -->
   <dependency>
       <groupId>org.mybatis</groupId>
       <artifactId>mybatis</artifactId>
       <version>3.5.5</version>
   </dependency>
   ```

## 持久层

1. 数据持久化是指数据由瞬时状态转化成持久状态的过程
   - 瞬时状态：内存中存储的内容，断电后就会丢失
   - 持久状态：数据库（JDBC）、文件（IO）

2. 持久层是完成持久化工作的代码

## 传统 JDBC

1. 建立测试数据库

   ```sql
   CREATE DATABASE `mybatis`;
   CREATE TABLE `user` (
     `id` int NOT NULL,
     `name` varchar(30) DEFAULT NULL,
     `pwd` varchar(30) DEFAULT NULL,
     PRIMARY KEY (`id`)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
   ```

2. 一般步骤

   ```java
   import java.sql.Connection;
   import java.sql.DriverManager;
   import java.sql.PreparedStatement;
   import java.sql.ResultSet;
   import java.sql.Statement;
   import java.util.Scanner;
   
   public class JDBCDemo {
   	public static void main(String[] args) throws Exception {
   		// 注册驱动
   		Class.forName("com.mysql.jdbc.Driver");
   		// 获取连接对象
   		String url = "jdbc:mysql://localhost:3306/mybaitis";
   		Connection conn = DriverManager.getConnection(url, "root", "root");
   		// SQL 语句
   		String sql = "select * from users where username = ? and password = ? ";
   		// 获取执行语句对象
   		PreparedStatement pst = conn.prepareStatement(sql);
   		// 设置问号占位符参数
   		pst.setObject(1, "小 a");
   		pst.setObject(2, "123456");
   		// 调用执行者对象方法,执行SQL语句获取结果集
   		ResultSet rs = pst.executeQuery();
   		// 处理结果集
   		while (rs.next()) {
   			System.out.println(rs.getString("username") + " : " + rs.getString("password"));
     		}
   		// 关闭资源
   		rs.close();
   		pst.close();
   		conn.close();
   	}
   }
   ```

## 使用 MyBatis

1. 导入 jar 包

   maven 构建的项目在 pom.xml 中添加

   ```xml
   <dependency>
       <groupId>org.mybatis</groupId>
       <artifactId>mybatis</artifactId>
       <version>3.4.5</version>
   </dependency>
   ```

2. 配置文件 mybatis-config-xml

   ```xml
   <?xml version="1.0" encoding="UTF-8" ?>
   <!DOCTYPE configuration
           PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
           "http://mybatis.org/dtd/mybatis-3-config.dtd">
   <configuration>
       <environments default="development">
           <environment id="development">
               <transactionManager type="JDBC"/>
               <dataSource type="POOLED">
                   <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
                   <property name="url" value="jdbc:mysql://localhost:3306/mybatis?useSSL=true&amp;useUnicode=true&amp;characterEncoding=UTF-8"/>
                   <property name="username" value="root"/>
                   <property name="password" value="12345"/>
               </dataSource>
           </environment>
       </environments>
   </configuration>
   ```

3. 编写工具类

   1. 每个基于 MyBatis 的应用都是以一个 SqlSessionFactory 的实例为核心的

   2. SqlSessionFactoryBuilder 通过 XML 配置文件可以构建出 SqlSessionFactory 实例

   3. SqlSession 包含向数据库执行 sql 的所有方法，通过 SqlSessionFactory 获取

   4. utils 包新增工具类

      ```java
      package utils;
      
      import org.apache.ibatis.io.Resources;
      import org.apache.ibatis.session.SqlSession;
      import org.apache.ibatis.session.SqlSessionFactory;
      import org.apache.ibatis.session.SqlSessionFactoryBuilder;
      
      import java.io.IOException;
      import java.io.InputStream;
      
      public class MyBatisUtil {
          private static SqlSessionFactory sqlSessionFactory;
          
          static {
              // 读取配置文件，获取 SqlSessionFactory 实例
              try {
                  String resource = "mybatis-config.xml";
                  InputStream inputStream = Resources.getResourceAsStream(resource);
                  sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
              } catch (IOException e) {
                  e.printStackTrace();
              }
          }
          
          /**
           * 获取 sqlSession 实例
           *
           * @return SqlSession 实例
           */
          public static SqlSession getSqlSession() {
              return sqlSessionFactory.openSession();
          }
      }
      ```

4. 编写代码并测试

   1. pojo 包中增加 User 类

      ```java
      package pojo;
      
      public class User {
          int id;
          String name;
          String pwd;
          
          // setter/getter 省略...
      }
      ```

   2. dao 包中增加 UserDao 接口

      ```java
      package dao;
      
      import pojo.User;
      
      import java.util.List;
      
      public interface UserDao {
          List<User> listUsers();
      }
      ```

   3. dao 包中增加 UserMapper.xml

      指定命名空间，select 查询的 id 对应 UserDao 方法名

      ```xml
      <?xml version="1.0" encoding="UTF-8" ?>
      <!DOCTYPE mapper
              PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
              "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
      <mapper namespace="dao.UserDao">
          <select id="listUsers" resultType="pojo.User">
              select * from user
          </select>
      </mapper>
      ```

   4. mybatis 配置文件中在 configuration 标签下添加 mapper 位置信息

      ```xml
      <mappers>
          <mapper resource="dao/UserMapper.xml"></mapper>
      </mappers>
      ```

   5. maven pom 文件中要配置开启包下的 xml 文件资源过滤

      ```xml
      <build>
          <resources>
              <resource>
                  <directory>src/main/java</directory>
                  <includes>
                      <include>**/*.xml</include>
                      <include>**/*.properties</include>
                  </includes>
                  <filtering>true</filtering>
              </resource>
              <resource>
                  <directory>src/main/resources</directory>
                  <includes>
                      <include>**/*.xml</include>
                      <include>**/*.properties</include>
                  </includes>
                  <filtering>true</filtering>
              </resource>
          </resources>
      </build>
      ```

   6. junit 测试

      ```java
      public class UserDaoTest {
          
          @Test
          public void test() {
              // 工具类获取 SqlSession
              SqlSession sqlSession = MyBatisUtil.getSqlSession();
              // sqlSession 获取 userDao 实现实例
              UserDao userDao = sqlSession.getMapper(UserDao.class);
              // 执行 SQL 方法
              List<User> users = userDao.listUsers();
              System.out.println(users);
          }
      }
      ```

## 配置文件

1. 环境配置

   MyBatis 可以配置成适应多种环境，但每个 SqlSessionFactory 实例只能选择一种环境

   配置多个 environment，使用 default 属性进行指定

   ```xml
   <environments default="development">
     <environment id="development">
       <transactionManager type="JDBC">
         <property name="..." value="..."/>
       </transactionManager>
       <dataSource type="POOLED">
         <property name="driver" value="${driver}"/>
         <property name="url" value="${url}"/>
         <property name="username" value="${username}"/>
         <property name="password" value="${password}"/>
       </dataSource>
     </environment>
   </environments>
   ```

2. properties

   属性可以在外部进行配置，并可以进行动态替换，可以在典型的 Java 属性文件中配置这些属性，也可以在 properties 元素的子元素中设置

   db.properties

   ```properties
   driver=com.mysql.cj.jdbc.Driver
   url=jdbc:mysql://localhost:3306/mybatis?useSSL=true&useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai
   username=root
   password=12345
   ```

   在 mybatis-config 中添加

   ```xml
   <properties resource="db.properties">
       <property name="username" value="root"/>
       <property name="password" value="12345" />
   </properties>
   ```

   resource 指定的配置文件中的内容优先级高于标签内的配置

3. 类型别名

   配置 typeAliases

   ```xml
   <typeAliases>
       <typeAlias type="pojo.User" alias="User"></typeAlias>
       <package name="pojo"></package>
   </typeAliases>
   ```

   pojo 上注解

   ```java
   @Alias("User")
   public class User {
   }
   ```

   类型别名可为 Java 类型设置一个缩写名字。 它仅用于 XML 配置，意在降低冗余的全限定类名书写

   包别名配置会在包名下面搜索需要的 Java Bean，在没有注解时，会使用 Bean 的首字母小写的非限定类名来作为它的别名

   若有注解，则别名为其注解值

4. settings

   ```xml
   <settings>
     <setting name="cacheEnabled" value="true"/>
     <setting name="lazyLoadingEnabled" value="true"/>
     <setting name="logImpl" value="LOG4J"/>
   <settings>
   ```

   cacheEnabled：全局性地开启或关闭所有映射器配置文件中已配置的任何缓存

   lazyLoadingEnabled：延迟加载的全局开关。当开启时，所有关联对象都会延迟加载

   logImpl：指定 MyBatis 所用日志的具体实现，未指定时将自动查找

7. 映射器

   指定资源路径

   ```xml
   <mappers>
       <mapper resource="dao/UserMapper.xml"></mapper>
   </mappers>
   ```

   指定类名，需要 mapper.xml 和 mapper 接口同名且在同一个包下

   ```xml
   <mappers>
       <mapper class="dao.UserMapper"></mapper>
   </mappers>
   ```

   指定包名，需要 mapper.xml 和 mapper 接口同名且在同一个包下

   ```xml
   <mappers>
       <package name="dao"></package>
   </mappers>
   ```


## XML 映射器

1. 查询

   dao 包中 mapper 接口

   ```java
   public interface UserDao {
       User getUserById(int id);
   }
   ```

   UserMapper.xml 

   ```xml
   <mapper namespace="dao.UserDao">
       <select id="getUserById" parameterType="int" resultType="hashmap">
         SELECT * FROM PERSON WHERE ID = #{id}
       </select>
   </mapper>
   ```

2. 增删改

   dao  包中 mapper 接口

   ```java
   public interface UserDao {    
       int addUser(User user);
       
       int updateUser(User user);
       
       int deleteUserById(int id);
   }
   ```

   UserMapper.xml 

   ```xml
   <insert id="addUser" parameterType="pojo.User">
       insert into user values (#{id}, #{name}, #{pwd})
   </insert>
   <update id="updateUser" parameterType="pojo.User">
       update user set name = #{name}, pwd = #{pwd} where id = #{id}
   </update>
   <delete id="deleteUserById" parameterType="int">
       delete from user where id = #{id}
   </delete>
   ```

   增删改执行方法后，需要提交事务

   ```java
   sqlSession.commit();
   // 可以使用 sqlSessionFactory.openSession(true) 开启自动提交
   ```

3. 常用属性

   - id：在命名空间中唯一的标识符，可以被用来引用这条语句，与 namespace 接口方法名一致
   - parameterType：将会传入这条语句的参数的类全限定名或别名
     - 传入普通对象，使用 #{属性名} 获取属性
     - 传入 map，使用 #{key} 获取 value
     - 传入一个基本类型，直接使用 #{参数名} 获取
   - resultType：期望从这条语句中返回结果的类全限定名或别名，如果返回的是集合，那应该设置为集合包含的类型，而不是集合本身的类型
4. resultMap 结果集映射

   1. 简单映射

      当查询出的结果集无法与 Bean 字段映射时，需要指定 resultMap

      例如，数据库中字段为 password，Bean 中为 pwd，能成功映射的字段不必要配置

       ```xml
       <resultMap type="pojo.User" id="UserMap">
           <result column="id" property="id"></result>
           <result column="name" property="name"></result>
           <result column="password" property="pwd"></result>
       </resultMap>

       <select id="listUsers" resultMap="UserMap">
           select * from user
       </select>
       ```

   2. 复杂映射

      例如学生和老师的多对一关系

      ```java
      public class Student {
          int id;
          String name;
          Teacher teacher;
          // ...
      }
      public class Teacher {
          int id;
          String name;
          // ...
      }
      ```

      StudentMapper.xml 中配置 resultMap，association 标签 select 属性指向一个查询，column 作为查询参数，javaType

      ```xml
      <resultMap id="StudentMap" type="pojo.Student">
          <result column="id" property="id"></result>
          <result column="name" property="name"></result>
          <association property="teacher"
                       column="tid"
                       javaType="pojo.Teacher"
                       select="getTeacher"
                       ></association>
      </resultMap>
      
      <select id="listStudents" resultMap="StudentMap">
          SELECT * FROM student
      </select>
      <select id="getTeacher" parameterType="int" resultType="pojo.Teacher">
          SELECT * FROM student where id = #{id}
      </select>
      ```

      也可以用一个查询完成，需要在 SQL 中对结果集定义别名

      ```xml
      <resultMap id="StudentMap" type="pojo.Student">
          <result column="sid" property="id"></result>
          <result column="sname" property="name"></result>
          <association property="teacher"
                       column="tid"
                       javaType="pojo.Teacher">
              <result column="tid" property="id"></result>
              <result column="tname" property="name"></result>
          </association>
      </resultMap>
      
      <select id="listStudents" resultMap="StudentMap">
          SELECT s.id sid, s.name sname, t.id tid, t.name tname FROM student s, teacher t where s.tid = t.id
      </select>
      ```

      同样的，老师和学生的一对多关系，可如下解决
      
      ```javascript
      // pojo
      public class Teacher {
          int id;
          String name;
          List<Student> students;
      }
      public class Student {
          int id;
          String name;
          int tid;
      }
      ```
      
      ```xml
      <!-- TeacherMapper.xml -->
      <resultMap id="TeacherMap" type="pojo.Teacher">
              <result column="tid" property="id"></result>
              <result column="tname" property="name"></result>
              <collection property="students" ofType="pojo.Student">
                  <result column="sid" property="id"></result>
                  <result column="stid" property="tid"></result>
                  <result column="sname" property="name"></result>
              </collection>
      </resultMap>
      <select id="getTeacher" resultMap="TeacherMap">
          select t.id tid, t.name tname, s.id sid, s.name sname, s.tid stid
          from teacher t,
          student s
          where t.id = s.tid
          and t.id = #{id}
      </select>
      ```
      
      association 用来处理多对一，collection 用来处理一对多，javaType 表示属性的类型，ofType 表示集合中的元素类型


## 生命周期

1. 生命周期和作用域使用有误可能会导致严重的并发问题

2. 基本流程

   ```
   SqlSessionFactoryBuilder -> SqlSessionFactory -> SqlSession -> getMapper()
   ```

3. SqlSessionFactoryBuilder
   - 通过配置文件创建 SqlSessionFactory，创建完毕后，就不在需要它了
   - 最佳的作用域是方法作用域（也就是局部变量）
4. SqlSessionFactory
   - 类似于连接池
   - 一旦创建就在运行期间一直存在
   - 最佳作用域为应用作用域
   - 最简单的就是使用单例模式或者静态单例模式
5. SqlSession
   - 表示连接到数据库的一个请求，使用完毕后需要调用 close() 释放资源
   - SqlSession 的实例不是线程安全的，所以它的最佳的作用域是请求或方法作用域

## 日志

1. 日志工厂

   Mybatis 通过使用内置的日志工厂提供日志功能。内置日志工厂将会把日志工作委托给下面的实现之一：

   ```
   SLF4J | Apache Commons Logging | Log4j 2 | Log4j  | JDK logging
   ```

   在配置文件的 setting 标签中可以设置具体使用哪一种日志实现

   ```xml
   <settings>
       <setting name="logImpl" value="STDOUT_LOGGING"></setting>
   </settings>
   ```

   STDOUT_LOGGING 是标准日志实现，可以直接使用

   若使用 LOG4J 需要导入相关包并指定 logImpl 为 LOG4J

2. LOG4J

   LOG4J 是 Apache 的开源项目，用于实现输入日志到控制台、GUI 组件或文件，可用外部文件灵活配置

   pom.xml

   ```xml
   <dependency>
       <groupId>log4j</groupId>
       <artifactId>log4j</artifactId>
       <version>1.2.12</version>
   </dependency>
   ```

   log4j.properties

   ```properties
   #将等级为 DEBUG 的信息输出到控制台和文件
   log4j.rootLogger=DEBUG,console,file
   #控制台输出设置
   log4j.appender.console=org.apache.log4j.ConsoleAppender
   log4j.appender.console.Target=System.out
   log4j.appender.console.Threshold=DEBUG
   log4j.appender.console.layout=org.apache.log4j.PatternLayout
   log4j.appender.console.layout.ConversionPattern=%5p [%d{yyyy-MM-dd HH:mm:ss}][%t][%F:%L] - %m%n
   #文件输出设置
   log4j.appender.file=org.apache.log4j.RollingFileAppender
   log4j.appender.file.File=./log/log4j.log
   log4j.appender.file.MaxFileSize=10mb
   log4j.appender.file.Threshold=DEBUG
   log4j.appender.file.layout=org.apache.log4j.PatternLayout
   log4j.appender.file.layout.ConversionPattern=%5p [%d{yyyy-MM-dd HH:mm:ss}][%t][%c] - %m%n
   #输出级别设置
   log4j.logger.org.mybatis=DEBUG
   log4j.logger.java.sql=DEBUG
   log4j.logger.java.sql.Statement=DEBUG
   log4j.logger.java.sql.ResultSet=DEBUG
   log4j.logger.java.sql.PreparedStatement=DEBUG
   ```

   配置完 pm.xml、mybatis-config.xml、log4j.properties 运行代码，可见 LOG4J 打印信息在控制台

   也可以在类中主动使用 Logger 类自定义打印内容

   ```java
   public class LoggerTest {
       // 获取 logger 实例
       static Logger logger = Logger.getLogger(LoggerTest.class);
       
       @Test
       public void log4jTest() {
           // 测试不同的日志级别
           logger.info("info => info 内容");
           logger.debug("debug => debug 内容");
           logger.warn("warn => warn 内容");
           logger.error("error => error 内容");
       }
   }
   ```

## 分页

1. 当数据量过大时，需要分页以减少数据处理量，并可以多页显示，提升用户体验

2. mysql limit 关键字分页

   ```sql
   SELECT * FROM user limit startIndex, pageSize
   SELECT * FROM user limit pageSize
   // 相当于
   SELECT * FROM user limit 0, pageSize
   ```

   mapper.xml

    ```java
   <select id="listUsersLimit" parameterType="map" resultType="pojo.User">
       select * from user limit #{startIndex},#{pageSize}
   </select>
    ```

    dao 或 mapper 接口

    ```java
   public interface UserDao {    
        List<User> listUsersLimit(Map map);
   }
    ```


3. RowBounds 分页

   mapper.xml 中的 SQL 查询中不做数据量的限制，通过 sqlSession 的查询方法和 RowBounds 对象进行数量的限制

    ```java
   List<User> users = sqlSession.selectList("dao.UserDao.listUsersByRowBounds",null, new RowBounds(1,2));
    ```


## 注解

1. CURD 注解

   不需要在 mapper.xml 中指定 SQL，直接在注解中传入 SQL 语句即可，适合简单的查询

   可以使用 @Select/@Update/@Delete/@Insert

   ```java
   public interface UserDao {
       @Select("select * from user")
       List<User> listUserByAnnotation();
   }
   ```

2. 参数注解

   多个基本类型或 String 类型参数需要通过 @Param 指定名称，以便在 SQL 语句中使用
   
   不指定也可以在 SQL 中使用 arg0，arg1 或 param1，param2 等按顺序来获取参数
   
   ```java
   public interface UserDao {
       @Select("select * from user where name = #{name} and pwd = #{pwd}")
       User getUserByNameAndPwd(@Param("name") String name, @Param("pwd") String pwd);
   }
   ```

## 动态 SQL

1. if

   方法传入 id 为 0 时不开启 if 内 and 条件，则查询全部。传入 id 不为 0 时，则查询指定 id

   ```xml
   <select id="listStudentsById" parameterType="int" resultType="pojo.Student">
       SELECT *
       FROM student
       WHERE
       <if test="id != 0">
           id = #{id}
       </if>
   </select>
   ```

2. choose，when，otherwise

   类似于 switch 条件控制

   ```java
   <select id="listStudentsById" parameterType="int" resultType="pojo.Student">
       SELECT *
       FROM student
       <where>
       	<choose>
       		<when test="id == 1">
       			id = 2
       		</when>
       		<when test="id == 2">
       			and id = 1
       		</when>
      	 		<otherwise>
       			and id = 3
       		</otherwise>
       	</choose>
       </where>
   </select>
   ```

3. where，trim，set

   在上面 if 的例子中，如果 if 条件不满足，不会拼接 if 中的内容，只有一个 where 会导致 SQL 错误

   可以通过 where 标签更优雅的解决，

   ```xml
   <select id="listStudentsById" parameterType="int" resultType="pojo.Student">
       SELECT *
       FROM student
       <where>
      		<if test="id != 0">
          		id = #{id}
       	</if>
           ...
       </whrer>
   </select>
   ```

   where 标签当内部有内容返回时才会返回 where 条件语句，并且自动去除子句开头的 and/or

   trim 和 where 功能类似，可以指定拼接子句时要替换的关键字，prefix 表示最后返回的子句，prefixOverrides/suffixOverrides 表示需要被删除或添加的前缀或后缀

   ```xml
    <trim prefix="where" prefixOverrides="and |or ">
        <choose>
            <when test="id == 1">
                and id = 2
            </when>
            <when test="id == 2">
                and id = 1
            </when>
            <otherwise>
                and id = 3
            </otherwise>
        </choose>
   </trim>
   ```

   set 用于实现动态的更新语句

   ```xml
   <update id="updateStudent" parameterType="map">
       update student
       <set>
           <if test="id != null">id = #{id},</if>
           <if test="name != null">name = #{name},</if>
           <if test="tid != null">tid = #{tid}</if>
       </set>
   </update>
   ```

   trim 实现 set 功能

   ```xml
   <trim prefix="SET" suffixOverrides=",">
     ...
   </trim>
   ```

4. foreach

   ```sql
   select * from student where id in (1, 2, 3)
   ```

   类似于上面的 SQL，当 in 子句的范围不确定时，可以使用 foreach

   ```xml
   <select id="listStudents" parameterType="list" resultType="pojo.Student">
       SELECT *
       FROM student
       <where>
           <foreach item="item" index="index" collection="list"
                    open="id in (" separator="," close=")">
               #{item}
           </foreach>
       </where>
   </select>
   ```

   如果 list 元素个数为 0，则不会返回任何字符串

5. sql 片段

   sql 标签定义的片段可以通过 include 引入，提高复用性

   ```xml
   <sql id="sql-if-id">
   	<if test="id != 0">
           id = #{id}
       </if>
   </sql>
   ```

   在其他标签中使用

   ```xml
   <select id="listStudentsById" parameterType="int" resultType="pojo.Student">
       SELECT *
       FROM student
       <where>
   		<include refid="sql-if-id"></include>
       </whrer>
   </select>
   ```

## 缓存

1. 缓存是内存中的临时数据，可以提升查询效率、减少数据库压力，适合经常查询但不经常改变的数据

2. MyBatis 默认开启一级缓存，是 SqlSession 级别的缓存

   从打开一个 SqlSession 实例开始，重复执行两次查询方法，只会执行一次 SQL，返回的数据指向同一对象

   如何两次查询之间执行了增删改操作或 sqlSession 调用了 clearCache 方法，则第二次会重新查询

3. MyBatis 二级缓存可以手动开启，是 namespace 级别的缓存

   先要在 myatis-config.xml 中配置开启缓存
   
   ```xml
   <settings>
   	<setting name="cacheEnabled" value="true"></setting>
   </settings>
   ```
   
   在要使用二级缓存的 mapper.xml 通过 cache 标签中开启
   
   ```xml
   <cache />
   <!--一些属性-->
   <cache eviction="FIFO" flushInterval="60000" size="512" readOnly="true"/>
   ```
   
   开启了二级缓存后，在同一个 mapper 中有效
   
   一个 SqlSession 实例关闭后，其中的一级缓存会转存到二级缓存中，可供另一个 Sqlsession 实例使用
   
   

