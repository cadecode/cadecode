---

title: Java 设计模式-策略模式
date: 2022/3/2
description: 本文介绍 Java 设计模式中的策略模式，包括策略模式的简介、角色、相关代码实现以及该模式的应用场景
tag: [设计模式, Java, 行为型设计模式]

---

# Java 设计模式-策略模式

## 模式简介

1. 策略模式用来封装一组可以互相替代的算法族，并可以根据需要动态切换

2. 策略模式的角色

   策略接口：所有策略的父接口

   策略实现类：策略的各种实现

   策略上下文：持有策略实例，利用该实例做事

## 模式实现

1. 支付策略接口

   ```java
   public interface PayStrategy {
   
       void pay();
   }
   ```

2. 策略实现类

   ```java
   // 支付宝支付
   public class AliPay implements PayStrategy {
       @Override
       public void pay() {
           System.out.println("ALIPAY");
       }
   }
   // 微信支付
   public class WeChatPay implements PayStrategy {
       @Override
       public void pay() {
           System.out.println("WECHATPAY");
       }
   }
   ```

3. 策略上下文

   ```java
   public class PayContext {
   
       private final PayStrategy pay;
   
       public PayContext(PayStrategy pay) {
           this.pay = pay;
       }
   
       public void doPay() {
           pay.pay();
       }
   }
   ```

4. 测试

   ```java
   public class StrategyPatternTest {
   
       @Test
       public void test() {
           PayContext context = new PayContext(new AliPay());
           context.doPay();
       }
   }
   // ALIPAY
   ```

   UML

   ![image-20220303150625312](https://pic-bed.cadeli.top/2022/03/20220303150745040.png)

## 应用场景

1. 当某个功能的实现可以有多种选择，并且交由客户端选择时，可以使用策略模式进行解耦

2. 策略模式和简单工厂有些类似，不过简单工厂偏向于对象的创建，向客户端屏蔽创建细节，策略模式更偏向于多种算法的切换，由策略上下文执行策略

3. 应用举例

   JDK：java.util.Comparator#compare()
