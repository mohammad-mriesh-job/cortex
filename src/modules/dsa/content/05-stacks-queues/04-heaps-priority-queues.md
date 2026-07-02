---
title: Heaps & Priority Queues
category: 'Stacks, Queues & Heaps'
categoryOrder: 5
order: 4
level: Intermediate
summary: A binary heap is a complete tree packed into an array — the min (or max) is always at index 0. Insert and remove in O(log n); it powers priority queues, top-k, and heap sort.
tags: heap, binary heap, priority queue, sift-up, sift-down, heapify, top-k, heap sort
---

A **binary heap** is a *complete* binary tree with the **heap property**: in a **min-heap**, every
parent is ≤ its children (the minimum sits at the root); a **max-heap** flips that. It is the
natural structure whenever you repeatedly need the smallest or largest item — a
**priority queue**.

## Packed into an array — no pointers needed

A heap is *complete* (every level full except the last, filled left to right), so it maps cleanly
onto an array with pure index arithmetic — no node objects, no child pointers:

| From index `i` | Formula |
|--|--|
| parent | `(i - 1) / 2` |
| left child | `2 * i + 1` |
| right child | `2 * i + 2` |
| the min (min-heap) | always `a[0]` |

## Watch it: insert with sift-up

To insert, drop the new value at the **end** of the array (keeping the tree complete), then let
it **bubble up** — swap with its parent while it violates the heap property. It rises at most the
height of the tree, so insert is **O(log n)**.

```walkthrough
title: Insert 0 into the min-heap [1, 5, 8, 10, 12, 9]
code: |
  void insert(int x) {
    a[size] = x;                 // 1. place at the end
    int i = size++;
    while (i > 0 && a[i] < a[(i-1)/2]) {   // 2. smaller than parent?
      swap(i, (i-1)/2);          //    bubble up
      i = (i - 1) / 2;
    }
  }
steps:
  - text: 'Start: a valid min-heap. Root (index 0) holds the minimum, 1. Parents ≤ children everywhere.'
    array: [1, 5, 8, 10, 12, 9]
    sorted: [0]
    line: 1
  - text: 'Place the new value **0** at the end (index 6). Its parent is index `(6-1)/2 = 2`, value 8.'
    array: [1, 5, 8, 10, 12, 9, 0]
    highlight: [6]
    pointers: { 6: 'i=0', 2: 'parent=8' }
    line: 2
  - text: '`0 < 8` → heap property broken. **Swap** 0 up with its parent. 0 moves to index 2.'
    array: [1, 5, 0, 10, 12, 9, 8]
    highlight: [2, 6]
    pointers: { 2: 'i=0', 6: '8' }
    line: 5
  - text: 'Now `i = 2`. Parent is index `(2-1)/2 = 0`, value 1. Is `0 < 1`? Yes → swap up again.'
    array: [1, 5, 0, 10, 12, 9, 8]
    highlight: [2]
    pointers: { 2: 'i=0', 0: 'parent=1' }
    line: 5
  - text: '**Swap** 0 with the root. 0 reaches index 0. It bubbled up two levels — O(log n) work.'
    array: [0, 5, 1, 10, 12, 9, 8]
    highlight: [0, 2]
    pointers: { 0: 'i=0' }
    line: 6
  - text: '`i = 0` → at the root, loop stops. Heap restored; the new minimum 0 sits at index 0.'
    array: [0, 5, 1, 10, 12, 9, 8]
    sorted: [0]
    line: 8
```

## Remove-min with sift-down

Removing the min is the mirror image: take `a[0]` (the answer), move the **last** element into the
root to keep the tree complete, then **sift it down** — repeatedly swap it with its *smaller*
child until the heap property holds. Also O(log n).

```java
int removeMin() {
  int min = a[0];
  a[0] = a[--size];              // last element to the root
  int i = 0;
  while (true) {
    int l = 2*i + 1, r = 2*i + 2, smallest = i;
    if (l < size && a[l] < a[smallest]) smallest = l;
    if (r < size && a[r] < a[smallest]) smallest = r;
    if (smallest == i) break;    // heap property restored
    swap(i, smallest);
    i = smallest;
  }
  return min;
}
```

:::gotcha
Sift-**down** must compare against the **smaller** of the two children and swap with *that* one.
Swapping with the larger child (or with either without checking) re-breaks the heap: the parent
would still exceed the other child. Pick the smallest of `{parent, left, right}` each step.
:::

## Heapify: build a heap in O(n), not O(n log n)

To turn an arbitrary array into a heap, don't insert `n` times (that's O(n log n)). Instead
**sift-down every non-leaf node**, starting from the last parent and working backwards to the
root. The math works out to **O(n)** because most nodes are near the bottom and sift down only a
little.

```java
void heapify(int[] a) {
  for (int i = a.length / 2 - 1; i >= 0; i--)
    siftDown(a, i, a.length);   // last parent -> root
}
```

