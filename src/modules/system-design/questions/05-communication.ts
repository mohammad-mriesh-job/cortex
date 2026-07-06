import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'sd-comm-rest-verbs',
    question: 'What makes an API RESTful, and why put actions in the HTTP method rather than the URL?',
    difficulty: 'Easy',
    category: 'Communication',
    tags: ['rest', 'api design', 'http'],
    answer: `REST maps HTTP onto **resources (nouns)** and **methods (verbs)**. The URL names a *thing* (\`/users/42\`); the HTTP method says what you do to it (\`GET\`, \`POST\`, \`PUT\`, \`DELETE\`).

- ✅ \`DELETE /users/42\`  ❌ \`POST /deleteUser?id=42\`
- Use **plural** collection nouns (\`/users\`), **nest** to show ownership (\`/users/42/orders\`), keep hierarchy **shallow**.

Putting verbs in the path (\`/getUser\`, \`/createUser\`) throws away everything HTTP gives you for free — caching semantics, idempotency, and a uniform vocabulary clients already understand.

:::key
Nouns in the path, verbs in the method. Predictable shapes and verbs are the whole point of a public contract.
:::`,
  },
  {
    id: 'sd-comm-idempotency',
    question: 'A client times out on POST /payments and retries. How do you prevent a double charge?',
    difficulty: 'Medium',
    category: 'Communication',
    tags: ['idempotency', 'rest', 'reliability'],
    answer: `\`POST\` is **not idempotent**, so a retried create can execute twice. The standard fix is an **idempotency key**:

1. The client generates a unique key (a UUID) and sends it in an \`Idempotency-Key\` header.
2. On first receipt, the server processes the request and **stores the key → result** (with a TTL).
3. On any replay of the same key, the server returns the **stored result** instead of processing again.

\`GET\`/\`PUT\`/\`DELETE\` don't need this — they're already idempotent by definition.

:::gotcha
The key must be **client-generated and stable across retries**. If the client makes a new key per attempt, you're back to double-processing.
:::`,
  },
  {
    id: 'sd-comm-pagination',
    question: 'Offset vs cursor pagination — when does offset break down, and why?',
    difficulty: 'Medium',
    category: 'Communication',
    tags: ['pagination', 'api design', 'databases'],
    answer: `**Offset** (\`LIMIT 20 OFFSET 40\`) is easy and supports jumping to page N, but has two problems on large/live data:

- **Deep pages are slow** — the DB still reads and discards all the skipped rows, so cost grows with the offset.
- **Drift under writes** — an insert/delete shifts every row's position, so users see **duplicates or skipped items** between pages.

**Cursor (keyset)** pagination sends an anchor (\`WHERE id > :cursor LIMIT 20\`). It's an **indexed seek** (constant cost regardless of depth) and is **stable** because it's anchored to a real row. The trade-off: you can only go next/prev, not jump to an arbitrary page.

:::key
Small/admin tables → offset is fine. Large or high-write feeds / infinite scroll → **cursor**. Return the next cursor in the response so clients never build it themselves.
:::`,
  },
  {
    id: 'sd-comm-401-403',
    question: 'Explain 401 vs 403, and 200 vs 201 vs 204.',
    difficulty: 'Easy',
    category: 'Communication',
    tags: ['http', 'status codes', 'rest'],
    answer: `**401 vs 403:**
- **401 Unauthorized** — *not authenticated*. "I don't know who you are" (missing/invalid credentials).
- **403 Forbidden** — *authenticated but not authorized*. "I know who you are, and you can't do this."

**200 vs 201 vs 204:**
- **200 OK** — success with a body (e.g. a \`GET\`, or an update returning the resource).
- **201 Created** — a \`POST\` created a resource (include a \`Location\` header pointing to it).
- **204 No Content** — success with an empty body (e.g. \`DELETE\`).

:::key
Return the code that lets a client branch **without parsing the body**. The families: 2xx success, 3xx redirect, 4xx client's fault, 5xx server's fault.
:::`,
  },
  {
    id: 'sd-comm-sync-vs-async',
    question: 'When should service-to-service communication be asynchronous instead of a synchronous call?',
    difficulty: 'Medium',
    category: 'Communication',
    tags: ['async', 'event-driven', 'architecture'],
    answer: `Go **async** (publish to a broker, move on) when the caller **doesn't need the result immediately**:

- **Slow/heavy work** — transcoding, report generation, email. Ack instantly (\`202 Accepted\`), do it in the background.
- **Fan-out** — one event (\`OrderPlaced\`) triggers many independent reactions without the producer knowing about them.
- **Load smoothing** — a spike fills a queue instead of toppling a downstream service.
- **Decoupling** — producers and consumers scale and deploy independently.

Stay **synchronous** when the caller needs the answer to proceed (auth checks, reading a profile, confirming a payment before showing "success") or when strong consistency matters more than resilience.

:::senior
Best practice is a **hybrid**: do the minimum synchronously to give the user a trustworthy answer (charge the card), then emit an event for everything else (email, analytics, fulfillment). Never make the user wait on things they don't care about.
:::`,
  },
  {
    id: 'sd-comm-async-costs',
    question: 'What new problems does an asynchronous, event-driven design introduce?',
    difficulty: 'Medium',
    category: 'Communication',
    tags: ['async', 'event-driven', 'trade-offs', 'consistency'],
    answer: `Async isn't free. Adopting a broker/events means you now own:

- **Eventual consistency** — the caller is acked before the work finishes, so state is only *eventually* correct. The UI must handle "processing…".
- **Duplicate deliveries** — realistic delivery is at-least-once, so consumers must be **idempotent**.
- **Operational burden** — a broker to run, monitor, and scale.
- **Harder debugging** — a single logical action spans multiple services; you need **distributed tracing** to follow it.
- **Ordering** — messages may arrive out of order unless partitioned/keyed.

:::gotcha
Don't reach for async when a plain synchronous call would do. The decoupling and resilience are real, but so is the added complexity.
:::`,
  },
  {
    id: 'sd-comm-queue-vs-pubsub',
    question: 'Queue (point-to-point) vs pub/sub — what is the difference and when do you use each?',
    difficulty: 'Easy',
    category: 'Communication',
    tags: ['message queue', 'pub/sub', 'messaging'],
    answer: `The fork: does a message go to **one** consumer or **all** of them?

- **Queue (point-to-point):** each message is consumed by **exactly one** worker. Add workers to drain a backlog faster — this is how you **parallelize a task** ("send 10k emails"). The message is gone once acked.
- **Pub/Sub (publish-subscribe):** each message is delivered to **every** subscriber. One \`OrderPlaced\` fans out to email, analytics, and warehouse — the producer doesn't know who's listening. This is how you **decouple many reactions** from one event.

:::key
Queue = distribute *work* (one consumer per message). Pub/sub = broadcast *events* (every subscriber gets a copy).
:::`,
  },
  {
    id: 'sd-comm-kafka-vs-rabbitmq',
    question: 'Kafka vs RabbitMQ — what is the core architectural difference, and when would you pick each?',
    difficulty: 'Hard',
    category: 'Communication',
    tags: ['kafka', 'rabbitmq', 'messaging', 'event streaming'],
    answer: `The one-liner: **RabbitMQ is a smart broker with dumb consumers; Kafka is a dumb broker (a log) with smart consumers.**

- **RabbitMQ** — a message broker with rich routing (exchanges: direct/topic/fanout). It **pushes** to queues and **deletes** messages on ack. Great for **task queues, complex routing, RPC-style** work.
- **Kafka** — an append-only, partitioned, **durable log**. Consumers track their own **offset** and can **replay** history. Ordering is per-partition; throughput is very high (sequential disk). Great for **event streaming, log/metrics pipelines, event sourcing, high fan-out**.

The defining difference is **retention + replay**: Kafka keeps messages (by time/size) so a new or recovering consumer can rewind; RabbitMQ discards them once consumed.

:::senior
"Can a brand-new consumer reprocess last week's events?" If yes, you want Kafka's log. If you need sophisticated per-message routing and don't need replay, RabbitMQ is simpler.
:::`,
  },
  {
    id: 'sd-comm-delivery-guarantees',
    question: 'Explain at-most-once, at-least-once, and exactly-once delivery. Which is realistic, and what does it demand of consumers?',
    difficulty: 'Hard',
    category: 'Communication',
    tags: ['delivery guarantees', 'messaging', 'idempotency', 'reliability'],
    answer: `The guarantee is set by **when you ack**:

- **At-most-once** — ack *before* processing. Risk: **lost** messages if you crash. OK for metrics/logs where a drop is fine.
- **At-least-once** — ack *after* processing; redeliver if no ack. Risk: **duplicates** (e.g. crash after processing, before ack). The **common default**.
- **Exactly-once** — precisely one effect. Ideal, but expensive and hard end-to-end (needs dedup + transactional offsets).

**At-least-once is the practical default, so duplicates will happen.** The real fix isn't magic transport — it's making the **consumer idempotent** (dedupe on a message id / idempotency key) so reprocessing is harmless.

:::gotcha
"Exactly-once" in practice is almost always *at-least-once delivery + idempotent processing*. Kafka offers exactly-once **within Kafka**, but writing to an external system puts you back to needing idempotency.
:::`,
  },
  {
    id: 'sd-comm-token-bucket',
    question: 'Explain the token bucket algorithm. Why is it the go-to rate limiter?',
    difficulty: 'Medium',
    category: 'Communication',
    tags: ['rate limiting', 'token bucket', 'throttling'],
    answer: `A bucket holds up to **capacity** tokens and **refills at a fixed rate**. Every request must **take one token** to proceed; if the bucket is empty, the request is **rejected** (\`429\`).

Two knobs define behavior:
- **Capacity** → the maximum **burst** allowed (spend saved-up tokens all at once).
- **Refill rate** → the sustained **average** throughput.

So "capacity 4, refill 1/sec" means *sustain ~1 req/s but tolerate a burst of up to 4*.

It's the favorite because **one algorithm gives both a burst allowance and an average-rate cap**, and it's cheap — per client you store just a token count and a last-refill timestamp (two numbers, e.g. in Redis).

:::key
Token bucket **allows bursts** up to capacity; the **leaky bucket**, by contrast, smooths traffic to a constant output rate and forbids bursts.
:::`,
  },
  {
    id: 'sd-comm-fixed-vs-sliding',
    question: 'What is the fixed-window rate limiter\'s boundary problem, and how does a sliding window fix it?',
    difficulty: 'Medium',
    category: 'Communication',
    tags: ['rate limiting', 'sliding window', 'fixed window'],
    answer: `**Fixed window** counts requests per fixed clock interval (e.g. per minute) and resets the counter on the boundary. The bug: a client can send the full limit at the **end** of one window and the full limit at the **start** of the next — up to **2× the limit** in a short span straddling the boundary — while never breaking the per-window rule.

Example: limit 100/min → 100 requests at \`12:00:59\` + 100 at \`12:01:00\` = 200 in ~1 second.

**Sliding window** fixes this by counting over the **last 60 seconds continuously** rather than resetting on the clock:
- *Sliding log* — store timestamps and count those within the window (accurate, more memory).
- *Sliding window counter* — weight the previous window's count by how much of it overlaps (approximate, cheap).

:::key
Fixed window is the simplest (one counter) but leaks at the edges; sliding window trades a little memory/compute for smooth, accurate enforcement.
:::`,
  },
  {
    id: 'sd-comm-api-gateway',
    question: 'What does an API gateway do, how does it differ from a service mesh, and what is a BFF?',
    difficulty: 'Hard',
    category: 'Communication',
    tags: ['api gateway', 'service mesh', 'bff', 'microservices'],
    answer: `**API gateway** — a single **front door** (reverse proxy) for **north-south** traffic (clients → your system). It owns cross-cutting concerns so services don't reimplement them: **routing, authentication, rate limiting, TLS termination, request aggregation, logging**. Keep it **thin** — no business logic, or it becomes a distributed-monolith bottleneck.

**Service mesh** — handles **east-west** traffic (service ↔ service *inside* the system) via **sidecar proxies** next to each service: **mTLS, retries, timeouts, load balancing, observability** (Istio, Linkerd). It's **complementary** to the gateway, not a replacement.

**BFF (Backend-for-Frontend)** — give **each client type its own gateway** tailored to its needs (a lean Mobile BFF, a rich Web BFF). Worth it when client requirements **diverge** enough that one shared API forces over-fetching or extra client calls; owned by the team that owns that frontend.

:::key
Gateway = north-south edge (thin, cross-cutting). Mesh = east-west internal (sidecars). BFF = a per-client gateway when needs diverge.
:::`,
  },
  {
    id: 'sd-comm-leaky-bucket',
    question: 'How does the leaky-bucket rate-limiting algorithm work, and how is it different from token bucket?',
    difficulty: 'Easy',
    category: 'Communication',
    tags: ['rate-limiting', 'leaky-bucket', 'throttling'],
    answer: `Model a bucket with a hole in the bottom draining at a **constant rate**. Requests pour in and **queue**; they leak out (get processed) at that fixed rate; if the bucket (the queue) is already full, new requests **overflow and are dropped**. The effect: a bursty arrival pattern is **smoothed into a constant output rate**.

Token bucket is the mirror image — it hands out saved-up tokens, so it **allows bursts** up to capacity (spend them all at once) while capping only the average.

| | Leaky bucket | Token bucket |
|--|--|--|
| Output | Constant, smoothed | Bursty up to capacity |
| Bursts | Forbidden (queue/drop) | Allowed |
| Best for | A downstream needing **steady** load | User-facing APIs where short bursts are fine |

:::key
Leaky bucket = constant smooth output, no bursts — shield a downstream that needs a steady feed. Token bucket = average cap but bursts allowed — user-facing APIs where a short spike is harmless. Same average rate, opposite burst behavior.
:::`,
  },
  {
    id: 'sd-comm-distributed-rate-limit',
    question: 'How do you build a rate limiter that works across many servers?',
    difficulty: 'Hard',
    category: 'Communication',
    tags: ['rate-limiting', 'distributed', 'redis', 'consistency'],
    answer: `Per-server in-memory counters fail: a user spread across **N servers** gets **N× the limit**. The counter must be **shared**. The standard build is a central **Redis** holding the counter (or token-bucket state), updated **atomically** — \`INCR\` + \`EXPIRE\`, or a **Lua script** for the token-bucket read-modify-write — so concurrent servers can't race past the limit.

The trade-off: every request now does a Redis round trip (~0.5 ms same-DC) and Redis becomes a hot dependency and potential **SPOF**. Optimizations:
- **Local buckets + global budget** — each node self-limits against a fraction of the budget and reconciles periodically (approximate, cheap, no per-request round trip).
- **Sharded limiters** — partition keys across Redis nodes.

:::senior
You trade **accuracy vs cost**. Exact global limiting needs a synchronous shared counter (latency + a bottleneck); at extreme scale go **approximate** — each node limits against its slice of the budget with periodic reconciliation, accepting slight overshoot. Also decide **fail-open vs fail-closed** for when Redis is unreachable.
:::`,
  },
  {
    id: 'sd-comm-kafka-partitions',
    question: 'Explain Kafka partitions, consumer groups, and offsets. How are ordering and parallelism controlled?',
    difficulty: 'Hard',
    category: 'Communication',
    tags: ['kafka', 'partitions', 'consumer-groups', 'offsets'],
    answer: `A Kafka topic is split into **partitions**, each an ordered, append-only log. Ordering is guaranteed **only within a partition**, and the **partition key** decides placement (same key → same partition → ordered). **Parallelism equals partition count**: inside a **consumer group** each partition is consumed by exactly **one** consumer, so the max number of consumers doing useful work = the partition count. Each consumer tracks its **offset** per partition, committed so it can resume or replay. Different consumer groups read the same topic independently — that's fan-out.

\`\`\`text
Topic T, 3 partitions            Consumer group "billing"
  P0  ───────────────────────►   consumer 1  (owns P0)
  P1  ───────────────────────►   consumer 2  (owns P1)
  P2  ───────────────────────►   consumer 3  (owns P2)
  A 4th consumer would sit idle — never more than one per partition.
\`\`\`

:::senior
Partition count is a key early decision: too few caps parallelism, too many adds overhead and rebalance pain — and you can't easily **reduce** it later. Order-sensitive data (one user's events) must share a partition key. That's the core tension: **global ordering means one partition, i.e. no parallelism.**
:::`,
  },
  {
    id: 'sd-comm-dlq',
    question: 'What is a dead-letter queue and why do you need one?',
    difficulty: 'Easy',
    category: 'Communication',
    tags: ['dead-letter-queue', 'poison-message', 'reliability'],
    answer: `A **dead-letter queue (DLQ)** is a separate queue where messages are routed after they **fail processing repeatedly** (exceed max retries) or can't be delivered. Without one, a **poison message** — malformed, or triggering a consumer bug — is redelivered **forever**, blocking the queue behind it (**head-of-line blocking**) in an infinite retry loop.

Routing it to the DLQ after **N attempts** lets the rest of the queue keep flowing while you inspect, fix, and replay the failures out-of-band. Both **SQS** and **RabbitMQ** support DLQs natively.

:::gotcha
A DLQ is not fire-and-forget: **alert on DLQ depth** and build a reprocessing path, or failures pile up silently and you notice days later. And always **cap retries before DLQ-ing** — a transient blip deserves a few retries, but a genuinely bad message must not loop forever.
:::`,
  },
  {
    id: 'sd-comm-webhooks',
    question: 'How do webhooks work, and how do you make them reliable and secure?',
    difficulty: 'Medium',
    category: 'Communication',
    tags: ['webhooks', 'callbacks', 'reliability', 'security'],
    answer: `A webhook is a **reverse API call**: instead of you polling the provider, the provider **POSTs an event** to a URL you registered whenever something happens (\`payment_succeeded\` from **Stripe**, a push from **GitHub**). It's real-time and far cheaper than polling.

**Reliability** — your endpoint may be down, so providers **retry with backoff** and delivery is **at-least-once**; the handler must be **idempotent** (dedupe on the event id).

**Security** — the payload is **signed** (HMAC with a shared secret) so you can verify authenticity and integrity; serve the endpoint over **HTTPS**; check the timestamp to block **replay** attacks.

:::senior
Treat a webhook handler like any at-least-once consumer: **return 2xx fast** (ack, then process async), **dedupe by event id**, and **verify the signature** before trusting anything. For guaranteed delivery, providers also expose an events-list API so you can **reconcile** webhooks you missed.
:::`,
  },
  {
    id: 'sd-comm-gateway-vs-proxy-vs-lb',
    question: 'API gateway vs reverse proxy vs load balancer — how do they differ?',
    difficulty: 'Medium',
    category: 'Communication',
    tags: ['api-gateway', 'reverse-proxy', 'load-balancer'],
    answer: `They overlap — all three are reverse proxies — but sit at different levels of concern.

| Layer | Job | Examples |
|--|--|--|
| **Load balancer** | Spread connections/requests across **identical** backend instances for scale + availability (health checks, algorithms); L4 or L7 | NGINX, HAProxy, AWS ELB/ALB |
| **Reverse proxy** | Generic front door for backends: TLS termination, caching, compression, routing | NGINX, Envoy |
| **API gateway** | Application-aware proxy for microservices adding **API concerns**: auth, rate limiting, routing/aggregation, versioning, per-route policy | Kong, AWS API Gateway |

A gateway usually **includes** load balancing; a plain LB does not do auth or aggregation.

:::key
LB = spread load across clones (availability/scale). Reverse proxy = generic front door (TLS, cache, route). API gateway = LB/proxy **plus** API concerns (auth, rate-limit, aggregation) for services. Keep the gateway **thin** — no business logic.
:::`,
  },
  {
    id: 'sd-comm-graphql-tradeoffs',
    question: 'What are the hard problems with GraphQL in production?',
    difficulty: 'Medium',
    category: 'Communication',
    tags: ['graphql', 'n-plus-1', 'dataloader', 'caching'],
    answer: `GraphQL lets a client fetch **exactly the fields it wants** from a single endpoint — no over- or under-fetching — which is great for mobile and rich UIs. The hard parts in production:

1. **N+1 query problem** — a nested query (\`users → their posts\`) naively fires one DB query per parent. Solved with **DataLoader** batching + per-request caching.
2. **Caching is hard** — everything is a \`POST\` to one URL, so you lose free **HTTP/CDN caching by URL**; you need persisted queries or app-level caching.
3. **Expensive/malicious queries** — a deeply nested query can DoS you; enforce **query depth/complexity limits**, cost analysis, and timeouts.
4. **Rate limiting** is harder — you must price per **query cost**, not per endpoint.

:::senior
GraphQL **moves complexity from client to server**: you now own batching (DataLoader), caching, and query-cost governance. It shines when many clients need different shapes of data; for a simple public API, REST's free HTTP caching and simplicity usually win.
:::`,
  },
  {
    id: 'sd-comm-protobuf',
    question: 'Why is Protobuf faster and smaller than JSON, and what\'s the cost?',
    difficulty: 'Medium',
    category: 'Communication',
    tags: ['protobuf', 'serialization', 'grpc', 'binary'],
    answer: `**Protobuf** is a binary, schema-defined serialization format (the default for **gRPC**). It's smaller and faster than JSON because:
- fields are tagged by **integer numbers**, not string keys — the field names never travel on the wire;
- values are **binary-packed** (varints), not text;
- there's no quote/whitespace parsing.

It needs a shared \`.proto\` schema compiled to code, which buys you **strong typing and validation** for free. The costs: it's **not human-readable** (you can't just \`curl\` and eyeball it), you **need the schema** to decode, and you must keep schema-evolution discipline.

:::senior
Schema evolution is the discipline: **never reuse or renumber a field tag**, only **add new optional fields**, so old and new peers stay compatible. Use Protobuf/gRPC for high-throughput **internal** service-to-service calls; keep **JSON/REST at the public edge** for debuggability and universal client support.
:::`,
  },
  {
    id: 'sd-comm-realtime-scaling',
    question: 'How do you scale a real-time system to millions of concurrent WebSocket connections?',
    difficulty: 'Hard',
    category: 'Communication',
    tags: ['websocket', 'scaling', 'pub-sub', 'fan-out'],
    answer: `WebSockets are **stateful** — each connection pins memory and a file descriptor to **one** server (a tuned box holds ~tens of thousands up to ~1M). You scale horizontally:

1. **Connection/gateway fleet** — many servers, each holding a slice of connections, fronted by an LB with **sticky routing** (a live connection can't hop servers mid-session).
2. **Pub/sub backplane** (**Redis** pub/sub, **Kafka**, **NATS**) — so a server can deliver to a user connected to **another** server: publish to a channel, the owning server pushes it down the right socket.
3. **Session registry** (user → server) for direct routing; **offline** users fall back to a **push notification** (APNs/FCM).

:::senior
The crux: connection state is **sharded across servers**, so delivery becomes a **fan-out/routing** problem solved by a shared pub/sub layer. Also plan for **reconnect storms** — a deploy or crash triggers a thundering herd, so add **backoff + jitter** on reconnect and use connection draining on shutdown.
:::`,
  },
  {
    id: 'sd-comm-message-ordering',
    question: 'How do you guarantee message ordering in a distributed queue, and why is global ordering expensive?',
    difficulty: 'Medium',
    category: 'Communication',
    tags: ['ordering', 'partitioning', 'sequence-numbers'],
    answer: `Ordering is only cheap **within a single partition/queue** consumed by one worker. To keep related messages ordered, route them to the same partition via a **partition key** (all events for one user or account) — Kafka then guarantees **per-partition order**.

**Global total order** across all messages requires either a **single partition + single consumer** (zero parallelism) or a **global sequencer** — both cap throughput and create a bottleneck. Alternatively, consumers can **reorder** using **sequence numbers** if they buffer and wait for gaps to fill.

:::senior
The real trade is **order vs parallelism**: partition by the entity that needs ordering (**order-per-key**) and accept no cross-key order. Demanding *global* ordering usually signals a modeling problem — scope ordering to the **smallest key** that needs it. And because delivery is at-least-once, handle **duplicates** with idempotency: a naive retry silently breaks ordering.
:::`,
  },
  {
    id: 'sd-comm-async-request-reply',
    question: 'How do you get a response back from an asynchronous, queue-based request?',
    difficulty: 'Medium',
    category: 'Communication',
    tags: ['async', 'request-reply', 'correlation-id'],
    answer: `Use the **async request-reply** pattern. The requester publishes a message stamped with a unique **correlation id** and a **reply-to** address (a response queue/topic), then either waits or registers a callback. The worker processes it and publishes the result to that reply queue **tagged with the same correlation id**; the requester matches reply → request by that id.

Alternatives for user-facing flows:
- **Poll** — return \`202 Accepted\` + a job URL, client polls \`GET /jobs/{id}\` for status.
- **Push** — deliver the result over a **WebSocket** or **webhook** when it's ready.

:::gotcha
Plan for the reply that **never arrives** (worker crash): set a **timeout** with retry/fallback, and make processing **idempotent** because the reply itself may be lost and retried. Don't block a request thread waiting on a slow reply — prefer **202 + poll/push** for anything user-facing.
:::`,
  },
  {
    id: 'sd-comm-event-sourcing',
    question: 'What is event sourcing, and what are its benefits and costs?',
    difficulty: 'Hard',
    category: 'Communication',
    tags: ['event-sourcing', 'cqrs', 'audit-log'],
    answer: `Instead of storing current state and overwriting it, **event sourcing** stores the immutable, append-only **sequence of events** that produced the state; current state is a **fold (replay)** over those events.

**Benefits:**
- a perfect **audit log** / full history;
- **time travel** — reconstruct any past state;
- easy new **read models** by replaying the log (pairs naturally with **CQRS**); a natural fit for **Kafka**.

**Costs:**
- reading current state needs a **replay**, so you keep **snapshots** + materialized read views;
- **schema/versioning** of old events is hard (they're immutable forever);
- **eventual consistency** between the log and the read models.

:::senior
Powerful where you genuinely need **auditability and temporal queries** (finance, ledgers), but it's a big complexity jump — the append-only log is the source of truth and **every query needs a projection**. Don't event-source the whole system; apply it to the one aggregate that truly needs the history.
:::`,
  },
  {
    id: 'sd-comm-rate-limit-headers',
    question: 'How should a server tell a client it\'s being rate-limited, and how should the client react?',
    difficulty: 'Easy',
    category: 'Communication',
    tags: ['rate-limiting', 'http', '429', 'retry-after'],
    answer: `Return **HTTP 429 Too Many Requests**, ideally with a **\`Retry-After\`** header (seconds, or an HTTP date) telling the client exactly when to try again, plus \`X-RateLimit-Limit\` / \`-Remaining\` / \`-Reset\` so well-behaved clients can **self-pace** before they ever hit the wall.

The client should **back off**: honor \`Retry-After\`, and otherwise use **exponential backoff with jitter** — never immediately re-fire, which only amplifies the overload.

:::gotcha
Distinguish **429** (you exceeded *your* rate limit — slow down and retry later) from **503** (the *server* is overloaded / shedding load). Both are retryable, but 429 is **per-client throttling**. A client that retries a 429 **instantly with no backoff** turns rate limiting into a self-inflicted **retry storm** — exactly what the limit was meant to prevent.
:::`,
  },
];

export default questions;
