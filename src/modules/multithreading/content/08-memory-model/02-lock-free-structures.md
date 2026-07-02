---
title: Lock-Free Data Structures
category: Lock-Free & the Memory Model
categoryOrder: 8
order: 2
level: Expert
summary: Build a concurrent stack with no locks at all — just a CAS loop on the head pointer. Watch two threads race a Treiber stack push, then learn lock-free vs wait-free and the memory-reclamation trap.
tags: lock-free, treiber-stack, cas, wait-free, non-blocking, memory-reclamation, hazard-pointers
---

A **lock-free** data structure lets many threads mutate it concurrently with **no mutual exclusion** —
no `synchronized`, no `lock()`, no blocking. Progress is guaranteed by a **CAS retry loop**: attempt an
atomic swap, and if another thread got there first, re-read and try again. The canonical example is the
**Treiber stack**, a thread-safe stack whose entire concurrency control is one CAS on the `head` pointer.

## The Treiber stack push

Push builds a node, points it at the current head, and swings `head` to it with a single CAS. If the
CAS fails, `head` moved — so re-read and retry. That is the whole algorithm:

```java
void push(T item) {
  Node<T> node = new Node<>(item);
  Node<T> old;
  do {
    old = head.get();                 // read the current head
    node.next = old;                  // link the new node above it
  } while (!head.compareAndSet(old, node));  // swing head; retry if it moved
}
```

Now race two threads pushing at the same time — one CAS wins, the loser retries, and *both* pushes land:

```walkthrough
title: Treiber stack push — two threads race on head
code: |
  Node old;
  do {
    old = head.get();                 // read current head
    node.next = old;                  // link new node above it
  } while (!head.compareAndSet(old, node));  // swing head, retry if moved
steps:
  - text: 'Stack holds one node **A**; `head` points at it. **T1** wants to push **N1**, **T2** wants to push **N2**.'
    array: ['A']
    pointers: { 0: 'head' }
    line: 1
  - text: '**T1 reads** `head` into its `old = A`. **T2 reads** `head` too — its `old = A` as well. Both captured the *same* head.'
    array: ['A']
    highlight: [0]
    pointers: { 0: 'head, both read A' }
    line: 3
  - text: '**T1 links** `N1.next = A`, then **CAS(head, A, N1)**. Head is still A, so it **succeeds** — `head` now points at N1.'
    array: ['N1', 'A']
    highlight: [0]
    pointers: { 0: 'head' }
    line: 5
  - text: '**T2 links** `N2.next = A` off its *stale* `old`, then **CAS(head, A, N2)**. But head is **N1** now, not A — CAS **fails**. No corruption; T2 just loops.'
    array: ['N1', 'A']
    highlight: [1]
    pointers: { 0: 'head is N1, not A' }
    line: 5
  - text: '**T2 retries:** re-reads `head` so `old = N1`, and links `N2.next = N1`.'
    array: ['N1', 'A']
    highlight: [0]
    pointers: { 0: 'head, T2 re-reads' }
    line: 3
  - text: '**T2 CAS(head, N1, N2)** — head is N1, matches — **succeeds**. `head` now points at N2.'
    array: ['N2', 'N1', 'A']
    highlight: [0]
    pointers: { 0: 'head' }
    line: 5
  - text: 'Both pushes landed — stack is **N2 → N1 → A** — with **zero locks**. The loser simply retried. That is **lock-free**: the system always makes progress.'
    array: ['N2', 'N1', 'A']
    sorted: [0, 1, 2]
    pointers: { 0: 'head' }
```

Notice what a failed CAS bought us: it is not an error, it is the *coordination*. The failure tells T2
"someone moved head, your snapshot is stale," and the loop repairs it. No thread ever waits on another.

## Lock-free vs wait-free

"Non-blocking" is a hierarchy of progress guarantees, from weakest to strongest:

