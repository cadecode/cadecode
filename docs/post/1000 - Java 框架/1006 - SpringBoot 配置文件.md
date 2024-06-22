---

title: SpringBoot 配置文件
date: 2021/2/9
description: 本文介绍 SpringBoot 配置文件的使用及多环境下的配置，如 properties 和 yaml 的区别、@Value、@ConfigurationProperties 以及其他方式读取配置文件等
tag: [Java 框架, SpringBoot, Spring, Java]

---

# SpringBoot 配置文件

## properties 和 yaml

1. 语法

   appliction.properties

   ```properties
   server.port=8080
   ```

   appliction.yaml

   ```yaml
   server:
     port: 8080
   ```

   在 properties 文件中是以点进行分割的， 在 yaml 中是用冒号进行分割

   yaml 是 json 的超集，同样是键值对格式，通过冒号进行赋值，且冒号后赋值时需要一个空格

2. 官方推荐使用 yaml

   yaml 支持中文：

   ​	需要注意文件编码，使用 UTF-8 确保不会乱码或报错

   yaml 支持列表：

   ```yaml
   my:
     servers:
       - dev.example.com
       - another.example.com
   
   # 使用 properties
   # my.servers[0]=dev.example.com
   # my.servers[1]=another.example.com
   ```

   yaml 支持单文件多配置：

   ```yaml
   # 用 --- 分割多个配置
   server:
       address: 192.168.1.100
   ---
   spring:
       profiles: development
   server:
       address: 127.0.0.1
   ---
   spring:
       profiles: production
   server:
       address: 192.168.1.120
   ```

3. 配置文件优先级

   配置文件可存放位置

   - 外置，在相对于应用程序运行目录的 /config 子目录里。
   - 外置，在应用程序运行的目录里
   - 内置，在 config 包内
   - 内置，在 classpath 根目录

   优先级从上到下递减，同位置 properties 文件比 yaml 优先级高

## 使用 @Value

application.yaml

```yaml
app:
  name: Spring Boot Demo
  version: 1.0
```

App.java

```java
@Component
@Data
@ToString
public class App {

    @Value("${app.name}")
    private String name;

    @Value("${app.version}")
    private String version;
}
```

测试

```java
@SpringBootTest
class DemoApplicationTests {

    @Autowired
    App app;

    @Test
    void contextLoads() {
        System.out.println(app);
    }
}
// App(name=Spring Boot Demo, version=1.0)
```

注意，静态变量的注入

```java
@Component
@Data
@ToString
public class App {
    
    private static String flag;

    // 在 set 方法上 @Value
    // 注意该方法不是静态的
    @Value("${app.flag}")
    public void setFlag(String s) {
        flag = s;
    }
}
```

## 使用 @ConfigurationProperties

application.yaml

```yaml
app:
  name: Spring Boot Demo
  version: 1.0
```

App.java

```java
@ConfigurationProperties(prefix = "app")
@Data
@ToString
public class App {

    private String name;

    private String version;
}
```

测试

```java
@SpringBootTest
@EnableConfigurationProperties(App.class)
class DemoApplicationTests {

    @Autowired
    App app;

    @Test
    void contextLoads() {
        System.out.println(app);
    }

}
```

> @EnableConfigurationProperties 将 @ConfigurationProperties 标注的类加入 IOC 容器，相当于 @ConfigurationProperties 与 @Component 连用

SpringBoot 2.2 之后还可以使用 @ConstructorBinding，通过构造方法注入

```java
@ConstructorBinding
@ConfigurationProperties(prefix = "app")
@ToString
public class App {

    private String name;

    private String version;

    public App(String name, String version) {
        this.name = name;
        this.version = version;
    }
}
```

## @PropertyResource

@PropertyResource 常与 @ConfigurationProperties 连用，用来选择指定要读取的配置文件

App.java

```java
@Component
@ConfigurationProperties(prefix = "app")
// 指定配置文件
@PropertySource(value = {"classpath:app.properties"})
@Data
@ToString
public class App {

    private String name;

    private String version;
}
```

