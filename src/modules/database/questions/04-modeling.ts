import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'db-mdl-primary-vs-unique',
    question: 'What is the difference between a PRIMARY KEY and a UNIQUE constraint?',
    difficulty: 'Easy',
    category: 'Data Modeling',
    tags: ['keys', 'primary-key', 'unique', 'constraints'],
    answer: `Both enforce uniqueness, but they differ in three ways:

| | PRIMARY KEY | UNIQUE |
|---|---|---|
| How many per table | **at most one** | any number |
| NULLs | **not allowed** | allowed (usually multiple) |
| Role | the row's identity, default FK target | an alternate/candidate key |

\`\`\`sql
CREATE TABLE users (
  id    BIGINT PRIMARY KEY,   -- UNIQUE + NOT NULL, the identity
  email TEXT UNIQUE           -- alternate key; permits multiple NULLs
);
\`\`\`

:::key
\`PRIMARY KEY\` = \`UNIQUE\` + \`NOT NULL\`, and there is only one per table.
:::`,
  },
  {
    id: 'db-mdl-super-candidate-primary',
    question: 'Explain super key, candidate key, primary key, and alternate key.',
    difficulty: 'Medium',
    category: 'Data Modeling',
    tags: ['keys', 'candidate-key', 'super-key'],
    answer: `They form a hierarchy from loosest to strictest:

- **Super key** — *any* set of columns that is unique for a row; may include redundant columns. e.g. \`{id}\`, \`{id, email}\`, \`{email, name}\`.
- **Candidate key** — a **minimal** super key: remove any column and it is no longer unique. e.g. \`{id}\` and \`{email}\`.
- **Primary key** — the **one** candidate key you choose as the row's identity (\`NOT NULL\` + \`UNIQUE\`).
- **Alternate key** — the candidate keys you did *not* pick; enforce them with \`UNIQUE\`.

So: every candidate key is a super key, and the primary key is the chosen candidate key.`,
  },
  {
    id: 'db-mdl-surrogate-vs-natural',
    question: 'Surrogate keys vs natural keys — what are the trade-offs, and which do you prefer?',
    difficulty: 'Medium',
    category: 'Data Modeling',
    tags: ['keys', 'surrogate-key', 'natural-key'],
    answer: `A **surrogate key** is system-generated and meaningless (auto-increment \`id\`, \`UUID\`). A **natural key** comes from real-world data (\`email\`, \`ISBN\`, country code).

| | Surrogate | Natural |
|---|---|---|
| Stability | never changes | can change / be reused |
| Meaning | none | carries business meaning |
| Width | narrow (fast joins/indexes) | can be wide/composite |
| Extra work | needs a UNIQUE on the natural column | none |

**Preference:** a surrogate primary key **plus** a \`UNIQUE\` constraint on the natural key. You get stable, compact foreign keys *and* still reject real-world duplicates. Natural keys are fine for small, truly-immutable lookup tables (e.g. \`iso_code\`).`,
  },
  {
    id: 'db-mdl-normal-forms',
    question: 'Walk me through 1NF, 2NF, and 3NF.',
    difficulty: 'Medium',
    category: 'Data Modeling',
    tags: ['normalization', '1nf', '2nf', '3nf'],
    answer: `The mnemonic: every non-key column must depend on **the key, the whole key, and nothing but the key**.

- **1NF — the key.** Cells are atomic (no lists, no repeating groups) and the table has a defined primary key.
- **2NF — the whole key.** No **partial** dependency: a non-key column must depend on the *entire* composite key, not just part of it. (Only relevant when the key is composite.)
- **3NF — nothing but the key.** No **transitive** dependency: a non-key column must not depend on *another non-key* column.

\`\`\`text
orders(order_id, product_id, qty, product_name, price, customer_id, customer_name)
  product_name, price  -> product_id  (partial)     => violates 2NF
  customer_name        -> customer_id (transitive)  => violates 3NF
\`\`\`

Fix by splitting each offending dependency into its own table (Products, Customers).`,
  },
  {
    id: 'db-mdl-bcnf-vs-3nf',
    question: 'How does BCNF differ from 3NF? Give a table that is in 3NF but not BCNF.',
    difficulty: 'Hard',
    category: 'Data Modeling',
    tags: ['normalization', 'bcnf', '3nf', 'functional-dependency'],
    answer: `**BCNF** is stricter: for **every** non-trivial functional dependency \`X → Y\`, \`X\` must be a **candidate key** (a superkey). 3NF relaxes this — it also allows the dependency if \`Y\` is a *prime* attribute (part of some candidate key).

**Classic 3NF-but-not-BCNF example** — a student takes a subject from a teacher, and each teacher teaches exactly one subject:

\`\`\`text
Enrollment(student, subject, teacher)
FDs:  (student, subject) -> teacher      -- teacher determined by the pair
      teacher            -> subject      -- but teacher alone fixes the subject
Candidate keys: (student, subject) and (student, teacher)
\`\`\`

\`teacher → subject\` has a determinant (\`teacher\`) that is **not** a candidate key → **not BCNF**. It *is* 3NF, because \`subject\` is a prime attribute. Fix: split into \`Teaches(teacher, subject)\` and \`Enroll(student, teacher)\`.

:::senior
BCNF decomposition is not always **dependency-preserving** — you can lose the ability to enforce an FD without a join. That is why many production schemas stop at 3NF.
:::`,
  },
  {
    id: 'db-mdl-anomalies',
    question: 'What are insert, update, and delete anomalies, and how does normalization prevent them?',
    difficulty: 'Medium',
    category: 'Data Modeling',
    tags: ['normalization', 'anomalies', 'redundancy'],
    answer: `They are the bugs that redundancy causes. Picture one wide table where each order row also stores the customer's name and city:

- **Update anomaly** — a customer moves city; you must update *every* order row, and any you miss leaves the data inconsistent.
- **Insert anomaly** — you cannot record a new customer until they place an order (no row to put them in).
- **Delete anomaly** — deleting a customer's only order also erases the customer's details entirely.

Normalization removes the redundancy by storing each fact **once**: split \`Customers\` from \`Orders\` and link with a foreign key. Now a customer exists independently, moves in a single \`UPDATE\`, and survives the deletion of their orders.`,
  },
  {
    id: 'db-mdl-when-denormalize',
    question: 'When and why would you denormalize a schema?',
    difficulty: 'Hard',
    category: 'Data Modeling',
    tags: ['denormalization', 'performance', 'trade-offs'],
    answer: `**Denormalization** adds deliberate redundancy (duplicated columns, pre-computed aggregates) to make **reads** faster by avoiding joins and aggregation.

Do it when **all** of these hold:
1. A read query is genuinely too slow, **and** indexing/query tuning did not fix it.
2. Reads vastly outnumber writes.
3. You can keep the duplicated data in sync (triggers, transactional write path, or async refresh).

Common forms: duplicated columns, pre-computed \`COUNT\`/\`SUM\`, **materialized views**, star schemas, and embedded JSON/array columns.

The cost is that **update anomalies return** — you now own consistency.

:::senior
Best practice: keep the **normalized store as the source of truth** and treat denormalized shapes as *derived* — materialized views, read replicas, a search index, or a CQRS read model refreshed asynchronously.
:::`,
  },
  {
    id: 'db-mdl-composite-key',
    question: 'What is a composite key and when do you need one?',
    difficulty: 'Easy',
    category: 'Data Modeling',
    tags: ['keys', 'composite-key', 'junction-table'],
    answer: `A **composite key** is a primary (or candidate) key made of **two or more columns**, used when no single column is unique on its own.

The classic case is a **junction table** resolving a many-to-many relationship, where the key is the pair of foreign keys:

\`\`\`sql
CREATE TABLE order_items (
  order_id   BIGINT REFERENCES orders(id),
  product_id BIGINT REFERENCES products(id),
  quantity   INT NOT NULL,
  PRIMARY KEY (order_id, product_id)   -- neither column is unique alone
);
\`\`\`

The pair \`(order_id, product_id)\` is unique — a given product appears at most once per order.`,
  },
  {
    id: 'db-mdl-fk-referential-actions',
    question: 'What do ON DELETE CASCADE, RESTRICT, and SET NULL do on a foreign key?',
    difficulty: 'Medium',
    category: 'Data Modeling',
    tags: ['foreign-key', 'referential-integrity', 'constraints'],
    answer: `They define what happens to **child** rows when the referenced **parent** row is deleted (or updated):

- **CASCADE** — delete/update the child rows too. Handy for owned children (order → order_items), dangerous if misused.
- **RESTRICT** — reject the delete while any child exists (checked immediately).
- **NO ACTION** — same effect, but the check is deferred to the end of the statement; this is the default.
- **SET NULL** — set the child's foreign key to \`NULL\` (the column must be nullable).
- **SET DEFAULT** — set the child's foreign key to its \`DEFAULT\`.

\`\`\`sql
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
\`\`\`

Without a foreign key at all, deleting a parent silently leaves **orphan** rows — the whole point of referential integrity.`,
  },
  {
    id: 'db-mdl-many-to-many',
    question: 'How do you model a many-to-many relationship in a relational database?',
    difficulty: 'Easy',
    category: 'Data Modeling',
    tags: ['er-modeling', 'many-to-many', 'junction-table', 'relationships'],
    answer: `You cannot express many-to-many directly — you introduce a **junction (associative) table** that holds a foreign key to each side, with the pair as its composite primary key. This turns one many-to-many into **two one-to-many** relationships.

Students take many courses; courses have many students:

\`\`\`sql
CREATE TABLE enrollments (
  student_id INT REFERENCES students(id),
  course_id  INT REFERENCES courses(id),
  enrolled_on DATE NOT NULL,
  PRIMARY KEY (student_id, course_id)
);
\`\`\`

A bonus: the junction table is the natural home for **relationship attributes** like \`enrolled_on\` or \`grade\` that belong to neither entity alone.`,
  },
  {
    id: 'db-mdl-one-to-one',
    question: 'How do you model a one-to-one relationship, and when is it worth splitting a table?',
    difficulty: 'Easy',
    category: 'Data Modeling',
    tags: ['one-to-one', 'relationships', 'vertical-partitioning'],
    answer: `Put the two entities in separate tables and share a key: the child's **primary key is also a foreign key** to the parent (or a \`UNIQUE\` FK). The \`UNIQUE\`/PK on the FK is what makes it one-to-one rather than one-to-many.

\`\`\`sql
CREATE TABLE users (id BIGINT PRIMARY KEY, email TEXT NOT NULL);
CREATE TABLE user_profiles (
  user_id BIGINT PRIMARY KEY REFERENCES users(id),  -- PK = FK => 1:1
  bio TEXT, avatar_url TEXT
);
\`\`\`

Split a 1:1 when some columns are **large** (a \`TEXT\`/\`BLOB\` you rarely read), **optional** (sparse, often NULL), **sensitive** (isolate for access control), or accessed by a **different workload**.

:::tip
Otherwise, keep 1:1 data in the **same table** — a needless split adds a join to every read for no benefit. The classic justification is moving a big or rarely-used column out of the hot row so table scans stay narrow (vertical partitioning).
:::`,
  },
  {
    id: 'db-mdl-one-to-many',
    question: 'How do you model a one-to-many relationship?',
    difficulty: 'Easy',
    category: 'Data Modeling',
    tags: ['one-to-many', 'foreign-key', 'relationships'],
    answer: `Put a **foreign key on the "many" side** pointing back to the "one." One customer has many orders, so \`orders\` carries \`customer_id\`.

\`\`\`sql
CREATE TABLE customers (id BIGINT PRIMARY KEY, name TEXT);
CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id),  -- FK on the many side
  total NUMERIC(10,2)
);
\`\`\`

The FK lives on the child because a single column holds one value — an order belongs to one customer, but a customer's id repeats across many order rows.

:::gotcha
**Index the foreign key** (\`customer_id\`). Most databases do *not* auto-index FK columns (InnoDB is the exception), yet you filter and join on them constantly — and an unindexed FK also makes parent deletes scan the whole child table. Make the FK \`NOT NULL\` unless "belongs to no one" is genuinely valid.
:::`,
  },
  {
    id: 'db-mdl-self-referencing-fk',
    question: 'What is a self-referencing foreign key, and what is it used for?',
    difficulty: 'Medium',
    category: 'Data Modeling',
    tags: ['self-referencing', 'adjacency-list', 'hierarchy'],
    answer: `A **self-referencing (recursive) foreign key** points to the primary key of **the same table**. It models hierarchies and networks where rows relate to other rows of the same type.

\`\`\`sql
CREATE TABLE employees (
  id         BIGINT PRIMARY KEY,
  name       TEXT NOT NULL,
  manager_id BIGINT REFERENCES employees(id)   -- points back at employees
);
\`\`\`

This is the **adjacency list** model: each row stores a pointer to its parent. The CEO's \`manager_id\` is \`NULL\` (the root). Category trees, threaded comments, and org charts all use it.

:::gotcha
Adjacency lists make "direct parent/child" trivial but "all descendants" hard — you need a **recursive CTE** (\`WITH RECURSIVE\`) to walk arbitrary depth. Make \`manager_id\` nullable for roots, and beware accidental cycles (A -> B -> A); a plain FK will not prevent them, so enforce acyclicity in the app.
:::`,
  },
  {
    id: 'db-mdl-tree-structures',
    question: 'What are the ways to store a tree or hierarchy in a relational database?',
    difficulty: 'Hard',
    category: 'Data Modeling',
    tags: ['tree', 'closure-table', 'nested-set', 'adjacency-list'],
    answer: `Four classic models, trading write simplicity for read (subtree) speed:

| Model | Stores | Subtree read | Move node |
|---|---|---|---|
| **Adjacency list** | \`parent_id\` per row | recursive CTE | trivial (1 update) |
| **Path enumeration** | a \`'/1/4/9/'\` string path | \`LIKE '/1/%'\` | rewrite subtree paths |
| **Nested set** | \`left\`/\`right\` bounds | fast range scan | expensive (renumber) |
| **Closure table** | all ancestor -> descendant pairs | simple join | moderate |

\`\`\`sql
-- closure table: one row per (ancestor, descendant, depth)
CREATE TABLE category_tree (
  ancestor BIGINT, descendant BIGINT, depth INT,
  PRIMARY KEY (ancestor, descendant)
);
\`\`\`

:::senior
**Adjacency list + recursive CTE** is the sane default today — simple, and modern engines walk it well. Reach for a **closure table** when subtree queries are hot and reads dominate: it trades extra write bookkeeping and storage for near-O(1) ancestor/descendant lookups. Nested sets are elegant but brutal to update, so they have fallen out of favor.
:::`,
  },
  {
    id: 'db-mdl-eav',
    question: 'What is the EAV (entity-attribute-value) model, and what are its pitfalls?',
    difficulty: 'Hard',
    category: 'Data Modeling',
    tags: ['eav', 'anti-pattern', 'jsonb'],
    answer: `**EAV** stores attributes as **rows** instead of columns: one skinny table of \`(entity_id, attribute, value)\` lets each entity have arbitrary, dynamic attributes without schema changes.

\`\`\`sql
CREATE TABLE product_attrs (
  product_id BIGINT, attribute TEXT, value TEXT,
  PRIMARY KEY (product_id, attribute)
);
-- (1,'color','red'), (1,'size','XL'), (2,'weight','3kg')
\`\`\`

:::gotcha
EAV fights the relational model and is a frequent anti-pattern:
- **No type safety or constraints** — \`value\` is \`TEXT\`, so "weight = red" is allowed.
- **Painful queries** — filtering on 3 attributes needs 3 self-joins or a pivot.
- **No per-attribute indexes or FKs**, and reporting is a nightmare.

Prefer real columns, or a **JSONB** column (indexable, far better than EAV) for sparse/dynamic data, or per-type tables. Reserve EAV for genuinely open-ended user-defined fields — and even then, JSONB usually wins.
:::`,
  },
  {
    id: 'db-mdl-star-snowflake',
    question: 'What is the difference between a star schema and a snowflake schema?',
    difficulty: 'Medium',
    category: 'Data Modeling',
    tags: ['star-schema', 'snowflake-schema', 'olap', 'warehouse'],
    answer: `Both are **dimensional models** for analytics (OLAP): a central **fact table** (measures like \`amount\`, \`quantity\`) surrounded by **dimension tables** (\`date\`, \`product\`, \`store\`).

- **Star schema** — dimensions are **denormalized** (flat). Fewer joins, faster queries, some redundancy.
- **Snowflake schema** — dimensions are **normalized** into sub-dimensions (product -> category -> department). More joins, less redundancy.

\`\`\`text
Star:      fact --- dim_product (flat: name, category, dept)
Snowflake: fact --- dim_product --- dim_category --- dim_department
\`\`\`

:::senior
**Star is the default for warehouses** — analysts value fewer joins and simpler queries over the storage saved by normalizing dimensions, and columnar compression makes the redundancy cheap. Snowflake helps when a dimension is huge or shared, or a sub-dimension changes independently. This is the opposite instinct from OLTP, where you normalize.
:::`,
  },
  {
    id: 'db-mdl-soft-delete',
    question: 'What is a soft delete, and what are its trade-offs?',
    difficulty: 'Easy',
    category: 'Data Modeling',
    tags: ['soft-delete', 'deleted-at', 'audit'],
    answer: `A **soft delete** marks a row as deleted instead of physically removing it — typically a \`deleted_at TIMESTAMP\` (NULL = live) or an \`is_deleted\` flag. It preserves history, enables "undo," and keeps foreign keys from breaking.

\`\`\`sql
UPDATE orders SET deleted_at = now() WHERE id = 42;   -- "delete"
SELECT * FROM orders WHERE deleted_at IS NULL;         -- normal reads
\`\`\`

:::gotcha
The cost: **every query must remember \`WHERE deleted_at IS NULL\`** — forget it once and deleted rows leak into results or reports. Other snags: \`UNIQUE\` constraints now clash with "deleted" duplicates (use a partial index \`WHERE deleted_at IS NULL\`), tables grow forever, and FKs can point at logically-dead rows. A view or an archive table gives cleaner separation.
:::`,
  },
  {
    id: 'db-mdl-uuid-vs-autoincrement',
    question: 'UUID vs auto-increment integer for primary keys — what are the trade-offs?',
    difficulty: 'Medium',
    category: 'Data Modeling',
    tags: ['uuid', 'auto-increment', 'primary-key'],
    answer: `| | Auto-increment \`BIGINT\` | UUID |
|---|---|---|
| Size | 8 bytes | 16 bytes |
| Generated by | the database | anywhere (app, client, offline) |
| Guessable / leaks count | yes | no |
| Insert locality | sequential (cache-friendly) | random (v4) |
| Merge across shards/DBs | collides | globally unique |

\`\`\`sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()   -- Postgres
\`\`\`

:::senior
The hidden cost of a **random UUID (v4)** as a **clustered** PK (InnoDB) is index fragmentation and **page splits**: random inserts scatter across the B-tree, hurting write throughput and cache hit rate. Fixes: use **UUID v7 / ULID** (time-ordered, so inserts stay sequential), or keep a \`BIGINT\` clustered PK and add the UUID as a secondary unique column. Prefer UUIDs for client-side/distributed id generation; prefer \`BIGINT\` for a single-node OLTP hot path.
:::`,
  },
  {
    id: 'db-mdl-index-foreign-keys',
    question: 'Should you index foreign key columns? Why?',
    difficulty: 'Easy',
    category: 'Data Modeling',
    tags: ['foreign-key', 'index', 'performance'],
    answer: `**Yes — almost always.** A foreign key constrains values but does **not** automatically create an index (InnoDB is the exception). Add one, for two reasons:

1. **Joins and filters** — you constantly query \`WHERE customer_id = ?\` and \`JOIN ON orders.customer_id\`; the index makes those fast.
2. **Parent deletes/updates** — to enforce the FK when a parent row changes, the database must find referencing children. Without an index it **scans the entire child table** for every parent delete.

\`\`\`sql
CREATE INDEX ix_orders_customer ON orders (customer_id);
\`\`\`

:::gotcha
An unindexed FK on a large child table turns a routine parent \`DELETE\` into a full table scan (and can cause lock contention) — one of the most common causes of mysteriously slow deletes. Postgres and SQL Server do **not** auto-index FKs; you must.
:::`,
  },
  {
    id: 'db-mdl-polymorphic-association',
    question: 'How do you model a polymorphic association (e.g. comments on both posts and photos)?',
    difficulty: 'Hard',
    category: 'Data Modeling',
    tags: ['polymorphic', 'foreign-key', 'exclusive-arc'],
    answer: `A **polymorphic association** is one child referencing **one of several** parent types. The naive design stores a type tag plus a loose id:

\`\`\`sql
-- naive polymorphic: CANNOT have a real FK
CREATE TABLE comments (
  id BIGINT PRIMARY KEY,
  commentable_type TEXT,   -- 'post' | 'photo'
  commentable_id   BIGINT, -- id in whichever table
  body TEXT
);
\`\`\`

:::gotcha
The naive form **cannot enforce a foreign key** (the id points at different tables), so referential integrity is lost. Better options:
- **Exclusive-arc / nullable FKs** — separate \`post_id\` and \`photo_id\` columns, each a real FK, with a \`CHECK\` that exactly one is non-NULL.
- **Shared parent table** — a \`commentable\` supertable that both \`posts\` and \`photos\` reference; comments FK to it.
- **Separate tables** — \`post_comments\`, \`photo_comments\`.

Real FKs beat a \`type\` string almost every time — reach for the exclusive-arc or shared-parent pattern.
:::`,
  },
  {
    id: 'db-mdl-enum-lookup-table',
    question: 'For a status/type column, should you use an ENUM, a CHECK, or a lookup table?',
    difficulty: 'Easy',
    category: 'Data Modeling',
    tags: ['enum', 'lookup-table', 'check'],
    answer: `Three ways to constrain a categorical column:

| Approach | Add a value | Query/join | Metadata |
|---|---|---|---|
| \`CHECK (status IN (...))\` | \`ALTER TABLE\` | simple | none |
| native \`ENUM\` type | \`ALTER TYPE\` (Postgres) | simple | none |
| **lookup table** + FK | \`INSERT\` a row | join to get label | rich (order, color, active) |

\`\`\`sql
CREATE TABLE order_status (code TEXT PRIMARY KEY, label TEXT, sort_order INT);
ALTER TABLE orders ADD FOREIGN KEY (status) REFERENCES order_status(code);
\`\`\`

:::senior
A **lookup table** is the most flexible and often the best default: adding a value is a plain \`INSERT\` (no DDL, no downtime), and you get a home for display labels, sort order, and active flags. Native \`ENUM\`s are compact but rigid — reordering/removing values is painful and differs across engines. Use a \`CHECK\` for a tiny, stable set (like \`'M'/'F'/'X'\`).
:::`,
  },
  {
    id: 'db-mdl-nullable-columns',
    question: 'When should a column allow NULL vs be NOT NULL with a default?',
    difficulty: 'Medium',
    category: 'Data Modeling',
    tags: ['null', 'not-null', 'schema-design'],
    answer: `Default to **\`NOT NULL\`**. Allow \`NULL\` only when "no value" is a **meaningful, distinct state** — genuinely *unknown* or *not applicable* — different from any real value.

- \`middle_name\` -> nullable (some people have none).
- \`deleted_at\` -> nullable (NULL = "not deleted"; a meaningful sentinel).
- \`login_count\` -> \`NOT NULL DEFAULT 0\` (zero is the right "none," not unknown).

:::gotcha
Do not use \`NULL\` where \`0\`, \`''\`, or a default fits — NULLs complicate everything downstream: three-valued logic in \`WHERE\`, the \`NOT IN\` trap, aggregates that skip them, and \`<>\` comparisons that silently drop rows. Every nullable column is a special case each query must remember to handle. \`NOT NULL DEFAULT\` also lets the planner reason more precisely. Make columns nullable deliberately, not by omission.
:::`,
  },
  {
    id: 'db-mdl-audit-history',
    question: 'How do you keep a history of changes to a row (audit trail or versioning)?',
    difficulty: 'Hard',
    category: 'Data Modeling',
    tags: ['audit', 'versioning', 'scd', 'temporal'],
    answer: `Several patterns, by how much history you need:

- **Audit/log table** — an \`INSERT\`-only shadow table capturing \`(row_id, changed_at, changed_by, old/new values)\`, written by a **trigger** or the app. Best for compliance trails.
- **Temporal / SCD Type 2** — never update in place; close the current version (\`valid_to = now()\`) and insert a new one with \`valid_from\`. \`WHERE valid_to IS NULL\` gets the current row; a date filter reconstructs any past state.
- **System-versioned tables** — built-in temporal tables (SQL Server, MariaDB, Postgres extensions) manage history rows automatically.

\`\`\`sql
-- SCD Type 2 shape
ALTER TABLE prices ADD COLUMN valid_from TIMESTAMPTZ, ADD COLUMN valid_to TIMESTAMPTZ;
\`\`\`

:::senior
Pick by requirement: an **append-only audit table** for "who changed what, when" (cheap, off the hot path); **SCD Type 2** for point-in-time analytics ("what was the price on that date"); **event sourcing** when the change log *is* the source of truth. Do not bolt full versioning onto every table — it is real write and storage cost.
:::`,
  },
  {
    id: 'db-mdl-er-notation',
    question: 'What do the crow\'s-foot symbols in an ER diagram mean?',
    difficulty: 'Easy',
    category: 'Data Modeling',
    tags: ['er-diagram', 'crows-foot', 'cardinality'],
    answer: `**Crow's-foot notation** encodes cardinality at each end of a relationship line — the symbol nearest an entity reads as "(minimum, maximum)":

| Symbol | Means |
|---|---|
| one bar + bar | exactly one |
| circle + bar | zero or one |
| bar + crow's foot | one or many |
| circle + crow's foot | zero or many |

\`\`\`mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : "appears in"
\`\`\`

Read the middle relationship as: an order has **one or many** items, and each item belongs to **exactly one** order.

:::tip
The two symbols on a line give you both the **relationship type** (1:1, 1:M, M:N) and **optionality** (whether a side can have zero). A many-to-many (\`}o--o{\`) is a signal you will need a **junction table** to implement it.
:::`,
  },
];

export default questions;
