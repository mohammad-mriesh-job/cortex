---
title: Must-Know Patterns
category: Interview Prep
categoryOrder: 13
order: 4
level: Intermediate
summary: The ~15 patterns that cover the vast majority of interview problems, on one page — plus the classic bugs (off-by-one, overflow, empty input) that sink otherwise-correct answers.
tags: patterns, cheat-sheet, gotchas, mistakes, interview, reference
---

Studies of interview question banks keep landing on the same conclusion: roughly **15 patterns
cover the overwhelming majority of problems**. Learn to recognize and apply these, and most
"new" problems become variations you have already seen. This is the one-page cheat sheet — bookmark
it.

## The 15 essential patterns

| # | Pattern | When to reach for it | Classic problem | Typical cost |
|--|--|--|--|:--:|
| 1 | **Two Pointers** | sorted array, pair sums, palindromes, in-place | Valid Palindrome | O(n) |
| 2 | **Fast & Slow Pointers** | cycle detection, middle of list, O(1) space | Linked List Cycle | O(n) |
| 3 | **Sliding Window** | contiguous subarray/substring with a condition | Longest Substring No Repeat | O(n) |
| 4 | **Merge Intervals** | overlapping ranges, meetings, scheduling | Merge Intervals | O(n log n) |
| 5 | **Cyclic Sort** | array of numbers in range 1..n, find missing/dup | Find Missing Number | O(n) |
| 6 | **In-place Reversal of Linked List** | reverse a sublist without extra space | Reverse Linked List | O(n) |
| 7 | **BFS (level order)** | shortest path unweighted, level-by-level | Binary Tree Level Order | O(V+E) |
| 8 | **DFS (recursion/stack)** | all paths, tree/graph traversal, connectivity | Number of Islands | O(V+E) |
| 9 | **Two Heaps** | median of a stream, balance halves | Find Median from Stream | O(log n)/op |
| 10 | **Subsets / Backtracking** | all combinations, permutations, subsets | Subsets, Permutations | O(2ⁿ) / O(n!) |
| 11 | **Modified Binary Search** | sorted/rotated/answer-space search | Search Rotated Array | O(log n) |
| 12 | **Top-K Elements** | K largest/smallest/frequent | Top K Frequent | O(n log k) |
| 13 | **K-way Merge** | merge K sorted lists/arrays | Merge K Sorted Lists | O(n log k) |
| 14 | **Dynamic Programming** | count ways, min/max, overlapping subproblems | Coin Change, Edit Distance | O(n·m) |
| 15 | **Topological Sort** | ordering with dependencies, DAG | Course Schedule | O(V+E) |

:::tip
When stuck, mentally walk down this list and ask *"could this be a ___ problem?"* for each row.
The cue almost always matches one of the fifteen. Pattern-matching against a fixed menu beats
staring at a blank page.
:::

## Bonus micro-patterns worth knowing

| Pattern | Cue | Cost |
|--|--|:--:|
| **Prefix Sum** | many range-sum queries, subarray sum = K | O(n) build, O(1) query |
| **Monotonic Stack** | next greater/smaller, largest rectangle | O(n) |
| **Union-Find** | connectivity, grouping, cycle in undirected graph | ~O(α(n)) |
| **Trie** | prefix search, autocomplete, word dictionary | O(m) per word |
| **Bit Manipulation** | "without extra space", single number, subsets via bitmask | O(n) |

## The gotchas that sink correct solutions

Most interview failures are not wrong algorithms — they are **small bugs** in a right one. Guard
against these on every problem.

| Gotcha | What goes wrong | Guard |
|--|--|--|
| **Off-by-one** | `<=` vs `<`, wrong loop bound, `n` vs `n-1` | dry-run the smallest case (n = 0, 1, 2) |
| **Integer overflow** | `left + right`, sum of large ints, `a * b` | use `long`, or `lo + (hi - lo)/2` |
| **Empty / null input** | crash on `arr[0]`, `s.charAt(0)`, empty list | check `if (arr == null || arr.length == 0)` first |
| **Duplicates** | pattern assumes uniqueness; double-counting | ask "can there be duplicates?"; skip repeats |
| **Single element / all same** | window never shrinks, pointers cross wrong | test n = 1 and all-equal arrays |
| **Not resetting state** | reused variable across test cases / recursion | reset accumulators; undo choices in backtracking |
| **Mutating while iterating** | `ConcurrentModificationException`, skipped elements | iterate a copy or use an index/iterator's `remove()` |

