---

title: Docker 镜像的导入导出
date: 2024/1/2
description: 本文介绍了 Docker 镜像的的导入导出相关命令，如 save/load、export/import，以及 commit 命令
tag: [容器化与运维, docker]

---

# Docker 镜像的导入导出

## 概述

在使用 Docker 管理容器的过程中，通常需要分享或迁移一些镜像，Docker 命令行提供了 `docker save`、`docker export`、`docker commit` 三种命令用于导入导出镜像

三种命令有不同的使用场景和行为，一般来说，`docker save` 用于将一个镜像保存到本地，`docker export` 用于将一个容器保存到本地，`docker commit`用于将一个容器保存为镜像

## save

作用：将 Docker 镜像保存为一个归档文件，包括所有的镜像层信息

使用场景：适用于迁移、分享和备份整个镜像

```shell
docker save -o <镜像文件名> <镜像名>
```

导入镜像：

```shell
docker load -i <镜像文件名>
```

## export

作用：将容器的文件系统导出为一个归档文件，仅保存容器当时的状态，相当于虚拟机快照

使用场景：

主要用于快速备份和共享容器文件系统，但不包含镜像元数据、层信息和历史记录

经常用来生成一个基本镜像，用来做基础的开发环境

```shell
docker export -o <镜像文件名> <容器ID>
```

导入镜像：

```shell
docker import <镜像文件名> <新镜像名>:<标签>
```

## commit

作用：创建一个新的镜像，并将容器的文件系统和元数据保存到该镜像中

使用场景：

用于创建新的镜像，基于现有容器所做的修改

通常在对容器进行一些配置更改后，通过 commit 命令将容器的状态保存为一个新的镜像

```shell
docker commit <容器ID> <新镜像名>
```

保存为镜像后，可在 Docker 本地镜像列表中看到，也意味着可以结合 save 命令将其导出了

## 总结

`docker save` 基于现有镜像保存到指定文件，用于分享镜像，包含镜像元数据、层信息和历史记录

`docker export` 基于现有容器保存到指定文件，用于迁移容器，不包含镜像元数据、层信息和历史记录

`docker commit` 基于容器创建新镜像，用于定制镜像，包含镜像元数据、层信息和历史记录
