---

title: Java 设计模式-模板方法模式
date: 2022/3/8
description: 本文介绍 Java 设计模式中的模板方法模式，包括模板方法模式的简介、角色、相关代码实现以及该模式的应用场景
tag: [设计模式, Java, 行为型设计模式]

---

# Java 设计模式-模板方法模式

## 模式简介

1. 模板方法模式用于定义实现功能的步骤框架，将这些步骤交由子类实现

   子类可以重新定义某些步骤，而不用改变该功能的实现结构

2. 模板方法模式的角色

   抽象模板：定义整体流程

   模板实现：实现流程的细节方法

## 模式实现

1. 抽象模板：消息发送器

   ```java
   public abstract class MsgSender {
   
       /**
        * 检查消息格式
        *
        * @param msg 消息
        */
       protected abstract void check(String msg);
   
       /**
        * 执行消息发送
        *
        * @param msg 消息
        */
       protected abstract void exec(String msg);
   
       /**
        * 发送失败处理
        *
        * @param msg 消息
        * @param t   异常
        */
       protected abstract void error(String msg, Throwable t);
   
       /**
        * 发送消息主方法
        *
        * @param msg 消息
        * @return 是否发送成功
        */
       public boolean send(String msg) {
           check(msg);
           try {
               exec(msg);
           } catch (Throwable t) {
               error(msg, t);
               return false;
           }
           return true;
       }
   }
   ```

2. 模板实现

   ```java
   // 邮件发送消息
   public class EmailMsgSender extends MsgSender {
       @Override
       protected void check(String msg) {
           System.out.println("邮件发送前检查消息格式");
       }
   
       @Override
       protected void exec(String msg) {
           System.out.println("邮件发送消息中");
           System.out.println("邮件发送消息成功：" + msg);
       }
   
       @Override
       protected void error(String msg, Throwable t) {
           System.out.println("邮件发送消息失败：" + msg);
       }
   }
   // 短信发送消息
   public class ShortMsgSender extends MsgSender {
       @Override
       protected void check(String msg) {
           System.out.println("短信发送前检查消息格式");
       }
   
       @Override
       protected void exec(String msg) {
           System.out.println("短信发送消息中");
           throw new RuntimeException();
       }
   
       @Override
       protected void error(String msg, Throwable t) {
           System.out.println("短信发送消息失败：" + msg);
       }
   }
   ```

3. 测试

   ```java
   public class TemplatePatternTest {
   
       @Test
       public void test() {
           MsgSender emailMsgSender = new EmailMsgSender();
           emailMsgSender.send("hello email msg");
           System.out.println("---------------------");
           MsgSender shortMsgSender = new ShortMsgSender();
           shortMsgSender.send("hello short msg");
       }
   }
   ```

   输出

   ```
   邮件发送前检查消息格式
   邮件发送消息中
   邮件发送消息成功：hello email msg
   ---------------------
   短信发送前检查消息格式
   短信发送消息中
   短信发送消息失败：hello short msg
   ```

   UML

   ![image-20220309214024276](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2022/03/20220309214036432.png)

## 应用场景

1. 模板方法模式可以将具有类似功能的子类中公共的行为提取出来，并集中到一个公共的父类中，从而避免代码重复

2. 应用举例

   Spring: JdbcTemplate、RedisTemplate
