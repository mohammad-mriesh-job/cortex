import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'pat-iq-swap-algorithm',
    question: 'Which pattern lets you swap an algorithm (e.g. a sorting or pricing strategy) at runtime, and how does it differ from State?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['strategy', 'state', 'choosing'],
    answer: `**Strategy.** It encapsulates interchangeable algorithms behind one interface and lets a context delegate to whichever the client picks.

\`\`\`java
list.sort(Comparator.comparing(User::name)); // client chose the algorithm
\`\`\`

**Strategy vs State** — they share the same UML but differ in intent:

| | Strategy | State |
|--|--|--|
| Who switches | The **client** | The **object itself** |
| States aware of each other | No | Yes (drive transitions) |
| Answers | "*How* do I do this?" | "*What* am I now?" |

:::tip
If a *whole behavior* is chosen by the caller → Strategy. If behavior changes because the object *moved to a new mode* → State.
:::`,
  },
  {
    id: 'pat-iq-add-behavior',
    question: 'You need to add responsibilities to objects dynamically without a subclass for every combination. Which pattern, and what is a real JDK example?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['decorator', 'jdk', 'choosing'],
    answer: `**Decorator** — wrap the object in another that shares its interface and adds behavior. You can stack wrappers in any order, avoiding a combinatorial explosion of subclasses.

The canonical JDK example is \`java.io\`:

\`\`\`java
InputStream in =
  new BufferedInputStream(     // + buffering
    new GZIPInputStream(        // + decompression
      new FileInputStream(f))); // base
\`\`\`

Contrast with **Adapter** (converts an interface), **Proxy** (controls access, same interface), and **Facade** (new simpler interface over a subsystem).`,
  },
  {
    id: 'pat-iq-undo-redo',
    question: 'How would you design unlimited undo/redo in a text editor? Which pattern(s)?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['command', 'memento', 'choosing'],
    answer: `**Command** (plus **Memento** for state snapshots).

- **Command** wraps each user action as an object with \`execute()\` and \`undo()\`. Push executed commands onto an undo stack; pop to reverse.
- **Memento** captures an object's internal state so it can be restored later, without exposing its internals.

\`\`\`java
interface Command { void execute(); void undo(); }
Deque<Command> undoStack = new ArrayDeque<>();
\`\`\`

Command also gives you queuing, logging, and macro (composite) commands for free.`,
  },
  {
    id: 'pat-iq-families',
    question: 'A cross-platform app must produce matching sets of buttons, checkboxes, and menus per OS. Which creational pattern fits, and how does it differ from Factory Method?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['abstract-factory', 'factory-method', 'confused-pairs'],
    answer: `**Abstract Factory** — it creates **families of related products** (a per-OS widget kit) meant to be used together.

| | Factory Method | Abstract Factory |
|--|--|--|
| Produces | One product | A family of related products |
| Mechanism | Inheritance (override a method) | Composition (a factory object) |

\`\`\`java
interface GuiFactory {
  Button createButton();
  Checkbox createCheckbox(); // whole family
}
\`\`\`

An Abstract Factory is often *implemented with* several Factory Methods, which is why they blur together.`,
  },
  {
    id: 'pat-iq-four-wrappers',
    question: 'Adapter, Decorator, Proxy, and Facade all wrap another object. What distinguishes each?',
    difficulty: 'Hard',
    category: 'Interview Prep',
    tags: ['adapter', 'decorator', 'proxy', 'facade', 'confused-pairs'],
    answer: `All four wrap — the difference is **why**:

| Pattern | Changes interface? | Adds behavior? | Intent |
|--|--|--|--|
| **Adapter** | **Yes** — converts | No | Make an incompatible interface usable |
| **Decorator** | No — same | **Yes** — enhances | Add responsibilities dynamically |
| **Proxy** | No — same | No (controls access) | Guard / defer / delegate access |
| **Facade** | **New, simpler** | No | Hide a complex subsystem |

Mnemonic: Adapter **converts**, Decorator **enhances**, Proxy **guards**, Facade **simplifies**.`,
  },
  {
    id: 'pat-iq-decorator-vs-composite',
    question: 'What is the difference between Decorator and Composite?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['decorator', 'composite', 'confused-pairs'],
    answer: `Both build recursive structures on a shared component interface, but:

| | Decorator | Composite |
|--|--|--|
| Children | Exactly **one** | **Many** |
| Goal | Add behavior | Represent a part-whole tree |
| Shape | Linear chain | Tree |

**Decorator** wraps a single component to augment its behavior (\`new Whip(new Milk(coffee))\`). **Composite** holds many children so clients treat a leaf and a group uniformly (a folder containing files and folders).`,
  },
  {
    id: 'pat-iq-observer-vs-mediator',
    question: 'When would you choose Observer over Mediator?',
    difficulty: 'Hard',
    category: 'Interview Prep',
    tags: ['observer', 'mediator', 'confused-pairs'],
    answer: `Both decouple objects that would otherwise reference each other directly.

- **Observer** — **one-to-many broadcast**. A subject notifies many subscribers of a change; subscribers don't coordinate. Use for event/notification fan-out (listeners, \`Flow\` API).
- **Mediator** — **many-to-many coordination**. Peers talk only to a central hub that routes interactions and holds the coordination logic. Use when many components interact in complex ways (a dialog coordinating its widgets).

| | Observer | Mediator |
|--|--|--|
| Direction | One → many | Many ↔ many via hub |
| Central object | Subject emits events | Mediator orchestrates logic |`,
  },
  {
    id: 'pat-iq-single-instance',
    question: 'You need exactly one instance of a class with global access. Which pattern, what is the safest Java implementation, and what is the main criticism?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['singleton', 'choosing', 'thread-safety'],
    answer: `**Singleton** — private constructor plus a static accessor.

Safest implementation: a single-element **\`enum\`** (thread-safe and serialization-safe for free), or the **Bill Pugh holder** for lazy loading.

\`\`\`java
public enum Config { INSTANCE; public void load() { } }
\`\`\`

**Criticism:** it is global mutable state that hides dependencies and hurts testability. Prefer **dependency injection** (e.g. a Spring singleton-scoped bean) so instances stay mockable.`,
  },
  {
    id: 'pat-iq-many-optional-params',
    question: 'A class has many optional construction parameters and telescoping constructors are getting unwieldy. Which pattern?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['builder', 'choosing'],
    answer: `**Builder** — construct the object step by step with a fluent API, then \`build()\`. It replaces telescoping constructors and makes optional fields readable.

\`\`\`java
HttpClient client = HttpClient.newBuilder()
    .connectTimeout(Duration.ofSeconds(5))
    .followRedirects(Redirect.NORMAL)
    .build();
\`\`\`

JDK examples: \`StringBuilder\`, \`Stream.Builder\`, \`HttpClient.newBuilder()\`.`,
  },
  {
    id: 'pat-iq-integer-cache',
    question: 'Why is Integer.valueOf(100) == Integer.valueOf(100) true but the same with 200 is false? Which pattern is involved?',
    difficulty: 'Hard',
    category: 'Interview Prep',
    tags: ['flyweight', 'factory-method', 'jdk'],
    answer: `Two patterns: \`valueOf\` is a **Factory Method** (hides \`new\`, can return cached instances) and its cache is a **Flyweight** (shares immutable objects).

\`Integer.valueOf\` caches boxed integers in the range **-128..127** and returns the shared instance. Outside that range it creates a new object each call:

\`\`\`java
Integer.valueOf(100) == Integer.valueOf(100); // true  — cached & shared
Integer.valueOf(200) == Integer.valueOf(200); // false — new objects
\`\`\`

This is exactly why you must compare boxed \`Integer\`s with \`.equals()\`, never \`==\`.`,
  },
  {
    id: 'pat-iq-spring-transactional',
    question: 'How does Spring make a @Transactional method open and commit a transaction, and which pattern is that?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['proxy', 'spring', 'jdk'],
    answer: `**Proxy** (via Spring AOP). Spring wraps your bean in a dynamic proxy; the proxy intercepts the call, starts a transaction, delegates to the real method, then commits or rolls back.

\`\`\`java
@Transactional
public void transfer() { ... } // proxy wraps this call
\`\`\`

:::gotcha
Because the proxy sits *outside* the bean, a \`@Transactional\` method **called from within the same class** (self-invocation) bypasses the proxy and the annotation has no effect.
:::

Hibernate uses the same idea for lazy-loading proxies — the real entity is fetched only when a field is touched.`,
  },
  {
    id: 'pat-iq-template-method',
    question: 'A base class should define the skeleton of an algorithm and let subclasses fill in specific steps. Which pattern, and where is it in the JDK?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['template-method', 'jdk', 'choosing'],
    answer: `**Template Method.** The base class implements the invariant algorithm and calls abstract "hook" methods that subclasses override.

JDK examples: \`AbstractList\` implements \`iterator()\`/\`indexOf()\` in terms of your \`get()\` and \`size()\`; \`HttpServlet.service()\` dispatches to \`doGet()\`/\`doPost()\`.

\`\`\`java
class Ints extends AbstractList<Integer> {
  public Integer get(int i) { ... } // hook
  public int size() { ... }         // hook
}
\`\`\`

Contrast with **Strategy**, which varies the algorithm via composition instead of inheritance.`,
  },
  {
    id: 'pat-iq-request-chain',
    question: 'A request should pass through a series of handlers (auth, logging, compression), each able to handle or forward it. Which pattern, and a real example?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['chain-of-responsibility', 'jdk', 'choosing'],
    answer: `**Chain of Responsibility.** Each handler either processes the request or passes it to the next, decoupling sender from receiver.

Real examples: the **servlet \`Filter\` chain** and the **Spring Security filter chain**.

\`\`\`java
public void doFilter(req, res, chain) {
  // pre-processing
  chain.doFilter(req, res); // hand off to next
  // post-processing
}
\`\`\``,
  },
  {
    id: 'pat-iq-traverse-collection',
    question: 'How do you traverse a collection without exposing its internal structure, and which pattern powers the enhanced for-loop?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['iterator', 'jdk', 'choosing'],
    answer: `**Iterator.** It provides \`hasNext()\`/\`next()\` to walk a collection without revealing whether it is backed by an array, a tree, or a list.

The enhanced \`for\` loop is syntactic sugar over \`Iterable.iterator()\`:

\`\`\`java
for (String s : list) { }        // compiles to...
Iterator<String> it = list.iterator();
while (it.hasNext()) { String s = it.next(); }
\`\`\``,
  },
  {
    id: 'pat-iq-gof-families',
    question: 'How are the 23 GoF patterns categorized, and give one example from each family.',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['cheatsheet', 'gof', 'overview'],
    answer: `Three families, **5 + 7 + 11 = 23**:

- **Creational (5)** — *how objects are made*: Singleton, Factory Method, Abstract Factory, Builder, Prototype.
- **Structural (7)** — *how objects compose*: Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy.
- **Behavioral (11)** — *how objects interact*: Chain of Responsibility, Command, Interpreter, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, Visitor.

:::tip
Knowing the family sizes (5/7/11) signals you studied the actual catalog, not just the popular few.
:::`,
  },
  {
    id: 'pat-iq-explain-in-90s',
    question: 'How do you explain any design pattern in about 90 seconds in an interview?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['communication', 'framework', 'meta'],
    answer: `Use a four-beat structure — **problem → structure → sighting → trade-off** — so you sound like you've *used* the pattern, not memorized it:

1. **Problem** (the "why") — the pain it removes. *"Observer solves: many objects need to react when one changes, without the subject knowing them."*
2. **Structure** (the "how") — the key roles in one sentence. *"A subject keeps a list of observers and notifies them on change."*
3. **Sighting** (the proof) — a real JDK/Spring example. *"Swing listeners, \`PropertyChangeSupport\`, \`java.util.concurrent.Flow\`."*
4. **Trade-off** (the seniority) — a cost or a confusion. *"Watch the lapsed-listener leak; it's push-vs-pull; it's not pub/sub — no broker."*

\`\`\`text
Problem → Structure → Sighting → Trade-off
\`\`\`

:::senior
Leading with the **problem** (not the class diagram) and closing with a **trade-off or real sighting** is exactly what separates a senior answer from a textbook recital. Interviewers grade whether you know *when* to use it, not whether you can draw the UML.
:::`,
  },
  {
    id: 'pat-iq-pick-without-naming',
    question: 'You spot a pattern while designing on the whiteboard. Should you name-drop it, and how do you present the design?',
    difficulty: 'Hard',
    category: 'Interview Prep',
    tags: ['communication', 'design', 'seniority'],
    answer: `Lead with the **problem and the design**, mention the pattern name **once** as a label, then move on. Reversing that — opening with "I'll use the Strategy pattern!" — is a junior tell: it sounds like keyword-matching rather than reasoning about the problem.

A strong flow:

1. State the requirement and the axis of change: *"Pricing rules vary by customer tier and change often."*
2. Describe the design in plain terms: *"I'd put each rule behind a \`PricingRule\` interface and inject the right one, so adding a rule doesn't touch existing code."*
3. **Then** name it: *"That's the Strategy pattern."*
4. Add the trade-off: *"If rules are stateless one-liners, they're just lambdas — no need for classes."*

:::senior
Seniors describe the **forces and the solution**, using the pattern name as shorthand, and they'll say when a pattern is *overkill*. Reciting a pattern before understanding the problem — or forcing a Singleton/Visitor where a plain method would do — is the exact red flag interviewers probe for. Show you can also argue *against* a pattern.
:::`,
  },
  {
    id: 'pat-iq-payment-providers',
    question: 'You must support multiple payment providers (Stripe, PayPal, Adyen) behind one checkout flow. Which pattern?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['strategy', 'scenario', 'choosing'],
    answer: `**Strategy.** Each provider is an interchangeable algorithm behind one interface; checkout depends on the interface, and the concrete provider is selected at runtime (by config, order, or currency).

\`\`\`java
interface PaymentProvider { PaymentResult charge(Order o); }
class StripeProvider implements PaymentProvider { ... }
class PayPalProvider implements PaymentProvider { ... }

// checkout doesn't know or care which one
PaymentResult r = provider.charge(order);
\`\`\`

Adding **Adyen** means writing one new class — no edits to checkout (Open/Closed).

:::tip
Two natural companions: a **Factory** (or \`ServiceLoader\`/registry) to pick the provider by name, and an **Adapter** inside each provider to translate your domain types to that SDK's API. "Strategy to select, Adapter to fit" is a strong, complete answer.
:::`,
  },
  {
    id: 'pat-iq-report-formats',
    question: 'You need to export the same report as PDF, CSV, and HTML. Which pattern — and is it Strategy or Template Method?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['strategy', 'template-method', 'scenario'],
    answer: `Either fits — the choice depends on **how much of the process is shared**:

- If the whole export algorithm differs per format → **Strategy**: an \`Exporter\` interface with \`PdfExporter\`, \`CsvExporter\`, \`HtmlExporter\`, selected at runtime.
- If every export follows the **same skeleton** (gather data → format rows → write header/footer) and only a few steps differ → **Template Method**: a base \`ReportExporter\` fixes the skeleton and subclasses override \`formatRow\`/\`header\`.

\`\`\`java
// Template Method: shared skeleton, varying steps
abstract class ReportExporter {
  public final byte[] export(Report r) {   // fixed flow
    var out = begin();
    r.rows().forEach(row -> out.write(formatRow(row))); // varies
    return end(out);
  }
  protected abstract String formatRow(Row row);
}
\`\`\`

:::senior
The distinction interviewers reward: **Template Method** when the steps share a skeleton (inheritance, compile-time), **Strategy** when the whole algorithm is swappable (composition, runtime). Many real exporters use **both** — a template skeleton whose formatting step is itself an injected Strategy.
:::`,
  },
  {
    id: 'pat-iq-expensive-copy',
    question: 'Creating an object requires expensive setup (parsing, I/O), and you need many nearly-identical copies. Which pattern?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['prototype', 'scenario', 'choosing'],
    answer: `**Prototype** — build one fully-configured instance once, then **copy** it for each variant instead of re-running the expensive construction.

\`\`\`java
Document template = loadAndParse("invoice.tmpl"); // expensive, done once
Document copy = template.copy();                  // cheap; tweak per use
copy.setCustomer(customer);
\`\`\`

Typical fits: a parsed document template, a tuned game-entity archetype spawned many times, or test fixtures cloned from one valid baseline. Implement with a **copy constructor** or \`copy()\` method — not Java's broken \`Cloneable\`.

:::gotcha
Decide **shallow vs deep** copy: mutable reference fields must be deep-copied, or every "copy" shares and corrupts the original's state. Note Spring's prototype *scope* is unrelated — it means "new bean per request," constructed fresh, with no copying.
:::`,
  },
  {
    id: 'pat-iq-legacy-api',
    question: 'A third-party library\'s interface doesn\'t match what your code expects. Which pattern, and where is the boundary?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['adapter', 'scenario', 'choosing'],
    answer: `**Adapter.** Define the interface **your** code wants, then write an adapter that implements it, holds the third-party client, and translates calls (and data, and exceptions) at the boundary.

\`\`\`java
interface WeatherService { Forecast forecast(City c); }         // what you want

class AcmeWeatherAdapter implements WeatherService {            // the adapter
  private final AcmeSdk sdk;                                    // the mismatched library
  public Forecast forecast(City c) {
    var raw = sdk.getWx(c.lat(), c.lon());                      // their API
    return Forecast.from(raw);                                  // translate to yours
  }
}
\`\`\`

The adapter is the **only** class that knows both vocabularies — swapping vendors means writing one new adapter, nothing else changes.

:::senior
This is the **anti-corruption layer** of hexagonal/DDD architecture. Translate the library's **exceptions** too, not just its data — leaking \`AcmeException\` upward re-couples your whole codebase to the vendor you were trying to isolate.
:::`,
  },
  {
    id: 'pat-iq-ui-events',
    question: 'Several UI panels must update whenever a shared data model changes. Which pattern?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['observer', 'scenario', 'choosing'],
    answer: `**Observer.** The model is the **subject**; each panel is an **observer** that subscribes. When the model changes it notifies all observers, and each refreshes itself — the model never references the panels by concrete type.

\`\`\`java
model.addListener(chartPanel::refresh);   // observers subscribe
model.addListener(tablePanel::refresh);
// on change:
model.setValue(x);  // notifies all listeners
\`\`\`

This is exactly MVC's model→view update, and Swing/JavaFX property listeners. It keeps the model decoupled from the UI (one-to-many fan-out).

:::gotcha
Remember to **unsubscribe** panels when they're disposed — a subject holding strong references to dead views is the **lapsed-listener** memory leak. And decide push vs pull: send the changed value in the event, or just signal "changed" and let each panel pull what it needs.
:::`,
  },
  {
    id: 'pat-iq-order-state-machine',
    question: 'An order moves through Placed → Paid → Shipped → Delivered, with different allowed actions in each. Which pattern?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['state', 'scenario', 'choosing'],
    answer: `**State.** Model each status as a state that knows which actions are legal and what the next status is, so behaviour changes as the order moves through its lifecycle — instead of a \`switch (status)\` repeated in every method.

\`\`\`java
interface OrderState { OrderState ship(Order o); OrderState cancel(Order o); }
// PaidState allows ship(); ShippedState.cancel() throws — illegal transition
\`\`\`

For a small, fixed set of statuses, a Java **enum** with per-constant behaviour is the compact form; for complex machines, a library like Spring Statemachine centralizes the transition table.

\`\`\`mermaid
stateDiagram-v2
  [*] --> Placed
  Placed --> Paid: pay
  Paid --> Shipped: ship
  Shipped --> Delivered: deliver
  Paid --> Cancelled: cancel
\`\`\`

:::senior
State and Strategy share a UML diagram but differ in intent: here the **object itself** drives transitions (\`Paid → Shipped\`) and states know their successors — that's State, not Strategy. If instead an external client just picked one interchangeable behaviour, it'd be Strategy.
:::`,
  },
  {
    id: 'pat-iq-caching-layer',
    question: 'You want to add caching to an existing service without changing its code or its callers. Which pattern(s)?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['decorator', 'proxy', 'scenario'],
    answer: `**Decorator** (or a **Proxy** — the line blurs here). Wrap the service in a class that implements the **same interface**, checks the cache first, and delegates to the real service only on a miss:

\`\`\`java
class CachedPriceService implements PriceService {
  private final PriceService delegate;
  private final Map<Sku, Price> cache = new ConcurrentHashMap<>();
  public Price price(Sku s) {
    return cache.computeIfAbsent(s, delegate::price);  // delegate only on miss
  }
}
\`\`\`

Callers depend on \`PriceService\` and never know caching was added — you wire the wrapper in at composition time.

- **Decorator** framing: you're *adding behaviour* (caching) around calls.
- **Proxy** framing: you're *controlling access* to an expensive resource (a caching proxy).

:::senior
For the same concern across many services, don't hand-roll wrappers — use **Spring \`@Cacheable\`**, a dynamic **Proxy** doing exactly this generically. That's also why self-invocation breaks it: the proxy sits outside the bean, so an internal call skips the cache.
:::`,
  },
  {
    id: 'pat-iq-conditional-explosion',
    question: 'A method has a giant switch on a "type" field that keeps growing every time a new type is added. How do you refactor it, and which patterns apply?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['strategy', 'state', 'polymorphism', 'refactoring'],
    answer: `Replace the conditional with **polymorphism** — the classic "Replace Conditional with Polymorphism" refactoring. Which pattern depends on what the switch keys on:

- Switch on an **algorithm / behaviour choice** → **Strategy**: one class per branch behind an interface; select by lookup (\`Map<Type, Handler>\`).
- Switch on the object's **lifecycle state**, where branches also drive transitions → **State**.
- Switch **creating** different objects by type → **Factory Method / a registry**.

\`\`\`java
// Before: switch (type) { case A: ...; case B: ...; }
// After: a registry of strategies, keyed by type
Map<Type, Handler> handlers = ...;
handlers.get(type).handle(request);   // adding a type = registering one handler
\`\`\`

The win: each new type is a **new class registered once**, not another \`case\` edited into N switches scattered across the codebase (Open/Closed).

:::gotcha
Don't over-correct. A **single** small, stable switch — or a \`switch\` over a **sealed** type, which the compiler checks for exhaustiveness — is clearer than a web of strategy classes. Refactor when the same conditional is **duplicated** across methods or **grows** with every feature, not for one tidy switch.
:::`,
  },
  {
    id: 'pat-iq-factory-vs-builder',
    question: 'When would you choose a Factory over a Builder, and can they be used together?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['factory', 'builder', 'confused-pairs'],
    answer: `They answer different questions:

- **Factory** — *"which type do I create?"* One call, returns a possibly-polymorphic product based on input. Use when the concrete type is chosen at runtime.
- **Builder** — *"how do I assemble this one object?"* Multi-step, for objects with many (often optional) parameters, ending in \`build()\`. Use to avoid telescoping constructors.

| | Factory | Builder |
|--|--|--|
| Answers | Which type? | How to assemble? |
| Call shape | One shot: \`create(x)\` | Fluent chain → \`build()\` |
| Returns | Maybe different subtypes | One configured instance |

They **compose** — a factory can hand back a builder, or use one internally:

\`\`\`java
HttpRequest req = HttpRequest.newBuilder(uri)  // factory returns a builder
    .header("Accept", "application/json")
    .build();                                  // builder finishes assembly
\`\`\`

:::tip
Quick decider: **polymorphic instantiation** (pick a subtype) → Factory; **complex assembly** (many optional fields) → Builder. Saying "they're collaborators, not competitors" is the senior move.
:::`,
  },
  {
    id: 'pat-iq-plugin-system',
    question: 'You need an extensible system where third parties can add features without recompiling the core. Which patterns and Java mechanism?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['strategy', 'abstract-factory', 'serviceloader', 'scenario'],
    answer: `Define **extension-point interfaces** in the core and discover implementations at runtime — the Open/Closed Principle at app scale. The JDK mechanism is **\`ServiceLoader\` (SPI)**.

\`\`\`java
public interface ExportFormat { String name(); byte[] export(Report r); }

// core discovers plugins without knowing their classes
for (ExportFormat f : ServiceLoader.load(ExportFormat.class))
  formats.put(f.name(), f);
\`\`\`

Patterns involved:
- **Strategy** — each plugin is an interchangeable algorithm.
- **Abstract Factory** — a plugin can create a family of related objects.
- **Observer** — plugins subscribe to core lifecycle events.

The core depends **only on the interface it owns**; plugins depend on the core, never the reverse (DIP).

:::senior
\`ServiceLoader\`, Spring's component scanning, and OSGi are three discovery mechanisms for the same design. The hard part isn't discovery — it's **keeping the extension contract stable and versioned** so old plugins keep working. That contract, not the loader, is the real deliverable.
:::`,
  },
  {
    id: 'pat-iq-red-flags',
    question: 'What are the red flags of design-pattern misuse you\'d call out in a codebase?',
    difficulty: 'Hard',
    category: 'Interview Prep',
    tags: ['anti-patterns', 'code-smell', 'seniority'],
    answer: `The signals that a pattern is being **cargo-culted** rather than solving a problem:

- **Singleton everywhere** — used to smuggle in global mutable state; hidden dependencies, untestable code. The instance *count* was never the problem; the global *access point* is.
- **A Strategy/Factory with exactly one implementation** — indirection with no variation; speculative generality (YAGNI).
- **Name soup** (\`AbstractSingletonProxyFactoryBean\`-style) — layers of patterns so deep the actual logic is buried (Pattern Soup).
- **Interfaces with a single implementation, forever** — abstraction added "just in case" a second one appears.
- **Manager/Helper/Util god classes** — no pattern, just a dumping ground.
- **Deep decorator/wrapper stacks** that make stack traces and debugging miserable.

\`\`\`text
pattern present, problem absent  →  red flag
\`\`\`

:::senior
The senior instinct is to ask **"what change does this indirection buy us?"** If the answer is "none yet," it's speculative complexity. Being able to argue *against* a pattern — and to delete one that isn't earning its keep — signals more maturity than reciting all 23.
:::`,
  },
  {
    id: 'pat-iq-code-review',
    question: 'How do you evaluate a design pattern during code review — what questions do you ask?',
    difficulty: 'Hard',
    category: 'Interview Prep',
    tags: ['code-review', 'design', 'seniority'],
    answer: `Judge a pattern by whether it **earns its complexity**, not by whether it's "correct." The questions I ask:

1. **What problem does this solve?** If there's no current pain (no second implementation, no real variation), it's speculative — push back (YAGNI).
2. **Is it the simplest thing?** Would a plain method, a lambda, or an \`enum\` do what this Strategy/Visitor/Factory hierarchy does? Prefer the boring option.
3. **Does the intent match the pattern?** A "Strategy" that's really about lifecycle is a mislabelled State; a Singleton holding mutable business state is global state in disguise.
4. **What's the cost of the indirection?** Debuggability, stack-trace depth, cognitive load, more files to navigate.
5. **Is it consistent** with how the codebase already solves this?
6. **Is it testable** — did the pattern add a seam (good) or a global (bad)?

:::senior
The most valuable review comment is often **"this abstraction isn't paying for itself yet — inline it until we have a second case."** A wrong abstraction is costlier than a little duplication: duplication is a cheap extract-method later; a wrong abstraction is baked into every call site. Reviewing *for deletion* is a senior skill.
:::`,
  },
  {
    id: 'pat-iq-senior-vs-junior',
    question: 'What do senior engineers understand about design patterns that juniors typically miss?',
    difficulty: 'Hard',
    category: 'Interview Prep',
    tags: ['seniority', 'philosophy', 'trade-offs'],
    answer: `The gap is **judgment**, not vocabulary:

- **Patterns have costs.** Every one adds indirection — more files, deeper stack traces, higher cognitive load. Juniors count patterns as pure wins; seniors weigh the tax.
- **Patterns emerge from refactoring**; they aren't designed in up front. You *refactor to* a pattern when duplication/variation appears (Fowler), rather than predicting where flexibility is needed.
- **YAGNI beats speculative flexibility.** A Strategy with one strategy, or an interface with one impl, is a liability, not foresight.
- **Intent over structure.** Seniors reason about the *problem* (what varies, what's coupled) and use the pattern name as shorthand; juniors match structure to a catalog.
- **Knowing when NOT to** use one — arguing against a Singleton, deleting a needless factory — is the real signal.
- **The language may already have it.** Lambdas *are* Strategy/Command; \`enum\` *is* a safe Singleton; \`sealed\`+\`switch\` replaces Visitor.

:::senior
The one-liner that lands: *"Patterns are a shared vocabulary for trade-offs I've already made — not a checklist to maximize."* Name the cost of every pattern you propose, and reach for the simplest thing that works first.
:::`,
  },
  {
    id: 'pat-iq-overused-patterns',
    question: 'Which design patterns are most commonly overused or misused, and why?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['anti-patterns', 'singleton', 'seniority'],
    answer: `Three repeat offenders:

- **Singleton** — the most abused. Reached for as a convenient global, it smuggles in **global mutable state**, hides dependencies, and wrecks testability. Usually a DI-managed singleton bean is what people actually want.
- **Factory/Strategy with one implementation** — indirection added "for flexibility" that never arrives. Speculative generality that just makes code harder to follow (YAGNI).
- **Visitor** — powerful but heavy; often applied to hierarchies that **change often** (its worst fit), or where a simple \`instanceof\` / \`sealed\` switch would be clearer.

Honorable mentions: **Decorator** stacked so deep that debugging suffers, and **Observer** leaking listeners.

:::senior
The through-line: patterns get misused when applied for their own sake instead of to a **present, concrete problem**. The mature move is matching the pattern to a real force that varies — and being willing to remove one that isn't earning its complexity. "Pattern present, problem absent" is the smell.
:::`,
  },
  {
    id: 'pat-iq-gof-still-relevant',
    question: 'Are the GoF design patterns still relevant given modern frameworks and functional programming?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['gof', 'modern-java', 'philosophy'],
    answer: `Yes — but *how* you use them shifted. Three things changed:

1. **Frameworks absorbed many patterns.** You rarely hand-code a Singleton, Proxy, or Abstract Factory now — Spring's container *is* those (singleton beans, AOP proxies, \`@Profile\` factories). You **recognize** them more than you **write** them.
2. **Lambdas lightened the single-method ones.** Strategy, Command, Template Method, and Observer collapse to lambdas/callbacks/reactive streams — the design survives, the boilerplate doesn't.
3. **The language grew alternatives.** \`enum\` for Singleton, \`record\` for immutable value objects, \`sealed\` + pattern-matching \`switch\` for Visitor.

What stays permanently relevant is the **shared vocabulary**: saying "that's a circuit-breaker proxy" or "extract a strategy here" communicates a design in three words across any team.

:::senior
The senior take: GoF is less a **construction manual** and more a **shared language for trade-offs**. You'll implement fewer patterns by hand than in 1994, but you'll *name, recognize, and reason with* them constantly — including knowing which ones your framework or language now gives you for free.
:::`,
  },
  {
    id: 'pat-iq-di-testability',
    question: 'A class creates its own dependencies with new, and it\'s hard to unit test. How do you fix it, and which pattern?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['dependency injection', 'testing', 'scenario'],
    answer: `**Dependency Injection.** The class \`new\`s a concrete collaborator (a real DB client, an HTTP call), so a unit test can't substitute a fake. Fix it by **depending on an interface and injecting** the collaborator via the constructor:

\`\`\`java
// Before: untestable — hard-wired dependency
class OrderService {
  private final EmailClient email = new SmtpEmailClient(); // real SMTP in every test!
}

// After: inject an abstraction
class OrderService {
  private final EmailSender email;
  OrderService(EmailSender email) { this.email = email; } // pass a mock in tests
}
\`\`\`

Now the test constructs \`new OrderService(mockSender)\` — no network, fast and deterministic.

:::senior
Two moves together: **program to an interface** (so a fake can implement it) and **inject** it (so the test controls what's passed). Prefer **constructor** injection — the dependency is explicit and \`final\`, and you can instantiate the class in a plain test without any container. The smell to name is "\`new\` is glue": hard-coding collaborators welds classes together.
:::`,
  },
  {
    id: 'pat-iq-combine-patterns',
    question: 'Design patterns are often combined. Give examples of patterns that work together.',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['combining', 'composition', 'seniority'],
    answer: `Patterns are building blocks, not mutually exclusive choices. Common combinations:

- **Abstract Factory built from Factory Methods** — each \`createX()\` on the factory is itself a factory method.
- **Composite + Iterator + Visitor** — a tree (Composite) you traverse (Iterator) and run operations over (Visitor). The classic compiler/AST trio.
- **Decorator + Factory** — a factory assembles the correct decorator stack so call sites don't hand-wire the order.
- **Strategy + Factory** — a factory selects which strategy to inject (payment provider by name).
- **Command + Composite** — a macro command *is* a composite of commands; add Memento for undo checkpoints.
- **Observer + Mediator** — the mediator uses observer internally to receive colleague events.
- **Proxy + State** — a circuit breaker is a proxy whose behaviour depends on breaker state.

\`\`\`java
PaymentProvider p = providerFactory.forOrder(order); // Factory picks the Strategy
\`\`\`

:::senior
Real designs **layer** patterns; the GoF book explicitly notes which ones collaborate. Naming a combination ("a Strategy selected by a Factory, wrapped in a caching Decorator") signals you think in compositions, not isolated recipes.
:::`,
  },
  {
    id: 'pat-iq-identify-from-code',
    question: 'How do you quickly identify which design pattern a piece of code implements?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['recognition', 'reading-code', 'cheatsheet'],
    answer: `Look for the **structural tell**, then confirm with **intent**:

| You see… | Likely pattern |
|--|--|
| A class implementing an interface **and holding a field of that same interface** | Decorator / Proxy / Adapter |
| A class holding a **collection of its own interface type** | Composite |
| Private constructor + static \`getInstance()\` | Singleton |
| Fluent \`.setX().setY().build()\` | Builder |
| \`create()\`/\`valueOf()\`/\`of()\` returning an interface | Factory / static factory |
| \`accept(visitor)\` + \`visitX(this)\` | Visitor (double dispatch) |
| A list of handlers each calling \`next\` | Chain of Responsibility |
| \`subscribe\`/\`addListener\` + \`notify\` | Observer |
| \`execute()\` + \`undo()\` objects on a stack | Command |

\`\`\`java
class X implements Foo { private final Foo delegate; } // wrapper family — narrow by intent
\`\`\`

:::tip
The wrapper family (Adapter/Decorator/Proxy/Facade) all *look* identical — a same-interface field plus delegation. Resolve them by **intent**: interface changed → Adapter; behaviour added → Decorator; access controlled → Proxy; subsystem simplified → Facade.
:::`,
  },
  {
    id: 'pat-iq-bridge-vs-strategy',
    question: 'Bridge and Strategy both use composition to delegate. How do you tell them apart?',
    difficulty: 'Hard',
    category: 'Interview Prep',
    tags: ['bridge', 'strategy', 'confused-pairs'],
    answer: `Both hold an interface and delegate, so they look alike. The difference is **scope and intent**:

- **Strategy** varies **one behaviour/algorithm** of a context (how to sort, how to price). It's *behavioral* — the injected object is an algorithm the client swaps.
- **Bridge** separates a whole **abstraction hierarchy** from a whole **implementation hierarchy** so both can grow independently. It's *structural* — a deliberate two-axis design to avoid a class explosion.

| | Strategy | Bridge |
|--|--|--|
| Family | Behavioral | Structural |
| Varies | One algorithm | An entire implementation dimension |
| Intent | Swap behaviour at runtime | Let abstraction & implementation evolve separately |
| Both sides | Context + strategies | Two parallel hierarchies (Shape × Renderer) |

\`\`\`java
// Strategy: one pluggable algorithm
sorter.setComparator(byPrice);
// Bridge: two hierarchies joined by composition
abstract class Shape { protected final Renderer renderer; } // Shape × Renderer both vary
\`\`\`

:::senior
The tell: Strategy is usually **one interface, swapped at runtime** for a single decision; Bridge is a **planned split of two dimensions**, designed up front, each with its own class hierarchy. Strategy answers "which algorithm?"; Bridge answers "how do I stop M×N subclasses?"
:::`,
  },
];

export default questions;
