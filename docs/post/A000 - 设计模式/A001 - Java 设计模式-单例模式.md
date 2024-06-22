---

title: Java 设计模式-单例模式
date: 2021/10/12
description: 本文介绍 Java 设计模式中的单例模式，其核心思想是构造私有化，有饿汉式、懒汉式、枚举式等实现方式
tag: [设计模式, Java, 创建型设计模式]

---

# Java 设计模式-单例模式

## 模式简介

1. 单例模式是创建型设计模式，确保一个类在任何情况下都只有一个实例
2. 核心：隐藏构造方法，缓存实例，提供一个全局的访问入口

## 实现方式

### 饿汉式

使用静态字段保存实例，在类加载时进行实例化

并发场景：在 JVM 层面保证了多线程访问的安全性

```java
public class HungryMan {
    private static final HungryMan man = new HungryMan();

    private HungryMan() {

    }

    public static HungryMan instance() {
        return man;
    }
}
```

### 懒汉式

使用静态字段保存实例，在调用 instance 方法时进行实例化

并发场景：多线程访问不安全，可能会重复 new 新实例

```java
public class LazyMan {
    private static LazyMan man;

    private LazyMan() {

    }

    public static LazyMan instance() {
        if (man == null) {
            man = new LazyMan();
        }
        return man;
    }
}
```

### 懒汉式（双检锁）

使用静态字段保存实例，在调用 instance 方法时进行实例化

并发场景：

1. 双检锁：防止两个线程同时进入 if 判断进行多次实例化
2. volatile：使用 volatile 标记静态字段，禁止指令重排

> 为什么要使用 volatile？
>
> new 操作：分配内存-初始化对象-引用赋值
> 这三步可能会重排，可能先将地址赋值给引用，再初始化对象，导致其他线程第一次检查时虽然不为 null 了，但其实没有对象，引发空指针问题

```java
public class SafeLazyMan {

    private static volatile SafeLazyMan man;

    private SafeLazyMan() {

    }
    
    public static SafeLazyMan instance() {
        if (man == null) { // 第一次检查
            synchronized (SafeLazyMan.class) {
                if (man == null) { // 第二次检查
                    man = new SafeLazyMan();
                }
            }
        }
        return man;
    }
}
```

### 懒汉式（内部类）

使用一个静态内部类的静态属性保存实例，可以在调用 instane 方法时进行实例化，节约系统资源

并发场景：在 JVM 层面保证了多线程访问的安全性

```java
public class SafeLazyManByInner {

    private SafeLazyManByInner() {

    }

    private static final class ManHolder {
        static final SafeLazyManByInner man = new SafeLazyManByInner();
    }

    public static SafeLazyManByInner instance() {
        return ManHolder.man;
    }
}
```

### 枚举式

使用枚举实现单例，是《Effective Java》中推荐的写法

并发场景：线程安全

```java
public enum SingletonByEnum {

    INSTANCE,
    ;

    public static SingletonByEnum getInstance() {
        return INSTANCE;
    }
}
```

## 应用场景

单例模式的类在内存中只有一个实例，减少内存开销；便于控制对类的访问

常见的单例类：

```java
// ServletContext
// ApplicationContext
// 数据库连接池对象
```
