---
title: 关于自动拆箱的缓存性质研究
date: 2017-04-16 16:43:47
tags:
 - Java
categories:
 - Java
---

在使用中会发现，`int`与其对应的包装类`Integer`做 等比较 时，会发现，值在 **-128~127** 间，可以产生`true`，但在范围外就会产生预期之外的`false`，翻看 `valueOf()` 源码

```java
public static Integer valueOf(int i) {
    if (i >= IntegerCache.low && i <= IntegerCache.high)
        return IntegerCache.cache\[i + (-IntegerCache.low)\];
    return new Integer(i);
}
```

`valueOf()`装箱是有缓存机制的，缓存的范围定义在 `IntegerCache` 类中，low 为固定值-128，high 默认为127，可以通过 `sum.misc.VM` 这个类，即 JVM 参数 **-XX:AutoBoxCacheMax** 配置

```java
static {
    // high value may be configured by property 可以通过配置VM设置更高的值
    int h = 127;
    String integerCacheHighPropValue = sun.misc.VM.getSavedProperty("java.lang.Integer.IntegerCache.high");
    if (integerCacheHighPropValue != null) {
        try {
            int i = parseInt(integerCacheHighPropValue);
            i = Math.max(i, 127); // 在这里决定了这个缓存最大值至少设置为127
            // Maximum array size is Integer.MAX_VALUE 最大数组容量是Integer.MAX_VALUE
            h = Math.min(i, Integer.MAX_VALUE - (-low) -1);
        } catch( NumberFormatException nfe) {
            // If the property cannot be parsed into an int, ignore it. // 如果该属性无法作为 int 解析，忽略它
        }
    }
    high = h;
    cache = new Integer[(high - low) + 1];
    int j = low;
    for(int k = 0; k < cache.length; k++)
        cache[k] = new Integer(j++);
    // range [-128, 127] must be interned (JLS7 5.1.7) 范围[-128,127]必须是实体的（JLS7 5.1.7）
    assert IntegerCache.high >= 127;
}
```

这个的缓存机制是在`static`区设置一个数组，容量为`128 + IntegerCache.high` ，内容为 `-128 ~ IntegerCache.high` ，被缓存的 `Integer` 对象中的值引用设置到该数组上，所以做 `等比较` 时，会产生相等的现象，因为引用相同。

编写一段测试代码

```java
public static void autoBoxTest(){
    int i1 = 127, i2 = 200;
    Integer integer1 = i1;
    Integer integer2 = i1;
    Integer integer3 = i2;
    Integer integer4 = i2;
    System.out.println(integer1==integer2); // true
    System.out.println(integer3==integer4); // false
}
```

添加 `-XX:AutoBoxCacheMax=256`，增大缓存范围，结果变为 `// true true`

代码分析中已经得出，`AutoBoxCacheMax` 必须大于127，小于127会自动设置为127。