resource 下的 app.properties

```properties
app.name=Spring Boot Demo
app.version=1.1
```

如果使用 yaml 格式配置文件，指定 yaml 位置，需要自定义 PropertySourceFactory

```java
public class YamlAndPropertySourceFactory extends DefaultPropertySourceFactory {

    @Override
    public PropertySource<?> createPropertySource(String name, EncodedResource resource) throws IOException {
        if (resource == null) {
            return super.createPropertySource(name, resource);
        }
        Resource resourceResource = resource.getResource();
        if (!resourceResource.exists()) {
            return new PropertiesPropertySource(null, new Properties());
        } else if (resourceResource.getFilename().endsWith(".yml") ||
                resourceResource.getFilename().endsWith(".yaml")) {
            List<PropertySource<?>> sources = new YamlPropertySourceLoader()
                    .load(resourceResource.getFilename(), resourceResource);
            return sources.get(0);
        }
        return super.createPropertySource(name, resource);
    }
}
```

```java
@Component
@ConfigurationProperties(prefix = "app")
// 指定 PropertySourceFactory
@PropertySource(value = {"classpath:app.yaml"}, factory = YamlAndPropertySourceFactory.class)
@Data
@ToString
public class App {
    // ...
}
```

## 其他方式读取配置文件

1. JDK 原生方法

   Properties 类读取 properties

   ```java
   Properties properties = new Properties();
   InputStream stream = 
       this.getClass().getClassLoader().getResourceAsStream("app.properties");
   // 或 InputStream stream = this.getClass().getResourceAsStream("/app.properties");
   properties.load(stream);
   String name = properties.getProperty("app.name");
   ```

   ResourceBundle 类读取 properties

   ```java
   // app.properties
   ResourceBundle bundle = ResourceBundle.getBundle("app");
   String name = bundle.getString("app.name");
   ```

   > 在 SpringBoot 启动前，使用 System.setProperty 方法，可将键值对设置为全局变量，SpringBoot 也会读取该配置

2. SpringBoot 提供

   Environment 类可读取 application.yaml 或 application.properties

   > 实现 EnvironmentPostProcessor 接口，可将任意 yaml 和 properties 配置文件加载到 Environment 中
   
   ```java
   @SpringBootTest
   class DemoApplicationTests {
   
       @Autowired
       private Environment env;
       
       @Test
       void contextLoads() throws Exception {
           String name = env.getProperty("app.name");
           System.out.println(name);
       }
   }
   ```

   YamlPropertiesFactoryBean 解析 yaml，并转换为 Properties
   
   ```java
   YamlPropertiesFactoryBean yaml = new YamlPropertiesFactoryBean();
   Resource resource = new ClassPathResource("app.yaml");
   yaml.setResources(resource);
   Properties properties = yaml.getObject();
   String name  = properties.getProperty("app.name");
   System.out.println(name);
   ```

   YamlMapFactoryBean 解析 yaml，并转换为 Map
   
   ```java
   YamlMapFactoryBean yaml = new YamlMapFactoryBean();
   yaml.setResources(new ClassPathResource("app.yaml"));
   Map<String, Object> map = yaml.getObject();
   Map<String, Object> app = (Map<String, Object>) map.get("app");
   String name = (String) app.get("name");
   System.out.println(name);
   ```
   
   Binder 类负责将对象与配置参数进行绑定，可进行类型转换，以及提供回调方法介入绑定的各个阶段进行深度定制
   
   ```java
   // 绑定对象，首先要绑定配置
   User user = Binder.get(environment)
       // 将属性绑定到对象上
       .bind( "custom.user", Bindable.of(User.class) )
       // 获取实例
       .get(); 
   
   // 绑定 Map
   Map<String,Object> propMap = Binder.get(environment)
       .bind( "custom.user",Bindable.mapOf(String.class, Object.class) ).get();
   
   // 绑定 List
   List<String>r list = Binder.get(environment)
       .bind( "custom.strings",Bindable.listOf(String.class) ).get();
   
   // 转换以及默认值
   String datestr = (String) Binder.get(environment)
       .bind( "custom.date",Bindable.of(String.class) )
       // 转换为大写
       .map(String::toUpperCase)
       // 默认值
       .orElse("bad date string");
   
   // 绑定过程回调函数
   LocalDate str = Binder.get(environment)
       .bind("custom.date", Bindable.of(LocalDate.class), new BindHandler() {
           @Override
           public <T> Bindable<T> onStart(ConfigurationPropertyName name, 
                                          Bindable<T> target, BindContext context) {
               log.info("绑定开始{}",name);
               return target;
           }
   
           @Override
           public Object onSuccess(ConfigurationPropertyName name, 
                                   Bindable<?> target, 
                                   BindContext context, Object result) {
               log.info("绑定成功{}",target.getValue());
               return result;
           }
   
           @Override
           public Object onFailure(ConfigurationPropertyName name, 
                                   Bindable<?> target, 
                                   BindContext context, Exception error) throws Exception {
               log.info("绑定失败{}",name);
               return null;
           }
   
           @Override
           public void onFinish(ConfigurationPropertyName name, 
                                Bindable<?> target, 
                                BindContext context, Object result) throws Exception {
               log.info("绑定结束{}",name);
           }
       }).get();
   ```
   
   


