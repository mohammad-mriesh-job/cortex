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
  {
    id: 'oop-rel-assoc-aggregation-composition-trio',
    question: 'Distinguish association, aggregation, and composition.',
    difficulty: 'Medium',
    category: 'Relationships',
    tags: ['association', 'aggregation', 'composition', 'uml'],
    answer: `They are three points on a scale of **increasing ownership**. Aggregation and composition are both *special kinds of association*.

| | Association | Aggregation | Composition |
|--|--|--|--|
| Meaning | uses / knows | has (shared) | owns exclusively |
| UML | \`-->\` solid line | \`o--\` hollow diamond | \`*--\` filled diamond |
| Ownership | none | weak | strong |
| Part lifetime | independent | outlives the whole | **dies with the whole** |
| Part shared? | — | yes | no |

**Decisive test:** *"Can the part exist on its own, and could it be shared?"* Yes → aggregation. No, it's created and destroyed with the owner → composition.

\`\`\`java
class Team   { Team(List<Player> ps) { this.players = ps; } }   // aggregation: players passed in, shared
class House  { private final Room r = new Room("Kitchen"); }    // composition: room born & dies here
class Driver { void drive(Car c) { c.start(); } }               // plain association: just uses a Car
\`\`\`

:::key
Association is any link between two objects. Aggregation adds "whole–part, shared". Composition adds "whole–part, owned and lifetime-bound". Java has no keyword for the distinction — it lives in *who creates and owns the part*.
:::`,
  },
  {
    id: 'oop-rel-delegation',
    question: 'What is delegation, and how does it differ from inheritance?',
    difficulty: 'Medium',
    category: 'Relationships',
    tags: ['delegation', 'composition', 'inheritance'],
    answer: `**Delegation** is when an object handles a request by **passing it to a helper object** (a field) instead of implementing it itself. It is the runtime mechanism behind composition.

\`\`\`java
class Stack<E> {
  private final List<E> list = new ArrayList<>();   // the delegate
  void push(E e) { list.add(e); }                   // forward
  E pop()        { return list.remove(list.size() - 1); }
}
\`\`\`

| | Inheritance | Delegation |
|--|--|--|
| Reuse via | \`extends\` | a field |
| Bound | compile time | runtime (swappable) |
| Sees | parent's \`protected\` internals | only the helper's public API |
| Takes | the *whole* parent | exactly what you forward |

Inheritance reuses everything and couples you to the parent's implementation; delegation reuses selectively and couples you only to a small contract.

:::senior
Most GoF patterns — Strategy, State, Decorator, Proxy — are just **structured delegation**: hold a collaborator behind an interface and forward to it.
:::`,
  },
  {
    id: 'oop-rel-realization-vs-generalization',
    question: 'In UML, what is the difference between generalization and realization?',
    difficulty: 'Easy',
    category: 'Relationships',
    tags: ['uml', 'generalization', 'realization'],
    answer: `Both point an arrow at a *more abstract* type with a hollow triangle head — the **line style** is what differs.

| | Generalization | Realization |
|--|--|--|
| Means | class inheritance (**is-a**) | implementing an interface (**can-do**) |
| Java | \`extends\` | \`implements\` |
| UML | \`<|--\` solid line, hollow ▲ | \`<|..\` dashed line, hollow ▲ |
| Example | \`Dog\` → \`Animal\` | \`ArrayList\` → \`List\` |

\`\`\`java
class Dog extends Animal { }               // generalization: Dog generalises to Animal
class ArrayList<E> implements List<E> { }  // realization: ArrayList realises the List contract
\`\`\`

Memory aid: **solid triangle = extends a class, dashed triangle = implements an interface.**`,
  },
  {
    id: 'oop-rel-when-inheritance-right',
    question: 'Composition is usually preferred — so when is inheritance actually the right choice?',
    difficulty: 'Medium',
    category: 'Relationships',
    tags: ['inheritance', 'composition', 'design'],
    answer: `Reach for inheritance only when **all** of these hold:

1. A genuine **is-a** relationship that satisfies **Liskov substitution** — the subtype works anywhere the base type is expected.
2. The base contract is **stable** and unlikely to churn.
3. You want **polymorphism** through the base type (callers hold \`Shape\`, run \`area()\`).
4. You're extending a class **designed and documented for extension** — ideally one you own.

Good fits: framework hooks (\`extends HttpServlet\`, \`AbstractList\`), Template Method skeletons, and \`sealed\` hierarchies modelling a closed set of variants.

Bad fits: extending a class **just to reuse its code** (a has-a in disguise), or subclassing a concrete class you don't control.

:::gotcha
"I want to reuse that code" is *never*, by itself, a reason to inherit — that's what composition and delegation are for. Inherit for **substitutability**, not reuse.
:::`,
  },
  {
    id: 'oop-rel-bidirectional-association',
    question: 'What is the difference between a unidirectional and a bidirectional association, and what is the danger of bidirectional?',
    difficulty: 'Medium',
    category: 'Relationships',
    tags: ['association', 'bidirectional', 'consistency'],
    answer: `- **Unidirectional** — only one side holds a reference: \`Order\` knows its \`Customer\`, but \`Customer\` doesn't list orders. Navigation flows one way.
- **Bidirectional** — both sides reference each other: \`Order ↔ Customer\`. Convenient to navigate either way, but you must keep the two ends **consistent**.

\`\`\`java
class Customer {
  private final List<Order> orders = new ArrayList<>();
  void addOrder(Order o) { orders.add(o); o.setCustomer(this); } // update BOTH ends
}
\`\`\`

The danger of bidirectional links: every mutation must sync both sides or you get a **dangling/asymmetric** reference (an order whose customer doesn't list it). They also add coupling and create **cycles** that complicate \`equals\`, \`hashCode\`, and serialization.

:::tip
Prefer **unidirectional** unless you genuinely navigate both ways. When you do go bidirectional, funnel all changes through one helper method so the two ends can never drift apart.
:::`,
  },
  {
    id: 'oop-rel-self-association',
    question: 'What is a self-association (reflexive association)? Give an example.',
    difficulty: 'Easy',
    category: 'Relationships',
    tags: ['association', 'reflexive', 'tree'],
    answer: `A **self-association** (reflexive association) is a class linked **to itself** — instances hold references to other instances of the same class.

\`\`\`java
class Employee {
  private Employee manager;         // a manager is also an Employee
  private final List<Employee> reports = new ArrayList<>();
}
\`\`\`

Everyday examples: an \`Employee\` reports to a manager \`Employee\`; a \`TreeNode\` holds child \`TreeNode\`s; a \`Category\` has a parent \`Category\`; a graph \`Node\` links to neighbouring \`Node\`s.

**Role names** on each end disambiguate the two directions — \`manager\` vs \`reports\` — since both refer to the same type. Self-associations are how you model org charts, category trees, comment threads, and linked structures.`,
  },
  {
    id: 'oop-rel-implement-composition',
    question: 'How do you implement a has-a relationship in Java code?',
    difficulty: 'Easy',
    category: 'Relationships',
    tags: ['composition', 'aggregation', 'delegation'],
    answer: `Hold the part as a **field** and **delegate** to it. Whether it's composition or aggregation depends on *where the part comes from*:

\`\`\`java
// Composition — Car OWNS its Engine: created inside, dies with the Car
class Car {
  private final Engine engine = new Engine();
  void start() { engine.ignite(); }        // delegate to the part
}

// Aggregation — Playlist SHARES Songs: passed in, outlive the playlist
class Playlist {
  private final List<Song> songs;
  Playlist(List<Song> songs) { this.songs = songs; }
}
\`\`\`

Rule of thumb: **create the part internally → composition; accept it from outside → aggregation.** Either way, the whole exposes behaviour by forwarding calls to the part (delegation) rather than inheriting from it.`,
  },
  {
    id: 'oop-rel-inheritance-breaks-encapsulation',
    question: 'Why is it said that "inheritance breaks encapsulation"?',
    difficulty: 'Hard',
    category: 'Relationships',
    tags: ['inheritance', 'encapsulation', 'fragile-base-class'],
    answer: `Because a subclass is a **privileged client** that depends on details the public API hides: \`protected\` members, class invariants, and the **self-use pattern** (which methods internally call which). *Effective Java* Item 19 frames it this way.

The test of encapsulation is *"can I change my internals without breaking clients?"* With a subclass in play, the answer becomes **no** — changing how the superclass calls its own methods can silently break subclasses:

\`\`\`java
class InstrumentedSet<E> extends HashSet<E> {
  int added;
  @Override public boolean add(E e)                 { added++; return super.add(e); }
  @Override public boolean addAll(Collection<? extends E> c) {
    added += c.size(); return super.addAll(c);      // HashSet.addAll calls add() → double count
  }
}
\`\`\`

The subclass broke because it depended on an **invisible implementation detail** of the parent.

:::senior
The fix is composition + forwarding — a wrapper depends only on the **public** API, so the base class stays free to change. Only extend classes **designed and documented for inheritance**.
:::`,
  },
  {
    id: 'oop-rel-coupling-types',
    question: 'What are the different types of coupling, from worst to best?',
    difficulty: 'Hard',
    category: 'Relationships',
    tags: ['coupling', 'taxonomy', 'design'],
    answer: `The classic Constantine/Yourdon taxonomy, **worst → best**:

| Coupling | One module… |
|--|--|
| **Content** | reaches into another's internals / private state (worst) |
| **Common** | shares global mutable state |
| **Control** | passes a flag telling the other *what to do* |
| **Stamp** | passes a whole record when only a field is needed |
| **Data** | passes just the primitive data required (good) |
| **Message** | interacts only through interfaces / messages (best) |

Each step down shrinks how much one module must *know* about another, so changes stop rippling.

\`\`\`java
render(report, true);          // control coupling — the boolean steers behaviour
render(report.title());        // data coupling — pass only what's needed
\`\`\`

:::tip
"Tight vs loose coupling" is just the coarse version of this ladder. The senior move is to name the *specific* kind — "that's control coupling; split it into two methods."
:::`,
  },
  {
    id: 'oop-rel-inheritance-vs-composition-table',
    question: 'Inheritance vs composition — give me the quick comparison.',
    difficulty: 'Easy',
    category: 'Relationships',
    tags: ['inheritance', 'composition', 'comparison'],
    answer: `| | Inheritance (**is-a**) | Composition (**has-a**) |
|--|--|--|
| Reuse via | \`extends\` a class | holding a field |
| Binding | fixed at compile time | swappable at runtime |
| Coupling | to the parent's internals | to a small interface |
| Count | one superclass | many parts |
| Flexibility | rigid | flexible (Strategy, Decorator, DI) |
| Breaks if | parent changes internals | — (public API only) |

**Default to composition.** Use inheritance only for a true, Liskov-substitutable **is-a** where you want polymorphism through the base type.

:::key
Composition answers "what does this object *have* / *use*"; inheritance answers "what *is* this object". If you're inheriting only to reuse code, you picked the wrong tool.
:::`,
  },
  {
    id: 'oop-rel-cohesion-types',
    question: 'What are the types of cohesion, from weakest to strongest?',
    difficulty: 'Hard',
    category: 'Relationships',
    tags: ['cohesion', 'taxonomy', 'srp'],
    answer: `Cohesion measures how well a module's parts belong together. The classic scale, **weakest → strongest**:

| Cohesion | Members are grouped because… |
|--|--|
| **Coincidental** | no real reason — a \`Utils\` dumping ground (worst) |
| **Logical** | same broad category, selected by a flag |
| **Temporal** | they run at the same time (e.g. \`init()\`) |
| **Procedural** | they're steps in a fixed sequence |
| **Communicational** | they act on the same data |
| **Sequential** | one's output feeds the next |
| **Functional** | they all serve **one** well-defined task (best) |

Aim for **functional cohesion** — a class that does exactly one thing.

:::key
High (functional) cohesion is the **Single Responsibility Principle** viewed as a metric. It usually *lowers* coupling too: a single-purpose class has fewer reasons to reach into others.
:::`,
  },
  {
    id: 'oop-rel-many-to-many',
    question: 'How do you model a many-to-many association in code?',
    difficulty: 'Medium',
    category: 'Relationships',
    tags: ['association', 'many-to-many', 'modeling'],
    answer: `Two options, depending on whether the relationship itself carries data.

**Plain many-to-many** — each side holds a collection of the other:

\`\`\`java
class Student { List<Course>  courses  = new ArrayList<>(); }
class Course  { List<Student> students = new ArrayList<>(); }
\`\`\`

(This is bidirectional, so keep both ends in sync.)

**Association with attributes** — when the link has its own data (grade, enrolment date), **reify** it into its own class:

\`\`\`java
class Enrollment {          // the association becomes an object
  final Student student;
  final Course  course;
  int grade;
  LocalDate enrolledOn;
}
\`\`\`

Now \`Student\` and \`Course\` each hold \`List<Enrollment>\`. This mirrors a database **join table**.

:::tip
The moment the relationship needs its own fields or behaviour, promote it from a pair of collections to a first-class **association class**.
:::`,
  },
];

export default questions;
