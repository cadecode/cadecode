---

title: Docker 构建多平台镜像
date: 2024/6/29
description: 本文介绍 Docker 构建多平台镜像的方式，包括镜像与平台的关系介绍、利用 manifest 合并镜像，以及使用 buildx 打包多平台镜像的方法
tag: [容器化与运维, docker]

---

# Docker 构建多平台镜像

## 镜像与多平台

一般情况下，使用镜像时必须保证镜像与 Docker 宿主机系统架构一致，同理，通过 `docker build` 构建的镜像只能运行在相应平台上

想要满足多平台的镜像需求，就得在不同平台上打包，推送多个版本到仓库，使用时根据平台选择 pull 哪个

```shell
docker pull username/my-image:1.0.0--amd64
```

引出问题：

- 各平台的镜像版本号混乱，选用麻烦
- 打包多个平台的镜像，需要多平台环境支持

## docker manifest

`docker manifest` 命令用于为镜像创建一个 manifest 列表，manifest 列表中会记录该镜像对应的各平台真实镜像的相关信息，相当于将多个平台的镜像合为一份，通过 manifest 来区分平台

在向 Docker Hub 推送镜像时会自动生成 manifest，在拉取镜像时，会自动根据 manifest 检索镜像

创建 manifest

```shell
docker manifest create username/my-image:1.0.0 \
      username/my-image:1.0.0--amd64 \
      username/my-image:1.0.0--arm64
# --amend: 在已有 manifest 上追加
```

修改 manifest

```shell
docker manifest annotate username/my-image:1.0.0 \
      username/my-image:1.0.0--amd64 \
      --os linux --arch amd64
```

查看 manifest

```shell
docker manifest inspect username/my-image:1.0.0
```

推送 manifest

```shell
docker manifest push username/my-image:1.0.0
```

## buildx

buildx 是一个 docker 插件，基于 BuildKit 引擎，提供了不同于 docker build 的更多功能。buildx 的一个关键特性是可以为不同的硬件架构构建并输出镜像，也就是说，可以在 amd64 的机器上构建 arm64 架构的镜像

`docker buildx` 命令需要 docker 版本 19.03+ 

```shell
docker --version
docker buildx version
```

启用实验性功能，编辑 `/etc/docker/daemon.json `

```json
{
  "experimental": true
}
```

安装 `binfmt`，`binfmt` 集合了一系列跨平台的模拟器

```shell
docker run --rm --privileged tonistiigi/binfmt:latest --install all
```

创建 buildx 构建器并切换使用

```shell
docker buildx create --name mybuilder --driver docker-container
docker buildx user mybuilder
```

执行 buildx build

```shell
docker buildx build --platform linux/arm64  -t username/my-image:1.0.0--arm64 --load .
docker buildx build --platform linux/amd64  -t username/my-image:1.0.0--amd64 --load .
```

对打包出的镜像测试无误后，可以推送 Docker Hhub，在配合 `docker manifect` 合并镜像名称

也可以一次打包多个平台，但打包结果在 buildx 构建缓存中，无法在本地查看，需要直接推送到 Docker Hub

```shell
docker buildx build --platform linux/amd64,linux/arm64  -t username/my-image:1.0.0 --push .
```
