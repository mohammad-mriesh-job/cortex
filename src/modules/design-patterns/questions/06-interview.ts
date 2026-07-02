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
];

export default questions;
