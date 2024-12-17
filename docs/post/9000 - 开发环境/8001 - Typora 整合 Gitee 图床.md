---

title: Typora 整合 Gitee 图床
date: 2021/7/21
description: 本文介绍 Markdown 编辑器 Typora 和图片上传工具 PicGo 的使用，以及如何使用 PicGo 插件配合 Gitee 搭建免费的图床
tag: [开发环境, markdown, 生产力工具]

---

# Typora 整合 Gitee 图床

## Typora 介绍

Typora 是一款支持实时预览的 Markdown 编辑器，所见即所得，提供了 Mac、Linux、Windows 三大平台的版本，目前完全免费使用，支持数学公式、流程图、mermaid 等，具有良好的写作和笔记体验。

![Typora 官网图](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/07/20210728215351427.png)

## PicGo 介绍

PicGo 是一款上床图片的软件，支持多款图床，如 SMMS、Github 等。PicGo-Core 是 PicGo 的核心，可以通过 npm 仓库下载，并且支持在命令行使用。

Typora 使用 PicGo 上传图片有多种方式，可以直接安装  PicGo 客户端进行配置，也可以下载 PicGo-Core 插件，也支持使用命令行。

![Typora 设置](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/07/20210728214814695.png)

## 使用内置 PicGo

使用 Gitee 仓库作为图床存储空间，有不错的访问速度，首先要创建一个 Gitee 仓库，在新建一个 Master 分支。

然后，访问 [https://gitee.com/profile/personal_access_tokens](https://gitee.com/profile/personal_access_tokens) 页面配置一个 Gitee 仓库的私人令牌

![Gitee 新建令牌](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/07/20210728214831949.png)

在 Typora 中`文件=>偏好设置=>图像`下设置上传服务，选择上传服务为 PicGo-Core，点击下载。下载完毕后进入 PicGo-Core 所在文件夹，Windows 下为用户目录下的`AppData\Roaming\Typora\picgo\win64`，打开命令行，执行以下命令，用以安装 Gitee 的上传插件

```
.\picgo.exe install gitee-uploader
```

安装成功，如图：

![安装 gitee uploader](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/07/20210728214847464.png)

接着执行上传的配置命令

```
.\picgo.exe set uploader
```

选择 Gitee，进行配置，token 处填写 Gitee 配置的私人令牌，如图：

![配置 uplader](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/07/20210728214922625.png)

配置完毕后检查用户目录下`.picgo`文件夹下的 config.json

```json
{
  "picBed": {
    "current": "gitee",
    "gitee": {
      "repo": "cadecode/pic-bed",
      "branch": "master",
      "token": "", // 此处为 Gitee 私人令牌
      "path": "blog-img/$customPath",
      "customPath": "yearMonth", // 将以 2021/7/fileName 形式设置上传文件夹（需在 path 中引用）
      "customUrl": ""
    }
  },
  "picgoPlugins": {
    "picgo-plugin-gitee-uploader": true
  }
}
```

打开 Typora，进入上传设置界面，点击`验证图片上传选项`，显示成功上传则表示图床和 PicGo 配置成功，到此我们可以享受图床带来的愉悦的写作体验了 

## 使用命令行 PicGo

有时候我们希望在别处也能通过命令行便捷的上传图片到图床中，通过 npm 安装 PicGo 是一个不错的选择

```
npm i picgo -g
```

使用以下命令来验证安装成功与否和查看帮助

```
picgo -h
```

同样的，使用命令可以安装 Gitee 上传插件

![安装 gitee uploader](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/07/20210728214951770.png)

配置 Gitee 上传插件，token 处填写仓库私人令牌

![配置 upload](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/07/20210728215326200.png)

将 Typora 上传服务调到`Custom Command`，填入命令`picgo upload`，测试上传，如图所示则配置成功

![测试上传成功](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2021/07/20210728215029969.png)

对于剪切板的图片，会根据时间生成文件名；对于本地图片，会使用图片文件名，可以使用 super prefix 插件进行统一配置

```
picgo install super-prefix
```

在配置文件 config.json 中添加 super prefix 配置

```json
{
  "picBed": {
      // ...
    }
  },
  "picgoPlugins": {
    "picgo-plugin-gitee-uploader": true,
    "picgo-plugin-super-prefix": true
  }, 
  "picgo-plugin-super-prefix": { // 配置 super prefix 插件
    "fileFormat": "YYYYMMDDHHmmssSSS"
  }
}
```

至此，PicGo 在命令行和 Typora 中已经可以完美使用了。
