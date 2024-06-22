---

title: Redis 实现分布式锁
date: 2022/2/19
description: 本文介绍了分布式锁的基本概念和使用场景，包括 MySQL 和 Redis 实现分布式的基本过程， 以及单机版 Redis 分布式锁的代码样例
tag: [中间件, Redis, 分布式锁]

---

# Redis 实现分布式锁

## 分布式锁简介

1. 分布式锁：在分布式环境下，保证多台机器上的线程互斥访问资源的一种锁

2. 为什么需要分布式锁

   在单机环境的 Java 编程中，开发者经常使用 JDK 提供的 synchronized 关键字、JUC 包的 ReentrantLock 类等 API 来对共享资源进行加锁，以此保证多线程访问数据的正确性

   随着用户需求的不断扩大，加上软件技术的更新迭代，分布式架构和集群技术越来越流行，那么， 在多机环境下，如何保证多台机器上代码的互斥执行，这显然不是单机线程之间的锁可以解决的， 因此分布式锁应运而生

3. 实现方案

   分布式锁有许多实现方案，如数据库实现、Redis 实现、zookeeper

   目前较为流行且结构简单的分布式锁一般采用 Redis 实现

## MySQL 实现

1. 实现原理

   数据库 FOR UPDATE 查询是一种排它锁，当命中索引时会锁住行记录，其他 FOR UPDATE 查询会阻塞等待，直到加锁成功的查询提交，利用该特性可以简单的实现阻塞的分布式锁

   数据表可以使用锁名称作为唯一索引

2. 基本流程

   - 加锁

     FOR UPDATE 查询指定锁名称

     如果记录存在，没有获取到数据库锁的查询将阻塞

     如果记录不存在，就执行插入语句，插入完成后再次 FOR UPATE 查询

   - 解锁

     提交查询事务

   > 需要注意：该分布式锁中使用的数据库连接对象最好主动创建，如果直接使用 Spring 容器管理的事务，可能会产生冲突，例如加锁和解锁之间的数据库操作被解锁事务误提交

3. 非阻塞加锁

   使用 FOR UPDATE NOWAIT 查询，会在获取数据库锁失败时，直接返回错误信息，可以实现非阻塞加锁

   通过轮询并指定超时时间，可以实现带有超时时间的 tryLock

4. 可重入性

   使用 ThreadLocal 保存锁名称以及对应的重入次数、数据库连接等信息，加锁时据此判断是否重入，如果重入，将维护的重入次数减一，减为 0 时，释放数据库锁，清理 ThreadLocal 相应记录

5. 容灾问题

   如果已经获取锁，正在处理业务的机器宕机该怎么办？

   一般断开连接后，数据库会自动释放锁，也可以手动在数据库层面将事务删除

