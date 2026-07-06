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
  {
    id: 'sd-comp-dns-resolution',
    question: 'Walk through what happens when a DNS name is resolved. Why is it a hierarchy?',
    difficulty: 'Medium',
    category: 'Core Components',
    tags: ['dns', 'networking', 'ttl', 'caching'],
    answer: `Resolution walks a **cache hierarchy**, then the DNS tree:

1. **Check caches** — browser, then OS, then the **recursive resolver** (your ISP's, or 8.8.8.8). A hit returns immediately.
2. On a miss the resolver queries top-down: a **root** server returns the \`.com\` **TLD** server → the TLD returns the **authoritative** name server for \`example.com\` → the authoritative server returns the **A/AAAA** record (the IP).
3. Each answer is cached for its **TTL**.

It's hierarchical so no single server holds the whole internet's names, and each level **delegates** authority — the 13 logical root addresses (anycast to thousands of instances) only know TLDs, not individual hosts.

| Record | Purpose |
|--|--|
| A / AAAA | name → IPv4 / IPv6 |
| CNAME | alias → another name |
| NS | delegate a zone |

:::gotcha
TTL is the availability/agility trade-off: a **long TTL** (hours) means fewer lookups but *slow propagation* — a failover or IP change can take the full TTL to reach clients. Drop TTLs to ~60 s **before** a planned migration.
:::`,
  },
  {
    id: 'sd-comp-anycast',
    question: 'What is anycast and why do CDNs and DNS rely on it?',
    difficulty: 'Easy',
    category: 'Core Components',
    tags: ['anycast', 'networking', 'cdn', 'bgp'],
    answer: `Anycast advertises the **same IP from many locations** at once; the internet's routing (BGP) then delivers each client to the **topologically nearest** instance automatically. One address, many servers.

Why it's everywhere at the edge:

- **Latency** — users reach the closest point of presence with no application logic.
- **Availability** — if a location dies, BGP reroutes to the next-nearest; no DNS change needed.
- **DDoS absorption** — attack traffic spreads across many sites instead of hammering one.

The 13 root DNS servers, public resolvers (\`1.1.1.1\`, \`8.8.8.8\`), and CDN edges (Cloudflare, Fastly) all run on anycast.

:::note
Contrast with **unicast** (one IP → one host) and **DNS geo-routing** (returns *different* IPs per region). Anycast keeps a **single** IP and lets the network do the steering.
:::`,
  },
  {
    id: 'sd-comp-object-storage',
    question: 'How does object storage like S3 differ from a filesystem, and what consistency does it give?',
    difficulty: 'Easy',
    category: 'Core Components',
    tags: ['object-storage', 's3', 'consistency', 'durability'],
    answer: `Object storage is a **flat key → blob map exposed over HTTP**, not a hierarchical filesystem. You \`PUT\`/\`GET\` an object by key into a **bucket**; the slashes in a path are just a naming convention — there are **no real directories, no partial in-place edits, no file handles**. Each object carries metadata and is addressed by a URL.

- It scales near-infinitely and cheaply *because* it's flat and immutable-per-object — the durable store behind data lakes, backups, and media (fronted by a CDN).
- **Durability** is extreme: S3 targets **11 nines** (99.999999999%) via replication/erasure coding across AZs.
- **Consistency**: since Dec 2020 S3 gives **strong read-after-write** — a \`GET\` right after a \`PUT\` returns the new object (it was eventually consistent before).

:::gotcha
It is **not** a filesystem: you can't append to or edit part of an object (you replace the whole key), and \`LIST\` is far slower than a keyed \`GET\`. Don't use it for low-latency random-access transactional data — that's what databases are for.
:::`,
  },
  {
    id: 'sd-comp-geospatial-index',
    question: 'How do you index locations to answer "what is near me?" Compare geohash, quadtree, and H3.',
    difficulty: 'Hard',
    category: 'Core Components',
    tags: ['geospatial', 'geohash', 'quadtree', 'h3'],
    answer: `A plain \`(lat, lng)\` column can't do "within radius" without scanning, so you map 2-D space onto an indexable key or tree:

- **Geohash** — interleave lat/lng bits into a base-32 string; a shared **prefix ≈ proximity**, so it's just a string range in any B-tree or Redis. Simple and shardable. Weakness: cells straddling a boundary can be far apart in string space, so you query the cell **plus its 8 neighbors**. Powers **Redis GEO**.
- **Quadtree** — recursively split space into 4 quadrants, subdividing **only dense regions**. Adapts to skew (dense cities vs empty ocean) but is an in-memory tree that must rebalance as points move.
- **H3 (Uber) / S2 (Google)** — tile the globe into **hexagons** (H3) or spherical cells (S2). Hexagons give **6 equidistant neighbors** (no corner ambiguity), which is why Uber uses H3 for supply/demand and surge.

:::senior
Choose by workload: **geohash** for a dead-simple key in an existing store, **quadtree** for adaptive density in memory, **H3/S2** when uniform cells and clean neighbor math matter (ride matching, coverage analytics).
:::`,
  },
  {
    id: 'sd-comp-push-notifications',
    question: 'How does mobile push notification delivery actually work, and what is the hard part?',
    difficulty: 'Medium',
    category: 'Core Components',
    tags: ['push-notifications', 'apns', 'fcm', 'mobile'],
    answer: `You never connect to phones directly — you hand the message to the **platform gateway** that owns the persistent connection to each device: **APNs** (Apple) and **FCM** (Google/Android). Flow: the app registers, the OS returns a **device token**, your server stores \`token ↔ user\`, and to notify you POST to APNs/FCM with the token; they deliver (or queue while offline).

The hard part is **token lifecycle**: tokens **rotate** (reinstall, OS update, restore), so you must refresh the token on every launch and prune dead ones — APNs/FCM report a token as invalid, and you must delete it or you waste sends and damage your sender reputation.

:::gotcha
Push is **best-effort, unordered, not guaranteed** — treat it as a *hint*. For anything reliable (a payment receipt), the source of truth is your server; the client should still **fetch/sync on open** rather than trust that the notification arrived.
:::`,
  },
  {
    id: 'sd-comp-payment-ledger',
    question: 'What are the core building blocks of a payment system, and how do you avoid losing or double-counting money?',
    difficulty: 'Hard',
    category: 'Core Components',
    tags: ['payments', 'ledger', 'idempotency', 'reconciliation'],
    answer: `Three pillars:

1. **Idempotency keys** — the client sends a unique key per payment intent; the server executes **once** and returns the stored result on retries, so a lost response never double-charges.
2. **Double-entry ledger** — every movement is recorded as balanced **debits and credits** whose sum is zero; balances are *derived* from immutable, **append-only** entries, never updated in place. This makes every cent auditable and self-checking.
3. **Reconciliation** — periodically compare your ledger against the processor's/bank's report (and internal accounts against each other); mismatches are **flagged, not silently corrected**.

Money demands **CP** (strong consistency) — an ACID store (Postgres) for the ledger, not eventual consistency.

:::senior
Model each payment as a **state machine** (created → authorized → captured → settled/failed), each transition idempotent and persisted **before** side effects. And never represent money as a float — use **integer minor units (cents)** or a decimal type to avoid rounding drift.
:::`,
  },
  {
    id: 'sd-comp-sessions-vs-jwt',
    question: 'Server sessions vs JWTs for auth — what is the real trade-off?',
    difficulty: 'Hard',
    category: 'Core Components',
    tags: ['authentication', 'jwt', 'sessions', 'revocation'],
    answer: `- **Server sessions** — on login, store session state server-side (Redis) and give the client an **opaque session id** cookie. Every request looks it up. Stateful, but **revocation is instant** (delete the row) and the cookie leaks nothing.
- **JWT** — a **signed, self-contained** token carrying claims (user id, roles, expiry). The server verifies the signature with **no lookup** → stateless, scales horizontally, travels well across services.

The catch is **revocation**: a JWT is valid until it expires, so you can't easily kill one mid-life (logout, a banned user) without re-adding the very server-side state (a denylist / token-version check) you adopted JWT to avoid.

| | Session | JWT |
|--|--|--|
| State | server lookup per request | stateless |
| Revoke | instant | hard (until expiry) |
| Best for | monolith, instant logout | microservices, short tokens |

:::senior
Production usually does **both**: short-lived **access JWTs** (5–15 min — no revocation needed because they expire fast) plus a long-lived **refresh token** stored server-side that *can* be revoked. Stateless verification on the hot path, and a real kill switch.
:::`,
  },
  {
    id: 'sd-comp-oauth-sso',
    question: 'Explain OAuth 2.0 and how it differs from OpenID Connect and SSO.',
    difficulty: 'Medium',
    category: 'Core Components',
    tags: ['oauth', 'oidc', 'sso', 'authorization'],
    answer: `**OAuth 2.0 is delegated *authorization*** — it lets an app act on a resource on your behalf **without your password**. "Let this app read my Google Contacts": you authenticate at Google, and Google issues the app an **access token** scoped to contacts.

- The **Authorization Code flow** (+ **PKCE** for mobile/SPA) is standard: the app redirects to the provider, the user consents, the provider returns a short **code**, and the app exchanges it **server-side** for tokens — tokens never sit in the browser URL.
- **OpenID Connect (OIDC)** layers **authentication** on top of OAuth: it adds an **ID token** (a JWT proving *who* the user is). OAuth = authorization; OIDC = authentication.
- **SSO** lets one login unlock many apps; it's built on OIDC/SAML against a central **identity provider** (Okta, Azure AD).

:::gotcha
OAuth alone answers "what can this app *do*," not "*who* is the user." Using a raw OAuth access token as proof of identity is a classic security bug — use **OIDC's ID token** for login.
:::`,
  },
  {
    id: 'sd-comp-file-upload',
    question: 'How do you handle large file uploads reliably at scale?',
    difficulty: 'Medium',
    category: 'Core Components',
    tags: ['file-upload', 'presigned-url', 'multipart', 'resumable'],
    answer: `Don't stream bytes **through** your app servers — that ties up request threads and memory. Instead:

1. **Presigned URL** — the client asks your API for a short-lived signed URL, then uploads **directly to object storage** (S3); your servers only handle metadata. Offloads bandwidth entirely.
2. **Multipart upload** — split a large file into parts (e.g. 5–100 MB), upload them **in parallel**, and let the store assemble them. Boosts throughput and lets a single failed part retry alone.
3. **Resumable** — track which chunks succeeded (by offset/etag) so a dropped connection resumes from the **last good chunk** instead of restarting a multi-GB upload.

Validate with a client-supplied **checksum** (the store verifies each part's etag) and enforce size/type limits in the presign step.

:::key
Same shape as media pipelines: **client → object store directly via a presigned URL**, app server handles only metadata plus an **async post-processing job** (virus scan, thumbnail, transcode) triggered on upload completion.
:::`,
  },
  {
    id: 'sd-comp-task-scheduler',
    question: 'How do you build a reliable job scheduler that runs tasks at a specific time, at scale?',
    difficulty: 'Hard',
    category: 'Core Components',
    tags: ['scheduler', 'cron', 'delay-queue', 'distributed'],
    answer: `A single-box \`cron\` doesn't survive the box dying and can't scale, so:

- Store jobs durably with a \`next_run_at\` timestamp; **dispatcher** nodes poll for due jobs (\`WHERE next_run_at <= now\`) and enqueue them.
- A **distributed lock / leader** (ZooKeeper/etcd or a DB row lock) or **sharding the job space by id** ensures a job isn't picked up by two dispatchers at once.
- **Delay queues** for "run in N minutes": a queue with per-message delay (SQS delay, RabbitMQ TTL+DLX) or a **Redis sorted set** scored by run-time (\`ZADD\`, then \`ZRANGEBYSCORE now\`).

Guarantee **at-least-once** and make handlers **idempotent** — a crash between "run" and "mark done" re-runs the job.

:::senior
Two hard parts interviewers probe: (1) **precision at scale** — you can't scan billions of rows every second, so bucket jobs into time windows (a **timing wheel** / hierarchical buckets); (2) **thundering herd** when many jobs fire at the same instant (a midnight cron) — add **jitter** and rate-limit dispatch.
:::`,
  },
  {
    id: 'sd-comp-redis-cluster',
    question: 'How does Redis scale beyond one node, and what do you give up?',
    difficulty: 'Medium',
    category: 'Core Components',
    tags: ['redis', 'sharding', 'cluster', 'replication'],
    answer: `One Redis instance is single-threaded and memory-bound (~**100k ops/s** on one core, capped by RAM). To grow:

- **Replication** — a primary with read **replicas** scales reads and enables failover (**Sentinel** promotes a replica if the primary dies). Writes still funnel to one primary.
- **Redis Cluster** — shards the keyspace across primaries using **16,384 hash slots**; a key's slot = \`CRC16(key) mod 16384\`, and each primary owns a slot range (with its own replicas). This scales **writes and memory horizontally**, and slots migrate to rebalance or add nodes.

The catch: a multi-key op (\`MGET\`, transactions, Lua) needs **all keys in the same slot** or it errors. You force that with **hash tags** — \`{user123}:profile\` and \`{user123}:cart\` hash on just the braces, landing in one slot.

:::gotcha
Cluster is cross-slot-hostile: design keys so related data shares a hash tag, or you lose atomic multi-key ops. And failover is still **eventually consistent** — a write acked by a primary that dies before replicating can be **lost**.
:::`,
  },
  {
    id: 'sd-comp-search-sharding',
    question: 'How does a search cluster like Elasticsearch scale to billions of documents?',
    difficulty: 'Medium',
    category: 'Core Components',
    tags: ['elasticsearch', 'sharding', 'replicas', 'search'],
    answer: `The index is split into **shards** — each shard is a self-contained Lucene inverted index holding a subset of documents. Shards spread across nodes so storage and query load parallelize.

- **Sharding** — a document routes to a shard by \`hash(routing_key) mod primary_shards\` (default routing key: the doc id). A query is **scatter-gather**: the coordinator fans it to every shard, each returns its top-k, and the coordinator merges them.
- **Replicas** — each primary shard has replica copies on other nodes for read throughput and failover; a replica can serve searches.

:::gotcha
**Primary shard count is fixed at index creation** — changing it means a full **reindex**, because the routing hash depends on the shard count. Capacity-plan shards up front (or use rollover indices + aliases). Too few shards → hotspots; too many tiny shards → per-shard overhead dominates. Aim for shards in the **tens-of-GB** range.
:::`,
  },
];

export default questions;
