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
];

export default questions;
