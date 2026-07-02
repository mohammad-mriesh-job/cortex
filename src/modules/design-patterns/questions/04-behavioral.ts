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
];

export default questions;
