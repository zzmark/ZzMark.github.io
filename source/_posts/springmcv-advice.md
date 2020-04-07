---
title: SpringMVC @RestControllerAdvice遇到的坑
date: 2018-04-27 00:00:00
tags: 
 - Java
 - spring
categories:
 - 后端
---

其实也说不上是坑，最近在配置框架时使用到了这个注解来最终错误处理

但是配置过程中发现了这个注解的问题

先说说场景，目前有两个标注 `@RestControllerAdvice` 的类，类和类下面注册的异常分别是：

```
GlobalExceptionAdvice:
|-Exception
AppExceptionAdvice:
|-OtherException
```

实际已注册异常比这要多。这时触发 `OtherException` ，发现响应错误的是 `Exception` 的 handler

也就是说， `OtherException` 的 handler 失效了

最初怀疑是注解扫描没有扫描到 AppExceptionAdvice，给 bean 的 Construct 里打印日志，证明了 bean 被初始化

也就是说，明明被扫描了AppExceptionAdvice，却一点也没起作用。

不过在日志中看到了如下两条日志

```
18:43:27.352  INFO -- [on(2)-127.0.0.1] .m.m.a.ExceptionHandlerExceptionResolver : Detected @ExceptionHandler methods in globalExceptionAdvice
18:43:27.353  INFO -- [on(2)-127.0.0.1] .m.m.a.ExceptionHandlerExceptionResolver : Detected @ExceptionHandler methods in appExceptionAdvice
```

考虑可能性，一个覆盖了另一个，或者说先注册的占据了先机，判断异常时产生了这个情况。

打开 debug，抛出错误，在 `Exception` 的 handler 中抓取，查看调用栈，找到了 `ExceptionHandlerExceptionResolver.doResolveHandlerMethodException()` 方法，调用 handler 的方法就是这个。

以下代码基于 SpringMVC 4.3.11.RELEASE
```java
/**
 * Find an {@code @ExceptionHandler} method and invoke it to handle the raised exception.
 */
@Override
protected ModelAndView doResolveHandlerMethodException(HttpServletRequest request,
        HttpServletResponse response, HandlerMethod handlerMethod, Exception exception) {
    // getExceptionHandlerMethod 负责找到处理异常的Handler
    ServletInvocableHandlerMethod exceptionHandlerMethod = getExceptionHandlerMethod(handlerMethod, exception);
    if (exceptionHandlerMethod == null) {
        return null;
    }
    exceptionHandlerMethod.setHandlerMethodArgumentResolvers(this.argumentResolvers);
    exceptionHandlerMethod.setHandlerMethodReturnValueHandlers(this.returnValueHandlers);
    ServletWebRequest webRequest = new ServletWebRequest(request, response);
    ModelAndViewContainer mavContainer = new ModelAndViewContainer();
    try {
        // 负责执行handler
        if (logger.isDebugEnabled()) {
            logger.debug("Invoking @ExceptionHandler method: " + exceptionHandlerMethod);
        }
        Throwable cause = exception.getCause();
        if (cause != null) {
            // Expose cause as provided argument as well
            exceptionHandlerMethod.invokeAndHandle(webRequest, mavContainer, exception, cause, handlerMethod);
        }
        else {
            // Otherwise, just the given exception as-is
            exceptionHandlerMethod.invokeAndHandle(webRequest, mavContainer, exception, handlerMethod);
        }
    }
    // other code
}
```

ExceptionHandlerExceptionResolver.doResolveHandlerMethodException() -> getExceptionHandlerMethod()

下面这段代码用于寻找可适配当前 Exception 的 Method，由 LinkedHashMap 存放，这里就和顺序有关联了
```java
// 这里的 exceptionHandlerAdviceCache 是个 LinkedHashMap，存放了已注册的 Advice 类和一个 Cache，Cache 不是分析目的
for (Entry<ControllerAdviceBean, ExceptionHandlerMethodResolver> entry : this.exceptionHandlerAdviceCache.entrySet()) {
    if (entry.getKey().isApplicableToBeanType(handlerType)) {
        ExceptionHandlerMethodResolver resolver = entry.getValue();
        Method method = resolver.resolveMethod(exception);
        if (method != null) {
            return new ServletInvocableHandlerMethod(entry.getKey().resolveBean(), method);
        }
    }
}
```

确定了顺序相关，就要考虑顺序是如何确定的。
实际上这时已经可以考虑到使用 @Order 来解决问题

继续追查代码，顺着resolver.resolverMethod() -> resolveMethodByExceptionType() -> getMappedMethod() 方法，我们可以找到如何将当前异常对应到具体方法的代码逻辑，这个方法在ExceptionHandlerMethodResolver 中
```java
/**
 * Return the {@link Method} mapped to the given exception type, or {@code null} if none.
 */
private Method getMappedMethod(Class<? extends Throwable> exceptionType) {
    // 传入参数为当前错误，
    List<Class<? extends Throwable>> matches = new ArrayList<Class<? extends Throwable>>();
    for (Class<? extends Throwable> mappedException : this.mappedMethods.keySet()) {
        // this.mappedMethods 中存放了当前handler中的所有方法
        if (mappedException.isAssignableFrom(exceptionType)) {
            // if条件会选出处理与入参类相同或为超集的类的方法，List存放结果
            matches.add(mappedException);
        }
    }
    if (!matches.isEmpty()) {
        // 将结果进行排序，并返回第一条结果对应的方法
        Collections.sort(matches, new ExceptionDepthComparator(exceptionType));
        return this.mappedMethods.get(matches.get(0));
    } else {
        return null;
    }
}
```

到了这里，大概的性质就摸清楚了

总的来说，就是从 getExceptionHandlerMethod() 方法选出一个 handler，然后再这个 handler 内选出 method 用来处理这个异常。

这样就会造成一个问题，即排位靠前的 handler 内若是有这个异常的超集，那就轮不到排位靠后的 handler，导致了我所遇到的问题。

从现象看本质，再从本质制定规范。

1. 如果要使用多个 handler，就像我这里有一个 globalExceptionHandler，那就要使用 Order 手动控制扫描顺序，默认情况下 Advice 注解的 Order 为最低优先，大部分的 bean 都是这样。
    因为 globalExceptionHandler 优先级已经是最低了，我们只能去提高业务层 handler 的优先值。
1. 同一个异常线，必须在同一个handler中，不然会出现被超集适配走的情况
1. 或者干脆放弃使用 globalExceptionHandler 这个方案做兜底的异常处理，改为定制 springmvc 返回异常的处理器，这样对业务入侵为0

剩下看个人吧
