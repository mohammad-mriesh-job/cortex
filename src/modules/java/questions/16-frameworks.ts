import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'fw-constructor-injection',
    question: 'Constructor vs field injection in Spring — which and why?',
    difficulty: 'Medium',
    category: 'Frameworks',
    tags: ['spring', 'dependency-injection'],
    answer: `**Constructor injection.** It lets dependencies be \`final\` (immutable, thread-safe) and non-null, makes the object valid the moment it's built, fails fast if a bean is missing, exposes over-injection (a huge constructor screams "too many responsibilities"), and is unit-testable with a plain \`new\` — no Spring or reflection.

Field injection (\`@Autowired\` on a field) hides dependencies, can't be \`final\`, and needs reflection to test. Since Spring 4.3 a single constructor needs no \`@Autowired\`.`,
  },
  {
    id: 'fw-singleton-bean-thread-safety',
    question: 'Is a default-scoped Spring bean thread-safe?',
    difficulty: 'Medium',
    category: 'Frameworks',
    tags: ['spring', 'concurrency', 'scopes'],
    answer: `The default scope is **singleton** — *one shared instance per container*, used by all threads concurrently. Spring does **not** synchronize it. So it is thread-safe **only if it is stateless** (or its mutable state is itself thread-safe).

Storing per-request data in a singleton bean's field is a classic race condition. Keep singletons stateless; pass request data as parameters or use request-scoped beans.`,
  },
  {
    id: 'fw-transactional-self-invocation',
    question: 'Why might @Transactional "not work" when a method is called from within the same class?',
    difficulty: 'Hard',
    category: 'Frameworks',
    tags: ['spring', 'transactions', 'aop'],
    answer: `\`@Transactional\` is **proxy-based**. Spring wraps the bean in a proxy that starts/commits the transaction, but only for calls coming from **outside**. An internal call — \`this.otherMethod()\` — goes straight to the target instance and **bypasses the proxy**, so the transactional advice never runs.

Fixes: move the transactional method to a **separate bean**, or inject a self-reference and call through it, so the invocation passes through the proxy.`,
  },
  {
    id: 'fw-transactional-checked-rollback',
    question: 'A @Transactional method throws a checked exception. Does it roll back?',
    difficulty: 'Hard',
    category: 'Frameworks',
    tags: ['spring', 'transactions', 'rollback'],
    answer: `**No — by default it commits.** Spring rolls back only on **\`RuntimeException\`** and **\`Error\`**, not on checked exceptions. A checked \`IOException\` thrown mid-transaction lets the partial work commit.

To roll back on checked exceptions, be explicit: \`@Transactional(rollbackFor = Exception.class)\`.`,
  },
  {
    id: 'fw-n-plus-one',
    question: 'What is the N+1 query problem in JPA/Hibernate, and how do you fix it?',
    difficulty: 'Hard',
    category: 'Frameworks',
    tags: ['jpa', 'hibernate', 'performance'],
    answer: `Loading a list issues **1** query, then lazily accessing an association on each of the **N** elements issues **N** more — 1+N round-trips (1,001 for 1,000 rows).

Fixes collapse it to one query:
- **\`JOIN FETCH\`** in JPQL,
- **\`@EntityGraph(attributePaths = {...})\`** on the query,
- **batch fetching** (\`hibernate.default_batch_fetch_size\`) to turn N selects into ⌈N/size⌉.

Diagnose it by enabling SQL logging and watching for per-row SELECT bursts. Avoid "fix by EAGER" — that just moves the cost.`,
  },
  {
    id: 'fw-lazy-init-exception',
    question: 'What causes a LazyInitializationException and how do you avoid it?',
    difficulty: 'Medium',
    category: 'Frameworks',
    tags: ['jpa', 'hibernate', 'lazy'],
    answer: `It's thrown when you access a **LAZY** association **after** the persistence context (Hibernate session) has closed — commonly during JSON serialization in the web layer, outside the transaction.

Avoid it by fetching what you need **inside** the transaction (\`JOIN FETCH\` or \`@EntityGraph\`) or mapping to a **DTO** before the session closes. Don't rely on Open-Session-In-View or switch everything to EAGER (that triggers N+1).`,
  },
  {
    id: 'fw-dto-vs-entity',
    question: 'Why not return JPA entities directly from a REST controller?',
    difficulty: 'Medium',
    category: 'Frameworks',
    tags: ['spring', 'rest', 'dto'],
    answer: `Returning entities couples your **API contract to your DB schema**, leaks internal fields, risks **mass-assignment** on the request side, and triggers **lazy-loading / serialization** errors when Jackson walks lazy associations after the session closed.

Map to a **DTO** (a \`record\` works well) at the boundary — a stable contract that evolves independently of the schema.`,
  },
  {
    id: 'fw-propagation-requires-new',
    question: 'When would you use Propagation.REQUIRES_NEW?',
    difficulty: 'Medium',
    category: 'Frameworks',
    tags: ['spring', 'transactions', 'propagation'],
    answer: `\`REQUIRES_NEW\` **suspends** the current transaction and runs in a new, independent one that commits/rolls back on its own.

Canonical use: an **audit / log record that must persist even if the outer business transaction rolls back.** With the default \`REQUIRED\` the log would be rolled back with everything else; \`REQUIRES_NEW\` isolates it.`,
  },
  {
    id: 'fw-prepared-statement',
    question: 'Why use a PreparedStatement with bound parameters instead of building SQL with string concatenation?',
    difficulty: 'Easy',
    category: 'Frameworks',
    tags: ['jdbc', 'sql-injection', 'security'],
    answer: `Two reasons: **security** and **performance.**

- **SQL injection** — bound parameters separate code from data, so user input can never change the query's structure. Concatenating input is the classic injection hole.
- **Plan caching** — the parameterized statement is reused, letting the database cache its execution plan.

Combine with **try-with-resources** to guarantee the \`Connection\`/\`Statement\`/\`ResultSet\` close (preventing pool leaks).`,
  },
  {
    id: 'fw-connection-pool-size',
    question: 'Why is a large database connection pool usually a mistake?',
    difficulty: 'Medium',
    category: 'Frameworks',
    tags: ['jdbc', 'connection-pool', 'performance'],
    answer: `Connections are expensive resources on the **database** side; hundreds of them cause context-switching, lock contention, and memory pressure — throughput often *drops*. A small pool (roughly \`(cores × 2) + effective_spindles\`) usually maxes out the DB.

Spring Boot uses **HikariCP** by default. Keep transactions short (don't hold a connection across a slow external call), and use try-with-resources to avoid **connection leaks** that exhaust the pool.`,
  },
  {
    id: 'fw-ioc-container',
    question: 'What is the Spring IoC container, and what does "Inversion of Control" mean?',
    difficulty: 'Easy',
    category: 'Frameworks',
    tags: ['spring', 'ioc', 'container'],
    answer: `**Inversion of Control** means the framework — not your code — controls object creation and wiring. Instead of a class calling \`new Collaborator()\`, the **container** instantiates the objects (**beans**), injects their dependencies, and manages their lifecycle. You declare *what* beans exist and what each needs; Spring works out construction order and supplies the collaborators.

The container is the \`ApplicationContext\` (a richer \`BeanFactory\`), configured by annotations, Java \`@Configuration\`, or XML.

\`\`\`java
ApplicationContext ctx = SpringApplication.run(App.class, args);
OrderService svc = ctx.getBean(OrderService.class);   // fully wired by the container
\`\`\`

Benefits: loose coupling (beans depend on interfaces), centralized configuration, and easy testing (swap real beans for fakes).

:::note
**Dependency injection is the mechanism; IoC is the principle.** Spring implements IoC *by* injecting dependencies — the two terms are often used interchangeably, but DI is the specific technique.
:::`,
  },
  {
    id: 'fw-bean-scopes',
    question: 'What bean scopes does Spring support, and which is the default?',
    difficulty: 'Easy',
    category: 'Frameworks',
    tags: ['spring', 'scopes', 'beans'],
    answer: `The default is **singleton** — *one instance per container*, shared by every injection point (not the classic GoF one-per-JVM singleton).

| Scope | Instances |
|---|---|
| **singleton** (default) | one per container |
| **prototype** | a new one on every injection / \`getBean\` |
| **request** (web) | one per HTTP request |
| **session** (web) | one per HTTP session |
| **application** | one per \`ServletContext\` |

\`\`\`java
@Component
@Scope("prototype")
class Task { }
\`\`\`

:::gotcha
Spring does **not** manage a prototype's full lifecycle — it creates and injects it but never calls its destroy callback, so you own cleanup. And injecting a prototype into a **singleton** captures *one* instance at startup, not a fresh one per use — use \`ObjectProvider\`, \`@Lookup\`, or a scoped proxy when you truly need a new instance each time.
:::`,
  },
  {
    id: 'fw-bean-lifecycle',
    question: 'Walk through the lifecycle of a Spring bean and its callbacks.',
    difficulty: 'Medium',
    category: 'Frameworks',
    tags: ['spring', 'lifecycle', 'beans'],
    answer: `For a singleton bean the container runs: **instantiate** → **populate** dependencies → \`*Aware\` callbacks (\`BeanNameAware\`, \`ApplicationContextAware\`) → \`BeanPostProcessor.postProcessBeforeInitialization\` → **init** callbacks (\`@PostConstruct\`, then \`InitializingBean.afterPropertiesSet\`, then a custom \`initMethod\`) → \`BeanPostProcessor.postProcessAfterInitialization\` → **ready**. On context close: \`@PreDestroy\` → \`DisposableBean.destroy\` → custom \`destroyMethod\`.

\`\`\`java
@Component
class Cache {
  @PostConstruct void warmUp() { /* after injection, before first use */ }
  @PreDestroy   void flush()   { /* on context shutdown */ }
}
\`\`\`

Prefer the JSR-250 annotations (\`@PostConstruct\`/\`@PreDestroy\`) over the Spring interfaces to avoid coupling your code to the framework.

:::senior
\`BeanPostProcessor\` is where **AOP proxies** are created — \`@Transactional\`/\`@Async\` wrapping happens in the *after-initialization* step. That's precisely why a self-invocation (\`this.method()\`) bypasses the advice: it never goes through the proxy that was layered on here.
:::`,
  },
  {
    id: 'fw-component-vs-bean',
    question: '@Component vs @Bean — when do you use each?',
    difficulty: 'Easy',
    category: 'Frameworks',
    tags: ['spring', 'configuration', 'beans'],
    answer: `\`@Component\` (and its stereotypes \`@Service\`/\`@Repository\`/\`@Controller\`) marks **your own class** for classpath component-scanning — Spring finds and instantiates it. \`@Bean\` annotates a **method** inside a \`@Configuration\` class whose *return value* becomes a bean — *you* construct the object.

Reach for \`@Bean\` when:
- the type is **third-party** and you can't annotate it (\`RestClient\`, \`ObjectMapper\`, a \`DataSource\`);
- construction needs logic or conditionals;
- you want several beans of the same type.

\`\`\`java
@Configuration
class Config {
  @Bean RestClient restClient() { return RestClient.create(); }  // can't annotate a library class
}
\`\`\`

:::gotcha
\`@Component\` beans are **auto-discovered** by scanning; \`@Bean\` methods are **explicit**. The single most common reason to use \`@Bean\` is exactly that you can't put \`@Component\` on a class you don't own.
:::`,
  },
  {
    id: 'fw-autowired-qualifier-primary',
    question: 'How does @Autowired resolve a dependency when several candidate beans match?',
    difficulty: 'Medium',
    category: 'Frameworks',
    tags: ['spring', 'autowired', 'qualifier'],
    answer: `\`@Autowired\` resolves **by type** first. One match — done. Several matches — Spring throws \`NoUniqueBeanDefinitionException\` unless you disambiguate:

- **\`@Primary\`** on one bean → the default winner when a type is ambiguous.
- **\`@Qualifier("name")\`** at the injection point → pick a specific bean by name.
- Falling back to matching the **field/parameter name** against a bean name.

\`\`\`java
@Bean @Primary PaymentGateway stripe() { /* ... */ }
@Bean PaymentGateway paypal() { /* ... */ }

OrderService(@Qualifier("paypal") PaymentGateway gw) { /* ... */ }  // overrides @Primary
\`\`\`

\`@Primary\` is a *global* default; \`@Qualifier\` is a *local* override and wins over \`@Primary\`.

:::gotcha
Injecting a \`List<PaymentGateway>\` collects **all** matching beans, and \`Map<String, PaymentGateway>\` keys them by bean name — a clean way to build a strategy registry instead of disambiguating a single one.
:::`,
  },
  {
    id: 'fw-circular-dependency',
    question: 'How does Spring handle a circular dependency between two beans?',
    difficulty: 'Hard',
    category: 'Frameworks',
    tags: ['spring', 'circular-dependency', 'beans'],
    answer: `Bean A needs B and B needs A. The outcome depends on injection style:

- **Constructor injection on both** — Spring can't fully build either first → \`BeanCurrentlyInCreationException\` at startup. Since Boot 2.6 this fails by default even for setter cycles (\`spring.main.allow-circular-references=false\`).
- **Setter/field injection** — Spring resolves it via its three-level cache: create A (raw), expose an *early reference*, inject it into B, finish B, then finish A.

Fixes, best first: **redesign** to remove the cycle (extract a third collaborator) — a cycle is usually a design smell. Tactical: \`@Lazy\` on one dependency (injects a proxy that defers resolution), or switch that side to setter injection.

\`\`\`java
OrderService(@Lazy InventoryService inv) { /* proxy breaks the construction-time cycle */ }
\`\`\`

:::senior
The real answer is "don't". A cycle means the two beans are too entangled; the \`@Lazy\`/setter tricks only *hide* the coupling. Constructor injection surfaces it loudly at startup — that's a feature, not an obstacle to work around.
:::`,
  },
  {
    id: 'fw-auto-configuration',
    question: 'How does Spring Boot auto-configuration work, and what is a starter?',
    difficulty: 'Medium',
    category: 'Frameworks',
    tags: ['spring-boot', 'auto-configuration', 'starters'],
    answer: `Auto-configuration means Boot wires up beans for you based on **what's on the classpath**. \`@SpringBootApplication\` includes \`@EnableAutoConfiguration\`, which loads the auto-config classes listed in each jar's \`META-INF/spring/…AutoConfiguration.imports\` (\`spring.factories\` before Boot 3). Each is guarded by \`@Conditional\` annotations — \`@ConditionalOnClass\`, \`@ConditionalOnMissingBean\`, \`@ConditionalOnProperty\` — so it applies *only* when relevant and only when you haven't defined your own.

A **starter** is a curated dependency bundle: \`spring-boot-starter-web\` pulls Spring MVC + Tomcat + Jackson. It brings the jars whose *presence* triggers the matching auto-config.

\`\`\`text
add spring-boot-starter-data-jpa
  -> Hibernate on the classpath
  -> DataSource + EntityManagerFactory + TransactionManager auto-configured
\`\`\`

:::gotcha
\`@ConditionalOnMissingBean\` is why simply **defining your own bean silently overrides** Boot's default. When behaviour surprises you, run with \`--debug\` to print the *conditions evaluation report* instead of guessing what got configured.
:::`,
  },
  {
    id: 'fw-transaction-propagation',
    question: 'Explain @Transactional propagation. How do REQUIRED, REQUIRES_NEW, and NESTED differ?',
    difficulty: 'Hard',
    category: 'Frameworks',
    tags: ['spring', 'transactions', 'propagation'],
    answer: `Propagation decides how a transactional method joins or creates a transaction when it's called inside another.

| Propagation | Behaviour |
|---|---|
| **REQUIRED** (default) | join the current tx, or start one |
| **REQUIRES_NEW** | suspend the current tx, run in a new independent one |
| **NESTED** | a savepoint inside the current tx |
| **SUPPORTS** | join if a tx exists, else run non-transactionally |
| **MANDATORY** | must run in an existing tx, else throw |
| **NOT_SUPPORTED** | suspend any tx, run non-transactionally |
| **NEVER** | throw if a tx exists |

The key contrast: **REQUIRES_NEW** commits or rolls back **independently** (two physical transactions — the outer can roll back while the inner's audit row survives). **NESTED** shares *one* physical transaction via a JDBC **savepoint**, so an inner failure rolls back to the savepoint but an *outer* rollback still discards the nested work.

:::gotcha
Propagation is enforced by the **proxy**. An internal self-call (\`this.method()\`) never re-enters the proxy, so the requested propagation — new tx, mandatory, whatever — simply doesn't apply.
:::`,
  },
  {
    id: 'fw-mvc-request-flow',
    question: 'Walk through how Spring MVC handles an incoming HTTP request.',
    difficulty: 'Medium',
    category: 'Frameworks',
    tags: ['spring', 'mvc', 'dispatcher-servlet'],
    answer: `The **\`DispatcherServlet\`** is the front controller — every request flows through it:

1. **\`HandlerMapping\`** finds the handler (\`@Controller\` method) for the URL.
2. **\`HandlerAdapter\`** invokes it, binding path variables, query params, and the request body (via \`HttpMessageConverter\`s).
3. The controller returns a value.
4. Either a **\`ViewResolver\`** turns a view name into a \`View\` that renders HTML, **or** — for \`@ResponseBody\`/\`@RestController\` — an \`HttpMessageConverter\` (Jackson) serializes the return value straight into the response body.

\`\`\`mermaid
flowchart LR
  Client["Client"] --> DS["DispatcherServlet"]
  DS --> HM["HandlerMapping"]
  HM --> HA["HandlerAdapter"]
  HA --> Ctrl["Controller"]
  Ctrl --> VR["ViewResolver / HttpMessageConverter"]
  VR --> DS
  DS --> Client
\`\`\`

:::senior
\`@RestController\` = \`@Controller\` + \`@ResponseBody\`: it **skips the ViewResolver entirely** and writes the serialized body. The classic follow-up — "\`@Controller\` vs \`@RestController\`" — comes down to exactly that view-vs-body branch at step 4.
:::`,
  },
  {
    id: 'fw-controller-advice',
    question: 'How do you handle exceptions globally in a Spring REST API?',
    difficulty: 'Easy',
    category: 'Frameworks',
    tags: ['spring', 'exception-handling', 'rest'],
    answer: `Use a **\`@RestControllerAdvice\`** class with **\`@ExceptionHandler\`** methods. It centralizes exception → HTTP-response mapping across *all* controllers, so you don't scatter try/catch through the code.

\`\`\`java
@RestControllerAdvice
class ApiExceptionHandler {
  @ExceptionHandler(EntityNotFoundException.class)
  ProblemDetail notFound(EntityNotFoundException e) {
    return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
  }
}
\`\`\`

\`@RestControllerAdvice\` = \`@ControllerAdvice\` + \`@ResponseBody\`. Return a **\`ProblemDetail\`** (RFC 7807, built in since Spring 6) or a custom error DTO with the correct status. Simpler cases: put \`@ResponseStatus\` on a custom exception, or an \`@ExceptionHandler\` method inside a single controller for a local exception.

:::tip
Keeping the mapping in one advice class keeps error responses **consistent** in shape and status codes — clients depend on that contract just as much as on your success responses.
:::`,
  },
  {
    id: 'fw-entity-lifecycle-states',
    question: 'What are the JPA entity lifecycle states (transient, persistent, detached, removed)?',
    difficulty: 'Medium',
    category: 'Frameworks',
    tags: ['jpa', 'hibernate', 'entity-lifecycle'],
    answer: `An entity's state is defined by its relationship to the **persistence context** (the \`EntityManager\`/Hibernate \`Session\`):

- **Transient** — freshly \`new\`ed, no identity, not tracked (\`new User()\`).
- **Persistent / managed** — attached to an open context; changes are auto-flushed via dirty checking (result of \`persist\` or \`find\`).
- **Detached** — was managed, but the context closed or you called \`detach\`/\`clear\`; edits are no longer tracked.
- **Removed** — scheduled for \`DELETE\` on the next flush after \`remove\`.

\`\`\`mermaid
stateDiagram-v2
  [*] --> Transient: new
  Transient --> Managed: persist
  Managed --> Removed: remove
  Managed --> Detached: close or detach
  Detached --> Managed: merge
  Removed --> [*]
\`\`\`

:::gotcha
\`merge()\` does **not** re-attach your detached instance — it copies that state onto a *managed* instance and returns **that**. Keep using the return value; edits to the original detached object are silently lost.
:::`,
  },
  {
    id: 'fw-first-level-cache',
    question: "What is Hibernate's first-level cache, and how does dirty checking work?",
    difficulty: 'Hard',
    category: 'Frameworks',
    tags: ['hibernate', 'jpa', 'persistence-context'],
    answer: `The **first-level cache** *is* the **persistence context** (the \`Session\`/\`EntityManager\`). It's mandatory and scoped to one transaction, and it does two things:

1. **Identity map** — within a session, \`find\`ing the same id twice returns the **same object instance**, and the second lookup issues **no SQL**.
2. **Automatic dirty checking** — on flush (before commit or a query), Hibernate compares each managed entity against a snapshot taken at load time and emits \`UPDATE\` for changed fields. You never call \`save()\` for an already-managed entity.

\`\`\`java
User u = em.find(User.class, 1L);  // SELECT; u is now managed
u.setName("New");                  // no save() call needed
// on commit -> flush -> UPDATE users SET name = ?
em.find(User.class, 1L);           // no SELECT — served from the L1 cache
\`\`\`

:::senior
It's **per transaction**, not shared — don't confuse it with the optional **second-level cache** (shared across sessions). It's also why a long session that loads thousands of entities balloons memory and slows every flush: each managed entity is snapshotted and dirty-checked. Use \`clear()\` or a stateless session for bulk work.
:::`,
  },
];

export default questions;
