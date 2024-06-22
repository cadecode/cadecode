---
title: SpringMVC 基础
date: 2020/11/11
description: 本文介绍 SpringMVC 框架的配置和使用，如 SpingMVC 的基本处理流程、注解的使用、请求参数的传递、文件上传以及功能增强等
tag: [Java 框架, Spring, Java]

---

# SpringMVC 基础

## 介绍

1. SpringMVC 是 Spring 框架集中的用以 Web 开发的 MVC 框架
2. SpringMVC 框架是以请求为驱动，围绕 servlet 设计，将请求发给控制器，然后通过模型对象，分派器来展示请求结果视图。其中核心类是 DispatcherServlet，它是一个 servlet，顶层是实现的 servlet 接口
3. 优点
   - 轻量级、简单易学
   - 高效、基于请求响应的 MVC 框架
   - 与 Spring 无缝结合
   - 约定优于配置
   - 功能强大：Restful、数据验证、格式化、本地化等
4. 流程
   - 用户发送请求至前端控制器 DispatcherServlet
   - DispatcherServlet 收到请求调用 HandlerMapping 处理器映射器
   - 处理器映射器找到具体的处理器（根据xml配置、注解进行），生成处理器对象及处理器拦截器返回给 DispatcherServlet
   - DispatcherServlet 调用 HandlerAdapter 处理器适配器
   - HandlerAdapter经过适配调用具体的处理器（Controller）
   - Controller执行完成返回 ModelAndView
   - HandlerAdapter 将 controller 执行结果 ModelAndView 返回给 DispatcherServlet
   - DispatcherServlet 将 ModelAndView 传给 ViewReslover 视图解析器
   - ViewReslover 解析后返回具体 View
   - DispatcherServlet 根据 View 进行渲染视图（即将模型数据填充至视图中）
   - DispatcherServlet 响应用户

## 基本使用

1. maven 创建 webapp 程序
   
   一些依赖
   
   ```xml
   <dependencies>
       <dependency>
           <groupId>junit</groupId>
           <artifactId>junit</artifactId>
           <version>4.11</version>
           <scope>test</scope>
       </dependency>
       <dependency>
           <groupId>javax.servlet</groupId>
           <artifactId>servlet-api</artifactId>
           <version>2.5</version>
       </dependency>
       <dependency>
           <groupId>javax.servlet.jsp</groupId>
           <artifactId>jsp-api</artifactId>
           <version>2.2</version>
       </dependency>
       <dependency>
           <groupId>org.springframework</groupId>
           <artifactId>spring-webmvc</artifactId>
           <version>5.2.8.RELEASE</version>
       </dependency>
   </dependencies>
   ```

2. web.xml 配置
   
   ```xml
   <web-app>
       <!--前端控制器-->
       <servlet>
           <servlet-name>app</servlet-name>
           <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
           <init-param>
               <param-name>contextConfigLocation</param-name>
               <param-value>classpath:springmvc-servlet.xml</param-value>
           </init-param>
       </servlet>
       <servlet-mapping>
           <servlet-name>app</servlet-name>
           <!--如果使用 /*，会匹配 .jsp-->
           <url-pattern>/</url-pattern>
       </servlet-mapping>
   </web-app>
   ```

3. springmvc-servlet.xml 配置
   
   ```xml
   <!--处理器映射器-->
   <!--BeanNameUrlHandlerMapping 是 SpringMVC 提供的处理器映射器的一种，按照 bean 的 name 属性匹配-->
   <bean class="org.springframework.web.servlet.handler.BeanNameUrlHandlerMapping" />
   <!--处理器适配器-->
   <bean class="org.springframework.web.servlet.mvc.SimpleControllerHandlerAdapter" />
   <!--视图解析器-->
   <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
       <!--将视图位置设置在 WEB-IBF 下的 jsp 目录中-->
       <property name="prefix" value="/WEB-INF/jsp" />
       <property name="suffix" value=".jsp" />
   </bean>
   ```

