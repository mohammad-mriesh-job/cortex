import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'mt-shared-race-condition',
    question: 'What is a race condition?',
    difficulty: 'Easy',
    category: 'The Shared-State Problem',
    tags: ['race-condition', 'thread-safety', 'concurrency'],
    answer: `A **race condition** is when a program's correctness depends on the **relative timing** of threads — the order in which their operations happen to interleave. Change the scheduling and you change the result.

- It appears whenever threads share **mutable state** without coordination.
- It is **non-deterministic**: the buggy interleaving is one of many possible orderings, so the program usually works — until it fails under load, in production.

The fix is to remove the timing dependency: make the shared access **atomic** (a lock or an atomic class), or avoid sharing altogether (thread confinement, immutability).`,
  },
  {
    id: 'mt-shared-lost-update',
    question: 'Why can two threads each running `count++` once leave `count` at 1 instead of 2?',
    difficulty: 'Easy',
    category: 'The Shared-State Problem',
    tags: ['lost-update', 'read-modify-write', 'atomicity'],
    answer: `Because \`count++\` is not one operation — it is a **read-modify-write** of three steps:

\`\`\`java
int r = count;   // 1. read
r = r + 1;       // 2. modify
count = r;       // 3. write
\`\`\`

If both threads read the same starting value before either writes, they compute the same result and both store it. The second write **clobbers** the first: two increments ran, but the counter moved by one — a **lost update**.

:::key
The bug is that the three steps are not atomic. Fix it by making the read-modify-write indivisible — \`AtomicInteger.incrementAndGet()\` or a lock.
:::`,
  },
  {
    id: 'mt-shared-fix-counter',
    question: 'How do you correctly increment a counter shared by many threads, and how do the options compare?',
    difficulty: 'Medium',
    category: 'The Shared-State Problem',
    tags: ['atomicinteger', 'longadder', 'synchronized', 'counter'],
    answer: `Make the whole read-modify-write **atomic**. Three standard options:

| Option | Mechanism | Best when |
|---|---|---|
| \`AtomicInteger\` | lock-free compare-and-swap | general shared counter |
| \`synchronized\` / \`Lock\` | mutual exclusion | the update spans more than the counter |
| \`LongAdder\` | per-thread cells, summed on read | very high write contention |

\`\`\`java
AtomicInteger count = new AtomicInteger(0);
count.incrementAndGet();          // atomic ++, returns the new value
\`\`\`

:::senior
Under heavy contention a single \`AtomicInteger\` becomes a cache-line hotspot as CAS retries pile up. \`LongAdder\` spreads writes across striped cells and sums them in \`sum()\`, trading a slightly stale/expensive read for far better write throughput — ideal for metrics.
:::`,
  },
  {
    id: 'mt-shared-critical-section',
    question: 'What is a critical section, and what is a compound action?',
    difficulty: 'Easy',
    category: 'The Shared-State Problem',
    tags: ['critical-section', 'compound-action', 'atomicity'],
    answer: `A **critical section** is code that accesses shared mutable state and must **not** run in two threads at the same time.

It usually guards a **compound action** — several steps that must happen as one indivisible unit:

- **read-modify-write** — \`count++\` (read, add, write).
- **check-then-act** — \`if (x == null) x = create();\` (test, then act on the result).

If another thread interleaves between the steps, the invariant breaks. You enforce atomicity with a **lock** (\`synchronized\`) or an **atomic operation** (\`compareAndSet\`, \`putIfAbsent\`).`,
  },
  {
    id: 'mt-shared-check-then-act',
    question: 'What is a check-then-act race? Give an example and the fix.',
    difficulty: 'Medium',
    category: 'The Shared-State Problem',
    tags: ['check-then-act', 'lazy-initialization', 'putifabsent'],
    answer: `**Check-then-act**: you test a condition, then act on it — but the state can change between the check and the act, so you act on a stale fact.

\`\`\`java
// Two threads can both pass the null check and both construct.
if (instance == null) {
    instance = new Service();   // built twice
}
\`\`\`

The same trap hides behind thread-safe collections:

\`\`\`java
if (!map.containsKey(k)) map.put(k, v);   // RACE: another thread inserts between the two calls
map.putIfAbsent(k, v);                    // FIX: one atomic operation
\`\`\`

**Fix** — make check-and-act atomic: a single atomic method (\`putIfAbsent\`, \`computeIfAbsent\`, \`compareAndSet\`), a lock across both steps, or the **holder idiom** for a lazy singleton.

:::gotcha
Using thread-safe building blocks is not enough — each call being atomic does not make the *pair* atomic.
:::`,
  },
  {
    id: 'mt-shared-atomic-compose',
    question: 'If two fields are each an AtomicInteger, is updating both thread-safe? Do atomic operations compose?',
    difficulty: 'Hard',
    category: 'The Shared-State Problem',
    tags: ['atomicity', 'compound-invariant', 'composition', 'immutability'],
    answer: `No. **Atomic operations do not compose.** Each individual update is atomic, but a sequence of two is not — another thread can observe the state *between* them.

Say the invariant is \`x + y == 100\`:

\`\`\`java
AtomicInteger x = new AtomicInteger(50), y = new AtomicInteger(50);
x.addAndGet(10);   // observer here sees x=60, y=50 -> sum 110, invariant broken
y.addAndGet(-10);
\`\`\`

Between the two atomic writes the invariant is violated, and two threads doing this can interleave and corrupt the pair.

**Fix** — guard the *whole invariant* as one unit:

- a single **lock** around both updates, or
- a single **\`AtomicReference\`** to an *immutable* object holding both fields, swapped with \`compareAndSet\`.

:::key
Identify the invariant first, then pick one guard that covers all of it. "Each field is atomic" says nothing about the relationship *between* fields.
:::`,
  },
  {
    id: 'mt-shared-visibility',
    question: 'What is a visibility problem, and why can a plain flag loop never terminate?',
    difficulty: 'Medium',
    category: 'The Shared-State Problem',
    tags: ['visibility', 'jmm', 'caching', 'happens-before'],
    answer: `**Visibility** is whether a write by one thread is ever seen by a read on another. With a plain (non-volatile) field, there is **no guarantee** it will be.

\`\`\`java
boolean stop = false;
while (!stop) { /* work */ }   // T2 — may loop forever
stop = true;                   // T1 — may never be seen
\`\`\`

Two reasons T2 can spin forever:

1. It keeps reading a **cached** copy of \`stop\` from a register / CPU cache and never refreshes from main memory.
2. The **JIT** may hoist the non-volatile read out of the loop, turning \`while (!stop)\` into \`if (!stop) while (true)\`.

**Fix** — create a **happens-before** edge so the write is published: mark \`stop\` \`volatile\`, or read/write it inside a \`synchronized\` block.`,
  },
  {
    id: 'mt-shared-happens-before',
    question: 'What is the happens-before relationship, and what are its main rules?',
    difficulty: 'Medium',
    category: 'The Shared-State Problem',
    tags: ['happens-before', 'jmm', 'memory-model', 'ordering'],
    answer: `**happens-before** is the ordering relation at the heart of the Java Memory Model. If action **A happens-before B**, then A's memory effects are **visible to** and **ordered before** B. No such edge means no guarantee at all.

The main rules to name:

- **Program order** — within one thread, each action happens-before the next.
- **Monitor lock** — unlocking a monitor happens-before any later lock of the same monitor.
- **Volatile** — a volatile write happens-before every later volatile read of that field.
- **Thread start** — \`Thread.start()\` happens-before every action in the started thread.
- **Thread join** — every action in a thread happens-before another thread's return from \`join()\`.
- **Transitivity** — A hb B and B hb C implies A hb C.

:::gotcha
happens-before is a **partial order about visibility/ordering**, not wall-clock time. "A happens-before B" does not mean A physically ran first — it means *if* both run, B must see A's effects.
:::`,
  },
  {
    id: 'mt-shared-reordering',
    question: 'What is instruction reordering, and how does it cause unsafe publication?',
    difficulty: 'Hard',
    category: 'The Shared-State Problem',
    tags: ['reordering', 'unsafe-publication', 'jmm', 'final'],
    answer: `The compiler and CPU may **reorder** independent reads and writes for performance. Within a single thread the result still looks like program order (**as-if-serial**); across threads, with no synchronization, another thread can see the writes in a **different order**.

**Unsafe publication** is the classic victim:

\`\`\`java
Config cfg;          // plain
boolean ready;       // plain
// T1
cfg = new Config();  // (a)
ready = true;        // (b)  -- may become visible to T2 before (a)
\`\`\`

T2 can see \`ready == true\` yet read a \`null\` or **half-constructed** \`cfg\`, because (a) and (b) can be reordered as observed by T2.

**Fix** — establish a happens-before edge so the object is safely published: make the reference \`volatile\`, publish via a \`synchronized\` block or a concurrent collection, or make \`Config\` **immutable** with \`final\` fields (whose values are guaranteed visible once the constructor completes).

:::senior
\`final\` fields have special "freeze" semantics: a thread that sees a properly-published immutable object is guaranteed to see its final fields fully initialized — a cheap, lock-free safe-publication tool.
:::`,
  },
  {
    id: 'mt-shared-volatile',
    question: 'What does volatile guarantee, and what does it not?',
    difficulty: 'Medium',
    category: 'The Shared-State Problem',
    tags: ['volatile', 'visibility', 'ordering', 'atomicity'],
    answer: `\`volatile\` is the lightest synchronization tool. It **guarantees**:

- **Visibility** — a read always sees the most recent write (straight from main memory).
- **Ordering** — reads/writes are not reordered across the access; a volatile write happens-before a later volatile read (a happens-before edge).

It does **not** provide:

- **Atomicity** — \`count++\` is still read-modify-write.
- **Mutual exclusion** — it is not a lock.

**Use it for** single-writer flags (\`stop\`, \`ready\`) and safely publishing an **immutable** reference. Reach for \`AtomicInteger\`/\`LongAdder\` or a lock the moment you need atomicity or a compound update.`,
  },
  {
    id: 'mt-shared-volatile-atomic',
    question: 'Does marking a counter `volatile` make `count++` atomic? Why or why not?',
    difficulty: 'Medium',
    category: 'The Shared-State Problem',
    tags: ['volatile', 'atomicity', 'read-modify-write', 'counter'],
    answer: `**No.** \`volatile\` fixes *visibility*, not *atomicity*, and \`count++\` is a **read-modify-write** regardless of how the field is qualified:

\`\`\`java
volatile int count;
count++;   // read, +1, write — three steps, still interleavable
\`\`\`

Two threads can both read the same value, both increment, and both write it back — a **lost update**. Making the field \`volatile\` guarantees each thread sees the latest value *at the moment it reads*, but nothing stops another thread from writing between the read and the write.

**Fix:**

\`\`\`java
AtomicInteger count = new AtomicInteger();
count.incrementAndGet();   // atomic read-modify-write via CAS
\`\`\`

:::gotcha
Marking a shared counter \`volatile\` is a classic non-fix seen in interviews. Visibility was never the problem — atomicity is.
:::`,
  },
  {
    id: 'mt-shared-double-checked-locking',
    question: 'What is double-checked locking, and why must the field be volatile?',
    difficulty: 'Hard',
    category: 'The Shared-State Problem',
    tags: ['double-checked-locking', 'volatile', 'safe-publication', 'singleton'],
    answer: `**Double-checked locking (DCL)** lazily initializes a singleton while locking only on the first call:

\`\`\`java
private volatile Singleton instance;   // volatile is mandatory

Singleton get() {
    if (instance == null) {                 // 1st check — no lock, fast path
        synchronized (this) {
            if (instance == null) {         // 2nd check — under lock
                instance = new Singleton();
            }
        }
    }
    return instance;
}
\`\`\`

**Why \`volatile\` is required:** \`instance = new Singleton()\` is really *allocate → run constructor → publish reference*, and without \`volatile\` those steps can be **reordered** so the reference is published *before* the constructor finishes. Another thread taking the fast path could then see a non-null but **half-constructed** object. \`volatile\` forbids that reordering and gives safe publication.

:::senior
DCL is subtle and easy to get wrong. Prefer the **holder idiom** (\`static class Holder { static final Singleton INSTANCE = new Singleton(); }\`) — the JVM's class-initialization lock gives lazy, thread-safe, lock-free-on-the-hot-path init with no \`volatile\` to remember.
:::`,
  },
  {
    id: 'mt-shared-atomicity-visibility-ordering',
    question: 'Explain the difference between atomicity, visibility, and ordering.',
    difficulty: 'Medium',
    category: 'The Shared-State Problem',
    tags: ['atomicity', 'visibility', 'ordering', 'jmm'],
    answer: `They are three **independent** correctness properties, and a race can violate any one of them.

| Property | Meaning | Violated by | Fixed with |
|---|---|---|---|
| **Atomicity** | an action is indivisible; no thread sees a partial result | \`count++\` losing an update | locks, atomics |
| **Visibility** | a write becomes observable to other threads | a flag loop that never terminates | \`volatile\`, locks, \`final\` |
| **Ordering** | operations aren't reordered in a way others observe | unsafe publication of a half-built object | \`volatile\` / happens-before |

- \`volatile\` gives **visibility + ordering** but **not** atomicity of a read-modify-write.
- \`synchronized\` gives **all three** for its critical section.

:::key
Diagnose *which* property a bug violates before picking a tool: a lost update is an **atomicity** failure, so \`volatile\` (visibility only) can never fix it.
:::`,
  },
  {
    id: 'mt-shared-increment-bytecode',
    question: 'At the bytecode level, why is `i++` not atomic?',
    difficulty: 'Medium',
    category: 'The Shared-State Problem',
    tags: ['bytecode', 'atomicity', 'read-modify-write', 'increment'],
    answer: `\`javac\` compiles an increment of a **shared field** into three separable bytecodes, and a thread can be preempted between them:

\`\`\`
getfield count      // read
iconst_1, iadd      // compute +1
putfield count      // write
\`\`\`

Starting from \`count == 0\`, two threads can interleave so one write clobbers the other:

| Step | Thread A | Thread B | count |
|---|---|---|---|
| 1 | getfield -> 0 | | 0 |
| 2 | | getfield -> 0 | 0 |
| 3 | iadd -> 1 | | 0 |
| 4 | | iadd -> 1 | 0 |
| 5 | putfield 1 | | 1 |
| 6 | | putfield 1 | 1 |

Two increments ran; \`count\` is **1**, not 2. **Fix:** \`AtomicInteger.incrementAndGet()\` (a single CAS) or a lock.

:::gotcha
A *local* variable compiles to the single \`iinc\` instruction, but locals live on a thread's private stack and are never shared. A shared field always compiles to the \`getfield\`/\`putfield\` pair above.
:::`,
  },
  {
    id: 'mt-shared-safe-publication-idioms',
    question: 'What are the safe ways to publish an object to other threads?',
    difficulty: 'Hard',
    category: 'The Shared-State Problem',
    tags: ['safe-publication', 'visibility', 'final', 'jmm'],
    answer: `An object is **safely published** when *both* its reference and its fully-constructed state are guaranteed visible to any thread that reads the reference. The JMM sanctions these idioms:

1. Initialize it from a **static initializer** — the class-init lock publishes it.
2. Store the reference into a **\`volatile\`** field or an **\`AtomicReference\`**.
3. Store it into a **\`final\`** field of a properly-constructed object.
4. Store it into a field **guarded by a lock** (write and read under the *same* lock).
5. Put it into a **thread-safe collection** (\`ConcurrentHashMap\`, \`BlockingQueue\`, \`Vector\`, ...).

\`\`\`java
private volatile Config cfg;   // idiom 2
cfg = new Config();            // reference + state now safely published
\`\`\`

:::gotcha
Publishing via a **plain, non-final** field is **unsafe**: a reader may see the reference before the constructor's writes land, observing a partially-constructed object.
:::`,
  },
  {
    id: 'mt-shared-leaking-this',
    question: 'What does it mean for `this` to escape during construction, and why is it dangerous?',
    difficulty: 'Hard',
    category: 'The Shared-State Problem',
    tags: ['this-escape', 'safe-publication', 'construction', 'factory'],
    answer: `\`this\` **escapes** when a constructor hands out a reference to the object *before construction finishes* — registering a listener, passing \`this\` to external code, or starting a thread that uses the instance.

\`\`\`java
public Widget(EventSource src) {
    src.registerListener(this);   // ESCAPE: another thread can call us now...
    this.name = "widget";         // ...but this field isn't set yet
}
\`\`\`

Another thread may then observe the object with \`final\` fields not yet frozen and subclass fields still at their defaults — a **half-initialized** view.

**Fix** — construct fully, publish afterward, with a private constructor + static factory:

\`\`\`java
public static Widget create(EventSource src) {
    Widget w = new Widget();   // fully built first
    src.registerListener(w);   // published only now
    return w;
}
\`\`\`

:::key
Never let \`this\` (nor an inner-class \`this\`, nor a thread you \`start()\`) escape a constructor. Build first, publish second.
:::`,
  },
  {
    id: 'mt-shared-thread-confinement',
    question: 'What is thread confinement, and what are its forms?',
    difficulty: 'Medium',
    category: 'The Shared-State Problem',
    tags: ['thread-confinement', 'stack-confinement', 'threadlocal', 'thread-safety'],
    answer: `If data is only ever reachable by **one thread**, it needs no synchronization — the cheapest safety strategy is to not share at all. Three forms, weakest to strongest:

| Form | How it's confined | Strength |
|---|---|---|
| **Ad-hoc** | by convention/discipline only | fragile |
| **Stack** | locals & parameters that never escape | strong, automatic — each thread owns its stack |
| **ThreadLocal** | a per-thread copy behind \`ThreadLocal\` | strong, explicit |

Real examples: Swing confines UI state to the single **event-dispatch thread**; a JDBC \`Connection\` is handed to **one thread at a time** from the pool.

:::key
Stack confinement is the strongest because the JVM enforces it: a local reference that never escapes simply cannot be touched by another thread.
:::`,
  },
  {
    id: 'mt-shared-immutability-strongest',
    question: 'Why is immutability the strongest tool for thread safety?',
    difficulty: 'Medium',
    category: 'The Shared-State Problem',
    tags: ['immutability', 'thread-safety', 'final', 'records'],
    answer: `An **immutable** object has no mutable state, so every thread can only **read** it — no races, no locks, and it can be shared freely and published safely through \`final\` fields. Correctness stops depending on timing entirely.

Requirements for true immutability:

- The class is **\`final\`** (or otherwise non-subclassable).
- **All fields are \`final\`** and set only in the constructor.
- **No setters or mutators.**
- **Defensively copy** any mutable input or output (arrays, collections, \`Date\`).
- **\`this\` must not escape** during construction.

\`\`\`java
public record Point(int x, int y) {}   // final fields, no setters — immutable
\`\`\`

:::senior
Distinguish **immutable** (can never change) from **effectively immutable** (a mutable type that simply is never mutated after safe publication). Both are thread-safe once published; only the first is enforced by the compiler.
:::`,
  },
  {
    id: 'mt-shared-toctou',
    question: 'What is a TOCTOU bug?',
    difficulty: 'Medium',
    category: 'The Shared-State Problem',
    tags: ['toctou', 'check-then-act', 'race-condition', 'security'],
    answer: `**TOCTOU** — *Time-Of-Check-To-Time-Of-Use* — is a check-then-act race: the state changes **between** checking a condition and acting on it, so you act on a stale fact.

\`\`\`java
if (file.exists()) open(file);        // symlink swapped in between -> classic security hole
if (!set.contains(x)) set.add(x);     // another thread inserts x between the two calls
if (map.size() == 0) map.remove(k);   // the size check is already stale when remove runs
\`\`\`

**Fix** — collapse check-and-act into **one atomic operation** (\`putIfAbsent\`, \`computeIfAbsent\`, \`compareAndSet\`) or hold a lock across both steps.

:::gotcha
TOCTOU is also a **security** bug class: an attacker races the window between check and use (e.g., swapping a file for a symlink) to slip past a permission check. Atomicity closes the window.
:::`,
  },
  {
    id: 'mt-shared-no-benign-race',
    question: "Is there such a thing as a 'benign' data race?",
    difficulty: 'Hard',
    category: 'The Shared-State Problem',
    tags: ['data-race', 'jmm', 'undefined-behavior', 'visibility'],
    answer: `**Almost never.** Under the JMM a **data race** (unsynchronized conflicting access) is *undefined* — the compiler is allowed to assume no race exists and optimize on that basis. You can observe stale values forever, torn values on a 64-bit \`long\`/\`double\`, or even out-of-thin-air results.

\`\`\`java
boolean stop;              // plain field, racily read
while (!stop) work();      // the JIT may hoist the read...
// ...into: if (!stop) while (true) work();  -> stop = true is never seen
\`\`\`

So "this race is harmless" is not something you can safely reason about — the *optimizer* decides, not your intuition.

The one real exception: reads of **properly-published immutable** data — there is no conflicting *write*, so there is no race at all.

:::gotcha
Don't bet on a benign race; synchronize correctly. A \`volatile\` or a lock costs almost nothing next to a heisenbug that only surfaces under load in production.
:::`,
  },
  {
    id: 'mt-shared-lost-update-schedule',
    question: 'Show, step by step, how two threads incrementing a shared counter can lose an update.',
    difficulty: 'Medium',
    category: 'The Shared-State Problem',
    tags: ['lost-update', 'interleaving', 'read-modify-write', 'atomicity'],
    answer: `Each thread runs \`count++\` as **read -> add -> write**. If both *read* before either *writes*, they compute the same new value and the second write overwrites the first. Starting from \`count == 0\`:

| Step | Thread A | Thread B | count |
|---|---|---|---|
| 1 | read (sees 0) | | 0 |
| 2 | | read (sees 0) | 0 |
| 3 | add -> 1 | | 0 |
| 4 | | add -> 1 | 0 |
| 5 | write 1 | | 1 |
| 6 | | write 1 | 1 |

Two increments executed, yet \`count\` ends at **1** — one update was lost.

A **serialized** run (A does read/add/write, *then* B does read/add/write) yields **2**; the bug is that the steps can overlap.

:::key
The fix makes the whole read-modify-write **indivisible** — \`AtomicInteger.incrementAndGet()\` or a lock — so no interleaving like the one above can occur.
:::`,
  },
  {
    id: 'mt-shared-effectively-immutable',
    question: "What is an 'effectively immutable' object, and when is it safe to share?",
    difficulty: 'Medium',
    category: 'The Shared-State Problem',
    tags: ['effectively-immutable', 'safe-publication', 'immutability', 'thread-safety'],
    answer: `An **effectively immutable** object has a technically **mutable** type but is **never modified after publication** — for example a \`Date\`, or a populated \`List\` placed into a \`ConcurrentMap\` and thereafter only read.

If it is **safely published**, it can then be shared by many threads with **no further synchronization**. Three cases:

| Kind | Safe to share? |
|---|---|
| **Immutable** (all \`final\`, no mutators) | always |
| **Effectively immutable** (mutable type, never mutated after publish) | yes — *if* safely published, then read-only |
| **Mutable and shared** | only with synchronization on **every** access |

\`\`\`java
map.put("today", new Date());   // safely published; just never mutate that Date again
\`\`\`

:::gotcha
"Effectively immutable" rests on **discipline**: the moment any thread mutates the object after publication, you're back to a mutable-and-shared race. The compiler won't stop you.
:::`,
  },
  {
    id: 'mt-shared-defensive-copy',
    question: 'Why do defensive copies matter for a thread-safe (or immutable) class?',
    difficulty: 'Medium',
    category: 'The Shared-State Problem',
    tags: ['defensive-copy', 'immutability', 'encapsulation', 'thread-safety'],
    answer: `If a class stores a caller-supplied **mutable** object (array, collection, \`Date\`) by reference, or hands its internal reference back from a getter, external code can **mutate the shared internal state** concurrently — breaking invariants and defeating immutability.

Copy on the way **in** and on the way **out**:

\`\`\`java
public final class Reading {
    private final int[] samples;
    public Reading(int[] samples) {
        this.samples = samples.clone();   // copy IN — caller keeps no live handle
    }
    public int[] samples() {
        return samples.clone();           // copy OUT — caller can't mutate ours
    }
}
\`\`\`

Without the copies, a caller mutating the array it passed (or the array it got back) corrupts state that other threads are reading.

:::key
Encapsulation is a thread-safety tool: if no external reference can reach your mutable state, no other thread can race on it.
:::`,
  },
  {
    id: 'mt-shared-stateless-safe',
    question: 'Why are stateless objects always thread-safe?',
    difficulty: 'Easy',
    category: 'The Shared-State Problem',
    tags: ['stateless', 'thread-safety', 'stack-confinement', 'servlet'],
    answer: `A **stateless** object has no fields (or only immutable ones), so there is **no shared mutable state to corrupt**. Every method call works solely on its **local variables and parameters**, which live on the calling thread's own stack — private to that thread.

\`\`\`java
public class TaxService {            // no fields
    public int tax(int amount) {     // 'amount' and locals are stack-confined
        return amount * 7 / 100;
    }
}
\`\`\`

That's why a stateless Servlet or a Spring \`@Service\` singleton safely handles concurrent requests without any synchronization.

:::gotcha
Thread safety evaporates the instant you add a **mutable instance field** — a counter, a cached last-result — to a shared stateless object: now every request races on it.
:::`,
  },
  {
    id: 'mt-shared-guarded-by',
    question: 'What is `@GuardedBy` and why document a synchronization policy?',
    difficulty: 'Easy',
    category: 'The Shared-State Problem',
    tags: ['guardedby', 'synchronization-policy', 'documentation', 'thread-safety'],
    answer: `\`@GuardedBy("lock")\` records **which lock guards a given mutable field**, making the class's *synchronization policy* explicit — and checkable by static-analysis tools.

\`\`\`java
private final Object lock = new Object();
@GuardedBy("lock") private int balance;

void deposit(int n) {
    synchronized (lock) { balance += n; }   // access holds the documented lock
}
\`\`\`

A class is thread-safe only if **every** access to a piece of shared state holds the **correct** lock. An undocumented or inconsistently-applied policy is exactly how bugs creep in — one unguarded read is enough.

:::key
The discipline: name **one guard per invariant**, document it with \`@GuardedBy\`, and honor it on **every** read and write. A written-down policy is one a reviewer — or a tool — can enforce.
:::`,
  },
];

export default questions;
