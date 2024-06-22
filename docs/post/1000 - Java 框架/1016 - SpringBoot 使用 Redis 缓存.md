---

title: SpringBoot 使用 Redis 缓存
date: 2022/1/12
description: 本文介绍 SpringBoot 集成 Redis 的基本步骤，如配置 Redis 连接信息，通过 RedisTemplate 和 Cache 组件注解操作 Redis，以及如何保证缓存和数据库的一致性
tag: [Java 框架, Redis, SpringBoot, Java]

---

# SpringBoot 使用 Redis 缓存

## Redis 介绍

1. Redis 是基于内存的 K-V 数据库
2. Redis 的速度很快，支持每秒十万级的 GET 和万级的 SET
   - 基于内存
   - IO 多路复用
   - 单线程，开销小
3. Redis 支持 String/List/Set/ZSet/Hash 五种基本数据类型
4. Redis 有丰富的客户端类库
   - Jedis，小巧而功能完善
   - Lettuce，高级的 Redis 客户端，支持集群
   - Redisson，功能强大的分布式中间件

## 集成 Redis

1. 引入 maven 依赖

   ```xml
   <!--redis 客户端-->
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-data-redis</artifactId>
   </dependency>
   <!--lettuce 依赖 commons-pool2-->
   <dependency>
     <groupId>org.apache.commons</groupId>
     <artifactId>commons-pool2</artifactId>
   </dependency>
   ```

   `spring-boot-starter-data-redis`的底层客户端在 SprinBoot 2.x 版本由 Jedis 换成了 Lettuce

   Lettuce 基于 commons-pool2 实现连接池

2. 配置连接信息

   ```yaml
   spring:
     application:
       name: springboot-app
     # redis
     redis:
       host: 127.0.0.1
       port: 6379
       database: 0
       password: xxxx
       # lettuce config
       lettuce:
         pool:
           # 最大活跃连接数
           max-active: 8
           # 最大阻塞等待时间（负数表示无限制）
           max-wait: -1
           # 池中保持的最大空闲连接数
           max-idle: 8
           # 至少要保持的最小空闲连接数
           min-idle: 0
   ```


## 使用 Redis

### RedisTemplate

> RedisTemplate 是 SpringBoot 提供的操作 Redis 的模板对象，提供 RedisTemplate 和 StringRedisTemplate 两种类型

1. StringRedisTemplate 是 RedisTemplate 的子类，等同于 RedisTemplate<String, String>，用于操作字符串类型

   ```java
   @SpringBootTest
   public class ApplicationTests {
       @Autowired
       StringRedisTemplate stringRedisTemplate;
       @Test
       void opsForValue() {
           // 存 String
           stringRedisTemplate.opsForValue().set("name", "Cade");
           // 取 String
           String name = stringRedisTemplate.opsForValue().get("name");
       }
   }
   ```

   支持`opsForValue`、`opsForList`、`opsForSet`、`opsForHash`等多种数据类型的操作

2. RedisTemplate<Object，Object> 是更全面的工具类，提供了操作对象的方式

   RedisTemplate 默认使用 JdkSerializationRedisSerializer 进行 Object 到 String 的双向转换

   可以将值的序列化修改为使用 JSON 方式，便于查看

   ```java
   @Bean
   public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
       RedisTemplate<String, Object> template = new RedisTemplate<>();
       template.setConnectionFactory(factory);
       // 设置 key 序列化方式
       template.setKeySerializer(RedisSerializer.string());
       // 设置 hash key 序列化方式
       template.setHashKeySerializer(RedisSerializer.string());
       // 设置 value 的序列化方式
       template.setValueSerializer(RedisSerializer.json());
       // 设置 hash value 的序列化方式
       template.setHashValueSerializer(RedisSerializer.json());
       return template;
   }
   ```

   RedisSerializer.json 是 Spring 提供的 Jackson 序列化方式，相当于

   ```java
   Jackson2JsonRedisSerializer<Object> jacksonSerializer = 
       new Jackson2JsonRedisSerializer<>(Object.class);
   ObjectMapper objectMapper = new ObjectMapper();
   // 将类型写入 JSON 中，JsonTypeInfo.As.PROPERTY 指写入类型的方式，如作为参数
   objectMapper.activateDefaultTyping(LaissezFaireSubTypeValidator.instance, 
                                      DefaultTyping.NON_FINAL, 
                                      JsonTypeInfo.As.PROPERTY);
   // 老版本 Jackson 中使用 enableDefaultTyping 开启写入类型
   jacksonSerializer.setObjectMapper(objectMapper);
   redisTemplate.setValueSerializer(jacksonSerializer);
   ```

### Cache 组件

