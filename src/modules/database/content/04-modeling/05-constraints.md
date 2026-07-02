---
title: Constraints
category: Data Modeling
categoryOrder: 4
order: 5
level: Intermediate
summary: NOT NULL, UNIQUE, CHECK, DEFAULT, PRIMARY KEY, and FOREIGN KEY — what each guarantees, with the NULL gotcha.
tags: constraints, not null, unique, check, foreign key, integrity
---

**Constraints** are rules the database enforces on every write, so bad data is rejected at the
source — no matter which app, script, or intern is writing. They are your last, strongest line
of defense for data integrity.

## The six you must know

| Constraint | Guarantees | Example |
|------------|-----------|---------|
| **NOT NULL** | the column always has a value | `qty INT NOT NULL` |
| **UNIQUE** | no duplicate values (NULLs usually allowed) | `email TEXT UNIQUE` |
| **CHECK** | a value satisfies a boolean condition | `CHECK (price >= 0)` |
| **DEFAULT** | value to use when none is supplied | `status TEXT DEFAULT 'new'` |
| **PRIMARY KEY** | `UNIQUE` **+** `NOT NULL`; row identity (one per table) | `id BIGINT PRIMARY KEY` |
| **FOREIGN KEY** | value must exist in the referenced table | `REFERENCES customers(id)` |

## All six on one table

```sql
CREATE TABLE orders (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id  BIGINT NOT NULL
                 REFERENCES customers(id) ON DELETE RESTRICT,        -- FOREIGN KEY
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','paid','shipped','cancelled')),
  total        NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  email        TEXT UNIQUE,                                          -- multiple NULLs OK
  placed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Column-level vs table-level

Single-column rules can sit inline. Anything spanning **multiple columns** (a composite key,
a multi-column unique, a compound foreign key) must be written at the **table level**.

````tabs
tabs:
  - label: Column-level
    body: |
      Each rule is attached to one column, inline.

      ```sql
      CREATE TABLE enrollment (
        student_id INT NOT NULL,
        course_id  INT NOT NULL,
        grade      CHAR(1) CHECK (grade IN ('A','B','C','D','F'))
      );
      ```
  - label: Table-level (composite)
    body: |
      Named constraints listed after the columns — the only way to span multiple columns.

      ```sql
      CREATE TABLE enrollment (
        student_id INT NOT NULL,
        course_id  INT NOT NULL,
        grade      CHAR(1),
        CONSTRAINT pk_enrollment PRIMARY KEY (student_id, course_id),
        CONSTRAINT fk_student    FOREIGN KEY (student_id) REFERENCES students(id),
        CONSTRAINT chk_grade     CHECK (grade IN ('A','B','C','D','F'))
      );
      ```

      Naming constraints (`pk_`, `fk_`, `chk_`) makes error messages and migrations readable.
````

## Foreign keys: what happens to children?

A foreign key can dictate what happens when the **parent** row is deleted or updated:

| `ON DELETE` / `ON UPDATE` | Effect on child rows |
|---------------------------|----------------------|
| **CASCADE** | delete / update the children too |
| **RESTRICT** | block the change if children exist (checked immediately) |
| **NO ACTION** | block if children exist (checked at statement end) — the default |
| **SET NULL** | set the child's foreign key to `NULL` |
| **SET DEFAULT** | set the child's foreign key to its `DEFAULT` value |

:::gotcha
`UNIQUE` is **not** the same as "at most one row". By the SQL standard each `NULL` is distinct
from every other `NULL`, so a `UNIQUE` column accepts **multiple NULL rows** in most engines
(PostgreSQL, MySQL, Oracle). If you truly need one-value-or-nothing, add `NOT NULL` alongside
`UNIQUE` — which is exactly what a `PRIMARY KEY` does.
:::

:::senior
`CHECK` passes when the predicate is `TRUE` **or** `UNKNOWN` (i.e. `NULL`). So
`CHECK (age >= 18)` silently accepts a `NULL` age — pair it with `NOT NULL` if that is wrong.
Also, standard `CHECK` cannot reference other rows or tables; cross-row rules need a trigger or
an `EXCLUDE`/assertion mechanism.
:::

## Constraint vocabulary

```flashcards
title: Constraint recall
cards:
  - front: 'NOT NULL'
    back: 'The column must contain a value — inserts/updates leaving it empty are rejected.'
  - front: 'UNIQUE'
    back: 'No two rows share the same value. NULLs are treated as distinct, so multiple NULLs are allowed.'
  - front: 'CHECK'
    back: 'A row is accepted only if a boolean predicate is TRUE or UNKNOWN (NULL).'
  - front: 'DEFAULT'
    back: 'Supplies a value when the INSERT omits the column. Not itself a validity rule.'
  - front: 'PRIMARY KEY'
    back: 'UNIQUE + NOT NULL, one per table — the row identity and default foreign-key target.'
  - front: 'FOREIGN KEY'
    back: 'Every value must match an existing key in the referenced table (referential integrity).'
```

## Check yourself

```quiz
title: Constraints
questions:
  - q: 'In most SQL databases, how many NULLs can a single `UNIQUE` column hold?'
    options:
      - 'Exactly one'
      - text: 'Several — NULLs are treated as distinct from each other'
        correct: true
      - 'None — NULL is rejected'
    explain: 'The SQL standard says no NULL equals another, so a UNIQUE constraint permits multiple NULL rows in Postgres, MySQL, and Oracle.'
  - q: '`PRIMARY KEY` is equivalent to which combination?'
    options:
      - text: 'UNIQUE + NOT NULL'
        correct: true
      - 'UNIQUE + CHECK'
      - 'NOT NULL + DEFAULT'
    explain: 'A primary key is a UNIQUE constraint that also forbids NULLs, and there is at most one per table.'
  - q: 'Which clause makes deleting a parent row automatically delete its child rows?'
    options:
      - text: 'FOREIGN KEY ... ON DELETE CASCADE'
        correct: true
      - 'ON DELETE RESTRICT'
      - 'ON DELETE SET NULL'
    explain: 'ON DELETE CASCADE propagates the delete to child rows. RESTRICT blocks it; SET NULL nulls the child foreign key.'
  - q: 'When is a `CHECK (end_date > start_date)` constraint evaluated?'
    options:
      - text: 'On every INSERT/UPDATE; the row is rejected if it evaluates to FALSE'
        correct: true
      - 'Once, when the table is created'
      - 'Only during SELECT queries'
    explain: 'CHECK runs on each INSERT/UPDATE. It passes when the predicate is TRUE or UNKNOWN (NULL), so a NULL date slips through unless you also add NOT NULL.'
```

:::key
`NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT`, `PRIMARY KEY`, `FOREIGN KEY` enforce integrity at the
database. Remember: `PRIMARY KEY` = `UNIQUE` + `NOT NULL`, and plain `UNIQUE` still lets many
`NULL`s through.
:::
