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
];

export default questions;
