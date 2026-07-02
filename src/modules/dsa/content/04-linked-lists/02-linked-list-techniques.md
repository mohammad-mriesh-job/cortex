---
title: Linked List Techniques
category: Linked Lists
categoryOrder: 4
order: 2
level: Intermediate
summary: The four patterns that crack almost every linked-list interview — fast/slow pointers, Floyd cycle detection, iterative reversal, and merging sorted lists.
tags: linked list, fast slow pointers, floyd, cycle detection, reversal, merge, technique
---

Once you can wire pointers, a handful of **patterns** unlock most linked-list problems. All four
below run in **O(n) time / O(1) space** and share one idea: you never need random access — you
just need the right *pointers* moving at the right *speeds*.

## The four patterns

| Pattern | Pointers | Solves |
|--|--|--|
| **Fast / slow** | `slow` +1, `fast` +2 | find middle, nth-from-end |
| **Floyd cycle detection** | `slow` +1, `fast` +2 | is there a loop? where does it start? |
| **Iterative reversal** | `prev`, `curr`, `next` | reverse a list (or a sublist) |
| **Merge two sorted** | `p1`, `p2`, tail | combine sorted lists in order |

## Fast / slow: find the middle

Move `slow` one node and `fast` two nodes per step. When `fast` runs off the end, `slow` sits on
the **middle** — in a single pass, without ever counting the length.

```walkthrough
title: Find the middle with fast/slow pointers
code: |
  Node slow = head, fast = head;
  while (fast != null && fast.next != null) {
    slow = slow.next;        // +1
    fast = fast.next.next;   // +2
  }
  // slow is now the middle
steps:
  - text: 'Both start at the head of `10 → 20 → 30 → 40 → 50`. `slow` will crawl; `fast` will sprint at double speed.'
    array: [10, 20, 30, 40, 50]
    pointers: { 0: 'S/F' }
    line: 1
  - text: 'Step once: `slow` +1 to index 1, `fast` +2 to index 2. `fast` is pulling ahead.'
    array: [10, 20, 30, 40, 50]
    highlight: [1, 2]
    pointers: { 1: 'slow', 2: 'fast' }
    line: 3
  - text: 'Step again: `slow` +1 to index 2, `fast` +2 to index 4 (the last node).'
    array: [10, 20, 30, 40, 50]
    highlight: [2, 4]
    pointers: { 2: 'slow', 4: 'fast' }
    line: 4
  - text: '`fast.next` is `null`, so the loop stops. `slow` rests on **30** — the exact middle. One pass, no length count.'
    array: [10, 20, 30, 40, 50]
    sorted: [2]
    pointers: { 2: 'slow' }
    line: 6
```

:::tip
For an **even**-length list, this lands `slow` on the **second** of the two middles. Want the
first? Start `fast = head.next`, or stop when `fast.next.next == null`.
:::

## Floyd's cycle detection (tortoise & hare)

If a list has a **cycle**, a fast pointer moving 2× will eventually **lap** the slow pointer and
they collide *inside* the loop. If there is no cycle, `fast` simply reaches `null`. This is
**O(1) space** — no visited-set needed.

