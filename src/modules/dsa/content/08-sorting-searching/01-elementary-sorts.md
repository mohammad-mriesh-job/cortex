---
title: Elementary Sorts
category: Sorting & Searching
categoryOrder: 8
order: 1
level: Beginner
summary: Bubble, selection, and insertion sort — the O(n²) trio. How each one moves data, which are stable, and why insertion sort still wins on tiny or nearly-sorted inputs.
tags: sorting, bubble sort, selection sort, insertion sort, stability, quadratic
---

The three **elementary sorts** are all **O(n²)** in the worst case, so nobody uses them to sort a
million records. They matter for a different reason: they are the clearest way to *see* what
sorting actually does, and one of them — **insertion sort** — is genuinely the fastest tool for
tiny or nearly-sorted arrays, which is why real libraries fall back to it.

## The trio at a glance

| Sort | One-line idea | Best case | Stable? |
|--|--|:--:|:--:|
| **Bubble** | Repeatedly swap adjacent out-of-order pairs; the largest "bubbles" to the end each pass | O(n) if already sorted | Yes |
| **Selection** | Each pass, find the minimum of the rest and swap it into place | O(n²) always | No |
| **Insertion** | Grow a sorted prefix; take the next element and slide it left into position | O(n) if already sorted | Yes |

## Watch it: insertion sort

Insertion sort keeps a **sorted prefix** on the left and repeatedly pulls the next element (the
`key`) into its correct slot by sliding bigger elements one step right. It is exactly how most
people sort a hand of playing cards.

```walkthrough
title: Insertion sort on [5, 2, 4, 1]
code: |
  for (int i = 1; i < n; i++) {
    int key = a[i];
    int j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];   // slide bigger element right
      j--;
    }
    a[j + 1] = key;      // drop key into the hole
  }
steps:
  - text: 'The first element alone is a trivially sorted prefix. Reach for `key = 2`.'
    array: [5, 2, 4, 1]
    sorted: [0]
    highlight: [1]
    pointers: { 1: 'key' }
    line: 2
  - text: '`5 > 2`, so slide `5` one slot to the right, opening a hole where `2` was.'
    array: [5, 5, 4, 1]
    highlight: [0, 1]
    pointers: { 0: 'j' }
    line: 5
  - text: '`j` fell off the left edge — drop `key` into the hole. Prefix `[2, 5]` is sorted.'
    array: [2, 5, 4, 1]
    sorted: [0, 1]
    line: 8
  - text: 'Next `key = 4`. `5 > 4`, so slide `5` right.'
    array: [2, 5, 5, 1]
    highlight: [1, 2]
    pointers: { 1: 'j' }
    line: 5
  - text: '`2 < 4`, so stop and drop `4` in. Prefix `[2, 4, 5]` is sorted.'
    array: [2, 4, 5, 1]
    sorted: [0, 1, 2]
    line: 8
  - text: 'Last `key = 1` is the smallest — everything slides right and `1` lands first. Done.'
    array: [1, 2, 4, 5]
    sorted: [0, 1, 2, 3]
    line: 8
```

:::tip
On an **already-sorted** array the inner `while` never runs, so insertion sort finishes in a
single **O(n)** pass. That "adaptive" behavior is why it beats fancier sorts on nearly-sorted or
tiny inputs — and why libraries switch to it below ~16 elements.
:::

## Stability — and why it matters

A sort is **stable** if equal keys keep their original relative order. Sort a list of people by
age; if two are the same age, a stable sort preserves whatever order they came in (e.g. an earlier
name sort). **Bubble** and **insertion** are stable because they only ever swap *adjacent* or move
past *strictly greater* elements. **Selection** is not: swapping a far-away minimum can leap an
equal key over its twin.

```java
// Selection sort's long-distance swap breaks stability:
// [ 3a, 3b, 1 ]  ->  swap min(1) with index 0  ->  [ 1, 3b, 3a ]
//   3a and 3b have flipped order.
```

## When do the O(n²) sorts win?

:::key
Use an elementary sort only when **n is small** or the data is **nearly sorted** — otherwise reach
for merge/quick sort. Among the three, **insertion sort** is the practical winner: adaptive,
stable, in-place, and cache-friendly. Bubble and selection are mostly teaching tools.
:::

## Check yourself

```quiz
title: Elementary sorts check
questions:
  - q: 'Which elementary sort runs in **O(n)** on an already-sorted array?'
    options:
      - 'Selection sort'
      - text: 'Insertion sort'
        correct: true
      - 'All three run in O(n²) regardless'
    explain: 'Insertion sort is adaptive — on sorted input the inner while-loop never shifts anything, so it makes a single O(n) pass. Selection sort always scans the full remainder, so it is O(n²) even when sorted.'
  - q: 'Why is selection sort **not** stable?'
    options:
      - 'It compares non-adjacent elements'
      - text: 'It swaps a distant minimum into place, which can jump one equal key over another'
        correct: true
      - 'It uses extra memory'
    explain: 'The long-distance swap that pulls the minimum forward can leapfrog an equal key past its twin, flipping their original order.'
  - q: 'What does each pass of **bubble sort** guarantee?'
    options:
      - text: 'The largest unsorted element bubbles to its final position at the end'
        correct: true
      - 'The array is fully sorted after one pass'
      - 'The smallest element moves to the front'
    explain: 'Each pass compares adjacent pairs left-to-right and swaps the bigger one rightward, so the current maximum ends up parked at the far end.'
```
