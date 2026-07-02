import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'dsa-sort-stability',
    question: 'What does it mean for a sort to be **stable**, and when does it matter?',
    difficulty: 'Easy',
    category: 'Sorting & Searching',
    tags: ['stability', 'sorting', 'fundamentals'],
    answer: `A sort is **stable** if elements with **equal keys keep their original relative order**. It matters whenever you sort by one field after already having a meaningful order — e.g. sort rows by \`date\`, then stably by \`user\`, and within each user the rows stay in date order.

- **Stable:** merge sort, insertion sort, bubble sort.
- **Not stable:** quick sort, selection sort, heap sort.

\`\`\`
Sort [ (3,"a"), (1,"b"), (3,"c") ] by the number:
stable   -> (1,"b"), (3,"a"), (3,"c")   // a still before c
unstable -> (1,"b"), (3,"c"), (3,"a")   // order of equals may flip
\`\`\`

:::key
When keys are unique, stability is irrelevant. It only ever affects the ordering of **equal** keys — which is exactly what multi-key ("sort by X then Y") sorting depends on.
:::`,
  },
  {
    id: 'dsa-sort-when-insertion-wins',
    question: 'Insertion sort is O(n²). Why do real sorting libraries still use it?',
    difficulty: 'Medium',
    category: 'Sorting & Searching',
    tags: ['insertion sort', 'adaptive', 'hybrid'],
    answer: `Because it is the **fastest sort on small or nearly-sorted arrays**, and libraries exploit that:

1. **Adaptive** — on nearly-sorted input the inner loop barely shifts, approaching **O(n)**.
2. **Tiny constant factors** — no recursion, no extra array, sequential (cache-friendly) memory access.
3. **In-place and stable.**

That is why production sorts are **hybrids**: Java's dual-pivot quicksort and Python/Java's Timsort recurse with quick/merge sort but **switch to insertion sort** once a sub-array drops below a small threshold (~16–47 elements).

:::senior
The lesson: asymptotic complexity ignores constants, but for small \`n\` the constants dominate. "O(n²) but with tiny constants" beats "O(n log n) with recursion overhead" below the crossover point.
:::`,
  },
  {
    id: 'dsa-sort-merge-vs-quick',
    question: 'Compare merge sort and quick sort. When would you choose each?',
    difficulty: 'Medium',
    category: 'Sorting & Searching',
    tags: ['merge sort', 'quick sort', 'tradeoffs'],
    answer: `| | Merge sort | Quick sort |
|--|--|--|
| Worst case | **O(n log n)** guaranteed | O(n²) (bad pivots) |
| Average | O(n log n) | O(n log n) |
| Space | **O(n)** buffer | O(log n) stack, **in-place** |
| Stable? | **Yes** | No |

**Choose quick sort** as the default in-memory sort: in-place, cache-friendly, smallest constants, so usually fastest in practice (with a randomized/median-of-three pivot).

**Choose merge sort** when you need a **guaranteed** O(n log n), **stability**, are sorting a **linked list** (no random access, no extra array needed), or doing **external sort** of data too big for RAM.

:::note
Java uses both: **quicksort (dual-pivot)** for primitive arrays where stability is irrelevant, and **Timsort (a merge sort)** for object arrays where stability is required.
:::`,
  },
  {
    id: 'dsa-sort-quick-worst-case',
    question: 'What causes quick sort\'s O(n²) worst case, and how do you avoid it?',
    difficulty: 'Medium',
    category: 'Sorting & Searching',
    tags: ['quick sort', 'pivot', 'worst case'],
    answer: `The worst case happens when the pivot is repeatedly the **minimum or maximum**, so each partition peels off just one element → **n** levels of **O(n)** work = **O(n²)**. With a naive first/last-element pivot, this is triggered by **already-sorted or reverse-sorted input** — a very common real-world case.

**Avoidance:**
- **Randomized pivot** — pick a random index; adversarial inputs no longer exist.
- **Median-of-three** — pivot = median of first, middle, last; handles sorted data well.
- **Introsort** — start with quicksort, but if recursion depth exceeds ~\`2·log n\`, **switch to heap sort** to enforce a hard O(n log n) ceiling. (This is what C++ \`std::sort\` does.)

:::gotcha
An array of **all-equal elements** can also degrade a naive Lomuto partition to O(n²). Three-way partitioning ("Dutch national flag") fixes that by grouping \`<\`, \`=\`, \`>\` the pivot.
:::`,
  },
  {
    id: 'dsa-sort-partition-invariant',
    question: 'Explain the Lomuto partition scheme and its loop invariant.',
    difficulty: 'Hard',
    category: 'Sorting & Searching',
    tags: ['quick sort', 'partition', 'invariant'],
    answer: `Lomuto picks the **last element as pivot** and maintains a boundary index \`i\` such that everything in \`(lo..i]\` is **≤ pivot**. A scanner \`j\` walks the rest; each time \`a[j] ≤ pivot\`, we grow the zone (\`i++\`) and swap \`a[i]\` with \`a[j]\`.

\`\`\`java
int partition(int[] a, int lo, int hi) {
  int pivot = a[hi];
  int i = lo - 1;
  for (int j = lo; j < hi; j++) {
    if (a[j] <= pivot) { i++; swap(a, i, j); }
  }
  swap(a, i + 1, hi);   // pivot into its final slot
  return i + 1;
}
\`\`\`

**Invariant (during the loop):** \`a[lo..i] ≤ pivot\` and \`a[i+1..j-1] > pivot\`. When \`j\` reaches \`hi\`, the two zones are complete, and the final swap drops the pivot at index \`i+1\` — its **permanent** sorted position.

:::key
The takeaway that survives interviews: after partition, **the pivot is in its final place**, smaller left, larger right. Recursion sorts the two sides.
:::`,
  },
  {
    id: 'dsa-sort-quickselect',
    question: 'How do you find the k-th smallest element faster than sorting?',
    difficulty: 'Hard',
    category: 'Sorting & Searching',
    tags: ['quickselect', 'partition', 'selection'],
    answer: `Use **quickselect** — quick sort's partition, but recurse into only **one** side. After partitioning, the pivot sits at some index \`p\`:
- \`p == k\` → the pivot **is** the answer.
- \`p < k\` → recurse into the **right** side.
- \`p > k\` → recurse into the **left** side.

\`\`\`java
int select(int[] a, int lo, int hi, int k) {   // k is a 0-based index
  int p = partition(a, lo, hi);
  if (p == k) return a[p];
  return p < k ? select(a, p + 1, hi, k)
               : select(a, lo, p - 1, k);
}
\`\`\`

Because you discard half the range on average, it runs in **average O(n)** — beating the O(n log n) of a full sort. Worst case is O(n²) (same pivot risk); **median-of-medians** pivot selection guarantees worst-case O(n) but with larger constants.

:::note
A simpler alternative for "k largest/smallest": a **size-k heap** in O(n log k). Quickselect wins when k is arbitrary and you want expected linear time; the heap wins for a streaming/online input.
:::`,
  },
  {
    id: 'dsa-sort-binary-search-basics',
    question: 'What are the preconditions and complexity of binary search?',
    difficulty: 'Easy',
    category: 'Sorting & Searching',
    tags: ['binary search', 'sorted', 'complexity'],
    answer: `**Precondition:** the array must be **sorted** (or the search space otherwise **monotonic**). **Complexity:** **O(log n)** time, **O(1)** space iteratively.

Each step compares the target to the middle element and discards the half that cannot contain it, so the range shrinks by half every iteration — about \`log₂n\` steps (20 for a million elements).

\`\`\`java
int lo = 0, hi = n - 1;
while (lo <= hi) {
  int mid = lo + (hi - lo) / 2;
  if (a[mid] == target) return mid;
  if (a[mid] < target) lo = mid + 1;
  else                 hi = mid - 1;
}
return -1;
\`\`\`

:::gotcha
If you only search **once** on unsorted data, a linear O(n) scan is cheaper than sorting (O(n log n)) just to binary-search. Binary search pays off when data is **already sorted** or you run **many** queries.
:::`,
  },
  {
    id: 'dsa-sort-binary-search-bugs',
    question: 'What are the two most common binary-search bugs?',
    difficulty: 'Medium',
    category: 'Sorting & Searching',
    tags: ['binary search', 'overflow', 'off-by-one'],
    answer: `**1. Midpoint overflow.** \`(lo + hi) / 2\` can overflow \`int\` when \`lo + hi\` exceeds ~2.1 billion, producing a negative index. Always write:

\`\`\`java
int mid = lo + (hi - lo) / 2;   // same value, no overflow
\`\`\`

**2. The loop boundary / infinite loop.** The condition and the updates must agree:
- With **\`while (lo <= hi)\`** and \`hi = mid - 1\` / \`lo = mid + 1\`, the range strictly shrinks.
- If you use \`while (lo < hi)\` with \`hi = mid\` (common in lower/upper-bound style), you must **not** also do \`lo = mid\`, or when \`hi - lo == 1\` the range never shrinks and you spin forever. Advance with \`lo = mid + 1\`.

:::key
Pick one template and internalize it. Most binary-search bugs are boundary inconsistencies — mixing an inclusive \`hi\` with an exclusive update, or forgetting the \`+1\`/\`-1\`.
:::`,
  },
  {
    id: 'dsa-sort-lower-upper-bound',
    question: 'What are lower_bound and upper_bound, and how do you count occurrences with them?',
    difficulty: 'Medium',
    category: 'Sorting & Searching',
    tags: ['binary search', 'lower bound', 'upper bound'],
    answer: `On a sorted array:
- **lower_bound(x)** = index of the **first** element \`>= x\` (also the correct insertion point for \`x\`).
- **upper_bound(x)** = index of the **first** element \`> x\`.

The number of occurrences of \`x\` is simply their difference:

\`\`\`java
int count = upperBound(a, x) - lowerBound(a, x);

int lowerBound(int[] a, int x) {   // half-open [lo, hi)
  int lo = 0, hi = a.length;
  while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (a[mid] < x) lo = mid + 1;   // '<'  for lower bound
    else            hi = mid;
  }
  return lo;
}
// upperBound: change the test to  a[mid] <= x
\`\`\`

:::note
The only difference between the two is \`<\` vs \`<=\`. These bound-finding forms are more useful than exact-match search — they answer "insert position", "count in range", and "first/last occurrence" in O(log n).
:::`,
  },
  {
    id: 'dsa-sort-search-on-answer',
    question: 'What is "binary search on the answer" and when can you apply it?',
    difficulty: 'Hard',
    category: 'Sorting & Searching',
    tags: ['binary search', 'monotonic', 'search space'],
    answer: `Instead of searching an array, you binary-search over the **range of possible answers** when a feasibility predicate is **monotonic** — i.e. \`feasible(x)\` is false up to some threshold, then true forever after (false, false, …, true, true).

**Recipe:**
1. Define \`feasible(x)\`: "can we achieve the goal with value \`x\`?"
2. Confirm monotonicity (if \`x\` works, does \`x+1\` also work?).
3. Binary-search the smallest (or largest) \`x\` where \`feasible\` flips.

\`\`\`java
// smallest x with feasible(x) true
int lo = MIN, hi = MAX;
while (lo < hi) {
  int mid = lo + (hi - lo) / 2;
  if (feasible(mid)) hi = mid;
  else               lo = mid + 1;
}
return lo;
\`\`\`

Classic problems: **Koko eating bananas** (min speed), **capacity to ship packages in D days**, **split array largest sum**, **minimum time to complete tasks**. Cost is \`O(log(range) · cost_of_feasible)\`.

:::senior
This is the highest-leverage binary-search idea in interviews: recognizing that the *answer itself* forms a sorted/monotonic space. The array is a red herring — the real structure is the yes/no threshold.
:::`,
  },
  {
    id: 'dsa-sort-non-comparison',
    question: 'Can any comparison sort beat O(n log n)? What about counting/radix sort?',
    difficulty: 'Hard',
    category: 'Sorting & Searching',
    tags: ['lower bound', 'counting sort', 'radix sort'],
    answer: `No comparison sort can beat **O(n log n)** in the worst case. Sorting by comparisons is a decision tree with \`n!\` leaves (one per permutation); its height is at least \`log₂(n!) = Θ(n log n)\`, so that many comparisons are unavoidable.

You beat it only by **not comparing** — exploiting structure in the keys:
- **Counting sort** — O(n + k) for integer keys in a small range \`[0, k)\`; count occurrences, then place. Stable.
- **Radix sort** — O(d·(n + b)) for d-digit keys in base b; stably counting-sort digit by digit (least-significant first).
- **Bucket sort** — O(n) expected for uniformly distributed reals.

\`\`\`
Counting sort of [2,5,2,1] with k=6:
counts -> [0,1,2,0,0,1]  ->  output [1,2,2,5]
\`\`\`

:::gotcha
These aren't magic — they trade time for **assumptions and space**. Counting sort needs \`O(k)\` memory and small integer keys; a huge key range (\`k ≫ n\`) makes it worse than a comparison sort. They shine on bounded-integer data, not arbitrary comparables.
:::`,
  },
];

export default questions;
