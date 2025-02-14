---

title: Java 文件与 IO 流
date: 2022/6/4
description: 本文介绍 Java 中的文件类和 IO 流，包括 File 的创建、删除、重命名、字节流，以及字符编码的概念和字符流的使用
tag: [Java Core, Java]

---

# Java 文件与 IO 流

## File 类

1. File 类，Java 中用于表示文件或目录的类

   传入路径是文件则表示一个文件，是目录则代表目录

   ```java
   new File(String path)
   ```

2. 创建、删除、重命名文件

   创建文件

   ```java
   // 定义 File 对象
   File file = new File("/home/a.txt");
   // 文件不存在
   if (!file.exists()) {
       File parent = file.getParentFile();
       // 创建目录
       if (!parent.exists() && !parent.mkdirs()) {
           System.out.println("目录创建失败");
           return;
       }
       try {
           if (file.createNewFile()) {
               System.out.println("文件创建成功");
           }
       } catch (IOException e) {
           throw new RuntimeException(e);
       }
   }
   ```
   
   删除文件，如果是非空文件夹，则无法删除

   ```java
   // 立即删除
   file.delete();
   // 虚拟机关闭时删除
   file.deleteOnExit();
   ```
   
   重命名文件

   ```java
   // 需要保证 newFile 的父目录存在
   File newFile = new File("/home/txt/b.txt");
   if (file.renameTo(newFile)) {
       System.out.println("文件重命名成功");
   }
   ```
   
3. File 类常用 API

   ```
   exists()            判断是否存在
   getName()           获取名称
   getPath()           获取路径
   isDirectory()       是否是目录
   isFile()            是否是文件
   createNewFile()     创建新文件
   delete()            删除
   renameTo()          重命名
   mkdir()             创建一层目录
   mkdirs()            创建多层目录
   listFiles()         获取该目录下所有文件的集合
   ```

## 字节流

> 以字节为单位读写数据的流

### 字节输入流

1. 常用的字节输入流

   ```
   ByteArrayInputStream  字节数组输入流
   FileInputStream       文件字节输入流
   FilterInputStream     过滤器字节输入流 
    BufferedInputStream  带缓冲区字节输入流
   PipedInputStream      管道字节输入流
   ```

2. 文件字节输入流

   创建文件输入流

   ```java
   // 指定文件路径
   FileInputStream(String path)
   // 传入 File 对象
   FileInputStream(File file)
   ```

   读取一个字节

   ```java
   File file = new File("/home/a.txt");
   try {
       FileInputStream inputStream = new FileInputStream(file);
       List<Byte> bs = new ArrayList<>();
       int b;
       while ((b = inputStream.read()) != -1) {
           bs.add((byte) b);
       }
       // List<Integer> 转 byte[]
       byte[] bytes = new byte[bs.size()];
       for (int i = 0; i < bs.size(); i++) {
           bytes[i] = bs.get(i);
       }
       // 打印字符串，new String(byte[] bytes)
       System.out.println(new String(bytes));
   } catch (IOException e) {
       throw new RuntimeException(e);
   }
   ```

   > read() 方法返回每次读到的字节，但返回值是 int 类型，是为了将 -1 作为读取结束的标识，并且可以和字节 -1 区分开来，使用 int 的低 8 位来表示 byte
   >
   > 一个负数的二进制表示为反码加一，即补码，如果返回 byte 则无法区分 -1 是标识还是数据

   批量读取字节

   ```java
   FileInputStream inputStream = new FileInputStream(file);
   List<Byte> bs = new ArrayList<>();
   // 创建一个用于接收的临时字节数组
   byte[] buf = new byte[4];
   int len;
   while ((len = inputStream.read(buf)) != -1) {
       // 遍历数组，加入到 Byte List 中保存
       // 防止最后一次读取没有占满 buf，每次按读取的字节数遍历
       for (int i = 0; i < len; i++) {
           bs.add(buf[i]);
       }
   }
   // List<Byte> 转 byte[]
   byte[] bytes = new byte[bs.size()];
   for (int i = 0; i < bs.size(); i++) {
       bytes[i] = bs.get(i);
   }
   System.out.println(new String(bytes));
   ```

   > read(byte[] bytes) 每次读取一个字节数组，返回实际读取的长度

### 字节输出流

