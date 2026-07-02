---
title: Modular Arithmetic
category: Math & Number Theory
categoryOrder: 12
order: 2
level: Advanced
summary: Why competitive problems say "answer mod 1e9+7", plus the three tools that make it work — safe modular add/multiply, fast (binary) exponentiation, and the modular inverse via Fermat's little theorem.
tags: modular arithmetic, mod, fast exponentiation, binary exponentiation, modular inverse, fermat, 1e9+7
---

When a count can explode past `long` — "number of ways, modulo 10⁹+7" — you compute the answer **under a modulus** the whole way, never letting it grow. That requires knowing how `+`, `*`, and *division* behave under `mod`.

## Why `1_000_000_007`

It's a **prime** just under 2³⁰, so any two values `< MOD` multiply to `< 2⁶⁰` — still inside a signed `long` (max ~9.2×10¹⁸). Being prime is what makes modular **division** possible (via inverses, below). `998244353` is the other common one (it's NTT-friendly).

## Add and multiply without overflow

Modulo distributes over `+` and `*`, so reduce at every step:

```java
static final int MOD = 1_000_000_007;

long add(long a, long b) { return (a + b) % MOD; }
long mul(long a, long b) { return (a * b) % MOD; }        // a,b < MOD ⇒ product < 2^60, fits in long
long sub(long a, long b) { return (a - b % MOD + MOD) % MOD; }  // +MOD keeps it non-negative
```

:::gotcha
Subtraction can go negative: `(a - b) % MOD` may be `-3` in Java (the `%` result takes the sign of the dividend). Add `MOD` back — `(a - b + MOD) % MOD` — so results stay in `[0, MOD)`.
:::

## Fast (binary) exponentiation — O(log e)

Computing `baseᵉ mod m` by multiplying `e` times is O(e) and overflows. Square-and-multiply reads the exponent's bits: square the base each step, and multiply it in whenever the current bit is 1.

```java
long power(long base, long e, long mod) {
    long result = 1;
    base %= mod;
    while (e > 0) {
        if ((e & 1) == 1) result = result * base % mod;   // bit set → include
        base = base * base % mod;                          // square
        e >>= 1;                                           // next bit
    }
    return result;
}
```

`power(2, 60, MOD)` takes ~6 squarings instead of 60 naive multiplications. This is the workhorse behind modular inverses, hashing, and matrix-power recurrences.

## Modular inverse — dividing under a modulus

You can't just divide: `(a / b) % m ≠ (a % m) / (b % m)`. Instead multiply by the **modular inverse** `b⁻¹`, the value with `b · b⁻¹ ≡ 1 (mod m)`. When `m` is **prime**, **Fermat's little theorem** gives it directly:

> `b^(m-1) ≡ 1 (mod m)`  ⟹  `b⁻¹ ≡ b^(m-2) (mod m)`

```java
long inverse(long b) { return power(b, MOD - 2, MOD); }   // MOD must be prime
long divide(long a, long b) { return a * inverse(b) % MOD; }
```

:::senior
Two things interviewers listen for. **(1)** Fermat's inverse needs a **prime** modulus and `gcd(b, m) = 1`; for a composite modulus use the **extended Euclidean** algorithm instead. **(2)** For computing many `nCr mod p`, precompute factorials and their inverses once — then each binomial is `fact[n] * invFact[r] % p * invFact[n-r] % p`, O(1) per query after an O(n) setup.
:::

## Check yourself

```quiz
title: Modular arithmetic check
questions:
  - q: 'Why is the answer taken modulo a prime like 1e9+7 in counting problems?'
    options:
      - text: 'The true count overflows 64-bit integers, so it is kept small under a modulus; a prime enables modular division'
        correct: true
      - 'Primes make the code run faster'
      - 'It rounds the answer'
    explain: 'Results are reduced mod p at every step to fit in a long; primality lets you divide via modular inverses (Fermat).'
  - q: 'Fast exponentiation computes bᵉ mod m in how many multiplications?'
    options:
      - 'O(e)'
      - text: 'O(log e)'
        correct: true
      - 'O(√e)'
    explain: 'Square-and-multiply processes one bit of the exponent per iteration, so it needs about log₂(e) squarings.'
  - q: 'To compute `a / b (mod p)` for prime p, you multiply a by:'
    options:
      - text: 'b^(p-2) mod p — the modular inverse from Fermat''s little theorem'
        correct: true
      - 'b^(p-1) mod p'
      - '1 / b rounded down'
    explain: 'Since b^(p-1) ≡ 1, the inverse is b^(p-2). Multiplying by it is modular division. (For composite moduli, use extended Euclid.)'
```

:::key
Reduce mod at every step; keep values in `[0, MOD)` (add `MOD` after subtraction). **Fast exponentiation** does `bᵉ mod m` in O(log e) by square-and-multiply. You can't divide directly — multiply by the **modular inverse**, which for a **prime** modulus is `b^(m-2) mod m` (Fermat). Precompute factorial inverses for O(1) `nCr mod p`.
:::
