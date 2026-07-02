import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'pat-str-adapter-intent',
    question: 'What is the Adapter pattern, and why prefer the object adapter in Java?',
    difficulty: 'Easy',
    category: 'Structural',
    tags: ['adapter', 'composition'],
    answer: `**Adapter** converts one class's interface into another that clients expect, letting incompatible types collaborate — the "plug adapter" of software.

Two forms:
- **Object adapter** — *composition*: the adapter holds a reference to the adaptee and delegates.
- **Class adapter** — *inheritance*: the adapter extends the adaptee.

Prefer the **object adapter** in Java because Java has no multiple class inheritance, and composition lets you adapt **any subtype** of the adaptee rather than one fixed class.

JDK examples: \`InputStreamReader\` (bytes → chars), \`Arrays.asList\`, \`Collections.list(Enumeration)\`.`,
  },
  {
    id: 'pat-str-decorator-io',
    question: 'Explain the Decorator pattern using java.io.',
    difficulty: 'Medium',
    category: 'Structural',
    tags: ['decorator', 'java.io'],
    answer: `**Decorator** adds behaviour to an object at runtime by wrapping it in another object that **implements the same interface** and **delegates** to it.

\`java.io\` is the textbook example:

\`\`\`java
Reader r = new BufferedReader(new FileReader("data.txt"));
\`\`\`

\`BufferedReader\` *is-a* \`Reader\` and *has-a* \`Reader\`, so it adds buffering then forwards calls. You compose features (buffering, decoding, compression) instead of creating a class per combination.

It avoids the **subclass explosion**: N independent features would need up to 2ᴺ subclasses, but N decorators stack freely.`,
  },
  {
    id: 'pat-str-adapter-vs-decorator-vs-proxy',
    question: 'Adapter vs Decorator vs Proxy — all wrap an object. How do they differ?',
    difficulty: 'Hard',
    category: 'Structural',
    tags: ['adapter', 'decorator', 'proxy', 'comparison'],
    answer: `All three wrap a delegate, but the **intent** differs:

| Pattern | Intent | Interface | Behaviour |
|--|--|--|--|
| **Adapter** | Make an incompatible interface usable | **Changes** the interface | Same behaviour, new shape |
| **Decorator** | Add responsibilities | **Same** interface | **Enhanced** behaviour |
| **Proxy** | Control access / lifecycle | **Same** interface | Same behaviour, gated |

Quick test:
- Different interface out than in → **Adapter**.
- Same interface, does *more* → **Decorator**.
- Same interface, controls *whether/when* you reach the real object (lazy, security, remote) → **Proxy**.

Proxy usually manages the real object's lifecycle (it may create it lazily); a decorator wraps an object already handed to it.`,
  },
  {
    id: 'pat-str-facade-intent',
    question: 'What problem does the Facade pattern solve?',
    difficulty: 'Easy',
    category: 'Structural',
    tags: ['facade', 'coupling'],
    answer: `**Facade** provides a single, simplified, higher-level interface over a complex subsystem, so clients do not have to know and orchestrate many collaborating classes.

Benefits: reduced coupling, an easier default entry point, and a clear boundary around subsystem complexity.

It does **not** hide the subsystem — advanced clients can still use the underlying classes directly. Examples: Spring's \`JdbcTemplate\` over raw JDBC, SLF4J's \`LoggerFactory\`, \`URL.openConnection()\`.

Keep facades thin: orchestration and simplification, not business logic.`,
  },
  {
    id: 'pat-str-proxy-kinds',
    question: 'Name the kinds of Proxy and give an example of each.',
    difficulty: 'Medium',
    category: 'Structural',
    tags: ['proxy', 'virtual', 'protection', 'remote'],
    answer: `A **proxy** is a same-interface stand-in that **controls access** to a real subject. Kinds:

- **Virtual** — delays creating an expensive object until first use (lazy-loaded image, Hibernate lazy entity).
- **Protection** — checks permissions before forwarding (security proxy).
- **Remote** — represents an object in another JVM/process (Java RMI stub).
- **Smart** — adds bookkeeping like reference-counting, logging, or caching.

The client cannot tell it is talking to a proxy because it implements the same interface as the \`RealSubject\`.`,
  },
  {
    id: 'pat-str-dynamic-proxy-spring',
    question: 'How do Java dynamic proxies power Spring AOP and Hibernate?',
    difficulty: 'Hard',
    category: 'Structural',
    tags: ['proxy', 'spring aop', 'hibernate', 'dynamic proxy'],
    answer: `\`java.lang.reflect.Proxy.newProxyInstance\` generates a proxy for interfaces **at runtime**; every call routes through an \`InvocationHandler\` that can run code before/after delegating.

- **Spring AOP** wraps beans in proxies to apply cross-cutting advice: \`@Transactional\`, \`@Async\`, security. It uses **JDK dynamic proxies** for interface-based beans and **CGLIB** subclass proxies for concrete classes.
- **Hibernate** returns proxy subclasses for lazy associations; the SQL fires only when you first touch the field.

:::gotcha
Because Spring works through a proxy, calling a \`@Transactional\` method from **another method in the same bean** (self-invocation) bypasses the proxy, so the annotation is silently ignored. The same proxy boundary is why touching a lazy field after the session closes throws \`LazyInitializationException\`.
:::`,
  },
  {
    id: 'pat-str-composite-intent',
    question: 'What is the Composite pattern and what is its defining structure?',
    difficulty: 'Medium',
    category: 'Structural',
    tags: ['composite', 'tree', 'recursion'],
    answer: `**Composite** arranges objects into **tree structures** for part-whole hierarchies and lets clients treat **leaves and branches uniformly** through a shared interface.

Defining structure: the \`Composite\` **holds a collection of the same \`Component\` type it implements**. That self-reference builds the tree and drives recursion — \`composite.operation()\` typically loops over children calling \`operation()\`.

Clients never check "leaf or branch?"; they just call the method.

JDK examples: Swing \`Container\` holding child \`Component\`s, \`java.io.File\` (file or directory), the DOM tree.

Design tension — *transparent* (child-management methods on \`Component\`, uniform but leaves must no-op/throw) vs *safe* (methods only on \`Composite\`, type-safe but requires downcasting).`,
  },
  {
    id: 'pat-str-bridge-intent',
    question: 'What is the Bridge pattern and what problem does it prevent?',
    difficulty: 'Hard',
    category: 'Structural',
    tags: ['bridge', 'abstraction', 'implementation'],
    answer: `**Bridge** decouples an **abstraction** from its **implementation** so the two can vary independently, joining them by composition instead of inheritance.

It prevents a **combinatorial class explosion**. With Shapes × Renderers, inheritance forces \`VectorCircle\`, \`RasterCircle\`, \`VectorSquare\`… (M × N classes). Bridge splits them into two hierarchies — \`Shape\` holds a \`Renderer\` — so you add **M + N** classes and each dimension evolves freely.

\`\`\`java
abstract class Shape { protected final Renderer renderer; /* the bridge */ }
class Circle extends Shape { void draw() { renderer.drawCircle(radius); } }
\`\`\`

JDK example: JDBC — \`java.sql\` interfaces are the abstraction, vendor \`Driver\`s are the implementation.`,
  },
  {
    id: 'pat-str-bridge-vs-adapter',
    question: 'Bridge vs Adapter — both delegate. How do you tell them apart?',
    difficulty: 'Hard',
    category: 'Structural',
    tags: ['bridge', 'adapter', 'comparison'],
    answer: `Both use composition and delegation, so they look alike. The decider is **timing and intent**:

| Bridge | Adapter |
|--|--|
| Designed **up front** to let two dimensions vary | Applied **after the fact** to fix a mismatch |
| Both sides designed together | Wraps an existing, unchangeable interface |
| Intent: separate concerns / avoid class explosion | Intent: make incompatible interfaces work |

One-liner: **Bridge is planned, Adapter is a patch.** Bridge separates two things you *know* will change; Adapter reconciles two things that *already* clash.`,
  },
  {
    id: 'pat-str-flyweight-state',
    question: 'Explain Flyweight and the intrinsic vs extrinsic state split.',
    difficulty: 'Medium',
    category: 'Structural',
    tags: ['flyweight', 'memory', 'intrinsic state'],
    answer: `**Flyweight** saves memory by **sharing** many fine-grained objects, splitting state into:

- **Intrinsic** — shared, context-independent, **immutable**; stored inside the flyweight.
- **Extrinsic** — context-dependent; **passed in by the client** on each call, never stored.

A factory pools flyweights and returns a shared instance per intrinsic key. Example: a text glyph's shape is intrinsic (one shared \`'a'\`), its screen position is extrinsic.

:::warning
The intrinsic state **must be immutable** — the object is shared across the whole program, so a mutation would corrupt every user.
:::

Only worth it with huge numbers of similar objects where intrinsic state dominates.`,
  },
  {
    id: 'pat-str-integer-cache',
    question: 'Why does Integer.valueOf(127) == Integer.valueOf(127) but not for 128?',
    difficulty: 'Medium',
    category: 'Structural',
    tags: ['flyweight', 'integer cache', 'autoboxing'],
    answer: `This is the **Flyweight** pattern in the JDK. \`Integer.valueOf\` caches boxed values in the range **−128 to 127** and returns the **same shared object** for them:

\`\`\`java
Integer a = 127, b = 127;
System.out.println(a == b);   // true  -> same cached flyweight
Integer c = 128, d = 128;
System.out.println(c == d);   // false -> outside cache, new objects
\`\`\`

Inside the range \`==\` compares the same reference; outside it, autoboxing allocates fresh objects.

:::gotcha
This is exactly why you compare boxed numbers with \`.equals()\`, never \`==\`. Similar caches exist for \`Boolean\`, \`Byte\`, \`Short\`, \`Long\`, \`Character\`, plus the String literal pool.
:::`,
  },
];

export default questions;
