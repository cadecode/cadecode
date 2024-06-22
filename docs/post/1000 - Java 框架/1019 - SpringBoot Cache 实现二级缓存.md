---

title: SpringBoot Cache 实现二级缓存
date: 2023/6/18
description: 本文介绍 SpringBoot Cache 组件实现二级缓存的方式，包括 Caffeine 的介绍，Caffeine 内存淘汰策略，Caffeine 的几种缓存，以及二级缓存的实现和使用等
tag: [Java 框架, Redis, Caffeine, SpringBoot, Java]

---

# SpringBoot Cache 实现二级缓存

## 二级缓存介绍

1. 二级缓存分为本地缓存和远程缓存，也可称为内存缓存和网络缓存

2. 常见的流行缓存框架

   本地缓存：Caffeine，Guava Cache

   远程缓存：Redis，MemCache

3. 二级缓存的访问流程

   ![image-20230618110334830](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2023/06/18/20230618110352319.png)

4. 二级缓存的优势与问题

   优势：二级缓存优先使用本地缓存，访问数据非常快，有效减少和远程缓存之间的数据交换，节约网络开销

   问题：分布式环境下本地缓存存在一致性问题，本地缓存变更后需要通知其他节点刷新本地缓存，这对一致性要求高的场景可能不能很好的适应

## SpringBoot Cache 组件

1. SpringBoot Cache 组件提供了一套缓存管理的接口以及声明式使用的缓存的注解

   引入 SpringBoot Cache

   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-cache</artifactId>
   </dependency>
   ```

2. 如何集成第三方缓存框架到 Cache 组件

   实现 Cache 接口，适配第三方缓存框架的操作，实现 CacheManager 接口，提供缓存管理器的 Bean

   SpringBoot Cache 默认提供了 Caffeine、ehcache 等常见缓存框架的管理器，引入相关依赖后即可使用

   引入 Caffeine

   ```xml
   <dependency>
       <groupId>com.github.ben-manes.caffeine</groupId>
       <artifactId>caffeine</artifactId>
   </dependency>
   ```

   SpringBoot Redis 提供了 Redis 缓存的实现及管理器

   引入 Redis 缓存、RedisTemplate

   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-data-redis</artifactId>
   </dependency>
   ```

3. SpringBoot Cache 声明式缓存注解

   @Cacheable：执行方法前，先从缓存中获取，没有获取到才执行方法，并将其结果更新到缓存

   @CachePut：执行方法后，将其结果更新到缓存

   @CacheEvict：执行方法后，清除缓存

   @Caching：组合前三个注解

   @Cacheable 注解的常用属性：

   ```
   cacheNames/value：缓存名称
   key：缓存数据的 key，默认使用方法参数值，支持 SpEL
   keyGenerator：指定 key 的生成器，和 key 属性二选一
   cacheManager：指定使用的缓存管理器。
   condition：在方法执行开始前检查，在符合 condition 时，进行缓存操作
   unless：在方法执行完成后检查，在符合 unless 时，不进行缓存操作
   sync：是否使用同步模式，同步模式下，多个线程同时未命中一个 key 的数据，将阻塞竞争执行方法
   ```

   SpEL 支持的表达式

   ![image-20230618142309771](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2023/06/18/20230618142312530.png)

## 本地缓存 Caffeine

### Caffeine 介绍

1. Caffeine 是继 Guava Cache 之后，在 SpringBoot 2.x 中默认集成的缓存框架

2. Caffeine 使用了 Window TinyLFU 淘汰策略，缓存命中率极佳，被称为现代高性能缓存库之王

3. 创建一个 Caffeine Cache

   ```java
   Cache<String, Object> cache = Caffeine.newBuilder().build();
   ```

### Caffeine 内存淘汰策略

1. FIFO：先进先出，命中率低

2. LRU：最近最久未使用，不能应对冷门突发流量，会导致热点数据被淘汰
3. LFU：最近最少使用，需要维护使用频率，占用内存空间，
4. W-TinyLFU：LFU 的变种，综合了 LRU LFU 的长处，高命中率，低内存占用

### Caffeine 缓存失效策略

