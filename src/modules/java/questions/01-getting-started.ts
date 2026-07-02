import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'intro-jdk-jre-jvm',
    question: 'What is the difference between the JDK, JRE, and JVM?',
    difficulty: 'Easy',
    category: 'Core Java',
    tags: ['jvm', 'jdk', 'fundamentals'],
    answer: `They are nested layers — each one contains the one below it:

- **JVM (Java Virtual Machine)** — the engine that *executes* bytecode. It's platform-specific and delivers "write once, run anywhere".
- **JRE (Java Runtime Environment)** — JVM **+** the core class libraries. Enough to *run* a Java app, but no compiler.
- **JDK (Java Development Kit)** — JRE **+** development tools (\`javac\`, \`jar\`, \`javap\`, \`jdb\`). What you need to *build* Java.

\`\`\`text
JDK  ⊇  JRE  ⊇  JVM
\`\`\`

:::tip
As a developer you install the **JDK** — it includes everything else. Since Java 11 there's no separate JRE download; you trim a custom runtime with \`jlink\` if needed.
:::`,
  },
  {
    id: 'intro-main-signature',
    question: 'Explain every part of public static void main(String[] args).',
    difficulty: 'Medium',
    category: 'Core Java',
    tags: ['main-method', 'entry-point'],
    answer: `It's the exact entry point the JVM looks for to start a program:

| Part | Why it's there |
|------|----------------|
| \`public\` | The JVM calls it from "outside" the class, so it must be accessible. |
| \`static\` | Lets the JVM invoke it **without creating an object** first. |
| \`void\` | It returns nothing — the program doesn't hand a value back to the JVM. |
| \`main\` | The exact method name the JVM searches for. |
| \`String[] args\` | Command-line arguments; \`java App a b\` gives \`args = ["a", "b"]\`. |

Change any part — rename \`main\`, remove \`static\`, or make it \`private\` — and it compiles but fails at launch with *"Main method not found"*.

:::senior
Java 25 finalized a simplified form: you can write just \`void main()\` with no class wrapper for a single file. The classic signature still works everywhere and dominates existing code, so learn it first.
:::`,
  },
  {
    id: 'intro-compile-vs-run',
    question: 'What is the difference between javac and java?',
    difficulty: 'Easy',
    category: 'Core Java',
    tags: ['javac', 'java', 'tooling'],
    answer: `Java is a two-step language:

- **\`javac\`** is the **compiler**. \`javac HelloWorld.java\` reads your source and produces **bytecode** in \`HelloWorld.class\`.
- **\`java\`** is the **launcher**. \`java HelloWorld\` starts the JVM, which loads and executes that bytecode.

\`\`\`bash
javac HelloWorld.java   # source -> HelloWorld.class
java HelloWorld         # run the class (NO .class extension!)
\`\`\`

:::gotcha
When running, pass the **class name**, not the file: \`java HelloWorld\`, never \`java HelloWorld.class\`. (Since Java 11 you *can* run a single source file directly with \`java HelloWorld.java\`, which compiles in memory.)
:::`,
  },
  {
    id: 'intro-what-is-bytecode',
    question: 'What is bytecode and why does Java use it?',
    difficulty: 'Medium',
    category: 'Core Java',
    tags: ['bytecode', 'jvm', 'portability'],
    answer: `**Bytecode** is the JVM's instruction set — a compact, **platform-neutral** binary format produced by \`javac\`. Instead of x86 or ARM machine instructions, it uses JVM opcodes like \`iload\`, \`iadd\`, and \`invokevirtual\` on a stack-based machine.

Java uses it to decouple the language from the hardware:

- The **same** \`.class\` file runs on any OS/CPU — only the JVM is platform-specific. That's how "write once, run anywhere" works.
- It's a clean target for **JIT optimization** at runtime.

You can disassemble it with \`javap -c MyClass\` to see exactly what the compiler produced.

:::gotcha
Bytecode is **not** secure or encrypted — it decompiles easily back to readable Java. Never hide secrets like passwords or API keys in compiled code.
:::`,
  },
  {
    id: 'intro-interpreter-vs-jit',
    question: 'How do the interpreter and the JIT compiler work together in the JVM?',
    difficulty: 'Medium',
    category: 'Core Java',
    tags: ['jit', 'interpreter', 'performance'],
    answer: `The JVM combines both for the best of fast startup *and* fast steady-state:

1. **Interpreter** — on startup, the JVM reads and executes bytecode one opcode at a time. Quick to begin, but slower per instruction.
2. **JIT (Just-In-Time) compiler** — the JVM *profiles* execution and, when a method or loop becomes "hot", compiles it to optimized **native machine code** that runs at near-C speed.

Java uses **tiered compilation**: the fast **C1** compiler kicks in first, then the aggressive **C2** compiler optimizes the hottest paths.

This is why a long-running Java server gets **faster after warming up** — the JIT has optimized the hot code.

:::senior
The flip side: short-lived programs (CLIs, serverless functions) never warm up. The modern fix is **Ahead-of-Time** compilation with **GraalVM Native Image**, which produces a native binary that starts in milliseconds.
:::`,
  },
  {
    id: 'intro-public-class-filename',
    question: 'Why must a public class name match its file name?',
    difficulty: 'Easy',
    category: 'Core Java',
    tags: ['compilation', 'errors', 'conventions'],
    answer: `It's a rule the **compiler enforces**: a \`public\` top-level class must live in a file with the same name (case included). It lets the compiler and class loader locate a class from its name alone — \`com.example.Foo\` reliably maps to \`Foo.class\`.

Put \`public class HelloWorld\` in \`hello.java\` and \`javac\` refuses:

\`\`\`text
error: class HelloWorld is public, should be declared
in a file named HelloWorld.java
\`\`\`

:::tip
Only the **public** class is constrained. A single file may hold several non-public (package-private) top-level classes, but at most one public one — and that's the one that must match the file name.
:::`,
  },
  {
    id: 'intro-classpath',
    question: 'What is the classpath?',
    difficulty: 'Medium',
    category: 'Core Java',
    tags: ['classpath', 'tooling', 'jar'],
    answer: `The **classpath** tells the JVM (and \`javac\`) **where to look for classes and jars** to load. If something a program needs isn't on it, you get \`ClassNotFoundException\` or \`NoClassDefFoundError\`.

\`\`\`bash
java -cp "out:libs/gson.jar" com.example.App
\`\`\`

- Set it with \`-cp\` / \`-classpath\` or the \`CLASSPATH\` environment variable.
- Defaults to the current directory (\`.\`) if unset.
- The separator is **OS-specific**: \`:\` on macOS/Linux, \`;\` on Windows.

:::gotcha
That separator difference is a classic "works on my machine" bug — a classpath string copied from Linux (\`:\`) silently breaks on Windows, which expects \`;\`.
:::

Its stronger successor is the **module path** (\`--module-path\`), introduced with the Java 9 module system for reliable, encapsulated configuration.`,
  },
  {
    id: 'intro-class-loading',
    question: 'How does the JVM load classes, and what is the parent-delegation model?',
    difficulty: 'Hard',
    category: 'Core Java',
    tags: ['classloading', 'jvm', 'internals'],
    answer: `The JVM loads classes **lazily** — a \`.class\` is read only when first referenced — through a hierarchy of **class loaders**:

1. **Bootstrap** — loads core JDK classes (\`java.lang.*\`).
2. **Platform** — loads other standard library modules.
3. **Application (system)** — loads your app's classes from the classpath.

**Parent-delegation model:** before loading a class itself, a loader first asks its **parent** to load it. So core types are always loaded by the trusted bootstrap loader. This prevents a malicious \`java.lang.String\` on the classpath from overriding the real one.

After loading, a class is **linked** (verify → prepare → resolve) and then **initialized** (its \`static\` initializers run on first active use).

\`\`\`text
load -> verify -> prepare -> resolve -> initialize
\`\`\`

:::senior
The **bytecode verifier** runs during linking and rejects malformed or unsafe bytecode (bad stack operations, type violations) *before* it can execute — a cornerstone of the JVM's security sandbox.
:::`,
  },
];

export default questions;
