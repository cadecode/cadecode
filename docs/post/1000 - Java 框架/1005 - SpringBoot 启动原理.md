---

title: SpringBoot 启动原理
date: 2021/2/1
description: 本文介绍 SpringBoot 配置文件的使用及多环境下的配置，如 properties 和 yaml 的区别、@Value、@ConfigurationProperties 以及其他方式读取配置文件
tag: [Java 框架, SpringBoot, Spring, Java]

---


# SpringBoot 启动原理

## 启动类

1. SpringBoot 应用有一个主入口，即 main 方法，其调用 SpringAppliction.run 方法启动程序

2. @SpringBootApplication 注解：

   - @EnableAutoConfiguration：根据应用所声明的依赖来对 Spring 框架进行自动配置
   - @SpringBootConfiguration：JavaConfig 形式的 Spring IOC 容器的配置类
   - @ComponentScan：组件扫描，可自动发现和装配 Bean，默认扫描启动类所在路径下的包

   ```java
   @SpringBootConfiguration
   @EnableAutoConfiguration
   @ComponentScan(...)
   public @interface SpringBootApplication {...}
   ```


## 基本流程

1. 第一部分是初始化模块，配置一些基本的环境变量、资源、构造器、监听器

2. 第二部分实现了应用具体的启动方案，包括启动流程的监听模块、加载配置环境模块、及创建上下文环境模块

3. 第三部分是自动化配置模块，该模块作为 SpringBoot 自动配置核心

   ```
   1. 开始
   2. 收集各种条件和回调接口，如 ApplictionContextInitializer、ApplictionListener
   	-> 通告 started()
   3. 创建并准备 Environment
   	-> 通告 environmentPrepared()
   4. 创建并初始化 ApplicationContext，加载配置
   	-> 通告 contextPrepared()、通告 contextLoaded()
   5. refresh ApplictionContext
   	-> 执行 CommandLineRunner、通告 finished()
   6. 结束
   ```

## 执行过程

1. 启动类的静态 run 方法

   ```java
   public static ConfigurableApplicationContext run(Class<?>[] primarySources, 
                                                    String[] args) {
       return (new SpringApplication(primarySources)).run(args);
   }
   ```

2. SpringApplication 构造方法

   ```java
   public SpringApplication(ResourceLoader resourceLoader, Class<?>... primarySources) {
       // ...
       // 判断应用类型、分为响应式 web 应用、servlet web 应用、以及非 web 应用
       this.webApplicationType = WebApplicationType.deduceFromClasspath();
       // ...
       // 设置初始化器
       this.setInitializers(
           this.getSpringFactoriesInstances(ApplicationContextInitializer.class));
       // 设置监听器
       this.setListeners(this.getSpringFactoriesInstances(ApplicationListener.class));
       // 设置入口方法
       this.mainApplicationClass = this.deduceMainApplicationClass();
   }
   ```

3. 设置初始化器

   ```java
   this.setInitializers(
           this.getSpringFactoriesInstances(ApplicationContextInitializer.class));
   ```

   ```java
   private <T> Collection<T> getSpringFactoriesInstances(Class<T> type, Class<?>[] parameterTypes, Object... args) {
       ClassLoader classLoader = this.getClassLoader();
       // 根据 type 类型，ApplicationContextInitializer.class
       // 从类路径的 META-INF 读取 spring.factories，遍历读取键值对
       Set<String> names = new LinkedHashSet(
           SpringFactoriesLoader.loadFactoryNames(type, classLoader));
       // 根据 names 实例化对象
       List<T> instances = this.createSpringFactoriesInstances(
           type, parameterTypes, classLoader, args, names);
       AnnotationAwareOrderComparator.sort(instances);
       return instances;
   }
   ```

   spring.factories 配置文件

   ```properties
   org.springframework.context.ApplicationContextInitializer=\
   org.springframework.boot.autoconfigure.SharedMetadataReaderFactoryContextInitializer,\
   org.springframework.boot.autoconfigure.logging.ConditionEvaluationReportLoggingListener
   ```

4. 设置监听器

   ```java
   this.setListeners(this.getSpringFactoriesInstances(ApplicationListener.class));
   ```

   ```properties
   org.springframework.context.ApplicationListener=\
   org.springframework.boot.autoconfigure.BackgroundPreinitializer
   ```

