import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'dsa-fnd-structure-vs-algorithm',
    question: 'What is the difference between a data structure and an algorithm?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['dsa', 'fundamentals', 'definitions'],
    answer: `They are the two halves of every solution:

- **Data structure** — *how data is stored and organized* (array, linked list, hash map, tree, graph, heap).
- **Algorithm** — *the step-by-step procedure that operates on that data* (binary search, BFS/DFS, sorting, dynamic programming).

You pick a **structure** so the operations you need are cheap, then run an **algorithm** over it. The pairing determines the Big-O.

:::tip
In an interview, verbalize both: *"I'll store the values in a hash map (structure) so I can look each one up in O(1) while I scan once (algorithm)."*
:::`,
  },
  {
    id: 'dsa-fnd-abstract-data-type',
    question: 'What is an Abstract Data Type (ADT), and how does it differ from a data structure?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['adt', 'abstraction', 'design'],
    answer: `An **ADT** is a *contract*: the set of operations and guarantees, with no mention of implementation. A **data structure** is a *concrete implementation* of that contract.

| ADT (the promise) | Implementations (the machine) |
|--|--|
| List — get / add / remove | \`ArrayList\` (array), \`LinkedList\` (nodes) |
| Map — put / get / remove | \`HashMap\`, \`TreeMap\` |
| Stack (LIFO) | array-backed, node-backed |

The same ADT can have very different Big-O depending on the implementation — e.g. \`ArrayList.get(i)\` is O(1) but \`LinkedList.get(i)\` is O(n).

:::key
ADT = *what* it does; data structure = *how* it does it.
:::`,
  },
  {
    id: 'dsa-fnd-what-is-big-o',
    question: 'What does Big-O notation actually describe, and why do we drop constants?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['big-o', 'complexity', 'growth'],
    answer: `Big-O describes how an algorithm's cost **grows as the input size \`n\` grows** — its *growth rate*, not its exact runtime.

We drop constants and lower-order terms because, at scale, the dominant term decides everything:

- \`O(2n + 100)\` → **O(n)**
- \`O(3n² + 5n)\` → **O(n²)**

A one-time doubling of speed (a constant factor) is irrelevant when \`n\` reaches millions — an O(n²) algorithm loses to O(n log n) no matter how well tuned it is.

:::note
Unless stated otherwise, "complexity" means the **worst case**.
:::`,
  },
  {
    id: 'dsa-fnd-common-classes',
    question: 'Order these from fastest-growing to slowest-growing: O(n log n), O(1), O(2^n), O(n), O(log n), O(n^2).',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['big-o', 'complexity-classes', 'ordering'],
    answer: `From **best (slowest growth)** to **worst (fastest growth)**:

\`\`\`text
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ)
\`\`\`

| Class | Name | Typical source |
|--|--|--|
| O(1) | constant | hash lookup, array index |
| O(log n) | logarithmic | binary search |
| O(n) | linear | single scan |
| O(n log n) | linearithmic | merge/heap sort |
| O(n²) | quadratic | nested loops |
| O(2ⁿ) | exponential | brute-force subsets |

:::tip
Rule of thumb for interviews: inputs up to ~10⁵ with a ~1s limit mean **O(n²) times out** — aim for O(n log n) or better.
:::`,
  },
  {
    id: 'dsa-fnd-time-vs-space',
    question: 'What is the difference between time and space complexity, and how are they traded off?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['time', 'space', 'trade-off'],
    answer: `- **Time complexity** — how the *number of operations* grows with \`n\`.
- **Space complexity** — how the *extra memory* (beyond the input) grows with \`n\`.

Most interview optimizations **trade space for time**:

| "Has this value been seen?" | Time | Space |
|--|:--:|:--:|
| Re-scan the array each check | O(n²) | O(1) |
| Store seen values in a \`HashSet\` | O(n) | O(n) |

The hash set spends O(n) memory to remove a factor of n from the runtime.

:::senior
Always state **both**: *"O(n) time, O(n) space."* Recursion also costs space — the call stack is O(depth) even when nothing else is allocated.
:::`,
  },
  {
    id: 'dsa-fnd-best-avg-worst',
    question: 'Explain best, average, and worst case with an example. Which one does Big-O usually refer to?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['big-o', 'cases', 'worst-case'],
    answer: `The same algorithm can cost different amounts depending on the input.

Searching an **unsorted** array for \`x\`:

| Case | Input | Cost |
|--|--|--|
| **Best** | \`x\` is the first element | O(1) |
| **Average** | \`x\` is somewhere in the middle | O(n) |
| **Worst** | \`x\` is absent | O(n) |

By convention, **Big-O reports the worst case** unless stated otherwise.

:::gotcha
Quicksort is called "O(n log n)" but its *worst* case is O(n²) (already-sorted input with a bad pivot). Mentioning this nuance signals depth.
:::`,
  },
  {
    id: 'dsa-fnd-nested-vs-sequential',
    question: 'Two loops over n run one after another; another snippet nests one loop inside the other. What are their complexities?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['loops', 'analysis', 'big-o'],
    answer: `The rule: **sequential loops add, nested loops multiply.**

\`\`\`java
// Sequential → ADD → O(n) + O(n) = O(n)
for (int i = 0; i < n; i++) a();
for (int j = 0; j < n; j++) b();

// Nested → MULTIPLY → O(n) × O(n) = O(n²)
for (int i = 0; i < n; i++)
  for (int j = 0; j < n; j++) c();
\`\`\`

You only multiply when one loop sits *inside the body* of another.

:::gotcha
A triangular loop (\`for j = i; j < n; j++\`) runs n(n+1)/2 times — still **O(n²)** after dropping the ½.
:::`,
  },
  {
    id: 'dsa-fnd-amortized',
    question: 'Why is appending to a dynamic array (ArrayList) amortized O(1) when a single append can be O(n)?',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['amortized', 'dynamic-array', 'arraylist'],
    answer: `When the backing array fills, an append triggers a **resize**: allocate a bigger array (typically **double** the size) and copy all \`n\` elements — an O(n) operation. So a single append *can* be O(n).

But doubling makes resizes exponentially rarer. Across \`n\` appends, the total copy work is:

\`\`\`text
1 + 2 + 4 + ... + n  ≈  2n   →   O(n) total for n appends
\`\`\`

Divide that by \`n\` appends and each one averages **O(1)** — the *amortized* cost.

:::key
**Amortized ≠ average case.** Average case is about lucky vs unlucky inputs; amortized is a *guarantee* that a rare expensive step is paid for by many cheap ones. \`ArrayList.add\` and \`HashMap.put\` are both amortized O(1).
:::`,
  },
  {
    id: 'dsa-fnd-recursion-parts',
    question: 'What are the two required parts of a recursive function, and what happens if the base case is missing?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['recursion', 'base-case', 'stack-overflow'],
    answer: `Every recursion needs:

1. **Base case** — the smallest input, solved directly with *no* further recursion. It stops the descent.
2. **Recursive case** — shrinks the problem and calls itself, making progress toward the base case.

\`\`\`java
int factorial(int n) {
  if (n <= 1) return 1;          // base case
  return n * factorial(n - 1);   // recursive case
}
\`\`\`

Without a reachable base case, the function recurses forever. Each call pushes a **stack frame**; the stack eventually overflows and Java throws a **\`StackOverflowError\`** at runtime (the compiler cannot catch it).`,
  },
  {
    id: 'dsa-fnd-call-stack',
    question: 'Walk through the call stack for factorial(4). Which call returns first, and what is the space complexity?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['recursion', 'call-stack', 'space'],
    answer: `Calls **push** frames on the way down, then **pop** them (returning values) on the way up:

\`\`\`text
push factorial(4)      wait for factorial(3)
push factorial(3)      wait for factorial(2)
push factorial(2)      wait for factorial(1)
push factorial(1)  →   BASE CASE returns 1   ← returns FIRST
pop  factorial(2) = 2 * 1 = 2
pop  factorial(3) = 3 * 2 = 6
pop  factorial(4) = 4 * 6 = 24
\`\`\`

**\`factorial(1)\` returns first** — the base case is the deepest frame and unwinds first.

**Space complexity: O(n)** — up to \`n\` frames are live on the stack at the deepest point, even though the answer is a single number.

:::senior
This O(n) stack space is why deep linear recursion risks \`StackOverflowError\`. An iterative version does the same work in O(1) space. Java does not optimize tail calls.
:::`,
  },
  {
    id: 'dsa-fnd-recursion-vs-iteration',
    question: 'When would you choose recursion over iteration, and what is the main risk?',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['recursion', 'iteration', 'design'],
    answer: `Anything recursive can be rewritten iteratively and vice versa, so choose by **clarity vs cost**:

| | Recursion | Iteration |
|--|--|--|
| Reads like | the problem's definition (trees, D&C, backtracking) | a mechanical repeat |
| Extra memory | O(depth) — the call stack | O(1) |
| Risk | \`StackOverflowError\` if too deep | none |
| Best for | trees, graphs, backtracking, divide & conquer | linear scans, counting |

**Choose recursion** when the problem is naturally self-similar (traversing a tree, exploring a graph, generating combinations) — the code mirrors the structure and is far clearer.

**The main risk is stack depth.** Java does not optimize tail recursion, so recursion ~10,000+ deep overflows. For deep *linear* recursion, prefer a loop or an explicit stack.

:::key
Naive recursion can also hide exponential blow-up: two recursive calls per level (like Fibonacci) is O(2ⁿ). **Memoization** caches subresults and restores O(n).
:::`,
  },
  {
    id: 'dsa-fnd-omega-theta',
    question: 'What is the difference between Big-O, Big-Omega, and Big-Theta?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['big-o', 'big-theta', 'big-omega', 'notation'],
    answer: `They bound growth from different directions:

- **Big-O (O)** — an **upper** bound: cost grows *no faster than* this. "At most."
- **Big-Omega (Ω)** — a **lower** bound: cost grows *at least* this fast. "At least."
- **Big-Theta (Θ)** — a **tight** bound: both O and Ω hold, so the function grows *exactly* this fast (up to constants).

For a linear scan, the worst case is Θ(n): it is both O(n) and Ω(n). We usually *say* "O" loosely even when we mean Θ.

:::gotcha
"Big-O is the worst case" is a common conflation. O/Ω/Θ describe **growth-rate bounds**; best/average/worst describe **which input**. You can state an Ω bound on the best case or an O bound on the worst — the two axes are independent.
:::`,
  },
  {
    id: 'dsa-fnd-why-log-n',
    question: 'Why is an algorithm that halves its input each step O(log n)?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['big-o', 'logarithmic', 'binary-search'],
    answer: `Because the number of times you can halve \`n\` before reaching 1 is **log₂ n**. Each step throws away half the remaining work, so the count of steps is the exponent that solves \`n / 2^k = 1\`, i.e. \`k = log₂ n\`.

\`\`\`text
n=16 → 8 → 4 → 2 → 1   (4 steps = log₂ 16)
\`\`\`

That is why **binary search**, balanced-**BST** operations, and **heap** push/pop are O(log n): they discard a constant fraction of the search space every step. Logarithmic growth is barely more than constant in practice — a billion elements need only ~30 steps.`,
  },
  {
    id: 'dsa-fnd-drop-log-base',
    question: 'Why do we write O(log n) without specifying the base of the logarithm?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['big-o', 'logarithmic', 'notation'],
    answer: `Because changing the base only multiplies by a **constant factor**, and Big-O ignores constants. Logarithms in different bases differ by a fixed ratio:

\`\`\`text
log₂ n = log₁₀ n / log₁₀ 2  =  (constant) · log₁₀ n
\`\`\`

So \`log₂ n\`, \`log₁₀ n\`, and \`ln n\` are all Θ of each other — writing the base would be redundant noise.

:::note
Exponents are different: \`O(n²)\` and \`O(n³)\` are *not* interchangeable, because there the difference is a factor of \`n\` (which grows), not a constant. Bases hide inside logs; exponents do not.
:::`,
  },
  {
    id: 'dsa-fnd-in-place',
    question: 'What does it mean for an algorithm to be "in-place"?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['space', 'in-place', 'memory'],
    answer: `An **in-place** algorithm transforms its input using only **O(1) extra space** (a few variables) — it mutates the given array/structure rather than allocating a proportional copy.

\`\`\`java
// in-place reversal: O(1) extra space
void reverse(int[] a) {
  int l = 0, r = a.length - 1;
  while (l < r) { int t = a[l]; a[l++] = a[r]; a[r--] = t; }
}
\`\`\`

Reversing into a new array would be O(n) space and **not** in-place. In-place algorithms save memory but often **destroy the original input** — a trade-off to flag if the caller still needs it.

:::note
By convention the recursion stack is sometimes tolerated: in-place quicksort is called "in-place" despite O(log n) stack frames, because it allocates no O(n) auxiliary array.
:::`,
  },
  {
    id: 'dsa-fnd-auxiliary-space',
    question: 'What is the difference between auxiliary space and total space complexity?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['space', 'auxiliary-space', 'complexity'],
    answer: `- **Total space** = the input itself **plus** everything the algorithm allocates.
- **Auxiliary space** = only the **extra** memory beyond the input.

"Space complexity" in interviews almost always means **auxiliary** space, because the input size is fixed and not the algorithm's choice.

| Algorithm | Auxiliary space |
|--|--|
| In-place reversal | O(1) |
| Merge sort | O(n) merge buffer |
| Recursive DFS | O(h) call stack |
| Iterative BFS | O(w) queue |

:::senior
Don't forget the **call stack**: a recursive function with no explicit allocation still costs O(depth) auxiliary space. Deep linear recursion is O(n) space even when it looks O(1).
:::`,
  },
  {
    id: 'dsa-fnd-string-immutability-cost',
    question: 'Why is building a string by repeated concatenation in a loop O(n²)?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['strings', 'immutability', 'complexity'],
    answer: `In Java (and most managed languages) a **\`String\` is immutable**, so \`s = s + c\` cannot mutate \`s\` — it allocates a **new** string and copies all existing characters. Appending to a string of length \`k\` costs O(k), and doing that for \`n\` characters gives \`1 + 2 + … + n = O(n²)\`.

\`\`\`java
// O(n²) — each += copies the whole string so far
String s = "";
for (char c : chars) s += c;

// O(n) — StringBuilder mutates a resizable buffer
StringBuilder sb = new StringBuilder();
for (char c : chars) sb.append(c);
\`\`\`

:::gotcha
This is a classic hidden-quadratic trap. Use a **\`StringBuilder\`** (amortized O(1) append) whenever you build a string in a loop.
:::`,
  },
  {
    id: 'dsa-fnd-choose-structure',
    question: 'How do you decide which data structure to use for a problem?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['design', 'data-structures', 'strategy'],
    answer: `Work from the **operations you need most** and pick the structure that makes them cheapest:

| Need | Reach for |
|--|--|
| O(1) lookup by key | hash map / hash set |
| O(1) lookup by index, cache-friendly scan | array |
| ordered keys, range queries | balanced BST / \`TreeMap\` |
| min/max on demand | heap / priority queue |
| LIFO / FIFO / both ends | stack / queue / deque |
| prefix queries on strings | trie |
| dynamic connectivity | union-find |

:::tip
Name the *dominant operation* first ("I need repeated 'have I seen this?' checks → hash set"). The right structure usually falls out of one operation's required complexity.
:::`,
  },
  {
    id: 'dsa-fnd-constant-factors',
    question: 'Is an algorithm with a lower Big-O always faster in practice?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['big-o', 'constant-factors', 'practice'],
    answer: `**No.** Big-O describes growth *asymptotically* — as \`n → ∞\`. For small or moderate \`n\`, **constant factors and lower-order terms** the notation hides can dominate.

- Insertion sort (O(n²)) beats merge sort (O(n log n)) for \`n\` below ~16 — which is exactly why library sorts switch to it for small subarrays.
- A cache-friendly O(n²) array pass can beat an O(n) pointer-chasing structure that thrashes the cache.
- Hash maps are "O(1)" but have real hashing/boxing overhead a plain array index avoids.

:::senior
Big-O predicts **how cost scales**, not the wall-clock winner at a given size. For large \`n\` the lower-complexity algorithm always wins eventually; below the crossover point, measure.
:::`,
  },
  {
    id: 'dsa-fnd-loop-invariant',
    question: 'What is a loop invariant and why is it useful?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['correctness', 'loop-invariant', 'reasoning'],
    answer: `A **loop invariant** is a condition that is **true before and after every iteration** of a loop. Proving one is the standard way to argue a loop is *correct* — much like induction:

1. **Initialization** — it holds before the first iteration.
2. **Maintenance** — if it holds before an iteration, it still holds after.
3. **Termination** — when the loop ends, the invariant plus the exit condition gives the result you want.

Example — Lomuto partition keeps the invariant "\`a[lo..i] ≤ pivot\`". Binary search keeps "the target, if present, lies in \`[lo, hi]\`".

:::tip
When a loop is buggy, ask "what did I *intend* to be true each iteration, and where does it break?" Stating the invariant out loud often exposes the off-by-one immediately.
:::`,
  },
  {
    id: 'dsa-fnd-analyze-recursive',
    question: 'How do you determine the time complexity of a recursive function?',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['recursion', 'recurrence', 'analysis'],
    answer: `Write a **recurrence** \`T(n)\` for the work, then solve it. Two reliable methods:

**1. Count total calls × work per call.** Naive Fibonacci makes ~\`2ⁿ\` calls, each O(1) → **O(2ⁿ)**. A single-branch recursion of depth \`n\` doing O(1) each → O(n).

**2. Recursion tree / Master Theorem** for divide-and-conquer \`T(n) = a·T(n/b) + f(n)\`:

\`\`\`text
Merge sort:  T(n) = 2T(n/2) + O(n)  → O(n log n)
Binary search: T(n) = T(n/2) + O(1) → O(log n)
Naive Fib:   T(n) = T(n-1)+T(n-2)+O(1) → O(2ⁿ)
\`\`\`

:::senior
Two traps: (1) recursion also costs **O(depth) stack space**, easy to forget; (2) branching factor matters more than depth — two recursive calls per level is exponential unless **memoization** collapses the repeated subproblems back to polynomial.
:::`,
  },
  {
    id: 'dsa-fnd-tail-recursion',
    question: 'What is tail recursion, and does the JVM optimize it?',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['recursion', 'tail-call', 'jvm'],
    answer: `A call is **tail-recursive** when the recursive call is the **last action** in the function — its result is returned directly, with no pending work after it.

\`\`\`java
// tail form: nothing happens after the recursive call
int sum(int n, int acc) {
  if (n == 0) return acc;
  return sum(n - 1, acc + n);   // tail call
}
\`\`\`

A compiler *can* reuse the current stack frame for a tail call (**tail-call optimization**), turning the recursion into a loop and making it O(1) stack. **The JVM does not do this** — so even tail-recursive Java still grows the stack O(n) and can throw \`StackOverflowError\`.

:::gotcha
Because Java lacks TCO, deep *linear* recursion must be rewritten as an explicit loop or stack. Languages like Scala (\`@tailrec\`) or Kotlin optimize it; plain Java does not.
:::`,
  },
];

export default questions;
