---
title: Mocking with Mockito
category: Testing & Build Tools
categoryOrder: 13
order: 2
level: Intermediate
summary: Isolate the class under test with fakes — mock/when/thenReturn, verify, argument matchers, @Mock/@InjectMocks, spies, stubbing voids, and when not to mock.
tags: mockito, mocking, testing, stubbing, verify
---

A unit test should exercise **one** class. But that class usually depends on others — a repository, an HTTP client, a clock. **Mockito** lets you replace those collaborators with controllable stand-ins so the test stays fast, deterministic, and focused on the logic you actually wrote.

## Stubbing: mock, when, thenReturn

`mock()` creates a fake implementation of a type. By default every method returns a *zero value* (`null`, `0`, `false`, empty collection). You then **stub** the calls you care about with `when(...).thenReturn(...)`.

```java
import static org.mockito.Mockito.*;

UserRepository repo = mock(UserRepository.class);
when(repo.findById(1L)).thenReturn(Optional.of(new User("Ada")));

var service = new UserService(repo);
assertEquals("Ada", service.nameOf(1L));   // service used the stubbed repo
```

Stub failures and sequences too:

```java
when(repo.findById(99L)).thenThrow(new NotFoundException());
when(counter.next()).thenReturn(1, 2, 3);   // consecutive calls
```

## Verifying interactions

Stubbing controls *inputs*; `verify` asserts the *outputs* — that the code actually called a collaborator. This is essential for methods that return `void`.

```java
service.register(new User("Grace"));

verify(repo).save(any(User.class));      // called exactly once (default)
verify(emailClient, times(1)).send(any());
verify(repo, never()).delete(any());
verifyNoMoreInteractions(emailClient);
```

## Argument matchers

Matchers like `any()`, `anyString()`, and `eq()` let you assert on shape rather than exact values.

:::gotcha
**You cannot mix raw values with matchers in one call.** If any argument uses a matcher, *all* of them must — wrap the literals in `eq()`:

```java
// BROKEN: 5 is a raw value next to a matcher -> InvalidUseOfMatchersException
verify(svc).charge(5, anyString());

// FIXED:
verify(svc).charge(eq(5), anyString());
```
:::

`ArgumentCaptor` goes further: it grabs the actual argument so you can assert on it.

```java
var captor = ArgumentCaptor.forClass(Email.class);
verify(emailClient).send(captor.capture());
assertEquals("welcome", captor.getValue().subject());
```

## Annotations: @Mock and @InjectMocks

Hand-wiring gets verbose. With the JUnit 5 extension, `@Mock` creates mocks and `@InjectMocks` constructs the real object under test and injects those mocks into it.

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock  UserRepository repo;
    @Mock  EmailClient email;
    @InjectMocks UserService service;   // built with repo + email injected

    @Test
    void sendsWelcomeEmail() {
        when(repo.save(any())).thenReturn(new User("Lin"));
        service.register(new User("Lin"));
        verify(email).send(any());
    }
}
```

## Spies and stubbing void methods

A **spy** wraps a *real* object: calls hit real code unless stubbed. Use it sparingly for legacy code you can't easily refactor.

:::gotcha
On a spy, `when(spy.method())` **calls the real method** while setting up the stub — dangerous if it has side effects. Use the `doReturn`/`doThrow` form, which never invokes the real method:

```java
List<String> spy = spy(new ArrayList<>());
// when(spy.get(0)).thenReturn("x");   // throws — real get(0) runs on empty list
doReturn("x").when(spy).get(0);        // safe
```
:::

The `doX().when()` family is also how you stub `void` methods, since `when(mock.voidMethod())` won't compile:

```java
doThrow(new IOException()).when(writer).flush();   // void that throws
doNothing().when(logger).log(anyString());         // explicitly do nothing
```

## When *not* to mock

| Mock it | Don't mock it |
|---------|---------------|
| Slow/external collaborators (DB, network, clock) | Value objects / DTOs / records |
| Non-deterministic sources (random, time) | Types you don't own (wrap them, mock the wrapper) |
| Hard-to-trigger error paths | The class under test |
| Interfaces you defined | Simple, fast, pure logic (use the real thing) |

:::senior
Mocking types you don't own (a third-party SDK, `LocalDateTime`) couples your tests to an API you can't control and can encode wrong assumptions about its behaviour. Prefer a thin adapter you own, and mock that. And beware **over-mocking**: a test that mocks every dependency often just asserts "the code calls the methods I wrote" — it verifies interactions, not correctness. When the real collaborator is fast and deterministic (a `List`, an in-memory `Map`), use it. Reserve mocks for the genuinely awkward boundaries.
:::

:::tip
`MockitoExtension` runs in **strict stubbing** mode: unused stubs fail the test, catching dead setup and typos early. Keep it on.
:::

:::key
Use `when(mock.call()).thenReturn(...)` to control inputs and `verify(mock).call(...)` to assert interactions (especially for `void`). Matchers (`any`, `eq`) are all-or-nothing within a call. `@Mock` + `@InjectMocks` under `MockitoExtension` wires tests cleanly. Spies wrap real objects — stub them with `doReturn(...).when(spy)` to avoid running real code, the same form used to stub `void` methods. Don't mock value objects, types you don't own, or the class under test.
:::
