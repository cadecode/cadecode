---

title: SpringBoot 异步和定时任务
date: 2021/5/10
description: 本文介绍 SpringBoot 中原生的异步任务和定时任务的开启方法、相应的线程池实现以及线程池的配置方式等
tag: [Java 框架, SpringBoot, Spring, Java]

---

# SpringBoot 异步和定时任务

## 异步任务

### 概念

在 SpringBoot 中，使用 `@Async` 注解将方法标注为异步任务，异步任务会被提交到独立的线程池中运行

### 使用

使用`@Async`

```java
@Slf4j
@Component
public class TestTaskFactory {

    /**
     * 模拟5秒的异步任务
     */
    @Async
    public Future<Boolean> asyncTask1() throws InterruptedException {
        doTask("asyncTask1", 5);
        return new AsyncResult<>(Boolean.TRUE);
    }

    /**
     * 模拟2秒的异步任务
     */
    @Async
    public Future<Boolean> asyncTask2() throws InterruptedException {
        doTask("asyncTask2", 2);
        return new AsyncResult<>(Boolean.TRUE);
    }

    /**
     * 模拟3秒的异步任务
     */
    @Async
    public Future<Boolean> asyncTask3() throws InterruptedException {
        doTask("asyncTask3", 3);
        return new AsyncResult<>(Boolean.TRUE);
    }

    /**
     * 模拟5秒的同步任务
     */
    public void task1() throws InterruptedException {
        doTask("task1", 5);
    }

    /**
     * 模拟2秒的同步任务
     */
    public void task2() throws InterruptedException {
        doTask("task2", 2);
    }

    /**
     * 模拟3秒的同步任务
     */
    public void task3() throws InterruptedException {
        doTask("task3", 3);
    }

    private void doTask(String taskName, Integer time) throws InterruptedException {
        log.info("{}开始执行，当前线程名称【{}】", taskName, Thread.currentThread().getName());
        TimeUnit.SECONDS.sleep(time);
        log.info("{}执行成功，当前线程名称【{}】", taskName, Thread.currentThread().getName());
    }
}
```

测试类

```java
@Slf4j
@SpringBootTest
@EnableAsync
public class TestTaskFactoryTest{
    @Autowired
    private TestTaskFactory taskFactory;

    /**
     * 测试异步任务
     */
    @Test
    public void asyncTaskTest() throws InterruptedException, ExecutionException {
        long start = System.currentTimeMillis();
        Future<Boolean> asyncTask1 = taskFactory.asyncTask1();
        Future<Boolean> asyncTask2 = taskFactory.asyncTask2();
        Future<Boolean> asyncTask3 = taskFactory.asyncTask3();
        // 调用 get() 阻塞主线程
        asyncTask1.get();
        asyncTask2.get();
        asyncTask3.get();
        long end = System.currentTimeMillis();

        log.info("异步任务全部执行结束，总耗时：{} 毫秒", (end - start));
    }

    /**
     * 测试同步任务
     */
    @Test
    public void taskTest() throws InterruptedException {
        long start = System.currentTimeMillis();
        taskFactory.task1();
        taskFactory.task2();
        taskFactory.task3();
        long end = System.currentTimeMillis();

        log.info("同步任务全部执行结束，总耗时：{} 毫秒", (end - start));
    }
}
```

### 线程池

异步任务的线程池接口 `TaskExecutor`，继承于 JUC 包的 `Executor`

`TaskExecutor` 在 SpringBoot 中有许多实现

- `SimpleAsyncTaskExecutor`：不重用线程，每次调用都会创建一个新的线程
- `SyncTaskExecutor`：在调用者的当前线程同步执行任务，适用于不需要多线程的场景
- `ConcurrentTaskExecutor`：`Executor` 的适配类，用于将 Java 的 `Executor` 对象纳入到Spring管理
- `ThreadPoolTaskExecutor`：常用的线程池实现，其实质是对 `ThreadPoolExecutor` 的包装，通过`TaskExecutionAutoConfiguration` 进行自动配置

配置异步任务线程池

通过 application.yaml 文件配置

需要在启动类或配置类上使用 `@EnableAsync` 注解开启异步任务功能，并通过配置文件配置线程池

