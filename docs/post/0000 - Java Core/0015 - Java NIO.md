---

title: Java NIO
date: 2022/8/12
description: 本文介绍 Java 中 NIO 包的基本使用，如 NIO 的含义，Path 和 Files 工具类，Buffer、Channel、Selector 三件套，以及文件目录监视器的使用等
tag: [Java Core, Java]

---

# Java NIO

## NIO 的含义

1. 在 Java 编程世界中 NIO 有两中含义，一是 new IO，二是 non-blocking IO

2. new IO

   nio 是 Java 1.4 引入的新的 IO 包，用来代替传统的 IO API，旨在提供更好的 IO 性能

3. non-blocking IO

   非阻塞式的同步 IO，相对于 BIO，用来代替阻塞式的 IO API，能提高应用软件的 IO 处理效率

   Java nio 包提供了 non-blocking IO 的实现

   常说的 NIO 就是指 non-blocking IO

4. IO 操作

   操作系统内存分为用户态和内核态，用户程序只能在自身内存中进行访问，许多危险操作如读写磁盘等需要较高的系统权限，都需要通过内核完成

   应用程序实现一次 IO 操作，包含向内核发起 IO 调用和内核执行 IO 处理两个阶段

   其中内核执行 IO 操作包含两个过程：

   - 从 IO 设备拷贝数据到内核缓冲区
   - 从内核缓冲区拷贝数据到用户缓冲区

## NIO 的演进

1. BIO 的痛点

   BIO 是阻塞式 IO，在内核从 IO 设备拷贝数据到内核缓冲区这段时间内需要一直等待

   特别是在网络编程中，BIO 的 socket 在建立连接时和读数据时，如果没有连接或者没有数据，都会阻塞

   这就导致如果需要同时处理多个连接，就必须开多个线程。对资源的耗费极大，并且效率不高

   ```java
   // BIO Server 示例
   ServerSocket serverSocket = new ServerSocket(8080);
   // 没有连接则阻塞
   Socket request = serverSocket.accept();
   try {
       InputStream inputStream = request.getInputStream();
       BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
       String msg;
       // 没有数据则阻塞
       while ((msg = reader.readLine()) != null) {
           // 处理数据
       }
   } catch (IOException e) {
       //
   } finally {
       //
   }
   ```

2. NIO 带来了什么

   NIO 在 IO 设备准备数据的过程中，不需要等待，直接返回一个结果来通知程序

   在 NIO 网络编程中，等待连接建立和读数据都不是阻塞的，这样就可以使用一个线程循环来管理多个连接

3. NIO 的原理

   NIO 并不是 Java 语言自身实现的一种机制，而是操作系统内核不断的升级迭代，提供的功能支持

   例如在 Linux 系统上提供的 fcntl 函数，可以将传统的阻塞式 IO 设置为直接返回结果的非阻塞式

   NIO 以及多路复用技术都属于操作系统演进的结果，是底层设施发展带来的红利

4. IO 多路复用

   以 NIO 网络编程为例，尽管可以实现单线程管理多个连接，但通过遍历每一个连接的方式效率不高

   随着操作系统的发展，提供了多路复用器相关的函数，如 Linux 系统上的 select、poll、epoll

   这些函数可以帮助 NIO 程序管理多个连接，向程序返回哪些连接有数据可读，极大的提高了 IO 效率

## NIO 工具类

### Path 路径工具

1. Path 是 Java 中对路径的抽象

2. 创建 Path 的方法

   ```java
   // 完整路径
   Path path = Paths.get("D:/a.txt");
   // 多级路径分开写
   Path path1 = Paths.get("D:/", "a.txt");
   ```

3. Path 常用方法

   ```
   toFile()                   转为 File
   getParent()                获取父路径
   getFileName()              文件名称
   compareTo(Path path)       比较路径相同
   startsWith(String str)     是否以字符串开头
   endsWith(String str)       是否以字符串结尾
   resolve(Path path)         拼接路径
   resolveSibling(Path path)  替换路径最后一项
   ```

