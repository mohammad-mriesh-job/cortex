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
];

export default questions;
