---
title: Sliding Window
category: Arrays & Strings
categoryOrder: 2
order: 3
level: Intermediate
summary: Slide a contiguous window across an array instead of recomputing every subarray — collapsing O(n·k) or O(n²) brute forces into a single O(n) pass.
tags: sliding window, subarray, substring, two pointers, optimization, technique
---

The **sliding window** turns problems about **contiguous subarrays/substrings** into a single
O(n) sweep. Instead of recomputing a fresh sum or count for every window, you **reuse** the
previous window: add what enters on the right, remove what leaves on the left. One value slides,
you don't start over.

## Two flavors

| Flavor | Window size | Classic problem |
|--|--|--|
| **Fixed** | Constant `k` | Max sum of any subarray of size `k` |
| **Variable** | Grows / shrinks by a rule | Longest substring without repeating chars |

## Fixed window: max sum of size k

Brute force sums every window from scratch — O(n·k). The window trick keeps a running sum:
when it slides one step, **subtract the element that left, add the element that entered**. O(n).

```walkthrough
title: Max sum of a subarray of size k (k = 3)
code: |
  int sum = 0;
  for (int i = 0; i < k; i++) sum += a[i];   // first window
  int best = sum;
  for (int r = k; r < n; r++) {
    sum += a[r] - a[r - k];   // enter right, drop left
    best = Math.max(best, sum);
  }
steps:
  - text: 'Build the first window `[2, 1, 5]`. `sum = 8`, `best = 8`.'
    array: [2, 1, 5, 1, 3, 2]
    highlight: [0, 1, 2]
    pointers: { 0: 'L', 2: 'R' }
    line: 2
  - text: 'Slide right: `1` enters, `2` leaves. `sum = 8 + 1 - 2 = 7`. Window `[1, 5, 1]`. best stays 8.'
    array: [2, 1, 5, 1, 3, 2]
    highlight: [1, 2, 3]
    pointers: { 1: 'L', 3: 'R' }
    line: 5
  - text: 'Slide: `3` enters, `1` leaves. `sum = 7 + 3 - 1 = 9`. Window `[5, 1, 3]`. New **best = 9**!'
    array: [2, 1, 5, 1, 3, 2]
    highlight: [2, 3, 4]
    pointers: { 2: 'L', 4: 'R' }
    line: 6
  - text: 'Slide: `2` enters, `5` leaves. `sum = 9 + 2 - 5 = 6`. Window `[1, 3, 2]`. best stays 9.'
    array: [2, 1, 5, 1, 3, 2]
    highlight: [3, 4, 5]
    pointers: { 3: 'L', 5: 'R' }
    line: 5
  - text: 'End of array. Answer: **best = 9** — found in one O(n) pass, never re-summing a window.'
    array: [2, 1, 5, 1, 3, 2]
    sorted: [2, 3, 4]
    line: 6
```

:::key
The fixed-window mantra: **enter right, drop left, in O(1)**. The window never rebuilds — each
slide is `sum += a[r] - a[r - k]`. That reuse is the entire difference between O(n·k) and O(n).
:::

## Variable window: longest substring without repeats

Here the window **breathes**. We expand `R` to include new characters; the moment we hit a
**duplicate**, we shrink from `L` until the window is valid again. A set (or map) tracks what is
currently inside.