### Files 文件工具

1. Files 封装了许多操作文件的静态方法

2. 读文件

   读取字节数组

   ```java
   Path path = Paths.get("D:/a.txt");
   byte[] bytes = Files.readAllBytes(path);
   String str = new String(bytes, StandardCharsets.UTF_8);
   ```

   读取字符串

   ```java
   // 读取所有行
   List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);
   ```

3. 写文件

   ```java
   Path path = Paths.get("D:/a.txt");
   String str = "测试文本";
   byte[] bytes = str.getBytes(StandardCharsets.UTF_8);
   Files.write(path, bytes, StandardOpenOption.CREATE);
   ```

4. 复制文件

   ```java
   Path originPath = Paths.get("D:/a.txt");
   Path targetPath = Paths.get("D:/b.txt");
   Files.copy(originPath, targetPath, StandardCopyOption.REPLACE_EXISTING);
   ```

   指定 CopyOption，如 REPLACE_EXISTING，表示替换已存在的文件

### 文件打开选项

1. StandardOpenOption 用来描述一个文件的打开选项

2. 常用的选项

   ```
   READ                可读
   WRITE               可写
   TRUNCATE_EXISTING   存在就清空
   CREATE              不存在就创建
   CREATE_NEW          存在就报错
   DELETE_ON_CLOSE     关闭时删除
   SYNC                同步更新文件内容和元信息
   DSYNC               同步更新文件内容
   ```

## NIO Buffer

1. Buffer 即缓冲区，是内存的一部分，用来平衡磁盘和程序之间速度差异

2. Buffer 是 NIO 操作的核心，本质上 NIO 的操作就是对缓冲区的操作

3. 常见的 Buffer

   ```
   ByteBuffer         字节缓冲区
   MappedByteBuffer   直接内存缓冲区
   ```

4. ByteBuffer 缓冲区的属性

   ```
   capacity 缓冲区大小
   limit    最多存多少元素
   position 已经存了多少元素
   mark     标记
   ```

5. 创建 ByteBuffer

   ```java
   // 创建 1025 byte 的缓冲区
   ByteBuffer byteBuf = ByteBuffer.allocate(1024);
   ```

5. 向 ByteBuffer 写数据

   ```java
   String str = "测试文本";
   byte[] bytes = str.getBytes(StandardCharsets.UTF_8);
   byteBuf.put(bytes);
   ```

6. 从 ByteBuffer 读数据

   ```java
   // 读取一个 byte
   byteBuf.get();
   
   // 读取到字节数组中
   byte[] temp = new byte[1024];
   // 读取 temp 长度的字节
   byteBuf.get(temp);
   // 读取 0 到缓冲区数据总长度的字节
   byteBuf.get(temp, 0, byteBuf.remaining());
   ```

   remaining() 返回缓冲区数据的长度

   hasReamining() 返回缓冲区是否还有数据

7. 写操作和读操作的切换

   ByteBuffer 写入数据时，position 指针后移，读数据时会从头开始，读取到 limit 结束，所以写完后读数据需要重置 position 的位置

   重置 position 的位置有两个方法

   - flip 方法

     将 limit 置为 positon， position 置为 0，适合读写当前写入位置之前的数据

   - rewind 方法

     将 position 置为 0，不改变 limit 的值，可能会读到多余数据

8. 打标记

   在写入数据的过程调用 mark 方法可以在当前 postion 打一个标记，通过 reset 方法可以回退到标记处

   flip 和 rewind 方法都会清空 mark

9. 压缩缓冲区

   当从缓冲区中读取了部分元素，还有部分没有读时，调用 compact 方法可以将剩余元素移到开始位置，以便可以写入更多数据

   compact 方法参数的操作如下：

   ```
   1. 剩余数据移动到开始位置
   2. postion 设置为剩余元素个数
   3. limit 设置为 capacity
   3. 清空 mark
   ```

