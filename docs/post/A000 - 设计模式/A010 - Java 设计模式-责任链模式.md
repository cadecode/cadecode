---

title: Java 设计模式-责任链模式
date: 2023/6/22
description: 本文介绍 Java 设计模式中的责任链模式，包括责任链模式的简介、角色、相关代码实现以及该模式的应用场景
tag: [设计模式, Java, 行为型设计模式]

---

# Java 设计模式-责任链模式

## 模式介绍

1. 责任链模式是将一系列处理单元通过指针连接起来，按顺序执行下去，完成对请求的处理

2. 当责任链模式中一个处理单元不适合处理该请求时，将继续传递该请求到下一单元

3. 责任链模式往往使用一个共享的上下文对象来包装请求，该上下文对象同样包含责任链的输出模型

   责任链顺序执行的过程，是上下文输出模型逐渐完善的过程

4. 责任链模式的角色

   上下文：请求参数、输出模型的封装

   处理器选择器：用以决定需要生效的处理器

   处理器：处理单元

   处理器链：处理器链

## 模式实现

1. 责任链的抽象

   上下文抽象

   ```java
   /**
    * 上下文顶级接口
    */
   public interface BizContext {
   
       BizCode getBizCode();
   
       FilterSelector getFilterSelector();
   
       boolean continueChain();
   }
   
   /**
    * 上下文抽象类
    */
   public abstract class AbstractBizContext implements BizContext {
   
       private final BizCode bizCode;
       private final FilterSelector filterSelector;
   
       public AbstractBizContext(BizCode bizCode, FilterSelector filterSelector) {
           this.bizCode = bizCode;
           this.filterSelector = filterSelector;
       }
   
       @Override
       public BizCode getBizCode() {
           return bizCode;
       }
   
       @Override
       public FilterSelector getFilterSelector() {
           return filterSelector;
       }
   }
   
   ```

   处理器选择器抽象和默认实现

   ```java
   /**
    * 过滤器选择器
    */
   public interface FilterSelector {
   
       boolean matchFilter(String currFilterName);
   
       List<String> getFilterNames();
   }
   
   /**
    * 基于本地 list 的过滤器选择器
    */
   @NoArgsConstructor
   @AllArgsConstructor
   public class LocalListFilterSelector implements FilterSelector {
   
       private List<String> filterNames = new ArrayList<>();
   
       @Override
       public boolean matchFilter(String currFilterName) {
           return filterNames.stream().anyMatch(o -> Objects.equals(currFilterName, o));
       }
   
       @Override
       public List<String> getFilterNames() {
           return filterNames;
       }
   
       public void addFilter(String filterName) {
           filterNames.add(filterName);
       }
   
       private void addFilters(List<String> filterNames) {
           this.filterNames.addAll(filterNames);
       }
   }
   ```

   处理器抽象

   ```java
   /**
    * 过滤器接口
    */
   public interface BizFilter<T extends BizContext> {
   
       void doFilter(T context, BizFilterChain<T> filterChain);
   }
   
   /**
    * 过滤器抽象
    */
   public abstract class AbstractBizFilter<T extends BizContext> implements BizFilter<T> {
   
       /**
        * 过滤方法模板
        */
       @Override
       public void doFilter(T context, BizFilterChain<T> filterChain) {
           // 如果包含该 filter
           if (context.getFilterSelector().matchFilter(this.getClass().getSimpleName())) {
               handle(context);
           }
           if (context.continueChain()) {
               filterChain.next(context);
           }
       }
   
       /**
        * 过滤处理主逻辑
        */
       public abstract void handle(T context);
   }
   ```

   处理器链抽象与默认实现

   ```java
   /**
    * 过滤器链接口
    */
   public interface BizFilterChain<T extends BizContext> {
   
       void filter(T context);
   
       void next(T context);
   }
   
   /**
    * 过滤器链默认实现
    */
   public class DefaultBizFilterChain<T extends BizContext> implements BizFilterChain<T> {
   
       @Setter
       private BizFilterChain<T> next;
       private final BizFilter<T> filter;
   
       public DefaultBizFilterChain(BizFilterChain<T> next, BizFilter<T> filter) {
           this.next = next;
           this.filter = filter;
       }
   
   
       /**
        * 当前 filter 处理
        */
       @Override
       public void filter(T context) {
           filter.doFilter(context, this);
       }
   
       /**
        * 下一 filter 处理
        */
       @Override
       public void next(T context) {
           if (Objects.nonNull(this.next)) {
               this.next.filter(context);
           }
       }
   }
   ```

   处理器链工具类 pipeline

   ```java
   /**
    * 管道
    */
   public class FilterChainPipeline<T extends BizFilter<A>, A extends BizContext> {
   
       private DefaultBizFilterChain<A> firstChain;
       private DefaultBizFilterChain<A> lastChain;
   
       public DefaultBizFilterChain<A> getFilterChain() {
           return firstChain;
       }
   
       public void addFilter(T filter) {
           DefaultBizFilterChain<A> newChain = new DefaultBizFilterChain<>(null, filter);
           if (Objects.isNull(firstChain)) {
               firstChain = newChain;
               lastChain = firstChain;
               return;
           }
           lastChain.setNext(newChain);
           lastChain = newChain;
       }
   
   }
   ```

