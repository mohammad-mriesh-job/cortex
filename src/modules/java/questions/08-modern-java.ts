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
];

export default questions;
