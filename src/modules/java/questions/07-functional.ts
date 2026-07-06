import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'fp-functional-interface',
    question: 'What is a functional interface, and what does @FunctionalInterface do?',
    difficulty: 'Easy',
    category: 'Streams & Functional',
    tags: ['lambdas', 'functional-interface'],
    answer: `A **functional interface** is an interface with exactly **one abstract method** (a SAM — Single Abstract Method). That single method is what a lambda or method reference implements.

- \`default\` and \`static\` methods don't count toward the limit.
- \`public\` methods inherited from \`Object\` (\`equals\`, \`hashCode\`, \`toString\`) don't count either.

\`\`\`java
@FunctionalInterface
interface Validator { boolean isValid(String s); }

Validator notBlank = s -> !s.isBlank();
\`\`\`

The \`@FunctionalInterface\` annotation is **optional** but makes the compiler reject the interface if it ever stops having exactly one abstract method — a cheap safety net for your own types.`,
  },
  {
    id: 'fp-lambda-vs-anonymous',
    question: 'How does a lambda differ from an anonymous inner class?',
    difficulty: 'Medium',
    category: 'Streams & Functional',
    tags: ['lambdas', 'anonymous-class'],
    answer: `They look similar but differ in real ways:

| Aspect | Lambda | Anonymous class |
|--------|--------|-----------------|
| \`this\` | the **enclosing** instance | the anonymous object itself |
| Scope | shares enclosing scope (no shadowing) | new scope (can shadow) |
| Compiled to | \`invokedynamic\` + \`LambdaMetafactory\` (no extra class) | a separate \`Outer$1.class\` |
| Targets | functional interfaces only | any interface/class, multiple methods, fields |

:::gotcha
Inside an anonymous class \`this\` is the anonymous object, so \`this.field\` won't reach the outer instance. Inside a lambda \`this\` is the enclosing instance — a common surprise when migrating old code.
:::`,
  },
  {
    id: 'fp-effectively-final',
    question: 'Why must local variables captured by a lambda be effectively final?',
    difficulty: 'Medium',
    category: 'Streams & Functional',
    tags: ['lambdas', 'capture', 'closures'],
    answer: `Local variables live on the **stack** and disappear when the method returns, but a lambda may **outlive** that call. Java therefore **captures the value** (copies it). Forbidding reassignment keeps the captured copy and the original from drifting out of sync, avoiding ambiguous semantics.

\`\`\`java
int factor = 3;                              // effectively final
Function<Integer,Integer> f = x -> x * factor;  // OK
// factor = 4;  // would make 'factor' NOT effectively final -> compile error
\`\`\`

Instance and static **fields** have no such rule — they're reached through the captured \`this\` (or the class), so they may change freely.`,
  },
  {
    id: 'fp-method-reference-kinds',
    question: 'What are the four kinds of method reference?',
    difficulty: 'Medium',
    category: 'Streams & Functional',
    tags: ['method-references', 'lambdas'],
    answer: `| Kind | Syntax | Equivalent lambda |
|------|--------|-------------------|
| Static | \`Integer::parseInt\` | \`s -> Integer.parseInt(s)\` |
| Bound instance | \`System.out::println\` | \`s -> System.out.println(s)\` |
| Unbound instance | \`String::toUpperCase\` | \`s -> s.toUpperCase()\` |
| Constructor | \`ArrayList::new\` | \`() -> new ArrayList<>()\` |

The tricky distinction is **bound vs unbound**:

\`\`\`java
String str = "hello";
Supplier<Integer>         bound   = str::length;    // () -> str.length()  -> always 5
Function<String,Integer>  unbound = String::length; // s  -> s.length()    -> any string
\`\`\`

In the **unbound** form the first parameter *becomes the receiver*; in the **bound** form the receiver is fixed and captured.`,
  },
  {
    id: 'fp-intermediate-vs-terminal',
    question: 'Intermediate vs terminal stream operations — and what is laziness?',
    difficulty: 'Medium',
    category: 'Streams & Functional',
    tags: ['streams', 'laziness'],
    answer: `A pipeline is **source → intermediate ops → one terminal op**.

- **Intermediate** ops (\`map\`, \`filter\`, \`sorted\`, \`flatMap\`…) return a new \`Stream\` and are **lazy** — they only describe work.
- **Terminal** ops (\`collect\`, \`forEach\`, \`reduce\`, \`count\`…) produce a result and **trigger execution**. After one, the stream is consumed.

**Laziness** means nothing runs until the terminal op, and elements flow through the pipeline **one at a time** (vertically), not one operation at a time across the whole collection.

\`\`\`java
Stream.of("a","b").peek(System.out::println); // prints NOTHING — no terminal op
\`\`\`

:::tip
A stream can be consumed **once**. Reusing one after a terminal op throws \`IllegalStateException\`.
:::`,
  },
  {
    id: 'fp-short-circuiting',
    question: 'What is short-circuiting, and how do streams handle infinite sources?',
    difficulty: 'Medium',
    category: 'Streams & Functional',
    tags: ['streams', 'short-circuit', 'infinite'],
    answer: `A **short-circuiting** operation can finish without examining every element — the only way to process an infinite stream.

- Short-circuiting **terminal** ops: \`anyMatch\`, \`allMatch\`, \`noneMatch\`, \`findFirst\`, \`findAny\`.
- Short-circuiting **intermediate** ops: \`limit\`, \`takeWhile\` (Java 9+).

\`\`\`java
Optional<Integer> firstBig = Stream.iterate(1, n -> n + 1) // infinite
    .map(n -> n * n)
    .filter(n -> n > 1000)
    .findFirst();        // stops at 1024 — terminates fine
\`\`\`

:::gotcha
\`forEach\` is **not** short-circuiting, so \`Stream.iterate(0, n -> n+1).forEach(...)\` loops forever. Always pair an infinite source with \`limit\`/\`takeWhile\` or a short-circuiting terminal op.
:::`,
  },
  {
    id: 'fp-map-vs-flatmap',
    question: 'What is the difference between map and flatMap?',
    difficulty: 'Medium',
    category: 'Streams & Functional',
    tags: ['streams', 'map', 'flatmap'],
    answer: `- **\`map\`** applies a 1-to-1 transform: \`Stream<T>\` → \`Stream<R>\`.
- **\`flatMap\`** maps each element to a **stream** and **flattens** all of them into one: it turns \`Stream<Stream<R>>\` into \`Stream<R>\`. Use it for nested or one-to-many structures.

\`\`\`java
List<List<Integer>> nested = List.of(List.of(1,2), List.of(3,4));

nested.stream().map(List::stream);      // Stream<Stream<Integer>>  (nested)
nested.stream().flatMap(List::stream);  // Stream<Integer> -> 1,2,3,4 (flat)
\`\`\`

Rule of thumb: if your mapping function returns a collection or stream and you want the *elements*, not the containers, reach for \`flatMap\`.`,
  },
  {
    id: 'fp-reduce',
    question: 'How does Stream.reduce work, and why must the operation be associative?',
    difficulty: 'Hard',
    category: 'Streams & Functional',
    tags: ['streams', 'reduce', 'parallel'],
    answer: `\`reduce\` folds elements into a single result. The three-argument form takes an **identity**, an **accumulator**, and a **combiner**:

\`\`\`java
int sum = nums.stream().reduce(0, Integer::sum);          // identity + accumulator
int sum2 = nums.parallelStream()
    .reduce(0, Integer::sum, Integer::sum);                // + combiner for parallel
\`\`\`

- **identity** must be a true identity: \`accumulator(identity, x) == x\`.
- **accumulator** must be **associative**: \`(a∘b)∘c == a∘(b∘c)\`.
- **combiner** merges partial results from parallel chunks.

:::gotcha
Subtraction isn't associative, so \`reduce(0, (a,b) -> a-b)\` gives different answers serially vs in parallel. And a non-identity seed like \`reduce(10, Integer::sum)\` is added **once per chunk** in parallel, inflating the result. Associativity + a real identity are mandatory for correctness.
:::`,
  },
  {
    id: 'fp-groupingby-downstream',
    question: 'How do groupingBy, downstream collectors, and toMap merge functions work?',
    difficulty: 'Medium',
    category: 'Streams & Functional',
    tags: ['collectors', 'groupingBy', 'partitioningBy', 'toMap'],
    answer: `\`groupingBy\` is a SQL \`GROUP BY\`. Alone it yields \`Map<K, List<T>>\`; a **downstream collector** aggregates each group into something else.

\`\`\`java
// Map<Dept, Long> — count per group
emps.stream().collect(groupingBy(Employee::dept, counting()));

// Map<Dept, Double> — average salary per group
emps.stream().collect(groupingBy(Employee::dept, averagingDouble(Employee::salary)));

// Map<Dept, List<String>> — collect just the names
emps.stream().collect(groupingBy(Employee::dept,
    mapping(Employee::name, toList())));
\`\`\`

\`partitioningBy(predicate)\` is a boolean specialization that **always** returns both \`true\` and \`false\` keys (even if empty), unlike \`groupingBy\`, which omits absent keys.

:::gotcha
\`toMap(keyFn, valueFn)\` throws \`IllegalStateException\` on **duplicate keys**. Supply a **merge function** as the third argument — e.g. \`toMap(k, v, Integer::max)\` — to resolve collisions, and a fourth to choose the map type.
:::`,
  },
  {
    id: 'fp-orelse-vs-orelseget',
    question: 'orElse vs orElseGet vs orElseThrow — when do you use each?',
    difficulty: 'Medium',
    category: 'Streams & Functional',
    tags: ['optional', 'null-safety'],
    answer: `| Method | When empty | Evaluation |
|--------|-----------|------------|
| \`orElse(v)\` | returns \`v\` | **eager** — \`v\` is computed even when present |
| \`orElseGet(supplier)\` | calls supplier | **lazy** — only when empty |
| \`orElseThrow(supplier)\` | throws your exception | lazy |

\`\`\`java
opt.orElse(createDefault());        // createDefault() runs ALWAYS — wasteful/buggy if it has side effects
opt.orElseGet(() -> createDefault());// runs ONLY when empty
\`\`\`

:::gotcha
\`orElse\` evaluates its argument **even when the Optional has a value**. If the default is expensive (DB call, allocation) or has side effects, use \`orElseGet\`. Prefer \`orElseThrow\` over \`get()\` to surface absence intentionally.
:::`,
  },
  {
    id: 'fp-optional-antipatterns',
    question: 'What are common Optional anti-patterns?',
    difficulty: 'Medium',
    category: 'Streams & Functional',
    tags: ['optional', 'best-practices'],
    answer: `\`Optional\` is designed as a **return type** for methods that may produce no result — not a general null replacement. Misuses:

- **Fields** — \`private Optional<String> name;\` wastes a wrapper per instance and isn't \`Serializable\`.
- **Parameters** — \`void f(Optional<X> x)\` forces callers to wrap; prefer overloads or a nullable arg.
- **In collections** — \`Map<K, Optional<V>>\` is redundant; a missing key already means absence.
- **\`get()\` without a guard** — just relocates the NPE; use \`map\`/\`orElseThrow\`.

\`\`\`java
// Anti-pattern: defeats the purpose
if (opt.isPresent()) { use(opt.get()); }
// Idiomatic:
opt.ifPresent(this::use);
\`\`\`

:::senior
Use \`Optional\` at API boundaries (return types) to force callers to confront absence; internally a \`@Nullable\` annotation plus a null check is often clearer and cheaper.
:::`,
  },
  {
    id: 'fp-parallel-when',
    question: 'When do parallel streams help, when do they hurt, and what are the pitfalls?',
    difficulty: 'Hard',
    category: 'Streams & Functional',
    tags: ['parallel-streams', 'fork-join', 'concurrency'],
    answer: `Parallel streams split the source across the shared **common ForkJoinPool** (size = cores − 1) and merge results. Overhead means they pay off only when **N × Q** (element count × cost-per-element) is large.

**Helps:** large N, expensive per-element work, cheaply splittable sources (\`ArrayList\`, arrays, \`IntStream.range\`).

**Hurts:** small collections, trivial work, poorly splittable sources (\`LinkedList\`, \`Stream.iterate\`), and ordered/stateful pipelines.

\`\`\`java
// BROKEN: ArrayList isn't thread-safe -> data race
List<Integer> out = new ArrayList<>();
nums.parallelStream().forEach(out::add);
// CORRECT: let collect merge safely
List<Integer> safe = nums.parallelStream().collect(Collectors.toList());
\`\`\`

:::senior
Lambdas must be **stateless, non-interfering, and associative** (for \`reduce\`). Never run **blocking I/O** on a parallel stream — it borrows the JVM-wide common pool and starves everything else (including \`CompletableFuture\`). Always **measure**: naive \`parallel()\` is often slower than sequential.
:::`,
  },
  {
    id: 'fp-builtin-interfaces',
    question: 'What are the core functional interfaces in java.util.function?',
    difficulty: 'Easy',
    category: 'Streams & Functional',
    tags: ['functional-interface', 'lambdas', 'java-util-function'],
    answer: `Four base shapes, plus arity and primitive variants:

| Interface | Shape | Method | Typical use |
|-----------|-------|--------|-------------|
| \`Supplier<T>\` | \`() -> T\` | \`get\` | lazy/deferred value |
| \`Consumer<T>\` | \`T -> void\` | \`accept\` | side effect (\`forEach\`) |
| \`Function<T,R>\` | \`T -> R\` | \`apply\` | transform (\`map\`) |
| \`Predicate<T>\` | \`T -> boolean\` | \`test\` | condition (\`filter\`) |

Specializations you'll meet constantly:

- \`UnaryOperator<T>\` = \`Function<T,T>\`; \`BinaryOperator<T>\` = \`BiFunction<T,T,T>\` (used by \`reduce\`).
- Two-arg forms: \`BiFunction\`, \`BiConsumer\`, \`BiPredicate\`.
- **Primitive** forms avoid boxing: \`IntFunction\`, \`ToIntFunction\`, \`IntPredicate\`, \`IntUnaryOperator\`, \`IntSupplier\`…

\`\`\`java
Supplier<UUID> id   = UUID::randomUUID;
Function<String,Integer> len = String::length;
Predicate<String> nonBlank   = s -> !s.isBlank();
\`\`\`

:::tip
Prefer the standard interfaces over custom ones — every stream/Optional method already speaks them, so your lambdas plug straight in.
:::`,
  },
  {
    id: 'fp-reduce-vs-collect',
    question: 'What is the difference between reduce and collect?',
    difficulty: 'Hard',
    category: 'Streams & Functional',
    tags: ['streams', 'reduce', 'collect', 'mutable-reduction'],
    answer: `Both fold a stream into one result, but they use opposite strategies:

- **\`reduce\`** is an **immutable reduction**: it combines elements with an *associative* function that returns a **new** value each step. Correct only when combining is cheap and side-effect-free.
- **\`collect\`** is a **mutable reduction**: it accumulates elements **into a mutable container** (\`List\`, \`StringBuilder\`, \`Map\`) using a supplier, accumulator, and combiner — and it parallelizes safely by giving each thread its own container to merge.

The classic mistake is string-joining with \`reduce\`:

\`\`\`java
// O(n²) — builds a brand-new String on every element:
String bad = words.stream().reduce("", (a, b) -> a + b);
// O(n) — accumulates into one StringBuilder:
String good = words.stream().collect(Collectors.joining());
\`\`\`

:::gotcha
Never mutate a shared container from inside \`reduce\` (or \`forEach\`) on a parallel stream — that's a data race. Any time the result is a **collection or buffer**, reach for \`collect\`; use \`reduce\` for scalars like sum, min, or a monoid.
:::`,
  },
  {
    id: 'fp-primitive-streams',
    question: 'Why do IntStream / LongStream / DoubleStream exist?',
    difficulty: 'Medium',
    category: 'Streams & Functional',
    tags: ['streams', 'intstream', 'boxing', 'performance'],
    answer: `They process primitives **without boxing** — a \`Stream<Integer>\` boxes every element into a heap object, while an \`IntStream\` works on raw \`int\`s. They also add numeric terminal ops a \`Stream\` lacks:

\`\`\`java
int total = orders.stream()
    .mapToInt(Order::quantity)     // Stream<Order> -> IntStream (no boxing)
    .sum();                         // sum() only exists on IntStream

IntSummaryStatistics stats =
    IntStream.rangeClosed(1, 100).summaryStatistics(); // count/min/max/avg/sum in one pass
\`\`\`

Bridges between the worlds:
- \`mapToInt\` / \`mapToObj\` / \`boxed()\` convert back and forth.
- \`IntStream.range(0, n)\` / \`rangeClosed\` replace index loops.

:::gotcha
\`stream.map(x -> ...).sum()\` won't compile — \`Stream<Integer>\` has no \`sum()\`. Use \`mapToInt\`. And \`average()\` returns an \`OptionalDouble\` (the stream may be empty), not a bare \`double\`.
:::`,
  },
  {
    id: 'fp-optional-map-flatmap',
    question: 'How do you create and transform an Optional with map, flatMap, and filter?',
    difficulty: 'Medium',
    category: 'Streams & Functional',
    tags: ['optional', 'map', 'flatmap'],
    answer: `**Create:** \`Optional.of(x)\` (x must be non-null), \`Optional.ofNullable(x)\` (x may be null), \`Optional.empty()\`.

**Transform** without unwrapping:

\`\`\`java
Optional<String> city = repo.findUser(id)   // Optional<User>
    .map(User::address)                      // Optional<Address>  (map wraps)
    .flatMap(Address::city)                  // city() returns Optional<String>
    .filter(c -> !c.isBlank());              // keep or empty
String result = city.orElse("unknown");
\`\`\`

- **\`map\`** — apply a plain function; the result is auto-wrapped in \`Optional\`.
- **\`flatMap\`** — use when the function **already returns an \`Optional\`**, to avoid a nested \`Optional<Optional<T>>\`.
- **\`filter\`** — keep the value only if a predicate holds, else empty.

:::gotcha
If you \`map\` with a function that itself returns \`Optional\`, you get \`Optional<Optional<X>>\`. That's the exact signal to switch to \`flatMap\` — same rule as \`Stream.map\` vs \`flatMap\`.
:::`,
  },
  {
    id: 'fp-streams-vs-loops',
    question: 'When should you use a stream, and when is a plain loop better?',
    difficulty: 'Medium',
    category: 'Streams & Functional',
    tags: ['streams', 'loops', 'readability'],
    answer: `Streams shine for **declarative data pipelines** — a chain of \`filter\`/\`map\`/\`collect\` that reads like the transformation itself, with easy parallelism. A loop wins when the logic isn't a clean pipeline.

**Prefer a stream when:** you're transforming/filtering/aggregating a collection, composing several steps, or grouping/joining.

**Prefer a loop when:**
- You mutate external state or need side effects (a stream \`forEach\` that mutates is a smell).
- You need complex control flow — \`break\` out early on a condition, \`continue\`, or index arithmetic.
- Hot primitive code where a raw \`for\` avoids lambda/boxing overhead.
- You need the index, multiple collections in lockstep, or checked-exception handling.

\`\`\`java
// Pipeline — stream reads better:
var names = users.stream().filter(User::active).map(User::name).toList();
// Imperative with early exit — loop reads better:
for (var u : users) if (u.isAdmin()) return u;
\`\`\`

:::senior
It's about clarity, not dogma. A stream that needs \`peek\`, a mutable accumulator, and a comment to explain it should have been a loop. Don't rewrite working loops just to look modern.
:::`,
  },
  {
    id: 'fp-function-composition',
    question: 'How do you compose functions, predicates, and consumers?',
    difficulty: 'Easy',
    category: 'Streams & Functional',
    tags: ['function', 'composition', 'andThen', 'predicate'],
    answer: `The functional interfaces have default methods that build bigger behaviours from small ones:

\`\`\`java
Function<Integer,Integer> times2 = x -> x * 2;
Function<Integer,Integer> plus1  = x -> x + 1;

times2.andThen(plus1).apply(5);  // 11  — times2 first, then plus1
times2.compose(plus1).apply(5);  // 12  — plus1 first, then times2
\`\`\`

- \`Function\`: \`andThen\` (this → next), \`compose\` (previous → this).
- \`Predicate\`: \`and\`, \`or\`, \`negate\` — build compound conditions.
- \`Consumer\`: \`andThen\` — run two side effects in sequence.

\`\`\`java
Predicate<String> valid = nonBlank.and(s -> s.length() < 100);
list.removeIf(Predicate.not(valid));   // Predicate.not — Java 11
\`\`\`

:::tip
Mnemonic: \`f.andThen(g)\` = \`g(f(x))\` (left to right); \`f.compose(g)\` = \`f(g(x))\` (right to left, like math).
:::`,
  },
  {
    id: 'fp-collectors-toolbox',
    question: 'What are the most useful Collectors beyond toList?',
    difficulty: 'Easy',
    category: 'Streams & Functional',
    tags: ['collectors', 'streams', 'toolbox'],
    answer: `\`Collectors\` is a toolbox of terminal reductions:

| Collector | Produces |
|-----------|----------|
| \`toList\` / \`toSet\` / \`toCollection\` | a collection |
| \`toUnmodifiableList\` | an immutable list |
| \`toMap(k, v[, merge])\` | a \`Map\` |
| \`joining(", ", "[", "]")\` | one \`String\` |
| \`counting\` | \`Long\` count |
| \`summingInt\` / \`averagingDouble\` | numeric aggregate |
| \`minBy\` / \`maxBy\` | \`Optional\` extreme |
| \`groupingBy\` / \`partitioningBy\` | grouped \`Map\` |
| \`mapping\` / \`filtering\` / \`reducing\` | **downstream** adapters |

\`\`\`java
String csv = names.stream().collect(Collectors.joining(", "));
Map<Dept, Long> perDept = emps.stream()
    .collect(Collectors.groupingBy(Employee::dept, Collectors.counting()));
\`\`\`

:::tip
Since Java 16 use \`stream.toList()\` for the common case — it's shorter and returns an **unmodifiable** list (unlike \`collect(toList())\`, whose mutability is unspecified).
:::`,
  },
  {
    id: 'fp-stream-sources',
    question: 'What are the different ways to create a Stream, including infinite ones?',
    difficulty: 'Medium',
    category: 'Streams & Functional',
    tags: ['streams', 'sources', 'infinite'],
    answer: `Streams come from many sources:

\`\`\`java
list.stream();                         // any Collection
Stream.of("a", "b", "c");              // explicit elements
Arrays.stream(array);                  // an array
IntStream.range(0, 10);                // numeric range
"a,b,c".lines();  Files.lines(path);   // text (close Files.lines!)
Stream.ofNullable(maybeNull);          // 0-or-1 element (Java 9)
\`\`\`

**Infinite** streams need a source generator plus a limiter:

\`\`\`java
Stream.iterate(1, n -> n * 2).limit(10);              // 1,2,4,... (bounded)
Stream.iterate(1, n -> n < 100, n -> n * 2);           // 3-arg with predicate (Java 9)
Stream.generate(Math::random).limit(5);                // stateless supplier
\`\`\`

- \`iterate\` — each element derived from the previous (sequences).
- \`generate\` — each element independent (constants, random, polling).

:::gotcha
An infinite stream **must** be bounded by \`limit\` or \`takeWhile\` (or a short-circuiting terminal like \`findFirst\`) — otherwise the pipeline never terminates.
:::`,
  },
  {
    id: 'fp-target-typing',
    question: 'What is the type of a lambda, and how does the compiler decide it?',
    difficulty: 'Hard',
    category: 'Streams & Functional',
    tags: ['lambdas', 'target-typing', 'type-inference'],
    answer: `A lambda has **no type on its own** — it's a *poly expression* whose type is inferred from the **target type**: the functional interface expected at that position (an assignment, method parameter, return, or cast). The same lambda can become different types in different contexts:

\`\`\`java
Function<Integer,Integer> f = x -> x + 1;  // target: Function
UnaryOperator<Integer>    g = x -> x + 1;  // same lambda, different target type
Comparator<String> byLen = (a, b) -> a.length() - b.length();
\`\`\`

The lambda's single abstract method must be compatible (parameter count, types, return). Because there's no target type, you **can't** write \`var x = () -> 1;\` — the compiler has nothing to infer against.

:::gotcha
When two overloads both accept a functional interface, a bare lambda is **ambiguous** — the compiler can't choose a target. Disambiguate with a cast: \`process((Callable<String>) () -> compute())\`. This is why overloading methods on similar functional interfaces is discouraged.
:::`,
  },
  {
    id: 'fp-checked-exceptions-lambda',
    question: "Why can't a lambda in a stream throw a checked exception, and how do you handle it?",
    difficulty: 'Hard',
    category: 'Streams & Functional',
    tags: ['lambdas', 'checked-exceptions', 'streams'],
    answer: `The built-in functional interfaces (\`Function\`, \`Consumer\`, …) declare **no checked exceptions** in their abstract methods, so a lambda body that throws one won't compile inside \`map\`/\`forEach\`:

\`\`\`java
// Does NOT compile — readString throws IOException:
paths.stream().map(p -> Files.readString(p));
\`\`\`

Three practical options:

1. **Handle inside** the lambda — catch and rethrow as unchecked (usually best):

\`\`\`java
paths.stream().map(p -> {
    try { return Files.readString(p); }
    catch (IOException e) { throw new UncheckedIOException(e); }
});
\`\`\`

2. **A checked-exception functional interface** you declare yourself, plus a small wrapper that converts it to a standard one.
3. Move the loop **out of the stream** — a plain \`for\` loop can \`throws IOException\` naturally.

:::senior
There's no free lunch: a stream must ultimately surface a checked failure as either an unchecked wrapper (\`UncheckedIOException\`) or a collected result type (\`Either\`/\`Result\`). "Sneaky throw" tricks compile but hide the exception from the signature — avoid them in shared code.
:::`,
  },
];

export default questions;