4. HelloController.java
   
   ```java
   public class HelloController implements Controller {
   
       @Override
       public ModelAndView handleRequest(HttpServletRequest request, 
                                         HttpServletResponse response) throws Exception {
           ModelAndView mv = new ModelAndView();
           // 转发到 WEB-INF/jsp/hello.jsp
           mv.setViewName("/hello");
           return mv;
       }
   }
   ```

5. 配置处理器
   
   在 spingmvc-servlet.xml 中配置
   
   ```xml
   <!--处理器-->
   <bean name="/hello" class="controller.HelloController"></bean>
   ```

6. 视图文件
   
   在 webapp/WEB-INF 目录下，新建 jsp 目录，创建 hello.jsp

7. 启动服务器，访问 /hello 进行测试，成功转发到视图 hello.jsp

## 使用注解

1. 配置开启注解
   
   ```xml
   <!--开启自动扫描-->
   <context:component-scan base-package="..." />
   <!--启用默认的静态资源处理器，html、js、css、mp3 等-->
   <mvc:default-servlet-handler />
   <!--启用 MVC 注解支持，如 @RequestMapping-->
   <mvc:annotation-driven>
       <!--设置消息转化器默认编码，解决前端拿到数据乱码-->
       <mvc:message-converters register-defaults="true">
           <bean class="org.springframework.http.converter.StringHttpMessageConverter">
               <property name="defaultCharset" value="UTF-8" />
           </bean>
       </mvc:message-converters>
   </mvc:annotation-driven>
   ```
   
   mvc:annotation-driven 帮我们注入了  DefaultAnnotationHandlerMapping 和 AnnotationMethodHandlerMapping 两个 bean

2. 常用注解介绍
   
   @Controller 将类标注为控制器，不用在继承 Controller 接口了
   
   @RequestMapping 标注进入该控制器的匹配路径，可以用以类和方法
   
   @ResponseBody 将返回内容转为 JSON 字符串，写入输入流返回给前端
   
   @RequestParam 作用在方法参数中，从请求查询串中解析参数内容
   
   @RequestBody 与 @RequestParam 类似，从请求体中解析参数内容
   
   @RestController 拥有 @Controller 功能，并将所有方法标注为 @ResponseBody
   
   ```java
   @Controller
   public class HelloController {
   
       // 匹配请求路径
       // 类似：@GetMapping、@PostMapping...
       @RequestMapping("/hello")
       public String hello(Model model) {
           model.addAttribute("msg", "来自 HelloController.hello 的消息");
           // 没使用 @ResponseBody，会走视图解析器
           // 如果使用 @ResponseBody，则直接返回字符串
           return "hello";
       }
   }
   ```

## 接受请求

1. @RequestParam
   
   ```java
   @ResponseBody
   @RequestMapping("/hello")
    public String hello(@RequestParam(value = "username", required = false) String name,
                        @RequestParam(required = false, defaultValue = "1") Integer age) {
        return name + " " + age;
    }
   ```
   
   value 用于定义有前端传来的要解析的键名
   
   required 表示是否必须携带该数据，默认为 true 时，没有该数据无法正确匹配
   
   defaultValue 用于在没有解析到对应数据时赋予初值
   
   > @RequestParam 使用场景
   > 
   > 可解析请求查询串内容和请求类型为 x-www-form-urlencoded 或 form-data 时的请求体内容
   > 
   > 1. 使用基本类型或 String 接收时，根据名称匹配键值对
   > 2. 使用 String 接收时，如果查询串和请求体内的同名键值对会自动以逗号拼接
   > 3. 使用 List 或数组接收时，可用一个键名对应多个逗号分隔的值，来绑定到 List 或数组
   > 4. 使用 List 或数组接收时，如果查询串和请求体内的同名键值对会自动合并，可以用 List、数组接收
   > 5. 使用 Map 接收时，可对查询串和请求体内的键值对生成 Map
   > 6. 不可以使用实体类接收

