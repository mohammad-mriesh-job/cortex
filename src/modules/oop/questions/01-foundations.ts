import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'oop-fnd-what-is-oop',
    question: 'What is object-oriented programming, and how does it differ from procedural programming?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['oop', 'paradigm', 'procedural'],
    answer: `**OOP** structures a program around **objects** — bundles of *state* (data) and *behaviour* (methods) that act on that data. **Procedural** programming keeps data and the functions that operate on it *separate*.

| | Procedural | OOP |
|--|--|--|
| Unit | Functions | Objects |
| Data & logic | Separate | Bundled |
| Data access | Often shared/global | Encapsulated |

The payoff of bundling is **encapsulation**: each object guards its own state behind methods, so complexity stays local instead of leaking through shared data.

:::tip
OOP's four pillars — **encapsulation, abstraction, inheritance, polymorphism** — are all techniques for managing complexity in large systems.
:::`,
  },
  {
    id: 'oop-fnd-class-vs-object',
    question: 'What is the difference between a class and an object?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['class', 'object', 'instance'],
    answer: `A **class** is a *blueprint* — a definition written once that describes the fields and methods every instance will have. An **object** is a concrete *instance* of that class, created with \`new\`, holding its own state in memory.

\`\`\`java
class Car { String color; }      // blueprint (once)
Car red  = new Car();            // object (instance)
Car blue = new Car();            // another, independent object
\`\`\`

One class can produce many objects; each object has its **own copy of the fields** and its **own identity**.

:::key
Class = definition. Object = a thing in memory built from that definition. This is the most common OOP warm-up question.
:::`,
  },
  {
    id: 'oop-fnd-state-behavior',
    question: 'What two things does an object bundle together?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['object', 'state', 'behavior'],
    answer: `An object bundles:

- **State** — its **fields** (instance variables), e.g. \`balance\`, \`color\`.
- **Behaviour** — its **methods**, which operate on *that object's* own state.

The class declares the *shape* of both; each object holds its own state values and runs the behaviour against them.

\`\`\`java
class Account {
  private double balance;              // state
  void deposit(double a) {             // behaviour
    if (a > 0) balance += a;           // acts on THIS object's state
  }
}
\`\`\``,
  },
  {
    id: 'oop-fnd-constructor-role',
    question: 'What is a constructor, and what happens if you don\'t declare one?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['constructor', 'initialization'],
    answer: `A **constructor** is a special member that runs when an object is created with \`new\`; its job is to **initialise** the new object's state. It has the same name as the class and **no return type**.

If you declare **no** constructor, the compiler inserts a hidden **default no-arg constructor**. As soon as you declare *any* constructor, that free default disappears — so if you still need a no-arg version you must write it yourself.

\`\`\`java
class Account {
  String owner;
  Account(String owner) { this.owner = owner; }  // declaring this...
  // ...removes the implicit no-arg Account()
}
\`\`\``,
  },
  {
    id: 'oop-fnd-this-keyword',
    question: 'What does the this keyword mean, and why is it needed?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['this', 'fields', 'constructor'],
    answer: `\`this\` is a reference to **the current object** — the instance whose method or constructor is executing.

Two common uses:

1. **Disambiguate** a field from a same-named parameter: \`this.owner = owner;\` means "my field = the parameter".
2. **Constructor chaining**: \`this(owner, 0.0);\` calls another constructor of the same class.

\`\`\`java
Account(String owner) {
  this.owner = owner;   // without 'this', owner = owner does nothing useful
}
\`\`\`

:::gotcha
Writing \`owner = owner;\` (no \`this\`) assigns the parameter to itself and silently leaves the field null.
:::`,
  },
  {
    id: 'oop-fnd-constructor-overloading',
    question: 'What is constructor overloading and how does one constructor call another?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['constructor', 'overloading', 'this'],
    answer: `**Constructor overloading** means a class has multiple constructors that differ by **parameter list**. The compiler picks the matching one from the arguments you pass (compile-time selection).

One constructor can **delegate** to another with \`this(...)\`, which must be the **first statement** in the body — this keeps initialisation logic in one place.

\`\`\`java
class Account {
  private String owner;
  private double balance;
  Account(String owner)                  { this(owner, 0.0); }   // delegates ↓
  Account(String owner, double opening)  { this.owner = owner; this.balance = opening; }
}
\`\`\`

:::tip
\`this(...)\` calls a sibling constructor; \`super(...)\` calls the parent's. Either, if used, must be the first line.
:::`,
  },
  {
    id: 'oop-fnd-reference-vs-object',
    question: 'In Java, does a variable of a class type hold the object itself?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['reference', 'heap', 'stack', 'memory'],
    answer: `No. A variable of a class (reference) type holds a **reference** — an address pointing to the object. The **object itself lives on the heap**; the reference (for a local variable) lives on the **stack**.

\`\`\`java
Point p = new Point(1, 2);
// 'p' (stack) --> Point{1,2} (heap)
\`\`\`

This is why passing an object to a method passes a *copy of the reference* (both point at the same object), and why assigning references creates aliases rather than copies.

:::note
Primitives (\`int\`, \`double\`, \`boolean\`, …) hold their **value** directly — no heap object, no reference.
:::`,
  },
  {
    id: 'oop-fnd-aliasing',
    question: 'What is aliasing? What does Point b = a; do?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['aliasing', 'reference', 'mutation'],
    answer: `**Aliasing** is when two references point to the **same** object. \`Point b = a;\` copies the *reference*, not the object — so \`a\` and \`b\` name one shared heap object. Mutating through one is visible through the other.

\`\`\`java
Point a = new Point(1, 2);
Point b = a;        // alias — no new object
b.x = 99;
System.out.println(a.x);  // 99 — same object!
\`\`\`

To get an **independent** copy you must create a new object, e.g. \`new Point(a.x, a.y)\` (or a proper clone/copy method).

:::gotcha
A subtle source of bugs: handing your internal object reference to a caller lets them mutate your state through their alias. Return copies of mutable internals when you need to protect them.
:::`,
  },
  {
    id: 'oop-fnd-equals-vs-equalequal',
    question: 'What is the difference between == and .equals() for objects?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['equals', 'identity', 'equality'],
    answer: `They answer different questions:

- \`==\` compares **references** → *"are these the very same object?"* (**identity**).
- \`.equals()\` compares **contents** → *"do these objects mean the same thing?"* (**equality**) — **but only if the class overrides it**. The default \`Object.equals\` just does \`==\`.

\`\`\`java
String a = new String("hi");
String b = new String("hi");
a == b;        // false — two distinct objects
a.equals(b);   // true  — same content
\`\`\`

:::warning
For primitives, \`==\` compares *values*. The identity-vs-content distinction only applies to reference types.
:::`,
  },
  {
    id: 'oop-fnd-equals-hashcode-contract',
    question: 'Why must you override hashCode() whenever you override equals()?',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['equals', 'hashcode', 'collections'],
    answer: `Because of the **equals/hashCode contract**: if two objects are \`equals()\`, they **must** return the same \`hashCode()\`. Hash-based collections (\`HashMap\`, \`HashSet\`) locate objects by hash code *first*, then confirm with \`equals\`.

If you override \`equals\` but not \`hashCode\`, two "equal" objects can land in different buckets, so:

\`\`\`java
Set<Point> s = new HashSet<>();
s.add(new Point(1, 2));
s.contains(new Point(1, 2));  // false! — different hashCode, wrong bucket
\`\`\`

**Contract in full:**
- \`equals\` must be reflexive, symmetric, transitive, consistent.
- Equal objects ⇒ equal hash codes (the reverse need not hold — collisions are allowed).

:::senior
Use \`Objects.equals(...)\` and \`Objects.hash(...)\`, or let your IDE/\`record\` generate both together. \`record\` types generate a consistent \`equals\`/\`hashCode\` for you automatically.
:::`,
  },
  {
    id: 'oop-fnd-oop-vs-functional',
    question: 'How does OOP compare with functional programming, and when would you pick each?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['paradigm', 'functional', 'trade-offs'],
    answer: `**OOP** organises a system around objects that own **mutable state** and the behaviour guarding it; **FP** organises it around **pure functions** transforming **immutable** data.

| | OOP | Functional |
|--|--|--|
| Unit | object (state + behaviour) | pure function |
| State | encapsulated, mutable | immutable, passed along |
| Polymorphism | subtyping / interfaces | higher-order functions, pattern matching |
| Concurrency | must guard shared state | trivial — nothing mutates |
| Easy to add | new **types** | new **operations** |

That last row is the **expression problem**: OOP lets you add a new subclass without touching existing operations; FP lets you add a new function without touching existing types — each is weak where the other is strong.

**Pick OOP** for long-lived domain models with many evolving types and plugin points; **pick FP style** for data transformation pipelines, concurrency-heavy code, and anywhere immutability simplifies reasoning.

:::senior
Modern Java is deliberately both: OO **in the large** (modules, interfaces, DI) and functional **in the small** (streams, lambdas, \`record\`s, sealed types + pattern matching). Saying "I choose per subsystem, not per religion" is the senior answer.
:::`,
  },
  {
    id: 'oop-fnd-message-passing',
    question: 'What does "message passing" mean in OOP?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['message-passing', 'alan-kay', 'dispatch'],
    answer: `Message passing is the original OOP idea (Alan Kay): objects collaborate by **sending each other messages**, and the **receiver decides** how to respond. In Java, a method call *is* the message:

\`\`\`java
account.deposit(100);   // message "deposit(100)" sent to the account object
\`\`\`

The caller names **what** it wants (the message); the receiving object owns **how** it happens (the method implementation chosen by *its* class). That separation is why polymorphism works — the same message sent to different objects produces different behaviour:

\`\`\`java
Shape s = pickAnyShape();
s.area();   // same message, receiver-specific response
\`\`\`

:::senior
Kay later said "the big idea is **messaging**", not classes — the point of OOP is objects hiding everything behind a message surface, so senders never depend on internals.
:::`,
  },
  {
    id: 'oop-fnd-why-enterprise',
    question: 'Why did OOP become the dominant paradigm for large enterprise systems?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['paradigm', 'history', 'architecture'],
    answer: `Because OOP's core tools are really tools for **managing change and team scale**, which is where enterprise systems hurt most:

1. **Domain mapping** — \`Customer\`, \`Order\`, \`Invoice\` mirror the business vocabulary, so code and requirements speak one language.
2. **Encapsulation = team boundaries** — modules hide internals behind contracts, letting many teams change code in parallel without treading on each other.
3. **Polymorphism = plugin points** — decade-old cores gain new behaviour by *adding* classes (payment methods, tax rules) instead of editing tested code.
4. **Interfaces = substitution** — swap a vendor, a database, or inject a test double without touching callers.
5. **Ecosystem** — Java/C# brought GC, giant standard libraries, IDEs with safe refactoring, and frameworks (Spring, .NET) that institutionalised these patterns.

:::senior
The honest framing: OOP won less on raw expressiveness than on **economics** — it made million-line codebases survivable for 100-person organisations. That's also why its costs (ceremony, indirection) show up worst in small programs.
:::`,
  },
  {
    id: 'oop-fnd-when-oop-wrong-tool',
    question: 'When is OOP the wrong tool for the job?',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['paradigm', 'trade-offs', 'data-oriented'],
    answer: `Strong candidates for *not* leading with objects:

- **Pure data transformation** — ETL, analytics, report pipelines. Data flows through stages; functions/SQL/streams express this directly, while objects add ceremony around data that has no behaviour.
- **Performance-critical, cache-sensitive code** — games and simulations moved to **data-oriented design / ECS** because arrays of tightly-packed fields beat heaps of scattered objects for cache locality.
- **Small scripts and glue** — a 100-line procedural script beats five classes and an interface.
- **Highly concurrent shared state** — mutable objects are exactly what data races feed on; immutable values and message-passing (actors) fare better.
- **Boundary data** — DTOs, JSON payloads, rows. These are honest *data structures*; forcing behaviour onto them creates fake objects.

The tell that you're over-objecting: classes with no behaviour (anemic), or a parody stack of \`AbstractSingletonProxyFactoryBean\`-style indirection nobody can trace.

:::senior
Strong answers name a **hybrid**: OO shell for module boundaries and lifecycles, functional core for logic, plain data at the edges.
:::`,
  },
  {
    id: 'oop-fnd-objects-vs-data-structures',
    question: 'What is the difference between an object and a data structure (the Clean Code distinction)?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['clean-code', 'objects', 'dto'],
    answer: `Robert Martin's distinction:

- An **object** *hides* its data behind abstractions and *exposes behaviour* — you tell it to do things.
- A **data structure** *exposes* its data and has **no meaningful behaviour** — functions elsewhere operate on it.

\`\`\`java
class Account {                 // object: behaviour, hidden state
  private long cents;
  void withdraw(long amount) { /* enforces rules */ }
}
record AccountDto(long cents) {} // data structure: transparent data
\`\`\`

They have **opposite strengths** (the expression problem again): with objects, adding a new *type* is easy and adding a new *operation* is hard; with data structures, adding an operation is easy and adding a type forces edits everywhere.

The anti-pattern is the **hybrid**: getters/setters exposing everything *and* scattered logic elsewhere — worst of both worlds.

:::key
DTOs, JSON payloads, and \`record\`s at boundaries are legitimate data structures — don't force behaviour onto them. Domain classes should be real objects — don't strip their behaviour into "service" classes by default.
:::`,
  },
  {
    id: 'oop-fnd-constructor-vs-static-factory',
    question: 'Why would you provide a static factory method instead of a public constructor?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['static-factory', 'constructor', 'effective-java'],
    answer: `*Effective Java* Item 1. A static factory is a plain \`static\` method returning an instance — and it can do four things a constructor can't:

1. **Have a name** — \`LocalDate.of(2026, 7, 3)\`, \`Duration.ofMillis(50)\` read better than overloaded constructors that differ only by parameter list.
2. **Reuse instances** — \`Integer.valueOf(7)\` and \`Boolean.valueOf(true)\` return cached objects; \`new\` is forced to allocate every time.
3. **Return any subtype** — \`List.of(...)\` and \`EnumSet.of(...)\` hand back hidden implementations chosen per call (\`EnumSet\` picks a regular or jumbo impl by enum size). Callers see only the interface.
4. **Control instantiation** — a private constructor + factory enables singletons, pools, and non-instantiable utility classes.

\`\`\`java
public static Point origin() { return ORIGIN; }   // named, cached
\`\`\`

**Costs:** a class with only a private constructor can't be subclassed, and factories are less discoverable than constructors in docs (mitigated by conventional names: \`of\`, \`from\`, \`valueOf\`, \`getInstance\`).`,
  },
  {
    id: 'oop-fnd-class-vs-prototype',
    question: 'What is the difference between class-based and prototype-based OOP?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['class-based', 'prototype', 'javascript'],
    answer: `Two ways to answer "where does an object get its behaviour?":

- **Class-based** (Java, C#, C++): objects are instances of a **class**; structure and behaviour are fixed by the class at compile time. Classes are the cookie **cutters**, objects the cookies.
- **Prototype-based** (JavaScript, Lua): there are only **objects**; a new object **clones or delegates to** an existing one, and behaviour lookup walks the *prototype chain* at runtime. You can attach behaviour to a live object.

\`\`\`java
Car c = new Car();          // Java: instance of class Car, shape fixed
\`\`\`

\`\`\`text
// JS: object delegating to another object
const car = Object.create(vehicleProto);
\`\`\`

:::note
JavaScript's \`class\` keyword is syntax sugar — underneath it's still prototypes. The one-liner interviewers want: *classes instantiate; prototypes delegate.*
:::`,
  },
  {
    id: 'oop-fnd-static-members',
    question: 'What does the static keyword mean, and when should a member be static?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['static', 'class-members', 'design'],
    answer: `\`static\` means the member belongs to the **class itself**, not to any instance: **one shared copy**, accessible without creating an object, existing from class initialisation.

Good uses:

- **Constants** — \`static final int MAX_RETRIES = 3;\`
- **Pure utility methods** — \`Math.max\`, \`Collections.sort\` (no per-object state involved).
- **Static factory methods** — \`List.of(...)\`.

Limits: a static method has **no \`this\`** — it can't touch instance fields and it is **not polymorphic** (no overriding, only hiding).

\`\`\`java
class Counter {
  static int created;          // shared by ALL instances
  Counter() { created++; }
}
\`\`\`

:::gotcha
Two traps: (1) calling a static through an instance (\`obj.staticMethod()\`) compiles but misleads readers — use the class name; (2) mutable \`static\` state is a **global variable** in disguise — it couples everything and wrecks test isolation.
:::`,
  },
  {
    id: 'oop-fnd-identity-state-behavior',
    question: 'What are the three characteristics every object has?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['identity', 'state', 'behavior'],
    answer: `Every object has:

1. **Identity** — what makes it *this* object, distinct from all others, even one with identical contents. In Java that's its existence on the heap, tested with \`==\`.
2. **State** — the current values of its fields (\`balance = 250\`), which can change over time.
3. **Behaviour** — its methods, which read and change that state.

\`\`\`java
Point a = new Point(1, 2);
Point b = new Point(1, 2);
a == b;        // false — same state, two identities
a.equals(b);   // true  — value equality (if overridden)
\`\`\`

:::key
Identity vs state is exactly the \`==\` vs \`.equals()\` split — and later it's the **entity vs value object** distinction in domain modelling: entities live by identity, value objects only by state.
:::`,
  },
  {
    id: 'oop-fnd-pass-by-value',
    question: 'Is Java pass-by-value or pass-by-reference?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['pass-by-value', 'references', 'parameters'],
    answer: `Java is **always pass-by-value**. For objects, the value being copied is the **reference** — so the method gets a *copy of the pointer*, never the variable itself.

Two consequences, and this is where people trip:

\`\`\`java
void mutate(List<String> list) { list.add("x"); }              // ✅ affects caller
void reassign(List<String> list) { list = new ArrayList<>(); } // ❌ invisible to caller
\`\`\`

- **Mutating** through the copied reference changes the one shared object — the caller sees it.
- **Reassigning** the parameter just repoints the local copy — the caller's variable is untouched.

That's why the classic \`swap(a, b)\` cannot work in Java:

\`\`\`java
void swap(Point p, Point q) { Point t = p; p = q; q = t; } // swaps locals only
\`\`\`

:::gotcha
"Java passes objects by reference" is the phrase interviewers are fishing for you to correct: Java passes **references by value**. If it were true pass-by-reference, \`reassign\` and \`swap\` above would work.
:::`,
  },
  {
    id: 'oop-fnd-object-root-methods',
    question: 'What is java.lang.Object, and which of its methods matter in practice?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['object-class', 'inheritance', 'api'],
    answer: `\`java.lang.Object\` is the **root of every class hierarchy** — every class extends it directly or indirectly, so every object carries its methods:

| Method | Role | You... |
|--|--|--|
| \`equals(Object)\` | logical equality | override for value types |
| \`hashCode()\` | hash bucket index | override **with** equals |
| \`toString()\` | debug/log text | override for readability |
| \`getClass()\` | runtime class | use; it's \`final\` |
| \`clone()\` | copy (protected) | avoid — prefer copy constructors |
| \`finalize()\` | GC hook | never — deprecated for removal |
| \`wait/notify/notifyAll\` | low-level locking | rarely — use \`java.util.concurrent\` |

\`\`\`java
Object o = "anything";   // every reference type is-an Object
\`\`\`

:::tip
The trio worth overriding in almost every value class: \`equals\`, \`hashCode\`, \`toString\` — or use a \`record\` and get all three generated correctly.
:::`,
  },
  {
    id: 'oop-fnd-new-what-happens',
    question: 'What exactly happens when you write new Foo()?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['new', 'initialization', 'object-creation'],
    answer: `Five steps, in order:

1. **Class initialisation** (first use only) — \`Foo.class\` is loaded, verified, and its \`static\` initialisers run, parent classes first.
2. **Allocation** — heap memory for the object (header + all instance fields, including inherited ones).
3. **Default values** — every field is zeroed: \`0\`, \`0.0\`, \`false\`, \`null\`. The object is *structurally* valid but *logically* blank.
4. **Constructor chain, top-down** — implicit/explicit \`super(...)\` climbs to \`Object\`, then each level runs its **field initialisers and instance init blocks**, then its **constructor body**.
5. **Reference returned** — \`new\` evaluates to a reference to the finished object.

\`\`\`java
class A { A() { System.out.print("A"); } }
class B extends A { int x = 1; B() { System.out.print("B" + x); } }
new B();   // prints A B1
\`\`\`

:::gotcha
Step 3 explains the classic bug: if a superclass constructor calls an **overridable method**, the subclass override runs while subclass fields are still at their step-3 defaults (\`null\`/\`0\`).
:::`,
  },
  {
    id: 'oop-fnd-method-vs-function',
    question: 'What is the difference between a method and a function?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['method', 'function', 'terminology'],
    answer: `A **function** is a named, callable unit of code. A **method** is a function that **belongs to a class** and (unless \`static\`) runs against a **receiver object**, with an implicit \`this\` and participation in dynamic dispatch.

\`\`\`java
class Account {
  void deposit(long cents) { ... }        // instance method: has 'this', dispatches
  static long toCents(double eur) { ... } // static method: class-scoped function
}
\`\`\`

Java has no free-standing functions — everything lives in a class. The closest equivalents are \`static\` methods and **lambdas**, and even a lambda is an object implementing a functional interface (\`Runnable\`, \`Function\`).

**One-liner:** every method is a function; a method additionally has a home class and (for instance methods) a receiver that the runtime uses to pick the implementation.`,
  },
  {
    id: 'oop-fnd-destructor',
    question: 'Does Java have destructors like C++? How are objects cleaned up?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['destructor', 'garbage-collection', 'resources'],
    answer: `No. Java has **no destructors** and no deterministic object destruction. When an object becomes **unreachable**, the **garbage collector** reclaims its memory *eventually* — you neither call nor time it.

The C++-habits translation table:

| C++ | Java |
|--|--|
| \`delete obj\` | nothing — GC handles memory |
| destructor releasing memory | unnecessary |
| destructor releasing files/sockets | \`try\`-with-resources + \`AutoCloseable\` |

\`\`\`java
try (var in = new FileInputStream("data.bin")) {
  ...
} // close() runs HERE — deterministic, unlike GC
\`\`\`

:::gotcha
\`finalize()\` looks like a destructor but never use it: it's deprecated **for removal** — unpredictable timing, may never run, can even resurrect objects. For last-resort native cleanup the modern tool is \`java.lang.ref.Cleaner\`; for everything else, \`AutoCloseable\`.
:::`,
  },
  {
    id: 'oop-fnd-method-signature',
    question: 'What exactly makes up a method signature in Java?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['signature', 'overloading', 'overriding'],
    answer: `A Java method signature is the **method name + the parameter types** (their number, types, and order). It does **not** include:

- the **return type**,
- parameter *names*,
- \`throws\` clauses,
- access modifiers or \`final\`/\`static\`.

Why it matters:

- **Overloading** requires *different* signatures — so you **cannot** overload on return type alone: \`int read()\` and \`long read()\` in one class is a compile error.
- **Overriding** requires the *same* signature as the parent method (return type may be covariant).

\`\`\`java
void log(String msg, int level)   // signature: log(String, int)
void log(int level, String msg)   // different — order matters ✅ overload
\`\`\`

:::gotcha
Generics are **erased** from signatures: \`print(List<String>)\` and \`print(List<Integer>)\` collide as \`print(List)\` — a surprising compile error interviewers like to probe.
:::`,
  },
];

export default questions;
