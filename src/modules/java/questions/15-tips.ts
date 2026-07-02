import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'tips-integer-cache',
    question:
      'What does this print: Integer a=127, b=127, c=128, d=128; then System.out.println(a==b) and System.out.println(c==d)?',
    difficulty: 'Medium',
    category: 'Tricky Java',
    tags: ['autoboxing', 'integer-cache', 'tricky-output'],
    answer: `\`true\` then \`false\`.

\`\`\`java
Integer a = 127, b = 127;
Integer c = 128, d = 128;
System.out.println(a == b);   // true
System.out.println(c == d);   // false
\`\`\`

Autoboxing calls \`Integer.valueOf(int)\`, which **caches** boxed values from \`-128\` to \`127\`. So \`a\` and \`b\` are the *same* cached object, but \`c\` and \`d\` are two distinct objects. \`==\` compares references.

:::gotcha
The cache upper bound is configurable (\`-XX:AutoBoxCacheMax\`), so \`==\` on boxed numbers can pass in tests and fail in production. Always use \`.equals()\` or compare unboxed primitives.
:::`,
  },
  {
    id: 'tips-finally-return',
    question:
      'A method has return 1 in its try block and return 2 in its finally block. What does it return, and why?',
    difficulty: 'Medium',
    category: 'Tricky Java',
    tags: ['finally', 'control-flow', 'tricky-output'],
    answer: `It returns **2**.

\`\`\`java
static int f() {
    try {
        return 1;
    } finally {
        return 2;   // overrides the try's return
    }
}
\`\`\`

\`finally\` runs *after* the \`try\`/\`catch\` decides its outcome. A \`return\` (or \`throw\`/\`break\`) in \`finally\` replaces that outcome entirely — it can even **swallow a pending exception**.

:::senior
Never put control flow in \`finally\`. Reserve it strictly for cleanup, and prefer \`try\`-with-resources so you do not write \`finally\` blocks for closing at all.
:::`,
  },
  {
    id: 'tips-string-interning',
    question:
      'Predict the three outputs when comparing a string literal, a new String("hi"), and intern() using ==.',
    difficulty: 'Medium',
    category: 'Tricky Java',
    tags: ['strings', 'interning', 'string-pool', 'tricky-output'],
    answer: `\`true\`, \`false\`, \`true\`.

\`\`\`java
String a = "hi";
String b = "hi";
String c = new String("hi");
System.out.println(a == b);          // true   same pooled literal
System.out.println(a == c);          // false  new heap object
System.out.println(a == c.intern()); // true   intern() returns the pooled ref
\`\`\`

String literals are interned in the constant pool, so identical literals share one object. \`new String(...)\` always allocates a fresh object; \`intern()\` returns the canonical pooled instance. For content equality always use \`.equals()\`.`,
  },
  {
    id: 'tips-autobox-npe',
    question:
      'Why can int n = map.get(key); throw a NullPointerException even though no line explicitly dereferences a variable?',
    difficulty: 'Easy',
    category: 'Tricky Java',
    tags: ['autoboxing', 'npe', 'collections', 'tricky-output'],
    answer: `Because \`get\` returns \`Integer\`, and a missing key returns \`null\`. Assigning to an \`int\` triggers **auto-unboxing**, which calls \`null.intValue()\` and throws.

\`\`\`java
Map<String, Integer> counts = new HashMap<>();
int n = counts.get("missing");   // returns null -> unbox -> NullPointerException
\`\`\`

Fixes: use \`counts.getOrDefault("missing", 0)\`, or keep the result as an \`Integer\` and null-check before unboxing.`,
  },
  {
    id: 'tips-float-precision',
    question: 'Is 0.1 + 0.2 == 0.3 true in Java? Explain.',
    difficulty: 'Easy',
    category: 'Tricky Java',
    tags: ['floating-point', 'precision', 'tricky-output'],
    answer: `**No** — it is \`false\`.

\`\`\`java
System.out.println(0.1 + 0.2);        // 0.30000000000000004
System.out.println(0.1 + 0.2 == 0.3); // false
\`\`\`

\`double\`/\`float\` are binary IEEE-754, and \`0.1\`, \`0.2\`, \`0.3\` have no exact binary representation. Never use \`==\` on floating-point or \`double\` for money. Use \`BigDecimal\` (with the **String** constructor, \`new BigDecimal("0.1")\`) or compare within a small epsilon.`,
  },
  {
    id: 'tips-long-overflow',
    question: 'What value does long ms = 1000 * 60 * 60 * 24 * 365; actually hold?',
    difficulty: 'Medium',
    category: 'Tricky Java',
    tags: ['overflow', 'long', 'arithmetic', 'tricky-output'],
    answer: `Not \`31_536_000_000\` — it holds **1471228928** (a wrong, but deceptively positive, value).

\`\`\`java
long ms = 1000 * 60 * 60 * 24 * 365;   // 1471228928
long ok = 1000L * 60 * 60 * 24 * 365;  // 31536000000  correct
\`\`\`

All the literals are \`int\`, so the whole product is computed in \`int\` and **overflows silently** *before* being widened to \`long\`. Make one operand \`long\` (\`1000L\`), or use \`Math.multiplyExact\`, which throws \`ArithmeticException\` on overflow.

:::gotcha
\`int\` arithmetic wraps modulo 2^32 with no warning. The result is sometimes negative, sometimes positive — which is what makes it so easy to miss.
:::`,
  },
  {
    id: 'tips-array-store',
    question:
      'Does Object[] a = new String[2]; a[0] = 42; compile? What happens at runtime?',
    difficulty: 'Hard',
    category: 'Tricky Java',
    tags: ['arrays', 'covariance', 'generics', 'tricky-output'],
    answer: `It **compiles** but throws **\`ArrayStoreException\`** at runtime.

\`\`\`java
Object[] a = new String[2];   // legal: arrays are covariant
a[0] = "ok";                  // fine
a[1] = 42;                    // compiles, throws ArrayStoreException
\`\`\`

Java arrays are **covariant** (\`String[]\` *is an* \`Object[]\`), so the assignment type-checks, but the JVM verifies the actual element type on every store.

:::senior
Generics are deliberately **invariant** to catch exactly this at compile time: \`List<Object> l = new ArrayList<String>();\` does not compile. That difference between array covariance and generic invariance is a favorite interview follow-up.
:::`,
  },
  {
    id: 'tips-rapid-fire',
    question:
      'Rapid fire — predict each: 0.0 == -0.0, Double.NaN == Double.NaN, \'a\' + \'b\', 10 / 3 * 3, 5 % -3, Math.abs(Integer.MIN_VALUE), and (int i = 1; i = i++).',
    difficulty: 'Medium',
    category: 'Tricky Java',
    tags: ['rapid-fire', 'tricky-output', 'operators'],
    answer: `| Snippet | Result | Why |
|---|---|---|
| \`0.0 == -0.0\` | \`true\` | IEEE-754: positive and negative zero are equal |
| \`Double.NaN == Double.NaN\` | \`false\` | \`NaN\` is unequal to everything, even itself |
| \`'a' + 'b'\` | \`195\` | \`char\` promotes to \`int\` in arithmetic |
| \`10 / 3 * 3\` | \`9\` | integer division truncates first |
| \`5 % -3\` | \`2\` | \`%\` sign follows the dividend |
| \`Math.abs(Integer.MIN_VALUE)\` | \`-2147483648\` | \`abs\` overflows — no positive counterpart |
| \`int i = 1; i = i++;\` | \`i == 1\` | \`i++\` latches the old value, then the assignment writes it back |

:::tip
To test for \`NaN\` use \`Double.isNaN(x)\`, and to detect a negative zero use \`Double.compare(x, 0.0) < 0\` — never \`==\`.
:::`,
  },
];

export default questions;
