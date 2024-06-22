---

title: Java 并发-使用 CompletableFuture
date: 2022/1/24
description: 本文介绍 Java 并发编程中的 CompletableFuture，如 CompletableFuture 的背景介绍、CompletableFuture 的创建、获取结果、编排执行顺序、配置线程池
tag: [并发编程, Java]

---

# Java 并发-使用 CompletableFuture

## 背景介绍

1. 使用多线程异步执行任务，如何根据执行结果正确编排执行顺序是非常重要的

2. 使用 FutureTask 获取执行结果

   ```java
   FutureTask<String> task = new FutureTask<>(() -> {
       // ...
       return "hello world";
   });
   new Thread(task).start();
   task.get();
   ```

   使用 get 方法阻塞调用线程，或者使用轮询方式调用 isDone 判断任务是否结束，再获取结果

3. 使用第三方库 Guava 扩展 Future 

   ```java
   ListenableFutureTask<String> task = ListenableFutureTask.create(() -> {
       return "hello world";
   });
   Futures.addCallback(task, new FutureCallback<String>() {
       @Override
       public void onSuccess(String s) {
           System.out.println(s);
       }
   
       @Override
       public void onFailure(Throwable throwable) {
           throwable.printStackTrace();
       }
   }, Executors.newFixedThreadPool(1));
   
   new Thread(task).start();
   ```

   Guava 提供的 ListenableFutureTask 可以添加回调，提升了 java 异步编程的能力

4. 使用 JDK8 提供的 CompletableFuture

   JDK8 提供了 CompletableFuture 工具类，有着 50 多个方法，功能非常强大

   CompletableFuture 不仅能方便的获取执行结果，也支持任务编排，是异步编程的利器

## 使用方式

### 创建 CompletableFuture 任务

```java
// 不支持返回结果
static CompletableFuture<Void> runAsync(Runnable runnable)
// 支持返回结果
static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier)
// 返回默认结果
static <U> CompletableFuture<U> completedFuture(U value)
```

### 获取任务执行结果

```java
// 设置执行结果
boolean complete(T value)
// 设置执行异常（调用 get 获取结果时抛出）
boolean completeExceptionally(Throwable ex)
// 阻塞调用线程，获取执行结果
T join()
// 和 join 类似，但会抛出受检异常
T get() throws InterruptedException, ExecutionException
```

complete 方法返回布尔值表示是否设置成功，如果任务已经执行完成，则会设置失败

一旦设置成功，任务的执行结果将不会被改变，即使任务的后续代码执行完毕

### 编排任务执行顺序

1. 串行关系

   CompletableFuture 实现了 CompletionStage 接口，CompletionStage 接口中定义了多任务协调执行的方法

   CompletionStage 中串行执行的方法主要有 thenApply、thenAccept、thenRun、thenCompose

   ```java
   // 接收参数并返回结果
   CompletableFuture<U> thenApply(Function<? super T,? extends U> fn)
   // 接收参数不返回结果
   CompletableFuture<Void> thenAccept(Consumer<? super T> action)
   // 不接受参数也不返回结果
   CompletableFuture<Void> thenRun(Runnable action)
   // 和 thenApply 类似，需要返回一个新的 CompletionStage 实现
   CompletableFuture<U> thenCompose(Function<? super T, ? extends CompletionStage<U>> fn) 
   ```

   这些方法是同步执行的，也有对应的异步方法，方法名称后面带有 Async，异步方法会开启新线程去执行

   示例：

   ```java
   CompletableFuture<Void> future = CompletableFuture.supplyAsync(() -> 1)
       .thenApply(v -> v + 1)
       .thenAccept(System.out::println);
   // supplyAsync 返回 1，thenApply 对返回结果加一，thenAccept 消费结果，打印出 2
   ```

2. AND 汇聚关系

   当任务 A 和任务 B 都完成后，才能执行任务 C

   CompletionStage 中描述 AND 汇聚关系的方法主要有 thenCombine、thenAcceptBoth、runAfterBoth

   同样有对应的 Async 方法，如 thenCombineAsync

   ```java
   // BiFunction 接收前两个任务的执行结果，并返回结果
   CompletionStage<V> thenCombine(CompletionStage<? extends U> other,
                                  BiFunction<? super T,? super U,? extends V> fn)
   // BiConsumer 接收前两个任务的执行结果，不返回结果
   CompletionStage<Void> thenAcceptBoth(CompletionStage<? extends U> other,
                                        BiConsumer<? super T, ? super U> action)
   // 等待前两个任务执行完成，不接收参数，也不返回结果
   CompletionStage<Void> runAfterBoth(CompletionStage<?> other,
                                       Runnable action)
   // 等待多个任务都执行完成后再继续执行
   static CompletableFuture<Void> allOf(CompletableFuture<?>... cfs)
   ```

   示例：

   ```java
   CompletableFuture<Integer> f1 = CompletableFuture.supplyAsync(() -> 1);
   CompletableFuture<Integer> f2 = CompletableFuture.supplyAsync(() -> 2);
   CompletableFuture<Integer> f3 = f1.thenCombine(f2, Integer::sum);
   // f3 等待 f1 和  f2 都执行完成后再执行
   ```