5. run 方法

   ```java
   public ConfigurableApplicationContext run(String... args) {
       // 计时器
       StopWatch stopWatch = new StopWatch();
       stopWatch.start();
       DefaultBootstrapContext bootstrapContext = this.createBootstrapContext();
       // 要返回的应用上下文
       ConfigurableApplicationContext context = null;
       // 设置 java.awt.headless 系统属性为 true
       this.configureHeadlessProperty();
       // 加载运行时的监听器
       SpringApplicationRunListeners listeners = this.getRunListeners(args);
       // 发布开始执行事件
       listeners.starting(bootstrapContext, this.mainApplicationClass);
   
       try {
           // 处理启动程序中的参数
           ApplicationArguments applicationArguments = new DefaultApplicationArguments(args);
           // 根据扫描到的监听器对象和函数传入参数，进行环境准备
           ConfigurableEnvironment environment = this.prepareEnvironment(listeners, bootstrapContext, applicationArguments);
           this.configureIgnoreBeanInfo(environment);
           // 设置 Banner
           Banner printedBanner = this.printBanner(environment);
           // 创建 Spring 容器
           context = this.createApplicationContext();
           context.setApplicationStartup(this.applicationStartup);
           // Spring 容器前置处理
           this.prepareContext(bootstrapContext, context, environment, listeners, applicationArguments, printedBanner);
           // ->触发 SpringApplicationRunListener 的 contextPrepared 执行
           this.refreshContext(context);
           // Spring 容器后置处理
           this.afterRefresh(context, applicationArguments);
           stopWatch.stop();
           // 日志打印
           if (this.logStartupInfo) {
               (new StartupInfoLogger(this.mainApplicationClass))
               .logStarted(this.getApplicationLog(), stopWatch);
           }
           // 发出启动结束事件
           listeners.started(context);
           // 依次调用注册的 Runners，ApplicationRunner 和 CommandLineRunner
           this.callRunners(context, applicationArguments);
       } catch (Throwable var10) {
           this.handleRunFailure(context, var10, listeners);
           throw new IllegalStateException(var10);
       }
       try {
        // 发布应用上下文就绪事件
           listeners.running(context);
           return context;
       } catch (Throwable var9) {
           this.handleRunFailure(context, var9, (SpringApplicationRunListeners)null);
           throw new IllegalStateException(var9);
       }
   }
   ```

6. run 方法 - 加载运行时的监听器

   ```java
   SpringApplicationRunListeners listeners = this.getRunListeners(args);
   ```
   
   ```java
   // 获取运行监听的监听者们，在对应的阶段会发送对应的事件到监听者
   private SpringApplicationRunListeners getRunListeners(String[] args) {
       Class<?>[] types = new Class[]{SpringApplication.class, String[].class};
       return new SpringApplicationRunListeners(
           logger,
           this.getSpringFactoriesInstances(
               SpringApplicationRunListener.class, types, this, args),
           this.applicationStartup);
   }
   ```
   
   SpringApplicationRunListener 类：
   
   ```java
   public interface SpringApplicationRunListener {
   
   	// 当调用 run 方法后会立即调用，可以用于非常早期的初始化
       default void starting(ConfigurableBootstrapContext bootstrapContext) {
           starting();
       }
   
       // 环境准备好之后调用
       default void environmentPrepared(ConfigurableBootstrapContext bootstrapContext,
                                        ConfigurableEnvironment environment) {
           environmentPrepared(environment);
       }
   
       // 在加载资源之前，ApplicationContext 准备好之后调用
       default void contextPrepared(ConfigurableApplicationContext context) {
       }
   
       // 在加载应用程序上下文但在其刷新之前调用
   
       default void contextLoaded(ConfigurableApplicationContext context) {
       }
   
       // 上下文已经刷新且应用程序已启动且所有 CommandLineRunner 和 ApplicationRunner 未调用之前调用
       default void started(ConfigurableApplicationContext context) {
       }
   
       // 上下文已经刷新且应用程序已启动且所有 CommandLineRunner 和 ApplicationRunner 都已被调用
       default void running(ConfigurableApplicationContext context) {
       }
   
       // 在启动过程发生失败时调用
       default void failed(ConfigurableApplicationContext context, Throwable exception) {
       }
   }
   ```

7. run 方法 - 环境准备

   ```java
   private ConfigurableEnvironment prepareEnvironment(SpringApplicationRunListeners listeners,
                                                      DefaultBootstrapContext bootstrapContext, ApplicationArguments applicationArguments) {
       // 根据不同的 web 类型创建不同实现的 Environment 对象
       ConfigurableEnvironment environment = getOrCreateEnvironment();
       // 配置环境
       this.configureEnvironment(environment, applicationArguments.getSourceArgs());
       ConfigurationPropertySources.attach(environment);
       // 发送环境已准备完成事件
       listeners.environmentPrepared(bootstrapContext, environment);
       DefaultPropertiesPropertySource.moveToEnd(environment);
       // 根据命令行参数中 spring.profiles.active 属性配置 Environment 对象中的 activeProfile
       this.configureAdditionalProfiles(environment);
       // 绑定环境中 spring.main 属性到 SpringApplication 对象中
       this.bindToSpringApplication(environment);
       // 如果用户使用 spring.main.web-application-type 属性手动设置了 webApplicationType
       if (!this.isCustomEnvironment) {
           // 将环境对象转换成用户设置的 webApplicationType 相关类型，由于继承同一个父类，直接强转
           environment = new EnvironmentConverter(getClassLoader())
               .convertEnvironmentIfNecessary(environment,                             
                                              deduceEnvironmentClass());
       }
       ConfigurationPropertySources.attach(environment);
       return environment;
   }
   ```

