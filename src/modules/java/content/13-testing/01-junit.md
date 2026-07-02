---
title: JUnit 5
category: Testing & Build Tools
categoryOrder: 13
order: 1
level: Intermediate
summary: The standard Java test framework — @Test, lifecycle hooks, assertions, assertThrows, parameterized and nested tests, and readable @DisplayName naming.
tags: junit, testing, assertions, parameterized-tests, lifecycle
---

**JUnit 5** (a.k.a. **Jupiter**) is the de facto testing framework for the JVM. It's actually three pieces: the **JUnit Platform** (the engine launchers and IDEs run against), **Jupiter** (the modern annotations and assertions you write), and **Vintage** (a bridge that runs old JUnit 3/4 tests). When people say "JUnit 5" they almost always mean the Jupiter API.

## Anatomy of a test

A test is a method annotated `@Test`. The classic shape is **Arrange-Act-Assert**: set up state, exercise the code, then verify the outcome.

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class CalculatorTest {

    @Test
    void addsTwoNumbers() {
        Calculator calc = new Calculator();   // Arrange
        int sum = calc.add(2, 3);             // Act
        assertEquals(5, sum);                 // Assert: expected first, then actual
    }
}
```

:::gotcha
Unlike JUnit 4, test classes and methods **do not need to be `public`** — package-private is idiomatic. Also note `assertEquals(expected, actual)`: getting the order backwards still passes/fails correctly but produces a misleading *"expected X but was Y"* message.
:::

## Lifecycle hooks

Four annotations run setup/teardown code so individual tests stay focused. JUnit creates a **fresh test-class instance for every `@Test`** by default, which keeps tests isolated.

| Annotation | Runs | Static? | Typical use |
|------------|------|---------|-------------|
| `@BeforeAll` | once, before any test | **yes** | open a DB/container, load config |
| `@BeforeEach` | before *every* test | no | build a fresh object under test |
| `@AfterEach` | after *every* test | no | reset/close per-test resources |
| `@AfterAll` | once, after all tests | **yes** | shut down shared resources |

```java
@BeforeEach
void setUp() {
    repo = new InMemoryUserRepo();   // each test gets a clean repo
}
```

```mermaid
flowchart LR
    A["@BeforeAll (once)"] --> B["@BeforeEach"]
    B --> C["@Test"]
    C --> D["@AfterEach"]
    D -->|next test| B
    D --> E["@AfterAll (once)"]
```

## Assertions

`org.junit.jupiter.api.Assertions` gives the core checks. Group related assertions with `assertAll` so **all** of them are reported, not just the first failure.

```java
assertEquals(42, result);
assertTrue(list.isEmpty());
assertNull(user.getMiddleName());
assertSame(cached, repo.find(1));        // reference identity

assertAll("user",
    () -> assertEquals("Ada", user.name()),
    () -> assertEquals(36, user.age()));
```

`assertThrows` verifies failure paths and **returns the caught exception** so you can assert on its message:

```java
var ex = assertThrows(IllegalArgumentException.class,
                      () -> calc.divide(1, 0));
assertEquals("divisor must be non-zero", ex.getMessage());
```

## Parameterized tests

`@ParameterizedTest` runs the same logic over many inputs — far better than copy-pasting near-identical tests. It needs the `junit-jupiter-params` dependency and a source of arguments.

```java
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;

@ParameterizedTest
@ValueSource(strings = {"racecar", "noon", "level"})
void detectsPalindromes(String word) {
    assertTrue(Palindromes.isPalindrome(word));
}

@ParameterizedTest
@CsvSource({"2, 3, 5", "0, 0, 0", "-1, 1, 0"})
void addsPairs(int a, int b, int expected) {
    assertEquals(expected, calc.add(a, b));
}
```

`@MethodSource` supplies complex objects from a `static Stream<Arguments>`; `@EnumSource` runs once per enum constant; `@NullAndEmptySource` covers the awkward edge cases for free.

## Readable structure: @DisplayName and @Nested

`@DisplayName` replaces cryptic method names with a sentence in the test report. `@Nested` groups related scenarios into an inner class so the output reads like a spec.

```java
@DisplayName("BankAccount")
class BankAccountTest {

    @Nested
    @DisplayName("when newly opened")
    class WhenNew {
        @Test
        @DisplayName("has a zero balance")
        void zeroBalance() { assertEquals(0, account.balance()); }
    }
}
```

:::senior
Nested classes share the *behavioural context*, not state: each `@Test` still gets its own outer + inner instance, so they stay isolated. Treat the `@DisplayName` strings as living documentation — `BankAccount > when newly opened > has a zero balance` tells a reviewer the intended behaviour without reading the body. Also prefer JUnit 5's `assertThrows`/`assertAll` over external assertion libraries only until the project standardises on one (AssertJ's fluent `assertThat` is a common upgrade).
:::

:::tip
Run tests with your build tool (`mvn test` / `gradle test`) or straight from the IDE. Surefire/Gradle discover anything on the test classpath ending in `*Test` by convention — no manual registration.
:::

:::key
A JUnit 5 test is a `@Test` method following **Arrange-Act-Assert**. `@BeforeEach`/`@AfterEach` run per test (fresh instance each time); `@BeforeAll`/`@AfterAll` are **static** and run once. Use `assertEquals(expected, actual)`, `assertThrows` (which returns the exception), and `assertAll` for grouped checks. Replace duplicated tests with `@ParameterizedTest`, and make reports readable with `@DisplayName` and `@Nested`.
:::
