---

title: Docker 容器日志管理
date: 2023/11/18
description: 本文介绍了 Docker 查看容器日志的命令、限制 Docker 日志的配置方式，以及使用 logrotate 轮转一般日志的方法
tag: [容器化与运维, docker]

---

# Docker 容器日志管理

## 查看容器日志

Docker Daemon 启动容器后，会创建协程去接收容器内的标准输出，并通过 JSON 格式存放到 data-root 目录下的 containers 目录，没有特殊配置时一般是`/var/lib/docker/containers` 

使用命令可以查询容器日志

```shell
docker logs [参数] <容器名>
```

其他参数

```
--details         显示更多的信息
-f, --follow      跟踪实时日志
--since string    显示自某个timestamp之后的日志，或相对时间，如42m（即42分钟）
--tail string     从日志末尾显示多少行日志， 默认是all
-t, --timestamps  显示时间戳
--until string    显示自某个timestamp之前的日志，或相对时间，如42m（即42分钟）
```

当日志太多时需要跟踪日志，一般使用

```shell
docker logs -f <容器名> --tail=50 # 从最后 50 行开始看
```

对打印日志内容过滤

```shell
docker logs -f <容器名> 2>&1 | grep <搜索字符串>
```

## 配置日志限制

> 当容器日志太多时，查看不方便，磁盘占用大，因此需要对日志进行限制

### 全局配置

```json
# vim /etc/docker/daemon.json

{
  "log-driver":"json-file",
  "log-opts": {"max-size":"100m", "max-file":"10"}
}
```

log-opts 可配置单文件最大占用、文件最大数量

log-driver 配置 log 驱动，默认 json-file，还支持 syslog、fluentd 等

> 重启生效，但这种配置无法影响已有容器

### 单容器配置

在容器启动命令中添加参数配置日志

```shell
docker run --log-opt max-size=10m --log-opt max-file=10 <...>
```

同样可以指定 log-opt，优先级比全局配置高

## 使用日志轮转工具

对于一些场景，可能需要专门的日志轮转工具

- 对于已经在跑的容器，无法通过配置来限制日志
- 容器的一些其他 log 并非容器标准日志，不能通过配置 docker 来管理

logrotate 是一个古老的日志轮转命令工具，大多数 Linux 发行版已经内置，主要的功能是日志分片和清理

logrotate 命令使用方式

```shell
lograotate -s <轮转状态文件> <轮转配置文件>
# 其他参数
# -d debug 模式，不会真正执行，会打印执行结果
# -f 强制轮转，不管有没有达到轮转条件，如时间、文件大小
# -v 显示轮转过程信息
```

轮转状态文件默认是 `/var/lib/logotate/`下的 status 文件，记录了各种日志文件被轮转的时间

logrotate 的配置文件是`/etc/logrotate.conf`

```shell
weekly
rotate 4
create
include /etc/logrotate.d
```

默认配置文件配置了`include /etc/logrotate.d`，该目录下的所有配置文件都会生效，一般可以针对一种 log 创建一种轮转配置，放到 logrotate.d 目录下

logrotate 配置方式

```shell
/home/cade/test.log {
        daily        # 每日执行
        rotate 3     # 保留 3 个日志分片
        missingok    # 文件不存在时不报错
        dateext      # 后缀使用日期
        copytruncate # 复制原 log 文件后，清空文件内容
}
```

其他 logrotate 配置项

```shell
daily | weekly | monthly | yearly # 轮转周期条件
ifempty                           # 日志没有内容的时候也进行轮替
notifempty                        # 若日志为空，则不进行轮替
size                              # 日志大小达到多少后进行轮转，和轮转周期条件是 OR 的关系
minsize                           # 日志大小一定要超过多少后才轮转
nocompress                        # 轮替但不进行压缩
compress                          # 压缩轮替文件
dateext                           # 后缀-%Y %m %d形式日期，默认用序号
dateformat                        # 对日期后缀进行格式定制
sharedscripts                     # 所有日志轮转完成后，执行一遍脚本，不配置则重复执行
prerotate/endscript	              # 轮转之前执行，成对出现。
postrotate/endscript              # 轮转之后执行，成对出现。
olddir                            # 将旧日志移至指定目录下

# 生成日志的方式
create <权限数字> <文件所有者> <文件所有组> # 如 create 777 root root
# 重命名文件，生成新 log 文件，需要通知应用程序重新打开日志
copytruncate
# 复制原文件后，清空内容，不需要应用程序支持
```

logrotate 默认被系统自动按天调度，`/etc/cron.daily`目录下有一个 logrotate 脚本，该目录下的脚本将会按天调度

> 如果需要按小时调度，可以将该脚本放入`/etc/cron.hourly`，或者使用 crontab -e 自定义一个定时任务
