import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'mt-lockfree-cas-basics',
    question: 'What is compare-and-swap (CAS), and why does it enable lock-free code?',
    difficulty: 'Easy',
    category: 'Lock-Free & the Memory Model',
    tags: ['cas', 'atomics', 'lock-free'],
    answer: `**Compare-and-swap** is an atomic read-modify-write primitive. \`compareAndSet(expected, next)\` sets the location to \`next\` **only if** it currently holds \`expected\` — atomically — and reports whether it swapped.

It enables **optimistic** concurrency with no lock: read the current value, compute an update off that snapshot, and publish it *only if nothing changed underneath you*; otherwise retry.

\`\`\`java
int prev, next;
do {
  prev = value;            // read
  next = prev + 1;         // compute
} while (!compareAndSet(prev, next));  // publish only if unchanged
\`\`\`

It is one CPU instruction (\`LOCK CMPXCHG\` on x86, LL/SC on ARM/POWER) and is the foundation of every \`Atomic*\` class.`,
  },
  {
    id: 'mt-lockfree-fence-basics',
    question: 'What is a memory fence (barrier) and why is one ever needed?',
    difficulty: 'Easy',
    category: 'Lock-Free & the Memory Model',
    tags: ['memory-fence', 'reordering', 'visibility'],
    answer: `A **memory fence** is an instruction that constrains how memory operations may be **reordered** across it (and forces pending writes to become visible). Compilers, the JIT, and CPUs reorder loads/stores for speed — invisible within one thread, but **visible across threads**. A fence installs an ordering point so another thread cannot observe your writes out of order.

The four kinds: **StoreStore, LoadLoad, LoadStore, StoreLoad** (the last is the expensive one on x86).

In Java you rarely emit fences by hand — \`volatile\`, \`synchronized\`, and \`final\` insert the right ones for you.

:::key
A fence trades a little speed for a guaranteed ordering/visibility point between threads.
:::`,
  },
  {
    id: 'mt-lockfree-aba',
    question: 'Explain the ABA problem in lock-free programming.',
    difficulty: 'Medium',
    category: 'Lock-Free & the Memory Model',
    tags: ['aba', 'cas', 'lock-free'],
    answer: `A thread reads a value **A** and is paused. Another thread changes it **A → B → A**. When the first thread runs \`compareAndSet(A, ...)\`, it sees \`A\` and **succeeds** — even though the state changed twice underneath it. CAS compares the **value**, never the **history**.

For a plain counter this is usually harmless (\`5\` is \`5\`). It turns dangerous when the value is a **pointer**: a node that was freed and had its address reused looks identical, so the CAS relinks recycled memory.

:::gotcha
The bug is **silent** — no exception, and the line \`compareAndSet(A, C)\` looks correct in isolation. The defect lives in the timeline.
:::

Fix it with a **version stamp** (\`AtomicStampedReference\`) so every change is detectable.`,
  },
  {
    id: 'mt-lockfree-stamped-ref',
    question: 'How does AtomicStampedReference solve the ABA problem?',
    difficulty: 'Medium',
    category: 'Lock-Free & the Memory Model',
    tags: ['aba', 'atomicstampedreference', 'cas'],
    answer: `It pairs the reference with an integer **stamp**, and the CAS must match **both** the value and the stamp. Every successful update bumps the stamp, so an A → B → A round trip leaves a *different* stamp and the CAS correctly fails.

\`\`\`java
AtomicStampedReference<Node> ref = new AtomicStampedReference<>(a, 0);
int[] hold = new int[1];
Node cur = ref.get(hold);           // value + current stamp
int stamp = hold[0];
// A -> B -> A bumps the stamp: 0 -> 1 -> 2
ref.compareAndSet(cur, next, stamp, stamp + 1);  // stamp 0 != 2 -> FAILS
\`\`\`

\`AtomicMarkableReference\` is the one-bit "touched" variant. In C/C++, a double-width CAS (x86 \`CMPXCHG16B\`) stamps a 128-bit \`(pointer, counter)\` in one instruction with no boxing.`,
  },
  {
    id: 'mt-lockfree-vs-wait-free',
    question: 'What is the difference between lock-free and wait-free (and obstruction-free)?',
    difficulty: 'Medium',
    category: 'Lock-Free & the Memory Model',
    tags: ['lock-free', 'wait-free', 'progress-guarantees'],
    answer: `They are a hierarchy of **non-blocking progress guarantees**, weakest to strongest:

- **Obstruction-free** — a thread finishes in bounded steps *if it runs alone*; under contention threads can livelock.
- **Lock-free** — **system-wide** progress: at every moment *some* thread completes in bounded steps. An individual thread may retry forever (**starve**), but the whole system never stalls.
- **Wait-free** — **per-thread** progress: *every* thread finishes in bounded steps, no starvation ever. Strongest and hardest, often needing a "helping" protocol.

The line interviewers want: **lock-free guarantees the *system* advances; wait-free guarantees *each thread* advances.** A Treiber-stack CAS loop is lock-free; \`getAndIncrement\` lowered to \`LOCK XADD\` on x86 is wait-free at the instruction level.`,
  },
  {
    id: 'mt-lockfree-treiber',
    question: 'How does a Treiber stack push work without any locks?',
    difficulty: 'Medium',
    category: 'Lock-Free & the Memory Model',
    tags: ['treiber-stack', 'cas', 'lock-free'],
    answer: `Its entire concurrency control is one CAS on the \`head\` pointer:

\`\`\`java
void push(T item) {
  Node<T> node = new Node<>(item);
  Node<T> old;
  do {
    old = head.get();                 // read current head
    node.next = old;                  // link new node above it
  } while (!head.compareAndSet(old, node));  // swing head; retry if it moved
}
\`\`\`

If two threads race, one CAS wins and the loser's \`compareAndSet\` **fails** — that failure is the *coordination signal*, meaning "head moved, your snapshot is stale." The loser re-reads \`head\` and retries; nothing is corrupted or lost. This is **lock-free**: no thread ever blocks on another.

:::gotcha
\`pop\` is symmetric but is where the **ABA / memory-reclamation** trap bites — a popped-and-freed node whose address is reused.
:::`,
  },
  {
    id: 'mt-lockfree-happens-before',
    question: 'What is the happens-before relationship, and what are its key edges?',
    difficulty: 'Medium',
    category: 'Lock-Free & the Memory Model',
    tags: ['happens-before', 'memory-model', 'visibility'],
    answer: `**Happens-before** is the Java Memory Model's ordering contract: *if X happens-before Y, then all of X's memory writes are visible to and ordered before Y.* No happens-before edge between two threads means **no guarantee** about what one sees of the other.

The edges to know:

- **Program order** — within a thread, each action before the next.
- **Monitor** — unlock happens-before a later lock of the *same* monitor.
- **Volatile** — a volatile write happens-before every later read of that field.
- **Thread lifecycle** — \`Thread.start()\` before the thread's actions; the thread's actions before another thread's return from \`join()\`.
- **Final fields** — end of constructor before a read of a \`final\` field of a properly-constructed object.

It is **transitive**, which is how a volatile flag can publish everything written before it.`,
  },
  {
    id: 'mt-lockfree-false-sharing',
    question: 'What is false sharing, and how do you fix it?',
    difficulty: 'Medium',
    category: 'Lock-Free & the Memory Model',
    tags: ['false-sharing', 'cache-line', 'performance'],
    answer: `**False sharing** is when two **independent** variables land in the same **64-byte cache line**. Caches move whole lines, so when core 0 writes one variable, MESI marks the line **Invalid** in core 1's cache — even though core 1 only cares about the *other* variable. The line **ping-pongs** across cores on every write and throughput collapses, with **no correctness symptom**.

Tell-tale sign: a parallel program that scales *negatively* as you add threads.

**Fixes** — put hot, independently-written fields on separate lines:

- **Manual padding** (pad a \`long\` with 7 dummy longs to fill 64 bytes).
- **\`@Contended\`** (\`jdk.internal.vm.annotation.Contended\`) — the JVM pads for you; needs \`-XX:-RestrictContended\` outside the JDK.
- **\`LongAdder\`** — stripes increments across multiple already-padded \`Cell\`s, sidestepping the problem.

Detect with \`perf c2c\` (HITM-heavy lines).`,
  },
  {
    id: 'mt-lockfree-publication',
    question: 'Why can publishing an object through a plain field be unsafe, and how do volatile and final fix it?',
    difficulty: 'Hard',
    category: 'Lock-Free & the Memory Model',
    tags: ['safe-publication', 'reordering', 'volatile', 'final', 'double-checked-locking'],
    answer: `The store that publishes the reference can be **reordered** with the writes that initialize the object. Another thread can then see a **non-null reference to a partially constructed object** — reading default/stale fields. This is exactly why *broken* double-checked locking fails:

\`\`\`java
if (instance == null) {
  synchronized (lock) {
    if (instance == null)
      instance = new Singleton();  // construct then publish CAN reorder
  }
}
return instance;                   // another thread may see a half-built Singleton
\`\`\`

**Fixes:**

- **\`volatile\`** on the field creates a **release/acquire** edge: the constructor's writes happen-before the publish, and a reader that sees the reference sees the finished object. (This is what makes DCL correct.)
- **\`final\`** fields get a **freeze** at the end of the constructor: any thread that sees the reference is guaranteed to see the initialized finals — so **immutable objects are safe to publish** even without \`volatile\`, provided \`this\` does not escape during construction.`,
  },
  {
    id: 'mt-lockfree-reclamation',
    question: 'Why is lock-free memory reclamation (and ABA) much harder in C++ than in Java?',
    difficulty: 'Hard',
    category: 'Lock-Free & the Memory Model',
    tags: ['memory-reclamation', 'aba', 'hazard-pointers', 'gc'],
    answer: `In a manually-managed language, popping a node and \`free\`-ing it lets the allocator **recycle its address** for a new node. A thread that was paused mid-operation still holds the old pointer, so its \`compareAndSet\` on that address can **succeed against reused memory** — ABA compounded with a **use-after-free**. You cannot safely free a node while another thread might still be about to touch it.

C/C++ solutions defer freeing until it is provably safe: **hazard pointers**, **epoch-based reclamation (EBR)**, **RCU**, or **tagged pointers** via double-width CAS.

**Garbage-collected languages largely dodge the pointer form:** the GC will not reclaim a node while *any* thread — even one paused mid-CAS — still references it, so a freed-and-reused address can never reappear. **The GC is the reclamation scheme.**

:::gotcha
GC removes *pointer* ABA, not *logical* ABA — a value that legitimately returns to A still needs \`AtomicStampedReference\`.
:::`,
  },
  {
    id: 'mt-lockfree-when-not',
    question: 'When is a lock-free data structure the wrong choice?',
    difficulty: 'Hard',
    category: 'Lock-Free & the Memory Model',
    tags: ['lock-free', 'trade-offs', 'contention'],
    answer: `Lock-free is **not a free lunch** — reach for it deliberately, not by default.

**Prefer a lock (or a ready-made concurrent collection) when:**

- **Contention is low.** A CAS loop burns CPU retrying; an uncontended lock is often faster *and* far simpler.
- **Correctness risk is high.** Lock-free code must reason about the memory model, reclamation, and ABA — very easy to get subtly wrong. Wait-free is harder still.
- **You do not need the guarantees.** If blocking is acceptable, the extra complexity buys nothing.

**Choose lock-free when:**

- **High contention** makes lock convoying/blocking the bottleneck.
- **You cannot block:** no priority inversion, real-time / async-signal safety, or resilience to a thread being paused (by the scheduler or a GC pause) while holding shared state.
- **You need a progress guarantee** the system keeps advancing regardless of any one thread.

:::key
Default to a well-chosen lock or \`java.util.concurrent\`; go lock-free only when contention or non-blocking requirements justify the complexity.
:::`,
  },
];

export default questions;
