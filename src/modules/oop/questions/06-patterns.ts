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
];

export default questions;
