import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'sd-cache-why',
    question: 'When is data a good candidate for caching, and when does caching hurt?',
    difficulty: 'Easy',
    category: 'Caching',
    tags: ['fundamentals', 'hit-ratio'],
    answer: `Cache data that is **read far more often than it changes** and is **expensive to produce** — that read-heavy, costly-read combination amortizes the cost of populating the cache.

Caching **hurts** when:

- **Write-heavy / rarely re-read data** → low hit ratio, so you pay to populate and invalidate entries that are seldom served.
- **Strong consistency is required** → a cache is a copy and can serve stale reads.
- **Low hit ratio in general** → every request now does a cache lookup *and* a DB read *and* a cache write.

:::gotcha
A cache with a poor hit ratio is worse than no cache. Always measure the hit ratio in production; if it's low, fix your keys/TTLs or remove the cache.
:::`,
  },
  {
    id: 'sd-cache-layers',
    question: 'Walk through the caching layers a read request can pass through, from the user to the database.',
    difficulty: 'Medium',
    category: 'Caching',
    tags: ['architecture', 'cdn', 'redis'],
    answer: `Caching is a **funnel** of layers; a request only reaches the DB if every layer in front missed:

1. **Browser cache** — on the user's device, static assets and prior responses (scope: one user).
2. **CDN / edge cache** — geographically near the user (scope: a whole region).
3. **In-process cache** — RAM inside the app server, hot objects/config (scope: one server).
4. **Distributed cache** — Redis/Memcached, shared across app servers (scope: the fleet).
5. **DB buffer pool** — recently-read pages inside the database itself.

The further **left** (closer to the user) a request is answered, the cheaper and faster it is, and the less load hits everything downstream. A CDN hit never touches your app servers at all.`,
  },
  {
    id: 'sd-cache-hit-ratio',
    question: 'Define cache hit ratio and explain why going from a 90% to a 99% hit ratio matters so much.',
    difficulty: 'Medium',
    category: 'Caching',
    tags: ['hit-ratio', 'latency', 'math'],
    answer: `**Hit ratio** = \`hits / (hits + misses)\` — the fraction of lookups the cache answers itself.

Average latency is a weighted blend: \`avg = (hitRatio × cacheLatency) + (missRatio × sourceLatency)\`.

The average is **miss-dominated**. With a 0.5 ms Redis hit and a 20 ms DB miss:

| Hit ratio | Avg latency | DB load |
|--|--|--|
| 90% | ~2.45 ms | 10% |
| 95% | ~1.48 ms | 5% |
| 99% | ~0.70 ms | 1% |

Because the rare misses contribute most of the average, cutting misses 10× (90% → 99%) roughly halves latency *again* and drops DB load to 1%. The last few percent of hit ratio are worth the most — which is why teams obsess over the tail.`,
  },
  {
    id: 'sd-cache-aside',
    question: 'Explain the cache-aside (lazy loading) pattern and its main pitfalls.',
    difficulty: 'Medium',
    category: 'Caching',
    tags: ['cache-aside', 'strategies'],
    answer: `In **cache-aside** the *application* manages the cache directly:

\`\`\`text
READ:  cache.get(k) ?? { v = db.get(k); cache.set(k, v, ttl); v }
WRITE: db.put(k, v); cache.del(k)   // invalidate, don't update in place
\`\`\`

- On a miss, the app loads the DB and populates the cache itself.
- On a write, the app updates the DB and **deletes** the key so the next read reloads fresh.

**Strengths:** only requested data is cached (exactly the hot set), and it's resilient — if the cache is down the app still reads the DB directly.

**Pitfalls:**
- **Cold-start misses** — the first read of any key is always a miss.
- **Write-then-read race** — an in-flight read can repopulate the cache with the *old* value after a writer's invalidation. Mitigate with short TTLs, versioned keys, or deleting (not updating) the key.

It's the most common pattern in production Redis deployments.`,
  },
  {
    id: 'sd-cache-through-vs-aside',
    question: 'What is the difference between cache-aside and read-through?',
    difficulty: 'Easy',
    category: 'Caching',
    tags: ['read-through', 'cache-aside', 'strategies'],
    answer: `Both are **lazy** read patterns — they populate the cache on a miss. They differ only in **who owns the load-on-miss logic**:

- **Cache-aside** — the *application* checks the cache and, on a miss, reads the DB and populates the cache. More boilerplate, more control.
- **Read-through** — the *cache library* fetches from the DB on a miss via a registered loader function. The app only ever talks to the cache. Cleaner, centralized app code, but requires cache support.

Neither changes read semantics; it's purely about where the loading code lives.`,
  },
  {
    id: 'sd-cache-write-through-vs-back',
    question: 'Compare write-through and write-back (write-behind) caching.',
    difficulty: 'Medium',
    category: 'Caching',
    tags: ['write-through', 'write-back', 'consistency'],
    answer: `Both are **write** policies:

| | Write-through | Write-back (write-behind) |
|--|--|--|
| **DB write** | Synchronous, with the cache write | Asynchronous, flushed later (batched) |
| **Consistency** | Strong — cache never lags | Eventual — DB trails the cache |
| **Write latency** | Higher (two hops before ack) | Lowest (memory-only ack) |
| **Durability** | Safe | Data loss if cache crashes before flush |
| **Best for** | Read-after-write correctness | High write volume, loss-tolerant (counters, metrics) |

**Write-through** gives strong consistency at the cost of write latency; it pairs well with read-through so writes pre-warm the cache. **Write-back** gives the fastest, highest-throughput writes by coalescing many updates into few DB writes, but risks losing unpersisted data on a crash.

:::senior
Read and write policies are chosen **independently**. Say "for reads I'd use X, for writes Y, because…" rather than naming one pattern for everything.
:::`,
  },
  {
    id: 'sd-cache-lru',
    question: 'How does an LRU cache work, and how does it differ from FIFO?',
    difficulty: 'Medium',
    category: 'Caching',
    tags: ['lru', 'fifo', 'eviction'],
    answer: `**LRU (Least Recently Used)** evicts the entry that has gone untouched the longest, betting on **temporal locality** (recently used → soon reused). Every access — read or write — moves the key to the "most recently used" front; when full, the entry at the "least recently used" tail is evicted.

Implementation: a **hash map + doubly linked list** gives O(1) \`get\`, \`put\`, and eviction. The map finds the node; the list tracks recency order.

**Difference from FIFO:** FIFO evicts by **insertion order** and ignores access, so it can evict a hot item that's read constantly. LRU tracks recency of *use* — a hit **promotes** the entry, protecting it from eviction. That promotion-on-use is the whole distinction.

LRU is the general-purpose default (Redis \`allkeys-lru\`); LFU (by frequency) suits skewed popularity but risks old high-count items polluting the cache.`,
  },
  {
    id: 'sd-cache-invalidation',
    question: 'What are the ways to invalidate a cache, and why keep a TTL even when you invalidate explicitly?',
    difficulty: 'Hard',
    category: 'Caching',
    tags: ['invalidation', 'ttl', 'consistency'],
    answer: `Three approaches to keeping cached copies correct:

| Approach | How | Trade-off |
|--|--|--|
| **TTL / expiry** | Entry auto-expires after N seconds | Simple; serves stale data up to N s |
| **Write invalidation** | On a DB write, delete/update the key | Fresh; every writer must remember to do it |
| **Event-driven** | DB change feed / pub-sub tells caches to evict | Accurate + decoupled; more infrastructure |

**Always keep a TTL as a safety net**, even with explicit invalidation. The dangerous bug is a **missed invalidation** — some code path writes the DB but forgets to touch the cache, so the stale value is served until the TTL expires (or forever, with no TTL). A TTL bounds the blast radius of any such bug to "stale for at most N seconds," and any stale entry self-heals.`,
  },
  {
    id: 'sd-cache-stampede',
    question: 'What is a cache stampede (thundering herd), and how do you defend against it?',
    difficulty: 'Hard',
    category: 'Caching',
    tags: ['thundering-herd', 'cache-stampede', 'reliability'],
    answer: `A **cache stampede** happens when a hot key expires (or the cache restarts cold) and a flood of concurrent requests all miss at once, then all hammer the database to recompute the **same** value. The DB — sized assuming the cache absorbs most reads — can fall over.

Defenses, in rough order of preference:

- **Request coalescing / per-key locking** — the first miss takes a lock and recomputes; the rest wait for that single result (Go's \`singleflight\`, a per-key mutex, or a Redis \`SETNX\` lease). One DB query instead of thousands.
- **Early / probabilistic recomputation** — refresh a hot key *before* it expires (XFetch-style jittered early expiry).
- **Stale-while-revalidate** — serve the slightly-stale value while one background task refreshes it; no one waits.
- **TTL jitter** — add a random spread to TTLs so keys inserted together don't all expire in the same instant (avoids a synchronized-expiry avalanche).

:::senior
The compact interview answer: "add random TTL jitter, and use a per-key lock / singleflight so only one request recomputes a missed hot key while the others wait." That covers both root causes — synchronized expiry and duplicate recomputation.
:::`,
  },
  {
    id: 'sd-cache-cdn',
    question: 'What is a CDN, and what is the difference between a push and a pull CDN?',
    difficulty: 'Medium',
    category: 'Caching',
    tags: ['cdn', 'edge', 'push-pull'],
    answer: `A **CDN (Content Delivery Network)** is a globally distributed fleet of edge/PoP cache servers placed physically near users. A CDN hit is served from a nearby city and **never reaches your origin**, cutting latency, origin load, and bandwidth cost, and absorbing traffic spikes. Best for static/cacheable content (images, CSS/JS, video, fonts).

**Pull vs push** — how content lands on the edge:

| | Pull CDN | Push CDN |
|--|--|--|
| **How** | Edge fetches from origin on first miss (lazy), then caches | You upload/publish content ahead of time |
| **First request** | Slow (miss → origin) | Fast (already at edge) |
| **Best for** | Large catalogs, changing content, most sites (the default) | Large, rarely-changing static files |

The origin controls edge TTL via **Cache-Control** headers (\`max-age\`, \`s-maxage\` for shared caches, \`no-store\`, \`stale-while-revalidate\`).

:::tip
Prefer **content-hash cache-busting** (\`app.9f3c2.js\`, cached a year) over CDN purges: changing the content changes the URL, so old copies are simply never requested again — no invalidation needed.
:::`,
  },
];

export default questions;
