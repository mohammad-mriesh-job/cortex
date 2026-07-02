---
title: 'Principles Beyond SOLID'
category: 'OOP Design & Modeling'
categoryOrder: 7
order: 2
level: Advanced
summary: 'DRY, KISS, YAGNI, GRASP, separation of concerns, and "program to an interface" — the everyday heuristics that guide design decisions between the big SOLID rules.'
tags: 'dry, kiss, yagni, grasp, separation of concerns, program to an interface, principles'
---

SOLID gets the spotlight, but day-to-day design is steered by a wider set of short, memorable
heuristics. Each one names a *specific failure mode* it prevents. Learn the failure, not just the
acronym.

## Recall the principles

```flashcards
title: Design principle recall
cards:
  - front: '**DRY** stands for… and prevents what?'
    back: '**Don''t Repeat Yourself.** Every piece of knowledge has *one* authoritative source. Prevents **shotgun surgery** — one change forcing edits in many copies.'
  - front: '**KISS** stands for… and prevents what?'
    back: '**Keep It Simple, Stupid.** Favor the simplest thing that works. Prevents **needless complexity** that is hard to read and debug.'
  - front: '**YAGNI** stands for… and prevents what?'
    back: '**You Aren''t Gonna Need It.** Don''t build for imagined future needs. Prevents **speculative generality** — dead flexibility no one uses.'
  - front: '**GRASP** stands for…'
    back: '**General Responsibility Assignment Software Patterns** — a set of principles (Information Expert, Creator, Controller, Low Coupling, High Cohesion…) for *deciding which class owns which responsibility*.'
  - front: '**Separation of Concerns** means…'
    back: 'Each module addresses **one concern** (UI, business rules, persistence). Prevents tangled code where a change to one concern breaks another.'
  - front: '"**Program to an interface, not an implementation**" means…'
    back: 'Depend on the abstraction (`List`), not the concrete type (`ArrayList`). Lets you swap implementations without touching callers.'
```

## What each principle prevents

| Principle | One-line rule | Failure mode it prevents |
|--|--|--|
| **DRY** | Single source of truth for each fact | Shotgun surgery; divergent copies |
| **KISS** | Simplest thing that could work | Over-engineering; unreadable cleverness |
| **YAGNI** | Build it when you *actually* need it | Speculative generality; dead code paths |
| **Separation of Concerns** | One module, one concern | Tangled layers; ripple-effect changes |
| **Program to an interface** | Depend on abstractions | Rigid code welded to a concrete type |
| **GRASP: Low Coupling** | Minimize inter-class dependencies | Fragile webs; hard-to-reuse classes |
| **GRASP: High Cohesion** | Related things live together | Scattered, unfocused classes |

:::warning
DRY and YAGNI can pull against each other. Extracting a shared abstraction from **two** similar
lines is often premature (YAGNI) — the "rule of three" says wait for the *third* repetition before
you're sure the duplication is real and not coincidental. Not all similar-looking code is the same
*knowledge*.
:::

## Program to an interface — in code

````tabs
tabs:
  - label: Welded to implementation
    body: |
      The field and parameter name a **concrete** class. Swapping storage means editing this class.
      ```java
      class Cart {
        private ArrayList<Item> items;         // concrete

        Cart(ArrayList<Item> items) {          // callers forced to pass ArrayList
          this.items = items;
        }
      }
      ```
  - label: Program to an interface
    body: |
      Depend on the **abstraction**. Any `List` works — `ArrayList`, `LinkedList`, an immutable list.
      ```java
      class Cart {
        private final List<Item> items;        // abstraction

        Cart(List<Item> items) {               // caller chooses the impl
          this.items = items;
        }
      }
      ```
````

The second version obeys **program to an interface** *and* **low coupling** (Cart no longer knows
which list you use) — one code change, two principles satisfied. That overlap is normal: the
principles reinforce each other.

:::senior
GRASP is often overlooked next to SOLID, but it's more fundamental — it answers the question that
comes *first*: "which class should even have this method?" **Low Coupling** and **High Cohesion**
are the twin master gauges. Most other principles (SRP, program-to-an-interface, separation of
concerns) are specific tactics for improving one or both of those two numbers.
:::

## Check yourself

```quiz
title: Principles check
questions:
  - q: 'You add a configurable plugin system "in case we support plugins later." No plugin exists yet. Which principle are you violating?'
    options:
      - 'DRY'
      - text: 'YAGNI — building for a need that does not yet exist'
        correct: true
      - 'High Cohesion'
    explain: 'Speculative generality. Build the flexibility when a real requirement demands it, not on a hunch.'
  - q: 'A change to the tax rate forces edits in five different files that each hard-code it. Which principle would have prevented this?'
    options:
      - text: 'DRY — one authoritative source for the tax rate'
        correct: true
      - 'KISS'
      - 'Program to an interface'
    explain: 'The tax rate is one piece of knowledge; it should live in exactly one place. Duplication caused shotgun surgery.'
  - q: '`void save(ArrayList<User> users)` vs `void save(List<User> users)`. The second is preferred because it…'
    options:
      - 'runs faster'
      - text: 'programs to an interface, so callers can pass any `List` and coupling drops'
        correct: true
      - 'uses less memory'
    explain: 'Depending on the `List` abstraction decouples the method from a specific implementation — swap freely without changing the signature.'
  - q: 'Which GRASP pair are the "master gauges" most other principles serve?'
    options:
      - 'Creator and Controller'
      - text: 'Low Coupling and High Cohesion'
        correct: true
      - 'Information Expert and Polymorphism'
    explain: 'Nearly every design tactic ultimately aims to lower coupling and/or raise cohesion.'
```

:::key
**DRY** (one source of truth), **KISS** (simplest that works), **YAGNI** (don't build ahead of
need), **Separation of Concerns** (one module, one job), **program to an interface** (depend on
abstractions), and **GRASP** (responsibility assignment, anchored by **Low Coupling / High
Cohesion**). They overlap by design and occasionally tension — balance DRY against YAGNI with the
rule of three.
:::
