---
title: Bounded Types & Wildcards (PECS)
category: Generics
categoryOrder: 5
order: 2
level: Advanced
summary: Upper and lower bounds, the three wildcard forms, and the PECS rule that tells you which to reach for.
tags: generics, wildcards, pecs, bounds, variance
---

A plain `<T>` accepts any type, and `List<String>` is rigidly one type. **Bounds** and **wildcards** add controlled flexibility in between — letting a method accept a *family* of related types while staying type-safe.

## Bounded type parameters (`extends`)

A bound restricts `T` to subtypes of a class or interface. In return, you may call that type's methods inside the method body:

```java
public static <T extends Number> double sum(List<T> nums) {
    double total = 0;
    for (T n : nums) total += n.doubleValue(); // Number's methods are available
    return total;
}

sum(List.of(1, 2, 3));   // List<Integer> — OK
sum(List.of(1.5, 2.5));  // List<Double>  — OK
// sum(List.of("a"));    // compile error — String is not a Number
```

Here `extends` means "is, or is a subtype of" and works for **both** classes and interfaces. Multiple bounds use `&`, with the class (if any) listed first: `<T extends Number & Comparable<T>>`.

## Wildcards: the `?`

A wildcard `?` represents an **unknown** type. It is used in variable and parameter types, not when *declaring* a type parameter.

### Upper-bounded: `? extends`

`List<? extends Number>` means "a list of some unknown subtype of `Number`". You can **read** elements as `Number`, but you **cannot add** (except `null`):

```java
List<? extends Number> nums = List.of(1, 2, 3); // might really be List<Integer>
Number n = nums.get(0);   // OK to read
// nums.add(4);           // compile error — the exact element type is unknown
```

The list might actually be a `List<Double>`; adding an `Integer` would corrupt it, so the compiler forbids all writes.

### Lower-bounded: `? super`

`List<? super Integer>` means "a list of `Integer` or some supertype". You can **add** `Integer`s, but reads come back only as `Object`:

```java
List<? super Integer> sink = new ArrayList<Number>();
sink.add(1);            // OK — an Integer fits any supertype of Integer
sink.add(2);
Object o = sink.get(0); // reads are typed only as Object
```

### Unbounded: `?`

`List<?>` means "a list of something". Read as `Object`, cannot add (except `null`). Useful when the method genuinely does not care about the element type:

```java
static int size(List<?> any) { return any.size(); }
```

## PECS: Producer Extends, Consumer Super

This mnemonic tells you which form to pick:

- If a parameter **produces** values you read out, use `? extends`.
- If a parameter **consumes** values you put in, use `? super`.
- If it does **both**, use an exact type `T` (no wildcard).

The JDK's `Collections.copy` is the textbook case:

```java
public static <T> void copy(List<? super T> dest,    // consumer — we write into it
                            List<? extends T> src) {  // producer — we read from it
    for (int i = 0; i < src.size(); i++)
        dest.set(i, src.get(i));
}
```

Wildcards let it copy a `List<Integer>` (`src`) into a `List<Number>` (`dest`) — flexibility you would lose with a plain `List<T>` on both sides.

**Before** (needlessly rigid) versus **after** (PECS):

```java
// Before: only accepts the exact same element type on both sides
static void drainStrict(List<Number> from, List<Number> to) {
    for (Number n : from) to.add(n);
}

// After: PECS — accepts any compatible producer and consumer
static <T> void drain(List<? extends T> from, List<? super T> to) {
    for (T t : from) to.add(t);
}

drain(List.of(1, 2), new ArrayList<Number>()); // Integer producer -> Number consumer
```

| Form | Read (`get`) | Write (`add`) | Role | Use when |
|------|--------------|---------------|------|----------|
| `List<T>` | as `T` | `T` only | both | you read and write the same type |
| `List<? extends T>` | as `T` | none (`null` only) | producer | you only read |
| `List<? super T>` | as `Object` | `T` and its subtypes | consumer | you only write |
| `List<?>` | as `Object` | none (`null` only) | neither | type-agnostic operations |

:::gotcha
You can never add a non-`null` element to a `List<? extends T>`. Beginners reach for `? extends` everywhere, then discover they cannot populate the collection. If you need to add, you want `? super` (or an exact `T`).
:::

:::senior
Apply PECS to your **own** APIs. A signature like `boolean addAll(Collection<? extends E> c)` — exactly what `java.util.List` declares — lets callers pass a `List<Integer>` into a `Collection<Number>`. Wildcards in *parameters* maximize the inputs your method accepts. The flip side: avoid wildcards in *return types*, because they force every caller to deal with the awkward unknown type.
:::

:::tip
Quick check: a **Producer** hands you data, so you `extends`-read it; a **Consumer** swallows data, so you `super`-write it. If a type both produces and consumes, wildcards cannot help — use a concrete type parameter `T`.
:::

## Check your understanding

```quiz
questions:
  - q: 'Your method only **reads** elements out of a list parameter. Which parameter type fits best?'
    options:
      - '`List<? super T>`'
      - text: '`List<? extends T>`'
        correct: true
      - '`List<?>` only'
      - 'an exact `List<T>`'
    explain: 'A parameter you read from is a Producer, so Producer Extends. `? extends T` lets you read each element as a `T`.'
  - q: 'Why does the compiler reject `nums.add(4)` when `nums` is a `List<? extends Number>`?'
    options:
      - 'Because the list is immutable'
      - text: 'The exact element type is unknown — it might be a `List<Double>`, and adding an `Integer` would corrupt it'
        correct: true
      - 'Because `Number` is abstract'
      - 'Because reads come back as `Object`'
    explain: 'An upper-bounded wildcard could be backed by any subtype list, so the compiler cannot prove your element fits. Every write except `null` is rejected — upper-bounded wildcards are read-only.'
  - q: 'In `copy(List<? super T> dest, List<? extends T> src)`, why is `dest` typed `? super T`?'
    options:
      - 'It is read from, so it is a producer'
      - text: 'It is written into, so it is a consumer — Consumer Super'
        correct: true
      - 'To allow `null` elements'
      - 'To make its reads return `T`'
    explain: 'You write the copied elements into `dest`, so it is a Consumer and uses `super`. That lets you copy a `List<Integer>` into a `List<Number>` or any supertype.'
```

:::key
Use `extends` for producers you read from and `super` for consumers you write to — **Producer Extends, Consumer Super**. Upper-bounded wildcards are read-only, lower-bounded wildcards are write-friendly, an unbounded `?` is type-agnostic, and an exact `T` is for types you both read and write.
:::
