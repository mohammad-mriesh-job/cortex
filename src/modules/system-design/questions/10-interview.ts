import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'sd-iq-framework-steps',
    question: 'Walk me through how you approach a system-design interview from start to finish.',
    difficulty: 'Easy',
    category: 'Interview Framework',
    tags: ['framework', 'process', 'structure'],
    answer: `Follow a repeatable 7-step flow and announce it up front:

1. **Clarify requirements** — functional (features) and non-functional (latency, availability, consistency, scale).
2. **Estimate scale** — QPS, storage, bandwidth.
3. **Define the API** — the contract, a few endpoint signatures.
4. **Data model** — core entities and the storage choice.
5. **High-level design** — the boxes-and-arrows diagram.
6. **Deep dive** — go deep on the 1-2 most interesting components.
7. **Identify & fix bottlenecks** — stress-test at 10x, find the first thing that breaks.

Budget the clock (roughly 5/5/3/4/8/12/8 minutes in a 45-min interview) and spend the most time on the deep dive — that is where you earn the senior signal. The flow is iterative: a bottleneck can send you back to renegotiate a requirement.`,
  },
  {
    id: 'sd-iq-functional-vs-nonfunctional',
    question: 'What is the difference between functional and non-functional requirements? Give examples.',
    difficulty: 'Easy',
    category: 'Interview Framework',
    tags: ['requirements', 'scope'],
    answer: `**Functional** = what the system *does* (features): "users can post a tweet", "followers see it in their feed", "search tweets".

**Non-functional** = the *qualities* it must have: latency (p99 < 200ms), availability (99.99%), scalability (100M DAU), durability, and the consistency model.

Non-functional requirements shape the architecture the most — pin down **consistency, latency, and availability** targets early. Stating "the feed can be eventually consistent, but follow/unfollow must be read-your-writes" reveals senior judgment.`,
  },
  {
    id: 'sd-iq-clarifying-questions',
    question: 'What clarifying questions do you ask before starting a design?',
    difficulty: 'Medium',
    category: 'Interview Framework',
    tags: ['requirements', 'clarifying-questions'],
    answer: `Ask across a few categories, then state assumptions for the rest:

- **Scope**: which features are in scope? MVP vs full?
- **Scale**: how many users / DAU? Reads vs writes?
- **Read/write mix**: read-heavy or write-heavy? (cache vs shard-writes)
- **Consistency**: is stale data acceptable, and for how long?
- **Latency**: acceptable p99?
- **Data**: object size, retention, media?
- **Availability**: downtime tolerance?

You don't need every answer — pick the 3-4 that most affect *this* design and explicitly state assumptions for the rest ("I'll assume 100M DAU, read-heavy"). Stating assumptions is as valuable as asking.`,
  },
  {
    id: 'sd-iq-estimation-qps',
    question: 'A system has 200M DAU each making 2 writes/day at a 100:1 read:write ratio. Estimate write QPS, read QPS, and the design implication.',
    difficulty: 'Medium',
    category: 'Interview Framework',
    tags: ['estimation', 'capacity-planning', 'qps'],
    answer: `Chain: **users → QPS → storage → bandwidth**, rounding a day to **~100,000 seconds**.

- Writes/day = 200M × 2 = **400M/day** → 400M / 10^5 ≈ **4,000 writes/sec**.
- Reads = 100× writes → 40B/day → **~400,000 reads/sec**.

**Implication:** heavily read-dominated (100:1), so **cache aggressively** and add **read replicas**. Write QPS (~4k) is manageable on a sharded store. Multiply read QPS by object size to size the read bandwidth and justify a CDN for media.`,
  },
  {
    id: 'sd-iq-storage-estimation',
    question: 'How do you estimate storage needs, and why does it matter in the interview?',
    difficulty: 'Medium',
    category: 'Interview Framework',
    tags: ['estimation', 'storage'],
    answer: `Storage/day = writes/day × object size. Multiply by the retention period.

Example: 400M writes/day × 300 bytes ≈ 120 GB/day → over 5 years ≈ **220 TB** of text. Media (images/video) dwarfs text, pushing you toward an **object store + CDN**.

It matters because the number directly justifies architectural choices: hundreds of TB means you must **shard** the data store; large media means a **blob store** rather than rows in a DB. Estimation grounds every later decision in numbers instead of hand-waving.`,
  },
  {
    id: 'sd-iq-cap-tradeoff',
    question: 'Explain the CAP trade-off. When do you choose consistency over availability?',
    difficulty: 'Medium',
    category: 'Interview Framework',
    tags: ['tradeoffs', 'cap', 'consistency', 'availability'],
    answer: `During a **network partition** you must choose: refuse the request (**consistency**, CP) or serve possibly-stale data (**availability**, AP). You can't have both while partitioned.

- **Choose CP** when a wrong answer is worse than no answer: money, inventory, seat/booking reservations, payments.
- **Choose AP** when a stale answer is acceptable for a few seconds: feeds, likes, view counts, analytics dashboards.

The senior move is to scope it per-operation: a feed can be AP while the checkout must be CP within the same product.`,
  },
  {
    id: 'sd-iq-sql-vs-nosql',
    question: 'How do you decide between SQL and NoSQL for a design?',
    difficulty: 'Medium',
    category: 'Interview Framework',
    tags: ['tradeoffs', 'sql', 'nosql', 'databases'],
    answer: `**SQL** (Postgres, MySQL): choose when data is relational and correctness matters — ACID transactions, joins, complex queries, multi-row consistency (payments, orders, inventory).

**NoSQL** (Cassandra, DynamoDB): choose for massive horizontal scale, flexible/denormalized schema, and simple key-based access at very high QPS (feed cache, session store, event logs).

Frame it as a trade-off, not a religion: "I'd use Postgres for the transactional order data, and a NoSQL store for the high-volume, denormalized feed reads." Naming both and justifying the split beats "just use X".`,
  },
  {
    id: 'sd-iq-push-vs-pull',
    question: 'Compare push (fan-out on write) vs pull (fan-out on read) for a feed. When does each break down?',
    difficulty: 'Hard',
    category: 'Interview Framework',
    tags: ['tradeoffs', 'fan-out', 'feed'],
    answer: `**Push (fan-out on write):** when a user posts, write the post into every follower's feed immediately. Reads are instant, but writes are expensive — a celebrity with 50M followers triggers 50M writes per post (write amplification).

**Pull (fan-out on read):** assemble the feed at read time by querying who the user follows. Cheap writes, but expensive reads and higher read latency.

The real-world answer is **hybrid**: push for normal users (cheap, instant reads) and pull for celebrities/high-fan-out accounts (avoid the write storm), merging the two at read time.`,
  },
  {
    id: 'sd-iq-tradeoff-narration',
    question: 'How should you communicate a design decision to an interviewer?',
    difficulty: 'Easy',
    category: 'Interview Framework',
    tags: ['tradeoffs', 'communication'],
    answer: `Use a four-part "trade-off sentence" out loud:

1. **Name the decision** — "cache vs read straight from the DB".
2. **State both sides** — "faster reads vs risk of stale data".
3. **Tie it to a requirement** — "reads are 100:1 and staleness is acceptable".
4. **Decide and note the cost** — "I'll add a cache and accept invalidation/TTL complexity".

Acknowledging the **downside of your own choice** is what signals seniority — it builds more trust than pretending your solution has no weaknesses. And narrate continuously so the interviewer can follow and help you.`,
  },
  {
    id: 'sd-iq-common-mistakes',
    question: 'What are the most common mistakes candidates make in system-design interviews?',
    difficulty: 'Easy',
    category: 'Interview Framework',
    tags: ['mistakes', 'process'],
    answer: `- **Jumping straight to a solution** — proposing Kafka/Cassandra before agreeing what to build. Clarify first.
- **No estimation** — choices float free of numbers. Do the QPS/storage math up front.
- **Ignoring bottlenecks** — the design looks naive at scale. Stress-test at 10x.
- **One-sided answers** — "just use X" signals shallow thinking; name the alternative you rejected.
- **Silent thinking** — the interviewer can't follow or help. Narrate and use the whiteboard.
- **Over-engineering** — multi-region for a 100-user app. Match complexity to the stated scale.

The single most common one is jumping to a solution before clarifying requirements.`,
  },
  {
    id: 'sd-iq-latency-numbers',
    question: 'Why should you know the "latency numbers every engineer should know", and what are the key ratios?',
    difficulty: 'Medium',
    category: 'Interview Framework',
    tags: ['cheatsheet', 'latency', 'performance'],
    answer: `You don't need exact nanoseconds — you need the **ratios**, because they justify caching and data locality:

- L1 cache ~1 ns; **main memory ~100 ns**; **SSD random read ~100 µs** (~1,000× RAM); HDD seek ~10 ms.
- **Datacenter round-trip ~500 µs**; **cross-country round-trip ~150 ms**.

Story: **RAM ≫ SSD ≫ disk ≫ cross-region network**, each roughly 100-1,000× apart. This is *why* in-memory caches, read replicas near users, and CDNs pay off — a cross-region hop can dominate the entire request budget.`,
  },
  {
    id: 'sd-iq-availability-nines',
    question: 'What do "the nines" of availability mean, and roughly how much downtime does each allow?',
    difficulty: 'Medium',
    category: 'Interview Framework',
    tags: ['cheatsheet', 'availability', 'sla'],
    answer: `Each extra nine is ~10× less downtime and roughly an order of magnitude more engineering effort:

- **99%** (two nines) → ~3.65 days/year — internal tools.
- **99.9%** (three nines) → ~8.75 hours/year — standard SaaS.
- **99.99%** (four nines) → ~52 minutes/year — serious production.
- **99.999%** (five nines) → ~5 minutes/year — telecom, payments.

More nines require replication, automated failover, and often multi-region deployment. Match the target to the business need rather than defaulting to five nines everywhere.`,
  },
  {
    id: 'sd-iq-component-selection',
    question: 'Given a need, name the right building block: (a) cut read latency, (b) decouple producers from consumers, (c) serve media near users, (d) store 500 TB.',
    difficulty: 'Medium',
    category: 'Interview Framework',
    tags: ['cheatsheet', 'components', 'architecture'],
    answer: `The core reflex — hear a need, name a component:

- **(a) Cut read latency / absorb reads** → a **cache** (Redis, Memcached), plus read replicas.
- **(b) Decouple producers from consumers, smooth spikes** → a **message queue** (Kafka, SQS).
- **(c) Serve static/media near users** → a **CDN**.
- **(d) Store more than one machine holds (500 TB)** → **sharding/partitioning**, and for large files an **object store** (S3).

Other reflexes: SQL for ACID/relations, NoSQL for scale/flexible schema, load balancer in front of stateless tiers, search index (Elasticsearch) for full-text, Bloom filter for cheap "does X exist?" checks.`,
  },
  {
    id: 'sd-iq-scaling-checklist',
    question: 'The interviewer asks "how would you scale this further?" How do you answer without rambling?',
    difficulty: 'Hard',
    category: 'Interview Framework',
    tags: ['cheatsheet', 'scaling', 'checklist'],
    answer: `Walk a patterns checklist top to bottom out loud — it turns an open-ended question into a structured tour:

- **Load balancer** in front of every stateless tier.
- **Cache** on the hot read path (with a TTL/eviction policy).
- **CDN** for static and media.
- **Replication** for durability and read scaling.
- **Sharding** when data or write throughput exceeds one node.
- **Message queue** to decouple and absorb spikes.
- **Rate limiting** to protect against abuse/overload.
- **Monitoring/alerting** — how do you know it's healthy?
- **Single points of failure** — what has no redundancy?
- **Failure modes** — what happens when the cache or a shard dies?

Tie each to the estimated numbers so the scaling is justified, not decorative.`,
  },
  {
    id: 'sd-iq-time-management',
    question: 'How do you manage time so you actually reach the deep dive in a 45-minute interview?',
    difficulty: 'Medium',
    category: 'Interview Framework',
    tags: ['framework', 'time-management'],
    answer: `Budget deliberately and keep the early steps tight:

- Requirements ~5 min, estimation ~5 min, API ~3 min, data model ~4 min, high-level design ~8 min — about 25 minutes to set up shared vocabulary.
- **Deep dive ~12 min** (the biggest slice — this is where you earn the senior signal).
- Bottlenecks & wrap-up ~8 min.

The classic failure is spending 20 minutes drawing boxes and never going deep. Keep the diagram lightweight, announce the plan up front, and if the interviewer says "assume requirements, get to the design", skip ahead. Reading the room beats following the checklist rigidly.`,
  },
  {
    id: 'sd-iq-estimation-cheatsheet',
    question: 'What back-of-the-envelope numbers should you have memorized for estimation?',
    difficulty: 'Easy',
    category: 'Interview Framework',
    tags: ['cheatsheet', 'estimation', 'numbers'],
    answer: `Fluency comes from a few anchors you can chain:

- **Time**: ~**100,000 seconds/day** (86,400 rounded). So *daily ops ÷ 10^5 ≈ average QPS*; ×2–3 for peak.
- **Sizes**: char/int ~1–4 B, a tweet ~300 B, a small image ~200 KB–1 MB, a photo ~1–2 MB, a minute of video ~10–50 MB.
- **Powers of 2**: 2^10 ≈ 1 KB, 2^20 ≈ 1 M, 2^30 ≈ 1 B; **2^32 ≈ 4 billion** (why a 32-bit id runs out).
- **Latency ladder**: RAM ~**100 ns**, SSD ~**100 µs**, same-DC round-trip ~**0.5 ms**, cross-region ~**50–150 ms**.
- **Throughput**: one Postgres node ~**10–50k QPS**, Redis ~**100k ops/s**.

:::key
The single trick that unlocks most questions: **DAU × actions/user ÷ 100,000 = average QPS**, then ×3 for peak. Memorize the anchors so you can derive storage and bandwidth on the spot instead of freezing.
:::`,
  },
  {
    id: 'sd-iq-practicing-solo',
    question: 'How do you practice system design effectively on your own?',
    difficulty: 'Easy',
    category: 'Interview Framework',
    tags: ['practice', 'preparation', 'process'],
    answer: `Deliberate practice against the **real format**, not passive reading:

- Pick a known system (URL shortener, Twitter, chat, YouTube) and design it **end to end, out loud, under a 45-minute timer** — the time pressure *is* the skill.
- Follow the **same framework every time** (requirements → estimation → API → data model → high-level → deep dive → bottlenecks) until it's automatic, so in the real interview your brainpower goes to the problem, not the process.
- Afterward, compare against a reference and note what you missed, then **redo it**.
- Build a **library of reusable components** (cache, queue, LB, sharding, fan-out) so you're *composing* known parts, not inventing from scratch.

:::senior
The highest-leverage practice is **mock interviews with a peer who pushes back** — solo work can't simulate handling hints, defending trade-offs, or being interrupted. Explaining out loud also exposes the gaps that silent reading hides.
:::`,
  },
  {
    id: 'sd-iq-dont-know',
    question: 'What do you do when the interviewer asks about something you don\'t know?',
    difficulty: 'Easy',
    category: 'Interview Framework',
    tags: ['communication', 'honesty', 'reasoning'],
    answer: `Don't bluff — interviewers spot it instantly and it's the fastest way to lose trust. Instead:

- **Reason from fundamentals**: "I haven't used that specific database, but for *this* access pattern I'd want a key-value store with these properties…" — you show you can derive the answer without the trivia.
- **Be honest and bound it**: "I don't know X's internals; here's my mental model — correct me." Then use their correction.
- **Narrow to what you do know** and make a reasoned choice with stated assumptions.

:::senior
Seniority isn't knowing every technology — it's **sound judgment under uncertainty**. Admitting a gap and reasoning through it beats confidently stating something *wrong*, which makes the interviewer doubt everything else you said. Treat hints as collaboration, not failure.
:::`,
  },
  {
    id: 'sd-iq-drawing-diagram',
    question: 'How should you actually draw the high-level design on the whiteboard?',
    difficulty: 'Medium',
    category: 'Interview Framework',
    tags: ['diagram', 'high-level-design', 'communication'],
    answer: `Draw **boxes (components) before arrows (data flow)**, then walk one request end to end.

- Start at the request entry (**client → DNS/CDN → load balancer → service**) and add components **only as a requirement forces them in** — resist drawing your whole toolbox up front.
- Then trace a **concrete flow**: "user posts a tweet → API → write to DB → enqueue fan-out → workers push to follower caches." Label arrows with *what* flows.
- Keep it legible: **6–12 boxes**. A wall of 30 boxes signals no prioritization.

:::gotcha
Two failure modes: (1) spending 20 minutes making the diagram *pretty* and never going deep — keep it a rough sketch; (2) drawing components with **no justification**. Every box should trace back to a requirement or an estimated number, and you should be able to say **why it's there**.
:::`,
  },
  {
    id: 'sd-iq-choosing-deep-dive',
    question: 'The interviewer says "pick something to go deep on." How do you choose?',
    difficulty: 'Medium',
    category: 'Interview Framework',
    tags: ['deep-dive', 'prioritization', 'process'],
    answer: `Go where the design is **weakest or most interesting** — the component carrying the most load, the trickiest requirement, or the biggest bottleneck you found at 10× scale. That's where senior signal lives.

- **Read the room**: interviewers often steer ("tell me more about the feed") — follow the hint; it's usually what they're scoring.
- **Good default picks**: the highest-QPS path (how cache/sharding handle it), the hardest **consistency** requirement (avoiding double-charge / oversell), or the scaling **bottleneck** (celebrity fan-out, hot partition).
- **Avoid** deep-diving the trivial part (how the login form works) — it wastes your best minutes.

:::senior
**State why you chose it**: "the feed fan-out is where this design lives or dies at 100M users, so let me go there." Naming the **highest-risk component** and attacking it is itself a senior move — it shows you know where the hard part is.
:::`,
  },
  {
    id: 'sd-iq-handling-pushback',
    question: 'The interviewer pushes back on your design or drops a hint. How do you respond?',
    difficulty: 'Medium',
    category: 'Interview Framework',
    tags: ['pushback', 'communication', 'adaptability'],
    answer: `Treat pushback as **collaboration, not an attack** — it's usually a nudge toward something you missed or a probe of your reasoning.

- If it's a **hint** ("what happens when that user has 50M followers?"), they're pointing at a flaw — **engage it**, don't defend. "Good point — pure fan-out breaks there; let me switch to a hybrid."
- If you **disagree**, defend with a reason and a trade-off, not stubbornness: "I chose eventual consistency here because the feed tolerates staleness; if we need read-your-writes I'd add…" — then yield gracefully if they change the requirement.
- **Never freeze or get defensive**; think out loud so they can follow and help.

:::senior
The strongest signal is **updating your design fluidly** on new information. Rigidly defending a broken choice reads as junior — interviewers want to see how you think under pressure, and **changing your mind for a good reason is a strength**, not a loss.
:::`,
  },
  {
    id: 'sd-iq-wrapping-up',
    question: 'How do you end a system-design interview strongly in the last few minutes?',
    difficulty: 'Medium',
    category: 'Interview Framework',
    tags: ['wrap-up', 'bottlenecks', 'monitoring'],
    answer: `Don't trail off — close with a summary that shows **operational maturity**:

- **Recap** the design in 2–3 sentences tied back to the requirements ("this meets 100M DAU, read-heavy, eventually-consistent feed via…").
- Name the **bottlenecks and SPOFs** you'd watch and how you'd **scale further** (the checklist: cache, shard, replicate, queue).
- Mention **monitoring/alerting** — which metrics say it's healthy (RED / the golden signals) and what happens on failure.
- List **next steps** — the trade-offs you knowingly deferred with more time.

:::senior
Proactively stating your design's **weaknesses and what you'd monitor** is a top senior signal — it shows you know no design is perfect and you think about **operating** the system, not just drawing it. Ending with "here's what would break first and how I'd know" lands far better than "…and that's it."
:::`,
  },
  {
    id: 'sd-iq-changing-requirements',
    question: 'Mid-interview the requirement changes — "10× the scale" or a new feature. How do you adapt?',
    difficulty: 'Hard',
    category: 'Interview Framework',
    tags: ['adaptability', 'scaling', 'bottlenecks'],
    answer: `This is deliberate — they're testing whether your design **flexes or shatters**. Handle it methodically:

- **Re-run the numbers**: restate the new scale and recompute QPS/storage so the change is grounded ("100M → 1B users ≈ 10× QPS, so one sharded DB won't hold it").
- **Find the first thing that breaks** at the new scale and address that *specific* bottleneck rather than redesigning everything — a good design **degrades gracefully** (add shards, add a cache tier, split a service).
- For a **new feature**, place it in the existing architecture and note what it stresses ("adding DMs reuses the chat path but needs a new store").

:::senior
The signal is that your architecture has **clean seams** — stateless tiers scale by adding nodes, data scales by sharding, spikes absorb into queues. If a 10× ask forces a **ground-up rewrite**, that itself exposes a rigid design. Show you anticipated the **axis of growth**.
:::`,
  },
  {
    id: 'sd-iq-seniority-expectations',
    question: 'What separates a junior, senior, and staff-level answer to the same design question?',
    difficulty: 'Hard',
    category: 'Interview Framework',
    tags: ['leveling', 'expectations', 'seniority'],
    answer: `The same problem is scored very differently by level:

| Level | What's expected |
|--|--|
| **Junior** | Produces a working design **with guidance**; knows the components (cache, DB, LB) and assembles them once prompted. |
| **Senior** | **Drives independently**, justifies every choice with a trade-off **and numbers**, anticipates bottlenecks (celebrity fan-out, hot keys), scopes consistency per-operation. |
| **Staff** | **Frames the problem itself** — challenges requirements, weighs org/operational cost, failure modes, migration paths, and multi-year evolution; connects design to business trade-offs. |

:::senior
The axis is **ownership and depth**: juniors *answer*, seniors *decide and defend*, staff *define the problem* and its trade-off space. Concretely — a senior says "cache here, accept staleness because reads are 100:1"; a staff engineer adds "and here's how it degrades, what it costs to operate, and when we'd revisit it."
:::`,
  },
];

export default questions;