```walkthrough
title: Floyd's tortoise & hare — detect a cycle
code: |
  Node slow = head, fast = head;
  while (fast != null && fast.next != null) {
    slow = slow.next;        // tortoise +1
    fast = fast.next.next;   // hare +2
    if (slow == fast) return true;  // they met -> cycle
  }
  return false;              // fast hit null -> no cycle
steps:
  - text: 'List `A → B → C → D → E`, and `E.next` points **back to C** — a cycle over C, D, E. Both pointers start at A (index 0).'
    array: ['A', 'B', 'C', 'D', 'E']
    pointers: { 0: 'S/F' }
    line: 1
  - text: 'Step 1: `slow` → B (1), `fast` → C (2). No collision yet.'
    array: ['A', 'B', 'C', 'D', 'E']
    highlight: [1, 2]
    pointers: { 1: 'slow', 2: 'fast' }
    line: 3
  - text: 'Step 2: `slow` → C (2). `fast` goes D → E (its +2), landing on E (4). Still apart.'
    array: ['A', 'B', 'C', 'D', 'E']
    highlight: [2, 4]
    pointers: { 2: 'slow', 4: 'fast' }
    line: 4
  - text: 'Step 3: `slow` → D (3). `fast` moves E → C (wraps via the cycle) → D — so `fast` lands on D (3) too.'
    array: ['A', 'B', 'C', 'D', 'E']
    highlight: [3]
    pointers: { 3: 'S=F' }
    line: 5
  - text: '`slow == fast` at **D** — collision inside the loop. A cycle exists. On an acyclic list, `fast` would have hit `null` and we return false.'
    array: ['A', 'B', 'C', 'D', 'E']
    sorted: [3]
    pointers: { 3: 'MEET' }
    line: 5
```

:::senior
To find **where** the cycle starts: after the meeting point, reset one pointer to `head` and
advance both one step at a time — they meet exactly at the cycle's entry node. This falls out of
the algebra (distances are congruent modulo the loop length) and is the classic follow-up to
"detect a cycle."
:::

## Iterative reversal — the must-know

Reversal is the single most-asked linked-list operation. Keep three pointers — `prev`, `curr`,
`next` — and flip each node's arrow to point **backward**, one node at a time. `next` is the
seatbelt: you save the rest of the list *before* you overwrite `curr.next`.

```walkthrough
title: Reverse a linked list iteratively (prev / curr / next)
code: |
  Node prev = null, curr = head;
  while (curr != null) {
    Node next = curr.next;   // 1: save the rest of the list
    curr.next = prev;        // 2: flip this node's arrow backward
    prev = curr;             // 3: advance prev
    curr = next;             // 4: advance curr
  }
  return prev;               // prev is the new head
steps:
  - text: 'List `1 → 2 → 3`. `prev = null` (there is nothing behind the head yet), `curr` = node 1.'
    array: [1, 2, 3]
    pointers: { 0: 'curr' }
    line: 1
  - text: 'Save `next = curr.next` (node 2) so we don''t lose the tail. Flip: `curr.next = prev` → node 1 now points at `null`.'
    array: [1, 2, 3]
    highlight: [0]
    pointers: { 0: 'curr', 1: 'next' }
    line: 3
  - text: 'Advance: `prev` = node 1, `curr` = node 2. So far the reversed part is `1` (pointing to null); the rest is untouched.'
    array: [1, 2, 3]
    sorted: [0]
    pointers: { 0: 'prev', 1: 'curr' }
    line: 5
  - text: 'Save `next` = node 3. Flip `curr.next = prev` → node 2 now points at node 1. Reversed part is `2 → 1`.'
    array: [1, 2, 3]
    highlight: [1]
    sorted: [0]
    pointers: { 1: 'curr', 2: 'next' }
    line: 4
  - text: 'Advance: `prev` = node 2, `curr` = node 3. Flip node 3 → node 2. Reversed part is `3 → 2 → 1`.'
    array: [1, 2, 3]
    highlight: [2]
    sorted: [0, 1]
    pointers: { 2: 'curr' }
    line: 4
  - text: '`curr` advances to `null`, the loop ends, and we return `prev` = node 3 — the **new head** of `3 → 2 → 1`. O(n) time, O(1) space.'
    array: [3, 2, 1]
    sorted: [0, 1, 2]
    pointers: { 0: 'prev (new head)' }
    line: 8
```

:::gotcha
Skip the `next = curr.next` save and you are stuck: the moment you run `curr.next = prev` you
have overwritten the only pointer to the rest of the list. The three-pointer dance exists solely
to never lose that link.
:::

## Merge two sorted lists

Walk both lists with `p1` and `p2`, always splicing the **smaller** head onto a growing result.
A **dummy** head node removes the "is the result empty?" special case.