1. 基于容量大小

   根据最大容量

   ```java
   Cache<String, Object> cache = Caffeine.newBuilder()
                  	.maximumSize(10000)
                   .build();
   ```

   根据权重

   ```java
   Cache<String, Object> cache = Caffeine.newBuilder()
                   .maximumWeight(10000)
                   .weigher((Weigher<String, Object>) (s, o) -> {
                       // 根据不同对象计算权重
                       return 0;
                   })
                   .build();
   ```

2. 基于引用类型

   基于弱引用，当不存在强引用时淘汰

   ```java
   Cache<String, Object> cache = Caffeine.newBuilder()
                   .weakKeys()
                   .weakValues()
                   .build();
   ```

   基于软引用，当不存在强引用且内存不足时淘汰

   ```java
   Cache<String, Object> cache = Caffeine.newBuilder()
                   .softValues()
                   .build();

3. 基于过期时间

   expireAfterWrite，写入后一定时间后过期

   ```java
   Cache<String, Object> cache = Caffeine.newBuilder()
                   .expireAfterWrite(5, TimeUnit.SECONDS)
                   .build();
   ```

   expireAfterAccess(long, TimeUnit)，访问后一定时间后过期，一直访问则一直不过期

   expireAfter(Expiry)，自定义时间的计算方式

### Caffeine 线程池

1. Caffeine 默认使用 ForkJoinPool.commonPool()
2. Caffeine 线程池可通过 executor 方法设置

### Caffeine 指标统计

1. Caffeine 通过配置 recordStats 方法开启指标统计，通过缓存的 stats 方法获取信息
2. Caffeine 指标统计的内容有：命中率，加载数据耗时，缓存数量相关等

### Caffeine Cache 的种类

1. 普通 Cache

   ```java
   Cache<String, Object> cache = Caffeine.newBuilder()
                   .expireAfterWrite(5, TimeUnit.SECONDS)
                   .build();
   // 存入
   cache.put("key1", "123");
   // 取出
   Object key1Obj = cache.getIfPresent("key1");
   // 清除
   cache.invalidate("key1");
   // 清除全部
   cache.invalidateAll();
   ```

2. 异步 Cache

   响应结果通过 CompletableFuture 包装，利用线程池异步执行

   ```java
   AsyncCache<String, Object> asyncCache = Caffeine.newBuilder()
           .expireAfterWrite(5, TimeUnit.SECONDS)
           .buildAsync();
   // 存入
   asyncCache.put("key1", CompletableFuture.supplyAsync(() -> "123"));
   // 取出
   CompletableFuture<Object> key1Future = asyncCache.getIfPresent("key1");
   try {
       Object key1Obj = key1Future.get();
   } catch (InterruptedException | ExecutionException e) {
       //
   }
   // 清除
   asyncCache.synchronous().invalidate("key1");
   // 清除全部
   asyncCache.synchronous().invalidateAll();
   ```

3. Loading Cache

   和普通缓存使用方式一致

   在缓存未命中时，自动加载数据到缓存，需要设置加载数据的回调，比如从数据库查询数据

   ```java
   LoadingCache<String, Object> cache = Caffeine.newBuilder()
           .expireAfterWrite(5, TimeUnit.SECONDS)
           .build(key -> {
               // 获取业务数据
               return "Data From DB";
           });
   ```

4. 异步 Loading Cache

   和异步缓存使用方式一致

   在缓存未命中时，自动加载数据到缓存，与 Loading Cache 不同的是，加载数据是异步的

   ```java
   // 使用 AsyncCache 的线程池异步加载
   AsyncLoadingCache<String, Object> asyncCache0 = Caffeine.newBuilder()
           .expireAfterWrite(5, TimeUnit.SECONDS)
           .buildAsync(key -> {
               // 获取业务数据
               return "Data From DB";
           });
   // 指定加载使用的线程池
   AsyncLoadingCache<String, Object> asyncCache1 = Caffeine.newBuilder()
           .expireAfterWrite(5, TimeUnit.SECONDS)
           .buildAsync((key, executor) -> CompletableFuture.supplyAsync(() -> {
               // 异步获取业务数据
               return "Data From DB";
           }, otherExecutor));
   ```

   > 注意：AsyncLoadingCache 不支持弱引用和软引用相关淘汰策略

### Caffeine 自动刷新机制

1. Caffeine 可通过 refreshAfterWrite 设置定时刷新

   必须是指定了 CacheLoader 的缓存，即 LoadingCache 和 AsyncLoadingCache

   ```java
   LoadingCache<String, Object> cache = Caffeine.newBuilder()
                   .expireAfterWrite(5, TimeUnit.SECONDS)
                   .refreshAfterWrite(3, TimeUnit.SECONDS)
                   .build(key -> {
                       // 获取业务数据
                       return "Data From DB";
                   });
   ```

2. refreshAfterWrite 是一种定时刷新，key 过期时并不一定会立即刷新

## 实现二级缓存

### 配置类 DLCacheProperties

```java
@Data
@ConfigurationProperties(prefix = "uni-boot.cache.dl")
public class DLCacheProperties {

