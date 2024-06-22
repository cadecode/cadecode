---

title: RabbitMQ 消息可靠性
date: 2023/1/3
description: 本文介绍 RabbitMQ 如何保证消息可靠消费，包括生产者发布消息可靠性、交换机投递消息可靠性，以及消费者消费消息可靠性等
tag: [中间件, RabbitMQ]

---

# RabbitMQ 消息可靠消费

## 消息可靠性介绍

### 消息可靠性是什么

在生产者消费者模型中，保证消息能被正确消费不丢失

### 为什么需要保证消息可靠性

由于网络波动和程序故障造成重要消息丢失，会影响生产业务，所以保证消息可靠至关重要

### RabbitMQ 如何保证消息可靠性

1. 首先在创建 RabbitMQ 交换机和队列时，开启持久化，保证宕机重启后消息不丢失
2. 生产者发布消息，会推送到交换机，要保证生产者能可靠推送，一般策略有开启消息事务、使用消息发送确认机制
3. 交换机需要投递消息到相应的队列，要保证交换机能可靠投递到队列，一般的策略有使用备份交换机、使用消息退回回调机制
4. 消费者接收到消息后，要保证在不能正确处理时不丢失消息，一般策略有持久化到其他中间件中后续处理、重新入队列、转入死信队列

## 生产者发布消息可靠性

### RabbitMQ 事务机制

RabbitMQ 支持 AMQP 事务机制，在 SpringBoot 中使用Rabbitmq 事务很方便

首先声明一个事务管理 Bean

```java
@Bean
public RabbitTransactionManager rabbitTransactionManager(CachingConnectionFactory connectionFactory) {
    return new RabbitTransactionManager(connectionFactory);
}
```

再开启 RabbitTemplate 的事务功能

```java
rabbitTemplate.setChannelTransacted(true);
```

发布消息时，使用 Spring 事务注解

```java
@Transactional
public void sendMsg(String excName, String key, String msg) {
    rabbitTemplate.convertAndSend(excName, key, msg);
    log.info("msg:{}", msg);
    if (msg != null && msg.contains(" ")){
        throw new RuntimeException("msg contains space!");
    }
    log.info("send over, {}" ,msg);
}
```

当 msg 包含空格时，会抛出异常，此时消息不会被发送，而是被事务回滚了

### 消息发送确认机制

RabbitMQ 消息发送确认机制是 AMQP 规范的增强，用来确认生产者是否成功将消息发送到交换机，在发送成功或失败时都可以获取一个通知来进行回调处理

SpringBoot 开启 RabbitMQ 消息发送确认

```yaml
rabbitmq:
	host: 127.0.0.1
    port: 5672
    username: rabbitmq
    password: xxxx
    virtual-host: default
    listener:
      simple:
        acknowledge-mode: manual
    publisher-confirm-type: correlated
```

配置 RabbitTemplate 的确认回调

```java
@Slf4j
@RequiredArgsConstructor
@Component
public class RabbitConfirmCallback implements RabbitTemplate.ConfirmCallback {

    private final RabbitTemplate rabbitTemplate;

    @PostConstruct
    public void init(){
        rabbitTemplate.setConfirmCallback(this);
    }

    @Override
    public void confirm(CorrelationData correlationData, boolean ack, String cause) {
        String id = correlationData != null ? correlationData.getId() : "";
        if (ack) {
            log.info("msg send ok, id:{}", id);
        } else {
            log.error("msg send fail, id:{}, cause:{}", id, cause);
        }
    }
}
```

发送消息时配置 CorrelationData

```java
CorrelationData correlationData = new CorrelationData(UUID.randomUUID().toString());
rabbitTemplate.convertAndSend(exc, key, msg, correlationData);
```

生产者发送消息到交换机，当发送成功或者发送失败（如交换机名称不存在）时都可以产生确认回调，在发送消息时将 CorrelationData 的 id 和消息存入缓存或数据库，方便后续进行补偿操作

生产者的消息发送确认机制是事务的轻量级替代方案，相比于事务机制，性能更好

## 交换机投递消息可靠性

### 备份交换机

RabbitMQ 支持为交换机配置一个备份交换机，当交换机遇到无法路由的消息时会将消息转发到备份交换机进行处理

通常备份交换机的类型为 Fanout ，这样能把所有转发来的消息都投递到与其绑定的队列中，监听队列来实现补偿或者报警