## 多环境配置

> SpringBoot 的配置文件默认为`application.yml`或`application.properties`
>
> 不同 profile 下的配置文件由 `application-{profile}.yml` 管理

1. 通过 spring.profiles.active 指定 profile

   通过指定 `spring.profiles.active` 属性决定使用具体哪个环境的 profile

   `application-{profile}.yml` 配置文件会覆盖默认配置文件 `application.yml`下的同一属性

   一般 profile 有以下几种：dev、test、prod

   ```xml
   spring:
     profiles:
       active: dev
   ```

2. 通过 maven 指定 profile

   在项目或模块的 pom.xml 里添加 `profiles` 节点

   ```xml
   <profiles>
       <profile>
           <id>dev</id>
           <activation>
               <activeByDefault>true</activeByDefault>
           </activation>
           <properties>
               <profileActive>dev</profileActive>
           </properties>
       </profile>
       <profile>
           <id>prod</id>
           <properties>
               <profileActive>prod</profileActive>
           </properties>
       </profile>
       <profile>
           <id>test</id>
           <properties>
               <profileActive>test</profileActive>
           </properties>
       </profile>
   </profiles>
   ```

   配置资源过滤

   ```xml
   <build>
       <finalName>ROOT</finalName>
       <resources>
           <resource>
               <directory>src/main/resources</directory>
               <!-- 过滤资源 -->
               <excludes>
                   <exclude>application*.yml</exclude>
               </excludes>
           </resource>
           <resource>
               <directory>src/main/resources</directory>
               <!-- 是否替换 @xx@ 表示的 maven properties 属性值 -->
               <filtering>true</filtering>
               <!-- 引入资源 -->
               <includes>
                   <include>application.yml</include>
                   <include>application-${profileActive}.yml</include>
               </includes>
           </resource>
       </resources>
   </build>
   ```

   application.yaml

   ```yaml
   spring:
     profiles:
       active: @profileActive@
   ```

   maven 命令，通过 -P 指定 `@profileActive@`

   ```
   mvn clean package -Dmaven.test.skip=true -P dev
   ```

3. 在程序中获取 profile 配置

   通过 Environment 类

   ```java
   @SpringBootTest
   class DemoApplicationTests {
   
       @Autowired
       Environment env;
   
       @Test
       void contextLoads() throws Exception {
           // 获取生效的 profile 数组
           String[] activeProfiles = env.getActiveProfiles();
           // 判断 profile 是否生效
           Profiles profiles = Profiles.of("dev", "test");
           boolean b = env.acceptsProfiles(profiles);
           
           System.out.println(activeProfiles[0]);
           System.out.println(b);
       }
   }
   // dev
   // true
   ```

   通过注解 @Profile

   ```java
   @Profile("dev","test")
   // 可以加在类或方法上
   // 环境满足时才生效
   ```

