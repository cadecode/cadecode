---

title: Redis 数据类型与持久化
date: 2021/12/23
description: 本文介绍了 Redis 的基本类型，包含 5 种基本数据类型和 3 种特殊数据类型，以及 RDB 和 AOF 的两种持久化方式的配置方式
tag: [中间件, Redis]

---

# Redis 数据类型与持久化

## Redis 简介

1. 什么是 Redis

   Redis 是一款内存高速缓存数据库，全称为：Remote Dictionary Server（远程数据服务），使用C语言编写
   
   Redis 是一种支持 key-value 等多种数据结构的存储系统，提供字符串，哈希，列表，队列，集合结构直接存取，基于内存，可持久化。可用于缓存，事件发布或订阅，高速队列等场景

2. Redis 的优势

   性能高：每秒万级写操作，十万级读操作

   数据类型丰富：对开发人员常见数据类型提供了原生支持

   原子性：Redis 的所有操作都是原子性的，同时还可保证几个操作合并执行的原子性

   丰富的特性：设置过期/发布订阅/可持久化/分布式集群等

3. Redis 快的原因

   基于内存

   基于简单的数据结构

   基于 C 语言实现 IO 多路复用

   基于单线程，避免了线程切换的开销

   > Redis 执行命令的工作线程是单线程，但是也有其他线程，如 IO 线程
   >
   > 事实证明，Redis 的单机性能的瓶颈是网络速度和网卡性能，而非 CPU

4. Redis IO 模型

   Redis IO 是基于 epoll 的多路复用模型

   ```markdown
   # IO
   1. 进程分配的内存分为用户空间和内核空间
   2. IO 操作包括 IO 调用和 IO 执行，IO 调用由程序发起，IO 执行是内核的工作
   3. IO 流程：
   	程序发起 IO 调用-> 内核读取 IO 数据，存放内核缓冲区 -> 拷贝数据到用户缓存区
   # BIO
   1. BIO：程序发起 IO 调用后，数据没有准备好，就一直等待
   2. 常见的应用：阻塞 socket、Java BIO
   # NIO
   1. NIO：通过轮询的方式请求数据状态而不用阻塞
   2. IO 多路复用：
   	select 函数：同时监控多个文件描述符 fd，通过遍历 fdset，找到就绪的 fd
   	epoll 函数：使用监听事件回调代替遍历文件描述符
   ```

## 基础数据类型

### String

> String 是 Redis 中最基本的数据类型，一个 key 对应一个 value

1. Redis 保证 String  类型是二进制安全的，可以包含任何数据，最多能存储 512M 字节

   如数字，字符串，图片或者序列化的对象

2. 命令

   ```shell
   # 设置 key value 键值对
   SET <key> <value>
   # key 不存在才设置
   SET <key> <value> NX
   # key 存在才设置
   SET <key> <value> XX
   # 获取 key 对应的 value
   GET <key>
   # 删除 key value 键值对
   DEL <key>
   # value 加/减 1
   INCR <key>
   DECR <key>
   # value 加/减指定数
   INCRBY <key> <num>
   DECRBY <key> <num>
   
   ```

3. 常用场景

   缓存数据

   计数器

### List

> 基于双端链表实现

1. 列表可以包含重复数据

2. 命令

   ```shell
   # 将 value 插入到链表的左（右）端
   LPUSH <name> <value>
   RPUSH ...
   # 弹出链表的左（右）端的值并返回
   LPUSH <name>
   RPUSH ...
   # 获取指定范围内的数据，索引值可以从 -1 开始
   LRANGE <name> <begin> <end>
   # 获取指定索引值的数据，索引值可以从 -1 开始
   LINDEX <name> <idx>
   # 删除与 value 相等的元素
   # 数量为 count 的绝对值，count 为负就从右开始，为 0 就删除全部
   LREM <name> <count> <value>
   # 依次访问多个 list，弹出第一个有值的 list 的最后一个值
   # 若没有获取到就会阻塞，阻塞时间为 0 则一直阻塞
   # 若获取到值，则返回对应的 [key value]
   BLPOP <name1> <name2> ... <timeout>
   BRPOP ...
   ```

3. 常用场景

   实现队列和栈

   实现消息队列（LPUSH + BRPOP）

### Set

> Set 是 String 类型的无序集合

1. Set 基于哈希表实现，元素不能重复，添加/删除/查找的复杂度都是 O(1)

2. 命令

   ```shell
   # 添加元素
   SADD <name> <value>
   # 查看总元素个数
   SCARD <name>
   # 随机删除一个元素
   SPOP <name>
   # 删除指定元素
   SREM <name> <value>
   # 返回所有元素
   SMEMBER <name>
   # 判断是否包含指定元素
   SISMEMBER <name> <value>
   # 随机返回一个或多个元素
   SRANDMEMBER <name> <count>
   # 取交集
   SINTER <name1> <name2>
   ```

3. 常用场景

   随机内容

   取交集

### Hash

> String 类型的 key 和 value 的映射表

1. hash 结构适合存储对象

2. 命令

   ```shell
   # 设置 k-v 到一个哈希表
   HSET <name> <key> <value>
   # 获取指定哈希表的指定 key 的 value
   HGET <name> <key>
   # 获取哈希表所有 key
   HGETALL <name>
   # 删除指定的 key
   HDEL <name> <key>
   ```


3. 常用场景

   缓存对象信息（比 String 节约空间）

### ZSet