```java
// 声明业务 Exchange，名为 BUSINESS_EXCHANGE_1
@Bean("businessExchange")
public DirectExchange businessExchange() {
    ExchangeBuilder exchangeBuilder = ExchangeBuilder.directExchange("BUSINESS_EXCHANGE_1")
        .durable(true)
        .withArgument("alternate-exchange", "BACKUP_EXCHANGE_1");
    // withArgument 设置备份交换机
    return (DirectExchange)exchangeBuilder.build();
}
// 声明备份 Exchange，名为 BACKUP_EXCHANGE_1
@Bean("backupExchange")
public FanoutExchange backupExchange() {
    ExchangeBuilder exchangeBuilder = ExchangeBuilder.fanoutExchange("BACKUP_EXCHANGE_1")
        .durable(true);
    return (FanoutExchange)exchangeBuilder.build();
}
// 声明备份队列，名为 BACKUP_QUEUE_1
@Bean("backupQueue")
public Queue backupQueue() {
    return QueueBuilder.durable("BACKUP_QUEUE_1").build();
}
// 备份队列绑定到备份交换机
@Bean
public Binding backupBinding(@Qualifier("backupQueue") Queue queue,
                             @Qualifier("backupExchange") FanoutExchange exchange) {
    return BindingBuilder.bind(queue).to(exchange);
}
```

### 消息退回回调机制

RabbitMQ 消息退回回调机制可以在交换机无法路由，消息被退回时产生一个回调

SpringBoot 开启 RabbitMQ 开启消息退回回调确认

```yacas
rabbitmq:
	host: 127.0.0.1
    port: 5672
    username: rabbitmq
    password: xxxx
    virtual-host: default
    listener:
      simple:
        acknowledge-mode: manual
    publisher-confirm-type: correlated
	publisher-returns: true
```

除了设置 publisher-returns 开启，也可以设置 spring.rabbitmq.template.mandatory 或者 rabbitTemplate.setMandatory(true) 来开启，mandatory 设置的优先级要高于 publisher-returns

配置 RabbitTemplate 的退回回调

```java
@Slf4j
@RequiredArgsConstructor
@Component
public class RabbitReturnsCallback implements RabbitTemplate.ReturnsCallback {

    private final RabbitTemplate rabbitTemplate;

    @PostConstruct
    public void init() {
        rabbitTemplate.setReturnsCallback(this);
    }

    @Override
    public void returnedMessage(ReturnedMessage message) {
        log.warn("msg is returned, msg:{}, replyCode:{}. replyText:{}, exchange:{}, routingKey :{}",
                new String(message.getMessage().getBody()), message.getReplyCode(),
                message.getReplyText(), message.getExchange(), message.getRoutingKey());
    }
}
```

## 消费者消费消息可靠性

### 重新入队列

当不能确认一个消息时，可以将消息重回队列之中，后续再次消费

```java
channel.basicReject(deliveryTag, true);
```


basicReject 方法拒绝 deliveryTag 对应的消息，第二个参数是否requeue，true则重新入队列，否则丢弃或者进入死信队列。reject 后，该消费者还是会消费到该条消息

```java
channel.basicNack(deliveryTag, false, true);
```


basicNack 方法为不确认 deliveryTag 对应的消息，第二个参数是否应用于多消息，第三个参数是否 requeue，与  basicNack 的区别是同时支持多个消息，可以 nack 该消费者先前接收未 ack 的所有消息，nack 后的消息也会被自己消费到

```java
channel.basicRecover(true);
```


basicRecover 方法恢复消息到队列，参数是是否 requeue，true 则重新入队列，并且尽可能的将之前 recover 的消息投递给其他消费者消，false 则会重新被投递给自己

### 绑定死信队列

一般当消息被否定确认，basicNack/basicReject，且 requeue 为 false，会变为死信

RabbitMQ 声明一个队列时可以配置其死信交换机和路由，并为死信交换机绑定队列，即死信队列

当出现死信时，消息会被死信交换机根据路由推入死信队列，监听死信队列可以对消息进行补偿处理

```java
// 声明业务队列，配置其死信交换机和死信队列路由
@Bean
public Queue businessQueue() {
    return QueueBuilder.durable("BUSINESS_QUEUE_1")
        .withArguments(new HashMap<String, Object>() {{
            put("x-dead-letter-exchange", "DEAD_EXCHANGE_1");
            put("x-dead-letter-routing-key", "DEAD_QUEUE_1_KEY");
        }})
        .build();
}
```

