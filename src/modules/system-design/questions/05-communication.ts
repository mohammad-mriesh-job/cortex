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
];

export default questions;
