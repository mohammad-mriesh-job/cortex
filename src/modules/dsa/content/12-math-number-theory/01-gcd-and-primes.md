---
title: GCD & Primes
category: Math & Number Theory
categoryOrder: 12
order: 1
level: Intermediate
summary: The number-theory toolkit interviews assume you own — Euclid's GCD (and LCM), fast primality testing, the Sieve of Eratosthenes, and prime factorization.
tags: math, gcd, lcm, euclid, primes, sieve, factorization, number theory
---

A handful of number-theory routines show up again and again — reducing fractions, tiling problems, "count the primes," cycle lengths. None are long, but the **complexity** and a couple of **overflow traps** are what interviewers check.

## Euclid's algorithm — GCD in O(log n)

The greatest common divisor: `gcd(a, b) = gcd(b, a mod b)`, bottoming out at `gcd(a, 0) = a`. It halves the arguments geometrically, so it's O(log min(a, b)) — not O(n).

```java
long gcd(long a, long b) { return b == 0 ? a : gcd(b, a % b); }

long lcm(long a, long b) { return a / gcd(a, b) * b; }   // divide FIRST
```

:::gotcha
Compute LCM as `a / gcd(a, b) * b`, **not** `a * b / gcd(a, b)`. The second form overflows for large `a * b` before the division shrinks it. Dividing first keeps the intermediate value small. Even so, use `long`.
:::

:::note
The **extended** Euclidean algorithm also returns `x, y` with `a·x + b·y = gcd(a, b)`. That's how you compute a **modular inverse** when the modulus isn't prime — see [Modular Arithmetic](/dsa/topic/math-number-theory/modular-arithmetic).
:::

## Primality test — trial division to √n

A composite `n` must have a factor ≤ `√n`, so you only test that far. Skip even numbers after checking 2.

```java
boolean isPrime(int n) {
    if (n < 2) return false;
    if (n < 4) return true;               // 2, 3
    if (n % 2 == 0) return false;
    for (int i = 3; (long) i * i <= n; i += 2)   // i*i as long — avoid overflow
        if (n % i == 0) return false;
    return true;
}
```

**O(√n)** per number. (For gigantic `n`, Miller-Rabin is the probabilistic upgrade — worth naming, rarely needed to code.)

## Sieve of Eratosthenes — all primes up to n

To find *every* prime in `[2, n]`, don't test each one — cross out multiples. Start each prime `p` at `p*p` (smaller multiples were already crossed by smaller primes).

```walkthrough
title: Sieve up to 12 — cross out composites
code: |
  boolean[] composite = new boolean[n + 1];
  for (int p = 2; (long) p * p <= n; p++)
    if (!composite[p])
      for (int m = p * p; m <= n; m += p)
        composite[m] = true;
  // primes = indices still false (from 2)
steps:
  - text: 'Start: assume all of 2..12 are prime (nothing crossed).'
    array: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    line: 1
  - text: 'p = 2 is prime. Cross its multiples from 2·2=4: 4, 6, 8, 10, 12.'
    array: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    highlight: [2, 4, 6, 8, 10]
    line: 4
  - text: 'p = 3 is prime. Cross from 3·3=9: 9, 12 (6 was already crossed by 2).'
    array: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    highlight: [7, 10]
    line: 4
  - text: 'p·p > 12 now, so stop. Survivors are prime: 2, 3, 5, 7, 11.'
    array: [2, 3, 5, 7, 11]
    sorted: [0, 1, 2, 3, 4]
    line: 5
```

**Time O(n log log n)** — effectively linear — and O(n) space. The go-to when a problem needs many primality checks in a fixed range.

## Prime factorization

Divide out each factor as you find it; anything left above 1 at the end is a prime factor itself.

```java
for (int p = 2; (long) p * p <= n; p++)
    while (n % p == 0) { factors.add(p); n /= p; }
if (n > 1) factors.add(n);                // leftover prime
```

O(√n). Pre-sieving the smallest-prime-factor lets you factor many numbers in O(log n) each.

## Check yourself

```quiz
title: GCD & primes check
questions:
  - q: 'What is the time complexity of Euclid''s GCD algorithm?'
    options:
      - 'O(n)'
      - text: 'O(log min(a, b))'
        correct: true
      - 'O(√n)'
    explain: 'Each step replaces (a, b) with (b, a mod b), which shrinks the pair geometrically — logarithmic, not linear.'
  - q: 'Why start crossing out at p·p in the Sieve of Eratosthenes?'
    options:
      - text: 'Every smaller multiple of p already has a smaller prime factor and was crossed earlier'
        correct: true
      - 'Because p·p is always prime'
      - 'To save memory'
    explain: 'A multiple k·p with k < p was already eliminated when processing the prime factors of k, so work below p² is redundant.'
  - q: 'Why compute LCM as `a / gcd(a,b) * b` rather than `a * b / gcd(a,b)`?'
    options:
      - 'It is more readable'
      - text: 'To avoid the intermediate `a * b` overflowing before the division'
        correct: true
      - 'The two give different answers'
    explain: 'Both are mathematically equal, but a*b can overflow; dividing by the gcd first keeps the running value small.'
```

:::key
**Euclid**: `gcd(a,b)=gcd(b,a%b)` in O(log n); **LCM** = `a/gcd*b` (divide first to dodge overflow). **Primality** by trial division to √n, O(√n). The **Sieve** finds all primes ≤ n in ~O(n) by crossing multiples starting at p². **Factorize** by dividing out factors up to √n. Guard every `i*i` with `long`.
:::
