import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'io-byte-vs-char',
    question: 'What is the difference between byte streams and character streams in java.io?',
    difficulty: 'Medium',
    category: 'I/O',
    tags: ['streams', 'reader', 'charset'],
    answer: `- **Byte streams** (\`InputStream\`/\`OutputStream\`) move raw 8-bit bytes. Use them for *binary* data — images, audio, zip, anything that isn't text. \`read()\` returns an \`int\` in \`0..255\`, or \`-1\` at end of stream.
- **Character streams** (\`Reader\`/\`Writer\`) move 16-bit \`char\`s and apply a **charset** to decode/encode. Use them for *text*, so encodings like UTF-8 are handled correctly.

Bridge the two with \`InputStreamReader\`/\`OutputStreamWriter\`, passing an explicit \`Charset\`:

\`\`\`java
var reader = new InputStreamReader(
        new FileInputStream("notes.txt"), StandardCharsets.UTF_8);
\`\`\`

:::gotcha
Read the byte loop into an \`int\`, not a \`byte\` — a \`byte\` can't distinguish the data value \`0xFF\` from the \`-1\` end-of-stream sentinel.
:::`,
  },
  {
    id: 'io-buffering',
    question: 'Why wrap a stream in a BufferedReader or BufferedInputStream?',
    difficulty: 'Medium',
    category: 'I/O',
    tags: ['buffering', 'performance', 'streams'],
    answer: `Without buffering, each \`read()\`/\`write()\` can cross into the operating system — **one syscall per byte**, which is catastrophically slow. A buffered wrapper transfers large chunks into an in-memory array and serves your small calls from it.

\`\`\`java
var in = new BufferedInputStream(new FileInputStream("big.bin"));
\`\`\`

\`BufferedReader\` also adds the convenient \`readLine()\`, and \`BufferedWriter\` adds \`newLine()\`. It's an application of the **decorator pattern**: the buffer wraps any underlying stream without knowing what it is.`,
  },
  {
    id: 'io-decorator-pattern',
    question: 'What design pattern underlies java.io, and why does it matter?',
    difficulty: 'Medium',
    category: 'I/O',
    tags: ['decorator', 'design-patterns', 'streams'],
    answer: `The **decorator pattern**. Small classes each *wrap* another stream and add exactly one capability; you compose them from the inside out, and every wrapper implements the same abstract type it decorates, so they nest freely.

\`\`\`java
var r = new BufferedReader(            // adds buffering + readLine()
          new InputStreamReader(       // bytes -> chars (charset)
            new FileInputStream(f),    // raw bytes from disk
            StandardCharsets.UTF_8));
\`\`\`

This is why \`java.io\` has many small classes instead of one giant reader with dozens of flags — capabilities (buffering, decoding, compression via \`GZIPInputStream\`) combine without a class explosion.`,
  },
  {
    id: 'io-try-with-resources',
    question: 'How does try-with-resources work, and what problems does it solve?',
    difficulty: 'Medium',
    category: 'I/O',
    tags: ['try-with-resources', 'autocloseable', 'exceptions'],
    answer: `Any resource implementing \`AutoCloseable\` and declared in the \`try (...)\` header is closed **automatically** when the block exits — normally or via exception/return — in **reverse** order of declaration.

\`\`\`java
try (var in  = Files.newInputStream(src);
     var out = Files.newOutputStream(dst)) {
    in.transferTo(out);
}   // out closed first, then in
\`\`\`

It fixes two recurring bugs:
1. **Leaked file descriptors** from forgetting \`close()\` in a hand-written \`finally\`.
2. **Lost data** — closing a buffered output stream flushes it first.

:::senior
If the body *and* \`close()\` both throw, the body's exception propagates and the close exception is attached as a **suppressed** exception (\`Throwable.getSuppressed()\`). The old \`try/finally\` idiom silently discarded the original.
:::`,
  },
  {
    id: 'io-nio-vs-file',
    question: 'Why prefer NIO.2 (Path/Files) over the legacy java.io.File?',
    difficulty: 'Medium',
    category: 'I/O',
    tags: ['nio', 'path', 'files'],
    answer: `\`java.io.File\` swallows errors: \`delete()\` and \`mkdir()\` return a \`boolean\` \`false\` on failure and tell you **nothing**. NIO.2's \`Files\` throws a **descriptive \`IOException\`** explaining what went wrong.

NIO.2 also adds:
- one-liners: \`Files.readString\`, \`writeString\`, \`copy\`, \`move\`;
- \`Stream\`-based traversal: \`Files.lines\`, \`Files.walk\`;
- **atomic moves**, symbolic-link support, file-attribute views, and a \`WatchService\`.

\`Path\` is immutable and built with \`Path.of("a", "b")\`. Bridge to old code with \`file.toPath()\` / \`path.toFile()\`.`,
  },
  {
    id: 'io-files-lines-close',
    question: 'Why must Files.lines() and Files.walk() be closed?',
    difficulty: 'Hard',
    category: 'I/O',
    tags: ['nio', 'files', 'streams', 'resource-leak'],
    answer: `Both return a lazy \`Stream\` backed by an **open file handle** (or directory handle). Unlike a stream over an in-memory \`List\`, the OS resource is *not* released by garbage collection promptly — so you leak a descriptor on every call until the process eventually fails with "too many open files."

\`\`\`java
try (Stream<String> lines = Files.lines(Path.of("huge.log"))) {
    long errors = lines.filter(l -> l.contains("ERROR")).count();
}   // stream closed -> handle released
\`\`\`

Always wrap them in **try-with-resources**. (\`Files.readAllLines\` doesn't leak — but it loads the whole file into memory, risking \`OutOfMemoryError\` on large inputs.)`,
  },
  {
    id: 'io-serialversionuid',
    question: 'What is serialVersionUID and why declare it explicitly?',
    difficulty: 'Medium',
    category: 'I/O',
    tags: ['serialization', 'serialversionuid', 'compatibility'],
    answer: `It's a \`private static final long\` version stamp. On deserialization the JVM compares the stream's UID with the loaded class's UID; a mismatch throws \`InvalidClassException\`.

If you **don't** declare one, the compiler generates it from the class's structure (fields, methods, modifiers) — so almost any change silently produces a different UID and rejects previously serialized data.

\`\`\`java
@Serial
private static final long serialVersionUID = 1L;
\`\`\`

:::gotcha
The trap: serialize objects today, add a field next sprint, and all old \`.ser\` files now fail to load. Declaring an explicit UID lets you control compatibility intentionally. The \`@Serial\` annotation (Java 14+) makes the compiler verify the signature.
:::`,
  },
  {
    id: 'io-serialization-danger',
    question: 'Why is Java serialization considered dangerous, and what do teams use instead?',
    difficulty: 'Hard',
    category: 'I/O',
    tags: ['serialization', 'security', 'json', 'protobuf'],
    answer: `Two reasons.

**Security.** Deserializing untrusted bytes is a notorious **remote-code-execution** vector: a crafted stream triggers "gadget chains" during \`readObject\` *before* you can validate anything (the Apache Commons Collections CVEs are the classic case). \`readObject\` is essentially a hidden constructor that bypasses your real ones. Java 9 added \`ObjectInputFilter\` (JEP 290) to allowlist classes, but the golden rule remains: **never deserialize data you don't trust**.

**Maintenance.** The serialized form becomes part of your public API — refactoring breaks it, the format is opaque binary, and it's Java-only.

So teams prefer:
- **JSON** (Jackson/Gson): human-readable, ubiquitous, great for APIs;
- **Protobuf / Avro**: compact, fast, schema-versioned, cross-language.

:::senior
*Effective Java* recommends avoiding Java serialization entirely; if forced, use the **serialization proxy pattern** to rebuild objects through normal constructors and restore invariants.
:::`,
  },
];

export default questions;
