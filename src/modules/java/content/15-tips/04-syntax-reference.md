---
title: Quick Syntax & API Reference
category: Tips, Tricks & Cheat Sheets
categoryOrder: 15
order: 4
level: Beginner
summary: A condensed lookup for everyday Java syntax — variables, loops, switch, classes, records, enums, lambdas — plus the most-used String, Collection, and Stream methods.
tags: syntax, reference, cheatsheet, api, beginner
---

A fast lookup for "how do I write that again?" Copy-paste-ready snippets and method tables for the constructs and APIs you reach for daily. Examples target Java 17/21.

## Primitive types

| Type | Size | Range / note | Default | Literal |
|---|---|---|---|---|
| `byte` | 8-bit | -128 … 127 | `0` | `(byte) 5` |
| `short` | 16-bit | -32,768 … 32,767 | `0` | `(short) 5` |
| `int` | 32-bit | ~ ±2.1 billion | `0` | `42`, `0xFF`, `0b1010` |
| `long` | 64-bit | ~ ±9.2 quintillion | `0L` | `42L`, `9_000_000L` |
| `float` | 32-bit | ~7 digits | `0.0f` | `3.14f` |
| `double` | 64-bit | ~15 digits | `0.0d` | `3.14`, `1e9` |
| `char` | 16-bit | `'\u0000'` … `'￿'` | `'\u0000'` | `'A'`, `'\n'` |
| `boolean` | — | `true` / `false` | `false` | `true` |

## Variables

```java
int count = 10;             // explicit type
final double PI = 3.14159;  // constant — cannot be reassigned
var name = "Ada";           // inferred (local variables only, Java 10+)
long big = 9_000_000_000L;  // underscores for readability + L suffix
int[] xs = {1, 2, 3};       // array literal
```

## Control flow

```java
if (x > 0) { ... } else if (x < 0) { ... } else { ... }
String s = (x >= 0) ? "pos" : "neg";   // ternary

for (int i = 0; i < n; i++) { ... }     // classic for
for (var item : list) { ... }            // enhanced for-each
while (cond) { ... }                     // pre-check
do { ... } while (cond);                 // runs at least once

outer:
for (...) {
    for (...) { break outer; }           // labeled break / continue
}
```

## switch

```java
// Arrow form: no fall-through, multiple labels, returns a value (Java 14+)
String kind = switch (day) {
    case MON, TUE, WED, THU, FRI -> "weekday";
    case SAT, SUN                -> "weekend";
};

// Block body uses yield
int code = switch (level) {
    case "high" -> 3;
    default     -> { log(level); yield 0; }
};

// Pattern matching + guards + null (Java 21)
String desc = switch (obj) {
    case Integer i when i > 0 -> "positive int " + i;
    case String str           -> "string len " + str.length();
    case null                 -> "was null";
    default                   -> "something else";
};
```

## Class, constructor, methods

```java
public class Point {
    private final int x, y;                  // fields

    public Point(int x, int y) {             // constructor
        this.x = x;
        this.y = y;
    }

    public int x() { return x; }             // instance method
    public static Point origin() {           // static factory
        return new Point(0, 0);
    }
}
```

## Interface

```java
public interface Shape {
    double area();                           // abstract method

    default String describe() {              // default method (Java 8)
        return "area = " + area();
    }
    static Shape unit() { return () -> 1.0; } // static method
    private double half() { return area() / 2; } // private method (Java 9)
}
```

## Record (Java 16+)

```java
public record Point(int x, int y) {
    // Auto-generated: canonical constructor, x()/y() accessors,
    // equals, hashCode, toString.

    public Point {                           // compact constructor — validate
        if (x < 0 || y < 0)
            throw new IllegalArgumentException("negative");
    }
    public static Point origin() { return new Point(0, 0); }
}
```

## Enum

```java
public enum Planet {
    EARTH(5.97e24), MARS(6.42e23);           // constants with constructor args

    private final double massKg;
    Planet(double massKg) { this.massKg = massKg; }
    public double massKg() { return massKg; }
}
// Planet.EARTH, Planet.values(), Planet.valueOf("MARS")
```

## Generics

```java
class Box<T> { private T value; }                 // generic class
<T> T first(List<T> xs) { return xs.get(0); }     // generic method
List<? extends Number> producer;                  // upper bound — read (PE)
List<? super Integer> consumer;                   // lower bound — write (CS)
```

## Lambdas & functional interfaces

```java
Runnable r = () -> System.out.println("hi");
Function<Integer, Integer> sq = x -> x * x;
Comparator<String> byLen = (a, b) -> a.length() - b.length();
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;
```

