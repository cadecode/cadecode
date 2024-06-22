---

title: Redis 搭建哨兵集群
date: 2023/10/7
description: 本文介绍了 Redis 搭建哨兵集群的方式，包括主从复制的介绍、哨兵机制的结构和故障转移机制，以及哨兵的配置、客户端使用哨兵的方式等
tag: [中间件, Redis, 集群]

---

# Redis 搭建哨兵集群

## 主从复制

1. Redis 主从复制是 Redis 提供的一种数据冗余备份的机制，是 Redis 集群的基础

2. 主从复制集群存在的问题

   Redis 主从复制集群中，slave 节点会同步 master 节点的数据，当 master 节点宕机时，需要手动调整 slave 为新的主节点

   这种人工干预的方式，效率低，易出错，故障感知慢，不具备生产实用性

3. 如何实现主从复制集群的高可用性

   keepalived 双活方案：

   两个节点的主从复制集群，可以使用 keepalived 高可用工具软件，利用脚本监控 Redis 节点状态，在发生故障时，运行主从切换的脚本，客户端只需要连接 keepalived 暴露的虚拟 IP，可确保 Redis 服务一直是可用的

   该方案思想类似于 mysql 主主复制，利用 keepalived 的调控主从节点，达到高可用的目的

   缺点：扩展性低，当 Redis 节点增多时，利用 keepalived 配置难度大，利用脚本切换主从时间上不好优化，可能存在丢数据情况
   
   
   
   Redis 哨兵方案：
   
   Redis 官方提供一个高可用方案—哨兵，哨兵可以监控 Redis 集群的主从节点，在发生故障时通过一系列的机制进行选主及主从切换，实现故障转移，确保整个 Redis 服务的可用性

## 哨兵机制

### 哨兵的作用

