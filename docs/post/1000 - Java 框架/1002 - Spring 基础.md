---

title: Spring 基础
date: 2020/7/5
description: 本文介绍 Spring 框架的配置和使用，如 IOC 和 DI 的概念、XML 和 Java 类两种配置方式、注解的使用、面向切面以及整合 MyBatis 等
tag: [Java 框架, Spring, Java]
---

# Spring 基础

## 简介

1. Spring -> 春天，为软件行业带来了春天

2. 为简化企业级开发而生，可用于任何 Java 应用

3. 轻量级的控制反转（IOC）和面向切面（AOP）的容器框架

4. 发展历史

   - 2002 年，intface21 诞生，是 Spring 的雏形
   - 2004 年在 intface21 基础上不断丰富，推出 Sping 框架
   - 创始人是 Road Johnson，音乐学博士

5. 参考地址

   说明文档：https://docs.spring.io/spring-framework/docs/current/reference/html/index.html

   Github：https://github.com/spring-projects/spring-framework

6. 获取

   通过 maven 获取

   ```xml
   <!--spring-webmvc 包含了 spring-core、aop 等许多包-->
   <dependency>
       <groupId>org.springframework</groupId>
       <artifactId>spring-webmvc</artifactId>
       <version>5.2.8.RELEASE</version>
   </dependency>
   <!--spring-jdbc 包含数据库操作相关包-->
   <dependency>
       <groupId>org.springframework</groupId>
       <artifactId>spring-jdbc</artifactId>
       <version>5.2.8.RELEASE</version>
   </dependency>
   ```

## 控制反转

1. 探究控制反转的本质

   UserDao.java

   ```java
   public interface UserDao {
       void operateDatabase();
   }
   ```

   UserDao 有多个实现，比如 UserDaoMySqlImpl，UserDaoOracleImpl...

   ```java
   public class UserDaoOracleImpl implements UserDao{
   
       @Override
       public void operateDatabase() {
           System.out.println("操作 Oracle 数据库");
       }
   }
   public class UserDaoMySqlImpl implements UserDao {
   
       @Override
       public void operateDatabase() {
           System.out.println("操作 MySql 数据库");
       }
   }
   ```

   UserService 调用 dao 层操作数据库

   ```java
   public interface UserService {
       void doService();
   }
   public class UserServiceImpl implements UserService{
   
       private final UserDao userDao = new UserDaoOracleImpl();
   
       @Override
       public void doService() {
           userDao.operateDatabase();
       }
   }
   ```

   测试类

   ```java
   public class MyTest {
       public static void main(String[] args) {
           UserService userService = new UserServiceImpl();
           userService.doService();
       }
   }
   ```

   存在的问题：用户的不同需求对应了 UserDao 的不同实现，需求的变更需要更改源代码

   如何解决：通过一个 set 方法，将控制权交给用户

   ```java
   public class UserServiceImpl implements UserService {
   
       private UserDao userDao;
   
       @Override
       public void setUserDao(UserDao userDao) {
           this.userDao = userDao;
       }
   
       @Override
       public void doService() {
           userDao.operateDatabase();
       }
   }
   public class MyTest {
       public static void main(String[] args) {
           UserService userService = new UserServiceImpl();
           userService.setUserDao(new UserDaoMySqlImpl());
           userService.doService();
       }
   }
   ```

    使用 set 接口注入将控制权由程序员交给使用者，这发生了革命性的变化，是一种简单的控制反转

2. 控制反转是一种设计思想

   控制反转是通过描述（注解、xml）配合第三方来生产或获取对象的方式

   Spring 中实现控制反转的是 IOC 容器，实现方式是依赖注入（DI，dependency injection）

3. xml 配置 bean，实现控制反转

   Hello.java

   ```java
   public class Hello {
       String word;
   
       public String getWord() {
           return word;
       }
   
       public void setWord(String word) {
           this.word = word;
       }
   
       @Override
       public String toString() {
           return "Hello{" +
                   "word='" + word + '\'' +
                   '}';
       }
   }
   ```

   beans.xml

   ```java
   <?xml version="1.0" encoding="UTF-8"?>
   <beans xmlns="http://www.springframework.org/schema/beans"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.springframework.org/schema/beans
           https://www.springframework.org/schema/beans/spring-beans.xsd">
       <bean id="hello" class="pojo.Hello">
           <property name="word" value="hello world!" />
       </bean>
   </beans>
   ```

   测试类

   ```java
   public class MyTest {
       public static void main(String[] args) {
           // ClassPathXmlApplicationContext 是从类路径读取配置文件获取对象的一种实现
           ApplicationContext context = new ClassPathXmlApplicationContext("beans.xml");
           Hello hello = context.getBean("hello", Hello.class);
           System.out.println(hello.toString());
       }
   }
   ```

   IOC：对象由 Spring 来创建、管理、装配！

