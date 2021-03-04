---

title: Java 类与对象
date: 2020/2/18
description: Java 数据类型、修饰符、方法、变量、内部类等基础知识
tag: Java

---



# Java 类与对象

## 数据类型

>变量就是申请内存来存储值。也就是说，当创建变量的时候，需要在内存中申请空间
>
>内存管理系统根据变量的类型为变量分配存储空间，分配的空间只能用来储存该类型数据

### 基本数据类型

1. java 中有 8 种基本数据类型，其中 4 个整型、2 个浮点型、字符型、布尔型
2. 每种基本数据类型都有数据范围约束和缺省值

### 引用数据类型

1. 引用类型指向一个对象，指向对象的变量是引用变量
2. 引用变量在声明时被指定为一个特定的类型
3. java 中 String，数组，对象都是引用数据类型
4. 所有的引用类型默认值位 null
5. 一个引用变量可以用来引用任何与之兼容的类型 

### 枚举类型

1. 枚举 enum 是一种特殊的类，使用枚举可以很方便的定义常量

   ```java
   public enum Season {
   	SPRING,SUMMER,AUTUMN,WINTER
   }
   ```

2. 常用的场合就是 switch 语句中，使用枚举来进行判断

   ```java
   public static void main(String[] args) {
       Season season = Season.SPRING;//枚举类名.变量名
       switch (season) {
           case SPRING:
               System.out.println("春天");
               break;
           case SUMMER:
               System.out.println("夏天");
               break;
           case AUTUMN:
               System.out.println("秋天");
               break;
           case WINTER:
               System.out.println("冬天");
               break;
       }
   }
   ```

   

3. 可以使用 foreach 遍历枚举 

   ```java
   public static void main(String[] args) {
       for (Season s : Season.values()) {
           System.out.println(s);
       }
   }
   ```


## 修饰符

### 访问控制

1. public
   - 对所有类可见
   - 使用对象：类、接口、变量、方法 
2. protected
   - 在同一包中，被声明为 protected 的变量、方法和构造器能被同一个包中的任何其他类访问
   - 子类与基类不在同一包中，子类实例可以访问从基类继承而来的 protected 方法，不能使用基类实例访问 protected 方法
   - 使用对象：变量、方法、内部类 
3. 缺省
   - 在同一包内可见，不使用任何修饰符
   - 使用对象：类、接口、变量、方法 
4. private
   - 在同一类内可见
   - 使用对象：变量、方法、内部类

### 其他修饰符

1. final
   - 用来修饰类、方法和变量
   - final 修饰的类不能够被继承
   - 修饰的方法不能被继承类重新定义
   - 修饰的变量为常量，不可通过重新赋值修改。
2. static
   - 用来修饰类方法和类变量 
   - 修饰内部类，称为静态内部类
3. abstract
   - 用来创建抽象类和抽象方法 
   - 接口及其方法默认为 public abstract

## 方法

### 构造方法

1. 作用：构造方法是在对象被创建时初始化对象成员的方法
2. 名称与类名相同，不能有返回值和 void，因为返回值就是该类本身
3. 没有定义构造方法，会默认拥有无参构造，如果定义了构造方法，则不会拥有默认构造方法
4. 在继承中
   - 父类没有定义构造方法或定义了无参数的构造方法，子类不须要定义构造方法
   - 父类只有带参数的构造方法时，子类也不能有无参构造，必须定义带参构造，且要在第一行通过 super 显式调用父类构造方法

### 类方法

1. 类方法，即静态方法，使用 static 声明

2. 独立于对象，属于类，使用类名.方法名来调用

3. 静态方法不能使用类的非静态变量，不能不通过对象直接调用非静态方法

   > 静态方法在类加载被声明，这时对象还未实例化，不能在静态方法中使用实例对象的属性

4. 静态方法不能被继承，子类可以声明同名静态变量，但与父类互不影响，称为隐藏

5. 抽象方法不能是静态的，无论是抽象类还是接口

   > 抽象方法的目的是重写方法，定义成静态方法就不能被重写 
   >
   > 抽象方法没有方法体，所以静态抽象方法没有意义
   >
   > 抽象类可以有静态非抽象方法
   >
   > jdk8 中，接口可以声明静态非抽象方法

### 对象方法

1. 对象方法，即非静态方法
2. 实例化对象后，通过对象名.方法名来调用
3. 非静态方法可以直接调用非静态方法和静态方法
4. 非静态方法中使用 this 表示当前对象

## 变量

> 用来命名一个数据的标识符
>
> 成员变量，是全局变量，也叫字段 

### 类变量

1. 类变量，即静态变量，使用 static 声明
2. 独立于对象，属于类，通过类名.变量名来访问

### 对象变量

1. 对象变量，即非静态变量
2. 实例化对象后，通过对象名.变量名来调用

### 局部变量

1. 局部变量，即临时变量，如方法内部声明的变量、方法的参数
2. 局部变量存放在栈中，方法结束后局部变量占用的内存将被释放 
3. 必须手动赋值初始化，否则报错
4. 局部变量不能使用 static 和访问修饰符

## 内部类

### 非静态内部类

1. 非静态内部类直接定义在外部类里面

2. 非静态内部类，是属于对象的，只有一个外部类对象存在的时候，才有意义 

3. 非静态内部类可以访问外部类的静态成员和非静态成员

4. 创建非静态内部类对象通过`new Outer().new Inner()`或`this.new Inner()`，this 可以省略

   ```java
   public class Outer {
       private int i;
       private static int s;
   
       private void outMethod() {
           new Inner();// 省略了 this
           this.new Inner();
       }
   
       public static void outStaticMethod() {
           new Outer().new Inner();// 外部类实例对象.new 内部类（）
       }
   
       class Inner {
           public void inMethod() {
               outMethod();// 访问外部私有方法
               outStaticMethod();// 访问外部静态方法
               System.out.println(i);// 访问外部静态变量
               System.out.println(s);// 访问外部非静态变量
           }
       }
   }
   ```

### 静态内部类

1.  静态内部类使用 static 修饰
2. 静态内部类是属于类的
4. 静态内部类不可以访问外部类非静态变量和非静态方法
5. 静态内部类可以访问外部类的静态成员
5.  不需要一个外部类的实例为基础，可以直接实例化

### 匿名内部类

1. 通常情况下，要使用一个接口或者抽象类，必须创建一个子类

2. 为了快速使用，直接实例化一个抽象类，并实现其抽象方法，这个类没有命名，称为匿名内部类

   ```java
   public class Outer {
       public static void main(String[] args) {
           int a = 0;
           new Inner() {
               @Override
               public void inMethod() {
                   // overwrite
                   System.out.println(a);
               }
           };
       }
   }
   abstract class Inner {
       public abstract void inMethod();
   }
   ```

3. 匿名内部类可以方便的访问局部变量，局部变量要声明成 final，jdk8 中如果省略会自动隐式声明为 final

   > 声明成 final，则匿名内部类中不能再对局部变量赋值
   >
   > 被内部类访问的局部变量会被拷贝一份到内部类中，若局部变量不是 final 的，其值可以被修改，就会出现数据不同步的问题

### 本地类

1. 内部类必须声明在成员的位置，即与属性和方法平等的位置

2. 本地类和匿名类一样，直接声明在代码块里面，可以是主方法，for 循环里等等地方

3. 与匿名类的区别在于，本地类有了自定义的类名

   ```java
   public class Outer {
       public static void main(String[] args) {
           class Test extends Inner {
               @Override
               public void inMethod() {
                   // overwrite
               }
           }
       }
   }
   abstract class Inner {
       public abstract void inMethod();
   }
   ```

   

