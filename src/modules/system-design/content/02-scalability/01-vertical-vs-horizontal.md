---
title: Vertical vs Horizontal Scaling
category: Scalability
categoryOrder: 2
order: 1
level: Beginner
summary: Scale up (bigger box) vs scale out (more boxes) — the trade-offs, the ceiling, and when each is the right first move.
tags: scalability, vertical scaling, horizontal scaling, scale up, scale out
---

Your service is slowing down under load. You have two levers: make the **one machine bigger**
(scale *up*), or **add more machines** (scale *out*). Almost every scalability decision in an
interview starts here, and the "senior" answer is knowing *why* real systems eventually pick out.

## The two directions

```mermaid
flowchart LR
  subgraph V["Vertical — scale UP"]
    direction TB
    S1["4 CPU / 16 GB"] -->|"replace with bigger box"| S2["32 CPU / 256 GB"]
    S2 -->|"replace again"| S3["96 CPU / 1 TB — ceiling"]
  end
  subgraph H["Horizontal — scale OUT"]
    direction TB
    LB[Load Balancer] --> H1[Server 1]
    LB --> H2[Server 2]
    LB --> H3[Server 3]
    LB --> HN["Server N — keep adding"]
  end
  V -->|"at the ceiling or needing HA"| H
```

- **Vertical (scale up):** replace the box with a beefier one — more CPU, RAM, faster disk.
  Same architecture, one node.
- **Horizontal (scale out):** put many commodity boxes behind a load balancer and spread the
  work across them.

## The core trade-off

| | Vertical (scale up) | Horizontal (scale out) |
|--|--|--|
| **How** | Bigger single machine | More machines behind a load balancer |
| **Ceiling** | Hard limit — biggest box you can buy | Effectively unbounded — keep adding nodes |
| **Cost curve** | Super-linear (top-end hardware is pricey) | Roughly linear (commodity hardware) |
| **Fault tolerance** | Poor — one box is a single point of failure | Good — lose a node, the rest carry on |
| **Complexity** | Low — no app changes needed | Higher — needs LB, statelessness, coordination |
| **Downtime to grow** | Usually a reboot/migration | Add nodes live, zero downtime |
| **Data consistency** | Trivial — one node, one copy | Harder — distributed state |

:::key
**Vertical is simpler; horizontal is more resilient and effectively limitless.** Vertical hits a
hard hardware ceiling and keeps the single point of failure. Horizontal is how you reach true
web scale — but only if the service can run as many identical, independent copies.
:::

## When to use each

:::tip
**Start vertical, plan horizontal.** Scaling up is the fastest fix and needs no code changes, so
it is the right *first* move. But design so you *can* scale out later — that mostly means keeping
your app servers **stateless** (see the next topics).
:::

- **Reach for vertical when:** load is modest and growing slowly; the workload is hard to
  distribute (e.g. a single relational primary that needs one consistent view); you need a quick
  win with no re-architecture.
- **Reach for horizontal when:** you need high availability (no single box you can't afford to
  lose); traffic exceeds any single machine; or you want to scale cheaply on commodity hardware.

:::senior
The real reason large systems go horizontal is **availability, not just throughput.** A single
maxed-out server is still one power supply, one kernel panic away from a full outage. Ten smaller
servers behind a load balancer survive losing one. "Scale out" is as much a reliability decision
as a performance one.
:::

## Put numbers on the ceiling

The cost argument is concrete, not hand-wavy:

| Machine | Spec | Rough cloud cost |
|--|--|--|
| Commodity VM | 4 vCPU / 16 GB | ~$0.20/hr |
| 2x the VM | 8 vCPU / 32 GB | ~$0.40/hr — linear so far |
| Large box | 96 vCPU / 768 GB | ~$5/hr |
| Biggest money can buy | ~448 vCPU / 24 TB RAM | ~$100+/hr — and there is **nothing bigger at any price** |

At the low end doubling is roughly linear; near the top you pay a premium for exotic hardware, and past the top the option simply doesn't exist. Ten commodity VMs cost about the same as one 10x box **and** survive a node loss.

**Real-world anchors to cite:** Stack Overflow famously served all of its traffic for years on a handful of very large SQL Server + IIS boxes — proof vertical goes further than people assume when the workload is cache-friendly. Google and Amazon went the other way: fleets of commodity machines where failure is expected and routed around. WhatsApp did both: few servers, but each tuned to hold ~2M concurrent connections.

## What breaks first at 10x traffic

The interviewer's favorite follow-up. Typical order of collapse for a single-box architecture:

1. **CPU saturates** on the app tier → request queueing, p99 explodes long before p50 moves.
2. **Database connections** run out (each app instance holds a pool; Postgres defaults to ~100 max connections).
3. **Working set outgrows RAM** → the DB starts hitting disk, latency jumps ~100x (100 µs SSD vs ~100 ns RAM per access).
4. Only then, usually, raw disk/network bandwidth.

Scaling up resets these limits once; scaling out lets you keep resetting the app-tier limits — but pushes the problem down to the shared database, which is why the next topics (statelessness, then database scaling) exist.

:::gotcha
Horizontal scaling only works if requests don't depend on *which* node handles them. A server that
stores session data in local memory **cannot** be safely scaled out — the next request may land on
a different node that has never seen the user. Statelessness is the prerequisite.
:::

## Check yourself

```quiz
title: Scaling direction check
questions:
  - q: 'What is the fundamental limitation of vertical scaling?'
    options:
      - text: 'A hard hardware ceiling — you can only buy so big a machine'
        correct: true
      - 'It requires a load balancer'
      - 'It cannot use SSDs'
    explain: 'Vertical scaling is bounded by the largest single machine available, and cost rises super-linearly near the top. Horizontal scaling has no such ceiling.'
  - q: 'Beyond raw throughput, the biggest reason large systems scale horizontally is:'
    options:
      - 'Cheaper RAM'
      - text: 'Availability — surviving the loss of any single node'
        correct: true
      - 'Simpler code'
    explain: 'Many independent nodes behind a load balancer tolerate a node failure; one big box is a single point of failure.'
  - q: 'What must be true of an app server before you can safely scale it out horizontally?'
    options:
      - 'It must use a relational database'
      - text: 'It must be stateless — no request should depend on which node handles it'
        correct: true
      - 'It must run on the largest available instance'
    explain: 'If a server keeps per-user state in local memory, a follow-up request routed to a different node breaks. Statelessness is the prerequisite for scaling out.'
```
