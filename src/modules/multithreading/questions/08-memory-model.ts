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
  {
    id: 'mt-lockfree-jmm-why',
    question: 'Why does Java need a memory model at all?',
    difficulty: 'Easy',
    category: 'Lock-Free & the Memory Model',
    tags: ['memory-model', 'happens-before', 'reordering'],
    answer: `Without a memory model, multithreaded behavior would be **undefined**. Compilers, the JIT, and CPUs freely **reorder and cache** memory operations for speed — and forbidding all of that by demanding full **sequential consistency** (every thread observing one global order of *all* memory ops) would be far too slow.

The **Java Memory Model** defines the *minimal* rules — expressed as **happens-before** — that let you reason about **visibility** and **ordering** while still permitting those optimizations. It is a **contract** among three parties:

- the **programmer**, who inserts synchronization to establish happens-before;
- the **JVM/JIT**, free to reorder anything the model does not forbid;
- the **hardware**, whose fences the JVM emits to honor the contract.

:::key
The JMM is the *smallest* set of guarantees strong enough to reason about, yet weak enough to stay fast.
:::`,
  },
  {
    id: 'mt-lockfree-volatile-mm',
    question: 'In memory-model terms, what does volatile do?',
    difficulty: 'Easy',
    category: 'Lock-Free & the Memory Model',
    tags: ['volatile', 'happens-before', 'visibility'],
    answer: `A volatile **write** is a **store-release**; a volatile **read** is a **load-acquire**. The JMM inserts the fences so that:

1. **Visibility** — a read always observes the *latest* write, never a cached copy.
2. **Ordering** — ordinary accesses cannot be reordered across the volatile access.
3. **Happens-before** — everything a thread wrote *before* a volatile store is visible to a thread that later *reads* that same volatile.

\`\`\`java
volatile boolean ready;
data = 42;      // (1) ordinary write
ready = true;   // (2) volatile store-release publishes (1)
\`\`\`

:::gotcha
\`volatile\` does **not** make a compound read-modify-write atomic — \`v++\` is still read-then-write, so two threads can lose an update. Use \`AtomicInteger\` for that.
:::`,
  },
  {
    id: 'mt-lockfree-atomic-classes',
    question: 'Give an overview of the java.util.concurrent.atomic classes.',
    difficulty: 'Easy',
    category: 'Lock-Free & the Memory Model',
    tags: ['atomics', 'cas', 'concurrency-utilities'],
    answer: `All are **lock-free**, built on **CAS**, and fall into four families:

| Family | Examples | Use |
| --- | --- | --- |
| Single value | \`AtomicInteger\`, \`AtomicLong\`, \`AtomicBoolean\`, \`AtomicReference\` | atomic RMW: \`incrementAndGet\`, \`compareAndSet\`, \`getAndSet\`, \`updateAndGet\` |
| Array element | \`AtomicIntegerArray\`, \`AtomicLongArray\`, \`AtomicReferenceArray\` | per-element atomics on one backing array |
| Field updater | \`AtomicReferenceFieldUpdater\`, \`AtomicIntegerFieldUpdater\` | CAS a \`volatile\` field without wrapping each instance |
| High contention | \`LongAdder\`, \`LongAccumulator\`, \`DoubleAdder\` | striped counters for hot write paths |

:::key
Use an atomic when the invariant is a **single variable's** read-modify-write; reach for a **lock** the moment the invariant spans **multiple** variables.
:::`,
  },
  {
    id: 'mt-lockfree-longadder-striping',
    question: 'How does LongAdder outperform AtomicLong under contention?',
    difficulty: 'Hard',
    category: 'Lock-Free & the Memory Model',
    tags: ['longadder', 'atomiclong', 'false-sharing', 'striping'],
    answer: `\`AtomicLong\` has **one hot field**: every increment CASes the *same* cache line. Under contention the CAS retries pile up and the line **ping-pongs** between cores — throughput collapses.

\`LongAdder\` spreads the count across an **array of \`Cell\`s** (roughly one per contending thread, each padded to its own cache line). An increment CASes only *its* thread's cell, so threads rarely collide; \`sum()\` adds the cells.

| | \`AtomicLong\` | \`LongAdder\` |
| --- | --- | --- |
| Write under contention | slow (one line) | fast (striped) |
| Read cost | exact, O(1) | O(cells) |
| \`sum()\` consistency | exact | weakly consistent — may miss concurrent updates |

:::senior
Prefer \`LongAdder\` for **write-heavy metrics/counters**; keep \`AtomicLong\` when you need an **exact value read as often as it is written**, or a genuine CAS on the count.
:::`,
  },
  {
    id: 'mt-lockfree-cas-contention',
    question: 'What is the cost of CAS under high contention?',
    difficulty: 'Hard',
    category: 'Lock-Free & the Memory Model',
    tags: ['cas', 'contention', 'performance', 'backoff'],
    answer: `A CAS loop is **optimistic**: read, compute, \`compareAndSet\`, retry on failure. Under **high contention** many threads read the same value, all but one \`compareAndSet\` **fails**, and the losers redo the work — while the shared cache line **ping-pongs** between cores. Throughput can end up **worse than a good blocking lock**, which at least parks the losers instead of spinning them.

Mitigations, roughly in order:

1. **Exponential backoff** on repeated CAS failure — stop hammering the line.
2. **Striping** — split the hot variable across cells (\`LongAdder\`).
3. **Reduce shared writes** — batch, or accumulate thread-locally then merge.
4. **Just use a lock** — sometimes simplest *and* fastest.

:::gotcha
"Lock-free" is **not free**. It guarantees *progress*, not *speed* — always **measure** before assuming CAS beats a lock.
:::`,
  },
  {
    id: 'mt-lockfree-varhandle',
    question: 'What is a VarHandle and why was it introduced?',
    difficulty: 'Hard',
    category: 'Lock-Free & the Memory Model',
    tags: ['varhandle', 'access-modes', 'unsafe'],
    answer: `A **\`VarHandle\`** (Java 9, JEP 193) is a typed, safe reference to a *variable* — a field or array element — that replaces the unsupported \`sun.misc.Unsafe\`. It exposes fine-grained memory-ordering **access modes** plus atomic ops (\`compareAndSet\`, \`getAndAdd\`, \`weakCompareAndSet\`).

The access modes, weakest to strongest:

| Mode | Methods | Ordering |
| --- | --- | --- |
| Plain | \`get\`/\`set\` | none |
| Opaque | \`getOpaque\`/\`setOpaque\` | per-variable coherence only |
| Release/Acquire | \`setRelease\`/\`getAcquire\` | one-directional edge |
| Volatile | \`getVolatile\`/\`setVolatile\` | full sequential consistency |

This lets experts pick the **weakest ordering that is still correct** (e.g. release/acquire instead of full volatile) for maximum performance.

\`\`\`java
static final VarHandle NEXT = MethodHandles.lookup()
    .findVarHandle(Node.class, "next", Node.class);
\`\`\``,
  },
  {
    id: 'mt-lockfree-happens-before-apply',
    question: 'Apply happens-before to a concrete flag-publish example.',
    difficulty: 'Medium',
    category: 'Lock-Free & the Memory Model',
    tags: ['happens-before', 'volatile', 'publication'],
    answer: `\`ready\` is \`volatile\`. T1 writes the data then flips the flag; T2 spins on the flag then reads the data:

| Step | Thread 1 | Thread 2 |
| --- | --- | --- |
| 1 | \`data = 42;\` (ordinary) | |
| 2 | \`ready = true;\` (volatile write) | |
| 3 | | \`while (!ready) {}\` (volatile read sees \`true\`) |
| 4 | | \`use(data);\` reads **42** |

The chain: write \`data\` →*(program order)*→ volatile write \`ready\` →*(volatile rule)*→ volatile read \`ready\` in T2 →*(program order)*→ read \`data\`. By **transitivity**, T2 is *guaranteed* to see \`data == 42\`.

:::gotcha
Drop \`volatile\` and step 2→3 has **no happens-before edge**: T2 could see \`ready == true\` yet still read \`data == 0\` (stale). The flag alone does not publish the data.
:::`,
  },
  {
    id: 'mt-lockfree-acquire-release',
    question: 'What are acquire and release semantics?',
    difficulty: 'Hard',
    category: 'Lock-Free & the Memory Model',
    tags: ['acquire-release', 'memory-fence', 'varhandle'],
    answer: `A **release** store *publishes* everything written before it — nothing prior may move *after* it. An **acquire** load *sees* those writes — nothing after it may move *before* it. A release **paired with** an acquire on the **same variable** forms a **one-directional** happens-before edge: the releasing thread's prior writes become visible to the acquiring thread.

| | Constrains | Cost |
| --- | --- | --- |
| Release / acquire | one direction | cheap |
| Volatile (SC) | both + \`StoreLoad\` | expensive |

Because it fences only one direction, release/acquire is **cheaper** than a full sequentially-consistent barrier.

:::senior
Java's \`volatile\` is *stronger* than release/acquire — it adds the pricey \`StoreLoad\` barrier for sequential consistency. \`VarHandle.setRelease\`/\`getAcquire\` expose the cheaper primitives when an expert doesn't need the full guarantee.
:::`,
  },
  {
    id: 'mt-lockfree-drf-sc',
    question: "What is the JMM's core guarantee for correctly synchronized programs?",
    difficulty: 'Hard',
    category: 'Lock-Free & the Memory Model',
    tags: ['drf-sc', 'sequential-consistency', 'data-race', 'memory-model'],
    answer: `It is called **DRF-SC**. If a program is **data-race-free** — every pair of *conflicting* accesses (same location, at least one a write) is ordered by **happens-before** — then it behaves as if **sequentially consistent**: as though all threads' operations occurred in one single global interleaving.

The payoff is enormous: you reason only about **interleavings**, never about compiler/CPU **reorderings**, as long as you have no data races.

- **No data race** → think in interleavings; reorderings stay invisible.
- **One data race** → the guarantee is **void**; bizarre reorderings (stale, torn, or OOTA-adjacent reads) become observable.

:::key
Eliminate data races and the whole machine looks sequentially consistent. That is *the* reason to synchronize — correctness of *reasoning*, not just of results.
:::`,
  },
  {
    id: 'mt-lockfree-out-of-thin-air',
    question: 'What are out-of-thin-air (OOTA) values?',
    difficulty: 'Hard',
    category: 'Lock-Free & the Memory Model',
    tags: ['out-of-thin-air', 'data-race', 'causality', 'memory-model'],
    answer: `Under a **data race**, aggressive speculation and reordering could *in principle* let a variable take a value **no thread ever wrote** — conjured by a **self-justifying causality loop**. The classic shape, with \`x\` and \`y\` both starting at 0:

| Thread 1 | Thread 2 |
| --- | --- |
| \`r1 = x;\` | \`r2 = y;\` |
| \`y = r1;\` | \`x = r2;\` |

If each thread *speculates* 42, writes it, and the other read "confirms" it, both end up reading **42 from nothing**.

The JMM **explicitly forbids** OOTA values to preserve basic safety and security invariants. But formalizing *exactly* which reorderings are legal — the **causality** rules — is the hardest and still-debated part of the model.

:::gotcha
Never rely on **racy reads**: in theory they can yield values you cannot derive from *any* legal interleaving. Synchronize and the question disappears.
:::`,
  },
  {
    id: 'mt-lockfree-volatile-array',
    question: 'Does declaring an array volatile make its elements volatile?',
    difficulty: 'Medium',
    category: 'Lock-Free & the Memory Model',
    tags: ['volatile', 'arrays', 'atomicintegerarray'],
    answer: `**No.** \`volatile\` applies to the array **reference**, not to its elements. A write to \`array[i]\` carries **no** visibility or ordering guarantee, even when the field is declared \`volatile int[]\`.

\`\`\`java
volatile int[] data = new int[N];
data[i] = 42;   // WRONG: element write is NOT volatile.
                // Only reassigning 'data' itself carries the barrier.
\`\`\`

Fix — use a per-element atomic type (or \`VarHandle\` array access):

\`\`\`java
AtomicIntegerArray data = new AtomicIntegerArray(N);
data.set(i, 42);              // volatile-semantics element write
data.compareAndSet(i, 42, 43);
\`\`\`

:::gotcha
Publishing a whole **new** array by reassigning the \`volatile\` field *is* safe. The trap is mutating **elements in place** and expecting cross-thread visibility.
:::`,
  },
  {
    id: 'mt-lockfree-long-double-atomicity',
    question: 'Are writes to a long or double always atomic in Java?',
    difficulty: 'Hard',
    category: 'Lock-Free & the Memory Model',
    tags: ['atomicity', 'long', 'double', 'word-tearing', 'volatile'],
    answer: `**No.** The JLS *permits* a non-\`volatile\` \`long\` or \`double\` (64-bit) write to be split into **two 32-bit stores**. On a 32-bit VM another thread can then observe a **torn** value — the high half of the new write spliced onto the low half of the old.

| Type | Atomic write without \`volatile\`? |
| --- | --- |
| \`int\`, \`short\`, \`byte\`, \`char\`, \`boolean\`, references | **always** |
| \`long\`, \`double\` | **not guaranteed** (spec-permitted tearing) |

Marking the field \`volatile\` — or using \`AtomicLong\` — guarantees a single **atomic 64-bit** access (and, as a bonus, visibility).

:::senior
Tearing is rare on modern **64-bit** JVMs, which store the word in one instruction — but it is **spec-permitted**, so **name it** in interviews and mark shared 64-bit fields \`volatile\`/\`AtomicLong\` regardless.
:::`,
  },
  {
    id: 'mt-lockfree-field-updater',
    question: 'When would you use AtomicReferenceFieldUpdater instead of AtomicReference?',
    difficulty: 'Medium',
    category: 'Lock-Free & the Memory Model',
    tags: ['atomicreferencefieldupdater', 'atomicreference', 'memory-footprint', 'varhandle'],
    answer: `Use it to **CAS a plain \`volatile\` field of an existing object without wrapping each instance** in an \`Atomic*\`. That saves **one wrapper object per instance** — decisive when you have millions of them, since every \`AtomicReference\` is an extra allocation *and* a pointer indirection.

\`\`\`java
class Node {
  volatile Node next;                 // stays a plain field
  static final AtomicReferenceFieldUpdater<Node, Node> NEXT =
    AtomicReferenceFieldUpdater.newUpdater(Node.class, Node.class, "next");
}
Node.NEXT.compareAndSet(node, expected, update);
\`\`\`

The JDK uses updaters internally (concurrent collections, \`CompletableFuture\`). **Cost:** reflective setup, and the target field must be \`volatile\` and accessible.

:::senior
\`VarHandle\` is the **modern, faster replacement** — the same field-level CAS with no per-call reflection and a full menu of access modes. Reach for updaters mainly in pre-Java-9 code.
:::`,
  },
];

export default questions;
