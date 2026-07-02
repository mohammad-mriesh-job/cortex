---
title: Reading EXPLAIN Plans
category: 'Indexing & Performance'
categoryOrder: 6
order: 3
level: Advanced
summary: 'How to read an EXPLAIN plan — scan types, join algorithms, and the rows/cost numbers that reveal what the query will actually do.'
tags: 'explain, query plan, seq scan, index scan, nested loop, hash join'
---

`EXPLAIN` shows the **plan** the optimizer chose *before* running the query; `EXPLAIN ANALYZE`
runs it and shows **actual** rows and time. Reading it is the single most useful performance
skill — you stop guessing and start *seeing*.

## Scan types — how a table is read

| Scan | What it does | When chosen | Speed |
|------|--------------|-------------|-------|
| **Seq scan** (full scan) | read every row | no usable index, or query wants most rows | slow on big tables |
| **Index scan** | seek the B-tree, then hop to the table per match | selective filter, but needs columns not in the index | fast when few rows |
| **Index-only scan** | answer entirely from a **covering** index | index has every column the query reads | fastest — no table hop |
| **Bitmap index scan** | build a bitmap of matching rows, then read the table in **page order** | medium selectivity; combines multiple indexes | between seek and seq |

```mermaid
flowchart TD
  P["Predicate: WHERE x = ?"] --> A{"Index on x?"}
  A -->|"No"| SEQ["Seq scan"]
  A -->|"Yes"| B{"Are all needed<br/>columns in the index?"}
  B -->|"Yes"| IO["Index-only scan"]
  B -->|"No"| C{"How many rows match?"}
  C -->|"Few"| IDX["Index scan<br/>+ per-row table hop"]
  C -->|"Many (but not most)"| BMP["Bitmap index scan<br/>read pages in order"]
  C -->|"Most of the table"| SEQ
  class IO,IDX good;
  class SEQ bad;
  classDef good fill:#2e7d32,stroke:#1b5e20,color:#fff;
  classDef bad fill:#b23b3b,stroke:#7f1d1d,color:#fff;
```

## Join algorithms — how two tables are combined

| Algorithm | How it works | Wins when | Cost |
|-----------|--------------|-----------|------|
| **Nested loop** | for each outer row, probe the inner (ideally via index) | outer side small **and** inner is indexed | O(outer × lookup) |
| **Hash join** | build a hash table on the smaller side, probe with the larger | large, **unsorted**, equi-joins (`=`) | O(n + m), needs memory |
| **Merge join** | sort both inputs, then zip them together | inputs already **sorted** on the join key | O(n + m) if pre-sorted, else + sort |

```mermaid
flowchart TD
  J["JOIN on a = b"] --> E{"Equality join?"}
  E -->|"No (range/inequality)"| NL["Nested loop"]
  E -->|"Yes"| S{"Both inputs<br/>sorted on the key?"}
  S -->|"Yes"| MJ["Merge join"]
  S -->|"No"| I{"One side small<br/>+ indexed?"}
  I -->|"Yes"| NL2["Nested loop<br/>(index probe)"]
  I -->|"No"| HJ["Hash join"]
```

## Reading an annotated plan

Plans are **trees**, read **inside-out / bottom-up**: the most-indented node runs first, feeding
its parent. Watch three things: the **scan type**, the **join type**, and **estimated vs actual rows**.

```text
Hash Join  (cost=15.2..92.4 rows=120 width=64) (actual rows=118)
  Hash Cond: (o.customer_id = c.id)          ← join key, hash join chosen
  ->  Seq Scan on orders o                   ← ⚠ full scan of orders
        (cost=0..41 rows=1000) (actual rows=1000)
  ->  Hash                                    ← build side (smaller table)
        ->  Index Scan on customers c         ← ✅ seek, filtered early
              Index Cond: (c.region = 'EU')
              (cost=0..8 rows=40) (actual rows=42)
```

How to read it:

- **Bottom-up:** the `customers` index scan and the `orders` seq scan run first; their outputs feed the **Hash Join** at the top.
- **`cost=start..total`** — arbitrary planner units (not ms). The **second** number is the total; compare nodes to find the expensive one.
- **`rows`** = *estimated*; **`actual rows`** (only with `ANALYZE`) = *reality*. A big gap means **stale statistics** — the #1 cause of bad plans.
- The **Seq Scan on orders** is the red flag here: an index on `orders.customer_id` could turn the whole thing into an indexed nested loop.

:::gotcha
`cost` is **not milliseconds** and not comparable across databases — it's a relative unit the
optimizer minimizes. Use `EXPLAIN ANALYZE` for real timings, and always compare the
**estimated vs actual row counts**: when they diverge by 10×+, run `ANALYZE` to refresh stats.
:::

## Estimate vs reality

```walkthrough
title: Spotting a bad estimate in a plan
code: |
  EXPLAIN ANALYZE
  SELECT * FROM orders WHERE status = 'shipped';
steps:
  - text: 'The planner **estimates** 50 matching rows and picks an **index scan** — cheap for 50 rows.'
    array: [50]
    pointers: { 0: 'est' }
    line: 2
  - text: 'But `ANALYZE` reveals the table actually returned **500,000** rows.'
    array: [50, 500000]
    highlight: [1]
    pointers: { 0: 'est', 1: 'actual' }
    line: 2
  - text: 'A 10,000× miss → the index scan did **500k random hops**. A seq scan would have been far cheaper.'
    array: [50, 500000]
    highlight: [1]
    line: 2
  - text: 'Fix: run `ANALYZE orders` to refresh statistics so the planner estimates correctly next time.'
    array: [500000, 500000]
    sorted: [0, 1]
    pointers: { 0: 'est', 1: 'actual' }
    line: 2
```

:::senior
Read plans **outside-in for intent, inside-out for execution.** The top node is the final
operation; the deepest nodes run first. Senior tells: a `Seq Scan` on a huge table under a
selective filter, a `Nested Loop` with a large outer row count, or `actual rows` wildly above
`rows` — each points at a fix (add an index, refresh stats, or rewrite the query).
:::

## Check yourself

```quiz
title: Reading plans
questions:
  - q: 'In an `EXPLAIN` plan tree, which node executes **first**?'
    options:
      - 'The top (least-indented) node'
      - text: 'The deepest (most-indented) node'
        correct: true
      - 'They run in parallel with no order'
    explain: 'Plans are read inside-out: the most-indented leaf nodes run first and feed their parents up to the root.'
  - q: '`EXPLAIN ANALYZE` shows `rows=50` but `actual rows=500000`. The likely cause?'
    options:
      - 'The query is written incorrectly'
      - text: 'Stale statistics — run ANALYZE to refresh them'
        correct: true
      - 'The cost number is in the wrong unit'
    explain: 'A large gap between estimated and actual rows means the optimizer''s statistics are out of date, leading it to pick the wrong plan.'
  - q: 'Two large, unsorted tables are joined on `a = b` with no useful index. Best algorithm?'
    options:
      - 'Nested loop'
      - text: 'Hash join'
        correct: true
      - 'Merge join'
    explain: 'Hash join builds a hash table on the smaller input and probes it — ideal for large, unsorted equi-joins. Nested loop needs an index; merge join needs sorted inputs.'
  - q: 'An `Index-Only Scan` appears in the plan. What does that tell you?'
    options:
      - 'The index is broken'
      - text: 'The index covers the query — no table access was needed'
        correct: true
      - 'The table has no primary key'
    explain: 'Index-only means every column the query needs lives in the index, so the engine skipped the bookmark lookup entirely — the fastest read.'
```

:::key
Read plans **bottom-up**. Hunt for `Seq Scan` on big tables, `Nested Loop` with large outer
inputs, and **estimated ≠ actual rows**. `cost` is relative units; `EXPLAIN ANALYZE` gives
real time and the truth about row counts.
:::
