---
title: java.io Streams
category: I/O, Files & Serialization
categoryOrder: 11
order: 1
level: Intermediate
summary: Byte streams vs character streams, buffering for performance, the decorator pattern that composes them, and try-with-resources for leak-free cleanup.
tags: io, streams, reader, writer, buffering, try-with-resources
---

Java models I/O as **streams**: ordered sequences of data you read from a *source* or write to a *destination* — a file, a socket, an in-memory array, `System.out`. The `java.io` package splits this into two parallel hierarchies, one for raw **bytes** and one for **characters**.

## Byte streams vs character streams

| | Byte streams | Character streams |
|---|---|---|
| Root classes | `InputStream` / `OutputStream` | `Reader` / `Writer` |
| Unit | 8-bit `byte` | 16-bit `char` (decoded via a charset) |
| Use for | binary: images, audio, zip, any raw data | text |
| Examples | `FileInputStream`, `BufferedOutputStream` | `FileReader`, `BufferedWriter` |
| Bridge | — | `InputStreamReader` / `OutputStreamWriter` |

`InputStream`/`OutputStream` move 8-bit bytes — `read()` returns an `int` in `0..255`, or `-1` at end of stream. Reach for them for *binary* data: images, PDFs, compressed archives, anything that isn't text.

`Reader`/`Writer` move 16-bit `char`s and apply a **charset** to decode bytes into text (and encode it back). Use them for text so multi-byte encodings like UTF-8 are handled correctly. The bridge between the two worlds is `InputStreamReader` (wraps a byte `InputStream`, decodes with a `Charset`) and `OutputStreamWriter` (the reverse).

```java
try (var reader = new BufferedReader(
        new InputStreamReader(
            new FileInputStream("notes.txt"), StandardCharsets.UTF_8))) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
}
```

:::note
Legacy `FileReader`/`FileWriter` used the platform **default charset**, producing files that broke on other machines. Since JEP 400 (Java 18) the default is UTF-8, but be explicit anyway — pass `StandardCharsets.UTF_8` or use `Files.newBufferedReader(path)`, which is UTF-8 by default.
:::

## The decorator pattern

`java.io` is the textbook example of the **decorator pattern**: small classes that each *wrap* another stream and add exactly one capability. You compose them from the inside out, and because every wrapper implements the same abstract type it decorates, they nest arbitrarily.

```mermaid
flowchart LR
    A["FileInputStream (raw bytes)"] --> B["InputStreamReader (bytes to chars, charset)"]
    B --> C["BufferedReader (buffering + readLine)"]
```

`BufferedReader` neither knows nor cares whether its ultimate source is a file, a socket, or a string — it just decorates a `Reader`. This composition is why `java.io` has so many small classes instead of one giant `File` reader with dozens of flags.

## Buffering

Without a buffer, every `read()`/`write()` may cross into the operating system — one syscall per byte is catastrophically slow. `BufferedInputStream`, `BufferedOutputStream`, `BufferedReader`, and `BufferedWriter` move large chunks into an in-memory array and serve your small calls from it. As a bonus, `BufferedReader` adds `readLine()` and `BufferedWriter` adds `newLine()`.

```java
int b;                                   // MUST be int, not byte
try (var in = new FileInputStream("a.bin")) {
    while ((b = in.read()) != -1) {      // -1 signals end of stream
        process(b);
    }
}
```

:::gotcha
A `byte` ranges `-128..127`, so the valid data byte `0xFF` *equals* `-1` — using a `byte` loop variable would stop early on binary data. `read()` returns an `int` precisely so the `-1` sentinel is unambiguous.
:::

## The other decorators worth knowing

- **`DataInputStream` / `DataOutputStream`** — read/write Java primitives in portable big-endian binary (`readInt`, `writeDouble`); the building block of simple wire formats.
- **`PushbackInputStream`** — `unread()` bytes back onto the stream; handy for parsers that peek at a header before deciding.
- **`PrintStream` vs `PrintWriter`** — both add `print`/`printf`. The critical difference: `PrintStream` (what `System.out` is) **never throws `IOException`** — it swallows errors and sets an internal flag you must poll with `checkError()`. Fine for console logging, wrong for data you cannot afford to lose.
- **`ByteArrayInputStream` / `StringReader`** — in-memory sources, invaluable for unit-testing stream-handling code with no files at all.

