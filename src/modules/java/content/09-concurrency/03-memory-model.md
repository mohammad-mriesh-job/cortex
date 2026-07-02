---
title: The Java Memory Model
category: Concurrency & Multithreading
categoryOrder: 9
order: 3
level: Expert
summary: The contract behind visibility — why the JMM exists, happens-before edges, volatile, instruction reordering, and final-field safe publication.
tags: jmm, happens-before, volatile, visibility, reordering
---

The **Java Memory Model (JMM)**, defined by JSR-133 in Java 5, is the contract that says *when a write by one thread is guaranteed to be visible to a read by another*. Without it, multithreaded code would have no portable meaning.

## Why the JMM exists

For single-threaded speed, compilers, the JIT, and CPUs aggressively **reorder** instructions and **cache** values in registers and per-core caches. A thread may keep a field in a register and never re-read main memory; the CPU may execute independent statements out of order. These optimisations are invisible within one thread but can let another thread observe **stale** or seemingly **impossible** values. The JMM defines the *minimum* guarantees the platform must honour, so you can reason about concurrency without knowing the target CPU.

:::note
A **data race** is two accesses to the same variable, at least one a write, not ordered by happens-before. Under the JMM a data-race-free program behaves *sequentially consistent*; a program **with** races has no guaranteed behaviour at all — including reading values no interleaving could produce.
:::

## Happens-before — the core rule

If action **A** *happens-before* action **B**, then A's memory effects are visible to B, and A is ordered before B. The relationship is built from these edges (and is **transitive**):

| Edge | A happens-before B |
|------|--------------------|
| Program order | earlier statement → later statement *in the same thread* |
| Monitor lock | unlock of a monitor → subsequent lock of the same monitor |
| `volatile` | write of a volatile field → subsequent read of that field |
| Thread start | `t.start()` → first action in thread `t` |
| Thread join | last action in `t` → return from `t.join()` |
| `final` field | construction freeze → reads via a safely published reference |

Crucially, **without** a happens-before edge, there is **no** visibility guarantee — even if the wall-clock time clearly separates the two actions.

## Visibility: the stale-flag bug

```java
class Worker {
    private boolean running = true;   // NOT volatile — broken
    void stop() { running = false; }
    void run() {
        while (running) { /* spin */ } // may loop FOREVER
    }
}
```

The reader thread may cache `running` in a register; the writer's `false` never propagates, so the loop never exits. Marking the field `volatile` creates the happens-before edge that fixes it.

## `volatile` — visibility and ordering, not atomicity

A `volatile` read/write goes to/from main memory and acts as a barrier: code is **not reordered** across it. It gives **visibility** and **ordering** — but **not** atomicity for compound actions.

```java
volatile boolean ready;     // perfect for a one-way flag
volatile int count;
count++;                    // STILL a race: read-modify-write isn't atomic
```

Use `volatile` for status flags and for *publishing* an immutable object reference; use `synchronized`, a lock, or an `Atomic*` class when you need atomic updates.

## Reordering and double-checked locking

Reordering is why the famous double-checked-locking singleton **requires** `volatile`. Object construction and the field write can be reordered, so without `volatile` another thread can observe a **non-null but partially constructed** object.

```java
class Holder {
    private static volatile Holder instance;   // volatile is mandatory here
    static Holder get() {
        if (instance == null) {                // 1st check (no lock)
            synchronized (Holder.class) {
                if (instance == null) {        // 2nd check (locked)
                    instance = new Holder();
                }
            }
        }
        return instance;
    }
}
```

:::senior
Prefer designs that sidestep the JMM's sharp edges. A `static final` field initialised in a holder class is lazily, safely published by the **class-initialisation** lock (the *initialization-on-demand holder* idiom) and needs no `volatile`. For singletons, an `enum` is even simpler. Reach for double-checked locking only when lazy init genuinely matters on a hot path.
:::

## Final fields and safe publication

The JMM gives `final` fields a special guarantee: once a constructor completes, any thread that reads the object **through a reference obtained after construction** sees the fully initialised `final` fields — *without* synchronization. This is what makes immutable objects (`String`, `Integer`, your own value types) safe to share freely.

```java
final class Point {
    final int x, y;                  // frozen at end of constructor
    Point(int x, int y) { this.x = x; this.y = y; }
}
```

:::gotcha
The `final`-field guarantee holds **only if `this` does not escape during construction**. Starting a thread, registering a listener, or storing `this` in a shared collection from inside the constructor publishes a half-built object — readers may see default (`0`/`null`) field values. Never let `this` leak before the constructor returns.
:::

## Check yourself

```quiz
title: 'volatile & happens-before'
questions:
  - q: 'Which guarantees does a `volatile` field provide?'
    options:
      - text: '**Visibility** (later reads see the latest write) and **ordering** (no reordering across the access).'
        correct: true
      - 'Atomicity of compound actions such as `count++`.'
      - 'Mutual exclusion, like a lock.'
      - 'Visibility, ordering, **and** atomic `count++`.'
    explain: 'A `volatile` read/write goes to main memory and acts as a barrier, giving visibility and ordering — but **not** atomicity for read-modify-write sequences.'
  - q: 'Is `volatile int count; ... count++;` thread-safe?'
    options:
      - text: 'No — `count++` is a read-modify-write, which is not atomic even on a volatile field.'
        correct: true
      - 'Yes — `volatile` makes every operation on the field atomic.'
      - 'Yes, but only on a single-core CPU.'
      - 'Only if `count` is also `final`.'
    explain: 'For atomic updates use an `AtomicInteger`, a lock, or `synchronized`. `volatile` fixes only visibility and ordering, not the lost-update race in `++`.'
  - q: 'Two threads touch a shared field with **no** happens-before edge between them. What does the JMM guarantee about visibility?'
    options:
      - 'The write that happened earlier in wall-clock time is always visible.'
      - text: 'Nothing — without a happens-before edge there is no visibility guarantee at all.'
        correct: true
      - 'The first thread to start always wins.'
      - 'Visibility is guaranteed on x86 but not on ARM.'
    explain: 'Visibility is defined purely by happens-before, not by real time. With no edge (volatile, lock, start/join, or a final-field freeze) a thread may read a stale value indefinitely.'
```

:::key
The JMM exists because compilers and CPUs reorder and cache memory for speed; it defines the **happens-before** relation that determines visibility. No happens-before edge means no visibility guarantee. `volatile` gives visibility and ordering but not atomicity; locks, `volatile`, `start/join`, and `final`-field freezes are the edges you build with. A correctly constructed object's `final` fields are safely published **provided `this` never escapes the constructor**.
:::
