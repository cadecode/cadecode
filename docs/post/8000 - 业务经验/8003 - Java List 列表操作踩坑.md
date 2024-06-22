---

title: Java List 列表操作踩坑
date: 2022/11/21
description: 本文介绍 Java 中 List 操作常见的坑点，如 ArrayList 和 LinkedList 的复杂度、Arrays.asList 转换基本类型，以及 List.subList 造成 OOM 等
tag: [业务经验, Java]

---

# Java List 列表操作踩坑

## ArrayList 和 LinkedList 复杂度

1. Java 数据结构中要想使用一个列表，有 ArrayList 和 LinkedList 两种方式

2. ArrayList 基于数组，是连续存储的的数据结构

3. LinkedList 基于链表，是非连续的，使用指针串联起来的数据结构

4. 使用场景

   在数据结构基本知识中，数组和链表具有不同的复杂度特性

   ```
   对于数组，随机元素访问的时间复杂度是 O(1)，元素插入操作是 O(n)
   对于链表，随机元素访问的时间复杂度是 O(n)，元素插入操作是 O(1)
   ```

   有些说法是大量的插入操作最好使用 LinkedList

   经过实测，在大量数据场景下，无论是随机访问，还是插入元素，LinkedList 的表现都差强人意

   阅读源码发现，插入操作的时间复杂度 O(1) 的前提是已经有了要插入节点的指针。需要先通过循环获取节点，然后再执行插入操作，前者开销是很大的

   ```java
   public void add(int index, E element) {
       checkPositionIndex(index);
       if (index == size)
           linkLast(element);
       else
           linkBefore(element, node(index));
   }
   
   Node<E> node(int index) {
       // ...
       if (index < (size >> 1)) {
           Node<E> x = first;
           for (int i = 0; i < index; i++)
               x = x.next;
           return x;
       } else {
           Node<E> x = last;
           for (int i = size - 1; i > index; i--)
               x = x.prev;
           return x;
       }
   }
   ```

   因此在大多数场景下 LinkedList 可能都不适用

   LinkedList 的作者在社交平台上表示自己也几乎不用 LinkedList，并推荐 ArrayDeque 作为一个更好的栈和队列的实现

## Arrays.asList 

1. 转换基本类型

   ```java
   int[] arr = {1, 2, 3};
   List list = Arrays.asList(arr);
   ```

   对于基本类型数组，使用 asList 转换为 List 时，是将数组整体作为一个元素，放入 List 中，也就是说上述代码返回的 List 应该是 List<int[]>

   解决方案：

   使用包装类型数组

   ```java
   Integer[] arr = {1, 2, 3};
   List<Integer> list = Arrays.asList(arr);
   ```

   使用 Java 8 stream 操作

   ```java
   int[] arr1 = {1, 2, 3};List list1 = Arrays.stream(arr1).boxed().collect(Collectors.toList());
   ```

2. 元素增删操作

   对 Arrarys.asList 返回 List 进行元素操作

   ```java
   String[] arr = {"1", "2", "3"};
   List list = Arrays.asList(arr);
   list.add("4");
   ```

   抛出异常 UnsupportedOperationException，阅读源码发现，Arrays.asList 返回的 List 是 Arrays 的内部类 ArrayList，并不支持增删操作

   修改原始数组影响返回的 List

   ```
   String[] arr = {"1", "2", "3"};
   List list = Arrays.asList(arr);
   arr[1] = "0";
   ```

   打印返回的 List 发现其内容也被修改了

   解决方案：

   使用 new ArrayList 进行一次初始化

   ```java
   String[] arr = {"1", "2", "3"};
   List list = new ArrayList(Arrays.asList(arr));
   ```

   后续操作的是真正的 ArrayList，并且元素和原始数组解耦了

## List.subList

1. 强引用导致 OOM

   ```java
   private static List<List<Integer>> data = new ArrayList<>();
   private static void addSubList() {
       for (int i = 0; i < 1000; i++) {
           List<Integer> rawList = IntStream.rangeClosed(1, 100000)
               .boxed().collect(Collectors.toList());
           data.add(rawList.subList(0, 1));
       }
   }
   // 每次创建一个含有十万个 Integer 的 List 切片取第一个元素，保存到列表中，最终会内存溢出
   ```

   List.subList 方法返回的列表对原列表有强引用，所有元素都得不到回收，可能产生 OOM

2. 子列表影响原始列表

   主要影响有两点：

   删除子列表的元素，原始列表的对应元素也会被删除

   原始列表添加元素后遍历子列表会抛出 ConcurrentModificationException

   解决方案：

   使用 new ArrayList，在构造方法传入 SubList，创建一个独立的 ArrayList

   使用 Java 8 Stream 的 skip 和 limit 跳过流中的元素，限制流中元素的个数，达到切片的目的