6. 示例代码

   参考：[https://github.com/cadecode/distributed-lock-demo](https://github.com/cadecode/distributed-lock-demo)

## Redis 实现

1. 实现原理

   Redis SETNX 命令表示不存在才添加，此命令是实现分布式锁的基石

   如果添加不成功会直接返回失败

2. 基本流程

   - 加锁

     以锁名称为 key，SETNX 添加到 Redis，添加成功表示加锁成功，获取执行机会

     循环添加操作，直到添加成功

   - 解锁

     删除对应的 key

3. 非阻塞加锁

   SETNX 命令是非阻塞的，是直接返回结果的，这是天然的非阻塞锁

   通过循环执行并加入时间判断，可以实现带有超时时间的 tryLock

4. 可重入性

   使用 ThreadLocal 保存锁名称以及对应的重入次数等信息，加锁时据此判断是否重入，如果重入，将维护的重入次数减一，减为 0 时，删除相应 key

5. 容灾问题

   如果成功添加锁记录到 Redis，正在处理业务的机器宕机该怎么办？

   可以在添加 key 时设置一个过期时间，开启一个定时任务为其续期，在解锁时取消定时任务再删除 key，宕机后，key 很快会过期，不影响其他业务加锁

6. 示例代码

   Redis 集群发生主从切换，在同步数据时可能发生异常，导致锁没有同步成功，其他线程可能也会加锁成功，集群版的分布式锁可以参考 RedLock 实现

   以下代码是单机版分布式锁代码样例，暂不考虑上述问题

   ```java
   @Component
   @RequiredArgsConstructor
   public class RedisLock implements DistributedLock {
   
       private final StringRedisTemplate redisTemplate;
       private final ThreadLocal<Map<String, LockContent>> contentMapLocal =
           ThreadLocal.withInitial(HashMap::new);
       // 定时续期任务线程池，合理设置大小
       private final ScheduledThreadPoolExecutor executor 
           = new ScheduledThreadPoolExecutor(10);
   
       @Override
       public void lock(String name) {
           if (checkReentrant(name)) {
               storeLock(name, null, true);
               return;
           }
           while (true) {
               if (tryLock0(name)) {
                   return;
               }
               sleep();
           }
       }
   
       @Override
       public boolean tryLock(String name) {
           if (checkReentrant(name)) {
               storeLock(name, null, true);
               return true;
           }
           return tryLock0(name);
       }
   
       @Override
       public boolean tryLock(String name, long timeout, TimeUnit timeUnit) {
           if (checkReentrant(name)) {
               storeLock(name, null, true);
               return true;
           }
           long totalTime = timeUnit.toMillis(timeout);
           long current = System.currentTimeMillis();
           while (System.currentTimeMillis() - current <= totalTime) {
               if (tryLock0(name)) {
                   return true;
               }
               sleep();
           }
           return false;
       }
   
       @Override
       public void unlock(String name) {
           if (!checkReentrant(name)) {
               return;
           }
           LockContent lockContent = contentMapLocal.get().get(name);
           Integer count = lockContent.getCount();
           if (count > 0) {
               // 重入次数减一
               lockContent.setCount(--count);
           }
           // 释放锁
           if (count == 0) {
               // 停止续期任务
               lockContent.getFuture().cancel(true);
               // 删除 Redis key
               redisTemplate.delete(name);
               // 清除重入记录
               contentMapLocal.get().remove(name);
           }
       }
   
       /**
        * 检查重入
        *
        * @param name 锁名称
        * @return 是否重入
        */
       private boolean checkReentrant(String name) {
           if (Objects.isNull(name)) {
               throw new RuntimeException("锁名称不能为空");
           }
           // 判断是否重入
           return Objects.nonNull(contentMapLocal.get().get(name));
       }
   
       /**
        * 保存重入次数到 ThreadLocal
        *
        * @param name 锁名称
        */
       private void storeLock(String name, ScheduledFuture<?> future, boolean reentrant) {
           LockContent lockContent;
           if (reentrant) {
               lockContent = contentMapLocal.get().get(name);
               // 重入次数加一
               lockContent.setCount(lockContent.getCount() + 1);
               return;
           }
           // 创建新的 LockContent
           lockContent = new LockContent(future, 1);
           contentMapLocal.get().put(name, lockContent);
       }
   
       /**
        * 尝试设置 redis key
        *
        * @param name 锁名称
        * @return 是否设置成功
        */
       private boolean tryLock0(String name) {
           Boolean success = redisTemplate.opsForValue()
               .setIfAbsent(name, "", 30, TimeUnit.SECONDS);
           // 设置成功
           if (Objects.equals(success, true)) {
               // 开启续期任务
               ScheduledFuture<?> future = renewLock(name);
               storeLock(name, future, false);
               return true;
           }
           return false;
       }
   
       /**
        * 开启锁续期任务
        *
        * @param name 锁名称
        * @return ScheduledFuture
        */
       private ScheduledFuture<?> renewLock(String name) {
           // 有效期设置为 30s，每 20 秒重置
           return executor.scheduleAtFixedRate(() -> {
               redisTemplate.opsForValue()
                   .setIfPresent(name, "", 30, TimeUnit.SECONDS);
           }, 20, 20, TimeUnit.SECONDS);
       }
   
       /**
        * 休眠一定时间
        */
       private void sleep() {
           // ...
       }
   
       /**
        * 锁内容
        * 维护续期任务和重入次数
        */
       @Data
       @AllArgsConstructor
       private static class LockContent {
           /**
            * 续期任务
            */
           private ScheduledFuture<?> future;
           /**
            * 重入次数
            */
           private Integer count;
       }
   }
   ```
