import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'mt-threadlocal-mechanism',
    question: 'How does ThreadLocal provide thread safety without locking?',
    difficulty: 'Medium',
    category: 'The Shared-State Problem',
    tags: ['threadlocal', 'confinement'],
    answer: `It gives **each thread its own independent copy** of the value — **thread confinement**. Since no two threads ever reference the same instance, there is nothing to synchronize.

The classic use is a non-thread-safe helper like \`SimpleDateFormat\`: instead of locking a shared one, each thread gets a private copy via \`ThreadLocal.withInitial(...)\`.`,
  },
  {
    id: 'mt-threadlocal-leak',
    question: 'Why is ThreadLocal dangerous in a thread pool, and how do you use it safely?',
    difficulty: 'Hard',
    category: 'The Shared-State Problem',
    tags: ['threadlocal', 'memory-leak'],
    answer: `A \`ThreadLocal\`'s values live in a map **owned by the thread**. Pool workers are reused and effectively immortal, so a value you \`set()\` but never \`remove()\` stays referenced **forever** — a memory leak — and can **bleed one task's data into the next** task on that thread.

Always \`remove()\` in a \`finally\`:
\`\`\`java
try { CTX.set(user); handle(); }
finally { CTX.remove(); }
\`\`\`
(The map keys are weak references to the ThreadLocal, but the values are strong, which is why the live thread pins them.)`,
  },
  {
    id: 'mt-scopedvalue',
    question: 'What replaces ThreadLocal for virtual-thread code, and why?',
    difficulty: 'Medium',
    category: 'The Shared-State Problem',
    tags: ['scopedvalue', 'virtual-threads'],
    answer: `**\`ScopedValue\`** — an **immutable**, scope-bounded binding. With millions of virtual threads, a per-thread mutable \`ThreadLocal\` copy is wasteful and leak-prone; a \`ScopedValue\` is bound for a dynamic scope and shared structurally, with **automatic cleanup** (no \`remove()\`):

\`\`\`java
ScopedValue.where(USER, currentUser).run(() -> handleRequest());
\`\`\``,
  },
  {
    id: 'mt-phaser-vs-cyclicbarrier',
    question: 'What can a Phaser do that a CyclicBarrier cannot?',
    difficulty: 'Medium',
    category: 'Coordination',
    tags: ['phaser', 'cyclicbarrier', 'barrier'],
    answer: `A \`Phaser\` supports **dynamic registration** — parties can \`register()\` and \`arriveAndDeregister()\` at runtime — and coordinates **multiple numbered phases**. A \`CyclicBarrier\` is reusable but its party count is **fixed** at construction.

Use \`Phaser\` when the number of participants changes across rounds (spawning/finishing tasks, staged pipelines); use \`CyclicBarrier\` for a fixed set that rendezvous each round.`,
  },
  {
    id: 'mt-latch-barrier-phaser',
    question: 'Compare CountDownLatch, CyclicBarrier, and Phaser.',
    difficulty: 'Medium',
    category: 'Coordination',
    tags: ['countdownlatch', 'cyclicbarrier', 'phaser'],
    answer: `| Tool | Reusable? | Parties | Use |
|--|--|--|--|
| **CountDownLatch** | No (one-shot) | fixed | wait for N events once (a startup gate) |
| **CyclicBarrier** | Yes | fixed | N threads rendezvous each round |
| **Phaser** | Yes | **dynamic** | phased work where participants come and go |

The progression is: one-shot latch → fixed reusable barrier → dynamic multi-phase barrier.`,
  },
  {
    id: 'mt-structured-concurrency-why',
    question: 'What problem does structured concurrency solve compared to a raw ExecutorService?',
    difficulty: 'Hard',
    category: 'Concurrency Models',
    tags: ['structured-concurrency', 'cancellation'],
    answer: `Raw \`executor.submit\` is **unstructured**: forks can outlive the method, one subtask's failure leaves siblings running, and cancellation is manual.

\`StructuredTaskScope\` binds subtasks to a **lexical scope** (try-with-resources): they all complete or are cancelled before the block exits, so **errors propagate** and **nothing leaks**.

\`\`\`java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
  var u = scope.fork(() -> fetchUser(id));
  var o = scope.fork(() -> fetchOrder(id));
  scope.join(); scope.throwIfFailed();
  return new Response(u.get(), o.get());
}
\`\`\`

It's the safe partner to virtual threads (thread-per-task). Note it's a preview API still finalizing.`,
  },
  {
    id: 'mt-shutdown-policies',
    question: 'ShutdownOnFailure vs ShutdownOnSuccess in structured concurrency?',
    difficulty: 'Medium',
    category: 'Concurrency Models',
    tags: ['structured-concurrency', 'policies'],
    answer: `- **ShutdownOnFailure** — invoke-all / fail-fast: you need every result; the first failure cancels the remaining subtasks and \`throwIfFailed()\` propagates it.
- **ShutdownOnSuccess** — invoke-any / race: take the **first successful** result and cancel the losers.

Both cancel the now-unneeded siblings automatically when the deciding event occurs.`,
  },
];

export default questions;
