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
  {
    id: 'pat-cre-lazy-vs-eager-singleton',
    question: 'Lazy vs eager Singleton initialization — how do you choose?',
    difficulty: 'Easy',
    category: 'Creational',
    tags: ['singleton', 'lazy-initialization', 'class-loading'],
    answer: `**Eager** creates the instance at class-initialization time:

\`\`\`java
public class Config {
  private static final Config INSTANCE = new Config(); // eager
  public static Config getInstance() { return INSTANCE; }
}
\`\`\`

It is trivially **thread-safe** (the JVM synchronizes class initialization) and has zero access overhead. Choose it when construction is cheap.

**Lazy** defers creation to first use — worth it only when construction is genuinely expensive *and* the instance might never be needed. The price is a thread-safety obligation: you need the holder idiom, double-checked locking with \`volatile\`, or a \`synchronized\` accessor.

:::senior
Java class loading is itself lazy: a class initializes on **first active use**. If the class contains little besides the singleton, the "eager" field only materializes when someone first calls \`getInstance()\` — so eager is usually lazy enough, and simpler wins.
:::`,
  },
  {
    id: 'pat-cre-naive-lazy-race',
    question: 'Why is an unsynchronized lazy Singleton broken in a multithreaded program? What actually goes wrong?',
    difficulty: 'Easy',
    category: 'Creational',
    tags: ['singleton', 'race-condition', 'thread-safety'],
    answer: `The classic naive version has a **check-then-act race**:

\`\`\`java
public static Config getInstance() {
  if (instance == null)        // T1 and T2 both see null...
    instance = new Config();   // ...and BOTH construct
  return instance;
}
\`\`\`

Two threads interleave between the check and the assignment, so **two instances exist** — and each thread may keep a different one. The symptoms are subtle: duplicated caches, listeners registered on the "other" instance, two connection pools fighting over resources.

Worse, without \`volatile\` or synchronization there is **no happens-before edge**, so a thread can even observe a reference to a *partially constructed* object.

Fixes, simplest first: eager initialization, the **static holder idiom**, a single-element **enum**, a \`synchronized\` accessor, or double-checked locking with \`volatile\` if the lock cost is proven to matter.`,
  },
  {
    id: 'pat-cre-holder-idiom',
    question: 'How does the Bill Pugh static holder idiom give you a lazy, thread-safe Singleton with no synchronization code?',
    difficulty: 'Medium',
    category: 'Creational',
    tags: ['singleton', 'holder-idiom', 'jvm'],
    answer: `Put the instance in a **private nested class** that nothing touches until first use:

\`\`\`java
public class Config {
  private Config() {}
  private static class Holder {           // not loaded yet...
    static final Config INSTANCE = new Config();
  }
  public static Config getInstance() {
    return Holder.INSTANCE;               // ...initialized exactly here, once
  }
}
\`\`\`

Two JVM guarantees do all the work:

1. **Laziness** — a nested class is initialized only on first active use, i.e. the first \`getInstance()\` call.
2. **Thread-safety** — class initialization runs under the JVM's **initialization lock**, exactly once, and its result is safely published to all threads.

So you get lazy + thread-safe with **zero \`synchronized\`/\`volatile\` code and zero per-call overhead** — which is why it beats double-checked locking in almost every comparison.

Limitation: it cannot take runtime parameters — the construction is fixed inside the holder.`,
  },
  {
    id: 'pat-cre-breaking-singleton',
    question: 'How can reflection, serialization, and cloning each break a Singleton, and what is the defense against each?',
    difficulty: 'Hard',
    category: 'Creational',
    tags: ['singleton', 'reflection', 'serialization', 'defenses'],
    answer: `Three classic attacks on a private-constructor singleton:

| Attack | How it breaks | Defense |
|--|--|--|
| **Reflection** | \`ctor.setAccessible(true); ctor.newInstance()\` bypasses \`private\` | Constructor throws if the instance already exists |
| **Serialization** | Deserialization creates a fresh object **without calling the constructor** | \`private Object readResolve() { return INSTANCE; }\` |
| **Cloning** | \`clone()\` produces a second instance | Don't implement \`Cloneable\`; if inherited, override \`clone()\` to throw |

\`\`\`java
private Config() {
  if (Holder.INSTANCE != null)
    throw new IllegalStateException("Use getInstance()");
}
private Object readResolve() { return Holder.INSTANCE; }
\`\`\`

Note the reflection defense is imperfect — an attacker who reflects *before* the first legitimate use can still win ordering games.

:::senior
The complete answer ends with: a single-element **\`enum\` is immune to all three by JVM design**, which is exactly why *Effective Java* calls it the best singleton implementation.
:::`,
  },
  {
    id: 'pat-cre-enum-singleton-immunity',
    question: 'Why exactly is an enum Singleton immune to reflection and serialization attacks?',
    difficulty: 'Hard',
    category: 'Creational',
    tags: ['singleton', 'enum', 'jvm-guarantees'],
    answer: `Because both defenses are **built into the platform**, not hand-written:

- **Reflection:** \`Constructor.newInstance\` explicitly checks for enums and throws \`IllegalArgumentException: Cannot reflectively create enum objects\`. The JLS guarantees exactly one instance per enum constant per class loader — compiler and JVM co-enforce it.
- **Serialization:** enums use a **special serialized form — the constant's name only**. Deserialization resolves through \`Enum.valueOf\`, returning the *existing* constant. Any \`readObject\`/\`writeObject\` you write is ignored, so there is no constructor bypass to exploit.
- **Thread-safety:** constants are created during class initialization, under the JVM's initialization lock.

Trade-offs to mention before the interviewer does:

- Laziness is limited to class-load laziness; no constructor parameters.
- An enum cannot extend a class (it already extends \`java.lang.Enum\`).
- "One instance" is really **one per class loader** — true of every singleton technique, and a real issue in app servers with per-app loaders.`,
  },
  {
    id: 'pat-cre-singleton-vs-static-utility',
    question: 'Why use a Singleton instead of a class with only static methods?',
    difficulty: 'Medium',
    category: 'Creational',
    tags: ['singleton', 'static', 'comparison'],
    answer: `Because a singleton is an **object** — and objects can do things static method bags cannot:

| | Static utility (\`Math\`, \`Collections\`) | Singleton |
|--|--|--|
| Implement an interface | No | **Yes** — callers depend on the abstraction |
| Be passed / injected | No | Yes |
| Be mocked in tests | Painfully (static mocking) | Yes, via its interface |
| Polymorphic override | No — statics don't dispatch | Yes |
| Lazy state / lifecycle | Awkward | Natural |

**Rule of thumb:** stateless pure functions → static utility class (\`final\`, private constructor). Anything with state, a lifecycle, or a swappable contract → an instance — ideally one managed by a DI container rather than a hand-rolled \`getInstance()\`.

:::gotcha
If callers reach the singleton through a static \`getInstance()\` everywhere, you have recreated the static-utility coupling problem — the win only materializes when the instance is *injected*.
:::`,
  },
  {
    id: 'pat-cre-singleton-testability',
    question: 'Why is Singleton often called an anti-pattern? When is it still legitimate?',
    difficulty: 'Medium',
    category: 'Creational',
    tags: ['singleton', 'anti-pattern', 'testability'],
    answer: `The charges:

- **Hidden dependencies** — \`Order.total()\` silently calls \`TaxConfig.getInstance()\`; the signature lies about what the class needs.
- **Global mutable state** — tests pass alone and fail together because state leaks between them; execution order suddenly matters.
- **No test seam** — you cannot substitute a fake; the concrete class is hard-wired at every call site.
- **Hidden lifecycle** — no scoping (per-request? per-tenant?), awkward reset, one-per-classloader surprises.

**Still legitimate** when the instance is *genuinely* single and effectively immutable or append-only: loggers, configuration snapshots, \`Runtime\`. And "one instance" as a *deployment decision* is fine — that is what DI container scopes are for: a Spring singleton bean gives you one instance **plus** injectability and mockability.

:::senior
The senior one-liner: **the problem was never "one instance" — it's the global access point.** Keep the single instance, delete the \`getInstance()\`.
:::`,
  },
  {
    id: 'pat-cre-jdk-singletons',
    question: 'Where does the JDK itself use the Singleton pattern?',
    difficulty: 'Easy',
    category: 'Creational',
    tags: ['singleton', 'jdk', 'sightings'],
    answer: `Canonical sightings:

- **\`Runtime.getRuntime()\`** — the textbook example: eagerly created static instance, private constructor, static accessor.
- **\`java.awt.Toolkit.getDefaultToolkit()\`** — lazily created per environment.
- **Shared immutable instances**: \`Collections.emptyList()\` and \`Optional.empty()\` return one reused object — singleton mechanics in service of memory sharing.

\`\`\`java
Runtime rt = Runtime.getRuntime();     // always the same object
rt.availableProcessors();
\`\`\`

Notice what makes these palatable: the objects are **effectively immutable or represent a truly unique resource** (the JVM itself). The pattern sours when the single instance holds mutable business state.

:::tip
Citing \`Runtime\` plus *why singleton is acceptable there* is a much stronger interview answer than the definition alone.
:::`,
  },
  {
    id: 'pat-cre-simple-factory-vs-factory-method',
    question: 'What is the difference between a simple factory and the GoF Factory Method pattern?',
    difficulty: 'Medium',
    category: 'Creational',
    tags: ['simple-factory', 'factory-method', 'comparison'],
    answer: `A **simple factory** is just a method (often static) with a conditional that returns concrete types:

\`\`\`java
static Shape create(String type) {
  return switch (type) {
    case "circle" -> new Circle();
    case "square" -> new Square();
    default -> throw new IllegalArgumentException(type);
  };
}
\`\`\`

It **centralizes** creation (good!) but is not a GoF pattern — adding a product means **editing the switch**.

**Factory Method** moves the decision into a class hierarchy: an abstract creator calls an overridable \`createX()\` hook, and *subclasses* decide the type. New product → new subclass, no edits — full Open/Closed compliance.

| | Simple factory | Factory Method |
|--|--|--|
| Mechanism | One conditional | Subclass overrides a hook |
| New product | Edit the method | Add a subclass |
| Fit | Small, closed type sets | Frameworks, open extension |

:::gotcha
\`List.of\` and \`Integer.valueOf\` are **static factory methods** (an Effective Java idiom) — not the GoF Factory Method. Conflating the three is one of the most common interview slips.
:::`,
  },
  {
    id: 'pat-cre-factory-naming-conventions',
    question: 'What do the conventional static factory names — of, from, valueOf, getInstance, newInstance, create — signal to callers?',
    difficulty: 'Easy',
    category: 'Creational',
    tags: ['static-factory', 'naming', 'effective-java'],
    answer: `The names encode a contract about **conversion vs aggregation and, crucially, identity** (fresh object or possibly shared?):

| Name | Signal | Example |
|--|--|--|
| \`of\` | Aggregates arguments; compact | \`List.of(1, 2, 3)\` |
| \`from\` | Converts a single argument | \`Date.from(instant)\` |
| \`valueOf\` | Verbose of/from; **may return cached** | \`Integer.valueOf(127)\` |
| \`getInstance\` | Returns *an* instance — **not guaranteed new** | \`Calendar.getInstance()\` |
| \`newInstance\` / \`create\` | **Guaranteed fresh** object each call | \`Array.newInstance(...)\` |
| \`getX\` / \`newX\` | Same, but the factory lives in another class | \`Files.newBufferedReader(path)\` |

Why it matters: callers who assume \`getInstance\` hands them a private copy — or who compare \`valueOf\` results with \`==\` — write identity bugs. Following the convention makes caching and sharing behaviour legible at the call site.`,
  },
  {
    id: 'pat-cre-builder-vs-factory',
    question: 'Builder vs Factory — when does each fit, and can they work together?',
    difficulty: 'Medium',
    category: 'Creational',
    tags: ['builder', 'factory', 'comparison'],
    answer: `They answer different creation questions:

| | Factory (Method / Abstract) | Builder |
|--|--|--|
| Question answered | **Which type** should exist? | **How** should this one object be assembled? |
| Input | A type selector / context | Many parameters, mostly optional |
| Call shape | One shot: \`create(x)\` | Multi-step, then \`build()\` |
| Returns | Possibly different subtypes | One configured (often immutable) instance |

Heuristics: polymorphic instantiation → factory; telescoping constructors or step-by-step assembly with validation at the end → builder.

They **compose naturally**:

\`\`\`java
HttpRequest req = HttpRequest.newBuilder(uri)   // factory hands out a builder
    .timeout(Duration.ofSeconds(2))
    .build();                                   // builder finishes the job
\`\`\`

A factory can also *use* a builder internally to assemble whichever subtype it selects. They are collaborators, not competitors — saying that explicitly is the senior move.`,
  },
  {
    id: 'pat-cre-records-vs-builder',
    question: 'Do Java records make the Builder pattern obsolete?',
    difficulty: 'Hard',
    category: 'Creational',
    tags: ['records', 'builder', 'modern-java'],
    answer: `No — records solve **boilerplate**, builders solve **construction ergonomics**, and the problems only partially overlap.

What records give you free: canonical constructor, accessors, \`equals\`/\`hashCode\`/\`toString\`, shallow immutability. What they *don't* fix:

- The canonical constructor is **positional and all-args**: eight components, three of them \`String\`, is still a call-site puzzle.
- **No optionality or defaults** — every component must be supplied on every construction.
- No stepwise assembly (compact constructors validate, but only at the end of one positional call).

So the modern pairing is **record + builder**:

\`\`\`java
public record Server(String host, int port, Duration timeout, boolean tls) {
  public static Builder builder() { return new Builder(); }
  public static final class Builder {
    private String host = "localhost";   // defaults live here
    private int port = 8080;
    private Duration timeout = Duration.ofSeconds(5);
    private boolean tls = true;
    public Builder host(String h) { this.host = h; return this; }
    public Builder port(int p) { this.port = p; return this; }
    public Server build() { return new Server(host, port, timeout, tls); }
  }
}
\`\`\`

**Rule of thumb:** up to ~4 components, all required → bare record. Many or optional components → record for the *data*, builder for the *assembly*. Modified copies still need hand-rolled "wither" methods or a \`toBuilder()\`.`,
  },
  {
    id: 'pat-cre-stringbuilder-gof',
    question: 'Is StringBuilder an example of the GoF Builder pattern?',
    difficulty: 'Medium',
    category: 'Creational',
    tags: ['builder', 'stringbuilder', 'nuance'],
    answer: `Only loosely — and knowing *why* is the interesting part.

What matches: a mutable accumulator, chained \`append\` calls, a terminal \`toString()\` that produces the product.

What's missing from the **GoF** definition: GoF Builder separates a construction *process* from the *representation* so the **same steps can build different products** — a Director drives an abstract Builder interface with interchangeable concrete builders (an HTML vs a Markdown report builder). \`StringBuilder\` has no abstraction and exactly one representation.

What interviews usually mean instead is the **Effective Java fluent builder** (Item 2): a companion object gathering many optional parameters, ending in \`build()\` — \`HttpRequest.newBuilder()\`, \`Stream.Builder\`. That is a *parameter-handling idiom*, a cousin of GoF Builder rather than an instance of it.

:::senior
Strong answer: "\`StringBuilder\` is a builder in spirit — staged assembly with a terminal build step — but it drops the GoF point of interchangeable representations. The Java ecosystem uses 'Builder' mostly in the Effective Java sense."
:::`,
  },
  {
    id: 'pat-cre-lombok-builder',
    question: 'What does Lombok\'s @Builder generate, and what are its trade-offs?',
    difficulty: 'Easy',
    category: 'Creational',
    tags: ['lombok', 'builder', 'tooling'],
    answer: `\`@Builder\` generates the whole fluent-builder apparatus at compile time: a static nested \`Builder\` class, per-field fluent setters, \`build()\`, a \`builder()\` entry point, optionally \`toBuilder()\` for copies, and \`@Singular\` for accumulating collection elements one by one.

Trade-offs:

- **The \`@Builder.Default\` gotcha** — field initializers are silently discarded unless you also annotate the field:

\`\`\`java
@Builder
class Server {
  @Builder.Default int port = 8080; // without this, builder yields port = 0
}
\`\`\`

- **No required-field enforcement** — \`build()\` happily returns half-initialized objects; \`@NonNull\` or checks inside \`build()\` help, but only at runtime, not compile time.
- Generated code is invisible in source (annotation processing), which complicates debugging and API review for some teams.

Alternatives: plain records for small immutable types; a hand-rolled *staged* builder when required fields must be enforced by the compiler.`,
  },
  {
    id: 'pat-cre-prototype-in-practice',
    question: 'When is the Prototype pattern actually useful in practice?',
    difficulty: 'Medium',
    category: 'Creational',
    tags: ['prototype', 'use-cases', 'spring'],
    answer: `Prototype pays when **copying a configured instance is cheaper or simpler than constructing from scratch**:

- **Expensive initialization** — the base object required parsing, I/O, or heavy computation (a parsed document template, a fully-wired game entity archetype).
- **Many near-identical variants** — spawn 100 enemies from one tuned archetype, then tweak position and health per copy.
- **A prototype registry** — \`Map<String, Document> templates\`; \`templates.get("invoice").copy()\` acts as a factory whose products are *data-configured*, not code-configured.
- **Test fixtures** — one valid baseline object, copied and mutated per test case.

In Java, implement it with **copy constructors or \`copy()\` methods**, not \`Cloneable\`.

:::gotcha
Spring's **prototype *scope*** is unrelated to GoF Prototype — it means "new bean instance per request from the container," created by constructor, no copying involved. Conflating the two is a classic trap question.
:::`,
  },
  {
    id: 'pat-cre-object-pool',
    question: 'When does an Object Pool pay off, and when does pooling actively hurt?',
    difficulty: 'Hard',
    category: 'Creational',
    tags: ['object-pool', 'performance', 'connections'],
    answer: `**Pool when the object is expensive to create AND externally constrained:**

- **DB connections** — TCP + TLS + auth handshake costs milliseconds, and the database caps concurrent connections (HikariCP exists for a reason).
- **Threads** — stack allocation and OS scheduling cost; hence \`ExecutorService\` pools.
- **Direct/native buffers** — off-heap allocation and zeroing are slow (Netty pools them).

**Don't pool plain objects.** On a modern JVM, allocation is a few-nanosecond TLAB pointer bump, and generational GC is *optimized for* short-lived garbage. Pooling POJOs buys you:

- **Stale-state bugs** — a "reset" that misses one field leaks data between users (the classic pooled-object security bug).
- **Contention** — the pool's synchronization becomes the bottleneck the allocator never was.
- **GC harm** — pooled objects tenure into the old generation and pin everything they reference.

:::senior
Rule: pool *resources* (connections, threads, native memory), never *values*. If asked about reusing \`StringBuilder\`s or caching objects "for speed" — measure first; the JIT and GC usually win.
:::`,
  },
  {
    id: 'pat-cre-abstract-factory-when-worth-it',
    question: 'When does Abstract Factory justify its extra layer? What signals should you look for?',
    difficulty: 'Medium',
    category: 'Creational',
    tags: ['abstract-factory', 'design-decision', 'signals'],
    answer: `Signals that the extra abstraction pays:

1. **Two or more product families** that must stay internally **consistent** — a \`WinButton\` must never pair with a \`MacScrollbar\`; a production \`KafkaPublisher\` must never pair with an in-memory test store.
2. **The family is chosen once**, from configuration or environment, at startup.
3. **Products collaborate** — they are designed to work together, so their creation must be coordinated.

The payoff: mixing families becomes **impossible by construction** — one factory object is selected, and everything it creates matches.

When it does *not* pay: only one product varies (use Factory Method), or the "family" never actually changes (construct directly and let DI wire it).

:::senior
In Spring-era code, hand-rolled abstract factories are rare because **profiles and configuration classes play the role**: \`@Profile("test")\` swaps in a whole consistent bean family. Recognizing that the container *is* your abstract factory is a senior-level observation.
:::`,
  },
];

export default questions;
