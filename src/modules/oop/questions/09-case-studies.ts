import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'oop-lld-elevator-strategy',
    question: 'In an elevator-system design, how would you make the car-scheduling policy swappable?',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['lld', 'strategy', 'elevator'],
    answer: `Model it as a **Strategy**: a \`SchedulingStrategy\` interface with \`selectElevator(cars, request)\`, and concrete policies (\`NearestCarStrategy\`, \`ScanStrategy\`, \`EnergySavingStrategy\`). The dispatcher depends on the interface and is **injected** a policy.

\`\`\`java
interface SchedulingStrategy { Elevator selectElevator(List<Elevator> cars, Request r); }
\`\`\`

This is **Open/Closed** — a new policy is a new class, and the dispatcher never changes. Keep each car's targets in a sorted set (\`TreeSet\`) so a moving car can serve same-direction requests in SCAN order.`,
  },
  {
    id: 'oop-lld-elevator-state',
    question: 'Why model an elevator car with the State pattern instead of a mode flag and a switch?',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['lld', 'state', 'elevator'],
    answer: `Because behavior is **mode-dependent** and modes have their own transitions. With State, each of \`IdleState\`, \`MovingState\`, \`DoorsOpenState\` owns its \`next()\` logic; adding a mode (e.g. \`MaintenanceState\`) is a new class that doesn't touch the others.

A \`switch (mode)\` centralizes every mode's logic in one method, so every new mode re-opens and risks breaking existing branches — the opposite of Open/Closed.`,
  },
  {
    id: 'oop-lld-lru-two-structures',
    question: 'Design an LRU cache with O(1) get and put. What structures and why?',
    difficulty: 'Hard',
    category: 'OOP Design',
    tags: ['lld', 'lru', 'data-structures'],
    answer: `Compose **two** structures:

- a **HashMap** \`key → node\` for O(1) lookup, and
- a **doubly-linked list** ordered by recency (most-recent at head, LRU at tail) for O(1) reordering and eviction.

On \`get\`/\`put\`, splice the node to the head; when over capacity, drop the tail node and remove its key from **both** structures. Dummy head/tail **sentinels** remove null-checks at the ends.

:::gotcha
A doubly-linked (not singly-linked) list is required: removing a middle node in O(1) needs the \`prev\` pointer.
:::

Production shortcut: \`LinkedHashMap(cap, 0.75f, true)\` with \`removeEldestEntry\` overridden does access-order LRU out of the box.`,
  },
  {
    id: 'oop-lld-lru-evict-bug',
    question: 'What is the classic bug when implementing eviction in an LRU cache?',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['lld', 'lru', 'bugs'],
    answer: `Unlinking the tail node from the linked list but **forgetting to remove its key from the HashMap**. The map then holds a dangling entry — a memory leak, and a later \`get\` on that key returns a stale node that's no longer in the list. Always evict from **both** structures atomically.`,
  },
  {
    id: 'oop-lld-atm-state',
    question: 'Which design pattern anchors an ATM design, and how do the states work?',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['lld', 'state', 'atm'],
    answer: `The **State pattern**. The \`ATM\` context holds a current \`ATMState\`; each state (\`IdleState\`, \`CardInsertedState\`, \`AuthenticatedState\`, \`DispensingState\`) implements the same interface but honors only its **legal** operations — \`selectWithdraw()\` throws (or is a no-op) until you reach \`AuthenticatedState\`.

Transitions live inside the states (\`enterPin\` on success calls \`atm.setState(new AuthenticatedState())\`), replacing a tangle of \`hasCard\`/\`isAuthenticated\` boolean guards. New states are new classes (OCP).`,
  },
  {
    id: 'oop-lld-atm-dispenser',
    question: 'How would you dispense a withdrawal across multiple note denominations?',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['lld', 'chain-of-responsibility', 'atm'],
    answer: `**Chain of Responsibility.** Each denomination has a handler (₂₀ → ₁₀ → ₅); a handler dispenses as many of its notes as fit, then passes the **remainder** to the next handler in the chain. The chain ends when the remainder is zero (or fails if it can't be made). This keeps each denomination's logic isolated and the order explicit.`,
  },
  {
    id: 'oop-lld-ratelimiter-strategy',
    question: 'Design a rate limiter. What are the main algorithms and how do you keep them swappable?',
    difficulty: 'Hard',
    category: 'OOP Design',
    tags: ['lld', 'strategy', 'rate-limiter'],
    answer: `Hide them behind a \`RateLimiter\` interface (\`boolean allow(clientId)\`) — a **Strategy** — with implementations:

| Algorithm | Trade-off |
|--|--|
| Fixed window | O(1), but 2× burst at window borders |
| Sliding window log | exact, O(N) memory |
| Sliding window counter | O(1), smooth, approximate |
| **Token bucket** | O(1), allows controlled bursts (common default) |
| Leaky bucket | smooths output, adds latency |

Token bucket refills lazily from elapsed time and spends one token per request. Swapping the algorithm is a new class; callers (the gateway) depend only on the interface.`,
  },
  {
    id: 'oop-lld-ratelimiter-thread-safety',
    question: 'What concurrency concern arises in a token-bucket rate limiter, and how do you handle it?',
    difficulty: 'Hard',
    category: 'OOP Design',
    tags: ['lld', 'concurrency', 'rate-limiter'],
    answer: `\`allow()\` is a **read-modify-write** on the bucket's token count (refill, check, decrement). Without synchronization, two threads can both see a token and both proceed, admitting more than the limit.

Fix by locking **per client bucket** (or using atomic operations), not one global lock — so different clients don't serialize against each other:

\`\`\`java
synchronized (bucket) { refill(bucket); if (bucket.tokens >= 1) { bucket.tokens--; return true; } return false; }
\`\`\`

In the distributed case the same atomicity must hold across machines — typically a Redis Lua script or atomic \`INCR\` + TTL.`,
  },
  {
    id: 'oop-lld-deck-of-cards',
    question: 'Design a deck of cards.',
    difficulty: 'Easy',
    category: 'OOP Design',
    tags: ['lld', 'deck-of-cards', 'enums'],
    answer: `**Requirements:** 52 cards, shuffle, deal, reusable across card games.

**Core entities:**
- \`Suit\` (enum: HEARTS, DIAMONDS, CLUBS, SPADES)
- \`Rank\` (enum: TWO … ACE, each with a numeric value)
- \`Card\` — an **immutable value object** = \`Suit\` + \`Rank\`
- \`Deck\` — holds \`List<Card>\` and a deal pointer

\`\`\`java
record Card(Suit suit, Rank rank) {}
class Deck {
  private final List<Card> cards = new ArrayList<>();
  Deck() { for (Suit s : Suit.values()) for (Rank r : Rank.values()) cards.add(new Card(s, r)); }
  void shuffle() { Collections.shuffle(cards); }
  Card deal()    { return cards.remove(cards.size() - 1); }
}
\`\`\`

**Relationships:** \`Deck\` **composes** 52 \`Card\`s; each \`Card\` **has-a** \`Suit\` and \`Rank\`.

**Extensibility:** a \`Hand\`/\`Game\` layers on top; add Jokers via a flag or extra \`Rank\`; enums make the full deck a two-line nested loop.

:::tip
Cards are immutable value objects; the \`Deck\` owns the *ordering and dealing state*.
:::`,
  },
  {
    id: 'oop-lld-library',
    question: 'Design a library management system.',
    difficulty: 'Easy',
    category: 'OOP Design',
    tags: ['lld', 'library', 'modeling'],
    answer: `**Requirements:** catalog books, members borrow/return copies, track availability, due dates, fines.

**Core entities:**
- \`Book\` — metadata (title, author, ISBN)
- \`BookCopy\` — a *physical* copy (barcode, status) — **one \`Book\` has many copies**
- \`Member\` — who borrows
- \`Loan\` — links a \`BookCopy\` + \`Member\` + due/return dates
- \`Catalog\` — search by title/author/ISBN

**Relationships:** \`Book\` 1—* \`BookCopy\`; \`Member\` 1—* \`Loan\`; \`Loan\` references one copy + one member.

**Key methods:** \`catalog.search()\`, \`member.checkout(copy)\`, \`returnItem(copy)\`, \`fineStrategy.calculate(loan)\`.

**Extensibility:** \`FineStrategy\` for varying fine rules; a \`LibraryItem\` abstraction to add DVDs/magazines; a reservation queue.

:::gotcha
The modelling insight interviewers reward: separate **\`Book\`** (abstract metadata) from **\`BookCopy\`** (the borrowable physical item). Availability and loans attach to *copies*, not the title.
:::`,
  },
  {
    id: 'oop-lld-vending-machine',
    question: 'Design a vending machine.',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['lld', 'state', 'vending-machine'],
    answer: `**Requirements:** show items, accept money, dispense product + change, handle sold-out, allow cancel/refund.

**Anchor pattern — State:** the machine moves through states, each honouring only its legal operations.

**Core entities:**
- \`VendingMachine\` (context) — holds current \`State\`, \`Inventory\`, collected balance
- \`State\` interface — \`IdleState\`, \`HasMoneyState\`, \`DispensingState\`, \`SoldOutState\` with \`insertMoney()\`/\`selectProduct()\`/\`dispense()\`
- \`Product\`, \`Slot\`, \`Inventory\` (stock counts)

**Relationships:** machine **has-a** current \`State\` (swappable), **has-a** \`Inventory\` of \`Slot\`s; each \`Slot\` holds a \`Product\`.

**Key methods:** \`insertCoin()\`, \`selectProduct(code)\`, \`dispense()\`, \`refund()\` — each delegated to the current state, which decides the transition.

**Extensibility:** card payment behind a \`Payment\` interface; a \`MaintenanceState\` is a new class (OCP); change-making as a strategy.

:::key
State replaces a tangle of \`hasMoney\`/\`isDispensing\` booleans — transitions live *inside* the states, so adding one never re-opens the others.
:::`,
  },
  {
    id: 'oop-lld-shopping-cart',
    question: 'Design an e-commerce shopping cart.',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['lld', 'shopping-cart', 'strategy'],
    answer: `**Requirements:** add/remove items with quantities, compute totals, apply discounts/coupons, check out.

**Core entities:**
- \`Product\` (id, name, price)
- \`CartItem\` (\`Product\` + quantity → line total)
- \`Cart\` (\`List<CartItem>\`)
- \`DiscountStrategy\` (percentage, BOGO, coupon) — **Strategy**
- \`Order\` — created at checkout

**Relationships:** \`Cart\` 1—* \`CartItem\`; \`CartItem\` *—1 \`Product\`; \`Cart\` has a chain of \`DiscountStrategy\`.

**Key methods:** \`cart.addItem(product, qty)\`, \`updateQty\`, \`cart.total()\` (sum lines, then apply the discount chain), \`checkout()\` → \`Order\`.

**Extensibility:** discounts as pluggable **Strategy/Decorator** so promotions compose without editing \`Cart\` (OCP); an inventory check at checkout.

:::gotcha
Never store money as \`double\` — floating-point rounding corrupts totals. Use \`BigDecimal\` or integer **cents** (\`long\`).
:::`,
  },
  {
    id: 'oop-lld-hotel-booking',
    question: 'Design a hotel booking system.',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['lld', 'hotel-booking', 'concurrency'],
    answer: `**Requirements:** search rooms by date range and type, book, check-in/out, cancel, price, and never double-book.

**Core entities:**
- \`Hotel\`, \`Room\` (number + \`RoomType\`), \`RoomType\` (SINGLE/DELUXE/SUITE with a rate)
- \`Reservation\` (\`Room\`, \`Guest\`, date range, status)
- \`Guest\`, \`Payment\`
- \`BookingService\`, \`SearchService\`

**Relationships:** \`Hotel\` 1—* \`Room\`; \`Room\` 1—* \`Reservation\` (across time); \`Reservation\` links a room + guest.

**Key methods:** \`search(range, type)\`, \`book(room, guest, range)\`, \`cancel(res)\`, \`checkIn/checkOut\`. **Availability** = no *overlapping confirmed* reservation for that room.

**Extensibility:** \`PricingStrategy\` (seasonal/dynamic); \`RoomType\` extensible; a reservation-lifecycle **State**.

:::gotcha
The real difficulty is the **overlap check under concurrency**: two guests booking the same room at once. Guard it with a transaction/lock or a unique DB constraint on \`(room, dateRange)\` — otherwise you double-book.
:::`,
  },
  {
    id: 'oop-lld-logger',
    question: 'Design a logging framework.',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['lld', 'logger', 'chain-of-responsibility'],
    answer: `**Requirements:** log at levels (DEBUG/INFO/WARN/ERROR), send to multiple destinations, format messages, filter by level, stay extensible.

**Core entities:**
- \`LogLevel\` (ordered enum)
- \`LogMessage\` (level, text, timestamp)
- \`Logger\` (threshold level + \`log(level, msg)\`)
- \`Appender\` interface (\`ConsoleAppender\`, \`FileAppender\`) — **where** output goes
- \`Formatter\` — a **Strategy** for layout

**Patterns:** Strategy (appenders/formatters), optional **Chain of Responsibility** (level handlers), and a \`LoggerFactory\` (facade/singleton-scoped).

**Relationships:** \`Logger\` has-many \`Appender\`; each \`Appender\` has-a \`Formatter\`.

**Key methods:** \`logger.info(msg)\` → if \`level >= threshold\`, build a \`LogMessage\` and dispatch to every appender.

**Extensibility:** a new destination = a new \`Appender\` (OCP); async logging via a queue **Decorator**; per-package levels.

:::tip
**SLF4J** is the real-world model: a stable facade (\`Logger\`) plus a swappable backend (appenders/bindings).
:::`,
  },
  {
    id: 'oop-lld-notification-system',
    question: 'Design a notification system (email, SMS, push).',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['lld', 'notification', 'strategy'],
    answer: `**Requirements:** send a notification over one or more channels, honour user preferences, render templates, retry failures, add channels easily.

**Core entities:**
- \`NotificationChannel\` interface (\`EmailChannel\`, \`SmsChannel\`, \`PushChannel\`) — **Strategy/polymorphism**
- \`Notification\` (recipient, content, channels)
- \`ChannelFactory\` — pick a channel by type
- \`NotificationService\` — orchestrates
- \`UserPreferences\`, \`Template\`

**Patterns:** Strategy (channels), Factory (create channel), Observer (subscribe to events), Decorator (retry / rate-limit wrapper).

**Relationships:** \`NotificationService\` has-many \`Channel\`; a \`Notification\` is sent via one or more channels.

**Key methods:** \`service.send(user, message)\` → resolve preferred channels → \`channel.send()\` for each.

**Extensibility:** a new channel (WhatsApp) = implement the interface and register it in the factory (OCP); retries via a Decorator; a queue for async throughput.

:::key
One \`Channel\` interface + a factory is exactly what turns "add WhatsApp" into a **single new class**, not a rewrite.
:::`,
  },
  {
    id: 'oop-lld-movie-ticket-booking',
    question: 'Design a movie ticket booking system (BookMyShow).',
    difficulty: 'Medium',
    category: 'OOP Design',
    tags: ['lld', 'movie-booking', 'concurrency'],
    answer: `**Requirements:** browse movies/shows by city and theatre, view a seat map, book seats, pay, and prevent double-booking.

**Core entities:**
- \`Movie\`, \`Cinema\`, \`Screen\`, \`Show\` (a movie on a screen at a time)
- \`Seat\`, \`ShowSeat\` (a seat *for a specific show*, status AVAILABLE/LOCKED/BOOKED)
- \`Booking\` (show, seats, user, status), \`Payment\`, \`User\`

**Relationships:** \`Cinema\` 1—* \`Screen\`; \`Screen\` 1—* \`Show\`; \`Show\` 1—* \`ShowSeat\`; \`Booking\` references \`ShowSeat\`s.

**Key methods:** \`search(city, movie)\`, \`getSeatMap(show)\`, \`lockSeats(seats)\` (temporary hold), \`confirm(payment)\` → BOOKED, release on timeout.

**Extensibility:** \`PricingStrategy\` (seat class, peak hours); payment behind an interface.

:::gotcha
The core challenge is **concurrency**: two users grabbing the same seat. Model the seat as a state machine **AVAILABLE → LOCKED → BOOKED** with an expiring lock (optimistic/pessimistic locking, or a unique constraint on \`(show, seat)\`).
:::`,
  },
  {
    id: 'oop-lld-parking-lot',
    question: 'Design a parking lot — walk through the full class model.',
    difficulty: 'Hard',
    category: 'OOP Design',
    tags: ['lld', 'parking-lot', 'ocp'],
    answer: `**Requirements:** multi-level lot; vehicle types (motorcycle/car/bus); spot sizes (small/compact/large); assign the nearest fitting spot; ticket on entry, fee on exit; report availability.

**Core entities:**
- \`ParkingLot\` → \`Level\` → \`ParkingSpot\` (with \`size\`, \`isAvailable\`, \`fits(vehicle)\`)
- \`Vehicle\` (abstract: \`Motorcycle\`/\`Car\`/\`Bus\`, each with a size)
- \`Ticket\` (spot, vehicle, entry time)
- \`SpotAssignmentStrategy\`, \`FeeStrategy\`

**Relationships:** \`Lot\` 1—* \`Level\` 1—* \`Spot\`; \`Ticket\` links \`Vehicle\` + \`Spot\`; a \`Vehicle\` **fits** certain spot sizes (a bus may need a large/multiple spots).

**Key methods:** \`park(vehicle)\` → find a spot via the strategy, issue a \`Ticket\`; \`unpark(ticket)\` → free the spot, \`feeStrategy.calculate()\`.

**Extensibility:** new vehicle/spot type via the hierarchy or an enum; assignment and pricing as strategies; an EV-charging spot as a subtype. Guard spot assignment under concurrency.

:::senior
The OCP test interviewers apply: adding an **electric car** or a **new fee model** must not edit existing classes — subclasses/strategies/enums should absorb the change.
:::`,
  },
  {
    id: 'oop-lld-chess',
    question: 'Design a chess game.',
    difficulty: 'Hard',
    category: 'OOP Design',
    tags: ['lld', 'chess', 'polymorphism'],
    answer: `**Requirements:** 8×8 board, six piece types with distinct moves, turn-taking, move validation, capture, check/checkmate.

**Core entities:**
- \`Board\` (8×8 grid of \`Cell\`s), \`Cell\` (position + optional \`Piece\`)
- \`Piece\` (abstract: \`King\`/\`Queen\`/\`Rook\`/\`Bishop\`/\`Knight\`/\`Pawn\`) — each **overrides** \`canMove(board, from, to)\`
- \`Player\` (colour, pieces), \`Move\` (from, to, piece, captured), \`Game\` (board, players, turn, status)

**Relationships:** \`Board\` 1—* \`Cell\`; \`Cell\` 0..1 \`Piece\`; the \`Piece\` **is-a** hierarchy; \`Game\` has two \`Player\`s, a \`Board\`, and a move history.

**Key methods:** \`game.makeMove(from, to)\` → validate turn + \`piece.canMove(...)\` + "doesn't leave own king in check" → apply; \`isCheck()\`, \`isCheckmate()\`.

**Extensibility:** each piece's rules live in its subclass (a variant = a new subclass, OCP); Strategy for an AI opponent; Command/Memento for undo; special moves (castling, en passant) handled in the piece/move logic.

:::key
The \`Piece\` hierarchy overriding \`canMove\` is textbook **polymorphism** — it replaces a giant \`switch (pieceType)\` in the move validator.
:::`,
  },
  {
    id: 'oop-lld-file-system',
    question: 'Design an in-memory file system.',
    difficulty: 'Hard',
    category: 'OOP Design',
    tags: ['lld', 'file-system', 'composite'],
    answer: `**Requirements:** files and directories, arbitrary nesting, size, path lookup, create/delete/move, list children.

**Anchor pattern — Composite:** treat files and directories uniformly through one interface.

**Core entities:**
- \`FileSystemNode\` (abstract: \`name\`, \`size()\`, \`parent\`) — the **Component**
- \`File\` — the **leaf** (content; \`size\` = content length)
- \`Directory\` — the **composite** (\`List<FileSystemNode>\` children; \`size\` = sum of children)

\`\`\`java
sealed interface Node permits File, Directory { int size(); }
record File(String name, int bytes) implements Node { public int size() { return bytes; } }
final class Directory implements Node {           // holds Files AND Directories → tree
  private final List<Node> children = new ArrayList<>();
  public int size() { return children.stream().mapToInt(Node::size).sum(); }  // recurse
}
\`\`\`

**Relationships:** \`Directory\` **composes** children (each a \`File\` or \`Directory\`) via self-reference → a tree.

**Key methods:** \`add\`/\`remove\`, \`size()\` (recursive), \`findByPath("/a/b.txt")\` (walk segments), \`list()\`.

**Extensibility:** symlinks/permissions as new node types; a **Visitor** to run search/du without editing nodes; an **Iterator** for traversal.

:::key
\`File\` and \`Directory\` sharing one recursive \`Node\` interface *is* the Composite pattern — its canonical example.
:::`,
  },
  {
    id: 'oop-lld-splitwise',
    question: 'Design Splitwise (shared expense tracking).',
    difficulty: 'Hard',
    category: 'OOP Design',
    tags: ['lld', 'splitwise', 'strategy'],
    answer: `**Requirements:** users and groups; add an expense paid by someone and split among members (equal / exact / percentage); track who owes whom; settle up.

**Core entities:**
- \`User\`, \`Group\` (members)
- \`Expense\` (amount, \`paidBy\`, \`List<Split>\`, \`SplitStrategy\`)
- \`Split\` (user + amount owed); \`SplitStrategy\` → \`EqualSplit\`, \`ExactSplit\`, \`PercentSplit\`
- \`BalanceSheet\` — directional ledger \`Map<UserPair, amount>\`

**Relationships:** \`Group\` 1—* \`User\`; \`Expense\` has-a \`paidBy\` user + many \`Split\`s; each \`Split\` *—1 \`User\`.

**Key methods:** \`addExpense(paidBy, amount, participants, strategy)\` → \`strategy.computeSplits()\` → update balances (creditor +, each debtor −); \`getBalances(user)\`; \`settleUp(a, b)\`.

**Extensibility:** a new split type = a new \`SplitStrategy\` (OCP); a **debt-simplification** service to minimise transactions; multi-currency support.

:::gotcha
Validate that splits **sum exactly** to the expense — the classic edge case is rounding a 3-way split of 100 (33.33 × 3 ≠ 100). Store balances as **directional net-owed per pair**, not a single number.
:::`,
  },
];

export default questions;
