import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'dsa-iq-recognize-sliding-window',
    question: 'You see "longest contiguous subarray/substring satisfying a condition." Which pattern, and why?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['patterns', 'sliding-window', 'cues'],
    answer: `**Sliding Window.** The cue is **"contiguous"** + **"longest/shortest with a condition."**

Expand the window by moving \`right\`; when the window violates the condition, shrink it by moving \`left\`. Each element enters and leaves the window at most once → **O(n)**.

\`\`\`java
int left = 0, best = 0, sum = 0;
for (int right = 0; right < n; right++) {
  sum += a[right];
  while (sum > K) sum -= a[left++]; // shrink
  best = Math.max(best, right - left + 1);
}
\`\`\`

:::tip
Contrast with **subsequence** problems (non-contiguous) — those usually mean DP, not a window.
:::`,
  },
  {
    id: 'dsa-iq-constraints-reveal-complexity',
    question: 'How do the input constraints (the value of n) tell you the expected time complexity?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['complexity', 'constraints', 'strategy'],
    answer: `Work backwards from the limit (~10⁸ ops/second):

| Constraint | Target complexity |
|--|--|
| n ≤ 12 | O(n!) / O(2ⁿ) — backtracking |
| n ≤ 25 | O(2ⁿ) subsets, meet-in-the-middle |
| n ≤ 5,000 | O(n²) DP / nested loops |
| n ≤ 10⁵ | O(n log n) or O(n) |
| n ≤ 10⁶ | O(n) or O(log n) |

:::senior
A small \`n ≤ 20\` is practically shouting "exponential is fine — think backtracking or bitmask DP." A large \`n ≤ 10⁶\` rules out anything worse than linear. Read the constraints **first**.
:::`,
  },
  {
    id: 'dsa-iq-umpire-framework',
    question: 'Walk me through your process for solving a coding problem you have never seen.',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['framework', 'umpire', 'process'],
    answer: `I use **UMPIRE**:

1. **U**nderstand — restate the problem, clarify input range/types/duplicates/empties.
2. **M**atch — spot the cue and map it to a known pattern.
3. **P**lan — outline the algorithm in plain English before coding.
4. **I**mplement — write clean code, narrating as I go.
5. **R**eview — re-read and dry-run a tiny example to catch off-by-one bugs.
6. **E**valuate — state time and space complexity and confirm edge cases.

:::tip
The first 3–5 minutes (U + M) matter most. Interviewers grade communication and approach as heavily as the final code.
:::`,
  },
  {
    id: 'dsa-iq-brute-force-first',
    question: 'Should you state the brute-force solution even if you can see the optimal one immediately?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['strategy', 'brute-force', 'process'],
    answer: `**Yes.** State it briefly first — it:

- Proves you understand the problem.
- Gives a **correctness baseline** to optimize against.
- Frames the optimization ("the inner loop re-searches — can a hash map remove it?").
- Earns partial credit if you run out of time.

Then optimize by naming the bottleneck and the pattern that removes it (e.g. O(n²) pair search → hash map → O(n)).`,
  },
  {
    id: 'dsa-iq-hashmap-complexity',
    question: 'What is the time complexity of HashMap operations, and what nuance must you mention?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['complexity', 'hashing', 'gotcha'],
    answer: `**O(1) average**, but **O(n) worst case.**

The worst case happens when all keys hash to the same bucket (collisions), degrading to a linear scan of that bucket. Modern Java mitigates this by converting a bucket to a balanced tree once it grows past a threshold, giving **O(log n)** in that degenerate case.

:::gotcha
Quoting only "O(1)" is a common tell. Say **"O(1) average, O(n) worst"** to show you understand *why*, not just the memorized number.
:::`,
  },
  {
    id: 'dsa-iq-sorting-tradeoffs',
    question: 'Compare merge sort, quicksort, and heap sort. When would you pick each?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['sorting', 'complexity', 'tradeoffs'],
    answer: `| Sort | Time (avg / worst) | Space | Stable? | Pick when |
|--|--|--|--|--|
| **Merge** | O(n log n) / O(n log n) | O(n) | ✅ | need stability or guaranteed O(n log n); linked lists; external sort |
| **Quick** | O(n log n) / **O(n²)** | O(log n) | ❌ | in-memory arrays, cache-friendly, average speed matters |
| **Heap** | O(n log n) / O(n log n) | O(1) | ❌ | need O(n log n) worst case with O(1) space |

:::senior
Quicksort's O(n²) worst case comes from bad pivots on sorted input — randomized or median-of-three pivots make it rare. Java uses **dual-pivot quicksort** for primitives and **Timsort** (merge variant, stable) for objects.
:::`,
  },
  {
    id: 'dsa-iq-binary-search-overflow',
    question: 'What is wrong with `int mid = (lo + hi) / 2;` in binary search?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['gotcha', 'overflow', 'binary-search'],
    answer: `**Integer overflow.** If \`lo + hi\` exceeds \`Integer.MAX_VALUE\` (~2.1×10⁹), it wraps to a negative number and \`mid\` becomes invalid.

\`\`\`java
int mid = lo + (hi - lo) / 2; // safe — never overflows
\`\`\`

:::gotcha
This exact bug lived in Java's own \`Arrays.binarySearch\` for about nine years. Always use the \`lo + (hi - lo) / 2\` form.
:::`,
  },
  {
    id: 'dsa-iq-next-greater-monotonic',
    question: 'For each element, you must find the next greater element to its right. What pattern and complexity?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['patterns', 'monotonic-stack', 'cues'],
    answer: `**Monotonic Stack** — the "next greater / next warmer / span" signature. **O(n)** time, **O(n)** space.

Keep a stack of indices whose answers are still unknown, in **decreasing** value order. When a new element is larger, it is the "next greater" for everything smaller on top of the stack — pop and resolve them.

\`\`\`java
int[] res = new int[n]; // 0 = none
Deque<Integer> stack = new ArrayDeque<>();
for (int i = 0; i < n; i++) {
  while (!stack.isEmpty() && a[i] > a[stack.peek()])
    res[stack.pop()] = a[i];
  stack.push(i);
}
\`\`\`

Each index is pushed and popped once → linear.`,
  },
  {
    id: 'dsa-iq-top-k-heap',
    question: 'How do you find the K largest elements in an array of n items efficiently?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['heap', 'top-k', 'complexity'],
    answer: `Use a **size-K min-heap**: push each element; if the heap exceeds K, evict the smallest (the root). What remains are the K largest, and the root is the **Kth largest**.

\`\`\`java
PriorityQueue<Integer> heap = new PriorityQueue<>(); // min-heap
for (int x : nums) {
  heap.offer(x);
  if (heap.size() > k) heap.poll();
}
\`\`\`

**O(n log k)** time, **O(k)** space — better than sorting's O(n log n) when k ≪ n.

:::tip
For guaranteed O(n) average with no ordering needed, **Quickselect** finds the Kth element in O(n) average, O(n²) worst.
:::`,
  },
  {
    id: 'dsa-iq-dp-recognition',
    question: 'What cues tell you a problem is dynamic programming, and how do you approach it?',
    difficulty: 'Hard',
    category: 'Interview Prep',
    tags: ['dynamic-programming', 'patterns', 'cues'],
    answer: `**Cues:** "count the number of ways," "minimum/maximum cost," "can you reach/partition," and **overlapping subproblems** with **optimal substructure**.

Approach:
1. Define the **state** — what does \`dp[i]\` (or \`dp[i][j]\`) represent?
2. Write the **recurrence** — how does a state build from smaller ones?
3. Set **base cases**.
4. Choose **top-down** (memoized recursion) or **bottom-up** (fill a table).
5. Optimize space if only the last row(s) are needed.

\`\`\`java
// Coin Change — fewest coins to make amount
int[] dp = new int[amount + 1];
Arrays.fill(dp, amount + 1);
dp[0] = 0;
for (int a = 1; a <= amount; a++)
  for (int c : coins)
    if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
\`\`\`

:::senior
If a greedy choice can be proven optimal, prefer greedy (faster). Reach for DP when local greedy choices can be wrong and you must explore combinations with reuse.
:::`,
  },
  {
    id: 'dsa-iq-bfs-vs-dfs',
    question: 'When do you use BFS versus DFS on a graph or tree?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['graphs', 'bfs', 'dfs', 'patterns'],
    answer: `Both are **O(V + E)**; the choice is about *what* you need:

| Use **BFS** when | Use **DFS** when |
|--|--|
| shortest path in an **unweighted** graph | exploring **all paths** / full traversal |
| level-by-level processing | detecting cycles, topological sort |
| target is likely near the source | checking connectivity / components |
| minimum number of steps | problem is naturally recursive (trees) |

BFS uses a **queue** (O(width) memory); DFS uses a **stack / recursion** (O(depth) memory).

:::gotcha
For **weighted** shortest paths, plain BFS is wrong — use **Dijkstra** (non-negative weights) or **Bellman-Ford** (negative weights).
:::`,
  },
  {
    id: 'dsa-iq-backtracking-shape',
    question: 'What does a backtracking solution look like, and what is its complexity?',
    difficulty: 'Hard',
    category: 'Interview Prep',
    tags: ['backtracking', 'patterns', 'complexity'],
    answer: `Cue: "generate **all** subsets / permutations / combinations." Template: **choose → explore → un-choose.**

\`\`\`java
void backtrack(List<Integer> path, int start) {
  result.add(new ArrayList<>(path)); // record
  for (int i = start; i < nums.length; i++) {
    path.add(nums[i]);          // choose
    backtrack(path, i + 1);     // explore
    path.remove(path.size()-1); // un-choose
  }
}
\`\`\`

Complexity: subsets **O(2ⁿ · n)**, permutations **O(n! · n)**. Prune early (invalid branches) to cut the constant factor.

:::gotcha
Forgetting to **un-choose** (undo the last change) is the #1 backtracking bug — state leaks into sibling branches.
:::`,
  },
  {
    id: 'dsa-iq-edge-cases',
    question: 'What edge cases should you proactively test on almost every problem?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['edge-cases', 'testing', 'gotcha'],
    answer: `Raise these during *Understand* and verify during *Review*:

- **Empty / null** input (empty array, empty string, null).
- **Single element** (n = 1).
- **Duplicates** — do they matter? double counting?
- **Extremes** — all negative, all equal, already sorted, maximum size.
- **Boundaries** — first/last index, target absent, integer overflow on large sums.

:::tip
Naming edge cases before coding is free credibility, and dry-running n = 0, 1, 2 catches most off-by-one bugs.
:::`,
  },
  {
    id: 'dsa-iq-space-time-tradeoff',
    question: 'Explain the space-time tradeoff with a concrete example.',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['complexity', 'tradeoffs', 'hashing'],
    answer: `Most interview optimization is **spending memory to save time.** Example — "does this array contain a duplicate?":

| Approach | Time | Space |
|--|--|--|
| Re-scan for each element | O(n²) | O(1) |
| Sort then scan neighbors | O(n log n) | O(1)–O(n) |
| **HashSet of seen values** | **O(n)** | **O(n)** |

The hash set trades O(n) extra memory to collapse the nested scan into one linear pass.

:::senior
Always state **both** dimensions: "O(n) time, O(n) space." Offering to trade the other way (less memory, more time) when constraints demand it signals maturity.
:::`,
  },
  {
    id: 'dsa-iq-fast-slow-pointers',
    question: 'How do fast and slow pointers detect a cycle in a linked list, and why does it work?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['linked-lists', 'two-pointers', 'patterns'],
    answer: `**Floyd's tortoise and hare:** advance \`slow\` by 1 and \`fast\` by 2. If there is a cycle, \`fast\` laps \`slow\` and they meet; if \`fast\` hits null, there is no cycle.

\`\`\`java
ListNode slow = head, fast = head;
while (fast != null && fast.next != null) {
  slow = slow.next;
  fast = fast.next.next;
  if (slow == fast) return true; // cycle
}
return false;
\`\`\`

**O(n) time, O(1) space.** It works because inside a cycle the gap between the two closes by exactly 1 each step, so they are guaranteed to collide.

:::tip
The same technique finds the **middle** of a list (slow is at the midpoint when fast reaches the end) and the **cycle's start** (reset one pointer to head, then advance both by 1).
:::`,
  },
  {
    id: 'dsa-iq-clarifying-questions',
    question: 'What should you clarify before writing any code in a coding interview?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['process', 'clarify', 'requirements'],
    answer: `Spend the first minutes nailing the **contract**, not coding. Ask about:

- **Input domain** — size of \`n\`, value ranges, negatives, **duplicates**, is it **sorted**?
- **Edge inputs** — can it be **empty** or **null**? single element?
- **Output** — return the value, an index, all solutions, or a count? What if none exists?
- **Constraints** — in-place required? memory limits? can I modify the input?
- **Ties / ordering** — any specific order expected in the result?

:::tip
Clarifying questions do double duty: they prevent solving the wrong problem, and they signal seniority. The constraints you surface (especially \`n\` and "sorted?") often reveal the intended complexity and approach before you write a line.
:::`,
  },
  {
    id: 'dsa-iq-think-aloud',
    question: 'Why is thinking aloud important, and how do you do it well?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['communication', 'process', 'signal'],
    answer: `The interviewer is grading your **problem-solving process**, not just the final code — and they can only grade what they hear. Silence looks like being stuck; narration shows structured thinking.

Do it well by narrating **decisions**, not keystrokes:

- ✅ "A hash set gives O(1) membership, trading O(n) space to drop the nested loop."
- ✅ "I'll handle the empty-array case first, then the general case."
- ❌ Reading code verbatim, or going silent for two minutes.

:::senior
Narrating also lets the interviewer **redirect you early** if you head down a wrong path — saving time you'd otherwise lose. A candidate who communicates a decent approach clearly often outscores one who silently produces slightly better code.
:::`,
  },
  {
    id: 'dsa-iq-taking-hints',
    question: 'How should you respond when the interviewer offers a hint?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['process', 'hints', 'collaboration'],
    answer: `**Take it seriously and engage** — a hint is a course correction, not a trap. Interviewers *expect* to nudge; how you incorporate feedback is itself part of the signal.

- **Acknowledge and think it through** out loud: "Good point — if I sort first, the two-pointer sweep becomes valid."
- **Don't ignore it** and plow ahead on your original path — that reads as uncoachable.
- **Don't over-pivot** either: understand *why* the hint helps before rewriting everything.

:::senior
A hint usually means "you're close but missing one idea." Treat interviews as **collaborative** — the ability to integrate feedback quickly is exactly what day-to-day engineering (code review, pairing) requires, and interviewers weight it heavily.
:::`,
  },
  {
    id: 'dsa-iq-recognize-two-pointer',
    question: 'What signals that a problem is solved with two pointers?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['patterns', 'two-pointers', 'cues'],
    answer: `Reach for **two pointers** when you see:

- A **sorted array** and a **pair/triplet** with a target sum → opposite-end pointers (two-sum sorted, 3sum, container with most water).
- **In-place** array manipulation preserving order → slow/fast **read-write** pointers (move zeroes, remove duplicates, partition).
- A **palindrome** or symmetric check → pointers converging from both ends.
- A **linked list** cycle / middle / nth-from-end → **fast-slow** pointers.

\`\`\`java
int l = 0, r = n - 1;
while (l < r) { /* move l up or r down based on a condition */ }
\`\`\`

:::tip
The unifying idea is replacing a **nested O(n²) loop** with a **single O(n) coordinated sweep**. If the brute force is "try all pairs," ask whether sorting plus two pointers collapses it to linear.
:::`,
  },
  {
    id: 'dsa-iq-recognize-prefix-sum',
    question: 'What signals a prefix-sum (or running-aggregate) solution?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['patterns', 'prefix-sum', 'cues'],
    answer: `Think **prefix sums** when a problem involves **range aggregates** or **contiguous subarray sums**, especially with **repeated queries** or **negative numbers** (where a sliding window fails).

- "Sum/average of range \`[i, j]\`" over many queries → precompute prefixes, each query **O(1)**.
- "Count/find subarrays summing to \`k\`" with negatives → prefix sums **+ a hash map** of seen prefixes.
- 2-D versions ("submatrix sum") → a 2-D prefix-sum table.

\`\`\`java
// subarray sum == k, handles negatives
map.put(0, 1);
for (int x : a) { run += x; count += map.getOrDefault(run - k, 0);
                  map.merge(run, 1, Integer::sum); }
\`\`\`

:::senior
The deciding factor vs a sliding window: if the array has **negatives**, the window's sum isn't monotonic as it grows, so windows break — prefix sums with a hash map are the correct tool.
:::`,
  },
  {
    id: 'dsa-iq-test-your-code',
    question: 'After writing a solution, how do you verify it before saying "done"?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['process', 'testing', 'review'],
    answer: `**Dry-run** your code on a concrete example, tracing variables line by line — don't just re-read it, *execute it in your head*.

1. **Trace a normal case** with small values, tracking each variable's state.
2. **Hit the edge cases** you raised earlier: empty, single element, all-equal, target absent, overflow.
3. **Check boundaries** — first/last index, loop start/end, off-by-one in \`<\` vs \`<=\`.
4. **State complexity** — confirm the time/space you claimed actually holds.

:::gotcha
Proactively finding and fixing your own bug during the dry-run scores **higher** than the interviewer catching it. Narrate the trace: "at \`i = 2\`, \`sum\` is 5, which exceeds \`k\`, so I shrink from the left…" — this catches most off-by-one and initialization bugs.
:::`,
  },
  {
    id: 'dsa-iq-when-stuck',
    question: 'What is your strategy when you get stuck on a problem?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['process', 'strategy', 'unstuck'],
    answer: `Have a concrete recovery ladder rather than freezing:

1. **Solve a smaller / simpler version** — n=1, 2, then generalize the pattern.
2. **Work a concrete example by hand** and watch what your brain does — that procedure often *is* the algorithm.
3. **Re-read the constraints** — the size of \`n\` hints at the target complexity (n≤20 → exponential is fine; n≤10⁵ → need n log n).
4. **Fall back to brute force**, get it working, then optimize the named bottleneck. Partial credit beats a blank screen.
5. **Ask a targeted question** — "would sorting the input be acceptable here?"

:::senior
Never go silent. Verbalizing where you're stuck ("I need O(1) lookup of the complement but I'm scanning") frequently surfaces the answer yourself, and lets the interviewer offer a hint. A working brute force plus a clear optimization plan is a strong outcome.
:::`,
  },
  {
    id: 'dsa-iq-optimize-bottleneck',
    question: 'You have a brute-force solution. How do you systematically optimize it?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['process', 'optimization', 'strategy'],
    answer: `**Name the bottleneck, then match it to the technique that removes it.**

| Brute-force cost | Bottleneck | Optimization |
|--|--|--|
| Nested pair search | repeated lookups | **hash map** → O(n) |
| Repeated range sums | recomputation | **prefix sums** |
| Repeated min/max in window | rescanning | **monotonic deque / heap** |
| Recomputed subproblems | overlap | **memoization / DP** |
| Search in sorted data | linear scan | **binary search** |
| "Try all pairs" on sorted | O(n²) | **two pointers** |

:::senior
The mental move is: "which operation dominates, and what data structure makes that operation cheaper?" Most O(n²)→O(n) wins come from **spending O(n) memory** (a hash map or precomputed array) to eliminate a repeated inner computation. State the trade-off explicitly.
:::`,
  },
  {
    id: 'dsa-iq-doesnt-fit-memory',
    question: 'The interviewer says the data does not fit in memory. How do you approach it?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['scale', 'external', 'streaming'],
    answer: `This cue shifts you from in-memory algorithms to **external / streaming** techniques:

- **Sorting** huge data → **external merge sort**: sort memory-sized chunks into runs on disk, then k-way **heap-merge** them.
- **Top-k / frequency** over a stream → a **size-k heap** or **count-min sketch** (approximate counts in fixed memory).
- **Membership / dedup** at scale → a **Bloom filter** (probabilistic, tiny memory) or **external hashing / partitioning** by key.
- **Aggregations** → **chunk/stream** the input, maintaining only running accumulators (sum, count, min/max).
- **Distributed** → partition by key so each machine handles a shard (**MapReduce** shape).

:::senior
The key reframing: you can no longer assume **random access** to all data. Process it in **one or few sequential passes**, keeping only bounded state. Naming external merge sort and a streaming/sketch structure signals systems maturity beyond LeetCode.
:::`,
  },
];

export default questions;
