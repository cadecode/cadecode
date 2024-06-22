---

title: SpringBoot 使用枚举
date: 2022/6/14
description: 本文介绍 SpringBoot 中使用枚举的方式， 包括 @RequestParam 和 @RequestBody 接收枚举、API 接口返回枚举，以及 MyBatis 映射枚举等
tag: [Java 框架, SpringBoot, Java]

---

# SpringBoot 使用枚举

## @RequestParam 转换枚举

1. 示例代码

   枚举

   ```java
   @Getter
   public enum GenderEnum {
   
       MALE(10, "男"),
       FEMALE(11, "女"),
       ;
   
       private final Integer code;
       private final String msg;
   
       GenderEnum(Integer code, String msg) {
           this.code = code;
           this.msg = msg;
       }
   }
   ```

   API 接口

   ```java
   @PostMapping("gender_enum")
   public GenderEnum enumFromParam(@RequestParam GenderEnum gender) {
       return gender;
   }
   ```

2. 默认方式

   SpringMVC 使用 @RequestParam 接收枚举类时，默认使用枚举 name 进行匹配，如示例中 MALE 和 FEMALE

3. 自定义转换方式

   SpringMVC 提供了 Converter 和 ConverterFactory 接口，通过实现这两个接口可定制一个转换器

   定义一个用于转换枚举的接口

   ```java
   public interface EnumConvertor {
   
       /**
        * 返回枚举元素的对应标记
        */
       String convertBy();
   
   }
   ```

   定义字符串到枚举类的转换器

   ```java
   public class StringEnumConvertor<T extends EnumConvertor> implements Converter<String, T> {
   
       private final Map<String, T> enumMap;
   
       public StringEnumConvertor(Class<T> targetType) {
           // 将枚举按照 convertBy 返回的标志转为 map，提高匹配效率
           enumMap = Arrays.stream(targetType.getEnumConstants())
               .collect(toMap(EnumConvertor::convertBy, o -> o, (p, n) -> n));
       }
   
       @Override
       public T convert(String source) {
           return enumMap.get(source);
       }
   }
   ```

   定义通用转换器工厂

   ```java
   public class EnumConvertorFactory implements ConverterFactory<String, EnumConvertor> {
   
       private static final Map<Class<?>, Converter<String, ?>> CONVERTER_MAP 
           = new ConcurrentHashMap<>();
   
       @SuppressWarnings("unchecked")
       @Override
       public <T extends EnumConvertor> Converter<String, T> getConverter(Class<T> targetType) {
           Converter<String, ?> stringConverter = CONVERTER_MAP.get(targetType);
           if (Objects.isNull(stringConverter)) {
               stringConverter = new StringEnumConvertor<>(targetType);
               CONVERTER_MAP.put(targetType, stringConverter);
           }
           return (Converter<String, T>) stringConverter;
       }
   }
   ```

   配置到 SpringMVC 中

   ```java
   @Configuration
   public class WebMvcConfig implements WebMvcConfigurer {
   
       @Override
       public void addFormatters(FormatterRegistry registry) {
           // 添加枚举类的转换器工厂
           registry.addConverterFactory(new EnumConvertorFactory());
       }
   }
   ```

   如何使用枚举转换器？

   实现 EnumConvertor 接口，重写 convertBy 方法，返回枚举元素的标志即可

   ```java
   @Getter
   public enum GenderEnum implements EnumConvertor {
   
       MALE(10, "男"),
       FEMALE(11, "女"),
       ;
   
       private final Integer code;
       private final String msg;
   
       GenderEnum(Integer code, String msg) {
           this.code = code;
           this.msg = msg;
       }
   
       @Override
       public String convertBy() {
           // 这里返回是接口传递的用于匹配的内容
           // 比如按 code 进行转换
           return String.valueOf(this.getCode());
       }
   }
   ```

## @RequestBody 转换枚举

> 以 Jackson 为例

