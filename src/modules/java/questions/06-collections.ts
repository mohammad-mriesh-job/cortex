import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'coll-arraylist-vs-linkedlist',
    question: 'ArrayList vs LinkedList — how do they differ and which should you default to?',
    difficulty: 'Medium',
    category: 'Collections',
    tags: ['list', 'arraylist', 'linkedlist', 'big-o'],
    answer: `- **\`ArrayList\`** is a growable array: **O(1)** random access (\`get\`/\`set\`), **amortized O(1)** append (resizes ~1.5×), but **O(n)** inserts/removals in the middle (shifting).
- **\`LinkedList\`** is a doubly-linked node chain: **O(1)** add/remove at the ends, but **O(n)** \`get(i)\` because it walks the chain.

| Operation | ArrayList | LinkedList |
|-----------|-----------|------------|
| \`get(i)\` | O(1) | O(n) |
| add at end | O(1) amortized | O(1) |
| addFirst/removeFirst | O(n) | O(1) |

:::senior
Default to **\`ArrayList\`** — its contiguous memory wins on cache locality and uses ~3× less memory than \`LinkedList\`'s per-node objects, so it often beats \`LinkedList\` even at inserts. When you need end-operations, prefer **\`ArrayDeque\`** over \`LinkedList\`.
:::`,
  },
  {
    id: 'coll-hashmap-internals',
    question: 'Explain how HashMap works internally.',
    difficulty: 'Hard',
    category: 'Collections',
    tags: ['hashmap', 'internals', 'hashing'],
    answer: `A \`HashMap\` is an **array of buckets** whose length is a power of two (default 16).

1. **Hash** — the key's \`hashCode()\` is spread with \`h ^ (h >>> 16)\` so high bits affect the index.
2. **Index** — bucket = \`(length - 1) & hash\` (fast power-of-two modulo).
3. **Collisions** chain into a **linked list**; lookup compares with \`equals()\`.
4. **Treeify** — a bucket with **≥ 8** nodes converts to a **red-black tree** *if* the table has **≥ 64** slots (otherwise it resizes), bounding worst-case lookup at O(log n).
5. **Resize** — when \`size > capacity × 0.75\` (load factor), the table **doubles** and entries are rehashed.

Average operations are **O(1)**.

:::gotcha
A **mutable key** whose \`hashCode\` changes after insertion becomes unreachable. Use immutable keys.
:::`,
  },
  {
    id: 'coll-load-factor',
    question: 'What is the load factor in a HashMap and why is the default 0.75?',
    difficulty: 'Medium',
    category: 'Collections',
    tags: ['hashmap', 'load-factor', 'resize'],
    answer: `The **load factor** is the fullness threshold that triggers a resize: when \`size > capacity × loadFactor\`, the bucket array **doubles** and all entries are rehashed.

The default **0.75** balances two costs:
- A **lower** factor (e.g. 0.5) wastes memory but reduces collisions.
- A **higher** factor (e.g. 0.95) packs tightly but increases collision chains and slows lookups.

0.75 is the empirically chosen sweet spot.

:::tip
If you know the size up front, pre-size to avoid repeated rehashing: \`new HashMap<>((int)(expected / 0.75f) + 1)\`.
:::`,
  },
  {
    id: 'coll-treeify-threshold',
    question: 'When does a HashMap bucket convert to a red-black tree?',
    difficulty: 'Hard',
    category: 'Collections',
    tags: ['hashmap', 'treeify', 'internals'],
    answer: `Since Java 8, a single bucket is **treeified** when its chain reaches **8 nodes** (\`TREEIFY_THRESHOLD\`) **and** the table has at least **64 slots** (\`MIN_TREEIFY_CAPACITY\`).

- If the chain hits 8 but the table is **smaller than 64**, the map **resizes** instead of treeifying (more buckets usually disperses the collision).
- A tree shrinks back to a linked list when it drops to **6 nodes** (\`UNTREEIFY_THRESHOLD\`).

This caps a degenerate bucket's lookup at **O(log n)** instead of O(n), defending against hash-collision denial-of-service attacks.

:::note
Treeification requires keys to be \`Comparable\`; otherwise the tree falls back to comparing by identity hash.
:::`,
  },
  {
    id: 'coll-set-implementations',
    question: 'Compare HashSet, LinkedHashSet, and TreeSet.',
    difficulty: 'Medium',
    category: 'Collections',
    tags: ['set', 'hashset', 'treeset', 'linkedhashset'],
    answer: `All forbid duplicates, judged by \`equals\`/\`hashCode\` (or a \`TreeSet\`'s comparator).

| | HashSet | LinkedHashSet | TreeSet |
|--|---------|---------------|---------|
| Order | none | insertion | **sorted** |
| Backed by | HashMap | LinkedHashMap | red-black tree |
| add/contains | **O(1)** | O(1) | O(log n) |
| null | one | one | **no** |

- **HashSet** — fastest, no order.
- **LinkedHashSet** — dedupe while keeping insertion order.
- **TreeSet** — sorted, with \`NavigableSet\` ops (\`floor\`, \`ceiling\`, \`headSet\`).

:::gotcha
A natural-ordering \`TreeSet\` throws \`NullPointerException\` on \`add(null)\`, and its comparator — not \`equals\` — defines duplicate-ness.
:::`,
  },
  {
    id: 'coll-fail-fast-cme',
    question: 'What is a fail-fast iterator and how do you avoid ConcurrentModificationException?',
    difficulty: 'Medium',
    category: 'Collections',
    tags: ['iterator', 'fail-fast', 'concurrentmodification'],
    answer: `Most \`java.util\` collections track a \`modCount\`. If the collection is **structurally modified** during iteration by anything other than the iterator itself, the next \`next()\` throws **\`ConcurrentModificationException\`** (CME).

\`\`\`java
for (String s : list)
    if (s.isBlank()) list.remove(s);   // 💥 CME
\`\`\`

Fixes:
- Use the iterator's own \`it.remove()\`.
- Use **\`removeIf\`**: \`list.removeIf(String::isBlank);\`
- For concurrent access, use fail-safe collections (\`CopyOnWriteArrayList\`, \`ConcurrentHashMap\`).

:::gotcha
Fail-fast is **best-effort** — never rely on catching CME as program logic; it's a debugging aid.
:::`,
  },
  {
    id: 'coll-comparable-vs-comparator',
    question: 'Comparable vs Comparator — when do you use each?',
    difficulty: 'Easy',
    category: 'Collections',
    tags: ['sorting', 'comparable', 'comparator'],
    answer: `- **\`Comparable<T>\`** — a type's single *natural ordering*, implemented inside the class via \`compareTo\`. Used by \`Collections.sort\`, \`TreeSet\`, \`TreeMap\`.
- **\`Comparator<T>\`** — *external*, composable ordering defined outside the class; many orderings, and you can sort types you don't own.

\`\`\`java
list.sort(Comparator.comparing(Person::name)
                    .thenComparing(Person::age)
                    .reversed());
\`\`\`

:::senior
Never write \`a - b\` in \`compareTo\` — int subtraction **overflows**. Use \`Integer.compare(a, b)\`. Keep \`compareTo\` consistent with \`equals\`, or sorted collections misbehave.
:::`,
  },
  {
    id: 'coll-arraydeque-over-stack',
    question: 'Why prefer ArrayDeque over Stack and over LinkedList?',
    difficulty: 'Medium',
    category: 'Collections',
    tags: ['deque', 'arraydeque', 'stack', 'queue'],
    answer: `**\`ArrayDeque\`** is a resizable circular array offering amortized **O(1)** operations at both ends — the modern default for stacks *and* queues.

- vs **\`Stack\`**: \`Stack\` extends \`Vector\`, so every method is needlessly **synchronized**, and it iterates bottom-to-top (wrong order). It's a legacy class.
- vs **\`LinkedList\`**: \`ArrayDeque\` packs elements in an array (better cache locality, less memory) instead of allocating a node object per element.

\`\`\`java
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1); stack.push(2);
stack.pop();   // 2  (LIFO)
\`\`\`

:::gotcha
\`ArrayDeque\` does **not** allow \`null\` elements — \`null\` is reserved as the "empty" signal for \`poll\`/\`peek\`.
:::`,
  },
  {
    id: 'coll-priorityqueue',
    question: 'How does PriorityQueue work, and what is its iteration order?',
    difficulty: 'Medium',
    category: 'Collections',
    tags: ['priorityqueue', 'heap', 'queue'],
    answer: `\`PriorityQueue\` is a **binary min-heap** stored in an array. The head is always the smallest element by natural ordering (or a supplied \`Comparator\`).

- \`offer\` / \`poll\`: **O(log n)** (sift up/down).
- \`peek\`: **O(1)**.
- \`contains\` / arbitrary \`remove\`: O(n).

\`\`\`java
PriorityQueue<Integer> max =
    new PriorityQueue<>(Comparator.reverseOrder());  // max-heap
\`\`\`

:::gotcha
A \`PriorityQueue\` is ordered **only at the head**. Iterating it (for-each, \`toString\`, streams) yields heap-array order, **not** sorted order — drain with repeated \`poll()\` to get sorted output. It also rejects \`null\`.
:::`,
  },
  {
    id: 'coll-listof-immutable',
    question: 'What do List.of / Map.of return, and how do they differ from Arrays.asList?',
    difficulty: 'Easy',
    category: 'Collections',
    tags: ['factory', 'immutable', 'list-of'],
    answer: `The Java 9+ static factories \`List.of\`, \`Set.of\`, and \`Map.of\` return compact **immutable** collections that also **reject \`null\`**. Any mutation throws \`UnsupportedOperationException\`.

\`\`\`java
List<String> c = List.of("a", "b");
c.add("x");   // UnsupportedOperationException
\`\`\`

Contrast with the older **\`Arrays.asList(...)\`**, a **fixed-size view** over an array: you *can* \`set(i, v)\` but \`add\`/\`remove\` throw, and it permits \`null\`.

:::tip
Use \`List.copyOf(collection)\` to take an immutable **snapshot** for defensive returns from public APIs.
:::`,
  },
  {
    id: 'coll-lru-linkedhashmap',
    question: 'How do you build an LRU cache with LinkedHashMap?',
    difficulty: 'Hard',
    category: 'Collections',
    tags: ['linkedhashmap', 'lru', 'cache'],
    answer: `\`LinkedHashMap\` threads a linked list through its entries. Construct it with **access-order = true** so each \`get\`/\`put\` moves the entry to the most-recently-used end, then override \`removeEldestEntry\` to evict:

\`\`\`java
class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int cap;
    LRUCache(int cap) { super(16, 0.75f, true); this.cap = cap; }
    @Override protected boolean removeEldestEntry(Map.Entry<K, V> e) {
        return size() > cap;   // drop least-recently-used
    }
}
\`\`\`

All operations stay **O(1)**.

:::senior
For production multi-threaded caches prefer **Caffeine** or Guava \`Cache\`; the \`LinkedHashMap\` trick is single-threaded (wrap with \`Collections.synchronizedMap\` if needed).
:::`,
  },
  {
    id: 'coll-map-not-collection',
    question: 'Is Map part of the Collection hierarchy?',
    difficulty: 'Easy',
    category: 'Collections',
    tags: ['map', 'hierarchy', 'fundamentals'],
    answer: `**No.** \`Map\` does **not** extend \`Collection\` (or \`Iterable\`). It models key→value associations, a fundamentally different shape from a "group of elements", so it sits in a parallel hierarchy.

You bridge to the \`Collection\` world through three **views**:

\`\`\`java
map.keySet();    // Set<K>
map.values();    // Collection<V>
map.entrySet();  // Set<Map.Entry<K,V>>  — iterate this for key+value
\`\`\`

These views are **live** — backed by the map, so removing from \`keySet()\` removes from the map.

:::note
Everything *except* \`Map\` descends from \`Iterable\` → \`Collection\` (\`List\`, \`Set\`, \`Queue\`, \`Deque\`).
:::`,
  },
];

export default questions;