````tabs
tabs:
  - label: Obstruction-free
    body: |
      A thread completes in bounded steps **if it runs alone** (no contention). Under contention,
      threads can livelock — each keeps aborting the others. The weakest useful guarantee.
  - label: Lock-free
    body: |
      **System-wide** progress: at every moment *some* thread completes its operation in a bounded
      number of steps. An individual thread can retry indefinitely (starve), but the whole system
      never stalls. The Treiber stack and most CAS loops are lock-free.
      ```java
      while (!head.compareAndSet(old, node)) { old = head.get(); node.next = old; }
      // this thread may loop, but every failure means ANOTHER thread succeeded
      ```
  - label: Wait-free
    body: |
      **Per-thread** progress: *every* thread finishes in a bounded number of steps — no starvation,
      ever. The strongest and hardest to build, often needing a "helping" protocol.
      ```java
      // AtomicInteger.getAndIncrement() the JIT may lower to a single LOCK XADD on x86,
      // which is wait-free at the instruction level: no retry loop, bounded for all.
      counter.getAndIncrement();
      ```
````

The key distinction interviewers probe: **lock-free guarantees the *system* advances; wait-free
guarantees *each thread* advances.** A lock-free algorithm can still starve one unlucky thread forever
while others race ahead.

:::gotcha
Lock-free is **not automatically faster**. Under *low* contention a plain lock often wins — CAS loops
burn CPU spinning and retrying. Lock-free earns its keep under *high* contention and where you cannot
tolerate blocking: no deadlock, no priority inversion, and safety when a holder could be paused inside
a signal handler or by the GC.
:::

:::senior
The hardest part of a real lock-free structure is not the CAS — it is **memory reclamation**. In the
Treiber `pop`, one thread reads `head = A` and is about to CAS when another pops and *frees* A. If the
allocator recycles A's address for a new node, the first thread's CAS on "A" now succeeds against
reused memory — that is ABA plus a use-after-free. C/C++ solves this with **hazard pointers**,
**epoch-based reclamation**, or **RCU** to defer freeing.

**Garbage-collected languages sidestep the pointer form of ABA:** the GC will not reclaim node A while
any thread (even one paused mid-CAS) still holds a reference to it, so a freed-and-reused address can
never reappear. GC *is* your reclamation scheme. Logical ABA (a value that legitimately returns) can
still bite — use `AtomicStampedReference` there.
:::

## Check yourself

```quiz
title: Lock-free structures check
questions:
  - q: 'What does *lock-free* guarantee?'
    options:
      - text: 'System-wide progress — at every step at least one thread completes in bounded time'
        correct: true
      - 'Every thread completes in a bounded number of steps'
      - 'No thread ever has to retry'
    explain: 'Lock-free guarantees the system as a whole advances. The stronger per-thread, no-starvation guarantee is wait-free.'
  - q: 'In the Treiber stack, what happens when a thread''s `compareAndSet` on head fails?'
    options:
      - text: 'Another thread moved head first, so the loser re-reads head and retries — no corruption'
        correct: true
      - 'The push is silently lost'
      - 'The stack must be locked and rebuilt from scratch'
    explain: 'A failed CAS is the coordination signal: the snapshot is stale, so the loop re-reads the head and retries. Nothing is corrupted or lost.'
  - q: 'Why is the classic pointer ABA rarely an issue in Java but dangerous in C++?'
    options:
      - text: 'Java''s GC will not recycle a node still referenced by a paused thread, so freed-and-reused addresses never reappear; C++ frees and reuses memory manually'
        correct: true
      - 'Java disables CAS on multi-core machines'
      - 'C++ has no atomic compare-and-swap'
    explain: 'GC is the memory-reclamation scheme, so a live-referenced node cannot be freed and its address reused. C++ needs hazard pointers or epochs to get the same safety.'
```

:::key
A **lock-free** structure coordinates with a **CAS retry loop**, not mutual exclusion — the
**Treiber stack** pushes by CASing `head`, and a failed CAS just means "retry with a fresh read."
**Lock-free** guarantees the *system* progresses; **wait-free** guarantees *every thread* progresses.
The real difficulty is **memory reclamation** (hazard pointers / epochs in C++), which a **GC largely
solves for you** — though logical ABA still needs a stamp.
:::
