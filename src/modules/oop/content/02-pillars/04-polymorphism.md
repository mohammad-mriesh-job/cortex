---
title: Polymorphism
category: The Four Pillars
categoryOrder: 2
order: 4
level: Intermediate
summary: One interface, many forms — overriding vs overloading and how dynamic dispatch picks the right method at runtime.
tags: polymorphism, overriding, overloading, dynamic dispatch, oop
---

**Polymorphism** means "many forms": the *same* call can behave differently depending on the
actual object. It's the pillar that makes code extensible — and a guaranteed interview question.

## One interface, many forms

Every subclass supplies its own version of `speak()`, but callers just say `animal.speak()`.

```mermaid
classDiagram
    class Client {
      +describe(Animal a) void
    }
    class Animal {
      <<abstract>>
      +speak()* String
    }
    class Dog {
      +speak() String
    }
    class Cat {
      +speak() String
    }
    Client --> Animal : depends only on
    Animal <|-- Dog
    Animal <|-- Cat
    note for Client "a.speak() compiles against Animal, dispatches to Dog or Cat at runtime"
```

## Two kinds of polymorphism

| | Overloading | Overriding |
|--|--|--|
| A.k.a. | compile-time · static · early binding | runtime · dynamic · late binding |
| Lives in | the **same** class | a **subclass** |
| Signature | **different** parameters | **identical** |
| Resolved | at **compile time** (declared types) | at **runtime** (object's real type) |

:::note
Purists — and some interviewers — reserve "polymorphism" for **subtype** polymorphism
(overriding). Overloading is *ad-hoc* polymorphism, and generics are *parametric* polymorphism.
If asked "is overloading really polymorphism?", naming that taxonomy **is** the expected answer.
:::

## Overriding vs overloading

````tabs
tabs:
  - label: Overriding (runtime)
    body: |
      Same signature, **redefined in a subclass**. Chosen at runtime by the object's real type.
      ```java
      class Animal { String speak() { return "..."; } }
      class Dog extends Animal {
        @Override String speak() { return "Woof!"; }  // overrides
      }
      ```
  - label: Overloading (compile-time)
    body: |
      Same name, **different parameters**, same class. Chosen by the compiler from argument types.
      ```java
      int    add(int a, int b)       { return a + b; }
      double add(double a, double b) { return a + b; }  // overloads
      ```
````

## Watch dynamic dispatch

```walkthrough
title: Which speak() actually runs?
code: |
  Animal a = new Dog();   // reference type Animal, object type Dog
  a.speak();              // prints "Woof!"
steps:
  - text: 'The **reference type** is `Animal`. The compiler only checks that `Animal` *has* a `speak()` — it does, so it compiles.'
    line: 1
  - text: 'At runtime the real **object** is a `Dog`, not an `Animal`.'
    line: 1
  - text: 'The runtime looks up `speak()` in the **Dog** method table, not Animal — this is **late binding**.'
    line: 2
  - text: '`Dog.speak()` runs → prints **"Woof!"**. Same call site, different behavior per object.'
    line: 2
```

:::gotcha
Only **instance methods** are polymorphic. `static` methods are bound at compile time (that's *hiding*, not overriding), and `private` methods aren't inherited at all, and **fields are resolved by the reference type** — `((Animal) dog).name` reads `Animal`'s field, not `Dog`'s.
:::

:::senior
Under the hood each class has a **vtable** (virtual method table); an object header points to its class's vtable, so a virtual call is just an indexed jump. That's why dispatch is cheap — and why a `final` (non-virtual) method can be inlined by the JIT.
:::

## The rules of a legal override

The compiler enforces substitutability on every override:

- **Same signature** (name + parameter types). The return type may be **covariant** — an override
  may return a *subtype* (`Dog clone()` overriding `Animal clone()`, allowed since Java 5).
- Visibility may **widen** (`protected` → `public`) but never narrow — code holding the parent
  type must not lose access at runtime.
- Checked exceptions may be **removed or narrowed**, never broadened — callers compiled against
  the parent's `throws` clause must stay correct.

Always write `@Override`: it turns a silent overload-by-typo — `equals(MyType o)` instead of
`equals(Object o)` — into a compile error. That specific typo creates an overload that hash-based
collections never call, and it is a beloved interview trap.

## Where the JDK bets everything on it

`Collections.sort(list)` was written years before your class existed, yet it sorts your `Invoice`
objects — by dispatching to *your* `compareTo`. The same inversion powers `toString()` in every
logger, `equals()`/`hashCode()` inside every `HashMap`, and Spring AOP, which subclasses or
proxies your bean and overrides its methods to wrap them in transactions. Polymorphism is the
mechanism that lets **old code call new code** — every framework callback relies on it.

## The overloading trap interviewers love

Overload resolution runs at compile time on declared types, and Java prefers an exact primitive
match over autoboxing:

```java
List<Integer> list = new ArrayList<>(List.of(10, 20, 30));
list.remove(1);                    // remove(int index)  → removes 20, the element AT index 1
list.remove(Integer.valueOf(20));  // remove(Object)     → removes the VALUE 20
```

`remove(1)` binds to `remove(int)` — index, not value — because no boxing is needed. Knowing
*why* (resolution order: exact match → widening → boxing → varargs) is what separates a memorised
answer from an understood one.

## In code review: the instanceof ladder

The anti-polymorphism smell is a type switch:

```java
if (shape instanceof Circle c)      area = Math.PI * c.radius() * c.radius();
else if (shape instanceof Square s) area = s.side() * s.side();   // new shape = edit every ladder
```

Every new `Shape` forces an edit to every such ladder — and a missed one compiles fine and fails
at runtime. The polymorphic fix moves behaviour into the types: `shape.area()`. That refactor,
**replace conditional with polymorphism**, is among the most common OOP code-review comments. The
modern exception: a `sealed` hierarchy with a pattern-matching `switch` is a legitimate
alternative when the set of *operations* grows faster than the set of *types* — the compiler then
checks exhaustiveness for you.

## Check yourself

```quiz
title: Polymorphism check
questions:
  - q: 'With `Dog` overriding `speak()`: `Animal a = new Dog(); a.speak();` runs which version?'
    options:
      - text: '`Dog.speak()` — chosen at runtime by the object type'
        correct: true
      - '`Animal.speak()` — chosen by the reference type'
      - 'a compile error'
    explain: 'Dynamic dispatch picks the override from the **actual object** (`Dog`), not the reference type (`Animal`).'
  - q: 'Which is resolved at **compile time**?'
    options:
      - 'Overriding'
      - text: 'Overloading'
        correct: true
    explain: 'Overloading is chosen by the compiler from argument types (static binding). Overriding is resolved at runtime (dynamic binding).'
  - q: 'Can a subclass truly *override* a `static` method?'
    options:
      - 'Yes, identical to instance methods'
      - text: 'No — a static method is *hidden*, bound by the reference type'
        correct: true
    explain: 'Static methods belong to the class, not the instance. Redefining one **hides** it; the called version depends on the reference type at compile time — no polymorphism.'
```

:::key
Polymorphism = one interface, many implementations. **Overloading** (same name, different params) is compile-time; **overriding** (same signature, subclass) is runtime via dynamic dispatch. `static`/`private` methods and **fields** are not polymorphic.
:::
