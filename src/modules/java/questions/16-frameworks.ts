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
];

export default questions;
