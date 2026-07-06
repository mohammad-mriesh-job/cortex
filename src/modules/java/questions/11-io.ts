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
  {
    id: 'io-serializable-transient',
    question: 'How does Java serialization work, and what does transient do?',
    difficulty: 'Medium',
    category: 'I/O',
    tags: ['serialization', 'serializable', 'transient'],
    answer: `A class opts in by implementing the marker interface **\`Serializable\`**. \`ObjectOutputStream.writeObject\` then walks the object graph and writes every reachable, non-transient instance field — recursively, so referenced objects must be \`Serializable\` too.

\`\`\`java
class User implements Serializable {
    private String name;
    private transient String password;   // NOT serialized
    private static int count;             // NOT serialized (belongs to the class)
}
\`\`\`

- **\`transient\`** excludes a field — it's restored to its default (\`null\`/\`0\`/\`false\`). Use it for **derived**, **sensitive** (passwords, secrets), or **non-serializable** fields (e.g. a \`Thread\`, a \`Connection\`).
- **\`static\`** fields are never serialized (they're class state, not instance state).

:::gotcha
Deserialization **does not call your constructor** — \`readObject\` reconstructs the object field-by-field, bypassing constructor validation and \`final\`-field initialization logic. That's why invariants can be violated and why custom \`readObject\`/\`readResolve\` or a serialization proxy is sometimes needed.
:::`,
  },
  {
    id: 'io-externalizable',
    question: 'What is the difference between Serializable and Externalizable?',
    difficulty: 'Medium',
    category: 'I/O',
    tags: ['serialization', 'externalizable', 'performance'],
    answer: `Both make an object persistable, but control and mechanism differ:

| | \`Serializable\` | \`Externalizable\` |
|--|----------------|-------------------|
| Format | automatic (reflection) | **you write it** (\`writeExternal\`/\`readExternal\`) |
| Control | customize via \`writeObject\`/\`readObject\` | full control of every byte |
| Construction | no constructor called | **public no-arg constructor** called, then \`readExternal\` |
| Speed/size | slower, larger | faster, smaller (if hand-tuned) |

\`\`\`java
class Point implements Externalizable {
    int x, y;
    public Point() {}                                  // required no-arg ctor
    public void writeExternal(ObjectOutput o) throws IOException {
        o.writeInt(x); o.writeInt(y);
    }
    public void readExternal(ObjectInput in) throws IOException {
        x = in.readInt(); y = in.readInt();
    }
}
\`\`\`

:::gotcha
\`Externalizable\` calls the **public no-arg constructor** before \`readExternal\` — forget it and you get \`InvalidClassException\`. In practice both are legacy; new systems use **JSON/Protobuf** instead of either.
:::`,
  },
  {
    id: 'io-bio-vs-nio',
    question: 'What is the difference between classic java.io (streams) and java.nio (channels/buffers)?',
    difficulty: 'Medium',
    category: 'I/O',
    tags: ['nio', 'channels', 'buffers', 'blocking'],
    answer: `| | Classic I/O (\`java.io\`) | NIO (\`java.nio\`) |
|--|------------------------|------------------|
| Model | **stream**-oriented | **buffer**-oriented |
| Direction | one-way streams | **channels** (read *and* write) |
| Blocking | always **blocking** | blocking **or non-blocking** |
| Scaling | one thread per connection | one thread, **many** channels (selectors) |

Classic I/O reads a byte/char at a time from a one-way stream, and the calling thread **blocks** until data arrives — simple, but a server needs a thread per connection.

NIO reads into a reusable **\`ByteBuffer\`** through a bidirectional **\`Channel\`**, and channels can run **non-blocking**, so one thread multiplexes thousands of connections via a **\`Selector\`**.

\`\`\`java
try (var channel = FileChannel.open(path)) {
    ByteBuffer buf = ByteBuffer.allocate(1024);
    channel.read(buf);   // fill the buffer
    buf.flip();          // switch from writing to reading
}
\`\`\`

:::note
For plain **file** work either is fine (prefer NIO.2's \`Files\`/\`Path\`). NIO's real payoff is **scalable network servers**; buffer management (\`flip\`/\`clear\`/\`compact\`) is the tricky part.
:::`,
  },
  {
    id: 'io-selectors',
    question: 'How do selectors let one thread handle thousands of connections?',
    difficulty: 'Hard',
    category: 'I/O',
    tags: ['nio', 'selector', 'non-blocking', 'reactor'],
    answer: `A **\`Selector\`** multiplexes many non-blocking channels. You register each channel with the operations you care about (\`OP_ACCEPT\`, \`OP_READ\`, \`OP_WRITE\`); a single thread then calls \`select()\`, which **blocks until at least one channel is ready**, and processes only those — the **reactor / event-loop** pattern:

\`\`\`java
selector.select();                              // wait for readiness
for (SelectionKey key : selector.selectedKeys()) {
    if (key.isReadable()) read((SocketChannel) key.channel());
    // handle only channels that are actually ready
}
\`\`\`

Instead of **one blocked thread per connection** (thread-per-connection), one thread services all ready connections, so 10,000 idle sockets cost ~1 thread, not 10,000. This is how Netty and event-driven servers scale.

:::senior
The event-loop model is powerful but its inverted, callback-driven control flow is hard to write and debug. **Java 21 virtual threads** offer much of the same scalability with ordinary **blocking** code (thread-per-request that's cheap), which is why many new services choose them over hand-written NIO selector loops.
:::`,
  },
  {
    id: 'io-charset-default',
    question: 'Why should you always specify a charset explicitly when reading or writing text?',
    difficulty: 'Medium',
    category: 'I/O',
    tags: ['charset', 'encoding', 'utf-8'],
    answer: `Before Java 18, text methods that took no charset used the **platform default**, which varied by OS and locale (Windows-1252 on Windows, UTF-8 on most Linux). The same code then produced **different bytes** on different machines — silent mojibake, or a \`MalformedInputException\` on non-ASCII data. The classic "works on my machine, corrupts in production" bug.

Always pass an explicit charset:

\`\`\`java
String text = new String(bytes, StandardCharsets.UTF_8);
Files.writeString(path, text, StandardCharsets.UTF_8);
var r = new InputStreamReader(in, StandardCharsets.UTF_8);
\`\`\`

:::senior
**JEP 400 (Java 18)** made **UTF-8 the default** for the standard APIs, removing much of this footgun. But explicit \`StandardCharsets.UTF_8\` is still best practice — it's unambiguous, portable across JDK versions, and self-documenting. (\`Files.readString\`/\`writeString\` already default to UTF-8.)
:::`,
  },
  {
    id: 'io-read-file-ways',
    question: 'What are the ways to read a text file in modern Java?',
    difficulty: 'Easy',
    category: 'I/O',
    tags: ['nio', 'files', 'reading'],
    answer: `NIO.2's \`Files\` covers almost every case:

| Approach | Returns | Best for |
|----------|---------|----------|
| \`Files.readString(path)\` | whole file as \`String\` | small files (Java 11+) |
| \`Files.readAllLines(path)\` | \`List<String>\` | small files, need lines |
| \`Files.lines(path)\` | lazy \`Stream<String>\` | **large** files (streaming) |
| \`BufferedReader.readLine()\` | line-by-line loop | classic streaming |

\`\`\`java
String all = Files.readString(path);                    // tiny config file

try (Stream<String> lines = Files.lines(path)) {         // huge log — close it!
    long errors = lines.filter(l -> l.contains("ERROR")).count();
}
\`\`\`

:::gotcha
\`readString\`/\`readAllLines\` load the **entire file into memory** — fine for a config, an \`OutOfMemoryError\` for a multi-GB log. Use \`Files.lines\` (lazy, and wrap it in try-with-resources because it holds an open file handle).
:::`,
  },
  {
    id: 'io-flush',
    question: 'What does flush() do, and why can output be lost without it?',
    difficulty: 'Easy',
    category: 'I/O',
    tags: ['buffering', 'flush', 'output'],
    answer: `Buffered output streams collect writes in an in-memory buffer and only send them onward in bulk (for performance). **\`flush()\`** forces whatever is buffered out to the underlying destination *now*. If you neither flush nor close, buffered data can be **silently lost** — the file ends up truncated or empty:

\`\`\`java
var w = new BufferedWriter(new FileWriter("out.txt"));
w.write("important data");
// forgot flush/close -> buffer never written -> empty file!
\`\`\`

Two things flush for you:
- **\`close()\`** flushes before closing.
- **try-with-resources** calls \`close()\` automatically.

\`\`\`java
try (var w = new BufferedWriter(new FileWriter("out.txt"))) {
    w.write("important data");
}   // auto-flush + close — data is safely written
\`\`\`

:::tip
\`PrintWriter\`/\`PrintStream\` can auto-flush on newline (constructor flag), which is why \`System.out.println\` appears immediately. For everything buffered, rely on try-with-resources rather than manual \`flush()\`.
:::`,
  },
  {
    id: 'io-scanner-vs-bufferedreader',
    question: 'Scanner vs BufferedReader for reading input — which and when?',
    difficulty: 'Easy',
    category: 'I/O',
    tags: ['scanner', 'bufferedreader', 'input'],
    answer: `Both read text; they operate at different levels:

| | \`Scanner\` | \`BufferedReader\` |
|--|-----------|-------------------|
| Reads | **tokens** (\`nextInt\`, \`next\`, \`nextLine\`) | **lines / chars** (\`readLine\`) |
| Parsing | built-in (regex-based) | you parse manually |
| Speed | slower | **faster** (larger buffer, no parsing) |
| Thread-safe | no | \`readLine\` is synchronized |

\`\`\`java
var sc = new Scanner(System.in);
int n = sc.nextInt();                 // parses a token for you

var br = new BufferedReader(new InputStreamReader(System.in));
int m = Integer.parseInt(br.readLine().trim());  // fast, manual parse
\`\`\`

- **\`Scanner\`** — convenient for interactive parsing of mixed types; the default for small/simple input.
- **\`BufferedReader\`** — when you read large volumes of lines and want speed (competitive programming, log processing).

:::gotcha
Mixing \`nextInt()\` then \`nextLine()\` on a \`Scanner\` is a classic trap: \`nextInt\` leaves the line's trailing newline, so the next \`nextLine\` returns an empty string. Read and discard, or use \`nextLine\` + parse throughout.
:::`,
  },
];

export default questions;