| Interface | Signature | Use |
|---|---|---|
| `Supplier<T>` | `() -> T` | produce a value |
| `Consumer<T>` | `T -> void` | side effect |
| `Function<T,R>` | `T -> R` | transform |
| `BiFunction<T,U,R>` | `(T,U) -> R` | two-arg transform |
| `Predicate<T>` | `T -> boolean` | test/filter |
| `UnaryOperator<T>` | `T -> T` | same-type transform |
| `BinaryOperator<T>` | `(T,T) -> T` | reduce/combine |
| `Runnable` | `() -> void` | run an action |

### Method references

| Form | Example | Equivalent lambda |
|---|---|---|
| Static | `Integer::parseInt` | `s -> Integer.parseInt(s)` |
| Bound instance | `System.out::println` | `x -> System.out.println(x)` |
| Unbound instance | `String::toUpperCase` | `s -> s.toUpperCase()` |
| Constructor | `ArrayList::new` | `() -> new ArrayList<>()` |

## try-with-resources & exceptions

```java
try (var reader = Files.newBufferedReader(path)) {
    return reader.readLine();                // resource auto-closed
} catch (IOException e) {
    throw new UncheckedIOException(e);       // wrap, keep the cause
}

try { ... }
catch (IllegalArgumentException | IllegalStateException e) { ... } // multi-catch
finally { ... }                              // always runs (cleanup only)
```

## Common String methods

| Method | Returns |
|---|---|
| `length()` | number of `char`s |
| `charAt(i)` | char at index `i` |
| `substring(a, b)` | substring `[a, b)` |
| `indexOf(s)` / `lastIndexOf(s)` | index or `-1` |
| `contains(s)` / `startsWith` / `endsWith` | `boolean` |
| `equals` / `equalsIgnoreCase` | content equality |
| `toUpperCase()` / `toLowerCase()` | new string |
| `strip()` / `trim()` | whitespace removed (`strip` is Unicode-aware) |
| `isEmpty()` / `isBlank()` | length 0 / only whitespace |
| `replace(a, b)` / `split(regex)` | new string / `String[]` |
| `String.join(d, parts)` / `String.format(fmt, …)` | static helpers |
| `repeat(n)` / `chars()` | repeated string / `IntStream` |

## Common Collection & Map methods

| List / Set | Effect |
|---|---|
| `add(e)` / `add(i, e)` | append / insert |
| `get(i)` / `set(i, e)` | read / replace |
| `remove(i)` / `remove(obj)` | by index / by value |
| `size()` / `isEmpty()` / `contains(e)` | count / empty / membership |
| `removeIf(pred)` / `clear()` | conditional / all |
| `List.of(…)` / `List.copyOf(c)` | immutable copies |

| Map | Effect |
|---|---|
| `put(k, v)` / `get(k)` / `remove(k)` | basic ops |
| `getOrDefault(k, d)` | value or default |
| `putIfAbsent(k, v)` | set only if missing |
| `computeIfAbsent(k, fn)` | lazily build a value |
| `merge(k, v, fn)` | combine (great for counters) |
| `keySet()` / `values()` / `entrySet()` | views |
| `forEach((k, v) -> …)` | iterate entries |

## Common Stream operations

| Stage | Methods |
|---|---|
| Source | `collection.stream()`, `Stream.of(…)`, `IntStream.range(a, b)`, `Arrays.stream(arr)` |
| Intermediate (lazy) | `filter`, `map`, `mapToInt`, `flatMap`, `distinct`, `sorted`, `limit`, `skip`, `peek` |
| Terminal (eager) | `forEach`, `collect`, `reduce`, `count`, `anyMatch`/`allMatch`/`noneMatch`, `findFirst`, `min`/`max`, `toList()` |
| Collectors | `toList`, `toSet`, `toMap`, `groupingBy`, `partitioningBy`, `joining`, `counting`, `summingInt` |

```java
List<String> adults = people.stream()
    .filter(p -> p.age() >= 18)
    .map(Person::name)
    .sorted()
    .toList();                  // Java 16+ (immutable)
```

:::gotcha
The classic colon `switch` (`case X:`) **falls through** to the next case unless you `break`. The arrow form (`case X ->`) never falls through. Mixing them is a compile error — pick the arrow form for new code.
:::

:::senior
Streams aren't always the answer. For a simple transform a `for` loop is clearer and faster (no pipeline setup, no boxing). Reach for streams when the pipeline reads better than the loop — `filter → map → collect` over a collection — not as a reflex for every iteration.
:::

:::tip
Use `var` only when the right-hand side already makes the type obvious (`var list = new ArrayList<String>()`). Avoid it when the type is non-obvious (`var x = service.fetch()`), where naming the type aids the reader.
:::

:::key
Declare with the interface and instantiate the implementation; use `equals` (not `==`) for content; the arrow `switch` is exhaustive and never falls through; `record` gives you `equals`/`hashCode`/`toString` free; lambdas implement single-method interfaces; and `try`-with-resources auto-closes anything `AutoCloseable`.
:::