## Priority queue in Java

`java.util.PriorityQueue` is a binary heap. It is a **min-heap by default**; pass a comparator (or
`Collections.reverseOrder()`) for a max-heap.

````tabs
tabs:
  - label: Min-heap (default)
    body: |
      Smallest comes out first.
      ```java
      PriorityQueue<Integer> pq = new PriorityQueue<>();
      pq.offer(5); pq.offer(1); pq.offer(8);
      pq.peek();   // 1  (min, not removed)
      pq.poll();   // 1  (removed)  -> O(log n)
      ```
  - label: Max-heap
    body: |
      Flip the ordering with a comparator.
      ```java
      PriorityQueue<Integer> max =
          new PriorityQueue<>(Collections.reverseOrder());
      max.offer(5); max.offer(1); max.offer(8);
      max.poll();  // 8
      ```
  - label: Custom priority
    body: |
      Order by any key — here, by task priority ascending.
      ```java
      PriorityQueue<Task> pq =
          new PriorityQueue<>(Comparator.comparingInt(t -> t.priority));
      ```
````

## The killer app: top-k

To find the **k largest** elements, keep a **min-heap of size k**. Each new value: if the heap has
fewer than `k`, add it; otherwise if it beats the heap's minimum, evict the min and add it. The
heap holds the best `k` seen so far — **O(n log k)** time, O(k) space, far better than sorting
everything when `k ≪ n`.

```java
PriorityQueue<Integer> heap = new PriorityQueue<>();   // min-heap, size k
for (int x : nums) {
  heap.offer(x);
  if (heap.size() > k) heap.poll();   // drop the smallest -> keep top k
}
// heap now holds the k largest; heap.peek() is the k-th largest
```

:::senior
Counter-intuitive but core: for the **k largest** you use a **min**-heap (so the weakest survivor
is cheap to evict), and for the **k smallest** you use a **max**-heap. Heaps also give you a
**streaming median** (two heaps), **merge k sorted lists**, **Dijkstra**, and **heap sort**
(heapify, then repeatedly remove-max into the back — O(n log n), in place).
:::

## Complexity

| Operation | Time | Note |
|--|:--:|--|
| peek min/max | **O(1)** | it is always `a[0]` |
| insert (sift-up) | **O(log n)** | bubbles up ≤ tree height |
| remove-min (sift-down) | **O(log n)** | sinks down ≤ tree height |
| build heap (heapify) | **O(n)** | not O(n log n) |
| top-k (size-k heap) | **O(n log k)** | vs O(n log n) to sort all |
| heap sort | **O(n log n)** | in place, not stable |

## Check yourself

```quiz
title: Heap & priority-queue check
questions:
  - q: 'In an array-backed heap, the children of index `i` live at:'
    options:
      - text: '`2*i + 1` and `2*i + 2`'
        correct: true
      - '`i - 1` and `i + 1`'
      - '`i / 2` and `i / 2 + 1`'
    explain: 'Complete-tree index math: children at 2i+1 / 2i+2, parent at (i-1)/2. No pointers needed.'
  - q: 'Inserting a new element into a heap works by:'
    options:
      - 'Placing it at the root and sifting down'
      - text: 'Placing it at the end, then sifting UP while it violates the heap property'
        correct: true
      - 'Re-sorting the whole array'
    explain: 'Append (to keep the tree complete), then bubble up by swapping with the parent — O(log n).'
  - q: 'To find the K LARGEST elements efficiently, which heap do you keep?'
    options:
      - text: 'A MIN-heap of size k — so the weakest of the current top-k is cheap to evict'
        correct: true
      - 'A max-heap of size k'
      - 'A min-heap holding all n elements'
    explain: 'A size-k min-heap keeps the k best; its root is the weakest survivor, evicted in O(log k) when beaten. O(n log k) overall.'
  - q: 'Why is heapify O(n) rather than O(n log n)?'
    options:
      - 'It skips half the array at random'
      - text: 'Most nodes are near the bottom and sift down only a little; summing the work over all levels is O(n)'
        correct: true
      - 'Because the array is already sorted'
    explain: 'Sift-down cost is proportional to node height; the many low nodes are cheap, and the sum telescopes to O(n).'
  - q: 'The default `PriorityQueue` in Java, with no comparator, behaves as a:'
    options:
      - text: 'Min-heap — `poll()` returns the smallest element'
        correct: true
      - 'Max-heap'
      - 'FIFO queue'
    explain: 'By default it uses natural ordering as a min-heap; pass `Collections.reverseOrder()` for a max-heap.'
```

:::key
A binary heap packs a complete tree into an array: min/max at index 0 (**O(1)** peek), insert and
remove in **O(log n)** via sift-up / sift-down, and **O(n)** heapify. It is the priority queue —
the go-to for top-k (size-k heap, opposite polarity), streaming medians, and heap sort.
:::
