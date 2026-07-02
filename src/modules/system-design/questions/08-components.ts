import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'sd-comp-storage-picker',
    question: 'Walk me through how you choose a storage type for a new feature.',
    difficulty: 'Medium',
    category: 'Core Components',
    tags: ['storage', 'databases', 'nosql', 'decision'],
    answer: `Match the **workload** to the storage **shape** — don't start from a product:

1. **Large binaries?** (images, video, backups) → **object store (S3)** behind a CDN; keep only the URL + metadata in the DB.
2. **Lookups by a single known key, ultra-low latency?** → **key-value** (Redis, DynamoDB) — sessions, caches.
3. **Relationships + transactions + ad-hoc queries?** → **relational** (Postgres, MySQL). This is the default.
4. **Enormous write volume / time-series with a known query pattern?** → **wide-column** (Cassandra, Bigtable).
5. **Nested data read as one self-contained unit?** → **document** (MongoDB).

:::key
Default to **relational** and reach for a NoSQL shape only to remove a *named* limitation (write scale, key-only access, nested reads). "We might need to scale" is not a reason — a concrete access pattern is.
:::`,
  },
  {
    id: 'sd-comp-sql-vs-nosql-myth',
    question: 'Someone argues "we must use NoSQL because SQL doesn\'t scale." How do you respond?',
    difficulty: 'Medium',
    category: 'Core Components',
    tags: ['sql', 'nosql', 'scaling', 'trade-offs'],
    answer: `Push back: that's a myth. **Postgres handles tens of thousands of writes/sec** and scales reads with replicas; most companies never outgrow a well-tuned relational primary.

NoSQL earns its place by removing a **specific** relational limitation:
- **Horizontal write scale** for huge time-series → wide-column.
- **Key-only access at sub-ms latency** → key-value.
- **Nested documents read whole** → document store.

The real cost of NoSQL is giving up **joins, flexible ad-hoc queries, and (often) strong consistency**. Choose it for the **access pattern and data shape**, not from a vague fear.

:::gotcha
Denormalizing into NoSQL trades read speed for write complexity — you now maintain duplicated data and pre-joined views. That's a real engineering cost, not a free win.
:::`,
  },
  {
    id: 'sd-comp-blob-storage',
    question: 'Where should user-uploaded images and videos be stored, and why not in the database?',
    difficulty: 'Easy',
    category: 'Core Components',
    tags: ['blob-storage', 'object-store', 'cdn', 'media'],
    answer: `In an **object/blob store** (S3, GCS, Azure Blob), with a **CDN in front** for reads. The database holds only the **URL + metadata** (owner, size, content-type, timestamps).

Storing large binaries *inside* the DB:
- Bloats **backups** and replication.
- Evicts useful rows from the **buffer pool**, hurting query performance.
- Wastes expensive transactional storage on immutable bytes.

The standard flow: app writes bytes → object store, writes metadata → DB; reads go through a **CDN** that pulls from the object store on a miss.

:::key
Bytes in the object store (behind a CDN), URL + metadata in the DB. This split appears in almost every media-heavy design.
:::`,
  },
  {
    id: 'sd-comp-queue-vs-stream',
    question: 'What is the difference between a message queue and an event stream like Kafka?',
    difficulty: 'Medium',
    category: 'Core Components',
    tags: ['queue', 'kafka', 'streaming', 'messaging'],
    answer: `A **message queue** (RabbitMQ, SQS) is a to-do list: each message is delivered to **one** competing worker and **deleted on ack**. No history, no replay.

An **event stream / log** (Kafka) is an **append-only, retained** log. Consumers read at their own **offset**, so:
- **Many independent consumer groups** read the *same* events (fan-out).
- Anyone can **replay** history by resetting their offset.
- Ordering is guaranteed **within a partition**.

| | Queue | Stream |
|--|--|--|
| After consume | deleted | retained |
| Consumers | compete | independent offsets |
| Replay | no | yes |

:::key
Queue = **push and forget** (task distribution). Stream = **store and replay** (analytics, reprocessing, event sourcing). If you need multiple consumers or history, you need a stream.
:::`,
  },
  {
    id: 'sd-comp-retention-replay',
    question: 'Why is retention/replay in Kafka useful, and what is the catch?',
    difficulty: 'Medium',
    category: 'Core Components',
    tags: ['kafka', 'replay', 'retention', 'event-sourcing'],
    answer: `Because the log **keeps** events, you can:
- **Replay** history into a brand-new consumer (e.g., a new analytics service reads from offset 0).
- **Reprocess** after a bug fix by resetting the offset and re-running corrected logic.
- Serve **multiple consumers** at their own pace, none blocking the others.
- Do **event sourcing** — the log is the source of truth; state is a fold over events.

**The catch:** retention is **bounded** by time or size (e.g., 7 days), after which segments are deleted or compacted. "Infinite replay" only holds inside the retention window unless you enable tiered storage.

:::gotcha
Don't assume the log is forever. If you need long-term history, configure retention explicitly or archive to an object store.
:::`,
  },
  {
    id: 'sd-comp-delivery-guarantees',
    question: 'Explain at-most-once, at-least-once, and exactly-once delivery. Which do you design for?',
    difficulty: 'Hard',
    category: 'Core Components',
    tags: ['messaging', 'delivery-semantics', 'idempotency'],
    answer: `- **At-most-once** — fire and forget; may **drop** messages. Fine for metrics.
- **At-least-once** — retried until acked; may **duplicate**. The common default.
- **Exactly-once** — no loss, no dupes. Expensive, narrow, and often only within one ecosystem.

Design for **at-least-once + idempotent consumers**: processing the same message twice must have the same effect as once (e.g., dedupe on a message ID, or use upserts). This gets you exactly-once *effects* without the cost of true exactly-once transport.

:::key
Real systems assume **at-least-once** and make consumers **idempotent**. Chasing true exactly-once delivery is a classic over-engineering trap.
:::`,
  },
  {
    id: 'sd-comp-inverted-index',
    question: 'How does full-text search work under the hood? Why not just use SQL LIKE?',
    difficulty: 'Medium',
    category: 'Core Components',
    tags: ['search', 'inverted-index', 'elasticsearch'],
    answer: `\`LIKE '%term%'\` forces a **full table scan** (O(n)) and can't rank results — it collapses at scale.

Real search uses an **inverted index**: a map from **term → posting list** (the documents containing that term). To search, you jump straight to the term's list; a multi-word query **intersects** the sorted posting lists. Matches are then **ranked** by relevance (TF-IDF / BM25).

Before indexing, text is **analyzed**: lowercased, tokenized, **stemmed** ("running" → "run"), and stripped of **stop words**, so queries match variants.

:::key
Inverted index = term → documents, precomputed. It turns search from a scan into a couple of lookups plus a relevance ranking. This is what Lucene/Elasticsearch are built on.
:::`,
  },
  {
    id: 'sd-comp-elasticsearch-role',
    question: 'Is Elasticsearch a database? How should it relate to your primary store?',
    difficulty: 'Medium',
    category: 'Core Components',
    tags: ['elasticsearch', 'search', 'consistency', 'cdc'],
    answer: `No — treat Elasticsearch as a **derived read model**, not a system of record. The **primary DB stays the source of truth**; Elasticsearch is a **sharded, replicated search index** fed *from* the DB, often via **change-data-capture (CDC)**.

It favors **availability and near-real-time indexing** over strong consistency, so a just-written record may take a moment to become searchable. Writes go to the DB; search queries go to Elasticsearch.

:::gotcha
Never make Elasticsearch your only copy of the data. If the index is lost or corrupted, you rebuild it from the source of truth. Using it as a primary store risks silent data loss and consistency surprises.
:::`,
  },
  {
    id: 'sd-comp-autocomplete',
    question: 'How would you build autocomplete/typeahead that responds on every keystroke?',
    difficulty: 'Hard',
    category: 'Core Components',
    tags: ['autocomplete', 'trie', 'typeahead', 'latency'],
    answer: `Typeahead fires on **every keystroke** under a tens-of-milliseconds budget, so a full search per key is too slow. Use a structure built for prefixes:

- A **trie (prefix tree)** or **edge-n-gram** index, held **in memory** (Redis or a dedicated service).
- **Precompute and rank** top completions per prefix by popularity, cached at the prefix node.
- **Debounce** keystrokes on the client to cut request volume.

Each keystroke becomes a fast **prefix lookup** returning ranked suggestions — not a relevance-scored search.

:::key
Full-text search (inverted index + ranking) and autocomplete (trie/n-gram prefix lookup) are **different problems**. Autocomplete is optimized for per-keystroke latency, so it gets its own in-memory structure.
:::`,
  },
  {
    id: 'sd-comp-dns-cdn-lb-combine',
    question: 'Trace how DNS, a CDN, and a load balancer combine on the front edge of a request.',
    difficulty: 'Easy',
    category: 'Core Components',
    tags: ['dns', 'cdn', 'load-balancer', 'networking'],
    answer: `The first three hops of nearly every request:

1. **DNS** resolves the name → IP (and can do coarse **geo-routing**, returning the nearest region's edge). TTL-cached, so it reacts slowly.
2. **CDN edge** serves cached static/cacheable content **near the user** — an edge hit never touches the origin. On a miss it forwards to the origin.
3. **Load balancer** at the origin spreads the request across **healthy, stateless app servers**, health-checking and hiding failures. Reacts instantly.

Flow: **DNS → CDN → Load Balancer → App**.

:::key
DNS = name→IP + coarse geo-routing (slow). CDN = content near the user, offloads origin (fast, edge). LB = even distribution + failover across servers (instant). Same three boxes in almost every design.
:::`,
  },
  {
    id: 'sd-comp-l4-vs-l7-lb',
    question: 'When would you choose an L7 load balancer over an L4 one?',
    difficulty: 'Medium',
    category: 'Core Components',
    tags: ['load-balancer', 'l4', 'l7', 'routing'],
    answer: `- **L4 (transport / TCP)** — fast and simple; forwards packets by IP/port without understanding the payload. Highest throughput, lowest latency.
- **L7 (application / HTTP)** — understands requests, so it can **route by URL path, header, cookie, or host** (e.g., \`/api\` → one pool, \`/images\` → another), do TLS termination, sticky sessions, and content-based rules.

Choose **L7** when you need **content-aware routing** or HTTP features; choose **L4** when you just need raw, protocol-agnostic distribution at maximum speed.

:::gotcha
Whichever layer, run the balancer **redundantly** (active-active or active-passive) so it isn't a single point of failure, and prefer **stateless** app servers so any node can serve any request.
:::`,
  },
  {
    id: 'sd-comp-qps-estimation',
    question: 'A service has 100M daily active users making 100 reads each per day. Estimate the read QPS and storage, and state the implications.',
    difficulty: 'Medium',
    category: 'Core Components',
    tags: ['estimation', 'qps', 'storage', 'capacity'],
    answer: `**QPS:** 100M × 100 = **10B reads/day**. Divide by ~100,000 s/day → **~100,000 read QPS** average. Multiply by ~3 for peaks → **~300K read QPS**.

**Storage** (say 2 writes/user/day at ~500 bytes): 100M × 2 = 200M writes/day × 500 B = **~100 GB/day**. Over 5 years × 3 replicas → **~540 TB**.

**Implications:**
- Read:write ~50:1 → **read-heavy** → cache the read path with **Redis + CDN**.
- ~180 TB raw won't fit one node → plan for **sharding / a distributed store**.
- ~300K peak read QPS → **many app servers behind a load balancer**.

:::key
The trick: **daily ops ÷ 100,000 ≈ QPS**, **× 2–3 for peak**. Round hard (86,400 ≈ 10⁵) and always convert each number into an **architectural decision** — the numbers exist to justify the design.
:::`,
  },
];

export default questions;
