---

title: Java 值传递与对象拷贝
date: 2020/2/17
description: Java 中的参数传递方式以及对象拷贝的相关方法
tag: Java
pined: 2

---



# Java 值传递与对象拷贝

## 值传递和引用传递

调用一个有参函数的时候，会把实际参数传递给形式参数。但是，在程序语言中，这个传递过程中传递的两种情况，即值传递和引用传递

### 两者区别

1. 值传递（pass by value）是指在调用函数时将实际参数复制一份传递到函数中，这样在函数中如果对参数进行修改，将不会影响到实际参数
2. 引用传递（pass by reference）是指在调用函数时将实际参数的地址直接传递到函数中，那么在函数中对参数所进行的修改，将影响到实际参数

### java中的值传递

1. java中只存在值传递，不存在引用传递

2. 对于基本数据类型

   ```java
   public class ParamTest
   {
   	public static void main(String[] args) 
       {
          ParamTest pt = new ParamTest();
          int i = 10;
          pt.pass(i);
          System.out.println("print in main , i is " + i);
       }
   
       public void pass(int j) 
       {
          j = 20;
          System.out.println("print in pass , j is " + j);
       }
   }
   /*
   	输出
   	print in pass , j is 20
       print in main , i is 10
   */
   ```

   由此可见，对于基本数据类型，是在栈中重新建立一个引用 j，使其值等于传递的参数值 i，改变 j 并不影响 i

3. 对于引用数据类型

   - 示例一

     ```java
     public static void main(String[] args) 
     {
     ParamTest pt = new ParamTest();
        User hello = new User();
     hello.setName("Hello");
        hello.setGender("Male");
     pt.pass(hello);
        System.out.println("print in main , user is " + hello);
     }
     public void pass(User user) 
     {
        user.setName("HelloChange");
        System.out.println("print in pass , user is " + user);
     }
     /*
     	输出
     	print in pass , user is User{name='HelloChange', gender='Male'}
     	print in main , user is User{name='HelloChange', gender='Male'}
     */
     ```
   
     
   
   - 示例二
   
       ```java
       public static void main(String[] args) 
       {
          ParamTest pt = new ParamTest();
          User hello = new User();
          hello.setName("Hello");
          hello.setGender("Male");
          pt.pass(hello);
          System.out.println("print in main , user is " + hello);
       }
       public void pass(User user) 
       {
          user = new User();
          user.setName("HelloChange");
          user.setGender("Male");
          System.out.println("print in pass , user is " + user);
       }
       /*
        输出
        print in pass , user is User{name='HelloChange', gender='Male'}
        print in main , user is User{name='Hello', gender='Male'}
       */
       ```
       
       示例一中，调用 User 类方法改变了内存地址上对象的属性，但这并不是对传入参数本身的改变，实际上传入 hello 之后，在栈中建立 user 引用，且指向地址与 hello 相同，即指向同一对象，对对象的改变并不是对 hello 这个引用的改变，其值一直在栈中指向对象空间地址
       
       示例二中，传入 hello 之后，在栈中建立 user 引用并于 hello 等值，但通过 new 对象，使 user 引用指向了新的对象，即 user 在栈中的值改变了，而 hello 的值一直指向原对象并不受影响

## 对象拷贝

### 含义

有时侯我们需要获得一个新对象，和已经存在的对象完全相同，但又必须相互独立，如果使用简单的赋值方式，实际上指向的还是同一内存地址上的对象，操作一个引用可能会影响另一个，这就需要对象拷贝来获取一个完全相同的新对象

### 5种方式

1. setter/getter

   new 新对象后用 set/get 方法设置属性

2. 浅克隆

   - 被复制的类需要实现Clonenable接口（不实现的话在调用 clone 方法会抛出 CloneNotSupportedException 异常）， 该接口为标记接口(不含任何方法)
   - 覆盖clone() 方法，访问修饰符设为 public。方法中调用 super.clone() 方法得到需要的复制对象

   ```java
   class Address
   {
       private String address;
   
       public String getAddress()
       {
           return address;
       }
       public void setAddress(String address)
       {
           this.address = address;
       }
   }
   class Student implements Cloneable
   {
       private int number;
   
       private Address addr;
   
       public Address getAddr()
       {
           return addr;
       }
   
       public void setAddr(Address addr)
       {
           this.addr = addr;
       }
   
       public int getNumber()
       {
           return number;
       }
   
       public void setNumber(int number)
       {
           this.number = number;
       }
   
       @Override
       public Object clone()
       {
           Student stu = null;
           try
           {
               stu = (Student) super.clone();   //浅复制
           }
           catch (CloneNotSupportedException e)
           {
               e.printStackTrace();
           }
           return stu;
       }
   }
   public class Test
   {
   
       public static void main(String args[])
       {
   
           Address addr = new Address();
           addr.setAddress("杭州市");
           Student stu1 = new Student();
           stu1.setNumber(123);
           stu1.setAddr(addr);
   
           Student stu2 = (Student) stu1.clone();
   
           System.out.println("学生1:" + stu1.getNumber() + ",地址:" + stu1.getAddr().getAddress());
           System.out.println("学生2:" + stu2.getNumber() + ",地址:" + stu2.getAddr().getAddress());
   
           stu2.setNumber(124);
           addr.setAddress("西湖区");
   
           System.out.println("学生1:" + stu1.getNumber() + ",地址:" + stu1.getAddr().getAddress());
           System.out.println("学生2:" + stu2.getNumber() + ",地址:" + stu2.getAddr().getAddress());
       }
   }
   
   /*
   	输出
   	学生1:123,地址:杭州市
   	学生2:123,地址:杭州市
   	学生1:123,地址:西湖区
   	学生2:124,地址:西湖区
   */
   ```

   > 通过浅克隆获得新对象，其基本数据类型成员变量得到了复制，修改后不影响原对象
   >
   > 若变量为引用数据类型，则只复制地址引用，还是指向相同地址，修改时会相互影响
   >
   > 若变量为 String 类型，则拷贝其地址引用。但是在修改时，它会从字符串池中重新生成一个新的字符串，原有字符串对象保持不变 

