---
title: SQL Query Patterns
category: Patterns & Interview Prep
categoryOrder: 10
order: 1
level: Advanced
summary: The five window-function classics interviewers reuse — top-N per group, running totals, gaps & islands, dedup, and pivot — shown as SQL you can copy.
tags: sql, window functions, row_number, running total, pivot, interview
---

Almost every "advanced SQL" interview question is a **window function** in disguise.
Learn to recognise the five patterns below and you can solve most of them on sight.

## The five patterns at a glance

| Pattern | The problem | The key tool |
|---|---|---|
| **Top-N per group** | best N rows *inside each* category | `ROW_NUMBER() OVER (PARTITION BY … ORDER BY …)` |
| **Running total** | cumulative sum over an ordered sequence | `SUM(…) OVER (ORDER BY … ROWS UNBOUNDED PRECEDING)` |
| **Gaps & islands** | find consecutive runs (or missing values) | `date − ROW_NUMBER()` grouping trick |
| **Deduplication** | flag or delete duplicate rows | `ROW_NUMBER()` then keep `rn = 1` |
| **Pivot** | turn rows into columns | `SUM(CASE WHEN … THEN … END)` |

## Anatomy of a window function

Every window function reads the same way — three knobs:

```sql
func() OVER (
  PARTITION BY dept      -- 1. which group are we inside?
  ORDER BY   salary DESC -- 2. in what order within the group?
  ROWS UNBOUNDED PRECEDING -- 3. how many rows can we see (the "frame")?
)
```

Unlike `GROUP BY`, a window function **keeps every row** and adds a computed column
alongside it — that is why it can rank, accumulate, and look back all at once.

## The patterns as copy-ready SQL

````tabs
tabs:
  - label: Top-N per group
    body: |
      Rank rows **within each group**, then filter. `ROW_NUMBER` gives a strict N; swap in `RANK`/`DENSE_RANK` if you want to keep ties.

      ```sql
      SELECT * FROM (
        SELECT e.*,
               ROW_NUMBER() OVER (PARTITION BY dept_id
                                  ORDER BY salary DESC) AS rn
        FROM employees e
      ) t
      WHERE rn <= 3;          -- top 3 earners per department
      ```
  - label: Running total
    body: |
      A window `SUM` with an ordered, unbounded frame accumulates as it scans — no self-join needed.

      ```sql
      SELECT sale_date, amount,
             SUM(amount) OVER (ORDER BY sale_date
                               ROWS UNBOUNDED PRECEDING) AS running_total
      FROM sales;
      ```

      | sale_date | amount | running_total |
      |---|---:|---:|
      | 03-01 | 50 | 50 |
      | 03-02 | 20 | 70 |
      | 03-03 | 75 | 145 |
  - label: Gaps & islands
    body: |
      Consecutive dates and `ROW_NUMBER` advance in lockstep, so `date − rn` is **constant inside a streak**. Group by that constant to collapse each run.

      ```sql
      SELECT user_id,
             MIN(login_date) AS streak_start,
             MAX(login_date) AS streak_end,
             COUNT(*)        AS days
      FROM (
        SELECT user_id, login_date,
               DATEDIFF(login_date, DATE '2000-01-01')
                 - ROW_NUMBER() OVER (PARTITION BY user_id
                                      ORDER BY login_date) AS grp
        FROM logins
      ) t
      GROUP BY user_id, grp;   -- the date→int conversion is dialect-specific
      ```
  - label: Deduplication
    body: |
      Number duplicates within each key by recency, then keep `rn = 1` and delete the rest.

      ```sql
      WITH ranked AS (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY email
                                  ORDER BY updated_at DESC) AS rn
        FROM users
      )
      DELETE FROM users
      WHERE id IN (SELECT id FROM ranked WHERE rn > 1);
      ```

      To only *find* duplicates: `SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1`.
  - label: Pivot
    body: |
      The portable pivot is **conditional aggregation**: one `SUM(CASE …)` per target column.

      ```sql
      SELECT product,
             SUM(CASE WHEN quarter = 'Q1' THEN amount ELSE 0 END) AS q1,
             SUM(CASE WHEN quarter = 'Q2' THEN amount ELSE 0 END) AS q2,
             SUM(CASE WHEN quarter = 'Q3' THEN amount ELSE 0 END) AS q3,
             SUM(CASE WHEN quarter = 'Q4' THEN amount ELSE 0 END) AS q4
      FROM sales
      GROUP BY product;
      ```

      | product | q1 | q2 | q3 | q4 |
      |---|---:|---:|---:|---:|
      | Widget | 100 | 0 | 40 | 60 |