    /**
     * 是否存储 null 值
     */
    private boolean allowNullValues = true;

    /**
     * 过期时间，为 0 表示不过期，默认 30 分钟
     * 单位：毫秒
     */
    private long defaultExpiration = 30 * 60 * 1000;

    /**
     * 针对 cacheName 设置过期时间，为 0 表示不过期
     * 单位：毫秒
     */
    private Map<String, Long> cacheExpirationMap;

    /**
     * 本地缓存 caffeine 配置
     */
    private LocalConfig local = new LocalConfig();

    /**
     * 远程缓存 redis 配置
     */
    private RemoteConfig remote = new RemoteConfig();


    @Data
    public static class LocalConfig {

        /**
         * 初始化大小，为 0 表示默认
         */
        private int initialCapacity;

        /**
         * 最大缓存个数，为 0 表示默认
         * 默认最多 5 万条
         */
        private long maximumSize = 10000L;
    }

    @Data
    public static class RemoteConfig {

        /**
         * Redis pub/sub 缓存刷新通知主题
         */
        private String syncTopic = "cache:dl:refresh:topic";
    }
}
```

### 缓存实现 DLCache

本地缓存基于 Caffeine，远程缓存使用 Redis

实现 SpringBoot Cache 的抽象类，AbstractValueAdaptingCache

```java
@Slf4j
@Getter
public class DLCache extends AbstractValueAdaptingCache {

    private final String name;
    private final long expiration;
    private final DLCacheProperties cacheProperties;
    private final Cache<String, Object> caffeineCache;
    private final RedisTemplate<String, Object> redisTemplate;

