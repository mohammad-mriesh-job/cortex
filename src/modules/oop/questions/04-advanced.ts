import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'oop-adv-interface-vs-abstract',
    question: 'When would you choose an interface over an abstract class, and vice versa?',
    difficulty: 'Medium',
    category: 'Advanced OOP',
    tags: ['interface', 'abstract class', 'design'],
    answer: `Pick based on the relationship and what you need to share.

- **Interface** — a *capability contract* ("can-do"). Use when unrelated types share a role, when you need to declare a type without any state, or when a class must have **multiple** such roles (a class can implement many interfaces). Only \`static final\` constants and \`default\`/\`static\`/\`private\` method bodies are allowed.
- **Abstract class** — a *partial base* ("is-a"). Use when closely related types share **state** (instance fields), a **constructor**, or concrete implementation. A class extends exactly one.

\`\`\`java
interface Payable { double pay(); }           // capability, implement many
abstract class Shape { protected String name; abstract double area(); } // shared state, extend one
\`\`\`

Rule of thumb: **"can-do" → interface; "is-a" with shared code/state → abstract class.**`,
  },
  {
    id: 'oop-adv-default-methods',
    question: 'What problem do interface default methods solve, and what is the diamond clash?',
    difficulty: 'Medium',
    category: 'Advanced OOP',
    tags: ['interface', 'default methods', 'diamond'],
    answer: `Before Java 8, adding a method to an interface broke **every** implementer. A **\`default\` method** ships a body on the interface, so existing implementers keep compiling and inherit the behavior for free (e.g. \`List.sort\`, \`Collection.stream\`).

The **clash**: if a class inherits two \`default\` methods with the same signature from two interfaces, the compiler can't choose — you must override and disambiguate:

\`\`\`java
class D implements B, C {
  public String greet() { return B.super.greet(); } // pick explicitly
}
\`\`\`

Default methods can't hold instance state and are for convenience methods, not for smuggling in a base class.`,
  },
  {
    id: 'oop-adv-static-vs-dynamic-binding',
    question: 'Explain static (early) binding vs dynamic (late) binding.',
    difficulty: 'Medium',
    category: 'Advanced OOP',
    tags: ['dispatch', 'binding', 'overriding'],
    answer: `- **Static / early binding** — the method is resolved at **compile time** from the **reference (declared) type**. Applies to overloaded methods, \`static\`, \`private\`, and \`final\` methods, and field access.
- **Dynamic / late binding** — an overridden **instance** method is resolved at **runtime** from the **object's real type**, via the class's vtable.

\`\`\`java
Animal a = new Dog();
a.speak();   // dynamic → Dog.speak()  (object type)
a.kind();    // if static → Animal.kind() (reference type)
\`\`\`

Only overridable instance methods are dynamically dispatched; everything else binds statically, which also lets the JIT inline it.`,
  },
  {
    id: 'oop-adv-vtable',
    question: 'How does the JVM implement virtual method dispatch under the hood?',
    difficulty: 'Hard',
    category: 'Advanced OOP',
    tags: ['vtable', 'dispatch', 'jvm'],
    answer: `Each class has a **vtable** (virtual method table): an array of pointers to the method bodies for that class. Overridden slots point to the subclass body; non-overridden slots reuse the inherited one. Every object's header points at its class's vtable.

A virtual call is therefore just *"index into the vtable and jump"* — cheap and constant-time regardless of hierarchy depth.

Because \`final\`, \`private\`, and \`static\` methods aren't dispatchable, they live outside the vtable and can be **inlined** by the JIT. That's why marking a hot method \`final\` can help performance.`,
  },
  {
    id: 'oop-adv-diamond-problem',
    question: 'What is the diamond problem and how does Java avoid it?',
    difficulty: 'Hard',
    category: 'Advanced OOP',
    tags: ['diamond', 'inheritance', 'interface'],
    answer: `The **diamond problem**: a type \`D\` inherits from two parents that both descend from a common \`A\`. If both paths carry **state and implementation**, which \`A\` does \`D\` get — and are its fields duplicated?

Java sidesteps it for state by allowing a class to \`extends\` **only one** class. Interfaces (which have no instance state) may be multiply-inherited, and when two \`default\` methods collide the compiler forces an explicit resolution:

\`\`\`java
class D implements B, C {          // both extend interface A
  public String greet() { return B.super.greet(); }
}
\`\`\`

"Most specific" rules mean a sub-interface's default wins over its parent's; unrelated clashes must be resolved by hand.`,
  },
  {
    id: 'oop-adv-static-hiding',
    question: 'Can a static method be overridden? What is static hiding?',
    difficulty: 'Medium',
    category: 'Advanced OOP',
    tags: ['static', 'hiding', 'overriding'],
    answer: `No — \`static\` methods are **not** overridden; redefining one in a subclass **hides** it. Static methods have no vtable slot, so the call is bound at **compile time** by the **reference type**, not the object.

\`\`\`java
class Animal { static String kind() { return "animal"; } }
class Dog extends Animal { static String kind() { return "dog"; } }
Animal a = new Dog();
a.kind();   // "animal" — reference type wins (hiding, not overriding)
\`\`\`

Contrast with an instance method, which would dispatch to \`Dog\` and return "dog". Always call statics via the class name to avoid the confusion.`,
  },
  {
    id: 'oop-adv-equals-vs-eqeq',
    question: 'What is the difference between == and .equals()?',
    difficulty: 'Easy',
    category: 'Advanced OOP',
    tags: ['equals', 'identity', 'equality'],
    answer: `- **\`==\`** compares **references** for objects (identity): are these the *same* object on the heap? For primitives it compares values.
- **\`.equals()\`** compares **contents** (value) — *if* overridden. The default \`Object.equals\` just does \`==\`.

\`\`\`java
Point a = new Point(1, 2), b = new Point(1, 2);
a == b;        // false — different objects
a.equals(b);   // true  — same value (with a value-based equals)
\`\`\`

Use \`.equals()\` for logical equality; reserve \`==\` for identity checks and \`null\` tests. Watch boxed \`Integer\` caching (\`-128..127\`), a classic \`==\` trap.`,
  },
  {
    id: 'oop-adv-hashcode-contract',
    question: 'Why must you override hashCode whenever you override equals?',
    difficulty: 'Hard',
    category: 'Advanced OOP',
    tags: ['hashCode', 'equals', 'collections'],
    answer: `Hash-based collections (\`HashMap\`, \`HashSet\`) locate an entry by its **hashCode** bucket first, then confirm with \`equals\`. The contract:

1. **Consistent** — same object, same hash while unchanged.
2. **Equal ⇒ equal hash** — \`a.equals(b)\` implies \`a.hashCode() == b.hashCode()\`.
3. **Not the reverse** — equal hashes may still be unequal (a legal collision).

If you override \`equals\` but not \`hashCode\`, two equal objects can hash to **different** buckets, so \`contains\`/\`get\` silently miss them:

\`\`\`java
@Override public int hashCode() { return Objects.hash(x, y); } // keep in sync
\`\`\`

Base both on **immutable** fields, or use a \`record\` which generates them for you.`,
  },
  {
    id: 'oop-adv-immutability-benefits',
    question: 'What makes a class immutable, and why is immutability valuable?',
    difficulty: 'Medium',
    category: 'Advanced OOP',
    tags: ['immutability', 'thread safety', 'value objects'],
    answer: `**Recipe:** \`final\` class (no subclassing), all fields \`private final\`, no setters/mutators, and **defensive copies** of any mutable inputs (constructor) and outputs (getters).

\`\`\`java
record Point(int x, int y) {}   // immutable by design
\`\`\`

**Benefits:**
- **Thread-safe** with no locks — no writes after construction, so no data races.
- **Safe sharing/caching** — no aliasing bugs.
- **Valid by construction** — invariants checked once.
- **Stable hash keys** — safe in \`HashMap\`/\`HashSet\`.
- **Simpler reasoning** — state can't change under you.

Note: \`final\` fixes a field's reference, not the object it points to — a \`final\` array's elements can still change, so copy or wrap mutable contents.`,
  },
  {
    id: 'oop-adv-defensive-copy',
    question: 'What is defensive copying and when do you need it?',
    difficulty: 'Medium',
    category: 'Advanced OOP',
    tags: ['immutability', 'defensive copy', 'encapsulation'],
    answer: `Defensive copying means copying a **mutable** object as it crosses your boundary, so callers can't reach in and mutate your internal state.

- **Copy in** (constructor/setter): store a copy, not the caller's reference.
- **Copy out** (getter): return a copy, not the internal reference.

\`\`\`java
final class Team {
  private final List<String> players;
  Team(List<String> players) { this.players = List.copyOf(players); } // in
  List<String> getPlayers() { return List.copyOf(players); }          // out
}
\`\`\`

Without it, an object with a mutable field (\`List\`, array, \`Date\`) isn't truly immutable — the caller's reference is a back door into your state.`,
  },
  {
    id: 'oop-adv-kinds-of-polymorphism',
    question: 'Name the three kinds of polymorphism with examples.',
    difficulty: 'Hard',
    category: 'Advanced OOP',
    tags: ['polymorphism', 'generics', 'overloading'],
    answer: `1. **Ad-hoc** (overloading) — same name, different unrelated bodies, chosen by the compiler from argument types: \`print(int)\` vs \`print(String)\`.
2. **Parametric** (generics) — one implementation over a type parameter \`T\`, type-safe for every type: \`Box<T>\`, \`List<T>\`.
3. **Subtype** (overriding) — the same signature dispatched at runtime to the object's real type: \`Animal a = new Dog(); a.speak();\`.

Mnemonic: *"same name / different bodies"* (ad-hoc), *"same body / any type"* (parametric), *"same signature / per-subclass body"* (subtype).`,
  },
  {
    id: 'oop-adv-generics-erasure',
    question: 'What are bounded type parameters and type erasure in Java generics?',
    difficulty: 'Hard',
    category: 'Advanced OOP',
    tags: ['generics', 'bounded types', 'erasure'],
    answer: `A **bounded type parameter** constrains \`T\` so you can use its members: \`<T extends Comparable<T>>\` lets you call \`compareTo\` on any \`T\`. Wildcards follow **PECS** — Producer \`extends\` (\`? extends Number\`, read-only), Consumer \`super\` (\`? super Integer\`, write).

**Type erasure**: generics are a compile-time feature. At runtime \`T\` is erased to its bound (or \`Object\`) and the compiler inserts casts, so \`Box<String>\` and \`Box<Integer>\` share one class. Consequences:

- No \`new T()\`, no \`new T[]\`.
- No \`instanceof List<String>\`.
- Overloads can't differ only by generic type argument.

Erasure keeps generics backward-compatible with pre-generics bytecode, at the cost of runtime type information.`,
  },
  {
    id: 'oop-adv-record',
    question: 'What is a Java record, and when should you use one?',
    difficulty: 'Easy',
    category: 'Advanced OOP',
    tags: ['record', 'immutability', 'value objects'],
    answer: `A **record** (Java 16+) is a concise, **immutable**, transparent carrier for data. One declaration generates the \`private final\` fields, a canonical constructor, accessors, and correct \`equals\`/\`hashCode\`/\`toString\`:

\`\`\`java
record Point(int x, int y) {}
new Point(1, 2).x();               // accessor is x(), not getX()

record Range(int lo, int hi) {
  Range {                           // compact constructor: validate once
    if (lo > hi) throw new IllegalArgumentException();
  }
}
\`\`\`

Use records for **value objects, DTOs, compound map keys, and multiple return values** — anywhere you'd otherwise hand-write a boilerplate immutable holder. A record can implement interfaces but **cannot extend** a class (it's implicitly \`final\`).

:::gotcha
A record is only *shallowly* immutable: \`record Team(List<Player> players)\` still lets callers mutate the list. Copy mutable components defensively in the compact constructor.
:::`,
  },
  {
    id: 'oop-adv-final-keyword',
    question: 'What are the three uses of the final keyword?',
    difficulty: 'Easy',
    category: 'Advanced OOP',
    tags: ['final', 'immutability', 'inheritance'],
    answer: `| \`final\` on a… | Means |
|--|--|
| **variable / field** | assign exactly once — a constant or write-once field |
| **method** | cannot be overridden — locks behaviour, lets the JIT inline it |
| **class** | cannot be subclassed — \`String\`, \`Integer\`, \`LocalDate\` |

\`\`\`java
final class Money { final long cents; Money(long c){ cents = c; } }  // no subclass, write-once field
\`\`\`

The subtle point for fields: \`final\` fixes the **reference**, not the object it points to.

:::gotcha
\`final List<String> xs\` means you can't reassign \`xs\`, but \`xs.add("!")\` still works — the *list* is mutable. \`final\` alone does not make an object immutable. (Also: a lambda or inner class can capture only \`final\` or *effectively final* locals.)
:::`,
  },
  {
    id: 'oop-adv-marker-interface',
    question: 'What is a marker interface, and how does it compare to an annotation?',
    difficulty: 'Easy',
    category: 'Advanced OOP',
    tags: ['marker interface', 'annotations', 'serializable'],
    answer: `A **marker interface** is an empty interface (no methods) that **tags** a class with a capability the runtime or compiler checks — \`Serializable\`, \`Cloneable\`, \`RandomAccess\`.

\`\`\`java
class Config implements Serializable { }   // "this type may be serialized"
if (obj instanceof Serializable) { ... }    // checked at runtime
\`\`\`

The modern alternative is an **annotation** (\`@FunctionalInterface\`). When to prefer each:

| Prefer marker interface | Prefer annotation |
|--|--|
| the mark defines a **type** | pure metadata, not a type |
| you want compile-time checking | applies to methods/fields/params too |
| bound generics/params by it (\`<T extends Serializable>\`) | no need to constrain types |

:::note
A marker interface gives you a real type the compiler enforces; an annotation is more flexible but invisible to the type system. \`Serializable\` is the canonical marker.
:::`,
  },
  {
    id: 'oop-adv-null-object',
    question: 'What is the Null Object pattern, and what problem does it solve?',
    difficulty: 'Easy',
    category: 'Advanced OOP',
    tags: ['null object', 'null', 'pattern'],
    answer: `Instead of returning \`null\` and forcing every caller to null-check, return a **do-nothing object** that implements the same interface with neutral behaviour.

\`\`\`java
interface Logger { void log(String m); }
class ConsoleLogger implements Logger { public void log(String m){ System.out.println(m); } }
enum NullLogger implements Logger { INSTANCE; public void log(String m) { /* no-op */ } }

Logger log = config.hasLogger() ? new ConsoleLogger() : NullLogger.INSTANCE;
log.log("started");   // always safe — no null check
\`\`\`

It removes scattered \`if (x != null)\` guards and prevents \`NullPointerException\`s. JDK examples: \`Collections.emptyList()\`, no-op handlers.

:::gotcha
Don't overuse it: a Null Object that silently swallows calls can **hide real bugs**. When absence is meaningful, \`Optional\` or an explicit \`null\` may communicate intent better.
:::`,
  },
  {
    id: 'oop-adv-static-nested-vs-inner',
    question: 'What is the difference between a static nested class and an inner class?',
    difficulty: 'Easy',
    category: 'Advanced OOP',
    tags: ['nested class', 'inner class', 'static'],
    answer: `Both are classes declared inside another, but the \`static\` modifier changes everything:

| | Static nested | Inner (non-static) |
|--|--|--|
| Outer instance ref | **none** | implicit \`Outer.this\` |
| Access outer instance fields | no | yes |
| Create with | \`new Outer.Nested()\` | \`outer.new Inner()\` |
| Like | a top-level class, just scoped | bound to one enclosing object |

\`\`\`java
class Outer {
  static class Node { }          // independent — no Outer needed
  class Cursor { }               // each Cursor is tied to an Outer instance
}
\`\`\`

**Prefer \`static\` nested** unless the class genuinely needs to reach into the enclosing instance.

:::gotcha
The implicit \`Outer.this\` in an inner class is a hidden strong reference — if the inner object outlives the outer, it leaks the whole enclosing object. That's the main reason \`static\` is the recommended default.
:::`,
  },
  {
    id: 'oop-adv-value-object-vs-entity',
    question: 'What is the difference between a value object and an entity?',
    difficulty: 'Medium',
    category: 'Advanced OOP',
    tags: ['value object', 'entity', 'ddd', 'identity'],
    answer: `A domain-modelling (DDD) distinction about **identity**:

| | Entity | Value object |
|--|--|--|
| Identity | a distinct ID that persists | none — *is* its attributes |
| Equality | by ID | by value (all fields) |
| Mutability | usually mutable | immutable |
| Question | *"which one?"* | *"what?"* |
| Example | \`User\`, \`Order\`, \`Account\` | \`Money\`, \`Address\`, \`Point\` |

Two \`User\`s named "Sam" are different users (compare by \`id\`); two \`Money(5, USD)\` are interchangeable (compare by value).

\`\`\`java
class User   { final long id; /* equals/hashCode on id only */ }
record Money(long cents, String currency) {}   // value object — equals on all fields
\`\`\`

:::key
This is the **identity-vs-state** split (\`==\` vs \`equals\`) raised to the domain level: entities live by identity and can change; value objects live by their values and shouldn't.
:::`,
  },
  {
    id: 'oop-adv-reflection',
    question: 'What is reflection, and what are its costs?',
    difficulty: 'Medium',
    category: 'Advanced OOP',
    tags: ['reflection', 'metaprogramming', 'frameworks'],
    answer: `**Reflection** lets code inspect and manipulate classes, methods, and fields **at runtime** — \`Class.forName\`, \`getDeclaredMethods\`, \`setAccessible(true)\`, \`Method.invoke\`. It powers frameworks: Spring dependency injection, JUnit test discovery, Jackson (JSON), and JPA/Hibernate.

\`\`\`java
Method m = obj.getClass().getMethod("start");
m.invoke(obj);                     // call a method chosen at runtime
\`\`\`

**Costs:**
- **Breaks encapsulation** — \`setAccessible\` bypasses \`private\` (and can even set \`final\` fields).
- **No compile-time checking** — wrong names/types fail only at runtime.
- **Slower** than direct calls, and harder for the JIT to optimise.
- **Fights refactoring** and the module system's strong encapsulation.

:::gotcha
Reflection can mutate \`final\` fields and private state — a reminder that Java's access control and immutability are enforced by the compiler and JVM but are **not absolute** against reflective code. Use it in frameworks; avoid it in application logic.
:::`,
  },
  {
    id: 'oop-adv-mixins-traits',
    question: 'What are mixins/traits, and how do interface default methods approximate them?',
    difficulty: 'Medium',
    category: 'Advanced OOP',
    tags: ['mixins', 'traits', 'default methods'],
    answer: `A **mixin** (or **trait**) is a bundle of behaviour a class can "mix in" for **horizontal reuse across unrelated types**, without a full is-a hierarchy. Java has no \`trait\` keyword, but **interfaces with \`default\` methods** approximate one:

\`\`\`java
interface Timestamped {
  Instant createdAt();
  default boolean isOlderThan(Duration d) {          // mixed-in behaviour
    return createdAt().isBefore(Instant.now().minus(d));
  }
}
class Order implements Timestamped, Comparable<Order> { ... }  // mix in several
\`\`\`

A class implements **many** such interfaces, each contributing methods.

:::gotcha
The limit vs real traits (Scala): interfaces **can't hold state**, so a default method can only call other interface methods — it can't read instance fields directly. Mixins give *horizontal, multiple* reuse; class inheritance gives *vertical, single* reuse.
:::`,
  },
  {
    id: 'oop-adv-anemic-domain-model',
    question: 'What is an anemic domain model, and why is it considered an anti-pattern?',
    difficulty: 'Medium',
    category: 'Advanced OOP',
    tags: ['anemic-domain-model', 'anti-pattern', 'encapsulation'],
    answer: `An **anemic domain model** is one where domain objects are bags of **getters and setters with no behaviour**, and all the logic lives in separate "service" classes.

Fowler calls it an anti-pattern because it **throws away the core benefit of OO**: data and the logic that guards it are split apart, so the object can't enforce its own invariants and the rules get duplicated across services. It's procedural code wearing an OO costume.

\`\`\`java
// Anemic: OrderService reaches in and mutates raw state
order.setTotal(order.getTotal() + item.getPrice());

// Rich: the object owns the rule
order.addItem(item);   // enforces limits, recomputes total, keeps invariants
\`\`\`

**Cure:** move behaviour onto the entity that owns the data (Information Expert).

:::gotcha
DTOs and boundary payloads are *legitimately* anemic. The anti-pattern is specifically an anemic **domain** model — entities that should protect business rules but don't.
:::`,
  },
  {
    id: 'oop-adv-tell-dont-ask',
    question: 'What does the "Tell, Don\'t Ask" principle mean?',
    difficulty: 'Medium',
    category: 'Advanced OOP',
    tags: ['tell-dont-ask', 'encapsulation', 'law-of-demeter'],
    answer: `**Tell an object what to do — don't ask for its data and decide for it.** Bundling data with the behaviour that acts on it is the whole point of OO, so send a message and let the object make the decision.

\`\`\`java
// Ask — pull state out, decide outside (leaks the invariant, invites feature envy)
if (account.getBalance() >= amount) account.setBalance(account.getBalance() - amount);

// Tell — the object owns the rule
account.withdraw(amount);   // validates and updates internally
\`\`\`

"Ask" code scatters business rules across callers and breaks encapsulation; "Tell" code keeps each rule in one place — the object that owns the state.

:::gotcha
It's a guideline, not a law. **Queries for display**, and reads from genuine *data structures* (DTOs), are fine. The smell is making a **decision** based on another object's exposed internals.
:::`,
  },
  {
    id: 'oop-adv-sealed-classes',
    question: 'What are sealed classes, and what problem do they solve?',
    difficulty: 'Medium',
    category: 'Advanced OOP',
    tags: ['sealed', 'pattern-matching', 'exhaustiveness'],
    answer: `A **sealed** class or interface (Java 17) restricts *which* types may extend or implement it, via a \`permits\` clause. It models a **closed set of variants** that you — and the compiler — know completely.

\`\`\`java
sealed interface Shape permits Circle, Square, Triangle {}
record Circle(double r)  implements Shape {}
record Square(double s)  implements Shape {}
record Triangle(double b, double h) implements Shape {}

double area(Shape s) {
  return switch (s) {                    // no 'default' needed — exhaustive
    case Circle c   -> Math.PI * c.r() * c.r();
    case Square q   -> q.s() * q.s();
    case Triangle t -> 0.5 * t.b() * t.h();
  };
}
\`\`\`

Add a fourth variant and the \`switch\` **stops compiling** until you handle it — the compiler enforces exhaustiveness.

:::senior
\`sealed\` + \`record\` + pattern matching gives Java closed, algebraic-data-type-style hierarchies. It's the OO answer to the *expression problem* when the set of types is fixed and you often add operations.
:::`,
  },
  {
    id: 'oop-adv-equals-inheritance-symmetry',
    question: 'Why can\'t you add a value field in a subclass without breaking the equals contract?',
    difficulty: 'Hard',
    category: 'Advanced OOP',
    tags: ['equals', 'inheritance', 'symmetry', 'liskov'],
    answer: `The classic \`Point\` / \`ColorPoint\` trap (*Effective Java* Item 10). Extending an instantiable class and adding a value component makes it **impossible** to keep \`equals\` correct.

**With \`instanceof\`** — symmetry breaks:

\`\`\`java
point.equals(colorPoint);   // true  — Point.equals ignores colour
colorPoint.equals(point);   // false — ColorPoint.equals checks colour
\`\`\`

**With \`getClass()\`** — symmetry holds, but **Liskov** breaks: a \`ColorPoint\` can now *never* equal a \`Point\`, so it isn't usable everywhere a \`Point\` is.

| Approach | Symmetric? | Liskov-safe? |
|--|--|--|
| \`instanceof\` | ❌ | ✅ (subtype can equal base) |
| \`getClass()\` | ✅ | ❌ (rejects subtypes) |

There is no way to have both while adding state in a subclass.

:::senior
The fix is **composition over inheritance**: give \`ColorPoint\` a \`Point\` field instead of extending \`Point\`. Then each type has its own well-behaved \`equals\`. Records sidestep it too — they're \`final\`.
:::`,
  },
  {
    id: 'oop-adv-covariance-contravariance',
    question: 'Why are Java arrays covariant but generics invariant?',
    difficulty: 'Hard',
    category: 'Advanced OOP',
    tags: ['covariance', 'generics', 'variance', 'wildcards'],
    answer: `**Variance** describes how subtyping of elements relates to subtyping of containers.

**Arrays are covariant** — \`String[]\` *is an* \`Object[]\`. But this is **unsound**, caught only at runtime:

\`\`\`java
Object[] a = new String[1];
a[0] = 42;                    // compiles — throws ArrayStoreException at runtime
\`\`\`

**Generics are invariant** — \`List<String>\` is **not** a \`List<Object>\`. The compiler rejects the analogous mistake outright, restoring soundness:

\`\`\`java
List<Object> l = new ArrayList<String>();   // compile error — good
\`\`\`

**Wildcards** reintroduce *controlled* variance — **PECS**: \`? extends T\` is covariant (a producer you only read), \`? super T\` is contravariant (a consumer you only write).

:::senior
Covariant arrays were a pre-generics compromise so \`sort(Object[])\` could work on any array. Generics deliberately chose **invariance + wildcards** to close that exact runtime hole at compile time.
:::`,
  },
  {
    id: 'oop-adv-inner-class-leak',
    question: 'How can a non-static inner class cause a memory leak?',
    difficulty: 'Hard',
    category: 'Advanced OOP',
    tags: ['inner class', 'memory leak', 'garbage collection'],
    answer: `A non-static inner class — and an anonymous class or lambda that captures \`this\` — holds an **implicit strong reference to its enclosing instance** (\`Outer.this\`). If the inner object **outlives** the outer (stored in a static registry, a long-lived listener, a cache, or a running thread), it keeps the entire enclosing object — and everything *it* references — alive. That's the leak.

\`\`\`java
class Screen {
  void register() {
    EventBus.addListener(e -> repaint());   // captures Screen.this
  }                                          // bus outlives Screen → Screen never collected
}
\`\`\`

**Fix:** make the nested class \`static\` and pass only what it needs (or hold a \`WeakReference\`):

\`\`\`java
static class Handler implements Listener { /* no Outer.this */ }
\`\`\`

:::gotcha
This is why \`static\` nested classes are the recommended default, and why long-lived listeners/callbacks that reference \`this\` are a classic Android/Swing leak source.
:::`,
  },
];

export default questions;
