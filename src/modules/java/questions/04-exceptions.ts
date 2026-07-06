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
  {
    id: 'exc-throw-vs-throws',
    question: 'What is the difference between throw and throws?',
    difficulty: 'Easy',
    category: 'Exceptions',
    tags: ['throw', 'throws', 'fundamentals'],
    answer: `- **\`throw\`** is a *statement* that actually raises one exception instance, right here: \`throw new IllegalArgumentException("bad id");\`
- **\`throws\`** is a *declaration* in a method signature listing the checked exceptions the method may propagate to its caller: \`void load() throws IOException\`

\`\`\`java
void withdraw(double amt) throws InsufficientFundsException {  // declares
    if (amt > balance)
        throw new InsufficientFundsException(amt - balance);   // raises
}
\`\`\`

Related facts worth volunteering:

- \`throw\` takes exactly one \`Throwable\` instance; \`throws\` lists types (comma-separated).
- Unchecked exceptions **may** appear in \`throws\` but don't have to — listing them is documentation only.
- After a \`throw\`, control jumps to the nearest matching \`catch\` up the call stack; code directly after it is unreachable.`,
  },
  {
    id: 'exc-catch-order',
    question: 'Does the order of catch blocks matter?',
    difficulty: 'Easy',
    category: 'Exceptions',
    tags: ['try-catch', 'hierarchy', 'compiler'],
    answer: `Yes — catch blocks are tested **top to bottom**, and the first match wins. So you must order them **subclass before superclass**; the reverse doesn't just misbehave, it **fails to compile** ("exception has already been caught"), because the later block is provably unreachable.

\`\`\`java
try {
    Files.readString(path);
} catch (NoSuchFileException e) {   // specific first
    createDefault(path);
} catch (IOException e) {           // broader after
    log.error("read failed", e);
}

// COMPILE ERROR — IOException already covers NoSuchFileException:
// catch (IOException e) {} catch (NoSuchFileException e) {}
\`\`\`

For **unrelated** types at the same level of specificity, use multi-catch: \`catch (IOException | SQLException e)\`.

:::tip
Catch the most specific type you can *act on* differently; funnel everything else to one broad handler at the boundary. A ladder of five catch blocks that all just log is a smell.
:::`,
  },
  {
    id: 'exc-common-runtime-exceptions',
    question: 'Name the most common runtime exceptions and what typically causes each.',
    difficulty: 'Easy',
    category: 'Exceptions',
    tags: ['runtime-exceptions', 'npe', 'fundamentals'],
    answer: `The ones you should recognise on sight:

| Exception | Typical cause |
|-----------|---------------|
| \`NullPointerException\` | calling a method / reading a field on \`null\`; unboxing \`null\` |
| \`IllegalArgumentException\` | caller passed a bad **argument** (negative amount) |
| \`IllegalStateException\` | object in the wrong **state** for the call (stream already consumed) |
| \`ClassCastException\` | invalid downcast at runtime |
| \`IndexOutOfBoundsException\` | array/list index outside \`0..size-1\` |
| \`NumberFormatException\` | \`Integer.parseInt("abc")\` |
| \`UnsupportedOperationException\` | mutating an immutable collection |
| \`ArithmeticException\` | integer division by zero (note: \`1.0/0\` is \`Infinity\`, no exception) |
| \`ConcurrentModificationException\` | structurally modifying a collection mid-iteration |

:::tip
The **IAE vs ISE** distinction is a favourite follow-up: *bad input* → \`IllegalArgumentException\`; *right input, wrong time* → \`IllegalStateException\`. Using them precisely signals API-design maturity.
:::`,
  },
  {
    id: 'exc-custom-exceptions',
    question: 'How do you design a good custom exception?',
    difficulty: 'Medium',
    category: 'Exceptions',
    tags: ['custom-exceptions', 'design', 'best-practices'],
    answer: `Checklist:

1. **Pick the parent deliberately** — extend \`RuntimeException\` for programming/violation errors (the common modern default), \`Exception\` only when the caller can realistically **recover** and you want the compiler to force handling. Never extend \`Error\` or \`Throwable\`.
2. **Provide the standard constructors**, especially \`(String message, Throwable cause)\` so callers can chain the root cause.
3. **Carry structured context** — fields beat string-parsing.
4. Name it after the *problem*, ending in \`Exception\`.

\`\`\`java
public class InsufficientFundsException extends RuntimeException {
    private final String accountId;
    private final BigDecimal shortfall;

    public InsufficientFundsException(String accountId, BigDecimal shortfall, Throwable cause) {
        super("Account %s short by %s".formatted(accountId, shortfall), cause);
        this.accountId = accountId;
        this.shortfall = shortfall;
    }
    public BigDecimal shortfall() { return shortfall; }
}
\`\`\`

:::senior
Create a custom type only when callers will **handle it differently** than an existing one — a domain-specific hierarchy with 2–3 base types (e.g. \`ClientException\` vs \`ServerException\`) beats one exception class per method.
:::`,
  },
  {
    id: 'exc-try-finally-rules',
    question: 'Can a try block exist without catch? And is finally truly guaranteed to run?',
    difficulty: 'Medium',
    category: 'Exceptions',
    tags: ['finally', 'try-catch', 'edge-cases'],
    answer: `A \`try\` needs **at least one** of: a \`catch\`, a \`finally\`, or a resource declaration. \`try { } finally { }\` is perfectly legal — "no handling here, but guarantee my cleanup".

\`finally\` runs on normal completion, on exception, and even on \`return\`/\`break\`/\`continue\` out of the \`try\`. But "always" has exceptions — it does **not** run when:

1. **\`System.exit()\`** (or \`Runtime.halt()\`) terminates the JVM first,
2. the **JVM crashes** or is killed (\`kill -9\`, power loss),
3. the try block **never finishes** (infinite loop, indefinite block),
4. the thread is a **daemon** and the JVM exits.

\`\`\`java
try {
    System.exit(0);      // JVM gone —
} finally {
    log("cleanup");      // never prints
}
\`\`\`

:::key
Consequence for real systems: \`finally\` (and try-with-resources) is a *process-local* guarantee. Durable cleanup — releasing distributed locks, marking jobs done — needs timeouts/leases on the other side, because your process can always die mid-flight.
:::`,
  },
  {
    id: 'exc-npe-prevention',
    question: 'How do you prevent NullPointerExceptions in a codebase?',
    difficulty: 'Medium',
    category: 'Exceptions',
    tags: ['npe', 'null-safety', 'best-practices'],
    answer: `Layered defence, from API design inward:

1. **Don't return \`null\`** — return \`Optional<T>\` for "may be absent", empty collections instead of null collections.
2. **Fail fast at boundaries** — \`Objects.requireNonNull(param, "param")\` in constructors/setters, so the NPE points at the *culprit*, not a random later line.
3. **Null-hostile idioms** — \`"CONST".equals(value)\`, \`Objects.equals(a, b)\`, \`map.getOrDefault(k, fallback)\`.
4. **Annotations + tooling** — \`@Nullable\`/\`@NonNull\` (JSpecify) let IDEs and static analysis (NullAway, Error Prone) catch flows at build time.
5. **Make illegal states unrepresentable** — final fields set in constructors; records; avoid partially-initialised beans.

\`\`\`java
public Order(Customer customer) {
    this.customer = Objects.requireNonNull(customer, "customer");
}
\`\`\`

:::tip
Since Java 14, **Helpful NullPointerExceptions** name the exact null part: *"Cannot invoke String.length() because the return value of User.getName() is null"* — read the message before reaching for the debugger.
:::`,
  },
  {
    id: 'exc-precise-rethrow',
    question: 'What is "more precise rethrow" in Java 7+?',
    difficulty: 'Hard',
    category: 'Exceptions',
    tags: ['rethrow', 'checked', 'compiler'],
    answer: `Since Java 7 the compiler performs **flow analysis on rethrown exceptions**: if a catch parameter is *effectively final*, \`throw e\` is treated as throwing only the checked types **the try block can actually produce** — not the broad declared type of \`e\`.

\`\`\`java
void relay() throws IOException, SQLException {   // precise — not "throws Exception"
    try {
        if (flag) throw new IOException();
        else      throw new SQLException();
    } catch (Exception e) {     // caught broadly for shared handling
        log(e);
        throw e;                // compiler knows: only IOException | SQLException
    }
}
\`\`\`

Pre-Java-7 the same code forced \`throws Exception\` on the signature, poisoning every caller. Now you can catch broadly (one logging/cleanup block) yet keep a **precise, honest signature**.

:::gotcha
The analysis only applies while \`e\` is **effectively final** — assign anything to \`e\` inside the catch and the compiler falls back to the declared type, demanding \`throws Exception\` again.
:::`,
  },
  {
    id: 'exc-checked-controversy',
    question: 'Checked exceptions are controversial — what are the arguments, and what is the modern consensus?',
    difficulty: 'Hard',
    category: 'Exceptions',
    tags: ['checked', 'design', 'controversy'],
    answer: `**For checked** (the original vision): the compiler forces callers to confront recoverable failures — the failure mode is part of the API contract, impossible to forget.

**Against** (what 25 years of practice showed):

- They **don't compose**: \`Function\`/\`Runnable\`/\`Stream\` signatures declare no checked exceptions, so every lambda needs wrap-and-rethrow ceremony.
- They **leak implementation**: \`throws SQLException\` on a repository interface welds callers to JDBC.
- Under deadline pressure they breed the worst outcome: \`catch (Exception e) {}\` swallowing, or \`throws Exception\` creep up the stack.
- Most failures (network, DB down) aren't recoverable *at the call site* anyway — only at a top-level boundary.

Evidence of the consensus: Spring wraps \`SQLException\` into unchecked \`DataAccessException\`; Hibernate, Kotlin, Scala, and C# dropped checked exceptions entirely.

:::senior
Balanced senior position: default to **unchecked** + handle at boundaries; reserve checked for the rare case that is genuinely **recoverable by the immediate caller** and where forgetting would be catastrophic (e.g. \`InterruptedException\` — arguably the one that earns its keep).
:::`,
  },
  {
    id: 'exc-static-block-exception',
    question: 'What happens if an exception is thrown inside a static initializer block?',
    difficulty: 'Hard',
    category: 'Exceptions',
    tags: ['static', 'initialization', 'error'],
    answer: `Class initialization fails: the JVM wraps the thrown exception in **\`ExceptionInInitializerError\`** and marks the class **erroneous**. Every *subsequent* attempt to use the class throws **\`NoClassDefFoundError\`** — with no sign of the original cause.

\`\`\`java
class Config {
    static final String URL = load();       // throws at class init
    static String load() { throw new IllegalStateException("no config file"); }
}

new Config();  // ExceptionInInitializerError (cause: IllegalStateException)
new Config();  // NoClassDefFoundError: Could not initialize class Config
\`\`\`

Two consequences for debugging:

1. In logs, only the **first** failure carries the root cause — later \`NoClassDefFoundError\`s are red herrings. Always hunt for the earliest \`ExceptionInInitializerError\`.
2. A static block cannot throw **checked** exceptions at all (compile error) — you must catch and wrap.

:::senior
This is why heavyweight static initialization (config loading, DB access) is an anti-pattern: it turns a transient failure into a **permanently dead class** for the JVM's lifetime. Initialize lazily or in managed lifecycle code (e.g. a Spring bean), where failures are recoverable and visible.
:::`,
  },
];

export default questions;
