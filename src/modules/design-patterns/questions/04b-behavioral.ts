import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'pat-beh2-cor-intent',
    question: 'What problem does the Chain of Responsibility pattern solve, and how?',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['chain-of-responsibility', 'decoupling'],
    answer: `It **decouples the sender of a request from its receiver** by giving more than one object a chance to handle it.

Handlers are linked into a chain; each one either processes the request or forwards it to the next link. The sender just drops the request on the head of the chain and never knows which handler acts.

\`\`\`java
abstract class Handler {
  protected Handler next;
  Handler linkWith(Handler n) { this.next = n; return n; }
  public void handle(Request r) {
    if (canHandle(r)) process(r);
    else if (next != null) next.handle(r);
  }
}
\`\`\`

**Two flavours:** *pure* (first match wins, then stop) and *broadcast* (every handler runs).

:::tip
Canonical JDK example: the **\`javax.servlet.Filter\`** chain — each filter calls \`chain.doFilter(...)\` to pass control on.
:::`,
  },
  {
    id: 'pat-beh2-cor-unhandled',
    question: 'In Chain of Responsibility, what happens if no handler processes the request, and how do you handle it?',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['chain-of-responsibility', 'edge-cases'],
    answer: `Nothing forces a handler to act, so a request can **fall off the end of the chain unhandled**. That is not automatically an error — it is a design decision you must make explicit.

Two common approaches:

- **Terminal / catch-all handler** — put a default handler at the tail that always handles (logs, throws, or returns a sensible default).
- **Document "unhandled" as valid** — some chains legitimately do nothing when nobody is interested (e.g. optional event bubbling).

:::gotcha
Silently dropping requests is a frequent bug. Decide deliberately whether unhandled means "ignore," "default," or "error."
:::`,
  },
  {
    id: 'pat-beh2-mediator-vs-observer',
    question: 'How does the Mediator pattern differ from the Observer pattern?',
    difficulty: 'Hard',
    category: 'Behavioral',
    tags: ['mediator', 'observer', 'comparison'],
    answer: `Both decouple objects, but the **intent** differs.

| | Mediator | Observer |
|--|--|--|
| Intent | Centralize **complex mutual interaction** among peers | **One-to-many** notification of state change |
| Direction | Bidirectional — peers talk *through* the hub | One-way — subject → subscribers |
| Logic | Coordination rules live **in the mediator** | Subject just broadcasts; observers decide |
| Example | Dialog widgets, chat room, air-traffic control | Event listeners, model→view updates |

A mediator often *uses* observer internally (peers "notify" it), but the mediator adds **rules** about how peers should react to one another. Observer merely broadcasts an event and leaves the reaction to each subscriber.

:::note
Ask yourself: is one object announcing a change (Observer), or is a hub coordinating how several objects respond to each other (Mediator)?
:::`,
  },
  {
    id: 'pat-beh2-mediator-god',
    question: 'What is the main risk of the Mediator pattern and how do you mitigate it?',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['mediator', 'anti-pattern'],
    answer: `The mediator can rot into a **god object**: every interaction rule for every colleague piles into one class, which becomes a maintenance and testing nightmare.

**Mitigations:**

- **Split by feature** — one mediator per dialog/workflow rather than one for the whole app.
- Keep only **coordination** logic in the mediator; each colleague should still own its *own* behaviour.
- Watch the health check: if the mediator has absorbed logic that belongs to a colleague, push it back out.

Mediator trades many small couplings for one central coupling — a win only when the interaction is genuinely cross-cutting.`,
  },
  {
    id: 'pat-beh2-memento-roles',
    question: 'Name the three roles in the Memento pattern and explain how encapsulation is preserved.',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['memento', 'encapsulation', 'undo'],
    answer: `The three roles:

- **Originator** — owns the state; creates a memento (\`save()\`) and restores from one (\`restore(m)\`).
- **Memento** — the opaque snapshot of state.
- **Caretaker** — stores mementos (e.g. an undo stack) but **never inspects or modifies** them.

Encapsulation is preserved because **only the Originator can read a memento's internal state**. Common techniques:

- Make Memento a **nested/private class** so only the enclosing Originator sees its accessors.
- Expose a **narrow (marker) interface** to the caretaker and the full type to the originator.
- Make the snapshot **immutable** (e.g. a \`record\`) so it can't be tampered with.

:::tip
Real JDK example: **\`javax.swing.undo.UndoManager\`** with \`UndoableEdit\`.
:::`,
  },
  {
    id: 'pat-beh2-memento-copy',
    question: 'Why must a memento store a value copy rather than a reference to mutable state?',
    difficulty: 'Hard',
    category: 'Behavioral',
    tags: ['memento', 'undo', 'pitfalls'],
    answer: `Because the Originator keeps mutating its state after the snapshot. If the memento holds a **reference** to a mutable object rather than a **copy of the values**, then "restore" brings back the *current* values, not the ones captured at save time — so undo does nothing useful.

\`\`\`java
// WRONG: aliases the same list the editor keeps editing
Memento save() { return new Memento(this.items); }

// RIGHT: snapshot a defensive copy
Memento save() { return new Memento(List.copyOf(this.items)); }
\`\`\`

:::gotcha
The memento must be a **deep enough** copy to be independent of ongoing edits. For large state, production undo systems store **deltas** or use copy-on-write instead of full snapshots.
:::`,
  },
  {
    id: 'pat-beh2-visitor-double-dispatch',
    question: 'Explain double dispatch in the Visitor pattern.',
    difficulty: 'Hard',
    category: 'Behavioral',
    tags: ['visitor', 'double-dispatch'],
    answer: `Java normally dispatches a virtual call on **one** type — the receiver. Visitor chains **two** virtual calls so the method resolves on *both* the element type and the visitor type:

1. \`shape.accept(v)\` dispatches on the **shape's** runtime type → lands in \`Circle.accept\`.
2. Inside it, \`v.visitCircle(this)\` dispatches on the **visitor's** type → lands in \`AreaVisitor.visitCircle\`.

\`\`\`java
record Circle(double r) implements Shape {
  public <R> R accept(Visitor<R> v) { return v.visitCircle(this); }
}
\`\`\`

The operation executed depends on the combination of concrete element type **and** concrete visitor — something a single \`instanceof\` chain only fakes clumsily.`,
  },
  {
    id: 'pat-beh2-visitor-tradeoff',
    question: 'What change is cheap with Visitor, and what change is painful? When would you avoid it?',
    difficulty: 'Hard',
    category: 'Behavioral',
    tags: ['visitor', 'trade-offs'],
    answer: `Think of the design as a grid of **element types × operations**. Visitor inverts the usual cost model:

| Add… | Cost |
|--|--|
| A new **operation** (e.g. \`PerimeterVisitor\`) | **Cheap** — one new class, touch nothing else |
| A new **element type** (e.g. \`Triangle\`) | **Painful** — add \`visitTriangle\` to *every* existing visitor |

**Avoid Visitor when the element hierarchy changes often** — each new element type breaks the compile of every visitor. Use it only when the element set is **stable** but operations keep multiplying (e.g. compiler passes over a fixed AST).

:::senior
Modern Java alternative: **sealed interfaces + pattern-matching \`switch\`** gives exhaustiveness checks without accept-boilerplate, and adding an element type is caught at compile time.
:::`,
  },
  {
    id: 'pat-beh2-interpreter-rare',
    question: 'Describe the Interpreter pattern and explain why it is rarely used in practice.',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['interpreter', 'grammar', 'ast'],
    answer: `Interpreter represents a **simple grammar** as a class hierarchy — one class per rule — and evaluates a sentence by walking the resulting tree with a recursive \`interpret(context)\`. Terminals (numbers, variables) are leaves; non-terminals (\`+\`, \`*\`) compose sub-expressions. It is essentially a **Composite** tree with an evaluate operation.

\`\`\`java
record Add(Expr left, Expr right) implements Expr {
  public int interpret(Map<String,Integer> ctx) {
    return left.interpret(ctx) + right.interpret(ctx);
  }
}
\`\`\`

**Why it is rarely used:** hand-coding a class per grammar rule does not scale. For anything beyond a tiny, stable grammar you reach for a **parser generator** (ANTLR, JavaCC) or an existing expression engine long before this pattern pays off.

:::note
Cited JDK example of the spirit: **\`java.util.regex.Pattern\`** compiles to an internal tree of matcher nodes.
:::`,
  },
  {
    id: 'pat-beh2-pick-pattern',
    question: 'For each scenario, which behavioral pattern fits: (a) undo/redo in an editor, (b) an HTTP request passing through auth, logging, and compression stages, (c) coordinating widgets in a complex dialog?',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['selection', 'memento', 'chain-of-responsibility', 'mediator'],
    answer: `- **(a) Undo/redo** → **Memento**. Capture the editor's state into an opaque snapshot the caretaker (undo stack) stores, then restore it — without breaking encapsulation.
- **(b) Request through stages** → **Chain of Responsibility**. Each stage is a handler that processes and forwards; this is exactly the Servlet \`Filter\` chain.
- **(c) Coordinating dialog widgets** → **Mediator**. A hub encapsulates how the widgets react to each other, turning an n×n mesh into hub-and-spoke.

:::tip
The tell for **Memento** is "restore previous state"; for **Chain of Responsibility** it is "pass along stages"; for **Mediator** it is "many peers interacting."
:::`,
  },
];

export default questions;
