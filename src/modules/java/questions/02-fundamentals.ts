import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'fund-integer-division',
    question: 'What does 7 / 2 evaluate to in Java, and how do you get 3.5?',
    difficulty: 'Easy',
    category: 'Core Java',
    tags: ['operators', 'arithmetic'],
    answer: `\`7 / 2\` is **3**. When both operands are integers, \`/\` performs **integer division** and truncates the fractional part toward zero — it does not round.

To get \`3.5\`, make at least one operand a floating-point value so the whole expression is promoted to \`double\`:

\`\`\`java
7 / 2          // 3   (int division)
7 / 2.0        // 3.5 (double)
(double) 7 / 2 // 3.5
\`\`\`

:::gotcha
\`double d = 7 / 2;\` is still \`3.0\` — the division happens in \`int\` *before* the widening to \`double\`.
:::`,
  },
  {
    id: 'fund-short-circuit',
    question: 'What is short-circuit evaluation, and how do && and || differ from & and |?',
    difficulty: 'Easy',
    category: 'Core Java',
    tags: ['operators', 'logical', 'control-flow'],
    answer: `\`&&\` and \`||\` **short-circuit**: they stop evaluating as soon as the result is certain.

- \`&&\` stops at the first \`false\` (the rest can't make it true).
- \`||\` stops at the first \`true\` (the rest can't make it false).

So the right-hand side may never run — which lets you guard safely:

\`\`\`java
if (user != null && user.isActive()) { ... } // isActive() runs only if user != null
\`\`\`

\`&\` and \`|\` are the **non-short-circuiting** boolean operators (and the bitwise operators on integers): they always evaluate *both* sides. Using \`&\` above would throw \`NullPointerException\` when \`user\` is null.`,
  },
  {
    id: 'fund-shift-operators',
    question: 'What is the difference between >> and >>> in Java?',
    difficulty: 'Medium',
    category: 'Core Java',
    tags: ['operators', 'bitwise', 'shift'],
    answer: `Both shift bits to the right; they differ in what fills the vacated high bits.

- \`>>\` is the **signed** (arithmetic) right shift: it copies the **sign bit**, so negative numbers stay negative.
- \`>>>\` is the **unsigned** (logical) right shift: it always fills with **zeros**.

\`\`\`java
-8 >> 1;   // -4  (sign bit preserved)
-8 >>> 28; // 15  (zero-filled — treats the bits as unsigned)
8  >> 1;   // 4   (same as >>> for non-negative values)
\`\`\`

For non-negative numbers the two are identical. There is no \`<<<\` — left shift never needs to distinguish.

:::senior
Shift counts are taken modulo the width: for \`int\`, only the low 5 bits of the count are used (\`x << 33\` == \`x << 1\`); for \`long\`, the low 6 bits.
:::`,
  },
  {
    id: 'fund-switch-expression',
    question: 'How does a modern switch expression differ from a classic switch statement?',
    difficulty: 'Medium',
    category: 'Core Java',
    tags: ['control-flow', 'switch'],
    answer: `The classic **switch statement** uses \`case x:\` labels and **falls through** to the next case unless you write \`break\`. Forgetting \`break\` is a classic bug.

The **switch expression** (standard since Java 14) uses arrow (\`->\`) labels and:

1. has **no fall-through**,
2. **produces a value** you can assign,
3. supports **multiple labels** per arm (\`case 6, 7 ->\`),
4. is checked for **exhaustiveness** (especially over enums).

\`\`\`java
String type = switch (day) {
    case 6, 7 -> "weekend";
    default   -> "weekday";
};
\`\`\`

When an arm needs several statements, use a block and \`yield\` to return its value.

:::senior
For an arrow switch over an enum, cover every constant and you can drop \`default\`. Add a new constant later and the compiler flags every switch you forgot to update.
:::`,
  },
  {
    id: 'fund-string-equals-vs',
    question: 'Why can == sometimes appear to work on Strings but still be the wrong choice?',
    difficulty: 'Medium',
    category: 'Core Java',
    tags: ['strings', 'equality', 'string-pool'],
    answer: `\`==\` compares **references** (same object?), while \`.equals()\` compares **contents** (same characters?).

String *literals* are **interned** into a shared pool, so two identical literals are the same object and \`==\` returns \`true\` — which lulls beginners into using it. The moment a string comes from \`new\`, user input, a file, or concatenation at runtime, it's a distinct object and \`==\` returns \`false\`.

\`\`\`java
String a = "hi", b = "hi";
a == b;                       // true  — both pooled
String c = new String("hi");
a == c;                       // false — c is a separate object
a.equals(c);                  // true  — always correct
\`\`\`

:::gotcha
Prefer \`"literal".equals(value)\` so a \`null\` \`value\` yields \`false\` instead of throwing \`NullPointerException\`.
:::`,
  },
  {
    id: 'fund-string-concat-loop',
    question: 'Why prefer StringBuilder over + when concatenating strings in a loop?',
    difficulty: 'Medium',
    category: 'Core Java',
    tags: ['strings', 'stringbuilder', 'performance'],
    answer: `Strings are **immutable**, so each \`+\` creates a brand-new string and copies everything accumulated so far. In a loop that's **O(n²)** time and a flood of garbage objects.

\`StringBuilder\` keeps one growable buffer and mutates it in place — **O(n)**:

\`\`\`java
StringBuilder sb = new StringBuilder();
for (String s : items) sb.append(s).append(',');
String csv = sb.toString();
\`\`\`

:::tip
A single \`a + b\` is fine — the compiler optimizes it. For a fixed set of pieces, \`String.join\` or plain \`+\` reads best; reach for \`StringBuilder\` specifically for loops and conditional assembly. \`StringBuilder\` is not thread-safe (use \`StringBuffer\` only if truly shared across threads).
:::`,
  },
  {
    id: 'fund-array-vs-arraylist',
    question: 'What are the key differences between an array and an ArrayList?',
    difficulty: 'Easy',
    category: 'Core Java',
    tags: ['arrays', 'collections', 'arraylist'],
    answer: `| | Array | \`ArrayList\` |
|--|-------|-------------|
| Size | fixed at creation | grows / shrinks |
| Primitives | yes (\`int[]\`) | no — boxed (\`Integer\`) |
| Size query | \`length\` field | \`size()\` method |
| Access | \`a[i]\` | \`list.get(i)\` |
| API | minimal | rich (add, remove, streams) |

\`\`\`java
int[] a = new int[3];                 // fixed
List<Integer> list = new ArrayList<>(); // dynamic
list.add(1);
\`\`\`

:::senior
Prefer \`List\`/\`ArrayList\` for most application code. Use raw arrays for primitive storage without boxing overhead, fixed buffers in hot code, or APIs that require them (\`String[] args\`, \`byte[]\` I/O).
:::`,
  },
  {
    id: 'fund-array-pass-by-value',
    question: 'If Java is pass-by-value, why can a method change the contents of an array I passed in?',
    difficulty: 'Medium',
    category: 'Core Java',
    tags: ['methods', 'pass-by-value', 'arrays'],
    answer: `Java copies the **argument value**. For an array (an object), that value is the **reference**, not the array itself. The method's parameter is a *copy of the reference* that points at the **same** array on the heap — so mutating elements is visible to the caller.

\`\`\`java
static void f(int[] arr) {
    arr[0] = 99;          // mutates the shared array — caller sees this
    arr = new int[]{0};   // repoints the local copy only — caller does NOT
}
\`\`\`

What you **cannot** do is make the caller's variable point at a different array — reassigning \`arr\` changes only the local copy. That's the line between pass-by-value (Java) and pass-by-reference.`,
  },
  {
    id: 'fund-integer-cache',
    question: 'Why does == return true for Integer 100 == 100 but false for 200 == 200?',
    difficulty: 'Hard',
    category: 'Core Java',
    tags: ['autoboxing', 'integer-cache', 'equality'],
    answer: `Autoboxing routes through \`Integer.valueOf\`, which **caches** the wrapper objects for values **−128 to 127** and returns the same instance for them. \`==\` compares references:

\`\`\`java
Integer a = 100, b = 100;
a == b;        // true  — both come from the cache (same object)
Integer c = 200, d = 200;
c == d;        // false — outside the cache, two new objects
c.equals(d);   // true  — value comparison is always correct
\`\`\`

The takeaway: **never use \`==\` on wrapper objects.** Use \`.equals()\`, or unbox to primitives first.

:::gotcha
Unboxing a \`null\` wrapper throws \`NullPointerException\`: \`int n = (Integer) null;\` blows up at runtime.
:::`,
  },
  {
    id: 'fund-widening-narrowing',
    question: 'What is the difference between widening and narrowing conversions?',
    difficulty: 'Medium',
    category: 'Core Java',
    tags: ['casting', 'conversion', 'numeric'],
    answer: `- **Widening** goes to a type that holds every value of the source (\`int → long → double\`). It's **implicit** and lossless.
- **Narrowing** goes to a smaller type (\`double → int\`, \`int → byte\`). It can lose data, so it requires an **explicit cast** \`(type)\`.

\`\`\`java
double d = 100;       // widening, implicit
int n = (int) 3.99;   // narrowing → 3 (truncates toward zero, no rounding)
byte b = (byte) 300;  // narrowing → 44 (keeps low bits; overflows)
\`\`\`

:::gotcha
Casting \`double\` to \`int\` truncates, it does not round — use \`Math.round()\` for rounding. And integer arithmetic overflows silently (\`Integer.MAX_VALUE + 1\` wraps to \`MIN_VALUE\`); use \`Math.addExact\` when that would be a bug.
:::`,
  },
];

export default questions;
