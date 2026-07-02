import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'dsa-bit-single-number',
    question: 'An array has every element twice except one. Find the unique element in O(1) space.',
    difficulty: 'Easy',
    category: 'Bit Manipulation',
    tags: ['bits', 'xor'],
    answer: `**XOR everything.** Because \`a ^ a = 0\` and \`a ^ 0 = a\`, every duplicated pair cancels and only the loner survives — O(n) time, O(1) space, no hash set.

\`\`\`java
int unique = 0;
for (int v : nums) unique ^= v;
return unique;
\`\`\``,
  },
  {
    id: 'dsa-bit-clear-lowest',
    question: 'What does `x & (x - 1)` do, and what is it used for?',
    difficulty: 'Medium',
    category: 'Bit Manipulation',
    tags: ['bits', 'kernighan'],
    answer: `It **clears the lowest set bit** of \`x\`. Subtracting 1 flips the lowest \`1\` to \`0\` and everything below it to \`1\`; ANDing with \`x\` erases that bit.

Repeating it counts set bits (**Brian Kernighan**) in one iteration per set bit:

\`\`\`java
int count = 0;
while (x != 0) { x &= (x - 1); count++; }
\`\`\`

:::tip
Related: \`x & -x\` *isolates* the lowest set bit, and \`x & (x-1)) == 0\` (for x > 0) tests a **power of two**.
:::`,
  },
  {
    id: 'dsa-bit-power-of-two',
    question: 'How do you test whether an integer is a power of two?',
    difficulty: 'Easy',
    category: 'Bit Manipulation',
    tags: ['bits', 'power-of-two'],
    answer: `A power of two has exactly one set bit, so clearing it gives zero:

\`\`\`java
boolean isPowerOfTwo(int n) { return n > 0 && (n & (n - 1)) == 0; }
\`\`\`

Guard \`n > 0\` first — the expression is also \`0\` for \`n == 0\`, which is not a power of two.`,
  },
  {
    id: 'dsa-bit-subsets-bitmask',
    question: 'How do you enumerate all subsets of an n-element set with bit manipulation?',
    difficulty: 'Medium',
    category: 'Bit Manipulation',
    tags: ['bits', 'subsets', 'bitmask'],
    answer: `There are \`2ⁿ\` subsets — one per integer in \`0 .. 2ⁿ-1\`. Bit \`i\` of the mask means "include element i".

\`\`\`java
for (int mask = 0; mask < (1 << n); mask++)
  for (int i = 0; i < n; i++)
    if ((mask >> i & 1) == 1) subset.add(nums[i]);
\`\`\`

This is also the basis of **bitmask DP**, viable when n ≤ ~20 (so 2ⁿ states stay affordable).`,
  },
  {
    id: 'dsa-intervals-meeting-rooms',
    question: 'Given meeting time intervals, find the minimum number of rooms needed.',
    difficulty: 'Medium',
    category: 'Arrays & Strings',
    tags: ['intervals', 'heap', 'sweep-line'],
    answer: `The answer is the **maximum number of meetings overlapping at any instant**. Sort by start and keep a **min-heap of end times**; before adding each meeting, pop those that already ended. The peak heap size is the answer.

\`\`\`java
Arrays.sort(mtg, (a, b) -> a[0] - b[0]);
PriorityQueue<Integer> ends = new PriorityQueue<>();
int rooms = 0;
for (int[] m : mtg) {
  while (!ends.isEmpty() && ends.peek() <= m[0]) ends.poll();
  ends.add(m[1]);
  rooms = Math.max(rooms, ends.size());
}
\`\`\`

O(n log n). A sorted-starts / sorted-ends two-pointer sweep is equivalent.`,
  },
  {
    id: 'dsa-intervals-merge-condition',
    question: 'After sorting intervals by start, how do you detect and merge an overlap?',
    difficulty: 'Easy',
    category: 'Arrays & Strings',
    tags: ['intervals', 'merge'],
    answer: `Once sorted by start, the next interval overlaps the current one iff **\`next.start <= cur.end\`**. Merge by extending the end:

\`\`\`java
if (cur[0] <= last[1]) last[1] = Math.max(last[1], cur[1]); // merge
else                   result.add(cur);                      // disjoint
\`\`\`

One O(n log n) sort plus one O(n) pass.`,
  },
  {
    id: 'dsa-string-kmp-lps',
    question: 'In KMP, what is the LPS (failure) array and why does it give O(n + m)?',
    difficulty: 'Hard',
    category: 'Arrays & Strings',
    tags: ['strings', 'kmp', 'pattern-matching'],
    answer: `\`lps[i]\` = the length of the **longest proper prefix of \`P[0..i]\` that is also a suffix**. On a mismatch at pattern index \`j\`, KMP falls back to \`j = lps[j-1]\` instead of restarting — so the **text pointer never moves backward**.

Because each text character is examined a constant number of times, matching is **O(n)**, and building the LPS is **O(m)** → O(n + m) total.

:::gotcha
The fallback is \`j = lps[j-1]\`, **not** \`j = 0\`. Resetting to 0 re-scans known-good characters and degrades to O(n·m).
:::`,
  },
  {
    id: 'dsa-string-rabin-karp',
    question: 'Why does Rabin-Karp compare characters after the hashes already match?',
    difficulty: 'Medium',
    category: 'Arrays & Strings',
    tags: ['strings', 'rabin-karp', 'rolling-hash'],
    answer: `Because hashing is **many-to-one**: two different substrings can share a hash value (a **collision**). A hash match is only a *candidate*, so you verify with a direct character comparison before reporting a match.

The rolling hash updates in O(1) per shift (drop the leading char, add the trailing one), giving **average O(n + m)**; adversarial collisions make the worst case O(n·m).`,
  },
  {
    id: 'dsa-fenwick-vs-prefix',
    question: 'When would you use a Fenwick tree or segment tree instead of a prefix-sum array?',
    difficulty: 'Medium',
    category: 'Trees',
    tags: ['fenwick', 'segment-tree', 'range-query'],
    answer: `When **updates and range queries interleave.** A prefix-sum array answers a range sum in O(1) but a single element update forces an O(n) rebuild.

- **Fenwick / BIT** — point update + prefix query in **O(log n)**, minimal code, for invertible ops (sum, xor).
- **Segment tree** — O(log n) for any associative merge (min/max/gcd) and, with **lazy propagation**, O(log n) range updates.

If the array is static (no updates), stick with the plain prefix-sum array.`,
  },
  {
    id: 'dsa-fenwick-lowbit',
    question: 'How does a Fenwick tree walk its structure in O(log n)?',
    difficulty: 'Hard',
    category: 'Trees',
    tags: ['fenwick', 'bits', 'range-query'],
    answer: `Each index \`i\` is responsible for a block whose size is its **lowest set bit**, \`i & -i\`. To update, climb by adding that low bit; to query a prefix, descend by subtracting it:

\`\`\`java
void update(int i, int d) { for (; i <= n; i += i & -i) bit[i] += d; }
int  prefix(int i) { int s = 0; for (; i > 0; i -= i & -i) s += bit[i]; return s; }
\`\`\`

Each loop runs once per set bit of \`i\` → **O(log n)**. A range sum is \`prefix(r) - prefix(l-1)\`.`,
  },
  {
    id: 'dsa-mst-cut-property',
    question: 'Why are the greedy MST algorithms (Kruskal, Prim) correct?',
    difficulty: 'Medium',
    category: 'Graphs',
    tags: ['mst', 'greedy', 'cut-property'],
    answer: `The **cut property**: for any partition of the vertices into two sets, the **minimum-weight edge crossing that cut belongs to some MST.** That guarantees the greedy choice — always take the smallest safe edge — is never a mistake.

Kruskal applies it by scanning globally-sorted edges (skipping cycles via union-find); Prim applies it by always pulling the cheapest edge leaving the growing tree.`,
  },
  {
    id: 'dsa-mst-kruskal-vs-prim',
    question: 'Kruskal vs Prim — how do you choose?',
    difficulty: 'Medium',
    category: 'Graphs',
    tags: ['mst', 'kruskal', 'prim'],
    answer: `Both find an MST; they differ in structure and input shape:

| | Kruskal | Prim |
|--|--|--|
| Mechanism | sort edges + union-find | grow a tree with a min-heap |
| Input | edge list | adjacency list |
| Best on | **sparse** graphs | **dense** graphs |
| Time | O(E log E) | O(E log V) |

Kruskal is natural when edges are easy to sort; Prim shines when the graph is dense and given as adjacency lists.`,
  },
  {
    id: 'dsa-math-euclid',
    question: 'What is the time complexity of Euclid’s GCD, and how do you compute LCM safely?',
    difficulty: 'Easy',
    category: 'Math',
    tags: ['math', 'gcd', 'lcm'],
    answer: `\`gcd(a, b) = gcd(b, a % b)\` shrinks the pair geometrically → **O(log min(a, b))**, not O(n).

Compute LCM as \`a / gcd(a, b) * b\` — **divide first** to avoid \`a * b\` overflowing, and use \`long\`.

\`\`\`java
long lcm(long a, long b) { return a / gcd(a, b) * b; }
\`\`\``,
  },
  {
    id: 'dsa-math-modular-inverse',
    question: 'How do you compute `a / b (mod p)` when p is prime?',
    difficulty: 'Hard',
    category: 'Math',
    tags: ['math', 'modular-arithmetic', 'fermat'],
    answer: `You cannot divide directly under a modulus — multiply by the **modular inverse** \`b⁻¹\`. For a **prime** \`p\`, **Fermat's little theorem** gives \`b⁻¹ ≡ b^(p-2) (mod p)\`, computed with fast exponentiation:

\`\`\`java
long inverse(long b) { return power(b, MOD - 2, MOD); } // O(log p)
long divide(long a, long b) { return a * inverse(b) % MOD; }
\`\`\`

For a **composite** modulus, use the extended Euclidean algorithm instead (it needs \`gcd(b, m) = 1\`).`,
  },
  {
    id: 'dsa-math-fast-power',
    question: 'How do you compute bᵉ mod m efficiently?',
    difficulty: 'Medium',
    category: 'Math',
    tags: ['math', 'fast-exponentiation'],
    answer: `**Binary (square-and-multiply) exponentiation** — O(log e). Read the exponent's bits: square the base each step, and fold it into the result when the current bit is 1.

\`\`\`java
long power(long base, long e, long mod) {
  long r = 1; base %= mod;
  while (e > 0) {
    if ((e & 1) == 1) r = r * base % mod;
    base = base * base % mod;
    e >>= 1;
  }
  return r;
}
\`\`\`

Reducing mod at each multiply keeps everything inside a \`long\`.`,
  },
];

export default questions;
