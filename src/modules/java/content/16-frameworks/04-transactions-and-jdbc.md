---
title: Transactions & JDBC
category: Frameworks & Persistence
categoryOrder: 16
order: 4
level: Advanced
summary: How @Transactional really works (proxy-based AOP), propagation and rollback rules, the self-invocation trap, and the JDBC fundamentals underneath — PreparedStatement, try-with-resources, and connection pooling.
tags: transactions, transactional, propagation, rollback, jdbc, preparedstatement, connection pool
---

Spring's `@Transactional` makes a method atomic — begin a transaction on entry, commit on success, roll back on failure. But it's **proxy-based**, and the gap between what the annotation *looks* like it does and what it *actually* does is a favorite interview trap.

## How @Transactional works

Spring wraps your bean in a **proxy**. Calls from *outside* pass through the proxy, which opens/commits the transaction around your method. This has two immediate consequences you must know.

```java
@Service
class OrderService {
    @Transactional
    public void placeOrder(Order o) {
        repo.save(o);
        payment.charge(o);      // if this throws, the save is rolled back
    }
}
```

## Rollback rules — the checked-exception surprise

:::gotcha
By default Spring rolls back on **`RuntimeException`** and **`Error`**, but **NOT** on checked exceptions. A method that throws a checked `IOException` mid-transaction will **commit** the partial work. Force it with `@Transactional(rollbackFor = Exception.class)`.
:::

## The self-invocation trap

:::gotcha
Because the transaction lives on the **proxy**, calling one `@Transactional` method from **another method in the same class** (`this.placeOrder(...)`) bypasses the proxy — so **no transaction starts**. The `@Transactional` on an internally-called method is silently ignored. Split it into another bean, or inject a self-reference, so the call goes through the proxy.
:::

## Propagation — nesting behavior

| Propagation | Behavior |
|--|--|
| `REQUIRED` (default) | join the current transaction, or start one if none |
| `REQUIRES_NEW` | **suspend** the current one and run in a new, independent transaction |
| `NESTED` | a savepoint within the current transaction (partial rollback) |
| `SUPPORTS` | join if one exists, else run non-transactionally |
| `MANDATORY` | must already be inside a transaction, else throw |

The classic use of `REQUIRES_NEW`: writing an **audit log** that must persist *even if the outer business transaction rolls back*.

:::note
Isolation levels (`READ_COMMITTED`, `REPEATABLE_READ`, `SERIALIZABLE`) are set via `@Transactional(isolation = ...)`. What they actually prevent — dirty/non-repeatable/phantom reads — is covered in the [Database track](/database/topic/transactions/isolation-levels).
:::

## Underneath: JDBC done safely

Spring Data sits on JDBC. Know the raw form — especially **parameterized** queries and deterministic cleanup.

```java
String sql = "SELECT id, total FROM orders WHERE customer_id = ?";
try (Connection c = dataSource.getConnection();
     PreparedStatement ps = c.prepareStatement(sql)) {   // try-with-resources closes both
    ps.setLong(1, customerId);                            // bound param — NOT string concat
    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) { /* rs.getLong("id") ... */ }
    }
}
```

:::gotcha
Always use a **`PreparedStatement`** with bound parameters, never string concatenation — concatenating user input into SQL is the classic **SQL injection** hole. Bound parameters are also faster (the DB caches the plan).
:::

## Connection pooling

Opening a DB connection is expensive (TCP + auth), so apps reuse a **pool**. Spring Boot ships **HikariCP** by default; `getConnection()` borrows an idle connection and `close()` returns it to the pool rather than tearing it down.

:::senior
Tuning wisdom: a connection pool should be **small** — often `pool size ≈ (cores × 2) + effective_spindles`, not hundreds. Too many connections thrash the database. Watch for **connection leaks** (a path that forgets to `close()`); try-with-resources prevents them. And keep transactions **short** — holding a connection while calling a slow external API starves the pool.
:::

## Check yourself

```quiz
title: Transactions & JDBC check
questions:
  - q: 'A @Transactional method throws a checked IOException. By default, what happens?'
    options:
      - text: 'It commits — Spring only rolls back on RuntimeException/Error unless you set rollbackFor'
        correct: true
      - 'It always rolls back'
      - 'It retries the transaction'
    explain: 'Default rollback covers unchecked exceptions and Errors only. For checked exceptions use @Transactional(rollbackFor = ...).'
  - q: 'Calling a @Transactional method via `this.method()` from the same class does what?'
    options:
      - text: 'Bypasses the proxy, so no transaction is started (the annotation is ignored)'
        correct: true
      - 'Starts a nested transaction'
      - 'Throws an exception'
    explain: 'Proxy-based AOP only intercepts external calls. Self-invocation goes directly to the target instance, skipping the transactional advice. Move the method to another bean.'
  - q: 'Why use a PreparedStatement with bound parameters instead of concatenating values into the SQL?'
    options:
      - text: 'It prevents SQL injection and lets the database cache the query plan'
        correct: true
      - 'It automatically opens a transaction'
      - 'It is required to read a ResultSet'
    explain: 'Bound parameters separate code from data, closing the injection hole, and the parameterized statement is reusable/cacheable by the DB.'
```

:::key
`@Transactional` is **proxy-based**: it rolls back on unchecked exceptions only (use `rollbackFor` for checked ones), and **self-invocation bypasses it**. Know **propagation** (`REQUIRED` default; `REQUIRES_NEW` for audit logs that must survive a rollback). Underneath, use **`PreparedStatement`** bound params (anti-injection) with **try-with-resources**, and reuse connections from a **small** HikariCP pool.
:::
