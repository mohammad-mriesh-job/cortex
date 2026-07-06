import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'sd-fnd-hld-vs-lld',
    question: 'What is the difference between High-Level Design (HLD) and Low-Level Design (LLD)?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['hld', 'lld', 'basics'],
    answer: `They are two zoom levels on the same system:

| | **HLD** | **LLD** |
|--|--|--|
| Scope | The whole system | A single component |
| Artifact | Architecture diagram (boxes & arrows) | Class diagram, schema |
| Vocabulary | Load balancer, cache, shard, queue | class, interface, method, pattern |
| Optimizes for | Scale, availability, latency | Extensibility, clean code |

- **HLD** answers *"what are the components and how does data flow?"* — this is what most system-design interviews test.
- **LLD** answers *"how is one component built internally?"* — classes, methods, and design patterns (e.g. "design the \`RateLimiter\` class").

:::tip
If the prompt is "Design Twitter," it's HLD. If it's "Design the \`TweetService\` class," it's LLD.
:::`,
  },
  {
    id: 'sd-fnd-functional-vs-nonfunctional',
    question: 'Distinguish functional from non-functional requirements. Why do NFRs drive the architecture?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['requirements', 'nfr'],
    answer: `- **Functional** — *what the system does*: features and verbs. "Users can upload a photo," "users can follow each other."
- **Non-functional (NFRs, the "-ilities")** — *how well it does it*: measurable qualities like latency, availability, scalability, durability, consistency. "Feed p99 < 200 ms," "99.9% uptime."

**Why NFRs drive the design:** anyone can store a photo (functional). Making it load in 200 ms for 500M users (non-functional) is what forces load balancers, caches, replicas, and sharding. The interesting architecture exists to satisfy the NFRs.

:::key
Always split the prompt into both buckets first. Then let the NFRs — especially scale and latency targets — dictate your components.
:::`,
  },
  {
    id: 'sd-fnd-first-steps',
    question: 'You are asked to "Design a ride-sharing app." What are your first steps before drawing anything?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['requirements', 'process', 'estimation'],
    answer: `Resist the urge to draw boxes. Follow a structured opening:

1. **Clarify functional requirements** — what must it do? (Request a ride, match driver↔rider, track location, pay.) Confirm what is *out of scope*.
2. **Clarify non-functional requirements** — availability target, latency (matching should feel instant), consistency needs, regions.
3. **Estimate scale** — daily active users, rides/sec, read:write ratio, storage. This sizes your components.
4. **Sketch the API** — the core endpoints (\`requestRide\`, \`updateLocation\`).
5. **Then** draw the high-level architecture.

:::senior
Interviewers score *structure and driving the conversation*. Stating assumptions out loud ("I'll assume 1M daily rides, read-heavy") is exactly the signal they look for.
:::`,
  },
  {
    id: 'sd-fnd-request-lifecycle',
    question: 'Walk through what happens when a user requests a web page, from URL to response.',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['request-lifecycle', 'dns', 'load-balancer', 'cache'],
    answer: `The request flows through a series of stops:

1. **DNS** resolves the domain to an IP address (heavily cached in browser/OS/resolver, so usually off the hot path).
2. **Load Balancer** receives the request and forwards it to the least-busy healthy app server.
3. **App Server** runs business logic and orchestrates data access.
4. **Cache** is checked first (cache-aside). On a **hit**, data returns immediately.
5. On a **miss**, the **Database** (source of truth) is queried, and the result is written back into the cache.
6. The response travels back up: app server → load balancer → client.

\`\`\`text
Client → DNS → Load Balancer → App Server → Cache → Database → (back)
\`\`\`

:::tip
Every hop adds latency and a potential failure point — justify each one by a requirement rather than drawing the full stack reflexively.
:::`,
  },
  {
    id: 'sd-fnd-latency-vs-throughput',
    question: 'What is the difference between latency and throughput? Give an example where improving one hurts the other.',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['latency', 'throughput', 'performance'],
    answer: `- **Latency** — time for a *single* request (ms, µs). "How long to cross the bridge?"
- **Throughput** — requests handled *per unit time* (req/sec). "How many cars per minute?"

**Trade-off example — batching:** grouping many requests into one batch amortizes fixed overhead across more work, raising **throughput**. But each request now waits for the batch to fill, *increasing* **latency**.

Other examples: a wider "highway" (more servers) raises throughput without lowering the drive time; adding parallelism helps throughput but can add coordination latency.

:::key
State goals in the right unit: "handle 50K req/s" (throughput) vs "respond in <100 ms" (latency). They are optimized differently.
:::`,
  },
  {
    id: 'sd-fnd-latency-numbers',
    question: 'Roughly how much slower is a disk seek than a RAM access, and why does that number matter?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['latency', 'numbers', 'caching'],
    answer: `Orders of magnitude to know:

| Operation | Latency |
|--|--|
| L1 cache | ~1 ns |
| Main memory (RAM) | ~100 ns |
| SSD random read | ~100 µs |
| Rotational disk seek | ~10 ms |
| Same-DC round-trip | ~0.5 ms |
| Cross-region round-trip | ~150 ms |

**RAM (~100 ns) vs disk seek (~10 ms) ≈ 100,000x.** That single fact is *the reason caches exist*: keeping hot data in memory avoids a five-orders-of-magnitude penalty. Related: SSD is ~100x faster than spinning disk; a cross-region hop (~150 ms) is ~300x a same-DC hop, so keep hot paths in one region.

:::tip
Memorize orders of magnitude, not exact digits — the point is relative cost when reasoning about a design.
:::`,
  },
  {
    id: 'sd-fnd-tail-latency-p99',
    question: 'Why do we care about p99 (tail) latency instead of the average?',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['p99', 'tail-latency', 'performance'],
    answer: `Averages hide the slow requests users actually feel.

- **p50/median** — half of requests are faster.
- **p99** — 99% are faster; the slowest 1% (the tail) is worse.

**Fan-out amplifies the tail.** If one page makes 100 parallel backend calls and each has a 1% chance of hitting its slow p99, the probability that *at least one* is slow is:

\`\`\`text
1 − 0.99^100 ≈ 63%
\`\`\`

So most page loads hit some server's tail. A great average is meaningless if two-thirds of pages feel slow.

:::senior
Express SLOs as percentiles ("feed p99 < 200 ms"), never averages. Recognizing that fan-out makes the tail the *common* case is a strong senior signal.
:::`,
  },
  {
    id: 'sd-fnd-tcp-vs-udp',
    question: 'When would you choose UDP over TCP?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['tcp', 'udp', 'protocols'],
    answer: `| | TCP | UDP |
|--|--|--|
| Connection | Handshake first | Connectionless |
| Reliability | Guaranteed, retransmits | Best-effort, may drop |
| Ordering | In-order | None |
| Speed | Slower to start | Fast, low overhead |

Choose **UDP** when **low latency beats perfect delivery** and stale data is useless if it arrives late:
- **Live video/voice calls** — a retransmitted late frame is worthless.
- **Online gaming** — send the latest position, don't wait for lost packets.
- **DNS**, live streaming, and QUIC/HTTP3.

Choose **TCP** for anything that must be correct and ordered: web pages, APIs, database connections, file transfer.

:::tip
Mnemonic: TCP = phone call (connect, confirm, ordered); UDP = shouting across a room (fast, no confirmation).
:::`,
  },
  {
    id: 'sd-fnd-rest-grpc-graphql',
    question: 'Compare REST, gRPC, and GraphQL. When is each the right choice?',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['rest', 'grpc', 'graphql', 'api'],
    answer: `| | REST | gRPC | GraphQL |
|--|--|--|--|
| Payload | JSON (text) | Protobuf (binary) | JSON |
| Transport | HTTP/1.1+ | HTTP/2 | HTTP |
| Contract | Loose (OpenAPI) | Strong (\`.proto\`) | Strong (schema) |
| Fetching | Over/under-fetch | Fixed methods | Exact fields the client asks for |
| Sweet spot | Public APIs | Internal microservices | Rich/mobile clients |

- **REST** — simple, cacheable, universally understood. Best for **public-facing APIs**. Downside: over-fetching (whole objects) and under-fetching (N calls for N resources).
- **gRPC** — binary Protobuf over HTTP/2: fast, strongly typed, built-in streaming. Best for **internal service-to-service** calls. Not natively browser-friendly.
- **GraphQL** — client specifies exactly the fields it wants from one endpoint, eliminating over/under-fetching. Best for **flexible clients** (mobile, complex UIs). Cost: harder caching and risk of expensive nested queries.

:::senior
There is no single winner — the answer is "it depends on the caller." Public API → REST; internal high-throughput RPC → gRPC; data-hungry mobile client → GraphQL.
:::`,
  },
  {
    id: 'sd-fnd-websocket-vs-sse',
    question: 'For real-time updates, how do you choose between WebSockets, SSE, and long-polling?',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['websockets', 'sse', 'long-polling', 'real-time'],
    answer: `Plain HTTP is client-pull, so real-time features need one of these:

| Technique | Direction | Connection | Best for |
|--|--|--|--|
| Short polling | Client pulls | New request each time | Simple, infrequent updates |
| Long polling | Client pulls (held) | Request held until data | Fallback when WS unavailable |
| **SSE** | Server → client only | One long-lived HTTP stream | Feeds, notifications, tickers |
| **WebSocket** | Full duplex (both ways) | One persistent TCP connection | Chat, gaming, collaboration |

**Rule: pick the least powerful tool that works.**
- One-directional (notifications, live scores) → **SSE**: simpler, runs over HTTP, auto-reconnects.
- Two-directional (chat, collaborative editing, multiplayer) → **WebSocket**.
- Long-polling is a compatibility fallback.

:::gotcha
Persistent connections (WS/SSE) are **stateful** — each holds a server socket. Behind a load balancer you need sticky sessions or a shared pub/sub layer (e.g. Redis) so any server can push to any connected client. A frequent scaling pitfall.
:::`,
  },
  {
    id: 'sd-fnd-consistency-models',
    question: 'Walk me through the main consistency models from strongest to weakest.',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['consistency', 'eventual-consistency', 'causal', 'read-your-writes'],
    answer: `Consistency is a **spectrum** — strongest (and slowest) at the top, weakest (and fastest) at the bottom.

| Model | Guarantee | Cost / example |
|--|--|--|
| **Strong / linearizable** | Every read sees the latest write, as if one copy | Coordination latency — etcd, Spanner |
| **Causal** | Causally-related ops seen in order everywhere; concurrent ops may differ | A good middle ground |
| **Read-your-writes** | You always see your own writes | Cheap session guarantee |
| **Monotonic reads** | Time never appears to go backwards | Cheap session guarantee |
| **Eventual** | Replicas converge *if writes stop* | Fastest — DNS, S3, Cassandra default |

**Session guarantees** (read-your-writes, monotonic reads/writes) are cheap and fix the most jarring anomalies without paying for full linearizability.

:::senior
Pick the **weakest** model that meets the requirement — every step toward strong consistency costs latency and availability. Choose **per-operation**: a bank balance may need strong; a like-count is fine eventual.
:::`,
  },
  {
    id: 'sd-fnd-dns-ttl',
    question: 'How does DNS resolution work, and what does the TTL control?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['dns', 'ttl', 'networking'],
    answer: `DNS maps a hostname → IP through a **cached hierarchy**, so it's usually off the hot path:

\`\`\`text
browser cache → OS cache → recursive resolver → root → TLD (.com) → authoritative NS
\`\`\`

**TTL** (in seconds) tells resolvers how long to cache a record:
- **Low TTL (60s)** — fast changes/failover, but more query load.
- **High TTL (24h)** — fewer lookups, but slow propagation.

Providers like Route 53 also do **geo/latency routing**, returning a different IP per region so users hit the nearest one.

:::gotcha
Because clients cache to the TTL — and some ignore it entirely — DNS-based failover is **slow** (minutes). Don't use DNS changes for fast failover; use a **load balancer**, a **floating IP**, or **anycast** instead.
:::`,
  },
  {
    id: 'sd-fnd-tls-handshake',
    question: 'What happens during a TLS handshake, and how many round trips does it cost?',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['tls', 'https', 'security', 'latency'],
    answer: `TLS establishes an **encrypted, authenticated** channel before any HTTP flows. **TLS 1.2** costs **~2 RTT** on top of TCP's 1 RTT:

1. **ClientHello** — supported ciphers + client random.
2. **ServerHello + certificate** — chosen cipher, server random, cert.
3. Client **verifies the cert chain** against a trusted CA.
4. **ECDHE key exchange** — both sides derive a shared **symmetric** session key.
5. **Finished** — traffic is encrypted from here on.

The asymmetric crypto (RSA/ECDHE) only *agrees the key*; bulk data uses fast symmetric **AES**. **TLS 1.3** cuts setup to **1 RTT**, with **0-RTT** resumption for repeat visits.

:::senior
At 50–150 ms cross-region RTT, handshake round trips **dominate** first-request latency. That's why TLS 1.3, session resumption, connection reuse (keep-alive, HTTP/2 multiplexing), and CDNs terminating TLS at the edge near the user all matter.
:::`,
  },
  {
    id: 'sd-fnd-http-versions',
    question: 'Compare HTTP/1.1, HTTP/2, and HTTP/3.',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['http', 'http2', 'http3', 'quic'],
    answer: `Each version attacks **head-of-line (HoL) blocking** at a deeper layer:

| | HTTP/1.1 | HTTP/2 | HTTP/3 |
|--|--|--|--|
| Framing | Text | Binary | Binary |
| Concurrency | One request per connection | **Multiplexed** streams over one TCP conn | Multiplexed over QUIC |
| HoL blocking | App-layer, per connection | Transport-layer — one lost packet stalls all streams | **None** — streams independent |
| Transport | TCP | TCP | QUIC (UDP) + built-in TLS 1.3 |

**HTTP/1.1** forces browsers to open ~6 parallel TCP connections. **HTTP/2** multiplexes many streams over one connection with header compression (HPACK) — but a single lost TCP packet still stalls every stream. **HTTP/3** runs each stream independently over QUIC, so a lost packet only stalls its own stream, plus faster 0–1 RTT setup. **gRPC uses HTTP/2.**

:::gotcha
HTTP/2 multiplexing fixed **app-layer** HoL blocking but **not transport-layer** — one lost packet still stalls every stream on that TCP connection. Moving to QUIC/UDP in HTTP/3 is what finally fixes it.
:::`,
  },
  {
    id: 'sd-fnd-type-url',
    question: 'What happens when you type a URL into your browser and hit enter?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['request-lifecycle', 'dns', 'tcp', 'tls', 'http'],
    answer: `The classic breadth question — walk the whole stack end to end:

1. **Parse** the URL (scheme, host, path).
2. **DNS** resolves host → IP (browser / OS / resolver caches).
3. **TCP handshake** (SYN → SYN-ACK → ACK) to the server — often a CDN edge or load balancer.
4. **TLS handshake** for HTTPS.
5. Browser sends the **HTTP request**.
6. **Server responds** — a CDN edge may answer from cache; otherwise LB → app server → cache/DB — returning HTML.
7. Browser **parses HTML**, fetches CSS/JS/images (more requests), builds the **DOM**, and renders.

Anycast/CDN routing means the IP you connect to is usually the **nearest edge**, not the origin.

:::tip
This tests **breadth**: hit DNS → TCP → TLS → HTTP → server-side (LB/cache/DB) → render, and mention **caching at every layer** (DNS cache, CDN, app cache, browser cache).
:::`,
  },
  {
    id: 'sd-fnd-proxy-types',
    question: 'What is the difference between a forward proxy and a reverse proxy?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['proxy', 'reverse-proxy', 'networking'],
    answer: `Both sit in the middle — but on **opposite sides** of the connection.

| | Forward proxy | Reverse proxy |
|--|--|--|
| Acts for | The **client** (client configures it) | The **server** |
| Hides | Clients from servers | Servers from clients |
| Typical use | Corporate egress, VPN, content filtering, outbound cache | TLS termination, load balancing, caching, compression, routing |
| Examples | Squid, corporate proxy | **NGINX, Envoy, HAProxy** |

A **forward proxy** aggregates outbound client traffic — the server sees the proxy, not the client. A **reverse proxy** fronts your backends — the client thinks the proxy *is* the server.

:::key
Forward proxy **hides the client**; reverse proxy **hides the server**. A load balancer, an API gateway, and a CDN edge are all specialized reverse proxies.
:::`,
  },
  {
    id: 'sd-fnd-http-methods-idempotent',
    question: 'Which HTTP methods are safe and which are idempotent, and why does it matter?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['http', 'idempotency', 'rest', 'safe-methods'],
    answer: `- **Safe** = no side effects (read-only).
- **Idempotent** = N identical calls have the same effect as one.

| Method | Safe | Idempotent |
|--|--|--|
| GET / HEAD / OPTIONS | Yes | Yes |
| PUT | No | Yes |
| DELETE | No | Yes |
| POST | No | **No** |
| PATCH | No | Usually no |

**Why it matters:** idempotent methods can be safely **retried** by clients, proxies, and load balancers after a timeout. POST cannot — a retried \`POST /orders\` creates **two** orders, so you need an **idempotency key** to dedupe.

:::gotcha
Idempotent is about the **effect**, not the response. Two \`DELETE\`s return \`200\` then \`404\` — different responses — but the resource is deleted exactly once, so DELETE is still idempotent.
:::`,
  },
  {
    id: 'sd-fnd-availability-vs-durability',
    question: 'What is the difference between availability and durability?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['availability', 'durability', 'reliability'],
    answer: `They're **orthogonal** properties, and often confused:

- **Availability** — the system is **up and serving** requests right now. Measured in nines: 99.9% = **43.8 min/month** of downtime.
- **Durability** — once a write is **committed, it's never lost**. S3 advertises **11 nines** (99.999999999%).

You can have either without the other:
- **Durable but unavailable** — data sits safe on disk, but the service is down.
- **Available but not durable** — always answers, but a crash loses recent writes.

Durability comes from **replication + backups + write-ahead logs** across independent failure domains; availability comes from **redundancy + failover**.

:::key
Don't conflate *"my data is safe"* (durability) with *"my service is up"* (availability). A system can ace one and fail the other.
:::`,
  },
  {
    id: 'sd-fnd-scalability-definition',
    question: 'What does it actually mean for a system to be scalable?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['scalability', 'performance', 'fundamentals'],
    answer: `**Scalability** = the ability to handle growing load by **adding resources**, ideally with cost growing **linearly (or sub-linearly)** with load — it does *not* mean "fast." A scalable system keeps latency and throughput acceptable as users, data, or request rate go **10× or 100×**.

Distinguish it from **performance** (how fast for one user right now):
- **Fast but unscalable** — snappy today, falls over at 2× load.
- **Scalable but modest** — unremarkable per request, but holds up at 100×.

:::senior
The real signal is scaling **dimensions separately**: read load, write load, data volume, and geographic spread each scale differently — cache/replicas for reads, shard/queue for writes, partition for data, multi-region for geography. "It's slow" and "it won't scale" are different problems.
:::`,
  },
  {
    id: 'sd-fnd-estimation-data-units',
    question: 'What numbers do you need in your head to do back-of-envelope estimation?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['estimation', 'back-of-envelope', 'capacity'],
    answer: `A small set of reusable constants does most of the work:

| Category | Numbers to memorize |
|--|--|
| Powers of two | 2^10 ≈ 1K, 2^20 ≈ 1M, 2^30 ≈ 1B |
| Time | 1 day ≈ 86,400 s ≈ **10^5 s** |
| Data sizes | char = 1 byte, UUID ≈ 16 B, a row/tweet ≈ 100s of B–1KB, image ≈ 100s of KB–few MB, 1 min video ≈ tens of MB |
| Storage | 1M × 1KB = **1GB**; 1B × 1KB = **1TB** |

**Method:** users → QPS → storage/day → × retention → bandwidth. Divide daily ops by 10^5 for **average** QPS, then **×2–3 for peak**.

:::tip
Round **aggressively** (86,400 → 10^5). You want the **order of magnitude** that justifies a design choice — "this needs sharding, not one box" — not a precise figure.
:::`,
  },
  {
    id: 'sd-fnd-microservices-vs-monolith',
    question: 'What are the trade-offs between a monolith and microservices?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['microservices', 'monolith', 'architecture'],
    answer: `| | Monolith | Microservices |
|--|--|--|
| Deployable | One unit | Many independent services |
| Calls | In-process (fast, reliable) | Network (latency, partial failure) |
| Data | One DB, easy transactions | DB per service, **sagas** for cross-service |
| Scaling | As one unit | Per-service |
| Ops complexity | Low | High — discovery, tracing, more infra |

A **monolith** is simpler to build, test, deploy, and debug, but scales as one block and grows harder to maintain. **Microservices** give independent scaling, tech heterogeneity, and fault isolation — at the cost of network calls, distributed transactions, and operational overhead.

:::senior
Start with a **modular monolith**; extract a service only for a concrete pressure — independent scaling, team ownership, or fault isolation. "Microservices for a 5-person startup" is a classic **over-engineering** trap; distributed systems are hard.
:::`,
  },
  {
    id: 'sd-fnd-api-versioning',
    question: 'How do you version a public API without breaking existing clients?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['api-design', 'versioning', 'backwards-compatibility'],
    answer: `You version so you can **evolve** without breaking existing clients. Three schemes:

| Strategy | Example | Trade-off |
|--|--|--|
| **URL path** | \`/v1/users\` | Explicit, cache-friendly — most common |
| **Header / media-type** | \`Accept: application/vnd.api.v2+json\` | Clean URLs, harder to test |
| **Query param** | \`?version=2\` | Simple, but easy to miss |

Prefer **additive, backwards-compatible** changes (new *optional* fields) so you rarely bump the major version — clients must ignore unknown fields (the **tolerant reader** rule). Bump the major only for **breaking** changes; run old + new in parallel and deprecate with a **sunset timeline**.

:::gotcha
The hard part isn't the scheme — it's the **migration**. You must run multiple versions **simultaneously** and give clients time to move. Never break \`v1\` the day you ship \`v2\`.
:::`,
  },
];

export default questions;
