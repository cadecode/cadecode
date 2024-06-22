---

title: SpringBoot 集成 MyBatis
date: 2021/6/1
description: 本文介绍 SpringBoot 集成 MyBatis 的基本配置、通过 AOP 和注解动态实现切换数据源的方法，以及利用 MyBatis 拦截器打印完整可执行 SQL 的方法
tag: [Java 框架, SpringBoot, Spring, MyBatis, Java]

---

# SpringBoot 集成 MyBatis

## 简介

1. MyBatis 基于 Apache 的开源项目 iBatis，是一款优秀的持久层框架

2. mybatis-spring-boot-starter 提供了 MyBatis 和 SpringBoot 无缝集成的方式

3. maven 引入 mybatis-spring-boot-starter

   ```xml
   <dependency>
       <groupId>org.mybatis.spring.boot</groupId>
       <artifactId>mybatis-spring-boot-starter</artifactId>
       <version>2.1.1</version>
   </dependency>
   ```

   SpringBoot 2.x 需要 mybatis-spring-boot-starter 2.1 及以上版本

4. mybatis-spring-boot-starter 提供的基本功能
   - 自动发现存在的 DataSource
   - 利用 SqlSessionFactoryBean 创建 SqlSessionFactory
   - 创建并注册 SqlSessionTemplate
   - 自动扫描 mappers，注册到 Spring 上下文中方便注入

## 基础配置