## NIO Channel

### Channel 介绍

1. Channel，通道，用来在缓冲区和 IO 设备之间拷贝数据

2. Channel 接口

   接口方法

   ```
   isOpen() 通道是否打开
   close()  关闭通道
   ```

   需要注意：已经关闭的通道无法再次打开

3. 常见的 Channel 实现

   ```
   FileChannel         文件通道
   ServerSocketChannel 服务端套接字通道
   SocketChannel       TCP 通道
   DatagramChannel     UPD 通道
   ```

### FileChannel

1. FileChannel，文件通道，用来操作文件

2. 创建 FileChannel

   ```java
   // 方式一，通过 IO 流
   FileInputStream fileInputStream = new FileInputStream(filePath);
   FileChannel readChannel = fileInputStream.getChannel();
   FileOutputStream fileOutputStream = new FileOutputStream(filePath2);
   FileChannel writeChannel = fileOutputStream.getChannel();
   // 输入流的 channel 只能读，输出流的 channel 只能写
   
   // 方式二，open 方法
   Path path = Paths.get(filePath);
   FileChannel fileChannel = FileChannel.open(path, StandardOpenOption.CREATE,
                                              StandardOpenOption.READ, 
                                              StandardOpenOption.WRITE);
   ```

3. 读数据

   ```java
   Path path = Paths.get(filePath);
   // 创建读 channel
   FileChannel fileChannel = FileChannel.open(path, StandardOpenOption.READ);
   // 创建缓冲区
   ByteBuffer buffer = ByteBuffer.allocate(1024);
   // 读数据填充缓冲区
   while (fileChannel.read(buffer) >= 0) {
       // 缓冲区满了如果数据还没读完会返回 0，造成死循环
   }
   // 翻转缓冲区
   buffer.flip();
   // 从缓冲区取出数据
   byte[] bytes = new byte[buffer.remaining()];
   buffer.get(bytes);
   System.out.println(new String(bytes, StandardCharsets.UTF_8));
   // 关闭 channel
   fileChannel.close();
   ```

   > FileChannel read 方法返回读取的字节数
   >
   > 返回 -1 表示到达文件结尾，没有更多数据可读
   >
   > 返回 0 表示 buffer 已满，没有读到数据

4. 写数据

   ```java
   Path path = Paths.get(filePath);
   // 创建读 channel，指定 StandardOpenOption
   FileChannel fileChannel = FileChannel.open(path, StandardOpenOption.CREATE,
                                              StandardOpenOption.WRITE,
                                              StandardOpenOption.READ);
   String msg = "你好，世界！";
   // 存入缓冲区
   ByteBuffer buffer = ByteBuffer.allocate(1024);
   buffer.put(msg.getBytes(StandardCharsets.UTF_8));
   // 翻转
   buffer.flip();
   fileChannel.write(buffer);
   // 关闭 channel
   fileChannel.close();
   ```

   > 可以直接使用 ByteBuffer.wrap(msg.getBytes()) 来包装字节数组为一个 Buffer

5. 复制数据

   ```java
   String filePath = "D:/a.txt";
   String filePath2 = "D:/b.txt";
   // 创建文件通道
   FileChannel in = FileChannel.open(Paths.get(filePath), StandardOpenOption.READ);
   FileChannel out = FileChannel.open(Paths.get(filePath2), StandardOpenOption.CREATE, StandardOpenOption.WRITE);
   // 创建缓冲区
   ByteBuffer buffer = ByteBuffer.allocate(1024);
   // 循环读取字节
   while (in.read(buffer) >= 0 ||  buffer.position() != 0) {
       // 翻转缓冲区
       buffer.flip();
       // 写数据
       out.write(buffer);
       // 压缩缓冲区
       buffer.compact();
   }
   // 关闭通道
   in.close();
   out.close();
   ```
   


### ServerSocketChannel

