---
title: Normalization
category: Data Modeling
categoryOrder: 4
order: 2
level: Intermediate
summary: Watch one messy table split into 1NF, 2NF, 3NF, and BCNF tables, step by step.
tags: normalization, 1nf, 2nf, 3nf, bcnf, functional dependency
---

**Normalization** reshapes tables so every fact lives in exactly **one** place. That kills the
*insert*, *update*, and *delete* anomalies that redundancy causes. We'll take one bloated table
and watch it split — form by form.

## The normal-form ladder

| Form | Informal rule | Removes |
|------|--------------|---------|
| **1NF** | Atomic cells, no repeating groups, a defined key | multivalued / repeating columns |
| **2NF** | 1NF **+ no partial** dependency on part of a composite key | redundancy tied to *part* of the key |
| **3NF** | 2NF **+ no transitive** dependency (non-key → non-key) | redundancy via *indirect* dependencies |
| **BCNF** | Every **determinant** is a candidate key | anomalies from overlapping candidate keys |

:::tip
The mnemonic for 1NF → 3NF: every non-key column depends on **the key, the whole key, and
nothing but the key** — *so help me Codd*.
:::

## The messy starting table

One giant `order_lines` sheet. It has a repeating item cell (not even 1NF), and once flattened,
customer and product facts repeat on every row — the seed of every anomaly.

| order_id | customer_id | customer_name | city | items *(product : qty @ price)* |
|:--------:|:-----------:|:-------------:|:----:|:--------------------------------|
| 1 | 10 | Ada | NYC | `Pen : 2 @ 2`, `Book : 1 @ 5` |
| 2 | 11 | Bo  | LA  | `Pen : 1 @ 2` |

## Watch it normalize, step by step

The boxes are the **columns** of the current table. Orange = columns being **pulled out** into a
new table; green = columns that **stay**. The code panel shows the **functional dependencies**
(what determines what) that force each split.

```walkthrough
title: One table → 1NF → 2NF → 3NF
code: |
  (ord_id, prod_id) -> qty          # full-key dependency
  prod_id           -> p_name, price # partial  -> Products (2NF)
  ord_id            -> c_id, c_name, city # partial -> Orders (2NF)
  c_id              -> c_name, city  # transitive -> Customers (3NF)
steps:
  - text: '**1NF.** Make cells atomic: one row per (order, product). The key is the *composite* pair `(ord_id, prod_id)`. But customer and product data now repeat on every line.'
    array: ['ord_id', 'prod_id', 'qty', 'p_name', 'price', 'c_id', 'c_name', 'city']
    pointers: { 0: 'PK', 1: 'PK' }
    line: 1
  - text: '**2NF.** `p_name` and `price` depend on `prod_id` **alone** — only part of the key. That is a *partial* dependency → pull them into a **Products** table keyed by `prod_id`.'
    array: ['ord_id', 'prod_id', 'qty', 'p_name', 'price', 'c_id', 'c_name', 'city']
    highlight: [3, 4]
    pointers: { 1: 'prod_id' }
    line: 2
  - text: '**2NF (cont.)** `c_id`, `c_name`, `city` depend on `ord_id` **alone** → pull them into an **Orders** table. What survives with the full key is just `qty` → the **OrderItems** table (green).'
    array: ['ord_id', 'prod_id', 'qty', 'p_name', 'price', 'c_id', 'c_name', 'city']
    highlight: [5, 6, 7]
    sorted: [0, 1, 2]
    pointers: { 0: 'ord_id' }
    line: 3
  - text: '**3NF.** Now look *inside* Orders. `c_name` and `city` depend on `c_id`, a **non-key** column — a *transitive* dependency → pull them into a **Customers** table. Orders keeps only the `c_id` foreign key.'
    array: ['ord_id', 'c_id', 'c_name', 'city']
    highlight: [2, 3]
    sorted: [0, 1]
    pointers: { 1: 'c_id' }
    line: 4
  - text: '**Done.** Four clean tables, each fact stored exactly once. Change a customer name in *one* row and every order reflects it.'
    array: ['Customers', 'Orders', 'Products', 'OrderItems']
    sorted: [0, 1, 2, 3]
    line: 4
```

## Before / after, one form at a time

### 1NF — atomic values, no repeating groups

The multivalued `items` cell becomes one row per item; we declare the composite key.

**Before (0NF):** one `items` cell holds many values → cannot filter or aggregate by product.

**After (1NF):** atomic, but redundant. `(order_id, product_id)` is the primary key.

