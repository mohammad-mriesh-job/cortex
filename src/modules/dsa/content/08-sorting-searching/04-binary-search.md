---
title: Binary Search
category: Sorting & Searching
categoryOrder: 8
order: 4
level: Intermediate
summary: Halve the search range each step to find a value in a sorted array in O(log n) — plus the lower/upper-bound variants and the "search on the answer" trick that unlocks many hard problems.
tags: searching, binary search, sorted, log n, lower bound, upper bound, monotonic
---

**Binary search** finds a value in a **sorted** array in **O(log n)** by repeatedly halving the
live range: check the middle, then throw away the half that cannot contain the target. Twenty
probes suffice for a million elements. Its real power in interviews goes beyond arrays — any time an
answer space is **monotonic** ("does X work at value k?" flips from no to yes exactly once), you can
binary-search it.

## Watch it: search for a value

`lo` and `hi` fence the live range. Each step computes `mid`, compares `a[mid]` to the target, and
discards the impossible half by moving `lo` or `hi` past `mid`.

```walkthrough
title: Binary search for 20 in a sorted array
code: |
  int lo = 0, hi = n - 1;
  while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (a[mid] == target) return mid;
    if (a[mid] < target) lo = mid + 1;  // target is to the right
    else                 hi = mid - 1;  // target is to the left
  }
  return -1;  // not found
steps:
  - text: 'Search the sorted array for `20`. `lo` at index 0, `hi` at index 7 — the whole array is live.'
    array: [1, 4, 7, 9, 12, 15, 20, 25]
    pointers: { 0: 'lo', 7: 'hi' }
    line: 1
  - text: '`mid = 3`, `a[mid] = 9 < 20`. The target must be to the **right**, so discard `[0..3]`: `lo = mid + 1 = 4`.'
    array: [1, 4, 7, 9, 12, 15, 20, 25]
    highlight: [3]
    pointers: { 0: 'lo', 3: 'mid', 7: 'hi' }
    line: 5
  - text: 'Live range is now `[4..7]`. `mid = 5`, `a[mid] = 15 < 20`. Discard the left half again: `lo = 6`.'
    array: [1, 4, 7, 9, 12, 15, 20, 25]
    highlight: [5]
    pointers: { 4: 'lo', 5: 'mid', 7: 'hi' }
    line: 5
  - text: 'Range `[6..7]`. `mid = 6`, `a[mid] = 20` — **found** at index 6. Three probes for eight elements: that is `log₂n`.'
    array: [1, 4, 7, 9, 12, 15, 20, 25]
    sorted: [6]
    pointers: { 6: 'mid' }
    line: 4
```

:::gotcha
Two classic bugs. **(1)** Compute the midpoint as `lo + (hi - lo) / 2`, not `(lo + hi) / 2`, which can
**overflow** when `lo + hi` exceeds `int` range. **(2)** Get the loop boundary right: with
`while (lo <= hi)` you must move past `mid` (`mid + 1` / `mid - 1`), or the range never shrinks and
you spin forever.
:::

## The variants that actually get asked

Plain "find the value" is the easy version. Interviews usually want a **boundary** — the first or
last position satisfying a condition — or search over a computed answer space.

````tabs
tabs:
  - label: Exact match
    body: |
      Return the index of `target`, or `-1`.
      ```java
      int search(int[] a, int target) {
        int lo = 0, hi = a.length - 1;
        while (lo <= hi) {
          int mid = lo + (hi - lo) / 2;
          if (a[mid] == target) return mid;
          if (a[mid] < target) lo = mid + 1;
          else hi = mid - 1;
        }
        return -1;
      }
      ```
  - label: Lower bound
    body: |
      First index with `a[i] >= target` (the insertion point). Note the `[lo, hi)` half-open range.
      ```java
      int lowerBound(int[] a, int target) {
        int lo = 0, hi = a.length;
        while (lo < hi) {
          int mid = lo + (hi - lo) / 2;
          if (a[mid] < target) lo = mid + 1;
          else hi = mid;
        }
        return lo;   // in [0, n]
      }
      ```
  - label: Upper bound
    body: |
      First index with `a[i] > target`. Count of `target` = upperBound − lowerBound.
      ```java
      int upperBound(int[] a, int target) {
        int lo = 0, hi = a.length;
        while (lo < hi) {
          int mid = lo + (hi - lo) / 2;
          if (a[mid] <= target) lo = mid + 1;
          else hi = mid;
        }
        return lo;
      }
      ```
  - label: Search the answer
    body: |
      When feasibility is **monotonic**, binary-search the answer value itself (e.g. min capacity, min speed).
      ```java
      // smallest x in [lo, hi] for which feasible(x) is true
      while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (feasible(mid)) hi = mid;
        else lo = mid + 1;
      }
      return lo;
      ```
````

:::senior
The senior insight: binary search is not about arrays, it is about a **monotonic predicate**. If
`feasible(x)` is false-false-…-true-true (flips exactly once), you can find the boundary in
O(log range). "Ship packages in D days," "Koko eats bananas in H hours," "minimize the largest
subarray sum" — all are binary-search-on-the-answer in disguise. Spotting the monotonicity is the
skill.
:::

## Complexity

| Approach | Time | Space |
|--|:--:|:--:|
| Linear scan | O(n) | O(1) |
| **Binary search** (sorted) | **O(log n)** | O(1) iterative |
| Sort once, then many searches | O(n log n) + O(log n) each | O(1) |

:::note
Binary search's precondition is a **sorted** (or otherwise monotonic) array. If you only search
once, an O(n) linear scan is cheaper than sorting first. Binary search pays off when the data is
**already sorted** or you will run **many** searches against it.
:::

## Check yourself

```quiz
title: Binary search check
questions:
  - q: 'What precondition must hold for binary search on an array?'
    options:
      - text: 'The array is sorted (or otherwise monotonic)'
        correct: true
      - 'The array has unique elements'
      - 'The array length is a power of two'
    explain: 'Discarding half the range relies on order: knowing a[mid] < target means the target cannot be in the left half. Without sorting that inference breaks.'
  - q: 'Why compute `mid = lo + (hi - lo) / 2` instead of `(lo + hi) / 2`?'
    options:
      - 'It is faster'
      - text: 'To avoid integer overflow when lo + hi exceeds the int range'
        correct: true
      - 'It rounds differently'
    explain: 'For large indices lo + hi can overflow a 32-bit int and go negative; lo + (hi - lo) / 2 computes the same midpoint without ever forming that large sum.'
  - q: 'To count how many times `target` appears in a sorted array, you can compute:'
    options:
      - 'lowerBound only'
      - text: 'upperBound(target) − lowerBound(target)'
        correct: true
      - 'hi − lo at the end of an exact-match search'
    explain: 'lowerBound is the first index >= target and upperBound is the first index > target, so their difference is exactly the run length of target.'
  - q: 'A problem asks for the minimum ship capacity to deliver all packages in D days. Why does binary search apply?'
    options:
      - 'The package weights are sorted'
      - text: 'Feasibility is monotonic — if capacity c works, every larger capacity also works'
        correct: true
      - 'The number of days is a power of two'
    explain: 'Because "can we finish in D days with capacity c?" flips from false to true exactly once as c grows, you can binary-search the smallest feasible c over the answer space.'
```
