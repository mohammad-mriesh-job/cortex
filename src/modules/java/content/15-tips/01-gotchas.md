---
title: Tricky Output & Gotcha Questions
category: Tips, Tricks & Cheat Sheets
categoryOrder: 15
order: 1
level: Advanced
summary: The classic "what does this print?" puzzlers — Integer cache, string interning, return-in-finally, autoboxing NPEs, float precision, array covariance, evaluation order, static init, and overflow.
tags: gotchas, puzzlers, autoboxing, integer-cache, overflow, interview
---

These are the snippets interviewers love because they look obvious and aren't. Each one has a single root cause worth understanding — once you know the *rule*, you don't have to memorize the output. For every puzzle: read the code, guess the output, then check the **Why**.

## Reference-equality traps

### Integer cache: `==` on boxed values

```java
Integer a = 127, b = 127;
Integer c = 128, d = 128;
System.out.println(a == b);   // true
System.out.println(c == d);   // false
```

**Why:** Autoboxing calls `Integer.valueOf(int)`, which **caches** instances from `-128` to `127`. So `a` and `b` are the *same object*, but `c` and `d` are two distinct objects. `==` compares references, not values. Use `.equals()` (or compare unboxed `int`s).

### String pool & interning

```java
String a = "hi";
String b = "hi";
String c = new String("hi");
System.out.println(a == b);          // true   — same pooled literal
System.out.println(a == c);          // false  — new object on the heap
System.out.println(a == c.intern()); // true   — intern() returns the pooled ref
System.out.println(a.equals(c));     // true   — content is equal
```

Compile-time constants are folded, but runtime concatenation builds a fresh object:

```java
String x = "hel" + "lo";   // folded to the literal "hello" at compile time
String pre = "hel";
String y = pre + "lo";     // built at runtime -> new String object
System.out.println("hello" == x);   // true
System.out.println("hello" == y);   // false
```

**Why:** String literals are interned in the constant pool, so identical literals share one object. `new String(...)` always allocates; `intern()` returns the canonical pooled instance.

## Control-flow & evaluation traps

### `return` (or `throw`) inside `finally`

```java
static int f() {
    try {
        return 1;
    } finally {
        return 2;   // overrides the try's return
    }
}
// f() returns 2
```

A `finally` block can even swallow a pending exception:

```java
static int g() {
    int x = 1;
    try {
        return x;      // the value 1 is computed and latched HERE
    } finally {
        x = 99;        // too late — the return value was already captured
    }
}
// g() returns 1
```

**Why:** `finally` runs *after* the `try`/`catch` decides its outcome. A `return`/`throw`/`break` in `finally` replaces that outcome entirely — including discarding an in-flight exception. Mutating a local in `finally` doesn't change an already-evaluated return value.

### Pre/post-increment & evaluation order

```java
int i = 1;
i = i++;
System.out.println(i);   // 1  (not 2)

int j = 0;
int sum = j++ + j++ + j++;
System.out.println(sum); // 3  (0 + 1 + 2)
System.out.println(j);   // 3
```

**Why:** `i++` yields the *old* value, then increments `i`. In `i = i++`, the old value `1` is latched, `i` becomes `2`, then the assignment writes the latched `1` back. Java evaluates operands strictly **left to right**, applying each side effect before moving on.

## Numeric traps

### Floating-point precision

```java
System.out.println(0.1 + 0.2);         // 0.30000000000000004
System.out.println(0.1 + 0.2 == 0.3);  // false
```

The fix for exact decimals — note the **`String`** constructor:

```java
new BigDecimal(0.1);    // 0.1000000000000000055511151231257827021...
new BigDecimal("0.1");  // exactly 0.1
```

**Why:** `double`/`float` are binary IEEE-754; `0.1`, `0.2`, `0.3` have no exact binary form. Never use `==` on floating-point or `double` for money — use `BigDecimal(String)`, or compare within an epsilon.

### Integer overflow (silent)

```java
System.out.println(Integer.MAX_VALUE + 1);  // -2147483648  (wraps around)

long ms = 1000 * 60 * 60 * 24 * 365;
System.out.println(ms);                      // 1471228928  (NOT 31_536_000_000)
```

