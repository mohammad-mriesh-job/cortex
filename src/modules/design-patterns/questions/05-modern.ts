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
];

export default questions;
