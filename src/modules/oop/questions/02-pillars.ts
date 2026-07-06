import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'oop-pil-four-pillars',
    question: 'What are the four pillars of OOP, in one line each?',
    difficulty: 'Easy',
    category: 'Four Pillars',
    tags: ['encapsulation', 'abstraction', 'inheritance', 'polymorphism'],
    answer: `The four pillars:

- **Encapsulation** — bundle data with the methods that guard it and hide the state behind a controlled interface.
- **Abstraction** — expose *what* a thing does and hide *how* it does it.
- **Inheritance** — an **is-a** relationship: a subclass reuses and extends a superclass.
- **Polymorphism** — one interface, many forms: the same call behaves differently per object.

:::tip
A handy mnemonic: **A** **PIE** — Abstraction, Polymorphism, Inheritance, Encapsulation.
:::`,
  },
  {
    id: 'oop-pil-encapsulation-vs-abstraction',
    question: 'What is the difference between encapsulation and abstraction?',
    difficulty: 'Medium',
    category: 'Four Pillars',
    tags: ['encapsulation', 'abstraction'],
    answer: `Both hide something, but different things at different levels.

| | Encapsulation | Abstraction |
|--|--------------|-------------|
| Hides | **data / internal state** | **implementation complexity** |
| Answers | *"How is the data protected?"* | *"What does it do?"* |
| Level | implementation | design / interface |
| Tools | \`private\`, getters/setters | \`abstract\` classes, \`interface\`s |

**One-liner:** encapsulation hides the *data*; abstraction hides the *complexity*. They work together — an \`interface\` (abstraction) is implemented by a class whose fields are \`private\` (encapsulation).`,
  },
  {
    id: 'oop-pil-access-modifiers',
    question: 'Compare Java\'s four access levels: private, default, protected, public.',
    difficulty: 'Easy',
    category: 'Four Pillars',
    tags: ['encapsulation', 'access modifiers'],
    answer: `| Modifier | Same class | Same package | Subclass | World |
|----------|:---------:|:------------:|:--------:|:-----:|
| \`private\` | ✅ | ❌ | ❌ | ❌ |
| *(default)* | ✅ | ✅ | ❌ | ❌ |
| \`protected\` | ✅ | ✅ | ✅ | ❌ |
| \`public\` | ✅ | ✅ | ✅ | ✅ |

The key subtlety: \`protected\` extends default visibility to **subclasses in other packages**. Best practice: keep fields \`private\` and make methods only as public as they must be.`,
  },
  {
    id: 'oop-pil-getters-setters-value',
    question: 'Do getters and setters automatically give you encapsulation?',
    difficulty: 'Medium',
    category: 'Four Pillars',
    tags: ['encapsulation', 'getters', 'setters'],
    answer: `No. A getter/setter pair that only forwards a field is just a \`public\` field with extra steps — no protection gained.

Encapsulation is about the **logic in the gate**: validation, invariant enforcement, defensive copies.

\`\`\`java
public void setAge(int age) {
  if (age < 0) throw new IllegalArgumentException();
  this.age = age;                 // invariant: age >= 0
}
\`\`\`

:::gotcha
A getter returning your internal mutable \`List\` **breaks** encapsulation — callers mutate it behind your back. Return \`List.copyOf(list)\` or an unmodifiable view.
:::`,
  },
  {
    id: 'oop-pil-abstract-class-vs-interface',
    question: 'When would you use an abstract class versus an interface?',
    difficulty: 'Medium',
    category: 'Four Pillars',
    tags: ['abstraction', 'abstract class', 'interface'],
    answer: `| | abstract class | interface |
|--|---------------|-----------|
| Inherit | **one** | **many** |
| Fields | instance fields ok | only \`static final\` |
| Constructor | yes | no |
| Method bodies | concrete + abstract | \`default\` / \`static\` only |
| Models | **is-a** (shared state/code) | **can-do** (capability) |

Use an **abstract class** when implementations share state or code and form a real is-a hierarchy. Use an **interface** to declare a capability that unrelated types can fulfil — and because a class can implement many, it's the escape hatch from single inheritance. **Default to an interface**; reach for an abstract class only when you have shared state/implementation.`,
  },
  {
    id: 'oop-pil-is-a-vs-has-a',
    question: 'What is the difference between an is-a and a has-a relationship?',
    difficulty: 'Easy',
    category: 'Four Pillars',
    tags: ['inheritance', 'composition'],
    answer: `- **is-a** → inheritance. \`Dog\` **is an** \`Animal\` → \`class Dog extends Animal\`.
- **has-a** → composition. \`Car\` **has an** \`Engine\` → \`Engine\` is a field of \`Car\`.

Choosing wrong is a common design smell. If B is merely *part of* A, compose — don't inherit.

:::senior
**Favor composition over inheritance.** Inheritance couples you to the parent's internals (the *fragile base class* problem); composition keeps collaborators behind a clean API and is far easier to change.
:::`,
  },
  {
    id: 'oop-pil-super-keyword',
    question: 'What does the super keyword do, and what are the constructor rules?',
    difficulty: 'Medium',
    category: 'Four Pillars',
    tags: ['inheritance', 'super', 'constructor'],
    answer: `\`super\` references the superclass:

- \`super(args)\` — invokes the parent constructor. It **must be the first statement** in the subclass constructor.
- \`super.method()\` — calls the parent's version of an (overridden) method.

If you don't write \`super(...)\`, Java inserts an implicit no-arg \`super()\` — which is a **compile error** if the parent has no no-arg constructor. Construction always runs top-down: the superclass is fully initialized before the subclass body.`,
  },
  {
    id: 'oop-pil-diamond-problem',
    question: 'Why does Java allow multiple interface inheritance but not multiple class inheritance?',
    difficulty: 'Hard',
    category: 'Four Pillars',
    tags: ['inheritance', 'interface', 'diamond problem'],
    answer: `To avoid the **diamond problem**: if a class could inherit from two classes that both define \`greet()\` (or both hold state), the compiler couldn't tell which to use — ambiguous behavior and duplicated state.

Interfaces avoid this because:
1. They traditionally carried **no instance state**, so there's no data ambiguity.
2. When two interfaces supply conflicting \`default\` methods, Java **forces you to override** and disambiguate explicitly:

\`\`\`java
class C implements A, B {
  @Override public void greet() {
    A.super.greet();   // pick one explicitly
  }
}
\`\`\`

So a class \`extends\` one class but \`implements\` many interfaces.`,
  },
  {
    id: 'oop-pil-overriding-vs-overloading',
    question: 'What is the difference between method overriding and overloading?',
    difficulty: 'Medium',
    category: 'Four Pillars',
    tags: ['polymorphism', 'overriding', 'overloading'],
    answer: `| | Overloading | Overriding |
|--|-------------|-----------|
| A.k.a. | compile-time / static / early binding | runtime / dynamic / late binding |
| Lives in | the **same** class | a **subclass** |
| Signature | **different** parameters | **identical** |
| Resolved | at **compile time** (declared types) | at **runtime** (object's real type) |

**Overloading** = same name, different parameter lists; the compiler picks by argument types. **Overriding** = a subclass redefines a parent method with the same signature; the JVM picks by the actual object at runtime (dynamic dispatch).`,
  },
  {
    id: 'oop-pil-dynamic-dispatch',
    question: 'How does Java decide which overridden method to run at runtime?',
    difficulty: 'Hard',
    category: 'Four Pillars',
    tags: ['polymorphism', 'dynamic dispatch'],
    answer: `Through **dynamic dispatch** (late binding). Given \`Animal a = new Dog(); a.speak();\`:

1. The **compiler** checks the *reference type* (\`Animal\`) merely to confirm \`speak()\` exists.
2. At **runtime** the JVM looks at the *actual object* (\`Dog\`) and calls \`Dog.speak()\` via the class's **vtable** (virtual method table).

:::gotcha
Only **instance methods** are polymorphic. \`static\` and \`private\` methods bind at compile time (that's *hiding*), and **fields resolve by the reference type** — \`((Animal) dog).name\` reads \`Animal\`'s field.
:::`,
  },
  {
    id: 'oop-pil-abstract-instantiate',
    question: 'Can you instantiate an abstract class? What happens if you try?',
    difficulty: 'Easy',
    category: 'Four Pillars',
    tags: ['abstraction', 'abstract class'],
    answer: `No. \`new AbstractType()\` is a **compile error** — an abstract class may have unimplemented methods, so a standalone instance would be incomplete.

You instantiate a **concrete subclass** instead, or use an anonymous subclass:

\`\`\`java
Animal a = new Animal() {          // anonymous concrete subclass
  @Override String speak() { return "?"; }
};
\`\`\`

An abstract class *can* still have a constructor — it runs via \`super(...)\` when a subclass is created.`,
  },
  {
    id: 'oop-pil-immutability',
    question: 'How does immutability strengthen encapsulation?',
    difficulty: 'Hard',
    category: 'Four Pillars',
    tags: ['encapsulation', 'immutability'],
    answer: `An immutable object can't change after construction, so its invariants can **never be violated** and it's automatically **thread-safe** (no shared mutable state to guard).

Recipe:
1. Make the class \`final\` (no override tricks).
2. \`private final\` fields, set once in the constructor.
3. **No setters.**
4. Defensively copy any mutable inputs in, and hand out copies/unmodifiable views out.

\`\`\`java
final class Point {
  private final int x, y;
  Point(int x, int y) { this.x = x; this.y = y; }
  int x() { return x; }
  int y() { return y; }
}
\`\`\`

This is encapsulation taken to its logical end: the safest state is state that can't be mutated at all. (Java \`record\`s give you much of this for free.)`,
  },
  {
    id: 'oop-pil-encapsulation-definition',
    question: 'What is encapsulation, and what does it actually buy you?',
    difficulty: 'Easy',
    category: 'Four Pillars',
    tags: ['encapsulation', 'invariants'],
    answer: `**Encapsulation** = bundling state with the methods that guard it, and blocking direct outside access to that state. The class becomes the **single gate** through which its data changes.

\`\`\`java
class Account {
  private long cents;                       // sealed off
  void withdraw(long amount) {
    if (amount <= 0 || amount > cents) throw new IllegalArgumentException();
    cents -= amount;                        // invariant: cents >= 0, enforced HERE, once
  }
}
\`\`\`

What it buys:

1. **Invariants hold everywhere** — nobody can set \`cents = -5\`, because nobody can touch \`cents\`.
2. **Freedom to change internals** — switch \`long cents\` to \`BigDecimal\` and no caller notices.
3. **Local reasoning** — to debug a bad balance you read one class, not every caller.

:::gotcha
The real test of encapsulation isn't "are the fields private?" — it's *"can I change the internal representation without touching any caller?"* If not, your getters are leaking the design.
:::`,
  },
  {
    id: 'oop-pil-abstraction-definition',
    question: 'What is abstraction, and how do you achieve it in Java?',
    difficulty: 'Easy',
    category: 'Four Pillars',
    tags: ['abstraction', 'interface', 'design'],
    answer: `**Abstraction** = exposing the essential *what* while hiding the *how*, so callers depend on a simple concept instead of a complex mechanism.

Java gives you three levels of it:

1. **A well-named method** — \`order.totalWithTax()\` hides the tax rules. Every good API is an abstraction.
2. **An abstract class** — names a concept (\`Shape\`) and defers details (\`area()\`) to subclasses.
3. **An interface** — pure contract, zero implementation: \`List\` promises \`add\`/\`get\`; callers never know if it's an array or linked nodes.

\`\`\`java
List<String> names = new ArrayList<>();   // callers see the concept "List"
names.sort(null);                         // no idea it's TimSort on an array — don't need to
\`\`\`

:::gotcha
Abstraction is **not** "using the \`abstract\` keyword". It's a design activity: choosing what callers *shouldn't have to know*. The keyword is just one tool for it.
:::`,
  },
  {
    id: 'oop-pil-inheritance-what-inherited',
    question: 'What does a subclass actually inherit — are private fields and constructors inherited?',
    difficulty: 'Medium',
    category: 'Four Pillars',
    tags: ['inheritance', 'private', 'constructor'],
    answer: `A subclass inherits all **\`public\` and \`protected\`** members, plus **package-private** members if it's in the same package. Two famous non-inheritances:

- **Constructors are never inherited.** A subclass declares its own and *chains* to the parent's via \`super(...)\`.
- **\`private\` members are not inherited** — the subclass cannot see or call them. But note the nuance: the parent's private **fields still exist inside every subclass instance's memory** (the parent's methods need them); they're just inaccessible directly.

\`\`\`java
class Animal {
  private int age;                       // lives inside every Dog object...
  protected int age() { return age; }    // ...but Dog reaches it only via this
}
class Dog extends Animal {
  boolean isPuppy() { return age() < 2; }  // ✅ age() inherited; 'age' itself invisible
}
\`\`\`

\`static\` members are *accessible* through the subclass but belong to the class — redeclaring one **hides** rather than overrides it.

:::gotcha
"Private members aren't inherited" and "the object still carries the parent's private state" are both true — interviewers probe exactly that apparent contradiction.
:::`,
  },
  {
    id: 'oop-pil-polymorphism-definition',
    question: 'What is polymorphism? Show its compile-time and runtime forms.',
    difficulty: 'Easy',
    category: 'Four Pillars',
    tags: ['polymorphism', 'overloading', 'overriding'],
    answer: `**Polymorphism** ("many forms") = one name or one interface, with behaviour that varies by context. Java has two forms:

**Compile-time (static)** — *overloading*: the compiler picks among same-named methods by argument types.

\`\`\`java
int    add(int a, int b)       { return a + b; }
double add(double a, double b) { return a + b; }  // resolved at compile time
\`\`\`

**Runtime (dynamic)** — *overriding*: the JVM picks the implementation from the **actual object**, not the reference type.

\`\`\`java
Animal a = new Dog();
a.speak();          // "Woof" — decided at runtime by the real object
\`\`\`

When interviewers say "polymorphism" unqualified, they mean the **runtime** kind — it's what lets one \`List<Animal>\` hold dogs and cats and do the right thing per element.

:::tip
One-liner: *overloading is the compiler choosing between methods; overriding is the runtime choosing between objects.*
:::`,
  },
  {
    id: 'oop-pil-inheritance-types',
    question: 'What types of inheritance exist, and which does Java support?',
    difficulty: 'Easy',
    category: 'Four Pillars',
    tags: ['inheritance', 'hierarchy', 'multiple-inheritance'],
    answer: `| Type | Shape | Java (classes) |
|--|--|--|
| **Single** | \`A ← B\` | ✅ |
| **Multilevel** | \`A ← B ← C\` | ✅ |
| **Hierarchical** | \`A ← B\`, \`A ← C\` | ✅ |
| **Multiple** | \`A, B ← C\` | ❌ classes — ✅ via interfaces |
| **Hybrid** | mix of the above | only where the parts are legal |

\`\`\`java
class C extends A {}                 // single / multilevel / hierarchical: fine
class C extends A, B {}              // ❌ compile error
class C implements X, Y {}           // ✅ multiple inheritance of TYPE
\`\`\`

Java bans multiple **class** inheritance to avoid ambiguous inherited state (the diamond problem); interfaces are safe because they carry no instance state.

:::senior
Depth is a smell: a multilevel chain more than 2–3 deep usually means someone used inheritance for code reuse. Hierarchies should be **wide and shallow**, or replaced with composition.
:::`,
  },
  {
    id: 'oop-pil-overriding-rules',
    question: 'What are the exact rules a valid method override must follow?',
    difficulty: 'Hard',
    category: 'Four Pillars',
    tags: ['overriding', 'covariant-return', 'exceptions'],
    answer: `An override must be *substitutable* where the parent method was used, and every rule below enforces that:

1. **Same signature** — same name and parameter types (else it's an overload).
2. **Covariant return allowed** — may return a *subtype* of the parent's return type.
3. **Visibility can widen, never narrow** — \`protected\` → \`public\` ✅; \`public\` → \`protected\` ❌ (callers via the base type would lose access).
4. **Checked exceptions can narrow or disappear, never broaden** — declaring a *new* checked exception would ambush base-type callers. Unchecked exceptions are unrestricted.
5. **Can't override** \`static\` (hidden instead), \`private\` (invisible), or \`final\` (compile error).

\`\`\`java
class Base    { protected Number get() throws IOException { ... } }
class Derived extends Base {
  @Override public Integer get() { ... }   // wider access ✅ covariant return ✅ fewer throws ✅
}
\`\`\`

:::gotcha
Always annotate with \`@Override\` — without it, a typo'd name or parameter silently creates an *overload*, and your "override" never runs. The annotation turns that bug into a compile error.
:::`,
  },
  {
    id: 'oop-pil-overload-resolution',
    question: 'How does the Java compiler choose between overloads — and where does it surprise people?',
    difficulty: 'Hard',
    category: 'Four Pillars',
    tags: ['overloading', 'resolution', 'gotcha'],
    answer: `Overload resolution happens at **compile time**, on the **static types** of the arguments, preferring the *most specific* applicable method in phases:

1. **Exact / widening** primitive match (\`int\` → \`long\` → \`double\`) — no boxing.
2. Then **boxing/unboxing** (\`int\` → \`Integer\`).
3. Then **varargs** — last resort.

\`\`\`java
void f(long x)    { }   // f(7) picks this (widening)...
void f(Integer x) { }   // ...NOT this (boxing loses to widening)
void f(int... x)  { }   // varargs only if nothing else fits
\`\`\`

The classic surprises:

- **\`null\` picks the most specific reference type**: with \`g(Object)\` and \`g(String)\`, \`g(null)\` calls the \`String\` one. With \`g(String)\` and \`g(StringBuilder)\` — *ambiguous*, compile error.
- **The runtime object doesn't matter**: \`Animal a = new Dog(); h(a);\` calls \`h(Animal)\`, never \`h(Dog)\`. Overloading is static; only *overriding* looks at the real object.

:::senior
*Effective Java*: don't write overloads that differ only in ways resolution makes confusing (e.g. \`List.remove(int)\` vs \`remove(Object)\` — the autoboxing trap). Prefer distinct names.
:::`,
  },
  {
    id: 'oop-pil-upcasting-downcasting',
    question: 'Explain upcasting and downcasting. When do you get a ClassCastException, and how do you guard against it?',
    difficulty: 'Medium',
    category: 'Four Pillars',
    tags: ['casting', 'instanceof', 'pattern-matching'],
    answer: `A cast never changes the object — only the **static type of the reference** you hold on it.

- **Upcast** (subtype → supertype): implicit, always safe, narrows what the compiler lets you *call*. \`Animal a = new Dog();\`
- **Downcast** (supertype → subtype): explicit, **checked at runtime**. If the object isn't actually that subtype → \`ClassCastException\`.

\`\`\`java
Animal a = new Cat();
Dog d = (Dog) a;                 // compiles; throws ClassCastException at runtime

if (a instanceof Dog dog) {      // Java 16+ pattern matching: test + cast + bind
  dog.fetch();                   // safe, no explicit cast
}
\`\`\`

The \`instanceof\` pattern makes the guard-and-cast idiom atomic — no separate cast line to get wrong.

:::gotcha
Code littered with \`instanceof\`/downcasts usually means a **missing polymorphic method**: instead of asking each object what it is, give the base type a method and let dispatch decide. The modern exception: \`sealed\` hierarchies + \`switch\` pattern matching, where exhaustive type-switching is a deliberate style.
:::`,
  },
  {
    id: 'oop-pil-polymorphism-via-interfaces',
    question: 'How do interfaces give you polymorphism without class inheritance?',
    difficulty: 'Medium',
    category: 'Four Pillars',
    tags: ['interface', 'polymorphism', 'design'],
    answer: `Runtime polymorphism needs a **common type** and **dynamic dispatch** — not a common *class*. An interface supplies the type; completely unrelated classes supply the behaviours:

\`\`\`java
interface NotificationChannel { void send(String msg); }

class EmailChannel implements NotificationChannel { public void send(String m) { ... } }
class SmsChannel   implements NotificationChannel { public void send(String m) { ... } }
class PushChannel  implements NotificationChannel { public void send(String m) { ... } }

for (NotificationChannel ch : channels) ch.send("Order shipped");  // one message, three behaviours
\`\`\`

No shared superclass, no inherited state — just a shared **contract**. Each class keeps its own hierarchy and can implement many other interfaces besides.

:::senior
This is the dominant form of polymorphism in modern codebases: \`extends\` is rare, while interface-typed collaborators injected via DI are everywhere. If an interviewer asks "polymorphism example from your real work", name an interface seam (repository, client, strategy) — not \`Dog extends Animal\`.
:::`,
  },
  {
    id: 'oop-pil-abstract-method',
    question: 'What is an abstract method, and when would you declare one?',
    difficulty: 'Easy',
    category: 'Four Pillars',
    tags: ['abstraction', 'abstract-method'],
    answer: `An **abstract method** declares a signature with **no body** — a promise that every concrete subclass must fulfil:

\`\`\`java
abstract class Shape {
  abstract double area();                      // the "hole" each subclass fills
  String describe() { return "area=" + area(); } // concrete code can already USE it
}
class Circle extends Shape {
  private final double r;
  Circle(double r) { this.r = r; }
  @Override double area() { return Math.PI * r * r; }
}
\`\`\`

Declare one when the base type **knows a step must exist but not how to do it**. Rules: an abstract method forces the class itself to be \`abstract\`; it can't be \`private\`, \`static\`, or \`final\` (each would make overriding impossible — the whole point).

:::tip
\`describe()\` calling \`area()\` above is the seed of the **Template Method** pattern: concrete skeleton in the parent, abstract steps filled by children.
:::`,
  },
  {
    id: 'oop-pil-real-world-four-pillars',
    question: 'Give one real-world example that demonstrates all four pillars at once.',
    difficulty: 'Easy',
    category: 'Four Pillars',
    tags: ['pillars', 'example', 'interview-technique'],
    answer: `Have **one prepared story** — a car works well:

| Pillar | In the car domain | In code |
|--|--|--|
| **Encapsulation** | fuel level isn't a public dial you can set — you add fuel through the filler neck, which meters it | \`private double fuel; void refuel(double l) { validate... }\` |
| **Abstraction** | the driver turns a key — ignition timing and fuel injection are hidden | \`void start()\` hiding the sequence |
| **Inheritance** | an electric car *is a* car — same controls, shared core | \`class ElectricCar extends Car\` |
| **Polymorphism** | "start the car" behaves differently: ICE cranks, EV just powers on | \`car.start()\` dispatching to the override |

\`\`\`java
Car car = new ElectricCar();
car.start();   // silent power-on — runtime picks the EV behaviour
\`\`\`

:::tip
In the interview, walking one coherent domain through all four pillars lands far better than four disconnected textbook snippets — it shows you *model*, not just recite.
:::`,
  },
  {
    id: 'oop-pil-polymorphism-benefits',
    question: 'Why does polymorphism matter in a large codebase — what does it eliminate?',
    difficulty: 'Easy',
    category: 'Four Pillars',
    tags: ['polymorphism', 'open-closed', 'design'],
    answer: `Polymorphism is what makes code **extensible without edits**. Concretely it eliminates the type-\`switch\`:

\`\`\`java
// Without polymorphism — every new shape edits this (and every switch like it)
double area(Shape s) {
  return switch (s.type) { case CIRCLE -> ...; case SQUARE -> ...; };
}

// With polymorphism — new shape = new class, zero edits elsewhere
for (Shape s : shapes) total += s.area();
\`\`\`

The payoffs:

1. **Open/Closed** — add \`Triangle\` by *adding* a class; tested callers stay untouched.
2. **Substitutability for tests** — a fake \`PaymentGateway\` slots in where the real one goes.
3. **Plugin points** — frameworks call your override (\`toString\`, servlet \`doGet\`) without knowing your class exists.

:::key
One sentence for interviews: *polymorphism moves the "which type is this?" decision from scattered conditionals into the runtime dispatch, so adding a type stops being a shotgun edit.*
:::`,
  },
  {
    id: 'oop-pil-interface-extends-multiple',
    question: 'Can an interface extend multiple interfaces?',
    difficulty: 'Easy',
    category: 'Four Pillars',
    tags: ['interface', 'inheritance', 'multiple-inheritance'],
    answer: `Yes — interfaces use \`extends\` (never \`implements\`) and may extend **many** at once, because there's no instance state to conflict:

\`\`\`java
interface ByteChannel extends ReadableByteChannel, WritableByteChannel { }  // real JDK example
\`\`\`

The full inheritance matrix:

| | extends class | extends interfaces | implements interfaces |
|--|--|--|--|
| **class** | exactly 1 | — | many |
| **interface** | — | many | — |

If two parent interfaces declare the *same abstract method*, that's fine — one implementation satisfies both. If they bring **conflicting \`default\` bodies**, the inheriting interface (or class) must override to disambiguate, optionally delegating with \`X.super.method()\`.

:::tip
This is how the JDK composes capabilities: \`NavigableMap extends SortedMap\`, \`ByteChannel\` above — small role interfaces merged into richer contracts.
:::`,
  },
];

export default questions;
