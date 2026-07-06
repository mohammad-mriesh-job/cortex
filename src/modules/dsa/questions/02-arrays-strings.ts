import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'dsa-arr-random-access',
    question: 'Why is accessing `a[i]` in an array an O(1) operation?',
    difficulty: 'Easy',
    category: 'Arrays & Strings',
    tags: ['arrays', 'memory', 'complexity'],
    answer: `Array elements are stored **contiguously** and are all the same size, so the address of any element is pure arithmetic:

\`\`\`text
address(a[i]) = base + i * elementSize
\`\`\`

No scanning or pointer-chasing is needed — one multiply-and-add jumps straight to the element, which is O(1).

:::note
Contiguity also makes arrays **cache-friendly**: reading one element pulls neighbors into the CPU cache, so linear scans are very fast in practice.
:::`,
  },
  {
    id: 'dsa-arr-amortized-append',
    question: 'A dynamic array (ArrayList) doubles capacity when full. Explain why appending is O(1) *amortized* even though a resize copies all n elements.',
    difficulty: 'Medium',
    category: 'Arrays & Strings',
    tags: ['dynamic array', 'amortized', 'complexity'],
    answer: `A single append that triggers a resize is O(n) — it allocates a bigger block and copies everything. But resizes are **rare and grow rarer** because capacity **doubles**.

To reach size *n*, the total elements copied across all resizes is:

\`\`\`text
1 + 2 + 4 + ... + n  <  2n
\`\`\`

Spread that \`< 2n\` total work over *n* appends and each pays roughly **2 copies on average** — a constant. Hence **O(1) amortized**.

:::key
Doubling (multiplicative growth) is essential. Growing by a fixed amount (+1, +10) would make total copies O(n²), and append would no longer be amortized O(1).
:::

:::gotcha
Amortized ≠ per-call guarantee. Any individual append can still spike to O(n). In latency-sensitive code, pre-size with \`new ArrayList<>(expectedSize)\`.
:::`,
  },
  {
    id: 'dsa-arr-insert-front',
    question: 'What is the time complexity of inserting an element at the front of an array of size n, and why?',
    difficulty: 'Easy',
    category: 'Arrays & Strings',
    tags: ['arrays', 'insertion', 'complexity'],
    answer: `**O(n).** Because elements are contiguous and index order must be preserved, inserting at the front (or any middle position) forces **every following element to shift one slot to the right** before the new value can be placed.

Only appending at the *end* is cheap (amortized O(1)). If you frequently insert/remove at the front, use a **deque** (\`ArrayDeque\`) or a **linked list** instead.`,
  },
  {
    id: 'dsa-arr-two-sum-sorted',
    question: 'Given a **sorted** array, find two numbers that sum to a target. Give the optimal approach and its complexity.',
    difficulty: 'Easy',
    category: 'Arrays & Strings',
    tags: ['two pointers', 'sorted', 'search'],
    answer: `Use **two pointers** from opposite ends:

\`\`\`java
int l = 0, r = n - 1;
while (l < r) {
    int sum = a[l] + a[r];
    if (sum == target) return new int[]{l, r};
    if (sum < target) l++;   // need bigger → move left pointer up
    else r--;                // need smaller → move right pointer down
}
\`\`\`

Each pointer moves at most n steps, so this is **O(n) time, O(1) space** — beating the O(n²) brute force.

The sortedness is what makes it work: moving \`l\` right always increases the sum and \`r\` left always decreases it (monotonic). On an **unsorted** array, use a **hash set** instead (O(n) time, O(n) space).`,
  },
  {
    id: 'dsa-arr-fixed-window',
    question: 'Find the maximum sum of any contiguous subarray of size k. How do you avoid recomputing each window?',
    difficulty: 'Easy',
    category: 'Arrays & Strings',
    tags: ['sliding window', 'subarray', 'complexity'],
    answer: `Use a **fixed sliding window**. Compute the first window's sum, then slide: **add the entering element, subtract the leaving one** — an O(1) update per step.

\`\`\`java
int sum = 0;
for (int i = 0; i < k; i++) sum += a[i];
int best = sum;
for (int r = k; r < n; r++) {
    sum += a[r] - a[r - k];   // enter right, drop left
    best = Math.max(best, sum);
}
return best;
\`\`\`

Recomputing each window from scratch is O(n·k). Reusing the running sum makes it **O(n)** time, O(1) space.`,
  },
  {
    id: 'dsa-arr-longest-unique-substring',
    question: 'Find the length of the longest substring without repeating characters. What technique, and why is it O(n) despite the inner loop?',
    difficulty: 'Medium',
    category: 'Arrays & Strings',
    tags: ['sliding window', 'strings', 'hashing'],
    answer: `Use a **variable sliding window** with a set/map of characters currently inside. Expand \`R\`; when a duplicate appears, shrink from \`L\` until the window is valid again.

\`\`\`java
Set<Character> win = new HashSet<>();
int L = 0, best = 0;
for (int R = 0; R < s.length(); R++) {
    while (win.contains(s.charAt(R)))
        win.remove(s.charAt(L++));   // shrink past the duplicate
    win.add(s.charAt(R));
    best = Math.max(best, R - L + 1);
}
return best;
\`\`\`

**Why O(n):** \`L\` only moves forward, at most n times total across the whole run. Each character is added once (by \`R\`) and removed at most once (by \`L\`). So it is **O(n)** time, O(min(n, alphabet)) space — not O(n²).`,
  },
  {
    id: 'dsa-arr-prefix-range-sum',
    question: 'You must answer many range-sum queries `sum(i..j)` on a static array. How do you make each query O(1)?',
    difficulty: 'Medium',
    category: 'Arrays & Strings',
    tags: ['prefix sum', 'range query', 'complexity'],
    answer: `Precompute a **prefix-sum array** where \`pre[k]\` = sum of the first k elements (with \`pre[0] = 0\`):

\`\`\`java
int[] pre = new int[n + 1];
for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
\`\`\`

Then any inclusive range sum is a single subtraction:

\`\`\`text
sum(i..j) = pre[j + 1] - pre[i]
\`\`\`

Build is **O(n)** once; each query is **O(1)**. Answering q queries goes from O(n·q) (naive) to **O(n + q)**, at O(n) extra space.`,
  },
  {
    id: 'dsa-arr-subarray-sum-k',
    question: 'Count the number of contiguous subarrays that sum to exactly k (array may contain negatives). Describe the O(n) approach.',
    difficulty: 'Hard',
    category: 'Arrays & Strings',
    tags: ['prefix sum', 'hashing', 'subarray'],
    answer: `Combine **prefix sums with a hash map of prefix counts**. A subarray \`a[i..j]\` sums to k when \`pre[j+1] - pre[i] = k\`, i.e. \`pre[i] = pre[j+1] - k\`. So while sweeping, ask the map how many earlier prefixes equal \`running - k\`.

\`\`\`java
Map<Integer, Integer> count = new HashMap<>();
count.put(0, 1);            // empty prefix — enables subarrays starting at index 0
int running = 0, answer = 0;
for (int x : a) {
    running += x;
    answer += count.getOrDefault(running - k, 0);
    count.merge(running, 1, Integer::sum);
}
return answer;
\`\`\`

**O(n)** time, O(n) space. This handles negatives (where a sliding window would fail).

:::gotcha
Seeding \`count.put(0, 1)\` before the loop is essential — it lets subarrays that start at index 0 be counted. Omitting it silently undercounts.
:::`,
  },
  {
    id: 'dsa-arr-anagram',
    question: 'How do you check whether two strings are anagrams? Compare a counting approach vs sorting.',
    difficulty: 'Easy',
    category: 'Arrays & Strings',
    tags: ['strings', 'frequency map', 'anagram'],
    answer: `Two strings are anagrams iff their character **frequency maps** match.

**Counting (optimal, O(n)):** for lowercase a–z, use an \`int[26]\`. Increment for one string, decrement for the other; all zeros ⇒ anagram.

\`\`\`java
boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    int[] freq = new int[26];
    for (int i = 0; i < s.length(); i++) {
        freq[s.charAt(i) - 'a']++;
        freq[t.charAt(i) - 'a']--;
    }
    for (int f : freq) if (f != 0) return false;
    return true;
}
\`\`\`

**Sorting (O(n log n)):** sort both char arrays and compare — simpler to write but slower.

Prefer counting: **O(n)** time, O(1) space for a fixed alphabet.`,
  },
  {
    id: 'dsa-arr-palindrome-check',
    question: 'How do you check if a string is a palindrome in O(1) extra space?',
    difficulty: 'Easy',
    category: 'Arrays & Strings',
    tags: ['strings', 'two pointers', 'palindrome'],
    answer: `Walk **two pointers** inward from both ends, comparing mirrored characters:

\`\`\`java
boolean isPalindrome(String s) {
    int L = 0, R = s.length() - 1;
    while (L < R) {
        if (s.charAt(L) != s.charAt(R)) return false;
        L++; R--;
    }
    return true;
}
\`\`\`

As soon as a mirrored pair differs, return false. Survive the loop and it is a palindrome. **O(n)** time, **O(1)** space — no reversed copy needed. The middle character (odd length) has no partner and is skipped naturally.`,
  },
  {
    id: 'dsa-arr-reverse-in-place',
    question: 'How do you reverse an array (or char array) in place, and why must a Java `String` be converted first?',
    difficulty: 'Easy',
    category: 'Arrays & Strings',
    tags: ['strings', 'two pointers', 'reversal'],
    answer: `Swap the two ends and move both pointers inward until they meet:

\`\`\`java
void reverse(char[] s) {
    int L = 0, R = s.length - 1;
    while (L < R) {
        char tmp = s[L]; s[L] = s[R]; s[R] = tmp;
        L++; R--;
    }
}
\`\`\`

**O(n)** time, **O(1)** space — only ⌊n/2⌋ swaps.

In Java, **\`String\` is immutable** — you cannot reassign its characters. Convert to \`char[]\` (or use a \`StringBuilder\`), mutate that, then build a new String. Repeatedly "modifying" a String in a loop instead creates a new object each time (O(n²)).`,
  },
  {
    id: 'dsa-arr-window-vs-prefix',
    question: 'When should you reach for a sliding window vs prefix sums? Give the deciding factor.',
    difficulty: 'Medium',
    category: 'Arrays & Strings',
    tags: ['sliding window', 'prefix sum', 'technique'],
    answer: `Both handle **contiguous subarray** problems in O(n), but they fit different shapes:

- **Sliding window** — best for "longest/shortest/max subarray satisfying a constraint" where the window can grow and shrink monotonically. It relies on the assumption that **shrinking always makes the window more valid**. This holds for all-positive sums or "no repeats" conditions.

- **Prefix sums (often + hash map)** — best when you need **arbitrary range sums** or must handle **negative numbers**, where the "shrink always helps" assumption breaks.

:::key
The deciding factor: if the array can contain **negatives** (so a window's sum isn't monotonic as it grows), sliding window fails — use prefix sums with a hash map instead. Example: "subarray sum equals k" with negatives is a prefix-sum problem, not a window one.
:::`,
  },
  {
    id: 'dsa-arr-kadane',
    question: 'Find the maximum sum of a contiguous subarray (the array can contain negatives).',
    difficulty: 'Medium',
    category: 'Arrays & Strings',
    tags: ['kadane', 'dynamic-programming', 'subarray'],
    answer: `**Brute force** checks every subarray in O(n²). **Kadane's algorithm** does it in **O(n)** with one insight: the best subarray ending at \`i\` either **extends** the best subarray ending at \`i-1\`, or **starts fresh** at \`i\`.

\`\`\`java
int best = a[0], cur = a[0];
for (int i = 1; i < n; i++) {
  cur = Math.max(a[i], cur + a[i]);  // extend or restart
  best = Math.max(best, cur);
}
return best;
\`\`\`

If the running sum \`cur\` ever goes negative it can only hurt what follows, so we drop it and restart. **O(n) time, O(1) space.**

:::gotcha
Initialize \`best\` to \`a[0]\` (or \`Integer.MIN_VALUE\`), **not 0** — an all-negative array like \`[-3,-1,-2]\` should return \`-1\`, and a 0-seed would wrongly return 0.
:::

The transferable pattern is a **1-D DP** where each state depends only on the previous — the essence of "best ending here."`,
  },
  {
    id: 'dsa-arr-best-time-stock',
    question: 'Given daily prices, find the maximum profit from one buy and one later sell.',
    difficulty: 'Easy',
    category: 'Arrays & Strings',
    tags: ['arrays', 'one-pass', 'greedy'],
    answer: `Track the **minimum price seen so far** and the **best profit** if you sold today. One pass:

\`\`\`java
int minPrice = Integer.MAX_VALUE, best = 0;
for (int p : prices) {
  minPrice = Math.min(minPrice, p);   // cheapest day to have bought
  best = Math.max(best, p - minPrice); // profit if selling today
}
return best;
\`\`\`

The brute force compares every buy/sell pair in O(n²); tracking the running minimum collapses it to **O(n) time, O(1) space**. The trick — carry the best "buy" as you scan so each "sell" is answered in O(1) — is the same idea behind Kadane.

:::note
Return 0 when prices only fall (never buy). This is the single-transaction case; the multi-transaction variant is a greedy sum of every upward step.
:::`,
  },
  {
    id: 'dsa-arr-move-zeroes',
    question: 'Move all zeroes in an array to the end while keeping the non-zero order, in-place.',
    difficulty: 'Easy',
    category: 'Arrays & Strings',
    tags: ['two pointers', 'in-place', 'partition'],
    answer: `Use a **slow write pointer** that marks where the next non-zero belongs. Scan with a fast pointer; every non-zero gets swapped/written forward, and zeroes fall to the back automatically.

\`\`\`java
int w = 0;                       // next slot for a non-zero
for (int r = 0; r < n; r++)
  if (a[r] != 0) {
    int t = a[w]; a[w] = a[r]; a[r] = t;   // swap keeps order
    w++;
  }
\`\`\`

**O(n) time, O(1) space**, order-preserving. This **read/write two-pointer** (a.k.a. slow-fast partition) is the same template as "remove duplicates from a sorted array" and "remove element" — one pointer reads, one compacts.`,
  },
  {
    id: 'dsa-arr-longest-common-prefix',
    question: 'Find the longest common prefix among an array of strings.',
    difficulty: 'Easy',
    category: 'Arrays & Strings',
    tags: ['strings', 'prefix', 'scan'],
    answer: `**Vertical scanning:** compare character position 0 across all strings, then position 1, and so on — stop at the first mismatch or when any string ends.

\`\`\`java
String lcp(String[] strs) {
  if (strs.length == 0) return "";
  for (int i = 0; i < strs[0].length(); i++) {
    char c = strs[0].charAt(i);
    for (String s : strs)
      if (i == s.length() || s.charAt(i) != c)
        return strs[0].substring(0, i);
  }
  return strs[0];
}
\`\`\`

**O(S)** where S is the total number of characters — you never scan past the shortest string or the first divergence. Edge cases to name: an **empty array** and an **empty string** in the set (LCP is "").`,
  },
  {
    id: 'dsa-arr-container-most-water',
    question: 'Given heights, find two lines that with the x-axis hold the most water.',
    difficulty: 'Medium',
    category: 'Arrays & Strings',
    tags: ['two pointers', 'greedy', 'optimization'],
    answer: `Area between lines \`l\` and \`r\` is \`min(h[l], h[r]) · (r - l)\`. **Brute force** tries all pairs in O(n²). The **two-pointer** method starts wide and moves inward in **O(n)**:

\`\`\`java
int l = 0, r = n - 1, best = 0;
while (l < r) {
  best = Math.max(best, Math.min(h[l], h[r]) * (r - l));
  if (h[l] < h[r]) l++;   // move the SHORTER line inward
  else             r--;
}
\`\`\`

**Why move the shorter line?** The area is capped by the shorter line, and the width only shrinks — so keeping the shorter line can never improve the area, but replacing it might. Moving the taller one is provably wasted.

:::senior
The transferable idea: a **greedy two-pointer** where you can prove which pointer to advance because moving the other cannot beat the current best.
:::`,
  },
  {
    id: 'dsa-arr-3sum',
    question: 'Find all unique triplets in an array that sum to zero.',
    difficulty: 'Medium',
    category: 'Arrays & Strings',
    tags: ['two pointers', 'sorting', '3sum'],
    answer: `**Sort**, then for each index \`i\` run a **two-pointer** search for pairs summing to \`-a[i]\` in the rest of the array. Brute force is O(n³); this is **O(n²)**.

\`\`\`java
Arrays.sort(a);
for (int i = 0; i < n - 2; i++) {
  if (i > 0 && a[i] == a[i-1]) continue;      // skip dup anchors
  int l = i + 1, r = n - 1;
  while (l < r) {
    int s = a[i] + a[l] + a[r];
    if (s == 0) {
      res.add(List.of(a[i], a[l], a[r]));
      while (l < r && a[l] == a[l+1]) l++;      // skip dup pairs
      while (l < r && a[r] == a[r-1]) r--;
      l++; r--;
    } else if (s < 0) l++; else r--;
  }
}
\`\`\`

:::gotcha
The hard part is **deduplication**: skip equal values for the anchor \`i\` *and* after recording a hit. Sorting is what enables both the two-pointer sweep and the dedup.
:::`,
  },
  {
    id: 'dsa-arr-majority-element',
    question: 'Find the element that appears more than n/2 times, in O(1) space.',
    difficulty: 'Medium',
    category: 'Arrays & Strings',
    tags: ['boyer-moore', 'voting', 'in-place'],
    answer: `A hash-map count is O(n) time but O(n) space. **Boyer-Moore voting** does it in **O(n) time, O(1) space**: keep a candidate and a counter; matching votes increment it, differing votes cancel it out.

\`\`\`java
int cand = 0, count = 0;
for (int x : a) {
  if (count == 0) cand = x;        // adopt a new candidate
  count += (x == cand) ? 1 : -1;   // vote for or against
}
return cand;   // guaranteed correct IF a majority exists
\`\`\`

**Why it works:** a true majority (> n/2) survives every pairwise cancellation because there are more of it than everything else combined.

:::gotcha
The invariant only holds when a majority is **guaranteed**. If it might not exist, add a **second pass** to verify \`cand\` actually occurs > n/2 times.
:::`,
  },
  {
    id: 'dsa-arr-rotate-array',
    question: 'Rotate an array to the right by k steps, in-place with O(1) extra space.',
    difficulty: 'Medium',
    category: 'Arrays & Strings',
    tags: ['arrays', 'reversal', 'in-place'],
    answer: `The elegant trick is **three reversals**. Rotating right by \`k\` means the last \`k\` elements move to the front — which is exactly what "reverse all, then reverse each part" produces:

\`\`\`java
k %= n;                       // k can exceed n
reverse(a, 0, n - 1);         // reverse the whole array
reverse(a, 0, k - 1);         // reverse the first k
reverse(a, k, n - 1);         // reverse the rest
\`\`\`

For \`[1,2,3,4,5]\`, k=2: reverse-all → \`[5,4,3,2,1]\`, then fix each block → \`[4,5,1,2,3]\`. **O(n) time, O(1) space.**

:::gotcha
Always take \`k %= n\` first — if \`k ≥ n\` the raw index math overflows the bounds and a rotation by \`n\` is a no-op, not a crash you want.
:::`,
  },
  {
    id: 'dsa-arr-merge-sorted-inplace',
    question: 'Merge two sorted arrays into the first (which has trailing space) in-place.',
    difficulty: 'Medium',
    category: 'Arrays & Strings',
    tags: ['two pointers', 'merge', 'in-place'],
    answer: `Merging from the **front** would overwrite unread elements of \`a\`. The trick is to fill from the **back**, placing the largest remaining element into the last free slot:

\`\`\`java
int i = m - 1, j = n - 1, w = m + n - 1;  // write at the end
while (j >= 0) {
  if (i >= 0 && a[i] > b[j]) a[w--] = a[i--];
  else                      a[w--] = b[j--];
}
\`\`\`

Writing back-to-front guarantees the write pointer \`w\` is always **ahead of** the read pointer \`i\`, so nothing unread is clobbered. **O(m + n) time, O(1) space.**

:::tip
The loop can stop when \`j < 0\` — any leftover \`a\` elements are already in place. This "fill from the back to avoid overwrites" idea recurs in in-place array shifts.
:::`,
  },
  {
    id: 'dsa-arr-product-except-self',
    question: 'Return an array where each element is the product of all others, without division.',
    difficulty: 'Hard',
    category: 'Arrays & Strings',
    tags: ['prefix', 'suffix', 'arrays'],
    answer: `Division would be O(n) but breaks on zeros. Instead multiply a **prefix product** (everything to the left) by a **suffix product** (everything to the right):

\`\`\`java
int[] res = new int[n];
res[0] = 1;
for (int i = 1; i < n; i++) res[i] = res[i-1] * a[i-1];  // prefixes
int suffix = 1;
for (int i = n - 1; i >= 0; i--) {
  res[i] *= suffix;        // combine with running suffix
  suffix *= a[i];
}
\`\`\`

The first pass fills \`res[i]\` with the product of everything **left** of \`i\`; the second multiplies in everything **right** of \`i\` using a rolling variable. **O(n) time, O(1) extra space** (output array excluded).

:::senior
Handling zeros for free is the payoff of avoiding division — one zero makes every other product 0 and two zeros make all products 0, and the prefix/suffix method gets both cases right automatically.
:::`,
  },
  {
    id: 'dsa-arr-dutch-flag',
    question: 'Sort an array of 0s, 1s, and 2s in a single pass (the Dutch National Flag problem).',
    difficulty: 'Hard',
    category: 'Arrays & Strings',
    tags: ['three pointers', 'partition', 'invariant'],
    answer: `Counting sort needs two passes. Dijkstra's **three-pointer** partition does it in **one pass, O(1) space**. Keep \`low\`, \`mid\`, \`high\` regions: \`[0, low)\` are 0s, \`[low, mid)\` are 1s, \`(high, n)\` are 2s, and \`[mid, high]\` is unexplored.

\`\`\`java
int low = 0, mid = 0, high = n - 1;
while (mid <= high) {
  if (a[mid] == 0)      { swap(a, low++, mid++); }
  else if (a[mid] == 1) { mid++; }
  else                  { swap(a, mid, high--); } // do NOT mid++
}
\`\`\`

:::gotcha
On a **2**, swap it to the back but **don't advance \`mid\`** — the element you just pulled from \`high\` is unexamined. On a **0**, advancing both \`low\` and \`mid\` is safe because whatever came from \`low\` is already known to be a 1.
:::

The transferable idea: **three-way partitioning**, which also fixes quicksort's all-equal-elements degradation.`,
  },
  {
    id: 'dsa-arr-min-window-substring',
    question: 'Find the smallest substring of s that contains all characters of t (with multiplicity).',
    difficulty: 'Hard',
    category: 'Arrays & Strings',
    tags: ['sliding window', 'hashing', 'strings'],
    answer: `A **variable sliding window** with a character-need count. **Expand** \`right\` until the window is valid (covers all of \`t\`), then **contract** \`left\` as far as possible while staying valid, recording the smallest such window.

\`\`\`java
int[] need = new int[128];
for (char c : t.toCharArray()) need[c]++;
int missing = t.length(), l = 0, start = 0, len = Integer.MAX_VALUE;
for (int r = 0; r < s.length(); r++) {
  if (need[s.charAt(r)]-- > 0) missing--;         // consumed a needed char
  while (missing == 0) {                           // window is valid
    if (r - l + 1 < len) { len = r - l + 1; start = l; }
    if (++need[s.charAt(l++)] > 0) missing++;      // left char now missing
  }
}
return len == Integer.MAX_VALUE ? "" : s.substring(start, start + len);
\`\`\`

**O(|s| + |t|)** — each pointer moves forward at most \`|s|\` times. The \`missing\` counter avoids re-scanning the map to check validity.

:::senior
The "expand to become valid, contract to become minimal" shape is the canonical **shrinkable-window** template — the same skeleton solves "longest substring with at most k distinct" by flipping the validity test.
:::`,
  },
  {
    id: 'dsa-arr-trapping-rain-water',
    question: 'Given an elevation map, compute how much rainwater it can trap.',
    difficulty: 'Hard',
    category: 'Arrays & Strings',
    tags: ['two pointers', 'arrays', 'prefix-max'],
    answer: `Water above bar \`i\` is \`min(maxLeft, maxRight) − height[i]\`. The brute force recomputes both maxes per bar in O(n²); prefix-max arrays make it O(n) time/O(n) space; the **two-pointer** method reaches **O(n) time, O(1) space**.

\`\`\`java
int l = 0, r = n - 1, lMax = 0, rMax = 0, water = 0;
while (l < r) {
  if (h[l] < h[r]) {                 // shorter side bounds the water
    lMax = Math.max(lMax, h[l]);
    water += lMax - h[l];
    l++;
  } else {
    rMax = Math.max(rMax, h[r]);
    water += rMax - h[r];
    r--;
  }
}
\`\`\`

**Why it works:** if \`h[l] < h[r]\`, then \`lMax\` is guaranteed to be the true limiting height for column \`l\` (the right side is taller), so we can commit its water without knowing the exact right max.

:::senior
This "advance the smaller side because it is the binding constraint" is the same greedy proof as container-with-most-water — recognizing it is the senior signal.
:::`,
  },
];

export default questions;
