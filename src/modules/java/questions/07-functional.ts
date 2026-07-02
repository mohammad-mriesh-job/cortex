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
];

export default questions;
