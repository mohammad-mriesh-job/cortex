---
title: GROUPING SETS, ROLLUP & CUBE
category: 'Advanced SQL'
categoryOrder: 5
order: 9
level: Advanced
summary: Compute several levels of aggregation — subtotals, grand totals, every combination — in a single scan instead of UNION-ing many GROUP BY queries, plus GROUPING() to label the total rows.
tags: grouping sets, rollup, cube, subtotals, olap, aggregation
---

A plain `GROUP BY` gives **one** level of aggregation. Reports usually want **several** at once — totals per region, per product, per region-and-product, and a grand total. Instead of `UNION`-ing four queries (four scans), SQL computes them all in **one pass**.

## The three tools

| Syntax | Produces | Rows for `(region, product)` |
|--|--|--|
| `GROUPING SETS ((a),(b),())` | exactly the listed groupings | whatever you list |
| `ROLLUP(a, b)` | **hierarchical** subtotals | `(a,b)`, `(a)`, `()` |
| `CUBE(a, b)` | **all** combinations | `(a,b)`, `(a)`, `(b)`, `()` |

- **`ROLLUP`** walks a hierarchy right-to-left — perfect for `(year, month, day)` drill-downs: day totals, month subtotals, year subtotals, grand total.
- **`CUBE`** gives every combination — for cross-tab reports where any dimension can be the subtotal.
- **`GROUPING SETS`** is the explicit form; `ROLLUP` and `CUBE` are shorthands for common sets.

```sql
SELECT region, product, SUM(amount) AS total
FROM sales
GROUP BY ROLLUP (region, product);
-- rows: each (region, product), a subtotal per region, and one grand total
```

## Labeling the total rows with GROUPING()

The subtotal/grand-total rows carry `NULL` in the columns that were "rolled up" — which is ambiguous if the data *also* has real `NULL`s. `GROUPING(col)` returns **1** when the column was aggregated away (a subtotal row) and **0** otherwise.

```sql
SELECT
  CASE WHEN GROUPING(region) = 1 THEN 'ALL REGIONS' ELSE region END AS region,
  SUM(amount) AS total
FROM sales
GROUP BY ROLLUP (region);
```

:::gotcha
A `NULL` in a ROLLUP/CUBE result is **overloaded**: it could be a genuine `NULL` in the data or a "this dimension was totaled" marker. Always disambiguate subtotal rows with `GROUPING()` (or `GROUPING_ID()` for multiple columns) rather than testing `IS NULL`.
:::

:::senior
This is the SQL behind OLAP/reporting cubes. The win is **one scan** instead of N: `GROUP BY ROLLUP(a,b)` reads the table once and emits every level, whereas the naive version `UNION ALL`s a `GROUP BY a,b`, a `GROUP BY a`, and a grand-total query — three scans and more code. MySQL supports `WITH ROLLUP` but not `CUBE`/`GROUPING SETS`; Postgres, Oracle, and SQL Server support all three.
:::

## Check yourself

```quiz
title: Multi-level aggregation check
questions:
  - q: 'ROLLUP(region, product) produces which groupings?'
    options:
      - text: '(region, product), (region), and () — a hierarchy of subtotals plus a grand total'
        correct: true
      - 'Every combination including (product) alone'
      - 'Only (region, product)'
    explain: 'ROLLUP is hierarchical (right-to-left): the full grouping, then drop product for region subtotals, then drop region for the grand total. CUBE would add the (product)-only grouping.'
  - q: 'Why use GROUPING() in a ROLLUP/CUBE query?'
    options:
      - text: 'To tell a "subtotal" NULL (column was aggregated away) apart from a genuine NULL in the data'
        correct: true
      - 'To sort the result'
      - 'To remove duplicate rows'
    explain: 'Rolled-up columns appear as NULL; GROUPING() returns 1 for those synthetic totals and 0 otherwise, disambiguating them from real NULLs.'
  - q: 'What is the main advantage over UNION-ing several GROUP BY queries?'
    options:
      - text: 'It computes all aggregation levels in a single table scan instead of one scan per level'
        correct: true
      - 'It allows more columns'
      - 'It is the only way to get a grand total'
    explain: 'GROUPING SETS/ROLLUP/CUBE emit multiple groupings from one pass over the data — less I/O and less code than a UNION of separate GROUP BY statements.'
```

:::key
Get many aggregation levels in one scan: **`GROUPING SETS`** (explicit list), **`ROLLUP`** (hierarchical subtotals + grand total, e.g. year→month→day), **`CUBE`** (every combination). Rolled-up columns show `NULL`, so label total rows with **`GROUPING()`**. It's the engine behind OLAP reports — one pass instead of a `UNION` of many `GROUP BY`s.
:::
