---

title: SpringBoot 优雅停机
date: 2023/9/16
description: 本文介绍 SpringBoot 程序优雅停机的方案，包括 web 容器、Spring 定时任务、线程池等的优雅关闭
tag: [Java 框架, SpringBoot, Java]

---

# SpringBoot 优雅停机

## 问题引入

1. 在 Linux 服务上停止一个应用程序时，我们通常会使用 `kill -9` 命令来强制杀死进程，这往往会导致程序正在处理的逻辑异常终止，产生数据的不一致性和不完整性

2. Linux kill 命令在不加额外参数时，等同于 `kill -15`，这会向进程发送一个停止信号，进程可以运行停止前的处理逻辑，保证正常关闭

   Linux 停止程序示例脚本，先温柔停止，配合 ps 命令检测状态，超时后再强制关闭

   ```shell
   #!/bin/sh
   wait_process_stop() {
     local pid=$1
     local beginTime=$(date +%s)
     local endTime
     while ps -p ${pid} > /dev/null 2>&1
     do
       echo -n "."
       sleep 1
       endTime=$(date +%s)
       if [ $((endTime-beginTime)) -gt 30 ];then
         echo -e "\nKill ${pid} timeout, now kill force"
         kill -9 ${pid}
         break;
       fi
     done
   }
   
   stop_process() {
     local process_reg=$1
     if [[ -z ${process_reg} ]]; then
       echo "Process reg must not be empty"
       return 1 
     fi
     local pid=$(ps -ef | grep -Ei "${process_reg}" | grep -v $(basename $0) | grep -v grep | awk '{print $2}')
     if [[ -n ${pid} ]]; then
       echo "Try to kill ${process_reg} ${pid}"
   		kill ${pid} && wait_process_stop "${pid}"
     fi
   }
   
   stop_process 'java.*test.*xxxx.jar'
   ```

3. SpingBoot 的优雅停机本质上是 JVM 关闭之前执行一些额外的处理代码

4. SpringBoot 优雅停机一般需要处理的方面：

   Web 服务器正在处理的请求

   MQ 正在消费的消息

   池化的资源，如连接池、线程池

   微服务中的节点注册信息

## 一般方案

### JVM ShutdownHook

编程语言一般都会提供进程结束运行前的会调用的钩子函数，在 JVM 中，可以添加 ShutdownHook 来监控 JVM 的停止操作

```java
Runtime.getRuntime().addShutdownHook(new Thread(() -> {
    // 关闭前处理
}));
```

可以在 ShutdownHook 中实现资源的释放等，这个钩子将在程序收到 `kill -15` 命令运行

### SpringBoot 生命周期钩子

Spring 对 JVM ShutdownHook 进行了一层封装，通过 AbstractApplicationContext 的 registerShutdownHook 方法来注册一个 ShutdownHook

不过一般不需要直接注册， SpringBoot 提供了一些接口来简化对生命周期的调控

SpringBoot 关闭程序的基本流程：

```
发布关闭事件，ContextClosedEvent
处理所有 Lifecycle Bean，解析顺序和依赖关系，并调用 stop 方法
Destroy Bean
关闭 BeanFactory
```

SpringBoot 优雅关闭常用方法：

```
继承 Lifecycle 接口，实现自定义的 stop 方法
使用 @PreDestroy 注解标注方法
继承 DisposableBean 接口，实现 destroy 方法
```

## 常见场景

### Web Server

在 SprinBoot 2.3.x 版本开始，SpringBoot 对优雅关闭 web 容器提供了支持

以 tomcat 为例，需要 tomcat 版本为 9.0.33+，关闭应用时，tomcat 将停止接收新请求，但保持当前正在处理的请求，直到超时

配置开启优雅关闭 server：

```yaml
server:
	shutdown: graceful
spring:
	lifecycle:
		timeout-per-shutdown-phase: 30s
```

timeout-per-shutdown-phase 指定等待处理的超时时间

### MQ

许多由 SpringBoot 托管的 MQ 消费者都集成了优雅关闭功能

如 RabbitMQ 基于 Lifecycle 和 DisposableBean 实现了关闭前停止监听的处理逻辑

```java
// SmartLifecycle
@Override
public void stop(Runnable callback) {
    Collection<MessageListenerContainer> containers = getListenerContainers();
    if (containers.size() > 0) {
        AggregatingCallback aggregatingCallback 
            = new AggregatingCallback(containers.size(), callback);
        for (MessageListenerContainer listenerContainer : containers) {
            try {
                listenerContainer.stop(aggregatingCallback);
            }
            catch (Exception e) {
                // 
            }
        }
    }
    else {
        callback.run();
    }
}

// DisposableBean
@Override
public void destroy() {
    for (MessageListenerContainer listenerContainer : getListenerContainers()) {
        if (listenerContainer instanceof DisposableBean) {
            try {
                ((DisposableBean) listenerContainer).destroy();
            }
            catch (Exception ex) {
                //
            }
        }
    }
}
```

### 定时任务

Spring 定时任务，需要配置定时任务线程池 setWaitForTasksToCompleteOnShutdown 为 true

