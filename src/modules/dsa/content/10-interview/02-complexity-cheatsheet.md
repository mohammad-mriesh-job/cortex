---
title: Complexity Cheat Sheet
category: Interview Prep
categoryOrder: 13
order: 2
level: Intermediate
summary: Every data-structure operation, every sorting algorithm, and every common pattern — their Big-O in one place, ready to recite under pressure.
tags: big-o, complexity, cheat-sheet, data-structures, sorting, reference
---

Interviewers expect the Big-O of any structure or algorithm **instantly**, without derivation.
This page is the single reference to memorize. Skim the tables, drill the flashcards, then quiz
yourself until every cell is reflex.

## Data structures — operation complexity

Time is **average / worst** where they differ. "Search" means find-by-value; "access" means
by-index or by-key.

| Structure | Access | Search | Insert | Delete | Space |
|--|:--:|:--:|:--:|:--:|:--:|
| **Array** (static) | O(1) | O(n) | O(n) | O(n) | O(n) |
| **Dynamic array** (ArrayList) | O(1) | O(n) | O(1)* / O(n) | O(n) | O(n) |
| **Linked list** (singly) | O(n) | O(n) | O(1)† | O(1)† | O(n) |
| **Stack / Queue** | O(n) | O(n) | O(1) | O(1) | O(n) |
| **Hash map / set** | — | O(1) / O(n) | O(1) / O(n) | O(1) / O(n) | O(n) |
| **Balanced BST** (TreeMap) | O(log n) | O(log n) | O(log n) | O(log n) | O(n) |
| **Binary heap** | O(1)‡ | O(n) | O(log n) | O(log n) | O(n) |
| **Trie** (m = key length) | O(m) | O(m) | O(m) | O(m) | O(alphabet·N) |

\* amortized (occasional resize is O(n)). † at a known node/head; finding the position is O(n).
‡ peek min/max only.

:::gotcha
Hash-map operations are **O(1) average but O(n) worst case** (all keys collide into one bucket).
In an interview, say *"O(1) average, O(n) worst"* — quoting only the average is a common tell
that someone memorized without understanding.
:::

## Sorting algorithms

| Algorithm | Best | Average | Worst | Space | Stable? |
|--|:--:|:--:|:--:|:--:|:--:|
| **Bubble sort** | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| **Insertion sort** | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| **Selection sort** | O(n²) | O(n²) | O(n²) | O(1) | ❌ |
| **Merge sort** | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ |
| **Quick sort** | O(n log n) | O(n log n) | **O(n²)** | O(log n) | ❌ |
| **Heap sort** | O(n log n) | O(n log n) | O(n log n) | O(1) | ❌ |
| **Counting sort** | O(n + k) | O(n + k) | O(n + k) | O(n + k) | ✅ |
| **Radix sort** | O(nk) | O(nk) | O(nk) | O(n + k) | ✅ |

:::senior
Two facts interviewers probe: **Quicksort's worst case is O(n²)** (already-sorted input with a
naive pivot) — mention randomized/median-of-three pivots. And **counting/radix beat the O(n log n)
comparison lower bound** only because they are *not* comparison sorts — they exploit a bounded key
range `k`.
:::

## Common pattern complexities

| Technique | Time | Space | Why |
|--|:--:|:--:|--|
| **Two pointers** | O(n) | O(1) | one linear pass, no extra structure |
| **Sliding window** | O(n) | O(1) / O(k) | each element enters/leaves the window once |
| **Binary search** | O(log n) | O(1) | halves the search space each step |
| **Hashing (one pass)** | O(n) | O(n) | store what you have seen |
| **BFS / DFS on graph** | O(V + E) | O(V) | visit every vertex and edge once |
| **Backtracking (subsets)** | O(2ⁿ · n) | O(n) | 2ⁿ subsets, O(n) to build each |
| **Backtracking (permutations)** | O(n! · n) | O(n) | n! orderings |
| **Heap of size k over n items** | O(n log k) | O(k) | n pushes/pops on a k-heap |
| **1-D DP** | O(n) | O(n) / O(1) | fill a table once; often only last rows needed |
| **2-D DP** | O(n·m) | O(n·m) / O(m) | fill an n×m grid |
| **Dijkstra (heap)** | O(E log V) | O(V) | shortest path, weighted |

## Watch it: why heap-of-k beats sorting for Top-K

Finding the K largest of n items: sorting is O(n log n). A **size-K min-heap** is O(n log k) —
much faster when k ≪ n, because each element only compares against a tiny heap.

