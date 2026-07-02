---
title: Exception Best Practices
category: Exceptions & Errors
categoryOrder: 4
order: 4
level: Advanced
summary: Fail fast, catch narrowly, never swallow, log-or-rethrow (not both), know when exceptions are the wrong tool — and what they actually cost.
tags: best-practices, anti-patterns, logging, performance, optional
---

Exceptions are easy to use badly. The practices below separate code that helps you debug at 3 a.m. from code that hides the very information you need.

## Never swallow an exception

An empty `catch` block is where bugs go to hide. The program limps on in a corrupt state and you get no clue why.

```java
try {
    save(order);
} catch (IOException e) {
    // nothing here — the failure vanishes silently
}
```

At minimum, log it *with the stack trace*; better, handle it or let it propagate. If you genuinely expect and can ignore a failure, say so with a comment and log at `debug`.

## Fail fast

Validate inputs and invariants at the **top** of a method and throw immediately. A failure at the point of the bad input is far easier to diagnose than a `NullPointerException` ten frames later.

```java
void connect(String host, int port) {
    Objects.requireNonNull(host, "host");                 // NPE here, with a clear message
    if (port < 1 || port > 65535)
        throw new IllegalArgumentException("port out of range: " + port);
    // ...
}
```

## Catch specifically, not generically

Catching `Exception`, `Throwable`, or `RuntimeException` sweeps up failures you never intended to handle — including bugs you would rather see crash loudly.

| Anti-pattern | Why it hurts | Do instead |
|---|---|---|
| `catch (Exception e)` everywhere | Hides unexpected bugs | Catch the specific type you can handle |
| Empty catch block | Silent data corruption | Log, handle, or propagate |
| `catch` + log + rethrow | Duplicate traces in logs | Log **or** rethrow, not both |
| Exceptions for normal flow | Slow and unreadable | Use conditionals / `Optional` |
| Swallowing `InterruptedException` | Breaks cancellation | Restore the flag (below) |

```java
try {
    queue.take();
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();   // restore the interrupt status
    throw new CancellationException();
}
```

## Log or rethrow — not both

If you log an exception *and* rethrow it, every layer logs the same trace and your logs fill with duplicates of one failure. Decide ownership: **handle it here** (and log), **or** propagate it to a layer that will. Log once, at the boundary where the decision is final — a request handler, a job runner, a thread's uncaught-exception handler.

:::gotcha
`log.error("failed: " + e)` discards the stack trace — string concatenation keeps only `e.toString()`. Pass the exception as the **last argument** instead: `log.error("failed", e)`. This is one of the most common logging bugs in real codebases.
:::

## Exceptions are not control flow

Using exceptions to implement ordinary logic — throwing to break a loop, or catching `NumberFormatException` to test whether a string is a number — is an anti-pattern on two counts: it is slow, and it obscures intent.

```java
// Anti-pattern: an exception drives the happy path
try {
    return Integer.parseInt(s);
} catch (NumberFormatException e) {
    return 0;
}
```

For *expected* "absence" or "not found", prefer a return value that models it: an `Optional<T>`, a sentinel, or a dedicated result type. Reserve exceptions for the genuinely exceptional.

```java
Optional<User> findUser(String id);   // absence is normal — no exception needed
```

## What exceptions actually cost

Throwing is not free. The expense is dominated by **stack-trace capture**: the `Throwable` constructor calls `fillInStackTrace()`, a native walk of the entire call stack. The `throw` / `catch` jump itself is cheap; building the trace is what hurts in a hot loop.

:::senior
For the rare case of an exception used as a fast control-flow signal (e.g. a parser's internal short-circuit), you can suppress the costly trace. Use the protected four-arg constructor `Throwable(message, cause, enableSuppression, writableStackTrace)` with `writableStackTrace = false`, or override `fillInStackTrace()` to return `this`, and reuse a singleton instance.

```java
class Signal extends RuntimeException {
    Signal() { super(null, null, false, false); } // no stack trace captured
}
```

A stackless exception throws in nanoseconds — but you lose all debugging context, so use it only for deliberate signals, never for real errors.
:::

:::key
Fail fast, catch the narrowest type you can handle, and never swallow. Log **or** rethrow — and always pass the exception object, not its `toString()`. Model expected absence with `Optional` / result types rather than exceptions, and remember the real cost of throwing is the stack-trace capture.
:::
