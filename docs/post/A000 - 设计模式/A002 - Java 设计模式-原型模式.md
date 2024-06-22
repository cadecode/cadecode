---

title: Java 设计模式-原型模式
date: 2022/2/28
description: 本文介绍 Java 设计模式中的原型模式，如原型模式的介绍，原型模式的三个角色和代码实现，以及原型模式的应用场景
tag: [设计模式, Java, 创建型设计模式]

---

# Java 设计模式-原型模式

## 模式简介

1. 原型模式用于创建重复对象，能逃避构造方法的约束

2. 原型模式的本质是对象克隆

3. 对象克隆的方式

   浅克隆：实现 cloneable 接口

   深克隆：实现 Serializable 接口，使用二进制流读写

   ```java
   @SneakyThrows
   private Object deepClone() {
       @Cleanup ByteArrayOutputStream bos = new ByteArrayOutputStream();
       @Cleanup ObjectOutputStream oos = new ObjectOutputStream(bos);
       oos.writeObject(this);
   
       @Cleanup ByteArrayInputStream bis = new ByteArrayInputStream(bos.toByteArray());
       @Cleanup ObjectInputStream ois = new ObjectInputStream(bis);
   
       return ois.readObject();
   }
   ```

   也可以使用 JSON 序列化来实现深克隆

## 模式实现

> 原型模式有三个角色：
>
> 原型角色：定义用于克隆实例的方法，抽象类或接口
>
> 具体原型角色：继承原型角色，实现克隆方法
>
> 使用者角色：调用克隆方法，生成新实例

1. 原型角色

   ```java
   public abstract class Shape implements Cloneable {
       public abstract void print();
   
       @Override
       protected Object clone() {
           try {
               return super.clone();
           } catch (CloneNotSupportedException e) {
               e.printStackTrace();
           }
           return null;
       }
   }
   ```

2. 具体原型角色

   ```java
   public class Circle extends Shape {
       @Override
       public void print() {
           System.out.println("Circle");
       }
   }
   
   public class Square extends Shape{
       @Override
       public void print() {
           System.out.println("Square");
       }
   }
   ```

3. 使用者角色

   ```java
   public class ShapeCache {
       private static final Map<String, Shape> cacheMap = new HashMap<>();
       static {
           cacheMap.put("Circle", new Circle());
           cacheMap.put("Square", new Square());
       }
       
       public static Shape getShape(String type) {
           return (Shape) cacheMap.get(type).clone();
       }
   }
   ```

4. 测试

   ```java
   public static void main(String[] args) {
       Shape circle = ShapeCache.getShape("Circle");
       Shape circle0 = ShapeCache.getShape("Circle");
       System.out.println(circle == circle0);
   }
   // false
   ```

## 应用场景

1. 构造函数复杂
2. 创建类步骤繁琐 （数据准备、访问权限）
3. 大量重复对象

> spring 中的 scope = "prototype" 是通过克隆容器中的对象模板，来快速创建实例的
