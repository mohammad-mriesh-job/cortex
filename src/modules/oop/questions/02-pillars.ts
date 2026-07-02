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
];

export default questions;
