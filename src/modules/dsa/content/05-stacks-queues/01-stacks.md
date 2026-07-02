---
title: Stacks
category: 'Stacks, Queues & Heaps'
categoryOrder: 5
order: 1
level: Intermediate
summary: A LIFO pile where you only ever touch the top — push, pop, peek in O(1). The engine behind balanced-bracket checks, undo, the call stack, and iterative DFS.
tags: stack, LIFO, push, pop, peek, parentheses, DFS
---

A **stack** is a Last-In-First-Out (**LIFO**) collection: the last item you push is the first you
pop. You only ever touch the **top** — like a stack of plates. Every core operation is **O(1)**.

| Operation | Meaning | Time |
|--|--|:--:|
| `push(x)` | put `x` on the top | O(1) |
| `pop()` | remove & return the top | O(1) |
| `peek()` / `top()` | look at the top without removing | O(1) |
| `isEmpty()` | is there anything to pop? | O(1) |

## Watch it: push and pop with a `top` pointer

Back an array with a `top` index. `push` writes at `top` then bumps it up; `pop` steps `top`
back down and hands you the value it was pointing just past. Nothing else in the array moves.

```walkthrough
title: Array-backed stack — push 5, push 8, pop
code: |
  int[] st = new int[N];
  int top = 0;                 // next free slot
  void push(int x) { st[top++] = x; }
  int  pop()       { return st[--top]; }
  int  peek()      { return st[top - 1]; }
steps:
  - text: 'Empty stack. `top = 0` marks the next free slot — nothing to peek yet.'
    array: []
    line: 2
  - text: '`push(5)`: write 5 at index `top`, then bump `top` to 1. The top of the stack is index 0.'
    array: [5]
    highlight: [0]
    pointers: { 0: 'top-1' }
    line: 3
  - text: '`push(8)`: write 8 at index 1, bump `top` to 2. 8 is now the top — the most recent arrival.'
    array: [5, 8]
    highlight: [1]
    pointers: { 1: 'top-1' }
    line: 3
  - text: '`pop()`: pre-decrement `top` to 1, return `st[1] = 8`. LIFO — the **last** pushed is the **first** out.'
    array: [5, 8]
    highlight: [1]
    pointers: { 0: 'top-1' }
    line: 4
  - text: 'After the pop, only 5 remains reachable (index 1 is now free space). `peek()` returns 5.'
    array: [5]
    sorted: [0]
    pointers: { 0: 'top-1' }
    line: 5
```

:::tip
`push` uses **post-increment** (`top++`: use then bump) and `pop` uses **pre-decrement**
(`--top`: step back then use). That pairing keeps `top` always pointing at the next *free* slot.
:::

## Building one in Java

In interviews use `java.util.Deque` as a stack — `ArrayDeque` is the modern, fast choice. The
legacy `Stack` class is synchronized and best avoided.

````tabs
tabs:
  - label: Recommended (ArrayDeque)
    body: |
      `Deque` as a stack: `push` / `pop` / `peek` act on the head.
      ```java
      Deque<Integer> st = new ArrayDeque<>();
      st.push(5);          // [5]
      st.push(8);          // [8, 5]  (head = top)
      int top = st.peek(); // 8, not removed
      int out = st.pop();  // 8, removed -> [5]
      boolean e = st.isEmpty();
      ```
  - label: Legacy (avoid)
    body: |
      The old `Stack` extends `Vector` and is synchronized on every call.
      ```java
      Stack<Integer> st = new Stack<>(); // works, but slower
      st.push(5);
      st.pop();
      ```
      Prefer `ArrayDeque` unless you specifically need thread safety.
````

## Where stacks show up

- **Balanced parentheses / expression parsing** — push openers, match on closers.
- **Undo / redo** — push each action; undo pops the most recent.
- **The call stack** — each method call pushes a frame; `return` pops it. Deep recursion
  overflows this stack.
- **Iterative DFS & backtracking** — an explicit stack replaces recursion.
- **Browser back button, editor history, JVM operand stack.**

## Watch it: balanced parentheses

The classic warm-up. Scan left to right: **push** every opener; on a **closer**, the top of the
stack must be its matching opener — pop it. Valid means we never mismatch and the stack ends empty.

```walkthrough
title: Is "([])" balanced?
code: |
  for (char c : s) {
    if (isOpen(c)) st.push(c);
    else {
      if (st.isEmpty() || !matches(st.pop(), c))
        return false;
    }
  }
  return st.isEmpty();
steps:
  - text: 'Read `(` — an opener. Push it. Stack: `(`.'
    array: ['(']
    highlight: [0]
    pointers: { 0: 'top' }
    line: 2
  - text: 'Read `[` — an opener. Push it. Stack: `( [`.'
    array: ['(', '[']
    highlight: [1]
    pointers: { 1: 'top' }
    line: 2
  - text: 'Read `]` — a closer. Pop `[`. It matches `]` ✓. Stack: `(`.'
    array: ['(', '[']
    highlight: [1]
    pointers: { 0: 'top' }
    line: 4
  - text: 'Read `)` — a closer. Pop `(`. It matches `)` ✓. Stack empty.'
    array: ['(']
    highlight: [0]
    line: 4
  - text: 'End of string and the stack is **empty** → balanced. Return `true`.'
    array: []
    line: 8
```

:::gotcha
Two ways to fail: a closer arrives when the stack is **empty** (nothing to match, e.g. `")("`),
or the string ends with the stack **non-empty** (unclosed openers, e.g. `"(("`). Check **both**.
:::

:::senior
When you see "matching pairs", "most recent unmatched", "nesting", or "innermost first",
reach for a stack. It is the data structure of *deferred, reverse-order* work — the natural
fit whenever the thing you opened last must be resolved first.
:::

## Complexity

| Operation | Time | Space |
|--|:--:|:--:|
| push / pop / peek | **O(1)** | — |
| Balanced-parentheses scan | **O(n)** | O(n) worst case (all openers) |
| Space for `n` elements | — | **O(n)** |

## Check yourself

```quiz
title: Stack check
questions:
  - q: 'A stack removes elements in what order?'
    options:
      - 'First-In-First-Out (the oldest first)'
      - text: 'Last-In-First-Out (the newest first)'
        correct: true
      - 'In sorted order'
    explain: 'A stack is LIFO: `pop` always returns the most recently pushed element.'
  - q: 'In the array-backed stack, `pop()` is `return st[--top];`. Why pre-decrement?'
    options:
      - text: '`top` points at the next free slot, so the top element is at `top - 1` — step back first, then read.'
        correct: true
      - 'To skip the element being removed'
      - 'Post-decrement would read out of bounds every time'
    explain: '`top` is the next free index. The live top element sits at `top - 1`, so you decrement before reading.'
  - q: 'Scanning `"(("` for balanced brackets ends with:'
    options:
      - 'An empty stack → valid'
      - text: 'A non-empty stack → invalid (unclosed openers)'
        correct: true
      - 'A mismatch error mid-scan'
    explain: 'Both openers get pushed and never matched, so the stack is non-empty at the end — invalid.'
  - q: 'Which is the recommended stack in modern Java?'
    options:
      - 'The `Stack` class'
      - text: '`ArrayDeque` via the `Deque` interface'
        correct: true
      - 'A raw array only'
    explain: '`ArrayDeque` is fast and unsynchronized; the legacy `Stack` extends `Vector` and locks on every call.'
```

:::key
A stack is **LIFO** with O(1) `push` / `pop` / `peek` — you only touch the top. Reach for it on
matching-pairs, undo, DFS, and anything "most recent first". Use `ArrayDeque`, not `Stack`.
:::