8. run 方法 - prepareContext

   ```java
   private void prepareContext(DefaultBootstrapContext bootstrapContext,
                               ConfigurableApplicationContext context,
                               ConfigurableEnvironment environment,
                               SpringApplicationRunListeners listeners,
                               ApplicationArguments applicationArguments,
                               Banner printedBanner) {
       // 设置上下文环境
       context.setEnvironment(environment);
       this.postProcessApplicationContext(context);
       // 执行 spring.factories 的 ApplicationContextInitializer 对象的 initialize 方法
       this.applyInitializers(context);
   	// 发布上下文准备完成事件到所有监听器
       listeners.contextPrepared(context);
       bootstrapContext.close(context);
       if (this.logStartupInfo) {
           this.logStartupInfo(context.getParent() == null);
           this.logStartupProfileInfo(context);
       }
   
       ConfigurableListableBeanFactory beanFactory = context.getBeanFactory();
       beanFactory.registerSingleton("springApplicationArguments", applicationArguments);
       if (printedBanner != null) {
           beanFactory.registerSingleton("springBootBanner", printedBanner);
       }
   
       if (beanFactory instanceof DefaultListableBeanFactory) {
           ((DefaultListableBeanFactory)beanFactory).setAllowBeanDefinitionOverriding(
               this.allowBeanDefinitionOverriding);
       }
   
       if (this.lazyInitialization) {
           context.addBeanFactoryPostProcessor(
               new LazyInitializationBeanFactoryPostProcessor());
       }
       // 加载资源
       Set<Object> sources = this.getAllSources();
       Assert.notEmpty(sources, "Sources must not be empty");
       // 加载 bean 到上下文对象
       this.load(context, sources.toArray(new Object[0]));
       // 发送上下文加载完成事件
       listeners.contextLoaded(context);
   }
   ```

9. run 方法 - refreshContext

   ```java
   private void refreshContext(ConfigurableApplicationContext context) {
       // 注册 jvm 停止时的钩子
       if (this.registerShutdownHook) {
           try {
               context.registerShutdownHook();
           } catch (AccessControlException var3) {
           }
       }
   
       this.refresh((ApplicationContext)context);
   }
   
   protected void refresh(ConfigurableApplicationContext applicationContext) {
       applicationContext.refresh();
   }
   ```

   调用了 ConfigurableApplicationContext refresh 方法

   ```java
   public interface ConfigurableApplicationContext extends ApplicationContext, Lifecycle, Closeable {
   	void refresh() throws BeansException, IllegalStateException;
   }
   ```

   ConfigurableApplicationContext  实现类有三个：

   AbstractApplictionContext、ServletWebServerApplicationContext、ReactiveWebServerApplicationContext

   AbstractApplictionContext 是抽象类，其他两个类继承了 AbstractApplictionContext

   ```java
   public void refresh() throws BeansException, IllegalStateException {
       synchronized (this.startupShutdownMonitor) {
           StartupStep contextRefresh = 
               this.applicationStartup.start("spring.context.refresh");
   
           // 第一步：准备更新上下时的预备工作
           prepareRefresh();
   
           // 第二步：获取上下文内部 BeanFactory
           ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();
   
           // 第三步：对 BeanFactory 做预备工作
           prepareBeanFactory(beanFactory);
   
           try {
               // 第四步：允许在上下文子类中对 bean 工厂进行 post-processing
               postProcessBeanFactory(beanFactory);
   
               StartupStep beanPostProcess = 
                   this.applicationStartup.start("spring.context.beans.post-process");
               // 第五步：调用上下文中注册为 bean 的工厂 BeanFactoryPostProcessor
               invokeBeanFactoryPostProcessors(beanFactory);
   
               // 第六步：注册拦截 bean 创建的拦截器
               registerBeanPostProcessors(beanFactory);
               beanPostProcess.end();
   
               // 第七步：初始化 MessageSource 国际化相关
               initMessageSource();
   
               // 第八步：初始化容器事件广播器，用来发布事件
               initApplicationEventMulticaster();
   
               // 第九步：初始化一些特殊的 bean
               onRefresh();
   
               // 第十步：将所有监听器注册到前两步创建的事件广播器中
               registerListeners();
   
               // 第十一步：结束 bean 的初始化工作（主要将所有单例 BeanDefinition 实例化）
               finishBeanFactoryInitialization(beanFactory);
   
               // 第十二步：afterRefresh（上下文刷新完毕，发布相应事件）
               finishRefresh();
           } catch (BeansException ex) {
               if (logger.isWarnEnabled()) {
                   logger.warn("Exception encountered during context initialization - " +
                               "cancelling refresh attempt: " + ex);
               }
   
               // 销毁已经创建的单例，以避免资源常驻占用
               destroyBeans();
   
               // Reset 'active' flag.
               cancelRefresh(ex);
   
               throw ex;
           } finally {
               // 重置公共缓存，因为有些创建 bean 的元数据可能不再需要
               resetCommonCaches();
               contextRefresh.end();
           }
       }
   }
   ```

   ServletWebServerApplicationContext 的实现：
   
   ```java
   @Override
   public final void refresh() throws BeansException, IllegalStateException {
       try {
           super.refresh();
       } catch (RuntimeException ex) {
           WebServer webServer = this.webServer;
           if (webServer != null) {
               webServer.stop();
           }
           throw ex;
       }
   }
   ```

