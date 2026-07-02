import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'pat-fnd-what-is-a-pattern',
    question: 'What is a design pattern, and what is it *not*?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['fundamentals', 'gof'],
    answer: `A design pattern is a **named, reusable solution to a recurring design problem** — a description of the roles, their relationships, and the trade-offs that you adapt to your context.

It is **not**:
- concrete code you copy and paste,
- a library or framework you import,
- a guarantee of good design if applied blindly.

Its biggest practical benefit is a **shared vocabulary**: "wrap it in an Adapter" or "make it a Strategy" communicates a whole design in two words.`,
  },
  {
    id: 'pat-fnd-gang-of-four',
    question: 'Who are the "Gang of Four" and why do they matter?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['gof', 'history'],
    answer: `The **Gang of Four (GoF)** are Erich Gamma, Richard Helm, Ralph Johnson, and John Vlissides — authors of the 1994 book *Design Patterns: Elements of Reusable Object-Oriented Software*.

They catalogued **23 patterns** and, crucially, established a **standard template** (Intent, Motivation, Participants, Structure, Consequences...) and a shared vocabulary. That catalog is still the canonical reference for OO design patterns.`,
  },
  {
    id: 'pat-fnd-three-categories',
    question: 'Name the three GoF categories and what each is primarily concerned with.',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['categories', 'gof'],
    answer: `| Category | Primary concern | Count |
|--|--|--|
| **Creational** | How objects are **created** | 5 |
| **Structural** | How objects are **composed** | 7 |
| **Behavioral** | How objects **interact** and share responsibility | 11 |

Total = **23**. A quick mnemonic: creational *makes it*, structural *connects it*, behavioral *coordinates it*.`,
  },
  {
    id: 'pat-fnd-category-counts',
    question: 'How many patterns are in each GoF category, and why is behavioral the largest?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['categories', 'gof'],
    answer: `**5 creational, 7 structural, 11 behavioral = 23.**

Behavioral is the biggest bucket because *how objects collaborate and divide responsibility* is the richest and most varied source of recurring design problems — communication, traversal, undo, notification, state transitions, and interchangeable algorithms each get their own pattern (Observer, Iterator, Command, Memento, State, Strategy, and more).`,
  },
  {
    id: 'pat-fnd-encapsulate-what-varies',
    question: 'Explain the principle "encapsulate what varies" and name a pattern that embodies it.',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['principles', 'strategy'],
    answer: `Find the part of the system that **changes**, and isolate it behind a **stable interface** so the rest of the code never changes with it.

Example: a \`PaymentService\` depends only on a \`PaymentMethod\` interface; \`CardPayment\`, \`PayPalPayment\`, and \`CryptoPayment\` implement it. Adding a new method touches **zero** existing code.

That is exactly the shape of **Strategy** — a family of interchangeable algorithms behind one interface. Decorator and State protect the same principle.`,
  },
  {
    id: 'pat-fnd-composition-over-inheritance',
    question: 'Why do so many patterns favor composition over inheritance?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['principles', 'composition'],
    answer: `Inheritance binds behavior at **compile time** and explodes into subclass combinations (\`FlyingDuck\`, \`RubberDuck\`, \`FlyingRubberDuck\`...). It also creates rigid, fragile hierarchies where a change to a base class ripples everywhere.

**Composition** lets an object *hold* the varying behavior as a field and even **swap it at runtime**, keeping behaviors small and independently testable. This flexibility is the core insight behind Strategy, Decorator, State, and Bridge.

Inheritance still has its place — **Template Method** deliberately uses it to fix an algorithm's skeleton while subclasses fill in steps.`,
  },
  {
    id: 'pat-fnd-program-to-interface',
    question: 'What does "program to an interface, not an implementation" mean in practice?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['principles', 'abstraction'],
    answer: `Depend on **abstract types**, not concrete classes. In Java, declare \`List<String> l = new ArrayList<>();\` rather than \`ArrayList<String> l = ...\`.

Benefits:
- **Swappability** — change \`ArrayList\` to \`LinkedList\` without touching callers.
- **Testability** — inject a mock/fake implementation.
- **Decoupling** — callers know only the contract, not the details.

Violating it (referencing concrete classes everywhere) is one of the most common causes of rigid, hard-to-test code.`,
  },
  {
    id: 'pat-fnd-open-closed',
    question: 'State the Open/Closed Principle and how patterns help you follow it.',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['principles', 'solid'],
    answer: `**Open for extension, closed for modification**: you should be able to add new behavior **without editing existing, tested code**.

Patterns achieve this by putting variation behind an abstraction so new behavior arrives as a **new class** rather than an edit to a working one — e.g. a new \`Strategy\`, a new \`Decorator\`, or a new product in a \`Factory\`. This limits regression risk and keeps proven code untouched.`,
  },
  {
    id: 'pat-fnd-uml-arrows',
    question: 'In a UML class diagram, distinguish inheritance, realization, aggregation, and composition arrows.',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['uml', 'notation'],
    answer: `| Arrow | Name | Reads as | Lifetime |
|--|--|--|--|
| \`<|--\` | Inheritance | subclass **extends** superclass (solid line, hollow triangle) | — |
| \`<|..\` | Realization | class **implements** an interface (dashed line, hollow triangle) | — |
| \`o--\` | Aggregation | **has-a**, part can outlive the whole (hollow diamond) | independent |
| \`*--\` | Composition | **owns-a**, part dies with the whole (filled diamond) | shared |

Also worth knowing: \`-->\` association (knows/references) and \`..>\` dependency (uses transiently). The hollow triangle always points at the **more general** type; a solid line means *is-a*, dashed means *implements* or *uses*.`,
  },
  {
    id: 'pat-fnd-over-engineering',
    question: 'When should you NOT use a design pattern? What is "pattern soup"?',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['anti-patterns', 'over-engineering'],
    answer: `Do **not** reach for a pattern when:
- you are guessing about future needs (**YAGNI**) rather than responding to a real, recurring problem,
- a plain function, \`if\`, or single class would do,
- the pattern only makes the code *look* sophisticated without making it easier to change.

**Pattern soup** is the result of over-applying patterns: simple logic buried under needless factories, strategies, and decorators, so the code is harder to read and onboard onto — a classic form of **over-engineering**.

Senior practice: write the direct solution first, then **refactor toward** a pattern when duplication or a genuine axis of change appears. A pattern is a destination, not a starting blueprint.`,
  },
];

export default questions;
