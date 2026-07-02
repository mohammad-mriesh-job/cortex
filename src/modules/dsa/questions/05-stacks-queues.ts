import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'dsa-sq-stack-vs-queue',
    question: 'What is the difference between a stack and a queue?',
    difficulty: 'Easy',
    category: 'Stacks & Queues',
    tags: ['stack', 'queue', 'lifo', 'fifo'],
    answer: `Both are linear collections; they differ in **which end you remove from**.

- **Stack — LIFO** (Last-In-First-Out). You push and pop at the same end (the *top*). The most recent item leaves first. Think: a stack of plates, undo history, the call stack.
- **Queue — FIFO** (First-In-First-Out). You add at the *rear* and remove from the *front*. The oldest item leaves first. Think: a checkout line, a task queue.

\`\`\`java
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1); stack.push(2); stack.pop();   // 2  (newest out)

Queue<Integer> queue = new ArrayDeque<>();
queue.offer(1); queue.offer(2); queue.poll(); // 1  (oldest out)
\`\`\`

Both give O(1) for their core operations.`,
  },
  {
    id: 'dsa-sq-arraydeque-vs-stack',
    question: 'Why prefer ArrayDeque over the legacy Stack class in Java?',
    difficulty: 'Easy',
    category: 'Stacks & Queues',
    tags: ['stack', 'arraydeque', 'java', 'api'],
    answer: `\`java.util.Stack\` is a legacy class that **extends \`Vector\`**, so every operation is **synchronized** — you pay lock overhead even in single-threaded code. It also exposes \`Vector\`'s index-based methods, which violate stack semantics (you can reach into the middle).

**\`ArrayDeque\`** (via the \`Deque\` interface) is the modern replacement:

- Not synchronized → faster.
- Contiguous backing array → good cache behavior, no per-node objects.
- Clean \`push\` / \`pop\` / \`peek\` for stacks, and \`offer\` / \`poll\` for queues.

\`\`\`java
Deque<Integer> st = new ArrayDeque<>();  // use as stack OR queue
\`\`\`

:::tip
\`ArrayDeque\` is the one-stop class for stacks, queues, and deques — reach for it unless you specifically need thread safety (then use a concurrent collection).
:::`,
  },
  {
    id: 'dsa-sq-balanced-parentheses',
    question: 'How do you check whether a string of brackets is balanced?',
    difficulty: 'Easy',
    category: 'Stacks & Queues',
    tags: ['stack', 'parentheses', 'validation'],
    answer: `Use a **stack**. Scan left to right: **push** every opening bracket; on a **closing** bracket, the top of the stack must be its matching opener — pop and compare. The string is balanced only if you never mismatch **and** the stack is empty at the end.

\`\`\`java
boolean isBalanced(String s) {
  Deque<Character> st = new ArrayDeque<>();
  Map<Character, Character> pair = Map.of(')', '(', ']', '[', '}', '{');
  for (char c : s.toCharArray()) {
    if (c == '(' || c == '[' || c == '{') st.push(c);
    else if (pair.containsKey(c)) {
      if (st.isEmpty() || st.pop() != pair.get(c)) return false;
    }
  }
  return st.isEmpty();
}
\`\`\`

Two failure modes to guard: a closer with an **empty** stack (\`")("\`), and a **non-empty** stack at the end (\`"(("\`). Time O(n), space O(n).`,
  },
  {
    id: 'dsa-sq-circular-queue',
    question: 'What is a circular queue and why is it useful?',
    difficulty: 'Medium',
    category: 'Stacks & Queues',
    tags: ['queue', 'circular queue', 'ring buffer', 'modulo'],
    answer: `A **circular queue** (ring buffer) backs a queue with a fixed array and **wraps** the front/rear indices around using **modulo**, so slots freed at the front get reused instead of leaking away.

With naive advancing indices, \`front\` crawls rightward and abandons the slots behind it — the array "fills up" even when it is mostly empty. Wrapping fixes that:

\`\`\`java
boolean enqueue(int x) {
  if (size == cap) return false;      // full
  q[(front + size) % cap] = x;        // rear, wrapped
  size++; return true;
}
int dequeue() {
  int x = q[front];
  front = (front + 1) % cap; size--;  // front, wrapped
  return x;
}
\`\`\`

:::gotcha
Track \`size\` explicitly. If you try to detect full-vs-empty from \`front == rear\` alone, the two states are indistinguishable after the indices wrap.
:::

Uses: bounded buffers, streaming/producer-consumer pipelines, fixed-memory schedulers. All ops O(1).`,
  },
  {
    id: 'dsa-sq-deque',
    question: 'What is a deque and how does it generalize stacks and queues?',
    difficulty: 'Medium',
    category: 'Stacks & Queues',
    tags: ['deque', 'double-ended queue', 'arraydeque'],
    answer: `A **deque** ("deck", double-ended queue) supports insertion and removal at **both** ends in **O(1)**: \`offerFirst\` / \`offerLast\` and \`pollFirst\` / \`pollLast\`.

It subsumes both simpler structures:

- Use one end only → **stack** (LIFO).
- Add at one end, remove at the other → **queue** (FIFO).

\`\`\`java
Deque<Integer> d = new ArrayDeque<>();
d.offerLast(2);  d.offerFirst(1);   // [1, 2]
d.pollFirst();                       // 1
d.pollLast();                        // 2
\`\`\`

It is also the backbone of the **monotonic queue** used for sliding-window maximum, where you push/pop at the back to maintain order and pop the front when it leaves the window.`,
  },
  {
    id: 'dsa-sq-two-stacks-queue',
    question: 'How do you implement a queue using two stacks?',
    difficulty: 'Medium',
    category: 'Stacks & Queues',
    tags: ['stack', 'queue', 'amortized', 'design'],
    answer: `Use an **in** stack and an **out** stack. Enqueue pushes onto \`in\`. Dequeue pops from \`out\`; if \`out\` is empty, first **pour** everything from \`in\` into \`out\`, which reverses the order so the oldest element ends up on top.

\`\`\`java
Deque<Integer> in = new ArrayDeque<>(), out = new ArrayDeque<>();

void enqueue(int x) { in.push(x); }

int dequeue() {
  if (out.isEmpty())
    while (!in.isEmpty()) out.push(in.pop());  // reverse once
  return out.pop();
}
\`\`\`

**Amortized O(1):** each element is moved from \`in\` to \`out\` exactly once over its lifetime, even though a single dequeue can occasionally cost O(n). A common interview follow-up to test amortized analysis.`,
  },
  {
    id: 'dsa-sq-monotonic-stack',
    question: 'What is a monotonic stack and what problem does it solve?',
    difficulty: 'Medium',
    category: 'Stacks & Queues',
    tags: ['monotonic stack', 'next greater element', 'pattern'],
    answer: `A **monotonic stack** keeps its elements in sorted order by **popping everything that breaks the ordering before each push**. It answers "nearest / next / previous **greater** or **smaller** element" in a single **O(n)** pass instead of an O(n²) scan.

For **next greater element**, keep a *decreasing* stack of elements still waiting for an answer. When a bigger value arrives, it is the answer for every smaller value on top — pop them and record it.

\`\`\`java
int[] nextGreater(int[] a) {
  int n = a.length; int[] ans = new int[n]; Arrays.fill(ans, -1);
  Deque<Integer> st = new ArrayDeque<>();   // indices, values decreasing
  for (int i = 0; i < n; i++) {
    while (!st.isEmpty() && a[i] > a[st.peek()]) ans[st.pop()] = a[i];
    st.push(i);
  }
  return ans;
}
\`\`\`

It is **O(n)** because each element is pushed once and popped at most once. Powers *daily temperatures*, *stock span*, *largest rectangle in a histogram*, *trapping rain water*.`,
  },
  {
    id: 'dsa-sq-monotonic-complexity',
    question: 'A monotonic-stack solution has a for-loop with a nested while-loop. Why is it still O(n)?',
    difficulty: 'Hard',
    category: 'Stacks & Queues',
    tags: ['monotonic stack', 'amortized', 'complexity'],
    answer: `Because of **amortized analysis**, not the syntactic nesting. Over the entire run:

- The \`for\` loop pushes each element **exactly once** → n pushes total.
- The inner \`while\` loop only ever **pops**, and an element can be popped **at most once** → at most n pops total.

So pushes + pops ≤ 2n across the *whole scan* — O(n) total inner-loop work, giving **O(n)** overall even though any single iteration's \`while\` might pop many elements.

:::key
The trap is reasoning "for × while = O(n²)". Count total work by counting how many times an element can enter and leave the stack — once each. That amortized argument is the whole reason the pattern beats brute force.
:::`,
  },
  {
    id: 'dsa-sq-heap-basics',
    question: 'What is a binary heap and how is it stored in an array?',
    difficulty: 'Medium',
    category: 'Stacks & Queues',
    tags: ['heap', 'binary heap', 'array', 'priority queue'],
    answer: `A **binary heap** is a *complete* binary tree with the **heap property**: in a **min-heap** every parent ≤ its children (min at the root); a max-heap flips it. It gives O(1) access to the min/max and O(log n) insert/remove.

Because it is complete, it maps onto an array with pure index math — no node objects or pointers:

| From index \`i\` | Formula |
|--|--|
| parent | \`(i - 1) / 2\` |
| left child | \`2*i + 1\` |
| right child | \`2*i + 2\` |
| the min/max | \`a[0]\` |

- **insert:** append at the end, then **sift up** (swap with parent while it violates the property) — O(log n).
- **remove-min:** take \`a[0]\`, move the last element to the root, then **sift down** (swap with the smaller child) — O(log n).

Java's \`PriorityQueue\` is exactly this — a min-heap by default.`,
  },
  {
    id: 'dsa-sq-heapify-on',
    question: 'Why is building a heap with heapify O(n) instead of O(n log n)?',
    difficulty: 'Hard',
    category: 'Stacks & Queues',
    tags: ['heap', 'heapify', 'complexity', 'sift-down'],
    answer: `Inserting \`n\` elements one at a time is O(n log n). But **heapify** builds a heap bottom-up by calling **sift-down** on every non-leaf node, from the last parent up to the root — and that is **O(n)**.

\`\`\`java
for (int i = n / 2 - 1; i >= 0; i--) siftDown(a, i, n);
\`\`\`

The key is that sift-down cost is proportional to a node's **height**, and a heap has very few tall nodes:

- ~n/2 leaves do **zero** work (height 0),
- ~n/4 nodes sift down ≤ 1 level,
- ~n/8 nodes ≤ 2 levels, …

Summing \`Σ (n / 2^(h+1)) · h\` over all heights converges to **≈ 2n = O(n)**. The many cheap low nodes dominate; the rare expensive nodes near the root don't.

Note the contrast with build-by-insert, which sifts **up** — there the many leaves are the *expensive* ones, giving O(n log n).`,
  },
  {
    id: 'dsa-sq-top-k',
    question: 'How do you find the k largest elements efficiently, and which heap do you use?',
    difficulty: 'Medium',
    category: 'Stacks & Queues',
    tags: ['heap', 'priority queue', 'top-k', 'streaming'],
    answer: `Keep a **min-heap of size k** (counter-intuitively — a *min*-heap for the *largest* elements). Push each value; whenever the heap exceeds size \`k\`, poll (evict) the smallest. What remains are the k largest, and the root is the k-th largest.

\`\`\`java
PriorityQueue<Integer> heap = new PriorityQueue<>();  // min-heap, capacity k
for (int x : nums) {
  heap.offer(x);
  if (heap.size() > k) heap.poll();   // drop the current smallest
}
// heap holds the k largest; heap.peek() = k-th largest
\`\`\`

**Why a min-heap:** the root is the *weakest* of your current top-k, so it is the cheapest candidate to evict when a bigger value arrives.

**Cost:** O(n log k) time, O(k) space — much better than sorting all n (O(n log n)) when k ≪ n, and it works on a **stream** where you can't hold everything. (For the k *smallest*, use a max-heap.)`,
  },
  {
    id: 'dsa-sq-sliding-window-max',
    question: 'How do you compute the maximum of every sliding window of size k in O(n)?',
    difficulty: 'Hard',
    category: 'Stacks & Queues',
    tags: ['monotonic queue', 'deque', 'sliding window'],
    answer: `Use a **monotonic deque** holding **indices** whose values are decreasing front-to-back. The front is always the current window's maximum.

\`\`\`java
Deque<Integer> dq = new ArrayDeque<>();   // indices, values decreasing
List<Integer> res = new ArrayList<>();
for (int i = 0; i < n; i++) {
  while (!dq.isEmpty() && a[dq.peekLast()] <= a[i]) dq.pollLast(); // back: clear smaller
  dq.offerLast(i);
  if (dq.peekFirst() <= i - k) dq.pollFirst();                     // front: drop out-of-window
  if (i >= k - 1) res.add(a[dq.peekFirst()]);                      // window max
}
\`\`\`

- **Back:** a new value evicts every smaller value behind it — they can never be the max while it's in the window.
- **Front:** drop the index once it slides out of the window \`[i-k+1, i]\`.

**O(n):** each index enters and leaves the deque once. This beats a size-k heap's O(n log k) and is the canonical monotonic-queue problem.`,
  },
];

export default questions;
