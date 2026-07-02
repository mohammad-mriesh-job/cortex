import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'sd-dist-consensus-why-hard',
    question: 'Why is reaching consensus across machines fundamentally hard?',
    difficulty: 'Medium',
    category: 'Distributed Systems',
    tags: ['consensus', 'flp', 'failure-detection'],
    answer: `In one process, "agree on X" is an assignment. Across a network it fights three problems at once:

- **Crashes** — a node with the answer can die before sharing it.
- **Message loss/delay** — you cannot distinguish a *slow* node from a *dead* one, so no timeout is provably correct.
- **Split brain** — a network partition can leave two halves each believing they are in charge.

:::key
The **FLP impossibility** result proves that in a fully asynchronous network with even one crash, no algorithm can *guarantee* consensus in bounded time. Real systems dodge this with **timeouts** (a failure detector): they terminate *almost always* and are *always* correct. Safety is never sacrificed — only liveness is best-effort.
:::`,
  },
  {
    id: 'sd-dist-raft-leader-election',
    question: 'How does Raft elect a leader, and why can there never be two leaders in one term?',
    difficulty: 'Medium',
    category: 'Distributed Systems',
    tags: ['raft', 'consensus', 'leader-election'],
    answer: `Time is divided into **terms**, each with at most one leader. A follower that stops receiving heartbeats becomes a **candidate**, increments the term, votes for itself, and requests votes from the others.

- A node grants **exactly one vote per term**.
- A candidate becomes leader only on a **majority** of votes.

Because each node votes once and a majority is required, **two candidates cannot both reach a majority in the same term** — that would need some node to vote twice. That single rule prevents split brain.

:::note
Election timeouts are **randomized** (e.g. 150–300 ms) so nodes rarely time out together, which avoids repeated split votes — one candidate usually asks first and wins.
:::`,
  },
  {
    id: 'sd-dist-quorum-wrn',
    question: 'Explain the quorum rule W + R > N. What does it guarantee and what does it not?',
    difficulty: 'Medium',
    category: 'Distributed Systems',
    tags: ['quorum', 'consistency', 'replication'],
    answer: `With \`N\` replicas, a write waits for \`W\` acks and a read consults \`R\` replicas. If **W + R > N**, every read set overlaps every write set in **at least one** node, so a read is guaranteed to see the latest acknowledged write.

| Config (N=3) | W | R | Result |
|---|---|---|---|
| Strong | 2 | 2 | W+R=4 > 3 → consistent |
| Fast/loose | 1 | 1 | 2 < 3 → may read stale |

:::gotcha
Overlap gives **read-your-writes consistency**, not full linearizability — concurrent writes still conflict and need resolution (last-writer-wins by timestamp, or version vectors). Also, choosing \`W = N\` means a single node failure blocks all writes: quorums trade availability for consistency.
:::`,
  },
  {
    id: 'sd-dist-2pc-blocking',
    question: 'What is two-phase commit and what is its fatal weakness?',
    difficulty: 'Hard',
    category: 'Distributed Systems',
    tags: ['2pc', 'transactions', 'atomicity'],
    answer: `A **coordinator** drives participants through two rounds:

1. **Prepare** — each participant locks its rows and votes *yes* only if certain it can commit.
2. **Commit/abort** — if **all** voted yes, commit everywhere; any single *no* aborts everywhere.

It delivers true atomicity and is common inside a datacenter (XA). The fatal flaw:

:::gotcha
**2PC is blocking.** Between voting yes and hearing the decision, a participant holds its **locks**. If the **coordinator crashes** after prepare but before the decision, participants are stuck **in doubt** — they cannot commit or abort until it recovers. The coordinator is a single point of failure and one slow node stalls everyone.
:::`,
  },
  {
    id: 'sd-dist-saga-compensation',
    question: 'What is the Saga pattern, and how does it "roll back" a partially completed transaction?',
    difficulty: 'Hard',
    category: 'Distributed Systems',
    tags: ['saga', 'transactions', 'microservices', 'compensation'],
    answer: `A **Saga** replaces a global transaction with a **sequence of local transactions**, each committing immediately in its own service. There is no rollback — if a later step fails, the saga runs **compensating transactions** that *semantically undo* the completed steps (refund the charge, release the reservation), in reverse order.

Example: create order → charge card → reserve stock **fails** → compensate: refund card → cancel order. Net effect: no money kept, no stock held.

:::warning
A Saga has **no isolation** — intermediate states (a \`PENDING\` order) are visible to other transactions. Counter it with **semantic locks** (a status other flows respect) and make every step **idempotent** so retries are safe.
:::`,
  },
  {
    id: 'sd-dist-saga-choreo-vs-orch',
    question: 'Choreography vs orchestration for a Saga — what is the difference and when do you pick each?',
    difficulty: 'Medium',
    category: 'Distributed Systems',
    tags: ['saga', 'choreography', 'orchestration', 'events'],
    answer: `Both coordinate a saga; they differ in **who decides the next step**:

- **Choreography** — no central brain. Each service emits **events**; others react (\`OrderCreated\` → Payments charges → emits \`PaymentCompleted\` → Inventory reserves). Decoupled and no single point of failure, but the end-to-end flow is hard to see and debug. Best for **simple** sagas (2–4 steps).
- **Orchestration** — a central **orchestrator** explicitly calls each step and fires compensations on failure. Flow is explicit, easy to monitor and test, but the orchestrator is extra infrastructure and a coupling hotspot. Best for **complex** sagas with branching.

:::key
Rule of thumb: choreography for short flows, orchestration once the step count or branching makes the implicit event chain hard to follow.
:::`,
  },
  {
    id: 'sd-dist-idempotency-key',
    question: 'A client retries a payment because the response was lost. How do you prevent a double charge?',
    difficulty: 'Medium',
    category: 'Distributed Systems',
    tags: ['idempotency', 'retries', 'payments'],
    answer: `Use an **idempotency key**. The client generates a unique key (UUID) and sends it with the request. The server records the key alongside the *result* of the first attempt; any later request with the **same key** returns the **stored result** instead of re-executing.

So even if the client retries because the original 200 was lost in the network, the card is charged **once**.

:::gotcha
**Store the key and perform the effect atomically.** If you charge the card and then crash before saving the key, the retry re-charges. Wrap "record key + do effect" in one transaction, or write the key as \`PENDING\` first and flip to \`DONE\` on commit so a concurrent retry waits rather than double-executing.
:::`,
  },
  {
    id: 'sd-dist-exactly-once-myth',
    question: 'A stakeholder demands "exactly-once" message delivery. How do you respond?',
    difficulty: 'Hard',
    category: 'Distributed Systems',
    tags: ['exactly-once', 'at-least-once', 'deduplication'],
    answer: `Exactly-once **delivery** is not achievable over an unreliable network — you can't distinguish a lost message from a lost ack, so you must either risk dropping (at-most-once) or risk duplicating (at-least-once).

The practical answer is **at-least-once delivery + idempotent processing** = exactly-once **effect**:

- Retry until acked, so nothing is lost.
- Dedup on the consumer using a message ID / idempotency key (a dedup store with a TTL, a unique DB constraint, or per-producer sequence numbers).

:::senior
Distinguishing **delivery** from **effect** is the whole insight. "Kafka exactly-once" is producer IDs + sequence numbers doing dedup — not magic. The business only cares that the effect happens once.
:::`,
  },
  {
    id: 'sd-dist-modulo-vs-ring',
    question: 'Why not shard keys with hash(key) % N, and what does consistent hashing do instead?',
    difficulty: 'Medium',
    category: 'Distributed Systems',
    tags: ['consistent-hashing', 'sharding', 'hash-ring'],
    answer: `With \`hash(key) % N\`, changing \`N\` by one changes the modulus, so **nearly every key** (about (N-1)/N of them) maps to a different node — a rehash storm and mass cache misses.

**Consistent hashing** maps both keys and nodes onto a circular space and assigns each key to the **first node clockwise**. Adding or removing a node only reassigns the keys in the **one arc** next to it — about **1/N** of keys move, not all of them.

:::key
The whole win: a membership change costs ~1/N of the keys instead of ~all of them. Used by Dynamo, Cassandra, CDNs, and load balancers.
:::`,
  },
  {
    id: 'sd-dist-virtual-nodes',
    question: 'What problem do virtual nodes solve in consistent hashing?',
    difficulty: 'Medium',
    category: 'Distributed Systems',
    tags: ['consistent-hashing', 'virtual-nodes', 'load-balancing'],
    answer: `With few real nodes, their random ring positions create **uneven arcs** — one node may own a huge share and become a hotspot. And when a node dies, its **entire** load falls on the single next node.

**Virtual nodes** hash each physical node onto the ring under many labels (\`A#1 … A#150\`), so each server owns **many small arcs** scattered around the ring:

- Load evens out (law of large numbers).
- A departing node's traffic spreads across **many** nodes, not one neighbor.
- Heterogeneous hardware: give a bigger box **more** vnodes for a larger share.

Real systems use **100–256 vnodes per physical node** (Dynamo, Cassandra).`,
  },
  {
    id: 'sd-dist-clock-skew',
    question: 'Why should you never order distributed events by wall-clock timestamp?',
    difficulty: 'Medium',
    category: 'Distributed Systems',
    tags: ['clocks', 'clock-skew', 'ordering'],
    answer: `Every server's clock drifts, and even with **NTP** two machines can disagree by tens to hundreds of milliseconds — NTP can even step a clock *backwards*. So a causally **later** write can carry an **earlier** timestamp.

Under last-writer-wins by timestamp, that means the **newest data is silently discarded**. Wall-clock time is fine for *display* but unsafe for *ordering*.

:::note
Google **Spanner** works around this with **TrueTime** (GPS + atomic clocks) that exposes time as a bounded interval and *waits out* the uncertainty before committing — at the cost of special hardware. Most systems instead use **logical clocks**.
:::`,
  },
  {
    id: 'sd-dist-lamport-vs-vector',
    question: 'Lamport clocks vs vector clocks — what does each give you?',
    difficulty: 'Hard',
    category: 'Distributed Systems',
    tags: ['lamport-clock', 'vector-clock', 'causality'],
    answer: `Both are **logical clocks** capturing causality (happens-before) rather than physical time.

- **Lamport clock** — one integer per process; on receive, \`counter = max(local, received) + 1\`. Guarantees *if A → B then L(A) < L(B)*, giving a **total order** consistent with causality. But the converse is false — a smaller counter does **not** prove causality, so it **cannot detect concurrency**.
- **Vector clock** — one integer **per process** (an array). Compare element-wise: if one vector dominates, that event happened first; if **neither dominates**, the events are **concurrent** — a genuine conflict.

:::senior
Use a **Lamport clock** when you just need *a* consistent order (e.g. a tie-break). Use a **vector clock** when you must detect concurrent writes and resolve conflicts instead of losing data to last-writer-wins (Dynamo returns both versions as siblings). Vector clocks cost more (grow with the number of processes) and need pruning at scale.
:::`,
  },
];

export default questions;
