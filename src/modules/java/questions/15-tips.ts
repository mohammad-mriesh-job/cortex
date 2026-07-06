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
  {
    id: 'tips-bigdecimal-equals',
    question: 'Why is new BigDecimal("1.0").equals(new BigDecimal("1.00")) false?',
    difficulty: 'Medium',
    category: 'Tricky Java',
    tags: ['bigdecimal', 'equals', 'precision', 'tricky-output'],
    answer: `Because \`BigDecimal.equals\` compares **value *and* scale**, and \`"1.0"\` has scale 1 while \`"1.00"\` has scale 2.

\`\`\`java
new BigDecimal("1.0").equals(new BigDecimal("1.00"));    // false  (scales differ)
new BigDecimal("1.0").compareTo(new BigDecimal("1.00")); // 0      (numerically equal)
\`\`\`

For **numeric** equality use \`compareTo(...) == 0\`, not \`equals\`. Also avoid the \`double\` constructor: \`new BigDecimal(0.1)\` captures the full binary error (\`0.1000000000000000055...\`). Always build from a **String** — \`new BigDecimal("0.1")\` — or \`BigDecimal.valueOf(0.1)\`.

:::gotcha
This also breaks \`HashSet<BigDecimal>\` and \`BigDecimal\` map keys: \`1.0\` and \`1.00\` are *different* keys because \`hashCode\` includes scale. Normalize with \`stripTrailingZeros()\` first — but note it can produce scientific notation (\`1E+1\`), so apply it consistently.
:::`,
  },
  {
    id: 'tips-midpoint-overflow',
    question: 'What is the classic bug in int mid = (low + high) / 2; inside a binary search?',
    difficulty: 'Medium',
    category: 'Tricky Java',
    tags: ['overflow', 'binary-search', 'arithmetic', 'tricky-output'],
    answer: `When \`low + high\` exceeds \`Integer.MAX_VALUE\` it **overflows to a negative int**, so \`mid\` becomes negative → \`ArrayIndexOutOfBoundsException\` or a wrong result. This exact bug lived in \`java.util.Arrays.binarySearch\` for nearly a decade.

\`\`\`java
int mid = (low + high) / 2;         // overflows when low + high > Integer.MAX_VALUE
int mid = low + (high - low) / 2;   // safe
int mid = (low + high) >>> 1;       // also safe
\`\`\`

\`>>> 1\` works because even after the sum overflows, its 32-bit pattern is still the correct sum modulo 2^32; the **unsigned** shift divides by two without sign-extending the stray high bit.

:::senior
It's the same silent-\`int\`-overflow class as summing large arrays. Where correctness is critical, \`Math.addExact(low, high)\` **throws** \`ArithmeticException\` instead of wrapping — turning a lurking data bug into a loud, immediate failure.
:::`,
  },
  {
    id: 'tips-ternary-autobox-npe',
    question: 'Why can Integer x = flag ? map.get(key) : 0; throw a NullPointerException?',
    difficulty: 'Hard',
    category: 'Tricky Java',
    tags: ['autoboxing', 'ternary', 'npe', 'tricky-output'],
    answer: `Because one branch of the conditional operator is the primitive \`int\` \`0\` and the other is \`Integer\`. Under **binary numeric promotion** (JLS §15.25) the whole expression's type becomes \`int\`, so Java **unboxes** \`map.get(key)\` — and if it is \`null\`, that's \`null.intValue()\` → NPE.

\`\`\`java
Integer x = flag ? map.get(key) : 0;   // expression type is int -> unboxes map.get(key)
\`\`\`

The trap hides because the assignment *target* is \`Integer\` (a reference type), so the line looks null-safe — but the unboxing happens *before* the result is re-boxed into \`x\`.

:::gotcha
Fix by keeping both branches the same reference type: \`flag ? map.get(key) : Integer.valueOf(0)\`, or use a plain \`if\`. Any time you mix \`int\` and \`Integer\` across a ternary, the primitive branch forces the other to unbox.
:::`,
  },
  {
    id: 'tips-string-concat-order',
    question: 'What do System.out.println(1 + 2 + "=" + 1 + 2); and "b" + \'a\' + 1 vs 1 + \'a\' + "b" print?',
    difficulty: 'Easy',
    category: 'Tricky Java',
    tags: ['strings', 'operators', 'char-arithmetic', 'tricky-output'],
    answer: `\`+\` is **left-associative**, evaluated left to right. Before any \`String\` appears, numeric operands add arithmetically; once a \`String\` is on the left, everything after becomes concatenation.

\`\`\`java
System.out.println(1 + 2 + "=" + 1 + 2);  // 3=12
System.out.println("b" + 'a' + 1);        // ba1
System.out.println(1 + 'a' + "b");        // 98b
\`\`\`

- \`1 + 2\` = \`3\` (ints), then \`+ "="\` → \`"3="\`, then \`+ 1\` → \`"3=1"\`, then \`+ 2\` → \`"3=12"\`.
- In \`1 + 'a'\`, the \`char\` promotes to \`int\` (\`97\`), giving \`98\`, then \`+ "b"\` → \`"98b"\`.
- In \`"b" + 'a'\`, the left operand is already a \`String\`, so \`'a'\` is appended as a character → \`"ba"\`, then \`+ 1\` → \`"ba1"\`.

:::tip
To force concatenation from the start, put the \`String\` first or seed with \`""\`: \`"" + 1 + 2\` → \`"12"\`.
:::`,
  },
  {
    id: 'tips-system-exit-finally',
    question: 'Does a finally block run if the try block calls System.exit(0)?',
    difficulty: 'Medium',
    category: 'Tricky Java',
    tags: ['finally', 'system-exit', 'control-flow', 'tricky-output'],
    answer: `**No.** \`System.exit()\` starts JVM shutdown immediately, so the pending \`finally\` never runs — essentially the only everyday case where \`finally\` is skipped.

\`\`\`java
try {
    System.exit(0);
} finally {
    System.out.println("never printed");
}
\`\`\`

Normal \`return\`, \`throw\`, and \`break\` all still execute \`finally\`. Only **JVM termination** skips it: \`System.exit\`, \`Runtime.halt\` (which also skips shutdown hooks), a hard crash, or the JVM exiting because only daemon threads remain.

:::gotcha
For cleanup that *must* run at shutdown, register \`Runtime.getRuntime().addShutdownHook(...)\`. \`System.exit\` runs shutdown hooks before halting, so hooks fire where \`finally\` would not — but \`Runtime.halt()\` skips even those.
:::`,
  },
  {
    id: 'tips-division-by-zero',
    question: 'What is the difference between 1 / 0 and 1.0 / 0.0 in Java?',
    difficulty: 'Easy',
    category: 'Tricky Java',
    tags: ['division', 'floating-point', 'exceptions', 'tricky-output'],
    answer: `**Integer** division by zero throws; **floating-point** division by zero does not — it follows IEEE-754.

\`\`\`java
int a = 1 / 0;          // ArithmeticException: / by zero
double b = 1.0 / 0.0;   //  Infinity
double c = -1.0 / 0.0;  // -Infinity
double d = 0.0 / 0.0;   //  NaN
\`\`\`

So the two number families fail completely differently: integer \`/\` (and \`%\`) by zero is a thrown exception that stops you at the offending line, while floating \`/\` by zero produces \`Infinity\` or \`NaN\` and keeps running.

:::gotcha
\`%\` follows the same split: \`5 % 0\` throws, but \`5.0 % 0.0\` is \`NaN\`. And \`NaN\` then **silently poisons** everything downstream — any arithmetic involving \`NaN\` yields \`NaN\`, and every comparison with it is \`false\` — so a bug surfaces far from its cause instead of failing loudly.
:::`,
  },
  {
    id: 'tips-compound-assignment-cast',
    question: 'Why does byte b = 10; b += 5; compile, but b = b + 5; does not?',
    difficulty: 'Easy',
    category: 'Tricky Java',
    tags: ['operators', 'casting', 'byte', 'tricky-output'],
    answer: `Compound assignment operators (\`+=\`, \`-=\`, …) contain an **implicit narrowing cast** back to the variable's type. \`b + 5\` promotes \`b\` to \`int\`, and an \`int\` won't assign to a \`byte\` without an explicit cast — but \`b += 5\` compiles as \`b = (byte)(b + 5)\`.

\`\`\`java
byte b = 10;
b = b + 5;   // does NOT compile: int result can't assign to byte
b += 5;      // compiles: hidden (byte) cast
\`\`\`

:::gotcha
That hidden cast can silently **overflow**. \`byte b = 100; b += 100;\` compiles and yields \`-56\` (200 wrapped into a signed byte) with no warning. The compound form is convenient, but it will quietly truncate where the expanded form would have forced you to think.
:::`,
  },
  {
    id: 'tips-list-remove-overload',
    question: 'On a List<Integer>, how do list.remove(1) and list.remove(Integer.valueOf(1)) differ?',
    difficulty: 'Medium',
    category: 'Tricky Java',
    tags: ['collections', 'overloading', 'autoboxing', 'tricky-output'],
    answer: `\`List\` has two \`remove\` overloads: \`remove(int index)\` removes by **position**, \`remove(Object o)\` removes by **value**. A primitive \`int\` argument resolves to the *index* overload.

\`\`\`java
List<Integer> nums = new ArrayList<>(List.of(10, 20, 30));
nums.remove(1);                    // remove(int) -> deletes index 1, the value 20
nums.remove(Integer.valueOf(1));   // remove(Object) -> deletes the value 1 (none here)
\`\`\`

Overload resolution prefers the exact primitive match over boxing, so \`remove(1)\` never boxes to \`Integer\`.

:::gotcha
This bites when deleting values in a loop: \`for (int v : toRemove) list.remove(v);\` removes by *index* and can throw \`IndexOutOfBoundsException\` or delete the wrong elements. Box explicitly — \`list.remove(Integer.valueOf(v))\` — or use \`removeAll\` / \`removeIf\`.
:::`,
  },
  {
    id: 'tips-array-tostring',
    question: 'Why does System.out.println(new int[]{1, 2, 3}); print something like [I@1b6d3586?',
    difficulty: 'Easy',
    category: 'Tricky Java',
    tags: ['arrays', 'tostring', 'tricky-output'],
    answer: `Arrays don't override \`Object.toString()\`, so you get the default: the type descriptor + \`@\` + the hex identity hash. \`[I\` means "array of \`int\`".

\`\`\`java
int[] a = {1, 2, 3};
System.out.println(a);                       // [I@1b6d3586
System.out.println(Arrays.toString(a));      // [1, 2, 3]
int[][] m = {{1, 2}, {3, 4}};
System.out.println(Arrays.deepToString(m));  // [[1, 2], [3, 4]]
\`\`\`

Use \`Arrays.toString\` for one-dimensional arrays and \`Arrays.deepToString\` for nested ones.

:::gotcha
\`char[]\` is the odd one out: \`System.out.println(charArray)\` and \`String.valueOf(charArray)\` hit a special overload that prints the **characters** (\`abc\`), while \`"" + charArray\` still prints the \`[C@...\` garbage. Concatenation never uses that overload.
:::`,
  },
  {
    id: 'tips-null-string-concat',
    question: 'Does String s = null; System.out.println("value: " + s); throw a NullPointerException?',
    difficulty: 'Easy',
    category: 'Tricky Java',
    tags: ['strings', 'null', 'concatenation', 'tricky-output'],
    answer: `**No** — it prints \`value: null\`. String concatenation converts a \`null\` reference to the literal text \`"null"\` (via \`String.valueOf\`); it never dereferences it.

\`\`\`java
String s = null;
System.out.println("value: " + s);  // value: null
s += "!";                           // s becomes "null!"
System.out.println(s == null);      // false
\`\`\`

Concatenation is null-safe; a *method call* is not — \`s.length()\` on that \`null\` throws immediately.

:::gotcha
The safety is specific to \`+\` and the \`String\`/\`Object\` \`println\` overloads. \`System.out.println((char[]) null)\` **throws** NPE, because the \`char[]\` overload reads \`array.length\` and dereferences it — only the string path substitutes \`"null"\`.
:::`,
  },
];

export default questions;