1. `spring-boot-starter-cache`组件提供了统一的接口和注解帮助开发者使用缓存

   Cache 组件提供了多种缓存的实现，如 Redis、EhCache、Caffeine 等

   ```xml
   <!--cache 组件-->
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-cache</artifactId>
   </dependency>
   ```

2. 使用注解在 Redis 中缓存数据

   在启动类或配置类上使用`@EnableCaching`启用 Cache 组件

   ```java
   @Cacheable   // 写入缓存
   @CacheEvict  // 清理缓存
   @CachePut    // 更新缓存
   @Caching     // 多个注解结合使用
   @CacheConfig // 写在类上表示公共的注解选项
   ```

   @Cacheable

   key 支持 SpringEL 表达式，配合参数可以指定存到 Redis 的 key，默认使用 cacheNames:key 作为 Redis 的 key

   ```java
   @Cacheable(cacheNames = "string", key = "#str")
   public String get(String str) {
       // ...
       return str;
   }
   ```

   @CacheEvict

   ```java
   @CacheEvict(cacheNames = "string", key = "#str")
   public void remove(String str) {
       // ...
   }
   // 其他选项
   // allEntries 是否清空所有，默认 false
   // beforeInvocation 是否在方法调用前清理，默认 false
   ```

   @CachePut

   每次都会触发真实方法的调用，旨在更新对应缓存

   ```java
   @CachePut(cacheNames = "string", key = "#str")
   public String update(String str) {
       // ...
       return str;
   }
   ```

3. 配置 CacheManager

   引入 Redis 和 Cache 组件后，默认配置的 RedisCacheManager 使用了 JDK Serializer 序列化 value 

   在 SpringBoot 1.x 可以通过传入一个 RedisTemplate 来构建 RedisCacheManager

   在 SpringBoot 2.x 需要通过 RedisCacheManagerBuilder 创建 RedisCacheManager

   ```java
   @Bean
   public CacheManager redisCacheManager(RedisConnectionFactory factory) {
       RedisCacheConfiguration defaultConfiguration = RedisCacheConfiguration
           .defaultCacheConfig()
           .disableCachingNullValues()
           // 设置缓存有效期一小时
           .entryTtl(Duration.ofHours(1))
           // 配置 key 序列化方式
           .serializeKeysWith(RedisSerializationContext.SerializationPair
                              .fromSerializer(RedisSerializer.string()))
           // 配置 value 序列化方式
           .serializeValuesWith(RedisSerializationContext.SerializationPair
                                .fromSerializer(RedisSerializer.json()));
   
       return RedisCacheManager.builder(factory)
           // 设置默认的策略
           .cacheDefaults(defaultConfiguration)
           // 设置指定 cache 的策略
           // .withCacheConfiguration("myCacheName", defaultConfiguration)
           .build();
   }
   ```

   如果配置了多个缓存管理器，注解中指定 cacheManager 可以设置要使用的缓存管理器

## 缓存一致性

1. 缓存一致性问题

   为了提高查询效率，查询数据库获取数据后，将数据写入 Redis 缓存，查询操作会先查询缓存，如果命中缓存，可以降低数据库压力，提高系统吞吐量

   但是当数据需要更新，数据库和缓存的数据如何保持一致性是个问题

2. 删除缓存 VS 更新缓存

   对于缓存的更新，可以直接更新缓存数据，也可以删除缓存，等待下次查库后写入缓存

   但是在并发情况下，直接更新缓存因为顺序无法保证，容易造成旧值覆盖新值，且增加了维护成本

   如果选择加锁，则会降低系统吞吐量，这和加缓存的初衷相背

   一般推荐直接让缓存失效，即删除缓存

3. 更新数据库 + 删除缓存

   先删除缓存，后更新数据库

   ```
   线程 A：删除缓存 -------------------------------> 更新 DB
   线程 B：-------- 查缓存失效 -> 查询 DB -> 写入缓存
   ```

   先更新数据库，后删除缓存 

   ```
   线程 A：--------------------- 更新 DB -> 删除缓存
   线程 B：查缓存失效 -> 查询 DB -----------------> 写入缓存
   ```

   在并发情况下，两种方式都有一定概率会发生数据不一致问题

   先更新数据库，后删除缓存的可靠性更高，因为一般查询 DB 比 更新 DB 的时间要短

4. 延迟双删

   延迟双删是先删除缓存再更新数据库，休眠一定时间后再次删除缓存，目的是清除读请求造成的脏缓存

   具体过多久，需要根据查询数据库的耗时进行考量，一般为一秒左右

5. 异步更新

   通过订阅 MySQL 的 binlog 获取数据更新内容，通过 MQ 推送删除 Redis 缓存的消息

   这种方式对代码的侵入性较低，也可以解决删除失败的重试问题

