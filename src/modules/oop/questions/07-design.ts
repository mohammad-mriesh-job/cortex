import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'oop-dsn-noun-verb',
    question: 'How do you turn a paragraph of requirements into a first-pass class design?',
    difficulty: 'Easy',
    category: 'OOP Design',
    tags: ['domain modeling', 'noun-verb'],
    answer: `Use the **noun/verb heuristic** as a starting point:

- **Nouns** → candidate **classes** (or **attributes**, if they're just data a class holds).
- **Verbs** → candidate **methods**, assigned to the class that owns the data they act on.
- **Adjectives** → often **derived state** (\`loan.isOverdue()\`), computed rather than stored.

It's a seed, not a rule: prune nouns that are really attributes (a *due date* belongs on \`Loan\`, not its own class), and add classes with no single word in the text (a \`NotificationService\`). Then draw a class diagram and decide relationship *strength* (aggregation vs composition).`,
  },
  {
    id: 'oop-dsn-crc-cards',
    question: 'What are CRC cards and what design decision do they help you make?',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['crc cards', 'responsibilities'],
    answer: `**CRC = Class, Responsibilities, Collaborators.** Each candidate class gets an index card listing what it *knows/does* and which other classes it *needs* to do so.

You walk a scenario ("a member borrows a book") and hand each responsibility to a card, guided by **Information Expert** (put behavior where the data lives). The card's small physical size is a built-in smell detector: if the responsibilities overflow, the class is doing too much (a **god class**) and should be split.

They help you **assign responsibilities** — the hardest modeling decision — before writing code.`,
  },
  {
    id: 'oop-dsn-info-expert',
    question: 'What is the Information Expert principle, and how does it relate to feature envy?',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['grasp', 'information expert', 'feature envy'],
    answer: `**Information Expert** (a GRASP principle) says: assign a responsibility to the class that has the **data needed to fulfill it**. \`loan.isOverdue()\` lives on \`Loan\` because \`Loan\` knows the due date.

**Feature envy** is the smell you get when you *violate* it: a method that reads another object's data more than its own. The fix — **Move Method** — relocates the behavior to the data's owner, which is exactly what Information Expert would have told you to do in the first place.`,
  },
  {
    id: 'oop-dsn-dry-vs-yagni',
    question: 'DRY and YAGNI can conflict. How do you decide when to extract a shared abstraction?',
    difficulty: 'Hard',
    category: 'OOP Design',
    tags: ['dry', 'yagni', 'rule of three'],
    answer: `**DRY** says eliminate duplicated *knowledge*; **YAGNI** says don't build abstractions you don't yet need. Two similar-looking lines aren't necessarily the same knowledge — they may diverge later (coincidental duplication).

The pragmatic tie-breaker is the **rule of three**: duplicate once, tolerate it; on the *third* occurrence you have enough evidence the duplication is real, so extract the abstraction. Premature extraction couples unrelated code and is often harder to unwind than the duplication it removed.

:::tip
Ask "is this the same *decision/fact*, or just similar-looking code?" DRY is about knowledge, not text.
:::`,
  },
  {
    id: 'oop-dsn-program-to-interface',
    question: 'What does "program to an interface, not an implementation" mean, and what does it buy you?',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['program to an interface', 'coupling'],
    answer: `Depend on the **abstraction** rather than a concrete type. Prefer:

\`\`\`java
void save(List<User> users)      // not ArrayList<User>
private final List<Item> items;  // not ArrayList<Item>
\`\`\`

Benefits:
- **Low coupling** — callers can pass *any* \`List\` (\`ArrayList\`, \`LinkedList\`, immutable list).
- **Substitutability** — swap implementations without touching the consumer.
- It's the enabler for the Dependency Inversion and Open/Closed principles.`,
  },
  {
    id: 'oop-dsn-god-class',
    question: 'What is a god class and how do you refactor it?',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['god class', 'srp', 'extract class'],
    answer: `A **god class** hoards responsibilities — hundreds of lines, many unrelated fields, and it touches everything. It violates **Single Responsibility** and has **low cohesion**.

Refactor by:
1. **Extract Method** to name and isolate coherent chunks of logic.
2. **Extract Class** to move each cluster of related fields+methods into its own focused class.
3. Re-check with a CRC card — each resulting class should fit on one card.

Do it in small, test-backed steps so behavior is preserved throughout.`,
  },
  {
    id: 'oop-dsn-primitive-obsession',
    question: 'What is primitive obsession, and how does a value object fix it?',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['primitive obsession', 'value object'],
    answer: `**Primitive obsession** is modeling domain concepts with bare primitives — \`String email\`, \`double money\` — so validation and behavior get scattered and duplicated across the codebase, and the type system can't catch mixups (passing a phone number where an email is expected).

Fix with **Replace Primitive with Value Object**: wrap the concept in a small immutable type that validates once in its constructor.

\`\`\`java
record Email(String value) {
  Email {
    if (!value.contains("@")) throw new IllegalArgumentException();
  }
}
\`\`\`

Now an invalid \`Email\` can't exist, validation lives in one place (DRY), and method signatures are type-safe.`,
  },
  {
    id: 'oop-dsn-long-parameter-list',
    question: 'A method takes seven parameters, several always passed together. What smell is this and how do you refactor?',
    difficulty: 'Easy',
    category: 'OOP Design',
    tags: ['long parameter list', 'data clump', 'parameter object'],
    answer: `This is **long parameter list**, usually caused by a **data clump** — a group of fields that always travel together (e.g. \`street, city, zip, country\`).

Refactor with **Introduce Parameter Object**: bundle the clump into a cohesive class (\`Address\`) and pass that. Benefits: shorter signatures, a natural home for related behavior (\`address.format()\`), and higher cohesion. Long lists also often hint at a missing abstraction or a method doing too much.`,
  },
  {
    id: 'oop-dsn-switch-to-polymorphism',
    question: 'You keep adding cases to a `switch (shape.type)` scattered across the code. What refactoring applies and which principle does it restore?',
    difficulty: 'Hard',
    category: 'OOP Design',
    tags: ['polymorphism', 'open-closed', 'strategy'],
    answer: `The smell is a **type-code switch** (conditional on a type field). Apply **Replace Conditional with Polymorphism**: give each shape its own subclass overriding \`area()\`, and let dynamic dispatch pick the right behavior.

This restores the **Open/Closed Principle** — adding a new shape means adding a class, not editing every \`switch\`. When the varying behavior is an interchangeable algorithm rather than a subtype, the same refactoring lands you on the **Strategy** pattern. Recurring type switches are a classic entry point into the design-pattern catalogue.`,
  },
  {
    id: 'oop-dsn-coupling-cohesion',
    question: 'Why are Low Coupling and High Cohesion considered the "master gauges" of OO design?',
    difficulty: 'Hard',
    category: 'OOP Design',
    tags: ['grasp', 'coupling', 'cohesion'],
    answer: `**Cohesion** = how focused a single class is (do its members serve one purpose?). **Coupling** = how many dependencies exist *between* classes.

They're master gauges because most other principles are just tactics for improving one or both:
- **SRP** and **Extract Class** raise cohesion.
- **Program to an interface** and **Dependency Inversion** lower coupling.
- **Move Method / Information Expert** raise cohesion by putting behavior with its data.

You want **high cohesion, low coupling**: classes that each do one thing well and know as little about each other as possible — which makes the system easy to understand, change, and reuse.`,
  },
  {
    id: 'oop-dsn-separation-of-concerns',
    question: 'What is Separation of Concerns?',
    difficulty: 'Easy',
    category: 'OOP Design',
    tags: ['separation of concerns', 'modularity'],
    answer: `**Separation of Concerns (SoC)** means splitting a system so each part handles **one distinct aspect** — persistence, validation, presentation, business logic — with minimal overlap.

You achieve it through layers, modules, MVC, and classes with single responsibilities. The payoff: you can understand or change one concern without disturbing the others, reuse parts independently, and let teams work in parallel.

\`\`\`java
// Mixed concerns — SQL, formatting, and rules tangled in one method (bad)
// Separated — Repository (data), Service (rules), View (formatting)
\`\`\`

:::key
SoC is the **general principle**; SRP (at the class level), layered architecture, and MVC are specific ways to apply it. High cohesion and low coupling are what it produces.
:::`,
  },
  {
    id: 'oop-dsn-kiss',
    question: 'What is the KISS principle?',
    difficulty: 'Easy',
    category: 'OOP Design',
    tags: ['kiss', 'simplicity', 'yagni'],
    answer: `**KISS — "Keep It Simple, Stupid":** prefer the simplest design that actually solves the problem; every bit of complexity must earn its place. Simple code is easier to read, test, debug, and change.

KISS pushes back on clever abstractions, premature generalisation, and "pattern soup." It pairs with **YAGNI** (don't build what you don't yet need) and opposes gold-plating.

:::gotcha
"Simple" is **not** "fewest lines." A dense one-liner can be *less* simple than five clear statements. Simple means **easy to understand and change** — optimise for the reader, not the character count.
:::`,
  },
  {
    id: 'oop-dsn-composition-root',
    question: 'What is a composition root?',
    difficulty: 'Easy',
    category: 'OOP Design',
    tags: ['composition root', 'dependency injection', 'wiring'],
    answer: `The **composition root** is the single place — near the application entry point (\`main\`, or a DI container's config) — where the object graph is **assembled**: where concrete implementations are created and dependencies wired together.

\`\`\`java
public static void main(String[] args) {
  var repo    = new JpaOrderRepository(dataSource);   // choose concretes HERE
  var mailer  = new SmtpMailer(config);
  var service = new OrderService(repo, mailer);       // wire them
  new Api(service).start();
}
\`\`\`

Everywhere else depends only on **abstractions** and receives collaborators by injection.

:::tip
Only the composition root should know about concrete classes and \`new\`. Keep wiring in one spot and the rest of the system stays decoupled and testable — with or without a framework.
:::`,
  },
  {
    id: 'oop-dsn-interface-first',
    question: 'What does "interface-first" (outside-in) design mean, and why do it?',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['interface-first', 'design by contract', 'isp'],
    answer: `**Interface-first** design means defining the **abstraction a client needs — from the caller's point of view — before** writing any implementation. You ask *"what's the smallest, clearest API that makes the call site read well?"*, then build behind it.

\`\`\`java
// Design the call you WISH existed first...
BigDecimal total = pricing.quote(cart, customer);
// ...then define the interface it implies, then implement it.
interface Pricing { BigDecimal quote(Cart cart, Customer c); }
\`\`\`

Benefits: it forces you to think about **usage and responsibility** up front, decouples client from implementation, enables TDD with mocks, and naturally keeps interfaces **small** (ISP).

:::senior
Writing the call site first is the trick: the interface *falls out of how it's used*, not out of how it happens to be implemented — which is how leaky APIs are born.
:::`,
  },
  {
    id: 'oop-dsn-testability',
    question: 'How do you design code to be testable?',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['testability', 'seams', 'dependency injection'],
    answer: `Testable code lets you drive a unit with controlled inputs and observe its outputs in isolation. Techniques:

1. **Dependency injection** — pass collaborators in so tests can substitute fakes/mocks.
2. **Program to interfaces** — create **seams** (points where behaviour can be swapped without editing the code).
3. **Avoid hidden dependencies** — no static/global state, no \`new\`-ing dependencies deep inside methods, no \`Instant.now()\`/\`getInstance()\` buried in logic.
4. **Separate pure logic from I/O** — a functional core (easy to test) inside an imperative shell.

\`\`\`java
// Injected clock — tests control time; contrast with a hidden Instant.now()
Receipt charge(Order o, Clock clock) { ... }
\`\`\`

:::key
If something is hard to test, it's usually too **coupled**. Testability pressure is a design smell detector — fixing it (injecting a dependency, extracting pure logic) improves the design itself.
:::`,
  },
  {
    id: 'oop-dsn-di-styles',
    question: 'What are the three styles of dependency injection, and which is preferred?',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['dependency injection', 'constructor injection', 'testability'],
    answer: `| Style | How | Notes |
|--|--|--|
| **Constructor** | dependencies as constructor params | **preferred** — explicit, object always valid, fields can be \`final\` |
| **Setter** | \`setX(dep)\` after construction | for optional / reconfigurable deps; risks half-built objects |
| **Field** | framework sets private fields (\`@Autowired\`) | concise, but hides deps and can't be \`final\` |

\`\`\`java
class OrderService {
  private final Repo repo;
  OrderService(Repo repo) { this.repo = repo; }   // constructor injection
}
\`\`\`

**Prefer constructor injection:** it makes dependencies visible in the signature, enforces required ones, and keeps objects immutable.

:::gotcha
Field injection looks clean but you can't instantiate the class in a plain unit test without reflection or the container — a classic testability smell hiding as tidiness.
:::`,
  },
  {
    id: 'oop-dsn-grasp-overview',
    question: 'What are the GRASP principles, and how do they relate to SOLID?',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['grasp', 'responsibility', 'solid'],
    answer: `**GRASP** — General Responsibility Assignment Software Patterns (Craig Larman) — is a set of nine principles for the hardest OO question: **which class gets which responsibility?** The core ones:

- **Information Expert** — give a responsibility to the class that has the data.
- **Creator** — the class that contains/aggregates B should create B.
- **Controller** — route system events through a coordinating class.
- **Low Coupling / High Cohesion** — the master gauges.
- **Polymorphism** — vary behaviour by type via dispatch, not conditionals.
- **Indirection / Pure Fabrication / Protected Variations** — decouple via intermediaries and stable abstractions.

:::tip
GRASP answers *"where does this method belong?"* (responsibility assignment); SOLID answers *"is this design healthy?"* (principle-level quality). They're complementary — GRASP is often where good design decisions actually start.
:::`,
  },
  {
    id: 'oop-dsn-api-design',
    question: 'What makes a good API?',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['api design', 'effective java', 'usability'],
    answer: `The single best heuristic (Bloch): **make it easy to use correctly and hard to use incorrectly.** Practically:

1. **Minimal and focused** — when in doubt, leave it out. You can add later; you can't remove without breaking callers.
2. **Clear, consistent names** and predictable behaviour.
3. **Fail fast** — validate arguments and throw early; return \`Optional\`, not \`null\`.
4. **Make illegal states unrepresentable** — encode constraints in *types*, not just docs.
5. **Don't leak implementation** — return interfaces, hide concrete types, keep the surface small.

\`\`\`java
Duration.ofSeconds(30);   // named, hard to misuse — vs a bare 'new Duration(30, SECONDS)'
\`\`\`

:::senior
A small surface is a feature: less to learn, less to misuse, less to maintain and never able to remove. Design the API for the *caller*, and treat every public method as a permanent promise.
:::`,
  },
  {
    id: 'oop-dsn-leaky-abstraction',
    question: 'What is the Law of Leaky Abstractions?',
    difficulty: 'Hard',
    category: 'OOP Design',
    tags: ['leaky abstraction', 'complexity', 'senior'],
    answer: `Joel Spolsky's law: *"All non-trivial abstractions, to some degree, are **leaky**."* An abstraction hides the complexity beneath it — until an edge case forces those details back through.

Examples:
- An **ORM** hides SQL until an N+1 query or a lock forces you to understand the database.
- **TCP** hides packet loss until latency and retransmits make it visible.
- A **network file path** looks local until the connection drops.

The consequence: abstractions save enormous time, but they don't excuse you from understanding what's underneath. When one leaks, you must drop to the lower layer to debug it.

:::senior
This is why "just use the framework/ORM" bites at scale, and why a strong engineer understands the layer **beneath** the one they work in. Good abstractions aren't leak-free — their leaks are just **rare and well-understood**.
:::`,
  },
];

export default questions;