2. 模拟实现订单业务-下单

   上下文

   ```java
   /**
    * 订单业务上下文
    */
   @Getter
   @Setter
   @ToString
   public class OrderContext extends AbstractBizContext {
   
       private boolean continueChain = true;
   
       private OrderParam param;
   
       private OrderModel model;
   
   
       public OrderContext(BizCode bizCode, FilterSelector filterSelector) {
           super(bizCode, filterSelector);
       }
   
       @Override
       public boolean continueChain() {
           return continueChain;
       }
   }
   
   /**
    * 订单业务代码枚举
    */
   @Getter
   public enum OrderCodeEnum implements BizCode {
   
       /**
        * 下单业务
        */
       PLACE_ORDER("PLACE_ORDER"),
       ;
   
       private final String code;
   
       OrderCodeEnum(String code) {
           this.code = code;
       }
   }
   
   /**
    * 订单业务总参数
    */
   @Data
   public class OrderParam {
   
       private Long goodId;
   
       private Long userId;
   }
   /**
    * 订单业务总模型
    */
   @Data
   public class OrderModel {
   
       private Good good;
   
       private User user;
   }
   /**
    * 用户
    */
   @Data
   @AllArgsConstructor
   @NoArgsConstructor
   @Builder
   public class User {
   
       private Long id;
   
       private String name;
   
       private Boolean vipFlag;
   }
   /**
    * 用户
    */
   @Data
   @AllArgsConstructor
   @NoArgsConstructor
   @Builder
   public class User {
   
       private Long id;
   
       private String name;
   
       private Boolean vipFlag;
   }
   ```

   处理器选择器

   处理器

   ```java
   /**
    * 保存消息的过滤器
    */
   public class SaveOrderFilter extends AbstractBizFilter<OrderContext> {
       @Override
       public void handle(OrderContext context) {
           System.out.println("保存下单请求信息");
       }
   }
   
   /**
    * 查询订单信息的过滤器
    */
   public class QueryOrderFilter extends AbstractBizFilter<OrderContext> {
       @Override
       public void handle(OrderContext context) {
           System.out.println("查询订单信息");
           OrderModel model = context.getModel();
           if (Objects.isNull(model)) {
               model = new OrderModel();
               context.setModel(model);
               // 获取 Good User 详细信息
               Good good = Good.builder()
                       .id(context.getParam().getGoodId())
                       .name("商品1")
                       .price("100块")
                       .build();
               User user = User.builder()
                       .id(context.getParam().getUserId())
                       .name("用户1")
                       .vipFlag(true)
                       .build();
               // 让 model 逐渐丰满
               model.setGood(good);
               model.setUser(user);
           }
       }
   }
   
   /**
    * 校验订单
    */
   public class CheckOrderFilter extends AbstractBizFilter<OrderContext> {
       @Override
       public void handle(OrderContext context) {
           // 随机值模拟失败
           if (Math.random() < 0.5) {
               System.out.println("校验订单信息，未通过");
               context.setContinueChain(false);
           } else {
               System.out.println("校验订单信息, 通过");
           }
       }
   }
   
   /**
    * 拉取付款方式
    */
   public class UserPayWayFilter extends AbstractBizFilter<OrderContext> {
       @Override
       public void handle(OrderContext context) {
           System.out.println("拉取用户付款方式信息");
       }
   }
   ```

3. 测试

   ```java
   public class PipelineTests {
   
       /**
        * 下单
        */
       @Test
       public void testPlaceOrder() {
           // 构造责任链
           FilterChainPipeline<BizFilter<OrderContext>, OrderContext> pipeline = new FilterChainPipeline<>();
           pipeline.addFilter(new SaveOrderFilter());
           pipeline.addFilter(new QueryOrderFilter());
           pipeline.addFilter(new CheckOrderFilter());
           pipeline.addFilter(new UserPayWayFilter());
           // 构造责任链选择器，可以选择要启用的 filter
           // 此处可做成工厂，根据 BizCode 匹配不同的选择器
           LocalListFilterSelector filterSelector = new LocalListFilterSelector(Arrays.asList(
                   "SaveOrderFilter",
                   "QueryOrderFilter",
                   "CheckOrderFilter",
                   "UserPayWayFilter"
           ));
           // 订单上下文，业务是 PLACE_ORDER
           OrderContext orderContext = new OrderContext(OrderCodeEnum.PLACE_ORDER, filterSelector);
           // 构造请求参数
           OrderParam orderParam = new OrderParam();
           orderParam.setGoodId(10001L);
           orderParam.setUserId(1L);
           orderContext.setParam(orderParam);
           // 获取链头，开始责任链处理
           pipeline.getFilterChain().filter(orderContext);
           // 获取经过处理后的 model
           OrderModel model = orderContext.getModel();
           System.out.println("---------------------");
           System.out.println("获取经过责任链处理的上下文, " + model);
           // 后续可配合策略根据 model 进行其他处理
       }
   }
   ```
   
   输出
   
   ```
   保存下单请求信息
   查询订单信息
   校验订单信息, 通过
   拉取用户付款方式信息
   ---------------------
   获取经过责任链处理的上下文, OrderModel(good=Good(id=10001, name=商品1, price=100块), user=User(id=1, name=用户1, vipFlag=true))
   ```
   
   UML
   
   ![image-20230622003922290](https://pic-bed-1258841963.cos.ap-nanjing.myqcloud.com/2023/06/22/20230622003930715.png)

## 应用场景

1. 责任链适用于复杂的流程化逻辑的拆分，使用多种处理单元组合处理，最终产出一个处理结果

   请求发出者不关心请求的处理流程，只需将请求发送到责任链上即可，完成了请求发出者和处理者的解耦

2. 应用举例

   SpringSecurity FilterChain

   Netty ChannelPipeline、ChannelHandler
