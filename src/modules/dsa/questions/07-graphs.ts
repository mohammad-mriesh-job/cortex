import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'dsa-graph-list-vs-matrix',
    question: 'When would you use an adjacency list vs an adjacency matrix?',
    difficulty: 'Easy',
    category: 'Graphs',
    tags: ['representation', 'adjacency-list', 'adjacency-matrix'],
    answer: `It comes down to **density** and what you query most.

| | Adjacency list | Adjacency matrix |
|--|:--:|:--:|
| Space | **O(V + E)** | O(V²) |
| Check edge \`u–v\` | O(degree) | **O(1)** |
| Iterate u's neighbors | **O(degree)** | O(V) |

- **Adjacency list** — the default. Best for **sparse** graphs (E ≪ V²) and any algorithm that iterates neighbors (BFS, DFS, Dijkstra).
- **Adjacency matrix** — use for **dense** graphs, or when you need constant-time "is there an edge?" checks.

:::tip
Real-world graphs (road networks, social graphs) are almost always sparse, so the adjacency list wins in practice.
:::`,
  },
  {
    id: 'dsa-graph-bfs-vs-dfs',
    question: 'What is the difference between BFS and DFS, and when do you pick each?',
    difficulty: 'Easy',
    category: 'Graphs',
    tags: ['bfs', 'dfs', 'traversal'],
    answer: `Both visit every vertex in **O(V + E)**; they differ in *order* and in the data structure that drives them.

- **BFS** uses a **queue (FIFO)** and explores **layer by layer** — nearest vertices first.
- **DFS** uses a **stack (LIFO)** — usually recursion — and dives **deep** down one branch before backtracking.

**Pick BFS** for the shortest path in an **unweighted** graph, or "nearest" style problems.
**Pick DFS** for structural questions: connected components, cycle detection, topological sort, and "does a path exist?".

\`\`\`text
BFS from A:  A, B, C, D, E, F   (wide)
DFS from A:  A, B, D, C, E, F   (deep)
\`\`\``,
  },
  {
    id: 'dsa-graph-bfs-shortest-path',
    question: 'Why does BFS find the shortest path in an unweighted graph, and why does it fail once edges are weighted?',
    difficulty: 'Medium',
    category: 'Graphs',
    tags: ['bfs', 'shortest-path', 'unweighted'],
    answer: `BFS expands vertices in **increasing order of edge-distance** from the source. Because it processes all vertices at distance \`k\` before any at distance \`k+1\`, the **first time** it reaches a vertex is necessarily via a path with the fewest edges — that path is optimal.

That guarantee assumes **every edge costs the same** (implicitly 1). Once edges carry different weights, "fewest edges" is no longer "cheapest": a 2-edge path can cost more than a 5-edge path. A plain FIFO queue no longer visits vertices in cost order.

:::key
Weighted graph, non-negative weights → **Dijkstra** (a priority queue instead of a plain queue). BFS is simply Dijkstra's special case where all weights equal 1.
:::`,
  },
  {
    id: 'dsa-graph-mark-on-enqueue',
    question: 'In BFS, should you mark a vertex visited when you enqueue it or when you dequeue it?',
    difficulty: 'Medium',
    category: 'Graphs',
    tags: ['bfs', 'queue', 'correctness'],
    answer: `Mark it **when you enqueue** it.

If you wait until dequeue, a vertex reachable from several already-queued vertices gets **enqueued multiple times** before it is ever processed. That:

- inflates the queue and breaks the O(V + E) bound, and
- can record a **wrong distance** (a later, longer path might overwrite the first).

\`\`\`java
if (dist[nb] == -1) {      // unvisited
  dist[nb] = dist[v] + 1;
  q.add(nb);               // mark by setting dist here, before enqueue
}
\`\`\`

Setting \`dist[nb]\` (or a \`visited\` flag) at the moment of enqueue guarantees each vertex enters the queue exactly once.`,
  },
  {
    id: 'dsa-graph-connected-components',
    question: 'How do you count the number of connected components in an undirected graph?',
    difficulty: 'Medium',
    category: 'Graphs',
    tags: ['dfs', 'bfs', 'connected-components'],
    answer: `Loop over every vertex. Each time you find an **unvisited** one, launch a fresh DFS/BFS from it (which floods its entire component) and increment a counter. Each launch discovers exactly one component.

\`\`\`java
int components = 0;
boolean[] seen = new boolean[V];
for (int v = 0; v < V; v++) {
  if (!seen[v]) {
    components++;
    dfs(v, seen);   // marks the whole component seen
  }
}
\`\`\`

Runs in **O(V + E)**. **Union-Find** solves the same problem incrementally: union every edge's endpoints, then count distinct roots.`,
  },
  {
    id: 'dsa-graph-cycle-detection',
    question: 'How does cycle detection differ between undirected and directed graphs with DFS?',
    difficulty: 'Hard',
    category: 'Graphs',
    tags: ['dfs', 'cycle-detection'],
    answer: `The rule depends on the graph type:

**Undirected:** during DFS, if you reach an already-visited neighbor that is **not the vertex you came from (the parent)**, you have found a cycle. (You must ignore the immediate parent, since the edge back to it is not a real cycle.)

**Directed:** track three states per vertex —
- **white** = unvisited,
- **gray** = on the current recursion stack (in progress),
- **black** = fully finished.

An edge to a **gray** vertex is a **back edge** → cycle. An edge to a black vertex is fine.

\`\`\`java
boolean dfs(int u) {           // directed
  state[u] = GRAY;
  for (int v : adj.get(u)) {
    if (state[v] == GRAY) return true;          // back edge -> cycle
    if (state[v] == WHITE && dfs(v)) return true;
  }
  state[u] = BLACK;
  return false;
}
\`\`\`

:::gotcha
Using a plain "visited" set for a directed graph gives false positives — a vertex reached by two separate forward paths is not a cycle. You need the gray/in-progress distinction.
:::`,
  },
  {
    id: 'dsa-graph-dijkstra-negative',
    question: 'Why can Dijkstra not handle negative edge weights?',
    difficulty: 'Hard',
    category: 'Graphs',
    tags: ['dijkstra', 'shortest-path', 'negative-weights'],
    answer: `Dijkstra is **greedy**: the moment it pops a vertex from the priority queue it declares that vertex's distance **final** and never revisits it. That is valid only when weights are **non-negative** — extending any path can only make it longer, so the closest unfinalized vertex can never be improved later.

A **negative edge** breaks the assumption: a path discovered *after* a vertex is finalized could reach it more cheaply, but Dijkstra will never reconsider it — so it silently returns a wrong answer.

\`\`\`text
A --1--> B --(-5)--> C
A --2--> C
\`\`\`
Dijkstra may finalize C at cost 2 via the direct edge, missing the cheaper A→B→C = 1 + (−5) = −4.

Use **Bellman-Ford** (O(V·E)) for negative edges; it also **detects negative cycles**.`,
  },
  {
    id: 'dsa-graph-dijkstra-complexity',
    question: 'What is the time complexity of Dijkstra with a binary heap, and where does each factor come from?',
    difficulty: 'Medium',
    category: 'Graphs',
    tags: ['dijkstra', 'complexity', 'priority-queue'],
    answer: `**O((V + E) log V)** with a binary-heap priority queue.

- Each vertex is finalized (popped) once → up to **V** \`poll\` operations, each O(log V).
- Each edge can trigger one relaxation and a heap **push** → up to **E** pushes, each O(log V).

Together: O((V + E) log V). With a **Fibonacci heap** it drops to O(E + V log V) in theory, but the constant factors make it rarely worth it in practice.

:::note
A common implementation uses **lazy deletion** — leave stale entries in the heap and skip them with \`if (d > dist[u]) continue;\`. Simpler than decrease-key and keeps the same complexity.
:::`,
  },
  {
    id: 'dsa-graph-dijkstra-vs-bellman',
    question: 'Dijkstra vs Bellman-Ford — how do you choose?',
    difficulty: 'Medium',
    category: 'Graphs',
    tags: ['dijkstra', 'bellman-ford', 'shortest-path'],
    answer: `| | Dijkstra | Bellman-Ford |
|--|--|--|
| Weights | Non-negative only | Any, including negative |
| Time | O((V + E) log V) | O(V · E) |
| Negative cycle | Cannot handle | **Detects** it |

- **Non-negative weights and you want speed** → Dijkstra.
- **Some edges are negative**, or you must **detect a negative cycle** → Bellman-Ford.
- **Unweighted** → don't use either; plain **BFS** gives shortest paths in O(V + E).
- **DAG** (any weights) → relax edges in **topological order** in O(V + E), beating both.`,
  },
  {
    id: 'dsa-graph-topological-sort',
    question: 'Explain Kahn algorithm for topological sort and how it detects a cycle.',
    difficulty: 'Medium',
    category: 'Graphs',
    tags: ['topological-sort', 'kahn', 'dag'],
    answer: `Kahn's algorithm orders a **DAG** using **in-degrees** (how many edges point into each vertex):

1. Compute every vertex's in-degree.
2. Queue all vertices with in-degree **0** (no prerequisites).
3. Repeatedly poll a vertex, append it to the order, and decrement each neighbor's in-degree; any neighbor that hits 0 gets enqueued.

\`\`\`java
Queue<Integer> q = new ArrayDeque<>();
for (int v = 0; v < V; v++) if (indeg[v] == 0) q.add(v);
List<Integer> order = new ArrayList<>();
while (!q.isEmpty()) {
  int u = q.poll(); order.add(u);
  for (int nb : adj.get(u))
    if (--indeg[nb] == 0) q.add(nb);
}
\`\`\`

**Cycle detection:** if \`order.size() < V\`, some vertices never reached in-degree 0 — they sit in a cycle, so **no topological order exists**. Runs in **O(V + E)**.`,
  },
  {
    id: 'dsa-graph-union-find',
    question: 'What are the two operations of Union-Find, and how do path compression and union by rank speed it up?',
    difficulty: 'Hard',
    category: 'Graphs',
    tags: ['union-find', 'dsu', 'path-compression'],
    answer: `Union-Find (Disjoint Set Union) maintains a partition into disjoint sets:

- **\`find(x)\`** — return the **root** representing x's set.
- **\`union(a, b)\`** — merge the two sets by pointing one root at the other.

Two elements are connected **iff** \`find(a) == find(b)\`.

Two optimizations make each op nearly O(1):

- **Path compression** — during \`find\`, re-point every node on the path directly at the root, flattening the tree for future queries.
- **Union by rank/size** — always attach the shorter tree under the taller one, keeping trees shallow.

\`\`\`java
int find(int x) {
  if (parent[x] != x) parent[x] = find(parent[x]); // compress
  return parent[x];
}
\`\`\`

Together they give **O(α(n))** amortized per operation — inverse Ackermann, effectively constant. It also detects an undirected cycle: if \`find(u) == find(v)\` before uniting an edge's endpoints, that edge closes a cycle (the basis of **Kruskal's MST**).`,
  },
  {
    id: 'dsa-graph-grid-as-graph',
    question: 'How do you model a 2D grid (e.g. islands, maze) as a graph for BFS/DFS?',
    difficulty: 'Medium',
    category: 'Graphs',
    tags: ['bfs', 'dfs', 'grid', 'implicit-graph'],
    answer: `Treat each **cell** \`(r, c)\` as a vertex and its valid **4- (or 8-) directional neighbors** as edges — an *implicit* graph, so you never build an adjacency list explicitly.

\`\`\`java
int[][] DIRS = {{1,0},{-1,0},{0,1},{0,-1}};
void bfs(int sr, int sc) {
  Queue<int[]> q = new ArrayDeque<>();
  q.add(new int[]{sr, sc}); seen[sr][sc] = true;
  while (!q.isEmpty()) {
    int[] cur = q.poll();
    for (int[] d : DIRS) {
      int nr = cur[0] + d[0], nc = cur[1] + d[1];
      if (nr >= 0 && nr < R && nc >= 0 && nc < C
          && !seen[nr][nc] && grid[nr][nc] == '1') {
        seen[nr][nc] = true;
        q.add(new int[]{nr, nc});
      }
    }
  }
}
\`\`\`

**Bounds-check** before visiting, mark cells seen on enqueue, and it runs in **O(R·C)**. This one pattern solves "number of islands", flood fill, shortest path in a maze, and rotting-oranges style problems.`,
  },
];

export default questions;
