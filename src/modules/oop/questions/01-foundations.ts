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
];

export default questions;
