---

title: Java 设计模式-工厂模式
date: 2022/3/1
description: 本文介绍 Java 设计模式中的工厂模式，包括简单工厂模式、工厂方法模式和抽象工厂模式，以及它们的区别和使用场景
tag: [设计模式, Java, 创建型设计模式]

---

# Java 设计模式-工厂模式

## 模式简介

1. 工厂模式提供了一种创建对象的最佳方式，像工厂生产产品一样，对客户端屏蔽创建逻辑
2. 工厂模式分为简单工厂模式、工厂方法模式、抽象工厂模式

## 简单工厂模式

1. 简单工厂模式也称静态工厂模式

2. 简单工厂模式的本质在于维护一个产品的注册表，使用一个公共的创建方法，根据入参创建产品

3. 示例代码

   ```java
   // 图形接口
   public interface Shape {
       void print();
   }
   // 圆形
   public class Circle implements Shape{
       @Override
       public void print() {
           System.out.println("CIRCLE");
       }
   }
   // 方形
   public class Square implements Shape{
       @Override
       public void print() {
           System.out.println("SQUARE");
       }
   }
   ```

   简单工厂

   ```java
   public class SimpleFactory {
   
       private static final Map<String, Supplier<Shape>> cacheMap = new HashMap<>();
   
       static {
           cacheMap.put("C", Circle::new);
           cacheMap.put("S", Square::new);
       }
   
       public static Shape getShape(String type) {
           return cacheMap.get(type).get();
       }
   }
   ```

   UML

   ![image-20220302132711201](https://pic-bed.cadeli.top/2022/03/20220302132726365.png)

4. 应用场景

   slf4j 日志：LoggerFactory.getLogger(String name)

## 工厂方法模式

1. 工厂方法模式也称多态工厂模式

2. 工厂方法模式的本质在于提供一个工厂接口，针对每个产品分别实现对应的工厂

3. 示例

   ```java
   // 工厂接口
   public interface FactoryMethod {
       Shape getShape();
   }
   // 圆形工厂
   public class CircleFactory implements FactoryMethod {
       @Override
       public Circle getShape() {
           return new Circle();
       }
   }
   // 方形工厂
   public class SquareFactory implements FactoryMethod {
       @Override
       public Square getShape() {
           return new Square();
       }
   }
   ```

   UML

   ![image-20220302132743048](https://pic-bed.cadeli.top/2022/03/20220302132744940.png)

4. 应用场景

   JDK：Calendar.getInstance()

## 抽象工厂模式

1. 抽象工厂模式也称工具箱模式

1. 抽象工厂模式的本质在于提供一个工厂接口，创建一系列相关联产品

2. 举例

   除了上文的图形接口，还有颜色接口，以及其实现类红色、蓝色，如何创建一个红色的圆形？

   ```java
   // 颜色接口
   public interface Color {
       void fill();
   }
   // 蓝色
   public class Blue implements Color{
       @Override
       public void fill() {
           System.out.println("BLUE");
       }
   }
   // 红色
   public class Red implements Color {
       @Override
       public void fill() {
           System.out.println("RED");
       }
   }
   ```

   抽象工厂

   ```java
   public abstract class AbstractFactory {
   
       public abstract Shape getShape();
   
       public abstract Color getColor();
   }
   ```

   用于创建红色圆形的工厂

   ```java
   public class RedCircleFactory extends AbstractFactory {
   
       @Override
       public Circle getShape() {
           return new Circle();
       }
   
       @Override
       public Red getColor() {
           return new Red();
       }
   }
   ```

   UML

   ![image-20220302132802242](https://pic-bed.cadeli.top/2022/03/20220302132804088.png)

4. 应用场景

   Spring： 

   AbstractBeanFactory -> AbstractAutowireCapableBeanFactory / DefaultListableBeanFactory / XmlBeanFactory

## 总结

1. 三种工厂模式的区别：

   简单工厂是一个工厂类，一个产品抽象类，根据方法入参创建具体产品

   工厂方法是多个工厂类，一个产品抽象类，利用多态，使用各自的工厂类创建不同的产品对象

   抽象工厂是多个工厂类，多个产品抽象类，产品子类分组，同一个工厂实现类创建同组中的不同产品

2. 何时应该使用工厂模式？

   在编码时不能预见需要创建哪种产品的实例

   系统不应依赖于产品实例如何被创建的细节

