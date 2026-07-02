---
title: Bit Manipulation Patterns
category: Bit Manipulation
categoryOrder: 11
order: 2
level: Advanced
summary: The recurring bit problems — single number (I/II/III), counting bits, subset enumeration via bitmask, and bitmask DP — each reduced to a reusable template.
tags: bits, xor, single number, subsets, bitmask, popcount, bitmask-dp, patterns
---

Once the [basics](/dsa/topic/bit-manipulation/bitwise-basics) are reflex, a small set of **patterns** covers almost every bit-manipulation interview question. Learn the shape of each.

## Pattern 1 — XOR to cancel pairs

**Single Number** (every element twice except one): XOR everything.

**Missing Number** (`0..n` with one gone): XOR the indices *and* the values — every present number cancels its index, leaving the gap.

```java
int missing = nums.length;                 // start with n
for (int i = 0; i < nums.length; i++)
    missing ^= i ^ nums[i];                 // indices and values cancel
return missing;
```

**Single Number III** (two uniques, all others paired): XOR everything to get `a ^ b`, then use its lowest set bit `d = ab & -ab` to split the array into "has bit d" vs "doesn't" — each group now has one unique.

## Pattern 2 — count bits with Brian Kernighan

`x & (x - 1)` clears the lowest set bit, so the loop runs **once per set bit**, not 32 times.

```walkthrough
title: Count set bits in 0b10110 (= 22) — Brian Kernighan
code: |
  int count = 0;
  while (x != 0) {
    x &= (x - 1);   // drop the lowest set bit
    count++;
  }
  return count;
steps:
  - text: 'x = 10110. Three bits set — the loop will run exactly three times.'
    array: [1, 0, 1, 1, 0]
    highlight: [0, 2, 3]
    line: 2
  - text: 'x & (x-1) clears the lowest set bit (bit 1). x = 10100. count = 1.'
    array: [1, 0, 1, 0, 0]
    highlight: [0, 2]
    line: 3
  - text: 'Clear the next lowest (bit 2). x = 10000. count = 2.'
    array: [1, 0, 0, 0, 0]
    highlight: [0]
    line: 3
  - text: 'Clear the last (bit 4). x = 00000. count = 3. Loop ends — three iterations, not five.'
    array: [0, 0, 0, 0, 0]
    sorted: [0, 1, 2, 3, 4]
    line: 5
```

For **Counting Bits** (`ans[i]` for all `i` in `0..n`), a one-line DP beats calling popcount n times: `ans[i] = ans[i >> 1] + (i & 1)` — the bits of `i` are the bits of `i/2` plus the last bit.

## Pattern 3 — enumerate subsets with a bitmask

An `n`-element set has `2ⁿ` subsets, one per integer in `0 .. 2ⁿ-1`. Bit `i` of the mask means "include element `i`."

```java
int n = nums.length;
for (int mask = 0; mask < (1 << n); mask++) {
    List<Integer> subset = new ArrayList<>();
    for (int i = 0; i < n; i++)
        if ((mask >> i & 1) == 1)          // is element i in this subset?
            subset.add(nums[i]);
    result.add(subset);
}
```

:::tip
Iterating **submasks** of a mask is a known trick: `for (int s = mask; s > 0; s = (s - 1) & mask)` visits every non-empty subset of the set bits of `mask` — the backbone of many bitmask-DP transitions.
:::

## Pattern 4 — bitmask DP (state = a set)

When `n ≤ ~20` and the state is *"which elements have I used?"*, encode that set as the bits of an `int`. The Travelling Salesman and assignment problems are the canon.

```java
// dp[mask][u] = min cost to visit exactly the set `mask`, ending at city u
int[][] dp = new int[1 << n][n];
for (int[] row : dp) Arrays.fill(row, INF);
dp[1][0] = 0;                               // visited only {0}, ending at city 0
for (int mask = 1; mask < (1 << n); mask++)
    for (int u = 0; u < n; u++) if ((mask >> u & 1) == 1 && dp[mask][u] < INF)
        for (int v = 0; v < n; v++) if ((mask >> v & 1) == 0)
            dp[mask | 1 << v][v] = Math.min(dp[mask | 1 << v][v], dp[mask][u] + cost[u][v]);
// tour cost: min over u of dp[(1<<n)-1][u] + cost[u][0]
```

:::senior
The tell for bitmask DP is a **small `n` (≤ 20-ish) plus "subset / assignment / visit-all" phrasing.** `2²⁰` is ~1M states — fine; `2³⁰` is a billion — too big, so if `n` is large the intended solution is *not* bitmask DP. State the `2ⁿ · n` cost out loud so the interviewer knows you know the ceiling.
:::

## Check yourself

```quiz
title: Bit patterns check
questions:
  - q: 'To find the one missing number in an array holding 0..n with one absent, you can:'
    options:
      - text: 'XOR all indices 0..n together with all values — the missing number survives'
        correct: true
      - 'Sum the array and hope for no overflow'
      - 'Sort and binary search'
    explain: 'Each present value cancels its matching index under XOR, leaving only the missing number. O(n) time, O(1) space, and no overflow risk (unlike the sum approach).'
  - q: 'Brian Kernighan''s `x &= (x - 1)` loop counts set bits in how many iterations?'
    options:
      - 'Always 32'
      - text: 'One per set bit'
        correct: true
      - 'log₂(x)'
    explain: 'Each step removes exactly the lowest remaining set bit, so the loop body runs once for every 1 in x — much faster than checking all 32 positions when x is sparse.'
  - q: 'You want every subset of an n-element array. What is the outer loop?'
    options:
      - text: '`for (int mask = 0; mask < (1 << n); mask++)`'
        correct: true
      - '`for (int mask = 0; mask < n * n; mask++)`'
      - '`for (int mask = 0; mask < n!; mask++)`'
    explain: 'There are 2ⁿ subsets, indexed by the integers 0 .. 2ⁿ-1; bit i of the mask decides whether element i is included.'
  - q: 'Which signal most suggests a bitmask-DP solution?'
    options:
      - 'n up to 10⁵'
      - text: 'Small n (≤ ~20) plus "use each element once" / "visit all" phrasing'
        correct: true
      - 'The array is already sorted'
    explain: 'Bitmask DP encodes a subset as bits, so it needs 2ⁿ states to be affordable — practical only for n around 20 or less.'
```

```flashcards
title: Bit pattern recall
cards:
  - front: 'Single Number (all twice but one)'
    back: 'XOR every element — pairs cancel, the unique remains. O(n)/O(1).'
  - front: 'Counting Bits for all i in 0..n'
    back: '`ans[i] = ans[i >> 1] + (i & 1)` — DP off the already-known i/2.'
  - front: 'Enumerate all 2ⁿ subsets'
    back: 'Loop `mask` in `0..(1<<n)`; include element i when `(mask >> i & 1) == 1`.'
  - front: 'Iterate all submasks of `mask`'
    back: '`for (int s = mask; s > 0; s = (s - 1) & mask)`'
  - front: 'When is bitmask DP viable?'
    back: 'n ≤ ~20 (2ⁿ states) with a "which subset used" style state.'
```

:::key
Four templates cover bit interviews: **XOR** cancels pairs (single/missing number), **Brian Kernighan** (`x &= x-1`) counts set bits in one-per-bit iterations, a **bitmask** enumerates `2ⁿ` subsets, and **bitmask DP** encodes a used-set as bits for small `n`. Match the phrasing to the template.
:::
