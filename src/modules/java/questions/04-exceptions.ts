import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'exc-hierarchy-overview',
    question: 'Walk me through the Java exception hierarchy.',
    difficulty: 'Easy',
    category: 'Exceptions',
    tags: ['hierarchy', 'throwable'],
    answer: `Everything throwable descends from \`Throwable\`, which has two direct subclasses:

- **\`Error\`** — serious, usually unrecoverable JVM-level failures (\`OutOfMemoryError\`, \`StackOverflowError\`). Don't catch these.
- **\`Exception\`** — conditions an application may want to handle.
  - **\`RuntimeException\`** — a sub-branch for programming bugs (\`NullPointerException\`, \`IllegalArgumentException\`). These are **unchecked**.
  - Everything else under \`Exception\` (\`IOException\`, \`SQLException\`) is **checked**.

\`\`\`text
Throwable
├─ Error              (unchecked, don't catch)
└─ Exception
   ├─ RuntimeException (unchecked)
   └─ IOException, ... (checked)
\`\`\`

:::key
Only \`Throwable\` and its subclasses can be thrown or caught.
:::`,
  },
  {
    id: 'exc-error-vs-exception',
    question: 'What is the difference between an Error and an Exception? Should you ever catch an Error?',
    difficulty: 'Medium',
    category: 'Exceptions',
    tags: ['error', 'hierarchy'],
    answer: `**\`Error\`** signals a problem in the *environment or JVM* that an application normally cannot recover from — \`OutOfMemoryError\`, \`StackOverflowError\`, \`NoClassDefFoundError\`. **\`Exception\`** signals a problem in the *application* that may reasonably be handled.

You generally should **not** catch \`Error\`: the JVM is in a degraded state, and continuing risks silent corruption. The one pragmatic case is a top-level supervisor (a thread pool's uncaught-exception handler) that logs the fatal error before shutting that worker down.

:::gotcha
\`Error\` is unchecked, so \`catch (Throwable t)\` silently scoops up \`OutOfMemoryError\` too — another reason to never catch \`Throwable\`.
:::`,
  },
  {
    id: 'exc-checked-unchecked-rule',
    question: 'What does the compiler enforce for checked exceptions, and which exceptions are exempt?',
    difficulty: 'Medium',
    category: 'Exceptions',
    tags: ['checked', 'unchecked', 'compiler'],
    answer: `Checked exceptions obey the **handle-or-declare** rule: any method that can throw one must either \`catch\` it or list it in a \`throws\` clause — enforced at **compile time**.

\`\`\`java
void read(Path p) throws IOException {   // declared
    Files.readString(p);                 // throws the checked IOException
}
\`\`\`

**Exempt:** the \`RuntimeException\` subtree and the \`Error\` subtree are **unchecked** and may be thrown without any declaration. So: checked = subclasses of \`Exception\` that are *not* subclasses of \`RuntimeException\`.

:::senior
Unchecked doesn't mean "less serious" — it means the compiler trusts you to *prevent* it (like a \`NullPointerException\`) rather than ceremonially declare it.
:::`,
  },
  {
    id: 'exc-try-with-resources',
    question: 'How does try-with-resources work, and what are suppressed exceptions?',
    difficulty: 'Medium',
    category: 'Exceptions',
    tags: ['try-with-resources', 'autocloseable', 'suppressed'],
    answer: `Any resource implementing **\`AutoCloseable\`** can be declared in the \`try\` header; the compiler generates a hidden \`finally\` that calls \`close()\` for you.

\`\`\`java
try (var in = Files.newInputStream(src);
     var out = Files.newOutputStream(dst)) {
    in.transferTo(out);
}   // out.close() then in.close() — reverse order
\`\`\`

- Resources close in **reverse** declaration order.
- \`close()\` runs **before** any \`catch\` / \`finally\` of the same statement.

**Suppressed exceptions:** if the body throws *and* \`close()\` also throws, the body's exception is the **primary** and the close exception is attached via \`addSuppressed()\`, readable through \`getSuppressed()\`. Without try-with-resources, the close failure would silently mask the original.

:::key
Default to try-with-resources for anything closable — it is shorter and preserves the original exception.
:::`,
  },
  {
    id: 'exc-finally-return',
    question: 'What happens if you put a return (or throw) inside a finally block?',
    difficulty: 'Medium',
    category: 'Exceptions',
    tags: ['finally', 'gotcha'],
    answer: `It **overrides** whatever the \`try\` or \`catch\` block was about to return or throw — including an in-flight exception, which is silently discarded.

\`\`\`java
int f() {
    try {
        return 1;       // evaluated, then parked
    } finally {
        return 2;       // wins — the method returns 2
    }
}
\`\`\`

\`finally\` itself always runs (except on \`System.exit()\` or JVM death), which is great for cleanup — but *returning or throwing from it* is an anti-pattern.

:::gotcha
A \`return\` in \`finally\` swallows an exception thrown in the \`try\` block, turning a crash into a silently wrong result. Never do it.
:::`,
  },
  {
    id: 'exc-multi-catch',
    question: 'What is multi-catch and what restrictions apply to it?',
    difficulty: 'Medium',
    category: 'Exceptions',
    tags: ['multi-catch', 'try-catch'],
    answer: `Multi-catch (Java 7+) lets one \`catch\` block handle several unrelated exception types, separated by \`|\`:

\`\`\`java
try {
    risky();
} catch (IOException | SQLException e) {
    log.error("failure", e);
}
\`\`\`

Restrictions:

- The catch parameter is implicitly **\`final\`** — you can't reassign \`e\`.
- The alternatives **must not be subclasses of one another** — \`IOException | FileNotFoundException\` is a compile error, because the subtype is already covered.

:::tip
The static type of \`e\` is the **common supertype** of the listed types, so you can only call methods declared on that supertype.
:::`,
  },
  {
    id: 'exc-chaining',
    question: 'What is exception chaining (wrapping), and why does it matter?',
    difficulty: 'Medium',
    category: 'Exceptions',
    tags: ['chaining', 'cause', 'custom-exceptions'],
    answer: `Chaining wraps a low-level exception inside a higher-level one while preserving the original as the **cause**, via \`super(message, cause)\` or \`initCause()\`.

\`\`\`java
try {
    return jdbc.query(sql);
} catch (SQLException e) {
    throw new RepositoryException("load failed", e); // e is the cause
}
\`\`\`

The cause is retrievable with \`getCause()\`, and the printed trace shows a **"Caused by:"** section with the full root-cause chain. This lets a service expose a clean domain exception without throwing away the diagnostic detail of the underlying failure.

:::gotcha
\`throw new RepositoryException("load failed");\` — omitting the cause — deletes the original stack trace and makes the real failure nearly impossible to diagnose. Always forward the cause.
:::`,
  },
  {
    id: 'exc-performance-cost',
    question: 'Why can throwing exceptions be expensive, and how would you reduce the cost?',
    difficulty: 'Hard',
    category: 'Exceptions',
    tags: ['performance', 'stack-trace', 'control-flow'],
    answer: `The dominant cost is **stack-trace capture**: \`Throwable\`'s constructor calls the native \`fillInStackTrace()\`, which walks the entire call stack. The \`throw\` / \`catch\` jump itself is cheap.

That is why **using exceptions for normal control flow** (e.g. inside a tight loop) hurts — you pay for a stack snapshot every iteration.

Ways to reduce it:

- **Don't** use exceptions for expected outcomes — return an \`Optional\` or a result type instead.
- For a deliberate control-flow signal, build a **stackless** exception: call the four-arg \`Throwable(message, cause, enableSuppression, writableStackTrace)\` constructor with \`writableStackTrace = false\` (or override \`fillInStackTrace()\` to return \`this\`), and reuse a singleton.

\`\`\`java
class Signal extends RuntimeException {
    Signal() { super(null, null, false, false); } // no stack trace captured
}
\`\`\`

:::senior
Stackless exceptions throw in nanoseconds, but you lose all debugging context — use them only for genuine control-flow signals, never for real errors.
:::`,
  },
];

export default questions;
