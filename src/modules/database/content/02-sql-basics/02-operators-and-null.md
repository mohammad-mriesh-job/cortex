---
title: Operators & NULL Logic
category: SQL Fundamentals
categoryOrder: 2
order: 2
level: Beginner
summary: Comparison, IN/BETWEEN/LIKE, AND/OR/NOT, and the three-valued NULL logic that quietly drops rows — shown as truth tables.
tags: sql, operators, null, three-valued logic, like, in
---

`WHERE` is only as good as the operators inside it. Most of them are obvious — until **NULL**
walks in and turns your neat true/false world into a *three*-valued one.

## The sample table

Note the two NULLs: **Bo has no age**, **Dan has no city**.

| id | name | age | city |
|:---:|:---|:---:|:---|
| 1 | Ada | 30 | Paris |
| 2 | Bo | NULL | London |
| 3 | Cara | 25 | Paris |
| 4 | Dan | 40 | NULL |

## Comparison & logical operators

| Operator | Meaning | Example |
|----------|---------|---------|
| `=` | equal | `age = 30` |
| `<>` (or `!=`) | not equal | `city <> 'Paris'` |
| `<` `>` `<=` `>=` | ordering | `age >= 18` |
| `AND` `OR` `NOT` | combine conditions | `age > 18 AND city = 'Paris'` |

## Set & pattern operators

````tabs
tabs:
  - label: IN
    body: |
      Shorthand for a chain of `OR` equalities.
      ```sql
      SELECT name FROM users
      WHERE city IN ('Paris', 'London');
      ```
      | name |
      |------|
      | Ada |
      | Bo |
      | Cara |
      Dan is excluded — his `city` is `NULL`, and `NULL` never equals anything.
  - label: BETWEEN
    body: |
      An **inclusive** range: `age BETWEEN 25 AND 35` means `age >= 25 AND age <= 35`.
      ```sql
      SELECT name FROM users
      WHERE age BETWEEN 25 AND 35;
      ```
      | name | age |
      |------|:---:|
      | Ada | 30 |
      | Cara | 25 |
      Bo (`NULL` age) fails the test; 25 and 35 themselves are included.
  - label: LIKE
    body: |
      Pattern match. `%` = any run of characters, `_` = exactly one character.
      ```sql
      SELECT name FROM users
      WHERE name LIKE 'C%';
      ```
      | name |
      |------|
      | Cara |
      `'C%'` = starts with C. `'%a'` = ends with a. `'_o'` = two letters ending in o.
````

## The catch: NULL means "unknown"

`NULL` is not zero and not an empty string — it means *the value is unknown*. Comparing to an
unknown gives a third truth value: **UNKNOWN**. This is **three-valued logic (3VL)**.

The golden rule: **`WHERE` keeps a row only when its condition is exactly `TRUE`** — `FALSE`
and `UNKNOWN` are both discarded.

### AND / OR truth tables (with UNKNOWN)

| `AND` | TRUE | FALSE | UNKNOWN |
|:---:|:---:|:---:|:---:|
| **TRUE** | TRUE | FALSE | UNKNOWN |
| **FALSE** | FALSE | FALSE | FALSE |
| **UNKNOWN** | UNKNOWN | FALSE | UNKNOWN |

| `OR` | TRUE | FALSE | UNKNOWN |
|:---:|:---:|:---:|:---:|
| **TRUE** | TRUE | TRUE | TRUE |
| **FALSE** | TRUE | FALSE | UNKNOWN |
| **UNKNOWN** | TRUE | UNKNOWN | UNKNOWN |

:::note
`FALSE AND anything = FALSE`, and `TRUE OR anything = TRUE` — even when *anything* is UNKNOWN.
Those two shortcuts are the only way UNKNOWN gets "rescued".
:::

### Why `= NULL` is always wrong

| Expression | Result | Keeps the row? |
|------------|:------:|:---:|
| `age = NULL` | UNKNOWN | no |
| `age <> NULL` | UNKNOWN | no |
| `NULL = NULL` | UNKNOWN | no |
| `age IS NULL` | TRUE / FALSE | yes/no |
| `age IS NOT NULL` | TRUE / FALSE | yes/no |

`IS NULL` and `IS NOT NULL` are the **only** operators that inspect NULL and return a real
TRUE/FALSE.

### The `NOT IN (…, NULL)` trap

`NOT IN` expands to a chain of `<>` joined by `AND`. One NULL in the list poisons the whole thing:

```text
id NOT IN (1, 2, NULL)
= id <> 1 AND id <> 2 AND id <> NULL
=  TRUE  AND  TRUE  AND  UNKNOWN      (for id = 5)
=  UNKNOWN                            → row is NOT returned
```

So `NOT IN` against a list/subquery that contains even one NULL returns **zero rows**. Prefer
`NOT EXISTS`, which is not fooled by NULLs.

## Terminology recall

```flashcards
title: NULL & operators
cards:
  - front: 'Three-valued logic (3VL)'
    back: 'SQL conditions are `TRUE`, `FALSE`, or **`UNKNOWN`**. `WHERE` keeps only `TRUE`.'
  - front: '`x = NULL`'
    back: 'Always `UNKNOWN`, never `TRUE`. Use `x IS NULL` instead.'
  - front: '`IS NULL` / `IS NOT NULL`'
    back: 'The only operators that test for NULL and return a real `TRUE`/`FALSE`.'
  - front: '`a BETWEEN x AND y`'
    back: 'Inclusive range: `a >= x AND a <= y`.'
  - front: 'LIKE wildcards'
    back: '`%` = any run of characters (including none). `_` = exactly one character.'
  - front: '`NOT IN (…, NULL)`'
    back: 'Returns **no rows** — the NULL makes the whole test `UNKNOWN`. Use `NOT EXISTS`.'
```

## Check yourself

```quiz
title: NULL gotchas
questions:
  - q: 'What does `WHERE salary = NULL` return?'
    options:
      - 'The rows where salary is NULL'
      - text: 'No rows'
        correct: true
      - 'Every row'
    explain: '`salary = NULL` evaluates to `UNKNOWN` for every row, and `WHERE` keeps only `TRUE`. You want `WHERE salary IS NULL`.'
  - q: 'How many rows does `WHERE id NOT IN (1, 2, NULL)` return?'
    options:
      - 'The rows whose id is not 1 or 2'
      - text: 'None'
        correct: true
      - 'A syntax error'
    explain: 'The NULL turns the chained `AND` into `UNKNOWN` for every row, so nothing is returned. Use `NOT EXISTS`.'
  - q: 'What does `NULL OR TRUE` evaluate to?'
    options:
      - text: 'TRUE'
        correct: true
      - 'UNKNOWN'
      - 'NULL'
    explain: '`TRUE OR anything` is `TRUE` — the right operand is never even inspected.'
  - q: 'Is the value 25 returned by `WHERE age BETWEEN 25 AND 35`?'
    options:
      - text: 'Yes — BETWEEN is inclusive'
        correct: true
      - 'No — the bounds are excluded'
    explain: '`BETWEEN` includes both endpoints: it is exactly `age >= 25 AND age <= 35`.'
```

:::key
NULL means *unknown*, so comparisons with it yield `UNKNOWN`, and `WHERE` drops anything not
strictly `TRUE`. Test NULL with `IS NULL` / `IS NOT NULL`, and avoid `NOT IN` on nullable
lists — reach for `NOT EXISTS`.
:::