```walkthrough
title: Top-2 largest via a size-2 min-heap
code: |
  // keep a min-heap of size k = 2
  for (int x : nums) {
    heap.offer(x);
    if (heap.size() > k) heap.poll(); // evict the smallest
  }
  // heap now holds the k largest; root is the Kth largest
steps:
  - text: 'k = 2. Offer 3. Heap = {3}. Size ok.'
    array: [3, 1, 5, 2]
    highlight: [0]
    pointers: { 0: 'x' }
    line: 3
  - text: 'Offer 1. Heap = {1, 3}. Size = 2, ok. Root (min) = 1.'
    array: [3, 1, 5, 2]
    highlight: [1]
    pointers: { 1: 'x' }
    line: 3
  - text: 'Offer 5. Heap = {1, 3, 5}, size 3 > 2 → evict min (1). Heap = {3, 5}.'
    array: [3, 1, 5, 2]
    highlight: [2]
    pointers: { 2: 'x' }
    line: 4
  - text: 'Offer 2. Heap = {2, 3, 5}, evict min (2). Heap = {3, 5}. Root 3 = 2nd largest.'
    array: [3, 1, 5, 2]
    highlight: [3]
    sorted: [0, 2]
    pointers: { 3: 'x' }
    line: 4
  - text: 'Done in O(n log k). The two largest {3, 5} remain; the root is the Kth largest.'
    array: [3, 1, 5, 2]
    sorted: [0, 2]
    line: 6
```

## Recall drills

```flashcards
title: Complexity recall
cards:
  - front: 'HashMap `get` — average and worst?'
    back: '**O(1) average**, **O(n) worst** (all keys collide).'
  - front: 'Merge sort — time and space?'
    back: '**O(n log n)** time in all cases, **O(n)** space, **stable**.'
  - front: 'Quicksort — worst case and why?'
    back: '**O(n²)** — bad pivot on sorted input. Randomize the pivot to avoid it.'
  - front: 'Binary search on a sorted array?'
    back: '**O(log n)** time, **O(1)** space.'
  - front: 'BFS / DFS on a graph with V vertices, E edges?'
    back: '**O(V + E)** time, **O(V)** space.'
  - front: 'Balanced BST (TreeMap) insert/search/delete?'
    back: '**O(log n)** each.'
  - front: 'Generating all subsets of n elements?'
    back: '**O(2ⁿ · n)** — 2ⁿ subsets, O(n) to copy each.'
  - front: 'Which comparison sort is O(n log n) worst case AND O(1) space?'
    back: '**Heap sort** (in-place, not stable).'
  - front: 'Access the i-th element of a singly linked list?'
    back: '**O(n)** — you must walk from the head.'
  - front: 'Kth largest of n via a size-k heap?'
    back: '**O(n log k)** time, **O(k)** space.'
```

## Check yourself

```quiz
title: Complexity cheat-sheet check
questions:
  - q: 'What is the worst-case time of Quicksort?'
    options:
      - 'O(n log n)'
      - text: 'O(n²)'
        correct: true
      - 'O(n)'
    explain: 'A poorly chosen pivot (e.g. always the smallest) on sorted input degrades Quicksort to O(n²). Its average is O(n log n).'
  - q: 'Which sort is guaranteed O(n log n) time but uses O(n) extra space?'
    options:
      - text: 'Merge sort'
        correct: true
      - 'Heap sort'
      - 'Insertion sort'
    explain: 'Merge sort is O(n log n) in all cases and stable, but needs O(n) auxiliary space to merge. Heap sort is O(n log n) with O(1) space but not stable.'
  - q: 'Accessing the i-th element of a singly linked list is:'
    options:
      - 'O(1)'
      - text: 'O(n)'
        correct: true
      - 'O(log n)'
    explain: 'Linked lists have no random access — you traverse from the head, so index access is O(n).'
  - q: 'BFS or DFS over a graph with V vertices and E edges runs in:'
    options:
      - 'O(V²)'
      - text: 'O(V + E)'
        correct: true
      - 'O(V log E)'
    explain: 'Each vertex is visited once and each edge examined once (or twice for undirected), giving O(V + E).'
  - q: 'Finding the K largest of n numbers with a size-K min-heap costs:'
    options:
      - 'O(n log n)'
      - text: 'O(n log k)'
        correct: true
      - 'O(n · k)'
    explain: 'Each of the n elements does an O(log k) heap operation on a heap capped at size k — cheaper than the O(n log n) of a full sort when k ≪ n.'
```

:::key
Memorize three blocks: **structure ops** (hash O(1) avg / O(n) worst, BST O(log n), array O(1)
access / O(n) search), **sorts** (merge O(n log n) stable O(n) space; quick O(n log n) avg but
O(n²) worst; heap O(n log n) in-place), and **patterns** (two-pointer/window O(n), binary search
O(log n), graph O(V+E), backtracking exponential). Always quote **time and space**.
:::
