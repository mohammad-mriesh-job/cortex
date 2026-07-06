---
title: Singleton
category: Creational Patterns
categoryOrder: 2
order: 1
level: Intermediate
summary: One instance, one global access point — the five ways to build it safely, and why interviewers call it an anti-pattern.
tags: singleton, creational, design patterns, thread safety
---

Some things really do exist once per process: the JVM's runtime, a configuration registry, a
connection pool. The naive answer — "just make it a public static field and hope nobody `new`s a
second one" — fails the moment two threads race the lazy initializer or someone calls the
constructor directly. **Singleton** guarantees a class has exactly **one instance** and gives
everyone a single global point of access to it. It is the most-asked pattern — and the most-abused.

## Structure

```mermaid
classDiagram
    class Singleton {
      -instance: Singleton$
      -Singleton()
      +getInstance() Singleton$
      +doWork()
    }
```

A **private constructor** (nobody else can `new` it) plus a **static accessor** that returns the
one shared instance.

## Five ways to implement it

Ordered best → most caveats. Prefer the top two.

````tabs
tabs:
  - label: Enum (best)
    body: |
      Thread-safe and serialization-safe for free — Josh Bloch's recommended approach.
      ```java
      public enum Config {
        INSTANCE;
        public void load() { /* ... */ }
      }
      // Config.INSTANCE.load();
      ```
  - label: Bill Pugh holder
    body: |
      Lazy and thread-safe with **no synchronization** — the JVM loads the holder once, on first use.
      ```java
      public class Config {
        private Config() {}
        private static class Holder { static final Config I = new Config(); }
        public static Config get() { return Holder.I; }
      }
      ```
  - label: Double-checked lock
    body: |
      Lazy with minimal locking. The field **must be `volatile`** or a thread can see a half-built object.
      ```java
      public class Config {
        private static volatile Config i;
        private Config() {}
        public static Config get() {
          if (i == null) synchronized (Config.class) {
            if (i == null) i = new Config();
          }
          return i;
        }
      }
      ```
  - label: Eager
    body: |
      Built at class load — simple and safe, but created even if never used.
      ```java
      public class Config {
        private static final Config I = new Config();
        private Config() {}
        public static Config get() { return I; }
      }
      ```
  - label: Lazy + synchronized
    body: |
      Correct but slow — **every** call locks. Fine only if rarely called.
      ```java
      public class Config {
        private static Config i;
        private Config() {}
        public static synchronized Config get() {
          if (i == null) i = new Config();
          return i;
        }
      }
      ```
````

## Why double-checked locking needs `volatile`

The classic follow-up. `i = new Config()` is **not atomic** — it compiles to roughly three steps:
allocate memory, run the constructor, publish the reference. The JIT and CPU may **reorder** steps
2 and 3. Without `volatile`, another thread can observe a **non-null reference to a
half-constructed object**, skip the lock, and read garbage fields. `volatile` forbids that
reordering: the write to `i` happens-after the constructor completes, so any thread that sees the
reference sees a fully built object.

## Two ways to break a singleton — and the fix

A private constructor stops `new`, but not everything:

- **Reflection**: `constructor.setAccessible(true); constructor.newInstance()` happily creates a
  second instance. Defense: throw from the constructor if the instance already exists.
- **Serialization**: deserializing creates a fresh object, bypassing the constructor. Defense:
  implement `readResolve()` to return the existing instance.

```java
private Object readResolve() { return getInstance(); }  // deserialization returns the one true instance
```

The **enum singleton dodges both for free** — the JVM guarantees enum constants are instantiated
exactly once, refuses reflective construction of enums (`IllegalArgumentException`), and
serializes them by name. That is why *Effective Java* (Item 3) calls a single-element enum the
best way to implement a singleton.

## In the JDK and Spring

- **`Runtime.getRuntime()`** — the canonical JDK singleton: one runtime per JVM, private
  constructor, static accessor (eagerly initialized).
- **`Desktop.getDesktop()`**, **`System.getSecurityManager()`** — same shape.
- **Spring beans are singletons by default** — one instance *per container*, but crucially managed
  by DI, not by a static accessor. You get the "one instance" benefit while staying mockable.

## Singleton vs a static utility class

Interviewers often ask why not just make everything `static`:

| | Singleton | Static utility class (`Math`, `Collections`) |
|--|--|--|
| Holds state? | Yes — one shared instance with fields | Should be stateless |
| Can implement an interface? | Yes — passable where the interface is expected | No — cannot polymorph or be injected |
| Lazy initialization? | Yes (holder/DCL) | Class-load time only |
| Mockable in tests? | Painful but possible | No — static calls are welded in |

If it has state or needs to be substituted, use a singleton (or better, an injected bean). If it
is pure functions, a `final` class with a private constructor and static methods is simpler.

## When to use — and when not to

| Use it for | Avoid it because |
|--|--|
| A genuinely single resource: a registry, config, connection pool, logger | It is **global mutable state** — hidden, implicit dependencies |
| Coordinating access to one shared thing | It makes unit tests hard (cannot swap/mock the instance) |
| Hardware/OS handles that must not be duplicated | It hides coupling — every caller silently depends on it |

:::gotcha
Lazy `getInstance()` **without** synchronization is a classic bug — two threads both pass the
`null` check and create two instances. Use `enum`, the Bill Pugh holder, or double-checked
locking with `volatile`. And remember one-per-**classloader**: two web apps in one servlet
container each get their own "singleton".
:::

:::senior
Modern teams rarely hand-roll Singletons: a DI container (e.g. Spring) gives you singleton-scoped
beans **without** global static state, so they stay mockable in tests. Reach for the pattern only
when a true single instance is essential and DI is not available.
:::

## Check yourself

```quiz
title: Singleton check
questions:
  - q: 'Which singleton is thread-safe AND serialization-safe with the least code?'
    options:
      - text: 'An `enum` singleton'
        correct: true
      - 'An eager static field'
      - 'A lazy getter with no synchronization'
    explain: 'A single-element `enum` lets the JVM handle instantiation, thread-safety, and serialization — the recommended approach.'
  - q: 'In double-checked locking, why must the instance field be `volatile`?'
    options:
      - 'To make reads faster'
      - text: 'Without it, reordering can publish a non-null but partially-constructed object'
        correct: true
      - 'It is not actually required'
    explain: 'Without `volatile`, the reference can be published before the constructor finishes, so another thread sees a half-built instance.'
  - q: 'Why do interviewers often call Singleton an anti-pattern?'
    options:
      - 'It uses too much memory'
      - text: 'It is global mutable state that hides dependencies and hurts testability'
        correct: true
      - 'It cannot be made thread-safe'
    explain: 'It is implicitly-accessed global state that couples code to it and makes tests hard to isolate. Prefer dependency injection so instances can be swapped or mocked.'
```

:::key
Singleton = one instance + global access via a private constructor and static accessor. Best
implementation: **`enum`** (or the **Bill Pugh holder** for lazy); double-checked locking needs
**`volatile`**. But it is global state — prefer **dependency injection** where you can.
:::