````

## The three ranking functions (memorise the tie behaviour)

They differ **only when values tie**. Salaries `100, 90, 90, 80` ranked descending:

| Salary | `ROW_NUMBER` | `RANK` | `DENSE_RANK` |
|---:|:---:|:---:|:---:|
| 100 | 1 | 1 | 1 |
| 90 | 2 | 2 | 2 |
| 90 | **3** | **2** | **2** |
| 80 | 4 | **4** | **3** |

- `ROW_NUMBER` — always distinct (ties broken arbitrarily).
- `RANK` — ties share a rank, then it **skips** (…2, 2, 4).
- `DENSE_RANK` — ties share a rank, **no gap** (…2, 2, 3).

## Watch "top-N per group" build its result

```walkthrough
title: Top 2 salaries per department
code: |
  SELECT dept, salary FROM (
    SELECT dept, salary,
      ROW_NUMBER() OVER (
        PARTITION BY dept
        ORDER BY salary DESC) AS rn
    FROM employees
  ) ranked
  WHERE rn <= 2;
steps:
  - text: 'Focus on the **Engineering** partition. `PARTITION BY dept` isolates its rows; `ORDER BY salary DESC` sorts them high-to-low.'
    array: [120, 100, 90]
    line: 4
  - text: '`ROW_NUMBER()` stamps the top salary with `rn = 1`.'
    array: [120, 100, 90]
    highlight: [0]
    pointers: { 0: 'rn=1' }
    line: 3
  - text: 'The next salary down gets `rn = 2`.'
    array: [120, 100, 90]
    highlight: [1]
    pointers: { 0: 'rn=1', 1: 'rn=2' }
    line: 3
  - text: 'The last salary gets `rn = 3`.'
    array: [120, 100, 90]
    highlight: [2]
    pointers: { 0: 'rn=1', 1: 'rn=2', 2: 'rn=3' }
    line: 3
  - text: 'The outer `WHERE rn <= 2` keeps the top two and **drops** `rn = 3`. Every department is ranked independently.'
    array: [120, 100, 90]
    sorted: [0, 1]
    pointers: { 2: 'dropped' }
    line: 8
```

:::tip
Two more window functions round out the toolkit: **`LAG`/`LEAD`** read the previous/next
row, which is how you compute day-over-day growth (`amount - LAG(amount) OVER (ORDER BY day)`)
without a self-join.
:::

:::gotcha
You **cannot** filter on a window function in `WHERE` — `WHERE rn <= 2` is invalid because
the window is computed *after* `WHERE`. Wrap it in a subquery/CTE and filter in the outer
query (as above), or use `QUALIFY` on engines that support it.
:::

## Check yourself

```quiz
title: Window function recall
questions:
  - q: 'Ranking salaries `100, 90, 90, 80` (descending) with `RANK()`, the four rows get →'
    options:
      - text: '1, 2, 2, 4'
        correct: true
      - '1, 2, 3, 4'
      - '1, 2, 2, 3'
    explain: '`RANK` lets ties share a rank and then leaves a **gap** — the row after the tie jumps to 4.'
  - q: 'Same salaries, but with `DENSE_RANK()` →'
    options:
      - '1, 2, 2, 4'
      - text: '1, 2, 2, 3'
        correct: true
      - '1, 2, 3, 4'
    explain: '`DENSE_RANK` shares a rank on ties but **never skips**, so the next value is 3.'
  - q: 'Which window frame turns `SUM(amount) OVER (ORDER BY day …)` into a running total?'
    options:
      - text: 'ROWS UNBOUNDED PRECEDING'
        correct: true
      - 'PARTITION BY day with no ORDER BY'
      - 'ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING'
    explain: 'Accumulating from the start of the partition to the current row is exactly `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`. Note the implicit default when you supply `ORDER BY` is actually `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`, which differs on tied `ORDER BY` values — so spell out `ROWS` for a true per-row running total.'
```

:::key
`PARTITION BY` picks the group, `ORDER BY` picks the sequence, and the **frame** picks how
much of the group each row can see. Master `ROW_NUMBER`, `RANK`, `SUM() OVER`, and `LAG/LEAD`
and you have the five classic patterns covered.
:::
