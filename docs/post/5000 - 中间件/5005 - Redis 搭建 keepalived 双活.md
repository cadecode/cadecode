---

title: Redis 搭建 keepalived 双活
date: 2022/6/20
description: 本文介绍了 Redis 搭建 keepalived 双活的方案，包括 keepavlived 的介绍、Redis 主从复制和高可用的概述，以及 Redis keepalived 双活的详细步骤
tag: [中间件, Redis, 集群]

---

# Redis 搭建 keepalived 双活

## keepalived 介绍

1. keepalived 是集群管理中常用的高可用服务软件，用来解决单点故障

2. 什么是单点故障？

   当服务是单节点或者不具备主从切换能力的集群，主节点宕时，整个服务不可用，称为单点故障

3. 常见的单点故障解决方案

   基于 DNS，一主机名多 IP，DNS 服务自带负载均衡，并且一般任务 DNS 服务是高可用的

   使用 keepalived，配置虚拟 IP，监控节点状态，在必要时将虚拟 IP 漂移到备用节点

4. keepalived 基本原理

   VRRP，虚拟链路冗余协议，在网络设计中用来做线路冗余、设备冗余等，防止网络存在单点故障

   keepalived 基于 VRRP 协议，将服务器当作路由设备，通过虚拟 IP 的漂移来达到高可用的目的

## Redis 主从复制

1. 什么是 Redis 主从复制？

   主从复制是一种由主节点向从节点同步数据的功能，Redis 的主从复制是单向的，只能由主到从

   主从复制的作用是提供数据的冗余备份，这正是高可用的基础

   使用 replicaof（5.0 之前 slaveof） 命令形成主从关系即可开启主从复制

2. 主从复制原理

   全量复制

   主从刚建立连接时，主库将所有数据生成 RDB 文件，发给从库进行同步，然后再把生成 RDB 过程中产生的修改发给从库

   增量复制

   Redis 2.8 开始支持增量复制，主要是为了解决网络闪断造成全量复制，开销很大的问题

   增量复制的原理是断开的一段时间内，主库保持一个记录主从差异数据的缓冲区

3. 为什么使用 RDB 进行数据同步的传输？

   RDB 是定时或需要全量复制时生成的快照，是经过压缩的二进制文件，体积小，恢复快

   相比之下 AOF 记录了每次执行的命令，有许多冗余命令，体积大，浪费带宽，并且需要选择刷盘策略，选择不当可能会影响性能

## Redis 高可用方案

1. Redis 哨兵模式

   Redis 主从复制保证了数据冗余备份，但当集群的主节点宕掉，整个集群将无法提供服务

   Redis 哨兵机制提供了集群监控的能力，在主节点宕掉时通过选举产生新主，并完成集群主从角色的切换

2. Redis keepalived 双活

   Redis 哨兵节点至少需要三台以上节点，因为哨兵节点也需要做高可用

   当只有两台机器用于部署 Redis 集群时，可以利用 keepalived 进行节点的监控和主从的切换，在资源有限的项目中不失为一个良好的高可用方案

## 环境准备与安装

> 使用 docker centos 镜像，启动两个容器，安装 Redis 和 keepalived 等软件，模拟两个 Redis 节点的集群

1. 节点 IP 和端口规划

   ```markdown
   # 服务节点 IP
   主节点 centos_1 172.18.0.4 
   从节点 centos_2 172.18.0.5
   # redis 端口
   centos_1 6376
   centos_2 6376
   # 虚拟 IP
   VIP 172.18.0.10
   ```

