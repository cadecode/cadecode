---

title: Win11 下 WSL2 获取宿主机 IP
date: 2024/12/14
description: 本文介绍 Windows 11 22H2 下 WSL2 获取宿主机 IP 地址的方式，主要是由于 22H2 版本调整了 WSL DNS 请求策略，造成了旧的获取方式获取不到正确的宿主机 IP
tag: [开发环境, wsl, linux]

---

# Win11 下 WSL2 获取宿主机 IP        

## 为什么需要宿主机 IP？

我们知道在 Windows 上访问 WSL 上的服务时，可直接通过 localhost 进行访问

在使用 WSL 的一些场景，也常常需要在子系统内部获取宿主机 IP 地址进行访问

如以下场景

- 在 WSL 子系统内部使用宿主机上的代理
- 在 WSL 子系统上需要访问宿主机上的 MySQL 服务等

## 获取 IP 的方法

### 老版本

Windows 宿主机 IP 会在启动子系统时写入到 `/etc/resolv.conf`

```shell
WIN_IP=`cat /etc/resolv.conf | grep nameserver | awk '{ print $2 }'`
```

### Win11 22H2 及以上

Windows 11 版本 22H2 开始 WSL默认 使用了新的 DNS 隧道功能来处理请求

> 在运行 Windows 11 22H2 及更高版本的计算机上，在 [`.wslconfig` 文件中的 `[wsl2]` 下设置 `dnsTunneling=true`](https://learn.microsoft.com/zh-cn/windows/wsl/wsl-config#configuration-settings-for-wslconfig) 可使 WSL 使用虚拟化功能来应答来自 WSL 内的 DNS 请求，而不是通过网络数据包请求它们。 此功能旨在提高与 VPN 和其他复杂网络设置的兼容性。
>
> —— [WSL 官方文档](https://learn.microsoft.com/zh-cn/windows/wsl/networking)

这一变化，导致 `/etc/resolv.conf` 中不再是准确的宿主机 IP，而是如 `10.255.255.254`

同时官方文档也指出了获取宿主机 IP 的推荐方法

```shell
WIN_IP=`ip route show | grep -i default | awk '{ print $3}'`
```

第二种方法，关闭 dnsTunneling，在 `.wslconfig` 文件中的 `[wsl2]` 下设置 `dnsTunneling=false`，关闭后可继续使用老版本获取方法