For whole-file convenience, skip the stream plumbing entirely: `Files.readString(path)`, `Files.readAllLines(path)`, and `Files.lines(path)` (a lazy `Stream<String>` — close it, it holds the file open) cover most everyday reads in one line.

## Always use try-with-resources

Streams hold OS handles; leaking them eventually exhausts the file-descriptor table. Let the compiler close them: any `AutoCloseable` declared in a `try (...)` header is closed automatically, in **reverse** order, even if the body throws or returns.

```java
try (var in  = Files.newInputStream(Path.of("a.bin"));
     var out = Files.newOutputStream(Path.of("b.bin"))) {
    in.transferTo(out);                  // Java 9+: copy all bytes
}                                        // out closed first, then in
```

:::senior
Closing the outermost wrapper closes the whole chain, and closing a buffered output stream **flushes** it first — forgetting to close is the classic cause of "my file is empty." Also: if both the body *and* `close()` throw, the body's exception propagates and the close exception is attached as a **suppressed** exception (`Throwable.getSuppressed()`). The old hand-written `try/finally` pattern silently discarded the original.
:::

## Check yourself

```quiz
title: 'java.io streams'
questions:
  - q: 'Why does `InputStream.read()` return an `int` instead of a `byte`?'
    options:
      - 'For alignment — ints are faster on 32-bit CPUs.'
      - text: 'So the end-of-stream sentinel `-1` is distinguishable from the valid data byte `0xFF` (which as a signed `byte` also equals −1).'
        correct: true
      - 'Because Java has no unsigned byte literal.'
      - 'Historical accident with no practical effect.'
    explain: 'Data bytes come back as 0..255 inside the int; only true end-of-stream is −1. A `byte`-typed loop variable would terminate early the first time binary data contains 0xFF.'
  - q: 'You write to a `BufferedWriter`, the program exits, and the file is empty. Most likely cause?'
    options:
      - 'The disk was full.'
      - text: 'The writer was never closed — buffered data sat in memory and was never **flushed** to disk.'
        correct: true
      - 'The charset was wrong.'
      - 'BufferedWriter requires calling `sync()` after every line.'
    explain: 'Closing a buffered stream flushes it first; skipping close abandons the buffer contents. try-with-resources makes this impossible to forget — and closing the outermost wrapper closes (and flushes) the whole chain.'
  - q: 'You read a UTF-8 text file byte-by-byte with `FileInputStream` and build a String from each byte. What goes wrong?'
    options:
      - 'Nothing — UTF-8 is byte-compatible with String.'
      - text: 'Multi-byte characters get mangled: UTF-8 encodes non-ASCII characters as 2-4 bytes, and byte-level reading splits them. Use a `Reader` with an explicit charset.'
        correct: true
      - 'The file cannot be opened without a Reader.'
      - 'Only performance suffers.'
    explain: 'Character streams exist precisely to apply charset decoding correctly. `InputStreamReader` buffers partial multi-byte sequences until they are complete — hand-rolled byte-to-char casting corrupts anything beyond ASCII.'
  - q: 'Which design pattern does `new BufferedReader(new InputStreamReader(socket.getInputStream()))` demonstrate?'
    options:
      - 'Factory method.'
      - text: '**Decorator** — each wrapper implements the same abstraction it wraps and adds one capability (decoding, buffering) without caring what the underlying source is.'
        correct: true
      - 'Adapter.'
      - 'Chain of responsibility.'
    explain: '`java.io` is the canonical decorator example, quoted in the GoF book itself. (`InputStreamReader` alone is arguably an adapter — bytes to chars — but the compositional wrapping structure is decorator.)'
```

:::key
Bytes flow through `InputStream`/`OutputStream`; text flows through `Reader`/`Writer` with an explicit charset, bridged by `InputStreamReader`/`OutputStreamWriter`. Wrap with `Buffered*` for performance — that nesting *is* the decorator pattern. Always manage streams with try-with-resources so they flush and close deterministically.
:::
