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
  {
    id: 'oop-iq-java-not-pure-oop',
    question: 'Is Java a pure object-oriented language? Why or why not?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['fundamentals', 'primitives', 'gotcha'],
    answer: `**No** — Java is not 100% object-oriented, mainly because of **primitives**. \`int\`, \`double\`, \`boolean\`, and \`char\` are **not objects**: they hold values directly, aren't instances of \`Object\`, and (as locals) live on the stack.

A *pure* OO language like Smalltalk or Ruby treats **everything** as an object. Java also has \`static\` members and operators that aren't message sends.

Autoboxing (\`int\` ↔ \`Integer\`) bridges the gap, but the primitives themselves stay non-objects for **performance**.

:::note
This is exactly why you can't write \`5.toString()\`, and why an \`int\` must be **boxed** to go into a \`List<Integer>\`. Java chose the primitive escape hatch to avoid the cost of wrapping every number.
:::`,
  },
  {
    id: 'oop-iq-interface-state-trap',
    question: 'Can an interface have variables or state?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['interface', 'gotcha', 'fields'],
    answer: `An interface can **declare fields, but they are implicitly \`public static final\`** — i.e. **constants**, not per-instance state.

\`\`\`java
interface Physics {
  int MAX = 10;          // actually: public static final int MAX = 10
}
\`\`\`

So an interface has **no instance state**. It *can* carry \`default\`, \`static\`, and \`private\` methods with bodies (Java 8/9+), but still no instance fields.

:::gotcha
That implicit \`public static final\` is the trap: writing \`int x = 5;\` in an interface silently makes it a constant. And the absence of instance state is precisely **why multiple interface inheritance is safe** — there's no data to collide in a diamond.
:::`,
  },
  {
    id: 'oop-iq-whiteboard-uml',
    question: 'In a low-level design interview, what UML should you actually draw on the whiteboard?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['uml', 'lld', 'communication'],
    answer: `Keep it **lightweight** — interviewers want structure and relationships, not textbook-perfect notation. Draw a **class diagram**:

- Boxes for the **key classes**, each with a few *important* fields and methods (skip getters/setters and exhaustive attributes).
- **Lines with the right heads**: triangle for inheritance/realization, diamond for composition/aggregation, plain arrow for association.
- **Multiplicity** at the ends (\`1\`, \`*\`, \`1..*\`).

Optionally add a quick **sequence diagram** for one tricky interaction (e.g. "book a seat").

:::tip
Nobody expects UML-tool precision. **Talk while you draw**, and get the *relationship arrows and multiplicity* right — that's what signals you understand the model.
:::`,
  },
  {
    id: 'oop-iq-constructor-traps',
    question: 'Can a constructor be private, final, or static?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['constructor', 'gotcha', 'traps'],
    answer: `A favourite rapid-fire trap. The answers differ:

| Modifier | Allowed? | Why |
|--|--|--|
| \`private\` | **yes** | singletons, static factories, non-instantiable utility classes — force construction elsewhere |
| \`final\` | **no** | \`final\` means "can't be overridden," but constructors are never inherited/overridden — meaningless |
| \`static\` | **no** | a constructor initialises a specific instance and has an implicit \`this\`; \`static\` means "no instance" — a contradiction |

Constructors *can* be overloaded, call \`this(...)\`/\`super(...)\`, and have no return type.

:::gotcha
A \`private\` constructor is the enabler for the Singleton and static-factory idioms. Don't confuse a \`static\` **initializer block** (which exists) with a static constructor (which doesn't).
:::`,
  },
  {
    id: 'oop-iq-abstract-class-traps',
    question: 'Can an abstract class have a constructor, no abstract methods, or be declared final?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['abstract-class', 'gotcha', 'traps'],
    answer: `Three classic probes:

| Case | Allowed? | Why |
|--|--|--|
| Constructor | **yes** | it runs via \`super()\` when a subclass is built, to init inherited fields — you just can't \`new\` the abstract class directly |
| Zero abstract methods | **yes** | still can't be instantiated; useful as a partial base or a hooks-only template |
| \`abstract\` + \`final\` | **no** | direct contradiction — \`abstract\` demands subclassing, \`final\` forbids it |

\`\`\`java
abstract class Base {
  Base() { System.out.println("runs on subclass construction"); }
}
\`\`\`

:::gotcha
"An abstract class with a constructor" surprises people. \`abstract\` doesn't mean "no construction" — it means **no direct instantiation**. Its constructor absolutely runs, from the subclass, up the chain.
:::`,
  },
  {
    id: 'oop-iq-why-string-final',
    question: 'Why is String final and immutable in Java?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['string', 'immutability', 'final'],
    answer: `\`String\` is **immutable** (and \`final\` so no subclass can break that) for four reinforcing reasons:

1. **Security** — strings carry file paths, URLs, class names, credentials. If mutable, a value could change *after* validation (a time-of-check-to-time-of-use hole).
2. **String pool** — literals are interned and shared; sharing is only safe if no one can mutate a shared \`"hi"\`.
3. **Thread safety** — immutable objects are freely shareable without locks.
4. **Cached hash code** — \`String\` caches its \`hashCode\` (it's the dominant \`HashMap\` key); that's only correct because the contents never change.

\`final\` stops a subclass from adding mutability or overriding methods to defeat these guarantees.

:::senior
The memorable one-liner: *"so it's a safe, cacheable HashMap key."* The security + pooling + hash-caching trio is the full senior answer.
:::`,
  },
  {
    id: 'oop-iq-how-interviewers-probe',
    question: 'How do interviewers probe whether you truly understand an OOP concept?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['technique', 'depth', 'gotcha'],
    answer: `They **take your definition and ask for the exception.** The pattern is predictable:

- You: "overriding is runtime polymorphism." → Them: *"Can you override a \`static\` method? Why not?"*
- You: "interfaces have no state." → Them: *"Then what are fields in an interface?"*
- You: "\`final\` means constant." → Them: *"Is a \`final\` \`List\` immutable?"*

They also ask **"why"** repeatedly and push for **trade-offs** and a **real example** from your work.

Prepare by knowing each concept's **boundaries and gotchas**, not just its headline definition.

:::senior
The strongest depth signal is **volunteering the edge case yourself** — "...runtime dispatch, though note static methods are *hidden*, not overridden" — before they dig. It shows you've actually hit it in practice.
:::`,
  },
  {
    id: 'oop-iq-red-flags',
    question: 'What are red flags in how a candidate discusses OOP design?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['technique', 'anti-patterns', 'design'],
    answer: `From the interviewer's seat, warning signs:

- **Pattern name-dropping** — forcing GoF names with no real force ("a Singleton Factory Observer here").
- **Definitions without trade-offs** — can't say when *not* to use something.
- **Over-engineering** — single-implementation interfaces, deep inheritance, speculative abstraction (ignoring YAGNI).
- **Inheritance for code reuse** — can't reach for composition.
- **No clarifying questions** before designing.
- Treating SOLID/patterns as **rules to obey** rather than tools with costs.

The green-flag inverse: name the **force** before the pattern, state one explicit **trade-off**, ask about scale and requirements, and know when a "violation" is acceptable.

:::senior
The clearest positive signal is **volunteering trade-offs and constraints unprompted** — it shows judgement, which is what senior interviews actually test.
:::`,
  },
  {
    id: 'oop-iq-explain-oop-senior',
    question: 'The interviewer says "explain OOP." How do you answer at a senior level?',
    difficulty: 'Hard',
    category: 'Interview Prep',
    tags: ['fundamentals', 'senior', 'technique'],
    answer: `Don't recite the four pillars — that's the junior answer. Lead with **what OOP is *for* and its architectural consequences**, then tie the pillars to those consequences:

- OOP structures large systems around **objects that own state and behaviour**, so complexity stays **local** and modules evolve behind **stable interfaces**.
- **Encapsulation** → local reasoning and team boundaries. **Polymorphism** → open/closed extension points (add a type, don't edit callers). **Interfaces/abstraction** → substitutable seams for testing and swapping implementations.

Then be honest about **costs** (indirection, ceremony; a poor fit for data pipelines and cache-sensitive code) and note that modern practice is **hybrid** — OO in the large, functional in the small.

:::senior
The differentiator is talking about **consequences** (change cost, coupling, team scale) and **trade-offs**, not definitions — then grounding it in **one concrete example** from your own work.
:::`,
  },
];

export default questions;