4. IOC 创建对象的方式

   1. 使用无参构造创建

      ```java
      public class Hello {
         	String word;
          
          public Hello(){
              System.out.println("执行 Hello 无参构造方法");
          }
          // ...
      }
      ```

      使用 getBean 方法获取 Hello 对象时，发现打印出：执行 Hello 构造方法

      说明 Spring 可以通过无参构造方法创建对象

   2. 使用有参构造创建

      ```java
      public class Hello {
         	String word;
          
         	public Hello(String word){
              this.word = word;
              System.out.println("执行 Hello 有参构造方法");
          }
          // ...
      }  
      ```

      在配置文件中通过参数顺序注入内容

      ```xml
      <bean id="hello" class="pojo.Hello">
          <constructor-arg index="0" value="Hello World!" />
      </bean>
      ```

      也可通过参数类型注入内容，不适用于有相同类型参数的构造方法

      ```xml
      <bean id="hello" class="pojo.Hello">
          <constructor-arg type="java.lang.String" value="Hello World!" />
      </bean>
      ```

      也可通过参数名称注入内容

      ```xml
      <bean id="hello" class="pojo.Hello">
          <constructor-arg name="word" value="Hello World!" />
      </bean>
      ```

## xml 配置

1. 别名

   ```xml
   <bean id="hello" class="pojo.Hello">
       // ...
   </bean>
   
   <alias name="hello" alias="helloAlias" />
   ```

   可以直接通过在 getBean 方法中传入 alias 别名来获取对象

2. bean 

   ```xml
   <!--
   	id 唯一标识
       class 全限定名，包 + 类
       name 也是别名，可取多个别名，逗号隔开
   -->
   <bean id="hello" class="pojo.Hello" name="helloName">
       <constructor-arg index="0" value="Hello World!" />
   </bean>
   ```

3. import

   在团队开发中，import 可以将 bean 配置文件相互导入、合并

   ```xml
   <!--ApplictionContext.xml -->
   <?xml version="1.0" encoding="UTF-8"?>
   <beans xmlns="http://www.springframework.org/schema/beans"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.springframework.org/schema/beans
           https://www.springframework.org/schema/beans/spring-beans.xsd">
   
       <import resource="beans1.xml" />
       <import resource="beans2.xml" />
       <import resource="beans3.xml" />
   
   </beans>
   ```

## 依赖注入

1. 构造器注入

   需要有有参构造方法

   ```xml
   <!--通过参数顺序注入内容-->
   <bean id="hello" class="pojo.Hello">
       <constructor-arg index="0" value="Hello World!" />
   </bean>
   <!--通过参数类型注入内容-->
   <bean id="hello" class="pojo.Hello">
       <constructor-arg type="java.lang.String" value="Hello World!" />
   </bean>
   <!--通过参数名称注入内容-->
   <bean id="hello" class="pojo.Hello">
       <constructor-arg name="word" value="Hello World!" />
   </bean>
   ```

