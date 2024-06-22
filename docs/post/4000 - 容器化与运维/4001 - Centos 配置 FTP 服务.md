---

title: Centos 配置 FTP 服务
date: 2021/11/5
description: 本文介绍 Centos7 下配置 FTP 服务的方式，包括 FTP 和 SFTP 的相关介绍，以及 FTP 和 SFTP 的安装和配置及权限设置
tag: [容器化与运维, linux]

---

# Centos 配置 FTP 服务

## FTP 和 SFTP 

### FTP

1. FTP 是一种文件传输协议，主要用于数据共享。包括一个 FTP 服务器和多个 FTP 客户端。FTP 客户端通过 FTP 协议在服务器上下载资源
2. FTP 使用 21 和 20 端口，21 端口一般用于连接认证，20 端口用于数据传输
3. FTP 使用 TCP / IP协议

### SFTP

1. SFTP 是一种安全的文件传输协议，它确保使用私有和安全的数据流来安全地传输数据

2. SFTP 要求客户端用户必须由服务器进行身份验证，并且数据传输必须通过安全通道（SSH）进行，不传输明文密码或文件数据
3. SFTP 允许对远程文件执行各种操作，允许从暂停传输，远程文件删除等操作中恢复
4. SFTP 是 SSH 协议的一部分，使用 22 端口通信

## 搭建 FTP 

1. 安装 vsftpd（very secure FTP daemon），一款 Linux 上开源免费的 FTP 服务软件

   ```shell
   sudo yum install vsftpd -y
   # -y 自动确认
   ```

2. 创建一个用户用于连接 FTP

   ```shell
   # useradd -g 设置分组，-G 设置多个分组，-d 设置家目录，-s 指定 shell
   sudo useradd -g ftp -d /var/ftp ftpuser
   # 设置密码
   passwd ftpuser
   ```

3. 编辑`/etc/vsftpd/vsftpd.conf`配置文件

   ```shell
   # 是否允许
   anonymous_enable=NO
   # 是否户登录FTP服务器
   local_enable=YES
   # 是否限制在家目录
   chroot_local_user=YES
   # 是否开启限制用户名单
   root_list_enable=YES
   # 限制名单位置
   chroot_list_file=/etc/vsftpd/chroot_list
   # chroot_local_user 为 YES，限制名单代表不受限制的用户
   # chroot_local_user 为 NO，代表受限制的用户
   ```

4. 启动 FTP 服务

   ```shell
   sudo systemctl start vsftpd
   ```

## 配置 SFTP

1. SFTP 在 Open SSH 中已经包含，检查是否安装 SSH 且版本是否高于 4.8p1

   ```shell
   sudo yum list installed | grep ssh
   ```

2. 创建 SFTP 用户

   ```shell
   # shell 设置为 /sbin/nologin 禁止用作登录
   sudo useradd -d /var/ftp -s /sbin/nologin -g ftp sftp
   # 设置密码
   sudo passwd sftp
   ```

3. 配置 SFTP

   ```shell
   sudo vi /etc/ssh/sshd_config
   ```

    修改配置文件

   ```shell
   # 使用 internal-sftp，提升速度
   # Subsystem sftp        /usr/libexec/openssh/sftp-server
   Subsystem sftp internal-sftp
   # 在配置文件最后追加
   Match User sftp # 对 sftp 用户进行限制，User 也可以用 Group 限制一组成员
           ChrootDirectory /var/ftp # sftp 可访问的根路径
           ForceCommand internal-sftp # 指定命令
           # 禁止通过端口转发可添加如下两行
           X11Forwarding no
           AllowTcpForwarding no
   ```

4. 保证配置的 ChrootDirectory 路径的所有者为 root，且只有 root 具有写入权限

   ```shell
   sudo chown root /var/ftp
   sudo chmod 755 /var/ftp
   ```

5. 重启服务并测试

   ```shell
   sudo systemctl restart sshd
   # 测试连接
   sftp sftp@127.0.0.1
   ```

6. SFTP 上传和下载

   ```shell
   # 将远程服务器 romote.file 文件下载到本地 download 目录
   get /var/ftp/romote.fle ~/download
   # 将远程服务器 romote 目录下载到本地 download 目录
   get -r /var/ftp/romote ~/download
   # 同样的，put 命令表示上传，-r 表示文件夹
   ```
   
   在 SFTP 命令行中，执行 `ls/cd/rm/mkdir` 等命令时，在命令前加一个字母`l`表示操作本地，不加则操作远程服务器
