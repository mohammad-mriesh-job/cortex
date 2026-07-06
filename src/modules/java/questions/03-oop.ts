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
  {
    id: 'oop-four-pillars',
    question: 'What are the four pillars of OOP?',
    difficulty: 'Easy',
    category: 'OOP',
    tags: ['fundamentals', 'pillars', 'screening'],
    answer: `| Pillar | One-liner | In Java |
|--------|-----------|---------|
| **Encapsulation** | bundle state + behaviour, hide internals | \`private\` fields behind a small public API |
| **Abstraction** | expose *what*, hide *how* | interfaces, abstract classes |
| **Inheritance** | reuse and specialise a type | \`extends\` / \`implements\` |
| **Polymorphism** | one call, many behaviours | overriding + dynamic dispatch |

A concrete thread through all four: a \`List\` **abstracts** "an ordered collection"; \`ArrayList\` **encapsulates** its backing array; it **inherits** from \`AbstractList\`; and \`list.add(x)\` is **polymorphic** — the same call runs different code for \`ArrayList\` vs \`LinkedList\`.

:::tip
Interviewers often follow up with "which matters most?" A strong answer: encapsulation and polymorphism carry most real-world value; inheritance is the one to use *sparingly* (prefer composition).
:::`,
  },
  {
    id: 'oop-abstraction-vs-encapsulation',
    question: 'What is the difference between abstraction and encapsulation?',
    difficulty: 'Medium',
    category: 'OOP',
    tags: ['abstraction', 'encapsulation', 'design'],
    answer: `They're complementary kinds of hiding:

- **Abstraction** hides **complexity** at the *design* level — you model *what* an operation is, not *how* it works. Tool: interfaces and abstract types. \`Connection.commit()\` — you neither know nor care how the driver does it.
- **Encapsulation** hides **data/implementation** at the *code* level — internals are inaccessible so invariants can't be violated. Tool: \`private\` + accessors.

\`\`\`java
interface PaymentGateway { Receipt charge(Money amount); }  // abstraction — the "what"

class StripeGateway implements PaymentGateway {
    private final HttpClient http;   // encapsulation — hidden "how"
    public Receipt charge(Money amount) { /* ... */ }
}
\`\`\`

Rule of thumb: **abstraction is for the caller** (a simpler mental model), **encapsulation is for the maintainer** (freedom to change internals safely).

:::tip
A crisp interview line: "Abstraction hides *what you don't need to know*; encapsulation hides *what you're not allowed to touch*."
:::`,
  },
  {
    id: 'oop-access-modifiers',
    question: 'Explain the four access levels in Java.',
    difficulty: 'Easy',
    category: 'OOP',
    tags: ['access-modifiers', 'encapsulation', 'visibility'],
    answer: `From most open to most closed:

| Modifier | Same class | Same package | Subclass (other pkg) | Everywhere |
|----------|-----------|--------------|----------------------|------------|
| \`public\` | ✔ | ✔ | ✔ | ✔ |
| \`protected\` | ✔ | ✔ | ✔ | ✖ |
| *(none — package-private)* | ✔ | ✔ | ✖ | ✖ |
| \`private\` | ✔ | ✖ | ✖ | ✖ |

Notes interviewers probe:

- **No modifier** = *package-private* (the default), not "public-lite". It's great for hiding helper classes inside a package.
- \`protected\` also grants **package** access — it's strictly wider than package-private.
- Top-level classes can only be \`public\` or package-private; \`private\`/\`protected\` apply to **members** and **nested** classes.

:::senior
Default to the **narrowest** level that works (*Effective Java*: "minimize accessibility"). Every \`public\` member is API you must support forever; package-private is the workhorse of well-encapsulated library design.
:::`,
  },
  {
    id: 'oop-multiple-inheritance-why',
    question: 'Why does Java not support multiple inheritance of classes?',
    difficulty: 'Easy',
    category: 'OOP',
    tags: ['inheritance', 'diamond', 'design'],
    answer: `To avoid the **diamond problem for state and behaviour**: if \`C extends A, B\` and both parents define a field \`count\` or method \`step()\`, which one does \`C\` get? C++ answers with complex virtual-inheritance rules; Java's designers chose to exclude the ambiguity entirely.

What Java allows instead:

- **Multiple interface implementation** — an interface (classically) carries no state, so there's nothing ambiguous to inherit: \`class Duck implements Swimmer, Flyer\`.
- Since Java 8, interfaces can have \`default\` methods, which reintroduces a *behaviour* diamond — but the compiler forces you to **override and resolve explicitly** (\`A.super.method()\`), so it's never silent.
- **Composition** — hold both capabilities as fields and delegate, which is usually the better design anyway.

:::note
Fields are the heart of it: interfaces still cannot declare instance state, so Java never has to answer "whose \`count\`?" — the truly unsolvable half of the diamond.
:::`,
  },
  {
    id: 'oop-method-hiding',
    question: 'Can you override a static method? What is method hiding?',
    difficulty: 'Medium',
    category: 'OOP',
    tags: ['static', 'method-hiding', 'overriding'],
    answer: `**No.** A static method with the same signature in a subclass **hides** the parent's version — it doesn't override it. The difference shows at the call site: hidden methods are resolved by the **reference's compile-time type**, overridden ones by the **object's runtime type**.

\`\`\`java
class Parent {
    static String who() { return "Parent"; }
    String name() { return "Parent"; }
}
class Child extends Parent {
    static String who() { return "Child"; }        // hides
    @Override String name() { return "Child"; }    // overrides
}

Parent p = new Child();
p.who();    // "Parent"  — static: decided at compile time
p.name();   // "Child"   — instance: dynamic dispatch
\`\`\`

Static methods belong to a class, not an object, so there is no receiver to dispatch on. The same static-binding rule applies to **fields** and \`private\` methods.

:::gotcha
Putting \`@Override\` on a static method is a compile error — a quick way to prove to yourself (and an interviewer) that no overriding is happening. Always call statics via the class name, never through a reference.
:::`,
  },
  {
    id: 'oop-covariant-returns',
    question: 'What is a covariant return type?',
    difficulty: 'Medium',
    category: 'OOP',
    tags: ['overriding', 'covariance', 'inheritance'],
    answer: `Since Java 5, an overriding method may **narrow** its return type to a subtype of the parent's return type. The override still fulfils the parent's contract — every \`Sub\` it returns *is* a \`Super\` — but callers who know the subtype get it **without casting**.

\`\`\`java
class Shape {
    Shape copy() { return new Shape(); }
}
class Circle extends Shape {
    @Override
    Circle copy() { return new Circle(); }   // covariant — Circle is-a Shape
}

Circle c2 = new Circle().copy();  // no cast needed
\`\`\`

Real uses: \`clone()\` overrides returning the concrete type, and fluent builders where each subclass \`self()\` returns its own type.

Parameters, by contrast, must stay **invariant** — changing a parameter type creates an *overload*, not an override (the silent-bug case \`@Override\` exists to catch).

:::senior
Under the hood the JVM sees the two return types as different signatures, so the compiler emits a **bridge method** with the parent's signature delegating to yours — the same mechanism generics use after erasure.
:::`,
  },
  {
    id: 'oop-constructor-rules',
    question: 'What rules govern constructors — default constructor, overloading, this() chaining, private constructors?',
    difficulty: 'Medium',
    category: 'OOP',
    tags: ['constructors', 'this', 'chaining'],
    answer: `The facts interviewers check:

1. **Default constructor** — the compiler adds a no-arg constructor **only if you declare none**. Add any constructor and the freebie disappears (breaking \`new Foo()\` callers).
2. **Overloading** — multiple constructors with different parameter lists are normal; route them into one "canonical" constructor to avoid duplicated logic.
3. **\`this(...)\` chaining** — one constructor can call another; it must be the **first statement**, and you can't have both \`this(...)\` and \`super(...)\` (the chained-to constructor handles \`super\`).
4. **\`private\` constructors** — block outside instantiation: utility classes, singletons, and forcing use of **static factory methods** (\`LocalDate.of\`), which can cache, name intent, or return subtypes.

\`\`\`java
class Pizza {
    private final List<String> toppings;
    Pizza() { this(List.of()); }                  // chains ↓
    Pizza(List<String> t) { toppings = List.copyOf(t); }
}
\`\`\`

5. Constructors are **not inherited** and can't be \`abstract\`, \`final\`, or \`static\`.

:::gotcha
Calling an **overridable method from a constructor** is a classic trap: the subclass override runs *before* the subclass's fields are initialised, observing \`null\`/\`0\` state.
:::`,
  },
  {
    id: 'oop-inner-classes',
    question: 'What kinds of nested classes exist, and when do you use each?',
    difficulty: 'Medium',
    category: 'OOP',
    tags: ['inner-classes', 'nested-classes', 'anonymous'],
    answer: `| Kind | Declared | Holds outer ref? | Use for |
|------|----------|-----------------|---------|
| **Static nested** | \`static class\` inside a class | **no** | grouping a helper with its owner (\`Map.Entry\`) |
| **Inner** | non-static member class | **yes** | objects that genuinely need the outer instance (\`Iterator\` over the outer collection) |
| **Local** | inside a method | yes (if non-static context) | rare; one-method helper types |
| **Anonymous** | inline \`new Type() {...}\` | yes | one-off implementations; mostly replaced by lambdas for functional interfaces |

\`\`\`java
class Outer {
    private int x = 1;
    class Inner { int read() { return x; } }        // captures Outer.this
    static class Nested { }                          // independent
}
new Outer().new Inner();   // inner needs an outer instance
\`\`\`

:::gotcha
An inner (non-static) class holds a hidden \`Outer.this\` reference. Store one somewhere long-lived and you **leak the entire outer object** — the classic Android/listener memory leak. *Effective Java*: make nested classes **static** unless they truly need the outer instance.
:::`,
  },
  {
    id: 'oop-immutable-class',
    question: 'How do you write an immutable class in Java?',
    difficulty: 'Medium',
    category: 'OOP',
    tags: ['immutability', 'final', 'defensive-copy'],
    answer: `The recipe:

1. Make the class **\`final\`** (or all constructors private) so no mutable subclass can masquerade as it.
2. Make every field **\`private final\`**.
3. **No setters** or any method that mutates state — "modifiers" return a new instance.
4. **Defensive-copy mutable inputs** in the constructor and **never return mutable internals** (return copies or immutable views).
5. Don't let \`this\` escape during construction.

\`\`\`java
public final class Schedule {
    private final List<LocalDate> dates;

    public Schedule(List<LocalDate> dates) {
        this.dates = List.copyOf(dates);      // defensive copy in
    }
    public List<LocalDate> dates() {
        return dates;                          // already immutable — safe out
    }
    public Schedule plus(LocalDate d) {        // "mutator" returns new object
        var next = new ArrayList<>(dates); next.add(d);
        return new Schedule(next);
    }
}
\`\`\`

Payoff: thread-safe with zero locks, safe to cache and share, valid from construction onward.

:::tip
A \`record\` gives you steps 1–3 for free — but **not** step 4: \`record Schedule(List<LocalDate> dates)\` still needs \`dates = List.copyOf(dates)\` in a compact constructor to be *deeply* immutable.
:::`,
  },
  {
    id: 'oop-equals-without-hashcode',
    question: 'What happens if you override equals() but not hashCode()?',
    difficulty: 'Hard',
    category: 'OOP',
    tags: ['equals', 'hashcode', 'hashmap', 'contract'],
    answer: `You break the contract "**equal objects must have equal hash codes**" — and every hash-based collection silently malfunctions.

Two logically equal objects keep \`Object\`'s identity-based hash codes, land in **different buckets**, and are treated as different keys:

\`\`\`java
class Point {                       // equals overridden, hashCode NOT
    final int x, y;
    // equals compares x and y ...
}

Set<Point> set = new HashSet<>();
set.add(new Point(1, 2));
set.contains(new Point(1, 2));   // false! different bucket
set.add(new Point(1, 2));        // "duplicate" accepted — set size 2

Map<Point, String> map = new HashMap<>();
map.put(new Point(1, 2), "A");
map.get(new Point(1, 2));        // null — lookup hashes to another bucket
\`\`\`

The failure is nasty because it's **intermittent-looking**: sometimes two objects collide into the same bucket by luck and \`equals\` then matches.

The reverse mistake (hashCode without equals) breaks differently: unequal-but-same-hash objects collide, chain in one bucket, and \`equals\` keeps them apart — correct but slower.

:::key
Override them **together**, from the **same fields** — or use a \`record\`/IDE generation and never hand-roll the pair.
:::`,
  },
  {
    id: 'oop-marker-interface',
    question: 'What is a marker interface? Why use one instead of an annotation?',
    difficulty: 'Easy',
    category: 'OOP',
    tags: ['marker-interface', 'serializable', 'design'],
    answer: `A **marker interface** declares **no methods** — implementing it simply *tags* the class with a capability that code can test for. JDK examples: \`Serializable\`, \`Cloneable\`, \`RandomAccess\`.

\`\`\`java
if (list instanceof RandomAccess) { /* index-based loop is O(1) per get */ }
\`\`\`

\`ObjectOutputStream\` checks \`instanceof Serializable\` and throws \`NotSerializableException\` otherwise; \`Object.clone()\` throws \`CloneNotSupportedException\` without \`Cloneable\`.

**Marker interface vs annotation:**

- An interface participates in the **type system**: a method can demand \`void store(Serializable s)\` and the compiler enforces it at **compile time**. An annotation check happens only at runtime via reflection.
- Interfaces are inherited by subclasses; annotations only with \`@Inherited\` (and never on interfaces you implement).
- Annotations carry **parameters** and suit tool/framework metadata (\`@Deprecated\`, \`@Entity\`).

:::senior
*Effective Java*: if you might ever write a method that accepts only marked types, use a marker **interface**; otherwise an annotation is more flexible. (And \`Cloneable\` is the cautionary tale of marker design — it doesn't even contain the \`clone\` method it enables.)
:::`,
  },
  {
    id: 'oop-records-vs-lombok',
    question: 'Records vs Lombok vs plain classes — how do you choose?',
    difficulty: 'Medium',
    category: 'OOP',
    tags: ['records', 'lombok', 'boilerplate', 'design'],
    answer: `| | Record | Lombok class | Plain class |
|--|--------|--------------|-------------|
| Nature | language feature | compile-time codegen | hand-written |
| Mutability | **immutable** components | your choice (\`@Data\` = mutable) | your choice |
| Can extend a class | no | yes | yes |
| Semantics guaranteed | yes — by the JLS | only what annotations you added | whatever you wrote |

- **Record** — the default for **immutable data carriers**: DTOs, API responses, map keys, config values. Value-based \`equals\`/\`hashCode\`/\`toString\` guaranteed by the language, understood by every tool, pattern-matching friendly.
- **Lombok** — for classes that **can't be records**: JPA entities (need a no-arg constructor, mutability, lazy proxies), classes needing inheritance, or when you want \`@Builder\`/\`@With\` conveniences. Cost: an annotation-processor dependency that hooks compiler internals and occasionally breaks on new JDKs.
- **Plain class** — when there's real behaviour and invariants: encapsulated domain logic where generated accessors would be wrong anyway.

:::gotcha
\`@Data\` on a JPA entity is a classic bug source: its generated \`equals\`/\`hashCode\` use all fields (including the ID that changes on persist) and \`toString\` can trigger lazy-loading. Records don't fix this either — entities want *identity* semantics, not value semantics.
:::`,
  },
];

export default questions;
