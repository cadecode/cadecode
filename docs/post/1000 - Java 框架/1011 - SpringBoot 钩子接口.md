---

title: SpringBoot 钩子接口
date: 2021/3/17
description: 本文介绍 SpringBoot 提供的钩子接口，如 Aware 接口族、InitializingBean、BeanPostProcessor、BeanFactoryPostProcessor 等
tag: [Java 框架, SpringBoot, Spring, Java]

---

# SpringBoot 钩子接口

## Aware 接口族

1. Aware 意为感知，实现 Aware 接口并重写其方法，可以从上下文中获取当前的运行环境
2. 常见的 aware 接口
   - BeanNameAware
   - BeanFactoryAware
   - BeanClassLoaderAware
   - ApplicationContextAware

3. 使用

   ```java
   @Component
   @ToString
   public class TestService  implements BeanNameAware, BeanClassLoaderAware {
       private String beanName;
       private ClassLoader classLoader;
   
       @Override
       public void setBeanClassLoader(ClassLoader classLoader) {
           this.classLoader = classLoader;
       }
   
       @Override
       public void setBeanName(String name) {
           this.beanName= name;
       }
   
   }
   ```

## InitializingBean

1. InitializingBean 接口用于在 Bean 的初始化阶段执行自定义的操作，类型功能的还有 DisposableBean

2. 使用

   ```java
   @Component
   public class TestBean implements InitializingBean, DisposableBean {
   
       // bean 设置完属性之后调用
       @Override
       public void afterPropertiesSet() throws Exception {
           // 初始化操作
           System.out.println("TestBean init");
       }
   
       // 销毁之后调用
       @Override
       public void destroy() throws Exception {
           // 释放资源
           System.out.println("TestBean destroy");
       }
   }
   ```

## BeanPostProcessor

1. BeanPostProcessor，Bean 的后置处理器，与 InitializingBean 不同的是，BeanPostProcessor 对所有 Bean 生效

2. 使用

   ```java
   @Component
   public class TestPostProcessor implements BeanPostProcessor {
   
       @Override
       public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
           System.out.println("Bean 初始化前");
           return bean;
       }
   
       @Override
       public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
           System.out.println("Bean 初始化后");
           return bean;
       }
   }
   ```

3. BeanPostProcessor 使用场景非常多，可以获取正在初始化的 Bean 对象，然后依据该 Bean 对象做一些定制化的操作，如：判断该 Bean 是否为某个特定对象、获取 Bean 的注解元数据等
4.  Spring 内置了非常多的 BeanPostProcessor ，以此来完善自身功能

## BeanFactoryPostProcessor

1. BeanFactoryPostProcessor 是 Bean 工厂的后置处理器，一般用来修改上下文中的 BeanDefinition

2. 使用 

   ```java
   @Component
   public class TestFactoryPostProcessor implements BeanFactoryPostProcessor {
       @Override
       public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
           System.out.println("所有 BeanDefinition 已被加载，但还未实例化 Bean");
           
           // 动态添加 BeanDefinition
           //转换为子类 DefaultListableBeanFactory
           DefaultListableBeanFactory defaultBeanFactory = 
               (DefaultListableBeanFactory) beanFactory;
           //new 一个 beanDefinition对象
           GenericBeanDefinition b = new GenericBeanDefinition();
           b.setBeanClass(Testbean.class);
           //添加一个 beanDefinition 对象
           defaultBeanFactory.registerBeanDefinition("testBean", b);
           
           // 动态获取 BeanDefinition
   		Object o = defaultBeanFactory.getBean("testBean")
       }
   }
   ```

3. BeanDefinition 包含了 Spring 实例化一个 Bean 的所需的信息

## ImportSelector

1. ImportSelector 可以动态的返回需要被容器管理的类，一般用来返回外部的配置类

   ```java
   public class TestImportSelector implements ImportSelector {
       @Override
       public String[] selectImports(AnnotationMetadata importingClassMetadata) {
           
           // AnnotationMetadata 存储注解元数据信息
           // 可以动态的返回需要被容器管理的类名称
           if (importingClassMetadata.hasAnnotation("")) {
               // 判断是否包含某个注解
           }
           
           // TestBean 加入到 Spring 容器中
           return new String[]{"com.example.pojo.TestBean"};
       }
   }
   ```

