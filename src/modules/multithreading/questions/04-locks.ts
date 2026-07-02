import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'mt-locks-intrinsic-monitor',
    question: 'What is an intrinsic lock (monitor) in Java, and what does `synchronized` do with it?',
    difficulty: 'Easy',
    category: 'Locks & Synchronization',
    tags: ['synchronized', 'monitor', 'intrinsic-lock'],
    answer: `Every Java object has a hidden **intrinsic lock**, also called its *monitor*. \`synchronized\` **acquires** that monitor when a thread enters the region and **releases** it on exit, so at most one thread can be inside a \`synchronized\` block guarded by the same object at a time.

A monitor has an **owner** (the holding thread) and an **entry set** (threads waiting to acquire it, in state \`BLOCKED\`). When the owner releases, one waiting thread acquires and proceeds.

:::key
\`synchronized\` = mutual exclusion via an object's built-in monitor. Contending threads park in state \`BLOCKED\` until the monitor is free.
:::`,
  },
  {
    id: 'mt-locks-synchronized-guarantees',
    question: 'Beyond mutual exclusion, what memory guarantee does `synchronized` provide?',
    difficulty: 'Easy',
    category: 'Locks & Synchronization',
    tags: ['synchronized', 'happens-before', 'visibility'],
    answer: `\`synchronized\` gives **two** guarantees:

1. **Mutual exclusion** — only one thread holds the monitor at a time.
2. **Visibility / happens-before** — everything a thread did *before releasing* the monitor is visible to the next thread that *acquires* it. Release-then-acquire establishes a happens-before edge.

That second point is why \`synchronized\` fixes both race conditions *and* stale-read visibility bugs, whereas \`volatile\` fixes visibility alone (no mutual exclusion, so \`count++\` is still not atomic).

:::key
Lock **acquire/release** publishes memory, not just excludes threads. A read that sees a write done under the same lock is guaranteed to see all writes that preceded that release.
:::`,
  },
  {
    id: 'mt-locks-instance-vs-static',
    question: 'Which monitor does a `synchronized` instance method lock on versus a `synchronized static` method?',
    difficulty: 'Easy',
    category: 'Locks & Synchronization',
    tags: ['synchronized', 'static', 'class-lock'],
    answer: `They lock **different** monitors:

- A \`synchronized\` **instance** method locks on **\`this\`** (the receiver). Two threads calling it on the *same* object exclude each other; on *different* instances they do not.
- A \`synchronized\` **static** method locks on the **Class object** (\`ClassName.class\`), which is shared by all instances.

Because the instance lock and the class lock are distinct, a \`synchronized\` instance method and a \`synchronized static\` method of the same class **can run at the same time**.

    synchronized void a() { ... }         // locks on this
    synchronized static void b() { ... }  // locks on ClassName.class

:::gotcha
Mixing static and instance synchronization while assuming they exclude each other is a real bug — they guard two separate monitors.
:::`,
  },
  {
    id: 'mt-locks-reentrancy',
    question: 'Are Java intrinsic locks reentrant, and why does that matter?',
    difficulty: 'Medium',
    category: 'Locks & Synchronization',
    tags: ['reentrancy', 'synchronized', 'hold-count'],
    answer: `Yes. Both \`synchronized\` and \`ReentrantLock\` are **reentrant**: a thread that already owns the monitor can acquire it again without deadlocking itself. The JVM keeps a per-thread **hold count** that increments on each re-entry and decrements on each exit; the lock frees only when the count returns to **zero**.

Why it matters: without reentrancy a \`synchronized\` method calling another \`synchronized\` method on the same object would deadlock against itself.

    synchronized void outer() { inner(); }   // already holds this...
    synchronized void inner() { ... }        // ...re-enters, count 1 -> 2

:::key
Reentrancy is per **thread**, tracked by a hold count. It enables locked methods to call other locked methods on the same object safely.
:::`,
  },
  {
    id: 'mt-locks-reentrantlock-vs-synchronized',
    question: 'When would you choose `ReentrantLock` over `synchronized`?',
    difficulty: 'Medium',
    category: 'Locks & Synchronization',
    tags: ['reentrantlock', 'synchronized', 'trylock'],
    answer: `Reach for \`ReentrantLock\` when you need capabilities the intrinsic monitor lacks:

- **\`tryLock()\`** — acquire only if free (non-blocking), key to **deadlock avoidance**.
- **Timed** acquisition — \`tryLock(2, TimeUnit.SECONDS)\` so you never block forever.
- **Interruptible** acquisition — \`lockInterruptibly()\` to abandon a wait on interrupt.
- **Fairness** — \`new ReentrantLock(true)\` grants in arrival order.
- **Multiple \`Condition\`s** — several independent wait-sets on one lock.

Otherwise prefer \`synchronized\`: it is simpler, cannot leak an unreleased lock, and is just as fast under the JIT. The cost of \`ReentrantLock\` is that **you** must \`unlock()\` in a \`finally\`.

:::key
\`ReentrantLock\` = \`synchronized\` + tryLock/timed/interruptible/fair/Conditions. Use it only when you need one of those; pay for it with a mandatory \`finally\`.
:::`,
  },
  {
    id: 'mt-locks-unlock-finally',
    question: 'Why must `ReentrantLock.unlock()` go in a `finally` block, and where does `lock()` belong?',
    difficulty: 'Medium',
    category: 'Locks & Synchronization',
    tags: ['reentrantlock', 'finally', 'liveness'],
    answer: `Unlike \`synchronized\`, the JVM does **not** auto-release a \`ReentrantLock\`. If the critical section throws or returns early and \`unlock()\` is not in \`finally\`, the lock is **never released** — every future acquirer blocks forever (a permanent lock / liveness failure).

The correct idiom puts \`lock()\` **before** the \`try\` and \`unlock()\` **in the \`finally\`**:

    lock.lock();
    try {
        // critical section
    } finally {
        lock.unlock();
    }

Do **not** put \`lock()\` inside the \`try\`: if acquisition itself threw, the \`finally\` would call \`unlock()\` on a lock you never took, raising \`IllegalMonitorStateException\` and masking the real error.

:::gotcha
A forgotten \`finally { unlock(); }\` is the signature \`ReentrantLock\` bug. This is the one failure mode \`synchronized\` cannot have.
:::`,
  },
  {
    id: 'mt-locks-trylock-deadlock',
    question: 'How does `tryLock()` help avoid deadlock when a thread needs two locks?',
    difficulty: 'Medium',
    category: 'Locks & Synchronization',
    tags: ['trylock', 'deadlock', 'reentrantlock'],
    answer: `Classic deadlock: thread A holds lock 1 and blocks forever on lock 2, while thread B holds lock 2 and blocks forever on lock 1. \`tryLock()\` breaks the "hold-and-wait" condition by refusing to block.

Instead of blocking on the second lock, **try** it; if it fails, **release what you already hold** and retry (usually after a small back-off):

    while (true) {
        lock1.lock();
        try {
            if (lock2.tryLock()) {
                try { /* both held: do work */ } finally { lock2.unlock(); }
                return;
            }
        } finally { lock1.unlock(); }
        // back off, then retry
    }

Because no thread ever blocks while holding a lock, the circular wait cannot form.

:::key
\`tryLock()\` turns "block and wait" into "try, and if it fails, back off". That removes hold-and-wait, so the deadlock cycle cannot close.
:::`,
  },
  {
    id: 'mt-locks-fairness',
    question: 'What is the trade-off between a fair and an unfair `ReentrantLock`?',
    difficulty: 'Medium',
    category: 'Locks & Synchronization',
    tags: ['fairness', 'reentrantlock', 'starvation'],
    answer: `A **fair** lock (\`new ReentrantLock(true)\`) grants acquisition in **arrival order (FIFO)**, which prevents starvation — no thread is skipped indefinitely.

An **unfair** lock (the default) allows **barging**: an arriving thread may grab a just-freed lock ahead of longer-waiting queued threads.

The trade-off is **throughput vs starvation**:

- Fairness disables barging, so nearly every handoff forces a context switch to the queued thread. Throughput can drop dramatically.
- Unfair barging reuses the running thread's warm cache and avoids context switches, so it is much faster — at the risk that some thread waits a long time.

Note: even on a fair lock, \`tryLock()\` (no timeout) **barges**; use \`tryLock(0, SECONDS)\` to honor fairness.

:::key
Default to **unfair** for throughput. Choose **fair** only when a profiler shows a thread is actually being starved.
:::`,
  },
  {
    id: 'mt-locks-read-write',
    question: 'What concurrency does a `ReadWriteLock` allow, and how can it starve writers?',
    difficulty: 'Medium',
    category: 'Locks & Synchronization',
    tags: ['readwritelock', 'writer-starvation', 'concurrency'],
    answer: `A \`ReadWriteLock\` splits one lock into a **shared read lock** and an **exclusive write lock**. The rule is **many readers XOR one writer**:

- Any number of readers may hold the read lock **simultaneously** (reads do not conflict).
- The write lock is **exclusive** — the writer holds it alone, with no readers and no other writers.

It shines when reads far outnumber writes and each read holds the lock for a non-trivial time.

**Writer starvation:** with a non-fair policy, a continuous stream of readers can keep the read lock perpetually held (new readers arrive before the last one leaves), so a waiting writer may **never** acquire the exclusive lock. A fair policy fixes this by queuing the writer, at some throughput cost.

:::gotcha
If reads are cheap and quick, a \`ReadWriteLock\` can be *slower* than a plain mutex because of its extra bookkeeping. The split only pays off when reads are both frequent and non-trivial.
:::`,
  },
  {
    id: 'mt-locks-stampedlock',
    question: 'How does a `StampedLock` optimistic read work, and what is its biggest restriction?',
    difficulty: 'Hard',
    category: 'Locks & Synchronization',
    tags: ['stampedlock', 'optimistic-read', 'reentrancy'],
    answer: `\`StampedLock.tryOptimisticRead()\` returns a **stamp** (a version number) **without taking any lock** — it does not block writers. You read the fields into locals, then call **\`validate(stamp)\`**:

- If \`validate\` returns **true**, no writer intervened; your read was consistent and you paid almost nothing.
- If it returns **false**, a writer moved, so you **fall back** to a real \`readLock()\` and re-read.

<!-- pattern -->

    long stamp = sl.tryOptimisticRead();
    int b = balance;
    if (!sl.validate(stamp)) {
        stamp = sl.readLock();
        try { b = balance; } finally { sl.unlockRead(stamp); }
    }

This gives the cheapest possible read when writes are rare.

**Biggest restriction: \`StampedLock\` is NOT reentrant.** A thread that already holds it and calls \`readLock()\`/\`writeLock()\` again **deadlocks against itself**. It also has **no \`Condition\`s**, so it is not a drop-in replacement for \`ReentrantReadWriteLock\`.

:::gotcha
Optimistic reads must copy fields to locals and only use them *after* \`validate\` passes — a field read during an in-flight write can be torn or inconsistent.
:::`,
  },
  {
    id: 'mt-locks-wait-while',
    question: 'Why must the condition around `wait()` be re-checked in a `while` loop instead of an `if`?',
    difficulty: 'Hard',
    category: 'Locks & Synchronization',
    tags: ['wait-notify', 'spurious-wakeup', 'guarded-block'],
    answer: `Because \`wait()\` can return when the predicate is **still false**, for two independent reasons:

1. **Spurious wakeups** — the JVM is explicitly allowed to return from \`wait()\` **without** any matching \`notify()\`. This is documented and real.
2. **Stolen conditions** — with multiple waiters, another thread may have consumed the item between your wakeup and your re-acquisition of the monitor, so the queue is empty again by the time you run.

An \`if\` falls straight through and acts on a false predicate (e.g. \`remove()\` on an empty queue), corrupting an invariant. A \`while\` re-checks and, if still false, waits again:

    synchronized (lock) {
        while (queue.isEmpty()) {   // WHILE, never if
            lock.wait();
        }
        return queue.remove();
    }

The same applies to \`Condition.await()\`.

:::key
Always guard \`wait()\`/\`await()\` with a **\`while\` loop** over the predicate. Never assume a wakeup means the condition is true.
:::`,
  },
  {
    id: 'mt-locks-notify-vs-notifyall',
    question: 'What is the difference between `notify()` and `notifyAll()`, and how do `Condition`s improve on both?',
    difficulty: 'Hard',
    category: 'Locks & Synchronization',
    tags: ['notify', 'notifyall', 'condition'],
    answer: `\`notify()\` wakes **one arbitrary** waiter; \`notifyAll()\` wakes **all** of them to re-check their predicates. You must **hold the object's monitor** to call either, or you get \`IllegalMonitorStateException\`.

**Prefer \`notifyAll()\`** unless you can prove all waiters block on a single condition. The hazard of \`notify()\` is a **lost wakeup**: if waiters are blocked on *different* predicates, \`notify()\` may wake the "wrong" one, which re-checks, finds its condition still false, and goes back to sleep — while the thread that *could* have proceeded is never signalled.

**\`Condition\` (on a \`ReentrantLock\`) improves on both.** One lock can mint several \`Condition\`s, so each predicate gets its **own wait-set**:

    Condition notFull  = lock.newCondition();
    Condition notEmpty = lock.newCondition();
    // producer: notEmpty.signal();   consumer: notFull.signal();

Now a single \`signal()\` targets exactly the threads that can make progress — no lost wakeups, and none of the **thundering herd** that \`notifyAll()\` causes.

:::key
\`notify()\` risks lost wakeups; \`notifyAll()\` is safe but wakes everyone. \`Condition\`s give per-predicate wait-sets, so you wake precisely the right group.
:::`,
  },
];

export default questions;
