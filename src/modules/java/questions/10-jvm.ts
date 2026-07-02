import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'jvm-architecture-subsystems',
    question: 'What are the three main subsystems of the JVM?',
    difficulty: 'Medium',
    category: 'JVM',
    tags: ['architecture', 'jvm'],
    answer: `1. **Class loader subsystem** — finds, loads, links, and initializes \`.class\` types, enforcing parent delegation.
2. **Runtime data areas** — all program state: the shared **heap** and **Metaspace**, plus per-thread **stack**, **PC register**, and **native method stack**.
3. **Execution engine** — runs the code: the **interpreter**, the **JIT compiler** (C1/C2), and the **garbage collector**. The **JNI** bridges to native libraries.

\`\`\`text
class loader  ->  runtime data areas  ->  execution engine
\`\`\`

:::tip
"The JVM" is a *specification*. **HotSpot** is the common implementation; others include OpenJ9, GraalVM, and Azul Zing.
:::`,
  },
  {
    id: 'jvm-class-loading-phases',
    question: 'Walk through the phases a class goes through from .class file to usable type.',
    difficulty: 'Medium',
    category: 'JVM',
    tags: ['classloading', 'linking', 'initialization'],
    answer: `**Loading → Linking → Initialization.**

1. **Loading** — read the binary, create the \`Class\` object in Metaspace.
2. **Linking**, three sub-phases:
   - **Verification** — prove the bytecode is well-formed and type-safe (else \`VerifyError\`).
   - **Preparation** — allocate \`static\` fields and set them to **default** values (\`0\`/\`null\`/\`false\`).
   - **Resolution** — turn symbolic constant-pool references into direct ones (may be lazy).
3. **Initialization** — run \`static\` initializers and field assignments, in textual order, **once**, thread-safely.

Initialization is triggered by *active use*: \`new\`, a static method call, a non-constant static field access, reflection, or subclass init.

:::gotcha
Reading a \`static final\` **compile-time constant** does **not** initialize the class — the value is inlined into the caller at compile time.
:::`,
  },
  {
    id: 'jvm-parent-delegation',
    question: 'Explain the parent-delegation model and why it matters.',
    difficulty: 'Medium',
    category: 'JVM',
    tags: ['classloader', 'parent-delegation', 'security'],
    answer: `When asked to load a class, a loader **first delegates to its parent**, and only loads the class itself if every ancestor fails.

\`\`\`text
Application  ->  Platform  ->  Bootstrap   (request bubbles UP)
\`\`\`

This guarantees that core types like \`java.lang.String\` are **always** loaded by the trusted bootstrap loader, so a malicious \`java.lang.String\` on the classpath **can't be substituted**. It also ensures a class is defined only once per loader.

:::senior
A class's identity is **(name + defining classloader)**. The same \`.class\` loaded by two loaders yields two *incompatible* types — the source of \`ClassCastException: Foo cannot be cast to Foo\` in app servers and plugin systems.
:::`,
  },
  {
    id: 'jvm-classnotfound-vs-noclassdeffound',
    question: 'ClassNotFoundException vs NoClassDefFoundError?',
    difficulty: 'Medium',
    category: 'JVM',
    tags: ['classloading', 'exceptions'],
    answer: `- **\`ClassNotFoundException\`** (a *checked Exception*) — thrown when code **explicitly asks** to load a class by name (\`Class.forName("X")\`, \`loadClass\`) and it isn't found on the classpath.
- **\`NoClassDefFoundError\`** (an *Error*) — thrown when the JVM tries to **link/use** a class that was present at **compile time** but is missing or failed to load at **runtime**.

\`\`\`text
ClassNotFoundException  -> you reflectively looked it up; not found
NoClassDefFoundError    -> it compiled fine, but isn't there now
\`\`\`

:::gotcha
A \`NoClassDefFoundError\` can also mean the class's **static initializer threw** the first time it was loaded (\`ExceptionInInitializerError\`); subsequent uses then fail with \`NoClassDefFoundError\` because the class is marked unusable.
:::`,
  },
  {
    id: 'jvm-metaspace-vs-permgen',
    question: 'What is Metaspace and how does it differ from the old PermGen?',
    difficulty: 'Medium',
    category: 'JVM',
    tags: ['metaspace', 'permgen', 'memory'],
    answer: `**Metaspace** (Java 8+) holds **class metadata** — class structure, method bytecode, and the runtime constant pool.

| | PermGen (≤ Java 7) | Metaspace (Java 8+) |
|---|---|---|
| Location | Inside the **heap** | **Native** memory |
| Size | Fixed (\`-XX:MaxPermSize\`) | Auto-grows (\`-XX:MaxMetaspaceSize\`) |
| Classic failure | \`OutOfMemoryError: PermGen space\` | \`OutOfMemoryError: Metaspace\` (leak) |

Moving it to native, auto-growing memory largely retired the dreaded redeploy-time *PermGen space* error.

:::gotcha
Because Metaspace is native memory, **\`-Xmx\` does not bound it**. A classloader leak (often from repeated redeploys holding old loaders alive) still exhausts it.
:::`,
  },
  {
    id: 'jvm-soe-vs-oome',
    question: 'StackOverflowError vs OutOfMemoryError — what is the difference?',
    difficulty: 'Medium',
    category: 'JVM',
    tags: ['memory', 'stackoverflow', 'oom'],
    answer: `Both extend \`Error\`, but they exhaust different areas:

- **\`StackOverflowError\`** — a single **thread's stack** is exhausted, almost always from too-deep or unbounded **recursion**. Tune with \`-Xss\`.
- **\`OutOfMemoryError\`** — the **heap**, **Metaspace**, native memory, or code cache ran out.

\`\`\`java
int boom(int n) { return boom(n + 1); }  // StackOverflowError
\`\`\`

:::gotcha
\`OutOfMemoryError\` is **not always a heap problem** — *read the message after the colon*. \`Metaspace\` = classloader leak; \`unable to create new native thread\` = OS thread limit / native memory (raising \`-Xmx\` makes that *worse*).
:::`,
  },
  {
    id: 'jvm-gc-roots-reachability',
    question: 'How does the garbage collector decide what is garbage?',
    difficulty: 'Medium',
    category: 'JVM',
    tags: ['gc', 'reachability', 'gc-roots'],
    answer: `By **reachability from GC roots**, not reference counting. An object is **live** if it can be reached by following references from a root; everything else is collectable.

**GC roots** include:
- local variables / operand stacks of **live threads**,
- **\`static\`** fields,
- **JNI** references,
- active **monitors**.

Because reachability is *transitive*, two objects that reference each other but aren't reachable from any root are **both collected** — so Java has no reference-counting cycle leak.

:::gotcha
GC does **not** prevent leaks. An object that is *reachable but useless* (stuck in a \`static\` collection, a cache, an unremoved listener, or a \`ThreadLocal\` on a pooled thread) can never be reclaimed.
:::`,
  },
  {
    id: 'jvm-generational-gc',
    question: 'What is the generational hypothesis, and what are minor vs full GC?',
    difficulty: 'Medium',
    category: 'JVM',
    tags: ['gc', 'generational', 'minor-gc', 'full-gc'],
    answer: `The **generational hypothesis**: *most objects die young.* So the heap is split into a **young** generation (Eden + two survivor spaces) and an **old/tenured** generation.

- **Minor GC** — collects only the **young** gen. Cheap and frequent; survivors age across survivor spaces and are eventually **promoted** to old.
- **Major GC** — collects the **old** gen.
- **Full GC** — the **entire heap + Metaspace**; the longest pause, to be avoided.

Since the young gen is small and mostly dead, minor GCs are fast — the main reason generational GC performs well.

:::senior
GC frequency is driven by **allocation rate** (how fast you fill Eden), not live-set size. Reducing allocation in hot code often beats any GC flag.
:::`,
  },
  {
    id: 'jvm-collectors',
    question: 'Compare the HotSpot garbage collectors. How do you choose one?',
    difficulty: 'Hard',
    category: 'JVM',
    tags: ['gc', 'g1', 'zgc', 'shenandoah', 'parallel'],
    answer: `It's a **throughput vs pause-time** trade-off:

| Collector | Optimises for | Pause | Notes |
|---|---|---|---|
| **Serial** | Footprint | High (STW) | Tiny heaps, single core, containers |
| **Parallel** | **Throughput** | High (STW) | Batch jobs; default through Java 8 |
| **G1** | Balance | ~10–200 ms | **Default since Java 9**; region-based, pause-target driven |
| **ZGC** | **Latency** | < 1 ms | Concurrent, TB heaps; generational in Java 21+ |
| **Shenandoah** | **Latency** | < ~10 ms | Concurrent compaction; pause ≈ constant |

Choose by **SLO**: a latency-sensitive service with a p99 budget wants **ZGC/Shenandoah**; a throughput-bound batch job wants **Parallel**; **G1** is the sensible default.

\`\`\`text
-XX:+UseG1GC   -XX:+UseZGC   -XX:+UseParallelGC
\`\`\`

:::senior
Latency collectors keep pauses tiny by doing work **concurrently** with the app — at the cost of more total CPU and memory headroom. There is no universally best collector, only the one that fits your goal.
:::`,
  },
  {
    id: 'jvm-tiered-jit',
    question: 'How does HotSpot reach native speed? Explain tiered JIT compilation.',
    difficulty: 'Hard',
    category: 'JVM',
    tags: ['jit', 'c1', 'c2', 'tiered-compilation', 'warmup'],
    answer: `HotSpot runs **mixed-mode**: it **interprets** bytecode first, **profiles** it, then JIT-compiles hot methods. **Tiered compilation** uses two compilers:

- **C1 (client)** — compiles fast with cheap optimisations; gets code native quickly while gathering a profile.
- **C2 (server)** — compiles slowly but aggressively, using that profile, for the hottest methods (tier 4 = peak).

Hotness is measured by **invocation counters** and **back-edge (loop) counters**; crossing a threshold queues background compilation. The profile enables runtime-only optimisations: **inlining**, **devirtualization**, and **escape analysis**.

\`\`\`text
interpret  ->  C1 (warming)  ->  C2 (peak speed)
\`\`\`

:::gotcha
This is why JVMs need **warmup** and why naive microbenchmarks measure the interpreter. Use **JMH**, which handles warmup and defeats dead-code elimination.
:::`,
  },
  {
    id: 'jvm-escape-analysis',
    question: 'What is escape analysis and scalar replacement?',
    difficulty: 'Hard',
    category: 'JVM',
    tags: ['jit', 'escape-analysis', 'optimization'],
    answer: `**Escape analysis** is a C2 optimisation that proves whether a newly-allocated object **escapes** the method (or thread) that created it. If it provably doesn't, the JIT can:

- **Scalar-replace** it — don't allocate the object at all; turn its fields into local values in registers/stack. **Zero heap allocation, zero GC pressure.**
- **Elide locks** on it (no other thread can see it).
- **Stack-allocate** it.

\`\`\`java
double dist(int x, int y) {
    Point p = new Point(x, y);   // never escapes -> may be scalar-replaced
    return Math.sqrt(p.x*p.x + p.y*p.y);
}
\`\`\`

It's on by default (\`-XX:+DoEscapeAnalysis\`).

:::senior
This is why allocating small, short-lived objects in hot code is often *free* — but only **after** C2 compiles the method. Before warmup, that \`new\` really does hit the heap.
:::`,
  },
  {
    id: 'jvm-diagnose-oom',
    question: 'A production service throws OutOfMemoryError. How do you diagnose it?',
    difficulty: 'Hard',
    category: 'JVM',
    tags: ['troubleshooting', 'heap-dump', 'oom', 'jfr'],
    answer: `1. **Read the message** — \`Java heap space\`, \`Metaspace\`, \`unable to create new native thread\`, \`Direct buffer memory\` each point to a different area.
2. **Capture a heap dump** (set this proactively everywhere):

\`\`\`bash
-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/log/app/
jcmd <pid> GC.heap_dump /tmp/heap.hprof   # on demand (safer than jmap)
\`\`\`

3. **Analyse in Eclipse MAT** — the **dominator tree** and **Leak Suspects** report show which objects retain the most memory and the **GC-root path** keeping them alive (usually a \`static\` collection, a cache, or a classloader leak).
4. For **live** leak hunting, use **JFR**'s \`OldObjectSample\` events (near-zero overhead) viewed in **JMC**, and confirm the trend in **GC logs** (\`-Xlog:gc*\`): rising post-GC old-gen occupancy = leak.

:::senior
\`jmap -dump\` can **pause or crash** a fragile process; prefer \`jcmd GC.heap_dump\` or continuous JFR. And measure first — many "OOMs" are just an undersized \`-Xmx\` or a container default heap of only ~25% of pod memory.
:::`,
  },
];

export default questions;
