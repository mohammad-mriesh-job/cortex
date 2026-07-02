import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'pat-cre-singleton-threadsafe',
    question: 'What is the safest, most concise way to implement a Singleton in Java, and why?',
    difficulty: 'Medium',
    category: 'Creational',
    tags: ['singleton', 'thread-safety', 'enum'],
    answer: `A single-element **\`enum\`** — Josh Bloch's recommended approach:

\`\`\`java
public enum Config {
  INSTANCE;
  public void load() { /* ... */ }
}
\`\`\`

The JVM guarantees a single instance, gives you **thread-safety and serialization-safety for free**, and blocks reflection attacks that can break private-constructor singletons.

For a **lazy** singleton, use the **Bill Pugh holder idiom** (a private static holder class loaded on first use) or double-checked locking with a \`volatile\` field.

:::senior
In practice, prefer a DI container's singleton-scoped bean over a hand-rolled Singleton — it avoids global mutable state and stays mockable in tests.
:::`,
  },
  {
    id: 'pat-cre-factory-method-vs-abstract-factory',
    question: 'What is the difference between Factory Method and Abstract Factory?',
    difficulty: 'Medium',
    category: 'Creational',
    tags: ['factory-method', 'abstract-factory', 'comparison'],
    answer: `The headline difference is **one product vs. a family of products**, and **inheritance vs. composition**.

| | Factory Method | Abstract Factory |
|--|--|--|
| Creates | One product | A family of related products |
| Mechanism | A subclass **overrides** one creation method | An object with **several** creation methods |
| Grows by | Adding a \`Creator\` subclass | Adding a whole new factory implementation |

Abstract Factory is usually **implemented using** Factory Methods — each \`createX()\` is itself a factory method — so they compose rather than compete.

- **Factory Method** JDK example: \`Calendar.getInstance()\`.
- **Abstract Factory** JDK example: \`DocumentBuilderFactory\`.`,
  },
  {
    id: 'pat-cre-when-use-builder',
    question: 'When should you use the Builder pattern instead of a constructor?',
    difficulty: 'Easy',
    category: 'Creational',
    tags: ['builder', 'immutability', 'effective-java'],
    answer: `Use **Builder** when a class has **many parameters, several of them optional** — the situation that otherwise produces the *telescoping-constructor* problem (a maze of overloads) or a mutable JavaBean full of setters.

\`\`\`java
Pizza p = new Pizza.Builder(12)
    .cheese(true)
    .pepperoni(true)
    .build();
\`\`\`

Benefits: named parameters (readable), only set what you need, and an **immutable** result once \`build()\` runs. Effective Java Item 2 recommends it past a handful of parameters.

**Skip it** for 1–3 required fields — a plain constructor is clearer. JDK examples: \`StringBuilder\`, \`Stream.Builder\`, \`HttpRequest.newBuilder()\`.`,
  },
  {
    id: 'pat-cre-shallow-vs-deep-copy',
    question: 'In the Prototype pattern, what is the difference between a shallow and a deep copy?',
    difficulty: 'Medium',
    category: 'Creational',
    tags: ['prototype', 'clone', 'deep-copy'],
    answer: `A **shallow** copy duplicates the top-level object but **shares** its referenced sub-objects; a **deep** copy duplicates the entire object graph so nothing is shared.

- Primitives/immutables: copied either way (independent).
- Mutable reference fields: **shared** in a shallow copy — mutating the copy mutates the original.

\`\`\`java
public Document clone() {
  Document d = new Document();
  d.title = this.title;
  d.tags  = new ArrayList<>(this.tags); // deep-copy the mutable field
  return d;
}
\`\`\`

:::gotcha
\`Object.clone()\` performs a **shallow** copy by default — you must deep-copy each mutable field yourself.
:::`,
  },
  {
    id: 'pat-cre-clone-cloneable-problems',
    question: 'Why does Effective Java advise against Java\'s Cloneable/clone() mechanism?',
    difficulty: 'Hard',
    category: 'Creational',
    tags: ['prototype', 'clone', 'cloneable'],
    answer: `\`Cloneable\` is considered broken:

- It is a **marker interface with no \`clone()\` method** — \`clone()\` lives on \`Object\`, is \`protected\`, and must be overridden and widened.
- It **bypasses constructors**, making invariants and \`final\` fields awkward.
- It throws a checked \`CloneNotSupportedException\`.
- The default clone is **shallow**, a frequent bug source.

Prefer a **copy constructor** or **static copy factory**:

\`\`\`java
public Document(Document other) {
  this.title = other.title;
  this.tags  = new ArrayList<>(other.tags);
}
\`\`\`

The Prototype *pattern* is still fine — just don't implement it via \`Cloneable\`.`,
  },
  {
    id: 'pat-cre-factory-method-mechanism',
    question: 'How does the Factory Method pattern achieve the Open/Closed Principle?',
    difficulty: 'Medium',
    category: 'Creational',
    tags: ['factory-method', 'open-closed', 'polymorphism'],
    answer: `The base \`Creator\` calls its own **overridable hook** (\`factoryMethod()\`) instead of \`new\`-ing a concrete type. Its business logic uses whatever \`Product\` the hook returns.

\`\`\`java
abstract class Dialog {
  abstract Button createButton();   // hook
  void render() { createButton().paint(); } // no concrete type
}
class WebDialog extends Dialog {
  Button createButton() { return new HtmlButton(); }
}
\`\`\`

To support a new product you **add a subclass** — you never modify existing creator code. That is *closed for modification, open for extension*. JDK example: \`Calendar.getInstance()\`, \`Collection.iterator()\`.`,
  },
  {
    id: 'pat-cre-abstract-factory-tradeoff',
    question: 'What is the main limitation of the Abstract Factory pattern?',
    difficulty: 'Hard',
    category: 'Creational',
    tags: ['abstract-factory', 'trade-offs'],
    answer: `It **fixes the set of products at design time**. Adding a *new family* is easy — write one more factory implementation. But adding a *new product type* (e.g. a \`Slider\` alongside \`Button\` and \`Checkbox\`) forces you to change the factory **interface** and **every** implementation of it.

So the rule of thumb: Abstract Factory is great when product families are stable but the set of products rarely changes. If products come and go frequently, the rigid interface becomes a maintenance burden.

JDK example: \`DocumentBuilderFactory\`, \`TransformerFactory\`.`,
  },
  {
    id: 'pat-cre-static-factory-vs-constructor',
    question: 'What advantages does a static factory method have over a public constructor?',
    difficulty: 'Medium',
    category: 'Creational',
    tags: ['static-factory', 'effective-java', 'valueof'],
    answer: `Effective Java Item 1 lists several advantages of static factory methods (e.g. \`Integer.valueOf\`, \`List.of\`, \`Optional.of\`):

- **They have names** — \`BigInteger.probablePrime(...)\` is clearer than a constructor overload.
- **They can cache/return existing instances** — \`Boolean.valueOf\`, \`Integer.valueOf\` reuse objects (no required \`new\`).
- **They can return a subtype** — the declared return type can be an interface while the actual object is a private implementation (\`Collections.unmodifiableList\`).
- The returned class can vary by call (e.g. \`EnumSet\` returns \`RegularEnumSet\` or \`JumboEnumSet\`).

Downside: a class with only private constructors and static factories can't be subclassed, and factories aren't as discoverable as constructors.

:::note
This is a naming idiom, distinct from the GoF **Factory Method** pattern (which is about subclass overriding).
:::`,
  },
  {
    id: 'pat-cre-double-checked-locking',
    question: 'In double-checked locking for a lazy Singleton, why must the instance field be volatile?',
    difficulty: 'Hard',
    category: 'Creational',
    tags: ['singleton', 'volatile', 'concurrency'],
    answer: `Without \`volatile\`, instruction reordering by the JIT/CPU can **publish the reference before the constructor finishes**. Another thread passing the first \`null\` check could then see a non-null but **partially-constructed** object.

\`\`\`java
private static volatile Config i;
public static Config get() {
  if (i == null) synchronized (Config.class) {
    if (i == null) i = new Config();
  }
  return i;
}
\`\`\`

\`volatile\` establishes a happens-before relationship, guaranteeing that a thread reading a non-null \`i\` also sees a fully-initialized object. The double check avoids locking on every call after initialization.`,
  },
  {
    id: 'pat-cre-choose-creational-pattern',
    question: 'How do you choose between Factory Method, Builder, and Prototype?',
    difficulty: 'Medium',
    category: 'Creational',
    tags: ['comparison', 'design-decision'],
    answer: `Match the pattern to the *creation problem*:

| Problem | Pattern |
|--|--|
| Subclasses should decide the concrete type | **Factory Method** |
| Need a matching **family** of related objects | **Abstract Factory** |
| Object has many (optional) params / needs step-by-step, immutable assembly | **Builder** |
| Construction is expensive; copy a configured instance | **Prototype** |
| Exactly one shared instance is required | **Singleton** |

They aren't mutually exclusive — e.g. an Abstract Factory's methods are often Factory Methods, and a factory may hand back cloned Prototypes.`,
  },
];

export default questions;
