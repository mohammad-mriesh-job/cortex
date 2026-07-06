import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'design-singleton-best',
    question: 'What is the best way to implement a Singleton in Java, and why?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['singleton', 'creational', 'thread-safety'],
    answer: `Joshua Bloch's recommendation is the **single-element enum** — concise, thread-safe by the language, and the only approach that's free against serialization and reflection attacks:

\`\`\`java
public enum Config {
    INSTANCE;
    public String get(String key) { /* ... */ }
}
\`\`\`

If you need **lazy** initialisation, use the **initialization-on-demand holder** idiom — lazy *and* thread-safe with no locking, because the JVM guarantees class init runs once:

\`\`\`java
public final class Registry {
    private Registry() {}
    private static class Holder { static final Registry INSTANCE = new Registry(); }
    public static Registry getInstance() { return Holder.INSTANCE; }
}
\`\`\`

:::gotcha
**Double-checked locking** works only if the instance field is \`volatile\`; otherwise a thread can see a partially constructed object due to instruction reordering.
:::`,
  },
  {
    id: 'design-factory-vs-abstract-factory',
    question: 'What is the difference between Factory Method and Abstract Factory?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['factory', 'abstract-factory', 'creational'],
    answer: `Both hide concrete classes from the client, but they operate at different scales:

- **Factory Method** — *one* product. A method (often abstract) lets **subclasses decide** which class to instantiate. Uses **inheritance**.
- **Abstract Factory** — a *family* of related products. An object exposes several factory methods so everything it creates belongs to one consistent family (e.g. all "Mac" widgets). Uses **composition**.

\`\`\`java
// Factory Method
abstract class Dialog { abstract Button createButton(); }

// Abstract Factory
interface GuiFactory { Button button(); Checkbox checkbox(); }
\`\`\`

Rule of thumb: Abstract Factory is usually *implemented with* several Factory Methods.`,
  },
  {
    id: 'design-decorator-java-io',
    question: 'Explain the Decorator pattern. Where does the JDK use it?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['decorator', 'structural', 'java-io'],
    answer: `Decorator attaches responsibilities to an object **dynamically** by wrapping it in another object that implements the **same interface** and delegates to the wrapped one. It's a flexible alternative to subclassing for extending behaviour.

The canonical JDK example is **\`java.io\`**, where every stream wraps another:

\`\`\`java
InputStream in = new GZIPInputStream(
                     new BufferedInputStream(
                         new FileInputStream("data.gz")));
\`\`\`

Each wrapper *is* an \`InputStream\` and adds one capability (buffering, decompression). \`Collections.synchronizedList\` and \`unmodifiableList\` are decorators too.

:::tip
Decorator avoids a combinatorial explosion of subclasses (\`BufferedGzipFileInputStream\`...) by letting you compose features at runtime.
:::`,
  },
  {
    id: 'design-decorator-vs-proxy-vs-adapter',
    question: 'Decorator, Proxy, and Adapter all wrap an object — how do they differ?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['decorator', 'proxy', 'adapter', 'structural'],
    answer: `All three wrap a delegate, so they look alike structurally. The difference is **intent**:

| Pattern | Interface | Purpose |
|---------|-----------|---------|
| **Adapter** | *changes* it | Make an incompatible type fit a target interface |
| **Decorator** | *keeps* it | Add behaviour transparently |
| **Proxy** | *keeps* it | Control access (lazy load, security, remoting, caching) |

So: if you're translating an interface it's an Adapter; if you're adding capability it's a Decorator; if you're gating or deferring access it's a Proxy.`,
  },
  {
    id: 'design-dynamic-proxy',
    question: 'What is a dynamic proxy in Java and what is it used for?',
    difficulty: 'Hard',
    category: 'Design Patterns',
    tags: ['proxy', 'dynamic-proxy', 'reflection'],
    answer: `A **dynamic proxy** is a proxy class **generated at runtime** by \`java.lang.reflect.Proxy\`. You supply the interfaces to implement and an \`InvocationHandler\` that intercepts every method call:

\`\`\`java
Foo proxy = (Foo) Proxy.newProxyInstance(
    Foo.class.getClassLoader(),
    new Class<?>[]{ Foo.class },
    (p, method, args) -> {
        log(method);
        return method.invoke(target, args);
    });
\`\`\`

It powers **Spring AOP** (\`@Transactional\`), **Mockito** mocks, and lazy ORM loading.

:::gotcha
JDK dynamic proxies only proxy **interfaces** — to proxy a concrete class you need CGLIB/ByteBuddy. And **self-invocation** (\`this.method()\`) bypasses the proxy, so the advice silently doesn't run.
:::`,
  },
  {
    id: 'design-strategy-lambda',
    question: 'How does the Strategy pattern look in modern Java?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['strategy', 'behavioral', 'lambdas'],
    answer: `Strategy encapsulates interchangeable algorithms behind a common interface. With a **functional interface**, a strategy is simply a **lambda** — no concrete strategy classes needed:

\`\`\`java
@FunctionalInterface interface DiscountStrategy { double apply(double price); }

DiscountStrategy black = price -> price * 0.80;
double checkout(double price, DiscountStrategy s) { return s.apply(price); }
\`\`\`

The JDK's prime example is **\`Comparator\`**:

\`\`\`java
list.sort(Comparator.comparing(Person::age));   // ordering is the injected strategy
\`\`\`

This is why \`java.util.function\` largely replaced hand-written Strategy classes.`,
  },
  {
    id: 'design-strategy-vs-state',
    question: 'Strategy and State are structurally identical — when is it which?',
    difficulty: 'Hard',
    category: 'Design Patterns',
    tags: ['strategy', 'state', 'behavioral'],
    answer: `Both have an object delegate to a swappable helper. The distinction is **who decides the swap and whether it changes**:

- **Strategy** — the *client* picks one algorithm, and it typically **doesn't change** during use (e.g. a sort order or pricing rule). The client knows the strategy.
- **State** — the object **transitions itself** between states based on events, and the client usually neither knows nor cares which concrete state is active (e.g. a traffic light or order lifecycle).

In short: if the wrapped object decides "what comes next", it's State; if the client decides "how to do this", it's Strategy.`,
  },
  {
    id: 'design-lsp-violation',
    question: 'Give a classic Liskov Substitution Principle violation.',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['solid', 'lsp', 'inheritance'],
    answer: `The textbook case is **\`Square extends Rectangle\`**. A square overrides the setters so width and height stay equal:

\`\`\`java
class Square extends Rectangle {
    void setWidth(int w)  { this.w = this.h = w; }
    void setHeight(int h) { this.w = this.h = h; }
}
\`\`\`

Code written against \`Rectangle\` assumes the two dimensions are independent:

\`\`\`java
r.setWidth(5); r.setHeight(4);
assert r.area() == 20;   // true for Rectangle, FALSE for Square (16)
\`\`\`

\`Square\` weakens that postcondition, so it isn't substitutable.

:::note
LSP is about **behavioural contracts**, not compilation. Subtypes also break it by strengthening preconditions, throwing new exceptions, or weakening guarantees.
:::`,
  },
  {
    id: 'design-builder-when',
    question: 'When should you use a Builder instead of constructors?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['builder', 'creational', 'idioms'],
    answer: `Reach for a Builder when an object has **many parameters, especially optional ones**. It cures the **telescoping-constructor** anti-pattern and produces readable, order-independent, immutable construction:

\`\`\`java
var req = HttpRequest.builder("https://api")
                     .method("POST")
                     .timeout(Duration.ofSeconds(5))
                     .build();
\`\`\`

Benefits over a giant constructor: named arguments at the call site, sensible defaults, and you can validate in \`build()\`. The JDK's \`HttpRequest.newBuilder()\` and \`Stream.Builder\` use it.

:::tip
For a handful of required fields with no optionals, a **record** is simpler — don't add a Builder you don't need.
:::`,
  },
  {
    id: 'design-null-optional',
    question: 'How does Optional improve on returning null, and how is it misused?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['optional', 'null', 'idioms'],
    answer: `\`Optional<T>\` makes "value may be absent" **explicit in the type**, forcing the caller to handle the empty case instead of risking a forgotten null check and an NPE:

\`\`\`java
repo.find(id)               // Optional<User>
    .map(User::name)
    .ifPresent(System.out::println);
\`\`\`

:::gotcha
Misuses to avoid:
- **Fields / parameters** — don't; use \`requireNonNull\` for params, plain types for fields. (\`Optional\` isn't \`Serializable\`.)
- **Collections** — return an empty list, not \`Optional<List>\`.
- **\`get()\` without checking** — trades an NPE for \`NoSuchElementException\`; use \`orElse\`/\`orElseThrow\`/\`map\`.
:::

\`Optional\` is meant for **return types** signalling possible absence — nothing more.`,
  },
  {
    id: 'design-patterns-categories',
    question: 'What are the three categories of GoF design patterns?',
    difficulty: 'Easy',
    category: 'Design Patterns',
    tags: ['gof', 'categories', 'fundamentals'],
    answer: `The 23 Gang of Four patterns fall into three groups by **what they organize**:

| Category | Concern | Examples |
|----------|---------|----------|
| **Creational** | how objects are **created** | Singleton, Factory Method, Abstract Factory, Builder, Prototype |
| **Structural** | how objects are **composed** | Adapter, Decorator, Proxy, Facade, Composite, Bridge, Flyweight |
| **Behavioral** | how objects **interact / share responsibility** | Strategy, Observer, Command, Template Method, Iterator, State, Chain of Responsibility, Visitor |

- **Creational** patterns decouple you from concrete classes and control instantiation.
- **Structural** patterns assemble objects into larger structures while keeping them flexible.
- **Behavioral** patterns manage algorithms and the flow of communication between objects.

:::tip
Don't memorize all 23 — know the category idea and be fluent in the handful you actually use (Strategy, Factory, Builder, Decorator, Observer, Singleton). Interviewers reward "here's where I used it" over reciting the catalog.
:::`,
  },
  {
    id: 'design-solid',
    question: 'What are the SOLID principles?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['solid', 'principles', 'design'],
    answer: `Five principles for maintainable object-oriented design:

| | Principle | Meaning |
|--|-----------|---------|
| **S** | Single Responsibility | a class should have **one reason to change** |
| **O** | Open/Closed | open for **extension**, closed for **modification** |
| **L** | Liskov Substitution | subtypes must be **substitutable** for their base type |
| **I** | Interface Segregation | many **small** interfaces beat one **fat** one |
| **D** | Dependency Inversion | depend on **abstractions**, not concretions |

\`\`\`java
// Open/Closed: add a new shape without editing existing code
interface Shape { double area(); }
record Circle(double r) implements Shape { public double area() { return Math.PI*r*r; } }
// a new Shape needs a new class, not a change to an 'if/else area' switch
\`\`\`

- **SRP** curbs god-classes; **OCP** favors polymorphism over editing tested code; **DIP** is what dependency injection implements.

:::senior
SOLID is a set of **heuristics**, not laws — over-applying ISP/DIP breeds a maze of one-method interfaces and indirection. Apply them where change actually happens; don't abstract speculatively.
:::`,
  },
  {
    id: 'design-singleton-attacks',
    question: 'How can a Singleton be broken, and how do you defend each case?',
    difficulty: 'Hard',
    category: 'Design Patterns',
    tags: ['singleton', 'reflection', 'serialization', 'thread-safety'],
    answer: `A hand-written singleton (private constructor + static instance) has several holes:

| Attack | How it breaks | Defense |
|--------|---------------|---------|
| **Reflection** | \`setAccessible(true)\` on the private ctor → new instance | throw from the ctor if the instance already exists |
| **Serialization** | deserializing creates a **second** instance | \`readResolve()\` returns the canonical instance |
| **Cloning** | \`clone()\` copies it | override \`clone()\` to throw |
| **Multiple classloaders** | each loader → its own instance | rarely fully preventable |

\`\`\`java
protected Object readResolve() { return INSTANCE; }   // deserialization returns the one instance
\`\`\`

The **single-element enum** closes all of these for free — the JVM blocks reflective enum instantiation and guarantees one instance across (de)serialization:

\`\`\`java
public enum Config { INSTANCE; /* ... */ }
\`\`\`

:::senior
This is exactly why *Effective Java* calls the enum singleton "the best way to implement a singleton." A conventional singleton needs \`volatile\` double-checked locking **plus** \`readResolve\` **plus** a reflection guard to match what one line of enum gives you.
:::`,
  },
  {
    id: 'design-observer',
    question: 'Explain the Observer pattern. Where does the JDK use it?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['observer', 'behavioral', 'listeners'],
    answer: `A **subject** keeps a list of **observers** and notifies them whenever its state changes, so publishers and subscribers stay decoupled — the subject knows only the observer *interface*.

\`\`\`java
interface Listener { void onEvent(Event e); }
class Button {
    private final List<Listener> listeners = new ArrayList<>();
    void addListener(Listener l) { listeners.add(l); }
    void click() { listeners.forEach(l -> l.onEvent(new Event())); }  // notify
}
\`\`\`

JDK/ecosystem examples: **Swing/AWT listeners** (\`ActionListener\`, \`PropertyChangeListener\`), \`Flow.Publisher\`/\`Subscriber\` (reactive streams, Java 9), and every event bus. The legacy \`java.util.Observer\` was deprecated in Java 9.

:::gotcha
The classic bug is the **lapsed listener** leak: a subject holds a strong reference to observers that forget to deregister, so they're never garbage-collected. Always provide (and call) \`removeListener\`, or hold observers via \`WeakReference\`. Also decide what happens if one observer throws mid-notification.
:::`,
  },
  {
    id: 'design-template-method',
    question: 'What is the Template Method pattern?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['template-method', 'behavioral', 'inheritance'],
    answer: `A base class defines the **skeleton** of an algorithm in one (usually \`final\`) method and defers specific steps to **hook methods** that subclasses override. The overall flow is fixed; the details vary.

\`\`\`java
abstract class DataExporter {
    public final void export() {     // the template — fixed order
        var data = fetch();
        var formatted = format(data);
        write(formatted);
    }
    protected abstract List<Row> fetch();     // hooks — subclasses fill in
    protected abstract String format(List<Row> rows);
    protected void write(String s) { /* default */ }
}
\`\`\`

It's "**don't call us, we'll call you**" — inversion of control via inheritance. JDK examples: \`AbstractList\`, \`InputStream.read(byte[])\` calling the abstract \`read()\`, and \`HttpServlet.service\` dispatching to \`doGet\`/\`doPost\`.

:::senior
Template Method uses **inheritance** (compile-time, one hierarchy); **Strategy** achieves similar variation via **composition** (runtime-swappable, more flexible). Prefer Strategy/lambdas unless the fixed skeleton genuinely belongs in a base class.
:::`,
  },
  {
    id: 'design-command',
    question: 'What is the Command pattern and what does it enable?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['command', 'behavioral', 'undo'],
    answer: `**Command** encapsulates a request as an object with an \`execute()\` method, decoupling the **invoker** (what triggers it) from the **receiver** (what does the work). Because the request is now a first-class object, you can **queue** it, **log** it, **schedule** it, or support **undo/redo**.

\`\`\`java
interface Command { void execute(); }
class InsertText implements Command {
    public void execute() { doc.insert(text); }
    public void undo()    { doc.delete(text); }   // store the inverse for undo
}
history.push(cmd); cmd.execute();   // later: history.pop().undo();
\`\`\`

The JDK's \`Runnable\` **is** a command object; an \`ExecutorService\` is an invoker that queues and runs commands. Swing's \`Action\` and button handlers are commands too.

:::tip
In modern Java a stateless command is often just a **lambda** (\`Runnable\`). Reach for a full \`Command\` class when you need extra operations on the request itself — \`undo()\`, \`serialize()\`, a label, or a receiver reference.
:::`,
  },
  {
    id: 'design-flyweight',
    question: 'What is the Flyweight pattern, and where does the JDK use it?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['flyweight', 'structural', 'caching'],
    answer: `**Flyweight** minimizes memory by **sharing** immutable objects instead of creating many identical ones. It splits state into:
- **intrinsic** — shared, context-free (cached and reused);
- **extrinsic** — context-specific (passed in by the caller).

The JDK uses it in several caches:

\`\`\`java
Integer a = Integer.valueOf(100);  // cached (-128..127) — shared flyweight
Integer b = Integer.valueOf(100);  // same object as a
String s = "hello";                // string pool — interned literals shared
\`\`\`

\`Integer.valueOf\`, \`Boolean.valueOf\`, \`Character\`'s cache, and the **String pool** are all flyweights — reusing one instance for a value that appears constantly.

:::gotcha
Flyweights **must be immutable** (they're shared). And the \`Integer\` cache is exactly why \`==\` on boxed \`Integer\`s is \`true\` for 127 but \`false\` for 128 — sharing below the cache limit, distinct objects above it. Always compare wrappers with \`.equals()\`.
:::`,
  },
  {
    id: 'design-facade',
    question: 'What is the Facade pattern?',
    difficulty: 'Easy',
    category: 'Design Patterns',
    tags: ['facade', 'structural', 'simplification'],
    answer: `A **Facade** provides one simplified, unified interface over a complex subsystem, hiding its many moving parts so clients don't couple to internals.

\`\`\`java
// Without a facade: caller wires up connection, statement, result set, mapping...
// With a facade:
class OrderRepository {              // simple surface
    List<Order> findByCustomer(long id) { /* hides JDBC/JPA plumbing */ }
}
\`\`\`

Framework examples: Spring's \`JdbcTemplate\` (a facade over raw JDBC's connection/statement/result-set dance), **SLF4J** (a facade over logging backends), and \`javax.faces\`. The client calls a couple of clean methods; the subsystem complexity stays behind the wall.

:::note
Facade vs Adapter: a **facade** *simplifies* access to a subsystem (a new, easier interface); an **adapter** *converts* one existing interface into another the client expects. Facade is about ease; adapter is about compatibility.
:::`,
  },
  {
    id: 'design-iterator',
    question: 'What is the Iterator pattern, and how does Java implement it?',
    difficulty: 'Easy',
    category: 'Design Patterns',
    tags: ['iterator', 'behavioral', 'collections'],
    answer: `**Iterator** provides sequential access to a collection's elements **without exposing its internal structure** — the same traversal API works over an array, a linked list, or a tree.

Java bakes it into the language via \`Iterable\`/\`Iterator\`, which is what powers the for-each loop:

\`\`\`java
class Bag<T> implements Iterable<T> {
    private final List<T> items = new ArrayList<>();
    public Iterator<T> iterator() { return items.iterator(); }
}
for (var x : bag) { ... }   // works because Bag is Iterable
\`\`\`

Every \`Collection\` implements \`Iterable\`, so all of them are traversed uniformly, and you can have **multiple independent iterations** over the same collection at once.

:::tip
Implementing \`Iterable\` on your own type is the cleanest way to make it for-each-friendly and stream-able (add a \`default\` \`stream()\` via \`StreamSupport\`). \`Iterator.remove()\` is also the safe way to delete during traversal.
:::`,
  },
  {
    id: 'design-overengineering',
    question: 'When should you NOT reach for a design pattern?',
    difficulty: 'Hard',
    category: 'Design Patterns',
    tags: ['overengineering', 'yagni', 'judgment'],
    answer: `Patterns add **indirection**, and indirection has a cost — more classes, more files, more to trace when reading. Avoid a pattern when:

- **You have one case, not a recurring problem** — apply the *rule of three*: extract an abstraction after the third duplication, not before.
- **It's speculative** (YAGNI) — an interface with a single implementation "for future flexibility" is usually just noise.
- **The pattern name substitutes for thought** — a \`FactoryFactory\`, or a \`Strategy\` where a simple \`if\` would do.

\`\`\`java
// Overengineered:
interface Greeter { String greet(); }
class EnglishGreeter implements Greeter { public String greet() { return "hi"; } }
GreeterFactory.create("en").greet();
// Right-sized:
String greet() { return "hi"; }
\`\`\`

:::senior
Seniority shows in **removing** abstraction as often as adding it. Start with the simplest thing that works; introduce a pattern when *actual* change pressure or duplication appears. Premature abstraction is as costly as premature optimization — you pay for flexibility you never use and it obscures the real logic.
:::`,
  },
];

export default questions;
