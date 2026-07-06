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
  {
    id: 'intro-java-features',
    question: 'What are the main features of Java?',
    difficulty: 'Easy',
    category: 'Core Java',
    tags: ['fundamentals', 'features', 'screening'],
    answer: `The headline features an interviewer expects to hear:

1. **Platform independence** — compile once to bytecode, run on any JVM ("write once, run anywhere").
2. **Object-oriented** — code is organised into classes and objects, with encapsulation, inheritance, and polymorphism.
3. **Automatic memory management** — the garbage collector reclaims unused objects; no manual \`free()\`, no dangling pointers.
4. **Strong static typing** — most type errors are caught at compile time.
5. **Rich standard library & ecosystem** — collections, concurrency, I/O, networking out of the box, plus Maven Central.
6. **Built-in multithreading** — threads, a defined memory model, and \`java.util.concurrent\` in the core platform.
7. **Safety** — no pointer arithmetic, bytecode verification, array bounds checks.
8. **Backward compatibility** — 20-year-old bytecode still runs on modern JVMs, which is why enterprises trust it.

:::tip
Don't just list — be ready to go one level deeper on any item, e.g. *how* platform independence works (bytecode + per-platform JVMs) or *what* the GC trade-off is (pauses vs manual management).
:::`,
  },
  {
    id: 'intro-wora-jvm-dependent',
    question: 'If Java is platform-independent, why is the JVM platform-dependent?',
    difficulty: 'Easy',
    category: 'Core Java',
    tags: ['jvm', 'portability', 'bytecode'],
    answer: `Because the JVM is precisely the layer that **absorbs** the platform differences. Your program compiles to **bytecode**, which is identical on every OS. Something still has to translate that bytecode into real x86/ARM instructions and real OS calls — that something is the JVM, so there is a separate JVM build *for each* OS/CPU combination.

\`\`\`text
App.java -> javac -> App.class (same bytes everywhere)
App.class -> JVM for macOS / Linux / Windows -> native execution
\`\`\`

So the correct statement is: **Java programs are platform-independent; the JVM is not — and that's by design.** The portability of millions of apps is bought by porting one program (the JVM) per platform.

:::gotcha
Platform independence ends where your code touches the platform: JNI/native libraries, hard-coded file separators (\`C:\\\\...\`), assumptions about the default charset or line endings. "Runs anywhere" still requires writing portable code.
:::`,
  },
  {
    id: 'intro-pure-oop',
    question: 'Is Java a pure object-oriented language?',
    difficulty: 'Easy',
    category: 'Core Java',
    tags: ['oop', 'primitives', 'fundamentals'],
    answer: `**No**, and interviewers want the two reasons:

1. **Primitives** — \`int\`, \`double\`, \`boolean\`, etc. are not objects. They have no methods and don't live on the heap as objects.
2. **Static members** — \`static\` methods and fields belong to a class, not to any object, so behaviour can exist without an instance.

Java compensates with **wrapper classes** (\`Integer\`, \`Double\`, ...) and **autoboxing**, so primitives can flow into collections and generics.

The pragmatic reason primitives exist is **performance**: an \`int\` is 4 bytes of raw value, while an \`Integer\` is a heap object with a header and a reference pointing at it — worse memory footprint and cache behaviour.

:::senior
Project **Valhalla** (value classes) aims to give Java "codes like a class, works like an \`int\`" — flattened, identity-free value objects — closing this historic gap between abstraction and performance.
:::`,
  },
  {
    id: 'intro-jar-file',
    question: 'What is a JAR file, and how do you run one?',
    difficulty: 'Easy',
    category: 'Core Java',
    tags: ['jar', 'packaging', 'tooling'],
    answer: `A **JAR (Java ARchive)** is a ZIP file containing compiled \`.class\` files, resources (configs, images), and metadata under \`META-INF/MANIFEST.MF\`. It's the standard unit for packaging and distributing Java code — every Maven/Gradle dependency is a JAR.

\`\`\`bash
jar --create --file app.jar -C out .   # package compiled classes
java -jar app.jar                      # run it
\`\`\`

\`java -jar\` works only if the manifest declares the entry point:

\`\`\`text
Main-Class: com.example.App
\`\`\`

Without that, you run it via the classpath instead: \`java -cp app.jar com.example.App\`.

:::note
A plain JAR does **not** contain its dependencies. Application servers and build plugins solve this with a **fat/uber JAR** (all dependencies repackaged inside — what \`spring-boot-maven-plugin\` builds) or a \`Class-Path\` manifest entry pointing at neighbouring JARs.
:::`,
  },
  {
    id: 'intro-java-se-ee',
    question: 'What is the difference between Java SE and Jakarta EE?',
    difficulty: 'Easy',
    category: 'Core Java',
    tags: ['java-se', 'jakarta-ee', 'ecosystem'],
    answer: `- **Java SE (Standard Edition)** — the core platform: the language, the JVM, and the base libraries (\`java.lang\`, collections, I/O, concurrency, JDBC). What you install as "the JDK".
- **Jakarta EE (formerly Java EE)** — a set of **specifications built on top of SE** for enterprise servers: Servlets, JPA (persistence), CDI (dependency injection), JAX-RS (REST), Bean Validation, messaging. Vendors (Payara, WildFly, Open Liberty, Tomcat for the web tier) provide the implementations.

After Oracle donated Java EE to the Eclipse Foundation (2017), it was renamed **Jakarta EE**, and packages migrated \`javax.*\` → \`jakarta.*\` (EE 9+) — the import change that breaks old tutorials.

:::tip
In practice most teams consume these specs *through Spring Boot*: it runs on Java SE, embeds a servlet container, and uses Jakarta specs selectively (Servlet API, JPA via Hibernate, Bean Validation) without a full EE application server.
:::`,
  },
  {
    id: 'intro-overload-main',
    question: 'Can you overload main()? Can you make it final or synchronized?',
    difficulty: 'Medium',
    category: 'Core Java',
    tags: ['main-method', 'overloading', 'tricky'],
    answer: `**Yes to all three** — \`main\` is an ordinary static method with one special property: the JVM launches the exact signature \`public static void main(String[])\`.

\`\`\`java
public class App {
    public static void main(String[] args) {      // JVM entry point
        main(42);                                 // you call overloads yourself
    }
    public static void main(int n) { }            // legal overload — JVM ignores it
}
\`\`\`

- **Overloading** — fine; only the \`String[]\` version is the entry point.
- **\`final\` / \`synchronized\` / \`strictfp\`** — all legal modifiers; the JVM doesn't care.
- **Overriding** — impossible: \`main\` is \`static\`, and static methods are *hidden*, not overridden. A subclass \`main\` is a separate entry point.

:::gotcha
Declaring \`main(String... args)\` (varargs) **does** work as an entry point — varargs compiles to the same \`String[]\` signature. But \`main(String args)\` or \`int main(...)\` will compile and then fail at launch with "Main method not found".
:::`,
  },
];

export default questions;
