---
title: What Is OOP?
category: 'OOP Foundations'
categoryOrder: 1
order: 1
level: Beginner
summary: 'Why object-oriented programming exists — modelling data and behaviour together, and how it contrasts with the procedural style.'
tags: oop, paradigm, procedural, abstraction, encapsulation
---

**Object-Oriented Programming (OOP)** organises a program around **objects** — self-contained
bundles of *data* (state) and the *code* that acts on that data (behaviour) — instead of a long
list of procedures operating on loose, shared data.

## Two ways to structure the same program

The procedural style keeps **data** and the **functions** that touch it apart; anyone can reach
into the data. OOP wraps them together so each object owns and guards its own state.

```mermaid
flowchart TB
  subgraph PROC["Procedural — data and logic separated"]
    D1[(Shared data)]
    F1[withdraw]
    F2[deposit]
    F3[printBalance]
    F1 --> D1
    F2 --> D1
    F3 --> D1
  end
  subgraph OOP["OOP — data and logic bundled per object"]
    O1["Account #1<br/>balance + methods"]
    O2["Account #2<br/>balance + methods"]
  end
```

:::note
In the procedural picture every function can mutate the shared data — a bug anywhere can corrupt
it. In OOP each `Account` object protects its own `balance` behind its own methods.
:::

## Procedural vs OOP at a glance

| | Procedural | Object-Oriented |
|--|--|--|
| Unit of code | Functions / procedures | Objects (instances of classes) |
| Data & logic | Kept **separate** | **Bundled** together |
| Data access | Often global / shared | Encapsulated, guarded by methods |
| Reuse | Copy functions, pass data | Inheritance, composition, polymorphism |
| Scales via | More functions | More objects & clear boundaries |
| Typical example | C, early Basic | Java, C#, Python (classes) |

## Same task, two styles

````tabs
tabs:
  - label: Procedural
    body: |
      Data is a loose variable; a function mutates it. Nothing stops other code touching `balance`.
      ```java
      double balance = 100.0;

      static double deposit(double bal, double amt) {
        return bal + amt;            // caller must re-assign
      }
      balance = deposit(balance, 50); // 150.0
      ```
  - label: Object-Oriented
    body: |
      State lives *inside* the object; behaviour is a method that guards it.
      ```java
      class Account {
        private double balance = 100.0;      // owned & protected

        void deposit(double amt) {           // behaviour acts on own state
          if (amt > 0) balance += amt;
        }
      }
      new Account().deposit(50);             // object updates itself
      ```
````

## The paradigm rests on four pillars

Every OOP language is built from these ideas — each gets its own topic later in the track.

```mermaid
flowchart LR
  OOP((OOP)) --> A[Encapsulation<br/>hide & protect state]
  OOP --> B[Abstraction<br/>expose only what matters]
  OOP --> C[Inheritance<br/>reuse via is-a]
  OOP --> D[Polymorphism<br/>one interface, many forms]
```

:::key
OOP models a program as **collaborating objects** that own their data and expose behaviour. Its
goal is managing complexity: strong boundaries, reuse, and code that maps onto real-world concepts.
:::

## Terminology

```flashcards
title: OOP vocabulary
cards:
  - front: 'Paradigm'
    back: 'A *style* of structuring programs. OOP, procedural, and functional are paradigms.'
  - front: 'Object'
    back: 'A runtime bundle of **state** (data) and **behaviour** (methods) that owns and guards its own data.'
  - front: 'Encapsulation'
    back: 'Hiding internal state and exposing a controlled interface — the core reason OOP tames complexity.'
  - front: 'Procedural programming'
    back: 'Organising code as functions/procedures operating on separate, often shared, data.'
```

## Check yourself

```quiz
title: What is OOP?
questions:
  - q: 'The defining idea of OOP is to…'
    options:
      - text: 'bundle data together with the behaviour that operates on it'
        correct: true
      - 'avoid using functions entirely'
      - 'make every variable global for easy access'
    explain: 'OOP unites state and behaviour inside objects, unlike the procedural split of data vs functions.'
  - q: 'In the procedural style, data and the functions that use it are…'
    options:
      - text: 'kept separate, with data often shared'
        correct: true
      - 'always bundled into classes'
      - 'compiled but never executed'
    explain: 'Procedural code separates data from procedures; shared data is a common source of bugs.'
  - q: 'Which is NOT one of the four pillars of OOP?'
    options:
      - 'Encapsulation'
      - 'Polymorphism'
      - text: 'Compilation'
        correct: true
    explain: 'The four pillars are encapsulation, abstraction, inheritance, and polymorphism.'
```
