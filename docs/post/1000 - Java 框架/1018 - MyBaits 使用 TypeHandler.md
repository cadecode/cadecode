---

title: MyBaits 使用 TypeHandler
date: 2023/5/11
description: 本文介绍 MyBatis 在 SpringBoot 中的使用，如布尔类型和数字转换，普通对象与JSON串转换，枚举类型转换，以及 MyBatis Plus 中对 TypeHandler 的支持
tag: [Java 框架, MyBatis, Java]

---

# MyBaits 使用 TypeHandler

## TypeHandler 介绍

> MyBatis 在设置预处理语句（PreparedStatement）中的参数或从结果集中取出一个值时， 都会用类型处理器将获取到的值以合适的方式转换成 Java 类型——[mybatis.org](https://mybatis.org/mybatis-3/zh/configuration.html#typeHandlers)

1. TypeHandler，类型处理器，即在实体类与数据库字段不能相适应时进行转换处理的工具类

   如：数据库中使用01数值来表示布尔值，实体类中直接使用 Boolean 类型，在 MySQL 数据库中原生支持 true/false 关键字和数值的转换，可能不会报错，但在其他不支持 true/false 关键字的数据库中，则会抛出 SQL 错误

2. 定制 MyBatis TypeHandler

   MyBatis 默认已有的类型处理器

   ![image-20230511155342664](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2023/05/11/20230511155410183.png)

   对于已有类型处理器不能满足需求时，MyBatis 提供了 TypeHandler 接口以及 BaseTypeHandler 抽象类以供实现来处理不支持的或非标准的类型，如：

   ```java
   @MappedJdbcTypes({JdbcType.VARCHAR})
   public class MyStringTypeHandler extends BaseTypeHandler<String> {
   
       /**
        * 设置参数时转换实体属性
        */
       @Override
       public void setNonNullParameter(PreparedStatement ps, int i, String parameter, JdbcType jdbcType) throws SQLException {
           // ...
       }
   
       /**
        * 映射结果集到实体属性
        */
       @Override
       public String getNullableResult(ResultSet rs, String columnName) throws SQLException {
           // ...
       }
   
      // ...
   }
   ```

   MyBatis 会根据 TypeHandler 的 jdbcType 和 javaType 来匹配使用，上述的 TypeHandler 将会覆盖已有的处理 Java String 类型的属性以及 VARCHAR 类型的参数和结果的 TypeHandler

   > 注意：MyBatis 不会通过检测数据库元信息来决定使用哪种类型，在定义 TypeHandler 和使用 TypeHandler 时最好指定 jdbcType 和 javaType 来帮助 MyBatis 准确定位要使用的处理器

3. 注册 TypeHandler 到 Mybatis

   在使用 mybatis-config.xml 配置的项目中，可如下配置

   ```xml
   <typeHandlers>
   	<!-- 配置 TypeHandler，可指定 javaTpe 和 jdbcType -->
   	<typeHandler javaType="String" jdbcType="VARCHAR"
                    handler="com.example.handler.MyBooleanTypeHandler"/>
       <!-- 自动扫描整个包下的 TypeHandler 实现 -->
     	<package name="com.example.handler"/>
   </typeHandlers>
   ```

   在 SpringBoot 中，可直接通过 yml 配置

   ```yaml
   mybatis:
   	# 加入 alias package，方便在 mapper xml 中使用 TypeHandler
   	type-aliases-package: com.example.handler
   	type-handlers-package: com.example.handler
   ```

   mybatis-config.xml 中 typeHandler 标签可以指定 javaType 和 jdbcType，而 package 标签的自动扫描和 SpringBoot 下的自动配置则需要使用 @MappedTypes 和 @MappedJdbcTypes 注解来指定，注意没有指定 javaType 时 MyBatis 会使用 TypeHandler 的泛型作为 javaType

4. 使用 TypeHandler

   > 虽然指定 javaType 和 jdbcType 可以让 MyBatis 自动匹配合适的 TypeHandler，但一般情况下直接指定 typeHandler 可能会更加简便直接

   对参数类型进行处理

   ```xml
   <insert id="insert">
     insert into users (id, name, enableFlag) values (
       #{id}, #{name}, #{enableFlag, typeHandler=MyBooleanTypeHandler}
     )
   </insert>
   ```

   对结果集中类型进行处理

   ```xml
   <resultMap type="com.example.bean.User" id="usermap">
   	<result column="id" property="id"/>
   	<result column="name" property="name"/>
   	<result column="enableFlag" property="enableFlag" typeHandler="MyBooleanTypeHandler"/>
   </resultMap>
   ```

## TypeHandler 常用示例

### 布尔类型和数值转换

1. 使用场景

   一般在数据库中存储布尔类型会使用数值01来表示，若实体类中想要使用 Boolean 来定义字段，则需要借助布尔类型和数值的类型处理器

2. BoolToIntTypeHandler 类型处理器示例

   ```java
   @MappedTypes({Boolean.class})
   @MappedJdbcTypes({JdbcType.INTEGER})
   public class BoolToIntTypeHandler extends BaseTypeHandler<Boolean> {
   
       @Override
       public void setNonNullParameter(PreparedStatement ps, int i, Boolean parameter, JdbcType jdbcType) throws SQLException {
           if (parameter) {
               ps.setInt(i, 1);
               return;
           }
           ps.setInt(i, 0);
       }
   
       @Override
       public Boolean getNullableResult(ResultSet rs, String columnName) throws SQLException {
           int i = rs.getInt(columnName);
           return i != 0;
       }
   
       @Override
       public Boolean getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
           int i = rs.getInt(columnIndex);
           return i != 0;
       }
   
       @Override
       public Boolean getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
           int i = cs.getInt(columnIndex);
           return i != 0;
       }
   }
   ```

### 普通对象与 JSON 串转换

1. 使用场景

   实体类中的属性是复杂类型，在数据库中使用 JOSN 格式字符串来存储或者在查询 SQL 中使用了 JSON 聚合函数来生成 JSON 串

2. ObjToStrTypeHandler 类型处理器示例

   ```java
   @MappedTypes({Object.class, List.class})
   @MappedJdbcTypes(JdbcType.VARCHAR)
   public class ObjToStrTypeHandler extends BaseTypeHandler<Object> {
   
       private final Class<?> type;
   
       public ObjToStrTypeHandler(Class<?> type) {
           this.type = type;
       }
   
       @Override
       public void setNonNullParameter(PreparedStatement ps, int i, Object parameter, JdbcType jdbcType) throws SQLException {
           ps.setString(i, JacksonUtil.toJson(parameter));
       }
   
       @Override
       public Object getNullableResult(ResultSet rs, String columnName) throws SQLException {
           final String json = rs.getString(columnName);
           return JacksonUtil.toBean(json, type);
       }
   
       @Override
       public Object getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
           final String json = rs.getString(columnIndex);
           return JacksonUtil.toBean(json, type);
       }
   
       @Override
       public Object getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
           final String json = cs.getString(columnIndex);
           return JacksonUtil.toBean(json, type);
       }
   }
   ```

### 枚举类型转换

1. MyBatis 提供了两种枚举类型处理器，EnumTypeHandler 和 EnumOrdinalTypeHandler

   和一般类型有所区别的是，这两种枚举类型处理器可以处理所有继承了 Enum 的类

   EnumTypeHandler 使用枚举的 name 来转换，数据库中使用字符串类型存储

   EnumOrdinalTypeHandler 使用枚举的序号来转换，数据库中使用数值类型存储

   MyBatis 默认使用 EnumTypeHandler 处理枚举，可通过配置 mybatis-config.xml 来显示指定某个枚举要使用的处理器

   ```xml
   <typeHandlers>
   	<typeHandler handler="org.apache.ibatis.type.EnumOrdinalTypeHandler" 
                javaType="com.example.enums.MyEnum"/>
   </typeHandlers>
   ```

   在 SpringBoot 中可以通过配置 default-enum-type-handler 来全局设定默认枚举处理器

   ```yaml
   mybatis:
     configuration:
       default-enum-type-handler: org.apache.ibatis.type.EnumOrdinalTypeHandler
   ```

   当然，也可以在 mapper xml 的 SQL 和 resultMap 中直接指定 typeHandler

2.  DefaultEnumTypeHandler 枚举类型处理器

   示例参见[SpringBoot 使用枚举-MyBatis 映射枚举](https://juejin.cn/post/7109645824098828302#heading-4)

## MyBatis Plus TypeHandler 支持

> 以下测试内容 MyBatis Plus 版本为 3.5.1

1. MyBatis Plus 提供了 @TableField 注解，可指定实体类字段要用的 TypeHandler

   ```java
   @Data
   @TableName(autoResultMap = true)
   public class User {
       private Long id;
       private String name;
       @TableField(typeHandler = BoolToIntTypeHandler.class)
       private Boolean enableFlag;
   }
   ```

2. 对结果集的类型处理

   ```java
   @TableName(autoResultMap = true)
   ```

   实体类上需要设置 @TableName 注解 autoResultMap 为 true，或者使用 resultMap 属性指定一个 xml 中配置好的 resultMap

3. 对参数的类型处理

   service 层方法 save、updateById、removeById 支持根据注解设置的 typeHandler 处理参数类型

   注意使用带有 Wrapper 的方法时，条件最好通过实体类来设置，以保证参数被正确处理，如 eq 条件通过 setEntity 方法设置，更新 set 条件通过 update 方法传入实体

   lambdaQuery

   ```java
   // 查询 user 表，id=0，enable_flag=1
   // 若使用 eq，方法中的参数类型在当前版本可能无法被正确处理
   userService.lambdaQuery()
       .setEntity(User.builder().id(0L).enableFlag(true).build())
       .list();
   ```

   lambdaUpdate

   ```java
   // 更新 user 表，id=0，enable_flag=1 => enable_flag=0
   userService.lambdaUpdate()
       .setEntity(User.builder().id(0L).enableFlag(true).build())
       .update(User.builder().id(0L).enableFlag(false).build());
   
   // 若使用 set 方法，支持传入 mapping 指定 typeHandler
   // 如 .set(User::getEnableFlag, false, "typeHandler=\"BoolToIntTypeHandler\"")
   ```

   remove

   ```java
   userService.remove(Wrappers.<User>lambdaQuery()
                      .setEntity(User.builder().id(0L).enableFlag(true).build()));
   ```

4. 枚举类型类型处理器

   配置枚举类型所在包

   ```yaml
   mybatis-plus:
       # 支持统配符 * 或者 ; 分割
       type-enums-package: com.example.enums
   ```

   MyBatis Plus 提供的 MybatisSqlSessionFactoryBean 会自动扫描包内合法的枚举类（使用了 @EnumValu 注解，或者实现了 IEnum 接口），分别为这些类注册使用 MybatisEnumTypeHandler
   
   若需要全局指定枚举类型统一使用 MyBatis Plus 提供的处理器，可如下配置
   
   ```yaml
   mybatis-plus:
       # 修改 mybatis 的 DefaultEnumTypeHandler
       configuration:
           default-enum-type-handler: com.baomidou.mybatisplus.core.handlers.MybatisEnumTypeHandler
   ```
   
   配置完成后，枚举类型需要使用 @EnumValue 注解或者实现 IEnum 接口来指定转换的属性
   
   ```java
   @Getter
   public enum GradeEnum {
       PRIMARY(1, "小学"),  
       SECONDORY(2, "中学"),  
       HIGH(3, "高中"),
       ;
       GradeEnum(int code, String descp) {
           this.code = code;
           this.descp = descp;
       }
       // 数据库存的值是 code
       @EnumValue
       private final int code;
       // ...
   }
   ```
