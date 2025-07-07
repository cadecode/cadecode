---

title: Java Stream 流 toMap 坑点
date: 2025/7/6
description: 本文介绍 Java Stream 流操作中的 toMap 操作存在的使用上的坑点，以及其他安全的替代写法
tag: [业务经验, Java]

---

# Java Stream 流 toMap 坑点

## toMap 坑点

### value 不能为 null

```java
List<User> userList = Arrays.asList(
        new User("A", 1),
        new User("B", 2),
        new User("C", null)
);

Map<String, Integer> map = userList.stream()
	.collect(Collectors.toMap(u -> u.getName(), u -> u.getAge()));
// 会抛出空指针异常

// 解决方式：过滤掉 value 为 null 的对象
Map<String, Integer> map = userList.stream()
	.filter(u -> Objects.nonNull(u.getAge()))
	.collect(Collectors.toMap(u -> u.getName(), u -> u.getAge()));
```

### key 不能重复

```java
List<User> userList = Arrays.asList(
        new User("A", 1),
        new User("B", 2),
        new User("B", 3)
);

Map<String, Integer> map = userList.stream()
	.collect(Collectors.toMap(u -> u.getName(), u -> u.getAge()));
// 会抛出 Duplicate key 异常

// 解决方式：自定义合并方法
Map<String, Integer> map = userList.stream()
	.collect(Collectors.toMap(u -> u.getName(), u -> u.getAge(), (v1, v2) -> v2));
```

## 替代写法

### 利用 groupingBy

**注意 groupingBy key 不能为 null**

```java
// 使用 groupingBy + reduce
Map<String, Integer> map = userList.stream()
    .collect(Collectors.groupingBy(item -> item.getName(),
                    HashMap::new,
                    Collectors.reducing(null, item -> item.getAge(), (v1, v2) -> v2)
            )
    );

// 使用 groupingBy + collectingAndThen
Map<String, Integer> map = userList.stream()
	.collect(Collectors.groupingBy(User::getName,
        Collectors.collectingAndThen(Collectors.toList(), l -> l.get(0).getAge())));
```

### 自定义收集器

```java
// 允许 key 和 value 为 null
Map<String, Integer> map = userList.stream()
	.collect(HashMap::new, (map, item) -> map.put(item.getName(), item.getAge()), HashMap::putAll);
```

