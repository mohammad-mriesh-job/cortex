import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'pat-beh-strategy-intent',
    question: 'What problem does the Strategy pattern solve, and how does it improve on if/else chains?',
    difficulty: 'Easy',
    category: 'Behavioral',
    tags: ['strategy', 'composition', 'open-closed'],
    answer: `**Strategy** defines a family of interchangeable algorithms, puts each behind a common interface, and lets the client select one at runtime through **composition**.

Instead of a growing conditional:

\`\`\`java
if (type.equals("card"))   { /* ... */ }
else if (type.equals("paypal")) { /* ... */ }
\`\`\`

each algorithm becomes its own class implementing \`PayStrategy\`. Adding a new algorithm means adding a class, not editing the existing method — this honours the **Open/Closed Principle** and makes each algorithm independently testable. When the interface has a single method it is functional, so a **lambda** can be the strategy.

:::key
JDK example: \`Comparator\` passed to \`List.sort\` — a pluggable ordering algorithm.
:::`,
  },
  {
    id: 'pat-beh-strategy-vs-state',
    question: 'Strategy and State have the same class diagram. How do you tell them apart?',
    difficulty: 'Hard',
    category: 'Behavioral',
    tags: ['strategy', 'state', 'intent'],
    answer: `The structure is identical — both delegate to an interface via composition — so the difference is **intent**:

| | Strategy | State |
|--|--|--|
| Purpose | Client chooses an **algorithm** | Behaviour changes as internal **state** evolves |
| Who switches | An external client sets it | The states switch the context themselves |
| Awareness | Strategies are independent, unaware of each other | Each state knows its successor states and drives transitions |
| Lifetime | Usually set once per use | Changes repeatedly over the object's life |

**The tell:** in State, the objects transition to one another (\`context.setState(next)\`) and know their siblings; in Strategy, the client picks the algorithm and strategies never reference each other. Strategy is a pluggable algorithm slot; State is a polymorphic finite state machine.`,
  },
  {
    id: 'pat-beh-observer-basics',
    question: 'Explain the Observer pattern and the roles involved.',
    difficulty: 'Easy',
    category: 'Behavioral',
    tags: ['observer', 'events', 'decoupling'],
    answer: `**Observer** defines a one-to-many dependency: a **subject** maintains a list of **observers** and notifies each automatically whenever its state changes.

Roles:
- **Subject** — holds the observer list, exposes \`subscribe\`/\`unsubscribe\`, and fans out \`notify\` on change.
- **Observer** — an interface with an \`update\`/\`onEvent\` callback.
- **Concrete observers** — react to the notification.

The subject knows only the observer *interface*, never the concrete listeners, so publishers and subscribers stay decoupled.

:::note
JDK: Swing/AWT event listeners and \`java.beans.PropertyChangeListener\` / \`PropertyChangeSupport\`. The old \`java.util.Observable\`/\`Observer\` were **deprecated in Java 9**.
:::`,
  },
  {
    id: 'pat-beh-observer-vs-pubsub',
    question: 'What is the difference between classic Observer and Publish/Subscribe?',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['observer', 'pub-sub', 'messaging'],
    answer: `Both deliver events to interested parties, but pub/sub adds a **broker**:

| Aspect | Observer | Publish/Subscribe |
|--|--|--|
| Coupling | Subject holds direct references to observers | Publisher and subscriber know only a broker/topic |
| Delivery | Subject calls observers directly, usually synchronously | Broker routes messages, often asynchronously |
| Awareness | Subject knows its observers | Publisher is unaware of subscribers |
| Scope | Typically in-process | Often cross-process / distributed (message queues) |

In short: Observer is direct, in-memory notification; pub/sub introduces an intermediary that fully decouples producers from consumers, enabling async and distributed delivery.`,
  },
  {
    id: 'pat-beh-lapsed-listener',
    question: 'What is the lapsed-listener problem in Observer, and how do you prevent it?',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['observer', 'memory-leak', 'gotcha'],
    answer: `The **lapsed-listener** leak occurs when an observer registers with a subject but never unsubscribes. Because the subject's list holds a **strong reference** to the observer, that observer (and everything it reaches) cannot be garbage-collected for as long as the subject lives — a common source of memory leaks in long-lived UIs and event buses.

Fixes:
- Always provide and call a clear \`unsubscribe\`/\`removeListener\` (e.g. in \`dispose()\` / \`onDestroy()\`).
- Hold observers via \`WeakReference\` where appropriate so they can be collected.
- Prefer a lifecycle-aware event system that unregisters automatically.`,
  },
  {
    id: 'pat-beh-template-hollywood',
    question: 'What is the Template Method pattern, and what is the "Hollywood Principle"?',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['template-method', 'inheritance', 'hooks'],
    answer: `**Template Method** defines the invariant **skeleton** of an algorithm in a base-class method and defers varying steps to subclasses. The template method is typically \`final\`; it calls abstract steps (required) and **hook methods** (steps with a default body that subclasses may optionally override).

The **Hollywood Principle** — "don't call us, we'll call you" — captures the control flow: the subclass never invokes the skeleton; the base class calls *down* into the subclass's overridden steps.

\`\`\`java
public final void importData(String f) {
  open(f);
  var rows = parse();        // abstract — subclass supplies
  if (shouldValidate())      // hook — optional override
    validate(rows);
  save(rows);                // abstract
  close();
}
\`\`\`

:::key
JDK: \`AbstractList\` (override \`get\`/\`size\`, inherit the rest), \`HttpServlet.service()\` dispatching to \`doGet\`/\`doPost\`.
:::`,
  },
  {
    id: 'pat-beh-template-vs-strategy',
    question: 'Compare Template Method with Strategy.',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['template-method', 'strategy', 'inheritance-vs-composition'],
    answer: `Both let you vary behaviour, but through opposite mechanisms:

| Aspect | Template Method | Strategy |
|--|--|--|
| Mechanism | **Inheritance** — subclass overrides steps | **Composition** — inject an algorithm object |
| Granularity | Varies a few *steps* of a fixed algorithm | Varies the *whole* algorithm |
| Binding | Compile-time (subclass is chosen) | Runtime (strategy can be swapped) |
| Structure | One class hierarchy | Context + separate strategy objects |

Rule of thumb: use Template Method when the overall algorithm is fixed but a few steps differ; use Strategy when the entire algorithm should be selectable and swappable at runtime.`,
  },
  {
    id: 'pat-beh-command-undo',
    question: 'How does the Command pattern enable undo/redo and task queuing?',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['command', 'undo', 'queue'],
    answer: `**Command** encapsulates a request as an object that binds a **receiver** to an action, decoupling the **invoker** that triggers it from the receiver that performs it. Because a command is a first-class object:

- **Undo/redo** — give each command an \`undo()\` that reverses \`execute()\`, and keep a history \`Deque\`. Undo pops and reverses; redo replays.
- **Queuing/scheduling** — put commands on a queue and run them later on a worker thread.
- **Logging/replay** — serialize executed commands and re-run them to rebuild state.
- **Macros** — a composite command runs a list of commands.

\`\`\`java
interface Command { void execute(); void undo(); }

class RemoteControl {
  private final Deque<Command> history = new ArrayDeque<>();
  void press(Command c) { c.execute(); history.push(c); }
  void undoLast() { if (!history.isEmpty()) history.pop().undo(); }
}
\`\`\`

:::key
JDK: \`Runnable\` (run() = execute(); \`ExecutorService\` is the invoker) and Swing \`Action\`.
:::`,
  },
  {
    id: 'pat-beh-iterator-failfast',
    question: 'What does the Iterator pattern provide, and what does "fail-fast" mean in the JDK?',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['iterator', 'iterable', 'fail-fast'],
    answer: `**Iterator** gives sequential access to an aggregate's elements without exposing its internal representation. The aggregate implements \`Iterable\` (factory method \`iterator()\`); the iterator holds the cursor and answers \`hasNext()\`/\`next()\`. This is what powers the enhanced \`for\` loop.

**Fail-fast:** JDK collection iterators track a \`modCount\`. If the collection is structurally modified during iteration by anything other than the iterator's own \`remove()\`, the next \`next()\` throws \`ConcurrentModificationException\`.

\`\`\`java
for (String s : list) {
  if (s.equals("b")) list.remove(s);   // CME!
}
// safe: it.remove() through the iterator instead
\`\`\`

:::gotcha
Fail-fast is a **best-effort bug detector, not a guarantee** — never depend on the exception. For concurrent traversal use \`CopyOnWriteArrayList\`/\`ConcurrentHashMap\`, whose iterators are **weakly consistent** and don't throw.
:::`,
  },
  {
    id: 'pat-beh-command-vs-strategy',
    question: 'Command and Strategy both wrap behaviour in an object. How do their intents differ?',
    difficulty: 'Hard',
    category: 'Behavioral',
    tags: ['command', 'strategy', 'intent'],
    answer: `Both encapsulate behaviour, but for different reasons:

- **Strategy** encapsulates *how* to do something — an interchangeable **algorithm** the client plugs into a context to influence its computation (e.g. which sort order). The focus is selecting one of several ways to perform a task.
- **Command** encapsulates *a request to do something* — a complete action (receiver + parameters) that can be stored, queued, logged, and **undone**. The focus is decoupling the invoker from the receiver and treating the invocation itself as data.

Put differently: a Strategy is usually invoked immediately to compute a result and returns a value; a Command is often stored for later execution, supports \`undo\`, and is about *when/whether* an action runs, not just *how*.`,
  },
  {
    id: 'pat-beh-observer-push-vs-pull',
    question: 'In the Observer pattern, what is the difference between the push and pull models?',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['observer', 'push-pull', 'design'],
    answer: `It is about **how much data the notification carries**.

- **Push** — the subject sends the changed data *with* the notification: \`update(newTemp, newHumidity)\`. Observers get everything up front, but the subject must guess what every observer needs, and the signature is rigid.
- **Pull** — the subject sends only "something changed" (often just \`this\`), and each observer **pulls** exactly the state it cares about: \`update(subject)\` then \`subject.getTemp()\`.

| | Push | Pull |
|--|--|--|
| Coupling | Subject knows observer needs | Observer knows subject's API |
| Payload | Full / eager | Minimal; observer queries |
| Fit | Few observers, uniform needs | Many observers, varied needs |

Java's \`PropertyChangeListener\` is a **hybrid**: the \`PropertyChangeEvent\` carries old/new values (push), yet exposes \`getSource()\` so a listener can pull more.

:::senior
Pull scales better when observers need different slices of state, but risks a **stale read** if the subject mutates again before the observer pulls. Push avoids that by snapshotting the value into an immutable event.
:::`,
  },
  {
    id: 'pat-beh-observer-flow-api',
    question: 'How does java.util.concurrent.Flow (Reactive Streams) relate to the Observer pattern, and what does it add?',
    difficulty: 'Hard',
    category: 'Behavioral',
    tags: ['observer', 'flow-api', 'reactive', 'backpressure'],
    answer: `\`Flow\` (JDK 9, the Reactive Streams SPI) is **Observer with three things classic Observer lacks**: completion/error signals, async delivery, and **backpressure**.

The four interfaces map onto Observer roles:

| Flow | Observer role |
|--|--|
| \`Publisher\` | Subject |
| \`Subscriber\` | Observer |
| \`Subscription\` | The link + flow control |

A subscriber gets \`onSubscribe\`, then \`onNext*\`, then **exactly one** of \`onComplete\`/\`onError\`. Classic Observer only has the \`onNext\` equivalent — no way to signal "the stream ended" or "it failed."

The real addition is **backpressure**: the subscriber calls \`subscription.request(n)\` to say how many items it can handle, so a fast publisher can't overwhelm a slow observer.

\`\`\`java
subscriber.onSubscribe(sub); // subscriber then calls sub.request(1)
\`\`\`

:::senior
Plain Observer has **no flow control** — a firehose subject floods or drops events on slow observers. That single gap is why reactive libraries (Reactor, RxJava) exist. \`java.util.concurrent.Flow\` is only the SPI; \`SubmissionPublisher\` is the one concrete JDK implementation.
:::`,
  },
  {
    id: 'pat-beh-observer-concurrency',
    question: 'What concurrency hazards appear when notifying observers, and how do you notify safely?',
    difficulty: 'Hard',
    category: 'Behavioral',
    tags: ['observer', 'concurrency', 'thread-safety'],
    answer: `Three classic hazards when a subject fans out notifications:

1. **Concurrent modification** — an observer's \`update()\` calls \`unsubscribe()\` (or subscribes a new one) *while you iterate* the listener list → \`ConcurrentModificationException\`.
2. **Deadlock / re-entrancy** — you hold the subject's lock during callbacks; an observer calls back into the subject and re-acquires the lock, or two subjects notify each other under crossed locks.
3. **Stale/torn state** — observers on other threads see partially-updated subject state.

The standard fixes:

\`\`\`java
// snapshot under lock, notify OUTSIDE the lock
List<Listener> snapshot;
synchronized (this) { snapshot = new ArrayList<>(listeners); }
for (Listener l : snapshot) l.onEvent(event); // no lock held here
\`\`\`

Or store listeners in a \`CopyOnWriteArrayList\` — its iterator is snapshot-based, so registration during notification never throws.

:::gotcha
**Never invoke observer callbacks while holding your lock** — it is the #1 cause of listener deadlocks. Copy the list, release the lock, then notify. Also decide re-entrancy semantics: does an observer added *during* a notification receive the current event?
:::`,
  },
  {
    id: 'pat-beh-state-intent',
    question: 'What is the State pattern, and how does it improve on a status field with a big switch?',
    difficulty: 'Easy',
    category: 'Behavioral',
    tags: ['state', 'state-machine', 'polymorphism'],
    answer: `**State** lets an object **alter its behaviour when its internal state changes** — it looks like the object changed class. Each state becomes its own class implementing a common interface; the context delegates to the current state object.

It replaces sprawling conditionals:

\`\`\`java
// Before: every method repeats this switch
switch (status) {
  case DRAFT:     /* ... */ break;
  case PUBLISHED: /* ... */ break;
  case ARCHIVED:  /* ... */ break;
}
\`\`\`

With State, \`publish()\`, \`edit()\`, and \`archive()\` each live on the relevant state class; an illegal action (editing an archived post) is handled by that state alone. Adding a new state is a new class, not an edit to N switch statements — the **Open/Closed** win.

:::key
Use State when an object's behaviour depends on its mode **and** transitions between modes are a core part of the logic (order lifecycle, TCP connection, document workflow).
:::`,
  },
  {
    id: 'pat-beh-state-enum',
    question: 'How do you model a state machine with a Java enum, and when is that better than one class per state?',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['state', 'enum', 'state-machine'],
    answer: `A Java \`enum\` can give each **constant its own behaviour** by overriding abstract methods — a compact, closed state machine:

\`\`\`java
enum TrafficLight {
  RED    { TrafficLight next() { return GREEN;  } },
  GREEN  { TrafficLight next() { return YELLOW; } },
  YELLOW { TrafficLight next() { return RED;    } };
  abstract TrafficLight next();
}
\`\`\`

Each constant is a singleton, so there is **zero per-state allocation**, transitions are exhaustively checked by the compiler, and \`EnumMap\`/\`switch\` over states is fast.

| | Enum states | Class-per-state |
|--|--|--|
| State set | **Fixed**, known at compile time | Open — add classes freely |
| Per-state data | Awkward (constants are shared singletons) | Natural (instance fields) |
| Dependencies | Hard to inject into a constant | Easy via constructor |

:::senior
Reach for **enum states** when the states are a small, fixed set with little per-instance data (lights, workflow steps). Reach for **class-per-state** when states carry mutable data or need injected collaborators. Spring Statemachine and libraries like Squirrel exist for genuinely complex machines.
:::`,
  },
  {
    id: 'pat-beh-state-transitions',
    question: 'In the State pattern, who should decide the next state — the context or the state objects? What are the trade-offs?',
    difficulty: 'Hard',
    category: 'Behavioral',
    tags: ['state', 'transitions', 'design'],
    answer: `Two placements, and the choice shapes coupling:

**States own transitions** — each state sets the next one:
\`\`\`java
class DraftState implements PostState {
  public void publish(Post ctx) { ctx.setState(new PublishedState()); }
}
\`\`\`
- Pro: adding a state is local; the transition sits next to the behaviour that triggers it.
- Con: each state **knows its successors**, coupling states to one another (harder to reuse a state; the transition map is scattered).

**Context owns transitions** — a central table (\`EnumMap<State, EnumMap<Event, State>>\`) drives moves; states are pure behaviour.
- Pro: the whole machine is visible in one place — easy to diagram, validate, and audit.
- Con: adding a state means editing the central table (less Open/Closed).

\`\`\`mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Published: publish
  Draft --> Archived: archive
  Published --> Archived: archive
\`\`\`

:::senior
Rule of thumb: **scatter transitions into the states** for small machines where locality helps; **centralize the transition table** once the machine is large, needs validation, or must be visualized/persisted. GoF's original puts transitions in the states; production frameworks (Spring Statemachine) centralize them for exactly that reason.
:::`,
  },
  {
    id: 'pat-beh-strategy-jdk-sightings',
    question: 'Where does the JDK use the Strategy pattern besides Comparator?',
    difficulty: 'Easy',
    category: 'Behavioral',
    tags: ['strategy', 'jdk', 'sightings'],
    answer: `Strategy is everywhere a method takes a **behaviour object** you choose:

- **\`Comparator\`** passed to \`List.sort\`/\`TreeMap\` — a pluggable ordering algorithm.
- **\`ThreadFactory\`** in \`ExecutorService\` — how threads get created.
- **\`RejectedExecutionHandler\`** on \`ThreadPoolExecutor\` — what to do when the queue is full (\`AbortPolicy\`, \`CallerRunsPolicy\`…).
- **\`Predicate\`/\`Function\`/\`Collector\`** in the Streams API — the filtering/mapping/reducing algorithm is injected.
- **\`SSLContext\`**, \`Charset\` encoders, and Swing layout managers.

\`\`\`java
new ThreadPoolExecutor(..., new ThreadPoolExecutor.CallerRunsPolicy()); // swap the strategy
\`\`\`

:::tip
Any JDK type ending in \`-Policy\`, \`-Handler\`, or \`-Factory\` — or a \`Comparator\`/\`Predicate\`/\`Function\` parameter — is almost always a Strategy hook. Since most are single-method interfaces, you supply the strategy as a **lambda**.
:::`,
  },
  {
    id: 'pat-beh-strategy-vs-polymorphism',
    question: 'Isn\'t Strategy just polymorphism? What does the pattern add?',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['strategy', 'polymorphism', 'composition'],
    answer: `Strategy *uses* polymorphism, but they are not the same thing. Polymorphism is the **language mechanism** (dispatch a call to an overridden method); Strategy is a **design decision** to model a varying algorithm as a *separate, injected object* the context holds by composition.

The distinction that matters in interviews:

- **Plain subtype polymorphism** puts the varying behaviour **inside** the type hierarchy — a \`Circle\` overrides \`area()\`. The behaviour is bound to *what the object is*.
- **Strategy** pulls the behaviour **out** into an interchangeable collaborator — a \`ShippingCalculator\` holds a \`RateStrategy\` it can **swap at runtime**, independent of the calculator's own type.

\`\`\`java
calc.setStrategy(new ExpressRate()); // change behaviour without changing the object's class
\`\`\`

So Strategy adds **runtime swappability**, behaviour reuse across unrelated contexts, and independent testing of each algorithm — none of which you get from baking the behaviour into the class hierarchy.

:::senior
The tell: if you would have to **create a whole new subclass just to vary one operation**, that operation wants to be a Strategy. Prefer "has-a algorithm" over "is-a subtype" when the algorithm varies independently of identity.
:::`,
  },
  {
    id: 'pat-beh-strategy-lambda',
    question: 'Have Java lambdas made the Strategy pattern obsolete?',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['strategy', 'lambda', 'functional'],
    answer: `No — lambdas **change how you write** Strategy, not whether you use it. A Strategy with a single-method interface *is* a functional interface, so the concrete strategy classes collapse into lambdas:

\`\`\`java
// Classic: a class per strategy
list.sort(new ByLastName());
// Lambda: the strategy is inline
list.sort(Comparator.comparing(User::lastName));
\`\`\`

The **pattern is still there** — a context parameterized by an injected algorithm. What disappears is the ceremony (a named class, a file, boilerplate) when the strategy is small and stateless.

Keep a **named class or named lambda** when the strategy:
- has **state or dependencies** (needs a constructor),
- is **reused** in many places (a shared \`Comparator\` constant),
- is **complex** enough that a name aids readability,
- needs to be **tested or mocked** in isolation.

:::senior
The senior framing: lambdas killed the *boilerplate*, not the *design*. "Parameterize with behaviour" is now so cheap it is idiomatic Java (\`Stream\`, \`Optional.map\`, callbacks) rather than a ceremony you consciously invoke.
:::`,
  },
  {
    id: 'pat-beh-template-jdbctemplate',
    question: 'How is Spring\'s JdbcTemplate an example of the Template Method pattern?',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['template-method', 'spring', 'jdbctemplate', 'callback'],
    answer: `\`JdbcTemplate\` owns the **invariant, error-prone skeleton** of every JDBC call — acquire a \`Connection\`, create a \`Statement\`, execute, **iterate the \`ResultSet\`**, and (critically) close everything in the right order even on exception. You supply only the **varying step**: how to map one row.

\`\`\`java
List<User> users = jdbc.query(
    "SELECT id, name FROM users",
    (rs, rowNum) -> new User(rs.getLong("id"), rs.getString("name"))); // the varying step
\`\`\`

Classic Template Method varies steps via **subclass overrides**; Spring uses the **callback** variant — you pass a \`RowMapper\`/\`PreparedStatementSetter\` object (usually a lambda) instead of subclassing. Same intent: the framework calls *down* into your step (Hollywood Principle), and you never write the boilerplate or the \`finally\` blocks that leak connections.

:::senior
This is the Template Method → callback evolution: instead of \`extends JdbcDaoSupport\` and overriding, you inject behaviour. It is Template Method's skeleton with Strategy's composition — which is why modern frameworks favour it over inheritance-based templates.
:::`,
  },
  {
    id: 'pat-beh-template-final',
    question: 'Why is the template method itself usually declared final, and which steps should be abstract vs hooks?',
    difficulty: 'Hard',
    category: 'Behavioral',
    tags: ['template-method', 'final', 'hooks', 'design'],
    answer: `The template method is \`final\` to **protect the algorithm's skeleton**: subclasses may fill in steps but must not reorder, skip, or replace the overall flow. If a subclass could override the template itself, it could break the invariants the base class guarantees (e.g. "always \`close()\` after \`open()\`"), defeating the pattern.

The step vocabulary:

| Kind | Example | Meaning |
|--|--|--|
| **Abstract step** | \`abstract void parse();\` | Subclass **must** supply it — a required variation point |
| **Hook** | \`boolean shouldCache() { return false; }\` | Optional override with a default; the base decides whether to call it |
| **Concrete step** | \`private void open()\` | Invariant; often \`private\` so it can't be touched |

\`\`\`java
public final void run() {   // final: skeleton is locked
  open();                    // concrete / private
  var data = parse();        // abstract: required
  if (shouldValidate())      // hook: optional
    validate(data);
  close();
}
\`\`\`

:::gotcha
Make invariant steps \`private\` (or \`final\`) so subclasses can't accidentally override them, and keep abstract/hook methods \`protected\`, not \`public\` — they are extension points for subclasses, not API for clients. Exposing them invites callers to invoke steps out of order.
:::`,
  },
  {
    id: 'pat-beh-iterator-internal-vs-external',
    question: 'What is the difference between internal and external iteration, and why did Java 8 add internal iteration?',
    difficulty: 'Hard',
    category: 'Behavioral',
    tags: ['iterator', 'internal-iteration', 'streams'],
    answer: `They differ in **who controls the loop**.

- **External** (classic \`Iterator\`) — *the client* drives: you call \`hasNext()\`/\`next()\` and write the loop. You control pacing, can stop early, and can interleave multiple iterators.
- **Internal** (\`Stream.forEach\`, \`Iterable.forEach\`) — *the collection* drives: you hand in a lambda and the library runs the loop.

\`\`\`java
for (String s : list) { ... }          // external: you own the loop
list.forEach(s -> { ... });             // internal: the library owns it
list.stream().filter(...).forEach(...); // internal: fused traversal
\`\`\`

Why Java 8 added internal iteration:

1. **Optimization freedom** — the library can reorder, fuse operations, iterate lazily, or go **parallel** (\`parallelStream()\`) without the client changing code.
2. **Declarative code** — you say *what* (filter, map, reduce), not *how to loop*.
3. **Encapsulation** — the structure's traversal stays hidden (a \`ConcurrentHashMap\` can iterate more efficiently than an external cursor allows).

| | External | Internal |
|--|--|--|
| Control | Client | Library |
| Early exit | Easy (\`break\`) | Needs \`findFirst\`/short-circuit ops |
| Parallelism | Manual | Free (\`parallelStream\`) |

:::senior
Internal iteration is the enabler for parallel streams: because you don't own the loop, the library is free to split the workload. That freedom is exactly what an external \`Iterator\` cannot offer.
:::`,
  },
  {
    id: 'pat-beh-iterator-implement',
    question: 'How do you make a custom class work with the enhanced for-loop, and what is the Iterable/Iterator contract?',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['iterator', 'iterable', 'contract'],
    answer: `Implement \`Iterable<T>\`; its single method \`iterator()\` is a **factory method** returning a fresh \`Iterator<T>\`. The enhanced \`for\` loop desugars to calls on that iterator.

\`\`\`java
class Range implements Iterable<Integer> {
  private final int from, to;
  Range(int from, int to) { this.from = from; this.to = to; }
  public Iterator<Integer> iterator() {
    return new Iterator<>() {
      private int cur = from;
      public boolean hasNext() { return cur < to; }
      public Integer next() {
        if (!hasNext()) throw new NoSuchElementException();
        return cur++;
      }
    };
  }
}
for (int i : new Range(0, 3)) { }  // 0, 1, 2
\`\`\`

Contract rules that trip people up:

- \`next()\` **must throw \`NoSuchElementException\`** past the end, not return garbage.
- Return a **new iterator each call** so two loops over the same object are independent.
- \`remove()\` is a \`default\` throwing \`UnsupportedOperationException\`; implement it only if mutation makes sense.

:::gotcha
Making the object itself the iterator (\`hasNext\`/\`next\` on \`Range\`) means it can be traversed only **once** and never nested — always return a separate iterator instance.
:::`,
  },
];

export default questions;
