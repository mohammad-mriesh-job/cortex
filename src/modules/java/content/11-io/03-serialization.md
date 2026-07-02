---
title: Serialization & Its Pitfalls
category: I/O, Files & Serialization
categoryOrder: 11
order: 3
level: Advanced
summary: How Serializable, serialVersionUID, and transient work, the security and maintenance traps of Java's built-in serialization, and why modern teams reach for JSON or Protobuf.
tags: serialization, serializable, transient, security, protobuf
---

**Serialization** converts an object graph into a byte stream (and back) so it can be persisted or sent over the wire. Java has it built in — implement one marker interface and `ObjectOutputStream` does the rest. That convenience hides some of the sharpest edges in the language.

## The basics: Serializable

A class opts in by implementing `Serializable`, a **marker interface** with no methods. `ObjectOutputStream.writeObject` then walks the object and every reachable field, recursively; `ObjectInputStream.readObject` rebuilds the graph.

```java
public class User implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private final String name;
    private final int loginCount;
    private transient String sessionToken;   // excluded from the byte stream
    // constructor, getters...
}
```

```java
try (var out = new ObjectOutputStream(Files.newOutputStream(Path.of("user.ser")))) {
    out.writeObject(user);
}
try (var in = new ObjectInputStream(Files.newInputStream(Path.of("user.ser")))) {
    User restored = (User) in.readObject();
}
```

Every field must itself be serializable, or `writeObject` throws `NotSerializableException`. `static` fields belong to the class, not the instance, so they are never written.

## serialVersionUID and transient

- **`serialVersionUID`** is a version stamp. On read, the JVM compares the stream's UID against the loaded class's UID; a mismatch throws `InvalidClassException`. If you don't declare one, the serialization runtime **computes** it from the class's structure — so adding, removing, or renaming a field (or changing a member signature) can silently change it and reject old data.
- **`transient`** marks a field to *skip*: secrets, caches, derived values, or non-serializable references. On the way back in, transient fields get their defaults (`null`, `0`, `false`).

:::gotcha
Omitting `serialVersionUID` is the classic maintenance trap: serialize today, add a field next sprint, and every previously stored object fails to deserialize with `InvalidClassException`. Always declare it explicitly — the `@Serial` annotation (Java 14+) makes the compiler check the member's signature.
:::

## Customizing with readObject and writeObject

A class can hook the process with two **private** methods the JVM finds reflectively. Call the matching `default*` helper, then add your own logic — and crucially, read custom data back in the **same order** you wrote it:

```java
@Serial
private void writeObject(ObjectOutputStream out) throws IOException {
    out.defaultWriteObject();          // serialize the non-transient fields
    out.writeLong(checksum());         // append a custom integrity value
}

@Serial
private void readObject(ObjectInputStream in)
        throws IOException, ClassNotFoundException {
    in.defaultReadObject();            // restore the non-transient fields
    long expected = in.readLong();     // read custom data in the SAME order
    if (name == null || checksum() != expected)
        throw new InvalidObjectException("corrupt User stream");
}
```

`readObject` is effectively a **hidden constructor** that bypasses your real ones — so any invariant your constructors enforce must be re-checked here, or an attacker can hand-craft a stream that builds an "impossible" object.

## Externalizable

`Externalizable` extends `Serializable` and hands you **full** control via `writeExternal`/`readExternal`. It can be faster and more compact, but it requires a **public no-arg constructor** (the framework calls it, then populates the object) and you must serialize every field by hand — easy to get out of sync.

## The pitfalls — and the modern answer

Java's built-in serialization is widely regarded as a design mistake (Oracle's own architects have said so). Two problems dominate:

1. **Security.** Deserializing untrusted data is a notorious remote-code-execution vector: a crafted stream triggers "gadget chains" during `readObject`, *before* you can validate anything (the Apache Commons Collections CVEs are the famous example). Java 9 added `ObjectInputFilter` (JEP 290) to allowlist classes, but the safest rule is **never deserialize data you don't trust**.
2. **Maintenance.** The serialized form becomes part of your public API. Renaming or removing fields breaks compatibility, the format is opaque binary, and it is Java-only, so schema evolution is painful.

| Approach | Cross-language | Human-readable | Safe by default | Schema evolution |
|---|---|---|---|---|
| `Serializable` | no | no | no (RCE risk) | painful |
| `Externalizable` | no | no | no | manual |
| JSON (Jackson/Gson) | yes | yes | yes | easy |
| Protobuf / Avro | yes | no (binary) | yes | designed-in |

That is why teams reach for **JSON** (readable, ubiquitous, ideal for APIs) or **Protobuf/Avro** (compact, fast, schema-versioned) instead. These formats are language-agnostic, define an explicit contract, and — critically — never execute arbitrary code on read.

:::senior
*Effective Java* (Items 85–90) is blunt: prefer alternatives to Java serialization. If a legacy system forces it, use the **serialization proxy pattern** — a small `private static` nested class holding the logical state, with `writeReplace` returning the proxy and the proxy's `readResolve` rebuilding the object through normal constructors. That restores your invariants and sidesteps most deserialization attacks.
:::

:::key
`Serializable` is a no-method marker; always declare an explicit `serialVersionUID`, mark secrets and derived fields `transient`, and re-validate invariants in `readObject` because it bypasses your constructors. `Externalizable` trades automation for manual control plus a public no-arg constructor. Built-in serialization is an RCE risk and a maintenance burden — for new systems use JSON or Protobuf, and never deserialize untrusted bytes.
:::
