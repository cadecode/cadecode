---

title: RabbitMQ 使用和集群
date: 2021/11/9
description: 本文介绍 MQ 和 RabbitMQ 的相关概念、RabbitMQ 常见模型的使用、整合 SpringBoot，以及 RabbitMQ 集群的搭建
tag: [中间件, RabbitMQ, 集群]

---

# RabbitMQ 使用和集群

## MQ 介绍

1. MQ：Message Queue，消息队列。生产者生产消息存放到队列里，消费者监听队列内容，伺机消费消息

   ![image-20211110212039640](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211110212040687.png)

2. 优点：MQ 中消息的生产和消费是异步的，生产者与消费者无侵入、低耦合

3. 常见的 MQ 框架

   ```markdown
   # ActiveMQ
   	Apache 出品的，老牌的消息总线，遵从 JMS 规范，提供丰富的 API。
   # Kafka
   	Apache 顶级项目，开源的发布订阅消息系统，不支持事务，对错误、丢失没有严格可控制，吞吐量高，使用适用于大数据量的数据收集业务。
   # RocketMQ
   	阿里开源的消息中间件，纯 Java 开发，高吞吐量、高可用性，适合大规模分布式系统应用。思路起源于 Kafka。
   # RabbitMQ
   	Erlang 语言编写的开源消息队列系统，基于 AMQP 协议，面向消息、队列、路由，具有可靠性、安全性。对数据一致性、稳定性要求高的场景适用
   ```

## RabbitMQ 介绍

