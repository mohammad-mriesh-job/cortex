---
title: The System-Design Cheat Sheet
category: Interview Framework
categoryOrder: 10
order: 4
level: All
summary: The numbers and mappings to know cold — latency figures, availability nines, which component for which need, and a patterns checklist.
tags: system design, cheatsheet, latency numbers, availability, reference
---

The reference you review the night before. Internalize the **latency numbers** and the
**component-to-need mapping** — quoting them fluently is a strong senior signal.

## Latency numbers every engineer should know

Orders of magnitude matter more than exact figures. The story: **memory is ~100x faster than
SSD, SSD ~100x faster than network round-trips across regions.**

| Operation | Time | Relative |
|--|--|--|
| L1 cache reference | ~1 ns | 1x |
| Main memory (RAM) reference | ~100 ns | 100x |
| Read 1 MB sequentially from RAM | ~10 µs | — |
| SSD random read | ~100 µs | ~1,000x RAM |
| Read 1 MB from SSD | ~1 ms | — |
| Network round-trip within a datacenter | ~500 µs | — |
| Disk (HDD) seek | ~10 ms | — |
| Round-trip CA ↔ Netherlands | ~150 ms | ~1M x memory |

:::note
The takeaway is not the exact nanoseconds — it is the **ratios**. RAM ≫ SSD ≫ disk ≫ cross-region
network. This is *why* caching in memory and keeping data close to users pays off so much.
:::

## Availability: the nines

Availability is measured in "nines." Each extra nine is ~10x less downtime — and roughly an
order of magnitude more engineering effort (replication, failover, multi-region).

| Availability | Downtime/year | Downtime/day | Typical use |
|--|--|--|--|
| 99% ("two nines") | ~3.65 days | ~14 min | Internal tools |
| 99.9% ("three nines") | ~8.75 hours | ~86 sec | Standard SaaS |
| 99.99% ("four nines") | ~52 min | ~8.6 sec | Serious production |
| 99.999% ("five nines") | ~5 min | ~0.86 sec | Telecom, payments |

## Which component for which need

The core interview reflex: hear a need, name the component.

| When you need… | Reach for… |
|--|--|
| Absorb read traffic / cut latency | **Cache** (Redis, Memcached) |
| Serve static assets/media near users | **CDN** |
| Spread traffic across servers | **Load balancer** |
| Decouple producers from consumers, smooth spikes | **Message queue** (Kafka, SQS) |
| ACID transactions, relational data | **SQL** (Postgres, MySQL) |
| Massive scale, flexible schema, simple access | **NoSQL** (Cassandra, DynamoDB) |
| Store large files/images/video | **Object store** (S3) |
| Full-text search | **Search index** (Elasticsearch) |
| More read capacity | **Read replicas** |
| Store more than one machine holds | **Sharding / partitioning** |
| Fast key lookups for "does X exist?" at scale | **Bloom filter** |

## Numbers to know

```flashcards
title: Numbers to know cold
cards:
  - front: 'Seconds in a day (for QPS math)'
    back: '**~100,000** (86,400 rounded to 10^5).'
  - front: 'Main memory reference vs SSD random read'
    back: '**~100 ns** vs **~100 µs** — SSD is ~1,000x slower.'
  - front: 'Cross-country (CA to Europe) round trip'
    back: '**~150 ms** — dominates the request budget; keep data close to users.'
  - front: 'Downtime for 99.99% ("four nines") per year'
    back: '**~52 minutes/year** (~8.6 sec/day).'
  - front: 'Base62 with 7 characters gives how many keys?'
    back: '62^7 ≈ **3.5 trillion** — enough for a URL shortener.'
  - front: 'Typical read:write ratio for a social/feed system'
    back: 'Roughly **100:1** — heavily read-dominated, so cache.'
  - front: '1 byte, 1 KB, 1 MB, 1 GB, 1 TB'
    back: 'Powers of ~1,000. A char ~1 byte; a small record ~hundreds of bytes.'
```

## Patterns checklist

Scan this before you say "I'm done." Have you considered…

- **Load balancer** in front of every stateless tier?
- **Cache** on the hot read path (and an eviction/TTL policy)?
- **CDN** for static and media content?
- **Replication** for durability and read scaling?
- **Sharding** if data or write throughput exceeds one node?
- **Message queue** to decouple and absorb spikes?
- **Rate limiting** to protect against abuse and overload?
- **Monitoring / alerting** — how do you know it's healthy?
- **Single points of failure** — what has no redundancy?
- **Failure modes** — what happens when the cache or a shard dies?

:::senior
When asked "how would you scale this further?", walk the checklist top to bottom out loud. It
turns a scary open-ended question into a structured tour and shows breadth without rambling.
:::

## Recap quiz

```quiz
title: Cheat-sheet recall
questions:
  - q: 'Roughly how much slower is an SSD random read than a main-memory reference?'
    options:
      - 'About 10x'
      - text: 'About 1,000x (~100 µs vs ~100 ns)'
        correct: true
      - 'About the same'
    explain: 'Main memory is ~100 ns; an SSD random read is ~100 µs — about three orders of magnitude slower. This gap is exactly why in-memory caching is so valuable.'
  - q: 'A service promises 99.99% availability. Roughly how much downtime per year is that?'
    options:
      - 'About 8.75 hours'
      - text: 'About 52 minutes'
        correct: true
      - 'About 5 minutes'
    explain: 'Four nines ≈ 52 minutes/year. Three nines (99.9%) ≈ 8.75 hours; five nines (99.999%) ≈ 5 minutes.'
  - q: 'You need to decouple a burst of incoming events from slower downstream processing. Which component?'
    options:
      - 'A CDN'
      - text: 'A message queue'
        correct: true
      - 'A read replica'
    explain: 'A message queue (Kafka, SQS) buffers producers from consumers, smoothing spikes and letting downstream services process at their own pace.'
```

:::key
Know the **ratios** (RAM ≫ SSD ≫ disk ≫ cross-region), the **nines** (four nines ≈ 52 min/year),
and the **need → component** map. Before finishing, walk the **patterns checklist**: LB, cache,
CDN, replication, sharding, queue, rate limiting, monitoring, and single points of failure.
:::
