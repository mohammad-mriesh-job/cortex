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
];

export default questions;
