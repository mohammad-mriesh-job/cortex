---
title: Requirements & Estimation
category: Interview Framework
categoryOrder: 10
order: 2
level: All
summary: Separate functional from non-functional requirements, then turn assumptions into QPS, storage, and bandwidth with back-of-envelope math.
tags: system design, requirements, estimation, capacity planning, back of envelope
---

The first ten minutes decide the rest of the interview. Two skills: **asking the right
clarifying questions**, and **converting the answers into numbers** that drive every later
decision. Skipping either is a classic red flag.

## Functional vs non-functional

Split every requirement into two buckets out loud. **Functional** = what the system *does*.
**Non-functional** = the *qualities* it must have. Non-functional requirements are the ones that
actually shape the architecture.

| Functional (features) | Non-functional (qualities) |
|--|--|
| "Users can post a tweet" | Low latency (p99 < 200ms) |
| "Followers see it in their feed" | High availability (99.99%) |
| "Users can search tweets" | Scalable to 100M DAU |
| "Upload an image with a post" | Durable (never lose a post) |
| — | Consistency model (eventual is fine for feeds) |

:::senior
Non-functional requirements are where the interesting engineering lives. *"Feed can be eventually
consistent, but the follow/unfollow action must be read-your-writes"* is the kind of nuance that
reveals senior judgment. Always pin down **consistency, latency, and availability** targets.
:::

## The clarifying-questions checklist

Ask these before drawing anything. Each answer removes ambiguity and often changes the design.

| Category | Questions to ask | Why it matters |
|--|--|--|
| **Scope** | Which features are in scope? MVP vs full? | Prevents boiling the ocean |
| **Scale** | How many users? DAU? Reads vs writes? | Drives all capacity math |
| **Read/write mix** | Read-heavy or write-heavy? | Cache vs shard-writes decision |
| **Consistency** | Is stale data acceptable? For how long? | CAP trade-off, sync vs async |
| **Latency** | What p99 is acceptable? | CDN, cache, geo-replication |
| **Data** | Object size? Retention period? Media? | Storage estimate, blob store |
| **Availability** | Downtime tolerance? | Replication, multi-region |

:::tip
You do not need answers to *all* of these — pick the 3-4 that most affect *this* design and state
your assumptions for the rest: *"I'll assume 100M DAU and read-heavy unless you'd like different
numbers."* Stating assumptions is as valuable as asking.
:::

## Worked estimation: a Twitter-scale feed

The chain is always the same: **users → QPS → storage → bandwidth**. Round aggressively — the
interviewer wants order-of-magnitude reasoning, not a spreadsheet.

```walkthrough
title: DAU to QPS to storage to bandwidth
code: |
  DAU              = 200,000,000
  tweets/user/day  = 2            -> writes/day
  read : write     = 100 : 1      -> reads/day
  seconds/day      ~ 100,000      (86,400 rounded)
  tweet size       = 300 bytes    (text + metadata)
  retention        = 5 years
steps:
  - text: 'Start with Daily Active Users — the anchor for everything else. 200M DAU.'
    line: 1
  - text: 'Writes: 200M users x 2 tweets = 400M writes/day.'
    line: 2
  - text: 'Write QPS = 400M / 100,000s ~ 4,000 writes/sec. Round the day to 10^5 seconds for easy division.'
    line: 4
  - text: 'Reads are 100x writes -> 40B reads/day -> ~400,000 reads/sec. This is read-heavy: cache the feed.'
    line: 3
  - text: 'Storage/day = 400M writes x 300 bytes = 120 GB/day.'
    line: 5
  - text: 'Over 5 years: 120 GB x 365 x 5 ~ 220 TB of tweet text. Media (images/video) dwarfs this -> object store + CDN.'
    line: 6
  - text: 'Read bandwidth = 400K reads/sec x 300 bytes ~ 120 MB/sec egress. Multiply by media to justify a CDN.'
    line: 5
```

### The result, at a glance

| Metric | Value | Design implication |
|--|--|--|
| Write QPS | ~4,000/sec | Manageable on a sharded DB |
| Read QPS | ~400,000/sec | **Cache aggressively**; read replicas |
| Storage (5yr, text) | ~220 TB | Shard the data store |
| Read bandwidth | ~120 MB/sec | **CDN** for media, edge caching |

:::note
Memorize the shortcut: **1 day ≈ 100,000 seconds** (86,400 rounded up). It makes every
"per-day → per-second" conversion a one-step division you can do in your head.
:::

## Check yourself

```quiz
title: Requirements & estimation check
questions:
  - q: 'Which of these is a NON-functional requirement?'
    options:
      - 'Users can upload a profile photo'
      - text: 'The feed loads in under 200ms at p99'
        correct: true
      - 'Users can follow other users'
    explain: 'Latency targets describe a quality of the system, not a feature. Non-functional requirements (latency, availability, consistency, scale) are what shape the architecture.'
  - q: 'You estimate 400M writes/day. Roughly what is the write QPS?'
    options:
      - '~40 writes/sec'
      - text: '~4,000 writes/sec'
        correct: true
      - '~40,000 writes/sec'
    explain: 'A day is ~100,000 seconds (86,400 rounded). 400,000,000 / 100,000 = 4,000 writes/sec. Rounding the day to 10^5 makes this a one-step division.'
  - q: 'Your estimate shows a 100:1 read-to-write ratio. What does that push you toward?'
    options:
      - 'Sharding all writes first'
      - text: 'Aggressive caching and read replicas on the read path'
        correct: true
      - 'A strongly consistent relational database with joins'
    explain: 'A read-heavy workload means reads dominate cost and latency. A cache plus read replicas absorbs the bulk of traffic; writes are comparatively rare.'
```

:::key
Split requirements into **functional (features)** vs **non-functional (latency, availability,
consistency, scale)**. Then walk **DAU → QPS → storage → bandwidth**, rounding a day to **10^5
seconds**. The numbers directly justify caches, shards, replicas, and CDNs.
:::
