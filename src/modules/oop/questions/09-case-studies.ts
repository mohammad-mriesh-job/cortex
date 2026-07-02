import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'oop-lld-elevator-strategy',
    question: 'In an elevator-system design, how would you make the car-scheduling policy swappable?',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['lld', 'strategy', 'elevator'],
    answer: `Model it as a **Strategy**: a \`SchedulingStrategy\` interface with \`selectElevator(cars, request)\`, and concrete policies (\`NearestCarStrategy\`, \`ScanStrategy\`, \`EnergySavingStrategy\`). The dispatcher depends on the interface and is **injected** a policy.

\`\`\`java
interface SchedulingStrategy { Elevator selectElevator(List<Elevator> cars, Request r); }
\`\`\`

This is **Open/Closed** — a new policy is a new class, and the dispatcher never changes. Keep each car's targets in a sorted set (\`TreeSet\`) so a moving car can serve same-direction requests in SCAN order.`,
  },
  {
    id: 'oop-lld-elevator-state',
    question: 'Why model an elevator car with the State pattern instead of a mode flag and a switch?',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['lld', 'state', 'elevator'],
    answer: `Because behavior is **mode-dependent** and modes have their own transitions. With State, each of \`IdleState\`, \`MovingState\`, \`DoorsOpenState\` owns its \`next()\` logic; adding a mode (e.g. \`MaintenanceState\`) is a new class that doesn't touch the others.

A \`switch (mode)\` centralizes every mode's logic in one method, so every new mode re-opens and risks breaking existing branches — the opposite of Open/Closed.`,
  },
  {
    id: 'oop-lld-lru-two-structures',
    question: 'Design an LRU cache with O(1) get and put. What structures and why?',
    difficulty: 'Hard',
    category: 'OOP Design',
    tags: ['lld', 'lru', 'data-structures'],
    answer: `Compose **two** structures:

- a **HashMap** \`key → node\` for O(1) lookup, and
- a **doubly-linked list** ordered by recency (most-recent at head, LRU at tail) for O(1) reordering and eviction.

On \`get\`/\`put\`, splice the node to the head; when over capacity, drop the tail node and remove its key from **both** structures. Dummy head/tail **sentinels** remove null-checks at the ends.

:::gotcha
A doubly-linked (not singly-linked) list is required: removing a middle node in O(1) needs the \`prev\` pointer.
:::

Production shortcut: \`LinkedHashMap(cap, 0.75f, true)\` with \`removeEldestEntry\` overridden does access-order LRU out of the box.`,
  },
  {
    id: 'oop-lld-lru-evict-bug',
    question: 'What is the classic bug when implementing eviction in an LRU cache?',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['lld', 'lru', 'bugs'],
    answer: `Unlinking the tail node from the linked list but **forgetting to remove its key from the HashMap**. The map then holds a dangling entry — a memory leak, and a later \`get\` on that key returns a stale node that's no longer in the list. Always evict from **both** structures atomically.`,
  },
  {
    id: 'oop-lld-atm-state',
    question: 'Which design pattern anchors an ATM design, and how do the states work?',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['lld', 'state', 'atm'],
    answer: `The **State pattern**. The \`ATM\` context holds a current \`ATMState\`; each state (\`IdleState\`, \`CardInsertedState\`, \`AuthenticatedState\`, \`DispensingState\`) implements the same interface but honors only its **legal** operations — \`selectWithdraw()\` throws (or is a no-op) until you reach \`AuthenticatedState\`.

Transitions live inside the states (\`enterPin\` on success calls \`atm.setState(new AuthenticatedState())\`), replacing a tangle of \`hasCard\`/\`isAuthenticated\` boolean guards. New states are new classes (OCP).`,
  },
  {
    id: 'oop-lld-atm-dispenser',
    question: 'How would you dispense a withdrawal across multiple note denominations?',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['lld', 'chain-of-responsibility', 'atm'],
    answer: `**Chain of Responsibility.** Each denomination has a handler (₂₀ → ₁₀ → ₅); a handler dispenses as many of its notes as fit, then passes the **remainder** to the next handler in the chain. The chain ends when the remainder is zero (or fails if it can't be made). This keeps each denomination's logic isolated and the order explicit.`,
  },
  {
    id: 'oop-lld-ratelimiter-strategy',
    question: 'Design a rate limiter. What are the main algorithms and how do you keep them swappable?',
    difficulty: 'Hard',
    category: 'OOP Design',
    tags: ['lld', 'strategy', 'rate-limiter'],
    answer: `Hide them behind a \`RateLimiter\` interface (\`boolean allow(clientId)\`) — a **Strategy** — with implementations:

| Algorithm | Trade-off |
|--|--|
| Fixed window | O(1), but 2× burst at window borders |
| Sliding window log | exact, O(N) memory |
| Sliding window counter | O(1), smooth, approximate |
| **Token bucket** | O(1), allows controlled bursts (common default) |
| Leaky bucket | smooths output, adds latency |

Token bucket refills lazily from elapsed time and spends one token per request. Swapping the algorithm is a new class; callers (the gateway) depend only on the interface.`,
  },
  {
    id: 'oop-lld-ratelimiter-thread-safety',
    question: 'What concurrency concern arises in a token-bucket rate limiter, and how do you handle it?',
    difficulty: 'Hard',
    category: 'OOP Design',
    tags: ['lld', 'concurrency', 'rate-limiter'],
    answer: `\`allow()\` is a **read-modify-write** on the bucket's token count (refill, check, decrement). Without synchronization, two threads can both see a token and both proceed, admitting more than the limit.

Fix by locking **per client bucket** (or using atomic operations), not one global lock — so different clients don't serialize against each other:

\`\`\`java
synchronized (bucket) { refill(bucket); if (bucket.tokens >= 1) { bucket.tokens--; return true; } return false; }
\`\`\`

In the distributed case the same atomicity must hold across machines — typically a Redis Lua script or atomic \`INCR\` + TTL.`,
  },
];

export default questions;
