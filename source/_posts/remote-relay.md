---
title: 用 wifi 继电器模块远程开机
date: 2020-04-02 20:45:20
tags:
  - Iot
categories:
  - Iot
---

为了给主板做远程开关机，搞了这么一个玩具

实际上想要实现该目的，有以下几个方案
  - **Wake On Lan(WOL)** 技术成本最低，但技嘉的主板想打开这个需要关闭快速启动以及一大堆的东西，很反感。
  - 论实施成本，找个远程控制的智能插座，配合主板的掉电处理，也能实现目的，只不过自己用电脑想开机，也得通过这个，体验很差

最近比较闲，买了几个 wifi 模块，配了个继电器，搞起了这么个玩具

## 物料清单

 - esp-01s(esp8266)，淘宝10块包邮
 - esp-01s 继电器模块，淘宝10块包邮
 - ttl 刷机工具，淘宝5块包邮

## 玩法

esp8266 这个模块，十分的便宜，脚位齐全、搭配 ch340 串口芯片的开发板也只不过14块包邮，简化管脚的 esp-01s 更是 8 块都不到

80/160Mhz主频，80k ram，1Mbyte 或 4Mbyte rom，乐鑫官方甚至提供了 FreeRTOS 操作系统固件，虽然我不会用

生态十分齐全，当作玩具来玩的话，有 c、python([MicroPython](http://docs.micropython.org/en/latest/esp8266/quickref.html))、javaScript([Espruino](https://www.espruino.com/EspruinoESP8266))、Lua([NodeMCU](https://nodemcu.readthedocs.io/en/master/)) 语言可选，资料很全

远程控制方案，我选择了mqtt下发消息，模块改写管脚电平，触发继电器

就这么点功能，用什么语言写也就十几行的样子，不过最后我选择了 Espruino，随便写了一下，算是实现了功能

## 零碎的点

esp8266 均采用 3.3v 供电，刷写固件时官方要求电流为200ma，一般的 ttl 模块供电都足够，不过我用了辣鸡的 usb2.0 hub，供电不足，刷写成功但过不了开机的 checksum，刷了几次，概率性失效，最终换到了主机上的usb孔，解决问题

连接wifi，最简单的方法就是直接输入 SSID 和 password，但是 SSID 如果涉及非 ASCII 内容，需要按UTF-8输入，否则搜不到。

wifi 天线增益很小(esp-01s是印刷天线，估计是2db的)，太远了 mqtt 就会各种断线，虽然 mqtt 会重连

esp8266的 ttl 启动时会有启动 log，但波特率在 74880

如果用 C，是支持 OTA 的，其他几个语言的环境似乎没有这个功能，Espruino 的代码是通过 ttl 写入的，类似于浏览器，并不需要烧录即可变更代码，并且提供了 ttl 封装重定向的相关内容。

## 过程和成果

因为继电器翻车了，具体的结果和图等完工之后再补充
