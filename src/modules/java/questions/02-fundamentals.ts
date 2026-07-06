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
  {
    id: 'fund-primitive-types',
    question: 'What are the eight primitive types in Java, and what are their default values?',
    difficulty: 'Easy',
    category: 'Core Java',
    tags: ['primitives', 'types', 'fundamentals'],
    answer: `Java has exactly **eight primitives** — values stored directly, not objects:

| Type | Size | Default | Range / note |
|------|------|---------|--------------|
| \`byte\` | 8 bit | \`0\` | −128 … 127 |
| \`short\` | 16 bit | \`0\` | −32,768 … 32,767 |
| \`int\` | 32 bit | \`0\` | ~±2.1 billion — the default integer type |
| \`long\` | 64 bit | \`0L\` | literals need the \`L\` suffix |
| \`float\` | 32 bit | \`0.0f\` | needs \`f\` suffix; rarely used |
| \`double\` | 64 bit | \`0.0\` | the default floating-point type |
| \`char\` | 16 bit | \`'\\u0000'\` | **unsigned** UTF-16 code unit |
| \`boolean\` | JVM-specific | \`false\` | size not defined by the spec |

Defaults apply only to **fields** (and array elements).

:::gotcha
**Local variables have no default value.** Reading an uninitialised local is a *compile-time error* ("variable might not have been initialized") — a favourite quick check in interviews.
:::`,
  },
  {
    id: 'fund-autoboxing-basics',
    question: 'What are autoboxing and unboxing, and why does Java need them?',
    difficulty: 'Easy',
    category: 'Core Java',
    tags: ['autoboxing', 'wrappers', 'generics'],
    answer: `**Autoboxing** is the compiler automatically converting a primitive to its wrapper (\`int\` → \`Integer\` via \`Integer.valueOf\`); **unboxing** is the reverse (\`Integer\` → \`int\` via \`intValue()\`).

They exist because **generics and collections work only with reference types** — there is no \`List<int>\`. Boxing lets primitives flow into that object-shaped world without manual conversion:

\`\`\`java
List<Integer> list = new ArrayList<>();
list.add(5);         // autobox: Integer.valueOf(5)
int n = list.get(0); // unbox:  .intValue()
\`\`\`

The costs to name in an interview:

1. **Allocation** — each box is (potentially) a heap object; a boxed loop counter creates garbage.
2. **\`NullPointerException\`** — unboxing a \`null\` wrapper throws.
3. **\`==\` surprises** — reference comparison plus the −128..127 cache.

:::tip
In hot code, prefer primitives and the primitive-specialised APIs (\`IntStream\`, \`ToIntFunction\`, \`int[]\`) to avoid boxing churn.
:::`,
  },
  {
    id: 'fund-string-immutability',
    question: 'Why is String immutable in Java?',
    difficulty: 'Medium',
    category: 'Core Java',
    tags: ['strings', 'immutability', 'string-pool'],
    answer: `A \`String\`'s character data can never change after construction — methods like \`toUpperCase()\` return a **new** string. Four reasons drive this design:

1. **The string pool** — identical literals share one instance. Sharing is only safe if no one can mutate the shared object underneath everyone else.
2. **Security** — strings carry file paths, URLs, class names, and SQL. If a string could change *after* validation but *before* use, every security check could be bypassed.
3. **Hash caching** — \`String\` caches its \`hashCode\` in a field; safe only because content is frozen. This makes strings fast, reliable \`HashMap\` keys.
4. **Thread safety for free** — immutable objects can be shared across threads with no synchronization.

\`\`\`java
String s = "hello";
s.concat(" world");     // result discarded!
s = s.concat(" world"); // reassign — new object, s now points to it
\`\`\`

:::gotcha
Immutability is about the **object**, not the variable — \`s = "other"\` is fine; it repoints the reference. And \`final String s\` freezes the *reference*, which is a separate concept.
:::`,
  },
  {
    id: 'fund-string-builder-buffer',
    question: 'Compare String, StringBuilder, and StringBuffer.',
    difficulty: 'Easy',
    category: 'Core Java',
    tags: ['strings', 'stringbuilder', 'stringbuffer'],
    answer: `| | \`String\` | \`StringBuilder\` | \`StringBuffer\` |
|--|-----------|-----------------|----------------|
| Mutable | no | **yes** | **yes** |
| Thread-safe | yes (immutable) | no | yes (\`synchronized\`) |
| Speed | new object per change | fastest | slower (lock overhead) |
| Since | 1.0 | Java 5 | 1.0 (legacy) |

- **\`String\`** — the default for values that don't change; safe to share and pool.
- **\`StringBuilder\`** — mutable buffer for assembling text in loops or multi-step logic; not thread-safe, which is fine because builders are almost always method-local.
- **\`StringBuffer\`** — the pre-Java-5 synchronized version. Effectively legacy: synchronizing individual \`append\` calls rarely gives the atomicity you actually need, so shared building is better done with higher-level coordination.

:::senior
Since Java 9, plain \`a + b\` compiles to an \`invokedynamic\` call (JEP 280) that the JVM optimises well — hand-rolled \`StringBuilder\` only clearly wins for **loops** and conditional assembly.
:::`,
  },
  {
    id: 'fund-final-finally-finalize',
    question: 'What is the difference between final, finally, and finalize?',
    difficulty: 'Easy',
    category: 'Core Java',
    tags: ['final', 'finally', 'finalize', 'keywords'],
    answer: `Three unrelated things that only sound alike:

- **\`final\`** — a *modifier*: a \`final\` **variable** can't be reassigned (for references: the reference is fixed, the object may still mutate); a \`final\` **method** can't be overridden; a \`final\` **class** can't be extended (\`String\`, \`Integer\`).
- **\`finally\`** — a *block* after \`try\`/\`catch\` that runs whether or not an exception was thrown; used for cleanup (largely replaced by try-with-resources).
- **\`finalize()\`** — a *method* on \`Object\` the GC once called before reclaiming an object.

\`\`\`java
final int max = 10;                     // constant
try { risky(); } finally { cleanup(); } // always runs
\`\`\`

:::gotcha
\`finalize()\` is **deprecated for removal** (JEP 421): it's unpredictable (may never run), slow, resurrection-prone, and a security hazard. Use **try-with-resources** for deterministic cleanup and \`java.lang.ref.Cleaner\` as a last-resort safety net.
:::`,
  },
  {
    id: 'fund-static-init-order',
    question: 'In what order do static blocks, instance initializers, and constructors run?',
    difficulty: 'Medium',
    category: 'Core Java',
    tags: ['static', 'initialization', 'constructors'],
    answer: `Two separate phases:

1. **Class initialization** — runs **once**, on first active use of the class: static field initializers and \`static {}\` blocks execute in **textual order** (superclass first).
2. **Instance creation** — runs on **every** \`new\`: superclass constructor chain first, then this class's instance field initializers and \`{}\` instance blocks in textual order, then the constructor body.

\`\`\`java
class Demo {
    static { System.out.println("1 static block"); }
    { System.out.println("2 instance block"); }
    Demo() { System.out.println("3 constructor"); }
}
new Demo();  // prints 1, 2, 3
new Demo();  // prints 2, 3   (static ran only once)
\`\`\`

Full order for \`new Child()\`: parent statics → child statics → parent instance init + constructor → child instance init + constructor.

:::gotcha
Reading a \`static final\` **compile-time constant** does *not* trigger class initialization — the compiler inlines the value into the caller. A classic source of "why didn't my static block run?" confusion.
:::`,
  },
  {
    id: 'fund-shallow-deep-copy',
    question: 'What is the difference between a shallow copy and a deep copy?',
    difficulty: 'Medium',
    category: 'Core Java',
    tags: ['cloning', 'copy', 'objects'],
    answer: `- A **shallow copy** duplicates the object's fields as-is — reference fields still point at the **same** nested objects, so mutations through one copy show through the other.
- A **deep copy** recursively duplicates everything reachable, producing a fully independent object graph.

\`\`\`java
var team = new Team(new ArrayList<>(List.of("Ann")));
var copy = new Team(team.members);         // shallow — shares the list
copy.members.add("Bob");
team.members.size();                       // 2 — leaked through!

var deep = new Team(new ArrayList<>(team.members)); // independent list
\`\`\`

\`Object.clone()\` performs a **shallow** field-by-field copy — one reason it's considered broken (along with the \`Cloneable\` marker hack and skipping constructors).

:::senior
*Effective Java*: prefer a **copy constructor** or static factory (\`new ArrayList<>(other)\`, \`List.copyOf\`) over \`clone()\`. And the cheapest deep copy is not needing one — **immutable** objects (records, \`String\`) can be shared instead of copied.
:::`,
  },
  {
    id: 'fund-object-methods',
    question: 'Which methods does every Java class inherit from Object?',
    difficulty: 'Easy',
    category: 'Core Java',
    tags: ['object', 'methods', 'fundamentals'],
    answer: `Every class descends from \`java.lang.Object\` and inherits:

| Method | Purpose |
|--------|---------|
| \`equals(Object)\` | logical equality (default: identity \`==\`) |
| \`hashCode()\` | hash for \`HashMap\`/\`HashSet\` — must agree with \`equals\` |
| \`toString()\` | textual form (default: \`ClassName@hexHash\`) |
| \`getClass()\` | the runtime \`Class\` object |
| \`clone()\` | shallow copy (\`protected\`, needs \`Cloneable\`) |
| \`finalize()\` | pre-GC hook — **deprecated for removal** |
| \`wait()\` / \`wait(t)\` / \`wait(t, n)\` | block on this object's monitor |
| \`notify()\` / \`notifyAll()\` | wake threads waiting on the monitor |

The ones you routinely **override**: \`equals\`, \`hashCode\`, \`toString\` (records generate all three).

:::note
\`wait\`/\`notify\` live on \`Object\` — not \`Thread\` — because **any object** can serve as a monitor/lock in Java; the wait-set belongs to the object whose lock you hold.
:::`,
  },
  {
    id: 'fund-enum-features',
    question: 'Can an enum have fields, constructors, and methods?',
    difficulty: 'Medium',
    category: 'Core Java',
    tags: ['enums', 'constructors', 'fundamentals'],
    answer: `Yes — a Java \`enum\` is a full class with a **fixed set of instances**. It can hold state, behaviour, and even per-constant implementations:

\`\`\`java
public enum Planet {
    EARTH(5.97e24), MARS(6.42e23);

    private final double mass;                 // field
    Planet(double mass) { this.mass = mass; }  // constructor — implicitly private
    public double mass() { return mass; }      // method
}
\`\`\`

Key facts:

- Constructors are **implicitly private** — the constants are the only instances, created once during class init (thread-safe).
- Enums can **implement interfaces**, and constants can have **constant-specific bodies** (e.g. \`PLUS { int apply(...) {...} }\`) — a built-in strategy pattern.
- Free API: \`values()\`, \`valueOf(name)\`, \`name()\`, \`ordinal()\`; they work in \`switch\` with compile-time exhaustiveness checks.
- Use **\`EnumSet\`/\`EnumMap\`** for collections keyed by enums — bit-vector/array-backed and far faster than hash-based sets.

:::gotcha
Never persist or depend on \`ordinal()\` — inserting a constant renumbers everything (breaks DB rows and serialized data). Store \`name()\` or an explicit code field.
:::`,
  },
  {
    id: 'fund-varargs',
    question: 'How do varargs work, and what rules apply to them?',
    difficulty: 'Medium',
    category: 'Core Java',
    tags: ['varargs', 'methods', 'arrays'],
    answer: `\`type... name\` lets a method accept zero or more arguments. It's **syntactic sugar for an array**: the compiler packs the call-site arguments into a \`type[]\`.

\`\`\`java
static int sum(int... nums) {          // nums is an int[]
    int s = 0;
    for (int n : nums) s += n;
    return s;
}
sum();                 // OK — empty array
sum(1, 2, 3);          // compiler builds new int[]{1,2,3}
sum(new int[]{1, 2});  // passing an array directly also works
\`\`\`

Rules:

1. Only **one** varargs parameter per method, and it must be **last**.
2. In overload resolution, exact and widening matches **win over** varargs — varargs is the last resort.
3. Each non-array call allocates an array — avoid varargs on ultra-hot paths (the JDK adds \`List.of(e1)\`, \`of(e1, e2)\`... overloads for exactly this reason).

:::gotcha
\`sum(null)\` passes a null *array* (not one null element) for a single varargs candidate — and **generic** varargs (\`T...\`) trigger heap-pollution warnings, which is what \`@SafeVarargs\` addresses.
:::`,
  },
];

export default questions;
