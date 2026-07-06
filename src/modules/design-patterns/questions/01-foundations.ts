import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'pat-fnd-what-is-a-pattern',
    question: 'What is a design pattern, and what is it *not*?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['fundamentals', 'gof'],
    answer: `A design pattern is a **named, reusable solution to a recurring design problem** — a description of the roles, their relationships, and the trade-offs that you adapt to your context.

It is **not**:
- concrete code you copy and paste,
- a library or framework you import,
- a guarantee of good design if applied blindly.

Its biggest practical benefit is a **shared vocabulary**: "wrap it in an Adapter" or "make it a Strategy" communicates a whole design in two words.`,
  },
  {
    id: 'pat-fnd-gang-of-four',
    question: 'Who are the "Gang of Four" and why do they matter?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['gof', 'history'],
    answer: `The **Gang of Four (GoF)** are Erich Gamma, Richard Helm, Ralph Johnson, and John Vlissides — authors of the 1994 book *Design Patterns: Elements of Reusable Object-Oriented Software*.

They catalogued **23 patterns** and, crucially, established a **standard template** (Intent, Motivation, Participants, Structure, Consequences...) and a shared vocabulary. That catalog is still the canonical reference for OO design patterns.`,
  },
  {
    id: 'pat-fnd-three-categories',
    question: 'Name the three GoF categories and what each is primarily concerned with.',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['categories', 'gof'],
    answer: `| Category | Primary concern | Count |
|--|--|--|
| **Creational** | How objects are **created** | 5 |
| **Structural** | How objects are **composed** | 7 |
| **Behavioral** | How objects **interact** and share responsibility | 11 |

Total = **23**. A quick mnemonic: creational *makes it*, structural *connects it*, behavioral *coordinates it*.`,
  },
  {
    id: 'pat-fnd-category-counts',
    question: 'How many patterns are in each GoF category, and why is behavioral the largest?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['categories', 'gof'],
    answer: `**5 creational, 7 structural, 11 behavioral = 23.**

Behavioral is the biggest bucket because *how objects collaborate and divide responsibility* is the richest and most varied source of recurring design problems — communication, traversal, undo, notification, state transitions, and interchangeable algorithms each get their own pattern (Observer, Iterator, Command, Memento, State, Strategy, and more).`,
  },
  {
    id: 'pat-fnd-encapsulate-what-varies',
    question: 'Explain the principle "encapsulate what varies" and name a pattern that embodies it.',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['principles', 'strategy'],
    answer: `Find the part of the system that **changes**, and isolate it behind a **stable interface** so the rest of the code never changes with it.

Example: a \`PaymentService\` depends only on a \`PaymentMethod\` interface; \`CardPayment\`, \`PayPalPayment\`, and \`CryptoPayment\` implement it. Adding a new method touches **zero** existing code.

That is exactly the shape of **Strategy** — a family of interchangeable algorithms behind one interface. Decorator and State protect the same principle.`,
  },
  {
    id: 'pat-fnd-composition-over-inheritance',
    question: 'Why do so many patterns favor composition over inheritance?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['principles', 'composition'],
    answer: `Inheritance binds behavior at **compile time** and explodes into subclass combinations (\`FlyingDuck\`, \`RubberDuck\`, \`FlyingRubberDuck\`...). It also creates rigid, fragile hierarchies where a change to a base class ripples everywhere.

**Composition** lets an object *hold* the varying behavior as a field and even **swap it at runtime**, keeping behaviors small and independently testable. This flexibility is the core insight behind Strategy, Decorator, State, and Bridge.

Inheritance still has its place — **Template Method** deliberately uses it to fix an algorithm's skeleton while subclasses fill in steps.`,
  },
  {
    id: 'pat-fnd-program-to-interface',
    question: 'What does "program to an interface, not an implementation" mean in practice?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['principles', 'abstraction'],
    answer: `Depend on **abstract types**, not concrete classes. In Java, declare \`List<String> l = new ArrayList<>();\` rather than \`ArrayList<String> l = ...\`.

Benefits:
- **Swappability** — change \`ArrayList\` to \`LinkedList\` without touching callers.
- **Testability** — inject a mock/fake implementation.
- **Decoupling** — callers know only the contract, not the details.

Violating it (referencing concrete classes everywhere) is one of the most common causes of rigid, hard-to-test code.`,
  },
  {
    id: 'pat-fnd-open-closed',
    question: 'State the Open/Closed Principle and how patterns help you follow it.',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['principles', 'solid'],
    answer: `**Open for extension, closed for modification**: you should be able to add new behavior **without editing existing, tested code**.

Patterns achieve this by putting variation behind an abstraction so new behavior arrives as a **new class** rather than an edit to a working one — e.g. a new \`Strategy\`, a new \`Decorator\`, or a new product in a \`Factory\`. This limits regression risk and keeps proven code untouched.`,
  },
  {
    id: 'pat-fnd-uml-arrows',
    question: 'In a UML class diagram, distinguish inheritance, realization, aggregation, and composition arrows.',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['uml', 'notation'],
    answer: `| Arrow | Name | Reads as | Lifetime |
|--|--|--|--|
| \`<|--\` | Inheritance | subclass **extends** superclass (solid line, hollow triangle) | — |
| \`<|..\` | Realization | class **implements** an interface (dashed line, hollow triangle) | — |
| \`o--\` | Aggregation | **has-a**, part can outlive the whole (hollow diamond) | independent |
| \`*--\` | Composition | **owns-a**, part dies with the whole (filled diamond) | shared |

Also worth knowing: \`-->\` association (knows/references) and \`..>\` dependency (uses transiently). The hollow triangle always points at the **more general** type; a solid line means *is-a*, dashed means *implements* or *uses*.`,
  },
  {
    id: 'pat-fnd-over-engineering',
    question: 'When should you NOT use a design pattern? What is "pattern soup"?',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['anti-patterns', 'over-engineering'],
    answer: `Do **not** reach for a pattern when:
- you are guessing about future needs (**YAGNI**) rather than responding to a real, recurring problem,
- a plain function, \`if\`, or single class would do,
- the pattern only makes the code *look* sophisticated without making it easier to change.

**Pattern soup** is the result of over-applying patterns: simple logic buried under needless factories, strategies, and decorators, so the code is harder to read and onboard onto — a classic form of **over-engineering**.

Senior practice: write the direct solution first, then **refactor toward** a pattern when duplication or a genuine axis of change appears. A pattern is a destination, not a starting blueprint.`,
  },
  {
    id: 'pat-fnd-patterns-principles-idioms',
    question: 'Design principle, design pattern, idiom, architectural pattern — how do these four differ?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['fundamentals', 'terminology', 'architecture'],
    answer: `They are solutions at **four different altitudes**:

| Level | What it is | Examples |
|--|--|--|
| **Principle** | Universal guideline — says what *good* looks like, not how | SOLID, DRY, YAGNI |
| **Architectural pattern** | System-level organization of a whole application | MVC, layered, microservices, hexagonal |
| **Design pattern** | Named, mid-level solution to a recurring class/object design problem | Strategy, Adapter, Observer |
| **Idiom** | Low-level, language-specific technique | try-with-resources, the holder idiom, \`equals\`/\`hashCode\` contract |

Principles *guide* decisions; design patterns implement them at class scale; idioms implement them at language scale; architectural patterns shape the whole system.

:::gotcha
Interviewers probe the boundaries: Singleton is a design pattern, dependency injection is a principle plus a mechanism, MVC is an architectural pattern, and double-checked locking is a Java idiom. Mixing these up reads as shallow knowledge.
:::`,
  },
  {
    id: 'pat-fnd-problem-to-pattern',
    question: 'An interviewer describes a problem and asks which pattern applies. What is your mental process for mapping a problem statement to a pattern?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['choosing', 'method', 'interview-technique'],
    answer: `Two steps: **classify the problem axis, then listen for trigger phrases.**

**Step 1 — which family is the pain in?** Creating objects → creational. Combining/wrapping existing objects → structural. Objects interacting or behaviour varying → behavioral.

**Step 2 — trigger phrases:**

| You hear... | Think |
|--|--|
| "families of related objects" | Abstract Factory |
| "many optional parameters" | Builder |
| "interface doesn't match" | Adapter |
| "add features without subclassing" | Decorator |
| "notify many parties" | Observer |
| "swap the algorithm" | Strategy |
| "passes through stages" | Chain of Responsibility |
| "undo", "queue the action" | Command / Memento |

**Step 3 — confirm with the trade-off**: state what the pattern costs (indirection, extra classes) and why it is worth it *here*. Naming the problem before the pattern is what separates reasoning from recitation.`,
  },
  {
    id: 'pat-fnd-norvig-criticism',
    question: 'Explain the criticism that "design patterns are missing language features." Is it fair?',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['criticism', 'norvig', 'language-evolution'],
    answer: `Peter Norvig showed that **16 of the 23** GoF patterns become invisible or dramatically simpler in dynamic languages (Lisp/Dylan) with first-class functions, multiple dispatch, and macros. The claim: a pattern is *boilerplate compensating for what the language cannot express*.

Java's own evolution supports it:

- **Iterator** → the enhanced \`for\` loop and Streams
- **Strategy / Command** → lambdas and method references
- **Singleton** → \`enum\`
- **Observer** → first-class listeners, reactive libraries
- **Visitor** → sealed interfaces + pattern-matching \`switch\`

But the criticism is only half right. Patterns are also **design analysis** — named roles, forces, and trade-offs. \`Comparator\` as a lambda is still *conceptually* a Strategy; the vocabulary and the decision survive even when the boilerplate dies. And structural patterns (Facade, Composite, Bridge) organize *systems*, not syntax — no language feature deletes them.

:::senior
A strong answer names one pattern Java absorbed (Strategy → lambda) and one it never will (Facade), and concludes: languages absorb pattern *mechanics*; the *decisions* remain.
:::`,
  },
  {
    id: 'pat-fnd-anti-pattern-definition',
    question: 'What is an anti-pattern, and how is it different from a plain mistake?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['anti-patterns', 'terminology'],
    answer: `An **anti-pattern** is a *recurring* solution that looks attractive and plausible but reliably produces negative consequences. Like a pattern, it is named and documented — including the refactoring path out of it.

Difference from a mistake:

- A **mistake** is a one-off error (a bug, a typo).
- An **anti-pattern** is *structural and repeated* — teams keep choosing it because it seems reasonable at the moment (quick, familiar, locally convenient), and the cost appears later.

Classic catalog entries: **God Object** (one class does everything), **Golden Hammer** (one tool for every problem), **Lava Flow** (fossilized dead code), **Spaghetti Code** (tangled control flow), **Poltergeist** (pointless pass-through classes).

Naming matters for the same reason pattern names matter: "this is becoming a God Object" communicates a whole diagnosis — and its cure — in one phrase.`,
  },
  {
    id: 'pat-fnd-golden-hammer',
    question: 'What is the "golden hammer" anti-pattern? Give concrete examples.',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['anti-patterns', 'golden-hammer'],
    answer: `"**When all you have is a hammer, everything looks like a nail.**" The golden hammer is over-applying a familiar tool, pattern, or technology to every problem regardless of fit.

Examples:

- A Singleton for every service ("it worked last time").
- Inheritance for every kind of reuse.
- Microservices for a two-person CRUD app.
- Kafka for a queue with ten messages a day.
- The one design pattern you know, forced into every interview answer.

**Root cause:** familiarity bias — the cost of learning the right tool feels higher than the hidden cost of misusing the known one.

**Antidote:** start from the problem's forces, not the toolbox; timebox a spike on the unfamiliar-but-fitting option; let code review challenge the default.

:::tip
The interview version of the golden hammer is name-dropping the same pattern for every scenario — interviewers specifically watch for it.
:::`,
  },
  {
    id: 'pat-fnd-spaghetti-code',
    question: 'What is spaghetti code, and which design failures produce it?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['anti-patterns', 'spaghetti'],
    answer: `**Spaghetti code** is code whose control flow and dependencies are so tangled that no part can be understood — or changed — in isolation. Everything references everything; following one request means jumping across dozens of unrelated methods.

Design failures that produce it:

- **No encapsulation boundaries** — state is public/global and mutated from everywhere.
- **No separation of concerns** — UI, business rules, and persistence interleaved in the same methods.
- **Patch-on-patch evolution** — every fix adds a flag or special case; nothing is ever refactored.
- **Copy-paste reuse** — logic duplicated, then divergently edited.

Consequences: change amplification (a small edit touches many files) and fear-driven development (nobody dares delete anything — which then breeds *lava flow*).

Prevention is boring and effective: single responsibility, explicit layers/modules, tests that permit refactoring, and refactoring as a habit rather than an event.`,
  },
  {
    id: 'pat-fnd-lava-flow',
    question: 'Describe the "lava flow" anti-pattern. Why does it accumulate, and how do you clean it up?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['anti-patterns', 'lava-flow', 'dead-code'],
    answer: `**Lava flow** is dead or obsolete code that stays in the codebase because nobody remembers why it exists and everyone fears removing it — like lava that flowed once and hardened in place.

**Why it accumulates:**

- Prototype/experimental code shipped to production "temporarily."
- Authors leave; the context leaves with them.
- No tests document intent, so "does anything use this?" is unanswerable.
- Each generation of developers works *around* the hardened mass, adding more flow on top.

**Costs:** every reader pays a comprehension tax; dead paths create false coupling; dependencies are kept alive for code that never runs.

**Cleanup:**

- Use coverage tooling, static analysis, and runtime telemetry to prove code is unreachable.
- Delete confidently — **version control is the undo button**; "we might need it" is what \`git log\` is for.
- Add characterization tests around what remains, so the next deletion is cheaper.`,
  },
  {
    id: 'pat-fnd-poltergeist',
    question: 'What is a "poltergeist" class? How do you recognize and remove one?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['anti-patterns', 'poltergeist'],
    answer: `A **poltergeist** is a short-lived, stateless class that only shuttles data or invokes other objects, then vanishes — indirection with no behaviour of its own.

**Recognition signs:**

- Names like \`XxxManager\`, \`XxxHelper\`, \`XxxController\` with no state and no decisions.
- Every method is a one-line delegation to another object.
- It is created, called once, and discarded.

**Removal:** apply "tell, don't ask" — move the behaviour into the class that owns the data, and let callers talk to the real object directly. The poltergeist inlines away.

:::gotcha
Do not confuse poltergeists with **Facades**. A facade earns its indirection by simplifying a genuine subsystem boundary for many clients. A poltergeist has no boundary and no simplification — it just adds a hop. The test: delete it mentally; if callers could call the target just as clearly, it was a poltergeist.
:::`,
  },
  {
    id: 'pat-fnd-refactor-to-patterns',
    question: 'What does "refactoring to patterns" mean, and why is it preferred over designing with patterns up front?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['refactoring', 'emergent-design', 'process'],
    answer: `The idea (from Joshua Kerievsky's *Refactoring to Patterns*): patterns are **destinations you refactor toward when forces appear** — not blueprints you start from.

**Workflow:**

1. Write the simplest solution that works.
2. Wait for evidence: a second algorithm arrives, a \`switch\` on type keeps growing, subclasses start multiplying.
3. Apply a pattern-directed refactoring — e.g. *Replace Conditional with Polymorphism* lands you at Strategy or State; *Extract Class* around creation lands you at Factory.

**Why not up front?** Up-front patterns are bets on variation that may never occur — speculative generality. You pay indirection costs immediately for flexibility you may never use, and the *wrong* early abstraction is expensive to unwind once every call site depends on it.

:::senior
"I'd hardcode the first payment provider and extract a Strategy when the second one arrives" is a stronger interview sentence than naming five patterns — it shows you know patterns *and* when they're premature.
:::`,
  },
  {
    id: 'pat-fnd-patterns-actually-used',
    question: 'How do you answer "which design patterns have you actually used?" convincingly?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['interview-technique', 'experience'],
    answer: `Pick **two or three**, each told as *problem → why this pattern → outcome and trade-off*. A list of ten names with no stories is the weakest possible answer.

A convincing mix:

1. **One hand-rolled** — "Checkout had three payment providers behind one interface (Strategy); adding the fourth touched zero existing code."
2. **One framework-mediated** — "Every \`@Transactional\` service I write is wrapped in a Proxy; I learned that the hard way when self-invocation skipped the transaction." Recognizing patterns *in the wild* proves understanding better than writing one.
3. **One you avoided or removed** — "I inlined a factory that only ever built one product." Restraint is a senior signal.

:::gotcha
Avoid claiming Singleton as your showcase — it invites "isn't that an anti-pattern?" Unless you tell it *as* the cautionary tale, pick something you can defend.
:::`,
  },
  {
    id: 'pat-fnd-solid-mapping',
    question: 'How do design patterns relate to the SOLID principles? Give concrete pattern-principle pairs.',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['solid', 'principles', 'mapping'],
    answer: `Principles state the goal; patterns are **named, reusable ways to reach it**:

| Principle | Patterns that serve it |
|--|--|
| **S**RP | Facade / Mediator pull coordination out of business classes |
| **O**CP | Strategy, Decorator, Factory Method — new behaviour arrives as a *new class* |
| **L**SP | Strategy and State only work because implementations are truly substitutable |
| **I**SP | Adapter narrows a fat interface; Observer's small callback interfaces |
| **D**IP | Abstract Factory + Dependency Injection supply abstractions, never concretions |

The mapping is many-to-many, not 1:1 — a single Decorator honours OCP *and* SRP, and most patterns rely on LSP to function at all.

:::senior
The senior framing: patterns are *proofs by construction* that the principles are achievable. If you can't name which principle a pattern serves, you know its shape but not its purpose.
:::`,
  },
  {
    id: 'pat-fnd-intent-vs-structure',
    question: 'Several GoF patterns share identical structure. Why is intent, not structure, the defining property of a pattern?',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['intent', 'structure', 'confused-pairs'],
    answer: `Because structure **underdetermines** the pattern. Several famous pairs compile to the same UML:

| Same shape | The difference is... |
|--|--|
| Strategy / State | *Who switches*: client picks vs object transitions itself |
| Decorator / Proxy | *Why wrap*: add behaviour vs control access |
| Adapter / Bridge | *When designed*: retrofit a mismatch vs planned separation |
| Command / Strategy | *What's reified*: a request (queue/undo it) vs an algorithm choice |

If you only know the class diagram, you cannot tell these apart — the pattern lives in the **problem being solved**: the forces, who holds control, and the lifecycle of the participants.

Practical consequences:

- Name patterns by the problem ("we need to gate access → Proxy"), never by shape resemblance.
- In code review, a wrapper class is not "the Decorator pattern" until its *purpose* is adding responsibilities.

:::gotcha
"Identify the pattern from this diagram" is a trap question — the correct answer names the candidates and says which *intent* would decide it.
:::`,
  },
  {
    id: 'pat-fnd-rule-of-three',
    question: 'What is the "Rule of Three," and what does it say about when abstractions should appear?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['rule-of-three', 'process', 'yagni'],
    answer: `Two related rules share the name, and both encode *evidence before abstraction*:

1. **The pattern-catalog rule** — a solution qualifies as a *pattern* only after it has been observed in at least **three independent real systems**. Patterns are **discovered (mined), not invented**; the GoF catalogued what working systems already did.

2. **The refactoring rule** (Fowler/Roberts) — tolerate duplication the **first and second** time you write similar code; on the **third** occurrence, refactor to an abstraction. By then you have three data points showing which parts actually vary.

Why wait? Abstracting on one example means guessing the axis of variation — and a **wrong abstraction is more expensive than duplication**, because every call site bakes it in.

:::tip
This is the same philosophy as "refactoring to patterns": let the code *earn* its abstractions.
:::`,
  },
  {
    id: 'pat-fnd-four-elements',
    question: 'According to the GoF, what are the four essential elements of a design pattern?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['gof', 'structure-of-a-pattern'],
    answer: `The GoF define every pattern by four elements:

1. **Name** — one or two words that become shared vocabulary ("wrap it in a Proxy").
2. **Problem** — when to apply it: the context and the *forces* (conflicting constraints) it resolves.
3. **Solution** — the participants, their roles, and collaborations — described abstractly, **not as concrete code**.
4. **Consequences** — the trade-offs: what you gain (flexibility, decoupling) and what you pay (indirection, class count).

This template is directly reusable as an **interview answer structure**: name it, state the problem it solves, sketch the roles, and finish with the consequences.

:::senior
Consequences are the most neglected element — and the one interviewers use to separate levels. Anyone can recite the solution; seniors lead with when it costs more than it pays.
:::`,
  },
];

export default questions;
