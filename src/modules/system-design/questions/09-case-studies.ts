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
];

export default questions;