1. 示例代码

   枚举同上

   请求实体

   ```java
   @Data
   public static class RequestObj {
       private GenderEnum gender;
   }
   ```

   API 接口

   ```java
   @PostMapping("gender_enum_body")
   public RequestObj enumFromParam(@RequestBody RequestObj obj) {
       return obj;
   }
   ```

2. 默认方式

   默认方式和使用的 JSON 解析框架有关，此处使用 SpringBoot 推荐且内置的 Jackson

   Jackson 解析器默认按 ordinal 和 name 两种方式解析，如下

   ```java
   // 按 ordinal 解析，数字是枚举元素在所有实例中的索引，即定义的前后顺序
   String json1 = "{\"gender\": 0}";
   RequestObj requestObj1 = JsonUtil.str2Obj(json1, RequestObj.class);
   
   // 按 name 解析，即枚举定义的名称
   String json2 = "{\"gender\":  \"MALE\"}";
   RequestObj requestObj2 = JsonUtil.str2Obj(json2, RequestObj.class);
   ```

3. 自定义转换方式

   @RequestBody 的解析是由 JSON 解析器完成的，所以自定义转换方式需要立足于 Jackson

   第一种方式，使用 @JsonProperty

   从 Jackson2.6 开始  @JsonProperty 用于枚举元素，指定反序列化匹配的字符串

   ```java
   @Getter
   public enum GenderEnum {
   
       // 用 "10" 和 "11" 映射，注意是字符串
       @JsonProperty("10")
       MALE(10, "男"),
       
       @JsonProperty("11")
       FEMALE(11, "女"),
       ;
   
       private final Integer code;
       private final String msg;
   
       GenderEnum(Integer code, String msg) {
           this.code = code;
           this.msg = msg;
       }
   }
   ```

   第二种方式，使用 @JsonCreator

   @JsonCreator 在反序列化时指定一个构造方法或静态工厂方法，用于创建实例

   ```java
   @Getter
   public enum GenderEnum {
   
       MALE(10, "男"),
       FEMALE(11, "女"),
       ;
   
       private final Integer code;
       private final String msg;
   
       GenderEnum(Integer code, String msg) {
           this.code = code;
           this.msg = msg;
       }
   
       /**
        * 从 code 数值转换为枚举元素
        */
       @JsonCreator
       public static GenderEnum from(int code) {
           for (GenderEnum value : GenderEnum.values()) {
               if (value.getCode().equals(code)){
                   return value;
               }
           }
           return null;
       }
   }
   ```

   > 在高版本中可能需要使用 @JsonCreator(mode = Mode.DELEGATING)

## API 接口返回枚举

1. 由于前后端分离架构的流行，API 接口通信一般使用 JSON 格式

   API 接口返回一个对象，经过 JSON 序列化后返回到前端

2. 如何定制枚举序列化后的内容？

   第一种方式，使用 @JsonProperty

   @JsonProperty 不仅可在反序列化时指定匹配内容，也可在序列化时指定输出内容

   第二种方式，使用 @JsonValue

   @JsonValue 标记的属性会作为序列化后的内容

   ```java
   @Getter
   public enum GenderEnum {
   
       MALE(10, "男"),
       FEMALE(11, "女"),
       ;
   
       private final Integer code;
       @JsonValue
       private final String msg;
   
       GenderEnum(Integer code, String msg) {
           this.code = code;
           this.msg = msg;
       }
   }
   ```

   第三种方式，使用 toString 方法序列化

   配置 Jackson 可以 WRITE_ENUMS_USING_TO_STRING 特性

   SpringBoot 中可以使用 Jackson 配置类

   ```java
   @Bean
   public Jackson2ObjectMapperBuilderCustomizer customizer(){
       return builder -> builder
           .featuresToEnable(SerializationFeature.WRITE_ENUMS_USING_TO_STRING);
   }
   ```

   也可以直接对 ObjectMapper 实例配置

   ```java
   ObjectMapper objectMapper = new ObjectMapper();
   objectMapper.configure(SerializationFeature.WRITE_ENUMS_USING_TO_STRING, true);
   ```

