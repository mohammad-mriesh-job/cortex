---
title: Immutability & Confinement
category: Concurrency Models
categoryOrder: 9
order: 1
level: Advanced
summary: The cheapest thread safety is to never share mutable state — make objects immutable, or confine them to one thread. Plus the ThreadLocal trap every senior gets asked about.
tags: immutability, thread confinement, stack confinement, threadlocal, thread safety, defensive copy
---

The cheapest way to make code **thread-safe** is to avoid the problem entirely: don't share mutable
state. Two families of strategies get you there — either the state can never *change* (**immutability**),
or it is never *shared* (**confinement**). No locks, no memory barriers, no races to reason about.

## The strategy table

Reach for these before you reach for a lock. They are ordered from strongest guarantee to weakest:

| Strategy | Core idea | How you do it | Watch out |
|--|--|--|--|
| **Immutability** | Share freely — state cannot change after construction | `final` fields, no setters, defensive copies of mutable inputs | "Changing" means building a new object |
| **Stack confinement** | Object never escapes one method's local scope | Keep it in a local variable; never return, store, or pass it to a listener | Easy to accidentally leak via a callback |
| **Thread confinement** | Exactly one thread ever touches it | Design/convention: e.g. Swing EDT, a single-consumer queue | Unenforced — one stray access breaks it |
| **`ThreadLocal`** | Each thread gets its own private copy | `ThreadLocal.withInitial(...)`, then `get()` | **Leaks in thread pools** — call `remove()` |

## Immutability, concretely

