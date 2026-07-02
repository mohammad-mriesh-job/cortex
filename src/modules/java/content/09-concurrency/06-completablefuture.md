---
title: CompletableFuture & Async
category: Concurrency & Multithreading
categoryOrder: 9
order: 6
level: Advanced
summary: Composable asynchronous pipelines — supplyAsync, thenApply/thenCompose/thenCombine, exception handling with exceptionally/handle, fan-out with allOf/anyOf, and choosing the right executor.
tags: completablefuture, async, futures, composition
---

A plain `Future` can only be polled or blocked on with `get()` — you cannot say "when this finishes, do that". `CompletableFuture` (Java 8) fixes this: it implements `Future` **and** `CompletionStage`, letting you build non-blocking pipelines of dependent steps.

## Starting an async computation

```java
CompletableFuture<String> cf = CompletableFuture.supplyAsync(() -> fetch(url));
CompletableFuture<Void>   r  = CompletableFuture.runAsync(() -> log());   // no result
CompletableFuture<Integer> done = CompletableFuture.completedFuture(42);  // already done
```

- `supplyAsync(Supplier)` — runs work that **returns** a value.
- `runAsync(Runnable)` — runs work that returns nothing.
- Without an explicit executor, both run on the shared **`ForkJoinPool.commonPool()`**.

## Transforming results

Each step returns a new stage, so they **chain**. The `*Async` suffix moves the continuation onto a pool instead of the completing thread.

```java
CompletableFuture.supplyAsync(() -> loadUser(id))   // CF<User>
    .thenApply(User::email)        // transform value:        User  -> String
    .thenAccept(System.out::println) // consume value:        String -> void
    .thenRun(() -> log("done"));     // run after, ignore value
```

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| `thenApply` | `T` | `U` | map the value |
| `thenAccept` | `T` | `void` | consume the value |
| `thenRun` | — | `void` | run an action, ignore value |
| `thenCompose` | `T` | `CF<U>` | **flat-map**: chain a dependent future |
| `thenCombine` | two `CF` | `U` | combine two **independent** futures |

## compose vs combine

Use **`thenCompose`** when the next step itself returns a `CompletableFuture` and **depends on** the previous result — it flattens `CF<CF<U>>` into `CF<U>` (the monadic flat-map):

```java
CompletableFuture<Order> order = getUser(id)        // CF<User>
    .thenCompose(user -> getLatestOrder(user));     // CF<Order>, not CF<CF<Order>>
```

Use **`thenCombine`** to join two futures that run **in parallel** and merge their results:

```java
CompletableFuture<Price> total = priceFut.thenCombine(taxFut,
    (price, tax) -> price.add(tax));   // both run concurrently, then merge
```

## Handling failure

Exceptions propagate down the chain (wrapped in `CompletionException`). Recover with:

```java
CompletableFuture.supplyAsync(() -> risky())
    .exceptionally(ex -> "fallback")          // recover: only runs on failure
    .handle((value, ex) ->                    // sees BOTH outcomes
        ex != null ? "error" : value)
    .whenComplete((value, ex) -> log(value, ex)); // side-effect, passes result through
```

- `exceptionally` — supplies a fallback **only** on error.
- `handle` — receives `(result, throwable)`; transforms either outcome.
- `whenComplete` — observes the outcome without altering it (the result/exception flows through).

## Fan-out: allOf / anyOf

```java
CompletableFuture<Void> all = CompletableFuture.allOf(a, b, c); // completes when ALL do
all.join();
List<String> results = Stream.of(a, b, c).map(CompletableFuture::join).toList();

CompletableFuture<Object> first = CompletableFuture.anyOf(a, b, c); // first to finish
```

`allOf` returns `CompletableFuture<Void>` — it signals completion but carries no values, so you re-read each future (now non-blocking) to collect results.

:::gotcha
`get()` throws **checked** `ExecutionException` (wrapping the real cause), while `join()` throws **unchecked** `CompletionException` — handy inside lambdas and streams. Either way the cause is wrapped one level deep, so unwrap with `ex.getCause()`. And never call a blocking `get()`/`join()` *inside* a stage running on the common pool — you can starve it.
:::

## Choosing the executor

The default `commonPool()` is sized to **`cores − 1`** and is **shared JVM-wide**. That is fine for short CPU-bound steps but dangerous for **blocking I/O**: a few blocked tasks can starve the whole pool (and everyone else using it). Pass a dedicated executor for blocking work.

```java
ExecutorService io = Executors.newFixedThreadPool(50);     // or a virtual-thread executor
CompletableFuture.supplyAsync(() -> callRemoteService(), io)
                 .thenApplyAsync(this::parse, io);
```

:::senior
Pick the `*Async` overload that takes an `Executor` for any stage that blocks, and isolate unrelated workloads onto **separate, bounded** pools so one slow dependency can't starve another. On Java 21, `Executors.newVirtualThreadPerTaskExecutor()` is an excellent backing executor for I/O-heavy `CompletableFuture` chains — blocking calls cost almost nothing.
:::

:::key
`CompletableFuture` turns futures into composable, non-blocking pipelines. Use `thenApply` to map, `thenCompose` to chain a **dependent** future (flat-map), and `thenCombine` to merge two **independent** ones. Recover with `exceptionally`/`handle`; fan out with `allOf`/`anyOf`. The default `commonPool` suits short CPU work — supply a **dedicated executor** (or a virtual-thread one) for blocking I/O so you don't starve the pool.
:::
