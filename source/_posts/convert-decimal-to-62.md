---
title: 62进制转换
date: 2017-08-23 00:00:00
tags: 
 - Java
categories:
 - 后端
---

代码思路来源于互联网

---

写下这个的原因是，某日在和别人讨论的时候，产生了这样一个需求：

  - 要有一个六位的字串，容量不能小于1_000_000
  - 不能相邻
  - 乱序分发

经由 dalao 的指点，选取了62进制这种方法，产生一百万条随机间隔的值，存入List，shuffle方法洗牌打乱

写出这段代码，效率不是太高

想到这个东西很多时候都可能会用到，就单独整理出来

注意：62进制，所有人的思路都是，数字0~9 + 大写字母A~Z + 小写字母a~z，共62个，可具体的并没有规定到底先是数字在前还是字母在前，这里可能会发生规则歧义，不要误用

```java
public class Main {
    private static char[] dictionary = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".toCharArray();
    /**
     * 将10进制转化为62进制
     * @param rest 输入的10进制字串
     * @param length 转化成的62进制长度，不足length长度的话高位补0，否则不改变什么
     * @return 62进制字串
     */
    private static String convertDecimalToBase62(long rest, int length) {
        Stack<Character> stack = new Stack<>();
        StringBuilder result = new StringBuilder(0);
        while (rest != 0) {
            stack.add(dictionary[new Long((rest - (rest / 62) * 62)).intValue()]);
            rest = rest / 62;
        }
        while (!stack.isEmpty()) {
            result.append(stack.pop());
        }
        int result_length = result.length();
        // 缺位补0
        StringBuilder path = new StringBuilder();
        for (int t = 0; t < length - result_length; t++) {
            path.append('0');
        }
        return path.toString() + result.toString();
    }
    /**
     * 将62进制转换成10进制数
     * @param ident62 输入的62进制字串
     * @return 10进制字串
     */
    private static String convertBase62ToDecimal(String ident62) {
        Long decimalString2Long = 0L;
        for (int i = 0; i < ident62.length(); i++) {
            char c = ident62.charAt(i);
            for (int j = 0; j < dictionary.length; j++) {
                if (c == dictionary[j]) {
                    decimalString2Long = (decimalString2Long * 62) + j;
                    break;
                }
            }
        }
        return String.format("%08d", decimalString2Long);
    }
    public static void main(String[] args) {
        // 6位的最大值 56_800_235_583
        // 允许的最大值 Long.MAX_VALUE => AzL8n0Y58m7
        System.out.println("62System=" +convertDecimalToBase62(Long.parseLong("56800235583"), 0)); // zzzzzz
        System.out.println("10System=" +convertBase62ToDecimal("zzzzzz"));   // 56800235583
        //Collections.shuffle(list); // 洗牌，打乱集合
    }
}
```
