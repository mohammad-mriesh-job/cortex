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
];

export default questions;
