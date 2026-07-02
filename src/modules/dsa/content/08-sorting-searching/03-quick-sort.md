---
title: Quick Sort
category: Sorting & Searching
categoryOrder: 8
order: 3
level: Advanced
summary: Partition the array around a pivot so smaller elements land left and larger land right, then recurse. In-place with average O(n log n) — but a bad pivot degrades it to O(n²).
tags: sorting, quick sort, partition, pivot, quickselect, divide and conquer, in-place
---

**Quick sort** is the other great divide-and-conquer sort — and in practice usually the *fastest*
comparison sort, because it works **in place** with excellent cache behavior. Its engine is the
**partition**: choose a **pivot**, rearrange so everything `≤ pivot` sits left of it and everything
`> pivot` sits right, then recurse on the two sides. After a partition, the pivot is in its **final
sorted position** — forever.

## Watch it: the partition step

Using the **Lomuto scheme**, we take the last element as the pivot. Pointer `i` marks the end of the
"≤ pivot" zone; `j` scans forward. Whenever `a[j] ≤ pivot`, we grow the zone (`i++`) and swap
`a[i]` with `a[j]`. At the end we drop the pivot right after the zone — its final home (green).

```walkthrough
title: Lomuto partition of [6, 2, 8, 1, 4, 3], pivot = 3
code: |
  int pivot = a[hi];
  int i = lo - 1;
  for (int j = lo; j < hi; j++) {
    if (a[j] <= pivot) {
      i++;
      swap(a, i, j);
    }
  }
  swap(a, i + 1, hi);   // pivot to its final slot
  return i + 1;
steps:
  - text: 'Pivot = last element = `3`. `i` sits left of the array (the ≤-zone is empty); `j` will scan from the front.'
    array: [6, 2, 8, 1, 4, 3]
    highlight: [5]
    pointers: { 5: 'piv' }
    line: 1
  - text: '`j=0`: `a[j]=6 > 3` — belongs in the >-zone, leave it. `j` moves on.'
    array: [6, 2, 8, 1, 4, 3]
    highlight: [0]
    pointers: { 0: 'j', 5: 'piv' }
    line: 4
  - text: '`j=1`: `2 ≤ 3` — grow the ≤-zone: `i` steps to 0, swap `a[0]`↔`a[1]`.'
    array: [2, 6, 8, 1, 4, 3]
    highlight: [0, 1]
    pointers: { 0: 'i', 1: 'j', 5: 'piv' }
    line: 6
  - text: '`j=2`: `8 > 3` — stays in the >-zone. `i` holds at 0.'
    array: [2, 6, 8, 1, 4, 3]
    highlight: [2]
    pointers: { 0: 'i', 2: 'j', 5: 'piv' }
    line: 4
  - text: '`j=3`: `1 ≤ 3` — `i` steps to 1, swap `a[1]`↔`a[3]`. The `6` and `1` trade places.'
    array: [2, 1, 8, 6, 4, 3]
    highlight: [1, 3]
    pointers: { 1: 'i', 3: 'j', 5: 'piv' }
    line: 6
  - text: '`j=4`: `4 > 3` — stays right. Scan is finished.'
    array: [2, 1, 8, 6, 4, 3]
    highlight: [4]
    pointers: { 1: 'i', 4: 'j', 5: 'piv' }
    line: 4
  - text: 'Swap the pivot into `i + 1 = 2`. Now **3 is in its final position** — `[2, 1]` ≤ 3 on the left, `[6, 4, 8]` > 3 on the right. Recurse on each side.'
    array: [2, 1, 3, 6, 4, 8]
    highlight: [2, 5]
    sorted: [2]
    line: 9
```

:::key
The one fact to remember: **after a partition, the pivot never moves again**. Everything left is
smaller, everything right is larger. Quick sort just repeats this on the left and right sub-ranges
until they shrink to size 1.
:::

## The pivot problem — and worst case

Quick sort's speed lives and dies by pivot choice. A pivot near the **median** splits the array in
half → **O(n log n)**. A pivot that is always the min or max (e.g. picking the last element on an
**already-sorted** array) peels off one element per partition → n levels of O(n) work → **O(n²)**.

