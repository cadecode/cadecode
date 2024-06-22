---

title: Docker 搭建常见服务
date: 2021/11/6
description: 本文介绍使用 Docker 搭建常见服务的方法，如 MySQL、nginx、Redis 等，包括下载镜像、如何启动、数据持久化以及自定义配置文件等
tag: [容器化与运维, docker]

---

# Docker 搭建常见服务

## Docker Hub

1. Docker Hub 是一个由 Docker 公司运行和管理的镜像云存储库

2. Docker Hub 官方地址：[https://hub.docker.com/](https://hub.docker.com/)

3. 通过 Dcoker Hub 可以搜索收录的公告镜像，也可以进行镜像仓库的私有化部署

4. Docker Hub 官网镜像中带有`Offical Image`标志的，为官方发布，更加安全可靠

   ![image-20211106212051836](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211106212053399.png)

   

## MySQL

1. 打开 Docker Hub 官网，搜索 MySQL 镜像，推荐选择带有`Offical Image`标志的

   ![image-20211107092359150](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211107092400356.png)

2. 在`Description`中可查看描述文档，在`Tags`中可查看版本号

   ![image-20211107092753989](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211107092754855.png)

3. 拉取镜像

   ```shell
   docker pull mysql:8.0.27
   ```

   ![image-20211107093258892](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211112222406034.png)

4. MySQL 容器基本启动命令

   ```shell
   docker run \
       --name some-mysql \
       -p 3306:3306 \
       -e MYSQL_ROOT_PASSWORD=my-secret-pw \
       -d mysql:tag
   ```

   使用`-e`指定环境变量，`MYSQL_ROOT_PASSWORD` 指定 root 用户密码

   使用`-p`指定端口映射，将容器内 3306 映射到宿主机 3306，以供外部访问

5. MySQL 容器数据持久化

   ```shell
   docker run \
   	--name some-mysql \
   	-p 3306:3306 \
   	-v /my/custom/data:/var/lib/mysql \
   	-e MYSQL_ROOT_PASSWORD=my-secret-pw \
   	-d mysql:tag
   ```

   使用`-v`指定数据卷映射，MySQL 容器的数据默认存放在`/var/lib/mysql`，通过数据卷映射到宿主机目录（可自动创建），方便备份

   > MySQL 容器被持久化到宿主机目录，再次挂载时，会自动加载原库表数据以及数据库密码设置

6. MySQL 容器自定义配置文件

   MySQL 容器对配置文件进行了拆分，主配置文件为`/etc/mysql/my.cnf`，使用`!includedir`引入了`/etc/mysql/conf.d` 和 `/etc/mysql/mysql.conf.d`，`mysql.conf.d`存放了默认配置文件，`conf.d`留给用户自定义配置，一般只需要映射 `/etc/mysql/conf.d`下`mysql.cnf`即可

   ```shell
   docker run \
   	--name some-mysql \
   	-p 3306:3306 \
   	-v /my/custom/data:/var/lib/mysql \ 
   	-v /my/custom/conf:/etc/mysql/conf.d \
   	-e MYSQL_ROOT_PASSWORD=my-secret-pw \
   	-d mysql:tag
   ```

   ![image-20211107102440620](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211107102441512.png)

7. MySQL 容器常见启动环境变量

   `MYSQL_DATABASE`指定启动时创建的数据库名称

   `MYSQL_USER`、`MYSQL_PASSWORD`指定`MYSQL_DATABASE`的用户和密码

   > 可通过在 /docker-entrypoint-initdb.d 下映射 SQL 脚本或 Shell 脚本文件来初始化 MySQL 数据库

## Nginx

1. 拉取 Nginx 镜像

   ```shell
   docker pull nginx:1.21.3
   ```

2. 运行 Nginx web 服务

   ```shell
   docker run \
   --name some-nginx \
   -v /some/content:/usr/share/nginx/html:ro \ 
   -d nginx:tag
   # :ro 代表只读，容器内数据改变不影响外部
   ```

   作为 Web 服务器时，Nginx 容器 Web 资源默认存放在容器内的`/usr/share/nginx/html`，映射到宿主机目录可用于部署前端系统

3. 配置 Nginx 反向代理

   Nginx 容器配置文件默认存放在容器内的`/etc/nginx/nginx.conf`

   若没有该配置文件模板，可启动一个临时容器，用`docker cp`命令复制到宿主机

   ```shell
   docker run --name tmp-nginx -d nginx 
   docker cp tmp-nginx:/etc/nginx/nginx.conf /host/path/nginx.conf
   docker rm -f tmp-nginx
   ```

   修改`nginx.conf`，添加反向代理配置如下

   ```
   upstream myservers {
       server 192.168.1.8;
       server 192.168.1.9;
       server 192.168.1.10;
   }
   server {
       location / {
           proxy_pass http://myservers/;
       }
   }
   ```

   启动 Nginx 容器

   ```shell
   docker run \
   --name my-custom-nginx-container \
   -v /host/path/nginx.conf:/etc/nginx/nginx.conf \
   -d nginx:tag
   ```

## Redis

1. 拉取 Redis 镜像

   ```shell
   docker pull redis:6.2.5
   ```

   同一个版本号有不同版本，如`6.2.5-buster`、`[6.2.5-alpine]`，区别是基于的 Linux 系统不同，在大小和内置工具上有差异

2. 启动 Redis

   ```shell
   docker run --name some-redis -p 6379:6379 -d redis:tag
   ```

3. 开启数据持久化

   快照方式（默认开启），快照文件是容器内`/data`目录的`dump.rdb`文件

   ```shell
   docker run \
   	--name some-redis \
   	-p 6379:6379 \
   	-v /var/docker/redis/data:/data \
   	-d redis:tag
   ```

   开启 AOF 持久化，减少丢数据的风险，最多丢失一秒内的数据

   ```shell
   docker run \
   	--name some-redis \
   	-p 6379:6379 \
   	-v /var/docker/redis/data:/data \
   	-d redis:tag \
   	redis-server --appendonly yes 
   # 可在 run 命令后直接追加启动后容器要执行的命令
   ```

   AOF 文件名为`appendonly.aof`，默认生成到`/data`目录

4. 自定义 Redis 配置文件

   新建`redis.conf`配置文件，添加自定义配置项

   ```shell
   # 设置为 0.0.0.0，即开启远程访问
   bind 0.0.0.0
   # 开启 AOF
   appendonly yes
   # 设置端口
   port 6379
   # 设置访问密码
   requirepass xxxxx
   ```

   启动 Redis 并加载自定义`redis.conf`

   ```shell
   docker run \
   	--name some-redis \
   	-p 6379:6379 \
   	-v /var/docker/redis/data:/data \
   	-v /var/docker/redis/redis.conf:/etc/redis.conf \ 
   	-d redis:tag \
   	redis-server /etc/redis.conf 
   # 挂载配置文件，启动 server 时使用配置文件
   ```
   
## RabbitMQ

1. 在 Docker Hub 上搜索 RabbitMQ

   ![image-20211108212725487](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211108212726479.png)

   拉取 RabbitMQ 镜像

   ```shell
   docker pull rabbitmq:3.8.23-management
   ```

   > 版本号中带有 management 的镜像是带有 Web 管理界面
   >
   > 不带 management 的镜像只能通过命令操作

2. 启动 RabbitMQ 基本服务

   ```shell
   # 15672 Web 管理页面端口
   # 5672 通信端口
   docker run \
   	--name rabbitmq \
   	-p 15672:15672 \
   	-p 5672:5672 \
   	-d rabbitmq:3.8.23-management
   ```

   Web 管理界面默认的账户密码为 guest/guest

3. 启动 RabbitMQ 并指定管理员初始账号密码

   ```shell
   # RABBITMQ_DEFAULT_USER 用户名
   # RABBITMQ_DEFAULT_PASS 密码
   docker run \
   	--name rabbitmq \
   	-p 15672:15672 \
   	-p 5672:5672 \
   	-e RABBITMQ_DEFAULT_USER=admin \
   	-e RABBITMQ_DEFAULT_PASS=xxxx \
   	-d rabbitmq:3.8.23-management
   ```

4. 启动时创建一个虚拟主机

   ```shell
   # RABBITMQ_DEFAULT_VHOST 指定虚拟主机名称
   docker run \
   	--name rabbitmq \
   	-p 15672:15672 \
   	-p 5672:5672 \
   	-e RABBITMQ_DEFAULT_USER=admin \
   	-e RABBITMQ_DEFAULT_PASS=xxxx \
   	-e RABBITMQ_DEFAULT_VHOST=demoMQ \
   	-d rabbitmq:3.8.23-management
   ```

5. 自定义 RabbitMQ 配置

   默认配置文件是`/etc/rabbitmq/rabbitmq.conf`

   ![image-20211108222440762](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211108222441905.png)

   自定义配置文件启动，并持久化`/var/lib/rabbitmq`运行目录

   ```shell
   docker run \
   	--name rabbitmq \
   	-p 15672:15672 \
   	-p 5672:5672 \
   	-v /var/docker/rabbitmq/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf \
   	-v /var/docker/rabbitmq/data:/var/lib/rabbitmq \
   	-d rabbitmq:3.8.23-management
   ```
   
   浏览器访问宿主机的 15672 端口，可进入登录界面，使用配置的账户登录即可
   
   ![image-20211112220802017](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211112220805558.png)

