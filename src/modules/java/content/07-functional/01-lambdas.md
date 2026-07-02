---
title: Lambdas & Functional Interfaces
category: Functional Programming & Streams
categoryOrder: 7
order: 1
level: Advanced
summary: How lambda expressions implement single-method interfaces, the built-in function types, variable capture, and why a lambda is not just shorthand for an anonymous class.
tags: lambdas, functional-interfaces, java8, capture, anonymous-class
---

A **lambda expression** is an anonymous implementation of a single method, written inline. Java 8 introduced them to let you pass *behavior* — not just data — to methods, turning verbose boilerplate into a single expression.

```java
// Before: an anonymous class
Runnable r1 = new Runnable() {
    public void run() { System.out.println("hi"); }
};
// After: a lambda
Runnable r2 = () -> System.out.println("hi");
```

## Lambda syntax

A lambda has three parts: a parameter list, the `->` arrow, and a body.

```java
()            -> 42                 // no params, expression body
x             -> x * x             // one param, parentheses optional
(x, y)        -> x + y             // multiple params
(int x, int y)-> x + y             // explicit types (rarely needed)
(s) -> { System.out.println(s); }  // block body needs braces + ; (and return if non-void)
```

The compiler **infers** parameter types from context, so you almost never write them. An expression body implicitly returns its value; a block body uses an explicit `return`.

## Functional interfaces

A lambda has no type on its own — it acquires one from its **target type**, which must be a **functional interface**: an interface with exactly **one abstract method** (sometimes called a SAM, *Single Abstract Method*). The lambda *is* the implementation of that method.

```java
@FunctionalInterface
interface Validator { boolean isValid(String input); }

Validator notEmpty = s -> !s.isBlank();
boolean ok = notEmpty.isValid("hello");   // true
```

Default and static methods do **not** count toward the single-method limit, and neither do `public` methods inherited from `Object` (like `equals` or `toString`). The optional `@FunctionalInterface` annotation makes the compiler reject the interface if it ever stops having exactly one abstract method — a cheap safety net.

## The built-in function types

You rarely declare your own — `java.util.function` ships the common shapes. Master these six:

| Interface | Abstract method | Shape | Typical use |
|-----------|-----------------|-------|-------------|
| `Function<T,R>` | `R apply(T t)` | T → R | transform a value |
| `Consumer<T>` | `void accept(T t)` | T → void | side effect (print, store) |
| `Supplier<T>` | `T get()` | () → T | lazily produce a value |
| `Predicate<T>` | `boolean test(T t)` | T → boolean | a condition / filter |
| `BiFunction<T,U,R>` | `R apply(T t, U u)` | (T,U) → R | combine two inputs |
| `UnaryOperator<T>` | `T apply(T t)` | T → T | `Function` where in/out match |

```java
Function<String, Integer> len   = String::length;
Consumer<String>          print = System.out::println;
Supplier<List<String>>    fresh = ArrayList::new;
Predicate<Integer>        even  = n -> n % 2 == 0;
BiFunction<Integer,Integer,Integer> add = Integer::sum;
UnaryOperator<String>     upper = String::toUpperCase;
```

These compose: `Function` offers `andThen`/`compose`, `Predicate` offers `and`/`or`/`negate`. There are primitive-specialized variants (`IntFunction`, `ToIntFunction`, `IntPredicate`…) that avoid boxing in hot code.

## Variable capture

A lambda can read local variables from its enclosing scope, but only if they are **effectively final** — assigned once and never reassigned.

```java
int factor = 3;                 // effectively final
Function<Integer,Integer> f = x -> x * factor;   // OK
// factor = 4;                  // would break it: now NOT effectively final
```

Local variables live on the stack and vanish when the method returns, yet the lambda may outlive that call. Java therefore **captures the value**, and forbidding reassignment keeps the captured copy and the original from drifting apart. Instance fields have no such restriction — they are reached through the captured `this` (and static fields through the class), so they can change freely.

## Lambda vs anonymous class

A lambda is **not** merely sugar for an anonymous class — they differ in real ways:

| Aspect | Lambda | Anonymous class |
|--------|--------|-----------------|
| `this` | the **enclosing** instance | the anonymous instance itself |
| Scope | shares the enclosing scope (cannot shadow its names) | introduces a new scope |
| Compiled to | an `invokedynamic` call via `LambdaMetafactory` (no extra `.class`) | a separate `Outer$1.class` file |
| Targets | functional interfaces only | any interface or class, multiple methods, fields |

```java
class Counter {
    int n = 0;
    Runnable lambda = () -> n++;              // 'this' == the Counter
    Runnable anon = new Runnable() {
        public void run() { /* this == the Runnable */ }
    };
}
```

:::gotcha
Inside an anonymous class, `this` refers to the anonymous object, so `this.field` won't see the outer object's fields. Inside a lambda, `this` is the enclosing instance — a frequent source of confusion when migrating old code to lambdas.
:::

:::senior
Lambdas don't allocate a new class per use the way anonymous classes do. The first time a lambda runs, `LambdaMetafactory` spins up its implementation; a **non-capturing** lambda is typically cached as a singleton, while a capturing one allocates per capture. This makes lambdas cheaper than anonymous classes, but it's still worth avoiding capture in tight loops.
:::

:::key
A lambda is an inline implementation of a functional interface's one abstract method. It captures *effectively final* locals, uses the enclosing `this`, and gets its type from context. Reach for the built-ins (`Function`, `Consumer`, `Supplier`, `Predicate`, `BiFunction`, `UnaryOperator`) before writing your own.
:::
