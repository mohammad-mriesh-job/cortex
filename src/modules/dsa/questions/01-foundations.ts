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
];

export default questions;