2. setter 注入（重点）

   需要有 set 方法和无参构造

   ```java
   // Student.java
   package pojo;
   public class Student {
       private String nameStr;
       private Address addressObj;
       private String[] bookStrArray;
       private List<String> hobbyList;
       private Map<String, Object> cardMap;
       private Set<String> gameSet;
       private Properties infoProps;
       private String emptyStr;
       // setter/getter 方法
   }
   ```

   bean xml 配置

   ```xml
   <beans>
       <bean id="address" class="pojo.Address">
           <property name="addressStr" value="China" />
       </bean>
       <bean id="student" class="pojo.Student">
           <!--基本类型、String的注入-->
           <property name="nameStr" value="张三" />
           <!--一般对象的注入-->
           <property name="addressObj" ref="address" />
           <!--数组的注入-->
           <property name="bookStrArray">
               <array>
                   <value>红楼梦</value>
                   <value>西游记</value>
                   <value>三国演义</value>
                   <value>水浒传</value>
               </array>
           </property>
           <!--list 的注入-->
           <property name="hobbyList">
               <list>
                   <value>游戏</value>
                   <value>音乐</value>
                   <value>学习</value>
               </list>
           </property>
           <!--map 的注入-->
           <property name="cardMap">
               <map>
                   <entry value="学生卡" key="12345" />
                   <entry value="餐卡" key="12345" />
               </map>
           </property>
           <!--set 的注入-->
           <property name="gameSet">
               <set>
                   <value>王者荣耀</value>
                   <value>英雄联盟</value>
                   <value>穿越火线</value>
               </set>
           </property>
           <!--properties 的注入-->
           <property name="infoProps">
               <props>
                   <prop key="grade">大一</prop>
                   <prop key="shool">海南大学</prop>
               </props>
           </property>
           <!--空字符串的注入-->
           <property name="emptyStr" value="" />
           <!--null 的注入-->
           <property name="nullStr">
               <null />
           </property>
       </bean>
   </beans>
   ```

   当集合中元素为对象时，使用 ref 进行注入

   ```xml
   <property name="someList">
       <set>
           <ref bean="someBaenId" />
       </set>
   </property>
   <property name="someSet">
       <set>
           <ref bean="someBaenId" />
       </set>
   </property>
   <property name="someMap">
       <map>
           <entry key ="a ref" value-ref="someBaenId"/>
       </map>
   </property>
   ```

3. 拓展方式注入

   利用 p 命名空间和 c 命名空间简化配置文件，使用前需要导入约束

   前者表示 property，是利用 set 方法注入的，后者表示 constructor，是利用有参构造注入的

   ```xml
   <!--p namespace-->
   <bean name="person" class="pojo.Person">
   	<property name="name" value="张三"></property>
   </bean>
   <bean id="person" class="pojo.Person" p:name="张三"/>
   <!--c namespace-->
   <bean name="person" class="pojo.Person">
   	<constructor-arg name="name" value="张三" />
   </bean>
   <bean id="person" class="pojo.Person" c:name="张三"/>
   ```

4. bean 的作用域

   单例模式：每次从容器中 getBean 拿到的是同一个对象，是 Spring 默认的模式

   ```xml
   <bean id="student" class="pojo.Student" scope="singleton"></bean>
   ```

   原型模式：每次从容器中 getBean 都会产生新对象

   ```xml
   <bean id="student" class="pojo.Student" scope="prototype"></bean>
   ```

   其余的 Request/Session/Application/WebSocket 作用域，在 web 开发中有用

## 自动装配

1. byName 实现自动装配

   ```java
   public class Cat {
       public void play() {
           System.out.println("cat play");
       }
   }
   public class Dog {
       public void play(){
           System.out.println("dog play");
       }
   }
   public class Person {
       private Cat cat;
       private Dog dog;
       // ...
   }
   ```

   ```xml
   <beans>
       <bean id="dog" class="pojo.Dog" />
       <bean id="cat" class="pojo.Cat" />
       <!--
       	byName  自动在容器上下文中寻找 id、name 或 alias 能匹配其 set 方法的 bean
       -->
       <bean id="person" class="pojo.Person" autowire="byName"/>
   </beans>
   ```

2. byType 实现自动装配

   ```xml
   <beans>
       <bean id="dog" class="pojo.Dog" />
       <bean id="cat" class="pojo.Cat" />
       <!--
           byType 自动在容器上下文中寻找和自己属性类型相同的 bean
       -->
       <bean id="person" class="pojo.Person" autowire="byType"/>
   </beans>
   ```