2. 启动两个节点

   拉取 centos 镜像

   ```shell
   docker pull centos:7
   ```

   启动两个 centos 容器

   ```shell
   docker run --name centos_1 --privileged=true --ip 172.18.0.4 -d centos:7 /usr/sbin/init
   docker run --name centos_2 --privileged=true --ip 172.18.0.5 -d centos:7 /usr/sbin/init
   ```

   查看容器 IP

   ```shell
   docker network inspect bridge | grep -A4 centos_
   ```

   ![image-20220702131305673](https://pic-bed.cadeli.top/2022/07/02/20220702131311657.png)

   进入容器

   ```shell
   docker exec -it centos_1 bash
   ```

3. 安装常用软件

   更新软件库

   ```shell
   yum update && yum upgrade
   ```

   安装 net-tools，提供 ifconfig 命令

   ```shell
   yum install net-tools
   ```

   安装 initscripts，提供 service 命令

   ```shell
   yum install initscripts
   ```

   docker 的 centos 镜像内部可能缺少一些常用命令，必要时自行安装

4. 安装 Redis 并启动

   安装 EPEL 软件库

   ```java
   yum install epel-release
   ```

   安装 Redis

   ```shell
   yum install redis
   ```

   修改 Redis 配置文件

   ```shell
   vi /etc/redis.conf
   ```

   主节点 centos_1

   ```
   bind 0.0.0.0
   requirepass 123456
   # 配置主从切换时，主节点的密码
   masterauth 123456
   ```

   从节点 centos_2

   ```
   bind 0.0.0.0
   requirepass 123456
   masterauth 123456
   # 启动时设置主节点
   slaveof 172.18.0.4 6379
   ```

   启动两个节点上的 Redis

   ```shell
   redis-server /etc/redis.conf >> redis.log 2>&1
   ```

   主节点添加一条测试数据

   ![image-20220702160028311](https://pic-bed.cadeli.top/2022/07/02/20220702160031416.png)

   从节点查看数据是否同步

   ![image-20220702160149773](https://pic-bed.cadeli.top/2022/07/02/20220702160152355.png)

5. 安装 keepalived

   ```shell
   yum install keepalived
   ```

## 配置 keepalived 

1. keepalived 配置的基本结构

   ```shell
   global_defs {
       # 全局配置
   }
   vrrp_script [脚本名称] {
   	# 自定义的检查脚本
   }
   vrrp_instance VI_1 {
       # vrrp 实例配置
   }
   virtual_server [IP] [端口] {
       # LVS 配置
   }
   ```

2. keeplaived Redis 主从切换配置

   ```shell
   ! Configuration File for keepalived
   
   global_defs {   
   	# 当前主机标识
   	router_id LVS_DEVEL
   	# 严格模式，一般不开启
   	# vrrp_strict
   	# 指定脚本执行用户
   	script_user root
   	enable_script_security    
   }
   
   vrrp_script redis_check {
   	# 检查脚本，参数：[密码]
   	script "/var/keepalived/scripts/redis_check.sh 123456"
   	# 检查时间间隔
   	interval 1
   	# 脚本执行结果导致的优先级变更
   	# 负数表示脚本退出状态非零时要减少的优先级
   	weight -20
   	# 重复执行的多少次才认为是成功或失败
   	rise 3
   	fall 3
   }
   
   vrrp_instance VI_1 {
   	# 初始状态
   	state MASTER
   	# 绑定的网卡
   	interface eth0
   	# 集群的统一标识
   	virtual_router_id 51
   	# 初始优先级
   	priority 100
   	# 心跳检查时间间隔，默认 1s
   	advert_int 1
   	# 认证配置
   	authentication {
   		# 认证模式：PASS
   		auth_type PASS
   		# 密码
   		auth_pass 1111
   	}
   	# 虚拟 IP
   	virtual_ipaddress {
   		172.18.0.10
   	}
   	# 状态检查脚本
   	track_script {
   		redis_check
   	}
   	# 当前节点变为 MASTER 时执行，参数：[密码]
   	notify_master "/var/keepalived/scripts/redis_master.sh 123456"
   	# 当前节点变为 BACKUP 时执行，参数：[密码] [主节点 IP] [主节点端口]
   	notify_backup "/var/keepalived/scripts/redis_slave.sh 123456 172.18.0.4 6379"
   	# 当发现节点故障时执行
   	notify_fault "/var/keepalived/scripts/redis_falut.sh"
   	# 当停止 VRRP 时执行
   	notify_stop "/var/keepalived/scripts/redis_stop.sh"
   }
   ```

   172.18.0.4 主节点初始状态设置为 MASTER，priority 为 100

   172.18.0.5 从节点初始状态设置为 BACKUP，priority 为 90

   当 .4 主节点 Redis 服务不可用时，优先级降低，VIP 漂移到 .5 上，但是当 .4 服务重新上线后，会抢走 MASTER 身份，造成不必要的主从切换，可以将 .4 配置为 nopreempt（非抢占模式）来避免

   如果 .4 配置为非抢占，将不会为 priority 所动，只有 .5 上 keepalived 服务宕掉，VIP 才会漂移到 .4

   > keepalived 的配置文件要求很严格，避免多余的空格，缩进须使用 Tab

3. 相关脚本

   redis_check.sh

   ```shell
   #!/bin/bash
   CMD_RES=`redis-cli -a $1 PING 2>/dev/null`
   LOG_FILE="/var/keepalived/logs/redis-state.log"
   if [ "$CMD_RES"x == "PONG"x ]; then :
      echo "[CHECK] `date`, SUCCESS" >> $LOG_FILE 2>&1
       exit 0
   else
       echo "[CHECK] `date`, ERROR" >> $LOG_FILE 2>&1
       exit 1
   fi
   ```

   redis_master.sh

   ```shell
   #!/bin/bash
   CMD="redis-cli"
   LOG_FILE="/var/keepalived/logs/redis-change.log"
   echo "[MASTER] `date`" >> $LOG_FILE
   echo "Run SLAVEOF NO ONE cmd" >> $LOG_FILE
   $CMD -a $1 SLAVEOF NO ONE >> $LOG_FILE 2>&1
   ```

   redis_slave.sh

   ```shell
   #!/bin/bash
   CMD="redis-cli"
   LOG_FILE="/var/keepalived/logs/redis-change.log"
   echo "[BACKUP] `date`" >> $LOG_FILE
   echo "Being slave wait to sync data" >> $LOG_FILE
   sleep 1  
   echo "Run SLAVEOF cmd" >> $LOG_FILE
   $CMD -a $1 SLAVEOF $2 $3 >> $LOG_FILE  2>&1
   ```

   redis_falut.sh

   ```shell
   #!/bin/bash
   LOG_FILE="/var/keepalived/logs/redis-state.log"
   echo "[FAULT] `date`" >> $LOG_FILE
   ```

   redis_stop.sh

   ```shell
   #!/bin/bash
   LOG_FILE="/var/keepalived/logs/redis-state.log"
   echo "[STOP] `date`" >> $LOG_FILE
   ```

## 验证双活

1. 测试 Redis 主从复制

   ![image-20220702234102316](https://pic-bed.cadeli.top/2022/07/02/20220702234108102.png)

2. 启动 keepalived

   ```shell
   service keepalived start
   ```

   也可以直接运行 keepalive 可执行文件

   ```shell
   # -f 指定配置文件，-l 开启控制台日志，-n 不在后台运行
   /sbin/keepalived -f /etc/keepalived/keepalived.conf -l -n
   ```

   ![image-20220702234318358](https://pic-bed.cadeli.top/2022/07/02/20220702234321098.png)

2. 测试故障转移

   通过 Redis cli 连接虚拟 IP，可以正常执行命令

   ![image-20220702234745083](https://pic-bed.cadeli.top/2022/07/02/20220702234750166.png)

   kill 掉主节点的 Redis 进程

   ![image-20220702234957384](https://pic-bed.cadeli.top/2022/07/02/20220702235000122.png)

   观察主节点 keepalived 日志

   ![image-20220702235104170](https://pic-bed.cadeli.top/2022/07/02/20220702235106917.png)

   直连原来的从节点测试写入

   ![image-20220702235304986](https://pic-bed.cadeli.top/2022/07/02/20220702235307562.png)

   172.18.0.5 上可以执行写入命令，说明该节点已经成功切换为主节点
