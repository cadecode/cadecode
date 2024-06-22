---

title: WSL 安装 Docker
date: 2021/9/25
description: 本文介绍 WSL 安装 Docker 的两种方式（使用 Docker 客户端和原生 Linux 安装），以及 Docker 的基本命令
tag: [开发环境, wsl, docker]

---

# WSL 安装 Docker

## Docker 介绍

1. Docker 是一个开源的应用容器引擎，由 GO 语言开发，遵从 Apache2.0 开源协议

2. Docker 容器

   ```
   通过镜像提供软件运行需要的条件，包括代码、运行时环境、系统工具、系统库、设置等，在镜像上拉取容器，保障测试环境和开发环境的一致性，减少因环境导致的运行软件冲突。	——来自 Docker 官方介绍
   ```

3. Docker 的实现机制

   - Namespace：命名空间实现进程隔离

   - UnionFilesystem：联合文件系统实现文件系统隔离

   - ControlGroups：控制组实现资源隔离

## WSL 安装 Doker 两种方式

### 官方客户端安装

1. Docker 团队为 Windows 用户开发了 Docker Desktop 客户端，需要配合 WSL2 使用。

   官方下载地址：[Docker Desktop](https://www.docker.com/products/docker-desktop)

2. 启动 Docker Desktop for Windows，进入设置，启用基于 WSL2 的引擎，开启 WSL Linux 系统集成

   ![img](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211102203738772.webp)

3. 重启 Docker desktop for Windows 后，即可在 WSL2 命令行使用 docker 命令
4. 客户端安装的实质：将 windows 模式下的 docker 对应 docker.sock 挂载到 WSL2 里的 Linux 机器，在此 Linux 机器下执行 docker 命令，实质为客户端通过挂载的 docker.sock 文件与 windows 下 dockerd 服务端进程通信

### 原生 Linux 安装

1. WSL2 下原生 Linix 安装 docker方式和 Linux 虚拟机安装 docker 类似，但 WSL 不支持 systemd

2. 直接使用`apt install`安装 docker 可能会出现问题，推荐使用官方的安装脚本

   ```shell
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo service docker start
   ```

   官方推荐使用客户端，这里继续等待即可开始安装

   ![image-20211102205116080](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211102205117007.png)

   安装完成后测试启动

   ![image-20211102205314045](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211102205314935.png)

## Docker 常见命令

### 镜像管理

1. 搜索镜像

   ```shell
   docker search <镜像名>
   ```

   ![image-20211102205948923](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211102205949869.png)

2. 拉取镜像

   ```shell
   docker pull <镜像名>:<版本号>
   ```

   latest 代表最新版，可在 [dockerhub](https://hub.docker.com/) 搜索镜像

   ![image-20211102210242774](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211102210243695.png)

3. 列出镜像

   ```shell
   docker images
   # 指定镜像名称列出镜像
   docker images <镜像名>
   ```

4. 移除镜像

   ```shell
   docker rmi <镜像名>:<版本号>
   # 使用 -f 强制删除
   ```

### 容器操作

1. 查看容器

   ```shell
   docker ps
   # -a 显示所有的容器，包括未运行的
   # -q 静默模式，只显示容器编号
   # -s 显示总的文件大小
   ```

2. 启动容器

   ```shell
   docker run --name <容器名> -p <宿主机端口>:<容器内端口> -v <宿主机文件路径>:<容器内文件路径> -d <镜像名>
   # --name 设置容器名
   # -p 指定端口映射
   # -v 指定文件映射
   # -d 后台运行
   ```

   创建文件夹`/opt/docker/nginx/data`，添加一个 index.html，映射到`/usr/share/nginx/html`

   ![image-20211102214036215](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211102214037212.png)

   启动成功，打开浏览器访问 8001 即可查看 index.html

3. 查看容器日志

   ```shell
   docker logs <容器名>
   # -f 跟踪日志输出
   # --since="yyyy-MM-dd" 显示某个开始时间的所有日志
   # -t 显示时间戳
   # --tail=N 仅列出最新 N 条容器日志
   ```

   ![image-20211102215738869](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211102215739833.png)

4. 停止容器

   ```shell
   # 启动一个或多个已经被停止的容器
   docker start <容器名>
   # 停止一个运行中的容器
   docker stop <容器名>
   # 重启容器
   docker restart <容器名>
   # 杀死运行中的容器，-s 向容器发送一个信号
   docker kill -s <容器名>
   ```

5. 删除容器

   ```shell
   docker rm <容器名>
   # -f 强制删除运行中的容器
   ```

6. 进入容器

   ```shell
   docker exec <容器名> <容器内命令>
   # -d 在后台运行
   # -i 获取 STDIN 输出
   # -t 分配一个伪终端
   ```
   
   ![image-20211102221616213](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/11/20211102221617120.png)
   
   一般使用`-it`，获取伪终端和容器内输出。使用 exit 退出容器（容器保持运行）