1. ServerSocketChannel，服务端套接字通道，用来创建 TCP 通信服务端

2. 创建 ServerSocketChannel

   ```java
   ServerSocketChannel serverChannel = ServerSocketChannel.open();
   ```

3. ServerSocketChannel 示例

   ```java
   public static void start() {
       // 创建客户端套接字通道
       ServerSocketChannel serverChannel = ServerSocketChannel.open();
       // 绑定监听端口号
       serverChannel.bind(new InetSocketAddress(9999));
       // 等待客户端连接，阻塞
       SocketChannel clientChannel = serverChannel.accept();
       // 创建缓冲区
       ByteBuffer buffer = ByteBuffer.allocate(1024);
       // 读取客户端消息
       int len = clientChannel.read(buffer);
       // 打印客户端消息
       System.out.println(new String(buffer.array(), 0, len, StandardCharsets.UTF_8));
       // 向客户端返回消息
       String msg = "Hello client!";
       clientChannel.write(ByteBuffer.wrap(msg.getBytes(StandardCharsets.UTF_8)));
       // 关闭通道
       serverChannel.close();
       clientChannel.close();
   }
   ```

### SocketChannel

1. SocketChannel，客户端的 TCP 通信通道

2. 创建 SocketChannel

   ```java
   SocketChannel clientChannel = SocketChannel.open();
   ```

3. SocketChannel 示例

   ```java
   public static void start() {
       // 创建客户端通道
       SocketChannel clientChannel = SocketChannel.open();
       // 连接服务端
       boolean connected = clientChannel.connect(new InetSocketAddress("127.0.0.1", 9999));
       if (!connected) {
           System.out.println("连接失败");
           return;
       }
       // 向服务端发送消息
       String msg = "Hello server!";
       clientChannel.write(ByteBuffer.wrap(msg.getBytes(StandardCharsets.UTF_8)));
       // 读取服务端消息
       ByteBuffer buffer = ByteBuffer.allocate(1024);
       int len = clientChannel.read(buffer);
       // 打印服务端消息
       System.out.println(new String(buffer.array(), 0, len, StandardCharsets.UTF_8));
       // 关闭连接
       clientChannel.close();
   }
   ```

## NIO Selector

### Selector 介绍

1. Selector，多路复用器，用来实现 IO 的多路复用

2. 为什么需要 Selector？

   accept 方法等待连接时会阻塞，read 方法没有数据时也会阻塞，处理多个连接只能开多个线程，有资源耗尽的风险

   NIO SocketChannel 和 ServerSocketChannel 相比于 BIO，可以设置为非阻塞，即 accept 和 read 方法都不阻塞，这样可通过一直循环，单线程也可管理多个连接

   但是这种基于遍历的连接管理性能不高，需要一个更好的方式来集中管理连接，这时候就需要多路复用器

3. Selector 的原理

   将 Channel 设置为非阻塞后，注册到 Selector 上，指定要监听的事件，如连接事件，可读事件等，每次从 Selector 获取需要响应的事件进行处理

   Selector 在 Linux 系统上有几种实现方式，如 select 函数，poll 函数，epoll 机制等

   向 select 和 poll 函数传入连接，会返回需要处理的连接，本质上基于遍历实现的，性能一般

   epoll 机制含有几个函数，如 epoll_create 用来创建监听器，epoll_ctl 用来注册事件，epoll_wait 用来获取需要处理的事件等

### 使用 Selector

1. 创建 Selector

   ```java
   Selector selector = Selector.open();
   ```

