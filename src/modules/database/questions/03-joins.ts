import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'db-join-inner-vs-left',
    question: 'What is the difference between an INNER JOIN and a LEFT JOIN?',
    difficulty: 'Easy',
    category: 'Joins',
    tags: ['inner join', 'left join', 'basics'],
    answer: `- **INNER JOIN** returns only rows that have a match in **both** tables. Unmatched rows on either side are dropped.
- **LEFT JOIN** returns **every** row from the left table, plus matching columns from the right — filling **NULL** where there is no match.

\`\`\`sql
-- Bo (no orders) disappears
SELECT c.name, o.amount FROM customers c
JOIN orders o ON o.customer_id = c.id;

-- Bo stays, with amount = NULL
SELECT c.name, o.amount FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id;
\`\`\`

\`RIGHT JOIN\` mirrors \`LEFT\` (keeps the right side); \`FULL JOIN\` keeps unmatched rows from **both** sides.`,
  },
  {
    id: 'db-join-cross-join',
    question: 'What does a CROSS JOIN produce, and when is one created by accident?',
    difficulty: 'Easy',
    category: 'Joins',
    tags: ['cross join', 'cartesian product'],
    answer: `A **CROSS JOIN** is the **Cartesian product**: every row of the left table paired with every row of the right. \`m\` rows and \`n\` rows yield \`m × n\` rows.

\`\`\`sql
SELECT * FROM sizes CROSS JOIN colors;  -- 3 sizes × 4 colors = 12 rows
\`\`\`

You get one **by accident** when you list tables with no join condition:

\`\`\`sql
SELECT * FROM a, b;            -- implicit cross join!
SELECT * FROM a JOIN b ON 1=1; -- also a cross join
\`\`\`

Legitimate uses: generating combinations (all size/color variants) or building a calendar/number series to join against.`,
  },
  {
    id: 'db-join-union-vs-union-all',
    question: 'UNION vs UNION ALL — and how do INTERSECT and EXCEPT fit in?',
    difficulty: 'Easy',
    category: 'Joins',
    tags: ['union', 'union all', 'intersect', 'except', 'set operations'],
    answer: `All four **stack result sets vertically** (they add rows, unlike a join which adds columns). Each \`SELECT\` must have the same number of columns with compatible types.

| Operator | Result |
|----------|--------|
| \`UNION\`     | rows in **either** query, **duplicates removed** |
| \`UNION ALL\` | rows in **either** query, **duplicates kept** (faster — no dedup) |
| \`INTERSECT\` | rows in **both** queries |
| \`EXCEPT\`    | rows in the **first** query but **not** the second (Oracle: \`MINUS\`) |

:::tip
Prefer \`UNION ALL\` when you know the inputs can't overlap — you skip the implicit \`DISTINCT\` sort. \`EXCEPT\` is **directional**: \`A EXCEPT B\` ≠ \`B EXCEPT A\`.
:::`,
  },
  {
    id: 'db-join-many-to-many',
    question: 'How do you model a many-to-many relationship?',
    difficulty: 'Easy',
    category: 'Joins',
    tags: ['many-to-many', 'junction table', 'relationships'],
    answer: `With a **junction** (bridge / associative) table that holds **two foreign keys** — one to each side. This splits the many-to-many into **two one-to-many** relationships.

\`\`\`sql
CREATE TABLE enrollments (
  student_id INT REFERENCES students(id),
  course_id  INT REFERENCES courses(id),
  PRIMARY KEY (student_id, course_id)   -- one row per pairing
);
\`\`\`

Each row is one *(student, course)* pair. The junction table is also the natural place for attributes of the relationship itself, such as \`grade\` or \`enrolled_on\`.`,
  },
  {
    id: 'db-join-left-where-trap',
    question: 'Why can a WHERE clause silently turn a LEFT JOIN into an INNER JOIN?',
    difficulty: 'Medium',
    category: 'Joins',
    tags: ['left join', 'where', 'null', 'gotcha'],
    answer: `A \`LEFT JOIN\` pads unmatched left rows with **NULL** on the right side. A \`WHERE\` condition that tests a right-table column then **fails for those NULLs** and filters the rows back out — leaving you with inner-join results.

\`\`\`sql
-- Customers with no orders have o.amount = NULL,
-- which fails "> 0", so they're removed — LEFT JOIN wasted.
SELECT c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.amount > 0;
\`\`\`

Fixes:
- Move the condition into the **\`ON\`** clause (filters *before* the join preserves unmatched rows).
- Or test \`o.id IS NULL\` **on purpose** to find left rows with no match (an anti-join).

:::key
Filtering the outer (NULL-able) table in \`WHERE\` collapses an outer join into an inner one. Put right-table predicates in \`ON\`.
:::`,
  },
  {
    id: 'db-join-self-join',
    question: 'What is a self join and when would you use one?',
    difficulty: 'Medium',
    category: 'Joins',
    tags: ['self join', 'aliases', 'hierarchy'],
    answer: `A **self join** joins a table **to itself**, listing it twice under **two aliases** so each row can be paired with another row from the same table. Essential for data that references its own table — hierarchies, adjacency, "find pairs" queries.

\`\`\`sql
-- employees.manager_id points back at employees.id
SELECT e.name AS employee, m.name AS manager
FROM employees e
JOIN employees m ON e.manager_id = m.id;
\`\`\`

Here \`e\` is the *employee* role and \`m\` is the *manager* role of the same table.

:::gotcha
With an **INNER** self-join, top-level rows whose \`manager_id\` is NULL (e.g. the CEO) are dropped. Use a **LEFT JOIN** to keep them with \`manager = NULL\`.
:::`,
  },
  {
    id: 'db-join-using-vs-on',
    question: 'What is the difference between JOIN ... USING and JOIN ... ON?',
    difficulty: 'Medium',
    category: 'Joins',
    tags: ['using', 'on', 'join syntax'],
    answer: `- **\`ON\`** is fully general — any boolean predicate, columns can have different names, and **both** join columns survive in \`SELECT *\`.
- **\`USING(col)\`** is shorthand for \`ON a.col = b.col\` that only works when the column is **named identically** in both tables. It **collapses** the pair into a **single, unqualified** output column.

\`\`\`sql
SELECT * FROM orders o JOIN customers c ON o.customer_id = c.id;  -- both keys appear
SELECT * FROM orders   JOIN customers   USING (customer_id);      -- one merged column
\`\`\`

:::gotcha
After \`USING (customer_id)\`, you must reference the column **unqualified** — \`orders.customer_id\` or \`c.customer_id\` is an error.
:::`,
  },
  {
    id: 'db-join-on-delete-actions',
    question: 'What are the ON DELETE actions for a foreign key, and what is the default?',
    difficulty: 'Medium',
    category: 'Joins',
    tags: ['foreign key', 'cascade', 'referential integrity'],
    answer: `A foreign key can specify what happens to **child** rows when the **parent** row is deleted (\`ON UPDATE\` behaves the same for key changes):

| Action | Effect on children |
|--------|--------------------|
| \`CASCADE\` | children are **deleted** too |
| \`SET NULL\` | child FK is set to **NULL** (column must allow NULL) |
| \`RESTRICT\` | delete is **blocked** immediately |
| \`NO ACTION\` | delete is **blocked** (checked at statement end) — the **default** |
| \`SET DEFAULT\` | child FK set to its default value (rarely used) |

\`\`\`sql
FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
\`\`\`

:::key
The default is **NO ACTION** (block the delete), **not** CASCADE. Choose \`CASCADE\` when children can't exist without the parent, \`SET NULL\` when the link is optional.
:::`,
  },
  {
    id: 'db-join-count-groupby',
    question: 'In a LEFT JOIN with GROUP BY, why prefer COUNT(column) over COUNT(*)?',
    difficulty: 'Hard',
    category: 'Joins',
    tags: ['group by', 'count', 'left join', 'aggregation'],
    answer: `Because a \`LEFT JOIN\` produces **one NULL-padded row** for every left row with no match. \`COUNT(*)\` counts rows (including that padded one), so a customer with **zero** orders wrongly counts as **1**. \`COUNT(o.id)\` counts **non-NULL** values, correctly returning **0**.

\`\`\`sql
SELECT c.name,
       COUNT(*)      AS wrong,   -- Bo (no orders) → 1
       COUNT(o.id)   AS correct  -- Bo → 0
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.name;
\`\`\`

| name | wrong | correct |
|------|:-----:|:-------:|
| Ada  | 2 | 2 |
| Bo   | **1** | **0** |

:::senior
The rule generalizes: aggregate a **non-nullable column from the right table** (\`COUNT(o.id)\`, \`SUM(o.amount)\`) so unmatched left rows don't contaminate the result. \`SUM\` and \`AVG\` already ignore NULLs, but \`COUNT(*)\` does not.
:::`,
  },
  {
    id: 'db-join-algorithms',
    question: 'What physical algorithms can a database use to execute a join?',
    difficulty: 'Hard',
    category: 'Joins',
    tags: ['query planner', 'nested loop', 'hash join', 'merge join', 'senior'],
    answer: `\`INNER JOIN\`/\`LEFT JOIN\` are **logical** operations; the optimizer picks a **physical** strategy based on data size, indexes, and sort order:

| Algorithm | How it works | Chosen when |
|-----------|--------------|-------------|
| **Nested loop** | for each outer row, probe the inner (ideally via index) | small outer input, or an index on the inner join key |
| **Hash join** | build a hash table on the smaller input, probe with the larger | large, **unsorted** inputs on an **equi-join** (\`=\`) |
| **Merge join** | sort both inputs, then walk them in lockstep | inputs already **sorted** on the join key (e.g. from indexes) |

\`\`\`sql
EXPLAIN SELECT * FROM orders o JOIN customers c ON o.customer_id = c.id;
\`\`\`

:::senior
\`EXPLAIN\` / \`EXPLAIN ANALYZE\` reveals which algorithm ran. A hash join can't serve a **non-equi** join (\`<\`, \`BETWEEN\`) — those fall back to nested loop or merge. Being able to say *why* the planner chose one, and how an index or row-count estimate would change it, is a strong senior signal.
:::`,
  },
  {
    id: 'db-join-full-outer',
    question: 'What does a FULL OUTER JOIN return, and how do you emulate it in MySQL?',
    difficulty: 'Easy',
    category: 'Joins',
    tags: ['full outer join', 'outer join', 'mysql'],
    answer: `A **FULL OUTER JOIN** keeps **all rows from both tables** — matching where it can and filling \`NULL\` on whichever side has no match. It is the union of a \`LEFT\` and a \`RIGHT\` join.

\`\`\`sql
SELECT c.name, o.id
FROM customers c
FULL OUTER JOIN orders o ON o.customer_id = c.id;
-- customers with no orders (o.id NULL) AND orphan orders (c.name NULL)
\`\`\`

Use it to reconcile two sets — "what is in A, in B, or in both."

:::gotcha
**MySQL has no \`FULL OUTER JOIN\`.** Emulate it by \`UNION\`-ing a \`LEFT\` and a \`RIGHT\` join:
\`\`\`sql
SELECT ... FROM a LEFT  JOIN b ON a.k = b.k
UNION
SELECT ... FROM a RIGHT JOIN b ON a.k = b.k;
\`\`\`
Use \`UNION\` (not \`UNION ALL\`) so the rows matched by both sides are not duplicated.
:::`,
  },
  {
    id: 'db-join-right-join',
    question: 'What is a RIGHT JOIN, and why do people rarely use it?',
    difficulty: 'Easy',
    category: 'Joins',
    tags: ['right join', 'left join', 'readability'],
    answer: `A **RIGHT JOIN** keeps every row from the **right** table plus matching left columns (NULL where none) — the mirror image of \`LEFT JOIN\`.

\`\`\`sql
-- these two are equivalent (tables swapped)
SELECT * FROM a RIGHT JOIN b ON a.k = b.k;
SELECT * FROM b LEFT  JOIN a ON a.k = b.k;
\`\`\`

By convention almost everyone writes **LEFT JOIN** and orders tables so the "kept" table is on the left. It reads in the same direction as the \`FROM\` clause, so a \`RIGHT JOIN\` buried in a long join chain is a readability trap.

:::tip
Any \`RIGHT JOIN\` can be rewritten as a \`LEFT JOIN\` by swapping the two tables. Pick one direction — LEFT — and stay consistent across the codebase.
:::`,
  },
  {
    id: 'db-join-anti-join',
    question: 'How do you find rows in A with no match in B (an anti-join), and what is the NULL trap?',
    difficulty: 'Hard',
    category: 'Joins',
    tags: ['anti-join', 'not exists', 'not in', 'null'],
    answer: `An **anti-join** returns left rows that have **no** matching right row ("customers who never ordered"). Three ways:

\`\`\`sql
-- 1. NOT EXISTS (preferred — NULL-safe, usually plans as an anti-join)
SELECT c.* FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

-- 2. LEFT JOIN / IS NULL
SELECT c.* FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.customer_id IS NULL;

-- 3. NOT IN (DANGEROUS if the subquery can return NULL)
SELECT * FROM customers
WHERE id NOT IN (SELECT customer_id FROM orders);
\`\`\`

:::gotcha
The **\`NOT IN\` trap**: if \`orders.customer_id\` contains a single \`NULL\`, \`NOT IN\` returns **zero rows** — because \`x <> NULL\` is UNKNOWN, poisoning the whole predicate. Prefer **\`NOT EXISTS\`**, which treats NULL correctly. \`LEFT JOIN / IS NULL\` is also safe (test the join key for NULL).
:::`,
  },
  {
    id: 'db-join-semi-join',
    question: 'What is a semi-join, and why is it better than a JOIN for existence checks?',
    difficulty: 'Medium',
    category: 'Joins',
    tags: ['semi-join', 'exists', 'duplicates'],
    answer: `A **semi-join** returns rows from the left table that have **at least one** match on the right — but **without duplicating** them and without pulling right-side columns. \`EXISTS\` and \`IN\` express it:

\`\`\`sql
-- customers who have ordered — each appears ONCE
SELECT c.* FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
\`\`\`

Contrast with an inner join:

\`\`\`sql
-- a customer with 5 orders appears 5 TIMES (then you'd need DISTINCT)
SELECT c.* FROM customers c JOIN orders o ON o.customer_id = c.id;
\`\`\`

:::senior
A semi-join answers "**does a match exist?**" and can **short-circuit** at the first hit, while a join answers "**give me every matched pair.**" Reaching for \`JOIN ... DISTINCT\` to check existence is a classic anti-pattern — it materializes and de-dups rows you never wanted.
:::`,
  },
  {
    id: 'db-join-non-equi',
    question: 'What is a non-equi join? Give a practical example.',
    difficulty: 'Medium',
    category: 'Joins',
    tags: ['non-equi join', 'range join', 'between'],
    answer: `A **non-equi join** uses something other than \`=\` in the \`ON\` condition — \`<\`, \`>\`, \`BETWEEN\`, or a range overlap. Instead of matching keys, it matches on a relationship.

\`\`\`sql
-- assign each sale to its price tier (a range table)
SELECT s.id, t.tier_name
FROM sales s
JOIN price_tiers t
  ON s.amount BETWEEN t.min_amount AND t.max_amount;
\`\`\`

Other uses: joining an event to the config "in effect" at its timestamp, or triangular joins for running comparisons.

:::gotcha
Non-equi joins cannot use a **hash join** (which needs equality), so the planner falls back to **nested loop** or **merge** — potentially O(n×m). Keep at least one side small or indexed on the range column, and watch for accidental many-to-many blowups when ranges overlap.
:::`,
  },
  {
    id: 'db-join-multiple-tables',
    question: 'How do you join more than two tables?',
    difficulty: 'Easy',
    category: 'Joins',
    tags: ['multi-table join', 'join order', 'readability'],
    answer: `Chain \`JOIN\` clauses — each new join attaches another table to the growing result. The engine still executes them pairwise, in an order the optimizer chooses.

\`\`\`sql
SELECT o.id, c.name, p.title, oi.quantity
FROM orders o
JOIN customers   c  ON c.id  = o.customer_id
JOIN order_items oi ON oi.order_id = o.id
JOIN products    p  ON p.id  = oi.product_id
WHERE o.created_at >= '2024-01-01';
\`\`\`

:::tip
Readability: alias every table, put each \`JOIN\` on its own line, keep the \`ON\` next to its \`JOIN\`. The *written* order does not dictate execution — the optimizer reorders joins by cost — but starting from the most-filtered table makes the query easier to reason about. Every join needs an \`ON\`; a missing one silently becomes a cross join.
:::`,
  },
  {
    id: 'db-join-fan-out',
    question: 'Why does joining multiple one-to-many tables inflate my SUM/COUNT, and how do you fix it?',
    difficulty: 'Hard',
    category: 'Joins',
    tags: ['fan-out', 'row multiplication', 'aggregation'],
    answer: `Because a join **multiplies rows**. If an order has 3 items and 2 shipments, joining both children produces 3×2 = **6 rows**, so \`SUM(oi.amount)\` counts each item's amount **twice**. This is **join fan-out** (row multiplication).

\`\`\`sql
-- WRONG: amounts and shipping costs both multiplied
SELECT o.id, SUM(oi.amount), SUM(s.cost)
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN shipments   s  ON s.order_id  = o.id
GROUP BY o.id;
\`\`\`

:::senior
Fix by **aggregating each child separately before joining**, so each contributes one row:
\`\`\`sql
SELECT o.id, i.amt, sh.cost
FROM orders o
LEFT JOIN (SELECT order_id, SUM(amount) amt FROM order_items GROUP BY order_id) i  ON i.order_id  = o.id
LEFT JOIN (SELECT order_id, SUM(cost)   cost FROM shipments  GROUP BY order_id) sh ON sh.order_id = o.id;
\`\`\`
The tell-tale symptom is a total that is suspiciously too large by an integer factor. \`COUNT(DISTINCT …)\` is a band-aid, not a fix.
:::`,
  },
  {
    id: 'db-join-emp-gt-manager',
    question: 'Write a query to find employees who earn more than their manager.',
    difficulty: 'Medium',
    category: 'Joins',
    tags: ['self join', 'query-pattern', 'hierarchy'],
    answer: `A **self-join**: join \`employees\` to itself, pairing each employee with their manager's row via \`manager_id\`, then compare salaries.

\`\`\`sql
SELECT e.name AS employee, e.salary, m.name AS manager, m.salary AS mgr_salary
FROM employees e
JOIN employees m ON m.id = e.manager_id
WHERE e.salary > m.salary;
-- expected: only rows where the report out-earns the boss
\`\`\`

:::gotcha
Use an **inner** join here on purpose: employees with no manager (\`manager_id IS NULL\`, e.g. the CEO) have nothing to compare against and are correctly excluded. If the interviewer wants "everyone, with a flag," switch to a \`LEFT JOIN\` and handle the NULL manager with \`COALESCE\`. Always alias the two roles clearly (\`e\` = employee, \`m\` = manager).
:::`,
  },
  {
    id: 'db-join-natural-join',
    question: 'What is a NATURAL JOIN, and why should you avoid it?',
    difficulty: 'Easy',
    category: 'Joins',
    tags: ['natural join', 'using', 'gotcha'],
    answer: `A **NATURAL JOIN** automatically joins on **all columns that share a name** in both tables — no \`ON\` clause.

\`\`\`sql
SELECT * FROM orders NATURAL JOIN customers;  -- joins on EVERY common column name
\`\`\`

:::gotcha
Avoid it in production. The join keys are **implicit**, so adding a same-named column later (like \`created_at\` or \`notes\` in both tables) silently changes the join condition and breaks the query — with no error. Be explicit with \`JOIN ... ON\` or \`JOIN ... USING (id)\`, which documents exactly which columns match and stays stable against schema changes.
:::`,
  },
  {
    id: 'db-join-vs-subquery',
    question: 'When should you use a JOIN vs a subquery?',
    difficulty: 'Medium',
    category: 'Joins',
    tags: ['join', 'subquery', 'exists'],
    answer: `They often produce the same result and even the same plan — modern optimizers rewrite between them. Choose by **intent and readability**:

- **JOIN** — when you need **columns from both** tables in the output.
- **Subquery (\`EXISTS\`/\`IN\`)** — when you only need to **filter** the outer table by whether related rows exist, not display them.

\`\`\`sql
-- need customer AND order columns -> join
SELECT c.name, o.total FROM customers c JOIN orders o ON o.customer_id = c.id;

-- only filtering customers -> semi-join reads clearer and avoids duplicates
SELECT c.name FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
\`\`\`

:::senior
A join used purely for filtering can **duplicate** outer rows (fan-out) and force a \`DISTINCT\`; \`EXISTS\` never does. Conversely, a correlated subquery in the \`SELECT\` list runs per-row and can be slower than one join. Pick the shape that matches the question, then verify with \`EXPLAIN\`.
:::`,
  },
  {
    id: 'db-join-set-ops-vs-join',
    question: 'What is the difference between a JOIN and a set operation like UNION?',
    difficulty: 'Easy',
    category: 'Joins',
    tags: ['union', 'set operations', 'join'],
    answer: `They combine data along **different axes**:

- A **JOIN** adds **columns** — it matches rows *horizontally* by a condition (a wider result).
- A **set operation** (\`UNION\`, \`INTERSECT\`, \`EXCEPT\`) adds **rows** — it stacks two result sets *vertically* (a longer result), and each side must have the same columns and compatible types.

\`\`\`sql
-- JOIN: one row per (customer, order) — more columns
SELECT c.name, o.total FROM customers c JOIN orders o ON o.customer_id = c.id;

-- UNION: current + archived customers in one list — more rows
SELECT id, name FROM customers
UNION ALL
SELECT id, name FROM archived_customers;
\`\`\`

:::tip
Rule of thumb: use a **join** to *enrich* rows with related columns; use a **set operation** to *concatenate or compare* two similarly-shaped sets. \`UNION\` dedups; \`UNION ALL\` is faster when you know there are no overlaps.
:::`,
  },
  {
    id: 'db-join-lateral',
    question: 'What is a LATERAL join (CROSS APPLY), and when do you need one?',
    difficulty: 'Hard',
    category: 'Joins',
    tags: ['lateral', 'cross apply', 'top-n-per-group'],
    answer: `A **LATERAL** subquery can **reference columns from tables earlier in the \`FROM\` clause** — a normal \`FROM\` subquery cannot. It runs the subquery **per outer row**, like a correlated subquery that can return multiple columns and rows. SQL Server spells it \`CROSS APPLY\` / \`OUTER APPLY\`.

\`\`\`sql
-- top 3 most recent orders PER customer (top-N-per-group, cleanly)
SELECT c.name, o.id, o.created_at
FROM customers c
CROSS JOIN LATERAL (
  SELECT id, created_at FROM orders
  WHERE customer_id = c.id            -- references the outer row
  ORDER BY created_at DESC LIMIT 3
) o;
\`\`\`

:::senior
\`LATERAL\` shines for **top-N-per-group**, calling a table-valued function per row, or unnesting arrays/JSON tied to each row. Use \`LEFT JOIN LATERAL … ON true\` to keep outer rows with no inner matches. It is often more readable than a \`ROW_NUMBER()\` window filter and lets the engine stop after N rows per group.
:::`,
  },
];

export default questions;
