---

title: Dockefile 与 docker compose
date: 2024/6/22
description: 本文介绍 Dockerfile 和 docker compose 的使用，包括 Dockerfile 指令，docker compose 的安装、yml 模板和 compose 命令等
tag: [容器化与运维, docker, docker-compose]

---

# Dockefile 与 docker compose

## Dockerfile

### Dockerfile 介绍

最常使用的 Docker Registry 公开服务有

- 官方的 [Docker Hub](https://hub.docker.com/)
- Red Hat 的 [Quay.io](https://quay.io/repository/)
- Google 的 [Google Container Registry](https://cloud.google.com/container-registry/)，被 Kubernetes 所使用
- GitHub 的 [ghcr.io](https://docs.github.com/cn/packages/working-with-a-github-packages-registry/working-with-the-container-registry)。

尽管在 Registry 中有大量公开的镜像可以免费使用，有时候还需要定制自己的镜像，定制镜像一般有两种方法，`docker commit` 命令和 `Dockerfile`

`docker commit` 命令是在进入容器按需调整后将容器导出为镜像的一种方式，但是实际环境中并不推荐使用，因为在容器中做的调整，可能是执行命令、安装软件包、编译构建等，会有大量的无关内容被添加到镜像，导致镜像极为臃肿

因此，定制镜像应该使用 `Dockerfile` 来完成

### Dockerfile 指令

#### FROM 指定基础镜像

`FROM` 指令用于指定需要定制的基础镜像，如服务类的镜像 nginx，tomcat，openjdk，基础操作系统镜像 ubuntu，debian，alpine 等

如果需要一个完全空白的镜像，可以使用 `FROM scratch`

```dockerfile
FROM nginx:1.21.3
```

#### RUN 执行命令

`RUN` 指令用于指定要执行的命令

```dockerfile
# 写入内容到 index.html
RUN echo '<h1>Hello, Docker!</h1>' > /usr/share/nginx/html/index.html
```

在使用 `RUN`  命令时，建议尽可能将多个要执行的命令合并为一条，并且搭配上合适的清理命令

因为 docker 镜像文件是分层的，分层帮助 docker 利用镜像文件的缓存来高效构建，`RUN`  命令的执行会导致层数的增加，产生臃肿、多层的镜像

#### COPY 复制文件

`COPY` 指令用于复制`当前上下文`中的文件到容器中

```dockerfile
COPY my.html /usr/share/nginx/html/
COPY hello.html /usr/share/nginx/html/index.html
```

#### ADD 更高级的复制文件

和 `COPY` 用法基本一致，但支持从 URL 下载、压缩包自动解压

#### CMD 容器启动命令

`CMD ` 指令指定容器需要运行的程序及参数

```dockerfile
CMD ["nginx", "-g", "daemon off;"]
```

想要容器持续运行不退出，需要保证 `CMD` 执行的程序在前台运行

启动容器时可指定要执行的命令，来覆盖默认设置的 `CMD`

```shell
# 覆盖容器要执行的命令
docker run --rm nginx:1.21.3 echo 123
```

#### ENTRYPOINT 入口点

`ENTRYPOINT` 指令也是在指定容器启动程序及参数

```dockerfile
ENTRYPOINT ["java", "-jar"]
CMD ["app.jar"]
```

`ENTRYPOINT` 在运行时也可以替代，需要通过 `docker run` 的参数 `--entrypoint` 来指定

#### ENV 设置环境变量

`ENV` 命令用于设置一个环境变量，可供后续的指令、运行时的应用使用

```dockerfile
ENV VERSION=1.0 CONFIG_ENV=PROD \
    APP_NAME="My App"
```

#### VOLUME 定义匿名卷

`VOLUME `命令指定需要使用数据卷的路口

实际运行时如果相应路径没有指定数据卷，就会使用匿名数据卷

```dockerfile
VOLUME [/data1, /data2]
```

#### EXPOSE 声明端口

`EXPOSE ` 命令用于声明端口，仅仅是声明，和实际运行无关

```dockerfile
EXPOSE 80 443
```

#### WORKDIR 指定工作目录

`WORKDIR ` 命令用于指定容器内当前目录

```dockerfile
WORKDIR /usr/share/nginx/html
RUN echo '<h1>Hello, Docker!</h1>' > hello.html
```

#### USER 指定当前用户

`USER` 命令指定容器内使用的用户

切换用户，但用户需要提前创建好

```dockerfile
RUN groupadd -r redis && useradd -r -g redis redis
USER redis
```

### Dockerfile 示例

编写 Dockefile，实现在 nginx 原版镜像中启用 `ngx_http_image_filter_module`

```dockerfile
FROM nginx:1.21.3

EXPOSE 80 443

RUN set -x; buildDeps='build-essential libpcre3-dev zlib1g-dev libssl-dev libgd-dev' \
    && apt-get update \
    && apt-get install -y ${buildDeps} \
    && nginxConfig="$(nginx -V 2>&1 | sed -n -e 's/^.*arguments: //p')" \
    && curl -fsSL https://nginx.org/download/nginx-1.21.3.tar.gz -o nginx-1.21.3.tar.gz \
    && tar -zxvf nginx-1.21.3.tar.gz \
    && cd nginx-1.21.3 \
    && sh -c "./configure ${nginxConfig} --with-http_image_filter_module" \
    && make install \
    && rm -rf nginx-1.21.3 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get purge --auto-remove -y ${buildDeps} \
    && apt-get clean

CMD ["nginx", "-g", "daemon off;"]
```

尽量合并命令到一个 `RUN` 指令，并且注意清理不再需要的文件

### Dockerfile build

进入 Dockerfile 所在目录，执行 `docker build ` 命令

```shell
docker build -t my-nginx:1.0 .
```

`-t` 指定镜像命和标签，`.` 表示以当前目录为构建上下文，`COPY` 命令正是从上下文目录中拷贝文件到容器

## docker-compose

### docker-compose 介绍

`Compose` 项目是 Docker 官方的开源项目，负责实现对 Docker 容器集群快速编排

通过编写 `docker-compose.yml` 配置文件，可以方便的定义多个容器，统一管理

### 安装 docker-compose

当使用官方`get-docker.sh` 安装 docker 时，在较新版本 (21.10 以上)， `docker compose` 命令会默认安装

也可以通过下载二进制文件安装，例如，版本 1.28.2

```shell
curl -L https://github.com/docker/compose/releases/download/1.28.2/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### docker-compose yml 模板

```yaml
# 指定模板版本
version: "3"

# 列出要运行的容器
services:
  nginx:
  	# 指定重启策略
  	restart: unless-stopped
  	# 指定镜像
    image: nginx:1.21.3
    # 指定容器名（不推荐，会自动生成）
  	# container_name: my-nginx
  	# 是否开启超级权限
  	privileged: true
  	# 指定用户
  	user: nginx
  	# 指定主机名
  	hostname: test
  	# 指定要加入的 host
  	extra_hosts:
     - "mypc:192.168.0.100"
     - "dockerhub:52.1.157.61"
    # 映射端口
    ports:
      	- "80:80"
      	- "443"
    # 指定环境变量
    environment:
		- MY_NAME=Cade
	# 指定环境变量配置文件
	env_file:
		- .env.my
	# 加入网络
    networks:
    	- my-net
    # 挂载数据卷
    volumes:
    	# 匿名数据卷
      	- /data1
	    # 具名数据卷
      	- data2:/data2
      	# bind 路径
		- ./data3:/data3
	# 设置依赖的容器
	depends_on:
      - myapp
	# 健康检查
	healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 1m30s
      timeout: 10s
      retries: 3
    # 配置日志
    logging:
    	driver: "json-file"
    	options:
          max-size: "200k"
          max-file: "10"

  myapp:
  	# 指定 build 上下文
  	build: ./
  	# 指定 Dockerfile 文件名称
  	dockerfile: Dockerfile-myapp
  	# 自定义 entrypoint
  	entrypoint: /my-entrypoint.sh

# 列出要创建的数据卷
volumes:
	data2:  
  
# 列出要创建的网络
networks:
	my-net:
```

### docker-compose 命令

`docker compose` 命令基本格式

```shell
docker compose [-f=<arg>...] [options] [COMMAND] [ARGS...]
```

主要选项

- `-f, --file` 指定模板文件，默认 `docker-compose.yml`
- `-p, --project-name` 指定项目名称，默认将使用所在目录名作为项目名

#### up

```shell
docker compose up [options] [SERVICE...]
```

自动完成构建镜像，重建服务，启动服务等一系列操作

主要选项：

- `-d` 在后台运行服务
- `--no-deps` 不启动服务所依赖的服务
- `--force-recreate` 强制重建容器，不能与 `--no-recreate` 同时使用
- `--no-recreate` 若容器已存在就不重建，不能与 `--force-recreate` 同时使用

#### down

```shell
docker compose down [options]
```

停止 `up` 命令所启动的容器，并移除网络，但不会删除数据卷

#### rm

```shell
docker compose rm [options] [SERVICE...]
```

删除所有（停止状态的）服务容器

选项：

- `-v` 删除容器所挂载的数据卷

#### exec

```shell
docker compose up SERVICE [COMMAND]
```

进入容器，对于多实例的服务，可通过 `--index` 指定容器

#### config

```shell
docker compose config [OPTIONS] [SERVICE...]
```

验证 Compose yml 文件格式是否正确

#### 其他命令

如 `start`、`stop` 、`top`、`ps`、`logs` 等和 docker 下的同名命令功能类似，但 docker compose 仅作用于 Compose 文件指定的范围
