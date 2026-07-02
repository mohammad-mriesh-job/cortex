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
];

export default questions;
