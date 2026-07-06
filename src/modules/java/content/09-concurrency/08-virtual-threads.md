---
title: Virtual Threads (Project Loom)
category: Concurrency & Multithreading
categoryOrder: 9
order: 8
level: Expert
summary: Java 21's lightweight threads — platform vs virtual, carrier threads, why they transform IO-bound concurrency, the pinning and thread-local pitfalls, and structured concurrency.
tags: virtual-threads, loom, carrier-threads, structured-concurrency, pinning
---

**Virtual threads** (JEP 444, final in **Java 21**) are lightweight threads managed by the JVM rather than the OS. They make the simple, readable **thread-per-request** style scale to millions of concurrent tasks — without the cost that has always made platform threads scarce.

## Platform vs virtual threads

A **platform thread** is a thin wrapper over an OS thread: it has a large fixed stack (~1 MB), is expensive to create, and is limited to a few thousand per machine. A **virtual thread** stores its stack on the heap and is scheduled by the JVM. Creating one is cheap enough to make **millions** at once.

| | Platform thread | Virtual thread |
|---|---|---|
| Backed by | one OS thread | scheduled onto a carrier |
| Cost to create | high (~1 MB stack) | tiny (heap-resident) |
| Practical count | thousands | millions |
| Best for | CPU-bound work | I/O-bound, high concurrency |
| Pooling | yes (reuse) | **no** — create per task |

```java
Thread.startVirtualThread(() -> handle(request));        // one-off
Thread.ofVirtual().name("vt-", 0).start(task);            // builder

try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (var req : requests) executor.submit(() -> handle(req)); // millions, fine
}   // close() waits for all tasks (try-with-resources)
```

## Carrier threads — mount and unmount

Virtual threads run on a small pool of **carrier threads** (platform threads in a `ForkJoinPool`, by default sized to the CPU count). When a virtual thread executes, it is **mounted** onto a carrier. The magic: when it hits a **blocking** operation (socket read, `sleep`, lock wait), the JVM **unmounts** it — saving its stack to the heap — and frees the carrier to run another virtual thread. When the I/O completes, the virtual thread is remounted (on any free carrier) and continues.

```mermaid
flowchart LR
    VT["Virtual thread"] -->|mount| C["Carrier (OS) thread"]
    C -->|blocks on I/O| U["Unmount: stack parked on heap"]
    U -->|"I/O ready"| C2["Remount on a free carrier"]
```

So a few carriers serve a vast number of virtual threads, because blocked ones consume **no** OS thread.

## Why they shine for I/O

Blocking code reads top-to-bottom — no callbacks, no reactive operators — yet scales like async code. You write straightforward sequential logic, and the runtime turns each blocking call into a cheap unmount:

```java
// Looks blocking, scales like async — perfect for virtual threads
String user   = userClient.get(id);     // unmounts during the network wait
String orders = orderClient.get(user);  // carrier was free meanwhile
return render(user, orders);
```

For **CPU-bound** work they offer no benefit — you cannot exceed the core count, so a small fixed platform pool is still the right tool.

## Pitfalls

:::gotcha
**Pinning.** If a virtual thread blocks **inside a `synchronized` block/method** (or a native/foreign call) in Java 21, it cannot unmount — it *pins* its carrier, and under load all carriers can be pinned, throttling the whole application. The fix on Java 21 is to replace `synchronized` with a `ReentrantLock` around blocking sections. (JEP 491 in **JDK 24** largely eliminated `synchronized` pinning, but on Java 21 LTS it remains a real concern — profile with `-Djdk.tracePinnedThreads=full`.)
:::

- **Thread-local cost.** With millions of virtual threads, per-thread `ThreadLocal` values can explode memory. Avoid heavy thread-locals; prefer **scoped values** (`ScopedValue`, standard since JDK 25) for immutable per-task context.
- **Don't pool them.** Virtual threads *are* the cheap resource — pooling defeats the purpose. To **limit concurrency** (e.g. cap calls to a fragile downstream service), use a `Semaphore`, not a bounded thread pool.

## Structured concurrency

Structured concurrency (a preview API, still evolving) treats a group of related subtasks as a single unit of work, so their lifetimes are bounded by a scope — if one fails, the rest are cancelled; the parent waits for all.

