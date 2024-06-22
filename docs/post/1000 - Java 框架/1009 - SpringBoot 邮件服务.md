---

title: SpringBoot 邮件服务
date: 2021/3/9
description: 本文介绍 SpringBoot 如何集成邮件服务，包括发送简单文本邮件、模板邮件、附件邮件、静态资源邮件等
tag: [Java 框架, SpringBoot, Spring, Java]

---

# SpringBoot 邮件服务

## 邮件配置

1. pom.xml

   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-mail</artifactId>
   </dependency>
   <!--使用 thymeleaf 解析模板-->
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-thymeleaf</artifactId>
   </dependency>
   ```

2. application.yaml

   ```yaml
   spring:
     mail:
       host: smtp.qq.com
       port: 465
       username: cadecode@foxmail.com
       password: caifdytfhvaqdiif
       protocol: smtp
       test-connection: true
       default-encoding: UTF-8
       properties:
         mail.smtp.auth: true
         mail.smtp.ssl.enable: true
         mail.smtp.starttls.enable: true
         mail.smtp.starttls.required: true
   ```

## 简单邮件

1. 工具方法

   ```java
   public interface MailService {
       void sendSimpleMail(String to, String subject, String content, String... cc);
   }
   
   @Service
   public class MailServiceImpl implements MailService {
   
       @Autowired
       private JavaMailSender mailSender;
       @Value("${spring.mail.username}")
       private String from;
   
       @Override
       public void sendSimpleMail(String to, String subject, String text, String... cc) {
           SimpleMailMessage message = new SimpleMailMessage();
           message.setFrom(from);
           message.setTo(to);
           message.setSubject(subject);
           message.setText(text);
           if (ArrayUtil.isEmpty(cc)) {
               message.setCc(cc);
           }
           mailSender.send(message);
       }
   }
   ```

2. 使用方法

   ```java
   @SpringBootTest
   class MailTests {
       @Autowired
       MailService mailService;
   
       @Test
       void sendSimpleMail() throws Exception {
           mailService.sendSimpleMail("xxx@xxx.com", "标题", "测试内容");
       }
   }
   ```

## 模板邮件

1. 工具方法

   ```java
   public interface MailService {
       void sendTempLateMail(String to, String subject, 
                         String content, String... cc) throws MessagingException;
   }
   
   @Service
   public class MailServiceImpl implements MailService {
   
       @Autowired
       private JavaMailSender mailSender;
       @Value("${spring.mail.username}")
       private String from;
   
       @Override
       public void sendTempLateMail(String to, String subject, 
                                    String content, String... cc) throws MessagingException {
           MimeMessage message = mailSender.createMimeMessage();
           MimeMessageHelper helper = new MimeMessageHelper(message, true);
           helper.setFrom(from);
           helper.setTo(to);
           helper.setSubject(subject);
           // 解析为 html
           helper.setText(content, true);
           if (ArrayUtil.isEmpty(cc)) {
               helper.setCc(cc);
           }
           mailSender.send(message);
       }
   }
   ```

2. 使用方法

   ```java
   @SpringBootTest
   class MailTests {
       @Autowired
       MailService mailService;
       // thymeleaf 的模板解析工具
       @Autowired
       private TemplateEngine templateEngine;
       // 用来设置 templateResolver
       @Autowired
       private ApplicationContext context;
   
    	@Test
       void sendTemplateMail() throws Exception {
           SpringResourceTemplateResolver templateResolver 
               = new SpringResourceTemplateResolver();
           templateResolver.setApplicationContext(context);
           templateResolver.setCacheable(false);
           templateResolver.setPrefix("classpath:/email/");
           templateResolver.setSuffix(".html");
           templateEngine.setTemplateResolver(templateResolver);
   
           Context context = new Context();
           context.setVariable("name", "Cade");
           context.setVariable("age", "23");
           context.setVariable("sex", "boy");
   
           // 不使用 templateResolver 则默认取 templates 文件夹下的 html 文件
           String emailTemplate = templateEngine.process("test", context);
           mailService.sendTempLateMail("xxx@xxx.com", "模板邮件", emailTemplate);
       }
   }
   ```

## 携带附件

1. 工具方法

   ```java
   public interface MailService {
       void sendAttachmentsMail(String to, String subject, String content, 
                                String filePath, String... cc) throws MessagingException;
   }
   
   @Service
   public class MailServiceImpl implements MailService {
   
       @Autowired
       private JavaMailSender mailSender;
       @Value("${spring.mail.username}")
       private String from;
   
       @Override
       public void sendAttachmentsMail(String to, String subject, 
                                       String content, String filePath, 
                                       String... cc) throws MessagingException {
           MimeMessage message = mailSender.createMimeMessage();
           MimeMessageHelper helper = new MimeMessageHelper(message, true);
           helper.setFrom(from);
           helper.setTo(to);
           helper.setSubject(subject);
           helper.setText(content, true);
           if (ArrayUtil.isEmpty(cc)) {
               helper.setCc(cc);
           }
           FileSystemResource file = new FileSystemResource(new File(filePath));
           // 使用 URL 对象 getPath 返回的路径为 /，不需要使用 File.separator
           String fileName = filePath.substring(filePath.lastIndexOf("/"));
           helper.addAttachment(fileName, file);
   
           mailSender.send(message);
       }
   }
   ```

2. 使用方法

   ```java
   @SpringBootTest
   class MailTests {
       @Autowired
       MailService mailService;
       @Autowired
       private TemplateEngine templateEngine;
       @Autowired
       private ApplicationContext context;	
   	
       @Test
       void sendAttachmentsMail() throws MessagingException {
           URL resource = this.getClass().getResource("/static/img.jpg");
           mailService.sendAttachmentsMail("xxx@xxx.com", "附件邮件", 
                                           "邮件中有附件，请注意查收！", resource.getPath());
       }
   }
   ```

## 静态资源

1. 工具方法

   ```java
   public interface MailService {
       void sendAttachmentsMail(String to, String subject, String content, 
                                String filePath, String... cc) throws MessagingException;
   }
   
   @Service
   public class MailServiceImpl implements MailService {
   
       @Autowired
       private JavaMailSender mailSender;
       @Value("${spring.mail.username}")
       private String from;
   
       @Override
       public void sendResourceMail(String to, String subject, String content, 
                                    String resourcePath, String contentId, 
                                    String... cc) throws MessagingException {
           MimeMessage message = mailSender.createMimeMessage();
           MimeMessageHelper helper = new MimeMessageHelper(message, true);
           helper.setFrom(from);
           helper.setTo(to);
           helper.setSubject(subject);
           helper.setText(content, true);
           if (ArrayUtil.isNotEmpty(cc)) {
               helper.setCc(cc);
           }
           FileSystemResource res = new FileSystemResource(new File(resourcePath));
           helper.addInline(contentId, res);
   
           mailSender.send(message);
       }
   }
   ```

2. 使用方法

   ```java
       @Test
       public void sendResourceMail() throws MessagingException {
           String contentId = "cade";
           // img 标签的 cid:contentId 用于替换占位
           String content = "<html>" +
                   "<body>" +
                   "携带带静态资源的邮件<br/>" +
                   "<img src=\'cid:" + contentId + "\' >" +
                   "</body>" +
                   "</html>";
           URL resource = this.getClass().getResource("/static/img.jpg");
           mailService.sendResourceMail("xxx@xxx.com", "静态资源邮件", 
                                        content, resource.getPath(), contentId);
       }
   ```

## 第三方工具

1. hutool 的 MailUtil 工具类，对 javax.mail 进行了封装

   pom.xml 引入 javax.mail 和 hutool-extra 或者 hutool-all

   ```xml
   <dependency>
       <groupId>javax.mail</groupId>
       <artifactId>mail</artifactId>
       <version>1.4.7</version>
   </dependency>
   <dependency>
       <groupId>cn.hutool</groupId>
       <artifactId>hutool-extra</artifactId>
       <version>5.4.5</version>
   </dependency>
   ```

   resource/config/mail.setting 配置文件

   ```properties
   # 邮件服务器的SMTP地址，可选，默认为smtp.<发件人邮箱后缀>
   host = smtp.yeah.net
   # 邮件服务器的SMTP端口，可选，默认25
   port = 25
   # 发件人
   from = hutool@yeah.net
   # 用户名，默认为发件人邮箱前缀
   user = hutool
   # 密码，某些邮箱需要设置为授权码
   pass = xxxx
   ```

   使用

   ```java
   MailUtil.send("xxx@xxx.com", "测试", "邮件测试", false);
   ```

   > 发送邮件非常简单，只需一个方法即可搞定其中按照参数顺序说明如下：
   >
   > 1. tos：对方的邮箱地址，可以是单个，也可以是多个（Collection表示）
   > 2. subject：标题
   > 3. content：邮件正文，可以是文本，也可以是HTML内容
   > 4. isHtml： 是否为HTML，如果是，那参数3识别为HTML内容
   > 5. files： 可选：附件，可以为多个或没有，将File对象加在最后一个可变参数中即可
