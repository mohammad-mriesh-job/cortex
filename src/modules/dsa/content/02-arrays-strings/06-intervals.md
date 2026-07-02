---
title: Intervals
category: Arrays & Strings
categoryOrder: 2
order: 6
level: Intermediate
summary: The interval playbook interviewers reuse constantly — sort by start, then merge, insert, or sweep for max overlap. Covers merge intervals, insert interval, meeting rooms, and interval intersection.
tags: intervals, merge, sweep line, meeting rooms, overlap, sorting, pattern
---

An **interval** is a `[start, end]` pair, and a whole family of interview questions — calendars, meeting rooms, ranges, booking systems — reduces to the same move: **sort by start, then walk left to right.** Learn the four variations and you've covered the pattern.

## The golden rule: sort by start

Almost every interval problem begins by sorting on the start coordinate. Once sorted, two intervals `a` and `b` (with `a` first) **overlap iff `b.start <= a.end`**. That single comparison drives everything.

```java
Arrays.sort(intervals, (x, y) -> Integer.compare(x[0], y[0]));
```

## Merge overlapping intervals

Sweep left to right; extend the current interval while the next one overlaps, otherwise close it and start fresh.

```walkthrough
title: Merge [[1,3],[2,6],[8,10],[15,18]]
code: |
  sort by start;
  result = [ intervals[0] ];
  for (int[] cur : intervals) {
    int[] last = result.peekLast();
    if (cur[0] <= last[1])                 // overlap
      last[1] = Math.max(last[1], cur[1]); // extend
    else
      result.add(cur);                     // disjoint → new interval
  }
steps:
  - text: 'Sorted by start. Seed the result with [1,3].'
    array: [1, 3, 2, 6, 8, 10]
    highlight: [0, 1]
    line: 2
  - text: '[2,6]: 2 ≤ 3 → overlaps [1,3]. Extend end to max(3,6)=6 → [1,6].'
    array: [1, 6, 2, 6, 8, 10]
    highlight: [0, 1]
    line: 6
  - text: '[8,10]: 8 > 6 → no overlap. Push [8,10] as a new interval.'
    array: [1, 6, 8, 10]
    highlight: [2, 3]
    sorted: [0, 1]
    line: 8
  - text: 'Result: [[1,6],[8,10],[15,18]]. One O(n log n) sort + one O(n) pass.'
    array: [1, 6, 8, 10]
    sorted: [0, 1, 2, 3]
    line: 8
```

## Insert into a sorted list

When the intervals are **already** sorted and non-overlapping, inserting a new one is O(n): copy everything ending before it, merge everything that overlaps, copy the rest.

```java
for (int[] iv : intervals) {
    if (iv[1] < newIv[0]) res.add(iv);           // ends before new → keep
    else if (iv[0] > newIv[1]) { res.add(newIv); newIv = iv; } // after → flush
    else { newIv[0] = min(newIv[0], iv[0]);      // overlap → absorb
           newIv[1] = max(newIv[1], iv[1]); }
}
res.add(newIv);
```

## Meeting Rooms II — the sweep line

*"Minimum rooms to hold all meetings"* = the **maximum number of intervals overlapping at any instant**. Two equivalent O(n log n) techniques:

````tabs
tabs:
  - label: Min-heap of end times
    body: |
      Sort by start; keep a heap of end times of "live" meetings. Pop every meeting that has ended before the current start; the heap's peak size is the answer.
      ```java
      Arrays.sort(mtg, (a,b) -> a[0]-b[0]);
      PriorityQueue<Integer> ends = new PriorityQueue<>();
      int rooms = 0;
      for (int[] m : mtg) {
        while (!ends.isEmpty() && ends.peek() <= m[0]) ends.poll();
        ends.add(m[1]);
        rooms = Math.max(rooms, ends.size());
      }
      ```
  - label: Sort starts & ends
    body: |
      Split into two sorted arrays and two-pointer merge: a start bumps the counter, an end drops it. Track the peak.
      ```java
      int[] s = starts(); int[] e = ends();
      Arrays.sort(s); Arrays.sort(e);
      int rooms = 0, peak = 0, j = 0;
      for (int i = 0; i < n; i++) {
        while (e[j] <= s[i]) { rooms--; j++; }
        rooms++; peak = Math.max(peak, rooms);
      }
      ```
````

## Interval intersection of two sorted lists

Two pointers. The overlap of `A[i]` and `B[j]` is `[max(starts), min(ends)]` — valid only if that low ≤ high. Then advance whichever interval ends first.

```java
int lo = Math.max(A[i][0], B[j][0]);
int hi = Math.min(A[i][1], B[j][1]);
if (lo <= hi) res.add(new int[]{lo, hi});
if (A[i][1] < B[j][1]) i++; else j++;   // drop the one that ends first
```

:::senior
The universal tells: **"sort by start"** for merge/insert problems, **"count concurrent" / sweep line** for max-overlap (rooms, CPU load, popular time), and **"two pointers on two sorted lists"** for intersections. If the question streams intervals or asks for *k* overlaps, reach for the **min-heap of end times**.
:::

## Complexity

| Problem | Approach | Time | Space |
|--|--|:--:|:--:|
| Merge intervals | sort + sweep | O(n log n) | O(n) |
| Insert interval | linear merge (pre-sorted) | O(n) | O(n) |
| Meeting Rooms II | heap / sorted endpoints | O(n log n) | O(n) |
| Interval intersection | two pointers | O(n + m) | O(1) |

## Check yourself

```quiz
title: Intervals check
questions:
  - q: 'After sorting intervals by start, how do you know interval `b` overlaps the current `a`?'
    options:
      - text: '`b.start <= a.end`'
        correct: true
      - '`b.start < a.start`'
      - '`b.end < a.end`'
    explain: 'Once sorted by start, b begins at or after a, so they overlap exactly when b starts on or before a ends.'
  - q: 'The minimum number of meeting rooms equals:'
    options:
      - 'The number of meetings'
      - text: 'The maximum number of meetings overlapping at any single moment'
        correct: true
      - 'The longest meeting duration'
    explain: 'You need one room per concurrent meeting; the peak concurrency is the answer. A min-heap of end times or a sorted-endpoints sweep both find it in O(n log n).'
  - q: 'For the intersection of two sorted interval lists, after recording the overlap you advance:'
    options:
      - 'Both pointers always'
      - text: 'The pointer of whichever interval ends first'
        correct: true
      - 'The pointer of whichever interval starts first'
    explain: 'The interval that ends first cannot overlap anything further right, so it is safe to discard; the other may still intersect the next one.'
```

:::key
**Sort by start**, then sweep. Overlap ⟺ `next.start ≤ cur.end`. **Merge** extends the end; **insert** absorbs overlappers in one linear pass; **Meeting Rooms II** = peak concurrency via a min-heap of end times or a sorted-endpoints sweep; **intersection** is two pointers advancing whichever interval ends first.
:::
