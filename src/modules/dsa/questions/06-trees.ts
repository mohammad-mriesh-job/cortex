import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'dsa-tree-node-structure',
    question: 'What is a binary tree, and how do you represent a node in code?',
    difficulty: 'Easy',
    category: 'Trees',
    tags: ['binary-tree', 'fundamentals'],
    answer: `A **binary tree** is a set of nodes where each node holds a value and up to **two children** — a \`left\` and a \`right\`. One node is the **root**; nodes with no children are **leaves**.

\`\`\`java
class Node {
    int val;
    Node left, right;   // either may be null
    Node(int val) { this.val = val; }
}
\`\`\`

It is a naturally **recursive** structure: each child is itself the root of a smaller binary tree, which is why recursion is the default tool for tree problems.`,
  },
  {
    id: 'dsa-tree-height-vs-depth',
    question: 'What is the difference between the depth of a node and the height of a tree?',
    difficulty: 'Easy',
    category: 'Trees',
    tags: ['height', 'depth', 'fundamentals'],
    answer: `Both count **edges**, but from opposite directions:

- **Depth** of a node = edges from the **root down to that node**. The root has depth 0.
- **Height** of a node = edges on the **longest path down to a leaf**. A leaf has height 0.
- **Height of the tree** = height of the root.

:::tip
A balanced tree of \`n\` nodes has height **≈ log₂ n**; a skewed one has height up to \`n - 1\`. That height is what determines whether tree operations are O(log n) or O(n).
:::`,
  },
  {
    id: 'dsa-tree-traversal-orders',
    question: 'Name the four tree traversals and state what distinguishes each.',
    difficulty: 'Medium',
    category: 'Trees',
    tags: ['traversal', 'dfs', 'bfs'],
    answer: `Three are **depth-first** (DFS) and differ only in *when the node is visited*; the fourth is **breadth-first** (BFS):

| Traversal | Rule | Note |
|--|--|--|
| **Pre-order** | node, left, right | copy / serialize a tree |
| **In-order** | left, node, right | **sorted** output on a BST |
| **Post-order** | left, right, node | delete a tree, evaluate expressions |
| **Level-order** | top-to-bottom, left-to-right | BFS with a **queue** |

DFS rides the recursion stack (O(h) space); level-order needs an explicit **queue** (O(w) space). All four are O(n) time.`,
  },
  {
    id: 'dsa-tree-inorder-bst-sorted',
    question: 'Why does an in-order traversal of a binary search tree produce sorted output?',
    difficulty: 'Medium',
    category: 'Trees',
    tags: ['bst', 'inorder', 'traversal'],
    answer: `In-order visits **left subtree → node → right subtree**. In a BST, every key in the left subtree is **smaller** than the node and every key in the right subtree is **larger**. So the recursion emits all smaller keys first, then the node, then all larger keys — recursively, that is ascending order.

\`\`\`java
void inorder(Node n) {
    if (n == null) return;
    inorder(n.left);
    System.out.print(n.val + " "); // sorted
    inorder(n.right);
}
\`\`\`

:::tip
This is the quickest way to **validate a BST**: an in-order walk must be strictly increasing.
:::`,
  },
  {
    id: 'dsa-tree-bst-invariant',
    question: 'What is the binary search tree invariant, and what does it buy you?',
    difficulty: 'Easy',
    category: 'Trees',
    tags: ['bst', 'invariant'],
    answer: `For **every** node: all keys in its **left subtree are smaller** and all keys in its **right subtree are larger** — applied recursively.

That invariant lets every comparison **discard half the remaining tree**, just like binary search on a sorted array. So search, insert, and delete each follow a single root-to-node path in **O(log n)** — *provided the tree stays balanced*.`,
  },
  {
    id: 'dsa-tree-bst-worst-case',
    question: 'When does a binary search tree degrade to O(n) operations?',
    difficulty: 'Medium',
    category: 'Trees',
    tags: ['bst', 'balance', 'complexity'],
    answer: `When it becomes **skewed**. Insert keys in **sorted (or reverse-sorted) order** — e.g. \`1, 2, 3, 4, 5\` — and every new key attaches to the same side, producing a degenerate chain that is effectively a linked list of height \`n\`. Search then costs **O(n)**.

\`\`\`text
1
 \\
  2
   \\
    3   ← height grows with every insert
\`\`\`

:::gotcha
A plain BST guarantees O(log n) only for *lucky* input order. **Self-balancing** trees (AVL, red-black) rotate after updates to keep height O(log n) regardless of insertion order.
:::`,
  },
  {
    id: 'dsa-tree-bst-delete',
    question: 'How do you delete a node with two children from a BST?',
    difficulty: 'Hard',
    category: 'Trees',
    tags: ['bst', 'delete'],
    answer: `Replace the node's value with its **in-order successor** — the **smallest key in its right subtree** — then delete that successor from the right subtree.

The successor is the next-larger key, so swapping it in preserves the sorted invariant, and by definition it has **no left child**, so removing it falls into the easy 0-or-1-child case.

\`\`\`java
// node has two children:
Node succ = min(node.right);   // leftmost of right subtree
node.val = succ.val;
node.right = delete(node.right, succ.val);
\`\`\`

The other cases are simpler: a **leaf** is removed directly, and a node with **one child** is replaced by that child.`,
  },
  {
    id: 'dsa-tree-avl-vs-redblack',
    question: 'What is the difference between AVL and red-black trees, and why do standard libraries pick red-black?',
    difficulty: 'Hard',
    category: 'Trees',
    tags: ['avl', 'red-black', 'balancing'],
    answer: `Both are self-balancing BSTs that guarantee **O(log n)** search, insert, and delete. They differ in **how strictly** they balance:

- **AVL** — subtree heights differ by **≤ 1**. Tighter balance → shorter tree → faster *lookups*, but more rotations on every write.
- **Red-black** — color rules keep the longest path **≤ 2×** the shortest. Looser balance → **fewer rotations per update**, slightly taller tree.

:::senior
Java's \`TreeMap\`/\`TreeSet\` and C++'s \`std::map\` use **red-black** trees because general-purpose maps do lots of writes, and cheaper rebalancing wins. Prefer AVL only when reads massively dominate writes.
:::`,
  },
  {
    id: 'dsa-tree-trie-use',
    question: 'What is a trie, and when should you use one instead of a hash set?',
    difficulty: 'Medium',
    category: 'Trees',
    tags: ['trie', 'prefix-tree', 'strings'],
    answer: `A **trie** (prefix tree) stores strings by **branching on each character**; the path from the root to a node spells a prefix, and a flag marks where a complete word ends. Words with a shared prefix share the same path.

Looking up a key of length \`L\` costs **O(L)** — independent of how many words are stored.

Use a trie when the problem is about **prefixes**: **autocomplete**, **spell-check**, **longest common prefix**, **word search / Boggle**, and **IP routing**. A hash set can test exact whole-word membership in O(L) too, but it **cannot answer prefix queries** because hashing scatters related keys.`,
  },
  {
    id: 'dsa-tree-dfs-vs-bfs',
    question: 'How do you decide between DFS and BFS for a tree problem?',
    difficulty: 'Medium',
    category: 'Trees',
    tags: ['dfs', 'bfs', 'strategy'],
    answer: `Match the traversal to what the question asks:

- **DFS** (recursion) for anything about a **root-to-leaf path** or a **whole-subtree aggregate** — height, diameter, path sum, validate, count. State flows naturally down one path. Space: **O(h)** stack.
- **BFS** (queue) for **shortest path / minimum depth / nearest level** and **level-by-level** output. The first time BFS reaches a target it is via the fewest edges. Space: **O(w)** queue.

:::tip
For **minimum depth**, BFS can stop at the first leaf it dequeues, while DFS must still probe every branch. "Nearest something" → BFS; "depth of a path / subtree property" → DFS.
:::`,
  },
  {
    id: 'dsa-tree-recursion-template',
    question: 'Describe the general recursive template that solves most tree problems.',
    difficulty: 'Medium',
    category: 'Trees',
    tags: ['recursion', 'patterns'],
    answer: `**Solve the left subtree, solve the right subtree, then combine at the current node.** The only things that change per problem are the **base case** for \`null\` and the **combine** step.

\`\`\`java
Result solve(Node node) {
    if (node == null) return BASE_CASE;
    Result l = solve(node.left);   // trust the recursion
    Result r = solve(node.right);
    return combine(l, r, node);    // local work here
}
\`\`\`

Height is \`1 + max(l, r)\`; diameter tracks \`l + r\` as a side effect; path sum subtracts on the way down; LCA checks which side each target came back on. Same skeleton, different merge.`,
  },
  {
    id: 'dsa-tree-lca',
    question: 'How do you find the lowest common ancestor (LCA) of two nodes in a binary tree?',
    difficulty: 'Hard',
    category: 'Trees',
    tags: ['lca', 'recursion'],
    answer: `Recurse from the root. If a node is \`null\` or *is* one of the two targets, return it. Otherwise recurse into both children:

- If **both** sides return non-null, the two targets are on opposite sides → the **current node is the LCA**.
- Otherwise propagate up whichever side is non-null.

\`\`\`java
Node lca(Node n, Node p, Node q) {
    if (n == null || n == p || n == q) return n;
    Node l = lca(n.left,  p, q);
    Node r = lca(n.right, p, q);
    if (l != null && r != null) return n;   // split point
    return l != null ? l : r;
}
\`\`\`

Runs in **O(n)** time, **O(h)** stack space. (In a *BST* you can do better: descend left/right by comparing values until the paths split.)`,
  },
  {
    id: 'dsa-tree-max-depth',
    question: 'How do you compute the maximum depth (height) of a binary tree?',
    difficulty: 'Easy',
    category: 'Trees',
    tags: ['recursion', 'height', 'dfs'],
    answer: `A tree's height is **1 + the taller of its two subtrees** — a direct recursion off the tree's self-similar shape.

\`\`\`java
int maxDepth(Node n) {
  if (n == null) return 0;               // empty subtree: height 0
  return 1 + Math.max(maxDepth(n.left), maxDepth(n.right));
}
\`\`\`

**O(n) time** (each node visited once), **O(h) space** for the recursion stack — O(log n) if balanced, O(n) if skewed.

:::tip
This is the simplest instance of the universal tree template: solve both children, then combine at the node. Minimum depth looks similar but must guard against a null child (a node with one child is **not** a leaf).
:::`,
  },
  {
    id: 'dsa-tree-invert',
    question: 'How do you invert (mirror) a binary tree?',
    difficulty: 'Easy',
    category: 'Trees',
    tags: ['recursion', 'mirror'],
    answer: `Swap the left and right child of **every** node — recursively.

\`\`\`java
Node invert(Node n) {
  if (n == null) return null;
  Node t = n.left; n.left = n.right; n.right = t; // swap
  invert(n.left);
  invert(n.right);
  return n;
}
\`\`\`

**O(n) time, O(h) stack.** It works top-down or bottom-up — the swap and the two recursive calls commute.

:::note
Famous for the tweet mocking it as a gatekeeping interview question, it is genuinely a one-liner once you see it as "swap children everywhere." BFS or DFS both work; only the swap matters.
:::`,
  },
  {
    id: 'dsa-tree-symmetric',
    question: 'How do you check whether a binary tree is a mirror image of itself?',
    difficulty: 'Easy',
    category: 'Trees',
    tags: ['recursion', 'symmetry'],
    answer: `Compare the two subtrees as **mirrors**: a tree is symmetric if the left subtree mirrors the right. Recurse with **two pointers moving in opposite directions**.

\`\`\`java
boolean isSymmetric(Node root) {
  return root == null || mirror(root.left, root.right);
}
boolean mirror(Node a, Node b) {
  if (a == null || b == null) return a == b;   // both null → ok
  return a.val == b.val
      && mirror(a.left,  b.right)              // outer pair
      && mirror(a.right, b.left);              // inner pair
}
\`\`\`

The key is pairing \`a.left\` with \`b.right\` and \`a.right\` with \`b.left\` — mirrored positions. **O(n) time, O(h) space.**

:::gotcha
Symmetry is about **structure and values mirrored**, not the same as "left subtree equals right subtree." A same-shape check would miss the crossed comparison.
:::`,
  },
  {
    id: 'dsa-tree-level-order',
    question: 'How do you produce a level-by-level (BFS) traversal of a binary tree?',
    difficulty: 'Easy',
    category: 'Trees',
    tags: ['bfs', 'queue', 'level-order'],
    answer: `Use a **queue**. Process the tree one level at a time by capturing the queue's **size** at the start of each level — that many nodes belong to the current level.

\`\`\`java
Queue<Node> q = new ArrayDeque<>();
if (root != null) q.add(root);
while (!q.isEmpty()) {
  int levelSize = q.size();                 // freeze this level's count
  List<Integer> level = new ArrayList<>();
  for (int i = 0; i < levelSize; i++) {
    Node n = q.poll();
    level.add(n.val);
    if (n.left != null)  q.add(n.left);
    if (n.right != null) q.add(n.right);
  }
  result.add(level);
}
\`\`\`

**O(n) time, O(w) space** (w = max width). Snapshotting \`levelSize\` before the inner loop is what separates the levels — the same skeleton yields zigzag order, right-side view, and level averages.`,
  },
  {
    id: 'dsa-tree-iterative-inorder',
    question: 'How do you do an in-order traversal iteratively, without recursion?',
    difficulty: 'Medium',
    category: 'Trees',
    tags: ['traversal', 'stack', 'inorder'],
    answer: `Simulate the call stack with an **explicit stack**: push the entire left spine, then pop-visit-and-go-right.

\`\`\`java
Deque<Node> st = new ArrayDeque<>();
Node cur = root;
while (cur != null || !st.isEmpty()) {
  while (cur != null) { st.push(cur); cur = cur.left; } // go left
  cur = st.pop();                                        // visit
  System.out.print(cur.val + " ");
  cur = cur.right;                                       // then right
}
\`\`\`

**O(n) time, O(h) space.** The explicit stack mirrors exactly what recursion does implicitly — useful when recursion depth would overflow, or when you need to **pause/resume** the traversal (e.g. a BST iterator's \`next()\`).

:::senior
For **O(1) space**, mention **Morris traversal**: it threads temporary links to the in-order predecessor instead of a stack, then restores them.
:::`,
  },
  {
    id: 'dsa-tree-validate-bst',
    question: 'How do you validate that a binary tree is a valid BST?',
    difficulty: 'Medium',
    category: 'Trees',
    tags: ['bst', 'validation', 'recursion'],
    answer: `Each node must lie within a **(min, max) range** that tightens as you descend — not merely be greater/less than its immediate parent.

\`\`\`java
boolean valid(Node n, long lo, long hi) {
  if (n == null) return true;
  if (n.val <= lo || n.val >= hi) return false;
  return valid(n.left, lo, n.val)      // left: upper bound becomes node
      && valid(n.right, n.val, hi);    // right: lower bound becomes node
}
// call: valid(root, Long.MIN_VALUE, Long.MAX_VALUE)
\`\`\`

**O(n) time, O(h) space.**

:::gotcha
The #1 wrong answer only checks \`node.left.val < node.val < node.right.val\` locally — it passes invalid trees where a deep left-subtree node exceeds an ancestor. Use **inherited bounds**. And use \`long\` bounds (or the in-order-predecessor trick) so a node equal to \`Integer.MIN_VALUE\` doesn't break the comparison.
:::`,
  },
  {
    id: 'dsa-tree-diameter',
    question: 'How do you find the diameter (longest path between any two nodes) of a binary tree?',
    difficulty: 'Medium',
    category: 'Trees',
    tags: ['recursion', 'diameter', 'height'],
    answer: `The longest path through a node is \`leftHeight + rightHeight\`. Compute **heights** in one post-order pass and track the best sum as a **side effect**.

\`\`\`java
int best = 0;
int height(Node n) {
  if (n == null) return 0;
  int l = height(n.left), r = height(n.right);
  best = Math.max(best, l + r);   // path THROUGH n (in edges)
  return 1 + Math.max(l, r);      // height returned to parent
}
// diameter = best after height(root)
\`\`\`

**O(n) time, O(h) space.** The trick is that the function **returns** the height but **updates** the diameter along the way — one traversal computes both.

:::senior
This "return one quantity, side-update a global optimum" pattern also solves **max path sum**, **longest univalue path**, and **binary tree cameras** — any "best path/config anywhere in the tree" problem.
:::`,
  },
  {
    id: 'dsa-tree-kth-smallest-bst',
    question: 'How do you find the k-th smallest element in a BST?',
    difficulty: 'Medium',
    category: 'Trees',
    tags: ['bst', 'inorder', 'selection'],
    answer: `An **in-order** traversal of a BST yields keys in ascending order — so stop at the **k-th** one. An iterative in-order lets you halt early without visiting the whole tree.

\`\`\`java
Deque<Node> st = new ArrayDeque<>();
Node cur = root;
while (cur != null || !st.isEmpty()) {
  while (cur != null) { st.push(cur); cur = cur.left; }
  cur = st.pop();
  if (--k == 0) return cur.val;   // k-th smallest reached
  cur = cur.right;
}
\`\`\`

**O(h + k) time** — you descend one spine (O(h)) then pop k nodes. For the k-th **largest**, do a reverse in-order (right, node, left).

:::senior
If the tree is queried repeatedly and can be **modified**, augment each node with its **subtree size**; then k-th smallest is O(h) by comparing k against the left subtree's count at each step.
:::`,
  },
  {
    id: 'dsa-tree-balanced-check',
    question: 'How do you check whether a binary tree is height-balanced in O(n)?',
    difficulty: 'Medium',
    category: 'Trees',
    tags: ['recursion', 'balanced', 'height'],
    answer: `The naive approach computes height at every node → O(n²). Do it **bottom-up** in one pass, returning a special **sentinel (−1)** the moment any subtree is unbalanced so the failure propagates up.

\`\`\`java
int check(Node n) {
  if (n == null) return 0;
  int l = check(n.left);  if (l == -1) return -1;
  int r = check(n.right); if (r == -1) return -1;
  if (Math.abs(l - r) > 1) return -1;      // unbalanced here
  return 1 + Math.max(l, r);               // otherwise real height
}
// balanced iff check(root) != -1
\`\`\`

By returning height and detecting imbalance in the **same** post-order pass, each node is visited once → **O(n) time, O(h) space**.

:::senior
"Balanced" here means every node's subtree heights differ by ≤ 1 (AVL-style). The −1 sentinel avoids re-walking subtrees to recompute height — the core optimization over the O(n²) version.
:::`,
  },
  {
    id: 'dsa-tree-trie-implement',
    question: 'How do you implement a trie with insert, search, and startsWith?',
    difficulty: 'Medium',
    category: 'Trees',
    tags: ['trie', 'prefix-tree', 'design'],
    answer: `Each node holds an array of child links (26 for lowercase) and an \`isWord\` flag. All three operations walk the tree character by character in **O(L)**.

\`\`\`java
class Trie {
  Trie[] next = new Trie[26];
  boolean isWord;

  void insert(String w) {
    Trie n = this;
    for (char c : w.toCharArray()) {
      int i = c - 'a';
      if (n.next[i] == null) n.next[i] = new Trie();
      n = n.next[i];
    }
    n.isWord = true;
  }
  boolean startsWith(String p) { return walk(p) != null; }
  boolean search(String w) { Trie n = walk(w); return n != null && n.isWord; }

  private Trie walk(String s) {
    Trie n = this;
    for (char c : s.toCharArray()) {
      n = n.next[c - 'a'];
      if (n == null) return null;
    }
    return n;
  }
}
\`\`\`

The only difference between \`search\` and \`startsWith\` is the **\`isWord\` check** at the end — a prefix need not be a complete word. **O(L) per op**, independent of the number of stored words.`,
  },
  {
    id: 'dsa-tree-serialize',
    question: 'How do you serialize and deserialize a binary tree?',
    difficulty: 'Hard',
    category: 'Trees',
    tags: ['serialization', 'preorder', 'design'],
    answer: `Use a **pre-order** traversal that writes an explicit marker (e.g. \`#\`) for **null** children — those markers encode the shape so it can be rebuilt unambiguously.

\`\`\`java
// serialize
void write(Node n, StringBuilder sb) {
  if (n == null) { sb.append("# "); return; }
  sb.append(n.val).append(' ');
  write(n.left, sb); write(n.right, sb);
}
// deserialize — consume tokens in the same pre-order
Node read(Queue<String> q) {
  String t = q.poll();
  if (t.equals("#")) return null;
  Node n = new Node(Integer.parseInt(t));
  n.left  = read(q);     // build left before right (pre-order)
  n.right = read(q);
  return n;
}
\`\`\`

Both directions are **O(n)**. The null markers are essential — without them the same node sequence could describe multiple trees.

:::senior
Pre-order works because the **first unread token is always the current subtree's root**. For a BST specifically, you can skip the null markers and reconstruct from bounds, saving space.
:::`,
  },
  {
    id: 'dsa-tree-build-from-traversals',
    question: 'How do you rebuild a binary tree from its preorder and inorder traversals?',
    difficulty: 'Hard',
    category: 'Trees',
    tags: ['construction', 'preorder', 'inorder'],
    answer: `**Preorder's first element is the root.** Find it in **inorder**: everything to its left is the left subtree, everything right is the right subtree. Recurse. A hash map of value→inorder-index makes each lookup O(1).

\`\`\`java
Map<Integer,Integer> pos;     // value -> index in inorder
int pre = 0;
Node build(int[] preorder, int lo, int hi) {
  if (lo > hi) return null;
  int rootVal = preorder[pre++];
  Node root = new Node(rootVal);
  int mid = pos.get(rootVal);              // split point in inorder
  root.left  = build(preorder, lo, mid - 1);
  root.right = build(preorder, mid + 1, hi);
  return root;
}
\`\`\`

Consuming \`preorder\` left to right (via \`pre\`) and splitting \`inorder\` by the root index reconstructs the tree in **O(n)**.

:::gotcha
Order matters: recurse **left before right** because preorder emits the whole left subtree before the right. The map is what turns the O(n) per-level search into O(1), keeping the total at O(n) instead of O(n²).
:::`,
  },
];

export default questions;