## MyBatis 映射枚举

1. MyBatis 插入和查询数据时，对于枚举类型需要进行转换

   重写 TypeHandler 或 BaseTypeHandler，可以对枚举类型定制映射规则

2. MyBatis 解析枚举的默认方式有两种

   ```
   EnumTypeHandler         使用枚举元素名称映射
   EnumOrdinalTypeHandler  使用枚举元素的序号映射
   ```

3. 配置 TypeHandler 的几种方式

   方式一：SpringBoot 配置文件

   ```yaml
   # 配置 typehandler 所在包
   mybatis: 
   	type-handlers-package: com.xxx.typehandler
   ```

   方式二：MyBaits 配置文件，mybatis-config.xml

   ```xml
   <configuration>
       <typeHandlers>
           <package name="com.xxx.typehandler"/>
       </typeHandlers>
   </configuration>
   ```

   方式三：ResultMap 中指定

   ```xml
   <result column="gender" property="GenderEnum"  
           typeHandler="com.xxx.typehandler.GenderEnumTypeHandler"/>
   ```

4. 自定义枚举映射策略

   定义枚举父接口

   ```java
   public interface EnumConvertor {
   
       /**
        * 返回用于数据库持久化的字段内容
        * 数据库使用数值类型存储，如 tinyint unsigned 0~255
        */
       Integer persistBy();
   
   }
   ```

   定义 TypeHandler

   ```java
   @MappedTypes({GenderEnum.class})
   public class MyBatisEnumTypeHandler<E extends Enum<?>> extends BaseTypeHandler<E> {
   
       private final Class<E> type;
   
       private final Map<Integer, E> enumMap;
   
       public MyBatisEnumTypeHandler(Class<E> type) {
           if (Objects.isNull(type)) {
               throw new IllegalArgumentException("类型不能为空");
           }
           this.type = type;
           E[] enums = type.getEnumConstants();
           if (Objects.isNull(enums)) {
               throw new IllegalArgumentException(type.getSimpleName() + " 不是一个枚举类型");
           }
           enumMap = Arrays.stream(enums).collect(toMap(o -> {
               // 实现 EnumConvertor 的枚举根据 persistBy 持久化
               if (o instanceof EnumConvertor) {
                   return ((EnumConvertor) o).persistBy();
               }
               return o.ordinal();
           }, o -> o, (p, n) -> p));
       }
   
       @Override
       public void setNonNullParameter(PreparedStatement ps, int i, E parameter, 
                                       JdbcType jdbcType) throws SQLException {
           // 默认将标记按 int 入库
           if (Objects.isNull(jdbcType)) {
               ps.setInt(i, valueFromEnum(parameter));
               return;
           }
           ps.setObject(i, valueFromEnum(parameter), jdbcType.TYPE_CODE);
       }
   
       @Override
       public E getNullableResult(ResultSet rs, String columnName) throws SQLException {
           int i = rs.getInt(columnName);
           if (rs.wasNull()) {
               return null;
           } else {
               return enumFromValue(i);
           }
       }
   
       @Override
       public E getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
           int i = rs.getInt(columnIndex);
           if (rs.wasNull()) {
               return null;
           } else {
               return enumFromValue(i);
           }
       }
   
       @Override
       public E getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
           int i = cs.getInt(columnIndex);
           if (cs.wasNull()) {
               return null;
           } else {
               return enumFromValue(i);
           }
       }
   
       /**
        * 从 enum 元素中提取指定元素
        */
       private E enumFromValue(Integer value) {
           E e = enumMap.get(value);
           if (Objects.nonNull(e)) {
               return e;
           }
           throw new IllegalArgumentException("未知的泛型元素：" + type.getSimpleName() + "." + value);
       }
   
       /**
        * 从 enum 元素中获取 value
        */
       private Integer valueFromEnum(E e) {
           if (e instanceof EnumConvertor) {
               return ((EnumConvertor) e).persistBy();
           }
           return e.ordinal();
       }
   }
   ```

   定义 TypeHandler 的处理范围

   ```java
   @MappedTypes({GenderEnum.class})
   @MappedJdbcTypes(value = {JdbcType.TINYINT}, includeNullJdbcType = true)
   ```

   @MappedTypes 用于指定 JavaType，@MappedJdbcTypes 用于指定 JdbcType，includeNullJdbcType 表示是否绑定 JdbcType.NULL

   如果不指定则 JavaType 默认为 BaseTypeHandler 的泛型，JdbcType 默认为 JdbcType.NULL

   MyBatis 注册 TypeHandler 的源码

   ```java
   private <T> void register(Type javaType, TypeHandler<? extends T> typeHandler) {
       MappedJdbcTypes mappedJdbcTypes = 
           typeHandler.getClass().getAnnotation(MappedJdbcTypes.class);
       if (mappedJdbcTypes != null) {
           for (JdbcType handledJdbcType : mappedJdbcTypes.value()) {
               register(javaType, handledJdbcType, typeHandler);
           }
           if (mappedJdbcTypes.includeNullJdbcType()) {
               register(javaType, null, typeHandler);
           }
       } else {
           // 这里默认注册 JdbcType.NULL 的处理器
           register(javaType, null, typeHandler);
       }
   }
   ```

   MyBatis 获取 TypeHandler 的源码

   ```java
   private <T> TypeHandler<T> getTypeHandler(Type type, JdbcType jdbcType) {
       if (ParamMap.class.equals(type)) {
           return null;
       }
       Map<JdbcType, TypeHandler<?>> jdbcHandlerMap = getJdbcHandlerMap(type);
       TypeHandler<?> handler = null;
       if (jdbcHandlerMap != null) {
           handler = jdbcHandlerMap.get(jdbcType);
           if (handler == null) {
               handler = jdbcHandlerMap.get(null);
           }
           if (handler == null) {
               // 这里默认选取唯一的处理器
               handler = pickSoleHandler(jdbcHandlerMap);
           }
       }
       return (TypeHandler<T>) handler;
   }
   ```

   MyBatis 会根据 SQL 参数或 ResultMap 中指定的 JdbcType 配合结果类型来选出合适的 TypeHandler

   从 Mybatis 3.4.0 开始，如果只有一个类型只有一个处理器，那么它将是 ResultMap 处理该类型时使用的默认值

   > 这里使用 @MappedTypes({GenderEnum.class}) 为 GenderEnum 的绑定处理器，如果有多个注解需要绑定，应该如何做呢？
   >
   > 1. 实现一个通用的处理器，兼顾需要处理的枚举和普通枚举，并配置为默认枚举处理器
   > 2. 动态注册 TypeHandler

5. MyBatis Plus 对枚举的支持

   MyBatis Plus 提供了 @EnumValue 注解，用于声明持久化的属性

   ```java
   @Getter
   public enum GenderEnum {
   
       MALE(10, "男"),
       FEMALE(11, "女"),
       ;
   
       @EnumValue 
       private final Integer code;
       private final String msg;
   
       GenderEnum(Integer code, String msg) {
           this.code = code;
           this.msg = msg;
       }
   }
   ```

   在配置文件中指定枚举类所在包，MyBaits Plus 会自动扫描内部的 @EnumValue

   ```yaml
   mybatis-plus:
       # 支持统配符 * 或者 ; 分割
       typeEnumsPackage: com.xxx.enums
   ```

   也可以直接修改全局的默认枚举处理器

   ```yaml
   mybatis-plus:
       configuration:
           default-enum-type-handler: com.baomidou.mybatisplus.core.handlers.MybatisEnumTypeHandler
   ```

   
