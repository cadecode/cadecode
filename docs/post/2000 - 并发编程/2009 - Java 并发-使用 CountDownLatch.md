---

title: Java 并发-使用 CountDownLatch
date: 2022/1/24
description: 本文介绍 Java 并发编程中的同步工具类，如 CountDownLatch 和 CyclicBarrier，以及它们的使用方式和基本原理 
tag: [并发编程, Java]

---

# Java 并发-使用 CountDownLatch

## CountDownLatch

1. 引入背景

   有时候我们需要等待多个线程的执行结果，获取结果后再执行相应操作，比如线程 1 等待线程 2 和线程 3 都执行完成后，再继续执行

   这种场景可以使用 join，但推荐使用 Java 并发包中提供的同步工具类 CountDownLatch，更为灵活

2. CountDownLatch 介绍

   CountDownLatch 是一个同步工具类，用来协调多个线程之间的同步

   CountDownLatch 中维护一个计数器，实例化时指定初值，每个线程执行完毕后调用方法使计数器减一，减为 0 后等待的线程可以继续执行下去

3. CountDownLatch 相关方法

   ```java
   // 实例化一个 countDownLatch，初值 2
   CountDownLatch countDownLatch = new CountDownLatch(2);
   // 值减一
   countDownLatch.countDown()
   // 等待值减为 0 再继续执行
   countDownLatch.await();
   ```

   使用示例

   ```java
   CountDownLatch countDownLatch = new CountDownLatch(2);
   // 线程 1
   new Thread(() -> {
       try {
           Thread.sleep(1000);
           countDownLatch.countDown();
       } catch (InterruptedException e) {
           e.printStackTrace();
       }
   }).start();
   // 线程 2
   new Thread(() -> {
       try {
           Thread.sleep(500);
           countDownLatch.countDown();
       } catch (InterruptedException e) {
           e.printStackTrace();
       }
   }).start();
   // 父线程，等待减为 0 后才能继续执行
   try {
       countDownLatch.await();
   } catch (InterruptedException e) {
       e.printStackTrace();
   }
   ```

4. CountDownLatch 实现原理

   CountDownLatch 内部维护一个 AQS 的实现类，在构造方法中传入了 state 属性

   tryAcquireShared 方法判断 state 是否为 0，await 方法中依赖此方法判断是否需要循环等待
   
   tryReleaseShared 方法负责将 state 减 1，countDown 方法依赖此方法对计数器减 1
   
   ```java
   private static final class Sync extends AbstractQueuedSynchronizer {
     Sync(int count) {
       setState(count);
     }
     protected int tryAcquireShared(int acquires) {
       return (getState() == 0) ? 1 : -1;
     }
     protected boolean tryReleaseShared(int releases) {
       for (;;) {
         int c = getState();  
         if (c == 0) 
           return false;
         int nextc = c-1;
         if (compareAndSetState(c, nextc))
           return nextc == 0;
       }
     }
   }
   ```

## CyclicBarrier

1. CyclicBarrier 介绍

   CountDownLatch 也被称为闭锁，它常被用于一个线程等待其他线程执行完毕后再执行，相当于阻塞线程一直到某个事件得发生

   CyclicBarrier 和 CountDownLatch 功能类似，被称为栅栏，CyclicBarrier 可以使一定数量的线程在栅栏处阻塞等待，直到所有线程都到达栅栏，这时栅栏将打开，所有的线程都将被释放，而栅栏将被重置以便下次使用

2. CyclicBarrier 相关方法

   构造方法指定等待的线程数

   调用 await 表示当前线程已经在栅栏处等待

   当调用 await 的数量达到指定的线程数，统一继续向下执行

   ```java
   CyclicBarrier barrier = new CyclicBarrier(2);
   Thread aThread = new Thread(() -> {
       try {
           // 先休眠 5 秒
           Thread.sleep(5000);
           barrier.await();
       } catch (InterruptedException | BrokenBarrierException e) {
           e.printStackTrace();
       }
   });
   Thread bThread = new Thread(() -> {
       try {
           // 等待线程 A 执行到 await 再一起向下执行
           barrier.await();
       } catch (InterruptedException | BrokenBarrierException e) {
           e.printStackTrace();
       }
   });
   
   aThread.start();
   bThread.start();
   ```

   CyclicBarrier 构造函数可以指定所有线程线程都到达栅栏时的回调函数

   ```java
   // 第二参数传入一个回调，Runnable
   CyclicBarrier barrier = new CyclicBarrier(2, () -> {
       System.out.println("OK");
   });
   ```

3. CyclicBarrier 实现原理

   CyclicBarrier 内部基于 ReentrantLock 实现

   dowait 方法实现了 await 阻塞等待的主要逻辑

   ```java
   private int dowait(boolean timed, long nanos)
       throws InterruptedException, BrokenBarrierException,
   TimeoutException {
       // 申请锁
       final ReentrantLock lock = this.lock;
       lock.lock();
       try {
           // ...
           // 如果是 0，表示最后一个线程执行了此方法
           int index = --count;
           if (index == 0) {
               boolean ranAction = false;
               try {
                   final Runnable command = barrierCommand;
                   // 执行设置的回调
                   if (command != null)
                       command.run();
                   ranAction = true;
                   // 唤醒线程，重置 count
                   nextGeneration();
                   return 0;
               } finally {
                   // 执行失败时，设置 Generation broken 为 true
                   if (!ranAction)
                       breakBarrier();
               }
           }
           // 如果不是最后一个调用 await 的线程
           for (;;) {
               try {
                   // 等待
                   if (!timed)
                       trip.await();
                   else if (nanos > 0L)
                       nanos = trip.awaitNanos(nanos);
               } catch (InterruptedException ie) {
                   if (g == generation && ! g.broken) {
                       breakBarrier();
                       throw ie;
                   } else {
                       Thread.currentThread().interrupt();
                   }
               }
               // ...
           }
       } finally {
           lock.unlock();
       }
   }
   ```

   CyclicBarrier 中维护一个 count 属性，从构造函数赋予初值，每个线程调用 await 时先减 1，再判断是否为 0，如果为 0 就唤醒所有等待的线程，如果没有就调用 Condition 的 wait 方法进行等待

> CountDownLatch 会等待多个线程执行 countDown 动作，被等待的线程之间不会互相影响
>
> CyclicBarrier 会约定各个线程在 await 方法处等待，直到全部到达后，再开始继续执行



