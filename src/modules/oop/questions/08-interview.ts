import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'oop-iq-four-pillars',
    question: 'What are the four pillars of OOP?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['pillars', 'fundamentals'],
    answer: `Remember **A PIE**:

| Pillar | One-liner |
|--------|-----------|
| **Abstraction** | Hide complexity, expose intent — *what*, not *how*. |
| **Polymorphism** | One interface, many forms (overriding + overloading). |
| **Inheritance** | Reuse & extend via an IS-A relationship. |
| **Encapsulation** | Bundle data with its methods; hide fields behind a controlled API. |

:::tip
Encapsulation hides **data**; Abstraction hides **complexity**. Interviewers love probing that difference.
:::`,
  },
  {
    id: 'oop-iq-class-vs-object',
    question: 'What is the difference between a class and an object?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['class', 'object', 'fundamentals'],
    answer: `A **class** is a blueprint / type defined at compile time; an **object** is a concrete instance of that class living in memory at runtime.

\`\`\`java
class Car {}          // the blueprint
Car a = new Car();    // an object
Car b = new Car();    // another, independent object
\`\`\`

One class → many objects, each with its own state but sharing the same behaviour.`,
  },
  {
    id: 'oop-iq-abstraction-vs-encapsulation',
    question: 'Abstraction vs Encapsulation — how do they differ?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['abstraction', 'encapsulation'],
    answer: `They travel together but solve different problems:

| | Abstraction | Encapsulation |
|--|-------------|---------------|
| Hides | complexity / implementation | data / state |
| Question | *what* does it do? | *how* is it protected? |
| Level | design | implementation |
| Via | \`interface\`, \`abstract class\` | access modifiers, getters/setters |

Analogy: the **steering wheel** (abstraction — you steer without knowing the mechanism) vs the **locked engine bay** (encapsulation — internals are sealed off).`,
  },
  {
    id: 'oop-iq-overloading-vs-overriding',
    question: 'Overloading vs Overriding?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['polymorphism', 'overriding', 'overloading'],
    answer: `| | Overloading | Overriding |
|--|-------------|------------|
| Binding | compile-time (static) | runtime (dynamic) |
| Where | same class | subclass |
| Signature | different params | identical |
| Resolved by | declared arg types | actual object type |

\`\`\`java
int add(int a, int b);            // overload
double add(double a, double b);   // overload

class Dog extends Animal {
    @Override String speak() { return "Woof"; }  // override
}
\`\`\`

Overriding drives polymorphism; overloading is just a compile-time convenience.`,
  },
  {
    id: 'oop-iq-interface-vs-abstract',
    question: 'When would you choose an interface over an abstract class?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['interface', 'abstract-class'],
    answer: `Default to an **interface**; use an **abstract class** only when you must share state or constructor logic.

| | Interface | Abstract class |
|--|-----------|----------------|
| Multiple inheritance | yes (many) | no (one) |
| Instance state | no (only \`static final\`) | yes |
| Constructors | no | yes |
| Models | a **capability** (Comparable) | a **type** (Animal) |

:::senior
Java 8 \`default\` methods let interfaces ship behaviour, so the practical rule is: reach for an interface first (keeps you open to multiple + composition); pick an abstract class when subclasses need shared **fields**.
:::`,
  },
  {
    id: 'oop-iq-composition-over-inheritance',
    question: 'Why "favor composition over inheritance"?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['composition', 'inheritance', 'design'],
    answer: `Inheritance (IS-A) couples a subclass tightly to a parent's implementation — the *fragile base class* problem — and is fixed at compile time. Composition (HAS-A) delegates to a member through its public API, so behaviour is **loosely coupled and swappable at runtime**.

\`\`\`java
// composition: swap the strategy without touching Car
class Car {
    private Engine engine;             // HAS-A
    Car(Engine e) { this.engine = e; }
}
\`\`\`

Use inheritance only for a genuine IS-A that respects Liskov substitution; otherwise compose.`,
  },
  {
    id: 'oop-iq-override-static-private',
    question: 'Can you override a static, private, or final method?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['overriding', 'static', 'gotcha'],
    answer: `No to all three, for different reasons:

- **static** — belongs to the class, not the instance. A same-signature method *hides* it; the version chosen depends on the **reference type** at compile time (no dynamic dispatch).
- **private** — not visible to the subclass, so a same-named method there is simply a **new, unrelated** method.
- **final** — explicitly declared non-overridable; the compiler rejects any attempt.

:::gotcha
Only \`public\`/\`protected\` **instance** methods are truly polymorphic.
:::`,
  },
  {
    id: 'oop-iq-field-hiding',
    question: 'With `Animal a = new Dog();`, why does `a.field` use Animal but `a.method()` use Dog?',
    difficulty: 'Hard',
    category: 'Interview Prep',
    tags: ['field-hiding', 'polymorphism', 'gotcha'],
    answer: `Because **fields are not polymorphic**. The master rule:

> Instance **methods** dispatch on the **runtime object**; **fields** and **statics** bind to the **compile-time type**.

\`\`\`java
Animal a = new Dog();
a.name;    // Animal's field  — resolved on declared type
a.who();   // Dog's method    — dispatched on real object
\`\`\`

Subclass fields *hide* superclass fields; they never override them. Never read a subclass field through a superclass reference.`,
  },
  {
    id: 'oop-iq-constructor-order',
    question: 'In what order do constructors run in an inheritance chain?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['constructor', 'inheritance'],
    answer: `**Top-down: parent before child.** An implicit \`super()\` is the first statement of every constructor, so control climbs to the root, then unwinds:

\`\`\`
new Derived()
  → super() → Base fields init → Base body
  → Derived fields init → Derived body
\`\`\`

So \`new Derived()\` prints \`Base ctor\` then \`Derived ctor\`.

:::gotcha
Never call an **overridable** method from a constructor — the override runs against a half-built object whose subclass fields are still at their defaults (\`0\`/\`null\`).
:::`,
  },
  {
    id: 'oop-iq-equals-hashcode',
    question: 'Why must you override equals() and hashCode() together?',
    difficulty: 'Hard',
    category: 'Interview Prep',
    tags: ['equals', 'hashcode', 'collections'],
    answer: `The contract: **if \`a.equals(b)\` then \`a.hashCode() == b.hashCode()\`** (the reverse need not hold).

Override \`equals\` alone and hash-based collections break: two "equal" objects get identity-based hash codes, land in different buckets, and \`HashSet.contains\`/\`HashMap.get\` never even calls \`equals\` → silent misses.

\`\`\`java
record Point(int x, int y) {}  // record generates a correct equals + hashCode
\`\`\`

:::tip
Modern fix: use a \`record\`, or generate both with your IDE / \`Objects.hash(...)\`.
:::`,
  },
  {
    id: 'oop-iq-lld-framework',
    question: 'How do you approach a "design a parking lot" low-level design question?',
    difficulty: 'Hard',
    category: 'Interview Prep',
    tags: ['lld', 'design', 'framework'],
    answer: `Follow a repeatable five-step framework and think out loud:

1. **Requirements** — clarify scope, scale, vehicle types, pricing; state assumptions & what's out of scope.
2. **Nouns → classes, verbs → methods** — \`ParkingLot\`, \`Floor\`, \`Spot\`, \`Vehicle\`, \`Ticket\`; \`park()\`, \`calculateFee()\`.
3. **Relationships** — IS-A vs HAS-A with multiplicity (\`ParkingLot\` HAS-A many \`Floor\`; \`Car\` IS-A \`Vehicle\`).
4. **Patterns** — name the force: Singleton (one lot), Factory (build vehicles), Strategy (pricing).
5. **SOLID check** — especially OCP: "add a new vehicle type without editing existing classes".

:::senior
The strongest signal is designing for **Open/Closed** and defending one explicit trade-off.
:::`,
  },
  {
    id: 'oop-iq-patterns-must-know',
    question: 'Which design patterns come up most in OOP interviews, and what do they solve?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['patterns', 'gof', 'design'],
    answer: `| Pattern | Type | Solves | JDK example |
|---------|------|--------|-------------|
| Singleton | creational | one shared instance | \`Runtime.getRuntime()\` |
| Factory | creational | hide \`new\`, pick subtype | \`Calendar.getInstance()\` |
| Builder | creational | many optional params | \`StringBuilder\` |
| Adapter | structural | make APIs fit | \`Arrays.asList()\` |
| Decorator | structural | add behaviour by wrapping | \`BufferedReader\` |
| Strategy | behavioral | swap algorithm at runtime | \`Comparator\` |
| Observer | behavioral | notify dependents | listeners |

Name the **force** before naming the pattern — that's what earns points.`,
  },
  {
    id: 'oop-iq-solid',
    question: 'Explain SOLID in one line each.',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['solid', 'principles'],
    answer: `- **S**ingle Responsibility — one class, one reason to change.
- **O**pen/Closed — open for extension, closed for modification.
- **L**iskov Substitution — a subtype must be usable wherever its base type is expected.
- **I**nterface Segregation — many small, focused interfaces beat one fat one.
- **D**ependency Inversion — depend on abstractions, not concrete classes.

Together they keep code loosely coupled, extensible, and testable.`,
  },
  {
    id: 'oop-iq-uml-relationships',
    question: 'What do the UML arrows for aggregation, composition, and inheritance mean?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['uml', 'relationships', 'design'],
    answer: `| Arrow | Meaning | Reads as |
|-------|---------|----------|
| \`<|--\` solid triangle | inheritance | IS-A (extends) |
| \`<|..\` dashed triangle | realization | implements |
| \`*--\` filled diamond | composition | OWNS-A (part dies with whole) |
| \`o--\` hollow diamond | aggregation | HAS-A (shared, independent lifecycle) |
| \`-->\` | association | uses / refers to |
| \`..>\` | dependency | depends on (param/local) |

Key distinction: **composition** (filled) = strong ownership; **aggregation** (hollow) = shared reference.`,
  },
  {
    id: 'oop-iq-multiple-inheritance',
    question: 'Does Java support multiple inheritance? How is the diamond problem handled?',
    difficulty: 'Hard',
    category: 'Interview Prep',
    tags: ['inheritance', 'interface', 'diamond'],
    answer: `Java forbids multiple inheritance of **classes** (to avoid ambiguous inherited state/implementation — the *diamond problem*) but allows a class to implement **many interfaces**.

With Java 8 \`default\` methods, two interfaces can supply the same default — Java resolves this with explicit rules:

\`\`\`java
interface A { default String hi() { return "A"; } }
interface B { default String hi() { return "B"; } }
class C implements A, B {
    // MUST override to resolve the conflict
    @Override public String hi() { return A.super.hi(); }
}
\`\`\`

The compiler forces you to disambiguate with \`Interface.super.method()\`.`,
  },
];

export default questions;