An object is **immutable** when: the class is `final` (or otherwise can't be subclassed to add mutation),
all fields are `final`, there are no setters, and any mutable input/output is **defensively copied** so no
outside reference can reach in and mutate the internals.

````tabs
tabs:
  - label: Hand-rolled immutable class
    body: |
      ```java
      public final class Money {
        private final long cents;
        private final List<String> tags;   // a mutable type

        public Money(long cents, List<String> tags) {
          this.cents = cents;
          this.tags = List.copyOf(tags);   // defensive copy IN
        }
        public List<String> tags() {
          return tags;                     // already unmodifiable — safe to hand out
        }
        public Money plus(long c) {
          return new Money(cents + c, tags); // "change" = new object
        }
      }
      ```
      No setters, `final` fields, and the mutable `List` is copied on the way in. Nothing can mutate a `Money` after it exists, so any number of threads can read it without coordination.
  - label: Java record
    body: |
      ```java
      public record Point(int x, int y) {}            // immutable carrier for free
      public record Order(String id, List<Item> items) {
        public Order {                                // compact constructor
          items = List.copyOf(items);                 // still copy mutable parts!
        }
      }
      ```
      A `record` gives you `final` fields, no setters, and value semantics. But a record component that is a *mutable* type still needs a defensive copy — the record only makes the *reference* final, not the object it points at.
````

## ThreadLocal — a private copy per thread

`ThreadLocal<T>` looks like one variable but is really a **per-thread slot**: every thread that calls
`get()` sees its own independent value. It turns a *not*-thread-safe object into a safe one by giving
each thread its own instance.

```walkthrough
title: ThreadLocal — one field, a private copy per thread
code: |
  static final ThreadLocal<SimpleDateFormat> FMT =
      ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd"));

  String today() { return FMT.get().format(new Date()); }
steps:
  - text: 'One `static` field — but `ThreadLocal` is really a per-thread slot table. No thread has touched it yet.'
    array: ['empty', 'empty', 'empty']
    pointers: { 0: 'T1', 1: 'T2', 2: 'T3' }
    line: 1
  - text: '**T1** calls `get()` for the first time. The initial supplier runs and creates *T1''s own* `SimpleDateFormat`.'
    array: ['SDF-a', 'empty', 'empty']
    highlight: [0]
    pointers: { 0: 'T1', 1: 'T2', 2: 'T3' }
    line: 4
  - text: '**T2** calls `get()` and gets a *separate* instance — the supplier runs again just for T2.'
    array: ['SDF-a', 'SDF-b', 'empty']
    highlight: [1]
    pointers: { 0: 'T1', 1: 'T2', 2: 'T3' }
    line: 4
  - text: '**T3** likewise gets its own copy. Three threads, three private objects — nothing is shared.'
    array: ['SDF-a', 'SDF-b', 'SDF-c']
    highlight: [2]
    pointers: { 0: 'T1', 1: 'T2', 2: 'T3' }
    line: 4
  - text: '`SimpleDateFormat` is **not** thread-safe, yet each thread mutates only *its own* copy while formatting. No lock, no race.'
    array: ['SDF-a', 'SDF-b', 'SDF-c']
    sorted: [0, 1, 2]
    pointers: { 0: 'T1', 1: 'T2', 2: 'T3' }
    line: 4
  - text: '**The trap:** on a pooled thread that lives forever, the slot survives after the task ends — the value and its classloader leak.'
    array: ['SDF-a', 'SDF-b', 'SDF-c']
    highlight: [0]
    pointers: { 0: 'leaked!', 1: 'T2', 2: 'T3' }
    line: 1
  - text: 'Calling `FMT.remove()` in a `finally` clears T1''s slot, so the pooled thread is clean for its next task.'
    array: ['empty', 'SDF-b', 'SDF-c']
    sorted: [0]
    pointers: { 0: 'T1 cleared', 1: 'T2', 2: 'T3' }
    line: 4
```

:::gotcha
**ThreadLocal + thread pool = memory leak.** Pool threads never die, so their `ThreadLocal` slots never
clear. The stored value stays reachable forever, and because the value can pin a whole classloader, this
is a classic redeploy-time `OutOfMemoryError` in app servers. Always `remove()` in a `finally`:
```java
try { FMT.get().format(date); } finally { FMT.remove(); }
```
:::

:::senior
Immutable objects are also **safely published** for free: the JMM guarantees that once a constructor
with only `final` fields returns, every thread sees those fields fully initialized — no `volatile`
needed. But immutability of the *object* does not make the *reference* safe: if you swap which immutable
snapshot a shared field points at, that field still needs to be `volatile` or an `AtomicReference`.
Immutable *value*, mutable *slot* — guard the slot.
:::

## Check yourself

```quiz
title: Immutability and confinement check
questions:
  - q: 'What makes a properly immutable object inherently thread-safe?'
    options:
      - text: 'Its state cannot change after construction, so concurrent reads can never conflict'
        correct: true
      - 'The JVM automatically locks every immutable object'
      - 'Immutable objects are stored in thread-local memory'
    explain: 'With no way to mutate the object after it is built, all threads only ever read — and concurrent reads of unchanging data need no synchronization.'
  - q: 'Why must you call `remove()` on a `ThreadLocal` when using a thread pool?'
    options:
      - 'To reset the value to its initial supplier'
      - text: 'Pool threads are reused and never die, so the slot leaks its value until you clear it'
        correct: true
      - '`get()` throws after the first task otherwise'
    explain: 'A pooled thread outlives the task. Its ThreadLocal entry stays reachable across tasks, leaking the value (and possibly a classloader) — `remove()` in a `finally` prevents it.'
  - q: 'A class has `final` fields but stores a caller-supplied `List` directly without copying. Is it immutable?'
    options:
      - 'Yes — `final` fields make it immutable'
      - text: 'No — the caller still holds a reference and can mutate the list'
        correct: true
      - 'Only if the list is empty'
    explain: '`final` freezes the reference, not the object it points at. Without a defensive copy, the original caller can mutate the shared list, breaking immutability.'
```

:::key
Prefer **not sharing mutable state** over locking it. **Immutable** objects (`final` fields, no setters,
defensive copies) are thread-safe by construction and safely published for free. **Confinement** keeps an
object on one stack or one thread; **`ThreadLocal`** gives each thread a private copy — but in a thread
pool you *must* `remove()` it or it leaks.
:::
