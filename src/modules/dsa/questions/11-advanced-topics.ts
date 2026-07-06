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
  {
    id: 'dsa-bit-set-clear-toggle',
    question: 'How do you test, set, clear, and toggle the i-th bit of an integer?',
    difficulty: 'Easy',
    category: 'Bit Manipulation',
    tags: ['bits', 'masking', 'fundamentals'],
    answer: `Each is a one-liner using a **mask** \`1 << i\`:

\`\`\`java
boolean test = (n >> i & 1) == 1;   // read the i-th bit
int set    = n |  (1 << i);          // force it to 1
int clear  = n & ~(1 << i);          // force it to 0
int toggle = n ^  (1 << i);          // flip it
\`\`\`

The logic behind each: **OR** with a 1 forces a 1; **AND** with a 0 (from \`~mask\`) forces a 0; **XOR** with a 1 flips; and shifting the bit down then \`& 1\` isolates it.

:::tip
These four are the vocabulary of bitmask problems — subset enumeration, DP over states, permission flags. Memorize them cold; interviewers expect them instantly.
:::`,
  },
  {
    id: 'dsa-bit-missing-number',
    question: 'An array holds n distinct numbers from 0..n with one missing. Find it in O(1) space.',
    difficulty: 'Easy',
    category: 'Bit Manipulation',
    tags: ['bits', 'xor', 'missing'],
    answer: `**XOR** every index \`0..n\` with every value. Each present number cancels with its index; the leftover is the missing number — because \`a ^ a = 0\`.

\`\`\`java
int missing = n;                       // start with the top index n
for (int i = 0; i < n; i++)
  missing ^= i ^ nums[i];              // cancel index with value
return missing;
\`\`\`

**O(n) time, O(1) space**, and — unlike the Gauss-sum method \`n(n+1)/2 − Σnums\` — it **cannot overflow**.

:::tip
XOR is the go-to for "find the odd one out" (single number, missing number, the one appearing an odd number of times). The self-canceling property makes hash sets and sums unnecessary.
:::`,
  },
  {
    id: 'dsa-bit-hamming-distance',
    question: 'How do you compute the Hamming distance between two integers?',
    difficulty: 'Easy',
    category: 'Bit Manipulation',
    tags: ['bits', 'xor', 'hamming'],
    answer: `The Hamming distance is the number of **differing bit positions** — exactly the count of set bits in \`x ^ y\` (XOR is 1 precisely where the bits differ).

\`\`\`java
int hamming(int x, int y) {
  return Integer.bitCount(x ^ y);   // popcount of the difference
}
// by hand with Brian Kernighan:
int d = x ^ y, count = 0;
while (d != 0) { d &= d - 1; count++; }   // clear lowest set bit each step
\`\`\`

**O(number of set bits)** with Kernighan's trick — each iteration removes one 1-bit, so it loops only as many times as there are differences.

:::note
\`Integer.bitCount\` compiles to a single hardware **POPCNT** instruction on modern CPUs, so prefer it in production; the manual loop is what you'd write to show the mechanism.
:::`,
  },
  {
    id: 'dsa-bit-twos-complement',
    question: 'How are negative integers represented in two\'s complement, and why is it used?',
    difficulty: 'Medium',
    category: 'Bit Manipulation',
    tags: ['bits', 'twos-complement', 'representation'],
    answer: `In **two's complement**, a negative number \`-x\` is stored as \`~x + 1\` (invert all bits, add one). The top bit is the **sign bit**. For 8-bit: \`-1\` is \`11111111\`, \`-128\` is \`10000000\`.

**Why it wins** over sign-magnitude:
- **One representation of zero** (no \`+0\`/\`-0\`).
- **Addition/subtraction use the same circuitry** — \`a - b\` is just \`a + (~b + 1)\`, no special-casing signs.
- The range is asymmetric: \`[-2ⁿ⁻¹, 2ⁿ⁻¹ − 1]\` — one more negative than positive.

:::gotcha
That asymmetry causes classic overflow bugs: \`Math.abs(Integer.MIN_VALUE)\` is still negative (\`-2³¹\` has no positive counterpart), and \`-Integer.MIN_VALUE\` overflows back to itself. Also note Java's \`>>\` is **arithmetic** (sign-extending) while \`>>>\` is **logical** (zero-fill).
:::`,
  },
  {
    id: 'dsa-bit-reverse-bits',
    question: 'How do you reverse the bits of a 32-bit unsigned integer?',
    difficulty: 'Medium',
    category: 'Bit Manipulation',
    tags: ['bits', 'reverse', 'shifting'],
    answer: `Pull bits off the **bottom** of the input and push them onto the **bottom** of a result you keep shifting left — after 32 steps the order is reversed.

\`\`\`java
int reverseBits(int n) {
  int result = 0;
  for (int i = 0; i < 32; i++) {
    result = (result << 1) | (n & 1);  // append n's lowest bit
    n >>>= 1;                           // logical shift: pull next bit down
  }
  return result;
}
\`\`\`

**O(32) = O(1).** Use the **unsigned** shift \`>>>\` so the sign bit doesn't smear 1s into the high positions.

:::senior
If \`reverseBits\` is called many times, a **byte-lookup table** (reverse each of the 4 bytes and reassemble) or **divide-and-conquer bit swaps** (swap adjacent bits, then pairs, then nibbles…) reverses in O(log 32) mask operations instead of 32 iterations.
:::`,
  },
  {
    id: 'dsa-bit-count-bits-range',
    question: 'Count the number of set bits for every integer from 0 to n.',
    difficulty: 'Medium',
    category: 'Bit Manipulation',
    tags: ['bits', 'dynamic-programming', 'popcount'],
    answer: `Calling \`bitCount\` on each is O(n log n). A **DP** using the relation \`bits(i) = bits(i >> 1) + (i & 1)\` does it in **O(n)**: a number has the same bits as itself shifted right, plus its lowest bit.

\`\`\`java
int[] bits = new int[n + 1];
for (int i = 1; i <= n; i++)
  bits[i] = bits[i >> 1] + (i & 1);   // reuse the already-computed half
return bits;
\`\`\`

Because \`i >> 1 < i\`, the dependency is always already computed. **O(n) time, O(n) space.**

:::note
An alternative recurrence is \`bits[i] = bits[i & (i-1)] + 1\` — "one more than the number with its lowest set bit removed." Both exploit an already-solved smaller subproblem, the hallmark of DP.
:::`,
  },
  {
    id: 'dsa-bit-gray-code',
    question: 'What is Gray code and how do you generate it?',
    difficulty: 'Medium',
    category: 'Bit Manipulation',
    tags: ['bits', 'gray-code', 'sequence'],
    answer: `**Gray code** is an ordering of \`0..2ⁿ−1\` where **consecutive values differ by exactly one bit**. The i-th Gray code has a beautiful closed form:

\`\`\`java
int gray(int i) { return i ^ (i >> 1); }    // binary → Gray
// generate the whole sequence
for (int i = 0; i < (1 << n); i++) result.add(i ^ (i >> 1));
\`\`\`

For n=2 it yields \`00, 01, 11, 10\` — each step flips one bit, and the sequence is cyclic (last differs from first by one bit too).

:::senior
The single-bit-change property matters in hardware: it prevents **glitches** when reading a value mid-transition (rotary encoders, ADCs, Karnaugh maps), because only one line changes at a time. Converting Gray back to binary is a prefix-XOR: \`b = g; while (g >>= 1) b ^= g;\`.
:::`,
  },
  {
    id: 'dsa-bit-single-number-ii',
    question: 'Every element appears three times except one. Find the single element in O(1) space.',
    difficulty: 'Hard',
    category: 'Bit Manipulation',
    tags: ['bits', 'xor', 'bit-counting'],
    answer: `Plain XOR fails (triples don't cancel). Instead reason **per bit**: for each of the 32 bit positions, the count of 1s across all numbers is a multiple of 3, **plus** the unique number's bit. So \`count % 3\` reconstructs the answer bit by bit.

\`\`\`java
int result = 0;
for (int b = 0; b < 32; b++) {
  int sum = 0;
  for (int x : nums) sum += (x >> b) & 1;
  if (sum % 3 != 0) result |= (1 << b);   // this bit belongs to the loner
}
return result;
\`\`\`

**O(32n) = O(n) time, O(1) space.**

:::senior
The elegant O(n) single-pass version uses two bitmask "counters" \`ones\` and \`twos\` that track bits seen once and twice mod 3 — a finite-state machine over the two accumulators. The per-bit counting version is easier to derive under pressure and generalizes to "appears k times."
:::`,
  },
  {
    id: 'dsa-bit-single-number-iii',
    question: 'Exactly two elements appear once and the rest appear twice. Find both.',
    difficulty: 'Hard',
    category: 'Bit Manipulation',
    tags: ['bits', 'xor', 'partition'],
    answer: `XOR everything → \`x ^ y\` (the two loners; pairs cancel). Since \`x ≠ y\`, that XOR has at least one set bit — pick any (\`diff & -diff\` isolates the lowest). That bit **differs** between \`x\` and \`y\`, so it **partitions** all numbers into two groups, each with one loner.

\`\`\`java
int xor = 0;
for (int v : nums) xor ^= v;              // xor = x ^ y
int bit = xor & -xor;                     // a bit where x and y differ
int a = 0, b = 0;
for (int v : nums)
  if ((v & bit) != 0) a ^= v;             // group 1 → one unique
  else                b ^= v;             // group 0 → the other
return new int[]{a, b};
\`\`\`

Within each group every duplicate cancels, leaving one unique. **O(n) time, O(1) space.**

:::senior
The trick is turning "two unknowns" into "two independent single-number problems" via a **distinguishing bit**. \`diff & -diff\` isolating the lowest set bit is the same lowbit operation Fenwick trees use.
:::`,
  },
  {
    id: 'dsa-math-palindrome-number',
    question: 'How do you check if an integer is a palindrome without converting it to a string?',
    difficulty: 'Easy',
    category: 'Math',
    tags: ['math', 'palindrome', 'digits'],
    answer: `Reverse only the **second half** of the number and compare it to the first half — this avoids overflow from reversing the whole value.

\`\`\`java
boolean isPalindrome(int x) {
  if (x < 0 || (x % 10 == 0 && x != 0)) return false;  // negatives, trailing 0
  int rev = 0;
  while (x > rev) {           // stop at the midpoint
    rev = rev * 10 + x % 10;  // build reversed second half
    x /= 10;
  }
  return x == rev || x == rev / 10;   // even length vs odd length
}
\`\`\`

**O(log₁₀ x) time, O(1) space.** The loop halts when \`x <= rev\` (the halves meet); for odd length, \`rev\`'s extra middle digit is dropped with \`rev / 10\`.

:::gotcha
**Negatives are never palindromes** (the \`-\` sign), and any nonzero number ending in \`0\` can't be one (no leading zero to mirror). Handle both up front.
:::`,
  },
  {
    id: 'dsa-math-happy-number',
    question: 'How do you determine whether a number is "happy"?',
    difficulty: 'Easy',
    category: 'Math',
    tags: ['math', 'cycle-detection', 'digits'],
    answer: `Repeatedly replace \`n\` with the **sum of the squares of its digits**; \`n\` is happy if this reaches 1. Unhappy numbers fall into a **cycle**, so detect it with Floyd's fast/slow pointers (or a seen-set).

\`\`\`java
int next(int n) {
  int s = 0;
  while (n > 0) { int d = n % 10; s += d * d; n /= 10; }
  return s;
}
boolean isHappy(int n) {
  int slow = n, fast = next(n);
  while (fast != 1 && slow != fast) { slow = next(slow); fast = next(next(fast)); }
  return fast == 1;
}
\`\`\`

The insight: the digit-square process is a **linked-list-like sequence** that either hits 1 or loops — the same cycle-detection problem as Floyd's algorithm on a list, in **O(1) space**.

:::tip
Recognizing a hidden **cycle** (any repeated deterministic transformation) lets you reuse Floyd's tortoise-and-hare instead of a hash set — a neat cross-over of a "math" problem into a pointer technique.
:::`,
  },
  {
    id: 'dsa-math-sieve',
    question: 'How does the Sieve of Eratosthenes find all primes up to n?',
    difficulty: 'Medium',
    category: 'Math',
    tags: ['math', 'primes', 'sieve'],
    answer: `Mark composites by crossing out **multiples of each prime**. Whatever stays unmarked is prime.

\`\`\`java
boolean[] composite = new boolean[n + 1];
for (int i = 2; (long) i * i <= n; i++)
  if (!composite[i])
    for (int j = i * i; j <= n; j += i)   // start at i*i
      composite[j] = true;
// primes = indices 2..n where !composite[i]
\`\`\`

**O(n log log n) time, O(n) space** — nearly linear.

:::gotcha
Two optimizations that are also correctness insights: start the inner loop at **\`i*i\`** (smaller multiples like \`2i, 3i\` were already crossed by smaller primes), and stop the outer loop at **\`i*i ≤ n\`** (any composite ≤ n has a factor ≤ √n). Cast \`i*i\` to \`long\` to avoid overflow near \`n = 2³¹\`.
:::`,
  },
  {
    id: 'dsa-math-reverse-integer',
    question: 'How do you reverse the digits of a 32-bit integer and handle overflow?',
    difficulty: 'Medium',
    category: 'Math',
    tags: ['math', 'overflow', 'digits'],
    answer: `Pop digits with \`% 10\` and push them onto a reversed result — but **check for overflow before each push**, since the reversed value can exceed the 32-bit range.

\`\`\`java
int reverse(int x) {
  int rev = 0;
  while (x != 0) {
    int digit = x % 10;                 // works for negatives in Java
    x /= 10;
    if (rev > Integer.MAX_VALUE / 10 || rev < Integer.MIN_VALUE / 10)
      return 0;                          // next *10 would overflow
    rev = rev * 10 + digit;
  }
  return rev;
}
\`\`\`

**O(log₁₀ x).** Java's \`%\` and \`/\` keep the sign, so negatives fall out naturally.

:::senior
Checking overflow **before** \`rev * 10 + digit\` — rather than reversing into a \`long\` and comparing after — is the version that works even in languages with no wider type. It's the same pre-emptive overflow guard as \`mid = lo + (hi-lo)/2\`.
:::`,
  },
  {
    id: 'dsa-math-trailing-zeroes',
    question: 'How many trailing zeroes does n! have?',
    difficulty: 'Medium',
    category: 'Math',
    tags: ['math', 'factorial', 'factors'],
    answer: `A trailing zero comes from a factor of **10 = 2 × 5**. In \`n!\` there are always more 2s than 5s, so the answer is just the **count of factor 5s**.

\`\`\`java
int trailingZeroes(int n) {
  int count = 0;
  for (long p = 5; p <= n; p *= 5)   // 5, 25, 125, ...
    count += n / p;
  return count;
}
\`\`\`

Each multiple of 5 contributes one 5, each multiple of 25 an *extra* 5, and so on — hence \`n/5 + n/25 + n/125 + …\`. **O(log₅ n)** time.

:::senior
Never compute \`n!\` itself — it overflows almost immediately (21! exceeds \`long\`). Reducing "count trailing zeroes" to "count powers of 5" is the whole insight; brute-forcing the factorial is the trap answer.
:::`,
  },
  {
    id: 'dsa-math-pow-xn',
    question: 'How do you implement pow(x, n) efficiently, including negative exponents?',
    difficulty: 'Medium',
    category: 'Math',
    tags: ['math', 'fast-exponentiation', 'recursion'],
    answer: `**Binary exponentiation**: square the base and halve the exponent, folding in the base when the current exponent bit is 1 — **O(log n)** instead of O(n) multiplications.

\`\`\`java
double myPow(double x, int n) {
  long e = n;                    // widen first — see gotcha
  if (e < 0) { x = 1 / x; e = -e; }
  double result = 1;
  while (e > 0) {
    if ((e & 1) == 1) result *= x;  // this bit set → multiply in
    x *= x;                          // square the base
    e >>= 1;
  }
  return result;
}
\`\`\`

Each squaring covers a power of two, so \`x^13 = x^8 · x^4 · x^1\` follows the set bits of 13.

:::gotcha
Copy \`n\` into a **\`long\`** before negating. \`Integer.MIN_VALUE\` (\`-2³¹\`) has no positive \`int\` counterpart, so \`-n\` overflows and stays negative — a notorious edge case in this exact problem.
:::`,
  },
  {
    id: 'dsa-math-overflow-safe',
    question: 'What are the common integer-overflow traps and how do you avoid them?',
    difficulty: 'Medium',
    category: 'Math',
    tags: ['math', 'overflow', 'safety'],
    answer: `Overflow is silent in Java (wraps around), so guard the classic spots:

| Trap | Safe form |
|--|--|
| \`(lo + hi) / 2\` | \`lo + (hi - lo) / 2\` |
| \`a + b\` near limits | \`(long) a + b\`, or \`Math.addExact\` |
| \`a * b\` | cast to \`long\` first, or \`Math.multiplyExact\` |
| \`Math.abs(Integer.MIN_VALUE)\` | still negative — use \`long\` |
| Sum of an array | accumulate in a \`long\` |

\`\`\`java
int mid = lo + (hi - lo) / 2;           // no overflow
long total = 0; for (int x : a) total += x;   // wide accumulator
int safe = Math.addExact(a, b);          // throws on overflow
\`\`\`

:::senior
\`Math.addExact\` / \`multiplyExact\` **throw** \`ArithmeticException\` instead of wrapping silently — useful when a wrong-but-quiet result is worse than a crash. Mentioning them shows you know the JDK's overflow-detecting APIs, not just the \`lo + (hi-lo)/2\` idiom.
:::`,
  },
  {
    id: 'dsa-math-fisher-yates',
    question: 'How do you shuffle an array uniformly at random (Fisher-Yates)?',
    difficulty: 'Medium',
    category: 'Math',
    tags: ['math', 'shuffle', 'randomness'],
    answer: `Walk from the **last** index to the first; at each \`i\`, swap \`a[i]\` with a random index in \`[0, i]\`. This produces every one of the \`n!\` permutations with **equal probability**.

\`\`\`java
Random rnd = new Random();
for (int i = n - 1; i > 0; i--) {
  int j = rnd.nextInt(i + 1);   // uniform in [0, i]
  int t = a[i]; a[i] = a[j]; a[j] = t;
}
\`\`\`

**O(n) time, O(1) space.** Each element lands in each position with probability exactly \`1/n\`.

:::gotcha
The random index range must be **[0, i]** (inclusive of \`i\`). The naive "swap with any random index in [0, n)" bug produces \`nⁿ\` equally likely outcomes, which don't divide evenly into \`n!\` permutations — so some orderings become **more likely** than others. Correct range is the whole point.
:::`,
  },
  {
    id: 'dsa-math-reservoir-sampling',
    question: 'How do you pick k random items from a stream of unknown length?',
    difficulty: 'Hard',
    category: 'Math',
    tags: ['math', 'sampling', 'streaming'],
    answer: `**Reservoir sampling.** Keep the first \`k\` items; for the \`i\`-th item (\`i > k\`), keep it with probability \`k/i\`, replacing a random reservoir slot. Every item ends up selected with equal probability \`k/n\` — **without knowing \`n\` in advance**.

\`\`\`java
int[] reservoir = new int[k];
for (int i = 0; i < k; i++) reservoir[i] = stream[i]; // fill
for (int i = k; i < stream.length; i++) {
  int j = rnd.nextInt(i + 1);        // 0..i
  if (j < k) reservoir[j] = stream[i]; // keep with prob k/(i+1)
}
\`\`\`

**O(n) time, O(k) space**, single pass. For \`k = 1\`: keep item \`i\` with probability \`1/i\`.

:::senior
The correctness is an induction: by the time you've seen \`i\` items, each is in the reservoir with probability \`k/i\`, and the replacement rule preserves that invariant for \`i+1\`. This is the canonical answer to "**sample from a stream / huge file that doesn't fit in memory**."
:::`,
  },
];

export default questions;
