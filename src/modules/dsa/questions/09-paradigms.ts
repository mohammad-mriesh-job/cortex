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
  {
    id: 'dsa-para-climbing-stairs',
    question: 'How many distinct ways can you climb n stairs taking 1 or 2 steps at a time?',
    difficulty: 'Easy',
    category: 'Paradigms',
    tags: ['dynamic-programming', 'fibonacci', 'introductory'],
    answer: `The last move is either a 1-step (from stair \`n-1\`) or a 2-step (from \`n-2\`), so \`ways(n) = ways(n-1) + ways(n-2)\` — it is **Fibonacci**. Cache to avoid the O(2ⁿ) naive recursion.

\`\`\`java
int climb(int n) {
  int a = 1, b = 1;                 // ways(0)=1, ways(1)=1
  for (int i = 2; i <= n; i++) {
    int c = a + b;                  // rolling: only last two matter
    a = b; b = c;
  }
  return b;
}
\`\`\`

**O(n) time, O(1) space.** Rolling two variables instead of a full array is the space optimization.

:::tip
This is the "hello world" of DP. The recognition skill: "count the ways to reach state n from a small set of prior states" → additive recurrence. Coin-change-ways and decode-ways are the same shape with different step sets.
:::`,
  },
  {
    id: 'dsa-para-house-robber',
    question: 'Rob houses in a row for maximum loot without robbing two adjacent houses.',
    difficulty: 'Medium',
    category: 'Paradigms',
    tags: ['dynamic-programming', 'house-robber', 'one-dimensional'],
    answer: `At each house choose **rob** (take its value + best up to \`i-2\`) or **skip** (best up to \`i-1\`):

\`\`\`java
int rob(int[] nums) {
  int prev2 = 0, prev1 = 0;          // best up to i-2, i-1
  for (int x : nums) {
    int cur = Math.max(prev1, prev2 + x);  // skip vs rob
    prev2 = prev1; prev1 = cur;
  }
  return prev1;
}
\`\`\`

**O(n) time, O(1) space.** The "adjacent forbidden" constraint is exactly what forces the \`i-2\` reach — you can't build on the immediately previous house.

:::senior
The circular variant (first and last are adjacent) reduces to running this twice: once excluding house 0, once excluding the last house, then taking the max. Recognizing the reduction is the interview payoff.
:::`,
  },
  {
    id: 'dsa-para-coin-change-min',
    question: 'What is the fewest number of coins to make a given amount?',
    difficulty: 'Medium',
    category: 'Paradigms',
    tags: ['dynamic-programming', 'coin-change', 'unbounded'],
    answer: `Greedy fails for arbitrary denominations, so use **DP**: \`dp[a]\` = fewest coins to make amount \`a\`. Each coin offers a transition from \`a - coin\`.

\`\`\`java
int[] dp = new int[amount + 1];
Arrays.fill(dp, amount + 1);       // "infinity" sentinel
dp[0] = 0;
for (int a = 1; a <= amount; a++)
  for (int c : coins)
    if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
return dp[amount] > amount ? -1 : dp[amount];
\`\`\`

**O(amount · coins)** time, O(amount) space. Iterating amounts in the **outer** loop and reusing coins freely makes it the **unbounded** knapsack (a coin can be used many times).

:::gotcha
Seed \`dp\` with a sentinel larger than any real answer and check it at the end to report "impossible" (\`-1\`). Using \`Integer.MAX_VALUE\` risks overflow in \`dp[a-c] + 1\` — \`amount + 1\` is the safe sentinel.
:::`,
  },
  {
    id: 'dsa-para-unique-paths',
    question: 'How many unique paths are there from the top-left to bottom-right of an m×n grid moving only right or down?',
    difficulty: 'Medium',
    category: 'Paradigms',
    tags: ['dynamic-programming', 'grid', 'combinatorics'],
    answer: `Each cell is reached only from **above** or **from the left**, so \`paths[i][j] = paths[i-1][j] + paths[i][j-1]\`, with the first row and column all 1s. A single rolling row compresses the space:

\`\`\`java
int[] row = new int[n];
Arrays.fill(row, 1);
for (int i = 1; i < m; i++)
  for (int j = 1; j < n; j++)
    row[j] += row[j - 1];       // above (old row[j]) + left (new row[j-1])
return row[n - 1];
\`\`\`

**O(m·n) time, O(n) space.** With obstacles, set blocked cells to 0 and they contribute nothing downstream.

:::senior
Closed form: it is the binomial \`C(m+n-2, m-1)\` — you take exactly \`m-1\` downs and \`n-1\` rights in some order. Mentioning the combinatorial O(1)-ish view is a nice differentiator when there are no obstacles.
:::`,
  },
  {
    id: 'dsa-para-jump-game',
    question: 'Given jump lengths at each index, can you reach the last index?',
    difficulty: 'Medium',
    category: 'Paradigms',
    tags: ['greedy', 'jump-game', 'reachability'],
    answer: `A **greedy** scan tracking the **farthest reachable** index beats DP here — O(n) instead of O(n²).

\`\`\`java
int farthest = 0;
for (int i = 0; i < n; i++) {
  if (i > farthest) return false;             // stuck before reaching i
  farthest = Math.max(farthest, i + nums[i]);
  if (farthest >= n - 1) return true;
}
return true;
\`\`\`

At each index, if it is still within reach, extend the frontier. If the loop index ever passes the frontier, a gap makes the end unreachable. **O(n) time, O(1) space.**

:::senior
The variant "**minimum** jumps to reach the end" is also greedy (implicit BFS by levels): track the current jump's boundary and the farthest reachable, incrementing the jump count each time you cross the boundary.
:::`,
  },
  {
    id: 'dsa-para-combination-sum',
    question: 'Find all combinations of candidates (reuse allowed) that sum to a target.',
    difficulty: 'Medium',
    category: 'Paradigms',
    tags: ['backtracking', 'combinations', 'pruning'],
    answer: `**Backtracking** with a **start index** to avoid permuted duplicates; because reuse is allowed, recurse with the same index \`i\` (not \`i+1\`).

\`\`\`java
void backtrack(int start, int remain, List<Integer> path) {
  if (remain == 0) { result.add(new ArrayList<>(path)); return; }
  for (int i = start; i < cand.length; i++) {
    if (cand[i] > remain) continue;        // prune (sort first for early break)
    path.add(cand[i]);
    backtrack(i, remain - cand[i], path);  // i (not i+1) → reuse allowed
    path.remove(path.size() - 1);          // un-choose
  }
}
\`\`\`

Passing \`start\` forbids looking backward, so \`[2,3]\` and \`[3,2]\` aren't both generated. Sorting candidates lets you \`break\` early once \`cand[i] > remain\`.

:::gotcha
"Combination Sum II" (each number used **once**, input has duplicates) differs in two ways: recurse with \`i+1\`, and skip \`cand[i] == cand[i-1]\` at the same tree level to avoid duplicate combinations.
:::`,
  },
  {
    id: 'dsa-para-max-product-subarray',
    question: 'Find the contiguous subarray with the largest product.',
    difficulty: 'Medium',
    category: 'Paradigms',
    tags: ['dynamic-programming', 'subarray', 'sign'],
    answer: `Unlike max-**sum** (Kadane), products flip sign: a **negative** times the current **minimum** can become the new maximum. So track **both** the running max and min ending here.

\`\`\`java
int max = nums[0], min = nums[0], best = nums[0];
for (int i = 1; i < n; i++) {
  int x = nums[i];
  if (x < 0) { int t = max; max = min; min = t; } // swap on negative
  max = Math.max(x, max * x);
  min = Math.min(x, min * x);
  best = Math.max(best, max);
}
return best;
\`\`\`

**O(n) time, O(1) space.** The swap-on-negative captures that the smallest (most negative) product can jump to the largest after multiplying by a negative.

:::senior
Carrying the min alongside the max is the whole trick — it is what a straight Kadane adaptation misses. Zeros naturally reset both because \`max(x, …)\` restarts the window at \`x\`.
:::`,
  },
  {
    id: 'dsa-para-fractional-knapsack',
    question: 'How does fractional knapsack differ from 0/1 knapsack, and why is greedy optimal for it?',
    difficulty: 'Medium',
    category: 'Paradigms',
    tags: ['greedy', 'knapsack', 'exchange-argument'],
    answer: `In **fractional** knapsack you may take **fractions** of items, so a simple **greedy** by **value-to-weight ratio** is optimal — fill with the densest items first, taking a fraction of the last one to exactly reach capacity.

\`\`\`java
sort(items, by (value/weight) descending);
double total = 0; int cap = W;
for (Item it : items) {
  if (it.weight <= cap) { total += it.value; cap -= it.weight; }
  else { total += it.value * ((double) cap / it.weight); break; } // fraction
}
\`\`\`

**O(n log n)** for the sort. An **exchange argument** proves it: any spare capacity is best filled by the highest remaining density, so swapping toward denser items never hurts.

:::gotcha
Greedy is optimal *only because fractions are allowed*. **0/1 knapsack** (all-or-nothing) breaks the greedy-choice property and requires **DP** — a classic "why does greedy work here but not there?" follow-up.
:::`,
  },
  {
    id: 'dsa-para-lcs',
    question: 'How do you compute the Longest Common Subsequence of two strings?',
    difficulty: 'Hard',
    category: 'Paradigms',
    tags: ['dynamic-programming', 'lcs', 'two-dimensional'],
    answer: `\`dp[i][j]\` = LCS length of the first \`i\` chars of \`a\` and first \`j\` of \`b\`. If the current characters **match**, extend the diagonal; else take the best of dropping one character from either string.

\`\`\`java
int[][] dp = new int[m + 1][n + 1];
for (int i = 1; i <= m; i++)
  for (int j = 1; j <= n; j++)
    dp[i][j] = (a.charAt(i-1) == b.charAt(j-1))
             ? dp[i-1][j-1] + 1                       // match → diagonal + 1
             : Math.max(dp[i-1][j], dp[i][j-1]);      // skip a char
return dp[m][n];
\`\`\`

**O(m·n) time and space** (reducible to O(min(m, n)) with two rolling rows).

:::senior
LCS is the template for **edit distance**, **diff tools**, and **longest palindromic subsequence** (LCS of the string with its reverse). The match→diagonal / mismatch→max-of-neighbours recurrence is worth memorizing cold.
:::`,
  },
  {
    id: 'dsa-para-edit-distance',
    question: 'How do you compute the edit distance (Levenshtein) between two strings?',
    difficulty: 'Hard',
    category: 'Paradigms',
    tags: ['dynamic-programming', 'edit-distance', 'two-dimensional'],
    answer: `\`dp[i][j]\` = minimum edits to turn the first \`i\` chars of \`a\` into the first \`j\` of \`b\`. If the characters match, no cost — copy the diagonal; else take **1 + min(insert, delete, replace)**.

\`\`\`java
for (int i = 0; i <= m; i++) dp[i][0] = i;   // delete all
for (int j = 0; j <= n; j++) dp[0][j] = j;   // insert all
for (int i = 1; i <= m; i++)
  for (int j = 1; j <= n; j++)
    dp[i][j] = (a.charAt(i-1) == b.charAt(j-1))
      ? dp[i-1][j-1]
      : 1 + Math.min(dp[i-1][j-1],                    // replace
              Math.min(dp[i-1][j], dp[i][j-1]));      // delete / insert
return dp[m][n];
\`\`\`

**O(m·n).** The three neighbours map to the three operations: diagonal = replace, up = delete, left = insert.

:::gotcha
The base cases encode "transform to/from empty string": \`dp[i][0] = i\` (delete i chars), \`dp[0][j] = j\` (insert j chars). Omitting them is the most common bug.
:::`,
  },
  {
    id: 'dsa-para-n-queens',
    question: 'How do you solve the N-Queens problem with backtracking and pruning?',
    difficulty: 'Hard',
    category: 'Paradigms',
    tags: ['backtracking', 'n-queens', 'pruning'],
    answer: `Place one queen **per row**, trying each column and **pruning** any that shares a column or diagonal with an existing queen. Three boolean sets make the conflict check O(1).

\`\`\`java
boolean[] col = new boolean[n], diag = new boolean[2*n], anti = new boolean[2*n];
void place(int r) {
  if (r == n) { count++; return; }
  for (int c = 0; c < n; c++) {
    int d = r - c + n, a = r + c;             // diagonal ids
    if (col[c] || diag[d] || anti[a]) continue;  // prune conflicts
    col[c] = diag[d] = anti[a] = true;        // choose
    place(r + 1);                              // explore next row
    col[c] = diag[d] = anti[a] = false;       // un-choose
  }
}
\`\`\`

The diagonal identity \`r - c\` (offset to stay non-negative) and anti-diagonal \`r + c\` are constant along each diagonal — that is what turns an O(n) conflict scan into an O(1) lookup.

:::senior
Pruning is what makes N-Queens tractable: the branching factor collapses from \`n\` to the few safe columns per row, so it explores far fewer than \`n!\` states. The pattern — track constraints in sets, check before recursing — generalizes to Sudoku.
:::`,
  },
  {
    id: 'dsa-para-word-break',
    question: 'Can a string be segmented into a space-separated sequence of dictionary words?',
    difficulty: 'Hard',
    category: 'Paradigms',
    tags: ['dynamic-programming', 'word-break', 'strings'],
    answer: `\`dp[i]\` = "can \`s[0..i)\` be fully segmented?" It is true if some split point \`j\` has \`dp[j]\` true **and** the suffix \`s[j..i)\` is a dictionary word.

\`\`\`java
Set<String> dict = new HashSet<>(wordDict);
boolean[] dp = new boolean[n + 1];
dp[0] = true;                              // empty prefix is segmentable
for (int i = 1; i <= n; i++)
  for (int j = 0; j < i; j++)
    if (dp[j] && dict.contains(s.substring(j, i))) {
      dp[i] = true; break;                 // found one valid split
    }
return dp[n];
\`\`\`

**O(n² · L)** time (the substring/lookup costs O(L)), O(n) space. The naive recursion is exponential because the same suffix is re-tested many times — the \`dp\` array is what caches those overlapping subproblems.

:::gotcha
The subtlety is that a greedy longest-match fails: \`"aaaa"\` with dict \`{"a","aa"}\` needs backtracking over split points, which the DP explores exhaustively. Seed \`dp[0] = true\` so the first word has a valid predecessor.
:::`,
  },
  {
    id: 'dsa-para-partition-equal-subset',
    question: 'Can an array be split into two subsets with equal sum?',
    difficulty: 'Hard',
    category: 'Paradigms',
    tags: ['dynamic-programming', 'subset-sum', 'knapsack'],
    answer: `If the total is odd, it's impossible. Otherwise the question reduces to **subset-sum**: is there a subset summing to \`total / 2\`? That's a **0/1 knapsack** on a boolean DP.

\`\`\`java
int sum = Arrays.stream(nums).sum();
if (sum % 2 != 0) return false;
int target = sum / 2;
boolean[] dp = new boolean[target + 1];
dp[0] = true;
for (int x : nums)
  for (int s = target; s >= x; s--)     // iterate DOWN → 0/1 (no reuse)
    dp[s] |= dp[s - x];
return dp[target];
\`\`\`

**O(n · target) time, O(target) space.** \`dp[s]\` means "some subset sums to \`s\`."

:::gotcha
The inner loop must go **high to low**. Ascending would let one number be counted multiple times (that would be the *unbounded* knapsack), breaking the "each element used once" rule. The backward sweep is the 0/1 knapsack space-optimization signature.
:::`,
  },
];

export default questions;