1. 常用的字节输出流

   ```
   ByteArrayOutputStream  字节数组输出流
   FileOutputStream       文件字节输出流
   FilterOutputStream     过滤器字节输出流 
    BufferedOutputStream  带缓冲区字节输出流
   PipedOutputStream      管道字节输出流
   ```

2. 文件字节输出流

   创建文件输出流

   ```java
   // 指定文件路径
   FileOutputStream(String path)
   // 传入 File 对象
   FileOutputStream(File file)
   // 传入 append 方式，false = 覆盖，true = 追加
   FileOutputStream(File file, boolean append)
   ```

   > FileOutputStream 默认为覆盖模式
   >
   > 以覆盖模式打开输出流，及时没有写入任何内容，文件也会被清空

   批量写入字节数组

   ```java
   File file = new File("/home/a.txt");
   try {
       FileOutputStream outputStream = new FileOutputStream(file);
       String str = "123我😂";
       outputStream.write(str.getBytes());
   } catch (IOException e) {
       throw new RuntimeException(e);
   }
   ```

3. flush 方法

   部分 Outputstream 子类实现了缓存机制，如 BufferedOutputStream，为了提高效率可能先会缓存数据等待一起发，flush 的作用是强制将缓存中的数据发出去

   也有些 Outputstream 子类在 close 方法中调用了 flush 方法，如 FileOutputStream、FilterOutputStrea

4. 复制文件

   ```java
   File file = new File("/home/a.txt");
   File file2 = new File("/home/b.txt");
   try {
       FileInputStream inputStream = new FileInputStream(file);
       FileOutputStream outputStream = new FileOutputStream(file2);
       byte[] buf = new byte[1024];
       int len;
       // 边读边写
       while ((len = inputStream.read(buf)) != -1) {
           outputStream.write(buf, 0, len);
       }
   } catch (IOException e) {
       throw new RuntimeException(e);
   }
   ```

## 字符流

### 字符编码

1. 为什么需要字符编码？

   计算机只能存储二进制数字，所以每种字符都需要使用二进制表示，才能在计算机中存储

   而字符和二进制的映射关系称为编码

   >编码的本质：
   >
   >将一个字符表示为一串二进制数，即字节数组，并且可以完成从字节数组到字符的转换
   >
   >难点在于当一个字符需要多个字节表示时，如何判断字节是否是字符的开始以及字符的字节数

2. 码点

   在一定的编码规则下，一个码点映射一个字符

3. 常见的字符编码

   ASCII，128 个字符，32 不可打印字符，10 数字，26 大小字母，26 小写字母，34 标点符号

   GB2312，中国发布的中文字符集，总字符数 7445

   Unicode，统一码联盟提出，被称为万国码

### Unicode

1. Unicode 字符集

   Unicode 13.0 版本中已经收录了 14 个个字符

   Unicode 编码以 U+ 开头，汉字区间 4E00-9FFF，第一个汉字是 ‘一’，U+4E00

   Unicode 只负责对字符进行编码，该编码具体如何存储为二进制，由编码方案决定

   常见的 Unicode 编码方案有 UTF8、UTF16、UTF32

