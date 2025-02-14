---

title: SpringBoot 集成 Security
date: 2021/11/17
description: 本文介绍 Spring Security 的基本原理、基本使用方式和前后端分离的使用方式，如自定义权限不足的处理逻辑、自定义 JWT 过滤器、动态配置 URL 权限等
tag: [Java 框架, SpringBoot, Spring, SpringSecurity, Java]

---

# SpringBoot 集成 Security

## Spring Security 介绍

1. Spring Security 是基于 Spring 框架的权限管理框架

2. Spring Security 的前身是 Acegi Security

   Acegi Security 以配置繁琐而被诟病，投入 Spring 怀抱后，随着 SpringBoot 的崛起，Spring Security 的易用性得到了极大的提升，经常被用于 SpringBoot 及 SpringCloud 项目

3. Spring Security 的基本功能
   - 认证：提供多种常见的认证方式
   - 授权：提供基于 URL 的请求授权、支持方法访问授权以及对象访问授权

## 基本原理

1. Spring Security 是通过一层层 Filter 来处理 web 请求的

   在 Filter 组成的链条中，逐步完成认证和授权，发现异常则抛给异常处理器处理

   ![img](https://pic-bed.cadeli.top/2021/12/20211202100244805.png)

2. 过滤器链中的核心概念

   - springSecurityFilterChain

     Spring Security 的核心过滤器叫 springSecurityFilterChain，类型是 FilterChainProxy

   - WebSecurity、HttpSecurity 

     WebSecurity  构建了 FilterChainProxy 对象

     HttpSecurity 构建了 FilterChainProxy 中的一个 SecurityFilterChain

   - WebSecurityConfiguration 

     @EnableWebSecurity 注解，导入了 WebSecurityConfiguration 类

     WebSecurityConfiguration 中创建了建造者对象 WebSecurity 和核心过滤器 FilterChainProxy

3. Spring Security 常用组件
   - Authentication：认证接口，定义了认证对象的数据形式。
   - AuthenticationManager：用于校验 Authentication，返回一个认证完成后的
   - SecurityContext：上下文对象，用来存储 Authentication
   - SecurityContextHolder：用来访问 SecurityContext
   - GrantedAuthority：代表权限
   - UserDetails：代表用户信息
   - UserDetailsService：获取用户信息

## 简单使用

1. 引入 Spring Security 依赖

   ```xml
   <!--引入 Spring Security-->
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-security</artifactId>
   </dependency>
   ```

   引入依赖后，不做任何配置，Spring Security 会自动生效，请求将跳转登录页面

   ![image-20211130233524244](https://pic-bed.cadeli.top/2021/11/20211130233527052.png)

   默认用户名、密码和权限可在 application.yaml 中配置

   ```yaml
   spring:
     security:
       user:
         name: ming
         password: 123456
         roles: admin
   ```

2. 基于内存的认证

   ```java
   @Configuration
   @EnableWebSecurity
   // 开启注解设置权限
   @EnableGlobalMethodSecurity(prePostEnabled = true)
   public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
   
       // 配置密码加密器
       @Bean
       public PasswordEncoder passwordEncoder() {
           return new BCryptPasswordEncoder();
       }
   
       // 配置认证管理器
       @Override
       protected void configure(AuthenticationManagerBuilder auth) throws Exception {
           auth.inMemoryAuthentication()
                   .withUser("admin")
                   .password(passwordEncoder().encode("123")).roles("admin")
                   .and()
                   .withUser("user")
                   .password(passwordEncoder().encode("456")).roles("user");
       }
       
       // 配置安全策略
       @Override
       protected void configure(HttpSecurity http) throws Exception {
           // 设置路径及要求的权限，支持 ant 风格路径写法
           http.authorizeRequests()
             		// 设置 OPTIONS 尝试请求直接通过
               	.antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
               	.antMatchers("/api/demo/user").hasAnyRole("user", "admin")
               	// 注意使用 hasAnyAuthority 角色需要以 ROLE_ 开头
                   .antMatchers("/api/demo/admin").hasAnyAuthority("ROLE_admin")
                   .antMatchers("/api/demo/hello").permitAll()
                   .and()
               	// 开启表单登录
                   .formLogin().permitAll()
                   .and()
               	// 开启注销
                   .logout().permitAll();
       }
   }
   ```

## 前后端分离

### 关闭 CSRF 防御和会话管理

CSRF 防御要求表单登录时携带 CSRF Token，前后端分离时不需要开启

会话管理设置为 STATELESS，使用无状态的 JWT 进行鉴权

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
    // 关闭 csrf 防御
    http.csrf().disable();
    // 关闭会话管理
    http.sessionManagement()
        .sessionCreationPolicy(SessionCreationPolicy.STATELESS);
    // ...
}
```

### 自定义登录逻辑

Spring Security 默认使用表单登录，若要支持 JSON 请求，可继承`UsernamePasswordAnthenticationFilter`，并使用`HttpSecurity `的`addFilterAt`替换原有

```java
public class CustomAuthenticationFilter extends UsernamePasswordAuthenticationFilter {
    @Override
    public Authentication attemptAuthentication(HttpServletRequest request,
                                                HttpServletResponse response) throws AuthenticationException {
        // 判断是否为 JSON 格式请求
        if(request.getContentType().equals(MediaType.APPLICATION_JSON_VALUE)){
            // ...
        } else {
            return super.attemptAuthentication(request, response);
        }
    }
}
```

通过配置 AuthenticationManagerBuilder，设置自定义的 UserDetailsService

```java
@Autowired
private CustomUserDetailsService customUserDetailsService
@Override
protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    auth.userDetailsService(customUserDetailsService)
        .passwordEncoder(passwordEncoder());
}
```

实现 UserDetailsService 的 loadUserByUsername 方法

```java
public class CustomUserDetailsService implements UserDetailsService {
    @Override
    public UserDetails loadUserByUsername(String s) throws UsernameNotFoundException {
        // 根据 username 查询用户
        User user = userMapper.getUserByUsername(s);
        if (user == null) {
            // ...
        }
        // 查询角色或权限
        List<SimpleGrantedAuthority> authorities = userMapper.listRolesByUsername(s)
            .stream()
            .map(SimpleGrantedAuthority::new)
            .collect(Collectors.toList());
        // 构造 UserDetails 实例并返回
    }
}
```

### 自定义登录成功处理器

通过配置 HttpSecurity，设置自定义的 successHandler

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http.formLogin().permitAll()
        .loginProcessingUrl("/login")
        .successHandler(customLoginSuccessHandler)
}
```

