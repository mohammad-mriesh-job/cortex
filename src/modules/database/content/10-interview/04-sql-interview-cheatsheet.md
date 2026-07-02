---
title: SQL Interview Cheat Sheet
category: Patterns & Interview Prep
categoryOrder: 10
order: 4
level: All
summary: The rapid-fire gotchas that separate a confident SQL answer from a shaky one — NULL logic, COUNT variants, DISTINCT, GROUP BY rules, join cardinality, and DELETE vs TRUNCATE vs DROP.
tags: sql, cheatsheet, null, count, group by, gotchas, interview
---

The details interviewers use to tell juniors from seniors. Skim it before any SQL screen.

## Logical order of execution

The clauses run in this order — **not** top-to-bottom as written:

```mermaid
flowchart LR
    F["FROM / JOIN"] --> W[WHERE] --> G["GROUP BY"] --> H[HAVING] --> S[SELECT] --> D[DISTINCT] --> O["ORDER BY"] --> L[LIMIT]
```

This single picture explains a dozen gotchas: `SELECT` runs **late**, so a column alias you
define there is invisible to `WHERE`, `GROUP BY`, and `HAVING` (which already ran) but usable
in `ORDER BY` (which runs after).

## NULL is "unknown" — three-valued logic

Any comparison **with** `NULL` returns `UNKNOWN`, which `WHERE` treats as not-true:

| Expression | Result |
|---|:---:|
| `NULL = NULL` | `UNKNOWN` (not `TRUE`!) |
| `NULL <> 1` | `UNKNOWN` |
| `1 = NULL` | `UNKNOWN` |
| `NULL IS NULL` | `TRUE` |
| `TRUE OR NULL` | `TRUE` |
| `FALSE AND NULL` | `FALSE` |
| `TRUE AND NULL` | `UNKNOWN` |

- Test with `IS NULL` / `IS NOT NULL`, never `= NULL`.
- `COALESCE(x, 0)` supplies a default; `NULLIF(a, b)` returns `NULL` when `a = b`.
- Aggregates (`SUM`, `AVG`, `COUNT(col)`) **skip** NULLs; `COUNT(*)` does not.
- `x NOT IN (1, 2, NULL)` is **never true** — prefer `NOT EXISTS`.

## COUNT variants

| Expression | Counts |
|---|---|
| `COUNT(*)` | every row, NULLs and duplicates included |
| `COUNT(col)` | rows where `col IS NOT NULL` |
| `COUNT(DISTINCT col)` | distinct non-NULL values of `col` |
| `COUNT(1)` | identical to `COUNT(*)` (no, it is not faster) |

`DISTINCT` de-duplicates the **whole selected row**, not one column — `SELECT DISTINCT a, b`
keeps unique `(a, b)` pairs. A stray `DISTINCT` often hides a wrong join that fans out rows.

## GROUP BY & HAVING

| Rule | Detail |
|---|---|
| Non-aggregated `SELECT` columns | must appear in `GROUP BY` (strict SQL) |
| `WHERE` | filters **rows before** grouping; no aggregates allowed |
| `HAVING` | filters **groups after** aggregating; aggregates allowed |
| MySQL loose mode | may accept bare columns and pick an **arbitrary** value — a trap |

## Join cardinality (row math)

| Relationship | Rows returned |
|---|---|
| 1:1 | same row count |
| 1:M | multiplies out to the many side |
| M:N (via junction) | product of the matches |

:::gotcha
**The fan-out trap.** Join a parent to *two* child tables and then `SUM` a parent column and
it **double-counts** — each parent row is duplicated by the second join before the sum runs.
Aggregate each child in a subquery *first*, then join the results.
:::

## DELETE vs TRUNCATE vs DROP

|  | `DELETE` | `TRUNCATE` | `DROP` |
|---|---|---|---|
| Category | DML | DDL | DDL |
| Removes | selected rows | all rows | the table itself |
| `WHERE`? | yes | no | n/a |
| Speed | slow (row-by-row, logged) | fast (deallocates pages) | fast |
| Rollback | yes, inside a txn | limited / DB-specific | usually no |
| Triggers | fire | usually do not | n/a |
| Auto-increment | keeps the counter | resets to start | gone |
| Structure & indexes | kept | kept | removed |

## Rapid recall

```flashcards
title: Gotcha drill
cards:
  - front: '`NULL = NULL` evaluates to?'
    back: '`NULL` / `UNKNOWN` — never `TRUE`. Compare with `IS NULL`.'
  - front: '`COUNT(*)` vs `COUNT(col)`'
    back: '`COUNT(*)` counts every row; `COUNT(col)` skips rows where col is NULL.'
  - front: '`WHERE` vs `HAVING`'
    back: '`WHERE` filters rows **before** grouping; `HAVING` filters groups **after** aggregation.'
  - front: 'Can a SELECT alias be used in WHERE?'
    back: 'No — `WHERE` runs before `SELECT`. It works in `ORDER BY`, which runs after.'
  - front: '`DELETE` vs `TRUNCATE`'
    back: '`DELETE` = DML, row-by-row, `WHERE`, rollback-able, fires triggers. `TRUNCATE` = DDL, all rows, fast, resets identity.'
  - front: '`TRUNCATE` vs `DROP`'
    back: '`TRUNCATE` empties the table but keeps its structure; `DROP` deletes the table entirely.'
  - front: '`x NOT IN (…, NULL)` returns?'
    back: 'Never `TRUE` → zero rows. Use `NOT EXISTS` instead.'
```

## What does this query output? (1)

```quiz
title: NULLs and aggregates
questions:
  - q: 'Column `bonus` holds the values `100, NULL, 200`. What does `SELECT COUNT(*), COUNT(bonus), SUM(bonus)` return?'
    options:
      - text: '3, 2, 300'
        correct: true
      - '3, 3, 300'
      - '2, 2, 300'
    explain: '`COUNT(*)` counts all 3 rows; `COUNT(bonus)` skips the NULL → 2; `SUM` ignores NULL → 300.'
  - q: 'With the same `100, NULL, 200`, what does `SELECT AVG(bonus)` return?'
    options:
      - text: '150'
        correct: true
      - '100'
      - '0'
    explain: '`AVG` ignores NULLs entirely, so it is (100 + 200) / **2** = 150 — not divided by 3.'
```

## What does this query output? (2)

```quiz
title: Three-valued logic
questions:
  - q: 'Table `t(id)` holds `1, 2, 3`. What does `SELECT id FROM t WHERE id NOT IN (1, 2, NULL)` return?'
    options:
      - text: 'No rows'
        correct: true
      - 'Only the row with id = 3'
      - 'All three rows'
    explain: '`id NOT IN (1, 2, NULL)` is `id<>1 AND id<>2 AND id<>NULL`. The last term is `UNKNOWN`, so the whole AND is never `TRUE` — even for id = 3. Use `NOT EXISTS`.'
  - q: 'What does `SELECT CASE WHEN NULL = NULL THEN ''yes'' ELSE ''no'' END` return?'
    options:
      - text: 'no'
        correct: true
      - 'yes'
      - 'NULL'
    explain: '`NULL = NULL` is `UNKNOWN`, which is not `TRUE`, so the `ELSE` branch wins → `no`.'
```

:::key
Interviews live in the edge cases: `NULL` is *unknown* (use `IS NULL`); `COUNT(*)` counts
rows while `COUNT(col)` skips NULLs; `WHERE` runs before `SELECT` (so no aliases there);
joins multiply rows on the many side; and `DELETE` (DML, undoable) is not `TRUNCATE` (DDL,
resets identity) is not `DROP` (table gone).
:::
