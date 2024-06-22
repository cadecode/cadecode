---

title: SpringBoot 日志配置
date: 2021/3/11
description: 本文介绍 logback 在 SpringBoot 中的配置与使用，如 logback.xml 的常见配置，以及结合 AOP 可以接口请求日志 
tag: [Java 框架, SpringBoot, Spring, Java]

---

# SpringBoot 日志配置

## logback 介绍

1. logback 是 log4j 作者的又一新作，在 log4j 基础上进行了升级优化，是 SpringBoot 推荐的

2. spring-boot-starter 默认引入了 spring-boot-starter-logging，即 logback-classic 包

   logback 默认实现了 slf4j 标准，其他日志库如 log4j 还要引入 log4j-to-slf4j 包

3. 基本配置

   在资源目录下创建`logback.xml`或`logback-spring.xml`，区别是后者在 SpringBoot 配置文件之后加载
   
   ```xml
   <?xml version="1.0" encoding="utf-8" ?>
   <!--configuration
       scan 是否定时扫描配置文件变化
       scanPeriod 定时间隔
       debug 是否开启日志系统内部 debug
   -->
   <configuration scan="true" scanPeriod="60 seconds" debug="false">
   
       <!--配置参数常量-->
       <!--级别：trace<debug<info<warn<error 增加，通常仅需要 debug/info/error-->
       <property name="level" value="debug" />
       <!--文件保留时间-->
       <property name="history" value="30" />
       <!--文件存放位置-->
       <property name="filePath" value="${user.dir}/logs" />
      <!--带色彩的输出格式-->
       <property name="patternWithColor"
                 value="%d{yyyy-MM-dd HH:mm:ss.SSS} [%-15thread] %highlight(%-5level) %cyan(%logger{50}) : %msg%n" />
       <!--不带色彩的格式，用以输出到文件-->
       <property name="pattern" value="%d{yyyy-MM-dd HH:mm:ss.SSS} [%-15thread] %-5level %logger{50} : %msg%n" />
   
       <!--控制台输出日志-->
       <appender name="consoleAppender" class="ch.qos.logback.core.ConsoleAppender">
           <!--格式-->
           <encoder>
               <pattern>${patternWithColor}</pattern>
               <charset>UTF-8</charset>
           </encoder>
       </appender>
   
       <!--debug 文件日志-->
       <appender name="debugAppender" class="ch.qos.logback.core.rolling.RollingFileAppender">
           <!--正在记录的日志文件位置-->
           <file>${filePath}/debug.now.log</file>
           <!--日志记录器的滚动策略-->
           <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
               <!--按日期命名, %i 表示索引-->
               <fileNamePattern>${filePath}/debug/debug.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
               <!--保留 30 天-->
               <maxHistory>${history}</maxHistory>
               <!--文件大小超过 10MB，则输出的新文件，索引增加-->
               <maxFileSize>10MB</maxFileSize>
           </rollingPolicy>
           <!--格式-->
           <encoder>
               <pattern>${pattern}</pattern>
               <charset>UTF-8</charset>
           </encoder>
           <!--只记录 debug-->
           <filter class="ch.qos.logback.classic.filter.LevelFilter">
               <level>DEBUG</level>
               <onMatch>ACCEPT</onMatch>
               <onMismatch>DENY</onMismatch>
           </filter>
       </appender>
   
   
       <!--info 文件日志-->
       <appender name="infoAppender" class="ch.qos.logback.core.rolling.RollingFileAppender">
           <file>${filePath}/info.now.log</file>
           <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
               <fileNamePattern>${filePath}/info/info.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
               <maxHistory>${history}</maxHistory>
               <maxFileSize>10MB</maxFileSize>
           </rollingPolicy>
           <encoder>
               <pattern>${pattern}</pattern>
               <charset>UTF-8</charset>
           </encoder>
           <filter class="ch.qos.logback.classic.filter.LevelFilter">
               <level>INFO</level>
               <onMatch>ACCEPT</onMatch>
               <onMismatch>DENY</onMismatch>
           </filter>
       </appender>
   
       <!--error 文件日志-->
       <appender name="errorAppender" class="ch.qos.logback.core.rolling.RollingFileAppender">
           <file>${filePath}/error.now.log</file>
           <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
               <fileNamePattern>${filePath}/error/error.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
               <maxHistory>${history}</maxHistory>
               <maxFileSize>10MB</maxFileSize>
           </rollingPolicy>
           <encoder>
               <pattern>${pattern}</pattern>
               <charset>UTF-8</charset>
           </encoder>
           <filter class="ch.qos.logback.classic.filter.LevelFilter">
               <level>ERROR</level>
               <onMatch>ACCEPT</onMatch>
               <onMismatch>DENY</onMismatch>
           </filter>
       </appender>
   
       <!--定义 logger
           name 指定要输出日志的包
           level 指定等级
           additivity 指定是否将 root 的 appender 加入到 logger 中
       -->
       <logger name="com.example" level="${level}" additivity="true">
           <appender-ref ref="errorAppender" />
           <appender-ref ref="debugAppender" />
           <appender-ref ref="infoAppender" />
       </logger>
       
        <!-- SpringFramework 日志-->
       <logger name="org.springframework" level="WARN" />
   
       <!-- mybatis 日志 -->
       <!-- mybatis 打印 sql
            SpringBoot 中只要配置 dao 或 mapper 包即可打印 sql
   		 普通 SSM 项目可能需要以下配置
   	-->
       <logger name="org.apache.ibatis" level="DEBUG" />
       <logger name="java.sql" level="DEBUG" />
   
       <!--根 logger
           没有定义 logger 的包，使用此 logger
       -->
       <root level="INFO">
           <appender-ref ref="errorAppender" />
           <appender-ref ref="consoleAppender" />
       </root>
   </configuration>
   ```