2. 注册到 Channel 到 Selector

   不是所有 Channel 都能使用 Selector，只有 SelectableChannel 的子类才可以

   ```java
   // 创建客户端套接字通道
   ServerSocketChannel serverChannel = ServerSocketChannel.open();
   // 绑定监听端口号
   serverChannel.bind(new InetSocketAddress(9999));
   // 设置为非阻塞
   serverChannel.configureBlocking(false);
   // 创建 Selector
   Selector selector = Selector.open();
   // 注册到 Selector
   serverChannel.register(selector, SelectionKey.OP_ACCEPT);
   ```

   register 方法可以指定要监听的事件，有四种

   ```
   SelectionKey.OP_ACCEPT
   SelectionKey.OP_CONNECT
   SelectionKey.OP_READ
   SelectionKey.OP_WRITE
   ```

   同时监听多个事件可以使用或运算

   ```java
   serverChannel.register(selector, SelectionKey.OP_ACCEPT | SelectionKey.OP_READ);
   ```

3. 从 Selector 获取要处理的事件

   ```
   select()     阻塞等待有事件发生
   selectKeys() 返回需要处理的事件
   keys()		 返回注册的所有事件
   ```

   selectKeys 方法返回 SelectionKey 的集合

   SelectionKey 有几个方法用于判断事件类型

   ```
   isAcceptable()   是否准备好连接
   isReadable()     是否可读数据
   isConnectable()  是否完成或未完成连接
   isWritable()     是否可写数据
   ```

   一般服务端关注 isAcceptable，客户端关注 isConnectable 等

### Socket 通信完整示例

1. 服务端

   ```java
   public class NIOServer {
   
       public static void main(String[] args) {
           startWithSelector();
       }
   
       @SneakyThrows
       public static void startWithSelector() {
           // 创建服务端套字节通道
           @Cleanup ServerSocketChannel server = ServerSocketChannel.open();
           // 绑定端口
           server.bind(new InetSocketAddress(9999));
           // 服务端配置为非阻塞模式
           server.configureBlocking(false);
           // 创建通道选择器
           @Cleanup Selector selector = Selector.open();
           // 服务端注册到 Selector 监听 OP_ACCEPT
           server.register(selector, SelectionKey.OP_ACCEPT);
           // Selector 阻塞等待事件
           while (selector.select() > 0) {
               // 遍历准备好的事件
               Set<SelectionKey> selectionKeys = selector.selectedKeys();
               Iterator<SelectionKey> iterator = selectionKeys.iterator();
               while (iterator.hasNext()) {
                   SelectionKey selectionKey = iterator.next();
                   // 当有客户端连接时
                   if (selectionKey.isAcceptable()) {
                       acceptHandler(server, selector);
                   }
                   // 当有客户端需要读取数据时
                   if (selectionKey.isReadable()) {
                       readHandler(selectionKey);
                   }
                   // 移除已处理的 key
                   iterator.remove();
               }
           }
       }
   
       private static void acceptHandler(ServerSocketChannel server, 
                                         Selector selector) throws IOException {
           // 获取客户端
           SocketChannel client = server.accept();
           // 客户端配置为非阻塞模式
           client.configureBlocking(false);
           // 客户端注册到 Selector 监听 OP_READ
           client.register(selector, SelectionKey.OP_READ);
           // 向客户端传输信息
           String message = "Hello client!";
           client.write(ByteBuffer.wrap(message.getBytes()));
       }
   
       private static void readHandler(SelectionKey selectionKey) throws IOException {
           // 获取客户端
           SocketChannel client = (SocketChannel) selectionKey.channel();
           // 创建缓冲区
           ByteBuffer buffer = ByteBuffer.allocate(1024);
           // 读取客户端信息
           int length = client.read(buffer);
           // 打印客消息
           System.out.println(new String(buffer.array(), 0, length));
       }
   }
   ```