:::gotcha
`int mid = (lo + hi) / 2;` overflows when `lo + hi > Integer.MAX_VALUE`. This exact bug lived in
Java's own `Arrays.binarySearch` for **nine years**. Always write `int mid = lo + (hi - lo) / 2;`.
:::

:::warning
For sums over large arrays or products, an `int` (max ~2.1×10⁹) overflows silently and wraps to a
negative number — no exception. If values can be large, accumulate in a `long`.
:::

## Recall drills

```flashcards
title: Pattern & gotcha recall
cards:
  - front: 'Cue: "median of a **number stream**"'
    back: '**Two Heaps** — a max-heap for the lower half, a min-heap for the upper half.'
  - front: 'Cue: "merge **K sorted** lists"'
    back: '**K-way Merge** with a min-heap — O(n log k).'
  - front: 'Cue: array holds numbers **1..n**, find the missing one'
    back: '**Cyclic Sort** — place each value at its index, then scan for the gap. O(n), O(1).'
  - front: 'Cue: "course prerequisites" / "build order"'
    back: '**Topological Sort** on a DAG (Kahn''s BFS or DFS).'
  - front: 'Safe midpoint formula for binary search?'
    back: '`lo + (hi - lo) / 2` — avoids `lo + hi` overflow.'
  - front: 'First thing to check for almost every array/string problem?'
    back: '**Empty / null input** — guard before touching index 0.'
  - front: 'Cue: "detect a cycle in a linked list with O(1) space"'
    back: '**Fast & Slow Pointers** (Floyd''s tortoise and hare).'
  - front: 'Cue: "number of subarrays with sum = K"'
    back: '**Prefix Sum + Hash Map** — store running-sum counts. O(n).'
```

## Check yourself: what is the time complexity?

```quiz
title: Patterns & complexity check
questions:
  - q: 'Merging K sorted lists (n total nodes) with a min-heap runs in:'
    options:
      - 'O(n · k)'
      - text: 'O(n log k)'
        correct: true
      - 'O(n²)'
    explain: 'Each of the n nodes does one O(log k) heap push and pop, where the heap holds at most k list heads.'
  - q: 'Generating all subsets of an array of n elements is:'
    options:
      - 'O(n²)'
      - text: 'O(2ⁿ · n)'
        correct: true
      - 'O(n log n)'
    explain: 'There are 2ⁿ subsets, and copying each into the result costs up to O(n) — hence O(2ⁿ · n).'
  - q: 'What is the classic bug in `int mid = (lo + hi) / 2;`?'
    options:
      - 'It is too slow'
      - text: 'Integer overflow when lo + hi exceeds Integer.MAX_VALUE'
        correct: true
      - 'It rounds up instead of down'
    explain: 'For large indices lo + hi can overflow to a negative int. Use lo + (hi - lo) / 2.'
  - q: 'A sliding-window scan over an array of length n is typically:'
    options:
      - text: 'O(n) time'
        correct: true
      - 'O(n²) time'
      - 'O(n log n) time'
    explain: 'Both window boundaries advance monotonically, so each element enters and leaves the window at most once — O(n) total.'
  - q: 'Topological sort of a graph with V vertices and E edges runs in:'
    options:
      - 'O(V²)'
      - text: 'O(V + E)'
        correct: true
      - 'O(E log V)'
    explain: 'Kahn''s algorithm processes each vertex and each edge exactly once, giving O(V + E).'
```

:::key
Fifteen patterns cover most interviews — memorize the **cue → pattern** rows and match new
problems against the menu. Then the difference between pass and fail is usually a **gotcha**:
guard empty/null input, watch off-by-one and overflow (`lo + (hi-lo)/2`, use `long`), and always
ask about duplicates.
:::
