import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'dsa-hash-how-it-works',
    question: 'How does a hash table achieve O(1) average lookups?',
    difficulty: 'Easy',
    category: 'Hashing',
    tags: ['hash table', 'fundamentals'],
    answer: `A hash table is an **array plus a hash function**. Every operation does two cheap steps:

1. **Hash** the key to a big integer (\`key.hashCode()\`).
2. **Compress** it to a valid slot: \`index = hash % capacity\`.

Then it touches just that one slot. With a good hash function spreading keys uniformly and a bounded load factor, that is **O(1) on average**.

\`\`\`text
"cat"  --hashCode-->  8291  --% 8-->  bucket 3
\`\`\`

:::tip
Always say "**O(1) average**", not a flat "O(1)". The worst case is O(n) when every key collides into one bucket.
:::`,
  },
  {
    id: 'dsa-hash-collision-resolution',
    question: 'What is a hash collision, and how are collisions resolved?',
    difficulty: 'Medium',
    category: 'Hashing',
    tags: ['collisions', 'chaining', 'open addressing'],
    answer: `A **collision** is when two different keys hash to the **same bucket index**. By the pigeonhole principle they are inevitable once you have more keys than buckets. Two main strategies:

- **Separate chaining** — each bucket holds a list (or tree) of entries. Collisions append to the list. This is what Java \`HashMap\` uses; since Java 8 a bucket **treeifies** into a balanced tree (O(log n)) once a chain gets long (~8 entries).
- **Open addressing** — keep everything in the array. On a collision, **probe** for the next free slot (linear probing, quadratic probing, or double hashing). Better cache locality, but suffers from clustering.

\`\`\`java
// chaining: both keys hashed to bucket 3
buckets[3] = [Entry("cat"), Entry("bird")];
\`\`\``,
  },
  {
    id: 'dsa-hash-load-factor-resize',
    question: 'What is the load factor, and why does a hash table resize?',
    difficulty: 'Medium',
    category: 'Hashing',
    tags: ['load factor', 'resize', 'amortized'],
    answer: `The **load factor** is how full the table is:

\`\`\`text
load factor = entries / buckets
\`\`\`

As it rises, chains lengthen and lookups drift toward O(n). When it crosses a threshold (Java \`HashMap\` uses **0.75**), the table **resizes** — usually **doubling** the array and **rehashing** every key into the larger space.

A single resize is **O(n)**, but it happens rarely (only on doubling), so the amortized cost stays **O(1)** per insert.

:::tip
If you know the final size, pre-size the map: \`new HashMap<>(expectedCapacity)\` avoids repeated resizes.
:::`,
  },
  {
    id: 'dsa-hash-equals-hashcode',
    question: 'Why must equals and hashCode be overridden together?',
    difficulty: 'Medium',
    category: 'Hashing',
    tags: ['equals', 'hashCode', 'contract'],
    answer: `The contract: if two objects are \`equals\`, they **must** return the same \`hashCode\`.

The table finds a key's bucket via \`hashCode\`, then confirms the match with \`equals\`. If you override \`equals\` but not \`hashCode\`, two "equal" keys can land in **different buckets** — so the map stores duplicates and \`get\` silently misses.

\`\`\`java
@Override public boolean equals(Object o) { /* compare fields */ }
@Override public int hashCode() { return Objects.hash(field1, field2); }
\`\`\`

:::gotcha
Never mutate a field used in \`hashCode\` while the key is inside a map — it becomes unreachable, stranded in the wrong bucket.
:::`,
  },
  {
    id: 'dsa-hash-two-sum',
    question: 'Solve two-sum in O(n) using a hash map. Why not two pointers?',
    difficulty: 'Easy',
    category: 'Hashing',
    tags: ['two sum', 'seen-map', 'complement'],
    answer: `Scan once, keeping a map of **value → index seen so far**. For each \`x\`, check whether its complement \`target - x\` is already in the map.

\`\`\`java
Map<Integer,Integer> seen = new HashMap<>();
for (int i = 0; i < nums.length; i++) {
    int need = target - nums[i];
    if (seen.containsKey(need)) return new int[]{ seen.get(need), i };
    seen.put(nums[i], i);   // store AFTER checking
}
\`\`\`

**O(n)** time, **O(n)** space. Store *after* checking so an element never pairs with itself.

Two pointers would need a **sorted** array (and sorting loses original indices). The hash approach works on **unsorted** input — that is its edge here.`,
  },
  {
    id: 'dsa-hash-first-unique-char',
    question: 'Find the first non-repeating character in a string.',
    difficulty: 'Easy',
    category: 'Hashing',
    tags: ['frequency', 'first unique', 'strings'],
    answer: `Two passes over a frequency map: **count**, then find the first char with count 1.

\`\`\`java
Map<Character,Integer> freq = new HashMap<>();
for (char c : s.toCharArray()) freq.merge(c, 1, Integer::sum);
for (int i = 0; i < s.length(); i++)
    if (freq.get(s.charAt(i)) == 1) return i;
return -1;
\`\`\`

**O(n)** time, **O(k)** space (k = alphabet size). For a fixed alphabet (e.g. lowercase ASCII) an \`int[26]\` array replaces the map for even less overhead.`,
  },
  {
    id: 'dsa-hash-group-anagrams',
    question: 'Group a list of words into anagrams. What key do you hash by?',
    difficulty: 'Medium',
    category: 'Hashing',
    tags: ['anagrams', 'grouping', 'signature'],
    answer: `Give each word a **canonical signature** and bucket by it in a \`Map<String,List<String>>\`. Anagrams share the same multiset of letters, so the **sorted letters** make an identical key.

\`\`\`java
Map<String,List<String>> groups = new HashMap<>();
for (String w : words) {
    char[] c = w.toCharArray();
    Arrays.sort(c);
    String key = new String(c);   // "eat","tea" -> "aet"
    groups.computeIfAbsent(key, k -> new ArrayList<>()).add(w);
}
return new ArrayList<>(groups.values());
\`\`\`

**O(n · k log k)** for n words of length k. A count-based key (\`int[26]\` encoded to a string) drops the sort to O(n · k).`,
  },
  {
    id: 'dsa-hash-set-vs-map',
    question: 'When would you reach for a HashSet instead of a HashMap?',
    difficulty: 'Easy',
    category: 'Hashing',
    tags: ['hash set', 'hash map', 'design'],
    answer: `Use a **\`HashSet\`** when you only care about **membership** — "have I seen this value?" — with no associated data. Use a **\`HashMap\`** when each key needs a **value** attached (count, index, list, object).

\`\`\`java
// dedup / seen-set: add returns false if already present
Set<Integer> seen = new HashSet<>();
for (int x : nums) if (!seen.add(x)) return true;  // duplicate

// need extra data -> map
Map<Integer,Integer> lastIndex = new HashMap<>();
\`\`\`

Under the hood a Java \`HashSet\` is literally a \`HashMap\` with dummy values — same performance, cleaner intent.`,
  },
  {
    id: 'dsa-hash-worst-case',
    question: 'When do hash table operations degrade to O(n), and how is it mitigated?',
    difficulty: 'Hard',
    category: 'Hashing',
    tags: ['worst case', 'complexity', 'treeify'],
    answer: `Operations degrade to **O(n)** when **many keys collide into the same bucket**, turning it into one long chain. Causes:

- A **poor hash function** that clumps keys.
- **Adversarial input** — a client deliberately crafting keys with equal hashes (a hash-flooding DoS).

Mitigations:

- **Good, well-distributed hashes** and a bounded **load factor** (resize at 0.75).
- Java 8+ **treeifies** an oversized bucket into a red-black tree, capping the worst case at **O(log n)** rather than O(n).
- **Randomized / keyed hashing** (salt per table) defeats hash-flooding attacks.

:::senior
The honest interview answer: hash operations are "**O(1) amortized average**, O(n) worst case" — mention the load-factor resize and the treeify fallback to show depth.
:::`,
  },
  {
    id: 'dsa-hash-ordering',
    question: 'Does a HashMap keep keys in order? What if you need ordering?',
    difficulty: 'Medium',
    category: 'Hashing',
    tags: ['ordering', 'linkedhashmap', 'treemap'],
    answer: `No. A plain \`HashMap\` gives **no ordering guarantee** — iteration order depends on hashes and capacity, and can change after a resize. If you need order, pick a different map:

| Need | Use | Iteration order | Lookup |
|--|--|--|:--:|
| No order (fastest) | \`HashMap\` | undefined | O(1) avg |
| Insertion / access order | \`LinkedHashMap\` | as inserted (or LRU) | O(1) avg |
| Sorted by key | \`TreeMap\` | ascending key | O(log n) |

\`\`\`java
// LRU cache in a few lines
new LinkedHashMap<>(16, 0.75f, true /* access-order */);
\`\`\`

:::tip
\`LinkedHashMap\` with \`accessOrder=true\` plus \`removeEldestEntry\` is the classic one-file LRU cache.
:::`,
  },
  {
    id: 'dsa-hash-contains-duplicate',
    question: 'How do you check whether an array contains any duplicate value?',
    difficulty: 'Easy',
    category: 'Hashing',
    tags: ['hash set', 'duplicates', 'membership'],
    answer: `Stream the values into a **\`HashSet\`**; \`add\` returns \`false\` the moment a value is already present.

\`\`\`java
Set<Integer> seen = new HashSet<>();
for (int x : nums)
  if (!seen.add(x)) return true;   // duplicate found
return false;
\`\`\`

**O(n) time, O(n) space.** The alternative — sort then scan neighbours — is O(n log n) time but O(1) space, a worthwhile trade when memory is tight or the input is already sorted.

:::tip
This "seen set" is the canonical space-for-time trade: one extra O(n) structure removes a nested O(n²) re-scan.
:::`,
  },
  {
    id: 'dsa-hash-intersection-arrays',
    question: 'Return the intersection of two arrays (unique common elements).',
    difficulty: 'Easy',
    category: 'Hashing',
    tags: ['hash set', 'intersection', 'sets'],
    answer: `Put the smaller array in a **\`HashSet\`**, then scan the other and keep values the set contains.

\`\`\`java
Set<Integer> a = new HashSet<>();
for (int x : nums1) a.add(x);
Set<Integer> out = new HashSet<>();
for (int x : nums2) if (a.contains(x)) out.add(x);
\`\`\`

**O(n + m) time, O(min(n, m)) space** if you hash the smaller array. Using a set for the output also dedups the result automatically.

:::note
If both arrays are **sorted**, a two-pointer merge gives O(n + m) time and O(1) extra space — prefer it when the sorted order is already available.
:::`,
  },
  {
    id: 'dsa-hash-isomorphic-strings',
    question: 'How do you check whether two strings are isomorphic?',
    difficulty: 'Medium',
    category: 'Hashing',
    tags: ['hash map', 'bijection', 'strings'],
    answer: `Two strings are isomorphic if there is a **one-to-one** character mapping from \`s\` to \`t\` that preserves order. You need **two maps** (or a map plus a reverse-seen set) to enforce the mapping in **both directions**.

\`\`\`java
Map<Character,Character> st = new HashMap<>(), ts = new HashMap<>();
for (int i = 0; i < s.length(); i++) {
  char a = s.charAt(i), b = t.charAt(i);
  if (st.getOrDefault(a, b) != b || ts.getOrDefault(b, a) != a)
    return false;
  st.put(a, b); ts.put(b, a);
}
return true;
\`\`\`

**O(n) time.**

:::gotcha
A single map is a classic bug: it accepts \`"ab" → "aa"\` because it never notices two different source chars mapping to the same target. The mapping must be a **bijection**, so guard both directions.
:::`,
  },
  {
    id: 'dsa-hash-top-k-frequent',
    question: 'Return the k most frequent elements in an array.',
    difficulty: 'Medium',
    category: 'Hashing',
    tags: ['frequency', 'bucket sort', 'heap'],
    answer: `Count with a hash map, then extract the top k. Two good options:

- **Size-k min-heap** by frequency → **O(n log k)**.
- **Bucket sort** by frequency → **O(n)**: index buckets \`0..n\` where bucket \`f\` holds values occurring \`f\` times, then read buckets from the top.

\`\`\`java
Map<Integer,Integer> freq = new HashMap<>();
for (int x : nums) freq.merge(x, 1, Integer::sum);
List<Integer>[] bucket = new List[nums.length + 1];
for (var e : freq.entrySet()) {
  int f = e.getValue();
  if (bucket[f] == null) bucket[f] = new ArrayList<>();
  bucket[f].add(e.getKey());
}
// walk bucket[] from high freq down, collecting k values
\`\`\`

:::senior
Frequency is bounded by \`n\`, so it fits a fixed range of buckets — that is what lets you beat the heap's log factor and hit **linear time**. Recognizing a bounded key range is the cue for bucket/counting techniques.
:::`,
  },
  {
    id: 'dsa-hash-valid-sudoku',
    question: 'How do you validate a 9×9 Sudoku board using hashing?',
    difficulty: 'Medium',
    category: 'Hashing',
    tags: ['hash set', 'grid', 'validation'],
    answer: `Each digit must be unique within its **row**, **column**, and **3×3 box**. Keep one set per row, per column, and per box — 27 sets — and reject on the first repeat.

\`\`\`java
Set<String> seen = new HashSet<>();
for (int r = 0; r < 9; r++)
  for (int c = 0; c < 9; c++) {
    char d = board[r][c];
    if (d == '.') continue;
    if (!seen.add(d + "row" + r) ||
        !seen.add(d + "col" + c) ||
        !seen.add(d + "box" + (r/3) + (c/3)))
      return false;
  }
return true;
\`\`\`

The **box index** is \`(r/3, c/3)\` — integer division buckets the 9 cells of each block together. It runs in **O(81) = O(1)** for a fixed board. Encoding "value + region + index" as a set key is the reusable trick.`,
  },
  {
    id: 'dsa-hash-four-sum-count',
    question: 'Given four arrays, count tuples (i,j,k,l) with a[i]+b[j]+c[k]+d[l] == 0.',
    difficulty: 'Medium',
    category: 'Hashing',
    tags: ['hash map', 'meet-in-the-middle', 'complement'],
    answer: `The O(n⁴) brute force is hopeless. **Split in half** (meet-in-the-middle): hash every pair sum from the first two arrays, then for every pair sum from the last two, look up its negation.

\`\`\`java
Map<Integer,Integer> sums = new HashMap<>();
for (int x : a) for (int y : b) sums.merge(x + y, 1, Integer::sum);
int count = 0;
for (int x : c) for (int y : d)
  count += sums.getOrDefault(-(x + y), 0);
return count;
\`\`\`

Two O(n²) loops instead of one O(n⁴) → **O(n²) time, O(n²) space**.

:::senior
This is the **meet-in-the-middle** pattern: halve the exponent by hashing one half's results and querying with the other. It also powers subset-sum for \`n ≤ 40\`.
:::`,
  },
  {
    id: 'dsa-hash-when-not-to-use',
    question: 'When is a hash map the wrong choice, and what do you use instead?',
    difficulty: 'Medium',
    category: 'Hashing',
    tags: ['design', 'trade-offs', 'ordering'],
    answer: `Hash maps trade ordering and guarantees for average O(1) access. Avoid them when:

| You need | Hash map problem | Use instead |
|--|--|--|
| Sorted iteration / range queries | no order at all | \`TreeMap\` (O(log n)) |
| Predictable worst case | O(n) on collisions | balanced BST |
| Prefix / autocomplete | hashing scatters prefixes | trie |
| Tiny fixed key range | boxing + hashing overhead | plain array / \`int[]\` |
| Minimal memory | load factor + buckets waste space | sorted array |

:::gotcha
"Just use a HashMap" fails for **"first/smallest/next key ≥ x"** style queries — those need order. And for keys like \`0..25\` (letters), an \`int[26]\` is faster and smaller than any hash map.
:::`,
  },
  {
    id: 'dsa-hash-design-hashmap',
    question: 'How would you implement a hash map from scratch?',
    difficulty: 'Hard',
    category: 'Hashing',
    tags: ['design', 'chaining', 'internals'],
    answer: `A hash map is an **array of buckets** plus a hash function, with **separate chaining** for collisions:

\`\`\`java
class MyMap {
  static class Node { int k, v; Node next; Node(int k,int v){this.k=k;this.v=v;} }
  Node[] buckets = new Node[16];
  int size = 0;

  int idx(int k) { return (k ^ (k >>> 16)) & (buckets.length - 1); }

  void put(int k, int v) {
    int i = idx(k);
    for (Node n = buckets[i]; n != null; n = n.next)
      if (n.k == k) { n.v = v; return; }        // update in place
    Node head = new Node(k, v);
    head.next = buckets[i];                       // prepend to chain
    buckets[i] = head;
    if (++size > buckets.length * 0.75) resize();
  }
}
\`\`\`

Key design points: \`index = hash & (cap − 1)\` needs a **power-of-two** capacity; **resize** (double + rehash) keeps the load factor bounded so chains stay short; and a **spread** step (\`k ^ k>>>16\`) mixes high bits so poor hashes don't cluster.

:::senior
Mentioning the load-factor resize (amortized O(1)) and treeifying long buckets to O(log n) — exactly what Java's \`HashMap\` does — shows you understand the average-vs-worst-case story, not just the array-of-lists sketch.
:::`,
  },
  {
    id: 'dsa-hash-longest-consecutive',
    question: 'Find the length of the longest run of consecutive integers in an unsorted array, in O(n).',
    difficulty: 'Hard',
    category: 'Hashing',
    tags: ['hash set', 'sequence', 'linear'],
    answer: `Sorting gives O(n log n). To hit **O(n)**, dump everything into a **\`HashSet\`** and only start counting from a value that is a **sequence start** — one with no predecessor \`x-1\` in the set.

\`\`\`java
Set<Integer> set = new HashSet<>();
for (int x : nums) set.add(x);
int best = 0;
for (int x : set)
  if (!set.contains(x - 1)) {          // x begins a run
    int len = 1;
    while (set.contains(x + len)) len++;
    best = Math.max(best, len);
  }
\`\`\`

**Why O(n) despite the inner \`while\`:** each number is walked *once* — only as part of the single run it belongs to, and only from that run's start. Total inner iterations across the whole loop is ≤ n.

:::gotcha
Without the \`!set.contains(x-1)\` guard, you'd re-count every run from every member and degrade to O(n²). Counting only from starts is the whole trick.
:::`,
  },
  {
    id: 'dsa-hash-lru-cache',
    question: 'Design an LRU cache with O(1) get and put.',
    difficulty: 'Hard',
    category: 'Hashing',
    tags: ['lru', 'design', 'doubly-linked-list'],
    answer: `Combine a **hash map** (key → node, for O(1) lookup) with a **doubly linked list** ordered most- to least-recently-used (for O(1) reordering and eviction).

- **get(k):** look up the node in the map, **move it to the front**, return its value.
- **put(k,v):** insert/update at the front; if size exceeds capacity, **evict the tail** (least recently used) and remove it from the map.

\`\`\`java
// each op is O(1): map gives direct node access,
// the DLL's prev pointers let you splice a node out without walking
void moveToFront(Node n) { unlink(n); insertHead(n); }
\`\`\`

The doubly linked list is essential: given a node you must splice it out in O(1), which needs its \`prev\` pointer. **Every operation is O(1); space is O(capacity).**

:::tip
In Java you can skip the plumbing entirely: \`LinkedHashMap(cap, 0.75f, true)\` with \`removeEldestEntry\` is a ready-made LRU. Interviewers usually want the hand-built map-plus-DLL version to test the design.
:::`,
  },
];

export default questions;
