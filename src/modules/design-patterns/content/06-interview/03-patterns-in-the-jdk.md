---
title: Patterns in the JDK & Spring
category: Interview Prep
categoryOrder: 6
order: 3
level: Advanced
summary: Real GoF patterns hiding in the Java standard library and Spring — the concrete examples that prove you have used patterns, not just memorized them.
tags: jdk, spring, real examples, gof, java io, comparator, interview
---

The strongest interview answer names a pattern **and** points to where it lives in code you already use. This page is your evidence locker: every GoF pattern mapped to a class in the JDK or Spring.

## The master table

| Pattern | JDK / Spring example | How it shows up |
|--|--|--|
| **Iterator** | `java.util.Iterator`, `Enumeration` | `hasNext()` / `next()` traverse without exposing internals |
| **Decorator** | `java.io` streams | `new BufferedReader(new FileReader(f))` — wrap to add behavior |
| **Factory Method** | `valueOf`, `getInstance` | `Integer.valueOf()`, `Calendar.getInstance()` |
| **Abstract Factory** | `DocumentBuilderFactory`, `DataSource` | Produce whole families of parser / connection objects |
| **Singleton** | `Runtime.getRuntime()`, `Desktop.getDesktop()` | One instance, global accessor |
| **Builder** | `StringBuilder`, `Stream.Builder`, `HttpClient.newBuilder()` | Fluent step-by-step construction |
| **Observer** | Listeners, `PropertyChangeListener`, `Flow` API | `addXxxListener` → callback on change |
| **Proxy** | Spring AOP, Hibernate lazy entities, `Proxy.newProxyInstance` | Wrap the real object to control access |
| **Template Method** | `AbstractList`, `AbstractMap`, `HttpServlet` | Base defines skeleton; subclass fills the hooks |
| **Strategy** | `Comparator`, `RejectedExecutionHandler` | Pass an algorithm object into a context |
| **Adapter** | `Arrays.asList()`, `InputStreamReader`, `Collections.list()` | Make one interface look like another |
| **Flyweight** | `Integer.valueOf()` cache, `String` pool | Share cached immutable instances |
| **Command** | `Runnable`, `Callable`, `Action` | Encapsulate a request as an object to run/queue |
| **Composite** | Swing `Component`/`Container`, JSF tree | Treat leaf and container uniformly |
| **Prototype** | `Object.clone()`, `Cloneable` | Copy an existing instance |
| **Chain of Responsibility** | Servlet `Filter` chain, Spring Security filters | Pass request along handlers until one handles it |
| **Mediator** | `java.util.Timer`, `ExecutorService` | Central object coordinates workers |
| **Memento** | `java.util.Date` via serialization, undo buffers | Capture/restore state |
| **Facade** | `javax.faces.context.FacesContext`, JDBC | One simple entry point over a subsystem |

:::note
`valueOf`/`of` are **static factory methods** (*Effective Java*, Item 1) — interviews often loosely equate them with Factory Method, but the GoF **Factory Method** proper needs a subclass to decide the concrete type, as in `Calendar.getInstance()` returning locale-specific subclasses.
:::

## Look closer — the classics interviewers ask about

````tabs
tabs:
  - label: Decorator (java.io)
    body: |
      Every stream wraps another to add one capability. The canonical live Decorator.
      ```java
      InputStream in =
        new BufferedInputStream(       // + buffering
          new GZIPInputStream(          // + decompression
            new FileInputStream(f)));   // base source
      ```
      All share `InputStream`, so you can nest in any order.
  - label: Strategy (Comparator)
    body: |
      `Comparator` **is** a pluggable algorithm passed into `sort` — the context.
      ```java
      list.sort(Comparator.comparing(User::name));
      list.sort(Comparator.comparingInt(User::age).reversed());
      ```
      The client chooses the ordering algorithm at the call site.
  - label: Factory Method (valueOf)
    body: |
      Static factory methods hide `new`, enable caching, and can return subtypes.
      ```java
      Integer i = Integer.valueOf(42);   // may return cached instance
      Boolean b = Boolean.valueOf(true);
      List<Integer> l = List.of(1, 2, 3);
      ```
  - label: Proxy (Spring / Hibernate)
    body: |
      Spring wraps your bean in a dynamic proxy to weave in transactions, security, caching.
      ```java
      @Transactional
      public void transfer() { ... }   // proxy opens/commits the tx around this
      ```
      Hibernate returns lazy proxies that hit the DB only when you touch a field.
  - label: Flyweight (Integer cache)
    body: |
      `valueOf` caches boxed integers in [-128, 127], so identical small values are shared.
      ```java
      Integer.valueOf(100) == Integer.valueOf(100); // true  (cached, shared)
      Integer.valueOf(200) == Integer.valueOf(200); // false (new objects)
      ```
      This is why `==` on boxed Integers is a classic bug.
  - label: Template Method (AbstractList)
    body: |
      `AbstractList` implements the skeleton (`iterator()`, `indexOf`, `equals`) in terms of
      two abstract hooks you supply.
      ```java
      class Ints extends AbstractList<Integer> {
        public Integer get(int i) { ... }   // hook
        public int size() { ... }           // hook
      }
      ```