以下介绍来自 [Redis 官方文档](https://redis.io/docs/management/sentinel/)

监控（Monitoring）：Sentinel不断的去检查你的主从实例是否按照预期在工作

通知（Notification）：Sentinel可以通过一个api来通知系统管理员或者另外的应用程序，被监控的Redis实例有一些问题

自动故障转移（Automatic failover）：如果一个主节点没有按照预期工作，Sentinel会开始故障转移过程，把一个从节点提升为主节点，并重新配置其他的从节点使用新的主节点，使用Redis服务的应用程序在连接的时候也被通知新的地址

配置提供者（Configuration provider）：Sentinel 给客户端的服务发现提供来源：对于一个给定的服务，客户端连接到 Sentinels 来寻找当前主节点的地址。当故障转移发生的时候，Sentinels 将报告新的地址

### 哨兵集群的结构

![image-20231018135025888](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2023/10/18/20231018135028676.png)

Redis 哨兵本身也是一个分布式系统，可以使用多个哨兵组成集群相互合作，这样设计的优点如下：

当多个哨兵都任务 master 不可用时，才进行故障检测，可以降低错误率

当有部分哨兵无法正常工作时，其他哨兵依然可以提供服务，提升了 Redis 集群的可用性

### 哨兵故障转移机制

1. 哨兵的定时监控

   每隔 10 秒，哨兵会对主从节点执行 info 命令，作用就是发现 slave 节点，并且确认主从关系

   每隔两秒，哨兵都会通过 master 节点的 channel 来交换信息，作用是交互每个哨兵对 master 节点的判断信息

   每隔 1 秒，哨兵对其他节点（master，slave，sentinel）执行 ping 命令，若 master 超过 30s 内没有回复，就对该 master 进行主观下线并询问其他的哨兵节点是否可以客观下线

   > 主观下线（SDOWN）：哨兵节点对 Redis 节点失败的判断
   >
   > 客观下线（ODOWN）：所有哨兵节点对 Redis 节点失败的共识

2. 哨兵 leader 选举

   在故障转移之前要选出哨兵 leader 用来执行故障转移操作

   主观下线的哨兵会对其他哨兵发送  is-master-down-by-addr 命令，一方面对主观下线征求意见，一方面为自己成为 leader 来“拉票”

   如果一个哨兵还没有同意过其他哨兵节点的拉票命令，那么它将同意，否则将拒绝，当然前提是该哨兵也认为该 Redis 节点主观下线

   如果该哨兵发现自己的票数已经超过哨兵集合数量的一半且超过配置的 quorum，那么它将成为 leader

   如果存在多个 leader，哨兵们将等待一会重新选举

3. 故障转移

   从 slave 中选择一个节点成为 master

   让其他 slave 同步新的 master

   对老的 master 保持关注，在其恢复后，使其成为新 master 的 slave

   > 如何挑选 slave 为 master？
   >
   > 选择 slave-priority 最高的 slave 节点
   > 选择复制偏移量最大的 slave 节点
   > 选择 runId 最小的 slave 节点

## 哨兵的配置

### 运行哨兵

sh

```shell
redis-sentinel /etc/sentinel.conf
```

docker

```shell
docker run --name redis_sentinel \
--restart=unless-stopped \
--net=host \
-v /docker/redis_sentinel/sentinel.conf:/etc/sentinel.conf \
-d redis:6.2.12 redis-sentinel /etc/sentinel.conf
```

### sentinel.conf

1. 最小配置

   ```shell
   # 配置监控一个集群
   # sentinel monitor master-name host port quorum
   # master-name 对集群命名，可以监控多个集群
   # quorum      需要多少个哨兵同意 master 主观下线
   sentinel monitor mymaster 127.0.0.1 6379 2
   # 指定多少毫秒，master 没有回答哨兵则主管下线  默认 30 秒
   sentinel down-after-milliseconds mymaster 60000
   # 故障转移的时间
   sentinel failover-timeout mymaster 180000
   # 指定了在发生主从切换时最多可以多少个 slave 同时对新的 master 进行同步
   sentinel parallel-syncs mymaster 1
   # redis 节点密码认证
   sentinel auth-pass mymaster 123456
   ```

2. 其他常用配置项

   ```shell
   # 哨兵实例运行的端口，默认 26379
   port 26379
   # 指定通知脚本，当有任何警告级别的事件发生，会调用该脚本
   sentinel notification-script mymaster /var/redis/notify.sh
   # 指定是否守护进程运行，默认情况下，不作为守护进程
   daemonize no
   # 启用守护进程运行后，将写入指定的 pid 文件
   pidfile /var/run/redis-sentinel.pid
   # 指定日志文件名，如果值为空，将强制日志标准输出
   # 守护进程下，如果使用标准输出进行日志记录，则日志将发送到 /dev/null
   logfile ""
   ```

## 客户端使用哨兵

1. Redis 哨兵需要显式的客户端支持

   Redis 客户端直接连接哨兵，哨兵可以完成故障转移，Redis 客户端需要感知这种变化，所以各个语言的 Redis 客户端都需要对哨兵进行显式的支持

2. Java Jedis 客户端对哨兵的处理

   Jedis 是 Redis Java 客户端中的老牌库

   Jedis 提供了一个 哨兵构造方法：

   ```java
   public JedisSentinelPool(String masterName, 
                            Set<String> sentinels,
                            final GenericObjectPoolConfig poolConfig, 
                            final int connectionTimeout, 
                            final int soTimeout,
                            final String password, 
                            final int database, 
                            final String clientName) {
       this.poolConfig = poolConfig;
       this.connectionTimeout = connectionTimeout;
       this.soTimeout = soTimeout;
       this.password = password;
       this.database = database;
       this.clientName = clientName;
   
       HostAndPort master = initSentinels(sentinels, masterName);
       initPool(master);
   }
   ```

   JedisSentinelPool 的基本处理逻辑：遍历哨兵集合，查询获取 master 节点信息，并对每个哨兵建立监听线程，获取变化消息后，更新 Redis 连接池

3. SpringBoot Redis 集成哨兵

   修改 Redis 连接配置

   ```yaml
   spring:
     redis:
       password: 123456
       sentinel:
         master: mymaster
         nodes:
           - 192.168.1.110:26379
           - 192.168.1.111:26379
           - 192.168.1.112:26379
   ```

   完成哨兵节点的 IP 和端口配置，RedisTemplate 将基于哨兵进行连接，并通过哨兵感知故障转移，从而具备了高可用能力