```java
// Preview API; JDK 21 shape shown — by JDK 25 it is StructuredTaskScope.open(...) with joiners
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Supplier<User>  u = scope.fork(() -> findUser(id));
    Supplier<Order> o = scope.fork(() -> findOrder(id));
    scope.join();              // wait for both
    scope.throwIfFailed();     // propagate the first failure
    return new Response(u.get(), o.get());
}   // both subtasks guaranteed complete or cancelled here
```

This eliminates leaked tasks and orphaned cancellations — the concurrent equivalent of a `try`-with-resources block.

:::senior
Virtual threads change the default architecture for server-side I/O: the old defence of "share a precious thread pool" becomes unnecessary, so frameworks move to thread-per-request again. But they are **not** a parallelism speedup for CPU work and **not** a way to throttle load — keep CPU pools for computation and a `Semaphore` for rate-limiting. Audit hot paths for `synchronized` around I/O on Java 21, and keep per-request state in `ScopedValue` rather than `ThreadLocal`.
:::

## Check yourself

```quiz
title: 'Virtual threads'
questions:
  - q: 'On Java 21, a virtual thread performs a JDBC call inside a `synchronized` method. What can happen under load?'
    options:
      - 'Nothing special — blocking always unmounts a virtual thread.'
      - text: '**Pinning**: the virtual thread cannot unmount inside `synchronized`, so it holds its carrier for the whole blocking call; enough pinned threads stall the entire application.'
        correct: true
      - 'The JVM throws `PinnedThreadException`.'
      - 'The call is transparently made asynchronous.'
    explain: 'On Java 21, blocking inside a monitor (or a native frame) pins the carrier. Replace `synchronized` around blocking I/O with `ReentrantLock`, and diagnose with `-Djdk.tracePinnedThreads=full`. JEP 491 (JDK 24) removed most `synchronized` pinning.'
  - q: 'You want at most 10 concurrent calls to a fragile downstream API from code running on virtual threads. What is the idiomatic limit?'
    options:
      - 'A fixed pool of 10 virtual threads.'
      - text: 'A `Semaphore(10)` around the call — virtual threads are not pooled; concurrency is limited with synchronizers, not thread counts.'
        correct: true
      - 'A `ThreadPoolExecutor` with max=10 platform threads.'
      - '`Thread.sleep` based rate limiting.'
    explain: 'Pooling virtual threads defeats their purpose (they are the cheap resource, created per task). To cap concurrent access to a resource, acquire a semaphore permit around the call — millions of virtual threads can wait on it cheaply.'
  - q: 'Which workload gains essentially nothing from virtual threads?'
    options:
      - 'A server handling 50,000 concurrent HTTP requests that each wait on a database.'
      - text: 'A CPU-bound matrix multiplication using all 16 cores.'
        correct: true
      - 'A crawler blocked on thousands of slow sockets.'
      - 'A chat server holding one blocked read per connection.'
    explain: 'Virtual threads multiply how many threads can *wait* cheaply — they do not add CPU. Compute-bound work is still limited by core count, where a small platform-thread pool (like ForkJoinPool) is the right tool.'
  - q: 'What happens when a virtual thread blocks on a socket read?'
    options:
      - 'Its carrier OS thread blocks with it until the read completes.'
      - text: 'The JVM **unmounts** it — its stack moves to the heap, the carrier is freed to run other virtual threads, and it is remounted (possibly on a different carrier) when the I/O completes.'
        correct: true
      - 'The read is rejected — virtual threads cannot do blocking I/O.'
      - 'A new carrier thread is spawned for each blocked virtual thread.'
    explain: 'This mount/unmount dance is the whole trick: blocked virtual threads consume no OS thread, so a handful of carriers (about one per core) can serve millions of mostly-waiting tasks.'
```

:::key
Virtual threads are cheap, JVM-scheduled threads that **mount** onto a small pool of **carrier** (OS) threads and **unmount** on blocking I/O, freeing the carrier. They let plain sequential blocking code scale to millions of concurrent I/O-bound tasks — but offer nothing for CPU-bound work. Don't pool them; create one per task. Watch for **pinning** under `synchronized` (use `ReentrantLock` on Java 21) and heavy `ThreadLocal` use. Structured concurrency scopes a group of subtasks so failures and cancellation propagate cleanly.
:::