1. 配置数据源连接

   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/demo?useSSL=true&useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai
       driver-class-name: com.mysql.cj.jdbc.Driver
       username: root
       password: root
   ```

2. 配置连接池和数据源初始化

   ```yaml
   spring:
     datasource:
       # ...（数据源连接配置）
       # 指定连接池
       type: com.zaxxer.hikari.HikariDataSource
       initialization-mode: always
       continue-on-error: true
       # 指定初始化使用的 SQL 脚本
       schema:
         - "classpath:db/schema.sql"
       data:
         - "classpath:db/
       # 配置 hikari 连接词
       hikari:
         minimum-idle: 5
         connection-test-query: SELECT 1 FROM DUAL
         maximum-pool-size: 20
         auto-commit: true
         idle-timeout: 30000
         pool-name: DemoHikariCP
         max-lifetime: 60000
         connection-timeout: 30000
   ```

   常用的连接池有 DBCP，tomcat-jdbc，CP30，Druid 等，SpringBoot 默认使用 hikari

3. 配置 mapper 文件路径

   ```yaml
   mybatis:
     mapper-locations: classpath:mybatis/mappers/*.xml
     type-aliases-package: com.example.demo.model
   ```

4. 启动类或其他配置类上配置扫描 mapper 接口文件的包名

   ```java
   @Configuration
   @MapperScan(value = {"com.example.demo.mapper"})
   public class DataSourceConfig {
   
   }
   ```

5. 使用 Java 类代替 yaml 文件进行配置

   配置数据源 DataSource
   
   ```java
   @Configuration
   @MapperScan(value = {"com.example.demo.mapper"})
   public class DataSourceConfig {
   
       @Bean
       public DataSource dataSource() {
           HikariDataSource dataSource = new HikariDataSource();
           // 配置连接属性
           dataSource.setJdbcUrl("jdbc:mysql://localhost:3306/demo?useSSL=true&useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai");
           dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
           dataSource.setUsername("root");
           dataSource.setPassword("root");
   		// 配置连接池参数
           dataSource.setMinimumIdle(5);
           dataSource.setConnectionTestQuery("SELECT 1 FROM DUAL");
           dataSource.setMaximumPoolSize(20);
           dataSource.setAutoCommit(true);
           dataSource.setIdleTimeout(30000);
           dataSource.setPoolName("Config-HikariCP");
           dataSource.setMaxLifetime(60000);
           dataSource.setConnectionTimeout(30000);
   
           return dataSource;
       }
   }
   ```
   
   配置数据源初始化 dataSourceInitializer
   
   ```java
   @Bean
   public DataSourceInitializer dataSourceInitializer() {
       // 指定数据源初始化设置
       ResourceDatabasePopulator resourceDatabasePopulator = new ResourceDatabasePopulator();
       resourceDatabasePopulator.addScript(new ClassPathResource("/db/schema.sql"));
       resourceDatabasePopulator.addScript(new ClassPathResource("/db/data.sql"));
       resourceDatabasePopulator.setContinueOnError(true);
       DataSourceInitializer dataSourceInitializer = new DataSourceInitializer();
       dataSourceInitializer.setDatabasePopulator(resourceDatabasePopulator);
       dataSourceInitializer.setDataSource(dataSource());
       return dataSourceInitializer;
   }
   ```
   
   配置 MyBatis 映射文件位置和 typeAlias
   
   ```java
   @Bean
   public SqlSessionFactory sqlSessionFactory() throws Exception {
       SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
       sqlSessionFactoryBean.setDataSource(dataSource());
       sqlSessionFactoryBean.setMapperLocations(
           new PathMatchingResourcePatternResolver().getResources("classpath*:mybatis/mappers/*.xml")
       );
       sqlSessionFactoryBean.setTypeAliasesPackage("com.example.demo.entity");
   
       return sqlSessionFactoryBean.getObject();
   }
   ```

## 多数据源

1. 基本配置实现

   原理：使用 @MapperScan 注解对不同包的 mapper 类绑定不同的 sqlSessionFactory，即映射文件

   数据源和 mybatis 配置部分也可以使用 YAML 配置

   使用 Java 配置类配置如下

   ```java
   @Configuration
   // 配置 mapper 扫描，不同包下使用不同的 sqlSessionFactory
   @MapperScan(value = {"com.example.demo.mapper"}, sqlSessionFactoryRef = "sqlSessionFactory")
   @MapperScan(value = {"com.example.demo.mapper2"}, sqlSessionFactoryRef = "sqlSessionFactory2")
   public class DataSourceConfig {
   
       // 配置主数据源
       @Bean
       @Primary
       public DataSource dataSource() {
           HikariDataSource dataSource = new HikariDataSource();
           dataSource.setJdbcUrl("jdbc:mysql://localhost:3306/demo?useSSL=true&useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai");
           dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
           dataSource.setUsername("root");
           dataSource.setPassword("root");
   
           dataSource.setMinimumIdle(5);
           dataSource.setConnectionTestQuery("SELECT 1 FROM DUAL");
           dataSource.setMaximumPoolSize(20);
           dataSource.setAutoCommit(true);
           dataSource.setIdleTimeout(30000);
           dataSource.setPoolName("Config-HikariCP");
           dataSource.setMaxLifetime(60000);
           dataSource.setConnectionTimeout(30000);
   
           return dataSource;
       }
   
       // 配置数据源 2
       @Bean
       public DataSource dataSource2() {
           // 同上数据源配置代码，指定的另外数据库
       }
   
   
       // 配置 mybatis sqlSessionFactory
       @Bean("sqlSessionFactory")
       @Primary
       public SqlSessionFactory sqlSessionFactory() throws Exception {
           SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
           sqlSessionFactoryBean.setDataSource(dataSource());
           sqlSessionFactoryBean.setMapperLocations(
                   new PathMatchingResourcePatternResolver().getResources("classpath*:mybatis/mappers/*.xml")
           );
           sqlSessionFactoryBean.setTypeAliasesPackage("com.example.demo.entity");
   
           return sqlSessionFactoryBean.getObject();
       }
   
       // 配置 mybatis sqlSessionFactory2
       @Bean("sqlSessionFactory2")
       public SqlSessionFactory sqlSessionFactory2() throws Exception {
           SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
           sqlSessionFactoryBean.setDataSource(dataSource2());
           sqlSessionFactoryBean.setMapperLocations(
                   new PathMatchingResourcePatternResolver().getResources("classpath*:mybatis/mappers2/*.xml")
           );
           sqlSessionFactoryBean.setTypeAliasesPackage("com.example.demo.entity");
   
           return sqlSessionFactoryBean.getObject();
       }
   }
   ```

   如上配置后进行测试，mapper 包下 mapper 类将使用主数据源，mapper2 包下 mapper 类将使用数据源 2

2. AOP 实现动态切换

   原理：继承 AbstractRoutingDataSource，重写 determineCurrentLookupKey 方法

   动态数据源类：
   
   ```java
   public class DynamicDataSource extends AbstractRoutingDataSource {
   
       @Override
       protected DataSource determineTargetDataSource() {
           return super.determineTargetDataSource();
       }
   
       /**
        * 通过设置数据源 Key 值来切换数据
        */
       @Override
       protected Object determineCurrentLookupKey() {
           return DynamicDataSourceContextHolder.getDataSourceKey();
       }
   
       /**
        * 设置默认数据源
        *
        * @param defaultDataSource
        */
       public void setDefaultDataSource(Object defaultDataSource) {
           super.setDefaultTargetDataSource(defaultDataSource);
       }
   
       /**
        * 设置数据源
        *
        * @param dataSources
        */
       public void setDataSources(Map<Object, Object> dataSources) {
           super.setTargetDataSources(dataSources);
           // 将数据源的 key 放到数据源上下文的 key 集合中，用于切换时判断数据源是否有效
           DynamicDataSourceContextHolder.addDataSourceKeys(dataSources.keySet());
       }
   }
   
   ```
   
   DynamicDataSourceContextHolder，用于保存和获取数据源 key
   
   ```java
   public class DynamicDataSourceContextHolder {
   
       private static final ThreadLocal<String> contextHolder = new ThreadLocal<>();
   
   
       /**
        * 数据源的 key 集合，用于切换时判断数据源是否存在
        */
       public static List<Object> dataSourceKeys = new ArrayList<>();
   
       /**
        * 切换数据源
        *
        * @param key
        */
       public static void setDataSourceKey(String key) {
           contextHolder.set(key);
       }
   
       /**
        * 获取数据源
        *
        * @return
        */
       public static String getDataSourceKey() {
           return contextHolder.get();
       }
   
       /**
        * 重置数据源
        */
       public static void clearDataSourceKey() {
           contextHolder.remove();
       }
   
       /**
        * 判断是否包含数据源
        *
        * @param key 数据源 key
        * @return
        */
       public static boolean containDataSourceKey(String key) {
           return dataSourceKeys.contains(key);
       }
   
       /**
        * 添加数据源 keys
        *
        * @param keys
        * @return
        */
       public static boolean addDataSourceKeys(Collection<? extends Object> keys) {
           return dataSourceKeys.addAll(keys);
       }
   }
   ```
   
   数据源配置类
   
   ```java
   @Configuration
   @MapperScan(value = {"com.example.demo.mapper"})
   public class DataSourceConfig {
   
       // 配置主数据源
       @Bean
       public DataSource dataSource() {
           HikariDataSource dataSource = new HikariDataSource();
           dataSource.setJdbcUrl("jdbc:mysql://localhost:3306/demo?useSSL=true&useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai");
           dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
           dataSource.setUsername("root");
           dataSource.setPassword("root");
   
           dataSource.setMinimumIdle(5);
           dataSource.setConnectionTestQuery("SELECT 1 FROM DUAL");
           dataSource.setMaximumPoolSize(20);
           dataSource.setAutoCommit(true);
           dataSource.setIdleTimeout(30000);
           dataSource.setPoolName("Config-HikariCP");
           dataSource.setMaxLifetime(60000);
           dataSource.setConnectionTimeout(30000);
   
           return dataSource;
       }
   
       // 配置数据源 2
       @Bean
       public DataSource dataSource2() {
           // ...数据源配置
       }
   
   
       // 配置动态数据源
       @Bean("dynamicDataSource")
       public DataSource dynamicDataSource() {
           DynamicDataSource dynamicDataSource = new DynamicDataSource();
           Map<Object, Object> dataSourceMap = new HashMap<>(2);
           // 注册数据源，此处可以定制为从配置文件读取
           dataSourceMap.put("master", dataSource());
           dataSourceMap.put("second", dataSource2());
           dynamicDataSource.setDefaultDataSource(dataSource());
           dynamicDataSource.setDataSources(dataSourceMap);
           return dynamicDataSource;
       }
   
   
       // 配置 mybatis sqlSessionFactory
       @Bean("sqlSessionFactory")
       @Primary
       public SqlSessionFactory sqlSessionFactory() throws Exception {
           SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
           sqlSessionFactoryBean.setDataSource(dynamicDataSource());
           sqlSessionFactoryBean.setMapperLocations(
                   new PathMatchingResourcePatternResolver().getResources("classpath*:mybatis/mappers/*.xml")
           );
           sqlSessionFactoryBean.setTypeAliasesPackage("com.example.demo.entity");
   
           return sqlSessionFactoryBean.getObject();
       }
   
       // 配置事务管理器
       @Bean
       public PlatformTransactionManager transactionManager() {
           return new DataSourceTransactionManager(dynamicDataSource());
       }
   }
   ```
   
   AOP 代理方法，执行前切换数据源，执行后恢复默认
   
   ```java
   @Aspect
   // 设置 Order 使切面在 @Transactional 之前执行
   @Order(-1)
   @Component
   public class DynamicDataSourceAspect {
   
       private Logger logger = LoggerFactory.getLogger(this.getClass());
   
       /**
        * 切换数据源
        *
        * @param point
        * @param dataSource
        */
       @Before("@annotation(dataSource)")
       public void switchDataSource(JoinPoint point, DataSource dataSource) {
           String dataSourceKey = dataSource.value();
           if (!DynamicDataSourceContextHolder.containDataSourceKey(dataSourceKey)) {
               logger.info("DataSource [{}] doesn't exist, use default", dataSource.value());
           } else {
               // 切换数据源
               DynamicDataSourceContextHolder.setDataSourceKey(dataSource.value());
               logger.info("Switch DataSource to [{}] in Method [{}]", dataSourceKey, point.getSignature());
           }
       }
   
       /**
        * 重置数据源
        *
        * @param point
        * @param dataSource
        */
       @After("@annotation(dataSource))")
       public void resetDataSource(JoinPoint point, DataSource dataSource) {
           // 将数据源置为默认数据源
           DynamicDataSourceContextHolder.clearDataSourceKey();
           logger.info("Reset DataSource to default in Method [{}]", point.getSignature());
       }
   }
   ```

## 打印日志

1. 打印 Mybatis 日志

   以 logback 为例，配置 logback.xml

   ```xml
   <!--定义 logger
           name 指定要输出日志的包
           level 指定等级
           additivity 指定是否将 root 的 appender 加入到 logger 中
       -->
   <logger name="com.example.dao" level="${level}" additivity="true">
   	<!-- 配置 appender -->
       <appender-ref ref="errorAppender" />
       <appender-ref ref="debugAppender" />
       <appender-ref ref="infoAppender" />
   </logger>
   
   <!-- mybatis 日志 -->
   <!-- mybatis 打印 sql
        SpringBoot 项目只要配置 dao 或 mapper 包
        普通 SSM 项目可能还需要以下配置
    -->
   <logger name="org.apache.ibatis" level="DEBUG" />
   <logger name="java.sql" level="DEBUG" />
   ```

2. 打印完整 SQL

   上面通过 logback 配置文件进行的配置只能打印预处理的 SQL 语句，不便于直接执行调试

   借助 MyBatis 的拦截器，可以获取 MyBatis 封装的 SQL 语句对象，可进一步获得参数，拼接 SQL 并打印

   ```java
   @Intercepts({
           @Signature(type = Executor.class, method = "update", args = {MappedStatement.class, Object.class}),
           @Signature(type = Executor.class, method = "query",
                   args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class})})
   public class SqlPrintingInterceptor implements Interceptor {
   
       private static final Logger logger = LoggerFactory.getLogger(SqlPrintingInterceptor.class);
   
       @Override
       public Object intercept(Invocation invocation) throws Throwable {
           // 获取 SQL 描述语句对象
           MappedStatement mappedStatement = (MappedStatement) invocation.getArgs()[0];
           // 获取参数
           Object parameter = null;
           if (invocation.getArgs().length > 1) {
               parameter = invocation.getArgs()[1];
           }
           // 获取 SQL Id
           String sqlId = mappedStatement.getId();
           // 获取 BoundSql 即 mybatis 封装的 SQL 对象
           BoundSql boundSql = mappedStatement.getBoundSql(parameter);
           // 获取配置
           Configuration configuration = mappedStatement.getConfiguration();
           // 计时，执行
           long start = System.currentTimeMillis();
           Object returnValue = invocation.proceed();
           long time = System.currentTimeMillis() - start;
           // 打印 SQL
           showSql(configuration, boundSql, time, sqlId);
           return returnValue;
       }
       
       /**
        * 处理 sql 中的字符
        
        * @param configuration
        * @param boundSql
        * @param time
        * @param sqlId
        */
       private static void showSql(Configuration configuration, BoundSql boundSql, long time, String sqlId) {
           Object parameterObject = boundSql.getParameterObject();
           List<ParameterMapping> parameterMappings = boundSql.getParameterMappings();
           // 替换空格、换行、tab缩进等
           String sql = boundSql.getSql().replaceAll("[\\s]+", " ");
           if (parameterMappings.size() > 0 && parameterObject != null) {
               TypeHandlerRegistry typeHandlerRegistry = configuration.getTypeHandlerRegistry();
               if (typeHandlerRegistry.hasTypeHandler(parameterObject.getClass())) {
                   sql = sql.replaceFirst("\\?", getParameterValue(parameterObject));
               } else {
                   MetaObject metaObject = configuration.newMetaObject(parameterObject);
                   for (ParameterMapping parameterMapping : parameterMappings) {
                       String propertyName = parameterMapping.getProperty();
                       if (metaObject.hasGetter(propertyName)) {
                           Object obj = metaObject.getValue(propertyName);
                           sql = sql.replaceFirst("\\?", getParameterValue(obj));
                       } else if (boundSql.hasAdditionalParameter(propertyName)) {
                           Object obj = boundSql.getAdditionalParameter(propertyName);
                           sql = sql.replaceFirst("\\?", getParameterValue(obj));
                       }
                   }
               }
           }
           logs(time, sql, sqlId);
       }
   
       /**
        * 对不同类型参数进行处理
        *
        * @param obj
        * @return
        */
       private static String getParameterValue(Object obj) {
           String value;
           if (obj instanceof String) {
               value = "'" + obj + "'";
           } else if (obj instanceof Date) {
               DateFormat formatter = DateFormat.getDateTimeInstance(DateFormat.DEFAULT, DateFormat.DEFAULT, Locale.CHINA);
               value = "'" + formatter.format(new Date()) + "'";
           } else {
               if (obj != null) {
                   value = obj.toString();
               } else {
                   value = "";
               }
           }
           return value.replace("$", "\\$");
       }
   
       /**
        * 打印 log
        
        * @param time
        * @param sql
        * @param sqlId
        */
       private static void logs(long time, String sql, String sqlId) {
           String sb = "==> Executed [" + sqlId + "] in " + time + " ms with sql：" + sql;
           logger.info(sb);
       }
   
       @Override
       public Object plugin(Object target) {
           return Plugin.wrap(target, this);
       }
   
       @Override
       public void setProperties(Properties properties0) {
       }
   }

