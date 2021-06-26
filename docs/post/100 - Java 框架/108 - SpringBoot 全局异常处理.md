---

title: SpringBoot 全局异常处理
date: 2021/2/26
description: SpringBoot 中 @ControllerAdvice 注解提供了全局异常处理的方法，还可以通过封装接口返回内容及 ResponseBodyAdvice 接口来统一返回格式
tag: [SpringBoot, Spring, Java 框架]

---

# SpringBoot 全局异常处理

## 封装返回格式

1. 规范的后端返回格式在携带数据的同时，往往附带状态码、错误信息、其他 message 等

   ```json
   {
       "code": "200",
       "msg": "执行成功",
       "data": [
           {
               "name": "张三",
               "age": 18
           },
           {
               "name": "李四",
               "age": 19
           }
       ]
   }
   ```

2. ResultStatus 请求状态枚举类

   ```java
   public enum ResultStatus {
   
       SUCCESS("200", "执行成功"),
   
       ERROR("500", "执行出错"),
   
       TOKEN_ERROR("400", "Token 错误"),
   
       NOT_EXIST("404", "目标资源不存在"),
       ;
   
       private String code;
       private String msg;
   
       ResultStatus(String code, String msg) {
           this.code = code;
           this.msg = msg;
       }
   
       public String getCode() {
           return code;
       }
   
       public String getMsg() {
           return msg;
       }
   }
   ```

3. BaseException 自定义异常类

   ```java
   public class BaseException extends RuntimeException {
   
       private String code;
       private String msg;
   
       public BaseException(ResultStatus status) {
           super(status.getMsg());
           this.code = status.getCode();
           this.msg = status.getMsg();
       }
   
       public String getCode() {
           return code;
       }
   
       public String getMsg() {
           return msg;
       }
   }
   ```

4. 封装 Result 类用来包装返回内容

   ```java
   public class Result {
   
       // 状态码
       private String code;
   
       // 状态信息
       private String msg;
   
       // 主要数据
       @JsonInclude(JsonInclude.Include.NON_NULL)
       private Object data;
   
       private Result(String code, String msg, Object data) {
           this.code = code;
           this.msg = msg;
           this.data = data;
       }
   
       public String getCode() {
           return code;
       }
   
       public String getMsg() {
           return msg;
       }
   
       public Object getData() {
           return data;
       }
   
       /**
        * 构造自定义的消息返回
        *
        * @param code
        * @param msg
        * @param data
        * @return
        */
       public static Result of(String code, String msg, Object data) {
           return new Result(code, msg, data);
       }
   
       /**
        * 由 ResultStatus 构造消息返回
        *
        * @param status
        * @param data
        * @return
        */
       public static Result ofStatus(ResultStatus status, Object data) {
           return of(status.getCode(), status.getMsg(), data);
       }
   
       /**
        * 构造成功的消息返回
        *
        * @param data
        * @return
        */
       public static Result success(Object data) {
           return ofStatus(ResultStatus.SUCCESS, data);
       }
   
       /**
        * 由 Exception 构造消息返回
        *
        * @param exception
        * @param data
        * @return
        */
       public static Result ofException(Exception exception, Object data) {
   
           String code = exception instanceof BaseException
                   ? ((BaseException) exception).getCode()
                   : ResultStatus.ERROR.getCode();
   
           String msg = exception != null
                   ? "[" + exception.getClass() + "]" + exception.getMessage()
                   : ResultStatus.ERROR.getMsg();
   
           return of(code, msg, data);
       }
   }
   ```

## 统一处理异常

1. 使用 @ControllerAdvice 和 @ExceptionHandler 统一处理异常

   ```java
   @ControllerAdvice
   public class GlobalExceptionHandler {
   
       @ResponseBody
       @ExceptionHandler(value = Exception.class)
       public Result handleException(Exception e) {
           return Result.ofException(e, null);
       }
   }
   ```

2. @ExceptionHandler 方法接收一个异常对象，可获取异常相关信息
3. Contoller 层不需要主动捕获异常，直接抛出即可

## 统一返回格式

1. 使用 @ControllerAdvice，实现 ResponseBodyAdvice 接口

   ```java
   @ControllerAdvice
   public class CommonResponseHandler implements ResponseBodyAdvice {
   
       private ObjectMapper objectMapper = new ObjectMapper();
   
       @Override
       public boolean supports(MethodParameter returnType, Class converterType) {
           // 返回 true 则 beforeBodyWrite 方法生效
           return true;
       }
   
       @Override
       public Object beforeBodyWrite(Object body, MethodParameter returnType, 
                                     MediaType selectedContentType,
                                     Class selectedConverterType, ServerHttpRequest request,
                                     ServerHttpResponse response) {
           if (body instanceof Result) {
               return body;
           }
           // String 类型特殊处理
           if (body instanceof String) {
               try {
                   // 将 Result 转为 json 字符串返回
                   return objectMapper.writeValueAsString(Result.success(body));
               } catch (JsonProcessingException e) {
                   e.printStackTrace();
               }
           }
           return Result.success(body);
       }
   }
   ```

2. @ControllerAdvice 需要指定生效的包，否则容易影响其他功能，如 swagger 文档

## 处理 404 异常

1. 上述方法无法捕捉 404 异常，可在 application.xml 进行如下配置

   ```properties
   # 出现错误时, 直接抛出异常
   spring.mvc.throw-exception-if-no-handler-found=true
   # 不要为我们工程中的资源文件建立映射
   spring.resources.add-mappings=false
   ```

   为什么这样配置：

   - throw-exception-if-no-handler-found 用来决定是否抛出 NoHandlerFoundException

   - SpringBoot 默认配置了`/**`的资源映射，即使地址错误也会匹配到静态资源地址

2. 通过实现 ErrorController 接口解决

   ```java
   @Controller
   public class NotFoundExceptionHandler implements ErrorController {
       @Override
       public String getErrorPath() {
           return "/error";
       }
   
       @RequestMapping("/error")
       @ResponseBody
       public Object error(HttpServletRequest request) {
           return Result.ofStatus(ResultStatus.NOT_EXIST, null);
       }
   }
   ```

   

