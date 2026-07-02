---
title: Generics Basics
category: Generics
categoryOrder: 5
order: 1
level: Intermediate
summary: Why generics exist, how to write generic classes, interfaces, and methods, and why raw types are a trap.
tags: generics, type-safety, type-parameters, diamond
---

Generics, added in **Java 5 (2004)**, let you parameterize a type or method by the types it works with. The payoff is **compile-time type safety** and code that needs **no casts** — the two ideas behind everything in this module.

## The problem: life before generics

Without generics, collections held `Object`, so the compiler couldn't stop you from mixing types. Errors surfaced at **runtime**, far from where the bug was introduced, and every read needed a cast.

```java
List names = new ArrayList();        // pre-2004 style — a "raw" list
names.add("Ada");
names.add(42);                       // compiles fine — no checking
String first = (String) names.get(0); // manual cast on every read
String oops  = (String) names.get(1); // ClassCastException at runtime
```

## Generics to the rescue

```java
List<String> names = new ArrayList<>();
names.add("Ada");
names.add(42);             // compile error — caught immediately
String first = names.get(0); // no cast needed
```

The `<String>` is a **type argument**. It moves type checking from runtime to compile time, removes casts, and documents intent in the signature.

## Generic classes and interfaces

A **type parameter** in angle brackets makes a class reusable across types:

```java
public class Box<T> {                 // T is a type parameter
    private T value;
    public void set(T value) { this.value = value; }
    public T get() { return value; }
}

Box<String> b = new Box<>();
b.set("hi");
String s = b.get();                   // T is String here, so get() returns String
```

Interfaces are parameterized the same way — the JDK is full of them (`List<E>`, `Comparable<T>`):

```java
public interface Container<T> {
    void add(T item);
    T get(int index);
}
```

Multiple parameters are comma-separated: `Map<K, V>`, `BiFunction<T, U, R>`. The single-letter names are conventions, not rules:

| Letter | Conventional meaning |
|--------|----------------------|
| `T` | Type (general purpose) |
| `E` | Element (used by collections) |
| `K`, `V` | Key, Value (used by maps) |
| `N` | Number |
| `S`, `U`, `R` | Second/third type, or Result |

## Generic methods

A method can declare **its own** type parameter, independent of its class. The `<T>` goes immediately before the return type:

```java
public static <T> T firstOrNull(List<T> list) {
    return list.isEmpty() ? null : list.get(0);
}

String s  = firstOrNull(List.of("a", "b")); // T inferred as String
Integer n = firstOrNull(List.of(1, 2));      // T inferred as Integer
```

The compiler **infers** `T` from the arguments, so you rarely state it. When you must, use an explicit type witness: `Demo.<String>firstOrNull(list)`.

## The diamond operator

Since **Java 7** you don't repeat the type arguments on the right-hand side — the empty `<>` (the "diamond") infers them from the declared type:

```java
Map<String, List<Integer>> m = new HashMap<>(); // not new HashMap<String, List<Integer>>()
```

:::tip
With `var` (Java 10+) keep the type argument on the right so it isn't lost. `var list = new ArrayList<String>();` is `ArrayList<String>`, but `var list = new ArrayList<>();` infers the useless `ArrayList<Object>`.
:::

## Raw types: don't

Using a generic class **without** its type argument produces a **raw type**. It exists only for backward compatibility with pre-Java-5 code, and it switches off the safety you just gained.

```java
List raw = new ArrayList();  // raw type — avoid
raw.add("x");
raw.add(1);                  // no checking; compiler emits an "unchecked" warning
```

:::gotcha
A raw type disables generics for the **entire** object, not just the missing argument. Assigning a `List<String>` to a raw `List` and back lets non-Strings sneak in, resurrecting the very `ClassCastException` generics were meant to prevent. Treat every "unchecked" warning as a latent bug.
:::

:::senior
Generics are **invariant**: `List<String>` is *not* a subtype of `List<Object>`, even though `String` is a subtype of `Object`. This surprises newcomers, but it is exactly what keeps the type system sound — if it were allowed, you could add an `Integer` to a `List<Object>` that is really a `List<String>`. Wildcards (the next topic) restore controlled flexibility without breaking safety.
:::

:::key
Generics deliver compile-time type safety and cast-free code by parameterizing types with `<T>`. Use the diamond `<>` to avoid repetition, follow the `T`/`E`/`K`/`V` naming conventions, write generic methods when only a method needs a type parameter, and never fall back to raw types.
:::
