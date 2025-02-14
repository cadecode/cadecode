---

title: Java 设计模式-适配器模式
date: 2022/3/16
description: 本文介绍 Java 设计模式中的适配器模式，包括适配器模式的简介、角色、相关代码实现以及该模式的应用场景
tag: [设计模式, Java, 结构型设计模式]

---

# Java 设计模式-适配器模式

## 模式简介

1. 适配器模式用于把一个类接口转换成另一个用户需要的接口，使原本的接口不兼容的类可以一起工作

2. 适配器模式的角色

   源接口：现有的、需要转换的接口

   目标接口：转换的目标
   
   适配器：实现目标接口，维护一个源接口实例来实现目标接口功能
   
   目标接口使用者：调用目标接口方法

## 模式实现

1. 源接口：USB

   ```java
   public interface Usb {
       void slot();
   }
   // 实现
   public class UsbImpl implements Usb {
       @Override
       public void slot() {
           System.out.println("USB slotted");
       }
   }
   ```

2. 目标接口：TypeC

   ```java
   public interface TypeC {
       void slot();
   }
   ```

3. 适配器

   ```java
   public class TypeCAdapter implements TypeC {
   
       private final Usb usb;
   
       public TypeCAdapter(Usb usb) {
           this.usb = usb;
       }
   
       @Override
       public void slot() {
           System.out.println("TypeC slotted");
           usb.slot();
       }
   }
   ```

4. 目标接口使用者

   ```java
   public class Client {
   
       public void useTypeC(TypeC typeC) {
           typeC.slot();
       }
   }
   ```

5. 测试

   ```java
   public class AdapterPatternTest {
   
       @Test
       public void test() {
           Usb usb = new UsbImpl();
           TypeC typeC = new TypeCAdapter(usb);
   
           Client client = new Client();
           client.useTypeC(typeC);
       }
   }
   ```

   输出

   ```
   TypeC slotted
   USB slotted
   ```

   UML

   ![image-20220316213235032](https://pic-bed.cadeli.top/2022/03/20220316213238576.png)

## 应用场景

1. 适配器模式适合用于已经存在的类，它的方法结果符合，但与需求不匹配场景

   > 适配器模式不是软件设计阶段考虑的设计模式，是随着软件维护，由于不同产品、不同厂家造成功能类似而接口不相同情况下的解决方案

2. 应用举例

   SpringMVC: HandlerAdapter

   log4j: 使用 log4j-to-slf4j 将 log4j2 适配到 slf4j
