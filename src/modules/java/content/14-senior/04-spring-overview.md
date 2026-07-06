---
title: "The Spring Ecosystem (Overview)"
category: Senior-Level & System Design
categoryOrder: 14
order: 4
level: Advanced
summary: A conceptual map of what Spring solves — IoC/DI, beans and the application context, Spring Boot's value, MVC vs WebFlux, and Spring Data/JPA.
tags: spring, dependency-injection, spring-boot, webflux, jpa
---

Spring is the default backbone of enterprise Java, and interviews increasingly assume you can reason about it. This is a conceptual map — *what problems each piece solves* — not a step-by-step tutorial. The recurring theme: Spring exists to turn application **plumbing into configuration** so you spend your effort on business logic.

## The problem Spring solves

A real application is mostly plumbing: wiring objects together, managing their lifecycles, opening transactions, mapping HTTP to methods, talking to databases, exposing metrics. Spring's bet is that this plumbing is the same everywhere, so it should be **declared, not hand-coded**. You mostly *configure and annotate* rather than write the wiring yourself.

## Inversion of Control and Dependency Injection

**IoC** flips who's in charge: instead of an object constructing its own collaborators (`new PaymentGateway()`), the **container** creates them and hands ("injects") them in. The class declares *what* it needs; Spring decides *how* to supply it.

```java
@Service
public class OrderService {
    private final PaymentGateway gateway;          // a dependency

    public OrderService(PaymentGateway gateway) {  // constructor injection
        this.gateway = gateway;
    }
}
```

Why it matters: classes become **decoupled** from concrete implementations and **trivially testable** — in a unit test you just pass a mock into the constructor, no container required.

:::senior
Prefer **constructor injection** over field injection (`@Autowired` on a field). Constructor injection allows `final` fields, makes dependencies explicit, fails fast when one is missing, and lets you unit-test the class **without** Spring or reflection. Field injection hides dependencies and quietly enables god-classes with twelve collaborators — a constructor that's getting unwieldy is honest feedback that the class does too much. This is a real signal of code maturity in review.
:::

## Beans and the application context

A **bean** is any object the Spring container manages. The **`ApplicationContext`** is the registry that creates beans, wires their dependencies, and governs their lifecycle. By default beans are **singletons** (one shared instance per context), though other scopes exist (`prototype`, `request`, `session`).

```mermaid
flowchart LR
    A["@Configuration + component scan"] --> B[ApplicationContext]
    B --> C["instantiate &amp; wire beans"]
    C --> D["singleton registry"]
    D --> E["inject where needed"]
```

## Spring Boot's value

Spring itself is powerful but historically demanded heavy XML/Java configuration. **Spring Boot** is the opinionated layer that made it pleasant:

- **Auto-configuration** — inspects the classpath and configures sensible defaults (find an H2 jar, get an in-memory `DataSource`).
- **Starters** — curated dependency bundles (`spring-boot-starter-web`) that end version-juggling.
- **Embedded server** — your app *is* the runnable jar; no external Tomcat to deploy onto.
- **Actuator** — production-grade health checks, metrics, and info endpoints for free.

The mental model: Boot is **convention over configuration**. You override defaults only where your needs genuinely diverge.

## Web: MVC vs WebFlux

Spring offers two web stacks with nearly the same annotations but opposite runtime models:

| | Spring MVC | Spring WebFlux |
|---|-----------|----------------|
| Model | blocking, thread-per-request | non-blocking, reactive |
| Runtime | Servlet (Tomcat) | Netty / event loop |
| Returns | `User`, `List<User>` | `Mono<User>`, `Flux<User>` |
| Best for | most apps; teams valuing simplicity | massive concurrency, streaming |

For the vast majority of services, **MVC is the right default** — and with virtual threads it now scales to high concurrency without the cognitive cost of reactive types.

## Data access: Spring Data and JPA

Spring layers conveniences over JDBC. **`JdbcTemplate`** removes connection and exception boilerplate. **Spring Data JPA** goes further: you declare a repository *interface* and Spring generates the implementation, even deriving queries from method names.

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);   // query derived from the method name
}
```

Under the hood, JPA/Hibernate is an **ORM** mapping objects to rows.

:::gotcha
ORMs hide SQL, which is exactly the danger. The infamous **N+1 problem**: loading 100 orders then lazily fetching each one's customer fires 101 queries. And `@Transactional` works only through Spring's **proxy**, so a method calling another `@Transactional` method *on the same object* (`this.foo()`) silently skips the new transaction. For complex, performance-critical queries, drop to `JdbcTemplate` or jOOQ rather than torturing JPA.
:::

## Check yourself

```quiz
title: The Spring ecosystem
questions:
  - q: 'Why prefer constructor injection over field injection (`@Autowired` on a field)?'
    options:
      - text: 'It allows `final` fields, makes dependencies explicit, fails fast if one is missing, and unit-tests without Spring'
        correct: true
      - 'It is the only kind Spring supports'
      - 'It makes the bean prototype-scoped'
    explain: 'A constructor states exactly what the class needs and lets you pass mocks directly in a test — no container or reflection. Field injection hides dependencies and quietly enables god-classes with a dozen collaborators.'
  - q: 'By default, what scope does a Spring bean have?'
    options:
      - text: 'Singleton — one shared instance per application context'
        correct: true
      - 'Prototype — a new instance per injection'
      - 'Request — one per HTTP request'
    explain: 'Beans are singletons by default (one per context). Other scopes (`prototype`, `request`, `session`) exist but you opt into them. The `ApplicationContext` creates, wires, and manages these beans.'
  - q: 'What is Spring Boot''s core value over plain Spring?'
    options:
      - text: 'Convention over configuration — auto-configuration, starter dependencies, and an embedded server'
        correct: true
      - 'It replaces the JVM with a faster runtime'
      - 'It removes the need for a database'
    explain: 'Boot inspects the classpath and wires sensible defaults (auto-configuration), bundles curated dependencies (starters), and packages an embedded server so the app is a runnable jar — you override defaults only where your needs diverge.'
```

:::key
Spring turns application **plumbing into configuration**. **IoC/DI** (favor constructor injection) decouples and tests your code; the **`ApplicationContext`** manages **beans** (singletons by default); **Spring Boot** adds auto-configuration, starters, and an embedded server under *convention over configuration*. Choose **MVC** for most services and **WebFlux** for extreme concurrency, and use **Spring Data/JPA** for CRUD while staying alert to N+1 and proxy-based `@Transactional` gotchas.
:::