2. @RequestBody
   
   ```java
   @ResponseBody
   @RequestMapping("/hello")
   public User hello(@RequestBody User user) {
       return user;
   }
   ```
   
   required 表示是否必须携带该数据，默认为 true 时，没有该数据无法正确匹配
   
   > @RequestBody 只能解析请求体中的内容，且请求类型为 appliction/json
   > 
   > 使用 MappingJackson2HttpMessageConverter 进行解析和转换，支持自动绑定实体类或 Map

3. 不使用 @RequestParam 和 @RequestBody
   
   类似于 @RequestParam，可以绑定实体类，不可以接收 List、Map，一般不推荐使用

## 返回响应

1. ModelAndView
   
   ModelAndView 转发到 hello.jsp 并携带信息
   
   ```java
   @RequestMapping("/hello")
   public ModelAndView hello() {
       ModelAndView modelAndView = new ModelAndView();
       modelAndView.setViewName("hello");
       modelAndView.addObject("msg", "转发到 hello.jsp");
       return modelAndView;
   }
   ```
   
   ModelAndView 构造方法
   
   ```java
   ModelAndView mv = new ModelAndView("redirect:/404.htm"); // 重定向
   ModelAndView mv = new ModelAndView("forward:/404.htm"); // 请求转发
   ```
   
   重定向的方法还有返回 String， 如 return "redirect:/404.html"，配合在参数中接收 Model 作为参数，传递信息
   
   ```java
   @RequestMapping("/hello")
   public String hello(Model model) {
      model.addAttribute("msg", "消息~");
      return "hello";
   }
   ```
   
   Model是每次请求中都存在的默认参数，利用其 addAttribute() 方法传递内容到页面中
   
   同时，我们总能够在 Controller 的方法参数中使用 HttpServletRequest 和 HttpServletResponse 对象
   
   ```java
   @RequestMapping("/hello")
   public String hello( HttpServletRequest request, HttpServletResponse response) {
       request.setAttribute("msg", "消息~");
       response.addCookie(new Cookie("c", "cookie~"));
       return "hello";
   }
   ```

2. @ResponseBody
   
   @RespnseBody 将方法结果写入字符串，返回给前端
   
   ```java
   @ResponseBody
   @RequestMapping(value = "/hello")
   public User hello(@RequestBody User user) {
       return user;
   }
   ```
   
   返回结果是一个对象会经过转换生成 JSON 格式的字符串，返回给前端
   
   默认使用 Jackson 进行处理，pom 引入 Jackson 后，自动调用
   
   ```xml
   <dependency>
       <groupId>com.fasterxml.jackson.core</groupId>
       <artifactId>jackson-core</artifactId>
       <version>2.11.2</version>
   </dependency>
   <dependency>
       <groupId>com.fasterxml.jackson.core</groupId>
       <artifactId>jackson-databind</artifactId>
       <version>2.11.2</version>
   </dependency>
   <dependency>
       <groupId>com.fasterxml.jackson.core</groupId>
       <artifactId>jackson-annotations</artifactId>
       <version>2.11.2</version>
   </dependency>
   ```

## 文件上传

1. springmvc 中由 MultipartFile 接口实现文件上传

2. MultipartFile 接口有两个继承实现类，CommonsMultipartFile，StandardMultipartFile
   
   pom 中引入
   
   ```xml
   <dependency>
       <groupId>commons-fileupload</groupId>
       <artifactId>commons-fileupload</artifactId>
       <version>1.3.3</version>
   </dependency>
   ```

3. 在 Controller 方法参数中使用 MultipartFile 接收
   
   ```java
   @ResponseBody
   @RequestMapping(value = "/ipload")
   public String uploadExcel(@RequestParam("file") MultipartFile file, HttpServletRequest req) throws Exception {
       if (file == null) return ;
       String fileName = file.getOriginalFilename();
       String path = req.getServletContext().getRealPath("/upload/");
      // 获取原文件名
       String fileName = file.getOriginalFilename();
       // 创建文件实例
       File filePath = new File(path, fileName);
       // 如果文件目录不存在，创建目录
       if (!filePath.getParentFile().exists()) {
           filePath.getParentFile().mkdirs();
       }
       // 写入文件
       file.transferTo(filePath);
       return "success";
   }
   ```

