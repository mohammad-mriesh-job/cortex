import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'oop-pat-families',
    question: 'What are the three GoF pattern families and what does each address?',
    difficulty: 'Easy',
    category: 'Design Patterns',
    tags: ['gof', 'creational', 'structural', 'behavioral'],
    answer: `The Gang of Four split 23 patterns into three families by *what they organize*:

| Family | Concern | Examples |
|--|--|--|
| **Creational** | How objects are **created** | Singleton, Factory Method, Abstract Factory, Builder, Prototype |
| **Structural** | How objects are **composed** | Adapter, Decorator, Facade, Proxy, Composite |
| **Behavioral** | How objects **communicate** | Strategy, Observer, Template Method, Command, State, Iterator |

Mnemonic: **create · compose · communicate**.`,
  },
  {
    id: 'oop-pat-singleton-threadsafe',
    question: 'How do you implement a thread-safe Singleton in Java, and why is the enum version preferred?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['singleton', 'creational', 'concurrency'],
    answer: `Common approaches:

- **Enum** — simplest and safest: thread-safe by classloader, serialization-safe, reflection-safe.
- **Lazy holder (initialization-on-demand)** — a private static nested class; the JVM guarantees safe, lazy loading with no locking.
- **Double-checked locking** — requires a \`volatile\` field to avoid publishing a partially constructed object.

\`\`\`java
public enum Config { INSTANCE; public String url() { return "..."; } }
\`\`\`

The **enum** is preferred because the JVM handles thread safety, lazy-ish init, and blocks the two classic Singleton attacks — extra instances via **serialization** and **reflection** — for free.

:::gotcha
Singleton is essentially global mutable state. It hides dependencies and hurts testability — prefer injecting one shared instance via DI over hardcoding \`getInstance()\`.
:::`,
  },
  {
    id: 'oop-pat-factory-vs-abstract-factory',
    question: 'What is the difference between Factory Method and Abstract Factory?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['factory method', 'abstract factory', 'creational'],
    answer: `Both hide concrete classes from the client, but at different scales:

- **Factory Method** — a single method the *subclass overrides* to produce **one** product. Uses **inheritance**.
- **Abstract Factory** — an object with several create-methods producing a **family** of related, matching products (e.g. an entire UI kit). Uses **composition** (you hold a factory instance).

An Abstract Factory is typically built *from* several Factory Methods. Rule of thumb: one product → Factory Method; a coordinated family → Abstract Factory.`,
  },
  {
    id: 'oop-pat-builder-when',
    question: 'When would you reach for the Builder pattern?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['builder', 'creational'],
    answer: `Use **Builder** when constructing an object requires many parameters — especially optional ones — and you want readable, safe, often immutable construction. It replaces the **telescoping-constructor** anti-pattern (\`new Pizza(size, true, false, true, ...)\`).

\`\`\`java
Pizza p = new Pizza.Builder("large").cheese(true).pepperoni(true).build();
\`\`\`

Benefits: named steps (self-documenting), no invalid half-built objects exposed, and the final object can be immutable. Java's \`StringBuilder\` and \`Stream.Builder\` are standard-library examples.`,
  },
  {
    id: 'oop-pat-decorator-io',
    question: 'Explain the Decorator pattern and where the JDK uses it.',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['decorator', 'structural', 'java.io'],
    answer: `**Decorator** adds responsibilities to an object *dynamically* by wrapping it in another object that shares the same interface. Decorators can stack, avoiding a subclass explosion.

The **\`java.io\`** stream classes are the textbook example:

\`\`\`java
DataInputStream in = new DataInputStream(
    new BufferedInputStream(
        new FileInputStream("data.bin")));
\`\`\`

Each wrapper adds a layer (file access → buffering → typed reads). \`Collections.unmodifiableList\` and \`synchronizedList\` are also decorators.

:::note
vs inheritance: inheritance adds behavior at compile time to every instance; Decorator adds it at runtime to individual objects, and combinations compose freely.
:::`,
  },
  {
    id: 'oop-pat-proxy-vs-decorator',
    question: 'Proxy and Decorator have the same structure. How do they differ?',
    difficulty: 'Hard',
    category: 'Design Patterns',
    tags: ['proxy', 'decorator', 'structural'],
    answer: `Structurally identical — both wrap an object that implements the same interface. The **intent** differs:

- **Decorator** — *adds behavior* to the wrapped object; the client usually supplies the wrapped object.
- **Proxy** — *controls access* to the real subject (lazy loading, caching, security, remoting); the proxy often *creates* the real subject itself and manages its lifecycle.

Real Proxy examples: Hibernate lazy-loaded entities, Spring AOP proxies, RMI stubs, \`java.lang.reflect.Proxy\`.`,
  },
  {
    id: 'oop-pat-strategy-vs-state',
    question: 'Strategy and State share an identical class diagram. What distinguishes them?',
    difficulty: 'Hard',
    category: 'Design Patterns',
    tags: ['strategy', 'state', 'behavioral'],
    answer: `Same UML (a context delegating to an interface with interchangeable implementations), different **intent**:

- **Strategy** — the client chooses an algorithm; strategies are *independent* of each other and unaware of one another.
- **State** — the object's behavior changes with its internal state; state objects *know about and trigger transitions* to other states.

Put simply: State is a Strategy that swaps *itself* as the object progresses (e.g. \`Order\`: New → Shipped → Delivered), whereas a Strategy is picked externally and stays put.`,
  },
  {
    id: 'oop-pat-observer',
    question: 'Describe the Observer pattern and a pitfall to watch for.',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['observer', 'behavioral', 'events'],
    answer: `**Observer** defines a one-to-many dependency: when a **subject** changes state, all registered **observers** are notified automatically. It underpins event systems, MVC, and reactive streams.

\`\`\`java
class NewsAgency {
  private final List<Observer> subs = new ArrayList<>();
  void subscribe(Observer o) { subs.add(o); }
  void publish(String news) { subs.forEach(o -> o.update(news)); }
}
\`\`\`

:::gotcha
**Memory leaks:** a subject holding strong references to observers keeps them alive after they should be collected. Always \`unsubscribe\`, or use weak references. Also watch out for notification order dependencies and re-entrancy.
:::`,
  },
  {
    id: 'oop-pat-template-method',
    question: 'What is the Template Method pattern and the "Hollywood Principle"?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['template method', 'behavioral'],
    answer: `**Template Method** defines the skeleton of an algorithm in a \`final\` method, deferring specific steps to subclasses via abstract/hook methods.

\`\`\`java
abstract class Game {
  public final void play() { initialize(); startPlay(); endPlay(); }
  protected abstract void initialize();
  protected abstract void startPlay();
  protected abstract void endPlay();
}
\`\`\`

The **Hollywood Principle** — "Don't call us, we'll call you" — captures the inversion: the base class controls the flow and *calls down* into the subclass's steps, rather than the subclass driving. Servlet's \`doGet\`/\`doPost\` hooks and \`AbstractList\` are JDK examples.`,
  },
  {
    id: 'oop-pat-which-undo',
    question: 'Which pattern would you use to implement undo/redo and to queue user actions?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['command', 'behavioral', 'scenario'],
    answer: `**Command.** Encapsulate each request as an object with \`execute()\` and \`undo()\`. Because a request is now a first-class object, you can:

- push executed commands onto a stack for **undo/redo**,
- **queue** or schedule them,
- **log** them for replay/audit.

\`\`\`java
interface Command { void execute(); void undo(); }
\`\`\`

The invoker (button, menu) holds a \`Command\` and doesn't know the receiver — decoupling *what* is requested from *who* performs it.`,
  },
  {
    id: 'oop-pat-which-payment',
    question: 'A checkout must support many payment methods, chosen at runtime and easy to extend. Which pattern, and why?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['strategy', 'behavioral', 'scenario'],
    answer: `**Strategy.** The *axis of change* is the payment algorithm, so encapsulate each behind a common interface and inject it into the checkout context.

\`\`\`java
interface PayStrategy { void pay(int cents); }
checkout.setStrategy(new PayPalStrategy());  // swap at runtime
\`\`\`

Adding a new method means adding a new class — no edits to existing checkout code (Open/Closed Principle). This beats a growing \`switch\` on payment type. A \`Comparator\` passed to \`sort\` is the same idea.`,
  },
  {
    id: 'oop-pat-overuse',
    question: 'What are the dangers of overusing design patterns, and when should you introduce one?',
    difficulty: 'Hard',
    category: 'Design Patterns',
    tags: ['anti-patterns', 'yagni', 'overuse'],
    answer: `Every pattern adds **indirection** — a cost paid up front for flexibility you may never need. Overuse smells:

- **Golden Hammer** — forcing one favorite pattern onto every problem.
- **Over-abstraction / YAGNI** — interfaces and factories with a single implementation.
- **Pattern soup** — five patterns for a trivial feature, so the code becomes unreadable.
- **Singleton abuse** — global mutable state that wrecks testability.

**When to introduce one:** refactor *toward* a pattern when real duplication or change pressure appears — not speculatively. Restate the problem and name the axis of change first; if plain code is simplest and clearest, use plain code.`,
  },
  {
    id: 'oop-pat-why-patterns',
    question: 'Why do design patterns exist — what is the point of them?',
    difficulty: 'Easy',
    category: 'Design Patterns',
    tags: ['gof', 'motivation', 'vocabulary'],
    answer: `**Design patterns** are named, reusable solutions to problems that recur across object-oriented designs, distilled from experience (the Gang of Four, 1994). Their value:

1. **Shared vocabulary** — saying *"use a Strategy here"* replaces a paragraph of explanation. Whole design discussions compress into pattern names.
2. **Proven structures** — each pattern captures a design that already balances known trade-offs, so you don't rediscover them.
3. **Design intent** — a pattern name signals *why* the code is shaped this way, aiding reviews and onboarding.

They're **templates to adapt**, not code to copy verbatim.

:::gotcha
A pattern solves a *problem in a context*. Reaching for one when you don't have the problem is over-engineering — always name the **force** (the thing that varies) before naming the pattern.
:::`,
  },
  {
    id: 'oop-pat-facade',
    question: 'What is the Facade pattern?',
    difficulty: 'Easy',
    category: 'Design Patterns',
    tags: ['facade', 'structural'],
    answer: `**Facade** provides a single, simplified interface to a complex subsystem, hiding its many classes behind one entry point.

\`\`\`java
class HomeTheaterFacade {
  void watchMovie(String title) {
    lights.dim(10); screen.down(); projector.on(); amp.setVolume(5); player.play(title);
  }
}
\`\`\`

Clients call \`facade.watchMovie(...)\` instead of orchestrating a dozen components, which **lowers coupling** — callers no longer depend on subsystem internals.

JDK/framework examples: \`SLF4J LoggerFactory\`, \`java.net.URL\` (hides sockets and protocol handlers).

:::note
Facade vs Adapter: an **Adapter** changes one interface to fit a client; a **Facade** invents a new, simpler interface over *many* classes. Facade simplifies; Adapter translates.
:::`,
  },
  {
    id: 'oop-pat-iterator',
    question: 'What is the Iterator pattern, and where does Java use it?',
    difficulty: 'Easy',
    category: 'Design Patterns',
    tags: ['iterator', 'behavioral', 'collections'],
    answer: `**Iterator** provides sequential access to a collection's elements **without exposing its internal representation**. The collection hands back an iterator with \`hasNext()\` / \`next()\`, so the client loops uniformly whether the backing store is an array, linked list, or tree.

\`\`\`java
for (String s : list) { ... }
// desugars to:
Iterator<String> it = list.iterator();
while (it.hasNext()) { String s = it.next(); ... }
\`\`\`

Java's \`Iterable\` / \`Iterator\` interfaces power **every for-each loop**.

Benefits: traversal is decoupled from representation, you can support multiple simultaneous cursors, and new collection types plug straight into existing loops.

:::note
Every enhanced-for loop you write *is* the Iterator pattern — the most-used GoF pattern in Java.
:::`,
  },
  {
    id: 'oop-pat-singleton-antipattern',
    question: 'Is the Singleton pattern an anti-pattern?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['singleton', 'anti-pattern', 'testability'],
    answer: `It's *often* called one, because a Singleton is essentially **global mutable state** with the usual downsides:

- **Hidden dependencies** — a class that calls \`getInstance()\` internally doesn't declare that collaborator in its API, so its dependencies are invisible.
- **Hard to test** — you can't substitute a mock, and state leaks between test cases.
- **Tight coupling** and concurrency hazards around shared mutable state.

Legitimate uses exist (a stateless registry, immutable config), but the better default is to create **one** instance and **inject** it:

\`\`\`java
// Spring beans are singleton-SCOPED, injected — not accessed via getInstance()
var service = new OrderService(sharedClock, sharedConfig);
\`\`\`

:::senior
"Single instance" is a **lifecycle** concern — let a DI container own it — not a reason to hardcode a global accessor. That gives you one instance *and* testability.
:::`,
  },
  {
    id: 'oop-pat-simple-factory',
    question: 'What is the difference between a simple factory and the Factory Method pattern?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['factory', 'factory method', 'creational'],
    answer: `A **simple factory** is a single method/class that \`switch\`es on a parameter to create the right type. It's a handy idiom but **not one of the 23 GoF patterns**:

\`\`\`java
static Shape create(String kind) {
  return switch (kind) { case "circle" -> new Circle(); case "square" -> new Square(); };
}
\`\`\`

**Factory Method** *is* a GoF pattern: an overridable method where **subclasses decide** the product (uses inheritance). **Abstract Factory** creates whole families.

| | Simple factory | Factory Method | Abstract Factory |
|--|--|--|--|
| Mechanism | one \`switch\` method | subclass overrides | object with many create-methods |
| Adds a type by | editing the \`switch\` | adding a subclass | — |
| GoF? | no | yes | yes |

:::note
A simple factory centralises \`new\` and hides concrete types, but its \`switch\` isn't itself open/closed. Interviewers often say just "Factory" — clarify which you mean.
:::`,
  },
  {
    id: 'oop-pat-adapter',
    question: 'What is the Adapter pattern, and where does the JDK use it?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['adapter', 'structural', 'java.io'],
    answer: `**Adapter** converts one interface into another the client expects, letting otherwise-incompatible types work together — the "power plug adapter" of code.

\`\`\`java
class SquarePegAdapter implements RoundPeg {   // client wants RoundPeg
  private final SquarePeg peg;                  // adaptee has a different interface
  SquarePegAdapter(SquarePeg p) { this.peg = p; }
  public double radius() { return peg.side() * Math.sqrt(2) / 2; }
}
\`\`\`

Two forms: **object adapter** (composition — wraps the adaptee, preferred) and **class adapter** (inheritance — limited in single-inheritance Java).

JDK examples: \`Arrays.asList\`, \`InputStreamReader\` (bytes → chars), \`Collections.enumeration\`.

:::note
Adapter vs Decorator: an Adapter gives the wrapped object a **different** interface and adds no behaviour; a Decorator keeps the **same** interface and adds behaviour.
:::`,
  },
  {
    id: 'oop-pat-composite',
    question: 'What is the Composite pattern, and when would you use it?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['composite', 'structural', 'tree'],
    answer: `**Composite** lets clients treat **individual objects and compositions uniformly** through a common interface — ideal for part-whole tree structures.

\`\`\`java
interface Node { int size(); }
record File(int bytes) implements Node { public int size() { return bytes; } }
class Directory implements Node {
  private final List<Node> children = new ArrayList<>();
  public int size() { return children.stream().mapToInt(Node::size).sum(); }  // recurse
}
\`\`\`

A \`Leaf\` and a \`Composite\` both implement \`Node\`; the composite holds children (also \`Node\`s) and forwards operations recursively. The client calls \`size()\` without caring whether it's a file or a folder.

Examples: file systems, GUI widget trees, org charts, arithmetic expression trees.

:::tip
Composite pairs naturally with **Iterator** (to traverse the tree) and **Visitor** (to run operations over it).
:::`,
  },
  {
    id: 'oop-pat-jdk-patterns',
    question: 'Name several GoF design patterns used in the JDK.',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['gof', 'jdk', 'examples'],
    answer: `The standard library is the best pattern catalogue you already use:

| Pattern | JDK example |
|--|--|
| Singleton | \`Runtime.getRuntime()\` |
| Factory Method | \`Calendar.getInstance()\`, \`valueOf\` |
| Builder | \`StringBuilder\`, \`Stream.Builder\` |
| Adapter | \`Arrays.asList\`, \`InputStreamReader\` |
| Decorator | \`java.io\` streams, \`Collections.unmodifiableList\` |
| Proxy | \`java.lang.reflect.Proxy\`, RMI stubs |
| Iterator | \`Iterator\` / \`Iterable\` (every for-each) |
| Strategy | \`Comparator\` passed to \`sort\` |
| Template Method | \`AbstractList\`, servlet \`doGet\` |
| Observer | listeners, \`java.util.concurrent.Flow\` |
| Facade | \`SLF4J LoggerFactory\` |

:::tip
Citing a JDK example proves you recognise patterns **in the wild**, not just on flashcards — that's what earns credibility.
:::`,
  },
  {
    id: 'oop-pat-strategy-vs-template',
    question: 'What is the difference between Strategy and Template Method?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['strategy', 'template method', 'behavioral'],
    answer: `Both vary *part* of an algorithm, but through different mechanisms:

| | Template Method | Strategy |
|--|--|--|
| Mechanism | **inheritance** | **composition** |
| Varies via | subclass overrides a hook | swappable strategy object |
| Bound | compile time | runtime (swap/combine) |
| Relationship | IS-A | HAS-A |

**Template Method** fixes the skeleton in a \`final\` base method and lets subclasses fill in steps. **Strategy** holds the varying behaviour behind an interface and delegates to it.

\`\`\`java
sorter.setStrategy(new QuickSort());   // Strategy — change at runtime
class CsvReport extends Report { void render() { ... } }  // Template Method — fixed at compile time
\`\`\`

:::senior
They're the *inheritance vs composition* versions of the same idea. Prefer **Strategy** when you need to swap behaviour at runtime or mix behaviours; use Template Method when a stable skeleton genuinely shares a lot of code.
:::`,
  },
  {
    id: 'oop-pat-structural-comparison',
    question: 'Adapter, Decorator, Proxy, and Facade all wrap another object. How do they differ?',
    difficulty: 'Hard',
    category: 'Design Patterns',
    tags: ['structural', 'adapter', 'decorator', 'proxy', 'facade'],
    answer: `All four wrap a delegate; the **intent** distinguishes them:

| Pattern | Interface vs wrapped | Purpose |
|--|--|--|
| **Adapter** | **different** | convert an interface to fit the client |
| **Decorator** | **same** | add responsibilities dynamically (stackable) |
| **Proxy** | **same** | control access — lazy load, security, remote, cache |
| **Facade** | **new, simpler** | hide a whole subsystem behind one entry point |

The discriminating questions:
- Does it keep the same interface (**Decorator/Proxy**), change it (**Adapter**), or introduce a simpler one over many classes (**Facade**)?
- Does it **add behaviour** (Decorator), **gate access** (Proxy), or just **translate** (Adapter)?

:::key
Same structure, different intent. Interviewers use this quartet to test whether you reason about patterns by **purpose**, not by class-diagram shape.
:::`,
  },
  {
    id: 'oop-pat-flyweight',
    question: 'What is the Flyweight pattern, and how does Integer caching relate to it?',
    difficulty: 'Hard',
    category: 'Design Patterns',
    tags: ['flyweight', 'structural', 'memory'],
    answer: `**Flyweight** minimises memory by **sharing** immutable **intrinsic** state across many objects, while **extrinsic** (context-specific) state is passed in per use. A factory caches and hands back shared instances instead of allocating new ones.

The JDK's boxed-\`Integer\` cache is a flyweight: \`Integer.valueOf\` returns shared instances for \`-128..127\`.

\`\`\`java
Integer a = 127, b = 127;   // both from the cache
a == b;                     // true  — same shared object
Integer c = 128, d = 128;   // outside the cache → new objects
c == d;                     // false
\`\`\`

Other examples: the \`String\` pool (interned literals), \`Boolean.TRUE\`.

Use it when you have **huge numbers of similar objects** — text glyphs, game particles, spreadsheet cells.

:::gotcha
That \`Integer\` \`==\` surprise is Flyweight leaking into equality: cached boxes are shared (\`==\` true), uncached ones aren't. Always compare boxed values with \`.equals()\`.
:::`,
  },
  {
    id: 'oop-pat-visitor',
    question: 'What is the Visitor pattern, and what is double dispatch?',
    difficulty: 'Hard',
    category: 'Design Patterns',
    tags: ['visitor', 'behavioral', 'double-dispatch'],
    answer: `**Visitor** lets you add new **operations** to a fixed object structure **without modifying** the element classes. You move the operation into a \`Visitor\`; each element's \`accept(visitor)\` calls back \`visitor.visit(this)\`.

\`\`\`java
interface Node { <R> R accept(Visitor<R> v); }
interface Visitor<R> { R visit(NumberNode n); R visit(AddNode a); }
\`\`\`

This achieves **double dispatch**: the method chosen depends on the runtime type of **both** the element (via \`accept\`) *and* the visitor (via overload resolution) — something a single virtual call can't do.

Visitor is the mirror of the expression problem: **easy to add operations** (a new visitor), **hard to add element types** (edit every visitor). Great for stable ASTs, compilers, and serialisation.

:::senior
Java has no built-in double dispatch, so Visitor simulates it. Modern \`sealed\` hierarchies + \`switch\` pattern matching are often a cleaner alternative today.
:::`,
  },
];

export default questions;
