---

title: SpringBoot 打包瘦身
date: 2024/9/13
description: 本文介绍 SpringBoot 打包的可执行 fat jar 的原理，以及 fat jar 通过依赖外置来达到瘦身的方案
tag: [Java 框架, SpringBoot, Spring, Java, 依赖管理]

---

# SpringBoot 打包瘦身

## SpringBoot 打包原理

SpringBoot 使用其官方 `spring-boot-maven-plugin` 来进行打包

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <version>${spring-boot-maven-plugin.version}</version>
    <executions>
        <execution>
            <goals>
                <goal>repackage</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

默认情况下， `spring-boot-maven-plugin` 会所有依赖打入 jar 包中，产出直接可执行的 jar，称为 fat jar

SpringBoot fat jar 目录结构如下：

```
├── BOOT-INF
│   ├── classes
│   ├── classpath.idx
│   ├── layers.idx
│   └── lib
├── META-INF
│   ├── MANIFEST.MF
│   ├── maven
│   └── services
└── org
    └── springframework
```

其中 `BOOT-INF/lib` 下是依赖的 jar，`org/springframework` 下是 SpringBoot 内置的启动器 launcher 

MANIFEST.MF 内容如下：

```
Manifest-Version: 1.0
Spring-Boot-Classpath-Index: BOOT-INF/classpath.idx
Archiver-Version: Plexus Archiver
Spring-Boot-Layers-Index: BOOT-INF/layers.idx
Start-Class: com.example.Application
Spring-Boot-Classes: BOOT-INF/classes/
Spring-Boot-Lib: BOOT-INF/lib/
Spring-Boot-Version: 2.6.6
Created-By: Apache Maven 3.8.1
Build-Jdk: 1.8.0_302
Main-Class: org.springframework.boot.loader.JarLauncher
```

> SpringBoot 通过 Main-Class 的 launcher 去加载、启动我们项目中真实的 Start-Class

在一般项目中，由于 fat jar 包含大量依赖 jar，往往占用较大磁盘空间，在部署时耗费传输时间，因此对 SpringBoot 打包后的 jar 进行瘦身是有必要的

## 瘦身方案

思路：排除 fat jar 中的依赖，存放到外部 lib 目录进行加载

如何通过加载外部 jar 包来启动？

可以通过 `-cp` 指定 classpath，但 fat jar 的 launcher 提供了 `loader.path` 参数，用于指定外部 lib 目录

```shell
# 当 lib 目录在 app.jar 在相同父目录下
java -jar -Dloader.path=lib app.jar
```

> 需要注意，SpringBoot 默认打包使用 JarLauncher，不支持 `loader.path`，需要使用 PropertiesLauncher

配置 `spring-boot-maven-plugin`，启用 PropertiesLauncher，排除所有依赖

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <version>${spring-boot-maven-plugin.version}</version>
    <configuration>
        <!--配置为 ZIP，启用 PropertiesLauncher-->
        <layout>ZIP</layout>
        <!--排除所有依赖-->
        <includes>
            <include>
                <groupId>null</groupId>
                <artifactId>null</artifactId>
            </include>
        </includes>
    </configuration>
    <executions>
        <execution>
            <goals>
                <goal>repackage</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

如何将依赖存放到指定目录？

通过配置 `maven-dependency-plugin` 实现抽离依赖到外部目录

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-dependency-plugin</artifactId>
    <executions>
        <execution>
            <id>copy-dependencies</id>
            <phase>prepare-package</phase>
            <goals>
                <goal>copy-dependencies</goal>
            </goals>
            <configuration>
                <outputDirectory>
                    ${project.build.directory}/lib
                </outputDirectory>
            </configuration>
        </execution>
    </executions>
</plugin>
```