````

:::senior
The `Integer.valueOf` example is a two-for-one in interviews: it is both a **Factory Method** (hides `new`) and a **Flyweight** (shares cached instances). Mention both and explain the `==` pitfall for extra credit.
:::

:::note
**Spring is a pattern showcase:** the container is a giant **Abstract Factory** producing beans; `@Transactional`/`@Async` use **Proxy**; `JdbcTemplate`/`RestTemplate` are **Template Method**; `BeanPostProcessor` is an **Observer**-like hook; the servlet `Filter` chain is **Chain of Responsibility**.
:::

## Drill the mappings

```flashcards
title: Pattern → JDK example
cards:
  - front: 'Where is **Decorator** in the JDK?'
    back: '`java.io` streams — `new BufferedReader(new FileReader(f))`.'
  - front: 'Where is **Strategy** in the JDK?'
    back: '`Comparator` passed to `sort` / `Collections.sort`.'
  - front: 'Where is **Singleton** in the JDK?'
    back: '`Runtime.getRuntime()`, `Desktop.getDesktop()`.'
  - front: 'Where is **Builder** in the JDK?'
    back: '`StringBuilder`, `Stream.Builder`, `HttpClient.newBuilder()`.'
  - front: 'Where is **Adapter** in the JDK?'
    back: '`Arrays.asList()`, `InputStreamReader` (bytes → chars).'
  - front: 'Where is **Flyweight** in the JDK?'
    back: '`Integer.valueOf()` cache and the `String` pool.'
  - front: 'Where is **Iterator** in the JDK?'
    back: '`java.util.Iterator` — powers the enhanced `for` loop.'
  - front: 'Where is **Proxy** in Spring?'
    back: 'AOP proxies for `@Transactional`; Hibernate lazy-loading proxies.'
  - front: 'Where is **Template Method** in the JDK?'
    back: '`AbstractList` / `AbstractMap`; `HttpServlet.service()`.'
  - front: 'Where is **Chain of Responsibility** in Java EE / Spring?'
    back: 'The servlet `Filter` chain; Spring Security filter chain.'
  - front: 'Where is **Command** in the JDK?'
    back: '`Runnable` / `Callable` submitted to an `ExecutorService`.'
  - front: 'Where is **Factory Method** in the JDK?'
    back: '`Integer.valueOf()`, `Calendar.getInstance()`, `List.of()`.'
```

## Check yourself

```quiz
title: Patterns in real Java
questions:
  - q: 'Which pattern does the `java.io` chain `new BufferedReader(new FileReader(f))` demonstrate?'
    options:
      - text: 'Decorator'
        correct: true
      - 'Adapter'
      - 'Proxy'
      - 'Facade'
    explain: 'Each stream wraps another sharing the same interface to add behavior (buffering, decoding) — textbook Decorator.'
  - q: '`Integer.valueOf(100) == Integer.valueOf(100)` is `true` but `Integer.valueOf(200) == Integer.valueOf(200)` is `false`. Which pattern explains this?'
    options:
      - 'Singleton'
      - text: 'Flyweight (the Integer cache for -128..127)'
        correct: true
      - 'Prototype'
      - 'Builder'
    explain: 'valueOf caches boxed integers in [-128,127] and shares them (Flyweight). Outside that range it creates new objects, so == differs.'
  - q: 'Passing a `Comparator` to `list.sort(...)` is an example of which pattern?'
    options:
      - 'Template Method'
      - text: 'Strategy'
        correct: true
      - 'Observer'
      - 'Command'
    explain: 'The Comparator is an interchangeable algorithm supplied to the sorting context — Strategy.'
  - q: 'How does Spring apply `@Transactional` behavior around your method?'
    options:
      - 'It rewrites your bytecode at compile time only'
      - text: 'It wraps the bean in a Proxy that opens/commits the transaction around the call'
        correct: true
      - 'It uses a Singleton transaction manager exclusively'
      - 'It uses the Observer pattern'
    explain: 'Spring AOP creates a dynamic Proxy around the bean; the proxy adds cross-cutting behavior (transactions, security) before/after delegating.'
  - q: '`AbstractList` implements `iterator()` and `indexOf()` in terms of your `get()` and `size()`. Which pattern?'
    options:
      - text: 'Template Method'
        correct: true
      - 'Strategy'
      - 'Adapter'
      - 'Factory Method'
    explain: 'The base class fixes the algorithm skeleton and defers specific steps (get/size) to subclasses — Template Method.'
```

:::key
Name the pattern **and** the class. Decorator → `java.io`. Strategy → `Comparator`. Factory Method → `valueOf`/`getInstance`. Singleton → `Runtime`. Flyweight → `Integer` cache (+ the `==` trap). Proxy → Spring AOP & Hibernate lazy loading. Template Method → `AbstractList`. Chain of Responsibility → servlet filters.
:::
