---
title: Best Practices Cheat Sheet
category: Tips, Tricks & Cheat Sheets
categoryOrder: 15
order: 3
level: Intermediate
summary: A scannable do/don't reference across language, collections, strings, concurrency, exceptions, performance, and API design.
tags: best-practices, idioms, clean-code, conventions, cheatsheet
---

A fast do/don't lookup distilled from *Effective Java* and modern Java idioms. Each row is "prefer this, avoid that" with the reason in one line. Skim the section you need.

## General language

| Prefer | Avoid | Why |
|---|---|---|
| `private final` fields; immutability | public mutable fields | fewer invariants to defend |
| `record` for data carriers | hand-written DTO boilerplate | free `equals`/`hashCode`/`toString` |
| composition | deep inheritance | inheritance breaks encapsulation |
| `enum` for fixed constant sets | `int`/`String` constants | type-safe, has behavior |
| enhanced `switch` / pattern matching | long `if-else` ladders | exhaustive, no fall-through |
| `@Override` on every override | silent signature drift | compiler catches typos |
| `var` for obvious local types | `var` that hides the type | readability |
| `Objects.equals` / `requireNonNull` | manual null juggling | concise, fails fast |

## Collections

| Prefer | Avoid | Why |
|---|---|---|
| interface types (`List`, `Map`) | concrete types in signatures | swap implementations freely |
| `new ArrayList<>(expectedSize)` | repeated resizing | fewer array copies |
| `isEmpty()` | `size() == 0` | clear and O(1) everywhere |
| `getOrDefault` / `computeIfAbsent` / `merge` | get-null-check-put | atomic, fewer lookups |
| `EnumMap` / `EnumSet` | `HashMap`/`HashSet` of enums | array-backed, faster |
| `List.of` / `Map.of` for constants | `Arrays.asList` | truly immutable, rejects `null` |
| `removeIf` / `Iterator.remove()` | removing inside a for-each | avoids `ConcurrentModificationException` |

## Strings

| Prefer | Avoid | Why |
|---|---|---|
| `StringBuilder` in loops | `+=` in loops | concatenation in a loop is O(n²) |
| `equals` / `equalsIgnoreCase` | `==` for content | `==` is reference identity |
| `Objects.equals(a, b)` or `"const".equals(x)` | `x.equals("const")` when `x` may be null | null-safe |
| `isBlank()` (Java 11) | `trim().isEmpty()` | Unicode-aware, clearer |
| text blocks `"""..."""` / `String.format` | sprawling `+` templates | readable multi-line |
| `split(",", -1)` when trailing empties matter | bare `split(",")` | default drops trailing empties |

## Concurrency

| Prefer | Avoid | Why |
|---|---|---|
| `java.util.concurrent` utilities | hand-rolled `wait`/`notify` | correct and battle-tested |
| `ExecutorService` / virtual threads | `new Thread()` per task | pooling, lifecycle, backpressure |
| immutable shared objects | shared mutable state | no locking needed |
| `AtomicInteger` / `LongAdder` | `volatile count++` | `++` is not atomic |
| `ConcurrentHashMap` | `synchronizedMap` + compound ops | check-then-act still races |
| `lock()` … `try { } finally { unlock() }` | locking without guaranteed release | avoids stuck locks |
| `volatile` for visibility flags | assuming `volatile` is atomic | it gives visibility/ordering only |

## Exceptions

| Prefer | Avoid | Why |
|---|---|---|
| catch the most specific type | `catch (Exception/Throwable)` | don't mask bugs |
| `try`-with-resources | manual `close()` in `finally` | no leaks, suppressed-exception handling |
| `throw new X("context", cause)` | dropping the cause | preserves the stack trace |
| unchecked for programming errors | checked-exception clutter | cleaner APIs |
| fail fast with a clear message | swallowing (`catch { }`) | silent failure is the worst kind |
| `Thread.currentThread().interrupt()` on `InterruptedException` | swallowing the interrupt | keeps cancellation working |

## Performance

| Prefer | Avoid | Why |
|---|---|---|
| measure first (profiler, JMH) | guessing / premature optimization | intuition is usually wrong |
| right data structure / algorithm | brute force | beats micro-tuning every time |
| reuse compiled `Pattern`, `DateTimeFormatter` | recompiling in a loop | compilation is expensive |
| `IntStream`/primitive arrays in hot paths | needless boxing | avoids allocation churn |
| buffered & batched I/O | byte-at-a-time I/O | syscalls dominate |
| lazy / short-circuit (`Stream`, `&&`) | eager whole-collection work | do less |

## API design

| Prefer | Avoid | Why |
|---|---|---|
| accept and return interfaces | leaking concrete types | flexible for callers and you |
| validate args, fail fast | trusting input | errors surface at the source |
| minimal accessibility | public by default | smaller surface to maintain |
| immutable value types / builder | telescoping constructors | readable, safe construction |
| defensive copies of mutable in/out | exposing internal collections | callers can't corrupt your state |
| documented nullability & thread-safety | undocumented contracts | callers guess otherwise |
| few, well-named parameters | long parameter lists | fewer call-site mistakes |

:::gotcha
`Collections.synchronizedMap` only makes *single* calls atomic. A compound action like `if (!map.containsKey(k)) map.put(k, v);` is still a race — another thread can slip in between. Use `ConcurrentHashMap` with `putIfAbsent`/`computeIfAbsent`, which are atomic by design.
:::

:::senior
`Optional` is a **return type** for "maybe absent" results — not a field, parameter, or collection element. Fields stay nullable or use a sentinel; collections use emptiness, not `Optional<List<T>>`. And never return `null` where an empty `Optional`, `List.of()`, or `Map.of()` would do — empty-over-null removes a whole category of NPEs from your callers.
:::

:::tip
Two rules cover most of *Effective Java*: **program to interfaces, not implementations**, and **favor immutability**. Immutable objects are automatically thread-safe, hashable, cacheable, and impossible to corrupt — reach for `record` and `final` first.
:::

:::key
Code to interfaces, prefer immutability, and fail fast. Use `equals` (never `==`) for content, `StringBuilder` in loops, `java.util.concurrent` over hand-rolled locks, the most specific `catch` with `try`-with-resources, and always measure before optimizing. Return empty collections/`Optional` instead of `null`.
:::