```
spring:
  task:
    execution:
      pool:
        # 最大线程数
        max-size: 16
        # 核心线程数
        core-size: 16
        # 存活时间
        keep-alive: 10s
        # 队列大小
        queue-capacity: 100
        # 是否允许核心线程超时
        allow-core-thread-timeout: true
      # 线程名称前缀
      thread-name-prefix: async-task-
```

通过 JavaConfig 类配置

  ```javascript
  @Configuration
  @EnableAsync
  @Slf4j
  public class ExecutorConfig implements AsyncConfigurer {
  
      /**
       * 异步任务执行线程池
       *
       * @return
       */
      @Bean(name = "asyncExecutor")
      public ThreadPoolTaskExecutor asyncExecutor() {
          ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
          executor.setCorePoolSize(10);
          executor.setQueueCapacity(1000);
          executor.setKeepAliveSeconds(600);
          executor.setMaxPoolSize(20);
          executor.setThreadNamePrefix("async-task-");
          executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
          executor.initialize();
          return executor;
      }
  
      @Override
      public Executor getAsyncExecutor() {
          return asyncExecutor();
      }
  
      @Override
      public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
          return (throwable, method, objects) -> {
              log.error("异步任务执行出现异常, message {}, method {}, params {}", 
               throwable, method, objects);
          };
      }
  }
  ```

## 定时任务

### 概念

使用`@Scheduled`将方法标注为定时任务，SpringBoot 将按照注解中的配置项定时将方法放入线程池中执行

### 使用

使用`@Scheduled`

```java
@Component
@Slf4j
public class TestTaskJob {

    /**
     * 按照标准时间来算，每隔 10s 执行一次
     */
    @Scheduled(cron = "0/10 * * * * ?")
    public void job1() {
        log.info("【job1】开始执行：{}", DateUtil.formatDateTime(new Date()));
    }

    /**
     * 从启动时间开始，间隔 2s 执行
     * 固定间隔时间
     */
    @Scheduled(fixedRate = 2000)
    public void job2() {
        log.info("【job2】开始执行：{}", DateUtil.formatDateTime(new Date()));
    }

    /**
     * 从启动时间开始，延迟 5s 后间隔 4s 执行
     * 固定等待时间
     */
    @Scheduled(fixedDelay = 4000, initialDelay = 5000)
    public void job3() {
        log.info("【job3】开始执行：{}", DateUtil.formatDateTime(new Date()));
    }
}
```

`@Scheduled`参数

- zone：时区
- fixedDelay：上次执行完毕过多少毫秒再执行
- fixedRate：上次开始执行时过多少毫秒再执行
- initialDelay：第一次执行时延迟多少毫秒
- fixedDelayString、fixedRateString、initialDelayString：字符串形式，可使用占位符，如 `${job.fixedDelay}`
- corn：corn 表达式，语法为`[秒] [分] [小时] [日] [月] [周] [年]`，年可以省略

### 线程池

定时任务线程池的实现是 `ThreadPoolTaskScheduler`，是对 JDK  `ScheduledExecutorService` 的封装

`SchedulingConfiguration ` 配置类定义了`ScheduledAnnotationBeanPostProcessor`这个Bean，用于扫描`@Scheduled`注解，并通过代理获取要执行的方法创建线程，提交到线程池中

线程池配置

通过 application.yaml 文件配置

需要在启动类或配置类上使用 `@EnableScheduling` 注解开启异步任务功能，并通过配置文件配置线程池

```yaml
spring:
  task:
    scheduling:
      pool:
        size: 20
      thread-name-prefix: schedule-job-
```

通过 JavaConfig 类配置

```java
@Configuration
@EnableScheduling
public class ExecutorConfig implements SchedulingConfigurer {

    /**
     * 定时任务使用的线程池
     *
     * @return
     */
    @Bean(destroyMethod = "shutdown", name = "taskScheduler")
    public ThreadPoolTaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(10);
        scheduler.setThreadNamePrefix("schedule-task-");
        scheduler.setAwaitTerminationSeconds(600);
        scheduler.setWaitForTasksToCompleteOnShutdown(true);
        return scheduler;
    }

    @Override
    public void configureTasks(ScheduledTaskRegistrar scheduledTaskRegistrar) {
        ThreadPoolTaskScheduler taskScheduler = taskScheduler();
        scheduledTaskRegistrar.setTaskScheduler(taskScheduler);
    }
}
```
