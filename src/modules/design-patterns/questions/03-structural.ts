import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'pat-str-adapter-intent',
    question: 'What is the Adapter pattern, and why prefer the object adapter in Java?',
    difficulty: 'Easy',
    category: 'Structural',
    tags: ['adapter', 'composition'],
    answer: `**Adapter** converts one class's interface into another that clients expect, letting incompatible types collaborate — the "plug adapter" of software.

Two forms:
- **Object adapter** — *composition*: the adapter holds a reference to the adaptee and delegates.
- **Class adapter** — *inheritance*: the adapter extends the adaptee.

Prefer the **object adapter** in Java because Java has no multiple class inheritance, and composition lets you adapt **any subtype** of the adaptee rather than one fixed class.

JDK examples: \`InputStreamReader\` (bytes → chars), \`Arrays.asList\`, \`Collections.list(Enumeration)\`.`,
  },
  {
    id: 'pat-str-decorator-io',
    question: 'Explain the Decorator pattern using java.io.',
    difficulty: 'Medium',
    category: 'Structural',
    tags: ['decorator', 'java.io'],
    answer: `**Decorator** adds behaviour to an object at runtime by wrapping it in another object that **implements the same interface** and **delegates** to it.

\`java.io\` is the textbook example:

\`\`\`java
Reader r = new BufferedReader(new FileReader("data.txt"));
\`\`\`

\`BufferedReader\` *is-a* \`Reader\` and *has-a* \`Reader\`, so it adds buffering then forwards calls. You compose features (buffering, decoding, compression) instead of creating a class per combination.

It avoids the **subclass explosion**: N independent features would need up to 2ᴺ subclasses, but N decorators stack freely.`,
  },
  {
    id: 'pat-str-adapter-vs-decorator-vs-proxy',
    question: 'Adapter vs Decorator vs Proxy — all wrap an object. How do they differ?',
    difficulty: 'Hard',
    category: 'Structural',
    tags: ['adapter', 'decorator', 'proxy', 'comparison'],
    answer: `All three wrap a delegate, but the **intent** differs:

| Pattern | Intent | Interface | Behaviour |
|--|--|--|--|
| **Adapter** | Make an incompatible interface usable | **Changes** the interface | Same behaviour, new shape |
| **Decorator** | Add responsibilities | **Same** interface | **Enhanced** behaviour |
| **Proxy** | Control access / lifecycle | **Same** interface | Same behaviour, gated |

Quick test:
- Different interface out than in → **Adapter**.
- Same interface, does *more* → **Decorator**.
- Same interface, controls *whether/when* you reach the real object (lazy, security, remote) → **Proxy**.

Proxy usually manages the real object's lifecycle (it may create it lazily); a decorator wraps an object already handed to it.`,
  },
  {
    id: 'pat-str-facade-intent',
    question: 'What problem does the Facade pattern solve?',
    difficulty: 'Easy',
    category: 'Structural',
    tags: ['facade', 'coupling'],
    answer: `**Facade** provides a single, simplified, higher-level interface over a complex subsystem, so clients do not have to know and orchestrate many collaborating classes.

Benefits: reduced coupling, an easier default entry point, and a clear boundary around subsystem complexity.

It does **not** hide the subsystem — advanced clients can still use the underlying classes directly. Examples: Spring's \`JdbcTemplate\` over raw JDBC, SLF4J's \`LoggerFactory\`, \`URL.openConnection()\`.

Keep facades thin: orchestration and simplification, not business logic.`,
  },
  {
    id: 'pat-str-proxy-kinds',
    question: 'Name the kinds of Proxy and give an example of each.',
    difficulty: 'Medium',
    category: 'Structural',
    tags: ['proxy', 'virtual', 'protection', 'remote'],
    answer: `A **proxy** is a same-interface stand-in that **controls access** to a real subject. Kinds:

- **Virtual** — delays creating an expensive object until first use (lazy-loaded image, Hibernate lazy entity).
- **Protection** — checks permissions before forwarding (security proxy).
- **Remote** — represents an object in another JVM/process (Java RMI stub).
- **Smart** — adds bookkeeping like reference-counting, logging, or caching.

The client cannot tell it is talking to a proxy because it implements the same interface as the \`RealSubject\`.`,
  },
  {
    id: 'pat-str-dynamic-proxy-spring',
    question: 'How do Java dynamic proxies power Spring AOP and Hibernate?',
    difficulty: 'Hard',
    category: 'Structural',
    tags: ['proxy', 'spring aop', 'hibernate', 'dynamic proxy'],
    answer: `\`java.lang.reflect.Proxy.newProxyInstance\` generates a proxy for interfaces **at runtime**; every call routes through an \`InvocationHandler\` that can run code before/after delegating.

- **Spring AOP** wraps beans in proxies to apply cross-cutting advice: \`@Transactional\`, \`@Async\`, security. It uses **JDK dynamic proxies** for interface-based beans and **CGLIB** subclass proxies for concrete classes.
- **Hibernate** returns proxy subclasses for lazy associations; the SQL fires only when you first touch the field.

:::gotcha
Because Spring works through a proxy, calling a \`@Transactional\` method from **another method in the same bean** (self-invocation) bypasses the proxy, so the annotation is silently ignored. The same proxy boundary is why touching a lazy field after the session closes throws \`LazyInitializationException\`.
:::`,
  },
  {
    id: 'pat-str-composite-intent',
    question: 'What is the Composite pattern and what is its defining structure?',
    difficulty: 'Medium',
    category: 'Structural',
    tags: ['composite', 'tree', 'recursion'],
    answer: `**Composite** arranges objects into **tree structures** for part-whole hierarchies and lets clients treat **leaves and branches uniformly** through a shared interface.

Defining structure: the \`Composite\` **holds a collection of the same \`Component\` type it implements**. That self-reference builds the tree and drives recursion — \`composite.operation()\` typically loops over children calling \`operation()\`.

Clients never check "leaf or branch?"; they just call the method.

JDK examples: Swing \`Container\` holding child \`Component\`s, \`java.io.File\` (file or directory), the DOM tree.

Design tension — *transparent* (child-management methods on \`Component\`, uniform but leaves must no-op/throw) vs *safe* (methods only on \`Composite\`, type-safe but requires downcasting).`,
  },
  {
    id: 'pat-str-bridge-intent',
    question: 'What is the Bridge pattern and what problem does it prevent?',
    difficulty: 'Hard',
    category: 'Structural',
    tags: ['bridge', 'abstraction', 'implementation'],
    answer: `**Bridge** decouples an **abstraction** from its **implementation** so the two can vary independently, joining them by composition instead of inheritance.

It prevents a **combinatorial class explosion**. With Shapes × Renderers, inheritance forces \`VectorCircle\`, \`RasterCircle\`, \`VectorSquare\`… (M × N classes). Bridge splits them into two hierarchies — \`Shape\` holds a \`Renderer\` — so you add **M + N** classes and each dimension evolves freely.

\`\`\`java
abstract class Shape { protected final Renderer renderer; /* the bridge */ }
class Circle extends Shape { void draw() { renderer.drawCircle(radius); } }
\`\`\`

JDK example: JDBC — \`java.sql\` interfaces are the abstraction, vendor \`Driver\`s are the implementation.`,
  },
  {
    id: 'pat-str-bridge-vs-adapter',
    question: 'Bridge vs Adapter — both delegate. How do you tell them apart?',
    difficulty: 'Hard',
    category: 'Structural',
    tags: ['bridge', 'adapter', 'comparison'],
    answer: `Both use composition and delegation, so they look alike. The decider is **timing and intent**:

| Bridge | Adapter |
|--|--|
| Designed **up front** to let two dimensions vary | Applied **after the fact** to fix a mismatch |
| Both sides designed together | Wraps an existing, unchangeable interface |
| Intent: separate concerns / avoid class explosion | Intent: make incompatible interfaces work |

One-liner: **Bridge is planned, Adapter is a patch.** Bridge separates two things you *know* will change; Adapter reconciles two things that *already* clash.`,
  },
  {
    id: 'pat-str-flyweight-state',
    question: 'Explain Flyweight and the intrinsic vs extrinsic state split.',
    difficulty: 'Medium',
    category: 'Structural',
    tags: ['flyweight', 'memory', 'intrinsic state'],
    answer: `**Flyweight** saves memory by **sharing** many fine-grained objects, splitting state into:

- **Intrinsic** — shared, context-independent, **immutable**; stored inside the flyweight.
- **Extrinsic** — context-dependent; **passed in by the client** on each call, never stored.

A factory pools flyweights and returns a shared instance per intrinsic key. Example: a text glyph's shape is intrinsic (one shared \`'a'\`), its screen position is extrinsic.

:::warning
The intrinsic state **must be immutable** — the object is shared across the whole program, so a mutation would corrupt every user.
:::

Only worth it with huge numbers of similar objects where intrinsic state dominates.`,
  },
  {
    id: 'pat-str-integer-cache',
    question: 'Why does Integer.valueOf(127) == Integer.valueOf(127) but not for 128?',
    difficulty: 'Medium',
    category: 'Structural',
    tags: ['flyweight', 'integer cache', 'autoboxing'],
    answer: `This is the **Flyweight** pattern in the JDK. \`Integer.valueOf\` caches boxed values in the range **−128 to 127** and returns the **same shared object** for them:

\`\`\`java
Integer a = 127, b = 127;
System.out.println(a == b);   // true  -> same cached flyweight
Integer c = 128, d = 128;
System.out.println(c == d);   // false -> outside cache, new objects
\`\`\`

Inside the range \`==\` compares the same reference; outside it, autoboxing allocates fresh objects.

:::gotcha
This is exactly why you compare boxed numbers with \`.equals()\`, never \`==\`. Similar caches exist for \`Boolean\`, \`Byte\`, \`Short\`, \`Long\`, \`Character\`, plus the String literal pool.
:::`,
  },
  {
    id: 'pat-str-seven-patterns-overview',
    question: 'Name the seven GoF structural patterns with a one-line intent for each.',
    difficulty: 'Easy',
    category: 'Structural',
    tags: ['overview', 'cheatsheet'],
    answer: `All seven are about **how objects compose**:

| Pattern | One-line intent |
|--|--|
| **Adapter** | Convert an interface into the one clients expect |
| **Bridge** | Split abstraction and implementation into two independent hierarchies |
| **Composite** | Tree of parts and wholes, treated uniformly |
| **Decorator** | Wrap to add responsibilities dynamically |
| **Facade** | One simple entry point over a complex subsystem |
| **Flyweight** | Share fine-grained immutable objects to save memory |
| **Proxy** | Same-interface stand-in that controls access |

Memory hook: four of them are *wrappers* (Adapter converts, Decorator enhances, Proxy guards, Facade simplifies); the other three organize *many* objects (Composite = tree, Bridge = two hierarchies, Flyweight = shared instances).`,
  },
  {
    id: 'pat-str-isr-vs-bufferedreader',
    question: 'InputStreamReader and BufferedReader both wrap another object. Which pattern is each, and why aren\'t they the same?',
    difficulty: 'Easy',
    category: 'Structural',
    tags: ['adapter', 'decorator', 'java.io'],
    answer: `\`\`\`java
BufferedReader in = new BufferedReader(        // Decorator
    new InputStreamReader(socket.getInputStream())); // Adapter
\`\`\`

- **\`InputStreamReader\` is an Adapter**: it takes a *byte* API (\`InputStream\`) and exposes a *character* API (\`Reader\`). The interface **changes**; no new capability is added — just charset decoding to bridge two incompatible worlds.
- **\`BufferedReader\` is a Decorator**: \`Reader\` in, \`Reader\` out — the **same** interface, with added behaviour (buffering, \`readLine()\`).

The one-question test: **did the interface change (Adapter) or did the capabilities grow behind the same interface (Decorator)?**

This single line of JDK code is the cleanest way to prove in an interview that you can tell the two wrappers apart.`,
  },
  {
    id: 'pat-str-adapter-legacy-integration',
    question: 'Walk through integrating a legacy payments SDK whose interface doesn\'t match your domain. How does Adapter keep the mess contained?',
    difficulty: 'Medium',
    category: 'Structural',
    tags: ['adapter', 'legacy', 'anti-corruption'],
    answer: `Three moves:

1. **Define the target interface your domain wants** (you own it):

\`\`\`java
public interface PaymentGateway {
  PaymentResult charge(CustomerId id, Money amount);
}
\`\`\`

2. **Write the adapter** — it implements your interface, holds the legacy client, and translates *both data models and error models* at the boundary:

\`\`\`java
class LegacyPayCoAdapter implements PaymentGateway {
  private final PayCoClient client;              // the legacy SDK
  public PaymentResult charge(CustomerId id, Money amount) {
    try {
      PayCoResp r = client.doTxn(id.raw(), amount.cents(), "USD");
      return PaymentResult.from(r.code());
    } catch (PayCoException e) {
      throw new PaymentFailedException(e);       // translate exceptions too
    }
  }
}
\`\`\`

3. **Keep the SDK types out of everything else** — the adapter is the only class that knows both vocabularies. Swapping providers means writing one new adapter.

:::senior
This is exactly DDD's **anti-corruption layer** and the "adapter" in hexagonal architecture — same word, same idea, different altitude. Also translate *exceptions*, not just data; leaking \`PayCoException\` re-couples everything.
:::`,
  },
  {
    id: 'pat-str-facade-vs-adapter',
    question: 'Facade vs Adapter — both give clients a different interface. What is the actual difference?',
    difficulty: 'Medium',
    category: 'Structural',
    tags: ['facade', 'adapter', 'comparison'],
    answer: `The difference is **who defines the target interface and why**:

| | Adapter | Facade |
|--|--|--|
| Target interface | **Already exists** — a contract the client requires | **Invented** — a new, simpler API |
| Wraps | Usually one adaptee | A whole subsystem of classes |
| Driving force | *Compatibility* — make it fit | *Convenience* — make it easy |
| Client expectation | Client can't change; adaptee must conform | Client is happy to use the new interface |

**Adapter** answers "this component doesn't match the socket I must plug into." **Facade** answers "these ten classes are too painful to orchestrate at every call site."

One-liner for interviews: **Adapter makes it fit; Facade makes it easy.**

:::tip
They stack: a Facade over a legacy subsystem often *contains* Adapters that normalize individual legacy classes.
:::`,
  },
  {
    id: 'pat-str-implement-decorator',
    question: 'Implement a timing/logging decorator for a UserRepository interface without touching the implementation. What are the essential ingredients?',
    difficulty: 'Medium',
    category: 'Structural',
    tags: ['decorator', 'implementation', 'aop'],
    answer: `Three ingredients: a **shared interface**, a wrapper that **implements it and holds a delegate**, and behaviour added **around the delegation**:

\`\`\`java
class TimedUserRepository implements UserRepository {
  private final UserRepository delegate;          // has-a
  private final MeterRegistry metrics;

  TimedUserRepository(UserRepository d, MeterRegistry m) {
    this.delegate = d; this.metrics = m;
  }

  @Override public Optional<User> findById(long id) {
    long t0 = System.nanoTime();
    try {
      return delegate.findById(id);               // delegate...
    } finally {                                    // ...and add behaviour
      metrics.timer("repo.findById").record(System.nanoTime() - t0, NANOSECONDS);
    }
  }
}
\`\`\`

Wiring composes features without touching \`JpaUserRepository\`:

\`\`\`java
UserRepository repo = new TimedUserRepository(new LoggingUserRepository(jpaRepo), metrics);
\`\`\`

:::senior
A hand-rolled decorator is **AOP for one interface**. When you need the same wrapper across *many* interfaces, graduate to a JDK dynamic proxy or Spring AOP — same pattern, generic implementation.
:::`,
  },
  {
    id: 'pat-str-collections-wrappers',
    question: 'Collections.unmodifiableList and Collections.synchronizedList — which pattern are these wrappers?',
    difficulty: 'Medium',
    category: 'Structural',
    tags: ['decorator', 'proxy', 'collections'],
    answer: `Both are **same-interface wrappers** around an existing \`List\` — the JDK's "wrapper collections." The precise label is worth debating out loud:

- **\`synchronizedList\`** — adds locking behaviour around every call: cleanly a **Decorator**.
- **\`unmodifiableList\`** — *restricts* access (mutators throw) rather than adding capability: intent-wise closer to a **protection Proxy**, though most sources file it under Decorator.

Interviewers reward the reasoning more than the label: same interface + delegation = the Decorator/Proxy family; whether behaviour is *added* or *gated* decides which name fits.

:::gotcha
\`unmodifiableList\` is a **view, not a copy** — mutate the underlying list and the "unmodifiable" one changes too. For true immutability use \`List.copyOf(list)\`. And \`synchronizedList\` only locks individual calls — **iteration still needs manual synchronization** on the wrapper.
:::`,
  },
  {
    id: 'pat-str-arrays-aslist',
    question: 'What exactly does Arrays.asList return, and which pattern explains its odd behavior?',
    difficulty: 'Medium',
    category: 'Structural',
    tags: ['adapter', 'arrays-aslist', 'jdk-gotchas'],
    answer: `It returns an **Adapter**: a fixed-size \`List\` *view* over the array — the private class \`java.util.Arrays$ArrayList\`, **not** \`java.util.ArrayList\`. The array is adapted to the \`List\` interface without copying, which explains every quirk:

\`\`\`java
String[] arr = {"a", "b"};
List<String> view = Arrays.asList(arr);
view.set(0, "z");        // OK — writes through to arr[0]!
view.add("c");           // UnsupportedOperationException — arrays can't grow
\`\`\`

- \`set\` works (arrays support assignment) and **writes through** to the array.
- \`add\`/\`remove\` throw — an array's size is fixed, so the adapter can't honour them.

:::gotcha
Two classic traps: \`Arrays.asList(intArray)\` with a primitive array yields a \`List<int[]>\` of size 1 (varargs boxing of the whole array); and \`List.of(...)\` differs — fully immutable (\`set\` also throws), rejects \`null\`, no write-through.
:::`,
  },
  {
    id: 'pat-str-servlet-request-wrapper',
    question: 'What are HttpServletRequestWrapper and HttpServletResponseWrapper for, and which pattern do they implement?',
    difficulty: 'Medium',
    category: 'Structural',
    tags: ['decorator', 'servlet', 'spring'],
    answer: `They are **Decorator base classes shipped by the Servlet API itself**: each implements the full request/response interface by delegating every method to the wrapped object, so you subclass and override only what you change.

Classic uses inside a \`Filter\`:

- **Cache the request body** so it can be read twice (the raw stream is one-shot) — for request logging or signature verification.
- **Sanitize or enrich parameters/headers** before they reach controllers.
- **Capture the response** to compress, audit, or rewrite it.

\`\`\`java
class CachedBodyRequest extends HttpServletRequestWrapper {
  private final byte[] body;
  CachedBodyRequest(HttpServletRequest req) throws IOException {
    super(req);
    body = req.getInputStream().readAllBytes();
  }
  @Override public ServletInputStream getInputStream() { /* stream over body */ }
}
// in the filter:
chain.doFilter(new CachedBodyRequest(request), response); // pass the WRAPPER on
\`\`\`

:::gotcha
The wrapper only works if you **pass it down the chain** — passing the original request forward is the classic silent bug.
:::`,
  },
  {
    id: 'pat-str-string-pool-flyweight',
    question: 'How do the String pool and String.intern() relate to the Flyweight pattern?',
    difficulty: 'Medium',
    category: 'Structural',
    tags: ['flyweight', 'string-pool', 'memory'],
    answer: `The String pool **is a Flyweight factory**: every distinct string literal is stored once, and all code referencing that literal shares the same instance. \`intern()\` is the explicit ask-the-factory call — return the pooled instance, adding it first if needed.

\`\`\`java
String a = "config";
String b = "config";
a == b;                        // true — same pooled flyweight
new String("config") == a;     // false — explicit new bypasses the pool
new String("config").intern() == a; // true — back to the shared instance
\`\`\`

The flyweight precondition holds because **String is immutable** — sharing a mutable object across the whole JVM would be catastrophic.

Modern details worth knowing: the pool lives on the **heap** (since JDK 7), and G1's \`-XX:+UseStringDeduplication\` is a *different* mechanism (deduplicates backing arrays at GC time, not references).

:::gotcha
Don't sprinkle \`intern()\` as an "optimization" — it adds hashing cost and pool pressure; equal-string-heavy workloads are better served by deduplication or domain-level caching.
:::`,
  },
  {
    id: 'pat-str-composite-implementation',
    question: 'Implement a file-system Composite — File and Directory with a uniform size(). What design choices come up?',
    difficulty: 'Medium',
    category: 'Structural',
    tags: ['composite', 'implementation', 'sealed'],
    answer: `Modern Java makes the pattern tiny:

\`\`\`java
sealed interface FsNode permits FileNode, DirNode {
  long size();
}
record FileNode(String name, long size) implements FsNode {}

record DirNode(String name, List<FsNode> children) implements FsNode {
  public long size() {                       // recursion does the tree walk
    return children.stream().mapToLong(FsNode::size).sum();
  }
}

FsNode root = new DirNode("/", List.of(
    new FileNode("a.txt", 120),
    new DirNode("docs", List.of(new FileNode("b.pdf", 900)))));
root.size(); // 1020 — client never asks "file or dir?"
\`\`\`

Design choices to mention:

- **Where do \`add\`/\`remove\` live?** On the interface (*transparent*, but leaves must throw) or only on \`DirNode\` (*safe*, needs casts).
- **Parent links & cycles** — a back-pointer helps navigation but risks cycles; validate on insert.
- **Caching aggregates** — memoize \`size()\` for big trees, invalidate on mutation (or stay immutable and rebuild).`,
  },
  {
    id: 'pat-str-decorator-order',
    question: 'Does the order in which you stack decorators matter? Show a java.io example where it does.',
    difficulty: 'Hard',
    category: 'Structural',
    tags: ['decorator', 'java.io', 'composition-order'],
    answer: `Yes — decorators compose like functions, and **function composition is not commutative**.

**Example 1 — compression + encryption.** Data flows outermost → innermost when writing:

\`\`\`java
// RIGHT: compress the plaintext, then encrypt the (smaller) result
new GZIPOutputStream(new CipherOutputStream(fileOut, cipher));

// WRONG: encrypting first produces high-entropy bytes that gzip CANNOT compress
new CipherOutputStream(new GZIPOutputStream(fileOut), cipher);
\`\`\`

Encrypted bytes look random, so compressing *after* encryption saves ~nothing. Order changes the outcome, not just performance.

**Example 2 — buffering placement.** \`new GZIPOutputStream(new BufferedOutputStream(fileOut))\` batches the small compressed writes hitting the disk; buffering *outside* gzip instead batches your writes into the deflater but leaves disk writes unbatched.

**Consequences:**

- Reading must **mirror** the write stack in reverse — decrypt before decompress.
- A checksum decorator measures whatever layer it wraps — inside gzip checks plaintext, outside checks compressed bytes.

:::senior
Because stacking order is a correctness concern, production code centralizes it in one factory method rather than letting each call site improvise the stack.
:::`,
  },
  {
    id: 'pat-str-cglib-vs-jdk-proxy',
    question: 'JDK dynamic proxies vs CGLIB — how does each work, and what constraints do Spring developers actually hit?',
    difficulty: 'Hard',
    category: 'Structural',
    tags: ['proxy', 'cglib', 'spring-aop'],
    answer: `| | JDK dynamic proxy | CGLIB |
|--|--|--|
| Mechanism | Generates a class implementing your **interfaces**; calls route through \`InvocationHandler\` | Generates a **subclass** of your concrete class at runtime, overriding methods |
| Requires | At least one interface | Non-final class, accessible constructor |
| Proxy *is-a* | The interface(s) — it extends \`java.lang.reflect.Proxy\`, so it can never be your class | Your class (subtype) |

Constraints that bite in real Spring code:

- **JDK proxy + concrete-type injection fails**: if \`OrderServiceImpl\` is proxied by interface, \`@Autowired OrderServiceImpl\` can't be satisfied — the proxy is only an \`OrderService\`. (Spring Boot defaults to CGLIB — \`proxyTargetClass=true\` — partly to avoid this.)
- **CGLIB cannot override \`final\`**: final classes can't be proxied at all, and **final methods are silently not intercepted** — \`@Transactional\` on a final method just doesn't run, with no error.
- \`private\` methods are invisible to both.
- Modern Spring creates CGLIB proxies via **Objenesis**, so your constructor isn't re-invoked for the proxy instance.

:::gotcha
"Why is my \`@Transactional\`/\`@Cacheable\` ignored?" — check for final methods, self-invocation, or a concrete-class injection mismatch before anything else.
:::`,
  },
  {
    id: 'pat-str-flyweight-memory-math',
    question: 'You are rendering a document with 10 million characters. Walk through the memory math that justifies — or rejects — a Flyweight.',
    difficulty: 'Hard',
    category: 'Structural',
    tags: ['flyweight', 'memory', 'estimation'],
    answer: `**Naive design:** one \`Glyph\` object per character — say a 16-byte header plus char, font reference, size, style, x, y ≈ **48 bytes**. 10M × 48B ≈ **480 MB**. Dead on arrival.

**Flyweight split:**

- *Intrinsic* (shared): char code, font, style → one immutable \`Glyph\` per distinct (char, font, style) — typically a few hundred instances. Negligible.
- *Extrinsic* (per occurrence): position — passed by the renderer or stored as **parallel primitive arrays**: two \`int[10_000_000]\` ≈ **80 MB**, plus 10M glyph *references* (~40–80 MB) if you keep them, or ~zero if positions are computed during layout.

Result: **hundreds of MB → tens of MB**, roughly an order of magnitude.

**When to reject it:** if extrinsic state dominates (every object is mostly unique data), sharing saves little and you've added factory lookups and indirection for nothing. Flyweight only pays when *intrinsic ≫ extrinsic* across huge object counts.

:::senior
Real editors go further: no object per character at all — ropes/gap buffers over \`char\` arrays. Flyweight is often a waypoint to the deeper insight that **structs-of-arrays beat objects-per-item** at this scale.
:::`,
  },
  {
    id: 'pat-str-decorator-drawbacks',
    question: 'What are the real drawbacks of the Decorator pattern that interviews rarely mention?',
    difficulty: 'Hard',
    category: 'Structural',
    tags: ['decorator', 'trade-offs', 'identity'],
    answer: `The pattern's costs, from most to least painful:

1. **Identity loss** — the wrapper is a *different object*: \`decorated.equals(original)\` and \`==\` comparisons fail, deduplication sets treat them as distinct, and un-registering a wrapped listener with the unwrapped reference silently no-ops.
2. **Type opacity** — clients can no longer reach subtype-specific methods; \`instanceof FileInputStream\` probing through wrapper layers is a smell that the abstraction leaked.
3. **The forgotten-forward bug** — a decorator must forward *every* method. When the interface later gains a method (even a \`default\` one), hand-written wrappers silently fall back to default/broken behaviour. Guava's \`ForwardingList\` exists precisely to centralize forwarding.
4. **Debugging depth** — stack traces traverse N wrapper frames; stepping through five layers to find real logic wears teams down.
5. **Order sensitivity** — stacks like gzip/cipher/buffer have correctness-relevant ordering that the type system doesn't enforce.

Mitigations: keep decorated interfaces **small and stable**, provide a forwarding base class, and build canonical stacks in one factory.

:::senior
Naming drawback #1 (identity) is a reliable senior signal — it is the one that causes production bugs.
:::`,
  },
];

export default questions;
