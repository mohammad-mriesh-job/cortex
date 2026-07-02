import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'db-fnd-dbms-vs-rdbms',
    question: 'What is the difference between a DBMS and an RDBMS?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['dbms', 'rdbms', 'relational'],
    answer: `Both are software that manages data — the **R** ("relational") adds structure and rules.

- **DBMS (Database Management System)** — any software that stores and retrieves data. It makes no assumptions about *shape*: the data could be files, key-value pairs, or documents.
- **RDBMS (Relational DBMS)** — a DBMS that organizes data into **tables** (rows and columns), links tables with **keys**, enforces **types and constraints**, and is queried with **SQL**. Examples: PostgreSQL, MySQL, Oracle, SQL Server.

| | DBMS | RDBMS |
|---|---|---|
| Data shape | anything | tables (rows + columns) |
| Relationships | manual | foreign keys |
| Query language | varies | SQL |
| Integrity rules | few | types, keys, constraints |

:::tip
When an interviewer says "database" they almost always mean an **RDBMS**. The relational model plus SQL is the default assumption.
:::`,
  },
  {
    id: 'db-fnd-why-db-over-files',
    question: 'Why use a database instead of just storing data in flat files (CSV/JSON)?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['flat-files', 'concurrency', 'integrity'],
    answer: `Flat files work for one user and small data, but a DBMS solves problems that appear the moment the data is shared or grows:

- **Concurrency** — locking / MVCC let many users read and write safely; two writers on a file corrupt it or lose updates.
- **Fast lookups** — an **index** finds a row without scanning the whole file.
- **Integrity** — types, keys, and constraints reject bad data at the door.
- **Transactions** — grouped changes are **all-or-nothing** (ACID); a file can be left half-written.
- **Crash recovery** — a write-ahead log restores a consistent state after a crash.
- **Security** — grant access per table or column, not just per file.

:::key
The short answer: **concurrency, integrity, transactions, indexing, and recovery** — none of which a raw file gives you.
:::`,
  },
  {
    id: 'db-fnd-oltp-vs-olap',
    question: 'What is the difference between OLTP and OLAP workloads?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['oltp', 'olap', 'workloads', 'schema'],
    answer: `They are two different *jobs* the same data supports:

| | OLTP (transactional) | OLAP (analytical) |
|---|---|---|
| Purpose | run the business | analyze the business |
| Query | many tiny \`INSERT\`/\`UPDATE\`/\`SELECT\` | few large aggregations |
| Rows per query | a handful | millions |
| Goal | low latency, high volume | high scan throughput |
| Schema | **normalized** | **denormalized** / star schema |
| Storage | row-oriented | often column-oriented |
| Example | "place this order" | "revenue by region, last 5 years" |

- **OLTP** = Online **Transaction** Processing — the live app: checkout, sign-up, status updates.
- **OLAP** = Online **Analytical** Processing — reporting, dashboards, BI.

:::senior
Because their access patterns clash, teams often keep them separate: an OLTP database serves the app, and data is periodically loaded (ETL/ELT) into an OLAP **data warehouse** (e.g. a column store) so heavy analytics never slow down live transactions.
:::`,
  },
  {
    id: 'db-fnd-relational-vocabulary',
    question: 'Define relation, tuple, attribute, degree, cardinality, and domain.',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['relational-model', 'terminology', 'tables'],
    answer: `These are the formal names for the parts of a table:

| Term | Plain English | Example |
|---|---|---|
| **Relation** | the table | \`students\` |
| **Tuple** | a row | \`(2, 'Bo', 3.4)\` |
| **Attribute** | a column | \`gpa\` |
| **Domain** | legal values for an attribute | \`gpa\` between 0.00 and 4.00 |
| **Degree** | number of columns | 3 |
| **Cardinality** | number of rows | however many students |

:::note
A relation is a **set** of tuples — rows have no inherent order and columns are referenced by name, not position. That is why \`SELECT\` results are unordered unless you add \`ORDER BY\`.
:::`,
  },
  {
    id: 'db-fnd-primary-vs-foreign-key',
    question: 'What is the difference between a primary key and a foreign key?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['primary-key', 'foreign-key', 'referential-integrity'],
    answer: `They do opposite jobs — one *identifies*, the other *links*.

- **Primary key (PK)** — uniquely identifies each row in *its own* table. It must be **unique** and **NOT NULL**, and there is exactly one per table.
- **Foreign key (FK)** — a column that **references** the primary key of another (or the same) table. It enforces **referential integrity**: you cannot reference a row that does not exist.

\`\`\`sql
CREATE TABLE orders (
  id          BIGINT PRIMARY KEY,          -- this table's identity
  customer_id BIGINT REFERENCES customers(id)  -- points at customers' PK
);
\`\`\`

:::gotcha
A foreign key can be **NULL** (an order with no customer yet) and its values are **not** required to be unique (one customer, many orders). Only the *primary key* it points to must be unique and non-null.
:::`,
  },
  {
    id: 'db-fnd-natural-vs-surrogate-key',
    question: 'Natural key vs surrogate key — which should you use as a primary key?',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['keys', 'surrogate-key', 'natural-key', 'design'],
    answer: `A **natural key** is a real-world attribute that is already unique (email, ISBN, SSN). A **surrogate key** is a meaningless, system-generated id (auto-increment integer or UUID).

| | Natural key | Surrogate key |
|---|---|---|
| Source | business data | generated by the DB |
| Meaning | has real meaning | none |
| Stability | can change (people change email) | never changes |
| Width for FKs | can be wide / composite | narrow, uniform |

**Most schemas prefer a surrogate PK** because:

- Business values change — if \`email\` is the PK and it changes, every foreign key must cascade.
- Surrogates are compact and uniform, which keeps indexes and joins efficient.
- They avoid leaking real data (like an SSN) into every child table.

:::senior
A common best practice: use a **surrogate** as the primary key *and* add a \`UNIQUE\` constraint on the natural key (e.g. \`email\`) to enforce business uniqueness. You get stable references *and* real-world integrity. Note UUID PKs trade global uniqueness for wider, less cache-friendly indexes than a \`BIGINT\`.
:::`,
  },
  {
    id: 'db-fnd-sql-sublanguages',
    question: 'What are the SQL sublanguages (DDL, DML, DCL, TCL) and which commands belong to each?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['sql', 'ddl', 'dml', 'dcl', 'tcl'],
    answer: `SQL commands group by *what they act on*:

| Family | Acts on | Commands |
|---|---|---|
| **DDL** — Data Definition | the schema | \`CREATE\`, \`ALTER\`, \`DROP\`, \`TRUNCATE\` |
| **DML** — Data Manipulation | the rows | \`INSERT\`, \`UPDATE\`, \`DELETE\`, \`SELECT\` |
| **DCL** — Data Control | permissions | \`GRANT\`, \`REVOKE\` |
| **TCL** — Transaction Control | transaction boundaries | \`COMMIT\`, \`ROLLBACK\`, \`SAVEPOINT\` |

- **DDL** defines/changes structure and usually **auto-commits**.
- **DML** reads and changes data (some split \`SELECT\` into its own **DQL**).
- **DCL** manages who can do what.
- **TCL** makes a set of DML statements atomic.

:::tip
Memory hook: **D**efinition, **M**anipulation, **C**ontrol, **T**ransaction. If it changes *structure* it is DDL; if it changes *rows* it is DML.
:::`,
  },
  {
    id: 'db-fnd-truncate-vs-delete',
    question: 'What is the difference between TRUNCATE, DELETE, and DROP?',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['truncate', 'delete', 'drop', 'ddl', 'dml'],
    answer: `All three remove data, but at different levels and with different guarantees:

| | \`DELETE\` | \`TRUNCATE\` | \`DROP\` |
|---|---|---|---|
| Family | DML | DDL | DDL |
| Removes | selected rows | **all** rows | the **whole table** |
| \`WHERE\` clause | yes | no | no |
| Speed | slow (row by row, logged) | fast (deallocates pages) | fast |
| Fires triggers | yes | no | no |
| Resets identity/auto-increment | no | yes | n/a |
| Rollback | yes (in a transaction) | often **no** (engine-dependent) | often no |
| Table after | exists, empty | exists, empty | gone |

\`\`\`sql
DELETE FROM logs WHERE created_at < '2024-01-01';  -- some rows, rollback-able
TRUNCATE TABLE logs;                                -- all rows, fast, resets ids
DROP TABLE logs;                                    -- table itself is gone
\`\`\`

:::gotcha
Reach for \`DELETE\` when you need a \`WHERE\` filter, triggers, or the ability to roll back. Use \`TRUNCATE\` to empty a large table quickly. Because \`TRUNCATE\`/\`DROP\` are **DDL**, many engines auto-commit them — there may be no undo.
:::`,
  },
  {
    id: 'db-fnd-money-float',
    question: 'Why should you never store money in a FLOAT/DOUBLE column?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['data-types', 'decimal', 'float', 'money'],
    answer: `Floating-point types (\`FLOAT\`, \`REAL\`, \`DOUBLE PRECISION\`) store numbers in **binary**, and most decimal fractions — including \`0.1\` — have no exact binary representation. The tiny errors accumulate:

\`\`\`sql
SELECT 0.1 + 0.2;        -- as float: 0.30000000000000004
SELECT 0.1::float * 3;   -- not exactly 0.3
\`\`\`

Add thousands of transactions and the ledger drifts by fractions of a cent — unacceptable for money.

**Use exact types instead:**

- \`DECIMAL(p, s)\` / \`NUMERIC(p, s)\` — fixed precision \`p\` and scale \`s\` (decimal places). \`DECIMAL(12,2)\` stores values up to 10 digits before the point and 2 after, **exactly**.
- Or store **integer cents** (\`BIGINT\`) and format on display.

:::key
Money = \`DECIMAL\`/\`NUMERIC\` (or integer cents). Floats are for measurements and scientific values where tiny approximation is acceptable, **never** for currency.
:::`,
  },
  {
    id: 'db-fnd-char-varchar-text',
    question: 'When would you use CHAR vs VARCHAR vs TEXT?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['data-types', 'char', 'varchar', 'text'],
    answer: `They are all string types; the difference is **length behavior**:

| Type | Length | Storage | Use when |
|---|---|---|---|
| \`CHAR(n)\` | fixed at \`n\` | **space-padded** to \`n\` | values are always the same width — a currency or country code (\`'US'\`) |
| \`VARCHAR(n)\` | up to \`n\` | only what you use | short text with a sensible cap — a name (\`VARCHAR(255)\`) |
| \`TEXT\` | unbounded | only what you use | long or unpredictable text — a comment or article body |

- \`CHAR\` pads with spaces, which can surprise you in comparisons and wastes space if values vary in length.
- \`VARCHAR(n)\` documents intent and caps abuse, storing just the actual characters.

:::note
In **PostgreSQL**, \`VARCHAR(n)\` and \`TEXT\` are the same under the hood — the length limit is just a check constraint, not a performance win. In **MySQL** the choice interacts with row-format and index limits, so it matters more. Either way, avoid \`CHAR\` unless the width is genuinely fixed.
:::`,
  },
];

export default questions;
