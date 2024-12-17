---

title: 私有化部署 Excalidraw
date: 2024/8/3
description: Excalidraw 是一款流行的手绘风格白板工具。本文介绍 Excalidraw 的私有化部署方式，以及如何在官方原版基础上增加中文手写体的支持
tag: [开发环境, 生产力工具]

---

## 私有化部署 Excalidraw

## 介绍

### 关于 Excalidraw

Excalidraw 是一款流行的手绘风格白板工具，用于创建草图、图表等

![image-20240803170912224](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2024%2F08%2F03%2F20240803170913824.png)

Excalidraw  目前在 Github 开源，拥有超 78k star

​	Github 开源地址：https://github.com/excalidraw/excalidraw

​	演示地址：https://excalidraw.com/

Excalidraw 作者是 Facebook 法裔前端开发工程师 Vjeux，Vjeux 同时还是 React Native、Prettier 等的联合创始人

免费版主要功能点：

- 开源免费（MIT Lisence）
- 优雅的手绘风格
- 丰富的图形库
- 适配移动端
- 支持实时协作

收费版 [Excalidraw+](https://plus.excalidraw.com/) 提供云端存储、更好的团队协作、扩展 AI 等

### 同类工具

**draw.io**

老牌的、强大的在线绘图工具，支持流程图，类图，时序图等多种功能，且支持多种文件格式，可以轻松与 Google Drive、OneDrive 等集成。并不仅仅用来做白板工具

**tldraw**

tldraw 是和 Excalidraw 功能非常类似的白板工具，它支持多画布、更丰富的图表功能。需要注意的是，**目前在 Github 上 tldraw 采用的许可证要求只能免费用于非商业目的**

## Docker 部署 Excalidraw

拉取 Excalidraw 镜像

```shell
# Excalidraw 社区官方镜像
docker pull excalidraw/excalidraw:latest
```

> Excalidraw 社区官方镜像目前只支持  linux/amd64，有 arm64 平台需求可使用
>
> ```shell
> docker pull cadecode/excalidraw:0.17.3
> ```

使用 Docker Compose 启动镜像

compose 文件：docker-compose.yml

```yaml
version: "3.8"

services:
  excalidraw:
    image: cadecode/excalidraw:0.17.3
    # 自定义端口映射
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=development
```

在 compose 文件所在目录下执行启动，通过 3000 端口访问

```shell
docker compose up -d
```

## 支持中文手写体

Excalidraw 官方目前使用的字体是 Virgil，一款英文手写体风格字体，不支持中文手写体

如何让 Excalidraw  支持中文手写体？

当前我们可以通过修改源码，自己打包镜像来使用，但是如果仅仅是修改字体，没有太多的定制需求，可以简单的通过覆盖镜像中的字体文件来达到目的

通过浏览器控制台查看请求路径可以得知 Virgil 字体文件所在位置

![image-20240803172531160](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2024%2F08%2F03%2F20240803172532737.png)

下载同时支持中英文手写体风格的字体，通过挂载 vlolume 覆盖容器内的字体文件

修改 docker-compose.yml

```yaml
version: "3.8"

excalidraw:
    image: cadecode/excalidraw:0.17.3
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=development
    volumes:
      - ./Xiaolai.woff2:/usr/share/nginx/html/Virgil.woff2
      - ./Xiaolai.woff2:/usr/share/nginx/html/fonts/Virgil.woff2
      - ./Xiaolai.woff2:/usr/share/nginx/html/assets/Virgil-Q_0-KYu6.woff2
```

这里使用免费字体[小赖体](https://github.com/lxgw/kose-font)，将字体文件 `Xiaolai.woff2` 放到 compose 文件所在目录，执行启动

效果如下

![image-20240803173825540](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2024%2F08%2F03%2F20240803173827070.png)
