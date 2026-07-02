---
title: Set Operations
category: 'Advanced SQL'
categoryOrder: 5
order: 7
level: Intermediate
summary: Combine or compare the results of two queries — UNION vs UNION ALL (and why the ALL matters), INTERSECT, and EXCEPT/MINUS — plus the column-compatibility rules that trip people up.
tags: union, union all, intersect, except, minus, set operations, sql
---

`JOIN`s combine rows **side by side** (by column); **set operators** stack the results of two queries **on top of each other** (by row) and then apply set logic. Four operators cover it.

## The four operators

| Operator | Returns | Duplicates |
|--|--|--|
| `UNION` | rows in **either** query | **removed** (distinct) |
| `UNION ALL` | rows in **either** query | **kept** |
| `INTERSECT` | rows in **both** queries | removed |
| `EXCEPT` (Oracle: `MINUS`) | rows in the **first but not the second** | removed |

```sql
SELECT city FROM customers
UNION
SELECT city FROM suppliers;      -- every distinct city that has a customer or supplier
```

## UNION vs UNION ALL — the one that matters

:::gotcha
`UNION` **deduplicates**, which forces the database to **sort or hash** the combined result — often a hidden performance cost. If you know the two sets can't overlap (or you *want* duplicates), use **`UNION ALL`**: it just concatenates, no dedup pass. Reaching for `UNION` out of habit on large result sets is a common slow-query cause.
:::

## The compatibility rules

Every set operation requires the two queries to be **union-compatible**:

- **same number of columns**, in the **same order**;
- **compatible data types** column-by-column;
- column **names come from the first** query;
- a single **`ORDER BY`** applies to the whole result and goes **at the very end** (not on the individual queries).

```sql
SELECT id, name FROM active_users
EXCEPT
SELECT id, name FROM banned_users     -- active users who are not banned
ORDER BY name;                        -- one ORDER BY, at the end
```

:::senior
`EXCEPT`/`INTERSECT` are the readable way to express "in A but not B" / "in both," which otherwise needs a `LEFT JOIN ... WHERE b.id IS NULL` (anti-join) or an `IN`/`EXISTS` subquery. They compare **whole rows** and treat `NULL`s as equal (unlike `=`). Know that not every engine has them (MySQL added `INTERSECT`/`EXCEPT` in 8.0.31; older versions need the join rewrite).
:::

## Check yourself

```quiz
title: Set operations check
questions:
  - q: 'What is the key difference between UNION and UNION ALL?'
    options:
      - text: 'UNION removes duplicate rows (requiring a sort/hash); UNION ALL keeps them and is faster'
        correct: true
      - 'UNION ALL removes duplicates; UNION keeps them'
      - 'They are identical'
    explain: 'UNION does a distinct pass over the combined rows; UNION ALL simply concatenates. Prefer UNION ALL when duplicates are impossible or desired, to avoid the dedup cost.'
  - q: 'Which operator returns rows present in the first query but not the second?'
    options:
      - 'INTERSECT'
      - text: 'EXCEPT (MINUS in Oracle)'
        correct: true
      - 'UNION'
    explain: 'EXCEPT/MINUS is set difference: first-query rows with any matching second-query row removed. INTERSECT keeps only rows in both.'
  - q: 'For two queries combined by a set operator, where does ORDER BY belong?'
    options:
      - 'On each individual SELECT'
      - text: 'Once, at the very end, applying to the whole combined result'
        correct: true
      - 'It is not allowed with set operators'
    explain: 'The queries must be union-compatible (same column count/types); a single ORDER BY at the end sorts the final combined set.'
```

:::key
Set operators stack query results by row: **`UNION`** (distinct) vs **`UNION ALL`** (keeps dups, faster — no sort), **`INTERSECT`** (in both), **`EXCEPT`/`MINUS`** (in first not second). Queries must be **union-compatible** (same column count and compatible types); names come from the first query; one **`ORDER BY`** at the end. Prefer `UNION ALL` unless you truly need dedup.
:::