## 自动配置

1. @EnableAutoConfiguration 

   @EnableAutoConfiguration 是 @SpringBootApplication 的一部分

   ```java
   @Import({AutoConfigurationImportSelector.class})
   public @interface EnableAutoConfiguration {...}
   ```

   AutoConfigurationImportSelector 配合 SpringFactoriesLoader 将所有符合条件的 @Configuration 配置类加载到 IOC 容器

2. AutoConfigurationImportSelector

   ```java
   protected List<String> getCandidateConfigurations(AnnotationMetadata metadata,
                                                     AnnotationAttributes attributes) {
       // 加载 spring.factories 配置信息
       List<String> configurations = 
           SpringFactoriesLoader.loadFactoryNames(getSpringFactoriesLoaderFactoryClass(),
                                                  getBeanClassLoader());
       // ...
       return configurations;
   }
   ```

3. SpringFactoriesLoader.loadFactoryNames

   SpringFactoriesLoader是一个抽象类，类中定义的静态属性定义了其加载资源的路径

   ```java
   public static final String FACTORIES_RESOURCE_LOCATION = "META-INF/spring.factories";
   ```

   此外还有三个静态方法：

   - loadFactories：加载指定的 factoryClass 并进行实例化
   - loadFactoryNames：加载指定的 factoryClass 的名称集合
   - instantiateFactory：对指定的 factoryClass 进行实例化

   spring.factories 配置了许多 xxxAutoConfiguration 类，被加载到容器中后，由于这些配置类中充斥着大量 @Conditional 系列的注解，标明了生效的条件，使得在合适条件下自动配置相应的内容

4. 示例

   Hello.java

   ```java
   public class Hello {
   
       private String msg;
   
       public String getMsg() {
           return msg;
       }
   
       public void setMsg(String msg) {
           this.msg = msg;
       }
   }
   ```

   HelloProperties.java

   ```java
   @ConfigurationProperties(prefix = "hello") 
   public class HelloProperties {
   
       private String msg;
   
       public String getMsg() {
           return msg;
       }
   
       public void setMsg(String msg) {
           this.msg = msg;
       }
   }
   ```

   HelloAutoConfiguration.java

   ```java
   // 配置类
   @Configuration
   // 将 HelloProperties 加入 IOC 容器
   @EnableConfigurationProperties(HelloProperties.class)
   // 判断 Hello 类是否在 classpath 中存在，如果存在，才会实例化该类的 bean
   @ConditionalOnClass(Hello.class)
   // 根据配置决定是否实例化该类的 Bean
   @ConditionalOnProperty(prefix="hello", value="enabled", matchIfMissing = true)
   public class HelloAutoConfiguration {
   
       @Autowired
       private HelloProperties helloProperties;
   
       @Bean
       // 容器中如果没有 Hello 的 bean,，就配置一个 Hello 的 bean
       @ConditionalOnMissingBean(Hello.class)
       public Hello hello() {
           Hello hello = new Hello();
           hello.setMsg(helloProperties.getMsg());
           return hello;
       }
   }
   ```

   资源目录下新建 META-INF/spring.factories

   ```java
   org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
     com.example.demo.pojo.HelloAutoConfiguration
   ```

   application.properties

   ```properties
   hello.enabled=true
   hello.msg=abcde
   ```

   测试，配置生效

   ```java
   @SpringBootTest
   class DemoApplicationTests {
   
       @Autowired
       Hello hello;
   
       @Test
       void contextLoads() {
           System.out.println(hello.getMsg());
       }
   }
   ```