CustomLoginSuccessHandler，以 JSON 形式返回前端，携带生成的 Token

```java
@Component
@RequiredArgsConstructor
public class CustomLoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        // 构造一个统一返回格式对象
       	Map<String, Object> res = new HashMap<>();
        res.put("code", 200);
        res.put("message": "认证成功");
        res.put("path": "login");
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            // 根据用户信息，使用 JWT 工具类构建 Token
            // ...
            // 存到返回内容中
            res.put("data", "xxxxxx")
        }
        // 以 JSON 格式写入 response
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        PrintWriter writer = response.getWriter();
        writer.print(JsonUtil.Obj2Str(res));
        writer.flush();
    }
}
```

### 自定义登录失败处理器

通过配置 HttpSecurity，设置自定义的 failureHandler

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http.formLogin().permitAll()
        .loginProcessingUrl("/login")
       	.failureHandler(customLoginFailureHandler)
}
```

CustomLoginFailureHandler，返回认证失败和失败信息

```java
@Component
public class CustomLoginFailureHandler implements AuthenticationFailureHandler {
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) {
        // 封装的统一返回格式对象
        Res<Object> res = Res.of(ResCode.TOKEN_CREATE_FAIL).path("/login");
        // 根据异常设置失败信息
        if (exception instanceof LockedException) {
            res.errorMsg("账户被锁定");
        } else if (exception instanceof CredentialsExpiredException) {
            res.errorMsg("密码过期");
        } else if (exception instanceof AccountExpiredException) {
            res.errorMsg("账户过期");
        } else if (exception instanceof DisabledException) {
            res.errorMsg("账户被禁用");
        } else if (exception instanceof BadCredentialsException) {
            res.errorMsg("用户名或者密码输入错误");
        }
        // 封装的 JSON 格式写入 response 工具方法
        WebUtil.writeJsonToResponse(response, JsonUtil.objToStr(res));
    }
}
```

### 自定义未登录处理器

配置 authenticationEntryPoint

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http.exceptionHandling()
        .authenticationEntryPoint(customAuthenticationEntryPoint)
}
```