:::gotcha
Naively choosing the first or last element as pivot makes **sorted or reverse-sorted input** the
worst case — the most common input in the wild. Fixes: pick a **random** pivot, or use
**median-of-three** (median of first, middle, last). Both make the O(n²) case astronomically
unlikely.
:::

## Complexity

| Case | Time | Space | Stable? |
|--|:--:|:--:|:--:|
| Best | O(n log n) | O(log n) | No |
| Average | O(n log n) | O(log n) | No |
| **Worst** (bad pivots) | **O(n²)** | O(n) | No |

The **O(log n) space** is the recursion stack, not a data buffer — quick sort rearranges the array
in place. It is **not stable**: partition swaps can reorder equal keys.

## Quickselect — partition without full sorting

Partition also solves the **k-th smallest element** in **average O(n)**. After partitioning, the
pivot lands at some index `p`. If `p == k` you are done; otherwise recurse into **only the side that
contains `k`** — you never sort the other half.

````tabs
tabs:
  - label: Quick sort
    body: |
      Recurse into **both** sides of the pivot.
      ```java
      void quickSort(int[] a, int lo, int hi) {
        if (lo >= hi) return;
        int p = partition(a, lo, hi);
        quickSort(a, lo, p - 1);
        quickSort(a, p + 1, hi);
      }
      ```
  - label: Quickselect
    body: |
      Recurse into **one** side — the one holding index `k`. Average O(n).
      ```java
      int select(int[] a, int lo, int hi, int k) {
        int p = partition(a, lo, hi);
        if (p == k) return a[p];
        return p < k ? select(a, p + 1, hi, k)
                     : select(a, lo, p - 1, k);
      }
      ```
````

## Merge vs quick — the recap

```flashcards
title: Sort comparison recap
cards:
  - front: 'Which sort guarantees **O(n log n)** even in the worst case?'
    back: '**Merge sort.** Quick sort averages O(n log n) but degrades to **O(n²)** on bad pivots.'
  - front: 'Which of merge / quick / insertion are **stable**?'
    back: '**Merge** and **insertion** are stable. **Quick** and **selection** are not.'
  - front: 'Which sort is **in-place** (O(1)–O(log n) extra space)?'
    back: '**Quick sort** (O(log n) stack). **Merge sort** needs an **O(n)** buffer.'
  - front: 'Best pick for a **linked list**?'
    back: '**Merge sort** — no random access needed and no extra array, so its O(n) space overhead vanishes.'
  - front: 'Best pick for **k-th smallest** without fully sorting?'
    back: '**Quickselect** — partition and recurse into one side only, average **O(n)**.'
  - front: 'Why do real libraries use quick sort despite the O(n²) risk?'
    back: 'In-place, cache-friendly, small constant factors → fastest in practice. Randomized/median-of-three pivots make the worst case negligible; some (introsort) switch to heap sort if recursion gets too deep.'
```

## Check yourself

```quiz
title: Quick sort check
questions:
  - q: 'Immediately after a partition, what is true about the pivot?'
    options:
      - 'It is at the middle of the array'
      - text: 'It is in its final sorted position — smaller elements left, larger right'
        correct: true
      - 'It still needs to be sorted later'
    explain: 'Partition places the pivot exactly where it belongs in the final order; the recursion then only sorts the two sides around it.'
  - q: 'What input triggers quick sort''s **O(n²)** worst case when the pivot is always the last element?'
    options:
      - 'A random array'
      - text: 'An already-sorted (or reverse-sorted) array'
        correct: true
      - 'A randomly shuffled array of distinct values'
    explain: 'A last-element pivot on sorted data is always the maximum, so each partition peels off just one element — n partitions of O(n) work each = O(n²). Random or median-of-three pivots avoid this.'
  - q: 'What does **quickselect** find, and at what average cost?'
    options:
      - text: 'The k-th smallest element in average O(n)'
        correct: true
      - 'The full sorted array in O(n)'
      - 'The median only, in O(log n)'
    explain: 'Quickselect partitions and recurses into just the side containing rank k, so it averages O(n) — faster than sorting everything.'
```
