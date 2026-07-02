---
title: Enums
category: Object-Oriented Programming
categoryOrder: 3
order: 8
level: Intermediate
summary: Type-safe constants with real power — fields, constructors, constant-specific methods, values/valueOf/ordinal, EnumSet/EnumMap, and the enum singleton.
tags: enums, enumset, enummap, singleton, constants
---

An **enum** defines a fixed set of named constants as a full-fledged type. Unlike `public static final int` constants, enums are **type-safe** (you can't pass the wrong constant), self-describing in output, and usable in `switch`. Each constant is a singleton instance of the enum type.

```java
enum Day { MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY }

Day today = Day.FRIDAY;
if (today == Day.FRIDAY) System.out.println("TGIF"); // == is safe; each is a singleton
```

## Fields, constructors, and methods

Enums are classes, so each constant can carry data supplied through a **private constructor**. Constructors are *never* called with `new` — the constants invoke them.

```java
enum Planet {
    EARTH(5.976e24, 6.378e6),
    MARS(6.421e23, 3.397e6);          // each constant passes constructor args

    private final double mass, radius; // immutable per-constant data
    Planet(double mass, double radius) {
        this.mass = mass;
        this.radius = radius;
    }
    double surfaceGravity() {
        return 6.67e-11 * mass / (radius * radius);
    }
}
double g = Planet.EARTH.surfaceGravity();
```

## Constant-specific (abstract) methods

A constant can **override** behaviour, giving each its own implementation — a clean alternative to a `switch` over the enum. Declare an `abstract` method and let every constant supply a body.

```java
enum Operation {
    PLUS  { public int apply(int a, int b) { return a + b; } },
    TIMES { public int apply(int a, int b) { return a * b; } };

    public abstract int apply(int a, int b);
}
int result = Operation.TIMES.apply(6, 7); // 42
```

:::senior
Constant-specific methods keep behaviour *next to* the constant it belongs to, so adding a new constant forces you to supply its behaviour (the compiler complains otherwise). Compare that to a `switch` scattered across the codebase that silently falls through to a default when you add a value. This "make illegal states unrepresentable" pattern is a hallmark of good enum design.
:::

## Built-in methods: values, valueOf, ordinal

Every enum gets these for free from `java.lang.Enum`:

| Method | Returns |
|--------|---------|
| `values()` | array of all constants, in declaration order |
| `valueOf("NAME")` | the constant with that exact name (throws if none) |
| `name()` | the constant's identifier as a `String` |
| `ordinal()` | zero-based position in declaration order |

```java
for (Day d : Day.values()) System.out.println(d);
Day mon = Day.valueOf("MONDAY");
int pos = Day.WEDNESDAY.ordinal(); // 2
```

:::gotcha
Never persist or rely on `ordinal()` as a stored identifier. Reordering or inserting a constant shifts every ordinal, silently corrupting saved data. If you need a stable numeric code, store an explicit field (`Day(int code)`) instead.
:::

## EnumSet and EnumMap

The collections framework provides high-performance, enum-specialised implementations. Prefer them over `HashSet`/`HashMap` whenever the keys are enum constants.

```java
import java.util.*;

EnumSet<Day> weekend = EnumSet.of(Day.SATURDAY, Day.SUNDAY); // bit-vector internally
EnumMap<Day, String> plan = new EnumMap<>(Day.class);
plan.put(Day.MONDAY, "gym");
```

`EnumSet` is implemented as a compact **bit vector** (a single `long` for enums with ≤64 constants), making membership operations extremely fast and memory-cheap. `EnumMap` is backed by a plain array indexed by `ordinal()`, so it's faster and more compact than a hash map.

## The enum singleton idiom

A single-constant enum is the most robust way to implement a **singleton** in Java. The JVM guarantees exactly one instance, and — unlike a hand-written singleton — it's automatically **thread-safe** and **serialization-safe** (no extra instance can be created via reflection or deserialization).

```java
public enum Registry {
    INSTANCE;                       // the one and only instance

    private final Map<String, Object> data = new HashMap<>();
    public void put(String k, Object v) { data.put(k, v); }
    public Object get(String k)         { return data.get(k); }
}
Registry.INSTANCE.put("key", 123);
```

:::tip
*Effective Java* calls a single-element enum "the best way to implement a singleton." It sidesteps the subtle bugs (double-checked locking, reflection attacks, broken `readResolve`) that plague the classic private-constructor approach.
:::

:::key
Enums are type-safe constant *classes*: give them `private` constructors, fields, and methods, including constant-specific overrides of `abstract` methods. Use `values()`/`valueOf()`/`name()` freely but avoid persisting `ordinal()`. Reach for `EnumSet`/`EnumMap` for fast enum-keyed collections, and use a single-constant enum for a bullet-proof singleton.
:::
