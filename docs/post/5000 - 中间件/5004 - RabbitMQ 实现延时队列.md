---

title: RabbitMQ 实现延时队列
date: 2022/4/27
description: 本文介绍 RabbitMQ 实现延时队列的两种方式，包括延时队列介绍、死信队列含义、死信队列的用法、死信队列实现延时和插件实现延时的方法
tag: [中间件, RabbitMQ]

---

# RabbitMQ 实现延时队列

## 延时队列介绍

1. 延时队列：用来存放需要在指定时间被处理的元素的队列

   队列中元素从一端进入，在另一端被取出，延时队列和普通队列的差别在于前者中元素只能在指定时间被取出

2. 延时队列经常被用在需要在过期时间后进行处理的任务场景中

3. 程序中实现延时队列的常见方案

   JDK DelayQueue（内部基于优先级队列实现，元素需实现 Delayed 接口）

   Redis Key 过期通知

   Redis zset score + 定时扫描（按推送时间排序）
   
   RabbitMQ 死信队列或者延时插件

## 死信队列实现

### 死信队列含义

1. 死信，Dead Letter，是一种消息机制，出现死信的场景有：

   消息被否定确认，basicNack/basicReject，且 requeue 为 false

   消息在队列的存活时间超过设置的 TTL 时间

   消息队列的消息数量已经超过最大队列长度

2. 死信会被放入死信队列，当没有配置死信队列时，消息将会被丢弃

3. 配置死信队列：

   配置业务队列，绑定到业务交换机

   为业务队列配置死信交换机和路由

   为死信交换机配置死信队列

   > 一般会为每个重要的业务队列配置一个死信队列
   >
   > 同一个项目的死信交换机可以共用一个，为每个业务队列分配一个单独的路由

### 模拟死信流程

1. 定义队列名称、交换机名称

   ```java
   // 死信队列名
   private static final String DEAD_LETTER_QUEUE_NAME = "DEAD_LETTER_QUEUE_1";
   // 死信交换机名
   private static final String DEAD_LETTER_EXCHANGE_NAME = "DEAD_LETTER_EXCHANGE_1";
   // 业务队列名
   private static final String BIZ_QUEUE_NAME = "BIZ_QUEUE_1";
   // 业务交换机名
   private static final String BIZ_EXCHANGE_NAME = "BIZ_EXCHANGE_1";
   ```

2. 创建队列并绑定到交换机

   ```java
   // 获取 CHANNEL
   CHANNEL = RabbitMQUtil.getConnection().createChannel();
   // 声明死信交换机
   CHANNEL.exchangeDeclare(DEAD_LETTER_EXCHANGE_NAME, "direct");
   // 声明死信队列
   String deadLetterQueue = CHANNEL.queueDeclare(DEAD_LETTER_QUEUE_NAME, 
                                                 false, false, false, null).getQueue();
   // 绑定死信队列到死信交换机，路由为 dl_1
   CHANNEL.queueBind(deadLetterQueue, DEAD_LETTER_EXCHANGE_NAME, "dl_1");
   // 配置业务队列参数
   Map<String, Object> bizArgs = new HashMap<String, Object>() {{
       // 声明当前队列绑定的死信交换机
       put("x-dead-letter-exchange", DEAD_LETTER_EXCHANGE_NAME);
       // 声明当前队列的死信路由
       put("x-dead-letter-routing-key", "dl_1");
   }};
   // 声明业务队列
   String bizQueue = CHANNEL.queueDeclare(BIZ_QUEUE_NAME, 
                                          false, false, false, bizArgs).getQueue();
   // 声明业务交换机
   CHANNEL.exchangeDeclare(BIZ_EXCHANGE_NAME, "direct");
   // 绑定业务队列到业务交换机
   CHANNEL.queueBind(bizQueue, BIZ_EXCHANGE_NAME, "biz_1");
   ```

   > 业务队列设置了`x-dead-letter-exchange`参数，用于配置死信要使用的交换机，`x-dead-letter-routing-key`用于配置死信队列的路由，如果没有配置路由，就会使用产生死信的业务队列的路由

3. 生产消息到业务队列，并消费

   生产业务消息

   ```java
   CHANNEL.basicPublish(BIZ_EXCHANGE_NAME, "biz_1", null, "hello demo queue".getBytes());
   ```

   消费者拒绝消息且不重新入队，消息就会进入死信

   ```java
   CHANNEL.basicConsume(BIZ_QUEUE_NAME, false, new DefaultConsumer(CHANNEL) {
       @SneakyThrows
       @Override
       public void handleDelivery(String consumerTag, Envelope envelope, 
                                  BasicProperties properties, byte[] body) {
           System.out.println(LocalDateTime.now() + " : " + new String(body));
           // 最后一个参数 requeue false，不重新入队（如果重新入队，下一个消费的还是它）
           CHANNEL.basicNack(envelope.getDeliveryTag(), false, false);
       }
   });
   ```

