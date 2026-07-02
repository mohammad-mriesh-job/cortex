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
];

export default questions;
