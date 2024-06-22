---

title: Java 并发-使用 CompletionService
date: 2022/4/12
description: 本文介绍 Java 并发编程中的 CompletionService 的使用，包括它的使用场景，如地点信息采集系统、询价系统等，以及 CompletionService 的 API 和使用示例
tag: [并发编程, Java]

---

# Java 并发-使用 CompletionService

## 背景介绍

1. 在日常开发中，我们可能会遇到多个异步调用，如何让先返回的结果先被处理的问题

2. 举例：地点信息采集系统

   比如开发一个地点信息采集系统，从多个地图 API 进行查询，然后将查询结果入库

   ```java
   ExecutorService executor = Executors.newFixedThreadPool(3);
   // 从百度地图查询
   Future<String> query1 = executor.submit(() -> queryFromBd());
   // 从高度地图查询
   Future<String> query2 = executor.submit(() -> queryFromGd());
   // 获取结果，入库
   String res1 = query1.get();
   executor.execute(() -> save(res1));
   String res2 = query2.get();
   executor.execute(() -> save(res2));
   ```

   这样做的弊端是，如果 query1 的耗时很久，即便 query2 很快，也无法让它的结果先被处理

   可以引入阻塞队列，进行优化

   ```java
   ExecutorService executor = Executors.newFixedThreadPool(3);
   // 从百度地图查询
   Future<String> query1 = executor.submit(() -> queryFromBd());
   // 从高度地图查询
   Future<String> query2 = executor.submit(() -> queryFromGd());
   // 阻塞队列
   BlockingQueue<String> queue = new LinkedBlockingQueue<>();
   // 异步入队列
   executor.execute(() -> queue.put(query1.get()));
   executor.execute(() -> queue.put(query2.get()));
   // 循环两次
   for (int i = 0; i < 2; i++) {
       String res = queue.take();
       executor.execute(() -> save(res));
   }
   ```

   利用阻塞队列，异步执行 get 并将结果存入阻塞队列，从阻塞队列循环取结果并进行处理，保证了 get 先执行完的结果先被处理

## CompletionService

1. 对于类似于“地点信息采集系统”、“询价系统”的需求，阻塞队列是值得考虑的优化方案，但大多数情况时，我们并不需要自己进行如此繁杂的处理，因为 JDK 提供了设计精良的 API，CompletionService

2. CompletionService 原理

   CompletionService 也是内部维护了一个阻塞队列，当任务执行结束时把执行结果加入阻塞队列

   需要注意的是，CompletionService 是把任务执行结果的 Future 对象加入到阻塞队列中，而不是结果本身

3. CompletionService API

   CompletionService 接口的实现类是 ExecutorCompletionService，它有两个构造方法

   ```java
   // 需要传入一个线程池
   ExecutorCompletionService(Executor executor)
   // 不指定 completionQueue，默认会使用无界的 LinkedBlockingQueue
   ExecutorCompletionService(Executor executor, BlockingQueue> completionQueue)
   ```

4. 使用 CompletionService 优化上述代码

   ```java
   ExecutorService executor = Executors.newFixedThreadPool(3);
   ExecutorCompletionService<String> cs = new ExecutorCompletionService<>(executor);
   cs.submit(() -> queryFromBd());
   cs.submit(() -> queryFromGd());
   for (int i = 0; i < 2; i++) {
       String res = cs.take().get();
       executor.execute(() -> save(res));
   }
   ```

   
