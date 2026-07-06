---
title: Factory Method
category: Creational Patterns
categoryOrder: 2
order: 2
level: Intermediate
summary: Define an interface for creating an object, but let subclasses decide which class to instantiate — defer the `new` to a hook method.
tags: factory method, creational, design patterns, polymorphism
---

A framework class needs to create objects whose concrete type it **cannot know**: a `Dialog` must
make a `Button`, but only the platform-specific subclass knows whether that is a Windows button or
an HTML button. Hard-coding `new WindowsButton()` in the base class kills reuse. **Factory Method**
defines a method for creating an object but lets **subclasses decide which concrete class** to
instantiate. The `Creator` calls its own `createProduct()` hook instead of `new`-ing a concrete
type, so it stays decoupled from what it builds.

## Structure

```mermaid
classDiagram
    class Product {
      <<interface>>
      +use()
    }
    class ConcreteProductA {
      +use()
    }
    class ConcreteProductB {
      +use()
    }
    class Creator {
      <<abstract>>
      +factoryMethod() Product*
      +anOperation()
    }
    class ConcreteCreatorA {
      +factoryMethod() Product
    }
    class ConcreteCreatorB {
      +factoryMethod() Product
    }
    Product <|.. ConcreteProductA
    Product <|.. ConcreteProductB
    Creator <|-- ConcreteCreatorA
    Creator <|-- ConcreteCreatorB
    Creator ..> Product : creates
    ConcreteCreatorA ..> ConcreteProductA
    ConcreteCreatorB ..> ConcreteProductB
```

`Creator.anOperation()` uses the `Product` returned by `factoryMethod()` — but the **subclass**
picks the concrete `Product`. New product? Add a new `ConcreteCreator`; the base logic never changes.

## The problem it solves

Hard-coding `new` couples a class to a concrete type. Factory Method replaces the `new` with an
**overridable hook**, so extending the family needs no edits to existing code (Open/Closed).

````tabs
tabs:
  - label: Direct new (rigid)
    body: |
      The dialog is welded to one button type. Supporting a web button means editing this class.
      ```java
      class Dialog {
        void render() {
          Button b = new WindowsButton(); // hard-coded
          b.onClick();
          b.paint();
        }
      }
      ```
  - label: Factory Method (flexible)
    body: |
      The base defers creation to a hook; each subclass supplies its own product.
      ```java
      abstract class Dialog {
        abstract Button createButton();   // factory method
        void render() {
          Button b = createButton();      // no concrete type here
          b.onClick();
          b.paint();
        }
      }
      class WebDialog extends Dialog {
        Button createButton() { return new HtmlButton(); }
      }
      ```
````

## Factory Method vs. a Simple Factory

| | Simple Factory (idiom) | Factory Method (pattern) |
|--|--|--|
| Mechanism | One method with a `switch`/`if` on a type flag | Subclass **overrides** a creation method |
| Extensibility | Edit the method to add a type | Add a subclass — no edits (Open/Closed) |
| Polymorphism | None | Uses inheritance and dynamic dispatch |

:::note
A **static factory method** like `Integer.valueOf(int)` or `List.of(...)` is a related-but-different
idea (*Effective Java* Item 1) — it names a constructor, can cache, and can return a subtype, but no
subclassing is involved. Factory Method (the GoF pattern) is specifically about **subclass
overriding**.
:::

## Factory Method vs Abstract Factory

The most-confused creational pair. One sentence each:

| | Factory Method | Abstract Factory |
|--|--|--|
| Creates | **One** product | A **family** of matching products |
| Mechanism | Inheritance — subclass overrides one hook | Composition — inject a factory object with several `createX()` methods |
| Client holds | A `Creator` subclass | A factory implementation |
| Grow by | New `ConcreteCreator` subclass | New factory class implementing the whole interface |

They compose: each `createX()` inside an Abstract Factory is itself a factory method. If the
interviewer says "families of related objects that must match", switch to Abstract Factory.

## The modern shortcut: inject a `Supplier`

Since Java 8, the subclass ceremony is often unnecessary — pass the creation logic in as a
**`Supplier<T>`** (or `Function<Args, T>`) instead of overriding a method:

```java
class Dialog {
  private final Supplier<Button> buttonFactory;    // creation injected, not inherited
  Dialog(Supplier<Button> buttonFactory) { this.buttonFactory = buttonFactory; }

  void render() {
    Button b = buttonFactory.get();
    b.paint();
  }
}

Dialog web = new Dialog(HtmlButton::new);          // constructor reference as the factory
Dialog win = new Dialog(WindowsButton::new);
```

Same decoupling, zero subclasses. This is Factory Method collapsed to composition — and it is how
DI frameworks think: Spring's `ObjectProvider<T>` and Guice's `Provider<T>` are exactly injected
factories.

## When NOT to use it

- **Only one product exists and no second is on the roadmap** — a factory for a single concrete
  type is indirection with no payoff; `new` is honest and greppable.
- **The variation is data, not type** — if products differ only by field values, a parameterized
  constructor or Builder beats a subclass per variant.
- **You control all call sites** — a static factory method (`Item.of(...)`) gives you naming and
  caching without any hierarchy.

The over-engineering tell: a `FooFactory` interface, a `DefaultFooFactory`, and exactly one `Foo`.
Delete the ceremony until a real second product appears.

## Real JDK examples

- `Collection.iterator()` — the genuine Factory Method: each collection subclass **overrides** it to
  return its own `Iterator`.
- `Calendar.getInstance()` returns a `GregorianCalendar`, `BuddhistCalendar`, etc. based on locale, so
  callers never see the concrete class — but it is a **static factory method** that branches
  internally, not the GoF pattern (it is often loosely cited as one).
- `NumberFormat.getInstance()` is likewise a static factory method; `URLStreamHandlerFactory`.

:::senior
Factory Method trades a `new` for an extra class per product. Don't reach for it until you actually
have varying products; premature use adds subclass ceremony with no payoff. In modern code a
DI container or a passed-in `Supplier<Product>` often replaces the subclassing.
:::

## Check yourself

```quiz
title: Factory Method check
questions:
  - q: 'What decides which concrete `Product` gets created in the Factory Method pattern?'
    options:
      - 'A `switch` statement inside the creator'
      - text: 'The concrete `Creator` subclass that overrides the factory method'
        correct: true
      - 'The `Product` interface itself'
    explain: 'Each subclass overrides the factory method to return its own product type — that is the whole mechanism.'
  - q: 'Which JDK method is a genuine Factory Method (subclass-overridden) example?'
    options:
      - text: '`Collection.iterator()`'
        correct: true
      - '`Calendar.getInstance()`'
      - '`new ArrayList<>()`'
    explain: '`Collection.iterator()` is overridden by each collection subclass to return its own `Iterator` — subclasses decide the concrete type. `Calendar.getInstance()` is a *static* factory method that branches internally, not the GoF pattern.'
  - q: 'Why does Factory Method support the Open/Closed Principle?'
    options:
      - 'It makes classes final'
      - text: 'New products are added via new subclasses, without modifying existing creator code'
        correct: true
      - 'It removes the need for interfaces'
    explain: 'The base creator is closed for modification but open for extension — a new ConcreteCreator adds a product with no edits.'
```

:::key
Factory Method = an **overridable creation hook**. The base class calls `factoryMethod()`;
subclasses decide the concrete `Product`. Remember `Collection.iterator()`.
:::