    public DLCache(String name, long expiration, DLCacheProperties cacheProperties,
                   Cache<String, Object> caffeineCache, RedisTemplate<String, Object> redisTemplate) {
        super(cacheProperties.isAllowNullValues());
        this.name = name;
        this.expiration = expiration;
        this.cacheProperties = cacheProperties;
        this.caffeineCache = caffeineCache;
        this.redisTemplate = redisTemplate;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public Object getNativeCache() {
        return this;
    }

    @Override
    protected Object lookup(Object key) {
        String redisKey = getRedisKey(key);
        Object val;
        val = caffeineCache.getIfPresent(key);
        // val 是 toStoreValue 包装过的值，为 null 则 key 不存在
        // 因为存储的 null 值被包装成了 DLCacheNullVal.INSTANCE
        if (ObjectUtil.isNotNull(val)) {
            log.debug("DLCache local get cache, key:{}, value:{}", key, val);
            return val;
        }
        val = redisTemplate.opsForValue().get(redisKey);
        if (ObjectUtil.isNotNull(val)) {
            log.debug("DLCache remote get cache, key:{}, value:{}", key, val);
            caffeineCache.put(key.toString(), val);
            return val;
        }
        return val;
    }

    @SuppressWarnings("unchecked")
    @Override
    public <T> T get(Object key, Callable<T> valueLoader) {
        T val;
        val = (T) lookup(key);
        if (ObjectUtil.isNotNull(val)) {
            return val;
        }
        // 双检锁
        synchronized (key.toString().intern()) {
            val = (T) lookup(key);
            if (ObjectUtil.isNotNull(val)) {
                return val;
            }
            try {
                // 拦截的业务方法
                val = valueLoader.call();
                // 加入缓存
                put(key, val);
            } catch (Exception e) {
                throw new DLCacheException("DLCache valueLoader fail", e);
            }
            return val;
        }
    }

    @Override
    public void put(Object key, Object value) {
        putRemote(key, value);
        sendSyncMsg(key);
        putLocal(key, value);
    }

    @Override
    public void evict(Object key) {
        // 先清理 redis 再清理 caffeine
        clearRemote(key);
        sendSyncMsg(key);
        clearLocal(key);
    }

    @Override
    public void clear() {
        // 先清理 redis 再清理 caffeine
        clearRemote(null);
        sendSyncMsg(null);
        clearLocal(null);
    }

    private void sendSyncMsg(Object key) {
        String syncTopic = cacheProperties.getRemote().getSyncTopic();
        DLCacheRefreshMsg refreshMsg = new DLCacheRefreshMsg(name, key);
        // 加入 SELF_MSG_MAP 防止自身节点重复处理
        DLCacheRefreshListener.SELF_MSG_MAP.add(refreshMsg);
        redisTemplate.convertAndSend(syncTopic, refreshMsg);
    }

    private void putLocal(Object key, Object value) {
        // toStoreValue 包装 null 值
        caffeineCache.put(key.toString(), toStoreValue(value));
    }

    private void putRemote(Object key, Object value) {
        if (expiration > 0) {
            // toStoreValue 包装 null 值
            redisTemplate.opsForValue().set(getRedisKey(key), toStoreValue(value), expiration, TimeUnit.MILLISECONDS);
            return;
        }
        redisTemplate.opsForValue().set(getRedisKey(key), toStoreValue(value));
    }

    public void clearRemote(Object key) {
        if (ObjectUtil.isNull(key)) {
            Set<String> keys = redisTemplate.keys(getRedisKey("*"));
            if (ObjectUtil.isNotEmpty(keys)) {
                keys.forEach(redisTemplate::delete);
            }
            return;
        }
        redisTemplate.delete(getRedisKey(key));
    }

    public void clearLocal(Object key) {
        if (ObjectUtil.isNull(key)) {
            caffeineCache.invalidateAll();
            return;
        }
        caffeineCache.invalidate(key);
    }

    /**
     * 检查是否允许缓存 null
     *
     * @param value 缓存值
     * @return 不为空则 true，为空但允许则 false，否则异常
     */
    private boolean checkValNotNull(Object value) {
        if (ObjectUtil.isNotNull(value)) {
            return true;
        }
        if (isAllowNullValues() && ObjectUtil.isNull(value)) {
            return false;
        }
        // val 不能为空，但传了空
        throw new DLCacheException("Check null val is not allowed");
    }

    @Override
    protected Object fromStoreValue(Object storeValue) {
        if (isAllowNullValues() && DLCacheNullVal.INSTANCE.equals(storeValue)) {
            return null;
        }
        return storeValue;
    }

    @Override
    protected Object toStoreValue(Object userValue) {
        if (!checkValNotNull(userValue)) {
            return DLCacheNullVal.INSTANCE;
        }
        return userValue;
    }

    /**
     * 获取 redis 完整 key
     */
    private String getRedisKey(Object key) {
        // 双冒号，与 spring cache 默认一致
        return this.name.concat("::").concat(key.toString());
    }

    /**
     * 在缓存时代替 null 值，以区分是 key 不存在还是 val 为 null
     */
    @Data
    public static class DLCacheNullVal {
        public static final DLCacheNullVal INSTANCE = new DLCacheNullVal();
        private String desc = "nullVal";
    }
}
```

> 注意：需要区分缓存 get 到 null 值和 key 不存在，因此使用了 DLCacheNullVal 来代替 null 值

### 缓存管理器 DLCacheManager

缓存管理器

实现 SpringBoot Cache 的 CacheManager 接口

```java
@Slf4j
@RequiredArgsConstructor
public class DLCacheManager implements CacheManager {

    private final ConcurrentHashMap<String, DLCache> cacheMap = new ConcurrentHashMap<>();

    private final DLCacheProperties cacheProperties;
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public DLCache getCache(String name) {
        return cacheMap.computeIfAbsent(name, (o) -> {
            DLCache dlCache = buildCache(o);
            log.debug("Create DLCache instance, name:{}", o);
            return dlCache;
        });
    }

