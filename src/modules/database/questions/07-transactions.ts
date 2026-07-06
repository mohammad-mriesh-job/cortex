import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'db-txn-acid',
    question: 'What does ACID stand for, and what does each property guarantee?',
    difficulty: 'Easy',
    category: 'Transactions',
    tags: ['acid', 'transactions'],
    answer: `A transaction is a group of statements run as **one unit**. ACID names its four guarantees:

- **Atomicity** — all statements commit together or none do (no partial work).
- **Consistency** — every commit leaves the database satisfying all declared constraints (PK, FK, CHECK, UNIQUE).
- **Isolation** — concurrent transactions produce a result as if they ran in *some* serial order.
- **Durability** — once \`COMMIT\` returns, the change survives crashes and power loss.

:::key
**A** and **D** are about surviving *failures*; **I** is about *concurrency*; **C** is the correctness goal the other three protect.
:::`,
  },
  {
    id: 'db-txn-atomicity-rollback',
    question: 'How does a database implement atomicity — what makes ROLLBACK possible?',
    difficulty: 'Medium',
    category: 'Transactions',
    tags: ['atomicity', 'rollback', 'undo-log', 'wal'],
    answer: `Before a transaction modifies data, the engine records the **old value** in an **undo log** (and the change in the **write-ahead log**). Two outcomes:

- **\`ROLLBACK\` / error** — apply the undo log to restore the prior values.
- **Crash mid-transaction** — on restart, recovery replays the WAL to *redo* committed work and uses undo info to *roll back* anything uncommitted.

\`\`\`text
BEGIN -> debit Alice -> [CRASH] -> restart -> undo the debit -> as if it never ran
\`\`\`

So a half-finished transfer never persists: the debit without the matching credit is undone.`,
  },
  {
    id: 'db-txn-durability-wal',
    question: 'How does a database guarantee durability without flushing every data page on commit?',
    difficulty: 'Medium',
    category: 'Transactions',
    tags: ['durability', 'wal', 'fsync'],
    answer: `Via the **write-ahead log (WAL)**. The rule: **log the change and \`fsync\` it to disk *before* \`COMMIT\` acknowledges.** Data pages themselves are flushed lazily afterward.

- A crash after commit → replay the WAL on restart to restore the change.
- A crash before commit → the log lacks a commit record, so the change is discarded.

\`\`\`text
COMMIT -> append to WAL -> fsync WAL -> return OK   (data pages flushed later)
\`\`\`

:::senior
Sequential log \`fsync\` is far cheaper than random page writes, so the WAL is *the* durability + performance trick. \`fsync\` latency dominates commit throughput, which is why engines batch commits (**group commit**).
:::`,
  },
  {
    id: 'db-txn-read-anomalies',
    question: 'Explain dirty read, non-repeatable read, and phantom read.',
    difficulty: 'Medium',
    category: 'Transactions',
    tags: ['isolation', 'dirty-read', 'non-repeatable-read', 'phantom-read'],
    answer: `Three read anomalies, in increasing difficulty to prevent:

| Anomaly | What happens |
|---|---|
| **Dirty read** | You read another transaction's **uncommitted** write — which may then roll back. |
| **Non-repeatable read** | You read the **same row** twice and get different values (another txn updated + committed it in between). |
| **Phantom read** | You re-run the **same query** and the **set of matching rows** changed (another txn inserted/deleted committed rows). |

:::gotcha
Non-repeatable vs phantom is the classic trap: non-repeatable = an **existing row's value** changed; phantom = the **row set** for a predicate changed (rows appear/disappear).
:::`,
  },
  {
    id: 'db-txn-isolation-levels-matrix',
    question: 'For each SQL isolation level, which of the three anomalies can still occur?',
    difficulty: 'Hard',
    category: 'Transactions',
    tags: ['isolation-levels', 'serializable', 'repeatable-read'],
    answer: `Each step up removes the next anomaly:

| Level | Dirty read | Non-repeatable | Phantom |
|---|:---:|:---:|:---:|
| \`READ UNCOMMITTED\` | possible | possible | possible |
| \`READ COMMITTED\` | **no** | possible | possible |
| \`REPEATABLE READ\` | **no** | **no** | possible |
| \`SERIALIZABLE\` | **no** | **no** | **no** |

Defaults differ by engine: **PostgreSQL / Oracle / SQL Server → \`READ COMMITTED\`**; **MySQL/InnoDB → \`REPEATABLE READ\`**.

:::senior
Engines beat the standard: MySQL's \`REPEATABLE READ\` blocks most phantoms with **next-key (gap) locks**, and Postgres implements \`REPEATABLE READ\` as **snapshot isolation** (no phantoms on the snapshot).
:::`,
  },
  {
    id: 'db-txn-repeatable-vs-serializable',
    question: 'What is the difference between REPEATABLE READ (snapshot isolation) and SERIALIZABLE? What is write skew?',
    difficulty: 'Hard',
    category: 'Transactions',
    tags: ['serializable', 'snapshot-isolation', 'write-skew'],
    answer: `**Snapshot isolation** (how Postgres implements \`REPEATABLE READ\`) gives every transaction a stable snapshot, preventing dirty/non-repeatable/phantom reads. But it still allows **write skew**:

> Two transactions each read an overlapping set, each makes an individually-valid write, but the *combination* breaks an invariant.

Classic example: two on-call doctors each check "at least one other doctor is on call", then each books off — leaving **zero** on call.

**\`SERIALIZABLE\`** guarantees the outcome equals **some serial order** of the transactions, so write skew cannot happen. Postgres achieves it with **SSI** (serializable snapshot isolation), aborting transactions whose read/write dependencies form a dangerous cycle; SQL Server uses strict **two-phase locking**.

:::key
Snapshot isolation fixes *read* anomalies but not *write skew*. Only \`SERIALIZABLE\` is provably equivalent to running transactions one at a time.
:::`,
  },
  {
    id: 'db-txn-shared-vs-exclusive',
    question: 'What is the difference between shared and exclusive locks, and when are they compatible?',
    difficulty: 'Medium',
    category: 'Transactions',
    tags: ['locking', 'shared-lock', 'exclusive-lock'],
    answer: `- **Shared (S)** — taken by readers. *"I'm reading, don't change this."* Multiple S locks coexist on the same row.
- **Exclusive (X)** — taken by writers (\`UPDATE\`, \`DELETE\`, \`SELECT ... FOR UPDATE\`). *"I'm changing this, nobody else touch it."* Coexists with nothing.

**Compatibility matrix** (can the *requested* lock be granted while another is *held*?):

| Held ↓ / Requested → | Shared | Exclusive |
|---|:---:|:---:|
| Shared | granted | **wait** |
| Exclusive | **wait** | **wait** |

The one-line rule: **many readers together, one writer alone.**`,
  },
  {
    id: 'db-txn-deadlock',
    question: 'What is a deadlock, how does the database resolve one, and how do you prevent it?',
    difficulty: 'Medium',
    category: 'Transactions',
    tags: ['deadlock', 'locking', 'lock-ordering'],
    answer: `A **deadlock** is a cycle where each transaction holds a lock the other needs — a cycle in the **wait-for graph**. The textbook cause is two transactions locking two rows in **opposite order**.

**Resolution:** the engine's deadlock detector finds the cycle, picks a **victim** (cheapest to undo), and **aborts it** with a retriable error (Postgres \`40P01\`, MySQL \`1213\`). The survivor proceeds.

**Prevention** (break any Coffman condition):

- **Consistent lock ordering** — always acquire rows in the same order (e.g. by \`id\`). *The #1 fix* (removes circular wait).
- **Lock timeouts / \`NOWAIT\`** — give up and retry.
- **Keep transactions short**, touch fewer rows.

:::gotcha
Your application **must catch the deadlock error and retry the whole transaction** — retrying only the last statement corrupts data, since the rest was rolled back.
:::`,
  },
  {
    id: 'db-txn-mvcc',
    question: 'What is MVCC and how does it let readers and writers avoid blocking each other?',
    difficulty: 'Hard',
    category: 'Transactions',
    tags: ['mvcc', 'snapshot-isolation', 'versions'],
    answer: `**MVCC (Multi-Version Concurrency Control)** never overwrites a row in place. Every write creates a **new version**, stamped with:

- **\`xmin\`** — the transaction that created it,
- **\`xmax\`** — the transaction that superseded/deleted it (empty = live).

A transaction reads a **snapshot**: a version is visible when \`xmin\` committed before the snapshot and \`xmax\` is empty or after it. So a reader always finds a consistent old version without waiting.

**Result:** readers never block writers and writers never block readers — only two writers to the *same row* contend.

It also implements the isolation levels: **\`READ COMMITTED\`** = a fresh snapshot **per statement**; **\`REPEATABLE READ\`** = one snapshot **per transaction**.

:::note
The cost is **dead tuples** (old versions), reclaimed by **VACUUM** (Postgres) or the **undo purge** thread (InnoDB/Oracle).
:::`,
  },
  {
    id: 'db-txn-optimistic-vs-pessimistic',
    question: 'Compare optimistic and pessimistic locking. When would you choose each?',
    difficulty: 'Medium',
    category: 'Transactions',
    tags: ['optimistic-locking', 'pessimistic-locking', 'concurrency'],
    answer: `Both prevent **lost updates**; they differ in whether they assume a conflict:

| | Pessimistic | Optimistic |
|---|---|---|
| Assumes | conflict likely | conflict rare |
| Mechanism | lock first (\`SELECT ... FOR UPDATE\`) | version / CAS check at write |
| Others | **wait** | proceed; loser **retries** |
| Can deadlock? | **yes** | no (holds no locks) |

\`\`\`sql
-- optimistic: succeeds only if nobody moved the version
UPDATE items SET stock = stock - 1, version = version + 1
WHERE id = 42 AND version = 7;   -- 0 rows affected => reload and retry
\`\`\`

**Pick optimistic** for low contention, read-heavy work, long "think time", or stateless/distributed services. **Pick pessimistic** for high contention or a multi-step critical section that must own the row.

:::senior
Optimistic degrades under high contention (repeated wasted work + retries); pessimistic serializes writers and risks deadlocks. Measure your actual conflict rate — that number picks the strategy.
:::`,
  },
  {
    id: 'db-txn-select-for-update',
    question: 'What does SELECT ... FOR UPDATE do, and how does it fix a lost update?',
    difficulty: 'Medium',
    category: 'Transactions',
    tags: ['select-for-update', 'lost-update', 'pessimistic-locking'],
    answer: `\`SELECT ... FOR UPDATE\` takes an **exclusive lock** on the selected rows for the rest of the transaction — pessimistic locking. Any other transaction that tries to \`UPDATE\`/\`DELETE\`/\`FOR UPDATE\` those rows **blocks** until you commit.

Without it, a read-modify-write race loses an update:

\`\`\`sql
-- BAD: T1 and T2 both read 10, both write 9 -> one decrement lost
SELECT stock FROM items WHERE id = 42;      -- both see 10
UPDATE items SET stock = 9 WHERE id = 42;   -- second overwrites first

-- GOOD: lock the row first
BEGIN;
SELECT stock FROM items WHERE id = 42 FOR UPDATE;  -- T2 now waits
UPDATE items SET stock = stock - 1 WHERE id = 42;
COMMIT;
\`\`\`

:::tip
For a **job queue**, add \`SKIP LOCKED\` so each worker grabs a different unlocked row instead of blocking: \`... FOR UPDATE SKIP LOCKED\`.
:::`,
  },
  {
    id: 'db-txn-vacuum-bloat',
    question: 'Why does MVCC require VACUUM, and how can one long-running transaction bloat the whole database?',
    difficulty: 'Hard',
    category: 'Transactions',
    tags: ['mvcc', 'vacuum', 'bloat', 'long-transactions'],
    answer: `Because MVCC updates/deletes leave **old versions** behind, tables accumulate **dead tuples** — wasted space and slower scans. **VACUUM** (Postgres) / the **purge** thread (InnoDB) reclaims versions that **no active snapshot** can still see.

The catch is the **xmin horizon**: GC may only remove versions older than the **oldest snapshot still in use**. A single **long-running (or idle-in-transaction) transaction** pins that horizon, so dead tuples pile up **database-wide** — even in tables the long transaction never touched.

\`\`\`sql
-- an offender: a connection left open inside a transaction
BEGIN;                 -- snapshot taken here...
-- ...app does nothing for 30 minutes ('idle in transaction')
\`\`\`

:::key
Keep transactions **short**, commit promptly, and monitor \`idle in transaction\`. Long transactions are the #1 cause of MVCC bloat.
:::`,
  },
  {
    id: 'db-txn-consistency-meaning',
    question: "What does the 'C' (Consistency) in ACID actually mean?",
    difficulty: 'Easy',
    category: 'Transactions',
    tags: ['acid', 'consistency', 'constraints'],
    answer: `Consistency means each committed transaction moves the database from one **valid state** to another — every **declared constraint** holds: \`PRIMARY KEY\`, \`FOREIGN KEY\`, \`UNIQUE\`, \`CHECK\`, \`NOT NULL\`, triggers. If a transaction would violate one, the whole thing rolls back.

The subtlety: the database only enforces the rules **you declare**. An invariant you never encoded — "a balance never goes negative" with no \`CHECK\` — is **not** the database's Consistency to keep; that is the application's job (via Atomicity + Isolation + correct logic).

:::gotcha
Do not confuse **ACID Consistency** with **CAP Consistency** — different concepts. CAP-C is about all nodes seeing the same value; ACID-C is about **constraints** holding within one node. C is often called the "odd one out" of ACID because it is really an outcome the other three protect.
:::`,
  },
  {
    id: 'db-txn-isolation-set-level',
    question: "How do you set a transaction's isolation level, and what is the default?",
    difficulty: 'Easy',
    category: 'Transactions',
    tags: ['isolation-levels', 'defaults', 'syntax'],
    answer: `Per transaction (preferred) or per session:

\`\`\`sql
-- Postgres: set it on the transaction
BEGIN;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
-- ... statements ...
COMMIT;

-- MySQL: session or next-transaction
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;
\`\`\`

**Defaults differ:** Postgres / Oracle / SQL Server → \`READ COMMITTED\`; **MySQL/InnoDB** → \`REPEATABLE READ\`. Set the level as **high as correctness requires and as low as throughput allows**.

:::gotcha
The setting applies only to the transaction that declares it (or the session in MySQL's \`SESSION\` form) — it is not a global switch you flip once. And raising it to \`SERIALIZABLE\`/\`REPEATABLE READ\` means your app **must** catch **serialization-failure** errors and retry the transaction.
:::`,
  },
  {
    id: 'db-txn-lost-update',
    question: 'What is the lost update anomaly, and how do you prevent it?',
    difficulty: 'Medium',
    category: 'Transactions',
    tags: ['lost-update', 'concurrency', 'locking'],
    answer: `Two transactions read the same row, each modifies it based on what they read, and each writes back — the second write **overwrites** the first, so one update silently vanishes.

\`\`\`text
T1 reads stock=10        T2 reads stock=10
T1 writes 10-1=9         T2 writes 10-1=9    -- should be 8; one decrement lost
\`\`\`

Fixes:

- **Atomic write** — let the DB do the math: \`UPDATE items SET stock = stock - 1\` (no read-then-write in app code).
- **Pessimistic lock** — \`SELECT ... FOR UPDATE\` the row before modifying.
- **Optimistic lock** — a version column: \`UPDATE ... WHERE version = :seen\`; 0 rows affected → reload and retry.

:::gotcha
\`READ COMMITTED\` does **not** prevent lost update. Postgres \`REPEATABLE READ\` detects it and aborts the loser (serialization failure); InnoDB relies on locking the \`FOR UPDATE\` read. The atomic-\`UPDATE\` form sidesteps the whole problem.
:::`,
  },
  {
    id: 'db-txn-skip-locked-queue',
    question: 'How do you build a job queue in SQL with SELECT ... FOR UPDATE SKIP LOCKED?',
    difficulty: 'Medium',
    category: 'Transactions',
    tags: ['skip-locked', 'job-queue', 'select-for-update'],
    answer: `Many workers must each grab a **different** unclaimed job without blocking. \`FOR UPDATE\` locks the chosen row; \`SKIP LOCKED\` makes a worker **step over** rows another worker already locked instead of waiting.

\`\`\`sql
BEGIN;
SELECT id, payload FROM jobs
WHERE status = 'pending'
ORDER BY created_at
FOR UPDATE SKIP LOCKED
LIMIT 1;                          -- each worker gets a distinct row
-- ... process ...
UPDATE jobs SET status = 'done' WHERE id = :id;
COMMIT;
\`\`\`

Without \`SKIP LOCKED\`, workers serialize behind one lock; with \`NOWAIT\` they error instead of skipping. Supported in Postgres and MySQL 8+.

:::senior
Keep the transaction short — the lock is held until commit. For long jobs, mark the row \`'processing'\` and commit **fast**, then do the heavy work outside the transaction. Index \`(status, created_at)\`. This pattern lets a plain SQL table replace a dedicated broker at modest volume.
:::`,
  },
  {
    id: 'db-txn-savepoints',
    question: 'What is a savepoint, and what problem does it solve?',
    difficulty: 'Easy',
    category: 'Transactions',
    tags: ['savepoint', 'rollback', 'nested-transaction'],
    answer: `A **savepoint** is a named marker inside a transaction you can roll back to **without** aborting the whole thing — a partial rollback / nested subtransaction.

\`\`\`sql
BEGIN;
INSERT INTO orders ...;
SAVEPOINT sp1;
INSERT INTO line_items ...;    -- this one fails
ROLLBACK TO SAVEPOINT sp1;     -- undo just the failed insert
INSERT INTO line_items ...;    -- corrected version
COMMIT;                        -- the order still commits
\`\`\`

Uses: attempting an optional step, ORMs wrapping each nested operation, and recovering from a caught error mid-transaction.

:::gotcha
In Postgres, **any** error aborts the current (sub)transaction — you cannot keep issuing commands ("current transaction is aborted, commands ignored") unless you had a savepoint to roll back to. Savepoints are not free, though; heavy per-row use adds real overhead.
:::`,
  },
  {
    id: 'db-txn-autocommit-ddl',
    question: 'What is autocommit, and can you roll back a CREATE TABLE?',
    difficulty: 'Medium',
    category: 'Transactions',
    tags: ['autocommit', 'ddl', 'transactional-ddl', 'postgres', 'mysql'],
    answer: `**Autocommit** (the default in most clients) wraps each standalone statement in its own transaction that commits immediately. To group statements you open an explicit \`BEGIN ... COMMIT\`.

Whether **DDL** is transactional is dialect-specific — a classic trap:

- **PostgreSQL** has **transactional DDL**: \`CREATE\`/\`ALTER\`/\`DROP\` inside a transaction **can be rolled back**, so a migration is all-or-nothing.
- **MySQL / Oracle** do an **implicit commit** around most DDL — a \`CREATE TABLE\` silently commits your open transaction and **cannot** be rolled back.

\`\`\`sql
BEGIN;
CREATE TABLE t (...);   -- Postgres: rollback-able; MySQL: implicitly commits
ROLLBACK;               -- Postgres: t is gone; MySQL: t remains
\`\`\`

:::gotcha
On MySQL, a multi-statement migration that fails partway can leave the schema **half-applied**, because each DDL auto-committed. Make migrations idempotent/reentrant there; on Postgres you can wrap the whole migration in one transaction.
:::`,
  },
  {
    id: 'db-txn-write-skew-fix',
    question: "You have write skew under snapshot isolation but can't use SERIALIZABLE. How do you fix it?",
    difficulty: 'Medium',
    category: 'Transactions',
    tags: ['write-skew', 'snapshot-isolation', 'locking'],
    answer: `**Write skew:** two transactions read an overlapping set, each makes an individually-valid write, and the **combination** breaks an invariant (both on-call doctors go off-call). Snapshot isolation allows it because the two write **different rows**, so there is no write-write conflict to detect.

Fixes short of \`SERIALIZABLE\`:

- **Materialize the conflict** — lock a shared "guard" row so the transactions actually contend: \`SELECT ... FOR UPDATE\` on the anchoring row (the shift).
- **Promote the read to a write** — \`SELECT ... FOR UPDATE\` the rows you checked, so a concurrent transaction blocks instead of proceeding on a stale snapshot.
- **Add a real constraint** — a \`UNIQUE\` or Postgres **exclusion** constraint the database enforces atomically (e.g. forbid overlapping bookings).

:::senior
\`SERIALIZABLE\` is the clean fix — Postgres **SSI** detects write skew and aborts a transaction. The manual approaches are what you reach for when you cannot pay that abort/retry cost globally: you re-introduce a conflict point the engine **can** see.
:::`,
  },
  {
    id: 'db-txn-transaction-boundaries',
    question: 'How do you decide transaction boundaries in application code?',
    difficulty: 'Medium',
    category: 'Transactions',
    tags: ['transaction-boundaries', 'best-practices', 'locking'],
    answer: `A transaction should wrap **one logical unit of work** that must be atomic — and nothing more.

- **Keep it short.** Locks and the MVCC snapshot are held until commit; long transactions cause lock contention and block vacuum/purge.
- **No external I/O inside.** Never call a remote API, send email, or wait on user input mid-transaction — you would hold locks for the duration and cannot roll back that side effect.
- **Do slow prep outside**, then open the transaction only for the writes that must commit together.
- **One transaction per request** is a fine default; use explicit boundaries when a request does several independent units.

:::gotcha
"Open the transaction early, commit late" — wrapping a whole HTTP handler that also calls other services — is a top cause of lock pile-ups and **idle-in-transaction** bloat. Push network calls and heavy computation **outside** \`BEGIN\`/\`COMMIT\`.
:::`,
  },
  {
    id: 'db-txn-for-share-vs-for-update',
    question: 'What is the difference between SELECT ... FOR UPDATE and FOR SHARE?',
    difficulty: 'Medium',
    category: 'Transactions',
    tags: ['row-locks', 'for-share', 'for-update'],
    answer: `Both are explicit **row locks** taken by a \`SELECT\`:

- **\`FOR UPDATE\`** — an **exclusive** row lock; you intend to modify. Blocks other \`FOR UPDATE\`/\`FOR SHARE\`/\`UPDATE\`/\`DELETE\` on those rows.
- **\`FOR SHARE\`** — a **shared** row lock; you intend to read-and-rely-on but not change. Many \`FOR SHARE\` locks coexist, but they block writers.

Use \`FOR SHARE\` to pin a **parent** row you are referencing so nobody deletes or changes it while you insert a child — enforcing a rule the FK alone does not cover:

\`\`\`sql
SELECT 1 FROM accounts WHERE id = 42 FOR SHARE;   -- account can't vanish
INSERT INTO transfers (account_id, ...) VALUES (42, ...);
\`\`\`

Postgres also has weaker modes (\`FOR NO KEY UPDATE\`, \`FOR KEY SHARE\`) that FK maintenance uses so ordinary updates do not block child inserts.

:::gotcha
Two transactions each holding a \`FOR SHARE\` lock that then both try to upgrade to exclusive **deadlock** — the classic lock-upgrade deadlock.
:::`,
  },
  {
    id: 'db-txn-what-rr-does',
    question: 'REPEATABLE READ means different things in Postgres and MySQL. Explain.',
    difficulty: 'Hard',
    category: 'Transactions',
    tags: ['repeatable-read', 'snapshot-isolation', 'next-key-locks', 'postgres', 'mysql'],
    answer: `Both prevent dirty and non-repeatable reads, but the mechanism — and phantom behaviour — differ sharply:

- **PostgreSQL RR = snapshot isolation.** One snapshot for the whole transaction; a frozen view, no read locks. On a write conflict it **aborts** with a serialization failure (first-updater-wins) → your app retries. Phantoms don't appear on the snapshot, but **write skew** still can.
- **MySQL/InnoDB RR** gives plain \`SELECT\`s a consistent-read snapshot too, but **locking reads** (\`SELECT ... FOR UPDATE\`, \`UPDATE\`) take **next-key (gap) locks** that block inserts into the scanned range — preventing most phantoms by **locking** rather than snapshotting.

:::senior
A subtlety in InnoDB RR: a plain \`SELECT\` reads the snapshot while a **locking** \`SELECT\` reads the **latest committed** row, so the two can disagree inside one transaction. Net: Postgres RR is **optimistic** (detect-and-abort); InnoDB RR is **pessimistic** (lock ranges). Same name, opposite strategy — know your engine before reasoning about concurrency.
:::`,
  },
  {
    id: 'db-txn-lock-granularity',
    question: 'What is lock granularity, and what is lock escalation?',
    difficulty: 'Hard',
    category: 'Transactions',
    tags: ['lock-granularity', 'lock-escalation', 'locking'],
    answer: `**Granularity** is the size of what a lock covers: **row**, **page**, or **table** (plus index/gap locks). Fine-grained row locks maximize concurrency but cost memory and bookkeeping per lock; coarse table locks are cheap but serialize access.

**Lock escalation** is converting many fine locks into one coarse lock past a threshold — e.g. **SQL Server** escalates ~5,000 row locks on a table to a single **table** lock to cap memory, trading concurrency for lower overhead (and risking sudden blocking).

- **SQL Server / DB2** escalate row → table.
- **PostgreSQL does NOT escalate** row locks — lock info lives in the tuple itself, so millions of row locks are cheap (it still takes table locks for DDL).
- **InnoDB** locks index records and gaps; no escalation to table locks in normal operation.

:::gotcha
A mass \`UPDATE\`/\`DELETE\` on SQL Server can escalate mid-statement and lock the **whole table**, blocking everyone. **Batch** large writes into chunks to stay below the escalation threshold.
:::`,
  },
  {
    id: 'db-txn-2pc-saga',
    question: 'Why is two-phase commit (2PC) avoided in microservices, and what replaces it?',
    difficulty: 'Hard',
    category: 'Transactions',
    tags: ['2pc', 'saga', 'outbox', 'distributed-transactions'],
    answer: `**2PC** coordinates a distributed commit: a coordinator asks every participant to *prepare* (phase 1), then tells all to *commit* if the vote was unanimous (phase 2). Atomic, but with sharp costs:

- **Blocking** — if the coordinator dies after prepare, participants hold locks **indefinitely**, unsure whether to commit.
- **Coordinator is a SPOF**, and it is **synchronous**: latency is the slowest participant; availability is the product of all.

Replacements for cross-service consistency:

- **Saga** — a chain of local transactions, each with a **compensating** action to undo it if a later step fails. Eventual consistency, no global lock; driven by events (choreography) or an orchestrator.
- **Transactional outbox** — write the business row and an event row in **one local transaction**, then a relay publishes the event at-least-once — solving dual-write without 2PC.

:::senior
Best of all, design so a **single service owns each invariant** (one DB, one local transaction). Use sagas only when a workflow genuinely spans services, and make every step **idempotent** to survive retries.
:::`,
  },
];

export default questions;
