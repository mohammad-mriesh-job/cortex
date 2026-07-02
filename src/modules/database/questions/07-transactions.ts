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
];

export default questions;