**Why:** `int` arithmetic wraps modulo 2^32 with **no exception**. In the second case all literals are `int`, so the whole product overflows *before* it is widened to `long`. Fixes: make one operand `long` (`1000L * 60 * ...`), or use `Math.multiplyExact` / `Math.addExact`, which throw `ArithmeticException` on overflow.

## Type-system & boxing traps

### Autoboxing NullPointerException

```java
Map<String, Integer> counts = new HashMap<>();
int n = counts.get("missing");   // get(...) returns null -> unbox -> NPE
```

Mixed wrapper types in a conditional also surprise people:

```java
Object o = true ? Integer.valueOf(1) : Double.valueOf(2.0);
System.out.println(o);   // 1.0  (not 1)
```

**Why:** unboxing a `null` calls `null.intValue()` → NPE; use `getOrDefault` or keep an `Integer` and null-check. In the ternary, binary numeric promotion unboxes *both* branches and widens to `double`, so the chosen `Integer` is reboxed as `Double`.

### Array covariance & `ArrayStoreException`

```java
Object[] arr = new String[3];   // legal: arrays are covariant
arr[0] = "ok";                  // fine
arr[1] = 42;                    // compiles, throws ArrayStoreException at runtime
```

**Why:** Java arrays are **covariant** (`String[]` *is an* `Object[]`), so the assignment compiles, but the JVM type-checks every store. Generics are **invariant** precisely to move this error to compile time — `List<Object> l = new ArrayList<String>()` does not compile.

## Initialization traps

### Static initialization order

```java
class Holder {
    static int A = Holder.B + 1;   // B is still 0 (its default) here
    static int B = 2;
    static int C;           // C = 0 by default
}
// Holder.A == 1, Holder.B == 2
```

**Why:** on first use the class is initialized: fields get their **default** values, then static initializers and assignments run **top to bottom**. When `A`'s initializer runs, `B` has not been assigned yet, so it reads the default `0`. Forward references to not-yet-initialized statics see defaults, not the eventual value.

## Rapid-fire one-liners

| Snippet | Prints | Why |
|---|---|---|
| `System.out.println(0.0 == -0.0)` | `true` | IEEE-754 says `+0 == -0` |
| `System.out.println(Double.NaN == Double.NaN)` | `false` | `NaN` is unequal to everything, even itself |
| `System.out.println('a' + 'b')` | `195` | `char` promotes to `int` in arithmetic |
| `System.out.println(1 + 2 + "x" + 1 + 2)` | `3x12` | left-to-right: `int` add, then string concat |
| `System.out.println(10 / 3 * 3)` | `9` | integer division truncates first |
| `System.out.println(5 % -3)` | `2` | `%` sign follows the dividend |
| `System.out.println(Math.abs(Integer.MIN_VALUE))` | `-2147483648` | `abs` overflows — no positive counterpart |
| `"a,b,,".split(",").length` | `2` | `split` drops trailing empty strings |

:::gotcha
The Integer cache boundary (`127`) is *configurable* via `-XX:AutoBoxCacheMax`, so `==` on boxed values can pass in tests and fail in production. Treat boxed numbers like any object: compare with `.equals()` or unbox to a primitive first.
:::

:::senior
Almost every puzzle here is Java silently mixing **value semantics** (primitives, `==`) with **reference semantics** (objects, hidden `valueOf`/`intValue` calls). In an interview, don't just recite the output — name the rule: "`==` compares references," "autoboxing inserts a `valueOf`," "`finally` runs last and can override the result." That demonstrates understanding, not memorization.
:::

:::tip
Defensive habits that kill whole classes of these bugs: `Math.addExact`/`multiplyExact` for overflow-sensitive math, `BigDecimal(String)` for money, `getOrDefault`/`Optional` instead of nullable returns, and never putting control flow (`return`/`break`/`throw`) inside `finally`.
:::

## Test yourself

