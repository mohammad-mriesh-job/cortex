import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'dsa-ll-array-vs-list',
    question: 'When would you choose a linked list over an array (or ArrayList)?',
    difficulty: 'Easy',
    category: 'Linked Lists',
    tags: ['linked-list', 'array', 'trade-offs', 'big-o'],
    answer: `Choose a linked list when you need **O(1) insert/delete at a known node** and rarely need random access.

| Operation | Array / ArrayList | Linked List |
|-----------|:-----------------:|:-----------:|
| \`get(i)\` | **O(1)** | O(n) |
| insert/delete at head | O(n) | **O(1)** |
| insert/delete mid (at node) | O(n) | **O(1)** |
| cache locality | **excellent** | poor |

- **Array wins** for indexed access, iteration speed (cache prefetching), and memory (no per-node pointer).
- **Linked list wins** when the splice itself is the feature — LRU cache eviction, adjacency lists, or building a list front-to-back.

:::senior
In practice \`ArrayList\` beats \`LinkedList\` more often than textbooks suggest: contiguous memory and no node-object overhead usually outweigh the theoretical insert advantage. Reach for a linked list when you already **hold the node** you want to splice.
:::`,
  },
  {
    id: 'dsa-ll-singly-vs-doubly',
    question: 'What is the difference between a singly and doubly linked list?',
    difficulty: 'Easy',
    category: 'Linked Lists',
    tags: ['linked-list', 'singly', 'doubly', 'node'],
    answer: `A **singly** linked node has one pointer (\`next\`); a **doubly** linked node has two (\`prev\` and \`next\`).

\`\`\`java
class Singly { int val; Singly next; }
class Doubly { int val; Doubly prev, next; }
\`\`\`

- **Singly** — leaner memory, forward-only traversal. To delete a node you need its **predecessor**.
- **Doubly** — one extra pointer per node, but you can traverse **backward** and **delete a node in O(1)** given only that node (you can reach \`prev\` directly).

:::note
The \`prev\` pointer is exactly what makes an LRU cache's \`LinkedHashMap\`-style eviction O(1): given the node to remove, you splice it out without walking from the head.
:::`,
  },
  {
    id: 'dsa-ll-insert-order',
    question: 'To insert a new node after a node you hold as `prev`, why must you set `node.next` before `prev.next`?',
    difficulty: 'Easy',
    category: 'Linked Lists',
    tags: ['linked-list', 'insert', 'pointers'],
    answer: `Because relinking \`prev\` first destroys the pointer to the rest of the list.

\`\`\`java
// CORRECT
node.next = prev.next;   // new node points at prev's old successor
prev.next = node;        // prev now points at the new node

// WRONG — loses the tail
prev.next = node;        // prev.next is now 'node'...
node.next = prev.next;   // ...so node.next = node (self-loop!)
\`\`\`

Once \`prev.next = node\` runs, \`prev.next\` no longer refers to the old successor, so reading it back gives you \`node\` itself. Always wire the **new node's forward link first**, then relink the predecessor.`,
  },
  {
    id: 'dsa-ll-reverse-iterative',
    question: 'Reverse a singly linked list iteratively. Walk through the pointers.',
    difficulty: 'Medium',
    category: 'Linked Lists',
    tags: ['linked-list', 'reversal', 'pointers', 'iterative'],
    answer: `Keep three pointers — \`prev\`, \`curr\`, \`next\` — and flip each node's arrow backward.

\`\`\`java
Node reverse(Node head) {
    Node prev = null, curr = head;
    while (curr != null) {
        Node next = curr.next;  // 1: save the rest of the list
        curr.next = prev;       // 2: flip this node's arrow
        prev = curr;            // 3: advance prev
        curr = next;            // 4: advance curr
    }
    return prev;                // new head
}
\`\`\`

- **\`next\`** is the seatbelt: without saving it, step 2 orphans the remaining nodes.
- After the loop \`curr == null\` and **\`prev\` is the new head**.
- **O(n) time, O(1) space.**

:::gotcha
The recursive version is elegant but uses **O(n) stack space** — mention the iterative one first in interviews unless asked otherwise.
:::`,
  },
  {
    id: 'dsa-ll-find-middle',
    question: 'How do you find the middle of a linked list in one pass?',
    difficulty: 'Medium',
    category: 'Linked Lists',
    tags: ['linked-list', 'fast-slow', 'two-pointers'],
    answer: `Use **fast/slow pointers**: \`slow\` advances one node, \`fast\` advances two. When \`fast\` runs off the end, \`slow\` is at the middle.

\`\`\`java
Node slow = head, fast = head;
while (fast != null && fast.next != null) {
    slow = slow.next;        // +1
    fast = fast.next.next;   // +2
}
return slow; // middle
\`\`\`

Because \`fast\` covers twice the distance, it reaches the end when \`slow\` has covered half. **O(n) time, O(1) space** — and no need to count the length first.

:::tip
For an **even**-length list this returns the **second** middle. For the first middle, start \`fast = head.next\`.
:::`,
  },
  {
    id: 'dsa-ll-floyd-cycle',
    question: "Explain Floyd's cycle detection and how to find where the cycle starts.",
    difficulty: 'Hard',
    category: 'Linked Lists',
    tags: ['linked-list', 'floyd', 'cycle', 'fast-slow'],
    answer: `**Detection** — run a slow (+1) and fast (+2) pointer. In a cycle the fast pointer eventually **laps** the slow one and they collide; with no cycle, \`fast\` reaches \`null\`.

\`\`\`java
boolean hasCycle(Node head) {
    Node slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;  // met inside the loop
    }
    return false;
}
\`\`\`

**Finding the entry** — after they meet, reset one pointer to \`head\`, then advance **both by one**. They meet at the cycle's start:

\`\`\`java
slow = head;
while (slow != fast) { slow = slow.next; fast = fast.next; }
return slow; // cycle entry
\`\`\`

This works because the distance from the head to the entry equals the distance from the meeting point to the entry (mod the loop length). **O(n) time, O(1) space** — versus an O(n)-space hash set of visited nodes.`,
  },
  {
    id: 'dsa-ll-merge-sorted',
    question: 'Merge two sorted linked lists into one sorted list.',
    difficulty: 'Medium',
    category: 'Linked Lists',
    tags: ['linked-list', 'merge', 'dummy-head', 'sorted'],
    answer: `Walk both lists and splice the **smaller head** onto a result built behind a **dummy** node.

\`\`\`java
Node merge(Node a, Node b) {
    Node dummy = new Node(0), tail = dummy;
    while (a != null && b != null) {
        if (a.val <= b.val) { tail.next = a; a = a.next; }
        else                { tail.next = b; b = b.next; }
        tail = tail.next;
    }
    tail.next = (a != null) ? a : b;  // attach the remainder
    return dummy.next;
}
\`\`\`

The **dummy head** removes the "is the result empty?" special case — \`tail\` always exists, so you just append. **O(n + m) time, O(1) space** (rewiring existing nodes, allocating none).

:::note
Use \`<=\` (not \`<\`) to keep the merge **stable** — equal elements keep their original relative order.
:::`,
  },
  {
    id: 'dsa-ll-remove-nth-from-end',
    question: 'Remove the nth node from the end of a linked list in one pass.',
    difficulty: 'Medium',
    category: 'Linked Lists',
    tags: ['linked-list', 'two-pointers', 'gap', 'dummy-head'],
    answer: `Use a **gap of n** between two pointers. Advance \`fast\` n steps ahead, then move both until \`fast\` hits the end — \`slow\` now sits just **before** the target.

\`\`\`java
Node removeNthFromEnd(Node head, int n) {
    Node dummy = new Node(0);
    dummy.next = head;
    Node fast = dummy, slow = dummy;
    for (int i = 0; i < n; i++) fast = fast.next; // open the gap
    while (fast.next != null) {                   // walk both
        fast = fast.next;
        slow = slow.next;
    }
    slow.next = slow.next.next;                   // unlink target
    return dummy.next;
}
\`\`\`

The **dummy** node cleanly handles removing the **head** itself (n == length). Single pass — **O(n) time, O(1) space**.`,
  },
  {
    id: 'dsa-ll-detect-palindrome',
    question: 'Check whether a singly linked list is a palindrome in O(1) space.',
    difficulty: 'Hard',
    category: 'Linked Lists',
    tags: ['linked-list', 'palindrome', 'reversal', 'fast-slow'],
    answer: `Combine two patterns: **find the middle** (fast/slow), **reverse the second half**, then compare the halves node by node.

\`\`\`java
boolean isPalindrome(Node head) {
    // 1. find middle
    Node slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next; fast = fast.next.next;
    }
    // 2. reverse second half
    Node prev = null;
    while (slow != null) {
        Node next = slow.next; slow.next = prev; prev = slow; slow = next;
    }
    // 3. compare
    Node l = head, r = prev;
    while (r != null) {
        if (l.val != r.val) return false;
        l = l.next; r = r.next;
    }
    return true;
}
\`\`\`

**O(n) time, O(1) space.** The naive approach copies values into an array/deque and checks with two pointers — simpler, but **O(n) space**.

:::senior
A clean interview follow-up is "restore the list afterward." Re-reverse the second half before returning if the caller must see the list unmodified.
:::`,
  },
  {
    id: 'dsa-ll-dummy-node',
    question: 'What is the "dummy head" (sentinel) trick and why is it so common in linked-list code?',
    difficulty: 'Easy',
    category: 'Linked Lists',
    tags: ['linked-list', 'dummy-head', 'sentinel', 'idiom'],
    answer: `A **dummy head** is a throwaway node placed *before* the real head so that \`tail.next = ...\` always works — even when the result is empty or you delete the first node.

\`\`\`java
Node dummy = new Node(0);
dummy.next = head;
// ... operate using dummy as a stable anchor ...
return dummy.next; // the real head (may have changed)
\`\`\`

It eliminates the "is this the first node?" special case that otherwise litters merge, partition, remove-nth, and insert routines. You return \`dummy.next\` at the end.

:::key
Whenever an operation might change the **head** of the list, reach for a dummy node. It converts edge cases into the general case and makes the code both shorter and less bug-prone.
:::`,
  },
  {
    id: 'dsa-ll-remove-duplicates-sorted',
    question: 'Remove duplicates from a sorted linked list.',
    difficulty: 'Easy',
    category: 'Linked Lists',
    tags: ['linked-list', 'sorted', 'two-pointers'],
    answer: `Because the list is **sorted**, duplicates are adjacent. Walk with one pointer; whenever \`cur.val == cur.next.val\`, splice the next node out — otherwise advance.

\`\`\`java
Node cur = head;
while (cur != null && cur.next != null) {
  if (cur.val == cur.next.val) cur.next = cur.next.next; // skip dup
  else                         cur = cur.next;           // advance
}
return head;
\`\`\`

**O(n) time, O(1) space.** Don't advance \`cur\` after unlinking — there may be a run of three or more equal values.

:::note
The variant "remove **all** nodes that have duplicates" (keep only distinct values) needs a **dummy head**, because the real head itself might be deleted.
:::`,
  },
  {
    id: 'dsa-ll-reverse-recursive',
    question: 'Reverse a singly linked list recursively.',
    difficulty: 'Medium',
    category: 'Linked Lists',
    tags: ['linked-list', 'recursion', 'reversal'],
    answer: `Recurse to the end to get the new head, then on the way back **flip each pointer**: make the next node point back at the current one.

\`\`\`java
Node reverse(Node head) {
  if (head == null || head.next == null) return head; // base: new head
  Node newHead = reverse(head.next);
  head.next.next = head;   // the node ahead points back to me
  head.next = null;        // sever my old forward link
  return newHead;          // propagate the new head unchanged
}
\`\`\`

The key line is \`head.next.next = head\` — the successor's \`next\` is redirected back to \`head\`.

:::gotcha
Elegant, but it uses **O(n) stack space** and risks \`StackOverflowError\` on long lists. Prefer the iterative three-pointer version (O(1) space) unless recursion is explicitly requested.
:::`,
  },
  {
    id: 'dsa-ll-add-two-numbers',
    question: 'Two numbers are stored as linked lists with digits in reverse order. Return their sum as a list.',
    difficulty: 'Medium',
    category: 'Linked Lists',
    tags: ['linked-list', 'carry', 'dummy-head'],
    answer: `Reverse order is convenient — the heads are the ones digits, so you add left to right carrying as you go. Use a **dummy head** and a running **carry**.

\`\`\`java
Node dummy = new Node(0), tail = dummy;
int carry = 0;
while (a != null || b != null || carry != 0) {
  int sum = carry
          + (a != null ? a.val : 0)
          + (b != null ? b.val : 0);
  carry = sum / 10;
  tail.next = new Node(sum % 10);
  tail = tail.next;
  if (a != null) a = a.next;
  if (b != null) b = b.next;
}
return dummy.next;
\`\`\`

**O(max(m, n)) time.** The three-part loop condition handles **different lengths** and a **final carry** (e.g. 5 + 5 → a new leading node) in one clean loop.

:::gotcha
Forgetting \`carry != 0\` in the loop condition drops the final carry — \`[5] + [5]\` would wrongly give \`[0]\` instead of \`[0,1]\`.
:::`,
  },
  {
    id: 'dsa-ll-intersection',
    question: 'Find the node where two singly linked lists intersect, in O(1) space.',
    difficulty: 'Medium',
    category: 'Linked Lists',
    tags: ['linked-list', 'two-pointers', 'intersection'],
    answer: `Walk two pointers; when one reaches the end, **redirect it to the other list's head**. After at most two passes they have both traveled \`lenA + lenB\` nodes, so they align at the intersection (or both hit \`null\` together).

\`\`\`java
Node a = headA, b = headB;
while (a != b) {
  a = (a == null) ? headB : a.next;
  b = (b == null) ? headA : b.next;
}
return a; // intersection node, or null if none
\`\`\`

By switching lists, both pointers cancel out the length difference — the longer list's extra prefix is absorbed. **O(m + n) time, O(1) space**, versus the O(n)-space hash-set-of-visited-nodes approach.

:::tip
The elegant termination is that if the lists **don't** intersect, both pointers become \`null\` on the same step, so the loop exits returning \`null\` — no special case needed.
:::`,
  },
  {
    id: 'dsa-ll-odd-even',
    question: 'Group all odd-indexed nodes followed by the even-indexed nodes, in place.',
    difficulty: 'Medium',
    category: 'Linked Lists',
    tags: ['linked-list', 'pointers', 'reorder'],
    answer: `Weave the list into **two chains** — odd positions and even positions — then stitch the even chain onto the tail of the odd one. (Indexing is by **position**, not value.)

\`\`\`java
if (head == null) return head;
Node odd = head, even = head.next, evenHead = even;
while (even != null && even.next != null) {
  odd.next = even.next; odd = odd.next;    // extend odd chain
  even.next = odd.next; even = even.next;  // extend even chain
}
odd.next = evenHead;                        // odd tail -> even head
return head;
\`\`\`

**O(n) time, O(1) space.** Save \`evenHead\` before the loop — you need it to reconnect, since the even chain's head is lost once you start rewiring.`,
  },
  {
    id: 'dsa-ll-swap-pairs',
    question: 'Swap every two adjacent nodes in a linked list (swap nodes, not values).',
    difficulty: 'Medium',
    category: 'Linked Lists',
    tags: ['linked-list', 'dummy-head', 'pointers'],
    answer: `Use a **dummy head** and a \`prev\` pointer sitting before each pair. Rewire the three links so the pair flips, then advance \`prev\` two nodes.

\`\`\`java
Node dummy = new Node(0); dummy.next = head;
Node prev = dummy;
while (prev.next != null && prev.next.next != null) {
  Node first = prev.next, second = first.next;
  first.next = second.next;   // first now points past the pair
  second.next = first;        // second precedes first
  prev.next = second;         // prev points at the new front
  prev = first;               // move to before the next pair
}
return dummy.next;
\`\`\`

**O(n) time, O(1) space.** Swapping the **nodes** (not just values) is what interviewers ask for; the dummy head removes the special case for the first pair, which changes the list's head.`,
  },
  {
    id: 'dsa-ll-rotate-list',
    question: 'Rotate a linked list to the right by k places.',
    difficulty: 'Medium',
    category: 'Linked Lists',
    tags: ['linked-list', 'rotation', 'cycle'],
    answer: `**Close the list into a ring**, find the new tail, then break the ring. First count the length and connect tail to head; the new tail is \`length − (k mod length)\` steps from the old head.

\`\`\`java
if (head == null) return head;
int len = 1; Node tail = head;
while (tail.next != null) { tail = tail.next; len++; }
tail.next = head;                    // make it circular
k %= len;
int steps = len - k;                 // steps to the new tail
Node newTail = head;
for (int i = 1; i < steps; i++) newTail = newTail.next;
Node newHead = newTail.next;
newTail.next = null;                 // break the ring
return newHead;
\`\`\`

**O(n) time, O(1) space.** Taking \`k %= len\` is essential — \`k\` can be far larger than the list, and a full rotation is a no-op.`,
  },
  {
    id: 'dsa-ll-reorder-list',
    question: 'Reorder a list L0→L1→…→Ln as L0→Ln→L1→Ln-1→… in place.',
    difficulty: 'Medium',
    category: 'Linked Lists',
    tags: ['linked-list', 'fast-slow', 'reversal', 'merge'],
    answer: `Compose three patterns: **find the middle** (fast/slow), **reverse the second half**, then **merge** the two halves alternately.

\`\`\`java
// 1. middle
Node slow = head, fast = head;
while (fast.next != null && fast.next.next != null) {
  slow = slow.next; fast = fast.next.next;
}
// 2. reverse second half (starting at slow.next)
Node prev = null, cur = slow.next; slow.next = null;
while (cur != null) { Node n = cur.next; cur.next = prev; prev = cur; cur = n; }
// 3. weave first half with reversed second half
Node a = head, b = prev;
while (b != null) {
  Node an = a.next, bn = b.next;
  a.next = b; b.next = an;
  a = an; b = bn;
}
\`\`\`

**O(n) time, O(1) space.** Each sub-step is a standard linked-list primitive; the skill is decomposing the problem into "middle + reverse + merge."`,
  },
  {
    id: 'dsa-ll-reverse-k-group',
    question: 'Reverse the nodes of a linked list k at a time.',
    difficulty: 'Hard',
    category: 'Linked Lists',
    tags: ['linked-list', 'reversal', 'groups'],
    answer: `For each block of \`k\`, **first check** that \`k\` nodes remain (a leftover tail is left as-is), then reverse that block and reconnect it to the previous block's tail.

\`\`\`java
Node dummy = new Node(0); dummy.next = head;
Node groupPrev = dummy;
while (true) {
  Node kth = groupPrev;
  for (int i = 0; i < k && kth != null; i++) kth = kth.next;
  if (kth == null) break;                 // fewer than k left → stop
  Node groupNext = kth.next, prev = groupNext, cur = groupPrev.next;
  while (cur != groupNext) {               // reverse the block
    Node n = cur.next; cur.next = prev; prev = cur; cur = n;
  }
  Node newTail = groupPrev.next;           // old head is new tail
  groupPrev.next = kth;                    // wire prev block → reversed head
  groupPrev = newTail;
}
return dummy.next;
\`\`\`

**O(n) time, O(1) space.** The subtlety is bookkeeping across group boundaries: the old group **head becomes its tail**, and you must relink both ends.

:::senior
The "count-then-reverse-else-leave" guard is what distinguishes this from a plain reversal — partial final groups stay in original order.
:::`,
  },
  {
    id: 'dsa-ll-copy-random-pointer',
    question: 'Deep-copy a linked list where each node also has a random pointer to any node.',
    difficulty: 'Hard',
    category: 'Linked Lists',
    tags: ['linked-list', 'clone', 'interleaving'],
    answer: `The challenge is that a random pointer may target a node you haven't cloned yet. A hash map \`original → copy\` solves it in O(n) space. The **O(1)-space** trick **interleaves** copies into the original list:

1. After each node insert its clone: \`A → A' → B → B' → …\`.
2. Set each clone's random: \`A'.random = A.random.next\` (the clone sits right after the original's target).
3. **Unweave** the two lists apart.

\`\`\`java
// step 2: wire random pointers using the interleaving
for (Node n = head; n != null; n = n.next.next)
  if (n.random != null) n.next.random = n.random.next;
\`\`\`

Because each clone sits immediately **after** its original, \`n.random.next\` *is* the cloned target — no map needed. **O(n) time, O(1) extra space.**

:::tip
Start with the clear hash-map version (\`Map<Node,Node>\`), then offer the interleaving optimization — it shows you know both the readable and the space-optimal solutions.
:::`,
  },
];

export default questions;
