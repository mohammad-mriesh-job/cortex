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
  {
    id: 'db-fnd-constraints-types',
    question: 'What is a constraint, and what are the main types?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['constraints', 'integrity', 'ddl'],
    answer: `A **constraint** is a rule the database enforces on a column or table, rejecting any write that would violate it — integrity is guaranteed by the engine, not by hopeful application code.

| Constraint | Enforces |
|---|---|
| \`NOT NULL\` | column must have a value |
| \`UNIQUE\` | no duplicate values (multiple NULLs usually allowed) |
| \`PRIMARY KEY\` | \`UNIQUE\` + \`NOT NULL\`; the row's identity |
| \`FOREIGN KEY\` | value must exist in the referenced table |
| \`CHECK\` | a boolean expression must hold (e.g. \`price >= 0\`) |
| \`DEFAULT\` | value used when none is supplied |

\`\`\`sql
CREATE TABLE products (
  id    BIGINT PRIMARY KEY,
  name  TEXT NOT NULL,
  price NUMERIC(10,2) CHECK (price >= 0),
  sku   TEXT UNIQUE
);
\`\`\`

:::key
Push invariants into constraints wherever possible: the database enforces them for **every** client and connection, forever — application checks can be bypassed or race.
:::`,
  },
  {
    id: 'db-fnd-integrity-types',
    question: 'What is the difference between entity, referential, and domain integrity?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['integrity', 'constraints', 'keys'],
    answer: `The three classic **integrity** rules map directly onto constraint types:

- **Entity integrity** — every row is uniquely identifiable and the primary key is never NULL. Enforced by \`PRIMARY KEY\`.
- **Referential integrity** — a foreign-key value must match an existing parent row (no orphans). Enforced by \`FOREIGN KEY\`.
- **Domain integrity** — a column only holds legal values: right type, range, and format. Enforced by the column **type** plus \`CHECK\`, \`NOT NULL\`, and \`DEFAULT\`.

\`\`\`sql
CREATE TABLE orders (
  id      BIGINT PRIMARY KEY,                              -- entity
  user_id BIGINT REFERENCES users(id),                    -- referential
  status  TEXT CHECK (status IN ('new','paid','shipped')) -- domain
);
\`\`\`

:::senior
A fourth kind, **business / user-defined integrity**, covers cross-row or cross-table rules a single constraint can't express (e.g. "an account balance never goes negative across transfers"). Those need transactions, triggers, or application logic.
:::`,
  },
  {
    id: 'db-fnd-check-default',
    question: 'What do CHECK and DEFAULT constraints do, and what is the CHECK-with-NULL gotcha?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['check', 'default', 'constraints'],
    answer: `- **\`CHECK\`** validates a boolean expression on every insert/update and rejects the row if it is false — encode domain rules in the schema.
- **\`DEFAULT\`** supplies a value when the column is omitted from an \`INSERT\`; it does *not* restrict what you may insert.

\`\`\`sql
CREATE TABLE accounts (
  id      BIGINT PRIMARY KEY,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created TIMESTAMPTZ   NOT NULL DEFAULT now()
);
INSERT INTO accounts (id) VALUES (1);  -- balance=0, created=now()
\`\`\`

:::gotcha
A \`CHECK\` treats **UNKNOWN as passing**: \`CHECK (balance >= 0)\` still allows \`balance = NULL\`, because \`NULL >= 0\` is UNKNOWN, not false. Add \`NOT NULL\` when you also need presence. MySQL parsed but **silently ignored** \`CHECK\` before 8.0.16.
:::`,
  },
  {
    id: 'db-fnd-auto-increment',
    question: 'How do you auto-generate primary keys, and how does it differ across databases?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['auto-increment', 'identity', 'sequence', 'dialects'],
    answer: `Every engine offers monotonically increasing surrogate keys, but the **syntax and semantics differ** — a frequent portability trap:

| Database | Syntax |
|---|---|
| PostgreSQL | \`GENERATED ALWAYS AS IDENTITY\` (SQL standard) or \`SERIAL\` (legacy) |
| MySQL | \`AUTO_INCREMENT\` |
| SQL Server | \`IDENTITY(1,1)\` |
| Oracle | \`GENERATED ... AS IDENTITY\` (12c+) or a \`SEQUENCE\` |

\`\`\`sql
-- PostgreSQL (modern, preferred)
CREATE TABLE t (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY);
-- MySQL
CREATE TABLE t (id BIGINT AUTO_INCREMENT PRIMARY KEY);
\`\`\`

:::gotcha
Generated ids are **not gap-free**: a rolled-back or failed insert still consumes the number (the sequence/counter does not roll back). Never assume ids are contiguous, and never treat "max id" as a row count. For distributed inserts, prefer UUIDs or a snowflake-style id.
:::`,
  },
  {
    id: 'db-fnd-date-time-types',
    question: 'How should you store dates and times, and what is the TIMESTAMP-vs-TIMESTAMPTZ gotcha?',
    difficulty: 'Medium',
    category: 'Foundations',
    tags: ['data-types', 'timestamp', 'timezone'],
    answer: `Use the **native temporal types**, never strings or epoch integers in a \`VARCHAR\`:

| Type | Holds |
|---|---|
| \`DATE\` | calendar day, no time |
| \`TIME\` | time of day, no date |
| \`TIMESTAMP\` | date + time, **no** zone (a "wall clock") |
| \`TIMESTAMPTZ\` (Postgres) | an absolute instant |

\`\`\`sql
-- Postgres: store instants as timestamptz — it normalizes to UTC, converts on display
CREATE TABLE events (occurred_at TIMESTAMPTZ NOT NULL DEFAULT now());
\`\`\`

:::gotcha
Plain \`TIMESTAMP\` has **no zone**, so \`2024-03-10 02:30\` is ambiguous across DST and offsets. For an absolute moment (an event, an audit log) use \`TIMESTAMPTZ\` or store UTC; reserve zone-less timestamps for genuinely local wall-clock values like "store opens at 09:00." MySQL's \`TIMESTAMP\` auto-converts to UTC and only spans 1970–2038, while \`DATETIME\` does neither.
:::`,
  },
  {
    id: 'db-fnd-view-basics',
    question: 'What is a view and why would you use one?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['views', 'abstraction', 'security'],
    answer: `A **view** is a named, stored \`SELECT\` — a virtual table. It stores the *query*, not the data, so reading it re-runs the underlying query and always returns current rows.

\`\`\`sql
CREATE VIEW active_customers AS
SELECT id, name, email FROM customers WHERE status = 'active';
SELECT * FROM active_customers;  -- queries the live customers table
\`\`\`

Why use one:

- **Abstraction** — hide joins and complexity behind a simple name.
- **Security** — grant access to the view (a subset of rows/columns) without exposing the base table.
- **Consistency** — encode a canonical definition of "active customer" once.

:::note
A plain view adds no storage and no speed — it is a macro the planner inlines. When you need the *result* cached, use a **materialized view** and refresh it.
:::`,
  },
  {
    id: 'db-fnd-stored-procedure',
    question: 'What is the difference between a stored procedure and a function?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['stored-procedure', 'function', 'plpgsql'],
    answer: `Both are named blocks of SQL/procedural code stored in the database, but they are used differently:

| | Stored procedure | Function |
|---|---|---|
| Invoked with | \`CALL\` / \`EXECUTE\` | inside an expression (\`SELECT f(x)\`) |
| Returns | optional, via out-params | a value (scalar or table) |
| Side effects | yes — writes, transactions | traditionally pure / read-only |
| Usable in a query? | no | yes |

\`\`\`sql
SELECT total_owed(customer_id) FROM invoices;  -- function in a query
CALL archive_old_orders('2023-01-01');         -- procedure as a command
\`\`\`

:::senior
Procedures can manage transactions (\`COMMIT\`/\`ROLLBACK\`) that functions generally cannot, since a function runs *within* the calling statement. Pushing business logic into the database centralizes and speeds it up, but it is harder to version, test, and scale than application code — a real trade-off, not a free win.
:::`,
  },
  {
    id: 'db-fnd-schema-vs-database',
    question: 'What is the difference between a database, a schema, and a table?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['schema', 'database', 'namespaces'],
    answer: `They are **nested namespaces**:

- **Table** — the actual rows and columns.
- **Schema** — a namespace grouping related tables, views, and functions (e.g. \`sales.orders\` vs \`hr.orders\`); it scopes names and permissions.
- **Database** — the top-level container holding schemas; usually its own isolated catalog and connection target.

\`\`\`text
database  ->  schema  ->  table
myapp     ->  sales   ->  orders, customers
\`\`\`

:::gotcha
Terminology differs by engine. In **MySQL**, "schema" and "database" are **synonyms** — there is no separate schema layer. In **PostgreSQL / SQL Server / Oracle**, a database contains multiple schemas (\`public\` is Postgres's default). Fully-qualified names read \`database.schema.table\`.
:::`,
  },
  {
    id: 'db-fnd-null-meaning',
    question: 'What does NULL mean, and is it the same as 0 or an empty string?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['null', 'three-valued-logic', 'gotchas'],
    answer: `\`NULL\` means **unknown / absent** — the *lack* of a value. It is emphatically **not** zero and **not** an empty string:

| Value | Meaning |
|---|---|
| \`NULL\` | no value / unknown |
| \`0\` | the number zero (a known value) |
| \`''\` | an empty string (a known, zero-length value) |

Because NULL is "unknown," any comparison with it yields **UNKNOWN**, not true/false:

\`\`\`sql
SELECT NULL = NULL;   -- UNKNOWN, not TRUE
SELECT NULL = 0;      -- UNKNOWN
-- WHERE col = NULL   -- matches nothing; use  col IS NULL
\`\`\`

:::gotcha
In **Oracle**, an empty string \`''\` *is* stored as NULL — a famous portability wart. Everywhere else \`''\` and \`NULL\` are distinct. Always test with \`IS NULL\` / \`IS NOT NULL\`, never \`=\`.
:::`,
  },
  {
    id: 'db-fnd-referential-integrity',
    question: 'What is referential integrity, and what is an orphan row?',
    difficulty: 'Easy',
    category: 'Foundations',
    tags: ['referential-integrity', 'foreign-key', 'orphan'],
    answer: `**Referential integrity** is the guarantee that a foreign key always points at a row that actually exists — you cannot reference a customer that was never created or has been deleted. A **foreign-key constraint** enforces it.

An **orphan row** is a child whose parent is missing (an \`order\` whose \`customer_id\` matches no customer) — exactly what referential integrity prevents.

\`\`\`sql
-- rejected: no customer 999 exists
INSERT INTO orders (id, customer_id) VALUES (1, 999);
-- ERROR: insert violates foreign key constraint
\`\`\`

:::gotcha
Deleting a **parent** that still has children is blocked by default (\`NO ACTION\` / \`RESTRICT\`). Choose an \`ON DELETE\` action deliberately — \`CASCADE\` to delete children, \`SET NULL\` to detach them. Without any FK constraint, nothing stops orphans from accumulating silently.
:::`,
  },
  {
    id: 'db-fnd-relational-model',
    question: 'What is the relational model, and what does "SQL is set-based" mean?',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['relational-model', 'set-based', 'relational-algebra'],
    answer: `The **relational model** (Codd, 1970) represents all data as **relations** — unordered sets of tuples (rows) over named, typed attributes (columns) — and manipulates them with **relational algebra** (selection, projection, join, union, difference). There are no pointers; rows relate only by **values matching** across relations.

"**SQL is set-based**" means you declare *what* set of rows you want and let the engine decide *how*:

\`\`\`sql
-- one declarative statement; the engine optimizes, indexes, and parallelizes
UPDATE accounts SET rate = rate * 1.05 WHERE tier = 'gold';
\`\`\`

versus a procedural loop that fetches and updates one row at a time.

:::senior
Thinking in sets is the biggest mindset shift for app developers. A cursor/loop over 1M rows is often **orders of magnitude** slower than one set-based statement, because the engine can choose join algorithms, use indexes, batch I/O, and parallelize. "Stop looping — write one query" is a recurring senior review note.
:::`,
  },
  {
    id: 'db-fnd-data-independence',
    question: 'What is data independence (logical vs physical)?',
    difficulty: 'Hard',
    category: 'Foundations',
    tags: ['data-independence', 'ansi-sparc', 'abstraction'],
    answer: `**Data independence** is the ability to change one layer of the database without rewriting the layers above — the payoff of the three-level architecture (external *views* -> conceptual *logical schema* -> internal *physical storage*).

- **Physical data independence** — change *how* data is stored (add an index, repartition, switch to a clustered layout, move to SSD) without touching the logical schema or any query. Relational DBs achieve this strongly.
- **Logical data independence** — change the *logical schema* (add a column, split a table) without breaking existing queries, usually by preserving old shapes behind **views**. Harder to achieve.

:::senior
This is *why* SQL is declarative: because you name relations and columns rather than files and byte offsets, the engine is free to reorganize storage underneath you. It is the same principle that lets \`EXPLAIN\` show completely different physical plans for one query as data and indexes change — the logical meaning is fixed, the physical execution is not.
:::`,
  },
];

export default questions;