```quiz
title: 'What prints? — references & boxing'
questions:
  - q: 'What prints? `Integer a = 127, b = 127; System.out.println(a == b);`'
    options:
      - text: '`true`'
        correct: true
      - '`false`'
      - 'It does not compile.'
      - 'It throws an exception.'
    explain: 'Autoboxing calls `Integer.valueOf`, which caches `-128..127`, so `a` and `b` are the *same* object → `true`. At `128` they would be distinct objects and `==` would be `false`.'
  - q: 'What prints? `Integer c = 128, d = 128; System.out.println(c == d);`'
    options:
      - text: '`false`'
        correct: true
      - '`true`'
      - '`128`'
      - 'It throws an exception.'
    explain: '`128` is outside the Integer cache, so `c` and `d` are two distinct objects and `==` compares references → `false`. Use `.equals()` or unbox to compare values.'
  - q: 'What happens? `Map<String, Integer> m = new HashMap<>(); int n = m.get("missing");`'
    options:
      - text: 'Throws `NullPointerException` — `get` returns `null`, then unboxing calls `null.intValue()`.'
        correct: true
      - '`n` becomes `0`.'
      - '`n` becomes `null`.'
      - 'It does not compile.'
    explain: 'Assigning a `null` `Integer` to an `int` unboxes via `intValue()`, which NPEs. Use `getOrDefault`, or keep an `Integer` and null-check.'
  - q: 'What prints? `String c = new String("hi"); System.out.println("hi" == c);`'
    options:
      - text: '`false`'
        correct: true
      - '`true`'
      - '`hi`'
      - 'It does not compile.'
    explain: 'A literal is interned in the string pool, but `new String("hi")` allocates a fresh heap object, so `==` is `false`. `"hi" == c.intern()` would be `true`, and `"hi".equals(c)` is `true`.'
```

```quiz
title: 'What prints? — numbers & evaluation'
questions:
  - q: 'What prints? `System.out.println(0.1 + 0.2 == 0.3);`'
    options:
      - text: '`false`'
        correct: true
      - '`true`'
      - '`0.3`'
      - 'It throws an exception.'
    explain: '`0.1`, `0.2`, `0.3` have no exact binary IEEE-754 form, so `0.1 + 0.2` is `0.30000000000000004`. Never use `==` on floating-point — compare within an epsilon or use `BigDecimal("...")`.'
  - q: 'What prints? `System.out.println(Integer.MAX_VALUE + 1);`'
    options:
      - text: '`-2147483648`'
        correct: true
      - '`2147483648`'
      - 'It throws `ArithmeticException`.'
      - '`0`'
    explain: '`int` arithmetic wraps modulo 2^32 with **no** exception, so `MAX_VALUE + 1` overflows to `MIN_VALUE`. Use `long`, or `Math.addExact` to throw on overflow.'
  - q: 'What prints? `int i = 1; i = i++; System.out.println(i);`'
    options:
      - text: '`1`'
        correct: true
      - '`2`'
      - '`0`'
      - 'It does not compile.'
    explain: '`i++` latches the old value `1`, increments `i` to `2`, then the assignment writes the latched `1` back — so `i` ends at `1`.'
  - q: 'What prints? `System.out.println(1 + 2 + "x" + 1 + 2);`'
    options:
      - text: '`3x12`'
        correct: true
      - '`3x3`'
      - '`1212x`'
      - '`6x`'
    explain: 'Left to right: `1 + 2` is integer addition (`3`), then `+ "x"` switches to string concatenation, so the remaining `1` and `2` are appended as text → `3x12`.'
  - q: 'What prints? `System.out.println(''a'' + ''b'');`'
    options:
      - text: '`195`'
        correct: true
      - '`ab`'
      - '`97`'
      - 'It does not compile.'
    explain: '`char` operands are promoted to `int` in arithmetic, so `97 + 98 = 195`. To concatenate them as text, at least one operand must be a `String`.'
```

:::key
The recurring themes: `==` is reference identity (use `equals`); autoboxing hides `valueOf`/`intValue` calls that cache and can NPE; `int` math overflows silently and `double` math is inexact; arrays are covariant (runtime check) while generics are invariant (compile check); and `finally` plus top-to-bottom static init can override what you expect.
:::
