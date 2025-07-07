---

title: Docker 部署 Minio 集群
date: 2025/3/4
description: 本文介绍 Docker Compose 部署 Minio 集群的方式，在单节点上启 4 个容器模拟 4 节点 4 磁盘的集群
tag: 中间件

---

# Docker 部署 Minio 集群

## Backgroud

Minio 有单节点、集群两种部署方式

单节点多硬盘利用数据冗余实现数据可靠性，但单节点不具备高可用

集群一般推荐至少 4 节点 + 4 硬盘，即每节点 1 块硬盘，最多支持两节点故障

## Docker Compose 部署

在单机上启 4 个 Minio 容器模拟多节点部署

`http://minio{1...4}:9000/data` 中 `minio{1...4}` 表示 4 个节点的 hostname，`/data`  表示磁盘

每个节点有多块磁盘时，可以使用 `/data{1...2}`

```yaml

version: "3.8"

services:
  minio1:
    image: minio/minio:RELEASE.2024-07-04T14-25-45Z
    hostname: minio1
    restart: on-failure
    ports:
      - "9002:9000"
      - "9003:9001"
    volumes:
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
      - /minio01-data:/data
    environment:
      - MINIO_ROOT_USER=minio
      - MINIO_ROOT_PASSWORD=miniopass123
    command:
      - server
      - http://minio{1...4}:9000/data
      - --address
      - ":9000"
      - --console-address
      - ":9001"

  minio2:
    image: minio/minio:RELEASE.2024-07-04T14-25-45Z
    hostname: minio2
    restart: on-failure
    ports:
      - "9004:9000"
      - "9005:9001"
    volumes:
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
      - /minio02-data:/data
    environment:
      - MINIO_ROOT_USER=minio
      - MINIO_ROOT_PASSWORD=miniopass123
    command:
      - server
      - http://minio{1...4}:9000/data
      - --address
      - ":9000"
      - --console-address
      - ":9001"

  minio3:
    image: minio/minio:RELEASE.2024-07-04T14-25-45Z
    hostname: minio3
    restart: on-failure
    ports:
      - "9006:9000"
      - "9007:9001"
    volumes:
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
      - /minio03-data:/data
    environment:
      - MINIO_ROOT_USER=minio
      - MINIO_ROOT_PASSWORD=miniopass123
    command:
      - server
      - http://minio{1...4}:9000/data
      - --address
      - ":9000"
      - --console-address
      - ":9001"
   
  minio4:
    image: minio/minio:RELEASE.2024-07-04T14-25-45Z
    hostname: minio4
    restart: on-failure
    ports:
      - "9008:9000"
      - "9009:9001"
    volumes:
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
      - /minio04-data:/data
    environment:
      - MINIO_ROOT_USER=minio
      - MINIO_ROOT_PASSWORD=miniopass123
    command:
      - server
      - http://minio{1...4}:9000/data
      - --address
      - ":9000"
      - --console-address
      - ":9001"
```

启动容器，登录任意一个节点的 `console-address`

```shell
docker compose up -d
```

进入 `Monitoring` 查看节点和磁盘状态

![image-20250322220041907](https://pic-bed.cadeli.top/2025/03/22/acc09950927307f13384e3b668e8ab05.png)
