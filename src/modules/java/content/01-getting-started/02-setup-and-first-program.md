---
title: Setup & Your First Program
category: Getting Started
categoryOrder: 1
order: 2
level: Beginner
summary: Install a JDK, verify it, and write, compile, and run your first Java program — plus the beginner errors everyone hits.
tags: jdk, install, hello-world, javac, main-method
---

Reading about Java only gets you so far. In this topic you'll install the tools, then write, compile, and run a real program — the loop you'll repeat thousands of times.

## Installing a JDK

You write Java with the **JDK** (Java Development Kit). It bundles the compiler, the runtime, and the tooling. There are several distributions of the *same* OpenJDK source — pick one:

| Distribution | Who makes it | Notes |
|--------------|--------------|-------|
| **Eclipse Temurin** | Adoptium | Free, well-tested, the popular default |
| **Oracle JDK** | Oracle | Official; free for development, check the license for production |
| **OpenJDK** | The community / your OS | The reference build; often installed via a package manager |

Pick an **LTS** version — **Java 21** is the current long-term-support release and a great choice. Download an installer, or use a package manager:

```bash
# macOS (Homebrew)
brew install temurin

# Debian / Ubuntu
sudo apt install openjdk-21-jdk

# Windows (winget)
winget install EclipseAdoptium.Temurin.21.JDK
```

### Verify the install

Open a fresh terminal and confirm both the runtime and the compiler are on your `PATH`:

```bash
java -version     # the runtime that RUNS programs
javac -version    # the compiler that BUILDS them
```

You should see something like `openjdk version "21.0.x"` and `javac 21.0.x`. If `javac` is "command not found" but `java` works, you installed a runtime-only package instead of the full JDK.

:::gotcha
A common trap: `java -version` works but `javac` doesn't. That usually means a JRE (or a stale system Java) is on your `PATH` but the JDK's `bin` directory isn't. Reinstall the JDK and reopen your terminal so `PATH` changes take effect.
:::

## Your first program

Create a file named **`HelloWorld.java`** (the name matters — see below):

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

### Decoding `public static void main(String[] args)`

This signature is the exact "front door" the JVM looks for. Every word earns its place:

| Piece | Meaning |
|-------|---------|
| `public` | Accessible from anywhere — the JVM, which is "outside" your class, must be able to call it. |
| `static` | Belongs to the **class**, not an instance. The JVM calls it *without* first creating a `HelloWorld` object. |
| `void` | Returns nothing. The program's exit status comes from elsewhere, not a return value. |
| `main` | The exact name the JVM searches for to start execution. |
| `String[] args` | An array of command-line arguments. `java HelloWorld a b` makes `args` equal `["a", "b"]`. |

Change either of these — rename `main` or make it `private` — and the program compiles but fails to launch with *"Main method not found"*. (Since Java 25, JEP 512 also accepts an *instance* `void main`, so merely dropping `static` still launches.)

## Compile, then run

Java is a two-step language: **compile** source to bytecode, then **run** the bytecode. Each step can fail differently — `javac` catches **compile-time errors** (typos, type mismatches) before anything runs; exceptions at `java` time are **runtime errors**:

```mermaid
flowchart LR
    A["Edit HelloWorld.java"] --> B["javac HelloWorld.java"]
    B -->|"compile error"| A
    B -->|"produces HelloWorld.class"| C["java HelloWorld"]
    C -->|"exception or wrong output"| A
    C -->|"success"| D["Hello, World!"]
```

```bash
javac HelloWorld.java   # produces HelloWorld.class (bytecode)
java HelloWorld         # runs the class — NOTE: no ".class" extension!
```

Output:

```text
Hello, World!
```

:::tip
Since Java 11 you can skip the explicit compile step for quick experiments and run a single source file directly: `java HelloWorld.java`. It compiles in memory and runs immediately — perfect for learning, though real projects still compile to `.class` files.
:::

## Common beginner errors

**1. Public class name must match the filename.** A `public` class must live in a file of the same name. Putting `public class HelloWorld` in `hello.java` gives:

```text
error: class HelloWorld is public, should be declared
in a file named HelloWorld.java
```

Fix: rename the file (or the class) so they match, character-for-character including case.

**2. "Could not find or load main class".** This appears at *run* time and usually means one of:

- You typed the file, not the class: use `java HelloWorld`, **not** `java HelloWorld.class` or `java HelloWorld.java`.
- You're in the wrong directory, so the `.class` file isn't found.
- The class declares a `package`, so you must run it by its full name from the right root (more on the classpath in *Core Tooling*).

:::senior
Modern Java is trimming this ceremony. The simplified `main` finalized in **Java 25** lets you write just `void main()` (even printing via `IO.println(...)`), with no class wrapper required for a single file. The classic `public static void main(String[] args)` still works everywhere and is what you'll see in virtually all existing code — learn it first, enjoy the shortcut later.
:::

```quiz
title: Check yourself
questions:
  - q: '`javac Greet.java` succeeded. Which command runs the bytecode you just produced?'
    options:
      - '`java Greet.class`'
      - text: '`java Greet`'
        correct: true
      - '`javac Greet`'
    explain: 'The argument to `java` is a **class name**, not a file name. `java Greet.class` makes the JVM hunt for a class literally named `class` in a package `Greet` — hence "Could not find or load main class".'
  - q: 'The file `app.java` contains `public class App { ... }`. What happens when you compile it?'
    options:
      - 'It compiles — file names are just a convention'
      - text: 'Compile error — a public class must live in a file with exactly the same name'
        correct: true
      - 'It compiles but fails at runtime'
    explain: 'The compiler enforces `public class App` ⇒ `App.java`, matching case exactly. Rename the file or the class.'
  - q: 'Why must the classic `main` method be `static`?'
    options:
      - 'Static methods execute faster than instance methods'
      - text: 'So the JVM can call it without first constructing an object of your class'
        correct: true
      - 'Because `void` methods are required to be static'
    explain: 'At launch there are no objects yet — and the JVM has no idea how to construct one (which constructor? what arguments?). A static method belongs to the class itself, so it is callable immediately. (Java 25''s instance-main feature works precisely because the JVM now agrees to call your no-arg constructor first.)'
  - q: 'You run `java App one two`. What is `args[0]` inside `main`?'
    options:
      - '`"App"` — the program name, like C''s `argv[0]`'
      - text: '`"one"` — Java''s args array holds only the arguments'
        correct: true
      - '`"java"`'
    explain: 'Unlike C, the program name is **not** included. `args` is `["one", "two"]`, so `args.length` is 2 and `args[0]` is `"one"`.'
```

## What's next

You've run code without really knowing *what happens between `javac` and `java`*. The next topic opens that black box: bytecode, the JVM, and how the same `.class` file runs on any machine.

:::key
- Install the full **JDK** (e.g. Temurin 21) and verify with both `java -version` and `javac -version`.
- A `public` class must match its filename exactly.
- `javac File.java` compiles to bytecode; `java ClassName` runs it — **no `.class` extension** when running.
- `public static void main(String[] args)` is the JVM's required entry point: public so it can be called, static so no object is needed, void because it returns nothing.
:::
