---

title: Java 设计模式-代理模式
date: 2022/3/17
description: 本文介绍 Java 设计模式中的代理模式，包括代理模式的简介、角色、静态代理、动态代理的原理分析以及该模式的应用场景
tag: [设计模式, Java, 结构型设计模式]

---

# Java 设计模式-代理模式

## 模式简介

1. 代理模式是指使用一个代理对象替代目标对象，用以在执行目标方法的外围完成功能的增强

2. 代理模式的角色分为目标对象和代理对象

3. 代理模式有静态代理、动态代理两种

   静态代理：显式声明一类对象的代理

   动态代理：动态生成一类对象的代理

## 模式实现

> 示例：房东要出租房屋，由中介代理出租

### 静态代理

1. 出租人接口、房东类

   ```java
   // 出租人接口
   public interface RentOuter {
       void rentOut();
   }
   // 房东类
   public class Lessor implements RentOuter {
       @Override
       public void rentOut() {
           System.out.println("房东出租房屋");
       }
   }
   ```

2. 静态代理类

   ```java
   public class StaticProxyClient implements RentOuter {
       private final RentOuter rentOuter;
   
       public StaticProxyClient(RentOuter rentOuter) {
           this.rentOuter = rentOuter;
       }
   
       @Override
       public void rentOut() {
           seeHorse();
           signContract();
           takeMoney();
           rentOuter.rentOut();
       }
   
       private void seeHouse() {
           System.out.println("中介带看房");
       }
   
       private void signContract() {
           System.out.println("中介签合同");
       }
   
       private void takeMoney() {
           System.out.println("中介收费用");
       }
   }
   ```

3. 测试

   ```java
   public class ProxyPatternTest {
       @Test
       public void testStatic() {
           StaticProxyClient client = new StaticProxyClient(new Lessor());
           client.rentOut();
       }
   }
   ```

   输出

   ```java
   中介带看房
   中介签合同
   中介收费用
   房东出租房屋
   ```

### JDK 动态代理

1. JDK 动态代理类

   ```java
   public class DynamicProxyClient implements InvocationHandler {
   
       private final RentOuter rentOuter;
   
       public DynamicProxyClient(RentOuter rentOuter) {
           this.rentOuter = rentOuter;
       }
   
       public RentOuter getInstance() {
           Class<?> clazz = this.rentOuter.getClass();
           return (RentOuter) Proxy.newProxyInstance(clazz.getClassLoader(),
                                                     clazz.getInterfaces(), this);
       }
   
       /**
        * 代理方法
        *
        * @param proxy  代理对象
        * @param method 被代理对象的方法
        * @param args   方法参数
        * @return 方法返回值
        * @throws Throwable 抛出异常
        */
       @Override
       public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
           seeHouse();
           signContract();
           takeMoney();
           // 传入维护的 rentOuter（注意不是 proxy）
           return method.invoke(this.rentOuter, args);
       }
       
       // 省略方法 seeHouse 等
   }
   ```
   
2. 测试

   ```java
   public class ProxyPatternTest {
       @Test
       public void testDynamic() {
           DynamicProxyClient client = new DynamicProxyClient(new Lessor());
           RentOuter instance = client.getInstance();
           instance.rentOut();
       }
   }
   ```

3. JDK 动态代理流程

   - 实现 InvocationHandler 接口，invoke 方法接收 Method 参数，在调用前后加入增强逻辑
   - Proxy 类 newProxyInstance 方法，接收被代理类的所有接口和 InvocationHandler
   - newProxyInstance 方法会创建一个代理类，实现了被代理对象的所有接口
   - 动态生成代理类的 Java 代码，根据 InvocationHandler 加入增强逻辑

## CGLIB动态代理

1. CGLIB动态代理类

   ````java
   public class CglibProxyClient implements MethodInterceptor {
   
       public RentOuter getInstance(Class<? extends RentOuter> clazz) {
           // 提供方法增强功能的类
           Enhancer enhancer = new Enhancer();
           // 设置动态生成代理的父类
           enhancer.setSuperclass(clazz);
           // 设置 MethodInterceptor
           enhancer.setCallback(this);
           // 创建代理对象
           return (RentOuter) enhancer.create();
       }
   
       /**
        * 代理方法
        *
        * @param o           代理对象
        * @param method      被代理对象的方法
        * @param args        方法参数
        * @param methodProxy 方法的代理（用于执行父类方法）
        * @return 方法返回值
        * @throws Throwable 抛出的异常
        */
       @Override
       public Object intercept(Object o, Method method, 
                               Object[] args, MethodProxy methodProxy) throws Throwable {
           seeHouse();
           signContract();
           takeMoney();
           // 调用生成代理的父类方法
           return methodProxy.invokeSuper(o, args);
       }
       
       // 省略方法 seeHouse 等
   }
   ````

2. 测试

   ```java
   public class ProxyPatternTest {
       @Test
       public void testCglib() {
           CglibProxyClient client = new CglibProxyClient();
           RentOuter instance = client.getInstance(Lessor.class);
           instance.rentOut();
       }
   }
   ```

3. CGLIB动态代理流程

   - 实现 MethodInterceptor 接口，intercept 方法接收 MethodProxy 参数，在调用前后加入增强逻辑
   - 定义 Enhancer  对象，setSuperclass 方法设置父类为被代理的类
   - setCallback 方法设置 MethodInterceptor 实例
   - create 方法生成被代理对象，重写被代理的方法，加上 final 修饰符，同时加入增强逻辑

## 应用场景

1. JDK 动态代理与 CGLIB 代理的比较

   JDK 动态代理对象实现了被代理对象的全部接口，CGLIB 代理是继承了被代理对象

   JDK 和 CGLIB 都是在运行期生成字节码，JDK 是直接写 class 字节码，CGLIB 使用 ASM 框架写 class 字节码，生成代理对象的效率上 JDK 更高

   JDK 通过反射机制调用代理方法，CGLIB 通过 FastClass 机制直接调用方法，CGLIB 被代理类执行效率更高

2. 应用举例

   在 Spring AOP 中，当 Bean 有实现接口时，会用 JDK 动态代理，当 Bean 没有实现接口时则选择 CGLib

   可以通过配置或注解来强制使用 CGLIB

   - spring.aop.proxy-target-class=true

   - @EnableAspectJAutoProxy(proxyTargetClass = true)
