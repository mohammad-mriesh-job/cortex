import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'test-junit5-lifecycle',
    question: 'What are the JUnit 5 lifecycle annotations, and in what order do they run?',
    difficulty: 'Medium',
    category: 'Testing',
    tags: ['junit', 'lifecycle', 'annotations'],
    answer: `Four annotations wrap your tests with setup/teardown:

| Annotation | Runs | Static? |
|------------|------|---------|
| \`@BeforeAll\` | once, before all tests | **yes** |
| \`@BeforeEach\` | before *every* test | no |
| \`@AfterEach\` | after *every* test | no |
| \`@AfterAll\` | once, after all tests | **yes** |

For a class with two tests the order is:

\`\`\`text
@BeforeAll
  @BeforeEach -> test1 -> @AfterEach
  @BeforeEach -> test2 -> @AfterEach
@AfterAll
\`\`\`

JUnit creates a **new instance of the test class for each \`@Test\`**, which is why \`@BeforeAll\`/\`@AfterAll\` must be \`static\` — there's no single instance to attach them to.

:::tip
You can make them non-static by annotating the class \`@TestInstance(Lifecycle.PER_CLASS)\`, which reuses one instance for all tests. Use it sparingly — per-method isolation is the safer default.
:::`,
  },
  {
    id: 'test-assertions-throws',
    question: 'In JUnit 5, what is the argument order of assertEquals, and how do you test that code throws an exception?',
    difficulty: 'Easy',
    category: 'Testing',
    tags: ['junit', 'assertions', 'exceptions'],
    answer: `\`assertEquals(expected, actual)\` — **expected first, actual second**. The order doesn't change pass/fail, but reversing it produces a misleading *"expected ... but was ..."* failure message.

To test failure paths, use \`assertThrows\`, which **returns the thrown exception** so you can assert on it:

\`\`\`java
var ex = assertThrows(IllegalArgumentException.class,
                      () -> account.withdraw(-5));
assertEquals("amount must be positive", ex.getMessage());
\`\`\`

:::gotcha
Don't wrap the call in a try/catch with a bare \`fail()\` — that's the JUnit 4 idiom. And don't forget the lambda: \`assertThrows(X.class, foo())\` *calls* \`foo()\` immediately instead of passing it as an \`Executable\`.
:::

Group independent checks with \`assertAll\` so one failure doesn't hide the others.`,
  },
  {
    id: 'test-parameterized',
    question: 'How do parameterized tests work in JUnit 5, and why use them?',
    difficulty: 'Medium',
    category: 'Testing',
    tags: ['junit', 'parameterized-tests'],
    answer: `\`@ParameterizedTest\` runs the **same test body once per input**, replacing a pile of near-identical copy-pasted tests. It needs the \`junit-jupiter-params\` dependency and an argument source:

\`\`\`java
@ParameterizedTest
@ValueSource(ints = {2, 4, 100, -6})
void detectsEvens(int n) {
    assertTrue(Numbers.isEven(n));
}

@ParameterizedTest
@CsvSource({"2, 3, 5", "0, 0, 0", "-1, 1, 0"})
void adds(int a, int b, int sum) {
    assertEquals(sum, calc.add(a, b));
}
\`\`\`

Common sources:

- \`@ValueSource\` — one simple literal per run.
- \`@CsvSource\` / \`@CsvFileSource\` — multiple columns mapped to params.
- \`@MethodSource\` — a \`static Stream<Arguments>\` for complex objects.
- \`@EnumSource\` — once per enum constant; \`@NullAndEmptySource\` for edge cases.

The win is **coverage of many cases with one piece of logic** — add a row, not a method — and each input is reported as a separate test.`,
  },
  {
    id: 'test-mock-vs-spy',
    question: 'What is the difference between a Mockito mock and a spy?',
    difficulty: 'Medium',
    category: 'Testing',
    tags: ['mockito', 'mock', 'spy'],
    answer: `Both produce a test double, but they start from opposite defaults:

- **\`mock(Foo.class)\`** — a *fully fake* object. Every method returns a zero value (\`null\`, \`0\`, \`false\`, empty) until you stub it. Real code never runs.
- **\`spy(realObject)\`** — a *wrapper around a real instance*. Calls hit the **real implementation** unless you explicitly stub them. Good for partially overriding legacy objects.

\`\`\`java
List<String> mock = mock(List.class);
mock.add("x");
mock.size();   // 0  — nothing real happened

List<String> spy = spy(new ArrayList<>());
spy.add("x");
spy.size();    // 1  — real ArrayList ran
\`\`\`

:::gotcha
On a spy, \`when(spy.get(0)).thenReturn("x")\` **executes the real \`get(0)\`** while stubbing, which can throw or cause side effects. Use the \`doReturn(...).when(spy).get(0)\` form, which never calls the real method.
:::

Reach for \`mock\` by default; use \`spy\` only when you genuinely need most of an object's real behaviour with a small piece faked.`,
  },
  {
    id: 'test-matcher-rule',
    question: 'What happens if you mix raw values and argument matchers in a Mockito call?',
    difficulty: 'Hard',
    category: 'Testing',
    tags: ['mockito', 'matchers', 'gotcha'],
    answer: `Mockito throws \`InvalidUseOfMatchersException\`. The rule is **all-or-nothing**: if *any* argument in a \`when\`/\`verify\` uses a matcher (\`any()\`, \`anyString()\`, ...), then **every** argument must be a matcher.

\`\`\`java
// BROKEN — 5 is a raw value beside a matcher
verify(service).charge(5, anyString());

// FIXED — wrap the literal in eq()
verify(service).charge(eq(5), anyString());
\`\`\`

**Why:** matchers don't actually return the value they appear to. Each call to \`any()\`/\`eq()\` pushes a matcher onto an internal stack and returns a dummy (e.g. \`0\` or \`null\`). Mockito then expects exactly one matcher per argument. A raw \`5\` pushes nothing, so the stack and the argument list get out of sync.

:::tip
\`eq(value)\` is the matcher that means "equal to this literal" — it's how you keep a fixed value while another argument needs \`any()\`.
:::`,
  },
  {
    id: 'test-doubles-taxonomy',
    question: 'What are the different types of test doubles?',
    difficulty: 'Medium',
    category: 'Testing',
    tags: ['test-doubles', 'mock', 'stub', 'fake'],
    answer: `"Mock" is used loosely for any fake, but Gerard Meszaros's taxonomy distinguishes five:

| Double | Purpose |
|--------|---------|
| **Dummy** | Fills a required parameter but is never used. |
| **Stub** | Returns canned answers — controls the **input** to the code under test. |
| **Spy** | A stub that also **records** how it was called, for later inspection. |
| **Mock** | Pre-programmed with **expectations** it can **verify** — controls **interaction**. |
| **Fake** | A real but simplified working implementation (e.g. an in-memory database). |

The key distinction is **state vs interaction** testing:

- A **stub** helps you assert on the *result* (state) the code produced.
- A **mock** helps you assert on the *calls* the code made (behaviour/interaction).

:::senior
Mockito blurs these lines — its \`mock()\` object acts as a stub when you use \`when().thenReturn()\` and as a mock when you use \`verify()\`. Knowing the conceptual difference still matters: prefer asserting on **state/outcomes** over **interactions**, because interaction tests are tightly coupled to implementation and break during refactors.
:::`,
  },
  {
    id: 'test-pyramid-first',
    question: 'Explain the test pyramid and the FIRST principles.',
    difficulty: 'Medium',
    category: 'Testing',
    tags: ['test-pyramid', 'first', 'strategy'],
    answer: `The **test pyramid** (Mike Cohn) is a strategy for *how many* tests to write at each level:

- **Unit** (base) — many, fast, isolated. The bulk of your suite.
- **Integration** (middle) — fewer; verify components wired together (DB, HTTP).
- **End-to-end** (tip) — few; slow and brittle, so use sparingly.

As you go up, tests get slower and more fragile, so you want fewer of them. The inverted **"ice-cream cone"** (mostly E2E, few unit) gives slow, flaky feedback that can't localise failures.

Good unit tests are **FIRST**:

- **Fast** — run in milliseconds so you run them constantly.
- **Independent** — no shared state or ordering; runnable alone or in any order.
- **Repeatable** — deterministic on any machine (no real clock, network, or randomness).
- **Self-validating** — a clear pass/fail via assertions, not log inspection.
- **Timely** — written with the code, while the requirement is fresh.

:::tip
A flaky test (passes sometimes, fails others) usually violates **Independent** or **Repeatable** — shared mutable state, a real timestamp, or test-ordering assumptions. Fix or quarantine it immediately; a suite people don't trust gets ignored.
:::`,
  },
  {
    id: 'test-coverage-myth',
    question: 'Does 100% code coverage mean your code is well tested?',
    difficulty: 'Medium',
    category: 'Testing',
    tags: ['coverage', 'quality', 'mutation-testing'],
    answer: `No. **Coverage measures which lines/branches *executed* during tests — not whether you *asserted* anything meaningful about them.** A test can call every method, assert nothing, and still report 100% coverage.

\`\`\`java
@Test
void brokenButGreen() {
    calculator.add(2, 3);   // line executes -> "covered"
    // ...no assertion! A bug here is never caught.
}
\`\`\`

So coverage is **necessary-ish but not sufficient**:

- It's useful to **find untested code** (the red lines).
- Chasing a 100% *target* breeds assertion-free "coverage theatre" and pointless tests of trivial getters.
- It says nothing about edge cases, correctness of assertions, or whether behaviour is right.

:::senior
The stronger signal is **mutation testing** (e.g. PITest): it deliberately mutates your code — flips a \`>\` to \`>=\`, replaces a return with \`null\` — and checks whether a test *fails*. A surviving mutant means your tests execute that line but don't actually verify its behaviour. Treat line coverage as a smoke detector, mutation score as the real measure of test strength.
:::`,
  },
  {
    id: 'test-unit-vs-integration',
    question: "What's the difference between a unit test and an integration test?",
    difficulty: 'Easy',
    category: 'Testing',
    tags: ['unit-test', 'integration-test', 'strategy'],
    answer: `They test at different scopes:

| | Unit test | Integration test |
|--|-----------|------------------|
| Scope | one class/method **in isolation** | several components **together** |
| Collaborators | **mocked** | **real** (DB, HTTP, Spring context) |
| Speed | milliseconds | seconds |
| Catches | logic bugs | wiring, config, SQL, serialization bugs |

\`\`\`java
// Unit — dependency is a mock, no Spring, no DB:
var svc = new OrderService(mock(PaymentGateway.class));

// Integration — real context and datasource:
@SpringBootTest
class OrderFlowIT { /* loads beans, hits a test DB */ }
\`\`\`

- **Unit tests** pin down business logic fast and are the bulk of the suite.
- **Integration tests** verify the parts actually work *together* — things a mock can hide, like a wrong JPA mapping or a bad SQL dialect.

:::tip
You need both (the test pyramid): many fast unit tests, fewer integration tests. Relying only on unit tests ships wiring bugs; relying only on integration tests gives a slow, flaky suite.
:::`,
  },
  {
    id: 'test-aaa',
    question: 'How should you structure a test with Arrange-Act-Assert?',
    difficulty: 'Easy',
    category: 'Testing',
    tags: ['aaa', 'given-when-then', 'readability'],
    answer: `**Arrange-Act-Assert** (a.k.a. Given-When-Then) gives every test the same readable three-part shape:

\`\`\`java
@Test
void withdraw_reducesBalance() {
    // Arrange — set up inputs and collaborators
    var account = new Account(100);
    // Act — the ONE action under test
    account.withdraw(30);
    // Assert — verify the outcome
    assertEquals(70, account.balance());
}
\`\`\`

- **Arrange** — build the object and its dependencies (mocks, fixtures).
- **Act** — invoke the single behaviour you're testing.
- **Assert** — check the result or interaction.

Keep it to **one logical action** and assert **one concept** per test, with a name that states the scenario and expectation (\`method_condition_expectedResult\`).

:::tip
If a test needs two "Act" steps or asserts unrelated things, split it. Small, single-purpose tests localize failures — when one breaks, its name tells you exactly what regressed.
:::`,
  },
  {
    id: 'test-stubbing',
    question: 'How do you stub method behaviour in Mockito?',
    difficulty: 'Easy',
    category: 'Testing',
    tags: ['mockito', 'stubbing', 'when-thenReturn'],
    answer: `Program a mock's responses with \`when(...).thenReturn(...)\`:

\`\`\`java
when(repo.findById(1L)).thenReturn(Optional.of(user));   // canned result
when(repo.findById(9L)).thenThrow(new NotFoundException()); // throw
when(clock.now()).thenReturn(t1, t2, t3);                 // consecutive calls
when(svc.compute(anyInt())).thenAnswer(i -> i.getArgument(0, Integer.class) * 2); // dynamic
\`\`\`

For **void** methods use the \`do*\` forms (the argument goes after \`.when(mock)\`):

\`\`\`java
doThrow(new IllegalStateException()).when(service).send(any());
doNothing().when(logger).log(any());
\`\`\`

An unstubbed mock method returns a **default**: \`null\`, \`0\`/\`false\`, or an empty collection.

:::gotcha
Stub only what the test uses. Mockito's **strict stubbing** (default with \`MockitoExtension\`) fails the test on **unused** stubs — they're usually a sign of a copy-pasted setup or a test that drifted from the code.
:::`,
  },
  {
    id: 'test-mockito-annotations',
    question: 'What do @Mock, @InjectMocks, and @ExtendWith(MockitoExtension) do?',
    difficulty: 'Medium',
    category: 'Testing',
    tags: ['mockito', 'annotations', 'injectmocks'],
    answer: `They wire up mocks with no boilerplate:

- **\`@ExtendWith(MockitoExtension.class)\`** (JUnit 5) activates Mockito and initializes the annotated fields before each test.
- **\`@Mock\`** creates a mock for that field.
- **\`@InjectMocks\`** creates a **real** instance of the class under test and injects the \`@Mock\` fields into it (via constructor, then setter, then field).

\`\`\`java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock PaymentGateway gateway;          // a mock
    @InjectMocks OrderService service;     // real object, gateway injected in

    @Test void charges() {
        when(gateway.charge(any())).thenReturn(Receipt.ok());
        service.checkout(cart);
        verify(gateway).charge(any());
    }
}
\`\`\`

Related: \`@Spy\` (partial mock), \`@Captor\` (an \`ArgumentCaptor\`).

:::gotcha
\`@InjectMocks\` injection is **best-effort and silent** — if a dependency doesn't match, the field is left \`null\` with no error, surfacing later as an NPE. **Constructor injection** in the class under test makes the wiring explicit and fails fast.
:::`,
  },
  {
    id: 'test-verify-captor',
    question: 'How do you verify interactions, and what is an ArgumentCaptor?',
    difficulty: 'Medium',
    category: 'Testing',
    tags: ['mockito', 'verify', 'argumentcaptor'],
    answer: `\`verify\` asserts that a mock was **called** as expected — the interaction, not the return value:

\`\`\`java
verify(repo).save(order);                 // called exactly once (default)
verify(mailer, times(2)).send(any());     // exactly twice
verify(auditor, never()).delete(any());   // never
verify(repo, atLeastOnce()).flush();
verifyNoMoreInteractions(repo);           // nothing else happened
\`\`\`

An **\`ArgumentCaptor\`** grabs the *actual* argument a mock received so you can assert on an object **built inside** the method under test:

\`\`\`java
@Captor ArgumentCaptor<Order> captor;
service.checkout(cart);
verify(repo).save(captor.capture());
assertEquals(BigDecimal.TEN, captor.getValue().total());  // inspect what was saved
\`\`\`

:::senior
Use a **captor** to inspect a constructed argument *after the fact*; use a **matcher** (\`eq\`, \`argThat\`) to *constrain* the call up front. Over-verifying (asserting every interaction) makes tests brittle — verify the interactions that matter, and prefer asserting on **state/outcomes** where you can.
:::`,
  },
  {
    id: 'test-tdd',
    question: 'What is TDD and the red-green-refactor cycle?',
    difficulty: 'Medium',
    category: 'Testing',
    tags: ['tdd', 'red-green-refactor', 'design'],
    answer: `**Test-Driven Development** writes the test **before** the code, in a tight loop:

1. **Red** — write a small failing test for the next bit of behaviour.
2. **Green** — write the **minimum** code to make it pass.
3. **Refactor** — clean up the code (and tests) with the tests as a safety net.

\`\`\`text
Red -> Green -> Refactor -> Red -> ...   (minutes per cycle)
\`\`\`

Benefits: it forces **testable design** (you feel awkward dependencies immediately), you write **only the code you need**, tests double as **living specification**, and you get regression safety from day one.

:::senior
TDD isn't dogma — it shines for logic with clear inputs/outputs (parsers, calculations, algorithms) and struggles for exploratory or UI work, where test-after is fine. The durable lesson is *design for testability*: a class that's hard to test is usually badly coupled, regardless of whether the test came first.
:::`,
  },
  {
    id: 'test-private-methods',
    question: 'Should you test private methods directly?',
    difficulty: 'Hard',
    category: 'Testing',
    tags: ['private-methods', 'design', 'philosophy'],
    answer: `The mainstream answer is **no** — test private methods **through the public API** that calls them. Privates are implementation details; testing them directly (via reflection or by loosening visibility) **couples your tests to internals**, so a harmless refactor breaks tests even though behaviour is unchanged.

\`\`\`java
// Don't: reflectively invoke calculateDiscount() (a private method)
// Do: test the public checkout() that uses it, across meaningful inputs
\`\`\`

Two guiding ideas:
- If a private method is complex enough to *demand* its own test, that's a **design signal** — extract it into its own class with a public method and test that.
- Public-API tests already **cover** the privates (they run as part of the public behaviour); a coverage gap on a private means a missing public-level case.

:::senior
Reaching for reflection or \`@VisibleForTesting\` to test internals is usually a smell that a class is doing too much. The stronger move is to **extract a collaborator** — better design *and* naturally testable, no visibility hacks.
:::`,
  },
  {
    id: 'test-testcontainers',
    question: 'What is Testcontainers and when would you use it?',
    difficulty: 'Medium',
    category: 'Testing',
    tags: ['testcontainers', 'integration-test', 'docker'],
    answer: `**Testcontainers** starts **real dependencies in throwaway Docker containers** for the duration of a test — a genuine Postgres, Kafka, or Redis instead of a mock or an in-memory substitute:

\`\`\`java
@Testcontainers
class RepoIT {
    @Container
    static PostgreSQLContainer<?> db = new PostgreSQLContainer<>("postgres:16");
    // Spring points its datasource at db.getJdbcUrl() — real Postgres
}
\`\`\`

The big win is **fidelity**: tests run against the *same* engine as production, catching dialect- and behaviour-specific bugs that an H2 in-memory DB hides (JSON types, sequences, upserts, locking). The container is created fresh and torn down automatically, so tests stay isolated and repeatable.

:::gotcha
It requires **Docker** on the machine/CI and is slower to start than a pure unit test — so it belongs in the **integration tier**, not on every test. Reuse containers across a class (\`static\`) to amortize startup.
:::`,
  },
  {
    id: 'test-mocking-static',
    question: 'How do you mock a static or final method, and why is needing to a design smell?',
    difficulty: 'Hard',
    category: 'Testing',
    tags: ['mockito', 'static-mock', 'design'],
    answer: `Modern Mockito (the \`mockito-inline\` engine, default since Mockito 5) can mock **finals** directly and **statics** via \`mockStatic\` in a scoped block:

\`\`\`java
try (MockedStatic<Instant> mocked = mockStatic(Instant.class)) {
    mocked.when(Instant::now).thenReturn(fixed);
    assertEquals(fixed, service.timestamp());
}   // static mock active only inside the try
\`\`\`

But **needing** this usually signals a design problem: a static call (\`Instant.now()\`, \`LocalDate.now()\`, a static utility) is a **hard, un-injectable dependency**. The cleaner fix is to inject it:

\`\`\`java
class Service {
    private final Clock clock;                     // inject a Clock
    Instant timestamp() { return clock.instant(); } // trivially testable, no static mock
}
\`\`\`

:::senior
Prefer refactoring the static behind an injectable seam (\`Clock\`, a wrapper interface) over reaching for static mocking. Static mocks are global within their scope, easy to leak across tests, and (like the legacy **PowerMock**) a sign the code fights testability rather than embracing it.
:::`,
  },
];

export default questions;
