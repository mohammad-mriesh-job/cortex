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

:::key
Virtual threads are cheap, JVM-scheduled threads that **mount** onto a small pool of **carrier** (OS) threads and **unmount** on blocking I/O, freeing the carrier. They let plain sequential blocking code scale to millions of concurrent I/O-bound tasks — but offer nothing for CPU-bound work. Don't pool them; create one per task. Watch for **pinning** under `synchronized` (use `ReentrantLock` on Java 21) and heavy `ThreadLocal` use. Structured concurrency scopes a group of subtasks so failures and cancellation propagate cleanly.
:::