| order_id* | product_id* | qty | product_name | price | customer_id | customer_name | city |
|:---------:|:-----------:|:---:|:------------:|:-----:|:-----------:|:-------------:|:----:|
| 1 | 100 | 2 | Pen  | 2 | 10 | Ada | NYC |
| 1 | 101 | 1 | Book | 5 | 10 | Ada | NYC |
| 2 | 100 | 1 | Pen  | 2 | 11 | Bo  | LA  |

### 2NF — no partial dependencies

`product_name`/`price` depend only on `product_id`; `customer_*`/`city` depend only on
`order_id`. Split those off so nothing depends on *part* of the composite key.

**Products**

| product_id | product_name | price |
|:----------:|:------------:|:-----:|
| 100 | Pen  | 2 |
| 101 | Book | 5 |

**Orders**

| order_id | customer_id | customer_name | city |
|:--------:|:-----------:|:-------------:|:----:|
| 1 | 10 | Ada | NYC |
| 2 | 11 | Bo  | LA  |

**OrderItems** *(only `qty` needs the full key)*

| order_id | product_id | qty |
|:--------:|:----------:|:---:|
| 1 | 100 | 2 |
| 1 | 101 | 1 |
| 2 | 100 | 1 |

### 3NF — no transitive dependencies

In **Orders**, `customer_name` and `city` depend on `customer_id` (a non-key column), not
directly on `order_id`. That is transitive — split customers out.

**Customers**

| customer_id | customer_name | city |
|:-----------:|:-------------:|:----:|
| 10 | Ada | NYC |
| 11 | Bo  | LA  |

**Orders** *(now just a foreign key)*

| order_id | customer_id |
|:--------:|:-----------:|
| 1 | 10 |
| 2 | 11 |

### BCNF — every determinant is a candidate key

3NF still allows a subtle anomaly when candidate keys **overlap**. Classic example: a student
takes a `subject` from a `teacher`; each teacher teaches exactly one subject.

- FDs: `(student, subject) → teacher` **and** `teacher → subject`.
- Candidate keys: `(student, subject)` and `(student, teacher)` — they overlap on `student`.
- `teacher → subject` has a determinant (`teacher`) that is **not** a candidate key → violates BCNF (though it *is* 3NF, because `subject` is a prime attribute).

**Before (3NF, not BCNF)** — updating a teacher's subject means touching many rows:

| student | subject | teacher |
|:-------:|:-------:|:-------:|
| Ada | Math    | Euler  |
| Bo  | Math    | Euler  |
| Ada | Physics | Newton |

**After (BCNF)** — split so each determinant is a key:

| teacher | subject |
|:-------:|:-------:|
| Euler   | Math    |
| Newton  | Physics |

| student | teacher |
|:-------:|:-------:|
| Ada | Euler  |
| Bo  | Euler  |
| Ada | Newton |

:::gotcha
Normalization is not always the finish line. BCNF decomposition can be **non-dependency-preserving**
(you may lose the ability to check an FD without a join), and every extra table means another join
on reads. **3NF is the usual sweet spot** for OLTP schemas.
:::

## Check yourself

```quiz
title: Normal-form diagnosis
questions:
  - q: 'A 1NF table has a non-key column that depends on only **part** of its composite primary key. Which rule does it break?'
    options:
      - '1NF'
      - text: '2NF'
        correct: true
      - 'BCNF'
    explain: '2NF forbids partial dependencies — a non-key attribute must depend on the *whole* composite key, not just part of it.'
  - q: '`city` depends on `customer_id`, which depends on the key `order_id`. This indirect dependency violates...'
    options:
      - '2NF'
      - text: '3NF'
        correct: true
      - '1NF'
    explain: '3NF removes transitive dependencies: a non-key attribute (city) must not depend on another non-key attribute (customer_id).'
  - q: 'When is a 3NF table **not** in BCNF?'
    options:
      - 'Whenever it has a composite key'
      - text: 'When some functional dependency has a determinant that is not a candidate key'
        correct: true
      - 'Never — 3NF always implies BCNF'
    explain: 'BCNF is stricter: every determinant must be a candidate key. This can fail even in 3NF when candidate keys overlap, e.g. teacher -> subject.'
  - q: 'The primary goal of normalization is to...'
    options:
      - text: 'Store each fact once, preventing insert/update/delete anomalies'
        correct: true
      - 'Make every query faster'
      - 'Reduce the number of tables'
    explain: 'Normalization eliminates redundancy and the anomalies it causes. It usually *adds* tables and can make reads slower (more joins) — the opposite of goals 2 and 3.'
```

:::key
**1NF** atomic + a key. **2NF** no partial dependency (matters only with composite keys).
**3NF** no transitive dependency. **BCNF** every determinant is a candidate key.
Each step splits a table so no fact is ever stored twice.
:::