2. 客户端

   ```java
   public class NIOClient {
   
       public static void main(String[] args) {
           startWithSelector();
       }
   
       @SneakyThrows
       public static void startWithSelector() {
           // 创建客户端
           @Cleanup SocketChannel client = SocketChannel.open();
           // 采用非阻塞模式
           client.configureBlocking(false);
           // 连接服务端
           client.connect(new InetSocketAddress("127.0.0.1", 9999));
           // 创建通道选择器
           @Cleanup Selector selector = Selector.open();
           // 注册到 Selector 监听 OP_CONNECT
           client.register(selector, SelectionKey.OP_CONNECT);
           // Selector 阻塞等待事件
           while (selector.select() > 0) {
               // 遍历准备好的事件
               Set<SelectionKey> selectionKeys = selector.selectedKeys();
               Iterator<SelectionKey> iterator = selectionKeys.iterator();
               while (iterator.hasNext()) {
                   SelectionKey selectionKey = iterator.next();
                   // 当连接服务端成功时
                   if (selectionKey.isConnectable()) {
                       connectHandler(selector, selectionKey);
                   }
                   // 当有数据可读时
                   if (selectionKey.isReadable()) {
                       readHandler(selectionKey);
                   }
                   // 移除已处理的 key
                   iterator.remove();
               }
           }
       }
   
       private static void connectHandler(Selector selector, 
                                          SelectionKey selectionKey) throws IOException {
           // 获取通道
           SocketChannel server = (SocketChannel) selectionKey.channel();
           // 检测连接是否完成，当连接未完成时
           if (server.isConnectionPending()) {
               // 继续完成连接，调用该方法时会阻塞，直到完成连接或连接失败
               server.finishConnect();
           }
           // 配置为非阻塞模式
           server.configureBlocking(false);
           // 注册到 Selector 监听 OP_READ
           server.register(selector, SelectionKey.OP_READ);
           // 连接成功后，向服务端发送数据
           String message = "Hello server!";
           server.write(ByteBuffer.wrap(message.getBytes()));
       }
   
       private static void readHandler(SelectionKey selectionKey) throws IOException {
           // 获取服务端
           SocketChannel server = (SocketChannel) selectionKey.channel();
           // 创建缓冲区
           ByteBuffer buffer = ByteBuffer.allocate(1024);
           // 读取服务端信息
           int length = server.read(buffer);
           // 打印消息
           System.out.println(new String(buffer.array(), 0, length));
       }
   }
   ```

## 文件目录监听器

1. WatchService 是 NIO 包提供的用于监听文件目录的工具类

2. 创建 WatchService 

   ```java
   WatchService watcher = FileSystems.getDefault().newWatchService();
   // 要监视的目录
   Path path = Paths.get("D:/c/");
   // 注册要监听的事件到监视器
   WatchKey watchKey = path.register(watcher,
                                     StandardWatchEventKinds.ENTRY_CREATE,
                                     StandardWatchEventKinds.ENTRY_DELETE,
                                     StandardWatchEventKinds.ENTRY_MODIFY);
   ```

   获取事件通知

   ```java
   // 阻塞获取事件
   WatchKey key = watcher.take();
   // 循环处理事件
   for (WatchEvent<?> event : key.pollEvents()) {
      // ...
   }
   ```

3. 监视器示例

   ```java
   Path path = Paths.get("D:/c/");
   @Cleanup WatchService watcher = FileSystems.getDefault().newWatchService();
   WatchKey watchKey = path.register(watcher,
                                     StandardWatchEventKinds.ENTRY_CREATE,
                                     StandardWatchEventKinds.ENTRY_DELETE,
                                     StandardWatchEventKinds.ENTRY_MODIFY);
   while (true) {
       WatchKey key = watcher.take();
       for (WatchEvent<?> event : key.pollEvents()) {
           // 根据事件类型处理
           switch (event.kind().name()) {
               case "ENTRY_CREATE":
                   System.out.println("创建：" + event.context());
                   break;
               case "ENTRY_DELETE":
                   System.out.println("删除：" + event.context());
                   break;
               case "ENTRY_MODIFY":
                   System.out.println("修改：" + event.context());
                   break;
           }
       }
       // 重置监视对象
       boolean valid = key.reset();
       // 当监视对象失效时（如监控文件夹被删除）
       if (!valid) {
           // 移除监视对象
           watchKey.cancel();
       }
   }
   ```
