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
  {
    id: 'sd-cache-redis-vs-memcached',
    question: 'Redis vs Memcached — how do you choose?',
    difficulty: 'Easy',
    category: 'Caching',
    tags: ['redis', 'memcached', 'comparison'],
    answer: `Both are **in-memory key-value caches** delivering sub-millisecond reads at **~100k+ ops/s**. The split: **Memcached** is a dead-simple, multithreaded, strings-only cache with pure LRU — great when you want a plain fast cache and nothing else. **Redis** is single-threaded per shard but far richer.

| | Memcached | Redis |
|--|--|--|
| **Threading** | Multithreaded (scales on cores) | Single-threaded per shard |
| **Data types** | Strings only | Strings, hashes, sorted sets, lists, sets, bitmaps, HyperLogLog, streams |
| **Persistence** | None | RDB snapshots + AOF log |
| **HA** | None built-in | Replication + failover (Sentinel/Cluster) |
| **Extras** | — | Pub/sub, Lua scripting, TTLs, transactions |

:::senior
Default to **Redis**: its data structures solve problems a plain cache can't — sorted sets for leaderboards/rate-limiting, atomic \`INCR\`, Lua for check-and-set — and it survives restarts via persistence. Choose **Memcached** only for a pure, large, multithreaded string cache where simplicity wins.
:::`,
  },
  {
    id: 'sd-cache-write-around',
    question: 'What is write-around caching and when do you use it?',
    difficulty: 'Medium',
    category: 'Caching',
    tags: ['write-around', 'write-patterns', 'cache'],
    answer: `In **write-around**, writes go **straight to the database and bypass the cache**; the cache is populated only later, lazily, on a read miss (cache-aside on reads). It sits between the other two write policies:

| Policy | Write path | Cache after write |
|--|--|--|
| **Write-through** | Cache **and** DB together | Populated (fresh) |
| **Write-back** | Cache first, DB flushed async | Populated (DB trails) |
| **Write-around** | **DB only**, skip cache | Empty until a later read |

The win: you avoid **polluting the cache with write-once data** that would evict hotter entries. The cost: a read immediately after a write is a **guaranteed miss**.

:::key
Combine write-around (skip cache on write) with **cache-aside** (populate on read) so the cache holds only the actually-read hot set. Use it for write-heavy, seldom-immediately-read data (logs, audit trails); switch to **write-through** when you need read-after-write straight from the cache.
:::`,
  },
  {
    id: 'sd-cache-eviction-policies',
    question: 'What eviction policies does a cache use when it runs out of memory?',
    difficulty: 'Medium',
    category: 'Caching',
    tags: ['eviction', 'lru', 'lfu', 'ttl'],
    answer: `When the cache fills, it must **evict** something to admit a new entry. The common policies:

- **LRU (least-recently-used)** — evict the coldest by recency; the default, bets on temporal locality.
- **LFU (least-frequently-used)** — evict by access count; better for stable skew but slow to adapt, so old high-count items stick around.
- **FIFO / random** — cheap, ignore access entirely.
- **TTL / volatile** — expire by age.

Redis exposes these as \`maxmemory-policy\`: \`noeviction\` (reject writes), \`allkeys-lru\`, \`allkeys-lfu\`, \`volatile-lru\` (only keys with a TTL), \`volatile-ttl\`.

:::gotcha
With \`noeviction\` a full Redis starts **erroring every write** — a classic outage. And \`volatile-*\` evicts **nothing** if no keys have TTLs, so it also OOMs. Use \`allkeys-lru\` for a pure cache; reserve \`volatile-*\` for an instance that mixes cache + persistent data.
:::`,
  },
  {
    id: 'sd-cache-consistency',
    question: 'Why is keeping a cache consistent with the database so hard?',
    difficulty: 'Hard',
    category: 'Caching',
    tags: ['cache-consistency', 'invalidation', 'dual-write'],
    answer: `The cache is a **second copy**, so every write must update two stores **non-atomically** over a network — and any non-atomic pair of updates races.

- **Dual-write race** — threads A and B each write the DB then the cache; an unlucky interleaving leaves the cache holding a **stale value permanently**.
- **Cache-aside race** — a read misses and loads the **old** value into cache just after a writer invalidated it.

Mitigations:

1. **Delete, don't update** the key on write — the next read reloads fresh.
2. **Short TTL backstop** — bounds staleness even if an invalidation is missed.
3. **Versioned keys** — a stale write can't clobber a newer version.
4. **CDC-driven invalidation** — update the cache from the DB change log, one ordered source of truth.

:::senior
You fundamentally **can't** get an atomic cache+DB update over the network, so accept **bounded staleness**: invalidate-on-write plus a TTL backstop is the pragmatic standard. As the saying goes, "there are only two hard things in computer science: cache invalidation and naming things."
:::`,
  },
  {
    id: 'sd-cache-penetration-avalanche',
    question: 'Explain cache penetration and cache avalanche, and how to defend against each.',
    difficulty: 'Hard',
    category: 'Caching',
    tags: ['cache-penetration', 'cache-avalanche', 'bloom-filter'],
    answer: `Two failure modes distinct from a **stampede** (a single hot key expiring):

| | **Penetration** | **Avalanche** |
|--|--|--|
| **Cause** | Requests for keys that **don't exist** always miss | A **huge number** of keys expire at once (or the cache restarts cold) |
| **Effect** | Every request hits the DB (often malicious enumeration) | A flood of simultaneous misses collapses the DB |
| **Defense** | Cache the **negative** result (null/tombstone, short TTL); a **Bloom filter** to reject definitely-absent keys cheaply | **TTL jitter** (randomize expiries), a warm standby / gradual warm-up, request coalescing |

:::gotcha
A plain "cache in front of DB" quietly assumes **the DB survives the miss rate**. Penetration and avalanche both break that assumption — so either size the DB for a realistic worst-case miss storm, or add these guards: negative caching + a Bloom filter for penetration, TTL jitter + warm-up for avalanche.
:::`,
  },
  {
    id: 'sd-cache-local-vs-distributed',
    question: 'When would you use a local in-process cache vs a distributed cache like Redis?',
    difficulty: 'Medium',
    category: 'Caching',
    tags: ['local-cache', 'distributed-cache', 'coherence'],
    answer: `A **local (in-process) cache** (Caffeine, a plain \`HashMap\`) lives in the app heap — **nanosecond** access, zero network hop — but each server has its own copy, so it's capped by one box's RAM and **incoherent** across the fleet (server A serves a value B just invalidated). A **distributed cache** (Redis/Memcached) is a shared tier — one coherent view, larger capacity, survives app restarts — but every access is a **~0.5 ms** network round trip.

| | Local (L1) | Distributed (L2) |
|--|--|--|
| **Latency** | ~100 ns (heap) | ~0.5 ms (network) |
| **Capacity** | One box's RAM | The whole cluster |
| **Coherence** | Per-node, can diverge | Shared, single view |
| **Survives restart** | No | Yes |

Often use **both** (a near cache): a tiny local L1 for the hottest keys, Redis L2 as the shared source.

:::gotcha
Local caches make invalidation hard — you must **broadcast evictions to every node** (e.g. via Redis pub/sub) — and they multiply staleness. Use short TTLs and reserve them for read-mostly, staleness-tolerant data: config, feature flags, hot reference data.
:::`,
  },
  {
    id: 'sd-cache-ttl-choice',
    question: 'How do you choose a TTL for a cache entry?',
    difficulty: 'Medium',
    category: 'Caching',
    tags: ['ttl', 'staleness', 'invalidation'],
    answer: `A TTL trades **freshness vs load**. A long TTL means a higher hit ratio and less DB load but more staleness; a short TTL means fresher data but a lower hit ratio and more misses. Pick it from the data's **tolerance for staleness** and its **change rate**:

| Data | Change rate | TTL |
|--|--|--|
| Reference data (country list) | Near-static | Hours–days |
| Price / inventory count | Fast | Seconds |
| User hot data | Moderate | Minutes |

Keep **some** TTL even with explicit invalidation, as a backstop against a missed one. Add **jitter** so co-created keys don't all expire together (avalanche).

:::senior
There's no single right TTL — set it **per key-class** from the business staleness budget, and pair a modest TTL with **event/write invalidation** so you get freshness normally and bounded staleness when an invalidation is missed. State the staleness you're accepting out loud.
:::`,
  },
  {
    id: 'sd-cache-session-store',
    question: 'How do you store user sessions so the app tier can stay stateless?',
    difficulty: 'Medium',
    category: 'Caching',
    tags: ['session-store', 'redis', 'stateless'],
    answer: `Move session state **out of app-server memory** into a shared external store, so any server can handle any request — the prerequisite for horizontal scaling, autoscaling, and rolling deploys. **Redis is the standard**: in-memory speed, native TTL for expiry, replication for HA. The client holds a **session-id cookie**; the server looks it up in Redis on each request.

The alternative is a **stateless signed token (JWT)** carrying the session data — no server lookup, but hard to revoke.

| | Redis session store | JWT |
|--|--|--|
| **Lookup per request** | Yes (a Redis GET) | None (self-contained) |
| **Revoke instantly** | Yes (delete the key) | No (valid until expiry) |
| **Shared dependency** | Redis | None |

:::gotcha
Redis sessions are a **shared dependency** — size it for HA (replica + failover) or a Redis outage logs everyone out. JWT skips the lookup but you **can't invalidate a token before expiry** without a server-side blocklist (which reintroduces the lookup). Pick based on whether instant revocation matters.
:::`,
  },
  {
    id: 'sd-cache-hot-key',
    question: 'A single hot key is overwhelming one Redis node. How do you handle it?',
    difficulty: 'Hard',
    category: 'Caching',
    tags: ['hot-key', 'redis', 'sharding'],
    answer: `In a sharded cache one key hashes to **one node**, so a viral key (a celebrity profile, a flash-sale item) can saturate that single shard's CPU/network — its **~100k ops/s** ceiling — while the other shards idle. It's the read equivalent of a **hot partition**. Fixes:

1. **Local / near cache** in each app server for the hottest keys, so most reads never reach Redis.
2. **Replicate the hot key** across nodes — read replicas, or copies \`key#1\`..\`key#N\` picked at random per read.
3. **Client-side request coalescing** to collapse duplicate concurrent reads.

Detect it via per-key metrics (\`redis-cli --hotkeys\`).

:::senior
The general move is to **add a caching layer in front of the cache**: a small in-process cache absorbs a hot read key at near-zero cost, converting one hammered shard into fleet-local reads. Replication helps **reads**; a hot **write** key still needs key-splitting — spread the writes across N sub-keys and merge on read.
:::`,
  },
  {
    id: 'sd-cache-warming',
    question: 'What is a cold cache problem and how do you warm a cache?',
    difficulty: 'Medium',
    category: 'Caching',
    tags: ['cache-warming', 'cold-start', 'preload'],
    answer: `A **cold cache** (fresh deploy, restart, failover, or scale-out) has a **~0% hit ratio**, so all traffic falls through to the DB at once — a DB that was sized assuming the cache absorbs most reads. The result: **the DB can topple exactly when you restart**. Ways to warm it:

- **Pre-load known-hot keys** before taking traffic — replay top queries or bulk-load from the DB.
- **Roll restarts gradually** — never flush the whole fleet at once.
- **Use a replica** so a failover keeps a warm copy.
- **Gate traffic ramp-up** so misses trickle rather than flood.

:::gotcha
The danger isn't the empty cache itself — it's the **synchronized miss storm** hitting the DB. Never cold-restart the entire cache tier simultaneously; warm it or ramp traffic so the DB isn't hit by 100% of reads at once. It's a close cousin of cache avalanche.
:::`,
  },
  {
    id: 'sd-cache-cdn-vs-appcache',
    question: 'How is a CDN different from an application cache like Redis?',
    difficulty: 'Easy',
    category: 'Caching',
    tags: ['cdn', 'application-cache', 'layers'],
    answer: `Both are caches, but at **different layers and scopes**. A **CDN** caches static/cacheable HTTP responses at **edge servers** geographically near users (images, JS/CSS, video); a hit is served from a nearby city and **never reaches your origin**, cutting latency and bandwidth. An **application cache** (Redis/Memcached) sits **next to your app servers** in the datacenter and caches arbitrary application **data/objects** (query results, sessions, computed values) that your code reads.

| | CDN | App cache (Redis) |
|--|--|--|
| **Layer** | HTTP / network edge | Data tier in the DC |
| **Location** | PoPs near users | Beside the app servers |
| **Content** | Cacheable HTTP responses | Arbitrary data objects |
| **Who reads it** | The browser (implicitly) | Your application code |
| **Offloads** | Origin + geographic latency | The database |

:::key
CDN = HTTP responses at the network edge (offloads the origin, cuts geographic latency); app cache = data objects in the DC (offloads the database). Most designs use **both**, at opposite ends of the request path.
:::`,
  },
];

export default questions;
