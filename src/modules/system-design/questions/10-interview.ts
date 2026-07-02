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
];

export default questions;
