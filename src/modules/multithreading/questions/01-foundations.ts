import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'mt-foundations-concurrency-vs-parallelism',
    question: 'What is the difference between concurrency and parallelism?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['concurrency', 'parallelism', 'fundamentals'],
    answer: `They are related but distinct:

- **Concurrency** is a *structural* property — designing a program as independent tasks that can make progress by **interleaving**. It is about *dealing with* many things at once.
- **Parallelism** is a *runtime* property — actually **executing** multiple tasks at the same instant on **multiple cores**. It is about *doing* many things at once.

A concurrent program can run on a single core (tasks interleave) or many cores (tasks run in parallel) with no change to its structure. Parallelism is just one possible *execution* of a concurrent design.

:::key
Concurrency = structure (interleaving, one core is enough). Parallelism = execution (simultaneous, needs multiple cores).
:::`,
  },
  {
    id: 'mt-foundations-process-vs-thread',
    question: 'What is the difference between a process and a thread?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['process', 'thread', 'memory'],
    answer: `A **process** is a running program with its own isolated **address space**; a **thread** is a line of execution inside a process.

| | Process | Thread |
|--|--|--|
| Memory | Own isolated address space | Shares the process heap and code |
| Isolation | Strong — a crash is contained | Weak — can corrupt shared state |
| Creation cost | Heavy (MB, OS setup) | Light (small stack) |
| Communication | IPC (pipes, sockets) | Read/write shared objects |

Threads in one process **share the heap and code** but each own a **stack and program counter**. That sharing is what makes threads cheap and fast to coordinate — and what makes shared mutable state dangerous.`,
  },
  {
    id: 'mt-foundations-thread-states',
    question: 'Name the states in the Java Thread.State enum and what each means.',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['thread-lifecycle', 'thread-state', 'java'],
    answer: `Java threads have **six** states:

- **NEW** — constructed but \`start()\` not yet called.
- **RUNNABLE** — running or ready-to-run (also covers threads blocked on I/O).
- **BLOCKED** — waiting to acquire a **monitor lock** held by another thread.
- **WAITING** — waiting **indefinitely** for a signal (\`wait()\`, \`join()\`, \`park()\`).
- **TIMED_WAITING** — waiting with a **deadline** (\`sleep(t)\`, \`wait(t)\`, \`join(t)\`).
- **TERMINATED** — \`run()\` has returned or thrown.

The typical path is \`NEW\` → \`RUNNABLE\` → (\`BLOCKED\`/\`WAITING\`/\`TIMED_WAITING\`) → \`RUNNABLE\` → \`TERMINATED\`, with \`RUNNABLE\` as the hub.`,
  },
  {
    id: 'mt-foundations-io-vs-cpu-bound',
    question: 'What is the difference between IO-bound and CPU-bound work, and how should thread count differ for each?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['io-bound', 'cpu-bound', 'thread-pool', 'sizing'],
    answer: `The difference is where a task spends its time:

- **IO-bound** — mostly **waiting** on the network, disk, or a database; it uses little CPU. Concurrency helps enormously even on one core: while one task waits, another runs. You can profitably run **many more threads than cores**.
- **CPU-bound** — mostly **computing**; it saturates a core the whole time. Extra threads beyond the core count just time-slice a busy CPU and add context-switch overhead. The sweet spot is roughly the **number of cores**.

:::gotcha
"More threads = faster" is false for CPU-bound work. Sizing a pool means asking: is this work waiting or computing?
:::`,
  },
  {
    id: 'mt-foundations-shared-vs-private',
    question: 'When threads share a process, which memory is shared between them and which is private to each thread?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['heap', 'stack', 'memory-model', 'thread'],
    answer: `- **Shared** (one copy per process): the **heap** — every \`new\` object and every \`static\` field — plus loaded code and open file handles.
- **Private** (one per thread): the **stack** (local variables and call frames), the **program counter**, and CPU registers.

The practical consequences:

- **Local variables are automatically thread-safe** because each thread has its own stack. This is why *thread confinement* (keep data on the stack) is the cheapest safety strategy.
- **Heap objects are shared**, so two threads can read and write the same object concurrently — the source of race conditions.

:::key
Locals on the stack are private and safe; objects on the heap are shared and need protection.
:::`,
  },
  {
    id: 'mt-foundations-blocked-vs-waiting',
    question: 'Distinguish BLOCKED, WAITING, and TIMED_WAITING. What causes each?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['thread-state', 'blocked', 'waiting', 'locks'],
    answer: `All three mean the thread is off the CPU, but for different reasons:

- **BLOCKED** — **lock contention**. The thread is trying to enter a \`synchronized\` block another thread holds. It resumes the instant the monitor is released. No timeout, no signal.
- **WAITING** — **coordination with no deadline**. The thread parked itself (\`wait()\`, \`join()\`, \`LockSupport.park()\`) and cannot proceed until another thread signals it (\`notify()\`, the joined thread ending, \`unpark()\`). Forget to signal and it waits forever.
- **TIMED_WAITING** — like \`WAITING\` but with a **clock** (\`sleep(t)\`, \`wait(t)\`, \`join(t)\`). It wakes on a signal or when the timeout elapses, whichever comes first.

The interview point: \`BLOCKED\` is *contention*; \`WAITING\` is *coordination*; the timeout is the only difference between the two waiting states.`,
  },
  {
    id: 'mt-foundations-runnable-myth',
    question: 'Does RUNNABLE mean a thread is actively running on a CPU right now?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['runnable', 'thread-state', 'thread-dump', 'io'],
    answer: `No. \`RUNNABLE\` lumps together two situations the JVM does not distinguish: a thread **actually running** on a core, and a thread that is **ready to run** but waiting for the scheduler to give it a CPU.

Crucially, a thread **blocked on I/O** (reading a socket, waiting on disk) also shows up as \`RUNNABLE\`, *not* \`BLOCKED\` — from the JVM's point of view it is inside a native call, not waiting on a monitor.

\`BLOCKED\` means one specific thing: waiting to acquire a **monitor lock**.

:::gotcha
Reading a thread dump, do not assume \`RUNNABLE\` = healthy/progressing. A stuck I/O read looks identical to a busy computation. Check the stack, not just the state.
:::`,
  },
  {
    id: 'mt-foundations-three-hazards',
    question: 'What are the three families of concurrency hazards, and what is their common root cause?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['race-condition', 'deadlock', 'visibility', 'hazards'],
    answer: `Three families, one root:

1. **Race conditions** — the *interleaving* hazard. Correctness depends on timing; a non-atomic read-modify-write like \`count++\` loses updates when threads interleave.
2. **Deadlock and liveness** — the *progress* hazard. Threads block each other forever (deadlock), spin without advancing (livelock), or are perpetually denied a resource (starvation).
3. **Memory visibility** — the *ordering* hazard. A write by one thread may never become visible to another (cached values, instruction reordering, no happens-before edge).

The common root is **shared mutable state accessed concurrently**. Remove the sharing (confinement) or the mutation (immutability) and the hazards largely vanish.`,
  },
  {
    id: 'mt-foundations-why-nondeterministic',
    question: 'Why are concurrency bugs so hard to catch in testing, and what follows from that?',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['non-determinism', 'testing', 'race-condition'],
    answer: `Because they are **non-deterministic**. A race depends on a *specific* interleaving of threads, which is just one of an enormous number of possible orderings the scheduler might pick. The bad ordering is usually rare, so:

- Unit tests pass almost every run.
- It works on your laptop (few cores, light load).
- It corrupts data in production under real concurrency and load.

Two consequences seniors internalize:

- **You cannot test your way to thread-safety.** A green test suite is not evidence of correctness — it only means the bad interleaving did not happen *this time*. You must **reason** about which interleavings are possible and rule out the bad ones by construction.
- **Reproduction is painful**, so favor tools that expose orderings: stress tests, thread-sanitizers, \`jcstress\`, and code review focused on invariants and lock discipline.

:::key
Non-determinism means absence of failures is not proof of correctness. Design and reason; do not rely on tests alone.
:::`,
  },
  {
    id: 'mt-foundations-context-switch-cost',
    question: 'Why does adding more threads eventually stop improving throughput (and can hurt it)?',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['context-switch', 'scaling', 'amdahl', 'cpu-bound'],
    answer: `Two independent limits bite:

**1. Context-switch and contention overhead.** Only as many threads run as you have cores; the rest are ready-but-waiting. Beyond the core count, the OS **time-slices** threads onto the same cores, and every switch costs saved/restored registers, scheduler work, and **cache/TLB pollution** (the new thread's data is not warm in cache). For CPU-bound work this is pure overhead — throughput plateaus, then declines. Threads also contend on shared locks, adding synchronization cost.

**2. Amdahl's law.** If a fraction *s* of the work is inherently **serial**, the maximum speedup from *N* processors is \`1 / (s + (1 - s)/N)\`. As *N* grows, speedup asymptotes to \`1/s\`. A program that is 10% serial can never go more than **10x** faster, no matter how many cores you add.

:::senior
The takeaway: measure the serial fraction and the workload type before promising linear scaling. For IO-bound work, many threads is fine (they mostly wait); for CPU-bound work, target roughly the core count.
:::`,
  },
  {
    id: 'mt-foundations-platform-vs-virtual-threads',
    question: 'What is the difference between a platform thread and a virtual thread, and does the switch remove concurrency hazards?',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['virtual-threads', 'loom', 'platform-threads', 'java'],
    answer: `- A **platform thread** is a thin wrapper over an **OS thread** — kernel-scheduled, roughly a 1 MB stack, expensive enough that you **pool** them. Blocking one wastes a scarce OS thread.
- A **virtual thread** (Project Loom, Java 21) is a **user-mode** thread the JVM multiplexes onto a small pool of platform ("carrier") threads. When a virtual thread blocks on I/O, the JVM **unmounts** it from its carrier so the carrier runs another virtual thread. They are cheap enough to have **millions**, so you can write simple blocking, thread-per-request code without a pool.

What virtual threads change: the **cost and scaling** of blocking I/O (huge for IO-bound servers).

What they do **not** change: they still run on the **same shared heap** and inherit **exactly the same** race conditions, visibility bugs, and deadlocks.

:::gotcha
Cheaper threads do not make shared mutable state safe. \`synchronized\`, atomics, and the memory model matter just as much with virtual threads — and holding a lock across a blocking call can *pin* a virtual thread to its carrier.
:::`,
  },
  {
    id: 'mt-foundations-user-vs-kernel-threads',
    question: 'What is the difference between user-level and kernel-level threads, and which model does Java use?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['user-threads', 'kernel-threads', 'green-threads', 'virtual-threads'],
    answer: `**User-level threads** are scheduled by a runtime library in user space; the kernel sees only one thread. **Kernel-level threads** are created and scheduled by the OS, which can place them on separate cores. The difference is *who does the scheduling*.

Three mapping models:

| Model | Mapping | Example |
|--|--|--|
| **M:1** | many user threads → 1 kernel thread | old "green threads" |
| **1:1** | each user thread → its own kernel thread | modern Java platform threads |
| **M:N** | many user threads → a pool of kernel threads | Java 21 virtual threads |

Java 1.1 shipped **green threads** (M:1). Since HotSpot, a \`java.lang.Thread\` is **1:1** — one OS thread each, so the OS scheduler gives true multicore parallelism. **Virtual threads** (Java 21) reintroduce **M:N**: many virtual threads multiplexed onto a few kernel *carrier* threads.

The trade-off: user threads are cheap with fast switches, but can't use multiple cores, and **one blocking syscall stalls every thread** sharing that kernel thread. Kernel threads give real parallelism and independent blocking, but are heavier to create and switch.

:::key
Java's platform threads are 1:1 with OS threads; virtual threads layer an M:N runtime on top of them.
:::`,
  },
  {
    id: 'mt-foundations-amdahl-worked',
    question: "Work through Amdahl's law with a concrete number.",
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['amdahl', 'scaling', 'speedup', 'parallelism'],
    answer: `**Amdahl's law** bounds the speedup from parallelism when a fraction *s* of the work is inherently serial:

\`\`\`
speedup(N) = 1 / (s + (1 - s)/N)
\`\`\`

Take a program that is **95% parallel**, so \`s = 0.05\`. Throw 20 cores at it:

\`\`\`
speedup(20) = 1 / (0.05 + 0.95/20) = 1 / 0.0975 ≈ 10.3x
\`\`\`

Twenty cores buys only **~10x**, not 20x. And as \`N → ∞\` the speedup asymptotes to \`1/s = 1/0.05 = 20x\` — a hard ceiling you can never cross:

| Cores N | Speedup |
|--|--|
| 2 | 1.9x |
| 4 | 3.5x |
| 8 | 5.9x |
| 20 | 10.3x |
| ∞ | 20x |

Notice the diminishing returns: going from 8 to 20 cores adds less than another 2x.

:::senior
The serial fraction dominates. Even a *tiny* \`s\` caps you hard, so the highest-leverage optimization is usually shrinking the serial part — not adding cores.
:::`,
  },
  {
    id: 'mt-foundations-gustafson',
    question: "What does Gustafson's law say, and how does it reconcile with Amdahl's pessimism?",
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['gustafson', 'amdahl', 'weak-scaling', 'strong-scaling'],
    answer: `**Gustafson's law** reframes the question. Amdahl asks "with a *fixed* problem, how much faster with N cores?" Gustafson asks "in a *fixed time budget*, how much *more work* can N cores do?" — because in practice you use bigger machines to solve **bigger problems**, not to solve today's problem faster.

If *s* is the serial fraction, Gustafson's **scaled speedup** is:

\`\`\`
speedup(N) = N - s * (N - 1)
\`\`\`

This grows almost **linearly** with N, because the parallel portion of the work expands with the problem while the serial part stays roughly constant.

| | Amdahl | Gustafson |
|--|--|--|
| Problem size | **fixed** | **grows with N** |
| Scaling type | strong scaling | weak scaling |
| Verdict | pessimistic (cap \`1/s\`) | optimistic (near-linear) |

Both are correct — they answer different questions. Amdahl governs *strong scaling* (same problem, more cores); Gustafson governs *weak scaling* (bigger problem, more cores).

:::senior
This reconciles the paradox that supercomputers with thousands of cores are useful despite Amdahl's cap: nobody buys them to run a fixed small job faster — they run proportionally larger simulations, where the serial fraction shrinks in relative terms.
:::`,
  },
  {
    id: 'mt-foundations-context-switch-anatomy',
    question: 'What exactly does a context switch cost?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['context-switch', 'scheduler', 'cache', 'tlb'],
    answer: `A context switch swaps one thread off a core and another on. The **visible** cost is small; the **hidden** cost dominates.

**Direct cost** — save the outgoing thread's **registers, program counter, and stack pointer**, run the **kernel scheduler** to pick the next thread, then restore its state. On a **process** (address-space) switch you also **flush the TLB**, because the virtual-to-physical mappings change.

**Indirect cost (the big one)** — after the switch the CPU **caches are cold** for the incoming thread. Its data isn't in L1/L2, so it stalls on cache misses until they refill. This lost cache warmth usually **outweighs** the register-saving cost, and it never shows up in the switch instruction itself. All told, a switch runs on the order of **microseconds** — thousands of wasted cycles.

Switches come in two flavors:

| Kind | Trigger |
|--|--|
| **Voluntary** | the thread blocks (I/O, lock, \`sleep\`) |
| **Involuntary** | its time slice expired (preemption) |

Keeping **fewer runnable threads than cores** minimizes involuntary switches.

:::gotcha
This is why oversubscribing **CPU-bound** work backfires: past the core count, extra threads add no parallelism — they just force involuntary switches that trash the caches and *lower* total throughput.
:::`,
  },
  {
    id: 'mt-foundations-false-sharing-preview',
    question: 'What is false sharing?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['false-sharing', 'cache-line', 'mesi', 'performance'],
    answer: `**False sharing** is a performance bug where two *independent* variables happen to sit in the **same CPU cache line** (typically **64 bytes**), so the hardware treats them as one unit even though your code never shares them.

Caches move data in whole lines. When core 0 writes variable \`A\`, the MESI coherence protocol **invalidates that entire line** in every other core's cache — including core 1, which only ever touches variable \`B\` living in the same line. Core 1's next read of \`B\` now misses and must refetch. Under a tight loop the line **ping-pongs** between cores and throughput collapses.

The nasty part: there is **no correctness symptom**. The program is perfectly correct — it just scales *negatively*, so adding threads makes it slower.

Common fixes:

- **Pad** hot fields so each occupies its own cache line.
- Annotate with **\`@Contended\`** (JDK-internal, needs a flag) to auto-pad.
- Use structures built to dodge it, like **\`LongAdder\`**, which spreads counts across per-cell padding.

:::gotcha
False sharing hides from code review — the variables *look* unrelated. It surfaces only under profiling as unexplained cache-miss traffic. (The memory-model topic covers the mechanics in depth.)
:::`,
  },
  {
    id: 'mt-foundations-thread-memory-cost',
    question: 'Why did the classic thread-per-request model hit a scaling wall, and what changed?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['thread-per-request', 'c10k', 'virtual-threads', 'stack'],
    answer: `The classic model dedicates **one platform thread per request** — simple to read and debug, until you count the cost. Each platform thread reserves roughly a **1 MB stack** plus kernel bookkeeping, so **50,000** concurrent requests need tens of **gigabytes** of stacks and swamp the OS scheduler. This is the famous **C10k problem**: you run out of threads long before you run out of CPU or network.

The stopgap was **thread pools**: cap the thread count to bound memory and switching. But a bounded pool **caps concurrency** — when every thread is parked on a slow I/O call, new requests **queue** behind them, adding latency while the CPU sits idle. You trade one problem for another.

**Virtual threads** (Java 21) change the arithmetic. A virtual thread costs a **few hundred bytes** with a **growable, heap-resident stack**, and blocking one merely unmounts it from its carrier. You can have **millions**.

\`\`\`java
// Thread-per-request, but cheap — no pool needed
Thread.ofVirtual().start(() -> handle(request));
\`\`\`

:::senior
Virtual threads let simple blocking thread-per-request code scale like async code — without the callback/reactive complexity. The wall was the *cost* of a thread, not the *model*.
:::`,
  },
  {
    id: 'mt-foundations-cooperative-vs-preemptive',
    question: 'What is the difference between cooperative and preemptive scheduling?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['scheduling', 'preemptive', 'cooperative', 'virtual-threads'],
    answer: `The difference is **who decides when a thread gives up the CPU**.

- **Preemptive** — the scheduler can **suspend a thread at almost any instruction**, driven by a timer interrupt (the time slice). The thread has no say. Java **platform threads are OS-scheduled preemptively**, which is exactly why you can never assume a multi-step operation runs uninterrupted — a switch can land between your read and your write.
- **Cooperative** — a task **runs until it voluntarily yields** (or blocks). Old green threads, coroutines, and single-threaded event loops (Node.js) work this way. It is cheap and predictable, but a **single non-yielding task starves everything else** — one infinite loop freezes the whole system.

| | Preemptive | Cooperative |
|--|--|--|
| Yield point | any instruction (timer) | only at explicit yield/block |
| Fairness | scheduler-enforced | relies on well-behaved tasks |
| Java example | platform threads | virtual threads (vs. carrier) |

**Virtual threads** blend both: they yield **cooperatively** at blocking points (unmounting from their carrier), while the **carrier** platform threads underneath are still **preemptively** scheduled by the OS.

:::key
Preemptive = the scheduler interrupts you anytime, so assume nothing is atomic. Cooperative = you must yield, so a greedy task can starve its peers.
:::`,
  },
  {
    id: 'mt-foundations-why-threads',
    question: 'Why use multiple threads at all — what do you gain and what does it cost?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['motivation', 'responsiveness', 'throughput', 'trade-offs'],
    answer: `Threads buy you three things:

- **Responsiveness** — keep one thread free for the UI or event loop while heavy work runs elsewhere, so the app never freezes.
- **Throughput** — spread CPU-bound work across **multiple cores** to finish sooner.
- **Latency hiding** — overlap **I/O waits** with useful work; while one task waits on the network, another computes.

But threads are not free:

- **Shared-mutable-state hazards** — race conditions, visibility bugs, and deadlocks, all non-deterministic and hard to test.
- **Complexity** — locking, ordering, and lifecycle management you never needed single-threaded.
- **Overhead** — context switches, coordination, and lock contention that can *reduce* throughput if you overdo it.

| Gain | Cost |
|--|--|
| Responsiveness | Concurrency hazards |
| Multicore throughput | Added complexity |
| Overlap I/O waits | Switch + sync overhead |

:::key
A thread is a tool with a real price. Reach for it when the workload is genuinely **parallelizable** (CPU work to split) or **I/O-heavy** (waits to overlap) — not by default.
:::`,
  },
  {
    id: 'mt-foundations-race-vs-data-race',
    question: 'What is the difference between a data race and a race condition?',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['data-race', 'race-condition', 'memory-model', 'happens-before'],
    answer: `They sound alike but live at different levels.

- A **data race** is a **memory-model** defect: two threads access the *same location*, at least one **writes**, and there is **no happens-before ordering** between them. The JMM declares the result **undefined** — you can see stale, **torn**, or even out-of-thin-air values.
- A **race condition** is a **higher-level correctness** bug: the program's outcome depends on **timing / interleaving**, whether or not any single access is a data race.

They are **independent**. You can have a race condition with **no data race** — a check-then-act on a *thread-safe* map, where every individual call is properly synchronized:

| Step | Thread A | Thread B | map has "k"? |
|--|--|--|--|
| 1 | \`!containsKey("k")\` → true | | no |
| 2 | | \`!containsKey("k")\` → true | no |
| 3 | \`put("k", a)\` | | yes |
| 4 | | \`put("k", b)\` — overwrites | yes |

No data race (\`ConcurrentHashMap\` orders each call), yet A's value is clobbered. The fix is atomicity: \`putIfAbsent\` / \`computeIfAbsent\`.

Conversely, an unsynchronized \`boolean\` flag read in a loop is a **data race** that often *appears* to work — until the JIT hoists the read and the loop spins forever.

:::senior
Fix data races with **happens-before** (\`volatile\`, locks). Fix race conditions with **atomic compound actions**. Removing the data race does *not* automatically remove the race condition.
:::`,
  },
  {
    id: 'mt-foundations-time-slicing',
    question: "What is time-slicing, and why can't you rely on execution order?",
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['time-slicing', 'quantum', 'scheduler', 'interleaving'],
    answer: `**Time-slicing** is how one core runs many threads. The OS scheduler gives each ready thread a tiny **time slice** (a *quantum*, typically a few to tens of milliseconds), runs it, then **preempts** it and hands the core to the next thread. Rotating fast enough creates the **illusion of simultaneity** — many threads appear to run at once even on a **single core**.

The consequence for correctness: a switch can happen **between any two operations**, so you can never assume a multi-step action runs to completion uninterrupted. Watch \`count++\` (read, add, write) interleave:

| Step | Thread A | Thread B | count |
|--|--|--|--|
| 1 | read count → 0 | | 0 |
| 2 | | read count → 0 | 0 |
| 3 | write 1 | | 1 |
| 4 | | write 1 | 1 |

Two increments, but \`count\` ends at **1** — a lost update, purely because the slice boundary fell mid-operation.

:::gotcha
Never assume a particular interleaving, a particular thread order, or that any sequence of statements is atomic. The scheduler is free to switch at the worst possible moment — and in testing it rarely does, which is why these bugs hide.
:::`,
  },
  {
    id: 'mt-foundations-memory-hierarchy',
    question: 'How does the CPU memory hierarchy cause visibility problems between threads?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['memory-hierarchy', 'cache', 'visibility', 'java-memory-model'],
    answer: `Modern CPUs have a **memory hierarchy**, each level roughly an order of magnitude slower than the one above:

| Level | Scope | Approx latency |
|--|--|--|
| Registers | per-core | < 1 ns |
| L1 / L2 cache | **per-core** | ~1-4 ns |
| L3 cache | shared | ~10-20 ns |
| Main memory (RAM) | shared | ~100 ns |

A core does not work on RAM directly — it works on **cached copies**. When a thread writes a field, that write may sit in the core's **store buffer** or private **L1** and **not yet be visible** to a thread running on another core, which is happily reading its own stale cached copy. Neither core is "wrong"; they simply have not synchronized.

This hardware reality is the **physical root of visibility bugs**: without a flush/invalidate, one thread's update can stay invisible to another indefinitely.

The **Java Memory Model** exists to tame exactly this. \`volatile\`, \`synchronized\`, and \`final\` insert the **memory barriers** that force writes to be published and reads to be refreshed, establishing *happens-before* so an update is guaranteed visible.

:::key
Per-core caches, not RAM, are the "truth" a thread sees. Visibility tools (\`volatile\` / \`synchronized\`) exist to force cores to agree.
:::`,
  },
  {
    id: 'mt-foundations-throughput-vs-latency',
    question: 'What is the difference between throughput and latency, and how does concurrency affect each?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['throughput', 'latency', 'performance', 'queueing'],
    answer: `Two different measurements:

- **Latency** — how long **one** operation takes, end to end (e.g., 20 ms per request). Lower is better.
- **Throughput** — how **many** operations complete per unit time (e.g., 5,000 requests/second). Higher is better.

They are **not** reciprocals once concurrency enters. Concurrency mostly boosts **throughput** — overlapping I/O waits and using more cores lets more work finish per second — while an individual operation's **latency stays the same or gets worse**:

- **Queueing** — a request may wait behind others before it even starts.
- **Context switches and contention** — time-slicing and lock waits stretch each operation.

| | Latency | Throughput |
|--|--|--|
| Measures | time per op | ops per second |
| Concurrency effect | flat or *worse* | usually *better* |
| Improve by | shorter critical path | more parallel workers |

A supermarket analogy: adding checkout lanes raises **throughput** (more shoppers/hour) but does nothing for the **latency** of your own trip through one lane — and a longer queue makes it worse.

:::senior
Optimizing one can hurt the other. Decide which the system actually needs — a batch job wants throughput; an interactive API wants low tail latency — and measure *that*.
:::`,
  },
];

export default questions;
