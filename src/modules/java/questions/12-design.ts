import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'design-singleton-best',
    question: 'What is the best way to implement a Singleton in Java, and why?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['singleton', 'creational', 'thread-safety'],
    answer: `Joshua Bloch's recommendation is the **single-element enum** — concise, thread-safe by the language, and the only approach that's free against serialization and reflection attacks:

\`\`\`java
public enum Config {
    INSTANCE;
    public String get(String key) { /* ... */ }
}
\`\`\`

If you need **lazy** initialisation, use the **initialization-on-demand holder** idiom — lazy *and* thread-safe with no locking, because the JVM guarantees class init runs once:

\`\`\`java
public final class Registry {
    private Registry() {}
    private static class Holder { static final Registry INSTANCE = new Registry(); }
    public static Registry getInstance() { return Holder.INSTANCE; }
}
\`\`\`

:::gotcha
**Double-checked locking** works only if the instance field is \`volatile\`; otherwise a thread can see a partially constructed object due to instruction reordering.
:::`,
  },
  {
    id: 'design-factory-vs-abstract-factory',
    question: 'What is the difference between Factory Method and Abstract Factory?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['factory', 'abstract-factory', 'creational'],
    answer: `Both hide concrete classes from the client, but they operate at different scales:

- **Factory Method** — *one* product. A method (often abstract) lets **subclasses decide** which class to instantiate. Uses **inheritance**.
- **Abstract Factory** — a *family* of related products. An object exposes several factory methods so everything it creates belongs to one consistent family (e.g. all "Mac" widgets). Uses **composition**.

\`\`\`java
// Factory Method
abstract class Dialog { abstract Button createButton(); }

// Abstract Factory
interface GuiFactory { Button button(); Checkbox checkbox(); }
\`\`\`

Rule of thumb: Abstract Factory is usually *implemented with* several Factory Methods.`,
  },
  {
    id: 'design-decorator-java-io',
    question: 'Explain the Decorator pattern. Where does the JDK use it?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['decorator', 'structural', 'java-io'],
    answer: `Decorator attaches responsibilities to an object **dynamically** by wrapping it in another object that implements the **same interface** and delegates to the wrapped one. It's a flexible alternative to subclassing for extending behaviour.

The canonical JDK example is **\`java.io\`**, where every stream wraps another:

\`\`\`java
InputStream in = new GZIPInputStream(
                     new BufferedInputStream(
                         new FileInputStream("data.gz")));
\`\`\`

Each wrapper *is* an \`InputStream\` and adds one capability (buffering, decompression). \`Collections.synchronizedList\` and \`unmodifiableList\` are decorators too.

:::tip
Decorator avoids a combinatorial explosion of subclasses (\`BufferedGzipFileInputStream\`...) by letting you compose features at runtime.
:::`,
  },
  {
    id: 'design-decorator-vs-proxy-vs-adapter',
    question: 'Decorator, Proxy, and Adapter all wrap an object — how do they differ?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['decorator', 'proxy', 'adapter', 'structural'],
    answer: `All three wrap a delegate, so they look alike structurally. The difference is **intent**:

| Pattern | Interface | Purpose |
|---------|-----------|---------|
| **Adapter** | *changes* it | Make an incompatible type fit a target interface |
| **Decorator** | *keeps* it | Add behaviour transparently |
| **Proxy** | *keeps* it | Control access (lazy load, security, remoting, caching) |

So: if you're translating an interface it's an Adapter; if you're adding capability it's a Decorator; if you're gating or deferring access it's a Proxy.`,
  },
  {
    id: 'design-dynamic-proxy',
    question: 'What is a dynamic proxy in Java and what is it used for?',
    difficulty: 'Hard',
    category: 'Design Patterns',
    tags: ['proxy', 'dynamic-proxy', 'reflection'],
    answer: `A **dynamic proxy** is a proxy class **generated at runtime** by \`java.lang.reflect.Proxy\`. You supply the interfaces to implement and an \`InvocationHandler\` that intercepts every method call:

\`\`\`java
Foo proxy = (Foo) Proxy.newProxyInstance(
    Foo.class.getClassLoader(),
    new Class<?>[]{ Foo.class },
    (p, method, args) -> {
        log(method);
        return method.invoke(target, args);
    });
\`\`\`

It powers **Spring AOP** (\`@Transactional\`), **Mockito** mocks, and lazy ORM loading.

:::gotcha
JDK dynamic proxies only proxy **interfaces** — to proxy a concrete class you need CGLIB/ByteBuddy. And **self-invocation** (\`this.method()\`) bypasses the proxy, so the advice silently doesn't run.
:::`,
  },
  {
    id: 'design-strategy-lambda',
    question: 'How does the Strategy pattern look in modern Java?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['strategy', 'behavioral', 'lambdas'],
    answer: `Strategy encapsulates interchangeable algorithms behind a common interface. With a **functional interface**, a strategy is simply a **lambda** — no concrete strategy classes needed:

\`\`\`java
@FunctionalInterface interface DiscountStrategy { double apply(double price); }

DiscountStrategy black = price -> price * 0.80;
double checkout(double price, DiscountStrategy s) { return s.apply(price); }
\`\`\`

The JDK's prime example is **\`Comparator\`**:

\`\`\`java
list.sort(Comparator.comparing(Person::age));   // ordering is the injected strategy
\`\`\`

This is why \`java.util.function\` largely replaced hand-written Strategy classes.`,
  },
  {
    id: 'design-strategy-vs-state',
    question: 'Strategy and State are structurally identical — when is it which?',
    difficulty: 'Hard',
    category: 'Design Patterns',
    tags: ['strategy', 'state', 'behavioral'],
    answer: `Both have an object delegate to a swappable helper. The distinction is **who decides the swap and whether it changes**:

- **Strategy** — the *client* picks one algorithm, and it typically **doesn't change** during use (e.g. a sort order or pricing rule). The client knows the strategy.
- **State** — the object **transitions itself** between states based on events, and the client usually neither knows nor cares which concrete state is active (e.g. a traffic light or order lifecycle).

In short: if the wrapped object decides "what comes next", it's State; if the client decides "how to do this", it's Strategy.`,
  },
  {
    id: 'design-lsp-violation',
    question: 'Give a classic Liskov Substitution Principle violation.',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['solid', 'lsp', 'inheritance'],
    answer: `The textbook case is **\`Square extends Rectangle\`**. A square overrides the setters so width and height stay equal:

\`\`\`java
class Square extends Rectangle {
    void setWidth(int w)  { this.w = this.h = w; }
    void setHeight(int h) { this.w = this.h = h; }
}
\`\`\`

Code written against \`Rectangle\` assumes the two dimensions are independent:

\`\`\`java
r.setWidth(5); r.setHeight(4);
assert r.area() == 20;   // true for Rectangle, FALSE for Square (16)
\`\`\`

\`Square\` weakens that postcondition, so it isn't substitutable.

:::note
LSP is about **behavioural contracts**, not compilation. Subtypes also break it by strengthening preconditions, throwing new exceptions, or weakening guarantees.
:::`,
  },
  {
    id: 'design-builder-when',
    question: 'When should you use a Builder instead of constructors?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['builder', 'creational', 'idioms'],
    answer: `Reach for a Builder when an object has **many parameters, especially optional ones**. It cures the **telescoping-constructor** anti-pattern and produces readable, order-independent, immutable construction:

\`\`\`java
var req = HttpRequest.builder("https://api")
                     .method("POST")
                     .timeout(Duration.ofSeconds(5))
                     .build();
\`\`\`

Benefits over a giant constructor: named arguments at the call site, sensible defaults, and you can validate in \`build()\`. The JDK's \`HttpRequest.newBuilder()\` and \`Stream.Builder\` use it.

:::tip
For a handful of required fields with no optionals, a **record** is simpler — don't add a Builder you don't need.
:::`,
  },
  {
    id: 'design-null-optional',
    question: 'How does Optional improve on returning null, and how is it misused?',
    difficulty: 'Medium',
    category: 'Design Patterns',
    tags: ['optional', 'null', 'idioms'],
    answer: `\`Optional<T>\` makes "value may be absent" **explicit in the type**, forcing the caller to handle the empty case instead of risking a forgotten null check and an NPE:

\`\`\`java
repo.find(id)               // Optional<User>
    .map(User::name)
    .ifPresent(System.out::println);
\`\`\`

:::gotcha
Misuses to avoid:
- **Fields / parameters** — don't; use \`requireNonNull\` for params, plain types for fields. (\`Optional\` isn't \`Serializable\`.)
- **Collections** — return an empty list, not \`Optional<List>\`.
- **\`get()\` without checking** — trades an NPE for \`NoSuchElementException\`; use \`orElse\`/\`orElseThrow\`/\`map\`.
:::

\`Optional\` is meant for **return types** signalling possible absence — nothing more.`,
  },
];

export default questions;
