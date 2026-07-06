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
  {
    id: 'pat-beh2-behavioral-overview',
    question: 'Name the eleven GoF behavioral patterns with a one-line intent for each.',
    difficulty: 'Easy',
    category: 'Behavioral',
    tags: ['overview', 'cheatsheet', 'gof'],
    answer: `All eleven are about **how objects communicate and share responsibility**:

| Pattern | One-line intent |
|--|--|
| **Chain of Responsibility** | Pass a request along a chain until one handler takes it |
| **Command** | Wrap a request as an object (undo, queue, log) |
| **Interpreter** | Represent a grammar and evaluate sentences in it |
| **Iterator** | Traverse a collection without exposing its structure |
| **Mediator** | Centralize complex interactions among peers |
| **Memento** | Capture and restore an object's state |
| **Observer** | Notify many subscribers of a state change |
| **State** | Change behaviour when internal state changes |
| **Strategy** | Select an interchangeable algorithm at runtime |
| **Template Method** | Fix an algorithm's skeleton, defer steps to subclasses |
| **Visitor** | Add operations to a type hierarchy without editing it |

:::tip
Memory hook by mechanism: **Strategy/State/Template** vary an algorithm; **Command/Memento** turn actions/state into objects; **Observer/Mediator/Chain** route messages; **Iterator/Visitor/Interpreter** operate over structures.
:::`,
  },
  {
    id: 'pat-beh2-cor-vs-decorator',
    question: 'Chain of Responsibility and Decorator both build a chain of wrapped objects. How do they differ?',
    difficulty: 'Hard',
    category: 'Behavioral',
    tags: ['chain-of-responsibility', 'decorator', 'comparison'],
    answer: `Structurally they are twins — each element holds a reference to the next/wrapped element and can act before or after delegating. The intent differs on **whether every link participates**:

| | Chain of Responsibility | Decorator |
|--|--|--|
| Purpose | Find **one** handler for a request | Add behaviour to **every** call |
| Delegation | **Conditional** — may stop the chain (short-circuit) | **Unconditional** — always forwards |
| Each link | *May* handle and end it | *Always* contributes, then delegates |
| Outcome | Handled by 0 or 1 links (pure form) | Result flows through all layers |

The decider: **can a link end the traversal early?** A CoR handler that matches *stops* — later handlers never see the request. A decorator *always* calls its delegate; it cannot swallow the call.

\`\`\`java
// CoR: may short-circuit
if (canHandle(r)) { process(r); return; } else next.handle(r);

// Decorator: always passes through
public int read() { return delegate.read(); } // never stops the chain
\`\`\`

:::senior
Servlet \`Filter\` is often called CoR, but a well-behaved filter **always** calls \`chain.doFilter\` — behaving like a Decorator/interceptor. The moment a filter *conditionally* stops the chain (auth rejecting a request), it acts as Chain of Responsibility. The same wiring supports both intents.
:::`,
  },
  {
    id: 'pat-beh2-cor-implement',
    question: 'What are the ways to implement a Chain of Responsibility, and how does a functional/middleware style compare to linked handlers?',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['chain-of-responsibility', 'implementation', 'middleware'],
    answer: `Three common implementations:

**1. Linked handlers (classic GoF)** — each handler stores \`next\` and calls it:
\`\`\`java
abstract class Handler {
  protected Handler next;
  public abstract void handle(Request r); // calls next.handle(r) to forward
}
\`\`\`

**2. List-driven** — the context holds an ordered \`List<Handler>\` and loops, stopping when one returns "handled." Easier to reorder, insert, and unit-test than a linked structure.

**3. Functional / middleware** — compose functions of \`(request, next)\`, the style behind Spring \`HandlerInterceptor\`, servlet filters, and Express/Netty pipelines:
\`\`\`java
interface Middleware { Response handle(Request r, Function<Request, Response> next); }
\`\`\`
Each middleware runs code, then calls \`next\`, then can run code on the way back — giving it **both** pre- and post-processing around the rest of the chain.

:::senior
The functional style is the dominant modern form: it wraps the *rest of the chain* as a continuation (\`next\`), so one middleware can time, retry, or short-circuit everything downstream. It unifies Chain of Responsibility with the interceptor / around-advice idea.
:::`,
  },
  {
    id: 'pat-beh2-cor-tradeoffs',
    question: 'What are the practical downsides of Chain of Responsibility, and how do you keep a chain maintainable?',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['chain-of-responsibility', 'trade-offs'],
    answer: `The costs that show up in real systems:

- **No delivery guarantee** — a request can fall off the end unhandled; you must add a terminal/catch-all or treat "unhandled" as a deliberate outcome.
- **Order coupling** — behaviour depends on handler order (auth before logging before compression). The order is implicit and easy to break when someone inserts a handler.
- **Hard to trace** — finding which handler acted on a given request means stepping through the whole chain; no single place shows the routing.
- **Performance** — a long chain does a linear walk per request; usually negligible, but pathological for hot paths with many non-matching handlers.

Keeping it maintainable:

- **Make the order explicit** — configure it in one place (a list/registry), not by scattered \`linkWith\` calls or annotations.
- **Log which handler consumed each request** for observability.
- **Keep handlers single-purpose** and independent so reordering is safe.

:::gotcha
The most common production bug is a **silently dropped request** — no handler matched and nothing logged it. Always decide, explicitly, what an unhandled request means.
:::`,
  },
  {
    id: 'pat-beh2-mediator-intent',
    question: 'What is the Mediator pattern, when should you use it, and where does it appear in real systems?',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['mediator', 'coupling', 'sightings'],
    answer: `**Mediator** replaces a **many-to-many web of direct references** among "colleague" objects with a **hub**: colleagues talk only to the mediator, which encapsulates how they interact. It turns an n×n mesh into n spokes.

Use it when a set of objects communicate in complex, well-defined ways and the coupling is becoming unmanageable — classic examples:

- A **dialog/form** where enabling "Submit" depends on several fields; the dialog (mediator) wires the widgets so no widget references another.
- A **chat room** routing messages between participants.
- **Air-traffic control** — planes coordinate through the tower, not with each other.

Framework sightings in spirit: Spring MVC's \`DispatcherServlet\` mediates between requests and controllers; \`ExecutorService\` mediates between task submitters and worker threads; a message bus mediates between components.

\`\`\`java
class LoginDialog {                       // the mediator
  void changed(Widget w) {                // colleagues report changes here
    submit.setEnabled(!user.isEmpty() && !pass.isEmpty());
  }
}
\`\`\`

:::gotcha
Mediator centralizes coupling; it does not delete it. If the interaction is simple or one-directional, a plain Observer broadcast is lighter — reach for Mediator only when coordination *rules* genuinely exist.
:::`,
  },
  {
    id: 'pat-beh2-mediator-vs-facade',
    question: 'Mediator and Facade both put an object in the middle. How are they different?',
    difficulty: 'Hard',
    category: 'Behavioral',
    tags: ['mediator', 'facade', 'comparison'],
    answer: `Both centralize access, but the traffic direction and the relationship differ:

| | Mediator | Facade |
|--|--|--|
| Communication | **Bidirectional** — colleagues talk *to* the mediator and it talks back | **Unidirectional** — client → facade → subsystem |
| Subsystem awareness | Colleagues **know** the mediator and notify it | Subsystem classes **don't know** the facade exists |
| Purpose | Coordinate peers' mutual interaction | Simplify access to a subsystem |
| Coupling changed | Peer-to-peer mesh → hub | Complex subsystem → one entry point |

The key test: in **Mediator**, participants are aware they're being coordinated and actively report to the hub; in **Facade**, the subsystem is passive and oblivious — the facade is a convenience wrapper the subsystem never calls back into.

:::senior
Put differently: a Facade is a **one-way door** into a subsystem you could still use directly; a Mediator is a **switchboard** the colleagues depend on to reach each other. Facade *reduces* dependencies for the client; Mediator *reroutes* dependencies among peers.
:::`,
  },
  {
    id: 'pat-beh2-memento-vs-command',
    question: 'For undo, when do you use Memento (state snapshots) versus Command (reversible actions)?',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['memento', 'command', 'undo', 'comparison'],
    answer: `Two undo strategies with different cost models:

- **Memento — snapshot the state.** Save the relevant state before a change; undo = restore the snapshot. Simple and robust, but memory grows with state size × history depth.
- **Command — record the action.** Each command implements \`undo()\` that computes the inverse (insert ↔ delete). Undo = replay inverses. Memory-cheap and precise, but every action needs a correct, well-defined inverse.

| | Memento | Command |
|--|--|--|
| Stores | State snapshots | Actions + their inverses |
| Memory | Grows with state size | Grows with action count (usually smaller) |
| Best when | State is small / hard to invert | Actions have clean inverses |
| Risk | Large snapshots | Getting \`undo()\` logic exactly right |

\`\`\`java
editor.restore(history.pop());   // Memento: restore a snapshot
history.pop().undo();            // Command: invert the action
\`\`\`

:::senior
Real editors combine them: **Command** for the undo *stack* and fine-grained actions, with periodic **Memento** checkpoints so undo doesn't replay thousands of commands from the start. For big documents, both give way to **deltas / copy-on-write** to bound memory.
:::`,
  },
  {
    id: 'pat-beh2-memento-serialization',
    question: 'How do you actually capture a snapshot for Memento — deep copy, serialization, or deltas?',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['memento', 'snapshot', 'implementation'],
    answer: `Three techniques, trading simplicity for memory:

1. **Field / deep copy** — copy the mutable state into an immutable snapshot (a \`record\`, or \`List.copyOf\`). Simple and fast; the default choice for small state.
2. **Serialization** — serialize the object graph to bytes (JSON, or Java serialization). Handy for deep, nested graphs and for persisting undo across sessions, but slow and it drags in serialization concerns (transient fields, versioning).
3. **Deltas / command log** — store only *what changed* rather than the full state. Minimal memory, but you reconstruct state by replaying, and each change needs a defined inverse.

\`\`\`java
// Immutable snapshot as a record — tamper-proof, cheap to restore
record EditorMemento(String text, int cursor) {}
EditorMemento save() { return new EditorMemento(text, cursor); }
\`\`\`

:::gotcha
Whatever the technique, the snapshot must be **independent of ongoing edits** — a shared reference to the live state means "undo" restores the *current* values. Prefer an immutable snapshot (record) so the caretaker cannot mutate it either. For large state, full snapshots per keystroke blow up memory — switch to deltas or periodic checkpoints.
:::`,
  },
  {
    id: 'pat-beh2-visitor-single-dispatch-fails',
    question: 'Why can\'t you just overload visit(Circle), visit(Square) and let Java pick the right one? What does Visitor fix?',
    difficulty: 'Hard',
    category: 'Behavioral',
    tags: ['visitor', 'double-dispatch', 'overloading'],
    answer: `Because Java resolves **overloads at compile time using the static type**, not the runtime type. Given \`List<Shape>\`, this fails:

\`\`\`java
void visit(Circle c) { ... }
void visit(Square s) { ... }

for (Shape s : shapes)
  visit(s);   // won't compile / always binds visit(Shape) — static type is Shape
\`\`\`

Overload selection sees only \`Shape\`; it cannot dispatch on the actual \`Circle\`/\`Square\` at runtime. Method **overriding** *does* dispatch on runtime type, but overriding keys on only **one** type — the receiver.

Visitor combines two overriding calls to recover runtime dispatch on **both** types:

\`\`\`java
shape.accept(visitor);        // dispatch 1: runtime type of shape → Circle.accept
// inside Circle.accept:
visitor.visitCircle(this);    // dispatch 2: runtime type of visitor → AreaVisitor
\`\`\`

The \`accept\` call recovers the concrete element type (\`this\` is now statically \`Circle\`), so the *right* overload is chosen. That is **double dispatch** — the operation depends on element type **and** visitor type.

:::senior
Java is a **single-dispatch** language (virtual calls key on the receiver only). Visitor is the workaround; languages with multimethods (Clojure, Julia) don't need it. Modern Java's alternative is **pattern-matching \`switch\` on a sealed type**, which dispatches on runtime type without the accept/visit boilerplate.
:::`,
  },
  {
    id: 'pat-beh2-visitor-sightings',
    question: 'Where does the Visitor pattern appear in the JDK and real tooling?',
    difficulty: 'Medium',
    category: 'Behavioral',
    tags: ['visitor', 'jdk', 'sightings'],
    answer: `Visitor shows up wherever a **stable structure** is walked by **many operations**:

- **\`java.nio.file.FileVisitor\`** — \`Files.walkFileTree(start, visitor)\` calls \`visitFile\`, \`preVisitDirectory\`, \`visitFileFailed\` as it walks the tree.
- **\`javax.lang.model.element.ElementVisitor\`** — annotation processors visit program elements (classes, methods, fields) during compilation.
- **\`TypeVisitor\`** in the compiler and **ASM/JDT** bytecode/AST tooling — compiler passes over a fixed AST are the textbook use case.
- **DOM traversal** and XML/JSON tree walkers.

\`\`\`java
Files.walkFileTree(root, new SimpleFileVisitor<>() {
  public FileVisitResult visitFile(Path f, BasicFileAttributes a) {
    System.out.println(f); return FileVisitResult.CONTINUE;
  }
});
\`\`\`

:::tip
The pattern fits because the structure (a filesystem tree, an AST, a DOM) is **fixed**, while the operations over it (print, count, compile, lint, transform) keep multiplying — exactly the shape where Visitor's "cheap to add operations" trade-off pays off.
:::`,
  },
  {
    id: 'pat-beh2-visitor-vs-pattern-matching',
    question: 'How do sealed interfaces and pattern-matching switch replace the Visitor pattern in modern Java?',
    difficulty: 'Hard',
    category: 'Behavioral',
    tags: ['visitor', 'sealed', 'pattern-matching', 'modern-java'],
    answer: `A **sealed** type tells the compiler the *complete* set of subtypes, so a \`switch\` with pattern matching can dispatch on runtime type **with an exhaustiveness check** — no \`accept\`/\`visit\` boilerplate:

\`\`\`java
sealed interface Shape permits Circle, Square, Triangle {}

double area(Shape s) {
  return switch (s) {                 // no default needed
    case Circle c   -> Math.PI * c.r() * c.r();
    case Square sq  -> sq.side() * sq.side();
    case Triangle t -> 0.5 * t.base() * t.height();
  };                                   // compile error if a permitted type is unhandled
}
\`\`\`

It inverts Visitor's trade-off:

| | Visitor | sealed + switch |
|--|--|--|
| Add an **operation** | New visitor class | New method with a switch |
| Add a **type** | Edit every visitor | Compiler flags **every** switch to update |
| Boilerplate | \`accept\`/\`visit\` per type | None |
| Exhaustiveness | Not checked | **Compile-time checked** |

:::senior
The nuance: Visitor makes **adding operations** cheap and **adding types** expensive; sealed+switch makes **adding types** safe (the compiler lists every switch to fix) and keeps operations as ordinary methods. Choose sealed+switch when you own the hierarchy and value exhaustiveness; keep Visitor when operations must be added by **third parties** who can't touch your \`switch\` statements, or when double-dispatch must cross a library boundary.
:::`,
  },
];

export default questions;