2. UTF16

   Java 语言内部存储字符串使用了 UTF16 编码，该编码方案使用两个或四个字节表示字符

   Java 中一个 char 占两个字节，是一个代码单元，Unicode 编码表中靠后的字符需要两个 char，即两个代码单元，四个字节。需要两个字节表示的字符称为基本字符，范围是 U+0000 到 U+FFFF，需要四个字节表示的字符称为辅助字符，范围是 U+10000 到 U+10FFFF

   辅助字符，如 emoji 表情符号，是不可以赋值给 char 的，只能使用 String 来存放，String 底层会使用两个 char 去存放

   ![image-20220606215844799](https://pic-bed.cadeli.top/2022/06/06/20220606215851048.png)

   如何正确获取字符串的字符数？

   ```java
   // String s = ...
   // 字符数，码点数
   int num = s.codePointCount(0, s.length());
   // 码点数组
   int[] points = s.codePoints().toArray();
   ```

   如何判断辅助字符？

   ```java
   // 判断码点是不是辅助字符
   Character.isSupplementaryCodePoint(int point);
   // 判断 char 是不是表示辅助字符的一部分
   Character.isSurrogate(char c)
   ```

   > Java 9 String 底层使用 byte 数组代替 char 数组
   >
   > 在纯拉丁字母的字符串使用 latin1 字符集来表示，latin1 每个字符使用一个字节，更加节约空间
   >
   > String 增加了一个新的 coder 字段来标识编码方式，复杂字符串依然使用 UTF16 编码

3. UTF8

   UTF8 中英文占 1 字节，拉丁文占 2 字节，中文占 3 字节，其他象形文字占 4 字节

   UTF8 编码特点

   ```
   在多字节表示的字符中，第一个字节有多少个连续的 1，就代表有多少个字节
   在多字节表示的字符中，除了第一个字节外，其余字节都以 10 开头
   
   例如，汉字‘一’的编码方式：
          Unicode 码 U+4E00，转二进制  01001110 00000000
          UTF-8 编码的二进制：111-00100 10-111000 10-000000	
   ```

   根据 UTF8 编码的特点，遍历一个字节数组，读到每一个字节都可以根据规则找到属于该字符的所有字节，那么就可以完成字节数组到字符的转换

   > UTF-8 对不同字符使用了不同数量的字节去存储，相比 UTF16 更加节约空间，但是 Java 为什么不使用 UTF8 作为内置编码呢？
   >
   > 因为 UTF8 分了多种情况编码，在随机访问时处理逻辑复杂，影响效率

### 字符输入流

1. 常用的字符输入流

   ```
   CharArrayReader      字符数组输入流
   InputStreamReader    字节输入流转字符输入流
    FileReader          文件字符输入流
   FilterReader         过滤器字符输入流 
    BufferedReader      带缓冲区字符输入流
   PipedReader          管道字符输入流
   ```

2. 文件字符输入流

   创建文件输入流

   ```java
   // 指定文件路径
   FileReader(String path)
   // 传入 File 对象
   FileReader(File file)
   // JDK 11 支持传入字符集编码方式
   // 指定文件路径、编码
   FileReader(String path, Charset charset)
   // 传入 File 对象、编码
   FileReader(File file, Charset charset)
   // JDK 8 可以使用 InputStreamReader 指定字符集编码方式
   InputStreamReader(InputStream inputStream, Charset charset);
   ```

   读取一个字节

   ```java
   File file = new File("/home/a.txt");
   try {
       FileReader reader = new FileReader(file);
       List<Character> bs = new ArrayList<>();
     	// read 返回 -1 表示结束
       int b;
       while ((b = reader.read()) != -1) {
           bs.add((char) b);
       }
       // List<Character> 转 char[]
       char[] chars = new char[bs.size()];
       for (int i = 0; i < bs.size(); i++) {
           chars[i] = bs.get(i);
       }
       // 打印字符串，char[] chars
       System.out.println(new String(chars));
   } catch (IOException e) {
       throw new RuntimeException(e);
   }
   ```

   也可以使用 read(char cbuf[], int off, int len) 系列方法来一次读取多个字符

### 字符输出流

1. 常用的字符输出流

   ```
   CharArrayWriter      字符数组输出流
   OutputStreamWriter   字节输出流转字符输出流
    FileWriter          文件字符输出流
   FilterWriter         过滤器字符输出流
    BufferedWriter      带缓冲区字符输出流
   PipedWriter          管道字符输出流
   PrintWriter          打印输出流
   ```

2. 文件字符输出流

   创建字符输出流

   ```java
   // 指定文件路径
   FileWriter(String path)
   // 传入 File 对象
   FileWriter(File file)
   // JDK 11 支持传入字符集编码方式
   // 指定文件路径、编码
   FileWriter(String path, Charset charset)
   // 传入 File 对象、编码
   FileWriter(File file, Charset charset)
   // JDK 8 可以使用 OutputStreamWriter 指定字符集编码方式
   OutputStreamWriter(OutputStream OutputStream, Charset charset);
   ```

   写入一个字符串

   ```java
   File file = new File("/home/a.txt");
   try {
       FileWriter writer = new FileWriter(file);
       writer.write("你好");
       writer.flush();
   } catch (IOException e) {
       throw new RuntimeException(e);
   }
   // 可以不写 flush 方法，因为 OutputStreamWriter 关闭时会完成 flush 操作
   ```

   也可以使用 write(char cbuf[], int off, int len) 系列方法来一次写入多个字符
