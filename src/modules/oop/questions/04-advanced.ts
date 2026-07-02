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
];

export default questions;
