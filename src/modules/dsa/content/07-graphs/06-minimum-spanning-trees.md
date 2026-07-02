---
title: Minimum Spanning Trees
category: Graphs
categoryOrder: 7
order: 6
level: Advanced
summary: Connect every vertex at minimum total edge weight — Kruskal (sort edges + union-find) and Prim (grow a tree with a min-heap), both greedy algorithms justified by the cut property.
tags: mst, kruskal, prim, union-find, greedy, cut property, spanning tree
---

A **spanning tree** of a connected graph touches every vertex using exactly `V - 1` edges and no cycles. The **minimum** spanning tree (MST) is the one with the smallest total edge weight — the cheapest way to wire up a network, lay cable, or cluster points. Two greedy algorithms find it, both justified by one theorem.

## The cut property — why greedy works

> For any way of splitting the vertices into two groups (a **cut**), the **minimum-weight edge crossing that cut** belongs to some MST.

That's the license to be greedy: repeatedly grab the smallest safe edge and you can never regret it. Kruskal and Prim are just two orders of applying it.

```mermaid
flowchart LR
  subgraph A[Set A]
    a1((1)); a2((2))
  end
  subgraph B[Set B]
    b1((3)); b2((4))
  end
  a1 ---|"7"| b1
  a2 ---|"3 (min crossing → in MST)"| b2
```

## Kruskal — sort edges, union components

Sort all edges ascending; add each edge **unless it would form a cycle** (its endpoints are already connected). A [union-find](/dsa/topic/graphs/topological-sort-and-union-find) structure answers "same component?" in near-O(1).

```java
edges.sort(Comparator.comparingInt(e -> e.weight));
DSU dsu = new DSU(V);
int total = 0, used = 0;
for (Edge e : edges) {
    if (dsu.union(e.u, e.v)) {           // union returns false if already joined
        total += e.weight;
        if (++used == V - 1) break;      // tree complete
    }
}
```

- **Time O(E log E)** — dominated by the sort.
- Naturally handles a graph given as an **edge list**; great for **sparse** graphs.

## Prim — grow one tree

Start from any vertex and repeatedly pull the **cheapest edge leaving the tree** into it, using a min-heap keyed on edge weight.

```java
boolean[] inTree = new boolean[V];
PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]); // {vertex, weight}
pq.add(new int[]{0, 0});
int total = 0;
while (!pq.isEmpty()) {
    int[] top = pq.poll();
    int u = top[0];
    if (inTree[u]) continue;             // stale heap entry — skip
    inTree[u] = true;
    total += top[1];
    for (int[] nbr : adj.get(u))         // {neighbor, weight}
        if (!inTree[nbr[0]]) pq.add(new int[]{nbr[0], nbr[1]});
}
```

- **Time O(E log V)** with a binary heap; O(E + V log V) with a Fibonacci heap.
- Works from an **adjacency list**; often preferred on **dense** graphs.

## Which to reach for

| | Kruskal | Prim |
|--|--|--|
| Idea | globally sort edges, union safe ones | grow one tree by cheapest exit |
| Needs | union-find | min-heap |
| Input shape | edge list | adjacency list |
| Best on | sparse graphs | dense graphs |
| Time | O(E log E) | O(E log V) |

:::senior
Both are greedy and both are correct by the cut property — interviewers love asking *why* greedy is safe here (it isn't for, say, shortest paths with negative edges). Also know the boundary: MST minimizes **total** weight, **not** path lengths between pairs — for that you want Dijkstra/Bellman-Ford. And on a graph with equal edge weights, any BFS tree is already minimal.
:::

## Check yourself

```quiz
title: MST check
questions:
  - q: 'The cut property guarantees that:'
    options:
      - text: 'The minimum-weight edge crossing any cut is in some MST'
        correct: true
      - 'The maximum-weight edge is never in the MST'
      - 'Every MST is unique'
    explain: 'The cut property is what makes the greedy choice safe. (The max-weight-edge claim is the related cycle property, and if all edge weights are distinct, the MST is unique.)'
  - q: 'Kruskal uses union-find in order to:'
    options:
      - 'Sort the edges'
      - text: 'Detect whether adding an edge would create a cycle (endpoints already connected)'
        correct: true
      - 'Compute shortest paths'
    explain: 'An edge is safe to add only if its endpoints are in different components; union-find answers that and merges them in near-constant time.'
  - q: 'Which algorithm is most natural when the graph is given as a sorted-friendly edge list and is sparse?'
    options:
      - text: 'Kruskal'
        correct: true
      - 'Prim'
      - 'Dijkstra'
    explain: 'Kruskal sorts edges and unions components — a perfect fit for an edge list. Prim grows from an adjacency list and tends to win on dense graphs.'
```

:::key
An **MST** connects all `V` vertices with `V-1` edges at minimum total weight. Both algorithms are greedy, licensed by the **cut property** (min edge across any cut is safe). **Kruskal** = sort edges + union-find, O(E log E), sparse/edge-list. **Prim** = grow a tree with a min-heap, O(E log V), dense/adjacency-list. MST minimizes total weight — not pairwise path distances.
:::
