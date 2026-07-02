import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'dsa-para-backtracking-pattern',
    question: 'Describe the general structure of a backtracking algorithm.',
    difficulty: 'Medium',
    category: 'Paradigms',
    tags: ['backtracking', 'recursion'],
    answer: `Backtracking is a depth-first search over a tree of partial solutions, built on a **choose → explore → un-choose** loop:

\`\`\`java
void backtrack(State s, Path path) {
  if (isComplete(path)) { record(path); return; }
  for (Choice c : choicesFrom(s)) {
    path.add(c);                    // choose
    backtrack(next(s, c), path);    // explore
    path.remove(path.size() - 1);   // un-choose (BACKTRACK)
  }
}
\`\`\`

The **un-choose** step reverses the choice so the shared state is clean for the next sibling branch — forgetting it is the classic backtracking bug. Adding an early validity check (**pruning**) before recursing cuts whole subtrees and is what makes backtracking practical.

Use it for subsets, permutations, combinations, N-queens, sudoku, and word search.`,
  },
  {
    id: 'dsa-para-subsets-vs-permutations',
    question: 'How do the recursive choices differ when generating subsets vs permutations?',
    difficulty: 'Medium',
    category: 'Paradigms',
    tags: ['backtracking', 'subsets', 'permutations'],
    answer: `The **choice made at each level** is different:

- **Subsets** — for each element make a binary decision: *include it or skip it*. There are **2ⁿ** subsets, so time is O(n · 2ⁿ).
- **Permutations** — for each open slot, pick *which unused element* goes there, tracking a \`used[]\` array. There are **n!** permutations, so time is O(n · n!).

\`\`\`java
// permutations: pick an unused element per slot
for (int i = 0; i < n; i++) {
  if (used[i]) continue;
  used[i] = true; path.add(a[i]);
  perms(path, used);
  used[i] = false; path.remove(path.size() - 1);
}
\`\`\`

:::tip
For **combinations** (C(n, k)) pass a start index so you never look back — this avoids generating the same set in different orders.
:::`,
  },
  {
    id: 'dsa-para-dc-vs-dp',
    question: 'What is the difference between divide & conquer and dynamic programming?',
    difficulty: 'Medium',
    category: 'Paradigms',
    tags: ['divide-and-conquer', 'dynamic-programming'],
    answer: `Both split a problem into subproblems and combine the results, but:

- **Divide & conquer** — subproblems are **independent** and do not overlap (the two halves of merge sort never share work). No caching needed.
- **Dynamic programming** — subproblems **overlap**; the same subproblem is needed many times, so each answer is computed once and **cached** (memoization or a table).

The tell: if a naive recursion recomputes the same input repeatedly (like \`fib(n)\`), it is a DP problem. If each recursive call sees a fresh, non-repeating input (like merge sort halves), it is divide & conquer.`,
  },
  {
    id: 'dsa-para-master-theorem',
    question: 'What is the Master Theorem and how do you apply it to merge sort?',
    difficulty: 'Hard',
    category: 'Paradigms',
    tags: ['divide-and-conquer', 'master-theorem', 'complexity'],
    answer: `The Master Theorem solves recurrences of the form:

\`\`\`
T(n) = a · T(n / b) + f(n)
\`\`\`

where **a** = number of subproblems, **b** = shrink factor, **f(n)** = divide + combine cost. Compare \`f(n)\` against \`n^(log_b a)\`:

- **Case 1:** \`f(n)\` grows slower → T(n) = Θ(n^(log_b a)) (leaves dominate).
- **Case 2:** \`f(n) ≈ n^(log_b a)\` → T(n) = Θ(n^(log_b a) · log n).
- **Case 3:** \`f(n)\` grows faster → T(n) = Θ(f(n)) (combine dominates).

**Merge sort:** T(n) = 2T(n/2) + O(n). Here a = 2, b = 2, so \`n^(log₂2) = n\`, which matches \`f(n) = n\` → **Case 2** → **Θ(n log n)**. Intuitively: log n levels, each doing O(n) merge work.`,
  },
  {
    id: 'dsa-para-greedy-when-correct',
    question: 'When is a greedy algorithm guaranteed to produce an optimal solution?',
    difficulty: 'Medium',
    category: 'Paradigms',
    tags: ['greedy', 'optimal-substructure'],
    answer: `A greedy algorithm is provably optimal only when the problem has **both**:

1. **Greedy-choice property** — a globally optimal solution can be built by making locally optimal choices; the greedy pick is always part of *some* optimal solution.
2. **Optimal substructure** — an optimal solution contains optimal solutions to its subproblems.

Optimal substructure alone is not enough (DP problems have it too). The greedy-choice property is the distinguishing ingredient, usually proven with an **exchange argument**: show any optimal solution can be transformed to include the greedy choice without getting worse.

Examples that satisfy both: interval scheduling, fractional knapsack, Huffman coding, Dijkstra.`,
  },
  {
    id: 'dsa-para-greedy-fails-coin-change',
    question: 'Give an example where a greedy algorithm fails, and explain why.',
    difficulty: 'Medium',
    category: 'Paradigms',
    tags: ['greedy', 'coin-change', 'dynamic-programming'],
    answer: `**Coin change** with coins {1, 3, 4}, making amount **6**:

- **Greedy** (take the largest coin ≤ remaining): 4, then 1, 1 → **3 coins**.
- **Optimal**: 3 + 3 → **2 coins**.

Greedy fails because committing to the largest coin (4) forecloses the better 3+3 combination — the locally best choice is not part of the global optimum, so the greedy-choice property does **not** hold here.

The fix is **dynamic programming**, which explores all combinations:

\`\`\`
dp[i] = min over coins c of dp[i - c] + 1
\`\`\`

:::gotcha
Greedy returning a *valid* answer never proves it is *optimal*. Always test a small adversarial case before trusting a greedy rule.
:::`,
  },
  {
    id: 'dsa-para-interval-scheduling',
    question: 'For maximum non-overlapping interval scheduling, what greedy rule works and why?',
    difficulty: 'Medium',
    category: 'Paradigms',
    tags: ['greedy', 'interval-scheduling'],
    answer: `Sort intervals by **earliest finish time**, then greedily take each interval whose start is ≥ the last accepted interval's end:

\`\`\`java
sort(intervals, by end ascending);
int lastEnd = Integer.MIN_VALUE, count = 0;
for (Interval iv : intervals)
  if (iv.start >= lastEnd) { count++; lastEnd = iv.end; }
\`\`\`

**Why earliest finish?** Finishing as early as possible leaves the maximum remaining time for future intervals. An **exchange argument** proves optimality: any optimal schedule's first interval can be swapped for the earliest-finishing one without reducing the count.

Sorting by start time or by duration both have counterexamples (one long early meeting can block many short ones). Overall cost: O(n log n) for the sort.`,
  },
  {
    id: 'dsa-para-memo-vs-tabulation',
    question: 'Compare memoization and tabulation as DP implementation styles.',
    difficulty: 'Medium',
    category: 'Paradigms',
    tags: ['dynamic-programming', 'memoization', 'tabulation'],
    answer: `Both implement the same recurrence; they differ in direction:

| | Memoization (top-down) | Tabulation (bottom-up) |
|--|--|--|
| Style | recursion + cache | iterative table fill |
| Order | lazy — solves only needed subproblems | eager — all subproblems in dependency order |
| Risk | recursion stack overflow for large n | must find correct fill order |
| Space | table + call stack | table only, easy to optimize |

\`\`\`java
// memoization
long fib(int n) {
  if (n < 2) return n;
  if (memo[n] != -1) return memo[n];
  return memo[n] = fib(n-1) + fib(n-2);
}
// tabulation
dp[0] = 0; dp[1] = 1;
for (int i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];
\`\`\`

Both turn O(2ⁿ) naive Fibonacci into **O(n)**. Tabulation is easier to space-optimize with a **rolling array**.`,
  },
  {
    id: 'dsa-para-dp-recipe',
    question: 'What are the steps to design a dynamic programming solution?',
    difficulty: 'Hard',
    category: 'Paradigms',
    tags: ['dynamic-programming', 'problem-solving'],
    answer: `A reliable 5-step recipe:

1. **Define the state** — what does \`dp[i]\` or \`dp[i][j]\` *mean*? This is the hardest and most important step. The number of parameters that describe a subproblem tells you the table's dimension.
2. **Write the transition (recurrence)** — express one state in terms of smaller states.
3. **Set base cases** — the smallest subproblems with known answers.
4. **Choose the iteration order** — so every state's dependencies are computed before it.
5. **Optimize space** — if a state only reads a small window of previous states, use a rolling array/variables.

:::senior
One state parameter → 1-D array (coin change, LIS, house robber). Two parameters → 2-D table (knapsack, LCS, edit distance, grid paths). Nail the state definition and the recurrence usually writes itself.
:::`,
  },
  {
    id: 'dsa-para-knapsack-recurrence',
    question: 'Explain the 0/1 knapsack DP recurrence.',
    difficulty: 'Hard',
    category: 'Paradigms',
    tags: ['dynamic-programming', 'knapsack'],
    answer: `Let \`dp[i][w]\` = the maximum value using the first \`i\` items within capacity \`w\`. For each item you choose **skip** or **take**:

\`\`\`java
dp[i][w] = dp[i - 1][w];                          // skip item i
if (wt[i] <= w)
  dp[i][w] = Math.max(dp[i][w],
             dp[i - 1][w - wt[i]] + val[i]);        // take item i
\`\`\`

- **Skip** → value is whatever we had without item \`i\`: \`dp[i-1][w]\`.
- **Take** (only if it fits) → add its value and free up its weight: \`dp[i-1][w - wt[i]] + val[i]\`.

The answer is \`dp[n][W]\`, computed in **O(n · W)** time. Because each row reads only the previous row, you can compress to a 1-D array of size W — iterating capacity **backwards** so an item is not reused within the same row (that backward loop is what keeps it 0/1 rather than unbounded).`,
  },
  {
    id: 'dsa-para-lis',
    question: 'How do you compute the Longest Increasing Subsequence, and can it be faster than O(n²)?',
    difficulty: 'Hard',
    category: 'Paradigms',
    tags: ['dynamic-programming', 'lis', 'binary-search'],
    answer: `**O(n²) DP:** \`dp[i]\` = length of the longest increasing subsequence *ending at* index \`i\`. Each \`dp[i]\` extends the best earlier subsequence whose last element is smaller:

\`\`\`java
Arrays.fill(dp, 1);
for (int i = 0; i < n; i++)
  for (int j = 0; j < i; j++)
    if (a[j] < a[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
int ans = max(dp);
\`\`\`

**O(n log n):** maintain a \`tails\` array where \`tails[k]\` is the smallest possible tail of an increasing subsequence of length \`k+1\`. For each element, binary-search its insertion point and either extend or replace:

\`\`\`java
for (int x : a) {
  int pos = lowerBound(tails, x);
  if (pos == tails.size()) tails.add(x);
  else tails.set(pos, x);
}
// LIS length = tails.size()
\`\`\`

The patience-sorting insight (binary search into \`tails\`) is the classic optimization interviewers look for.`,
  },
  {
    id: 'dsa-para-overlapping-subproblems',
    question: 'What does "overlapping subproblems" mean, and why does it make DP effective?',
    difficulty: 'Easy',
    category: 'Paradigms',
    tags: ['dynamic-programming', 'complexity'],
    answer: `**Overlapping subproblems** means a naive recursion solves the *same* subproblem many times. Naive Fibonacci is the canonical example: \`fib(5)\` computes \`fib(3)\` twice and \`fib(2)\` three times, producing an O(2ⁿ) call tree.

DP exploits this by computing each distinct subproblem **once** and caching the result (memoization or tabulation). For Fibonacci there are only n distinct subproblems, so the work collapses from O(2ⁿ) to **O(n)**.

Contrast with divide & conquer (e.g. merge sort), where subproblems are independent and never repeat — there is nothing to cache, so DP offers no benefit there.`,
  },
];

export default questions;
