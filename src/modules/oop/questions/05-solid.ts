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
];

export default questions;
