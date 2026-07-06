import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'oop-solid-acronym',
    question: 'What does SOLID stand for, in one line each?',
    difficulty: 'Easy',
    category: 'SOLID',
    tags: ['solid', 'overview'],
    answer: `Five object-oriented design principles popularised by Robert C. Martin:

| | Principle | Rule |
|--|--|--|
| **S** | Single Responsibility | A class should have one reason to change. |
| **O** | Open/Closed | Open for extension, closed for modification. |
| **L** | Liskov Substitution | Subtypes must be substitutable for their base type. |
| **I** | Interface Segregation | No client should depend on methods it doesn't use. |
| **D** | Dependency Inversion | Depend on abstractions, not concretions. |

:::tip
Their shared goal is **low coupling + high cohesion** → code that's testable and cheap to change.
:::`,
  },
  {
    id: 'oop-solid-srp-reason-to-change',
    question: 'What exactly is a "reason to change" in the Single Responsibility Principle?',
    difficulty: 'Medium',
    category: 'SOLID',
    tags: ['solid', 'srp'],
    answer: `A reason to change is an **actor** — a person or stakeholder who can request a modification.

Martin's definition: *"A class should have only one reason to change,"* i.e. it should be responsible to **one actor**. If payroll rules, the database schema, and the report layout can each force edits to the same class, it serves three actors and violates SRP.

\`\`\`java
// Violation: three actors in one class
class Employee {
    Money calculatePay() { ... } // accounting
    void save()          { ... } // DBA
    String exportReport(){ ... } // marketing
}
\`\`\`

Fix: split into \`PayCalculator\`, \`EmployeeRepository\`, \`ReportExporter\`.

:::gotcha
SRP is **not** "one method per class." Over-splitting is its own smell. Group by shared reason to change (cohesion).
:::`,
  },
  {
    id: 'oop-solid-ocp-how',
    question: 'How do you make a class Open/Closed, and what smell signals a violation?',
    difficulty: 'Medium',
    category: 'SOLID',
    tags: ['solid', 'ocp', 'strategy'],
    answer: `**Open for extension, closed for modification**: add new behaviour by adding new code, not editing tested code.

The classic violation smell is a \`switch\`/\`instanceof\` on a type flag that grows with every new type:

\`\`\`java
// Violation — edit this for every new shape
double area(Shape s) {
    switch (s.type) {
        case CIRCLE: return Math.PI * s.r * s.r;
        case SQUARE: return s.side * s.side;
        // add another case... re-test everything
    }
}
\`\`\`

Fix with polymorphism / the **Strategy** pattern:

\`\`\`java
interface Shape { double area(); }
record Circle(double r) implements Shape { public double area(){ return Math.PI*r*r; } }
record Square(double s) implements Shape { public double area(){ return s*s; } }
// new shape = new class; the calculator never changes
\`\`\`

:::senior
"Closed" is never absolute. Abstract on the axis that has actually changed — speculative OCP everywhere is over-engineering (YAGNI).
:::`,
  },
  {
    id: 'oop-solid-lsp-rectangle-square',
    question: 'Explain the Rectangle/Square problem and why it violates LSP.',
    difficulty: 'Hard',
    category: 'SOLID',
    tags: ['solid', 'lsp', 'inheritance'],
    answer: `Mathematically a square *is* a rectangle, so \`Square extends Rectangle\` looks right. But a \`Rectangle\`'s contract is that width and height vary **independently**. \`Square\` must override the setters to keep them equal — breaking that invariant.

\`\`\`java
void resizeAndCheck(Rectangle r) {
    r.setWidth(5);
    r.setHeight(4);
    assert r.area() == 20;   // holds for Rectangle
}
resizeAndCheck(new Square()); // setWidth(5) sets both to 5,
                              // setHeight(4) sets both to 4 → area 16, assert FAILS
\`\`\`

The \`Square\` is **not substitutable** for the \`Rectangle\` its caller expects → LSP violation.

**Fix:** don't inherit. Model \`Rectangle\` and \`Square\` as immutable siblings implementing a common \`Shape { int area(); }\`.

:::key
LSP is a **behavioural** contract, not syntactic — it compiles fine. A subtype may weaken preconditions and strengthen postconditions, but never the reverse, and must preserve invariants.
:::`,
  },
  {
    id: 'oop-solid-lsp-override-throw',
    question: 'A subclass overrides a method just to throw UnsupportedOperationException. What is wrong?',
    difficulty: 'Medium',
    category: 'SOLID',
    tags: ['solid', 'lsp', 'isp'],
    answer: `It's a strong smell of an **LSP** violation (and often **ISP** too). Callers of the base type expect the method to work; a subtype that throws instead is not substitutable.

\`\`\`java
class ImmutableList<T> extends ArrayList<T> {
    @Override public boolean add(T t) {
        throw new UnsupportedOperationException(); // breaks List's contract
    }
}
\`\`\`

Rule of thumb: **if you override a method only to throw or no-op it, the inheritance is wrong.** Prefer composition, or segregate the interface so the type never advertises a capability it can't honour.`,
  },
  {
    id: 'oop-solid-isp-symptom',
    question: 'What is the tell-tale symptom of an Interface Segregation violation, and how do you fix it?',
    difficulty: 'Medium',
    category: 'SOLID',
    tags: ['solid', 'isp', 'interfaces'],
    answer: `**Symptom:** an implementer is forced to provide methods it doesn't need — either leaving them empty or throwing \`UnsupportedOperationException\`.

\`\`\`java
interface Worker { void work(); void eat(); }

class RobotWorker implements Worker {
    public void work() { ... }
    public void eat()  { throw new UnsupportedOperationException(); } // smell
}
\`\`\`

**Fix:** split the fat interface into small, cohesive **role** interfaces; each class implements only what it can honour.

\`\`\`java
interface Workable { void work(); }
interface Eatable  { void eat();  }

class HumanWorker implements Workable, Eatable { ... }
class RobotWorker implements Workable { ... }  // no eat()
\`\`\`

:::note
ISP is essentially **SRP applied to interfaces** — one cohesive role per interface.
:::`,
  },
  {
    id: 'oop-solid-dip-explained',
    question: 'What does Dependency Inversion invert, and what problem does it solve?',
    difficulty: 'Hard',
    category: 'SOLID',
    tags: ['solid', 'dip', 'decoupling'],
    answer: `It inverts the **direction of the source-code dependency**. Instead of a high-level module depending on a low-level detail, **both depend on an abstraction**.

\`\`\`java
// Violation: high-level policy glued to a concrete detail
class NotificationService {
    private final EmailSender sender = new EmailSender(); // hard-wired
}

// DIP: depend on an interface, receive the implementation
interface MessageSender { void send(String msg); }
class NotificationService {
    private final MessageSender sender;
    NotificationService(MessageSender sender) { this.sender = sender; }
}
\`\`\`

**Problem solved:** the high-level class is now decoupled from any specific sender — you can swap Email for SMS, and inject a mock in tests, without editing it.

:::senior
Ideally the **abstraction is owned by the high-level module**; the low-level detail implements it. That's what truly inverts control (Clean Architecture: dependencies point inward toward stable policy).
:::`,
  },
  {
    id: 'oop-solid-dip-vs-di',
    question: 'What is the difference between Dependency Inversion and Dependency Injection?',
    difficulty: 'Medium',
    category: 'SOLID',
    tags: ['solid', 'dip', 'dependency-injection'],
    answer: `They're related but distinct:

- **Dependency Inversion (DIP)** — a *design principle*: depend on abstractions, not concretions.
- **Dependency Injection (DI)** — a *technique* that fulfils DIP by **supplying** a class's collaborators from the outside (constructor, setter, or a DI container) instead of the class \`new\`-ing them itself.

\`\`\`java
// Constructor injection — plain Java, no framework
var svc = new NotificationService(new EmailSender());
// test double
var test = new NotificationService(msg -> captured.add(msg));
\`\`\`

:::gotcha
DIP does **not** require Spring or any framework — a \`new\` in \`main()\` (the composition root) with an interface field is enough. The framework is optional convenience.
:::`,
  },
  {
    id: 'oop-solid-god-class',
    question: 'What is a "god class" and which SOLID principle addresses it?',
    difficulty: 'Easy',
    category: 'SOLID',
    tags: ['solid', 'srp', 'code-smells'],
    answer: `A **god class** (a.k.a. "the blob") is a class that knows or does too much — persistence, business rules, formatting, validation, all in one place. Multiple unrelated actors force changes to it, so edits constantly risk breaking unrelated features.

It's the flagship violation of the **Single Responsibility Principle**. The cure is to split it along its reasons to change into small, cohesive classes.

:::tip
Its mirror-image smell is **Shotgun Surgery** — one logical change forcing edits across many classes. Both mean responsibilities live in the wrong place.
:::`,
  },
  {
    id: 'oop-solid-over-engineering',
    question: 'Can you over-apply SOLID? Give examples of when SOLID becomes harmful.',
    difficulty: 'Hard',
    category: 'SOLID',
    tags: ['solid', 'yagni', 'over-engineering'],
    answer: `Yes — dogmatic SOLID produces **needless complexity** and **speculative generality**:

- A single-implementation interface that exists "just in case" and never gains a second impl or a test seam.
- Factories wrapping factories; one-method classes fragmenting a simple flow.
- Abstractions on axes that have **never** changed, added preemptively (violating **YAGNI**).

Each abstraction costs indirection, more files, and harder navigation. Apply OCP/DIP seams on the axis that has *actually* changed once or twice — not every imagined future.

:::senior
SOLID is a **means to an end**: low coupling, high cohesion, testability, cheap change. If a "violation" causes no pain and no realistic change is coming, refactoring it may be the wrong call.
:::`,
  },
  {
    id: 'oop-solid-composition-over-inheritance',
    question: 'How does "favour composition over inheritance" relate to SOLID?',
    difficulty: 'Medium',
    category: 'SOLID',
    tags: ['solid', 'lsp', 'composition'],
    answer: `Inheritance is the source of many SOLID violations, so composition is often the cleaner path:

- **LSP:** deep inheritance trees make substitutability hard to guarantee (Rectangle/Square). Composition sidesteps the problem — no base contract to break.
- **OCP/DIP:** injecting a collaborator behind an interface (composition) is more flexible than subclassing to add behaviour.
- **ISP:** small role interfaces implemented by composed helpers beat a fat base class.

\`\`\`java
// Instead of extending to change behaviour, compose a strategy:
class Duck {
    private final FlyBehavior fly;   // injected, swappable
    Duck(FlyBehavior fly) { this.fly = fly; }
    void performFly() { fly.fly(); }
}
\`\`\`

:::key
Inheritance couples subclass to superclass internals; composition couples only to a small interface. Reach for inheritance only when there's a genuine, stable **is-substitutable-for** relationship.
:::`,
  },
  {
    id: 'oop-solid-why-bother',
    question: 'Why bother with SOLID — what do you actually get?',
    difficulty: 'Easy',
    category: 'SOLID',
    tags: ['solid', 'motivation', 'maintainability'],
    answer: `SOLID isn't aesthetics — it targets the two properties that make a large codebase cheap to change: **low coupling** and **high cohesion**. Concretely you get:

1. **Local change** — a modification touches one class, not twenty.
2. **Extension without edits** — new features add code instead of editing (and re-testing) working code (OCP).
3. **Testability** — abstractions let you inject mocks/fakes (DIP).
4. **Parallel work** — teams build behind stable interfaces.
5. **Fewer regressions** — isolated responsibilities mean isolated blast radius.

The cost is more types and indirection, so apply the principles where change actually happens.

:::key
SOLID is a toolkit for *managing change*. If a piece of code is simple and never changes, the principles buy you little — don't apply them for their own sake.
:::`,
  },
  {
    id: 'oop-solid-which-principle-scenario',
    question: 'Every new payment type forces you to edit a big switch in the checkout. Which SOLID principle is violated, and what is the fix?',
    difficulty: 'Easy',
    category: 'SOLID',
    tags: ['solid', 'ocp', 'scenario'],
    answer: `This violates the **Open/Closed Principle**: the checkout is *not closed to modification* — every new payment type means editing and re-testing existing code, risking regressions.

**Fix:** program to an abstraction and add a class per type (polymorphism / Strategy):

\`\`\`java
interface PaymentMethod { void pay(long cents); }
class CardPayment   implements PaymentMethod { ... }
class WalletPayment implements PaymentMethod { ... }   // new type = new class, checkout untouched
\`\`\`

The checkout depends only on \`PaymentMethod\` and never changes when you add a type.

:::tip
This also leans on **DIP** — the checkout depends on the interface, not concrete payment classes. OCP and DIP usually show up together.
:::`,
  },
  {
    id: 'oop-solid-lsp-contract-rules',
    question: 'What exact contract rules must a subtype obey under the Liskov Substitution Principle?',
    difficulty: 'Hard',
    category: 'SOLID',
    tags: ['solid', 'lsp', 'contracts'],
    answer: `LSP is a **behavioural** contract — it compiles fine and only breaks at runtime. A substitutable subtype must:

| Rule | A subtype may… |
|--|--|
| **Preconditions** | require **no more** than the base (may weaken, never *strengthen*) |
| **Postconditions** | guarantee **at least** as much (may strengthen, never *weaken*) |
| **Invariants** | preserve every one the base maintains |
| **History constraint** | not permit state changes the base forbids (no mutable subtype of an immutable base) |
| **Exceptions** | throw **no new** checked types the base didn't declare |

The mnemonic: **"demand no more, promise no less."** Arguments behave contravariantly (accept at least as much), results covariantly (deliver at least as much).

\`\`\`java
// Rectangle's invariant: width and height vary independently.
// Square breaks it by forcing width == height → not substitutable.
\`\`\`

:::key
Rectangle/Square violates the **invariant** rule. If a subclass has to strengthen a precondition or break an invariant to work, inheritance is the wrong tool — use composition or sibling types.
:::`,
  },
  {
    id: 'oop-solid-lsp-detection',
    question: 'How do you spot a Liskov Substitution violation in code review?',
    difficulty: 'Medium',
    category: 'SOLID',
    tags: ['solid', 'lsp', 'code-review'],
    answer: `LSP breaks are behavioural, so the compiler won't help — watch for these smells:

- A subclass **overriding a method only to throw** \`UnsupportedOperationException\` or turn it into a no-op.
- Callers doing \`instanceof\` / **downcasts** to special-case certain subtypes — a sign the base type isn't truly substitutable.
- A subtype that **strengthens a precondition** (rejects inputs the base accepts) or **weakens a postcondition** (returns \`null\` where the base never does).
- Overrides that **change documented semantics** (different ordering, side effects, exceptions).
- Tests written against the **base type failing** when handed the subtype.

**Fix:** flatten the hierarchy into siblings under a common abstraction, or replace inheritance with composition.

:::gotcha
"It compiles and the types line up" proves nothing about LSP — substitutability is about *behaviour and contracts*, which only tests and specs catch.
:::`,
  },
  {
    id: 'oop-solid-dip-di-ioc',
    question: 'Distinguish Dependency Inversion, Dependency Injection, and Inversion of Control.',
    difficulty: 'Medium',
    category: 'SOLID',
    tags: ['solid', 'dip', 'dependency-injection', 'ioc'],
    answer: `Three related-but-distinct ideas that people constantly conflate:

| Term | What it is |
|--|--|
| **IoC** (Inversion of Control) | a broad *style*: the framework/runtime controls the flow and calls **your** code ("don't call us, we'll call you") |
| **DIP** (Dependency Inversion) | a *design principle*: high-level modules and low-level details both depend on **abstractions** |
| **DI** (Dependency Injection) | a *technique*: supply a class's collaborators **from outside** (constructor/setter) instead of \`new\`-ing them |

**How they nest:** IoC is the umbrella (Template Method and event callbacks are also IoC). **DI is IoC applied to obtaining dependencies.** DIP is the *goal* that DI is the usual means to.

\`\`\`java
new OrderService(new SqlOrderRepo());   // DI (constructor) achieving DIP — no container needed
\`\`\`

:::gotcha
DI does **not** mean "Spring". Injection is just *passing collaborators in*; a \`new\` in your composition root is dependency injection. The container is optional plumbing.
:::`,
  },
  {
    id: 'oop-solid-dip-layers',
    question: 'In a layered architecture, which way should dependencies point, and how does DIP enable that?',
    difficulty: 'Medium',
    category: 'SOLID',
    tags: ['solid', 'dip', 'clean-architecture'],
    answer: `They should point **inward, toward stable high-level policy** — the domain. Naïvely the domain (high-level) would depend on the database and UI (low-level details), which is the wrong direction: your business rules would change every time the DB does.

**DIP inverts it.** Declare the abstraction in the domain and let infrastructure implement it:

\`\`\`java
// domain layer owns the port
interface OrderRepository { void save(Order o); }

// infrastructure layer implements it (depends INWARD on the domain)
class JpaOrderRepository implements OrderRepository { ... }
\`\`\`

So the *source-code dependency* runs infrastructure → domain, even though the *runtime* call flows domain → database. This is Clean/Hexagonal architecture's **ports and adapters**.

:::senior
"The database is a **detail**." The domain must not import persistence or frameworks; persistence imports the domain. That's what keeps business logic testable and swappable.
:::`,
  },
  {
    id: 'oop-solid-how-they-relate',
    question: 'How do the five SOLID principles reinforce each other?',
    difficulty: 'Medium',
    category: 'SOLID',
    tags: ['solid', 'relationships', 'design'],
    answer: `They aren't independent — they converge on **low coupling + high cohesion**:

- **SRP** sizes the unit: one reason to change → a cohesive class.
- **ISP** applies that same idea to interfaces: small, role-focused contracts, so clients depend on little.
- **LSP** makes abstractions *trustworthy* — subtypes really are substitutable — so polymorphism is safe to rely on.
- **OCP** is the payoff: extend behaviour by adding types, without editing existing code. It *needs* abstractions to be sound (LSP) and small (ISP).
- **DIP** wires it together: depend on those abstractions, not concretions — enabling OCP's plug-in points and testability.

**The chain:** SRP + ISP give cohesive classes and interfaces; LSP makes subtyping sound; together they let OCP + DIP deliver extensible, decoupled code.

:::key
LSP and ISP are what make OCP and DIP actually *work* in practice; SRP is the sizing rule underneath all of them.
:::`,
  },
  {
    id: 'oop-solid-real-world-each',
    question: 'Give a real framework example of each SOLID principle.',
    difficulty: 'Medium',
    category: 'SOLID',
    tags: ['solid', 'spring', 'jdk', 'examples'],
    answer: `Concrete anchors make the principles credible:

| Principle | Real-world example |
|--|--|
| **SRP** | Spring's split of \`@Controller\` (HTTP), \`@Service\` (business logic), \`@Repository\` (persistence) — one reason to change each |
| **OCP** | Implement \`Filter\` / \`HandlerInterceptor\` to add behaviour **without editing** the framework |
| **LSP** | Any \`List\` works where \`List\` is expected; any JDBC driver behind \`Connection\` |
| **ISP** | \`java.nio\` splits into \`ReadableByteChannel\` / \`WritableByteChannel\` instead of one fat \`Channel\` |
| **DIP** | Spring DI: your service depends on a \`Repository\` **interface**, the container injects the impl. SLF4J: code depends on the \`Logger\` facade, a binding supplies Logback |

:::tip
Naming a JDK/Spring example beats reciting the definition — it shows you've *seen* the principle in production code, not just a textbook.
:::`,
  },
  {
    id: 'oop-solid-in-functional',
    question: 'Do the SOLID principles apply in functional programming?',
    difficulty: 'Hard',
    category: 'SOLID',
    tags: ['solid', 'functional', 'senior'],
    answer: `Mostly yes — sometimes trivially, because FP already bakes in the underlying ideas:

- **SRP** — a pure function that does one thing; small, composable functions.
- **OCP** — higher-order functions give extension for free: pass behaviour in rather than editing a \`switch\`. No subclass to modify.
- **LSP** — less central without subtyping; the analogue is honouring a function's **type and contract** (don't strengthen preconditions).
- **ISP** — prefer small, specific function types over god-modules; a function should ask only for the capabilities it uses.
- **DIP** — passing a function as a parameter **is** dependency injection; effects/dependencies are supplied, not hard-wired.

\`\`\`java
// Strategy in OO == a first-class function in FP
list.sort(Comparator.comparingInt(String::length));   // behaviour passed in — DIP + OCP
\`\`\`

:::senior
The senior framing: SOLID is largely the **OO packaging** of deeper principles — composition, abstraction, and honouring contracts — which FP expresses with functions instead of classes. "DI is just passing a function" lands well.
:::`,
  },
  {
    id: 'oop-solid-criticism',
    question: 'How would you critique SOLID at a senior level?',
    difficulty: 'Hard',
    category: 'SOLID',
    tags: ['solid', 'criticism', 'senior'],
    answer: `Strong engineers hold SOLID **loosely**:

- It's a **means, not an end**. The real goals are low coupling, high cohesion, testability, and cheap change — optimising the letters instead of the outcome is cargo-culting.
- **SRP's "reason to change" is vague**; taken literally it fragments code into anemic one-method classes.
- **OCP/DIP everywhere** breeds speculative generality — single-implementation interfaces and indirection that hurt readability (YAGNI).
- **Alternatives exist**: Dan North's *CUPID* (Composable, Unix-y, Predictable, Idiomatic, Domain-based), simple design, DDD, functional purity.
- It's **OO-centric**: several principles restate or dissolve in FP.

:::senior
The mature stance: apply a principle when it relieves **real, observed pain**, not preemptively. Being able to name *when a SOLID "violation" is fine* is a stronger signal than reciting the five.
:::`,
  },
];

export default questions;