CustomAuthenticationEntryPoint

```java
@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, 
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        // 构造未登录的返回内容
        Res<Object> res = Res.of(ResCode.TOKEN_NOT_EXIST)
                .path(request.getRequestURI());
        WebUtil.writeJsonToResponse(response, JsonUtil.objToStr(res));
    }
}
```

### 自定义权限不足处理器

配置 accessDeniedHandler

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http.exceptionHandling()
        .accessDeniedHandler(customAccessDeniedHandler);
}
```

CustomAccessDeniedHandler

```java
@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException, ServletException {
        // 构造权限不足的返回内容 
        Res<Object> res = Res.of(ResCode.TOKEN_NO_AUTHORITY)
                .path(request.getRequestURI());
        WebUtil.writeJsonToResponse(response, JsonUtil.objToStr(res));
    }
}
```

### 自定义注销成功逻辑

配置 logoutSuccessHandler

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http.logout().permitAll()
        .logoutUrl("/logout")
        .logoutSuccessHandler(logoutSuccessHandler);
}
```

CustomLogoutSuccessHandler

```java
@Component
public class CustomLogoutSuccessHandler implements LogoutSuccessHandler {
    @Override
    public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response,
                                Authentication authentication) throws IOException, ServletException {
        // 构造注销成功的返回内容
        Res<String> res = Res.ok("注销成功").path("/logout");
        WebUtil.writeJsonToResponse(response, JsonUtil.objToStr(res));
    }
}
```

也可以使用 HttpSecurity 的 addLogoutHandler，配置注销的处理逻辑

### 自定义 JWT 过滤器

