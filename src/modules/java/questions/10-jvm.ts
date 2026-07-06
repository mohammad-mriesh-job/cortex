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
  {
    id: 'jvm-stack-vs-heap',
    question: 'What is the difference between the stack and the heap?',
    difficulty: 'Medium',
    category: 'JVM',
    tags: ['stack', 'heap', 'memory'],
    answer: `They're two runtime memory areas with different lifetimes and owners:

| | Stack | Heap |
|--|-------|------|
| Scope | **per thread** | **shared** by all threads |
| Holds | frames: locals, primitives, **references**, return addresses | **all objects and arrays** |
| Lifetime | pushed on call, popped on return | until unreachable, then GC'd |
| Management | automatic (LIFO) | garbage collector |
| Exhaustion | \`StackOverflowError\` | \`OutOfMemoryError\` |

\`\`\`java
void m() {
    int n = 5;                 // primitive n -> on the stack
    Point p = new Point(1, 2); // reference p -> stack; the Point object -> heap
}   // frame popped; the Point survives until GC finds it unreachable
\`\`\`

- A **primitive local** lives entirely on the stack; an **object** always lives on the heap, reached through a reference that may be on the stack or inside another heap object.
- Because each thread has its own stack, locals are inherently thread-confined; heap objects are what threads can share (and race on).

:::senior
"Objects always live on the heap" is the default, but the JIT's **escape analysis** can scalar-replace a non-escaping object so it never actually allocates — an implementation detail, not something you can rely on.
:::`,
  },
  {
    id: 'jvm-reference-types',
    question: "Strong, soft, weak, and phantom references — what's the difference?",
    difficulty: 'Hard',
    category: 'JVM',
    tags: ['references', 'weakreference', 'gc', 'memory'],
    answer: `The four reference strengths tell the GC **how eagerly** it may reclaim an object:

| Type | Collected when… | Use for |
|------|-----------------|---------|
| **Strong** | never while reachable | ordinary references |
| **Soft** | only when memory runs **low** | memory-sensitive caches |
| **Weak** | at the **next GC** if only weakly reachable | canonical maps, metadata |
| **Phantom** | after the object is collectable; \`get()\` is always \`null\` | post-mortem cleanup |

\`\`\`java
WeakHashMap<Key, Meta> cache = new WeakHashMap<>();  // entry vanishes when Key is GC'd
SoftReference<byte[]> img = new SoftReference<>(load()); // dropped under memory pressure
\`\`\`

- **Weak** underpins \`WeakHashMap\` and \`ThreadLocal\`'s internal map — the entry disappears once the key is otherwise unreferenced.
- **Phantom** references (with a \`ReferenceQueue\`) are the modern, safe replacement for \`finalize()\` — they power \`java.lang.ref.Cleaner\` for releasing native/off-heap resources deterministically.

:::gotcha
A \`SoftReference\` cache is **not** free memory management — it's cleared only when the heap is nearly full, often *after* a costly full GC, and can hurt latency. Prefer a bounded cache (Caffeine) with an explicit eviction policy.
:::`,
  },
  {
    id: 'jvm-memory-leaks',
    question: 'How can you have a memory leak in a garbage-collected language like Java?',
    difficulty: 'Medium',
    category: 'JVM',
    tags: ['memory-leak', 'gc', 'reachability'],
    answer: `GC only reclaims **unreachable** objects. A Java "leak" is an object that stays **reachable but is never used again** — so the GC can't touch it. The usual culprits:

1. **Unbounded \`static\` collections / caches** — a \`static Map\` you only ever add to grows forever.
2. **Listeners / callbacks not deregistered** — the publisher keeps a strong reference to subscribers.
3. **\`ThreadLocal\` on pooled threads** — values outlive the task because the worker thread never dies.
4. **ClassLoader leaks** — a redeploy leaves the old loader (and all its classes/statics) reachable → \`Metaspace\` OOM.
5. **Broken \`hashCode\`/\`equals\` keys** — entries you can no longer find but that still occupy the map.

\`\`\`java
static final List<Object> CACHE = new ArrayList<>();  // never cleared -> leak
\`\`\`

:::senior
Diagnose with a **heap dump** in Eclipse MAT: the *dominator tree* shows what retains the most memory, and the **GC-root path** names what keeps it alive. The fix is almost always **bounded** caches, **weak** references, or explicit **removal/deregistration**.
:::`,
  },
  {
    id: 'jvm-tuning-flags',
    question: 'What are the essential JVM flags for sizing memory and choosing a GC?',
    difficulty: 'Medium',
    category: 'JVM',
    tags: ['flags', 'tuning', 'heap', 'gc'],
    answer: `The ones you should recognize:

| Flag | Controls |
|------|----------|
| \`-Xms\` / \`-Xmx\` | initial / **max** heap size |
| \`-Xss\` | per-thread **stack** size |
| \`-XX:MaxMetaspaceSize\` | cap on class metadata (native memory) |
| \`-XX:+UseG1GC\` / \`UseZGC\` / \`UseParallelGC\` | pick the collector |
| \`-XX:MaxGCPauseMillis\` | G1/ZGC **pause target** |
| \`-Xlog:gc*\` | GC logging (unified logging, Java 9+) |
| \`-XX:+HeapDumpOnOutOfMemoryError\` | dump heap on OOM |

\`\`\`bash
java -Xms2g -Xmx2g -XX:+UseG1GC -Xlog:gc* -jar app.jar
\`\`\`

- Set **\`-Xms\` = \`-Xmx\`** in servers to avoid repeated heap resizing (and to fail fast if the box can't fit it).
- **Metaspace is native memory** — \`-Xmx\` does *not* bound it.

:::gotcha
In **containers**, don't hard-code \`-Xmx\` — use \`-XX:MaxRAMPercentage=75\` so the heap tracks the pod's memory limit. Older JVMs ignored cgroup limits and sized the heap to the whole host, causing OOM-kills.
:::`,
  },
  {
    id: 'jvm-gc-phases',
    question: 'What are the phases of a tracing garbage collector (mark, sweep, compact)?',
    difficulty: 'Medium',
    category: 'JVM',
    tags: ['gc', 'mark-sweep-compact', 'stop-the-world'],
    answer: `A tracing collector reclaims memory in phases:

1. **Mark** — starting from **GC roots**, traverse the object graph and mark everything **reachable**.
2. **Sweep** — reclaim the space of unmarked (dead) objects.
3. **Compact** — slide surviving objects together to remove the holes left by sweeping.

**Why compact?** Without it the heap **fragments** — free space exists but not in one contiguous block, so a large allocation fails despite "free" memory. Compaction also enables fast **bump-pointer** allocation (just move a pointer).

Young-gen collectors instead use **copying**: live objects are copied to a fresh space and the old one is wiped wholesale — cheap when most objects are dead (the generational hypothesis).

:::senior
The phases needing a consistent view of the heap are **stop-the-world (STW)**: all application threads pause at a **safepoint**. Modern low-latency collectors (**G1, ZGC, Shenandoah**) do marking and even compaction **concurrently** with the app, shrinking STW pauses from hundreds of ms to sub-millisecond — trading extra CPU and memory headroom for latency.
:::`,
  },
  {
    id: 'jvm-custom-classloader',
    question: 'When and how would you write a custom ClassLoader?',
    difficulty: 'Hard',
    category: 'JVM',
    tags: ['classloader', 'isolation', 'plugins'],
    answer: `Extend \`ClassLoader\` and override **\`findClass\`** (not \`loadClass\` — keep parent delegation), obtaining bytes from your source and defining the class:

\`\`\`java
class PluginLoader extends ClassLoader {
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        byte[] bytes = readBytesFor(name);        // network, DB, encrypted jar...
        return defineClass(name, bytes, 0, bytes.length);
    }
}
\`\`\`

Real reasons to do this:
- **Non-standard sources** — load classes from a network, database, or decrypted archive.
- **Isolation** — give each plugin/app its own loader so their classes live in separate namespaces (two versions of a library can coexist). Drop the loader to **unload** everything it loaded.
- **Hot reload** — a new loader per reload replaces the old class versions.

:::gotcha
A class's identity is **(name + defining ClassLoader)**. The *same* \`.class\` loaded by two loaders yields two **incompatible** types — assigning one to the other throws \`ClassCastException: Foo cannot be cast to Foo\`. This is the crux of app-server and OSGi classloading bugs.
:::`,
  },
  {
    id: 'jvm-object-header',
    question: "How much memory does a Java object use, and what's in its header?",
    difficulty: 'Hard',
    category: 'JVM',
    tags: ['object-layout', 'memory', 'compressed-oops'],
    answer: `Every object carries a **header** before its fields:

- **Mark word** (8 bytes) — identity hash code, GC age, lock state (biased/thin/fat), or a forwarding pointer during GC.
- **Klass pointer** (4 bytes with compressed oops, else 8) — points to the class metadata.
- **Arrays** add a 4-byte **length**.

Objects are **padded to an 8-byte boundary**. So on HotSpot with compressed oops an *empty* object is **16 bytes** (12-byte header + 4 padding), and a boxed \`Integer\` is 16 bytes to hold a 4-byte \`int\` — a **4× overhead** versus a primitive.

\`\`\`text
[ mark word (8) | klass ptr (4) | fields... | padding -> 8-byte aligned ]
\`\`\`

**Compressed oops** (default when heap < 32 GB) store references and the klass pointer as 32-bit offsets, roughly halving pointer memory.

:::senior
This is why a \`List<Integer>\` of a million values costs far more than an \`int[]\` — each box is a heap object with a header, plus a reference to it. In memory-critical hot paths, prefer primitives, primitive arrays, and \`IntStream\` to avoid the per-object header tax.
:::`,
  },
  {
    id: 'jvm-diagnostic-tools',
    question: 'What tools do you use to diagnose a running JVM?',
    difficulty: 'Medium',
    category: 'JVM',
    tags: ['tooling', 'jcmd', 'jfr', 'troubleshooting'],
    answer: `The JDK ships a full diagnostic toolkit:

| Tool | Use |
|------|-----|
| \`jps\` | list running JVMs and their PIDs |
| \`jstack\` / \`jcmd <pid> Thread.print\` | **thread dump** — find deadlocks, blocked/hot threads |
| \`jmap\` / \`jcmd <pid> GC.heap_dump\` | **heap dump** — analyze leaks in Eclipse MAT |
| \`jstat -gc\` | GC/heap stats sampled over time |
| \`jcmd\` | Swiss-army: \`GC.run\`, \`VM.flags\`, \`VM.native_memory\` |
| **JFR** (Java Flight Recorder) | low-overhead continuous profiling, viewed in **JMC** |

\`\`\`bash
jcmd <pid> Thread.print          # deadlock? blocked threads?
jcmd <pid> GC.heap_dump /tmp/h.hprof
jcmd <pid> JFR.start duration=60s filename=rec.jfr
\`\`\`

**Workflow:** high CPU → thread dump / JFR profile; rising memory → heap dump + MAT; long pauses → GC logs (\`-Xlog:gc*\`).

:::senior
Prefer **\`jcmd\`** (it subsumes \`jstack\`/\`jmap\`) and **JFR** in production — JFR runs continuously at ~1% overhead, so the recording is already there when an incident happens. \`jmap -dump\` on a struggling process can freeze or kill it.
:::`,
  },
];

export default questions;