    private DLCache buildCache(String name) {
        Caffeine<Object, Object> caffeine = Caffeine.newBuilder();
        // 设置过期时间 expireAfterWrite
        long expiration = 0;
        // 获取针对 cache name 设置的过期时间
        Map<String, Long> cacheExpirationMap = cacheProperties.getCacheExpirationMap();
        if (ObjectUtil.isNotEmpty(cacheExpirationMap) && cacheExpirationMap.get(name) > 0) {
            expiration = cacheExpirationMap.get(name);
        } else if (cacheProperties.getDefaultExpiration() > 0) {
            expiration = cacheProperties.getDefaultExpiration();
        }
        if (expiration > 0) {
            caffeine.expireAfterWrite(expiration, TimeUnit.MILLISECONDS);
        }
        // 设置参数
        LocalConfig localConfig = cacheProperties.getLocal();
        if (ObjectUtil.isNotNull(localConfig.getInitialCapacity()) && localConfig.getInitialCapacity() > 0) {
            caffeine.initialCapacity(localConfig.getInitialCapacity());

        }
        if (ObjectUtil.isNotNull(localConfig.getMaximumSize()) && localConfig.getMaximumSize() > 0) {
            caffeine.maximumSize(localConfig.getMaximumSize());
        }
        return new DLCache(name, expiration, cacheProperties, caffeine.build(), redisTemplate);
    }

    @Override
    public Collection<String> getCacheNames() {
        return Collections.unmodifiableSet(cacheMap.keySet());
    }
}
```

### 缓存刷新监听器

缓存消息

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DLCacheRefreshMsg {

    private String cacheName;

    private Object key;
}
```

缓存刷新消息监听

```java
@Slf4j
@RequiredArgsConstructor
@Component
public class DLCacheRefreshListener implements MessageListener, InitializingBean {

    public static final ConcurrentHashSet<DLCacheRefreshMsg> SELF_MSG_MAP = new ConcurrentHashSet<>();

    private final DLCacheManager dlCacheManager;
    private final DLCacheProperties cacheProperties;
    private final RedisMessageListenerContainer listenerContainer;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        // 序列化出刷新消息
        DLCacheRefreshMsg refreshMsg = (DLCacheRefreshMsg) RedisUtil.getTemplate().getValueSerializer().deserialize(message.getBody());
        if (ObjectUtil.isNull(refreshMsg)) {
            return;
        }
        // 判断是不是自身节点发出
        if (SELF_MSG_MAP.contains(refreshMsg)) {
            SELF_MSG_MAP.remove(refreshMsg);
            return;
        }
        log.debug("DLCache refresh local, cache name:{}, key:{}", refreshMsg.getCacheName(), refreshMsg.getKey());
        // 清理本地缓存
        dlCacheManager.getCache(refreshMsg.getCacheName()).clearLocal(refreshMsg.getKey());
    }

    @Override
    public void afterPropertiesSet() {
        // 注册到 RedisMessageListenerContainer
        listenerContainer.addMessageListener(this, new ChannelTopic(cacheProperties.getRemote().getSyncTopic()));
    }
}
```

### 使用二级缓存

注入 DLCacheManager

```java
@Bean(name = "dlCacheManager")
    public DLCacheManager dlCacheManager(DLCacheProperties cacheProperties, RedisTemplate<String, Object> redisTemplate) {
        return new DLCacheManager(cacheProperties, redisTemplate);
    }
```

使用 @Cacheable 配合 DLCacheManager

```java
@ApiOperation("测试 @Cacheable")
@Cacheable(cacheNames = "test", key = "'dl'", cacheManager = "dlCacheManager")
@PostMapping("test_cacheable")
public String testCacheable() {
    log.info("testCacheable 执行");
    return "Cacheable";
}

@ApiOperation("测试 @Cacheable null 值")
@Cacheable(cacheNames = "test", key = "'dl'", cacheManager = "dlCacheManager")
@PostMapping("test_cacheable_null")
public String testCacheableNull() {
    log.info("testCacheableNull 执行");
    return null;
}

@ApiOperation("测试 @CachePut")
@CachePut(cacheNames = "test", key = "'dl'", cacheManager = "dlCacheManager")
@PostMapping("test_put")
public String testPut() {
    return "Put";
}

@ApiOperation("测试 @CacheEvict")
@CacheEvict(cacheNames = "test", key = "'dl'", cacheManager = "dlCacheManager")
@PostMapping("test_evict")
public String testEvict() {
    return "Evict";
}
```

