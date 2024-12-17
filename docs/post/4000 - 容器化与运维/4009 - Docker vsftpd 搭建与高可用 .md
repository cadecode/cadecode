---

title: Docker vsftpd 搭建与高可用
date: 2024/8/30
description: 本文介绍 Docker 如何安装配置 vsftpd，包括镜像的制作，配置文件、使用方式介绍，以及利用 keepavlived 实现 FTP 服务高可用
tag: [容器化与运维, docker]

---

# Docker vsftpd 搭建与高可用

## 制作 vsftpd 镜像

`vsftpd` （very secure FTP daemon）是一个完全免费、开源的 FTP 服务器软件

`fauria/vsftpd` 是一个基于 `vsftpd` 的 Docker 镜像，在 Docker Hub 上拥有很高的下载量，可以使用此镜像轻松搭建 FTP 服务，但截止到 2024 年 8 月，此镜像已经超 2 年未有更新，其 [GitHub](https://github.com/fauria/docker-vsftpd) 上堆积了一些 ISSUE 有待处理，且此镜像不支持 ARM 平台，因此决定基于此项目制作新镜像，顺带解决一些问题

优化项如下：

- 支持记录 xferlog 和 vsftpd 详细日志
- vsftpd 日志可以同步到容器输出
- vsftpd 日志可以通过 logrotate 自动轮转
- 虚拟用户帐号的配置在容器重启后不会重置
- 配置文件中不会追加多余的内容（以修改代替追加）

编写 Dockerfile

```dockerfile
FROM centos:7

ARG USER_ID=14
ARG GROUP_ID=50

LABEL org.opencontainers.image.description=" A docker image for vsftpd, based on `fauria/vsftpd` project with some optimization." \
      org.opencontainers.image.source="https://github.com/cadecode/run-some-scripts/tree/main/vsftpd/3-centos7-fauria" \
      # org.opencontainers.image.documentation="" \
      # org.opencontainers.image.url="" \
      org.opencontainers.image.authors="Cade Li <cadecode@foxmail.com>" \
      org.opencontainers.image.title="rabbitmq" \
      org.opencontainers.image.version="3-centos7-fauria" \
      org.opencontainers.image.base.name="centos:7"

# Fixed centos7 mirrorlist being deprecated, with url `vault.centos.org` instead
RUN set -x; sed -i s/^#.*baseurl=http/baseurl=http/g /etc/yum.repos.d/*.repo \
  && sed -i s/^mirrorlist=http/#mirrorlist=http/g /etc/yum.repos.d/*.repo \
  && sed -i s/mirror.centos.org/vault.centos.org/g /etc/yum.repos.d/*.repo \
  && yum clean all \
  && yum makecache \
  && yum -y update \
  && yum clean all \
  && yum install -y vsftpd db4-utils db4 iproute cronie\
  && yum clean all

RUN set -x; usermod -u ${USER_ID} ftp \
    && groupmod -g ${GROUP_ID} ftp

ENV FTP_USER=**String** \
    FTP_PASS=**Random** \
    PASV_ADDRESS=**IPv4** \
    PASV_ADDR_RESOLVE=NO \
    PASV_ENABLE=YES \
    PASV_MIN_PORT=21100 \
    PASV_MAX_PORT=21110 \
    XFERLOG_STD_FORMAT=NO \
    LOG_STDOUT=**Boolean** \
    FILE_OPEN_MODE=0666 \
    LOCAL_UMASK=077 \
    REVERSE_LOOKUP_ENABLE=YES \
    PASV_PROMISCUOUS=NO \
    PORT_PROMISCUOUS=NO

COPY vsftpd.conf /etc/vsftpd/
COPY vsftpd_virtual /etc/pam.d/
COPY run-vsftpd.sh /usr/sbin/

RUN set -x; chmod +x /usr/sbin/run-vsftpd.sh \
    && mkdir -p /home/vsftpd/ \
    && chown -R ftp:ftp /home/vsftpd/

# Add logrotate job
COPY logrotate.conf /etc/vsftpd/
RUN (crontab -l; echo "0 1 * * * /usr/sbin/logrotate -f /etc/vsftpd/logrotate.conf") | crontab - \
    && chmod 644 /etc/vsftpd/logrotate.conf

VOLUME /home/vsftpd
VOLUME /var/log/vsftpd

EXPOSE 20 21

CMD ["/usr/sbin/run-vsftpd.sh"]
```

> Dockerfile 调整项：
>
> 1. centos7 软件仓库官方不在维护，调整到 vault.centos.org
> 2. 合并 ENV、RUN 命令，优化镜像分层
> 3. 支持 logrotate 轮转日志

修改 vsftpd 默认配置文件 `vsftpd.conf`

```
## Enable logging
xferlog_enable=YES
xferlog_file=/var/log/vsftpd/xfer.log

## Record both standard xferlog format and vsftpd logs
dual_log_enable=YES
# Records the details of the FTP session
# Works only when `xferlog_std_format` is not active
log_ftp_protocol=YES
vsftpd_log_file=/var/log/vsftpd/vsftpd.log
```

>配置文件调整项：
>
>1. 添加 dual_log_enable、log_ftp_protocol 配置，同时记录 xferlog 和 vsftpd log
>2. 调整 xferlog、vsftpd log 默认存放路径

vsftpd 启动脚本 `run-vsftpd.sh`

```shell
# Replace or append a configuration item
grep -q "^pasv_address=" /etc/vsftpd/vsftpd.conf && sed -i "s/^pasv_address=.*/pasv_address=${PASV_ADDRESS}/" /etc/vsftpd/vsftpd.conf || echo "pasv_address=${PASV_ADDRESS}" >> /etc/vsftpd/vsftpd.conf

# ...

if [ $LOG_STDOUT ]; then
    # Use `tail` to redirect vsftpd log to STDOUT
    # but the disadvantage is that the log will have redundancy
    # It is better to work with a log auto rotation
    tail -F $VSFTPD_LOG_FILE > /dev/stdout &
fi

## Run cron
crond

# Run vsftpd:
&>/dev/null /usr/sbin/vsftpd /etc/vsftpd/vsftpd.conf
```

> vsftpd 启动脚本调整项：
>
> 1. 使用 grep + sed 修改配置代替追加
> 2. 使用 tail 同步日志到容器标准输出
> 3. 使用 crond 启动 logrotate 自动轮转日志

打包镜像并推送 Docker Hub，支持多平台

```shell
docker buildx build --platform linux/arm64,linux/amd64 -t cadecode/vsftpd:3-centos7-fauria --push .
```

## 配置与启动容器

使用 docker compose 启动容器

```yaml
version: '3.8'

services:
  vsftpd:
    image: cadecode/vsftpd:3-centos7-fauria
    restart: unless-stopped
    ports:
      - "20:20"
      - "21:21"
      - "21100-21110:21100-21110"
    volumes:
      - vsftpd-config:/etc/vsftpd
      - ./home:/home/vsftpd
      - ./log:/var/log/vsftpd
    environment:
      # Default user
      FTP_USER: ftp
      FTP_PASS: ftp123
      # Passive mode
      PASV_ADDRESS: 192.168.100.1
      PASV_MIN_PORT: 21100
      PASV_MAX_PORT: 21110
      PASV_PROMISCUOUS: "YES"
      REVERSE_LOOKUP_ENABLE: "NO"

volumes:
  vsftpd-config:
    driver: local
    driver_opts:
      type: none
      device: ./config
      o: bind
```

```shell
docker compose up -d
```

容器配置项

| 配置项                | 描述                      | 可选值/默认值                   |
| --------------------- | ------------------------- | ------------------------------- |
| FTP_USER              | 默认用户账号              |                                 |
| FTP_PASS              | 默认用户密码              |                                 |
| PASV_ADDRESS          | 指定被动模式 IP 地址      |                                 |
| PASV_ADDR_RESOLVE     | 是否使用主机名            | YES, NO / NO                    |
| PASV_MIN_PORT         | 被动模式端口范围下限      |                                 |
| PASV_MAX_PORT         | 被动模式端口范围下限      |                                 |
| XFERLOG_STD_FORMAT    | 是否启用 xferlog 标准输出 | YES, NO / NO                    |
| LOG_STDOUT            | 是否输出到容器日志        | 任意字符串, 空字符串 / 空字符串 |
| REVERSE_LOOKUP_ENABLE | 是否启用 DNS 反向查找     | YES, NO / YES                   |
| PASV_PROMISCUOUS      | 是否禁用 PASV 安全检查    | YES, NO / NO                    |
| FILE_OPEN_MODE        | 上传文件使用的权限        | 0666                            |
| LOCAL_UMASK           | 本地用户 umask            | 077                             |

>上传文件的权限为：FILE_OPEN_MODE - LOCAL_UMASK
>
>如：0777 - 001 = 775，rwxrwxr_x

其他 vsftpd 配置项，可以映射配置文件`/etc/vsftpd/vsftpd.conf`进行修改

| 配置项           | 描述                               | 可选值/默认值 |
| ---------------- | ---------------------------------- | ------------- |
| dual_log_enable  | 是否同时打印 vsftpd log 和 xferlog | YES, NO / NO  |
| log_ftp_protocol | 是否打印 vsftpd 详细日志           | YES, NO / NO  |
| vsftpd_log_file  | vsftpd log 文件路径                |               |

> 当 XFERLOG_STD_FORMAT 启用时，log_ftp_protocol 可能不会按需要工作

## 利用 keepalived 实现高可用

利用 keepalived 配合容器健康检查，当主节点 FTP 服务不可用时，漂移 IP 到备节点，实现 FTP 服务高可用

编写 `docker-compose.yml`，加入 vsftpd 健康检查、keepavlied

```yaml
version: '3.8'

networks:
  shared:

services:
  vsftpd:
    image: fauria/vsftpd
    restart: unless-stopped
    container_name: vsftpd
    networks:
      - shared
    ports:
      - "20:20"
      - "21:21"
      - "21100-21110:21100-21110"
    volumes:
      - vsftpd-config:/etc/vsftpd
      - ./run-vsftpd.sh:/usr/sbin/run-vsftpd.sh
      - ./home:/home/vsftpd
      - ./log:/var/log/vsftpd
      - /tspnas:/tspnas
    environment:
      FTP_USER: ftp
      FTP_PASS: tmsftp
      PASV_ADDRESS: 10.141.114.171
      PASV_MIN_PORT: 21100
      PASV_MAX_PORT: 21110
      PASV_PROMISCUOUS: "YES"
      PORT_PROMISCUOUS: "NO"
      XFERLOG_STD_FORMAT: "NO"
      REVERSE_LOOKUP_ENABLE: "NO"
    healthcheck:
      test: ["CMD", "curl", "--silent", "--fail", "ftp://ftp:tmsftp@localhost:21"]
      interval: 30s
      retries: 3
      start_period: 10s
      timeout: 10s
  keepalived:
    image: arcts/keepalived:1.2.2
    container_name: vsftpd_keepalived
    restart: unless-stopped
    privileged: true
    network_mode: host
    cap_add:
      - NET_ADMIN
    pid: "host"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/bin/docker
      - ./keepalived/keepalived.conf:/etc/keepalived/keepalived.conf
      - ./keepalived/script:/script
      - ./keepalived/log:/log
    environment:
      KEEPALIVED_AUTOCONF: "false"
    command: sh -c 'mkdir -p /lib64 && ln -sf /lib/libc.musl-x86_64.so.1 /lib64/ld-linux-x86-64.so.2 && /init.sh'
    
volumes:
  vsftpd-config:
    driver: local
    driver_opts:
      type: none
      device: ./config
      o: bind
```

keepalived 所需脚本

```shell
### check.sh（通用检查脚本）
#!/bin/bash
date_str=$(date +"%Y-%m-%d %H:%M:%S")
state=0;
for app_name in $@;
do
  sh_name="/script/check_${app_name}.sh"
  if [[ -e ${sh_name} ]]; then :
    sh ${sh_name}  >> /log/keepalived_check.log 2>&1
    result=$?
    echo "${date_str} check [${app_name}], exit ${result}" >> /log/keepalived_check.log
    if [[ ${result} -ne 0 ]]; then :
        state=${result}
    fi
  else
    echo "${date_str} check [${app_name}], ${sh_name} not exsit" >> /log/keepalived_check.log
  fi
done
exit ${state}

### failover.sh（通用 failover 脚本）
cat > ${base_dir}/keepalived/script/failover.sh <<-EOF
#!/bin/bash
date_str=$(date +"%Y-%m-%d %H:%M:%S")
state=0
notify_type=$1
for app_name in ${@:2};
do
  sh_name="/script/failover_${notify_type}_${app_name}.sh"
  if [[ -e ${sh_name} ]]; then :
      sh ${sh_name} >> /log/keepalived_failover.log 2>&1
      result=$?
      echo "${date_str} failover ${notify_type} [${app_name}], exit ${result}" >> /log/keepalived_failover.log
      if [[ ${result} -ne 0 ]]; then :
          state=${result}
      fi
  else
      echo "${date_str} failover ${notify_type} [${app_name}], ${sh_name} not exsit" >> /log/keepalived_failover.log
  fi
done
exit ${state}

### get_docker_status.sh（容器健康检查脚本）
#!/bin/bash
cmd="docker inspect --format {{.State.Health.Status}} \$1"
status=\$(\${cmd})
result=\$?
if [[ \${result} == 0 && \${status} == 'healthy' ]]; then :
    exit 0
else
    exit 1
fi

### check_vsftpd.sh（vsftp 健康检查脚本）
#!/bin/bash
sh /script/get_docker_status.sh vsftpd
```

keepalived 配置，`keepalived.conf`

```yaml
! Configuration File for keepalived
global_defs {
    # 当前主机标识
    router_id pc01
    # 严格模式，一般不开启
    # vrrp_strict
    # 指定脚本执行用户
    script_user root
    enable_script_security
}
vrrp_script check_vsftpd_proxy {
        # 检查脚本
    script "/script/check.sh vsftpd"
    interval 10
        # 检查间隔
    weight -20
    rise 2
    fall 2
}
vrrp_instance vip_tms_ftp {
    # 初始状态
    state MASTER
    # 绑定的网卡
    interface bond0
    # 集群的统一标识
    virtual_router_id 37
    # 初始优先级
    priority 100
    # nopreempt
    # 心跳检查时间间隔，默认 1s
    advert_int 1
    # 认证配置
    authentication {
        # 认证模式：PASS
        auth_type PASS
        # 密码
        auth_pass 1111
    }
    # 单播
    unicast_src_ip 192.168.100.1
    unicast_peer {
        192.168.100.2
    }
    # 虚拟 IP
    virtual_ipaddress {
        192.168.100.3
    }
    track_script {
        check_vsftpd_proxy
    }
    notify_master "/script/failover.sh master vsftpd"
    notify_backup "/script/failover.sh backup vsftpd"
    notify_fault "/script/failover.sh falut vsftpd"
    notify_stop "/script/failover.sh stop vsftpd"
}
```

> 按实际网络结构调整虚拟 IP 配置项
>
> - unicast_src_ip：当前机器 IP
> - unicast_peer：其他机器 IP
> - virtual_ipaddress：虚拟 IP