3. OR  汇聚关系

   当任务 A 和任务 B 完成任意一个后，才能执行任务 C

   CompletionStage 中描述 OR 汇聚关系的方法主要有 applyToEither、acceptEither、runAfterEither

   同样有对应的 Async 方法，如 applyToEitherAsync

   ```java
   // 接收先执行完的任务结果，并返回结果
   CompletionStage<U> applyToEither(CompletionStage<? extends T> other,
                                    Function<? super T, U> fn)
   // 接收先执行完的任务结果，不返回结果
   CompletionStage<Void> acceptEither(CompletionStage<? extends T> other,
                                          	Consumer<? super T> action)
   // 等待任意一个任务执行完成，不接收参数，也不返回结果
   CompletionStage<Void> runAfterEither(CompletionStage<?> other,
                                        Runnable action)
   // 多个任务任意一个返回结果就继续执行下去
   static CompletableFuture<Object> anyOf(CompletableFuture<?>... cfs)
   ```

   示例：

   ```java
   CompletableFuture<Integer> f1 = CompletableFuture.supplyAsync(() -> 1);
   CompletableFuture<Integer> f2 = CompletableFuture.supplyAsync(() -> 2);
   CompletableFuture<Integer> f3 = f1.applyToEither(f2, v -> v + 1);
   // f3 等待 f1 和  f2 任意一个执行完成后再执行
   ```

4. 异常处理

   在 Function、Consumer、Runnable 中，不允许抛出可检查异常，但是却无法限制它们抛出运行时异常
   
   CompletionStage 接口提供了以链式编程方式处理异常的方法
   
   ```java
   CompletionStage<T> exceptionally(Function<Throwable, ? extends T> fn)
   CompletionStage<T> whenComplete(BiConsumer<? super T, ? super Throwable> action)
   CompletionStage<T> whenCompleteAsync(BiConsumer<? super T, ? super Throwable> action)
   CompletionStage<U> handle(BiFunction<? super T, Throwable, ? extends U> fn)
   CompletionStage<U> handleAsync(BiFunction<? super T, Throwable, ? extends U> fn)
   ```
   
   exceptionally 类似于 try catch，whenComplete 和 handle 类似于 finally，区别在于 handle 支持返回结果
   
   示例：
   
   ```java
   CompletableFuture<Integer> future = CompletableFuture.supplyAsync(() -> 1)
       .thenApply(v -> v / 0)
       .exceptionally(e -> {
           e.printStackTrace();
           return 0;
       })
       .whenComplete((v, e) -> {
           System.out.println("结果：" + v);
           System.out.println("异常：" + e);
       });
   ```
   
   如果异常已经被 exceptionally 处理，whenComplete 中获取的 e 为 null

## 使用线程池

### 创建线程池

```java
ThreadPoolExecutor(int corePoolSize, // 核心线程数
                   int maximumPoolSize, // 最大线程数
                   long keepAliveTime, // 存活时间
                   TimeUnit unit, // 存活时间单位
                   BlockingQueue<Runnable> workQueue, // 阻塞队列
                   ThreadFactory threadFactory, // 线程工厂（可选）
                   RejectedExecutionHandler handler) // 拒绝策略
```

Executors 类提供了快速创建线程池的方法，但不建议使用

Executors 提供的很多方法默认使用的都是无界的 LinkedBlockingQueue，高负载情境下，无界队列很容易导致 OOM，所以要创建线程池时应该使用无界队列

Executors 中还有一些方法没有限制线程数量，可能导致不断创建线程直到压垮机器，对于线程数量的设置，通常的经验是 CPU 密集型的程序线程数设置为 CPU 核数 + 1，IO 密集型设置为 2 * CPU 核数 + 1，但具体还要根据实际场景测试进行优化

### 向线程池提交任务

```java
// 提交一个 Runnable
Future<?> f1 = threadPool.submit(new Runnable() {
    @Override
    public void run() {
        System.out.println("hello");
    }
});
// 提交一个 Callable
Future<Integer> f2 = threadPool.submit(new Callable<Integer>() {
    @Override
    public Integer call() throws Exception {
        return 1;
    }
});
```

线程池也可以提交 FutureTask，因为 FutureTask 实现了 Runnable 接口

### 配置 CompletableFuture 线程池

创建 CompletableFuture 默认会使用公共的 ForkJoinPool 线程池，该线程池默认创建的线程数是 CPU 的核数（可以通过 JVM option:-Djava.util.concurrent.ForkJoinPool.common.parallelism 来设置 ForkJoinPool 线程池的线程数），所有 CompletableFuture 共享一个线程池，可能因为业务功能不同，互相干扰执行效率，建议根据不同业务配置不同线程池

创建 CompletableFuture 的方法中，带有 Async 的方法往往支持第二参数 Executor，用来指定要使用的线程池

同样的，CompletionStage 接口的方法中也有许多带有 Async 的方法，它们的重载方法也支持指定线程池
