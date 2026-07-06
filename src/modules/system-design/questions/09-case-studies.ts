import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'sd-case-url-read-heavy',
    question: 'A URL shortener sees ~100 reads per write. What single design choice matters most, and how do you generate short codes safely?',
    difficulty: 'Easy',
    category: 'Case Studies',
    tags: ['url-shortener', 'caching', 'key-generation'],
    answer: `It is a **read-heavy key→value lookup**, so the highest-leverage move is a **cache (Redis) on the redirect path** — it absorbs the ~100:1 read traffic and keeps redirects fast; the key-value store is the fallback on a miss.

For codes, use **base62 encoding of a counter** (hand out ranges to each server to avoid per-request coordination) or a **hash + collision check**. 7 base62 chars ≈ 3.5 trillion keys.

:::gotcha
Never expose a raw auto-increment integer — it is guessable, lets anyone enumerate every link, and leaks your total volume.
:::`,
  },
  {
    id: 'sd-case-feed-fanout',
    question: 'Contrast fan-out on write vs fan-out on read for a social news feed. Which is the default and why?',
    difficulty: 'Medium',
    category: 'Case Studies',
    tags: ['news-feed', 'fan-out', 'timeline'],
    answer: `- **Fan-out on write (push):** pre-materialize each follower's timeline when someone posts. **Reads are O(1)** cache lookups; a post costs O(followers) writes.
- **Fan-out on read (pull):** store the post once and assemble the feed on demand. **Writes are cheap**; reads gather and merge across all followees — slower and repeated.

**Push is the default** because feeds are read far more than written — you want the expensive work done once at write time so the common operation (reading) is a single fast read.`,
  },
  {
    id: 'sd-case-feed-celebrity',
    question: 'Why does pure fan-out on write break for a celebrity, and what is the fix?',
    difficulty: 'Hard',
    category: 'Case Studies',
    tags: ['news-feed', 'celebrity-problem', 'hot-key'],
    answer: `Fan-out on write is **O(followers)**. A celebrity with tens of millions of followers turns one post into tens of millions of timeline writes — a **write storm** that backs up the fan-out queue and delays everyone's posts.

**Fix: a hybrid.** Push posts for normal accounts (cheap reads), but for high-follower accounts **skip fan-out and pull their recent posts in at read time**, merging them into the feed.

:::key
Push for the many, **pull for the few (celebrities)** — best of both, and it dodges the hot-key write storm.
:::`,
  },
  {
    id: 'sd-case-chat-websocket',
    question: 'Why does a chat system use WebSockets, and how do you route a message to the right server among thousands?',
    difficulty: 'Medium',
    category: 'Case Studies',
    tags: ['chat', 'websocket', 'session-registry'],
    answer: `Chat needs the server to **push** messages, receipts, and presence to clients unprompted — classic HTTP request/response is client-initiated only, so you hold a **persistent, bidirectional WebSocket** per client.

The fleet is sized by **connections per box** (a socket is memory/fd bound, ~65K per server), so you need a **session registry** (e.g. Redis) mapping \`user → connected server\`. To deliver to user B, look up B's server and forward; if B isn't in the registry they're offline → send a **push notification** (APNs/FCM).`,
  },
  {
    id: 'sd-case-chat-delivery',
    question: 'How do you guarantee a chat message is not lost, and what are the delivery semantics?',
    difficulty: 'Hard',
    category: 'Case Studies',
    tags: ['chat', 'delivery', 'idempotency'],
    answer: `**Persist the message before acknowledging it** (store-and-forward). If the recipient is offline or a server crashes, the message survives in the store (a wide-column store like Cassandra, partitioned by conversation, clustered by a time-ordered id).

Semantics are **at-least-once, made idempotent**: networks drop acks so senders retry, which can duplicate a message. Give each message a **unique id** and **de-dupe on the receiver**.

:::senior
Chasing exactly-once at the transport layer is a trap — at-least-once delivery plus idempotent apply is how production systems do it.
:::`,
  },
  {
    id: 'sd-case-ratelimit-shared',
    question: 'Why can\'t a distributed rate limiter keep counters in each server\'s memory, and where do they go?',
    difficulty: 'Medium',
    category: 'Case Studies',
    tags: ['rate-limiter', 'redis', 'shared-state'],
    answer: `A load balancer spreads one user's requests across many servers. With **per-server memory counters**, a user hitting N servers gets up to **N× their limit** — the limit isn't enforced globally.

Counters go in a **shared, fast store — Redis**: in-memory speed, atomic \`INCR\`/Lua, and TTLs for free window expiry. Every server reads and writes the same view.`,
  },
  {
    id: 'sd-case-ratelimit-atomic',
    question: 'What is the classic race condition in a rate limiter, and which algorithm handles bursts well?',
    difficulty: 'Hard',
    category: 'Case Studies',
    tags: ['rate-limiter', 'atomicity', 'token-bucket'],
    answer: `The bug is a **non-atomic read-then-write**: \`GET count → if under limit → INCR\`. Two servers can both read \`99\`, both allow, and exceed the limit. Do the check-and-update in **one atomic operation** — \`INCR\` then compare, or a **Lua script** (essential for token bucket's read-modify-write).

**Token bucket** is the go-to: tokens refill at a steady rate up to a capacity, each request spends one. It **allows short bursts** (up to capacity) while bounding the long-run average. A **sliding-window counter** fixes the fixed-window **2× boundary burst** at O(1) memory.`,
  },
  {
    id: 'sd-case-video-cdn',
    question: 'Why is a CDN central to a video streaming service, and how does adaptive bitrate streaming work?',
    difficulty: 'Medium',
    category: 'Case Studies',
    tags: ['video', 'cdn', 'adaptive-bitrate'],
    answer: `Streaming is ~1000:1 **read-heavy** at tens of Tbps — you **cannot serve that from origin**. A **CDN** caches encoded segments at edges near viewers; ~99% of traffic is served from the nearest edge and the origin handles only misses.

**Adaptive bitrate (HLS/DASH):** each video is encoded into a **ladder of bitrates** and chopped into short **segments** (2–10s). A **manifest** lists them; the player measures bandwidth and requests the **next segment at the best quality it can sustain**, downshifting instead of stalling.`,
  },
  {
    id: 'sd-case-video-pipeline',
    question: 'Walk through the video upload/encode pipeline. Why is it async, and where do the bytes flow?',
    difficulty: 'Hard',
    category: 'Case Studies',
    tags: ['video', 'transcoding', 'blob-storage'],
    answer: `1. Client requests a **pre-signed URL** and uploads the raw file **directly to blob storage** (S3), chunked/resumable — never through the app servers.
2. Upload completion enqueues a **transcode job**; the user sees "processing."
3. **Transcode workers** split the source into segments (GOPs), encode each to multiple resolutions in parallel, package to HLS/DASH with a manifest, and push segments to the CDN.
4. Metadata (title, views) lives in a **queryable DB**, separate from the immutable **video blobs**.

It's async because transcoding into many resolutions is CPU-heavy and slow.

:::gotcha
Don't upload through app servers and don't stream from origin — client → blob store on the way in, CDN → viewer on the way out.
:::`,
  },
  {
    id: 'sd-case-ride-geoindex',
    question: 'How does a ride-sharing service answer "which drivers are near me?" at scale? Compare geohash and quadtree.',
    difficulty: 'Hard',
    category: 'Case Studies',
    tags: ['ride-sharing', 'geohash', 'quadtree'],
    answer: `Use a **geo index** kept **in memory**, sharded by region — the dominant load is the location-update firehose (~1M+ writes/sec), which would melt an RDBMS.

- **Geohash:** encode (lat, lng) into a string where a shared prefix ⇒ proximity. Query the rider's cell **plus its 8 neighbors** (points across a boundary can differ early). Simple and shardable — Redis GEO is built on this.
- **Quadtree:** recursively subdivide space, splitting only dense cells — adapts to uneven density but is a tree that must rebalance as drivers move.

Persist only durable **trip records** to a DB; the live location index stays in memory.`,
  },
  {
    id: 'sd-case-ride-surge',
    question: 'How would you design surge pricing for a ride-sharing service?',
    difficulty: 'Medium',
    category: 'Case Studies',
    tags: ['ride-sharing', 'surge', 'streaming'],
    answer: `Compute a multiplier from the ratio of **open ride requests to available drivers within each geo cell** (e.g. geohash), updated on a short interval as a **streaming aggregation over the location index**.

Two subtleties:
- **Regionally sharded** — SF's surge is independent of NYC's.
- **Feedback loop** — higher prices attract drivers and suppress demand, which cools the surge. It's a per-cell supply/demand signal, not a global constant.`,
  },
  {
    id: 'sd-case-metadata-blob-split',
    question: 'Across these case studies, why is separating metadata from bulk/blob data a recurring pattern?',
    difficulty: 'Easy',
    category: 'Case Studies',
    tags: ['storage', 'data-modeling', 'design-patterns'],
    answer: `Because the two have **opposite access patterns**:
- **Metadata** (video titles, chat conversation info, trip records) is small, queryable, joined/searched → a **relational or indexed DB**.
- **Bulk data** (video segments, message history, live locations) is huge and/or write-once read-many or high-churn → an **object store, wide-column store, or in-memory index**.

Mixing them wastes money and destroys query performance. Choosing the right store per data shape is a core system-design instinct.`,
  },
  {
    id: 'sd-case-pastebin',
    question: 'Design Pastebin. How does it differ from a URL shortener?',
    difficulty: 'Easy',
    category: 'Case Studies',
    tags: ['pastebin', 'object-storage', 'expiry'],
    answer: `Like a URL shortener it's a **read-heavy key → content** service, but the content is **large** (KBs–MBs of text), which changes the storage split.

- **Estimation**: ~1M pastes/day (~12 writes/s), ~10:1 read:write (~120 reads/s); at ~10 KB average → ~**10 GB/day**, ~18 TB over 5 years.
- **API**: \`POST /pastes {content, expiry}\` → \`{key}\`; \`GET /{key}\`.
- **Data model**: **metadata** (key, owner, created, expiry, size) in a relational/KV store; the **paste body in object storage (S3)** keyed by the same id — never store MBs of text in the metadata DB.
- **Serving**: cache hot pastes + a CDN; generate keys via **base62 of a counter/range** (7 chars ≈ 3.5T keys).
- **Deep dive — expiry**: set a TTL on the object plus a lazy/async sweep of expired metadata.

:::key
The reusable move: **small queryable metadata in the DB, large immutable blob in object storage**, both keyed by the same short id — identical to media systems, just with text.
:::`,
  },
  {
    id: 'sd-case-kv-store',
    question: 'Design a distributed key-value store like DynamoDB or Cassandra.',
    difficulty: 'Hard',
    category: 'Case Studies',
    tags: ['key-value-store', 'consistent-hashing', 'quorum', 'dynamo'],
    answer: `Goal: horizontal scale + high availability for key-based access, with tunable consistency.

- **Partitioning**: **consistent hashing with virtual nodes** spreads keys evenly and makes adding/removing a node move only ~**1/N** of keys.
- **Replication**: each key to **N replicas** (e.g. N=3) on the next N nodes clockwise, **across AZs** for independent failure.
- **Consistency**: **quorum** — \`W + R > N\` guarantees a read overlaps the latest write. \`W=R=2, N=3\` is the common strong setting; \`W=R=1\` is fast but stale.
- **Availability**: **hinted handoff** (a temp node accepts a write for a down replica) plus **read repair** and **Merkle-tree anti-entropy** to reconcile.
- **Conflicts**: vector clocks or last-writer-wins for concurrent writes.
- **Membership/failure**: **gossip**.

:::senior
This is Amazon's **Dynamo** paper — its thesis is **AP with tunable quorum**: it never rejects a write (always available) and reconciles divergence later. The cost is that the app may see **siblings/stale reads** and must tolerate eventual consistency.
:::`,
  },
  {
    id: 'sd-case-instagram',
    question: 'Design Instagram (photo sharing plus a feed).',
    difficulty: 'Medium',
    category: 'Case Studies',
    tags: ['instagram', 'media', 'feed', 'fan-out'],
    answer: `Two subsystems: **media storage** and the **feed**.

- **Estimation**: 500M DAU, ~100M photos/day (~1,150 writes/s, ~3,500 peak); at ~1.5 MB/photo → ~**150 TB/day** of media; feed reads dwarf writes (~100:1).
- **Media path**: client uploads via a **presigned URL directly to object storage (S3)**; the app stores only **metadata** (photo id, owner, caption, url, timestamp) in a DB; a **CDN** fronts all image reads. An async job builds thumbnails/resolutions.
- **Feed**: **fan-out on write (push)** into each follower's timeline cache (Redis) for normal users; **pull for celebrities** and merge at read time (**hybrid**) to dodge the write storm.
- **Data model**: users, media (metadata), follows (graph), timeline cache.

:::key
The recurring split — **bytes in object store + CDN, metadata in DB** — plus the **hybrid feed fan-out**. The photo store and the social graph scale **independently**.
:::`,
  },
  {
    id: 'sd-case-group-chat',
    question: 'Extend a chat system to WhatsApp-style group messaging. What changes from 1:1?',
    difficulty: 'Medium',
    category: 'Case Studies',
    tags: ['chat', 'group-messaging', 'fan-out', 'receipts'],
    answer: `1:1 is one sender → one recipient; a group message is a **fan-out to every member**, which reshapes the write path.

- **On send**: persist **once**, then fan out to each member — look up each member's connected server in the **session registry** (Redis) and push over their WebSocket; **offline** members get a push notification (APNs/FCM) and pull on reconnect.
- **Storage**: messages partitioned by \`group_id\` (wide-column, e.g. Cassandra), clustered by a **time-sortable id** so history reads are a range scan; per-user **"last read" pointers** drive unread counts and receipts.
- **Semantics**: **at-least-once + idempotent apply** (unique message id, dedupe on the client).
- **Limits**: **cap group size** (WhatsApp ~1,024) so one message doesn't fan out to millions — the celebrity problem, bounded by a hard limit.

:::gotcha
Read receipts in large groups are **O(members²)** ("seen by" per member per message). Aggregate to a **count** rather than tracking every pair, or you drown in receipt traffic.
:::`,
  },
  {
    id: 'sd-case-notification-system',
    question: 'Design a multi-channel notification system (push, email, SMS).',
    difficulty: 'Medium',
    category: 'Case Studies',
    tags: ['notifications', 'fan-out', 'idempotency', 'queue'],
    answer: `A platform that takes "notify user U of event E" and delivers reliably across channels.

- **Flow**: producers publish events → a **queue** (Kafka) → a **notification service** resolves user **preferences + templates** → routes to **per-channel workers** → external gateways (**APNs/FCM, SendGrid, Twilio**).
- **Data model**: channel preferences/opt-outs, templates, and a **per-notification delivery log** (status per channel).
- **Key features**: preferences & quiet hours; **rate limiting / batching** so you don't spam (digest low-priority items); **dedupe** (idempotency key per event → notify once); **retries with backoff + a DLQ** for hard failures.
- **Scale**: the queue decouples spiky producers from rate-limited gateways; workers scale **per channel** independently.

:::senior
Differentiators interviewers want: **idempotency** (exactly-once *effect* over at-least-once transport), respecting **opt-outs/compliance** (CAN-SPAM/TCPA), and **priority tiers** — a 2FA code must preempt a marketing blast.
:::`,
  },
  {
    id: 'sd-case-metrics-tsdb',
    question: 'Design a metrics and monitoring system (time-series at scale).',
    difficulty: 'Medium',
    category: 'Case Studies',
    tags: ['time-series', 'metrics', 'cardinality', 'downsampling'],
    answer: `Ingest huge volumes of \`(metric, tags, timestamp, value)\` and serve dashboards/alerts.

- **Estimation**: 1M hosts × 100 metrics every 10 s → ~**10M points/s** ingest — **write-dominated**, so buffer through agents/a queue and **batch**.
- **Storage**: a **time-series DB** (Prometheus, InfluxDB, or a columnar store) — append-only, partitioned by **time window** and by series, heavily **compressed** (delta-of-delta on timestamps + XOR on floats → ~1–2 bytes/point).
- **Rollups**: keep raw data short (e.g. **15 days** full-resolution), then **downsample** to 1-min/1-hour aggregates for long retention — you can't store years at full resolution.
- **Query**: range scans over a series; pre-aggregate for dashboards.

:::gotcha
**Cardinality** is the killer: each unique tag combination is a **separate series**, so a high-cardinality label (\`user_id\`, \`request_id\`) explodes series count and memory. Keep labels **low-cardinality**; push high-cardinality detail into logs/traces.
:::`,
  },
  {
    id: 'sd-case-typeahead',
    question: 'Design search autocomplete/typeahead at Google scale.',
    difficulty: 'Hard',
    category: 'Case Studies',
    tags: ['typeahead', 'trie', 'top-k', 'streaming'],
    answer: `Return ranked **top-k completions per prefix in <100 ms** per keystroke, over billions of queries.

- **Serving structure**: a **trie** where each node caches its **top-k** completions (by popularity), so a prefix lookup is **O(prefix length)** with no subtree traversal. Held **in memory**, **sharded by prefix** across servers (route "ca…" to one shard).
- **Ranking data**: completions weighted by **query frequency** (and recency), collected offline from query logs.
- **Update path**: never mutate the serving trie per query — aggregate query counts in a **stream** (Kafka → count-min sketch / MapReduce), **rebuild the trie periodically** (hourly/daily), and **hot-swap** it in.
- **Client**: **debounce** keystrokes, cache prefixes locally.

:::senior
Split **offline** (heavy: aggregate logs, rank, build the trie) from **online** (light: prefix lookup). Trending terms need faster loops; profanity/safety filtering happens at **build time**. This is why autocomplete is its own system, not a query against the search index.
:::`,
  },
  {
    id: 'sd-case-web-crawler',
    question: 'Design a web crawler.',
    difficulty: 'Hard',
    category: 'Case Studies',
    tags: ['web-crawler', 'url-frontier', 'politeness', 'bloom-filter'],
    answer: `BFS over the web graph: fetch a page, extract links, enqueue new URLs, repeat — at **billions of pages**.

- **Components**: a **URL frontier** (queue of URLs to fetch), **fetchers**, a **parser/link extractor**, a **seen-URL set**, and content storage.
- **Politeness**: never hammer one host — partition the frontier **by domain** with a **per-host rate limit and crawl delay**, and honor \`robots.txt\`. This (not raw bandwidth) shapes the frontier.
- **Dedupe**: a huge **seen-set** — a **Bloom filter** fronts it so most "already crawled?" checks avoid a lookup; **content hashing** (checksum/SimHash) skips near-duplicate pages.
- **Freshness**: re-crawl priority by change rate — news often, static pages rarely.
- **Traps**: cap depth and URL length to escape infinite calendar/spider traps.

:::senior
The **frontier** is the heart: it balances **priority** (importance/freshness) against **politeness** (per-host delay), usually as two-stage queues — front queues for priority, back queues per host — distributed by URL hash across many crawler machines.
:::`,
  },
  {
    id: 'sd-case-collab-editing',
    question: 'Design a collaborative document editor like Google Docs.',
    difficulty: 'Hard',
    category: 'Case Studies',
    tags: ['collaborative-editing', 'ot', 'crdt', 'websocket'],
    answer: `Many users edit the same document concurrently and see each other's changes in real time.

- **Transport**: a persistent **WebSocket** per client to an edit server; changes broadcast to all collaborators in the doc.
- **The core problem — concurrent conflicting edits.** Two approaches:
  - **Operational Transformation (OT)** — send **operations** (\`insert@5\`, \`delete@3\`) and **transform** each against concurrent ops so they converge; a central server orders them. What Google Docs uses; powerful but the transform functions are notoriously tricky.
  - **CRDT** — give each character a unique, ordered id so concurrent inserts merge deterministically **without** central transform; better for offline/P2P. Used by Figma, Automerge/Yjs.
- **Presence/cursors**: ephemeral state broadcast to collaborators.
- **Persistence**: store the **op log** (event-sourced) plus periodic snapshots to reload fast.

:::senior
**OT vs CRDT** is the classic trade-off: OT needs a central server to order ops but is memory-lean; CRDTs merge without central ordering (great offline) but carry per-element metadata overhead. OT for a server-mediated doc, CRDT for offline-first/P2P.
:::`,
  },
  {
    id: 'sd-case-file-sync',
    question: 'Design a file sync service like Dropbox.',
    difficulty: 'Hard',
    category: 'Case Studies',
    tags: ['dropbox', 'chunking', 'dedupe', 'sync'],
    answer: `Sync a user's files across devices efficiently, minimizing bandwidth.

- **Chunking**: split each file into blocks (~4 MB) and sync only **changed chunks** — edit one block of a 1 GB file and you upload **one block**, not the whole file.
- **Dedupe**: **content-address** chunks by hash; identical chunks (across files or users) are stored **once** — large storage savings.
- **Storage split**: chunk **bytes in object storage (S3)**; a **metadata service** maps file → ordered chunk hashes, plus versions and a per-user **file journal**.
- **Sync**: clients watch local changes and notify/long-poll a metadata server; **conflicts** (two devices edit offline) resolve by **versioning** (keep both as a "conflicted copy") rather than silently losing one.
- **Upload**: presigned direct-to-S3, resumable.

:::senior
**Chunk-level dedup + content addressing** is the core efficiency: **delta sync** turns huge files into tiny updates, and global dedup means the same file shared by 1,000 users costs **one** copy. Metadata (small, transactional) and blocks (huge, immutable) scale independently.
:::`,
  },
  {
    id: 'sd-case-ticket-booking',
    question: 'Design a ticket booking system (Ticketmaster). How do you prevent overselling?',
    difficulty: 'Hard',
    category: 'Case Studies',
    tags: ['ticketing', 'inventory', 'concurrency', 'consistency'],
    answer: `The hard constraint: a seat sells **at most once** under a thundering herd (a hot concert — millions racing for thousands of seats).

- This is **strongly consistent (CP) inventory** — a stale read that lets two buyers grab seat 5A is unacceptable, so **no eventual consistency** on the seat map.
- **Hold pattern**: selecting seats creates a **time-limited hold** (e.g. 10 min) that marks them unavailable while the user pays; if payment doesn't complete, the hold **expires (TTL)** and the seats return. Enforce the transition **atomically** — a row lock / conditional update (compare-and-set \`available → held\`) or \`SELECT ... FOR UPDATE\` — so two transactions can't both claim it.
- **Fairness at scale**: a **virtual waiting room / queue** admits users in controlled batches so the DB isn't crushed; sold-out reads are cached/served statically.

:::gotcha
The oversell bug is a **non-atomic check-then-set** (read "available", both proceed, both book). Fix with an **atomic conditional update or a lock** on the seat — plus **idempotency** on the purchase so a retry doesn't double-book or double-charge.
:::`,
  },
  {
    id: 'sd-case-leaderboard',
    question: 'Design a real-time gaming leaderboard (top-K and a player rank).',
    difficulty: 'Medium',
    category: 'Case Studies',
    tags: ['leaderboard', 'redis', 'sorted-set', 'ranking'],
    answer: `Need **top-N** and **"what's my rank?"** over millions of players, updated live.

- A relational \`ORDER BY score\` with a \`COUNT\` for rank is **O(N)** per query — too slow live.
- Use a **Redis sorted set (ZSET)**: \`ZADD\` to update a score (**O(log N)**), \`ZREVRANGE 0 9\` for the top 10, \`ZREVRANK\` for a player's rank — all O(log N) against an in-memory skip list. Redis does ~**100k ops/s**, easily enough.
- Persist authoritative scores in a **DB**; the ZSET is the fast query index, rebuildable from it.
- **Scale**: for hundreds of millions, **shard** by region/segment (a ZSET per board) and merge top-k across shards; time-windowed boards (daily/weekly) are separate keys with a TTL.

:::senior
**Exact global rank among 100M** is the expensive part — **approximate** it (bucket scores into ranges and sum counts) when precise rank isn't needed, since players mostly care about **top-K and their local neighborhood**, not being told they're #4,301,912.
:::`,
  },
];

export default questions;