添加 JWT 过滤器到过滤器链

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http.addFilterBefore(jwtAuthenticationTokenFilter,
                         UsernamePasswordAuthenticationFilter.class);
}
```

JwtAuthenticationTokenFilter

```java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationTokenFilter extends OncePerRequestFilter {

    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest httpServletRequest, 
                                    HttpServletResponse httpServletResponse,
                                    FilterChain filterChain) throws ServletException, IOException {
        // 取出 header 中的 token 进行校验
        String authHeader = httpServletRequest.getHeader(jwtUtil.getHeader());
        if (authHeader != null && !StringUtil.isEmpty(authHeader)) {
            String username = jwtUtil.getUsernameFromToken(authHeader);
            if (username != null 
                && SecurityContextHolder.getContext().getAuthentication() == null) {
                // 根据 username 查询用户，可以从缓存、数据库中获取
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                // 校验
                if (jwtUtil.validateToken(authHeader, userDetails)) {
                    // 构建 authentication
                    UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails,
                                                                null,
                                                                userDetails.getAuthorities());
                    // 设置 details，其中包含地址、session 等
                    authentication.setDetails(new 
                                              WebAuthenticationDetails(httpServletRequest));
                    // 设置 authentication 到上下文对象中
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }
        filterChain.doFilter(httpServletRequest, httpServletResponse);
    }
}
```

### 动态配置 URL 权限

Spring Security 的过滤器链中包含了许多过滤器，其中 FilterSecurityInterceptor 非常重要，完成了主要的鉴权逻辑

beforeInvocation 方法

![image-20211205132642235](https://pic-bed.cadeli.top/2021/12/20211205132643984.png)

attemptAuthorization

![image-20211205132656201](https://pic-bed.cadeli.top/2021/12/20211205132657143.png)

从源码可以看出，动态配置 URL 权限有两种途径

1. 自定义 SecurityMetadataSource，从数据源加载 ConfigAttribute

   ```java
   public class MySecurityMetadataSource implements FilterInvocationSecurityMetadataSource {
       private final AntPathMatcher antPathMatcher = new AntPathMatcher();
       private final FilterInvocationSecurityMetadataSource superMetadataSource;
       private final Map<String, String[]> urlRoleMap = new HashMap<>();
   
       public MySecurityMetadataSource(
               FilterInvocationSecurityMetadataSource metadataSource) {
           this.superMetadataSource = metadataSource;
           // 此处可以从数据库加载权限配置
           urlRoleMap.put("/api/demo/admin", new String[]{"ROLE_admin"});
           urlRoleMap.put("/api/demo/user", new String[]{"ROLE_user", "ROLE_admin"});
       }
   
       @Override
       public Collection<ConfigAttribute> getAttributes(Object object) throws IllegalArgumentException {
           FilterInvocation fi = (FilterInvocation) object;
           String url = fi.getRequestUrl();
           for (Map.Entry<String, String[]> entry : urlRoleMap.entrySet()) {
               if (antPathMatcher.match(entry.getKey(), url)) {
                   // 生成 ConfigAttribute
                   return SecurityConfig.createList(entry.getValue());
               }
           }
           // 返回配置类定义的默认权限配置
           return superMetadataSource.getAttributes(object);
       }
   }
   ```

   > 由于 SecurityConfig.createList 返回的是 SecurityConfig 类型的 ConfigAttribute，默认使用的 WebExpressionVoter 投票器用于验证 WebExpressionConfigAttribute 类型，因此还需要配置一个 RoleVoter
   >
   > WebExpressionConfigAttribute  是指在配置类中通过 HttpSecurity 配置的权限

   配置 HttpSecurity

   ```java
   http.authorizeRequests()
       .anyRequest().authenticated()
       .withObjectPostProcessor(new ObjectPostProcessor<FilterSecurityInterceptor>() {
           @Override
           public <O extends FilterSecurityInterceptor> O postProcess(O object) {
               // 设置为自定义的 SecurityMetadataSource
               object.setSecurityMetadataSource(mySecurityMetadataSource);
               // AffirmativeBased 是 AccessDecisionManager 的一种
               // AffirmativeBased，有一个投票器通过就通过
               // UnanimousBased，有一个投票器不通过就不通过，全部弃权也不通过
               object.setAccessDecisionManager(new AffirmativeBased(
                   Arrays.asList(
                       new WebExpressionVoter(),
                       new RoleVoter()
                   )));
               return object;
           }
       })
   /**
    * 如果使用 UnanimousBased
    * 到达 RoleVoter 的 ConfigAttribute 是从数据库动态获取的，可能有多个
    * UnanimousBased 对每个 ConfigAttribute 进行投票，即所有权限都有才算通过
    */
   ```

2. 自定义一个投票器，在投票器中可以获取 URL，动态加载权限，可参考 RoleVoter

   ```java
   public class CustomRoleVoter extends RoleVoter {
       @Override
       public int vote(Authentication authentication, Object object, 
                       Collection<ConfigAttribute> attributes) {
           if (authentication == null) {
               return ACCESS_DENIED;
           }
   
           List<ConfigAttribute> dbAttributes = new ArrayList<>();
           FilterInvocation fi = (FilterInvocation) object;
           String url = fi.getRequestUrl();
           // 根据 url 从数据源获取权限，存到 dbAttributes
           // ...
               
           int result = ACCESS_ABSTAIN;
           // 获取 authentication 的权限
           Collection<? extends GrantedAuthority> authorities = 
               authentication.getAuthorities();
           // 判断 authentication 是否包含权限   
           for (ConfigAttribute attribute : dbAttributes) {
               if (attribute.getAttribute() == null) {
                   continue;
               }
               if (this.supports(attribute)) {
                   result = ACCESS_DENIED;
                   for (GrantedAuthority authority : authorities) {
                       if (attribute.getAttribute().equals(authority.getAuthority())) {
                           return ACCESS_GRANTED;
                       }
                   }
               }
           }
           return result;
       }
   }
   ```

   配置 HttpSecurity

   ```java
   http.authorizeRequests()
       .anyRequest().authenticated()
       .accessDecisionManager(new UnanimousBased(
                           Arrays.asList(
                                   new WebExpressionVoter(),
                                   new CustomRoleVoter()
                           )));
   // 此处使用 UnanimousBased 表示配置类和数据源的权限都满足才通过
   ```

