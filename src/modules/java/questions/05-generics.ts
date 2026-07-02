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
];

export default questions;