>  String 类型元素的集合，且不允许重复的成员

1. 每个元素可以关联一个 double 类型的分数，用来排序，分数可以重复

2. 命令

   ```shell
   # 添加一个 value 并指定 score
   ZADD <name> <score> <value>
   # 获取指定索引范围内的元素（有序集合）
   ZRANGE <name> <begin> <end>
   # 获取指定分数范围内的元素
   ZCOUNT <name> <min> <max>
   # 删除指定元素
   ZREM <name> <value>
   ```

3. 常用场景

   排行

## 特殊数据类型

### HyperLogLogs

> Redis 2.8.9 开始支持 HyperLogLogs

1. HyperLogLogs 用于基数统计，基数是集合中不同元素的个数

2. 命令

   ```shell
   # 添加元素到集合
   PFADD <name> <value1> <value2> ... 
   # 统计数量
   PFCOUNT <name>
   # 合并 name2、name3 到 name 1
   PFMERGE <name1> <name2> <name3>
   ```

3. 常用场景

   计数（节省内存）

### Bitmap 

> 位图，用二进制进行记录，基于 String 类型实现

1. 适合两种状态的统计

2. 命令

   ```shell
   # 设置位图的指定位置是 0 还是 1
   SETBIT <name> <index> <0 | 1>
   # 获取指定位的数值
   GETBIT <name> <index>
   # 获取是 1 的记录条数
   BITCOUNT <name>
   ```

3. 常用场景

   签到：每个用户维护一个 Bitmap，日期作为索引，0/1 代表状态（数据太多可根据时间分片）

   统计活跃个数：不同时间使用不同的 Bitmap，用户 id 作为索引

   查询在线状态：使用一个 Bitmap，用户 id 作为索引

### geospatial 

> Redis 3.2 版本支持，用于推算两地距离，基于 ZSet 实现

1. geospatial 将指定的地理空间位置（纬度、经度、名称）添加到指定的 key 中，基于 ZSet

2. 命令

   ```shell
   # 添加经纬度、地名
   GEOADD <name> <longitude> <latitude> <address>...
   # 计算两地距离
   GEODIST <name> <address1> <address2> [m|km|ft|mi]
   # 获取指定坐标为中心、指定半径内的成员
   GEORADIUS <name> <longitude> <latitude> <radius> [m|km|ft|mi]
   # 获取指定成员为中心、指定半径内的成员
   GEORADIUSBYMEMBER <name> <address> <radius> [m|km|ft|mi]
   ```

3. 常用场景

   附近内容推荐

## Redis 持久化

> Redis 是基于内存的数据库，内存是断电即失的，所以需要持久化技术保证数据不丢失
>
> Redis 支持的常用的持久化技术有 RDB 和 AOF

### RDB

1. RDB 是 Redis Database 的缩写，是一种将数据快照保存到磁盘的技术

2. 触发方式：手动触发、自动触发

3. 手动触发的命令

   ```shell
   # 阻塞 Redis 直到完成快照（不推荐）
   SAVE
   # fork 一个子线程，异步进行快照（fork 过程是阻塞的）
   BGSAVE
   ```

4. 自动触发的场景

   配置文件配置了自动触发

   主从复制发生时

   执行 debug reload 命令重加载 Redis 时

   执行 shutdown 命令时（没有开启 AOF 持久化）

5. 配置自动触发

   Redis.conf

   ```shell
   # 默认执行快照的生效条件
   # 900 秒内有 1 条 key 变化
   save 900 1 
   # 300 秒内有 10 条 key 变化
   save 300 10
   # 60 秒内有 10000 条 key 变化
   save 60 10000
   # 关闭 RDB 快照
   # save ""
   
   # 文件名称
   dbfilename dump.rdb
   # 文件保存路径
   dir ~/redis/data/
   # 如果持久化出错，主进程是否停止写入
   stop-writes-on-bgsave-error yes
   # 是否压缩
   rdbcompression yes
   # 导入时是否检查（损失性能）
   rdbchecksum yes
   ```

6. RDB 优缺点

   优点：文件体积小，恢复数据快

   缺点：实时性不足，fork 线程成本高，快照生成慢

### AOF

1. AOF 是以文本形式记录执行命令的日志，每次执行先写内存，后写日志

2. 写后日志可以避免语句检查开销，但存在潜在风险

3. AOF 配置

   ```shell
   # 开启 AOF 持久化
   appendonly yes
   # 持久化的文件名，默认是 appendonly.aof
   appendfilename "appendonly.aof"
   # 持久化文件的保存位置
   dir ./
   
   # 同步策略，always/everysec
   appendfsync everysec
   ```

   `appendfsync`用来决定 Redis 将数据刷到磁盘的时机，选择 no 则由系统自行调度，Redis 默认选择了 everysec，每秒写入一次

3. 重写是对 AOF 文件的精简，通过 fork 子线程执行 bgrewriteaof 来完成

   ```shell
   # 重写期间是否同步
   no-appendfsync-on-rewrite no
   # 重写触发的百分比，超过该百分比就触发重写
   auto-aof-rewrite-percentage 100
   # 重写触发的最小文件大小
   auto-aof-rewrite-min-size 64mb
   ```

   `no-appendfsync-on-rewrite`表示是否在新命令执行时，如果 AOF 没有重写完毕，主线程是否继续写入 AOF。设置为 yes 表示重写完毕再写入新命令，避免磁盘 IO 冲突