1. RabbitMQ 官网：[https://www.rabbitmq.com/](https://www.rabbitmq.com/)

   ![image-20211110222608877](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211110222609963.png)

2. RabbitMQ 的优点

   ```markdown
   - 使用 Erlang 语言开发，Erlang 是性能强劲的 Socket 编程语言
   - 基于 AMQP 协议，具有跨平台性
   - 轻松集成 SpringBoot
   - 对数据一致性非常友好
   ```

3. RabbitMQ 相关概念

   ```markdown
   # AMQP 协议
   	2003 年被提出，是一种高级的消息协议，不限定 API 层，直接定义网络交换的数据格式，有天然跨平台性。
   # 虚拟主机
   	一个虚拟主机持有一组交换机、队列和绑定关系，用于划分 RabbiMQ 服务，一般不同的服务配置不同的虚拟主机，用户	在虚拟主机粒度进行权限控制，每个 RabbitMQ 服务器在默认配置时具有默认的虚拟主机 '/'
   # 交换机
   	用于转发消息到队列，若没有队列与之绑定，会丢弃生产者生产的消息
   # 队列
   	存储消息的数据容器
   # connection 和 channel
   	通过 connection 对象创建 channel 对象，使用 channel 对象传输数据。channel 可看作虚拟的连接，避免频繁创建真实连接（connection）开销较大

4. [获取 RabbitMQ](https://www.rabbitmq.com/download.html)

   - Windows 通过官网下载 RabbitMQ 安装包，配合 Erlang 环境启动

   - Linux 通过包管理器安装 RabbitMQ

   - Linux 通过 [Dcoker](https://hub.docker.com/_/rabbitmq) 拉取 RabbitMQ 镜像并启动

5. 管理 RabbitMQ

   RabbitMQ 提供了一个 Web 管理页面，默认在 15672 端口，登录后可以管理 RabbitMQ 的服务的相关配置

   如添加一个虚拟主机

   ![image-20211110224645528](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211110224646556.png)

   如添加一个用户，可以设置用户对虚拟主机的访问权限

   ![image-20211110223853339](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211110223854349.png)

## RabbitMQ 使用

> 下列代码的 RabbitMQ 版本为 3.8.23

### 创建通道

```java
 // 获取 MQ 连接对象的工厂对象
ConnectionFactory connectionFactory = new ConnectionFactory();
// 设置连接 IP
connectionFactory.setHost("127.0.0.1");
// 设置端口号
connectionFactory.setPort(5672);
// 设置虚拟主机
connectionFactory.setVirtualHost("demoMQ");
// 设置用户名和密码
connectionFactory.setUsername("demoUser");
connectionFactory.setPassword("xxxxxxx");
// 获取连接对象
Connection connection = connectionFactory.newConnection();
// 创建通道对象
Channel channel = connection.createChannel();
```

### 创建队列

![image-20211113163953778](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211113163956144.png)

```java
channel.queueDeclare("demoQueue", false, false, false, null);
/**
  * 参数 1 queue：消息队列名称
  * 参数 2 durable：队列是否持久化（不包括队列中的消息）
  * 参数 3 exclusive：当前连接是否独占队列
  * 参数 4 autoDelete：消息消费完成且断开连接后是否自动删除队列
  * 参数 5 argument：额外的参数
  */
```

### 工作队列模型

1. 工作队列模型

   使用一个消息队列，有一个或多个消费者，各消费者获取不同的消息进行消费

   ![img](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211113164740706.png)

2. 发布消息

   ![image-20211113170015290](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211113170016331.png)

   ```java
   channel.basicPublish("", "demoQueue", null, "demo queue".getBytes());
   /**
    * 参数 1 exchange：交换机名
    * 参数 2 routingKey：路由
    * 参数 3 props；额外参数
    * 参数 4 body：消息的 byte 数组
    */
   ```

   > 交换机名称为空字符时，使用默认交换机
   >
   > 每一个队列会自动将队列同名的 Routing Key 绑定到默认交换机上
   >
   > channel 和 connection 使用完成后需要关闭

3. 消费消息

   ![image-20211113172941017](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211113172942062.png)

   ```java
   // 绑定和生产者相同的队列
   channel.queueDeclare("demoQueue", false, false, false, null);
   // 启动消息监听
   /**
    * 参数 1 queue：队列名
    * 参数 2 autoAck：是否自动确认
    * 参数 3 callback：回调接口对象
    */
   channel.basicConsume("demoQueue", true, new DefaultConsumer(channel) {
       		// body 是消息内容
               @Override
               public void handleDelivery(String consumerTag, Envelope envelope,
                                          BasicProperties properties,
                                          byte[] body) throws IOException {
                   System.out.println(new String(body));
               }
           });
   ```

4. 消息分配

   > 在工作队列模型中，多个消费者默认平均分配消息
   >
   > 如果使用手动确认，且设置每个通道同时只消费一个消息，只有确认后才能消费下一个消息
   >
   > 这种方式消息分配数量和处理速度有关，即能者多劳

   手动确认消息

   ```java
   // 设置通道同时只能消费一个消息
   // 通道确认消息后，才会获取新消息的分配
   channel.basicQos(1);
   // autoAck false
   channel.basicConsume("demoQueue", false, new DefaultConsumer(channel) {
       @SneakyThrows
       @Override
       public void handleDelivery(String consumerTag, Envelope envelope,
                                  BasicProperties properties,
                                  byte[] body) {
           System.out.println(new String(body));
           Thread.sleep(3000);
           // 参数 1：消息的标志，通过 envelope.getDeliveryTag() 获取
           // 参数 2：是否开启多消息确认
           channel.basicAck(envelope.getDeliveryTag(), false);
       }
   });
   ```

### 发布订阅模型

1. 广播模型

   每个消费者都有自己的队列，每个队列都要绑定到交换机，生产者将消息发送到交换机，由交换机进行分配

   ![img](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211113202800606.png)

2. 发布消息

   ```java
   // 声明交换机
   // 参数 1：交换机名称
   // 参数 2：交换机类型，fanout 广播
   channel.exchangeDeclare("demoExchange", "fanout");
   // 发送消息
   channel.basicPublish("demoExchange", "", null, "demo exchange".getBytes());
   ```

3. 消费消息

   ```java
   // 声明交换机
   channel.exchangeDeclare("demoExchange", "fanout");
   // 获取临时队列名称
   String tempQueueName = channel.queueDeclare().getQueue();
   // 绑定队列到交换机
   channel.queueBind(tempQueueName, "demoExchange", "");
   // 启动消息监听
   channel.basicConsume(tempQueueName, false, new DefaultConsumer(channel) {
       @SneakyThrows
       @Override
       public void handleDelivery(String consumerTag, Envelope envelope,
                                  BasicProperties properties,
                                  byte[] body) {
           System.out.println(new String(body));
           channel.basicAck(envelope.getDeliveryTag(), false);
       }
   });
   ```

   > 发布订阅模型中生产者只要声明交换机即可，消费者声明临时队列并绑定到交换机，Routing Key 全部使用空字符串，一旦交换机接收到消息，就转发到每一个绑定的队列

### 路由主题模型

1. 路由主题模型

   在发布订阅模型中，全部消费者都可以获取相同的消息

   在路由主题模型中，交换机不再将消息转发到每一个队列，而且根据路由和主题进行匹配

   ![img](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211114002122113.png)

2. 发布消息

   ```java
   // 声明交换机
   channel.exchangeDeclare("routeExchange", "direct");
   // 发送消息
   // 发布一条消息，Routing Key 为 info
   channel.basicPublish("routeExchange", "info", null, "demo route info".getBytes());
   // 发布一条消息，Routing Key 为 error
   channel.basicPublish("routeExchange", "error", null, "demo route error".getBytes());
   ```

3. 消费消息

   ```java
    // 声明交换机，direct 类型
   channel.exchangeDeclare("routeExchange", "direct");
   // 获取临时队列名称
   String tempQueueName = channel.queueDeclare().getQueue();
   // 绑定交换机、队列和 Routing Key
   channel.queueBind(tempQueueName, "routeExchange", "info");
   // 启动消息监听
   channel.basicConsume(tempQueueName, false, new DefaultConsumer(channel) {
       @SneakyThrows
       @Override
       public void handleDelivery(String consumerTag, Envelope envelope, 
                                  BasicProperties properties,
                                  byte[] body) {
           System.out.println(new String(body));
           channel.basicAck(envelope.getDeliveryTag(), false);
       }
   });
   ```

   > channel.queueBind 可以多次调用，以绑定多个 Routing Key

4. 动态路由

   动态路由可以在 Routing Key 中使用通配符，`#`代表任意字符串，`*`代表一个单词

   生产者发布消息

   ```java
   // 声明交换机
   channel.exchangeDeclare("topicExchange", "topic");
   // 发送几个不同路由的消息
   channel.basicPublish("topicExchange", "log.error", null, "log.error".getBytes());
   channel.basicPublish("topicExchange", "log.error.file", null, "log.error.file".getBytes());
   channel.basicPublish("topicExchange", "log.info", null, "log.info".getBytes());
   channel.basicPublish("topicExchange", "log.info", null, "user.info".getBytes());
   ```

   消费者绑定队列

   ```java
   // 声明交换机，topic 类型
   channel.exchangeDeclare("topicExchange", "topic");
   // 获取临时队列名称
   String tempQueueName = channel.queueDeclare().getQueue();
   // 绑定队列和路由
   channel.queueBind(tempQueueName, "topicExchange", "log.*");
   /**
    * log.* 可以匹配 log.error、log.info
    * log.# 可以匹配 log.error、log.info、log.error.file
    * *.info 可以匹配 log.info、user.info
    */
   ```

   > 三大模型总结：
   >
   > 工作队列模型：无交换机单队列，争消息
   >
   > 发布订阅模型：有交换机空路由，同消息
   >
   > 路由主题模型：有交换机有路由，按路由

## 集成 SpringBoot

1. 引入依赖

   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-amqp</artifactId>
   </dependency>
   ```

2. 配置 application.yaml

   ```java
   spring:
     rabbitmq:
       host: 127.0.0.1
       port: 5672
       username: demoUser
       password: xxxxx
       virtual-host: demoMQ
   ```

   > 配置完成后，RabbitTemplate 就可用了。RabbitTemplate 封装了一系列 RabbitMQ 的操作

3. 工作队列模型

   发布消息

   ```java
   @SpringBootTest
   public class RabbitProviderTest {
       @Autowired
       RabbitTemplate rabbit;
       // 模拟 RabbitConsumer 对象
       // 防止启动测试时实例化出的 RabbitConsumer 消费消息
       @MockBean
       public RabbitConsumer consumer;
       
       @Test
       public void queueProvide() {
           // 发送消息到队列
           rabbit.convertAndSend("demoQueue", "hello demo queue");
       }
   }
   ```

   消费消息

   ```java
   @Component
   // @Queue 可以指定 durable、exclusive 等参数
   // 默认等同于 channel.queueDeclare("demoQueue", true, false, false, null);
   @RabbitListener(queuesToDeclare = @Queue(name = "demoQueue"))
   public class RabbitConsumer {
       // 消息处理器，可直接获取消息体
       @RabbitHandler
       public void queueConsume(String message) {
           System.out.println(message);
       }
   }
   /**
    * @RabbitListener 也可以用在方法上，表示方法为消息处理器
    */
   ```

   > 在 Spring AMQP 中，工作队列模型是公平消费的，可以通过配置预处理个数和手动确认来实现能者多劳

4. 发布订阅模型

   发布消息

   ```java
   @SpringBootTest
   public class RabbitProviderTest {
       @Autowired
       RabbitTemplate rabbit;
       @MockBean
       public RabbitConsumer consumer;
       
       @Test
       public void subscribeProvide() {
           rabbit.convertAndSend("demoExchange","", "hello demo exchange" + i);
       }
   }
   ```

   消费消息

   ```java
   @Component
   public class RabbitConsumer {
       // 第一个消费者
       // @Queue 不指定参数则创建临时队列
       @RabbitListener(bindings = @QueueBinding(value = @Queue, key = "",
               exchange = @Exchange(name = "demoExchange", type = "fanout")))
       public void subscribeConsumer1(String message) {
           System.out.println("subscribeConsume1 接收：" + message);
       }
       // 第二个消费者
       @RabbitListener(bindings = @QueueBinding(value = @Queue, key = "",
               exchange = @Exchange(name = "demoExchange", type = "fanout")))
       public void subscribeConsumer2(String message) {
           System.out.println("subscribeConsume2 接收：" + message);
       }
   }
   ```

5. 路由主题模型

   发布消息

   ```java
   @SpringBootTest
   public class RabbitProviderTest {
       @Autowired
       RabbitTemplate rabbit;
       @MockBean
       public RabbitConsumer consumer;
       
       @Test
       public void routeProvide() {
           rabbit.convertAndSend("routeExchange", "log.error", "log.error");
           rabbit.convertAndSend("routeExchange", "log.info", "log.info");
           rabbit.convertAndSend("routeExchange", "log.error.file", "log.error.file");
           rabbit.convertAndSend("routeExchange", "user.info", "user.info");
       }
   }
   ```

   消费消息

   ```java
   @Component
   public class RabbitConsumer {
   
       @RabbitListener(bindings = @QueueBinding(value = @Queue, key = "log.*",
               exchange = @Exchange(name = "routeExchange", type = "topic")))
       public void routeConsumer1(String message) {
           System.out.println("routeConsumer1 接收：" + message);
       }
   
       @RabbitListener(bindings = @QueueBinding(value = @Queue, key = "log.#",
               exchange = @Exchange(name = "routeExchange", type = "topic")))
       public void routeConsumer2(String message) {
           System.out.println("routeConsumer2 接收：" + message);
       }
   
       @RabbitListener(bindings = @QueueBinding(value = @Queue, key = "*.info",
               exchange = @Exchange(name = "routeExchange", type = "topic")))
       public void routeConsumer3(String message) {
           System.out.println("routeConsumer3 接收：" + message);
       }
   }
   /**
    * 若要使用通配符实现动态路由，则需指定 type 为 topic
    * 不使用通配符，指定为 direct 即可
    */
   ```


## RabbitMQ 集群

1. 基础步骤

   准备 RabbitMQ 服务，部署两台或以上 RabbitMQ 服务

   配置`.erlang.cookie`文件，`.erlang.cookie`是加入服务集群的密钥，在集群服务中保持一致

   在从节点上执行加入集群命令

   ```shell
   rabbitmqctl join_cluster --ram rabbit@<主机名称>
   # --ram 表示设置为内存节点，不加则默认为磁盘节点
   ```

   在任意节点上设置镜像队列

   ```shell
   rabbitmqctl set_policy <策略名称> "<队列名称>" '{"ha-mode":"<镜像模式>"}'
   # 参数 1：策略名称
   # 参数 2：队列名称的匹配规则，可使用正则表达式
   # 参数 3：镜像队列的主体规则，json 字符串，有三个属性：ha-mode/ha-params/ha-sync-mode
   # ha-mode：镜像模式，all/exactly/nodes，all 存储在所有节点
   # --vhost 设置虚拟主机
   ```

2. Docker  RabbitMQ 集群

   拉取 RabbitMQ 镜像

   ```shell
   docker pull rabbitmq:3.8.23-management
   ```

   准备`rabbitmq.conf`配置文件，配置默认账户、默认虚拟主机等

   ```shell
   loopback_users.guest = false
   listeners.tcp.default = 5672
   management.tcp.port = 15672
   default_user = cluster
   default_pass = xxxxx
   default_vhost = clusterMQ
   ```

   启动三个 RabbitMQ 容器，挂载相同的`.erlang.cookie`文件

   ```shell
   # 1
   docker run \
   	--name rabbitmq1 \
   	-h rabbitmq1 \
   	-p 15673:15672 \
   	-p 5673:5672 \
   	-v /var/docker/rabbitmq_cluster/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf \
   	-v /var/docker/rabbitmq_cluster/data1:/var/lib/rabbitmq \
   	-v /var/docker/rabbitmq_cluster/.erlang.cookie:/var/lib/rabbitmq/.erlang.cookie \
   	-d rabbitmq:3.8.23-management
   # 2
   docker run \
   	--name rabbitmq2 \
   	-h rabbitmq2 \
   	-p 15674:15672 \
   	-p 5674:5672 \
   	-v /var/docker/rabbitmq_cluster/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf \
   	-v /var/docker/rabbitmq_cluster/data2:/var/lib/rabbitmq \
   	-v /var/docker/rabbitmq_cluster/.erlang.cookie:/var/lib/rabbitmq/.erlang.cookie \
   	--link rabbitmq1:rabbitmq1 \
   	-d rabbitmq:3.8.23-management
   # 3
   docker run \
   	--name rabbitmq3 \
   	-h rabbitmq3 \
   	-p 15675:15672 \
   	-p 5675:5672 \
   	-v /var/docker/rabbitmq_cluster/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf \
   	-v /var/docker/rabbitmq_cluster/data3:/var/lib/rabbitmq \
   	-v /var/docker/rabbitmq_cluster/.erlang.cookie:/var/lib/rabbitmq/.erlang.cookie \
       --link rabbitmq1:rabbitmq1 --link rabbitmq2:rabbitmq2 \
   	-d rabbitmq:3.8.23-management
   ```

   加入集群

   ```shell
   # 进入容器
   docker exec -it rabbitmq2 bash
   # 停止服务
   rabbitmqctl stop_app
   # 加入节点 1，rabbit@ 后需要使用主机名，使用 ip 不行
   # 主机名即 docker run -h 后的参数
   rabbitmqctl join_cluster --ram rabbit@rabbitmq1
   ```

   ![image-20211114151829556](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211114151831796.png)

   配置策略，指定虚拟主机为 clusterMQ

   ```shell
   rabbitmqctl set_policy --vhost clusterMQ demoPolicy "^" '{"ha-mode":"all"}'
   # 使用 "^" 表示对所有队列进行镜像
   ```

   ![image-20211114154952146](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211114154954088.png)