2. 在标注 @Configuration 注解的类中，通过 @Import 导入 ImportSelector 来使之生效

   ```java
   @Configuration
   @Import(TestImportSelector.class)
   public class TestConfig {
   }
   ```

## ImportBeanDefinitionRegistrar

1. ImportBeanDefinitionRegistrar 也是配合 @Import 使用，可直接将 Bean 注册到容器中

2. 使用

   ```java
   public class TestRegistrar implements ImportBeanDefinitionRegistrar {
       @Override
       public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata,
                                           BeanDefinitionRegistry registry) {
           GenericBeanDefinition b = new GenericBeanDefinition();
           b.setBeanClass(NotScanBean.class);
           b.setLazyInit(true);
           // 注册到容器中
           registry.registerBeanDefinition(NotScanBean.class.getName(), b);
       }
   }
   ```

## FactoryBean

1. FactoryBean 为创建 Bean 提供了更加灵活的方式，常用于用于创建一类 Bean

2. Bean 实现 FactoryBean 后，通过 getBean(String BeanName) 获取到的 Bean 对象并不是 FactoryBean 的实现类对象，而是这个实现类中的 getObject() 方法返回的对象，在 BeanName 之前加上 &，可以获取 FactoryBean 的实现类对象

3. 使用

   ```java
   @Component
   public class TestFactoryBean implements FactoryBean<TestBean> {
       @Override
       public TestBean getObject() throws Exception {
   
           // 对 Bean 进行配置
           // 如代理、修饰等
   
           return new TestBean();
       }
   
       @Override
       public Class<?> getObjectType() {
           return null;
       }
   }
   ```

## ApplicationListener

1. ApplicationListener 是 Spring 实现事件机制的核心接口，属于观察者设计模式

2. ApplicationContext 可以发布 ApplicationEvent 事件，之后所有的 ApplicationListener 会被回调

3. 自定义 ApplicationEvent

   ```java
   public class TestApplicationEvent extends ApplicationEvent {
   
       public TestApplicationEvent(Object source) {
           super(source);
       }
   
       public void hello(){
           System.out.println("Hello Word!");
       }
   }
   ```

4. 自定义 ApplicationListener

   ```java
   @Component
   public class TestApplicationListener implements ApplicationListener {
   
       @Override
       public void onApplicationEvent(ApplicationEvent event) {
           if (event instanceof TestApplicationEvent) {
               TestApplicationEvent testApplicationEvent = (TestApplicationEvent) event;
               testApplicationEvent.hello();
           }
       }
   }
   ```

5. 通过注入 ApplicationContext 或实现 ApplicationContextAware 接口，获取 ApplicationContext 对象，发布 ApplicationEvent

   ```java
   @SpringBootTest
   class DemoApplicationTests {
   
       @Autowired
       ApplicationContext applicationContext;
   
       @Test
       public void test() {
           applicationContext.publishEvent(new TestApplicationEvent(new DemoApplication()));
       }
   }
   // Hello Word!
   ```

## ApplicationRunner

1. SpringBoot 应用启动成功会 callRunners 方法，所有 ApplicationRunner 实现类都会被回调

2. 实现 AppilcationRunner，ApplicationArguments 类型用来接收启动参数

   ```java
   @Component
   public class MyApplicationRunner implements ApplicationRunner {
   
       @Override
       public void run(ApplicationArguments args) throws Exception {
           System.out.println("原始参数：" + Arrays.asList(args.getSourceArgs()));
           Set<String> keys = args.getOptionNames();
           for (String key : keys) {
               System.out.println("解析后的 key: [" + key + "]  value: " + args.getOptionValues(key));
           }
           System.out.println("无 OptionName 的参数： " + args.getNonOptionArgs());
       }
   }
   // 例：启动参数 --a=1 --b c
   // 打印 =>
   // 原始参数：[--a=1, --b, c]
   // 解析后的 key: [a]  value: [1]
   // 解析后的 key: [b]  value: []
   // 无 OptionName 的参数： [c]
   ```

3. CommandLineRunner 和 ApplicationRunner 类似，但是只能获得没有经过解析的原始参数
