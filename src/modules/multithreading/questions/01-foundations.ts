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
];

export default questions;