```walkthrough
title: Longest substring without repeating characters — "abcabcbb"
code: |
  Set<Character> win = new HashSet<>();
  int L = 0, best = 0;
  for (int R = 0; R < n; R++) {
    while (win.contains(s[R]))   // duplicate — shrink
      win.remove(s[L++]);
    win.add(s[R]);               // now valid — expand
    best = Math.max(best, R - L + 1);
  }
steps:
  - text: 'Expand: `a`, `b`, `c` are all new. Window `abc`, length 3. **best = 3**.'
    array: [a, b, c, a, b, c, b, b]
    highlight: [0, 1, 2]
    pointers: { 0: 'L', 2: 'R' }
    line: 6
  - text: '`R` reaches `a` (index 3) — but `a` is already in the window! Enter the shrink loop.'
    array: [a, b, c, a, b, c, b, b]
    highlight: [0, 1, 2, 3]
    pointers: { 0: 'L', 3: 'R' }
    line: 4
  - text: 'Shrink: remove `s[L]=a` and advance `L`. The duplicate `a` is gone; window becomes `bca`, still length 3.'
    array: [a, b, c, a, b, c, b, b]
    highlight: [1, 2, 3]
    pointers: { 1: 'L', 3: 'R' }
    line: 5
  - text: '`R = 6` (`b`) collides again. Shrink from the left past the old `b` and `c` until valid — window `cb` at indices 5..6. Keep L moving while `b` is inside.'
    array: [a, b, c, a, b, c, b, b]
    highlight: [4, 5, 6]
    pointers: { 4: 'L', 6: 'R' }
    line: 4
  - text: 'After resolving all duplicates the longest valid window seen was length 3 (`abc`). **best = 3**. Each index is added and removed at most once → O(n).'
    array: [a, b, c, a, b, c, b, b]
    sorted: [0, 1, 2]
    line: 7
```

## The variable-window template

```java
int L = 0, best = 0;
for (int R = 0; R < n; R++) {
    // 1. include a[R] in the window's state
    while (/* window is invalid */) {
        // 2. shrink: remove a[L], then L++
    }
    // 3. window is valid here — record the answer
    best = Math.max(best, R - L + 1);
}
```

:::tip
Almost every variable-window problem fits this shape. The only things that change are the
**window state** (a sum, a char set, a frequency map) and the **invalid condition** in the
`while`. Learn the skeleton, then plug in the problem-specific bookkeeping.
:::

:::gotcha
Sliding window only works on **contiguous** ranges. If a problem asks about *subsequences*
(non-contiguous) or allows **negative numbers** in a "sum ≥ target" window, the "shrinking always
helps" assumption breaks — reach for prefix sums or another technique instead.
:::

## Why it's O(n), not O(n²)

The `while` loop looks like it might make things quadratic, but it doesn't: **`L` only ever moves
forward, at most n times total** across the whole run. Each element is added once (by `R`) and
removed at most once (by `L`). Two pointers, each sweeping the array once → **O(n)**.

## Complexity

| Approach | Time | Space |
|--|:--:|:--:|
| Brute force (every subarray) | O(n²) / O(n·k) | O(1) |
| **Fixed window** | **O(n)** | O(1) |
| **Variable window** (with set/map) | **O(n)** | O(k) for the window state |

## Check yourself

```quiz
title: Sliding window check
questions:
  - q: 'When a fixed window of size k slides one step, updating the sum costs:'
    options:
      - 'O(k) — re-add every element'
      - text: 'O(1) — add the entering element, subtract the leaving one'
        correct: true
      - 'O(n)'
    explain: 'The window reuses the previous sum: `sum += a[R] - a[R-k]`. That O(1) update is why the whole scan is O(n).'
  - q: 'In the variable-window "longest substring" problem, what triggers shrinking L?'
    options:
      - 'The window reaching size k'
      - text: 'The window becoming invalid (e.g. a duplicate character appears)'
        correct: true
      - 'Reaching the end of the string'
    explain: 'You expand R greedily and only shrink from L when the window violates its constraint — here, a repeated character.'
  - q: 'Despite the inner while-loop, the variable window is O(n) because:'
    options:
      - 'The array is sorted'
      - text: 'L moves forward at most n times total across the whole run'
        correct: true
      - 'The while-loop runs at most k times each iteration'
    explain: 'Each element enters once via R and leaves at most once via L. Total pointer movement is O(n), not O(n²).'
  - q: 'Which problem is NOT a fit for a sliding window?'
    options:
      - 'Max sum of a contiguous subarray of size k'
      - 'Longest substring without repeating characters'
      - text: 'Largest sum of a non-contiguous subsequence'
        correct: true
    explain: 'Sliding window needs a contiguous range. Non-contiguous subsequences break the "one element slides in/out" model.'
```

:::senior
Interview tell: any phrase like **"contiguous subarray/substring"** paired with **"longest /
shortest / max / min"** or a **fixed size k** is a sliding-window flag. Decide first whether the
window is fixed (constant k) or variable (grow/shrink by a rule) — that choice picks the template.
:::