## AOP 请求日志

1. pom.xml

   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
   </dependency>
   <dependency>
       <groupId>cn.hutool</groupId>
       <artifactId>hutool-all</artifactId>
       <version>5.4.5</version>
   </dependency>
   ```

2. ControllerLoggingHandler.java

   ```java
   @Component
   @Aspect
   @Slf4j
   public class ControllerLoggingHandler {
   
       /**
        * 未知 IP
        */
       private static final String UNKNOWN_IP = "unknown";
       /**
        * 本地 IP 地址
        */
       private static final String[] LOCAL_IP_ARR = {"127.0.0.1", "0:0:0:0:0:0:0:1"};
   
       /**
        * 请求日志信息类
        */
       @Data
       @Builder
       @NoArgsConstructor
       @AllArgsConstructor
       static class RequestLogInfo {
           // 线程id
           private String threadId;
           // 线程名称
           private String threadName;
           // ip
           private String ip;
           // url
           private String url;
           // http方法 GET POST PUT DELETE PATCH
           private String httpMethod;
           // 类方法
           private String classMethod;
           // 请求参数
           private Object requestParams;
           // 返回参数
           private Object result;
           // 接口耗时
           private Long timeCost;
           // 操作系统
           private String os;
           // 浏览器
           private String browser;
           // user-agent
           private String userAgent;
       }
   
       /**
        * 获取 IP 地址
        */
       public static String getIpAddr(HttpServletRequest request) {
           String ip = request.getHeader("X-Forwarded-For");
           // tomcat 会在请求头中加入 Proxy-Client-IP/WL-Proxy-Client-IP
           if (ip == null || ip.length() == 0 || UNKNOWN_IP.equalsIgnoreCase(ip)) {
               ip = request.getHeader("Proxy-Client-IP");
           }
           if (ip == null || ip.length() == 0 || UNKNOWN_IP.equalsIgnoreCase(ip)) {
               ip = request.getHeader("WL-Proxy-Client-IP");
           }
           // nginx 会在请求头中加入 X-Real-IP
           if (ip == null || ip.length() == 0 || UNKNOWN_IP.equalsIgnoreCase(ip)) {
               ip = request.getHeader("X-Real-IP");
           }
           if (ip == null || ip.length() == 0 || UNKNOWN_IP.equalsIgnoreCase(ip)) {
               ip = request.getRemoteHost();
           }
           // 获取到的 ip 地址可能经过追加，一般使用 ‘,’ 分隔
           if (ip.contains(",")) {
               ip = ip.split(",")[0];
           }
           // 本地访问，需要获取本机真正的ip地址
           if (ArrayUtil.contains(LOCAL_IP_ARR, ip)) {
               try {
                   ip = InetAddress.getLocalHost().getHostAddress();
               } catch (UnknownHostException e) {
                   log.error(e.getMessage(), e);
               }
           }
           return ip;
       }
   
       /**
        * 获取方法参数名和参数值
        *
        * @param joinPoint
        * @return
        */
       private Map<String, Object> getNameAndValue(ProceedingJoinPoint joinPoint) {
   
           final Signature signature = joinPoint.getSignature();
           MethodSignature methodSignature = (MethodSignature) signature;
           final String[] names = methodSignature.getParameterNames();
           final Object[] args = joinPoint.getArgs();
   
           if (ArrayUtil.isEmpty(names) || ArrayUtil.isEmpty(args)) {
               return Collections.emptyMap();
           }
           if (names.length != args.length) {
               log.warn("{} 方法参数名和参数值数量不一致", methodSignature.getName());
               return Collections.emptyMap();
           }
           Map<String, Object> map = MapUtil.newHashMap();
           for (int i = 0; i < names.length; i++) {
               map.put(names[i], args[i]);
           }
           return map;
       }
   
       /**
        * 切入点
        */
       @Pointcut("execution(public * com.example..*.*Controller.*(..))")
       public void pointCut() {
       }
   
       /**
        * 环绕通知
        *
        * @param point 切入点
        * @return 原方法返回值
        * @throws Throwable 异常信息
        */
       @Around("pointCut()")
       public Object around(ProceedingJoinPoint point) throws Throwable {
   
           // 开始打印请求日志
           ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
           HttpServletRequest request = Objects.requireNonNull(attributes).getRequest();
   
           // 打印请求相关参数
           long startTime = System.currentTimeMillis();
           Object result = point.proceed();
           String userAgentStr = request.getHeader("User-Agent");
           UserAgent userAgent = UserAgentUtil.parse(userAgentStr);
   
           final RequestLogInfo requestLogInfo = RequestLogInfo.builder()
                   .threadId(Long.toString(Thread.currentThread().getId()))
                   .threadName(Thread.currentThread().getName())
                   .ip(getIpAddr(request))
                   .url(request.getRequestURL().toString())
                   .classMethod(point.getSignature().getDeclaringTypeName() + "." + point.getSignature().getName())
                   .httpMethod(request.getMethod())
                   .requestParams(getNameAndValue(point))
                   .result(result)
                   .timeCost(System.currentTimeMillis() - startTime)
                   .userAgent(userAgentStr)
                   .browser(userAgent.getBrowser().toString())
                   .os(userAgent.getOs().toString())
                   .build();
   
           log.info("Request Log Info => {}", JSONUtil.toJsonStr(requestLogInfo));
   
           return result;
       }
   }
   ```