## 功能增强

1. 拦截器
   
   自定义拦截器 Interceptor 实现 HandlerInterceptor  接口
   
   ```java
   public class MyInterceptor implements HandlerInterceptor {
       // 进入接口方法前调用
       @Override
       public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
           if (handler instanceof HandlerMethod) {
               HandlerMethod handlerMethod = (HandlerMethod) handler;
               // 通过 handler 可以获取要访问的目标接口及方法
               // 进行相关权限判断，返回 false 则不能进入接口执行
           }
           return true;
       }
       // 接口方法执行后，渲染视图前调用
       @Override
       public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
   
       }
       // 视图渲染完成后调用
       @Override
       public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
   
       }
   }
   ```
   
   ```xml
   <!-- 配置拦截器 -->
   <mvc:interceptors>
       <mvc:interceptor>
           <!-- 配置拦截器作用的路径 -->
           <mvc:mapping path="/**" />
           <!--拦截器方法-->
           <bean class="cade.interceptor.MyInterceptor"></bean>
       </mvc:interceptor>
   </mvc:interceptors>
   ```

2. @ControllerAdvice
   
   通过 @ControllerAdvice 配合  @ExceptionHandler 可以对控制层的异常进行处理
   
   @ControllerAdvice 可以指定 basePackages，防止影响全局（如 swagger 不能正常使用）
   
   ```java
   @ControllerAdvice
   public class ExceptionHandler {
   
       @ExceptionHandler(Exception.class)
       @ResponseBody
       public String handleEx(Exception e) {
           return "发生了异常："+ e.getMessage();
       }
   }
   ```

3. 继承  ResponseBodyAdvice 接口
   
   对 body 进行统一处理，如返回固定格式
   
   ```java
   @ControllerAdvice
   public class ResponseHandler implements ResponseBodyAdvice {
       @Override
       public boolean supports(MethodParameter returnType, Class converterType) {
           // 返回 true，beforeBodyWrite 方法才生效
           return true;
       }
   
       @Override
       public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType, Class selectedConverterType, ServerHttpRequest request, ServerHttpResponse response) {
           // 对 body 进行统一处理，如返回固定格式
           return body;
       }
   }
   ```

4. 使用 AOP
   
   注解实现对接口方法的权限验证
   
   ```java
   @Aspect
   @Component
   public class RoleHandler {
   
       // 切入点：所有带有 HasRole 注解的方法
       @Pointcut("@annotation(cade.annotation.HasRole)")
       public void needAuthMethod() {
   
       }
   
       @Before("needAuthMethod()")
       public void before(JoinPoint jp) {
          // 
       }
   }
   ```
   
   AOP 中获取 Method 对象和其上的注解
   
   ```java
   MethodSignature signature = (MethodSignature) jp.getSignature();
   Method method = signature.getMethod();
   HasRole hasRole = method.getAnnotation(HasRole.class);
   ```
   
   AOP 中获取 requset、response 对象
   
   ```java
   ServletRequestAttributes attributes = 
       (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
   HttpServletRequest request = attributes.getRequest();
   HttpServletResponse response = attributes.getResponse();
   ```
   
   AOP 获取任意 Bean
   
   ```java
   // 方法一
   // 自动注入依赖
   @Autowired
   ApplicationContext context;
   // context.getBean() 获取任意 Bean
   
   // 方法二
   @Autowired
   ServletContext servletContext;
   // 也可以是使用 request.getServletContext() 获取
   // WebApplicationContextUtils.getWebApplicationContext(servletContext) 获取 WebAppclicationContext
   // getBean() 获取任意 Bean
   ```