3. 深克隆

   - 浅复制只是复制了addr 变量的引用，并没有真正的开辟另一块空间，将值复制后再将引用返回给新对象
   - 为了达到真正的复制对象，而不是纯粹引用复制。我们需要将 Address 类可复制化，并且修改 clone 方法，代码如下：

   ```java
   class Address implements Cloneable
   {
       private String address;
   
       public String getAddress()
       {
           return address;
       }
   
       public void setAddress(String address)
       {
           this.address = address;
       }
   
       @Override
       public Object clone()//Address 类可复制化
       {
           Address addr = null;
           try
           {
               addr = (Address) super.clone();
           }
           catch (CloneNotSupportedException e)
           {
               e.printStackTrace();
           }
           return addr;
       }
   }
   class Student implements Cloneable
   {
       private int number;
   
       private Address addr;
   
       public Address getAddr()
       {
           return addr;
       }
       public void setAddr(Address addr)
       {
           this.addr = addr;
       }
       public int getNumber()
       {
           return number;
       }
       public void setNumber(int number)
       {
           this.number = number;
       }
       @Override
       public Object clone()
       {
           Student stu = null;
           try
           {
               stu = (Student) super.clone();   //浅复制
           }
           catch (CloneNotSupportedException e)
           {
               e.printStackTrace();
           }
           stu.addr = (Address) addr.clone();   //引用数据类型变量深复制
           return stu;
       }
   }
   public class Test
   {
   
       public static void main(String args[])
       {
   
           Address addr = new Address();
           addr.setAddress("杭州市");
           Student stu1 = new Student();
           stu1.setNumber(123);
           stu1.setAddr(addr);
   
           Student stu2 = (Student) stu1.clone();
   
           System.out.println("学生1:" + stu1.getNumber() + ",地址:" + stu1.getAddr().getAddress());
           System.out.println("学生2:" + stu2.getNumber() + ",地址:" + stu2.getAddr().getAddress());
   
           stu2.setNumber(124);
           addr.setAddress("西湖区");
   
           System.out.println("学生1:" + stu1.getNumber() + ",地址:" + stu1.getAddr().getAddress());
           System.out.println("学生2:" + stu2.getNumber() + ",地址:" + stu2.getAddr().getAddress());
       }
   }
   /*
   	输出
   	学生1:123,地址:杭州市
   	学生2:123,地址:杭州市
   	学生1:123,地址:西湖区
   	学生2:124,地址:杭州市
   */
   ```

4. 工具类  

    org.apache.commons 组件 BeanUtils 和 PropertyUtils，静态方法 copyProperties(Object o1,Object o2)

5. 序列化  

   序列化就是将对象写到流的过程，写到流中的对象是原有对象的一个拷贝，而原对象仍然存在于内存中。通过序列化实现的拷贝不仅可以复制对象本身，而且可以复制其引用的成员对象，因此通过序列化将对象写到一个流中，再从流里将其读出来，可以实现深克隆。需要注意的是能够实现序列化的对象其类必须实现Serializable接口，否则无法实现序列化操作

   ```java
   class Professor implements Serializable
   {
       String name;
       int age;
       Professor(String name, int age)
       {
           this.name = name;
           this.age = age;
       }
   }
   class Student implements Serializable
   {
       String name;//常量对象
       int age;
       Professor p;//引用数据类型
       Student(String name, int age, Professor p)
       {
           this.name = name;
           this.age = age;
           this.p = p;
       }
       //深克隆
       public Object deepClone() throws IOException, ClassNotFoundException
       {
           //将对象写到流里
           ByteArrayOutputStream bo = new ByteArrayOutputStream();
           ObjectOutputStream oo = new ObjectOutputStream(bo);
           oo.writeObject(this);
           //从流里读出来
           ByteArrayInputStream bi = new ByteArrayInputStream(bo.toByteArray());
           ObjectInputStream oi = new ObjectInputStream(bi);
           return (oi.readObject());
       }
   }
   public class Test
   {
       public static void main(String[] args) throws IOException, ClassNotFoundException
       {
           Professor p = new Professor("wangwu", 50);
           Student s1 = new Student("zhangsan", 18, p);
           Student s2 = (Student) s1.deepClone();
           s2.p.name = "lisi";
           s2.p.age = 30;
           System.out.println("name=" + s1.p.name + "," + "age=" + s1.p.age); 
           //学生1的教授不改变
       }
   }
   ```

   