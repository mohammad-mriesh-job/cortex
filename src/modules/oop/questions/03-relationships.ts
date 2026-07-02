import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'oop-rel-aggregation-vs-composition',
    question: 'What is the difference between aggregation and composition?',
    difficulty: 'Medium',
    category: 'Relationships',
    tags: ['aggregation', 'composition', 'has-a'],
    answer: `Both are **"has-a"** relationships; the difference is **ownership and lifecycle**.

| | Aggregation | Composition |
|--|--|--|
| UML | hollow diamond \`o--\` | filled diamond \`*--\` |
| Ownership | shared | **exclusive** |
| Part lifecycle | independent — outlives the whole | **tied to the whole** — dies with it |
| Part shared? | yes | no |

**The decisive question:** *"If I delete the whole, should the part be deleted too?"*
Yes → composition. No → aggregation.

\`\`\`java
// Composition — House owns its Rooms (created inside, die with it)
class House { private final List<Room> rooms = List.of(new Room("Kitchen")); }

// Aggregation — Team shares Players (passed in, outlive the team)
class Team { Team(List<Player> players) { this.players = players; } }
\`\`\`

:::key
Composition = owned + lifecycle-bound. Aggregation = shared + independently-lived. Java has no keyword for this — it's a design intent expressed by *who creates and owns the part*.
:::`,
  },
  {
    id: 'oop-rel-association-vs-dependency',
    question: 'How does an association differ from a dependency in UML?',
    difficulty: 'Medium',
    category: 'Relationships',
    tags: ['association', 'dependency', 'uml'],
    answer: `Both mean "one class uses another," but they differ in **permanence**.

- **Association** (\`-->\`, solid line): a *lasting* structural link — typically a **field**. \`class Driver { Car car; }\`
- **Dependency** (\`..>\`, dashed line): a *transient* link — the other type appears only as a **method parameter, local variable, or return type**. \`double total(PricingService p)\`

Rule of thumb: **solid line = stored reference, dashed line = fleeting use.**`,
  },
  {
    id: 'oop-rel-composition-over-inheritance',
    question: 'What does "favor composition over inheritance" mean, and why?',
    difficulty: 'Medium',
    category: 'Relationships',
    tags: ['composition', 'inheritance', 'design'],
    answer: `Advice from GoF and *Effective Java*: prefer assembling behavior from **has-a** parts over extending a base class.

**Why:**
- Inheritance couples the subclass to the **implementation** of its parent (call order, protected members), causing the **fragile base class problem**.
- Composition depends only on a collaborator's **public API**, so it's robust to internal changes.
- You can **swap the part at runtime** (Strategy, Decorator, DI); single inheritance can't.

**Use inheritance only** for a genuine **is-a** relationship with **Liskov substitutability**. If you just want to reuse code (a "has-a" in disguise), compose.`,
  },
  {
    id: 'oop-rel-fragile-base-class',
    question: 'What is the fragile base class problem? Give a concrete example.',
    difficulty: 'Hard',
    category: 'Relationships',
    tags: ['inheritance', 'fragile-base-class', 'composition'],
    answer: `A subclass silently breaks when the **base class's internal implementation** changes, because it depends on details it can't see.

**Classic example** — a counting list that extends \`ArrayList\`:

\`\`\`java
class CountingList<E> extends ArrayList<E> {
    int count = 0;
    @Override public boolean add(E e) { count++; return super.add(e); }
    @Override public boolean addAll(Collection<? extends E> c) {
        count += c.size();       // +N
        return super.addAll(c);  // super.addAll internally calls add() → +N AGAIN
    }
}
\`\`\`

\`addAll\` double-counts because \`ArrayList.addAll\` happens to call \`add\` internally — an invisible dependency.

**Fix with composition:** wrap a \`List\` and forward through its public API only, so the internal \`add\` calls are invisible and counted once.`,
  },
  {
    id: 'oop-rel-coupling',
    question: 'What is coupling? Contrast tight and loose coupling.',
    difficulty: 'Easy',
    category: 'Relationships',
    tags: ['coupling', 'design'],
    answer: `**Coupling** is the degree of interdependence between classes — how much one must know about another's internals.

| | Tight | Loose |
|--|--|--|
| Depends on | concrete classes | **abstractions/interfaces** |
| Change ripple | wide | contained |
| Testability | hard | easy (mock the interface) |

**Goal: loose coupling.** Depend on a \`Repository\` interface, not a \`MySqlRepo\` class, so implementations can be swapped or mocked. Achieved via interfaces, dependency injection, and programming to abstractions.`,
  },
  {
    id: 'oop-rel-cohesion',
    question: 'What is cohesion, and why do we want it high?',
    difficulty: 'Easy',
    category: 'Relationships',
    tags: ['cohesion', 'srp', 'design'],
    answer: `**Cohesion** measures how focused a class is — whether its members all serve **one responsibility**.

- **High cohesion** (good): the class does one thing well; aligns with the **Single Responsibility Principle**; easy to name, reuse, and test.
- **Low cohesion** (bad): a "god class" / \`Utils\` / \`Manager\` blob doing many unrelated jobs; becomes a change magnet.

Coupling and cohesion move together: **raise cohesion and coupling usually drops**, because a single-purpose class has less reason to reach into others.`,
  },
  {
    id: 'oop-rel-law-of-demeter',
    question: 'What is the Law of Demeter?',
    difficulty: 'Medium',
    category: 'Relationships',
    tags: ['law-of-demeter', 'coupling'],
    answer: `The **Law of Demeter** ("don't talk to strangers") says a method should only call methods on:

1. **itself**,
2. its **parameters**,
3. objects it **creates**, and
4. its **direct fields**.

Chaining deeper couples you to intermediate structure — a **train wreck**:

\`\`\`java
// ❌ violates — knows Customer → Wallet → Money internals
order.getCustomer().getWallet().getMoney().getCents();

// ✅ ask the direct neighbor
order.availableCents();
\`\`\`

Every \`.\` past the first is a new object you've quietly coupled to. It promotes **loose coupling** by hiding the object graph behind delegating methods.`,
  },
  {
    id: 'oop-rel-uml-arrows',
    question: 'Name the UML class-diagram relationship arrows and what each means.',
    difficulty: 'Medium',
    category: 'Relationships',
    tags: ['uml', 'notation', 'relationships'],
    answer: `| Arrow | Relationship | Reads as |
|--|--|--|
| \`<|--\` solid, hollow ▲ | **Inheritance** | is-a (extends) |
| \`<|..\` dashed, hollow ▲ | **Realization** | implements an interface |
| \`*--\` filled ◆ | **Composition** | owns exclusively; part dies with whole |
| \`o--\` hollow ◇ | **Aggregation** | has, shared; part is independent |
| \`-->\` solid arrow | **Association** | has a lasting reference (field) |
| \`..>\` dashed arrow | **Dependency** | transient use (param/local/return) |

Memory aid: **solid = structural / lasting, dashed = transient**; **triangle = type relationship, diamond = whole–part, plain arrowhead = uses.**`,
  },
  {
    id: 'oop-rel-uml-visibility-multiplicity',
    question: 'How are visibility and multiplicity shown in a UML class diagram?',
    difficulty: 'Easy',
    category: 'Relationships',
    tags: ['uml', 'visibility', 'multiplicity'],
    answer: `**Visibility** — a symbol before a member:

| Symbol | Visibility |
|--|--|
| \`+\` | public |
| \`-\` | private |
| \`#\` | protected |
| \`~\` | package |

*Italic* or \`<<abstract>>\` = abstract; **underline** = static.

**Multiplicity** — numbers at each end of a relationship:

| Notation | Means |
|--|--|
| \`1\` | exactly one |
| \`0..1\` | optional |
| \`*\` / \`0..*\` | zero or more |
| \`1..*\` | one or more |

So \`Order "1" --> "1..*" LineItem\` = one order has one or more line items.`,
  },
  {
    id: 'oop-rel-is-a-vs-has-a',
    question: 'How do you decide between an "is-a" and a "has-a" relationship?',
    difficulty: 'Easy',
    category: 'Relationships',
    tags: ['is-a', 'has-a', 'inheritance', 'composition'],
    answer: `Say the relationship out loud:

- **"B is-a A"** and B is fully **substitutable** for A → candidate for **inheritance** (\`B extends A\`). *A \`Dog\` is an \`Animal\`.* ✔
- **"B has-a A"** (B uses or contains A) → **composition/aggregation** (B holds a field of type A). *A \`Car\` has an \`Engine\`.* A \`Car\` is **not** an \`Engine\`. ✘

When unsure, prefer **has-a** — composition is more flexible and avoids the fragile base class problem. Reserve inheritance for true, Liskov-substitutable is-a hierarchies.`,
  },
];

export default questions;
