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
  {
    id: 'coll-list-set-map-difference',
    question: 'What is the difference between List, Set, and Map?',
    difficulty: 'Easy',
    category: 'Collections',
    tags: ['list', 'set', 'map', 'fundamentals'],
    answer: `The three core shapes of the collections framework:

| | \`List\` | \`Set\` | \`Map\` |
|--|--------|-------|-------|
| Holds | a sequence of elements | unique elements | key → value pairs |
| Duplicates | **allowed** | **rejected** | unique keys |
| Order | positional (index) | impl-dependent | impl-dependent |
| Access | \`get(i)\` by index | \`contains\` membership | \`get(key)\` |

\`\`\`java
List<String> names = new ArrayList<>();  // ordered, may repeat
Set<String>  tags  = new HashSet<>();    // no duplicates
Map<String, Integer> ages = new HashMap<>(); // lookup by key
\`\`\`

Quick decision: need **order/duplicates/index** → \`List\`; need **uniqueness** → \`Set\`; need **lookup by key** → \`Map\`.

:::note
\`Map\` is **not** a \`Collection\` — it sits in a parallel hierarchy. \`List\`, \`Set\`, and \`Queue\` all extend \`Collection\` (which extends \`Iterable\`).
:::`,
  },
  {
    id: 'coll-choosing-collection',
    question: 'How do you choose the right collection implementation for a task?',
    difficulty: 'Easy',
    category: 'Collections',
    tags: ['list', 'set', 'map', 'decision'],
    answer: `First pick the **interface** by shape, then the **implementation** by ordering and performance needs:

- **Key → value?** \`Map\`: \`HashMap\` (default), \`LinkedHashMap\` (keep insertion/access order), \`TreeMap\` (sorted keys), \`ConcurrentHashMap\` (shared across threads).
- **Uniqueness?** \`Set\`: \`HashSet\` (default), \`LinkedHashSet\` (ordered), \`TreeSet\` (sorted).
- **Ordered sequence?** \`List\`: \`ArrayList\` (default — random access), \`LinkedList\` only for heavy end-operations (usually prefer \`ArrayDeque\`).
- **Queue / stack?** \`ArrayDeque\`; **priority order?** \`PriorityQueue\`; **producer/consumer across threads?** a \`BlockingQueue\`.

\`\`\`java
// "unique tags, remembered in insertion order" -> LinkedHashSet
Set<String> tags = new LinkedHashSet<>();
\`\`\`

:::tip
Program to the **interface** (\`List<String> x = new ArrayList<>()\`), not the implementation — you can swap the concrete class later without touching callers.
:::`,
  },
  {
    id: 'coll-map-implementations',
    question: 'Compare HashMap, LinkedHashMap, and TreeMap.',
    difficulty: 'Medium',
    category: 'Collections',
    tags: ['map', 'hashmap', 'treemap', 'linkedhashmap'],
    answer: `All implement \`Map\`; they differ in ordering, backing structure, and cost:

| | HashMap | LinkedHashMap | TreeMap |
|--|---------|---------------|---------|
| Order | **none** | insertion (or access) | **sorted by key** |
| Backed by | bucket array | HashMap + linked list | red-black tree |
| get/put | **O(1)** avg | O(1) | **O(log n)** |
| null key | one | one | **no** (natural ordering) |
| Extra API | — | LRU via \`removeEldestEntry\` | \`NavigableMap\` (floor/ceiling/subMap) |

\`\`\`java
new HashMap<>();                       // fastest, no order
new LinkedHashMap<>();                  // predictable iteration order
new TreeMap<>(Comparator.reverseOrder()); // sorted keys
\`\`\`

- **HashMap** — the default when you don't care about order.
- **LinkedHashMap** — deterministic iteration order (great for tests, caches).
- **TreeMap** — you need sorted keys or range queries.

:::gotcha
A natural-ordering \`TreeMap\` throws \`NullPointerException\` on a \`null\` key, and it decides key equality by \`compareTo\`, not \`equals\`.
:::`,
  },
  {
    id: 'coll-hashmap-hashtable-chm',
    question: 'HashMap vs Hashtable vs ConcurrentHashMap — which and when?',
    difficulty: 'Medium',
    category: 'Collections',
    tags: ['hashmap', 'hashtable', 'concurrenthashmap', 'thread-safety'],
    answer: `| | HashMap | Hashtable | ConcurrentHashMap |
|--|---------|-----------|-------------------|
| Thread-safe | **no** | yes | yes |
| Locking | — | **whole map** (\`synchronized\`) | **per-bucket** (fine-grained) |
| null key/value | one key, many values | **neither** | **neither** |
| Since | 1.2 | 1.0 (**legacy**) | 1.5 |

- **HashMap** — single-threaded or externally-synchronized code. The default.
- **Hashtable** — legacy; every method is \`synchronized\` on the whole table, so it serializes all access. **Don't use it** in new code.
- **ConcurrentHashMap** — the modern concurrent map: lock-free reads, per-bucket writes, scales with cores.

\`\`\`java
// Concurrent, atomic update — no external locking needed:
map.merge(key, 1, Integer::sum);   // increment a counter safely
\`\`\`

:::gotcha
\`ConcurrentHashMap\` guarantees each *single* method is atomic, but a **check-then-act** across two calls is still a race — use \`putIfAbsent\`/\`compute\`/\`merge\` for compound updates.
:::`,
  },
  {
    id: 'coll-fail-fast-vs-fail-safe',
    question: 'What is the difference between a fail-fast and a fail-safe iterator?',
    difficulty: 'Medium',
    category: 'Collections',
    tags: ['iterator', 'fail-fast', 'fail-safe', 'concurrency'],
    answer: `| | Fail-fast | Fail-safe (weakly consistent) |
|--|-----------|-------------------------------|
| Examples | \`ArrayList\`, \`HashMap\`, \`HashSet\` | \`CopyOnWriteArrayList\`, \`ConcurrentHashMap\` |
| On concurrent modification | throws **\`ConcurrentModificationException\`** | never throws |
| How | tracks a \`modCount\`; a mismatch aborts | iterates a **snapshot** or tolerates change |
| Sees later changes | n/a | may or may not |

- **Fail-fast** iterators (all \`java.util\` collections) detect structural modification during iteration and throw immediately — a **best-effort bug detector**, not a guarantee.
- **Fail-safe** iterators (\`java.util.concurrent\`) iterate over a copy or a weakly-consistent view, so they never throw but may miss concurrent updates.

\`\`\`java
for (String s : list) list.remove(s);  // fail-fast -> CME
// CopyOnWriteArrayList: same loop is safe but iterates the old snapshot
\`\`\`

:::gotcha
Fail-fast is **not** a thread-safety mechanism — it's a heuristic. Never rely on catching CME; use \`iterator.remove()\`, \`removeIf\`, or a concurrent collection.
:::`,
  },
  {
    id: 'coll-navigable',
    question: 'What navigation operations do TreeMap and TreeSet add over a plain sorted collection?',
    difficulty: 'Medium',
    category: 'Collections',
    tags: ['treemap', 'treeset', 'navigablemap', 'sorted'],
    answer: `Because they keep keys **sorted** in a red-black tree, \`TreeMap\`/\`TreeSet\` implement \`NavigableMap\`/\`NavigableSet\` — nearest-neighbour and range queries in **O(log n)**:

\`\`\`java
NavigableMap<Integer, String> m = new TreeMap<>();
m.put(10, "a"); m.put(20, "b"); m.put(30, "c");

m.floorKey(25);      // 20  — greatest key <= 25
m.ceilingKey(25);    // 30  — least key >= 25
m.lowerKey(20);      // 10  — strictly less
m.higherKey(20);     // 30  — strictly greater
m.firstKey();        // 10
m.headMap(20, true); // {10, 20}  — a live sub-view
m.descendingMap();   // reverse-ordered view
\`\`\`

This makes them the right tool for **"find the closest value"**, leaderboards, time-window lookups, and interval problems — anything a \`HashMap\` can't answer because it has no order.

:::tip
\`floor\`/\`ceiling\`/\`subMap\` are why a \`TreeMap\` beats sorting a \`List\` when you do many range or nearest-key queries on changing data.
:::`,
  },
  {
    id: 'coll-compareto-equals',
    question: "What happens if a class's compareTo is inconsistent with equals in a TreeSet?",
    difficulty: 'Hard',
    category: 'Collections',
    tags: ['treeset', 'comparable', 'equals', 'contract'],
    answer: `Sorted collections judge "same element" by **\`compareTo\`/\`Comparator\` returning 0**, *not* by \`equals\`. So a \`TreeSet\`/\`TreeMap\` can silently drop entries that \`equals\` considers distinct — violating the \`Set\` contract.

The textbook case is \`BigDecimal\`:

\`\`\`java
var s = new TreeSet<BigDecimal>();
s.add(new BigDecimal("1.0"));
s.add(new BigDecimal("1.00"));   // compareTo == 0 -> treated as duplicate!
s.size();                         // 1

var h = new HashSet<BigDecimal>();
h.add(new BigDecimal("1.0"));
h.add(new BigDecimal("1.00"));   // equals == false -> both kept
h.size();                         // 2
\`\`\`

\`new BigDecimal("1.0").equals(new BigDecimal("1.00"))\` is \`false\` (scale differs), but \`compareTo\` is \`0\`.

:::senior
The \`SortedSet\`/\`SortedMap\` contract explicitly says ordering "should be *consistent with equals*" to correctly implement the \`Set\`/\`Map\` interface. When you can't guarantee that, pick your comparator deliberately and document that membership follows the comparator, not \`equals\`.
:::`,
  },
  {
    id: 'coll-unmodifiable-vs-copyof',
    question: 'Collections.unmodifiableList vs List.copyOf — what is the difference?',
    difficulty: 'Medium',
    category: 'Collections',
    tags: ['immutable', 'unmodifiable', 'defensive-copy'],
    answer: `\`Collections.unmodifiableList\` returns a read-only **view** over the original list — you can't mutate it *through the wrapper*, but if someone still holds the backing list and changes it, the view changes too. It is **not immutable**, just unmodifiable.

\`List.copyOf\` (and \`List.of\`) returns an independent **immutable snapshot** — decoupled from any source.

\`\`\`java
var backing = new ArrayList<>(List.of("a", "b"));
List<String> view = Collections.unmodifiableList(backing);
List<String> snap = List.copyOf(backing);

backing.add("c");
view.size();   // 3  — view reflects the change!
snap.size();   // 2  — snapshot is frozen
view.add("x"); // UnsupportedOperationException (both reject mutation)
\`\`\`

:::gotcha
For a **defensive copy** in a constructor or getter, use \`List.copyOf\` — an \`unmodifiable\` wrapper over a field a caller can still reach leaks mutation. (\`List.copyOf\` also rejects \`null\` elements.)
:::`,
  },
  {
    id: 'coll-arrays-aslist',
    question: 'What are the traps with Arrays.asList()?',
    difficulty: 'Medium',
    category: 'Collections',
    tags: ['arrays', 'aslist', 'gotcha'],
    answer: `\`Arrays.asList\` returns a **fixed-size list backed by the array** — a bridge, not a normal \`ArrayList\`. Three traps:

1. **Structural changes throw.** \`add\`/\`remove\` → \`UnsupportedOperationException\`. But \`set(i, v)\` works and **writes through to the array**.

\`\`\`java
List<Integer> list = Arrays.asList(1, 2, 3);
list.set(0, 9);   // OK — also changes the backing array
list.add(4);      // UnsupportedOperationException
\`\`\`

2. **Primitive-array trap.** Pass an \`int[]\` and generics box the whole array as one element:

\`\`\`java
int[] nums = {1, 2, 3};
Arrays.asList(nums).size();     // 1  — a List<int[]>!
Integer[] boxed = {1, 2, 3};
Arrays.asList(boxed).size();    // 3  — as expected
\`\`\`

3. It **permits \`null\`** (unlike \`List.of\`).

:::tip
Need a real mutable list? Wrap it: \`new ArrayList<>(Arrays.asList(...))\`. Need immutability? Use \`List.of(...)\`.
:::`,
  },
  {
    id: 'coll-iterator-listiterator',
    question: 'Iterable vs Iterator vs ListIterator — how do they relate?',
    difficulty: 'Easy',
    category: 'Collections',
    tags: ['iterator', 'iterable', 'listiterator'],
    answer: `They're three layers:

| Type | Role | Key methods |
|------|------|-------------|
| \`Iterable<T>\` | "can be iterated" — enables the for-each loop | \`iterator()\` |
| \`Iterator<T>\` | a **forward-only** cursor | \`hasNext\`, \`next\`, \`remove\` |
| \`ListIterator<T>\` | a **bidirectional** cursor (\`List\` only) | + \`hasPrevious\`, \`previous\`, \`add\`, \`set\`, \`nextIndex\` |

\`\`\`java
ListIterator<String> it = list.listIterator();
while (it.hasNext()) {
    String s = it.next();
    if (s.isBlank()) it.set("?");   // replace in place — Iterator can't do this
}
\`\`\`

- Every \`Collection\` is \`Iterable\`, which is what makes \`for (T x : coll)\` work.
- \`Iterator.remove()\` is the **safe** way to delete during iteration (avoids \`ConcurrentModificationException\`).
- \`ListIterator\` adds backward traversal plus in-place \`add\`/\`set\` — only lists support it.`,
  },
  {
    id: 'coll-comparator-composition',
    question: 'How do you build a multi-field, null-safe comparator?',
    difficulty: 'Easy',
    category: 'Collections',
    tags: ['comparator', 'sorting', 'composition'],
    answer: `Compose \`Comparator\` factory and default methods instead of hand-writing \`compare\`:

\`\`\`java
Comparator<Person> byName =
    Comparator.comparing(Person::lastName)
              .thenComparing(Person::firstName)     // tie-breaker
              .thenComparingInt(Person::age)         // primitive — no boxing
              .reversed();                           // flip the whole order

people.sort(byName);
\`\`\`

Null-handling wrappers keep it from throwing on \`null\`:

\`\`\`java
Comparator.comparing(Person::middleName,
                     Comparator.nullsFirst(Comparator.naturalOrder()));
\`\`\`

Building blocks: \`comparing\` / \`comparingInt|Long|Double\` (avoid boxing on primitive keys), \`thenComparing\` (tie-breakers), \`reversed\`, \`nullsFirst\` / \`nullsLast\`, \`naturalOrder\` / \`reverseOrder\`.

:::gotcha
Never implement \`compare\` as \`a.value - b.value\` — int subtraction **overflows** for large/negative values. Use \`Integer.compare(a, b)\` or \`comparingInt\`.
:::`,
  },
];

export default questions;