```java
/**
 * Spring 定时任务线程池 @Scheduled
 */
@Bean(name = "taskScheduler")
public ThreadPoolTaskScheduler taskScheduler() {
    ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
    scheduler.setPoolSize(Runtime.getRuntime().availableProcessors());
    scheduler.setThreadNamePrefix("taskScheduler-");
    scheduler.setWaitForTasksToCompleteOnShutdown(true);
    scheduler.setAwaitTerminationSeconds(300);
    scheduler.setErrorHandler(throwable -> {
        log.error("Scheduled task execute fail,", throwable);
    });
    return scheduler;
}
```

Spring ThreadPoolTaskScheduler 实现了 DisposableBean，关闭前会调用 shutdown 方法，等待当前正在处理的任务完成，直到超时

```java
@Override
public void destroy() {
    shutdown();
}

public void shutdown() {
    if (this.executor != null) {
        if (this.waitForTasksToCompleteOnShutdown) {
            this.executor.shutdown();
        }
        else {
            for (Runnable remainingTask : this.executor.shutdownNow()) {
                cancelRemainingTask(remainingTask);
            }
        }
        awaitTerminationIfNecessary(this.executor);
    }
}
```

Qurtz 框架，同样是实现了 SmartLifecycle 和 DisposableBean

````java
@Override
public void stop() throws SchedulingException {
   if (this.scheduler != null) {
      try {
         this.scheduler.standby();
      }
      catch (SchedulerException ex) {
         //
      }
   }
}
@Override
public void destroy() throws SchedulerException {
   if (this.scheduler != null) {
       //
      this.scheduler.shutdown(this.waitForJobsToCompleteOnShutdown);
   }
}
````

### 线程池

优雅关闭线程池一般会调用 shutdown 方法，拒绝新任务，保持旧任务的处理，配合 awaitTermination 方法指定超时时间

但我们在项目中使用线程池时，一般会存在线程池互相关联提交任务的情况，比如线程池 A 处理过程中会提交任务到线程池 B，那么就不能机械的直接 shutdown 所有线程池，否则可能引起提交任务报错

可以通过遍历线程池列表，循环判断线程池任务状态，并且打乱顺序多判断几次，当都不存在任务时，再逐一关闭

基于 SmartLifecycle 关闭所有线程池的示例：

```java
@Slf4j
public static class ExecutorLifeCycle extends SmartLifecycle {
    @Override
    public int getPhase() {
        // webServer、taskScheduler、mq 的 phase 是 DEFAULT_PHASE
        // 在 webServer、taskScheduler、mq 关闭之后再关闭
        return SmartLifecycle.DEFAULT_PHASE - 1;
    }

    @Override
    public void stop() {
        log.info("LifeCycle preparing to stop all thread pool");
        // 此处需要获取所有线程池列表
        List<? extends Executor> executorList = ...
        // 打乱重复校验 5 次
        for (int i = 0; i < 5; ) {
            Collections.shuffle(executorList);
            if (executorList.stream().allMatch(ThreadPoolConfig::isPoolActive)) {
                i++;
            } else {
                i = 0;
                try {
                    TimeUnit.SECONDS.sleep(1);
                } catch (InterruptedException ignored) {
                    //
                }
            }
        }
        // 执行到此，认为所有线程池都执行完毕
        // 可定制线程池停止逻辑
    }

   /**
    * 判断线程池是否还有正则执行的任务
    */
    public static boolean isPoolActive(Executor executor) {
        if (executor instanceof ThreadPoolExecutor) {
            ThreadPoolExecutor threadPoolExecutor = (ThreadPoolExecutor) executor;
            return threadPoolExecutor.getActiveCount() == 0;
        } else if (executor instanceof ForkJoinPool) {
            ForkJoinPool forkJoinPool = (ForkJoinPool) executor;
            return forkJoinPool.getActiveThreadCount() == 0
                    && forkJoinPool.getRunningThreadCount() == 0
                    && forkJoinPool.getQueuedTaskCount() == 0
                    && forkJoinPool.getQueuedSubmissionCount() == 0;
        }
    	return true;
    }
}
```

### 连接池

连接池一般常用的有数据库连接池、http 连接池等

如 Feign 集成 http 连接池，使用 @PreDestroy 来关闭 httpclient 连接池

```java
@PreDestroy
public void destroy() {
    this.connectionManagerTimer.cancel();
    if (this.httpClient != null) {
        try {
            this.httpClient.close();
        }
        catch (IOException e) {
            if (LOG.isErrorEnabled()) {
                LOG.error("Could not correctly close httpClient.");
            }
        }
    }
}
```

如果是自己实现的连接池，如利用 common-pool 封装的连接池，要注意关闭前资源的释放处理，可用 Lifecycle 和 DisposableBean 来定制处理

### 注册中心下线

SpringCloud 应用关闭前会向注册中心申请下线，但一般客户端刷新节点列表有一定时间间隔，可能还会请求到已经下线的节点，造成请求失败

可以根据不同注册中心来定制下线的处理逻辑，比如先向 nacos 注册中心发送了下线请求，等待 ribbon 负载均衡组件到刷新时间重新拉取节点列表后，再执行关闭