```java
Node dummy = new Node(0), tail = dummy;
while (p1 != null && p2 != null) {
    if (p1.val <= p2.val) { tail.next = p1; p1 = p1.next; }
    else                  { tail.next = p2; p2 = p2.next; }
    tail = tail.next;
}
tail.next = (p1 != null) ? p1 : p2;   // attach whatever remains
return dummy.next;                    // real head
```

:::tip
The **dummy head** trick is worth internalizing: it turns "build a list from scratch" into
"append to an existing tail," eliminating null checks on the first node. It shows up in merge,
partition, remove-nth, and more.
:::

## Complexity

| Technique | Time | Space |
|--|:--:|:--:|
| Fast / slow (middle) | **O(n)** | **O(1)** |
| Floyd cycle detection | **O(n)** | **O(1)** |
| Iterative reversal | **O(n)** | **O(1)** |
| Merge two sorted lists | **O(n + m)** | **O(1)** |
| (Compare) cycle detect with a hash set | O(n) | O(n) |

## Reversal recall

```flashcards
title: The reversal pointers
cards:
  - front: 'What are the three pointers in iterative reversal?'
    back: '**`prev`**, **`curr`**, **`next`**. `prev` starts `null`, `curr` starts at `head`.'
  - front: 'What is the very first line inside the loop?'
    back: '`Node next = curr.next;` — save the rest of the list **before** you overwrite `curr.next`.'
  - front: 'What do you return at the end?'
    back: '`prev` — after the loop, `curr` is `null` and `prev` is the **new head**.'
  - front: 'Fast/slow: how do you find where a cycle *starts*?'
    back: 'After they meet, reset one pointer to `head`, advance **both by 1**; they meet at the cycle entry.'
```

## Check yourself

```quiz
title: Linked list techniques check
questions:
  - q: 'In find-the-middle, why does `slow` end on the middle when `fast` reaches the end?'
    options:
      - text: '`fast` moves twice as fast, so it covers 2× the distance — when it hits the end, `slow` has covered half'
        correct: true
      - 'Because the list is sorted'
      - 'Because `slow` skips every other node'
    explain: 'Speed ratio 2:1 means when `fast` has traversed the whole list (distance n), `slow` has traversed n/2 — the middle.'
  - q: 'What is the point of saving `next = curr.next` during reversal?'
    options:
      - 'To count the nodes'
      - text: 'The line `curr.next = prev` destroys the forward link, so you must save it first'
        correct: true
      - 'To reverse the values instead of the pointers'
    explain: 'Once you overwrite `curr.next`, the rest of the list is unreachable. `next` preserves it so you can advance.'
  - q: 'Floyd''s cycle detection uses O(1) space. What is the alternative that uses O(n) space?'
    options:
      - text: 'A hash set of visited nodes'
        correct: true
      - 'Sorting the list first'
      - 'Reversing the list'
    explain: 'You could store every visited node in a set and check for a repeat, but that costs O(n) memory. Floyd''s two pointers detect the loop with O(1) space.'
  - q: 'Why use a **dummy head** when merging two sorted lists?'
    options:
      - 'It makes the merge O(1)'
      - text: 'It removes the special case for the first node, so you always just append to `tail`'
        correct: true
      - 'It sorts the lists'
    explain: 'With a dummy, `tail` always exists, so `tail.next = ...` works uniformly — no "is this the first node?" branch. Return `dummy.next`.'
  - q: 'What does iterative reversal return?'
    options:
      - '`curr`'
      - '`head`'
      - text: '`prev` — the last non-null node becomes the new head'
        correct: true
    explain: 'When `curr` walks off the end (`null`), `prev` is sitting on the old tail, which is now the head of the reversed list.'
```

:::key
Four O(n)/O(1) patterns cover most linked-list interviews: **fast/slow** (middle, nth-from-end),
**Floyd** (cycle detect — hare laps the tortoise), **iterative reversal** (save `next`, flip
`curr.next = prev`, return `prev`), and **merge sorted** (dummy head + splice the smaller). None
need random access — just pointers at the right speeds.
:::
