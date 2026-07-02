---
title: Text Blocks
category: Modern Java
categoryOrder: 8
order: 3
level: Beginner
summary: Multi-line string literals with triple quotes — automatic whitespace handling, the line-continuation and space escapes, and when to use them for JSON, SQL, and HTML.
tags: text-blocks, strings, json, sql
---

A **text block** is a multi-line string literal delimited by three double-quotes (`"""`). Added in Java 15, it ends the misery of `\n` and `+` when you embed JSON, SQL, HTML, or XML in your code.

## The `"""` syntax

```java
String html = """
        <html>
            <body>
                <p>Hello, world</p>
            </body>
        </html>
        """;
```

The rules are short:

- The opening `"""` must be followed by a **line break** — you cannot put text on the same line.
- Content lines follow.
- The closing `"""` sits on its own line (by convention).

Compare it with the old style — same value, far more noise:

```java
String html = "<html>\n" +
              "    <body>\n" +
              "        <p>Hello, world</p>\n" +
              "    </body>\n" +
              "</html>\n";
```

A text block produces an ordinary `String` — same class, same methods. It is purely a **compile-time** convenience; at runtime there is no difference.

## Incidental vs essential whitespace

The indentation you add to keep source code tidy should **not** leak into the string. The compiler strips this **incidental** whitespace automatically.

It looks at every content line *and the closing `"""`*, finds the **least-indented** one, and removes that common indentation from all of them. Anything you indent *beyond* that baseline is **essential** and kept. Trailing spaces on each line are also stripped.

```text
        <html>          ← leading spaces here are incidental (stripped)
            <body>      ← the extra 4 spaces are essential (kept)
        """             ← move this left/right to shift the margin
```

So the position of the closing `"""` lets you control exactly how much indentation is removed.

## The `\` and `\s` escapes

Two escapes are specific to text blocks:

**`\` (line continuation)** — a backslash at the end of a line suppresses the newline, letting you wrap a long line in source without putting a `\n` in the value:

```java
String oneLine = """
        The quick brown fox \
        jumps over the lazy dog.""";
// "The quick brown fox jumps over the lazy dog."
```

**`\s` (space)** — translates to a single space and, crucially, **stops trailing whitespace from being stripped**:

```java
String padded = """
        ends with two spaces\s\s
        next line""";
```

The familiar escapes (`\n`, `\t`, `\"`) still work, but you rarely need them: real line breaks already become newlines, and you only have to escape `"` when three appear in a row.

| Escape | Effect |
|--------|--------|
| `\` (at line end) | Joins to the next line — suppresses that newline in the value |
| `\s` | Emits one space; also protects trailing whitespace from stripping |
| `\n`, `\t`, `\"` | Standard escapes — valid, but seldom needed in a text block |

## When to use them

Text blocks shine for **embedded languages**, where escaping used to dominate:

```java
String query = """
        SELECT id, name
        FROM users
        WHERE active = true
        ORDER BY name
        """;

String json = """
        { "name": "Ada", "active": true }
        """;
```

No escaped quotes, no `+`, no `\n` — the structure is visible at a glance.

:::tip
Text blocks have **no interpolation** — writing a placeholder in the text does nothing on its own. Fill in values with `String.formatted`:

```java
String msg = """
        Hello, %s — you have %d messages.
        """.formatted(name, count);
```
:::

:::gotcha
A closing `"""` on its **own line** adds a trailing newline to the value. To avoid it, put the closing delimiter at the end of the last content line:

```java
String noNewline = """
        no trailing newline""";
```

Also, the opening line must be blank: `String s = """text""";` is a **compile error** because content follows `"""` directly.
:::

:::senior
Java explored a richer **string templates** preview feature, but it was **withdrawn** for redesign — so as of the current LTS there is still no built-in interpolation. `formatted()` (or a logging framework's parameterized messages, e.g. `log.info("user {}", id)`) remains idiomatic. Don't reach for runtime formatting in a hot loop where plain concatenation is clearer and faster.
:::

:::key
- A text block is a `"""`-delimited multi-line `String`; the opening `"""` must be followed by a newline.
- The compiler strips **incidental** (common) indentation and trailing spaces; the closing `"""` position sets the left margin.
- `\` at line end joins lines; `\s` emits a space and protects trailing whitespace.
- Use them for JSON, SQL, HTML, and XML — and pair with `.formatted()` since there is no interpolation.
:::
