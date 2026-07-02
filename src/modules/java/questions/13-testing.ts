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
];

export default questions;
