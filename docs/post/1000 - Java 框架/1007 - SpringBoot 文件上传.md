---

title: SpringBoot 上传文件
date: 2021/2/11
description: 本文介绍 SpringBoot 通过 MultipartFile 接收和解析请求中的文件并调用 tansferTo 方法将读到的内容存到磁盘文件中
tag: [Java 框架, SpringBoot, Spring, Java]

---

# SpringBoot 上传文件

## 配置

1. application.yaml

   multipart 配置，设置接受文件的保存路径和文件大小

   ```yaml
   spring:
     servlet:
       multipart:
         enabled: true
         location: F:/tmp/
         file-size-threshold: 5MB
         max-file-size: 20MB
   ```

2. UploadConfig.java

   ```java
   @Configuration
   // 需要的类
   @ConditionalOnClass({Servlet.class, StandardServletMultipartResolver.class, MultipartConfigElement.class})
   // 需要的配置
   @ConditionalOnProperty(prefix = "spring.http.multipart", name = "enable", matchIfMissing = true)
   // 将 MultipartProperties 加入容器
   @EnableConfigurationProperties(MultipartProperties.class)
   public class UploadConfig {
   
       private final MultipartProperties multipartProperties;
   
       @Autowired
       public UploadConfig(MultipartProperties multipartProperties) {
           this.multipartProperties = multipartProperties;
       }
   
       // Servlet 规范
       // 定义了 http 服务上传文件存储位置、最大文件大小、最大请求的长度
       @Bean
       @ConditionalOnMissingBean
       public MultipartConfigElement multipartConfigElement() {
           return this.multipartProperties.createMultipartConfig();
       }
   
       // SpringMVC 文件解析器
       @Bean(DispatcherServlet.MULTIPART_RESOLVER_BEAN_NAME)
       @ConditionalOnMissingBean(MultipartResolver.class)
       public StandardServletMultipartResolver multipartResolver() {
           StandardServletMultipartResolver multipartResolver = new StandardServletMultipartResolver();
           multipartResolver.setResolveLazily(this.multipartProperties.isResolveLazily());
           return multipartResolver;
       }
   }
   ```

## 控制器

1. UploadController.java

   ```java
   @Controller
   public class UploadController {
   
       @Value("${spring.servlet.multipart.location}")
       private String fileTempPath;
   
       @ResponseBody
       @PostMapping(value = "/local", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
       public String upload(@RequestParam("file") MultipartFile file) {
           if (file.isEmpty()) {
               return "File Empty！";
           }
           // 文件名
           String fileName = file.getOriginalFilename();
           // 路径
           String filePath = this.fileTempPath + fileName;
           File targetFile = new File(filePath);
           try {
               // 写入目标文件
               file.transferTo(targetFile);
           } catch (IOException e) {
               return "TransferTo error";
           }
           return "Upload OK";
       }
   }
   ```

