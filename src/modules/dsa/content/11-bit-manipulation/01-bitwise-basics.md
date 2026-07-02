---
title: Bitwise Basics
category: Bit Manipulation
categoryOrder: 11
order: 1
level: Intermediate
summary: The six bitwise operators, two's complement, and the handful of bit idioms — test, set, clear, toggle, and the x & -x / x & (x-1) tricks — that turn "count/subset/flag" problems into O(1) one-liners.
tags: bits, bitwise, and, or, xor, shift, twos-complement, masking
---

Under every `int` is a fixed row of **32 bits**. Bit manipulation reads and edits those bits directly — no loops, no arithmetic — which is why it shows up whenever an interviewer says *"O(1) space"*, *"without a hash set"*, or *"toggle a flag"*.

## The six operators

| Operator | Name | `a = 1100`, `b = 1010` → | Use |
|--|--|--|--|
| `a & b` | AND | `1000` | mask / test a bit |
| `a \| b` | OR | `1110` | set a bit |
| `a ^ b` | XOR | `0110` | toggle / find the odd one out |
| `~a` | NOT | `…0011` | flip every bit |
| `a << k` | left shift | `a · 2ᵏ` | pack / multiply by 2ᵏ |
| `a >> k` | signed right shift | `a / 2ᵏ` | divide (sign-extends) |
| `a >>> k` | unsigned right shift | zero-fills the top | Java-only; treat bits as unsigned |

:::gotcha
Java has **no unsigned `int`**. `>>` copies the sign bit down (arithmetic shift); `>>>` fills with zeros. For a negative number `-8 >> 1 == -4` but `-8 >>> 1` is a huge positive. Use `>>>` when a value is a *bit pattern*, not a number.
:::

## Two's complement — why `-x` works

Java stores negatives in **two's complement**: `-x == ~x + 1`. Flip every bit and add one. That single fact powers the two most useful tricks, because `-x` shares no low bits with `x` except the lowest set one.

```java
int x = 0b0101_1000;   // 88
// -x = ~x + 1 = 0b1010_1000
x & -x;                // 0b0000_1000  → isolates the LOWEST set bit
x & (x - 1);           // 0b0101_0000  → CLEARS the lowest set bit
```

## The four bit edits you must know cold

For a value `x` and a bit position `i` (0 = least-significant):

````tabs
tabs:
  - label: Test
    body: |
      Is bit `i` set?
      ```java
      boolean set = (x >> i & 1) == 1;
      // or: (x & (1 << i)) != 0
      ```
  - label: Set
    body: |
      Turn bit `i` on.
      ```java
      x |= (1 << i);
      ```
  - label: Clear
    body: |
      Turn bit `i` off.
      ```java
      x &= ~(1 << i);
      ```
  - label: Toggle
    body: |
      Flip bit `i`.
      ```java
      x ^= (1 << i);
      ```
````

:::gotcha
`1 << i` is an **`int`**, so it overflows for `i ≥ 31`, and for `i ≥ 32` Java masks the shift count to its low 5 bits (`i & 31`) — `1 << 32` behaves like `1 << 0`. For bits 32–63 use a `long` literal: **`1L << i`**.
:::

## XOR: the interview favorite

XOR is its own inverse, which makes it a memory-free accumulator:

- `a ^ a == 0`  (a value cancels itself)
- `a ^ 0 == a`  (zero is the identity)
- commutative & associative — order doesn't matter

So XOR-ing a list where every value appears twice **except one** leaves exactly the loner — O(n) time, O(1) space, no hash set.

```java
int lonely = 0;
for (int v : nums) lonely ^= v;   // pairs cancel; the unique survives
```

## Common one-liners

| Goal | Expression |
|--|--|
| Is `x` a power of two? | `x > 0 && (x & (x - 1)) == 0` |
| Lowest set bit (value) | `x & -x` |
| Clear lowest set bit | `x & (x - 1)` |
| Multiply / divide by 2ᵏ | `x << k` / `x >> k` |
| Is `x` odd? | `(x & 1) == 1` |
| Swap without a temp | `a ^= b; b ^= a; a ^= b;` |
| Count set bits | `Integer.bitCount(x)` |

:::senior
In interviews, reach for `Integer.bitCount`, `Integer.numberOfTrailingZeros`, `Long.highestOneBit`, and `Integer.toBinaryString` for debugging — knowing the JDK helpers signals fluency and avoids reinventing `x & -x` loops. But be ready to *derive* them: "count set bits" via `while (x != 0) { x &= x - 1; count++; }` is the classic follow-up.
:::

## Check yourself

```quiz
title: Bitwise basics check
questions:
  - q: 'What does `x & (x - 1)` compute?'
    options:
      - 'Isolates the lowest set bit'
      - text: 'Clears (turns off) the lowest set bit of x'
        correct: true
      - 'Negates x'
    explain: 'Subtracting 1 flips the lowest set bit to 0 and all bits below it to 1; ANDing with x clears that lowest set bit. Repeatedly applying it counts set bits (Brian Kernighan).'
  - q: 'How do you test whether `x` is a power of two (x > 0)?'
    options:
      - text: '`(x & (x - 1)) == 0`'
        correct: true
      - '`(x & 1) == 0`'
      - '`x % 2 == 0`'
    explain: 'A power of two has exactly one set bit, so clearing that bit gives 0. Guard x > 0 first, since the expression is also 0 for x = 0.'
  - q: 'Why does XOR-ing every element find the single non-duplicated value?'
    options:
      - 'XOR sorts the values'
      - text: 'a ^ a = 0 and a ^ 0 = a, so every pair cancels and only the unique value remains'
        correct: true
      - 'It only works if the array is sorted'
    explain: 'XOR is associative and commutative and self-inverse, so duplicated pairs cancel to 0 regardless of order, leaving the lone value.'
  - q: 'In Java, `1 << 35` gives what?'
    options:
      - 'A number with bit 35 set'
      - text: 'The shift is taken mod 32, so it behaves like `1 << 3`'
        correct: true
      - 'A compile error'
    explain: 'Shifting an int by ≥ 32 masks the count to the low 5 bits (35 % 32 = 3). Use `1L << 35` to actually reach bit 35.'
```

:::key
Bits are edited with **test `x>>i&1`**, **set `x|=1<<i`**, **clear `x&=~(1<<i)`**, **toggle `x^=1<<i`**. Two's complement (`-x == ~x+1`) gives the killer tricks **`x & -x`** (lowest set bit) and **`x & (x-1)`** (clear it). XOR cancels pairs for O(1)-space uniqueness. Use `1L` for bits past 31, and `>>>` for pure bit patterns.
:::