3. 注解实现自动装配

   JDK5 支持注解，Spring2.5 添加注解配置

   开启注解支持

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <beans xmlns="http://www.springframework.org/schema/beans"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xmlns:context="http://www.springframework.org/schema/context"
          xsi:schemaLocation="http://www.springframework.org/schema/beans
           https://www.springframework.org/schema/beans/spring-beans.xsd
           http://www.springframework.org/schema/context
           https://www.springframework.org/schema/context/spring-context.xsd">
       <context:annotation-config />
       <bean id="dog" class="pojo.Dog" />
       <bean id="cat" class="pojo.Cat" />
       <bean id="person" class="pojo.Person" />
   </beans>
   ```

   在成员属性上使用 @Autowired 注解，也可以加到 set 方法上

   ```java
   public class Person {
       /**
        * @Autowired(required = false)	允许该 bean 未定义，注入 null
        * @Qualifier(value = "dog") 可以指定注入的 bean 名称
        * @Autowired 不再依赖 set 方法，也不需要无参构造或有参构造
        */
       @Autowired
       private Cat cat;
       @Autowired
       @Qualifier(value = "dog")
       private Dog dog;
   }
   ```

   > @Autowired 优先使用 byType 方式注入，当有多个实现类时，会根据引用的名称判断注入哪一个
   >
   > @Qualifier(value = "beanId") 是一种 byName 的方式， 会去匹配 bean 的名称，即 id/name/alias

   @Resoure 是 Java 原生注解，也可实现自动装配

   ```java
   public class Person {
       @Resource(type = Cat.class)
       private Cat cat;
       @Resource(name = "dog123")
       private Dog dog;
   }
   ```

   > @Resource 装配顺序：
   >
   > - 指定 name 和 type，则从 Spring 上下文中找到唯一匹配的 bean 进行装配，找不到则抛出异常
   > - 指定 name，则从上下文中查找名称匹配的 bean 进行装配，找不到则抛出异常
   > - 指定 type，则从上下文中找到类型匹配的唯一 bean 进行装配，找不到或是找到多个，都会抛出异常
   > - 两者都没有指定，则按照 byName 方式进行装配，没有匹配则回退为按照原始类型进行装配

## 使用注解

1. 配置文件中开启注解支持

   ```xml
   <!--开启注解支持-->
   <context:annotation-config />
   <!--开启自动扫描-->
   <context:component-scan base-package="..." />
   ```

   <context:annotation-config /> 开启 @Autowired/@ Resource/@Value 等

   <context:component-scan base-package="..." /> 开启 @Component /@Controller/@Service/@Repository 等

   > <context:component-scan base-package="..." /> 包含了 <context:annotation-config /> 的功能

2. @Component 注解 ，在类上使用 => 创建 bean

   @Value 注解，在属性或 set 方法上使用 => 注入属性值

   ```java
   @Component // => <bean id="user" class="cade.pojo.User">...</bean>
   public class User {
       @Value("张三") // => <property name="naem" value="张三" />
       private String name;
   }
   ```

   @Component 将类标注为一个 bean，其衍生注解有：

   - @Reposity：用于 dao 层
   - @Service：用于 service 层
   - @Controller：用于 controller 层

3. @Scope 注解，在类上使用 => 设置作用域，singleton/prototype 等

## Java 配置类

1. JavaConfig 是 Spring 的一个子项目，在 Spring4 之后逐渐成为核心功能

2. 使用 Java 配置类来代替 xml 中的配置

   配置类

   ```java
   @Configuration
   public class AppConfig {
       @Bean
       public User user() {
           return new User();
       }
       @Bean
       public Address address() {
           return new Address();
       }
   }
   ```

   pojo

   ```java
   public class User {
       @Value("张三")
       private String name;
   
       @Autowired
       private Address address;
   }
   public class Address {
       @Override
       public String toString() {
           return "China";
       }
   }
   ```

   测试类

   ```java
   public class MyTest {
       public static void main(String[] args) {
           // AnnotationConfigApplicationContext 用于从配置类中读取创建 bean 的信息
           ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
           // getBean 通过配置类中 @Bean 注解加持的方法名获取对象
           User user = context.getBean("user", User.class);
           System.out.println(user);
       }
   }
   ```

   @Configuration 注解配置类是默认开启注解支持的

   @Bean 注解在方法上，可以根据方法名获取对象

   在配置类上还可以使用以下注解：

   - @Import：用于导入其他配置类，类比于 xml 的 import 标签
   - @ComponentScan：指定扫描包，bean 上用 @Component 后就不用在配置类中使用 @Bean 注解方法

## 代理模式

> 理解面向切面 AOP 前需要理解代理模式 

1. 静态代理

   抽象角色：描述代理动作的接口与抽象类

   ```java
   // 出租房屋接口
   public interface RentOuter {
       void rentOut();
   }
   ```

   真实角色：被代理的角色

   ```java
   // 出租人
   public class Lessor implements RentOuter {
       @Override
       public void rentOut() {
           System.out.println("房东出租房屋");
       }
   }
   ```

   代理角色：代理真实角色，并做一些附属操作

   ```java
   // 代理 => 中介
   package demo1;
   
   /**
    * @author Cade Li
    * @date 2020/12/5
    */
   public class Proxy implements RentOuter {
       private RentOuter rentOuter;
   
       public RentOuter getRentOuter() {
           return rentOuter;
       }
   
       public void setRentOuter(RentOuter rentOuter) {
           this.rentOuter = rentOuter;
       }
   
       public void seeHorse() {
           System.out.println("中介带看房");
       }
   
       public void signContract(){
           System.out.println("中介签合同");
       }
   
       public void takeMoney(){
           System.out.println("中介收费用");
       }
   
       @Override
       public void rentOut() {
           seeHorse();;
           signContract();
           takeMoney();
           rentOuter.rentOut();
       }
   }
   ```

   客户角色：访问代理对象的用户

   ```java
   // 租房的客户
   public class Lessee {
   
       public void rentIn(Proxy proxy) {
           proxy.rentOut();
       }
   
       public static void main(String[] args) {
           Lessee lessee = new Lessee();
           Proxy proxy = new Proxy();
           proxy.setRentOuter(new Lessor());
           lessee.rentIn(proxy);
       }
   }
   /**
    * 中介带看房
    * 中介签合同
    * 中介收费用
    * 房东出租房屋
    */
   ```

   > 代理模式让真实角色更加存粹，不必涉及一些公共的业务
   >
   > 代理角色来处理公共业务，实现业务的分工。当公共业务发送扩展时，方便集中管理

2. 动态代理

   动态代理的代理类是动态生成的

   动态代理的实现方式

   - 基于接口，JDK 原生
   - 基于类，cglib
   - 基于字节码，Javasist

   认识两个类，Proxy、InvocationHandler

   - Proxy 提供创建静态代理类和实例的方法
   - InvocationHandler 是代理类实例的调用处理程序的接口
   
   ```java
   public class ProxyInvocationHandler implements InvocationHandler {
   
       // 真实角色
       private RentOuter rentOuter;
   
       public void setRentOuter(RentOuter rentOuter) {
           this.rentOuter = rentOuter;
       }
   
       // 得到代理类
       public Object getProxy() {
           return Proxy.newProxyInstance(this.getClass().getClassLoader(), rentOuter.getClass().getInterfaces(), this);
       }
   
       // 处理代理实例
       @Override
       public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
           seeHorse();
           signContract();
           takeMoney();
           return method.invoke(rentOuter, args);
       }
   
       // 附属业务
       public void seeHorse() {
           System.out.println("中介带看房");
       }
   
       public void signContract(){
           System.out.println("中介签合同");
       }
   
       public void takeMoney(){
           System.out.println("中介收费用");
       }
   }
   ```
   
   客户角色：租客
   
   ```java
   public class Lessee {
   
       public void rentIn(ProxyInvocationHandler pih) {
           // 获得代理实例
           RentOuter rentOuter = (RentOuter) pih.getProxy();
           // invoke 方法执行
           rentOuter.rentOut();
       }
   
       public static void main(String[] args) {
           Lessee lessee = new Lessee();
           ProxyInvocationHandler pih = new ProxyInvocationHandler();
           pih.setRentOuter(new Lessor());
           lessee.rentIn(pih);
       }
   }
   ```
   
   一个动态代理类可以代替一个接口，即一类业务

## 面向切面

1. 面向切面编程（AOP）是一种通过预编译和运行期动态代理实现程序功能的统一维护的手段

2. AOP 在 Spring 中的作用：提供声明式事务、允许用户自定义切面

3. Spring AOP 中的相关概念

   - 通知（Advice）是对现有组件的增强处理，如日志、事务等

   - 连接点（JoinCut）是允许通知的地方，如每一个方法的前、后或抛出异常时
   - 切入点（PointCut）是对连接点的筛选，如类的某些方法执行前进行通知

   - 切面（Aspect）是通知和切入点的结合，通知定义了时间，切入点定义了地点
   - 目标（Target）是真正的业务逻辑，被织入切面进行增强处理
   - 代理（Proxy）是由 Spring AOP 框架生成的对象，包含代理方法（通知 + 目标对象方法）

4. 在 Spring 中使用 AOP 接口

   maven 中导入织入包

   ```xml
   <dependency>
       <groupId>org.aspectj</groupId>
       <artifactId>aspectjweaver</artifactId>
       <version>1.9.6</version>
   </dependency>
   ```

   service 层，UserServiceImpl

   ```java
   public class UserServiceImpl implements UserService{
       @Override
       public void insert() {
           System.out.println("insert 执行");
       }
   
       @Override
       public void delete() {
           System.out.println("delete 执行");
       }
   
       @Override
       public void update() {
           System.out.println("update 执行");
       }
   
       @Override
       public void select() {
           System.out.println("select 执行");
       }
   }
   ```

   通知类，实现 MethodBeforeAdvice、AfterReturningAdvice

   ```java
   // BeforeLogAdvisor.java
   // MethodBeforeAdvice 方法前通知
   public class BeforeLogAdvisor implements MethodBeforeAdvice {
       @Override
       public void before(Method method, Object[] args, Object target) throws Throwable {
           System.out.println("[BeforeLog] " + target.getClass().getName() + " => " + method.getName());
       }
   }
   // AfterLogAdvisor.java
   // AfterReturningAdvice 方法返回后通知
   public class AfterLogAdvisor implements AfterReturningAdvice {
       @Override
       public void afterReturning(Object returnValue, Method method, Object[] args, Object target) throws Throwable {
           System.out.println("[AfterLog] " + target.getClass().getName() + " => " + method.getName() + " return: " + returnValue);
       }
   }
   ```

   xml 配置

   ```xml
   <beans>
       <!--注册 bean-->
       <bean id="beforeLog" class="cade.advisor.BeforeLogAdvisor" />
       <bean id="afterLog" class="cade.advisor.AfterLogAdvisor" />
       <bean id="userService" class="cade.service.UserServiceImpl" />
       <!--配置 aop-->
       <aop:config>
           <aop:pointcut id="pointCut" 
                         expression="execution(* cade.service.UserServiceImpl.*(..))" />
           <aop:advisor advice-ref="beforeLog" pointcut-ref="pointCut" />
           <aop:advisor advice-ref="afterLog" pointcut-ref="pointCut" />
       </aop:config>
   </beans>
   ```

   > expression="execution(返回值类型 包名.类名.方法名(参数))"

   测试类

   ```java
   public class MyTest {
       public static void main(String[] args) {
           ApplicationContext context = new 
               ClassPathXmlApplicationContext("ApplicationContext.xml");
           UserService userService = context.getBean("userService", UserService.class);
           userService.insert();
       }
   }
   /**
    * [BeforeLog] cade.service.UserServiceImpl => insert
    * insert 执行
    * [AfterLog] cade.service.UserServiceImpl => insert return: null
    */
   ```

5. 自定义类实现 AOP

   自定义的通知类

   ```java
   public class MyAdvisor {
       public void before(){
           System.out.println("MyAdvisor => Before");
       }
       public void After(){
           System.out.println("MyAdvisor => After");
       }
   }
   ```

   xml 配置

   ```xml
   <beans>
       <!--注册 bean-->
       <bean id="userService" class="cade.service.UserServiceImpl" />
       <bean id="myPointCut" class="cade.advisor.MyAdvisor"/>
       <!--配置 aop-->
       <aop:config>
      		<aop:aspect ref="myPointCut">
               <!--切入点-->
               <aop:pointcut id="pointCut" 
                             expression="execution(* cade.service.UserServiceImpl.*(..))" />
               <aop:before method="before" pointcut-ref="pointCut"/>
               <aop:after method="after" pointcut-ref="pointCut"/>
       	</aop:aspect>
   	</aop:config>
   </beans>
   ```

   测试类

   ```java
   public class MyTest {
       public static void main(String[] args) {
           ApplicationContext context = new 
               ClassPathXmlApplicationContext("ApplicationContext.xml");
           UserService userService = context.getBean("userService", UserService.class);
           userService.insert();
       }
   }
   /**
    * MyAdvisor => Before
    * insert 执行
    * MyAdvisor => After
    */
   ```

6. 使用 AOP 注解

   开启 AOP 注解支持、自动扫描 bean 

   ```xml
   <beans>
       <bean id="userService" class="cade.service.UserServiceImpl" />
       <!--开启 AOP 注解-->
       <context:component-scan base-package="cade.*" />
       <aop:aspectj-autoproxy />
   </beans>
   ```

   >  <aop:aspectj-autoproxy proxy-target-class="true" /> 更改 AOP 为 cglib 实现

   注解实现 AOP

   ```java
   @Component
   @Aspect
   public class MyAspect {
   
       @Before("execution(* cade.service.UserServiceImpl.*(..))")
       public void before(JoinPoint joinPoint) {
           System.out.println("MyAspect => before");
       }
   
       @After("execution(* cade.service.UserServiceImpl.*(..))")
       public void after(JoinPoint joinPoint) {
           System.out.println("MyAspect => after");
       }
   
       @Around("execution(* cade.service.UserServiceImpl.*(..))")
       public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
           System.out.println("MyAspect => around before");
           Object result = joinPoint.proceed();
           System.out.println("MyAspect => around after");
           return result;
       }
   }
   ```

   > @Aspect 将类标注为一个切面，切面中的方法是通知，@Before 等注解标注了切入点
   >
   > JoinPoint 和 ProceedingJoinPoint 可以获取目标对象的方法一些信息

   测试类

   ```java
   public class MyTest {
       public static void main(String[] args) {
           ApplicationContext context = new 
               ClassPathXmlApplicationContext("ApplicationContext.xml");
           UserService userService = context.getBean("userService", UserService.class);
           userService.insert();
       }
   }
   /**
    * MyAspect => around before
    * MyAspect => before
    * insert 执行
    * MyAspect => after
    * MyAspect => around after
    */
   ```

## 整合 MyBatis

1. 导入相关包

   Spring 3.5 及以上推荐使用 mybatis-spring 2.x

   ```xml
   <dependency>
       <groupId>mysql</groupId>
       <artifactId>mysql-connector-java</artifactId>
       <version>8.0.21</version>
   </dependency>
   <dependency>
       <groupId>org.mybatis</groupId>
       <artifactId>mybatis</artifactId>
       <version>3.4.6</version>
   </dependency>
   <dependency>
       <groupId>org.mybatis</groupId>
       <artifactId>mybatis-spring</artifactId>
   <version>1.3.2</version> 
   ```

2. pojo User 和 Usermapper 类

   ```java
   public class User {
       int id;
       String name;
       String pwd;
   }
   public interface UserMappper {
       List<User> listUsers();
   }
   ```

3. UserMapper.xml

   ```xml
   <mapper namespace="mapper.UserMappper">
       <select id="listUsers" resultType="user">
           select * from user
       </select>
   </mapper>
   ```

4. mybatis-config.xml

   ```xml
   <configuration>
       <typeAliases>
           <typeAlias type="pojo.User" alias="user" />
       </typeAliases>
   </configuration>
   ```

5. spring-dao.xml

   ```xml
   <beans>
       <!--配置数据源-->
       <bean id="dataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
           <property name="driverClassName" value="com.mysql.cj.jdbc.Driver" />
           <property name="url"
                     value="jdbc:mysql://localhost:3306/mybatis?useSSL=true&amp;useUnicode=true&amp;characterEncoding=UTF-8&amp;serverTimezone=Asia/Shanghai" />
           <property name="username" value="root" />
           <property name="password" value="cadedev" />
       </bean>
       <!--配置 SqlSessionFactory-->
       <bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
           <property name="dataSource" ref="dataSource" />
           <!--指定 mybatis-config.xml 位置-->
           <property name="configLocation" value="classpath:mybatis-config.xml" />
           <!--配置 mapperLocations，mybatis-config.xml 中不用配置 mapper-->
           <property name="mapperLocations" value="classpath:mapper/*Mapper.xml" />
       </bean>
   </beans>
   ```

6. applictionContext.xml

   ```xml
   <beans>
       <import resource="classpath:spring-dao.xml" />
       <!--配置 userMapper-->
       <bean id="userMapper" class="org.mybatis.spring.mapper.MapperFactoryBean">
           <property name="sqlSessionFactory" ref="sqlSessionFactory" />
           <property name="mapperInterface" value="mapper.UserMappper" />
       </bean>
   </beans>
   ```

7. 测试类

   ```java
   public class MyTest {
       @Test
       public void tes() throws IOException {
           ApplicationContext context = new 
               ClassPathXmlApplicationContext("applicationContext.xml");
           UserMappper mapper = context.getBean("userMapper", UserMappper.class);
   
           List<User> users = mapper.listUsers();
   
           System.out.println(users);
       }
   }
   ```

8. 其他方式使用 SqlSession

   ```xml
   <bean id="sqlSession" class="org.mybatis.spring.SqlSessionTemplate">
       <constructor-arg index="0" ref="sqlSessionFactory" />
   </bean>
   ```

   SqlSessionTemplate 可以代替 SqlSession 的所有功能，可以注入到 bean 中使用

   SqlSessionTemplate 是线程安全的，可以被多个 DAO 或映射器所共享使用

   ```java
   SqlSessionTemplate sqlSession = context.getBean("sqlSession", SqlSessionTemplate.class);
   UserMapper mapper = sqlSession.getMapper(UserMappper.class);
   List<User> users = mapper.listUsers();
   ```

   SqlSessionDaoSupport 是一个抽象的支持类，getSqlSession() 可以获得 SqlSession 实例

   ```java
   public class UserMapperImpl extends SqlSessionDaoSupport implements UserMapper {
       public List<User> listUsers() {
       	SqlSession sqlSession = getSqlSession();
       	UserMappper mappper = sqlSession.getMapper(UserMappper.class);
      		return mappper.listUsers();
     }
   }
   ```

   ```xml
   <bean id="userMapperImpl" class="mapper.UserMapperImpl">
       <!--setSqlSessionFactory 方法继承自 SqlSessionDaoSupport-->
       <property name="sqlSessionFactory" ref="sqlSessionFactory" />
   </bean>
   ```

## 声明式事务

1. 事务的 ACID 原则

   原子性 atomicity：一个事务要么全部提交成功，要么全部失败回滚

   一致性 consistency：一个事务在执行之前和执行之后，数据库都必须处于一致性状态

   隔离性 isolation：并发执行的各个事务之间不能相互干扰

   持久性 durability：一旦事务提交，那么它对数据库中的对应数据的状态的变更就会永久保存到数据库中

2. 编程式事务需要显式调用相关方法、捕获异常，声明式事务是交由容器管理

3. xml 配置

   ```xml
   <beans>
   	<!--事务管理器-->
       <bean id="transactionManager"
             class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
           <property name="dataSource" ref="dataSource" />
       </bean>
       <!--事务通知-->
       <tx:advice id="txAdvice" transaction-manager="transactionManager">
           <tx:attributes>
               <!--为 list 开头的方法开启事务-->
               <tx:method name="list*" />
           </tx:attributes>
       </tx:advice>
       <!--切面配置-->
       <aop:config>
           <aop:pointcut id="txPointCut" expression="execution(* mapper.*.*(..))" />
           <aop:advisor advice-ref="txAdvice" pointcut-ref="txPointCut" />
       </aop:config>
   </beans>
   ```

4. UserMapper.java

   ```java
   public class UserMapperImpl extends SqlSessionDaoSupport implements UserMappper {
       @Override
       public List<User> listUsers() {
           SqlSession sqlSession = getSqlSession();
           UserMappper mappper = sqlSession.getMapper(UserMappper.class);
           
           User user = new User();
           user.setId(5);
           user.setName("小 e");
           user.setPwd("123456");
           
           addUser(user);
           deleteUser(5);
           return mappper.listUsers();
       }
   
       @Override
       public int addUser(User user) {
           SqlSession sqlSession = getSqlSession();
           UserMappper mappper = sqlSession.getMapper(UserMappper.class);
           return mappper.addUser(user);
       }
   
       @Override
       public int deleteUser(int id) {
           SqlSession sqlSession = getSqlSession();
           UserMappper mappper = sqlSession.getMapper(UserMappper.class);
           return mappper.deleteUser(id);
       }
   }
   ```

5. 测试

   在 listUsers 方法中执行先添加一个用户，再删除刚刚添加的用户

   在 UserMapper.xml 中故意将 deleteUser 对应的查询语句写错，来模拟执行出错

   当执行 listUsers 方法后，观察数据表内容，发现添加用户没有成功

   说明添加和删除是在一个事务中，要么都成功，要么都回滚
