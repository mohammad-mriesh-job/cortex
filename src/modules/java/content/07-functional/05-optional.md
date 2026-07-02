---
title: Optional
category: Functional Programming & Streams
categoryOrder: 7
order: 5
level: Intermediate
summary: A container for a maybe-absent value — creation, the map/flatMap/filter pipeline, orElse vs orElseGet vs orElseThrow, and the anti-patterns to avoid.
tags: optional, null-safety, npe, functional
---

`Optional<T>` is a container that holds **either one value or nothing**. Its purpose is to make "a value might be absent" explicit **in the type system**, so a `null` doesn't silently slip through and explode later as a `NullPointerException`. It was designed primarily as a **return type** for methods that may not produce a result.

```java
Optional<User> findUser(String id) { ... }   // signals "maybe no user" to the caller
```

## Creating an Optional

```java
Optional<String> a = Optional.of("hi");       // value MUST be non-null (NPE if null)
Optional<String> b = Optional.ofNullable(x);  // empty if x is null, else holds x
Optional<String> c = Optional.empty();         // explicitly absent
```

:::gotcha
`Optional.of(null)` throws `NullPointerException` immediately. When the source might be null, you almost always want `ofNullable`.
:::

## Transforming: map, flatMap, filter

`Optional` behaves like a stream of zero or one element, so you can chain transformations that are **skipped automatically when empty** — no null checks.

```java
String city = findUser(id)            // Optional<User>
    .map(User::address)               // Optional<Address>  (empty stays empty)
    .map(Address::city)               // Optional<String>
    .filter(c -> !c.isBlank())        // drop blanks
    .orElse("unknown");
```

Use **`flatMap`** when the mapping function *itself* returns an `Optional`, to avoid a nested `Optional<Optional<T>>`:

```java
Optional<User> user = ...;
Optional<Phone> phone = user.flatMap(User::findPrimaryPhone); // findPrimaryPhone returns Optional<Phone>
```

## Getting the value out

This is where most mistakes happen. Choose deliberately:

| Method | Behavior when empty | Eager? |
|--------|---------------------|--------|
| `orElse(default)` | returns `default` | **always** evaluates `default` |
| `orElseGet(supplier)` | calls `supplier` | lazy — only when empty |
| `orElseThrow()` | throws `NoSuchElementException` (Java 10+) | — |
| `orElseThrow(supplier)` | throws your exception | lazy |
| `get()` | throws `NoSuchElementException` | — (avoid) |

The `orElse`/`orElseGet` difference is subtle and important:

```java
// createDefault() runs EVERY time, even when the Optional has a value — wasteful or buggy
String x = opt.orElse(createDefault());

// createDefault() runs ONLY when opt is empty
String y = opt.orElseGet(() -> createDefault());
```

:::gotcha
If the "default" has a side effect or is expensive (a DB call, object allocation, incrementing a counter), `orElse` will execute it **even when the value is present**. Use `orElseGet` for anything beyond a cheap constant.
:::

## Acting on the value

```java
opt.ifPresent(v -> log.info("got {}", v));        // run only if present

opt.ifPresentOrElse(                               // Java 9+: both branches
    v -> log.info("got {}", v),
    () -> log.warn("nothing found"));

opt.or(() -> fetchFromCache());                    // Java 9+: fall back to another Optional
List<User> all = opt.stream().toList();            // Java 9+: 0-or-1 element stream
```

## Anti-patterns

`Optional` is a precise tool with a narrow purpose. Misusing it adds overhead and noise:

- **Optional fields** — `private Optional<String> name;` wastes a wrapper object per instance and isn't `Serializable`. Use a plain nullable field or a sensible default.
- **Optional parameters** — `void f(Optional<X> x)` forces every caller to wrap. Prefer method overloading or a `@Nullable` parameter.
- **`Optional` in collections** — `Map<K, Optional<V>>` is a smell; an absent key already means "no value."
- **`get()` without a guard** — calling `get()` on a possibly-empty Optional just relocates the NPE. Use `orElse`/`orElseThrow`/`map`.
- **Wrapping then immediately unwrapping** — `Optional.ofNullable(x).orElse(y)` is just a verbose `x != null ? x : y`.

```java
// Anti-pattern: defeats the entire purpose
if (opt.isPresent()) { use(opt.get()); }
// Idiomatic:
opt.ifPresent(this::use);
```

:::senior
Treat `Optional` as a **return type at API boundaries**, not as a general null replacement threaded through your domain model. Spring Data repositories, `Stream.findFirst`, and `Map`-style lookups return it precisely so callers must confront absence. Internally, a well-placed `@Nullable` annotation plus null checks is often clearer and cheaper than wrapping everything.
:::

## Check your understanding

```quiz
questions:
  - q: 'When the `Optional` is **present**, how do `orElse(createDefault())` and `orElseGet(() -> createDefault())` differ?'
    options:
      - 'No difference at all'
      - text: '`orElse` still evaluates `createDefault()`; `orElseGet` never calls the supplier'
        correct: true
      - '`orElseGet` still calls it; `orElse` skips it'
      - 'Both skip `createDefault()`'
    explain: 'The argument to `orElse` is evaluated eagerly, so `createDefault()` runs even when a value is present. The `orElseGet` supplier runs only when empty — use it for expensive or side-effecting defaults.'
  - q: 'Which of these is a recognized `Optional` anti-pattern?'
    options:
      - 'Returning `Optional<User>` from a lookup method'
      - text: 'Declaring a field `private Optional<String> name;`'
        correct: true
      - 'Chaining `map` and `flatMap`'
      - 'Using `orElseThrow` instead of `get`'
    explain: '`Optional` is designed as a return type. As a field it wastes a wrapper object per instance, is not `Serializable`, and clutters the model — prefer a nullable field or a sensible default.'
  - q: 'What is wrong with `Optional.ofNullable(x).orElse(y)`?'
    options:
      - 'It throws when `x` is `null`'
      - text: 'It is just a verbose `x != null ? x : y` — wrapping then immediately unwrapping adds nothing'
        correct: true
      - 'It returns an `Optional`'
      - '`orElse` should be `get`'
    explain: 'Creating an `Optional` only to unwrap it on the very next call is pointless ceremony. A ternary, or `Objects.requireNonNullElse(x, y)`, is clearer.'
```

:::key
`Optional` makes absence explicit. Create with `ofNullable` (not `of`) when null is possible. Chain with `map`/`flatMap`/`filter`. Prefer **`orElseGet`** over `orElse` for expensive defaults, and `orElseThrow` over `get()`. Use it as a **return type** — never as a field, parameter, or collection element.
:::
