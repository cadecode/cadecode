---

title: Java 设计模式-观察者模式
date: 2022/3/8
description: 本文介绍 Java 设计模式中的观察者模式，包括观察者模式的简介、角色、相关代码实现以及该模式的应用场景
tag: [设计模式, Java, 行为型设计模式]

---

# Java 设计模式-观察者模式

## 模式简介

1. 观察者模式用于定义对象之间的一对多依赖

   当一个对象状态改变时，它的所有依赖都会收到通知并且自动更新状态

2. 观察者模式的角色

   主题（Subject）：被观察的对象

   观察者（Observer）：依赖被观察对象的其他对象

## 模式实现

1. 主题和观察者接口

   ```java
   // 主题
   public interface Subject {
   
       void add(Observer observer);
   
       void remove(Observer observer);
   
       void notice(String message);
   }
   // 观察者
   public interface Observer {
       void update(String msg);
   }
   ```

2. 报警器类

   ```java
   public class Alarm implements Subject {
   
       private final String name;
       private final Set<Observer> observers = new HashSet<>();
   
       public Alarm(String name) {
           this.name = name;
       }
   
       @Override
       public void add(Observer observer) {
           observers.add(observer);
       }
   
       @Override
       public void remove(Observer observer) {
           observers.remove(observer);
       }
   
       @Override
       public void notice(String message) {
           System.out.println(name + "发布了消息：" + message);
           observers.forEach(observer -> observer.update(message));
       }
   }
   ```

3. 操作员类

   ```java
   public class Operator implements Observer {
   
       private final String name;
   
       public Operator(String name) {
           this.name = name;
       }
   
       @Override
       public void update(String message) {
           System.out.println(name + "收到了通知：" + message);
       }
   }
   ```

4. 测试

   ```java
   public class ObserverPatternTest {
   
       @Test
       public void test() {
           Alarm alarm = new Alarm("温度报警器");
           Operator operator0 = new Operator("操作员0");
           Operator operator1 = new Operator("操作员1");
           alarm.add(operator0);
           alarm.add(operator1);
           alarm.notice("温度 37.5，超标了");
           alarm.remove(operator1);
           alarm.notice("温度 36.5，太低了");
       }
   }
   ```

   输出

   ```
   温度报警器发布了消息：温度 37.5，超标了
   操作员1收到了通知：温度 37.5，超标了
   操作员0收到了通知：温度 37.5，超标了
   温度报警器发布了消息：温度 36.5，太低了
   操作员0收到了通知：温度 36.5，太低了
   ```

   UML

   ![image-20220308214803035](https://pic-bed.cadeli.top/2022/03/20220308214815204.png)

## 应用场景

1. 观察者模式主要用于在关联行为之间建立一套触发机制的场景

2. 应用举例

   JDK: java.util.Observer, java.util.EventListener

   Spring: ApplicationEvent

