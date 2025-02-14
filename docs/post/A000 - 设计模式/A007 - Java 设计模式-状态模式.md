---

title: Java 设计模式-状态模式
date: 2022/3/13
description: 本文介绍 Java 设计模式中的状态模式，包括状态模式的简介、角色、相关代码实现以及该模式的应用场景
tag: [设计模式, Java, 行为型设计模式]

---

# Java 设计模式-状态模式

## 模式简介

1. 状态模式用于定义一套状态流转的机制

   由子类实现不同状态下的各种行为的表现形式，其中包含了状态的切换

2. 状态模式的角色

   状态接口：主要描述有哪些状态或者说有哪些行为

   状态实现类：针对不同状态实现行为细节
   
   状态上下文：持有所有状态的实例，维护一个起始状态，并提供切换起始状态的的方法

## 模式实现

1. 状态接口：灯的状态

   ```java
   public interface LightState {
       void on(LightContext context);
       void off(LightContext context);
   }
   ```
   
2. 状态实现类

   ```java
   // 关灯状态
   public class LightOffState implements LightState {
       @Override
       public void on(LightContext context) {
           System.out.println("开灯");
           // 状态切换
           context.setState(context.getOnState());
       }
   
       @Override
       public void off(LightContext context) {
           System.out.println("灯早就关了");
       }
   }
   // 开灯状态
   public class LightOnState implements LightState {
   
       @Override
       public void on(LightContext context) {
           System.out.println("灯早就开了");
       }
   
       @Override
       public void off(LightContext context) {
           System.out.println("关灯");
           // 状态切换
           context.setState(context.getOffState());
       }
   }
   ```
   
3. 状态上下文

   ```java
   @Data
   public class LightContext {
   
       private final LightOnState onState = new LightOnState();
       private final LightOffState offState = new LightOffState();
   
       private LightState state;
   
       public LightContext(LightState state) {
           this.state = state;
       }
   
       public void on() {
           state.on(this);
       }
   
       public void off() {
           state.off(this);
       }
   }
   ```

4. 测试

   ```java
   public class StatePatternTest {
       @Test
       public void test() {
           // 初始状态为关灯
           LightContext lightContext = new LightContext(new LightOffState());
   
           lightContext.off();
           lightContext.on();
           lightContext.on();
           lightContext.off();
           lightContext.off();
       }
   }
   ```
   
   输出
   
   ```
   灯早就关了
   开灯
   灯早就开了
   关灯
   灯早就关了
   ```
   
   UML
   
   ![image-20220313115126122](https://pic-bed.cadeli.top/2022/03/20220313115138996.png)

## 应用场景

1. 状态模式主要用于行为随状态改变而改变的场景

2. 策略模式、模板方法模式、状态模式的比较

   模板方法通过模板接口定义实现功能的流程，不同实现方式之间是互不影响的，主要目的规范流程

   策略模式通过统一的算法接口和上下文，执行不同的算法实现，主要目的是动态切换算法
   
   状态模式通过实现状态接口，定义不同状态下的行为和状态的传递，主要目的是状态转移