4. 监听死信队列

   ```java
   CHANNEL.basicConsume(DEAD_LETTER_QUEUE_NAME, false, new DefaultConsumer(CHANNEL) {
       @SneakyThrows
       @Override
       public void handleDelivery(String consumerTag, Envelope envelope, 
                                  BasicProperties properties, byte[] body) {
           System.out.println(LocalDateTime.now() + " : " + new String(body));
           CHANNEL.basicAck(envelope.getDeliveryTag(), false);
       }
   });
   ```

   > 死信队列中的死信 header 中会记录许多信息，如 x-first-death-exchange、x-first-death-queue 记录了第一次成为死信的交换机和队列，x-death 记录了这条死信历次被投入死信交换机的履历

### 实现延时队列

1. 死信队列实现延时队列的核心是利用消息存活时间超过 TTL 进入死信队列的特性

   创建一个用于延时的队列，投递消息而不消费，专门用于消息过期，监听其死信队列即可

2. 设置消息 TTL 的方式：

   对整个队列设置

   ```java
   // 配置业务队列参数
   Map<String, Object> bizArgs = new HashMap<String, Object>() {{
       // 声明当前队列绑定的死信交换机
       put("x-dead-letter-exchange", DEAD_LETTER_EXCHANGE_NAME);
       // 声明当前队列的死信路由
       put("x-dead-letter-routing-key", "dl_1");
       // 消息过期时间，6s
       put("x-message-ttl", 6000);
   }};
   // 声明业务队列
   String bizQueue = CHANNEL.queueDeclare(BIZ_QUEUE_NAME, 
                                          false, false, false, bizArgs).getQueue();
   ```

   对单个消息设置

   ```java
   BasicProperties.Builder builder = new BasicProperties.Builder();
   // 设置为 10s 过期
   builder.expiration("10000");
   CHANNEL.basicPublish(BIZ_EXCHANGE_NAME, "biz_1", 
                        builder.build(), "hello demo queue".getBytes());
   ```

3. 死信队列实现延时队列的缺点

   如果采用对整个队列设置过期时间的方式，那么对于延时要求不同的任务需要创建各自的队列

   所以需要在消息粒度控制过期时间，但是 RabbitMQ 原生支持的消息级别的过期时间是不具有优先级别的，也就说 A 消息 10s 过期，B 消息 3s 过期，A 比 B 先投入队列，那么即使 B 已经过期，也得等待 A 先被取出，这让实现一个通用的延时队列变得困难

## 延时插件实现

1. 下载并启用插件

   进入 [RabbitMQ 插件社区](https://www.rabbitmq.com/community-plugins.html)

   找到`rabbitmq_delayed_message_exchange`下载地址

   ```shell
   wget https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases/download/3.8.17/rabbitmq_delayed_message_exchange-3.8.17.8f537ac.ez
   ```

   下载完成后放到 RabbitMQ 插件目录，执行命令启用插件

   ```shell
   rabbitmq-plugins enable rabbitmq_delayed_message_exchange
   ```

   ![image-20220428180942586](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2022/04/20220428180943778.png)

2. 使用插件

   创建`x-delayed-message`类型的交换机，绑定一个队列存放延时消息

   ```java
   // 获取 CHANNEL
   CHANNEL = RabbitMQUtil.getConnection().createChannel();
   // 声明延时队列
   String delayQueue = CHANNEL.queueDeclare(DELAY_QUEUE_NAME, 
                                            false, false, false, null).getQueue();
   // 声明延时交换机
   Map<String, Object> delayExchangeArgs = new HashMap<String, Object>() {{
       put("x-delayed-type", "direct");
   }};
   // 交换机的 type 是 x-delayed-message
   CHANNEL.exchangeDeclare(DELAY_EXCHANGE_NAME, "x-delayed-message", 
                           false, false, delayExchangeArgs);
   // 绑定延时队列到延时交换机
   CHANNEL.queueBind(delayQueue, DELAY_EXCHANGE_NAME, "delay_1");
   ```

   生产延时消息

   ```java
   Map<String, Object> headers = new HashMap<String, Object>();
   // 配置消息 header x-delay 为延时时间
   headers.put("x-delay", 8000);
   // 生产一个延时 8s 的消息
   BasicProperties properties0 = new BasicProperties.Builder().headers(headers).build();
   CHANNEL.basicPublish(DELAY_EXCHANGE_NAME, "delay_1", 
                        properties0, "hello demo queue 8s".getBytes());
   
   headers.put("x-delay", 5000);
   // 生产一个延时 5s 的消息
   BasicProperties properties1 = new BasicProperties.Builder().headers(headers).build();
   CHANNEL.basicPublish(DELAY_EXCHANGE_NAME, "delay_1", 
                        properties1, "hello demo queue 5s".getBytes());
   ```

   消费消息

   ```java
   CHANNEL.basicConsume(DELAY_QUEUE_NAME, false, new DefaultConsumer(CHANNEL) {
       @SneakyThrows
       @Override
       public void handleDelivery(String consumerTag, Envelope envelope, 
                                  BasicProperties properties, byte[] body) {
           System.out.println(LocalDateTime.now() + " : " + new String(body));
           CHANNEL.basicAck(envelope.getDeliveryTag(), false);
       }
   });
   ```

   虽然先投入的延时 8s，后投入的延时 5s，但消费者会先消费到 5s 的

3. 插件的基本原理

   带有 x-delay header 的消息，会被 x-delayed-message 类型的交换机，延迟 x-delay 指定的毫秒数后，投递到指定队列
