---
title: Synchronization & Locks
category: Concurrency & Multithreading
categoryOrder: 9
order: 2
level: Advanced
summary: Taming shared mutable state — race conditions, the synchronized keyword, intrinsic monitors, ReentrantLock, ReadWriteLock, and the seeds of deadlock.
tags: synchronization, locks, monitor, reentrantlock, deadlock
---

When multiple threads read and write the **same mutable state** without coordination, you get a **race condition**: the result depends on the unpredictable interleaving of operations.

## The race condition

`count++` looks atomic but is three steps — **read**, increment, **write**. Two threads can read the same value, both increment, and both write back, losing an update.

```java
class Counter {
    private int count = 0;
    void increment() { count++; }   // read-modify-write — NOT atomic
    int get() { return count; }
}
// Two threads each calling increment() 1_000_000 times
// rarely yields 2_000_000 — updates are lost.
```

## `synchronized` — mutual exclusion + visibility

Every Java object has an **intrinsic lock** (a *monitor*). The `synchronized` keyword acquires it on entry and releases it on exit, guaranteeing that only one thread holds it at a time. It provides **two** things: mutual exclusion *and* memory **visibility** (a happens-before edge — what one thread did before releasing is visible to the next thread that acquires).

```java
synchronized void increment() { count++; }   // locks 'this'
static synchronized void s() { }              // locks Counter.class

void block() {
    synchronized (lock) {   // lock on a SPECIFIC object — finer-grained
        count++;
    }
}
```

- A `synchronized` **method** locks `this` (instance) or the `Class` object (static).
- A `synchronized` **block** locks any object you name — prefer a `private final Object lock = new Object();` so callers can't grab your lock.

Intrinsic locks are **reentrant**: a thread already holding a lock can re-acquire it (e.g. one `synchronized` method calling another on the same object) without deadlocking itself.

:::gotcha
The lock is on the **object**, not the code. Synchronizing on different instances (or on a `new Integer`/boxed value) provides no protection. Conversely, synchronizing on a shared mutable field whose reference can change is a bug — always lock on a `private final` field.
:::

## `ReentrantLock` — the explicit alternative

`java.util.concurrent.locks.ReentrantLock` offers the same semantics with more control. The price: you must `unlock()` yourself, always in a `finally`.

```java
private final ReentrantLock lock = new ReentrantLock();

void update() {
    lock.lock();
    try {
        // critical section
    } finally {
        lock.unlock();   // MUST be in finally, or a thrown exception leaks the lock
    }
}
```

| Feature | `synchronized` | `ReentrantLock` |
|---------|----------------|-----------------|
| Acquire/release | implicit (block scope) | manual (`lock`/`unlock`) |
| Timed / give-up | no | `tryLock(timeout)` |
| Interruptible wait | no | `lockInterruptibly()` |
| Fairness option | no | yes (`new ReentrantLock(true)`) |
| Multiple conditions | one wait-set | many via `newCondition()` |
| Risk | can't leak | leaks if you forget `finally` |

`tryLock` is the key extra power — it lets a thread *back off* instead of blocking forever, which is a primary defence against deadlock.

## `ReadWriteLock` — many readers OR one writer

When data is read far more often than written, a single mutex needlessly serialises readers. `ReentrantReadWriteLock` allows **any number of concurrent readers** *or* **one exclusive writer**.

```java
private final ReadWriteLock rw = new ReentrantReadWriteLock();

V read(K key) {
    rw.readLock().lock();
    try { return map.get(key); }
    finally { rw.readLock().unlock(); }
}
void write(K key, V val) {
    rw.writeLock().lock();
    try { map.put(key, val); }
    finally { rw.writeLock().unlock(); }
}
```

:::senior
For read-heavy workloads, `StampedLock` (Java 8) often beats `ReadWriteLock` thanks to an **optimistic read** mode (`tryOptimisticRead`) that takes no lock at all and validates afterward. Caveats: `StampedLock` is **not reentrant** and supports no `Condition`. For most code, a `ConcurrentHashMap` or an immutable snapshot beats hand-rolled read/write locking entirely — reach for explicit locks only when you genuinely need them.
:::

## The seed of deadlock

The moment you hold more than one lock, ordering matters. Two threads that grab locks `A` and `B` in **opposite** order can each hold one and wait forever for the other.

```java
// Thread 1: synchronized(A){ synchronized(B){...} }
// Thread 2: synchronized(B){ synchronized(A){...} }  // ← reversed: deadlock risk
```

The fix is a **global lock-ordering** rule: always acquire locks in the same, consistent order everywhere. (Deadlock and its four necessary conditions are covered in depth in *Concurrency Pitfalls*.)

:::key
Unsynchronized access to shared mutable state is a **race condition**. `synchronized` uses an object's intrinsic, reentrant **monitor** to give both mutual exclusion *and* visibility. `ReentrantLock` adds `tryLock`, interruptible and fair acquisition, and multiple conditions — but you must `unlock()` in a `finally`. `ReadWriteLock` scales read-heavy access. Always lock on a `private final` object, and acquire multiple locks in a consistent global order to avoid deadlock.
:::
