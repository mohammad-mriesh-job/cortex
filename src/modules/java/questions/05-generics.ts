import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'gen-why-generics',
    question: 'What problem do generics solve?',
    difficulty: 'Easy',
    category: 'Generics',
    tags: ['generics', 'type-safety'],
    answer: `Before generics (pre-Java 5), collections held \`Object\`, so type mistakes surfaced at **runtime** and every read needed a cast:

\`\`\`java
List names = new ArrayList();
names.add(42);                    // compiles fine
String s = (String) names.get(0); // ClassCastException at runtime
\`\`\`

Generics move type checking to **compile time** and remove casts:

\`\`\`java
List<String> names = new ArrayList<>();
names.add(42);           // compile error — caught immediately
String s = names.get(0); // no cast
\`\`\`

Three benefits: **compile-time type safety**, **no casts**, and **self-documenting** APIs.`,
  },
  {
    id: 'gen-raw-types',
    question: 'What is a raw type and why should you avoid it?',
    difficulty: 'Easy',
    category: 'Generics',
    tags: ['generics', 'raw-types'],
    answer: `A **raw type** is a generic class used without its type argument, e.g. \`List\` instead of \`List<String>\`. It exists only for backward compatibility with pre-Java-5 code.

\`\`\`java
List raw = new ArrayList(); // raw — no type checking
raw.add("x");
raw.add(1);                 // allowed; compiler warns "unchecked"
\`\`\`

:::gotcha
A raw type switches off generics for the **whole** object. Round-tripping a \`List<String>\` through a raw \`List\` lets non-Strings slip in, bringing back the \`ClassCastException\` generics were meant to prevent. Treat every "unchecked" warning as a bug.
:::`,
  },
  {
    id: 'gen-invariance',
    question: 'Why is List<String> not a subtype of List<Object>?',
    difficulty: 'Medium',
    category: 'Generics',
    tags: ['generics', 'variance', 'invariance'],
    answer: `Generics are **invariant**: even though \`String\` is a subtype of \`Object\`, \`List<String>\` is **not** a subtype of \`List<Object>\`. This keeps the type system sound. If it were allowed:

\`\`\`java
List<String> strings = new ArrayList<>();
List<Object> objects = strings; // imagine this compiled...
objects.add(42);                // ...you just put an Integer into a List<String>
String s = strings.get(0);      // boom at runtime
\`\`\`

Arrays, by contrast, **are** covariant (\`String[]\` is an \`Object[]\`), which is exactly why array stores can throw \`ArrayStoreException\`. Generics avoid that by being invariant; **wildcards** (\`? extends\` / \`? super\`) reintroduce controlled flexibility when you need it.`,
  },
  {
    id: 'gen-pecs',
    question: 'What is the PECS rule and when do you apply it?',
    difficulty: 'Hard',
    category: 'Generics',
    tags: ['generics', 'wildcards', 'pecs'],
    answer: `**PECS = Producer Extends, Consumer Super.** It tells you which bounded wildcard to use on a parameter:

- A parameter you **read from** (a producer) should be \`? extends T\`.
- A parameter you **write to** (a consumer) should be \`? super T\`.
- A parameter you both read and write should be an exact \`T\`.

The JDK's \`Collections.copy\` is the canonical example:

\`\`\`java
static <T> void copy(List<? super T> dest,    // consumer
                     List<? extends T> src) {  // producer
    for (int i = 0; i < src.size(); i++)
        dest.set(i, src.get(i));
}
\`\`\`

This lets you copy a \`List<Integer>\` into a \`List<Number>\` — flexibility a plain \`List<T>\` on both sides would forbid.

:::tip
Wildcards belong in **parameter** types (to widen the inputs you accept), not in **return** types (which would push the awkward unknown type onto callers).
:::`,
  },
  {
    id: 'gen-extends-vs-super',
    question: 'What is the difference between ? extends T and ? super T?',
    difficulty: 'Medium',
    category: 'Generics',
    tags: ['generics', 'wildcards', 'bounds'],
    answer: `Both are bounded wildcards, but they enable opposite operations:

| Form | You can read | You can add | Role |
|------|--------------|-------------|------|
| \`List<? extends T>\` | elements as \`T\` | nothing (only \`null\`) | producer |
| \`List<? super T>\` | elements as \`Object\` | \`T\` and its subtypes | consumer |

\`\`\`java
List<? extends Number> nums = List.of(1, 2, 3);
Number n = nums.get(0);  // read OK
// nums.add(4);          // compile error — exact type unknown

List<? super Integer> sink = new ArrayList<Number>();
sink.add(1);             // add OK
Object o = sink.get(0);  // reads come back as Object
\`\`\`

You cannot add to a \`? extends\` list because its real element type is unknown (it might be \`List<Double>\`). You can add to a \`? super\` list because any \`Integer\` is valid for every supertype of \`Integer\`.`,
  },
  {
    id: 'gen-type-erasure',
    question: 'What is type erasure?',
    difficulty: 'Medium',
    category: 'Generics',
    tags: ['generics', 'type-erasure', 'jvm'],
    answer: `**Type erasure** is how Java implements generics: the compiler checks generic types, then **erases** them from the bytecode. Each type parameter is replaced by its **bound** (unbounded \`T\` becomes \`Object\`; \`T extends Number\` becomes \`Number\`), and casts are inserted on reads.

\`\`\`java
List<String>  a = new ArrayList<>();
List<Integer> b = new ArrayList<>();
a.getClass() == b.getClass(); // true — both are just ArrayList at runtime
\`\`\`

This keeps the JVM simple and lets generic code interoperate with pre-generics libraries. The trade-off is that **no generic type information exists at runtime**, which is why you can't do \`new T()\`, \`new T[]\`, or \`instanceof List<String>\`.

:::senior
To recover type polymorphism after erasure, the compiler emits synthetic **bridge methods** (e.g. a \`compareTo(Object)\` that delegates to your \`compareTo(Money)\`). When you truly need the runtime type, pass an explicit \`Class<T>\` token.
:::`,
  },
  {
    id: 'gen-erasure-limits',
    question: 'Name things you cannot do with a type parameter T, and why.',
    difficulty: 'Medium',
    category: 'Generics',
    tags: ['generics', 'type-erasure', 'limitations'],
    answer: `Because \`T\` does not exist at runtime, all of these are illegal:

| Illegal | Reason | Workaround |
|---------|--------|-----------|
| \`new T()\` | no constructor known after erasure | pass a \`Supplier<T>\` or \`Class<T>\` |
| \`new T[n]\` | cannot create an array of an erased type | \`(T[]) new Object[n]\` or \`Array.newInstance\` |
| \`x instanceof List<String>\` | runtime has no \`<String>\` | test \`instanceof List<?>\` |
| \`T.class\` | no class literal for a type variable | accept a \`Class<T>\` token |
| \`static T field;\` | a type parameter belongs to an instance | make the *method* generic |
| \`catch (T e)\` | exception types must be reifiable | catch a concrete type |

\`\`\`java
T make(Class<T> type) throws Exception {
    return type.getDeclaredConstructor().newInstance(); // Class<T> token trick
}
\`\`\``,
  },
  {
    id: 'gen-safevarargs',
    question: 'What is heap pollution and what does @SafeVarargs do?',
    difficulty: 'Hard',
    category: 'Generics',
    tags: ['generics', 'heap-pollution', 'safevarargs', 'varargs'],
    answer: `**Heap pollution** is when a variable of a parameterized type refers to an object of the wrong type, usually via an unchecked operation. Generic **varargs** are a common cause, because \`T... args\` secretly creates a \`T[]\`, and arrays are covariant:

\`\`\`java
static void leak(List<String>... lists) { // really List[]
    Object[] arr = lists;       // legal — array covariance
    arr[0] = List.of(42);       // heap pollution: List<Integer> as List<String>
    String s = lists[0].get(0); // ClassCastException at runtime
}
\`\`\`

The compiler warns on every generic-varargs method. \`@SafeVarargs\` suppresses that warning at the declaration and for callers — a **promise** that the method only reads the array and never stores it or lets it escape.

:::gotcha
\`@SafeVarargs\` is **not verified** by the compiler. Apply it only to genuinely safe methods. It is allowed on \`static\`, \`final\`, and (since Java 9) \`private\` methods — those that cannot be overridden into unsafety.
:::`,
  },
  {
    id: 'gen-generic-methods',
    question: 'How do you write and call a generic method?',
    difficulty: 'Easy',
    category: 'Generics',
    tags: ['generics', 'generic-methods', 'type-inference'],
    answer: `A **generic method** declares its own type parameter(s) in angle brackets **before the return type**, independent of whether the enclosing class is generic:

\`\`\`java
static <T> T firstOrNull(List<T> list) {
    return list.isEmpty() ? null : list.get(0);
}
static <K, V> Map<V, K> invert(Map<K, V> in) { /* ... */ }
\`\`\`

At the call site the compiler **infers** the type arguments from the actual arguments, so you rarely spell them out:

\`\`\`java
String s = firstOrNull(List.of("a", "b"));   // T inferred as String
\`\`\`

When inference can't help (e.g. an empty argument list), supply an explicit **type witness**: \`Collections.<String>emptyList()\`.

:::tip
Most JDK factory methods are generic methods — \`List.of\`, \`Optional.of\`, \`Stream.of\`, \`Collectors.toList\`. A method should be generic (not the class) when the type only needs to flow through **one call**.
:::`,
  },
  {
    id: 'gen-bounded-type-parameter',
    question: 'What is a bounded type parameter, and can you have multiple bounds?',
    difficulty: 'Medium',
    category: 'Generics',
    tags: ['generics', 'bounds', 'bounded-type'],
    answer: `A **bound** restricts what a type parameter can be, which unlocks the bound's API inside the method. \`<T extends Number>\` means "T is \`Number\` or a subtype", so you can call \`Number\` methods on a \`T\`:

\`\`\`java
static <T extends Number> double sum(List<T> xs) {
    double total = 0;
    for (T x : xs) total += x.doubleValue();   // doubleValue() available via the bound
    return total;
}
\`\`\`

**Multiple bounds** use \`&\`. If one bound is a class it must come **first**; the rest are interfaces:

\`\`\`java
<T extends Number & Comparable<T>>   // a Number that is also Comparable to itself
\`\`\`

\`extends\` is used for both classes and interfaces here (there is no \`implements\` in a bound).

:::note
A **bound** (\`<T extends Number>\`, declaration-site) lets you **name and reuse** the type; a **wildcard** (\`? extends Number\`, use-site) is for a one-off unknown type you don't need to name. That's the core "type parameter vs wildcard" decision.
:::`,
  },
  {
    id: 'gen-diamond-operator',
    question: 'What is the diamond operator, and how does target typing work?',
    difficulty: 'Easy',
    category: 'Generics',
    tags: ['generics', 'diamond', 'type-inference'],
    answer: `The **diamond** \`<>\` (Java 7) lets the compiler infer a generic constructor's type arguments from the **target type** on the left, removing redundant repetition:

\`\`\`java
Map<String, List<Integer>> m = new HashMap<>();   // not new HashMap<String, List<Integer>>()
\`\`\`

**Target typing** is the general mechanism: the expected type at an assignment, return, or argument position drives inference (it also powers lambdas and method references).

- Java 9 allows \`<>\` with **anonymous classes**.
- With \`var\` there is no left-hand type to infer from, so \`var list = new ArrayList<>();\` gives \`ArrayList<Object>\` — put the type on one side or the other, not neither.

:::gotcha
\`List<String> l = new ArrayList();\` (no diamond) compiles with an **unchecked warning** — that's a raw type, not inference. Always write the \`<>\`.
:::`,
  },
  {
    id: 'gen-wildcard-vs-typeparam',
    question: 'List<?> vs List<Object> vs raw List — what is the difference?',
    difficulty: 'Medium',
    category: 'Generics',
    tags: ['generics', 'wildcards', 'raw-types'],
    answer: `They look similar but behave very differently:

| Type | Accepts | Add | Type-safe? |
|------|---------|-----|-----------|
| \`List\` (raw) | any \`List\` | anything (unchecked) | **no** — defeats generics |
| \`List<Object>\` | only \`List<Object>\` | any object | yes, but **invariant** |
| \`List<?>\` | **any** \`List<X>\` | only \`null\` | yes |

\`\`\`java
List<?> anyList = List.of(1, 2, 3);   // holds a List<Integer>
Object o = anyList.get(0);             // reads come back as Object
// anyList.add(4);                     // compile error — element type unknown
\`\`\`

- **Raw** exists only for pre-generics compatibility — never use it in new code.
- \`List<Object>\` is **invariant**: a \`List<String>\` is *not* a \`List<Object>\`, so it accepts almost nothing.
- \`List<?>\` ("list of some unknown type") is the safe way to accept **any** list when you only read it or don't care about the element type (e.g. \`printAll(List<?> list)\`).`,
  },
  {
    id: 'gen-wildcard-capture',
    question: 'What is wildcard capture, and what is the capture-helper idiom?',
    difficulty: 'Hard',
    category: 'Generics',
    tags: ['generics', 'wildcards', 'capture'],
    answer: `When you use a wildcard, the compiler assigns it a fresh, unnameable type variable — the **captured** type (you'll see \`CAP#1\` in error messages). Usually that's invisible, but some operations need to *name* the captured type, and then a raw wildcard method won't compile.

The classic case is swapping two elements of a \`List<?>\`: you can't declare a variable of the unknown element type. The **capture-helper idiom** delegates to a private generic method whose type parameter *captures* the wildcard:

\`\`\`java
public static void swap(List<?> list, int i, int j) {
    swapHelper(list, i, j);              // capture happens here
}
private static <T> void swapHelper(List<T> list, int i, int j) {
    T tmp = list.get(i);                 // now the element type has a name: T
    list.set(i, list.get(j));
    list.set(j, tmp);
}
\`\`\`

The public method keeps the clean \`List<?>\` signature; the helper gives the compiler a real type variable to work with.

:::gotcha
\`list.set(i, list.get(j))\` directly on a \`List<?>\` fails: \`get\` returns \`CAP#1\` but \`set\` expects \`CAP#1\` and the compiler won't prove they're the same capture. The helper is what unifies them.
:::`,
  },
  {
    id: 'gen-bridge-methods',
    question: 'What is a bridge method and why does the compiler generate one?',
    difficulty: 'Hard',
    category: 'Generics',
    tags: ['generics', 'erasure', 'bridge-methods'],
    answer: `A **bridge method** is a synthetic method the compiler generates to preserve polymorphism **after type erasure**. When a generic supertype is erased, an override's signature can no longer match — so the compiler inserts a bridge that adapts it.

Implement \`Comparable<Money>\` and you write \`compareTo(Money)\`. But the erased interface method is \`compareTo(Object)\`, so the compiler adds:

\`\`\`java
// You write:
public int compareTo(Money o) { ... }
// Compiler generates (invisible):
public int compareTo(Object o) { return compareTo((Money) o); }  // bridge
\`\`\`

Bridges are also emitted for **covariant return** overrides. They're flagged \`ACC_BRIDGE | ACC_SYNTHETIC\` — inspect with \`javap\`.

:::senior
Consequences: a bridge can appear in **stack traces** and confuse **reflection** (\`getMethods()\` returns it; \`Method.isBridge()\` filters it out). The unchecked cast inside a bridge is also how a raw-type call can throw \`ClassCastException\` at a line you never wrote.
:::`,
  },
  {
    id: 'gen-recursive-generics',
    question: 'What does <T extends Comparable<T>> mean, and what is a self-bounded type?',
    difficulty: 'Hard',
    category: 'Generics',
    tags: ['generics', 'recursive-bound', 'self-type'],
    answer: `A **recursive** (self-referential) bound mentions the type parameter inside its own bound. \`<T extends Comparable<T>>\` reads "T is a type comparable **to itself**", which is exactly what you need to write a generic \`max\`:

\`\`\`java
static <T extends Comparable<T>> T max(List<T> list) {
    T best = list.get(0);
    for (T x : list) if (x.compareTo(best) > 0) best = x;
    return best;
}
\`\`\`

The JDK uses it for enums: \`abstract class Enum<E extends Enum<E>>\` guarantees \`compareTo\` and \`getDeclaringClass\` are typed to the concrete enum.

It also enables the **self-type idiom** for fluent hierarchies, so a subclass builder's setters return the subclass, not the base:

\`\`\`java
abstract class Builder<T extends Builder<T>> {
    abstract T self();
    T name(String n) { /* set */ return self(); }   // returns the subtype
}
\`\`\`

:::senior
The real-world signature is even looser — \`Collections.max\` uses \`<T extends Comparable<? super T>>\` so a subtype can reuse an ancestor's \`compareTo\` (PECS applied to \`Comparable\`).
:::`,
  },
  {
    id: 'gen-generic-arrays',
    question: "Why can't you create an array of a parameterized type, like new List<String>[10]?",
    difficulty: 'Medium',
    category: 'Generics',
    tags: ['generics', 'arrays', 'reifiable'],
    answer: `Because arrays and generics have **opposite** type rules and mixing them would defeat both. Arrays are **reifiable** (they know their element type at runtime and throw \`ArrayStoreException\` on a bad store) and **covariant**; generics are **erased** and **invariant**.

If \`new List<String>[]\` were legal, erasure would let heap pollution slip past the runtime array-store check:

\`\`\`java
List<String>[] a = new List<String>[1];  // (hypothetical) — illegal
Object[] o = a;                           // covariance
o[0] = List.of(42);                       // store check passes (all Lists erase alike!)
String s = a[0].get(0);                   // ClassCastException — silently
\`\`\`

So \`new T[]\`, \`new List<String>[]\`, and \`new E[]\` are **compile errors**. Workarounds:

- \`(T[]) new Object[n]\` with a localized \`@SuppressWarnings("unchecked")\` (what \`ArrayList\` does internally).
- \`Array.newInstance(componentClass, n)\` when you have a \`Class\` token.
- Best: use \`List<List<String>>\` instead of an array of generics.`,
  },
  {
    id: 'gen-class-token',
    question: 'How do you recover generic type information at runtime despite erasure?',
    difficulty: 'Medium',
    category: 'Generics',
    tags: ['generics', 'erasure', 'type-token', 'reflection'],
    answer: `Erasure removes \`<T>\` from the bytecode, so \`T.class\` and \`instanceof List<String>\` are impossible. Two idioms pass the type in explicitly instead:

**1. \`Class<T>\` type token** — accept the class as a parameter:

\`\`\`java
<T> T parse(String json, Class<T> type) { ... }
parse(body, User.class);          // T carried by the token
EnumSet.noneOf(Day.class);        // JDK uses the same trick
\`\`\`

But a \`Class\` can't represent \`List<User>\` — the parameter is erased.

**2. Super type token** — subclass an abstract generic type so the argument is baked into the class's **signature** metadata (which erasure keeps) and read back via \`getGenericSuperclass()\`:

\`\`\`java
var ref = new TypeReference<List<User>>() {};   // anonymous subclass
mapper.readValue(json, ref);                     // Jackson reads the full type
\`\`\`

This is how **Jackson** (\`TypeReference\`), **Spring** (\`ParameterizedTypeReference\`), and **Guava** (\`TypeToken\`) capture full generic types.

:::senior
The trick works because generic **class/field/method signatures** are retained for reflection — only *local* type arguments (like \`new ArrayList<String>()\`) are truly erased.
:::`,
  },
];

export default questions;
