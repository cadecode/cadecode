---

title: Maven 打包可执行 JAR
date: 2022/10/19
description: 本文介绍了 Java 中使用 Maven 打包可执行 JAR 的几种方式，有 maven-jar-plugin、assembly、shade 和 spring-boot-maven-plugin
tag: [Java 框架, Java, 依赖管理]

---

# Maven 打包可执行 JAR

## 概述

1. 什么是可执行 jar

   可执行 jar 是可以直接使用 Java -jar 命令启动的 jar 包

   一般可执行 jar 的 MANIFEST.MF 文件中需要包含 classpath、main-class 等信息

2. 如何打包可执行 jar

   一种是使用 Java 自带的 jar 命令

   更好的方式是使用专门的 Java 构建打包工具，如 Apache Maven

3. Maven 打包可执行 jar 的几种方式

   maven-jar-plugin + maven-dependency-plugin

   maven-assembly-plugin

   maven-shade-plugin

   spring-boot-maven-plugin

## maven-jar-plugin

1. pom 配置

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
                       ${project.build.directory}/libs
                   </outputDirectory>
               </configuration>
           </execution>
       </executions>
   </plugin>
   <plugin>
       <groupId>org.apache.maven.plugins</groupId>
       <artifactId>maven-jar-plugin</artifactId>
       <version>3.0.2</version>
       <configuration>
           <archive>
               <manifest>
                   <addClasspath>true</addClasspath>
                   <classpathPrefix>libs/</classpathPrefix>
                   <mainClass>com.example.Application</mainClass>
               </manifest>
           </archive>
       </configuration>
   </plugin>
   ```

2. 打包过程

   maven-dependency-plugin 负责将所依赖的其他 jar 打包到指定目录 outputDirectory

   maven-jar-plugin 将代码打包到一个 jar 中，并且配置 MANIFEST.MF 的 ClassPath 和主启动类，classpathPrefix 需要和 maven-dependency-plugin 的输出目录保持一致

   输出内容如图

   ![image-20221009151413901](https://pic-bed.cadeli.top/2022/10/09/20221009151418936.png)

   MANIFEST.MF 内容示例如下

   ```
   Manifest-Version: 1.0
   Built-By: Cade
   Class-Path: libs/logback-classic-1.2.5.jar libs/logback-core-1.2.5.jar
     libs/slf4j-api-1.7.31.jar libs/jackson-databind-2.12.4.jar libs/jack
    son-annotations-2.12.4.jar libs/jackson-core-2.12.4.jar libs/lombok-1
    .18.20.jar
   Created-By: Apache Maven 3.8.1
   Build-Jdk: 1.8.0_302
   Main-Class: com.example.Application
   ```

## maven-assembly-plugin

1. pom 配置

   ```xml
   <plugin>
       <groupId>org.apache.maven.plugins</groupId>
       <artifactId>maven-assembly-plugin</artifactId>
       <executions>
           <execution>
               <phase>package</phase>
               <goals>
                   <goal>single</goal>
               </goals>
               <configuration>
                   <archive>
                       <manifest>
                           <mainClass>
                               com.example.Application
                           </mainClass>
                       </manifest>
                   </archive>
                   <descriptorRefs>
                       <descriptorRef>jar-with-dependencies</descriptorRef>
                   </descriptorRefs>
               </configuration>
           </execution>
       </executions>
   </plugin>
   ```

2. 打包过程

   将依赖的第三方 jar 中的 class 文件配合主类一起打进 jar 包，不需要额外指定 ClassPath，因为所有的 class 文件及其包结构都被放在 jar 包的顶层，即 META-INF 的同级目录

   ![image-20221009171738963](https://pic-bed.cadeli.top/2022/10/09/20221009171741317.png)

## maven-shade-plugin

1. pom 配置

   ```xml
   <plugin>
       <groupId>org.apache.maven.plugins</groupId>
       <artifactId>maven-shade-plugin</artifactId>
       <executions>
           <execution>
               <goals>
                   <goal>shade</goal>
               </goals>
               <configuration>
                   <shadedArtifactAttached>true</shadedArtifactAttached>
                   <transformers>
                       <transformer
                                    implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                           <mainClass>com.example.Application</mainClass>
                       </transformer>
                   </transformers>
               </configuration>
           </execution>
       </executions>
   </plugin>
   ```

2. 打包过程

   maven-shade-plugin 和 maven-assembly-plugin 打包出的结果比较类似

   maven-shade-plugin 支持通过字节码分析来自动修剪不必要的依赖，也支持添加前缀包名的方式来解决依赖冲突

## spring-boot-maven-plugin

1. pom 配置

   ```xml
   <plugin>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-maven-plugin</artifactId>
       <version>2.6.6</version>
       <executions>
           <execution>
               <goals>
                   <goal>repackage</goal>
               </goals>
               <configuration>
                   <classifier>spring-boot</classifier>
                   <mainClass>
                       com.example.Application
                   </mainClass>
               </configuration>
           </execution>
       </executions>
   </plugin>
   ```

2. 打包过程

   spring-boot-maven-plugin 是 Spring Boot 提供的 Maven 打包插件，会把项目 class 文件放到 BOOT-INF 下的 classes 目录，第三方 jar 包放在 BOOT-INF 下的 lib 目录

   ![image-20221010130841594](https://pic-bed.cadeli.top/2022/10/10/20221010130843655.png)

   MANIFEST.MF 内容如下

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

   可以看到  Main-Class 并不是 com.example.Application，而是 Spring Boot Loader 提供的启动工具类

   JarLauncher  可以看作是 Spring Boot Loader 提供的一套用于执行 Spring Boot 打包出来的 jar 的标准

   JarLauncher 的 main 方法是程序的真正入口，启动时会先加载 BOOT-INF 下的 class 文件和依赖的 jar 包，然后再通过反射调用代码中启动类的 main 方法
