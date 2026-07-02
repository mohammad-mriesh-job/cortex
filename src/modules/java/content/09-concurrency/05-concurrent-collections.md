---
title: Concurrent Collections
category: Concurrency & Multithreading
categoryOrder: 9
order: 5
level: Advanced
summary: Purpose-built thread-safe collections — ConcurrentHashMap's Java 8 bucket/CAS design, CopyOnWriteArrayList, the BlockingQueue family, and why they beat Collections.synchronizedX.
tags: concurrenthashmap, copyonwrite, blockingqueue, collections
---

The `java.util.concurrent` collections are engineered for **scalable** concurrent access. They beat the legacy `Collections.synchronizedX` wrappers, which simply guard every method with one lock.

## Why not just `Collections.synchronizedMap`?

`Collections.synchronizedMap(map)` wraps each method in `synchronized`. That gives a single, coarse-grained lock — every operation contends on it, so throughput collapses under load. Worse, **compound actions and iteration are still not safe**: you must lock manually, or risk `ConcurrentModificationException`.

```java
Map<String,Integer> m = Collections.synchronizedMap(new HashMap<>());
// Iteration needs EXTERNAL synchronization or it can throw CME:
synchronized (m) {
    for (var e : m.entrySet()) { /* ... */ }
}
// Check-then-act is still a race even though each call is atomic:
if (!m.containsKey(k)) m.put(k, v);   // two threads can both pass the check
```

## ConcurrentHashMap (Java 8+ design)

`ConcurrentHashMap` is the workhorse. The key thing to know is that the **Java 8 redesign dropped the old segment locks** (the `Segment` array of Java 7). It now uses the same bucket array as `HashMap`, with **fine-grained synchronization per bucket**:

- **Reads are lock-free.** Buckets and values are `volatile`, so `get` never blocks.
- **Inserting into an empty bucket** uses a single **CAS** (compare-and-swap) — no lock at all.
- **Inserting into a non-empty bucket** synchronizes only on **that bucket's head node**, so unrelated buckets proceed in parallel. Concurrency now scales with the number of buckets, not a fixed segment count.
- Long collision chains **treeify** into red-black trees, just like `HashMap`.

```java
ConcurrentHashMap<String,Integer> counts = new ConcurrentHashMap<>();
counts.merge(word, 1, Integer::sum);            // atomic increment
counts.computeIfAbsent(key, k -> loadExpensive(k)); // atomic, runs lambda once
counts.putIfAbsent("x", 0);
```

:::gotcha
`ConcurrentHashMap` permits **no null keys or values** (unlike `HashMap`), so `map.get(k) == null` unambiguously means "absent". Its iterators are **weakly consistent** — they never throw `ConcurrentModificationException` but may or may not reflect concurrent updates, and `size()` is an **estimate**, valid only as a snapshot. Don't build logic on an exact live `size()`.
:::

## CopyOnWriteArrayList

Every mutation copies the **entire** backing array; readers operate on an immutable snapshot with **no locking**.

```java
List<Listener> listeners = new CopyOnWriteArrayList<>();
listeners.add(l);                 // copies the whole array
for (Listener l : listeners) { }  // iterates a stable snapshot — never throws CME
```

Use it only for **read-mostly, small** collections (classically, event-listener lists). Writes are O(n) and allocate, so it is a terrible choice for write-heavy or large data.

## BlockingQueue — the producer/consumer backbone

A `BlockingQueue` blocks producers when full and consumers when empty — the foundation of work-handoff and thread pools.

```java
BlockingQueue<Task> queue = new ArrayBlockingQueue<>(1000);
queue.put(task);          // blocks if full   (producer)
Task t = queue.take();    // blocks if empty  (consumer)
queue.offer(task, 1, TimeUnit.SECONDS);  // timed variant
```

| Implementation | Capacity | Notes |
|----------------|----------|-------|
| `ArrayBlockingQueue` | bounded (fixed) | array-backed; natural back-pressure |
| `LinkedBlockingQueue` | optionally bounded | higher throughput; unbounded by default |
| `SynchronousQueue` | **zero** | direct hand-off; used by cached pools |
| `PriorityBlockingQueue` | unbounded | ordered by comparator; not FIFO |
| `DelayQueue` | unbounded | elements emerge only after a delay |
| `LinkedTransferQueue` | unbounded | `transfer()` waits for a consumer |

## Choosing a collection

| Need | Use |
|------|-----|
| Concurrent map | `ConcurrentHashMap` |
| Sorted concurrent map | `ConcurrentSkipListMap` |
| Read-mostly list / listeners | `CopyOnWriteArrayList` |
| Producer/consumer hand-off | a `BlockingQueue` |
| Non-blocking FIFO queue | `ConcurrentLinkedQueue` |
| Legacy code, low contention | `Collections.synchronizedX` |

:::senior
Reach for a dedicated concurrent collection over `synchronized` wrappers — but remember the atomicity boundary is a **single method call**. `if (!map.containsKey(k)) map.put(k,v)` is still a race even on a `ConcurrentHashMap`; use the **atomic combinators** (`putIfAbsent`, `compute`, `merge`, `computeIfAbsent`) instead. And keep the `computeIfAbsent` mapping function short and side-effect-free — it runs while holding the bin lock, so blocking inside it stalls other writers to that bucket.
:::

:::key
`Collections.synchronizedX` uses one coarse lock and still needs manual locking for iteration and check-then-act. `ConcurrentHashMap` (Java 8+) uses **lock-free reads, CAS on empty buckets, and per-bucket-head synchronization** — not segment locks — and forbids nulls; use its atomic `compute`/`merge`/`putIfAbsent` for compound updates. `CopyOnWriteArrayList` suits read-mostly lists; the `BlockingQueue` family powers producer/consumer pipelines.
:::
