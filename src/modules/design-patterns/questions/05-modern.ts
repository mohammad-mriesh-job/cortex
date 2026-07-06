import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'pat-mod-ioc-vs-di',
    question: 'What is the difference between Inversion of Control and Dependency Injection?',
    difficulty: 'Medium',
    category: 'Modern Patterns',
    tags: ['dependency injection', 'ioc', 'principles'],
    answer: `**Inversion of Control (IoC)** is the broad principle: control over flow and object creation is handed to a framework instead of your code — "don't call us, we'll call you."

**Dependency Injection (DI)** is the most common *concrete form* of IoC applied to dependencies: instead of a class constructing or looking up its collaborators, they are supplied from the outside.

\`\`\`java
// Not DI — the class controls creation
class OrderService { private final Repo repo = new JpaRepo(); }

// DI — control inverted; the collaborator is handed in
class OrderService {
  private final Repo repo;
  OrderService(Repo repo) { this.repo = repo; }
}
\`\`\`

So DI is IoC, but IoC is broader (it also covers template methods, event callbacks, and framework lifecycle hooks).`,
  },
  {
    id: 'pat-mod-constructor-vs-setter',
    question: 'Constructor injection vs setter injection — which should you prefer and why?',
    difficulty: 'Medium',
    category: 'Modern Patterns',
    tags: ['dependency injection', 'spring', 'best-practices'],
    answer: `Prefer **constructor injection** for mandatory dependencies:

- Dependencies are **explicit and required** — you cannot construct a half-built object.
- Fields can be \`final\` → immutable and thread-safe.
- The object is always in a valid state the moment it exists.

Use **setter injection** only for genuinely **optional** or reconfigurable dependencies.

:::gotcha
Field injection (\`@Autowired\` on a private field) is convenient but discouraged: it hides dependencies, cannot be \`final\`, and forces reflection-based wiring in tests. Constructor injection lets you \`new\` the class in a plain unit test with mocks.
:::`,
  },
  {
    id: 'pat-mod-di-vs-singleton',
    question: 'If a Spring bean is a singleton by default, how is it different from the Singleton pattern?',
    difficulty: 'Hard',
    category: 'Modern Patterns',
    tags: ['dependency injection', 'singleton', 'spring'],
    answer: `Both yield **one shared instance**, but the resemblance ends there.

| | Singleton pattern | Spring singleton bean |
|--|--|--|
| Access | Global static \`getInstance()\` | Injected as a normal dependency |
| Coupling | Callers hard-reference the concrete class | Callers depend on an interface |
| Testability | Hard — cannot swap the static instance | Easy — inject a mock/fake |
| Lifecycle | The class manages itself | The container manages it |

A Spring bean has **no private constructor and no global static accessor** — the container owns the single instance and injects it. You get "one instance" without the global mutable state that makes the classic Singleton an anti-pattern. **For shared instances, prefer a DI-managed singleton.**`,
  },
  {
    id: 'pat-mod-mvc-responsibilities',
    question: 'Explain the responsibilities of each part of MVC. Where do business rules go?',
    difficulty: 'Easy',
    category: 'Modern Patterns',
    tags: ['mvc', 'architecture', 'separation-of-concerns'],
    answer: `- **Model** — data and **business rules**; knows nothing about the UI. *Business logic lives here.*
- **View** — renders the model; contains no business logic ("dumb").
- **Controller** — receives input, updates the model, and selects which view to render.

Flow: user → Controller → Model → Controller → View → user.

:::note
A common mistake is leaking business logic into controllers ("fat controllers") or views. Keep controllers thin — they coordinate; the model decides.
:::`,
  },
  {
    id: 'pat-mod-mvc-vs-mvvm',
    question: 'How does MVVM differ from MVC?',
    difficulty: 'Medium',
    category: 'Modern Patterns',
    tags: ['mvc', 'mvvm', 'architecture'],
    answer: `Both separate UI from logic, but the mediator and the view-model link differ:

- **MVC** — a **Controller** handles input and picks a view; the view may read the model. Common on the server (Spring MVC, Rails).
- **MVVM** — a **ViewModel** exposes observable state, and the View syncs to it via **data binding** (often two-way). Common where the platform offers binding (WPF, Android Jetpack, Vue).

The key MVVM win: the framework keeps the View and ViewModel in sync automatically, eliminating manual "copy field into label" glue code.`,
  },
  {
    id: 'pat-mod-hexagonal',
    question: 'What is hexagonal (ports & adapters) architecture, and how does it differ from layered architecture?',
    difficulty: 'Hard',
    category: 'Modern Patterns',
    tags: ['hexagonal', 'layered', 'architecture', 'dependency-inversion'],
    answer: `Both organise an app into separated concerns; the difference is **which way dependencies point**.

- **Layered** — presentation → business → data. The business layer **depends downward** on the data/infrastructure layer, so infrastructure leaks upward.
- **Hexagonal** — the **domain sits at the centre** and defines **ports** (interfaces it owns). Adapters (web, DB, messaging) plug in from outside and **implement** those ports. **All dependencies point inward.**

This is the **Dependency Inversion Principle** at architecture scale: swap Postgres for an in-memory store by writing a new adapter, without touching domain code. The payoff is a domain that is testable in isolation from any framework or database.`,
  },
  {
    id: 'pat-mod-dao-vs-repository',
    question: 'What is the difference between a DAO and a Repository?',
    difficulty: 'Medium',
    category: 'Modern Patterns',
    tags: ['dao', 'repository', 'data-access', 'ddd'],
    answer: `They both hide persistence, but at different abstraction levels:

| | DAO | Repository |
|--|--|--|
| Mental model | Abstraction over a **data source / table** | An in-memory **collection of domain objects** |
| Vocabulary | Data-centric: \`insert\`, \`selectById\` | Domain-centric: \`save\`, \`findActiveCustomers\` |
| Granularity | Usually one per table/entity | One per aggregate root |
| Returns | Rows / records | Fully-formed domain aggregates |

**DAO = data-source abstraction; Repository = domain-collection abstraction.**

:::note
In practice the terms blur — Spring Data's \`JpaRepository\` is often used like a per-entity DAO. Interviewers want the conceptual distinction, not the framework label.
:::`,
  },
  {
    id: 'pat-mod-unit-of-work',
    question: 'What problem does the Unit of Work pattern solve, and where do you already use it?',
    difficulty: 'Medium',
    category: 'Modern Patterns',
    tags: ['unit of work', 'transactions', 'jpa'],
    answer: `A **Unit of Work** tracks every object created, modified, or deleted during a business transaction and writes them all in **one commit** — or rolls everything back. It gives you fewer round-trips and **all-or-nothing consistency**.

You rarely hand-roll it: JPA's **\`EntityManager\` / Hibernate \`Session\`** *is* a Unit of Work. Its **persistence context** tracks managed entities and flushes changes on commit, and \`@Transactional\` defines the boundary.

\`\`\`java
@Transactional // the Unit of Work boundary
public void transfer(long from, long to, Money amt) {
  accounts.findById(from).debit(amt);
  accounts.findById(to).credit(amt);
  // both persisted together on commit; a failure rolls BOTH back
}
\`\`\`

This also explains **dirty checking**: mutate a managed entity and it is saved on commit without an explicit \`save()\`.`,
  },
  {
    id: 'pat-mod-god-object',
    question: 'What is a God Object, and how do you refactor away from one?',
    difficulty: 'Easy',
    category: 'Modern Patterns',
    tags: ['anti-patterns', 'god-object', 'srp'],
    answer: `A **God Object** is a class that knows or does too much — thousands of lines, dozens of fields, touching persistence, HTTP, and business rules all at once. It has **low cohesion** and **high coupling**, so every change risks breaking something unrelated.

**Fix:** apply the **Single Responsibility Principle** — split it along its distinct responsibilities, extracting focused collaborators (a service, a repository, a mapper). Move behaviour to the data it operates on. Refactor incrementally behind tests.`,
  },
  {
    id: 'pat-mod-over-engineering',
    question: 'What are Pattern Soup and Premature Abstraction, and how do you avoid over-engineering?',
    difficulty: 'Hard',
    category: 'Modern Patterns',
    tags: ['anti-patterns', 'over-engineering', 'yagni'],
    answer: `Both are the **over-application** of good ideas:

- **Pattern Soup** — patterns stacked for their own sake (a factory that builds one product, a strategy with one strategy), burying logic under indirection with zero present benefit.
- **Premature Abstraction** — introducing interfaces/generics before a real second case exists.

**Antidotes: YAGNI and the Rule of Three.** Duplicate up to twice; abstract on the third occurrence, when the shape of the real variation is clear.

:::warning
Prefer a little duplication over the **wrong** abstraction. A missing abstraction is a cheap extract-method later; a wrong one is baked into every call site and painful to unwind.
:::

Being able to argue *against* adding a pattern signals more design maturity than reciting all 23 GoF patterns.`,
  },
  {
    id: 'pat-mod-dip',
    question: 'How do the Dependency Inversion Principle, Inversion of Control, and Dependency Injection relate?',
    difficulty: 'Medium',
    category: 'Modern Patterns',
    tags: ['dependency-inversion', 'ioc', 'dependency injection', 'principles'],
    answer: `They're three layers of the same idea — a principle, a style, and a technique:

- **Dependency Inversion Principle (DIP)** — a *design principle* (the "D" in SOLID): high-level and low-level modules should both depend on **abstractions**, not on each other. "Depend on interfaces, not implementations."
- **Inversion of Control (IoC)** — an *architectural style*: hand control of flow/creation to a framework ("don't call us, we'll call you"). Broader than dependencies — also covers template methods, event loops, lifecycle callbacks.
- **Dependency Injection (DI)** — a *concrete technique*: supply a class's collaborators from outside (constructor/setter) instead of it creating them.

\`\`\`text
DIP  = the goal   (depend on abstractions)
IoC  = the style  (framework drives)
DI   = the how    (pass dependencies in)
\`\`\`

You can satisfy **DIP without DI** (hand-wire abstractions yourself) and use **IoC without DI** (a template method calling your hooks). DI is simply the most common way to achieve DIP.

:::gotcha
DIP is not "use a DI container." You can violate DIP *with* Spring (injecting a concrete class) and honour it *without* any framework (manually passing an interface). The principle is about **what** you depend on; DI is about **how** it arrives.
:::`,
  },
  {
    id: 'pat-mod-di-hand-rolled',
    question: 'Do you need a DI framework, or can you do dependency injection by hand? When is a container worth it?',
    difficulty: 'Medium',
    category: 'Modern Patterns',
    tags: ['dependency injection', 'pure-di', 'container'],
    answer: `DI is a **technique**, not a framework — you can do "pure DI" (a.k.a. poor man's DI) with plain constructors, wiring everything in one place:

\`\`\`java
// Composition root — the ONE place that knows concrete types
var repo    = new JpaOrderRepository(dataSource);
var pricing = new DefaultPricing(taxRates);
var service = new OrderService(repo, pricing);
\`\`\`

This is explicit, framework-free, trivially testable, and has no reflection or startup cost. It scales fine for small and medium apps, and for libraries.

A **container** (Spring, Guice, CDI) earns its keep when you have:
- a **large object graph** that is tedious to wire by hand,
- **scopes/lifecycles** (singleton, request, session) you'd otherwise manage manually,
- cross-cutting concerns via proxies (\`@Transactional\`, \`@Cacheable\`, AOP),
- lots of **configuration-driven** wiring (\`@Profile\`, conditional beans).

:::senior
Keep all wiring in a single **composition root** at the app's entry point, whether hand-rolled or container-driven — never scatter \`new\` of collaborators (or \`context.getBean\`) through business code. A library should almost never *require* a container; annotations that push container concerns into your domain leak infrastructure into business logic.
:::`,
  },
  {
    id: 'pat-mod-service-locator',
    question: 'What is the Service Locator pattern, and why is it often considered inferior to Dependency Injection?',
    difficulty: 'Hard',
    category: 'Modern Patterns',
    tags: ['service-locator', 'dependency injection', 'anti-pattern'],
    answer: `A **Service Locator** is a registry a class **asks** for its dependencies:

\`\`\`java
class OrderService {
  private final Repo repo = ServiceLocator.get(Repo.class); // pulls its own dependency
}
\`\`\`

Compare DI, where the same dependency is **pushed in** via the constructor. Both decouple from the concrete type, but the locator has real drawbacks:

| | Service Locator | Dependency Injection |
|--|--|--|
| Dependencies | **Hidden** — not in the signature | **Explicit** — in the constructor |
| Testing | Must configure the global locator | Just pass a mock |
| Coupling | Every class depends on the locator | Classes depend only on their collaborators |
| Failure mode | Missing service → **runtime** error | Missing dependency → construction-time |

The core criticism (Martin Fowler): the locator **hides dependencies**. \`new OrderService()\` looks dependency-free but secretly needs the locator populated — an honesty problem DI avoids because the constructor lists everything.

:::senior
Service Locator isn't always wrong — it's used where you *can't* inject (framework entry points, \`ServiceLoader\`/SPI, legacy code, some plugin systems). But as a default it trades DI's compile-time honesty for a global, hard-to-mock singleton. Prefer DI; reach for a locator only at boundaries the container can't reach.
:::`,
  },
  {
    id: 'pat-mod-dto',
    question: 'What is a DTO, why use one, and how do you map between DTOs and domain entities?',
    difficulty: 'Easy',
    category: 'Modern Patterns',
    tags: ['dto', 'mapping', 'api-design'],
    answer: `A **Data Transfer Object** is a flat, behaviour-free carrier of data across a boundary — typically an API request/response. Its job is **shape and decoupling**, not logic.

Why not just return your JPA entities?

- **Decoupling** — the API contract stops tracking your database schema; you can refactor entities without breaking clients.
- **Security** — never leak fields like \`passwordHash\` or internal flags; the DTO exposes only what the client should see.
- **Shaping** — flatten/rename/combine entities into exactly what the view needs; avoid lazy-loading surprises and serialization cycles.

\`\`\`java
record UserDto(long id, String name, String email) {}   // no entity leakage

UserDto toDto(User u) { return new UserDto(u.getId(), u.getName(), u.getEmail()); }
\`\`\`

Mapping options: **manual** (a mapper method — explicit, zero magic), **MapStruct** (compile-time generated, fast, type-checked), or **ModelMapper** (reflection-based, less boilerplate but runtime cost).

:::gotcha
Don't put behaviour on DTOs or reuse them as your domain model — that recreates the anemic-model problem. And don't expose entities directly from controllers: it couples your API to your schema and risks serializing lazy proxies (\`LazyInitializationException\`).
:::`,
  },
  {
    id: 'pat-mod-mvp',
    question: 'What is MVP, and how does it sit between MVC and MVVM?',
    difficulty: 'Medium',
    category: 'Modern Patterns',
    tags: ['mvp', 'mvc', 'mvvm', 'architecture'],
    answer: `**Model-View-Presenter** splits UI so the **View is passive** (a "dumb" interface — just widgets) and the **Presenter** holds all presentation logic, updating the view through its interface and receiving user actions from it.

Across the family the difference is **how View and logic connect**:

| | MVC | MVP | MVVM |
|--|--|--|--|
| Mediator | Controller | Presenter | ViewModel |
| View ↔ logic | View may read Model | Presenter updates View **explicitly** | **Data binding** syncs automatically |
| View knows Model? | Often yes | No — only the Presenter | No — binds to ViewModel |
| Logic testability | Moderate | **High** (mock the View interface) | High (test ViewModel state) |

MVP's win is **testability**: because the view is an interface, you unit-test the presenter with a mock view, no UI toolkit needed. Its cost is **boilerplate** — you hand-write the view-updating calls that MVVM's binding would automate. Historically big in Android (pre-Jetpack) and GWT/Swing apps.

:::senior
The trend line: MVC → MVP → MVVM each **thins the view** and **moves more logic to a testable object**, with MVVM adding framework data-binding to delete the manual sync code MVP requires. Pick MVP when your platform lacks good binding; pick MVVM when it has it (WPF, Android Jetpack, Vue).
:::`,
  },
  {
    id: 'pat-mod-null-object',
    question: 'What is the Null Object pattern, and how does it relate to Optional?',
    difficulty: 'Easy',
    category: 'Modern Patterns',
    tags: ['null-object', 'optional', 'null-safety'],
    answer: `**Null Object** replaces a \`null\` with a real object that implements the same interface but does **nothing** (or a neutral default), so callers don't need null checks.

\`\`\`java
interface Logger { void log(String m); }
class NoOpLogger implements Logger { public void log(String m) {} } // does nothing

Logger log = config.getLogger().orElse(new NoOpLogger());
log.log("started");   // safe — no null check, no NPE
\`\`\`

It removes scattered \`if (x != null)\` guards and the NPEs they miss, replacing "missing" with polymorphic do-nothing behaviour. Good fits: loggers, metrics collectors, default handlers, empty collections (\`Collections.emptyList()\` is a null object).

**Relation to \`Optional\`:** they solve the same "absent value" problem differently. \`Optional\` makes absence **explicit** at the API boundary and forces the caller to handle it; Null Object makes absence **invisible** by supplying safe default behaviour. Use \`Optional\` for *return values* signalling "maybe none"; use Null Object for *collaborators* where a no-op default is genuinely correct.

:::gotcha
A Null Object that silently does nothing can **hide bugs** — a misconfigured \`NoOpLogger\` swallows every log line with no error. Use it only where "do nothing" is truly correct, not to paper over a missing dependency.
:::`,
  },
  {
    id: 'pat-mod-fluent-interface',
    question: 'What is a fluent interface, and how does it differ from the Builder pattern?',
    difficulty: 'Easy',
    category: 'Modern Patterns',
    tags: ['fluent-interface', 'builder', 'dsl'],
    answer: `A **fluent interface** is an API designed to read like prose by **method chaining** — each method returns an object (often \`this\`) so calls flow together:

\`\`\`java
List<String> names = people.stream()
    .filter(p -> p.age() >= 18)
    .map(Person::name)
    .sorted()
    .toList();
\`\`\`

It is a **style**, not a GoF pattern. Builder is one common *use* of the style, but they're not the same:

| | Fluent interface | Builder |
|--|--|--|
| What it is | An API style (chaining) | A creational pattern |
| Goal | Readability / mini-DSL | Assemble a complex object |
| Returns | \`this\` or a new object | The builder, then \`build()\` |
| Examples | Streams, \`Optional\`, Mockito, jOOQ, AssertJ | \`StringBuilder\`, \`HttpRequest.newBuilder()\` |

Not all fluent interfaces are builders (Streams build nothing), and a builder *could* use plain setters instead of chaining (just less pleasant).

:::gotcha
Chaining on a **mutable** object that returns \`this\` can surprise callers who expected a new instance. \`Stream\`/\`Optional\` return **new** objects each step; a mutable builder returning \`this\` is fine only because it's single-use and thrown away after \`build()\`.
:::`,
  },
  {
    id: 'pat-mod-event-sourcing',
    question: 'What is event sourcing, and what are its main trade-offs?',
    difficulty: 'Medium',
    category: 'Modern Patterns',
    tags: ['event-sourcing', 'architecture', 'audit'],
    answer: `**Event sourcing** stores state as an **append-only log of events** ("OrderPlaced", "ItemAdded", "OrderShipped") rather than as the current row in a table. Current state is derived by **replaying** the events; the log is the source of truth.

**Benefits:**
- **Full audit trail** — every change is a first-class, immutable fact; you get history for free.
- **Time travel** — reconstruct state as of any past moment; debug by replay.
- **Rebuildable read models** — build new projections by replaying old events.

**Costs:**
- **Complexity** — a big leap from CRUD; the whole team must understand it.
- **Schema/versioning** — events are immutable forever, so you must version and up-cast old event shapes.
- **Snapshots** — replaying millions of events is slow, so you cache periodic snapshots.
- **Eventual consistency** — read models (projections) lag the write log.

\`\`\`text
state = fold(applyEvent, initialState, eventLog)
\`\`\`

:::senior
Event sourcing pairs naturally with **CQRS** (the event log is the write side; projections are read models) and enables **temporal debugging**. But it is genuinely hard — use it for domains where audit/history is a core requirement (finance, ledgers, compliance), not as a default over CRUD.
:::`,
  },
  {
    id: 'pat-mod-cqrs',
    question: 'What is CQRS, and when is it worth the added complexity?',
    difficulty: 'Easy',
    category: 'Modern Patterns',
    tags: ['cqrs', 'architecture', 'scalability'],
    answer: `**Command Query Responsibility Segregation** splits the model in two: **commands** (writes that change state) and **queries** (reads that return data) use **separate models** — and often separate stores — rather than one shared model doing both.

\`\`\`text
Write side: rich domain model, validation, normalized store
Read  side: denormalized/projected views optimized for querying
\`\`\`

Why bother? A single model optimized for writes (normalized, invariant-enforcing) is often bad for reads (needs joins, DTO mapping), and vice-versa. Splitting lets each side scale and be modelled independently — read replicas, denormalized query views, different databases.

**When it's worth it:**
- Read and write loads are very **asymmetric** (reads ≫ writes).
- Reads need **denormalized shapes** that fight the write model.
- It pairs with **event sourcing** (events feed read projections).

**When it isn't:** simple CRUD apps — CQRS adds two models, synchronization, and usually **eventual consistency** between them for no benefit.

:::gotcha
CQRS does **not** require event sourcing or two databases — at its simplest it's just separate read and write *models* in one service. Teams often over-adopt the full distributed version and inherit eventual-consistency bugs they didn't need.
:::`,
  },
  {
    id: 'pat-mod-circuit-breaker',
    question: 'What is the Circuit Breaker pattern, and what are its states?',
    difficulty: 'Medium',
    category: 'Modern Patterns',
    tags: ['circuit-breaker', 'resilience', 'microservices'],
    answer: `A **Circuit Breaker** protects a caller from a failing remote dependency: after failures cross a threshold it **stops calling** the dependency and fails fast, giving the downstream time to recover and preventing cascading failures / thread-pool exhaustion.

It's a state machine:

\`\`\`mermaid
stateDiagram-v2
  [*] --> Closed
  Closed --> Open: failures exceed threshold
  Open --> HalfOpen: after cooldown timeout
  HalfOpen --> Closed: trial call succeeds
  HalfOpen --> Open: trial call fails
\`\`\`

- **Closed** — calls flow through; failures are counted.
- **Open** — calls short-circuit immediately (throw / return fallback) without touching the dependency.
- **Half-Open** — after a cooldown, let a few trial calls through; success closes the breaker, failure re-opens it.

Java implementation: **Resilience4j** (\`@CircuitBreaker\`), historically Hystrix.

:::senior
Circuit Breaker is really **Proxy + State**: a proxy around the remote call whose behaviour depends on breaker state. Pair it with a **timeout** (don't wait forever), a **fallback** (degrade gracefully), and a **bulkhead** (isolate resource pools) — a breaker alone doesn't cap the slow calls that fill your thread pool before it trips.
:::`,
  },
  {
    id: 'pat-mod-pubsub-scale',
    question: 'How does publish/subscribe change when you move from in-process Observer to a distributed message broker?',
    difficulty: 'Hard',
    category: 'Modern Patterns',
    tags: ['pub-sub', 'messaging', 'kafka', 'distributed'],
    answer: `In-process Observer is a method call; distributed pub/sub is a **network with a broker in the middle** (Kafka, RabbitMQ, SNS/SQS). That shift introduces concerns the in-memory version never has:

- **Delivery guarantees** — at-most-once, at-least-once, or exactly-once. Most brokers give **at-least-once**, so consumers must be **idempotent** (handle duplicates).
- **Ordering** — global order is expensive; you usually get order only within a partition/key.
- **Durability & replay** — the broker persists messages; a consumer that was down catches up later (Kafka retains the log and lets you re-read).
- **Backpressure & buffering** — a slow consumer doesn't block the publisher; messages queue in the broker (with lag).
- **Independent failure** — publisher and subscriber can be down separately; the broker absorbs the gap.

| | In-process Observer | Distributed pub/sub |
|--|--|--|
| Coupling | Direct references | Fully decoupled via broker |
| Delivery | Synchronous, once | Async, usually at-least-once |
| Failure | Observer exception can break notify | Isolated; broker retries |
| Ordering | Call order | Per-partition only |

:::senior
The trap is treating a broker like an in-memory event bus. The moment delivery crosses the network you must design for **duplicates (idempotency), out-of-order arrival, poison messages (dead-letter queues), and consumer lag** — none of which exist when Observer is a synchronous method call.
:::`,
  },
  {
    id: 'pat-mod-plugin-architecture',
    question: 'How do you design a plugin architecture in Java, and what patterns and JDK mechanism underpin it?',
    difficulty: 'Medium',
    category: 'Modern Patterns',
    tags: ['plugin', 'spi', 'serviceloader', 'extensibility'],
    answer: `A plugin architecture lets you add capabilities **without modifying the core** — the Open/Closed Principle at application scale. The core defines **extension-point interfaces**; plugins implement them and are discovered at runtime.

The JDK mechanism is **\`ServiceLoader\` (SPI)**: the core declares an interface, plugins ship an implementation plus a \`META-INF/services\` entry (or a \`provides\` clause in \`module-info\`), and the core loads them by contract, not by name:

\`\`\`java
public interface PaymentPlugin { boolean supports(String type); Receipt charge(Order o); }

for (PaymentPlugin p : ServiceLoader.load(PaymentPlugin.class))   // discovered at runtime
  if (p.supports(order.type())) return p.charge(order);
\`\`\`

Patterns involved: **Strategy** (each plugin is an interchangeable algorithm), **Abstract Factory** (a plugin may create a family of objects), and often **Observer** (plugins subscribe to lifecycle events). Isolation may use separate \`ClassLoader\`s (as OSGi and IDEs do) so plugins can't see each other's internals.

:::senior
The design rule: the core depends **only on the extension interface** it owns (DIP), never on any plugin. Discovery (\`ServiceLoader\`, Spring's \`@Component\` scanning, an OSGi registry) is just the wiring; keeping the contract **stable and versioned** is what actually makes plugins maintainable.
:::`,
  },
  {
    id: 'pat-mod-functional-patterns',
    question: 'Did Java 8 lambdas make the GoF patterns obsolete?',
    difficulty: 'Hard',
    category: 'Modern Patterns',
    tags: ['functional', 'lambda', 'gof', 'modern-java'],
    answer: `No — lambdas made several GoF patterns **lighter to express**, not obsolete. When a pattern's core is a **single-method interface**, a lambda replaces the boilerplate class while the *design intent* stays:

| GoF pattern | Functional form |
|--|--|
| **Strategy** | A \`Function\`/\`Comparator\` lambda passed in |
| **Command** | A \`Runnable\`/\`Callable\` |
| **Template Method** | A higher-order function taking the varying step as a lambda (the \`JdbcTemplate\`/callback style) |
| **Observer** | \`Consumer\` callbacks, or reactive streams (\`Flow\`, Reactor) |
| **Factory** | A \`Supplier<T>\` |
| **Iterator** | \`Stream\` / internal iteration |

What *doesn't* vanish:
- Patterns with **multiple methods or state** (Visitor, State machines, Builder) don't collapse to one lambda.
- **Structural** patterns (Composite, Proxy, Decorator, Adapter) are about object relationships, not a single function.
- The **intent** (why you decoupled) remains the vocabulary you reason and communicate in.

:::senior
The senior framing: lambdas killed the **ceremony**, not the **concepts**. "Parameterize with behaviour" became so cheap it's now idiomatic (Streams, callbacks) rather than a consciously-invoked pattern. In an interview, say the pattern name *and* its modern one-liner form — that shows you know both the classic vocabulary and current Java.
:::`,
  },
  {
    id: 'pat-mod-immutable-pattern',
    question: 'Why is immutability treated as a design pattern, and how do you build immutable objects in Java?',
    difficulty: 'Medium',
    category: 'Modern Patterns',
    tags: ['immutability', 'records', 'value-object', 'thread-safety'],
    answer: `An **immutable object** cannot change after construction, which buys properties you otherwise fight for:

- **Thread-safety for free** — no shared mutable state means no synchronization, no data races.
- **Safe sharing & caching** — hand out the same instance freely (the basis of Flyweight, the \`Integer\` cache, the \`String\` pool).
- **Valid by construction** — invariants checked once in the constructor hold forever; no setter can corrupt them.
- **Reliable map keys** — a value that can't change is a trustworthy \`HashMap\` key.

Building one in Java:

\`\`\`java
public record Money(long cents, Currency currency) {   // record: shallow-immutable, final
  public Money {
    if (cents < 0) throw new IllegalArgumentException(); // validate in compact constructor
  }
  public Money plus(Money o) { return new Money(cents + o.cents, currency); } // return a NEW object
}
\`\`\`

Pre-records: \`final\` class, \`final\` fields, no setters, and **defensive copies** of mutable fields in and out.

:::gotcha
Records are only **shallowly** immutable — a \`record Team(List<Player> players)\` still lets callers mutate the list. Wrap collections in \`List.copyOf(...)\` in the compact constructor for genuine immutability. "Change" is modelled by returning a new instance (\`withX\`), never by mutating.
:::`,
  },
  {
    id: 'pat-mod-monostate',
    question: 'What is the Monostate (Borg) pattern, and how does it differ from Singleton?',
    difficulty: 'Hard',
    category: 'Modern Patterns',
    tags: ['monostate', 'borg', 'singleton', 'comparison'],
    answer: `**Monostate** achieves "one shared state" by making all fields **static** while letting callers create instances freely. Every instance is a different object but they **share the same state**, so they behave identically:

\`\`\`java
class Config {
  private static String env;          // shared across ALL instances
  public String getEnv() { return env; }
  public void setEnv(String e) { env = e; }
}
new Config().setEnv("prod");
new Config().getEnv();                // "prod" — different object, same state
\`\`\`

| | Singleton | Monostate |
|--|--|--|
| Instances | Exactly one | **Many**, all sharing static state |
| Enforcement | Private constructor + accessor | Static fields; construction is normal |
| Transparency | Callers know it's special | Looks like an **ordinary class** |
| Inheritance | Awkward | Works like a normal class |

Monostate's appeal is that clients use \`new\` normally and can't tell it's shared. But it keeps Singleton's real problem — **global mutable state** — while *hiding* it, which arguably makes it worse: nothing at the call site warns you that two "separate" objects are entangled.

:::senior
Both are usually the wrong answer. Monostate hides global state behind a normal-looking API (surprising in tests and concurrency); Singleton at least advertises it. If you truly need one shared instance, prefer a **DI-managed singleton bean** — one instance, injected, mockable — over either hand-rolled trick.
:::`,
  },
  {
    id: 'pat-mod-repository-vs-active-record',
    question: 'What is the difference between the Repository and Active Record patterns for data access?',
    difficulty: 'Medium',
    category: 'Modern Patterns',
    tags: ['repository', 'active-record', 'data-access', 'orm'],
    answer: `Both map objects to persistence, but they put the persistence logic in different places:

- **Active Record** — the **domain object persists itself**: \`user.save()\`, \`User.findById(1)\`. Data and persistence live on one class. Simple and fast to write (Rails, Django ORM).
- **Repository** — a **separate collection-like object** handles persistence: \`userRepository.save(user)\`. The domain object is pure data + behaviour; persistence lives elsewhere.

| | Active Record | Repository |
|--|--|--|
| Persistence lives | On the entity itself | In a separate repository |
| Domain purity | Entity coupled to the DB | Entity is persistence-ignorant |
| Testability | Harder (entity hits the DB) | Easy (mock the repository) |
| Best for | CRUD-heavy, simple domains | Rich domains, DDD, complex logic |

Active Record couples your domain to the database (the entity knows how to save itself), which hurts unit testing and clean-architecture goals. Repository keeps the domain **persistence-ignorant** — the DIP/hexagonal choice.

:::senior
Active Record isn't wrong — for CRUD apps it's less ceremony and perfectly maintainable. Repository pays off when domain logic is rich enough that you want it testable **without** a database and decoupled from the ORM. Match the pattern to the domain's complexity, not to fashion.
:::`,
  },
  {
    id: 'pat-mod-anemic-domain-model',
    question: 'What is the Anemic Domain Model, and why do some consider it an anti-pattern?',
    difficulty: 'Hard',
    category: 'Modern Patterns',
    tags: ['anemic-domain-model', 'ddd', 'anti-pattern'],
    answer: `An **anemic domain model** is one where domain objects are **bags of getters/setters with no behaviour**, and all the logic lives in "service" classes that manipulate them from outside:

\`\`\`java
// Anemic: data here...
class Account { private Money balance; /* getters/setters */ }
// ...behaviour over there
class AccountService {
  void withdraw(Account a, Money amt) {
    if (a.getBalance().isLessThan(amt)) throw new IllegalStateException();
    a.setBalance(a.getBalance().minus(amt));   // invariant enforced OUTSIDE the object
  }
}
\`\`\`

Fowler calls it an anti-pattern because it **violates encapsulation**: the object can't protect its own invariants (any code can \`setBalance(negative)\`), logic gets duplicated across services, and you pay the *cost* of a domain model (mapping, objects) with none of the OO *benefit* (behaviour beside the data it guards). A **rich** model puts \`account.withdraw(amt)\` on the entity, where the invariant is enforced.

:::senior
The nuance: anemic models are **defensible** in simple CRUD apps and transaction-script architectures, and DTOs/JPA entities are *supposed* to be data-only. It becomes an anti-pattern when a **complex domain** with real rules is modelled anemically — the business logic scatters into procedural services and encapsulation is lost. Judge it by domain complexity, not dogma.
:::`,
  },
];

export default questions;
