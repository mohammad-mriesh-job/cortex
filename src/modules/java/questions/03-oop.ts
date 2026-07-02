import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'oop-class-vs-object',
    question: 'What is the difference between a class and an object?',
    difficulty: 'Easy',
    category: 'OOP',
    tags: ['classes', 'objects', 'basics'],
    answer: `A **class** is a blueprint that defines state (fields) and behaviour (methods). An **object** is a concrete instance of that class, created with \`new\`, living on the heap with its own copy of the instance fields.

\`\`\`java
class Car { String colour; }      // blueprint
Car a = new Car();                // an object
Car b = new Car();                // a different object
\`\`\`

One class can produce unlimited objects, each with independent state. A variable like \`a\` holds a **reference** to the object, not the object itself.`,
  },
  {
    id: 'oop-instance-vs-static',
    question: 'Instance members vs static members — what is the difference?',
    difficulty: 'Easy',
    category: 'OOP',
    tags: ['static', 'fields', 'methods'],
    answer: `- **Instance members** belong to each object — one copy per instance, accessed via a reference, and they can use \`this\`.
- **Static members** belong to the class — a single shared copy, accessed via the class name, and they **cannot** use \`this\` or call instance methods directly.

\`\`\`java
class Counter {
    static int total;   // shared by all instances
    int id;             // unique per instance
}
\`\`\`

:::senior
Mutable \`static\` state is effectively a global variable: shared across threads and alive for the JVM's lifetime. Reserve \`static\` for \`final\` constants and stateless helpers.
:::`,
  },
  {
    id: 'oop-encapsulation-why',
    question: 'What is encapsulation and why is it useful?',
    difficulty: 'Easy',
    category: 'OOP',
    tags: ['encapsulation', 'access-modifiers'],
    answer: `**Encapsulation** is bundling data with the methods that act on it and hiding the internal representation behind a controlled API (usually \`private\` fields plus accessor methods).

Benefits:
1. **Invariants** — the class validates every change, so it can never enter an invalid state.
2. **Flexibility** — internal representation can change without breaking callers.
3. **Reduced coupling** — a small public surface is easier to use and refactor.

\`\`\`java
class Account {
    private double balance;
    void deposit(double amt) {
        if (amt <= 0) throw new IllegalArgumentException();
        balance += amt;       // validated — balance stays valid
    }
}
\`\`\`

:::gotcha
A trivial getter/setter pair that just mirrors a public field adds ceremony without protection. The value is in the *logic* an accessor can enforce.
:::`,
  },
  {
    id: 'oop-super-constructor-chaining',
    question: 'What does super do, and how does constructor chaining work?',
    difficulty: 'Medium',
    category: 'OOP',
    tags: ['inheritance', 'super', 'constructors'],
    answer: `\`super\` refers to the superclass. \`super(...)\` calls a superclass constructor and **must be the first statement** in a subclass constructor; \`super.method()\` invokes the parent's version of an overridden method.

A subclass must initialise its parent first, so construction chains **up** to \`Object\`, then bodies run **down**:

\`\`\`java
class Animal { Animal(String n) { /* ... */ } }
class Dog extends Animal {
    Dog(String n) { super(n); /* then Dog's own init */ }
}
\`\`\`

:::gotcha
If the superclass has no no-arg constructor, the compiler's implicit \`super()\` fails — you must call \`super(args)\` explicitly.
:::`,
  },
  {
    id: 'oop-composition-over-inheritance',
    question: 'Why is composition often preferred over inheritance?',
    difficulty: 'Medium',
    category: 'OOP',
    tags: ['inheritance', 'composition', 'design'],
    answer: `Inheritance couples a subclass to its parent's **implementation**, so a superclass change can silently break subclasses — the *fragile base class* problem. It also forces an is-a relationship and is limited to a single parent.

**Composition** (holding another object as a field and delegating to it) is looser, more flexible, and lets you combine many collaborators.

\`\`\`java
class Logger { void log(String m) { } }
class Service {
    private final Logger logger = new Logger(); // HAS-A, delegates
}
\`\`\`

:::senior
*Effective Java*: "Favour composition over inheritance." Inherit only when there's a genuine is-a relationship **and** the superclass was designed and documented for extension.
:::`,
  },
  {
    id: 'oop-overriding-vs-overloading',
    question: 'Overriding vs overloading — what is the difference?',
    difficulty: 'Medium',
    category: 'OOP',
    tags: ['polymorphism', 'overriding', 'overloading'],
    answer: `| | Overriding | Overloading |
|---|---|---|
| Where | subclass redefines a parent method | same name, same class |
| Signature | **identical** | **different** parameters |
| Resolved | **runtime** (dynamic dispatch) | **compile time** (static) |

\`\`\`java
int add(int a, int b);        // overload
double add(double a, double b); // overload — different params

class Dog extends Animal {
    @Override String speak() { return "Woof"; } // override
}
\`\`\`

:::gotcha
Always add \`@Override\`. Without it, a mismatched signature silently becomes an *overload* that nothing calls — the classic \`equals(MyType)\` bug.
:::`,
  },
  {
    id: 'oop-dynamic-dispatch',
    question: 'How does Java decide which overridden method to call at runtime?',
    difficulty: 'Medium',
    category: 'OOP',
    tags: ['polymorphism', 'dynamic-dispatch'],
    answer: `Through **dynamic (late) binding**: for overridden instance methods, the JVM picks the implementation based on the object's **runtime type**, not the reference's declared type. It's implemented via a per-class **virtual method table (vtable)**.

\`\`\`java
Animal a = new Dog();
a.speak();   // runs Dog.speak() — chosen by the actual object
\`\`\`

Exceptions that use **static binding** (declared type): \`static\`, \`private\`, and \`final\` methods, plus **field access**.

:::note
Fields are not polymorphic — \`a.name\` reads \`Animal\`'s field even if the object is a \`Dog\` that declares its own \`name\`.
:::`,
  },
  {
    id: 'oop-abstract-class-vs-interface',
    question: 'When would you use an abstract class vs an interface?',
    difficulty: 'Medium',
    category: 'OOP',
    tags: ['abstraction', 'interfaces', 'abstract-class'],
    answer: `| Aspect | Interface | Abstract class |
|--------|-----------|----------------|
| Instance state | ❌ (constants only) | ✅ |
| Constructors | ❌ | ✅ |
| Multiple inheritance | ✅ implement many | ❌ extend one |
| Models | a *capability* | a *kind-of* |

Use an **interface** to declare a capability ("can-do") and keep types open to multiple implementations — the flexible default. Use an **abstract class** when subtypes share mutable state or constructor logic and there's a true is-a relationship.

:::tip
Since Java 8 interfaces have \`default\`/\`static\`/\`private\` methods, narrowing the gap — but only abstract classes can hold instance fields and constructors.
:::`,
  },
  {
    id: 'oop-diamond-problem',
    question: 'How does Java resolve the diamond problem with default methods?',
    difficulty: 'Hard',
    category: 'OOP',
    tags: ['interfaces', 'default-methods', 'diamond'],
    answer: `If a class implements two interfaces that each provide a \`default\` method with the **same signature**, the compiler refuses to guess — it forces you to **override** the method and choose explicitly with \`Interface.super.method()\`.

\`\`\`java
interface A { default String hi() { return "A"; } }
interface B { default String hi() { return "B"; } }

class C implements A, B {
    @Override public String hi() {
        return A.super.hi();   // explicitly pick A
    }
}
\`\`\`

Classic multiple-inheritance ambiguity is largely avoided because interfaces hold no instance state; the diamond only arises with conflicting default *implementations*, and the language mandates an explicit resolution.`,
  },
  {
    id: 'oop-equals-hashcode-correct',
    question: 'How do you correctly implement equals() and hashCode()?',
    difficulty: 'Hard',
    category: 'OOP',
    tags: ['equals', 'hashcode', 'object'],
    answer: `Override **both together**, using the **same immutable fields**, and honour the contract: equal objects must return equal hash codes.

\`\`\`java
@Override public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Point p)) return false;
    return x == p.x && y == p.y;
}
@Override public int hashCode() { return Objects.hash(x, y); }
\`\`\`

- **\`getClass()\`** check → strict, symmetric, but a subclass can never equal its parent.
- **\`instanceof\`** check → lets subclasses compare equal, but only safe if they add no significant fields.

:::gotcha
If a field used in \`hashCode\` changes while the object sits in a \`HashSet\`/\`HashMap\`, the entry lands in the wrong bucket and effectively disappears. Use immutable fields for equality.
:::

:::senior
A \`record\` generates a correct value-based \`equals\`/\`hashCode\`/\`toString\` for you — the modern way to avoid this boilerplate entirely.
:::`,
  },
  {
    id: 'oop-enum-singleton',
    question: 'Why is a single-element enum the best way to implement a singleton?',
    difficulty: 'Medium',
    category: 'OOP',
    tags: ['enums', 'singleton', 'design-patterns'],
    answer: `A one-constant enum gives a singleton that is **thread-safe** and **serialization-safe** by construction, with no boilerplate:

\`\`\`java
public enum Config {
    INSTANCE;
    private final Map<String, String> values = new HashMap<>();
    public String get(String k) { return values.get(k); }
}
\`\`\`

The JVM guarantees exactly one instance and blocks the usual attacks on hand-written singletons: **reflection** can't instantiate an enum, and **deserialization** won't create a second copy. The classic private-constructor approach needs double-checked locking and a \`readResolve\` to match this — and still risks subtle bugs.

:::tip
*Effective Java* calls the single-element enum "the best way to implement a singleton."
:::`,
  },
  {
    id: 'oop-records-sealed',
    question: 'What are records and sealed classes, and why use them together?',
    difficulty: 'Hard',
    category: 'OOP',
    tags: ['records', 'sealed', 'pattern-matching'],
    answer: `A **record** is a concise, immutable, value-based data carrier. From its components the compiler generates the constructor, accessors, and \`equals\`/\`hashCode\`/\`toString\`:

\`\`\`java
public record Point(int x, int y) { }
\`\`\`

A **sealed** type restricts which classes may extend/implement it via \`permits\`, creating a closed hierarchy the compiler fully understands:

\`\`\`java
sealed interface Shape permits Circle, Square { }
record Circle(double r) implements Shape { }
record Square(double s) implements Shape { }
\`\`\`

Together they enable **exhaustive \`switch\`** (Java 21) with no \`default\`. Add a new permitted subtype and every switch that doesn't handle it **fails to compile**:

\`\`\`java
double area(Shape s) {
    return switch (s) {
        case Circle c -> Math.PI * c.r() * c.r();
        case Square q -> q.s() * q.s();
    };
}
\`\`\`

:::senior
Sealed interfaces + records + switch patterns give Java algebraic data types. The compiler-checked exhaustiveness turns "did I handle every case?" into a compile-time guarantee — ideal for state machines, ASTs, and result types.
:::`,
  },
];

export default questions;
