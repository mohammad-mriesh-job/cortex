import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'modern-instanceof-pattern',
    question: 'What does the instanceof type pattern do, and what is flow scoping?',
    difficulty: 'Medium',
    category: 'Modern Java',
    tags: ['pattern-matching', 'instanceof'],
    answer: `An \`instanceof\` **type pattern** tests the type **and** binds a cast variable in one step:

\`\`\`java
if (obj instanceof String s) {
    System.out.println(s.length()); // s is already a String — no cast
}
\`\`\`

\`s\` is the **pattern variable**. **Flow scoping** means it is in scope precisely where the compiler can *prove* the test succeeded:

\`\`\`java
if (obj instanceof String s && s.length() > 3) { ... } // ok after &&
if (!(obj instanceof String s)) return;
System.out.println(s.length());   // ok — we only get here on a match
\`\`\`

This replaces the old test-cast-assign trio (\`if (x instanceof T) { T t = (T) x; ... }\`).`,
  },
  {
    id: 'modern-switch-expression',
    question: 'How does a switch expression differ from a switch statement?',
    difficulty: 'Medium',
    category: 'Modern Java',
    tags: ['switch', 'expressions'],
    answer: `A switch **expression** (final in Java 14) *produces a value*; a statement performs side effects.

| | Statement | Expression |
|--|-----------|------------|
| Returns a value? | No | **Yes** |
| Fall-through | Yes (colon form) | No (arrow form) |
| Exhaustive? | Not required | **Required** |
| Exit a branch | \`break\` | \`yield\` |

\`\`\`java
int letters = switch (day) {
    case MON, FRI, SUN -> 6;
    case TUE           -> 7;
    default            -> 8;
};
\`\`\`

Arrow labels (\`case X ->\`) run a single branch with **no fall-through and no \`break\`**, and commas allow **multiple labels** per branch.`,
  },
  {
    id: 'modern-switch-yield',
    question: 'When do you use yield in a switch, and why not return?',
    difficulty: 'Medium',
    category: 'Modern Java',
    tags: ['switch', 'yield'],
    answer: `Use \`yield\` when a switch-expression branch needs a **block** rather than a single expression — it supplies that branch's value:

\`\`\`java
int score = switch (grade) {
    case 'A' -> 100;
    default  -> {
        log("unexpected " + grade);
        yield 0;        // the block's value
    }
};
\`\`\`

:::gotcha
Inside a switch **expression** you cannot \`return\`, \`break\`, or \`continue\` out of it — that is a compile error. A \`return\` would try to exit the whole enclosing method, so \`yield\` exists to give the branch a value.
:::`,
  },
  {
    id: 'modern-record-patterns',
    question: 'What are record patterns, and how do nested patterns work?',
    difficulty: 'Hard',
    category: 'Modern Java',
    tags: ['pattern-matching', 'records', 'switch'],
    answer: `A **record pattern** deconstructs a record into its components, binding each to a variable. Patterns **nest**, so you can destructure a whole tree at once:

\`\`\`java
record Point(int x, int y) {}
record Line(Point start, Point end) {}

String describe(Object obj) {
    return switch (obj) {
        case Point(int x, int y) -> "Point " + x + "," + y;
        case Line(Point(var x1, var y1), Point(var x2, var y2)) ->
            "Line (" + x1 + "," + y1 + ")->(" + x2 + "," + y2 + ")";
        default -> "?";
    };
}
\`\`\`

Use \`var\` to infer a component's type. Record patterns also work with \`instanceof\`:

\`\`\`java
if (obj instanceof Point(int x, int y)) { ... }
\`\`\`

Finalized in Java 21.`,
  },
  {
    id: 'modern-sealed-exhaustive',
    question: 'How do sealed types make a switch exhaustive, and why omit default?',
    difficulty: 'Hard',
    category: 'Modern Java',
    tags: ['sealed', 'switch', 'exhaustiveness'],
    answer: `A \`sealed\` type lists every permitted subtype, so the compiler knows the **complete** set of possibilities. A switch covering all of them is **exhaustive** and needs no \`default\`:

\`\`\`java
sealed interface Shape permits Circle, Square {}
record Circle(double r) implements Shape {}
record Square(double s) implements Shape {}

double area(Shape shape) {
    return switch (shape) {        // no default needed
        case Circle(double r) -> Math.PI * r * r;
        case Square(double s) -> s * s;
    };
}
\`\`\`

:::senior
Deliberately **omitting \`default\`** is the point: add a new permitted subtype and the switch **fails to compile** until you handle it. A \`default\` would swallow the new case silently. This (with record patterns) is the modern, compiler-checked replacement for the Visitor pattern.
:::`,
  },
  {
    id: 'modern-switch-null',
    question: 'How does a switch handle a null selector?',
    difficulty: 'Medium',
    category: 'Modern Java',
    tags: ['switch', 'null', 'pattern-matching'],
    answer: `By default a \`switch\` throws \`NullPointerException\` when the selector is \`null\` — and this is still true today for backward compatibility. A type pattern like \`case String s\` never matches \`null\`.

Since Java 21 a pattern switch can handle it explicitly with \`case null\`:

\`\`\`java
String test(String s) {
    return switch (s) {
        case null       -> "was null";
        case "hi"       -> "greeting";
        case String str -> "other";
    };
}
\`\`\`

You can also combine it: \`case null, default -> ...\`.

:::gotcha
Forget \`case null\` and a null selector still throws \`NullPointerException\`. Never assume an ordinary pattern label catches \`null\`.
:::`,
  },
  {
    id: 'modern-text-blocks',
    question: 'What problem do text blocks solve, and how is incidental whitespace handled?',
    difficulty: 'Easy',
    category: 'Modern Java',
    tags: ['text-blocks', 'strings'],
    answer: `**Text blocks** (\`"""\`, final in Java 15) are multi-line string literals that remove \`\\n\` and \`+\` clutter for embedded JSON, SQL, HTML, and XML:

\`\`\`java
String query = """
        SELECT id, name
        FROM users
        WHERE active = true
        """;
\`\`\`

The compiler strips **incidental** whitespace: it finds the least-indented line (including the closing \`"""\`) and removes that common indentation from every line, plus trailing spaces. Indentation beyond that baseline is **essential** and kept — so the closing delimiter's position sets the left margin.

Two special escapes: \`\\\` at line end joins lines (suppresses the newline), and \`\\s\` emits a space and protects trailing whitespace. The result is an ordinary \`String\`; there is no interpolation, so use \`.formatted(...)\`.`,
  },
  {
    id: 'modern-lts-strategy',
    question: "Explain Java's release cadence and the LTS adoption strategy.",
    difficulty: 'Easy',
    category: 'Modern Java',
    tags: ['versions', 'lts', 'roadmap'],
    answer: `Since 2018 Java ships a **feature release every six months** (March and September). Some releases are marked **Long-Term Support (LTS)**: the gap was three years (11 → 17) and is now two (17 → 21 → 25).

- **Non-LTS** releases (e.g. 19, 23) get updates only until the next release (~6 months) — use them locally to try **preview features**, never in production.
- **LTS** releases (8, 11, 17, 21, 25) get **several years** of vendor support and are what companies actually deploy.

A typical strategy: standardize on an LTS, pilot the next LTS once libraries and build tools catch up, then migrate — often leaping 8 → 17 or 8 → 21 because the real upgrade pain is **strong encapsulation** and **removed modules**, not new syntax.`,
  },
  {
    id: 'modern-records-basics',
    question: 'What is a record and what does the compiler generate for it?',
    difficulty: 'Easy',
    category: 'Modern Java',
    tags: ['records', 'immutability', 'boilerplate'],
    answer: `A **record** (Java 16) is a transparent, immutable **data carrier**. You declare the components; the compiler generates the boilerplate:

\`\`\`java
public record Point(int x, int y) {}
\`\`\`

From that one line you get:
- \`private final\` fields \`x\` and \`y\`,
- a **canonical constructor** \`Point(int, int)\`,
- **accessors** named \`x()\` and \`y()\` (no \`get\` prefix),
- value-based \`equals\`, \`hashCode\`, and \`toString\`.

Rules and limits:
- A record is **implicitly \`final\`** and extends \`java.lang.Record\`, so it **cannot extend** another class (but *can* implement interfaces).
- Components are final — no setters; it's immutable.
- You may add static fields, static/instance methods, and additional constructors.

:::tip
Records are the modern default for **DTOs, API responses, map keys, and value objects** — anywhere you'd otherwise hand-write (or Lombok-generate) a data class.
:::`,
  },
  {
    id: 'modern-record-validation',
    question: "How do you validate or normalize a record's fields?",
    difficulty: 'Medium',
    category: 'Modern Java',
    tags: ['records', 'compact-constructor', 'validation'],
    answer: `Use a **compact constructor** — the canonical constructor with no parameter list. It runs your checks, then the compiler assigns the fields automatically at the end:

\`\`\`java
public record Range(int lo, int hi) {
    public Range {                         // compact — no (int lo, int hi)
        if (lo > hi) throw new IllegalArgumentException("lo > hi");
        // fields lo/hi assigned implicitly after this block
    }
}
\`\`\`

The compact form is also where you **normalize** and **defensively copy** mutable components, so the record is truly immutable:

\`\`\`java
public record Team(String name, List<String> members) {
    public Team {
        name = name.trim();                 // normalize
        members = List.copyOf(members);     // defensive copy in
    }
}
\`\`\`

:::gotcha
Without \`List.copyOf\`, a record holding a mutable \`List\` is only *shallowly* immutable — the caller keeps a reference and can still mutate your "immutable" data. Records give you \`final\` fields, not deep immutability for free.
:::`,
  },
  {
    id: 'modern-sealed-basics',
    question: 'What are sealed classes, and what rules apply to permitted subclasses?',
    difficulty: 'Medium',
    category: 'Modern Java',
    tags: ['sealed', 'inheritance', 'hierarchy'],
    answer: `A **sealed** class or interface (Java 17) restricts *which* types may extend or implement it, creating a **closed, known** hierarchy:

\`\`\`java
public sealed interface Shape permits Circle, Square, Triangle {}
public record Circle(double r) implements Shape {}
public final class Square implements Shape { /* ... */ }
public non-sealed class Triangle implements Shape {}  // reopens extension
\`\`\`

The rules:
- Every permitted subtype must be **\`final\`**, **\`sealed\`**, or **\`non-sealed\`** — you must decide whether it, too, is closed.
- Permitted subtypes must be in the **same module** (or same package, if unnamed).
- \`permits\` can be **omitted** when all subtypes are declared in the same source file.

:::senior
The payoff is **exhaustive \`switch\`**: because the compiler knows the full set of subtypes, a pattern switch that covers them all needs no \`default\`, and adding a new subtype breaks compilation until every switch handles it. Sealed types + records = algebraic data types in Java.
:::`,
  },
  {
    id: 'modern-var',
    question: "What is var, and where can and can't you use it?",
    difficulty: 'Easy',
    category: 'Modern Java',
    tags: ['var', 'type-inference', 'local-variables'],
    answer: `\`var\` (Java 10) is **local-variable type inference** — the compiler infers the type from the initializer. It is **still static typing**; the type is fixed at compile time, just not written out.

\`\`\`java
var list = new ArrayList<String>();   // ArrayList<String>
var entry = Map.entry("a", 1);        // saves a verbose generic type
for (var e : entries) { ... }         // in for/for-each
try (var in = Files.newInputStream(p)) { ... }
\`\`\`

**Allowed:** local variables with an initializer, for-loop indexes, for-each, try-with-resources.

**Not allowed:** fields, method parameters, return types, catch parameters, or a local with **no initializer** or a \`null\`/lambda/method-reference initializer (nothing to infer from).

:::tip
Use \`var\` when the type is **obvious from the right-hand side** (\`var user = new User()\`); keep the explicit type when it aids readability (\`var x = service.find(id)\` hides what \`x\` is). It's a readability tool, not a mandate.
:::`,
  },
  {
    id: 'modern-module-system',
    question: 'What is the Java Platform Module System (JPMS), and why do many projects skip it?',
    difficulty: 'Medium',
    category: 'Modern Java',
    tags: ['modules', 'jpms', 'encapsulation'],
    answer: `JPMS (Java 9, "Project Jigsaw") groups packages into named **modules** described by \`module-info.java\`:

\`\`\`java
module com.acme.orders {
    requires com.acme.core;        // dependencies (fail fast if missing)
    exports com.acme.orders.api;   // only this package is public
    // com.acme.orders.internal stays hidden — even from reflection
}
\`\`\`

Benefits:
- **Strong encapsulation** — non-\`exports\` packages are genuinely inaccessible, unlike \`public\` classes on the classpath.
- **Reliable configuration** — missing/duplicate modules fail at **startup**, not deep in a run.
- **Smaller runtimes** — \`jlink\` builds a custom JRE with only the modules you use.

Most **application** teams still use the classpath: migration is disruptive, many libraries aren't modularized, and frameworks (Spring) manage encapsulation themselves. The **JDK itself** is fully modularized, which is what enabled strong encapsulation of internal APIs (\`sun.misc.Unsafe\`).`,
  },
  {
    id: 'modern-guarded-patterns',
    question: 'What are guarded patterns (the when clause) in a switch?',
    difficulty: 'Hard',
    category: 'Modern Java',
    tags: ['pattern-matching', 'switch', 'guarded-patterns'],
    answer: `A **guarded pattern** (Java 21) refines a type/record pattern with a boolean condition using \`when\`:

\`\`\`java
String classify(Object o) {
    return switch (o) {
        case Integer i when i < 0  -> "negative";
        case Integer i when i == 0 -> "zero";
        case Integer i             -> "positive";      // unguarded — catches the rest
        case String s when s.isBlank() -> "blank";
        default -> "other";
    };
}
\`\`\`

The guard runs **only if the pattern matches**. This replaces nested \`if\` ladders inside a case block.

:::gotcha
**Order matters.** Cases are tested top-down, and a broad **unguarded** pattern *dominates* any later case of the same type — put guarded cases **before** the unguarded fallback, or the compiler rejects the switch as unreachable. Exhaustiveness analysis also treats guarded cases as *not* guaranteed to match, so you still need an unguarded/\`default\` branch.
:::`,
  },
  {
    id: 'modern-version-features',
    question: 'What are the headline features of Java 8, 11, 17, and 21?',
    difficulty: 'Medium',
    category: 'Modern Java',
    tags: ['versions', 'lts', 'features'],
    answer: `These four are the **LTS** releases most teams standardize on:

| Version | Landmark features |
|---------|-------------------|
| **8** (2014) | Lambdas, Stream API, \`Optional\`, default methods, \`java.time\` |
| **11** (2018) | First LTS after 8; \`var\` in lambda params, \`HttpClient\`, new \`String\` methods, run a single \`.java\` file |
| **17** (2021) | Sealed classes, records (final), pattern matching for \`instanceof\`, text blocks — the modern baseline |
| **21** (2023) | **Virtual threads**, pattern matching for \`switch\`, record patterns, sequenced collections |

The theme from 8 → 21: immutable data (\`records\`), exhaustive modelling (\`sealed\` + patterns), and cheap concurrency (virtual threads).

:::tip
"What's new since 8?" is a common opener. Anchor on the LTS ladder (8 → 11 → 17 → 21) and name one flagship feature per step rather than reciting every JEP.
:::`,
  },
  {
    id: 'modern-datetime-api',
    question: 'Why prefer java.time over the old Date and Calendar classes?',
    difficulty: 'Easy',
    category: 'Modern Java',
    tags: ['java-time', 'date', 'immutability'],
    answer: `The legacy \`java.util.Date\`/\`Calendar\` are **mutable** (not thread-safe), have a **0-based month** (December = 11), mix date and time confusingly, and have an awkward API. \`java.time\` (JSR-310, Java 8) fixes all of it with **immutable**, clearly-named types:

\`\`\`java
LocalDate today = LocalDate.now();               // date only
LocalDate due   = today.plusWeeks(2);            // returns a NEW date
LocalDateTime ts = LocalDateTime.of(2026, 1, 15, 9, 30);
ZonedDateTime z = ts.atZone(ZoneId.of("Europe/Paris"));
Instant now = Instant.now();                     // UTC timestamp
Duration d  = Duration.between(start, end);
\`\`\`

Pick the right type: **\`LocalDate\`** (no time), **\`LocalDateTime\`** (no zone), **\`ZonedDateTime\`** (zone-aware), **\`Instant\`** (machine timestamp), **\`Duration\`**/\`Period\` (amounts).

:::gotcha
Every \`java.time\` object is immutable — \`date.plusDays(1)\` returns a new instance; ignoring the return value (like with \`String\`) is a common bug.
:::`,
  },
];

export default questions;
