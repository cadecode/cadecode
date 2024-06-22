---

title: Docker Nginx 添加模块
date: 2024/1/3
description: 本文介绍了 Docker 中 Nginx 容器添加模块和方法，包括重新编译 Nginx 和使用 load_module 指令两种方式，以 http_image_filter 模块为例
tag: [容器化与运维, docker, nginx]

---

# Docker Nginx 添加模块

## 概述

Nginx 是开源的 HTTP 和反向代理服务器，对静态资源、负载均衡、反向代理等任务提供高性能处理

Nginx 除了低资源占用、高并发能力、高稳定性外，其丰富的模块系统提供了高扩展性

Nginx 模块系统包括核心模块、HTTP 模块、邮件模块、以及第三方模块等

为 Nginx 添加或启用模块，一般有两种方式，

1. 重新编译 Nginx，编译时指定启用的模块
2. 使用 load_module 指令加载编译好的模块 so 文件（Nginx >=1.9.11）

## 重新编译 Nginx

Docker 启动一个 Nginx 容器用于测试，版本 Nginx1.21.3

```shell
docker run --name nginx-test \
-p 81:80 \
-v /docker/nginx-test/nginx.conf:/etc/nginx/nginx.conf 
-d nginx:1.21.3
```

进入容器

```shell
docker exec -it nginx-test bash
```

安装编译需要的基本依赖库，以 Debian 系统为例

```shell
apt install build-essential libpcre3 libpcre3-dev zlib1g zlib1g-dev libssl-dev libgd-dev
```

> 根据要编译的模块不同，可能还需要一些额外的依赖库
>
> 如提供 SSL 支持的模块，需要安装 openssl 相关库

查看 Nginx 当前的启用配置

```shell
nginx -V
```

在打印结果中可以看到 configure 有许多参数

```
nginx version: nginx/1.21.3
built by gcc 8.3.0 (Debian 8.3.0-6)
built with OpenSSL 1.1.1d  10 Sep 2019
TLS SNI support enabled
configure arguments: --prefix=/etc/nginx --sbin-path=/usr/sbin/nginx --modules-path=/usr/lib/nginx/modules --conf-path=/etc/nginx/nginx.conf --error-log-path=/var/log/nginx/error.log --http-log-path=/var/log/nginx/access.log --pid-path=/var/run/nginx.pid --lock-path=/var/run/nginx.lock --http-client-body-temp-path=/var/cache/nginx/client_temp --http-proxy-temp-path=/var/cache/nginx/proxy_temp --http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp --http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp --http-scgi-temp-path=/var/cache/nginx/scgi_temp --user=nginx --group=nginx --with-compat --with-file-aio --with-threads --with-http_addition_module --with-http_auth_request_module --with-http_dav_module --with-http_flv_module --with-http_gunzip_module --with-http_gzip_static_module --with-http_mp4_module --with-http_random_index_module --with-http_realip_module --with-http_secure_link_module --with-http_slice_module --with-http_ssl_module --with-http_stub_status_module --with-http_sub_module --with-http_v2_module --with-mail --with-mail_ssl_module --with-stream --with-stream_realip_module --with-stream_ssl_module --with-stream_ssl_preread_module --with-cc-opt='-g -O2 -fdebug-prefix-map=/data/builder/debuild/nginx-1.21.3/debian/debuild-base/nginx-1.21.3=. -fstack-protector-strong -Wformat -Werror=format-security -Wp,-D_FORTIFY_SOURCE=2 -fPIC' --with-ld-opt='-Wl,-z,relro -Wl,-z,now -Wl,--as-needed -pie'
```

通过追加 configure 参数重新编译，能指定编译时需要启用的功能和模块

> 需要注意的是，Docker 启动的 Nginx 容器是编译好的程序，通常不会包含 configure 可执行文件
>
> 对运行中的 Nginx 容器重新编译，可以将同版本的 Nginx 源码包复制到容器内，使用其 configure 文件来指定参数

对于 Nginx 内置但没有启用的模块，可以使用 `configure --help` 来获取参数，部分参数如下

```
--with-http_ssl_module             enable ngx_http_ssl_module
--with-http_v2_module              enable ngx_http_v2_module
--with-http_realip_module          enable ngx_http_realip_module
--with-http_addition_module        enable ngx_http_addition_module
--with-http_xslt_module            enable ngx_http_xslt_module
--with-http_xslt_module=dynamic    enable dynamic ngx_http_xslt_module
--with-http_image_filter_module    enable ngx_http_image_filter_module
```

以 `ngx_http_image_filter_module` 为例，通过参数 `--with-http_image_filter_module` 来指定启用

```shell
./configure --with-http_image_filter_module
```

对于 Nginx 没有内置的模块，需要下载第三方源码，通过参数 `--add-module` 指定模块源码路径

```shell
./configure --add-module=<第三方模块源码路径>
```

configure 完成后，执行编译

```shell
make
```

> make install 命令会在编译后替换现有的 /usr/sbin/nginx 程序文件，使用前最好备份原程序文件
>
> 推荐使用 make 命令，仅会生成可执行文件，不会复制到系统执行目录

## 使用 load_module 指令

通过 `load_module` 不需要重新编译 Nginx，也可以动态的加载编译好的模块，这为使用第三方模块提供了便利

当需要使用一个第三方模块时，可以到其官方仓库和网站下载打包好的模块文件或者手动编译源码，需要确保编译生成的 so 文件与 Nginx 版本兼容

以 `ngx_http_image_filter_module` 为例，在配置文件的开头，通过 `load_module` 引入模块 `ngx_http_image_filter_module`，此模块在 Nginx1.21.3 中内置，但没有启用，只有相应的 so 文件

修改 nginx.conf

```
# 加载模块
load_module /usr/lib/nginx/modules/ngx_http_image_filter_module.so;
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
    access_log  /var/log/nginx/access.log  main;
    sendfile        on;
    keepalive_timeout  65;
    
    server {
        listen       80;
        server_name  localhost;
        location / {
             root   /usr/share/nginx/html;
             index  index.html index.htm;
        }
        # 使用模块，对 /usr/share/nginx/html 下的图片进行处理
        # 如 /test.jpg!100!80，会按 100x80 缩放
        location ~ ^(.*\.(jpg|jpeg|png|gif))!(.*)!(.*)$ {
          set $width  $3;
          set $height $4;
          image_filter resize $width $height;
          image_filter_buffer 100M;
          alias /usr/share/nginx/html$1;
        }
	}
    include /etc/nginx/conf.d/*.conf;
}
```
