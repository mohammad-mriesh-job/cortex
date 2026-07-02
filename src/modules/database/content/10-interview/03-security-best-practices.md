---
title: Database Security Best Practices
category: Patterns & Interview Prep
categoryOrder: 10
order: 3
level: Intermediate
summary: The four security layers interviewers probe — SQL injection & parameterized queries, least privilege, encryption at rest and in transit, and auditing — with a concrete injection walkthrough.
tags: security, sql injection, parameterized queries, encryption, least privilege, auditing
---

Databases hold the crown jewels, so security questions are near-guaranteed. Answers cluster
into four layers — get the first one exactly right, because it comes up every time.

| Layer | Threat | The fix |
|---|---|---|
| **Injection** | attacker input runs as SQL | **parameterized queries** |
| **Least privilege** | one bug = total compromise | grant only what each account needs |
| **Encryption** | stolen disks / sniffed traffic | TLS in transit, TDE/column at rest |
| **Auditing** | no idea who did what | append-only log of sensitive actions |

## 1. SQL injection — the concrete attack

Injection happens whenever user input is **concatenated into SQL text**. Suppose a login
builds its query by string interpolation and the user types this into the email field:

```text
xyz' OR 1=1 --
```

The application glues that straight into the query, producing:

```sql
SELECT * FROM users
WHERE email = 'xyz' OR 1=1 --' AND pw_hash = '...';
```

Now read what the database sees: `OR 1=1` makes the `WHERE` clause **always true**, and `--`
comments out the entire password check. The query returns *every* user — the attacker is
logged in as the first one, often an admin. (The infamous `Robert'); DROP TABLE students; --`
is the same trick aimed at destroying data.)

### The fix: send code and data on separate channels

````tabs
tabs:
  - label: Vulnerable (string concat)
    body: |
      The input is parsed **as SQL**. This is the bug.

      ```python
      email = request.form["email"]     # "xyz' OR 1=1 --"
      sql = f"SELECT * FROM users WHERE email = '{email}'"
      cur.execute(sql)                  # attacker controls the query
      ```
  - label: Safe (parameterized)
    body: |
      The driver sends the SQL and the values over **separate channels**, so input can never become code. The payload is compared as a literal string and simply matches nothing.

      ```python
      cur.execute(
          "SELECT * FROM users WHERE email = %s",
          (email,),        # bound as a value, never as SQL
      )
      ```
  - label: Safe (ORM / builder)
    body: |
      A query builder or ORM parameterizes for you under the hood — the same protection, expressed in the host language.

      ```python
      user = (session.query(User)
                     .filter(User.email == email)
                     .one_or_none())
      ```
````

:::gotcha
Escaping quotes by hand or blacklisting words like `DROP` is **not** a fix — encodings,
comments, and edge cases slip through every blacklist. Validate input as *defense in depth*,
but the real barrier is always **parameterization**. And note: identifiers (table/column
names) **cannot** be parameterized — for a dynamic `ORDER BY`, validate against an
**allowlist** of known-good column names.
:::

## 2. Least privilege

The account your app connects with should be able to do its job and **nothing more**, so a
single breached credential has a small blast radius.

```sql
-- A limited app role, NOT the superuser
CREATE USER app_rw WITH PASSWORD '…';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO app_rw;
-- migrations use a separate, higher-privilege role — the app cannot run DDL
REVOKE CREATE ON SCHEMA app FROM app_rw;
```

| Principle | Bad | Good |
|---|---|---|
| Which account | `root` / superuser everywhere | dedicated per-service role |
| Grants | `GRANT ALL` | only the verbs actually used |
| Schema changes | app can `DROP`/`ALTER` | DDL restricted to a migration role |
| Reporting | writes with the write user | a read-only replica user |

## 3. Encryption: at rest vs in transit

|  | At rest | In transit |
|---|---|---|
| **Defends against** | stolen disks, leaked backups | network sniffing, MITM |
| **Mechanism** | disk/TDE, column encryption (`pgcrypto`) | **TLS/SSL** on the connection |
| **Config** | KMS-managed keys, encrypted volumes | `sslmode=verify-full`, valid certs |

Both are needed — TLS protects the wire, at-rest encryption protects the platter. Store
password *hashes* (bcrypt/argon2), never reversible ciphertext, for credentials.

## 4. Auditing

Keep an **append-only** trail so you can answer *who did what, when*:

- Log DDL, privilege/`GRANT` changes, failed logins, and access to sensitive tables.
- Capture actor, action, target, and timestamp — but **never** log passwords, tokens, or
  raw PII in plaintext.
- Ship logs off-box so an attacker who gets in cannot erase their tracks.

## Rapid recall

```flashcards
title: Security drill
cards:
  - front: 'Single best defense against SQL injection?'
    back: '**Parameterized queries / prepared statements** — data travels separately from the SQL text.'
  - front: 'Why is escaping/blacklisting not enough?'
    back: 'Blacklists always leak. Parameterization is the real fix; validation is only defense-in-depth.'
  - front: 'What can you NOT parameterize?'
    back: 'Identifiers (table/column names). Use an **allowlist** for dynamic ORDER BY / column choices.'
  - front: 'Principle of least privilege'
    back: 'Give each account only the permissions it needs — a breach then has a small blast radius.'
  - front: '`sslmode=verify-full` protects what?'
    back: 'Data **in transit** — encrypts the client↔DB connection with TLS and verifies the server cert.'
  - front: 'Encryption at rest defends against?'
    back: 'Stolen disks and leaked backups.'
  - front: 'Should the audit log store passwords?'
    back: 'Never. Log metadata (who/what/when); keep it append-only and off-box.'
```

## Check yourself

```quiz
title: Security judgement
questions:
  - q: 'A login field is concatenated into SQL and a user submits a value containing `OR 1=1 --`. What is the likely effect?'
    options:
      - text: 'The WHERE clause becomes always true and the password check is commented out — the attacker is authenticated'
        correct: true
      - 'A syntax error the database safely rejects'
      - 'Nothing — the database escapes the input automatically'
    explain: '`OR 1=1` makes the predicate always true and `--` comments out the rest of the query, bypassing authentication. This is classic SQL injection.'
  - q: 'What is the single most effective defense against SQL injection?'
    options:
      - text: 'Parameterized queries / prepared statements'
        correct: true
      - 'Manually escaping quote characters'
      - 'Hiding database error messages from users'
    explain: 'Parameterization separates code from data so input can never be parsed as SQL. Escaping is fragile; hiding errors is only cosmetic.'
  - q: 'Which database account should your web app connect with?'
    options:
      - text: 'A dedicated role granted only the privileges it needs'
        correct: true
      - 'The root/superuser account, for convenience'
      - 'A shared account also used for migrations and admin'
    explain: 'Least privilege limits the damage from a compromised credential. The app should not be able to run DDL or act as an admin.'
```

:::key
Parameterize **every** query, connect as a **least-privilege** role, encrypt **in transit
(TLS)** and **at rest**, and keep an **append-only audit trail** — and never log secrets.
:::
