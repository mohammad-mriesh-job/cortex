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
];

export default questions;
