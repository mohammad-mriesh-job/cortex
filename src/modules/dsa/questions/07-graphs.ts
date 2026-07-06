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
  {
    id: 'dsa-graph-implicit-graph',
    question: 'What is an implicit graph, and when do you avoid building an adjacency list?',
    difficulty: 'Easy',
    category: 'Graphs',
    tags: ['implicit-graph', 'grid', 'modeling'],
    answer: `An **implicit graph** is one whose vertices and edges are **defined by a rule** rather than stored explicitly. You generate neighbours **on the fly** instead of precomputing an adjacency list.

Common cases:
- **Grids** — a cell's neighbours are its 4 (or 8) adjacent cells.
- **State-space search** — each puzzle configuration is a vertex; a legal move is an edge (word ladder, sliding puzzle, lock combinations).
- **Number transformations** — e.g. reachable integers via ±1 or ×2.

\`\`\`java
// grid neighbours computed, not stored
int[][] DIRS = {{1,0},{-1,0},{0,1},{0,-1}};
for (int[] d : DIRS) { int nr = r + d[0], nc = c + d[1]; /* bounds-check */ }
\`\`\`

:::tip
Building an adjacency list for a million-cell grid would waste time and memory. If neighbours follow a formula, generate them inline — the same BFS/DFS logic applies unchanged.
:::`,
  },
  {
    id: 'dsa-graph-flood-fill',
    question: 'How does flood fill work (the "paint bucket" tool)?',
    difficulty: 'Easy',
    category: 'Graphs',
    tags: ['dfs', 'bfs', 'grid', 'flood-fill'],
    answer: `Flood fill recolors a connected region of same-colored cells. Run **DFS/BFS** from the start cell, spreading to 4-directional neighbours that still hold the **original** color.

\`\`\`java
void fill(int[][] g, int r, int c, int old, int neu) {
  if (r < 0 || r >= g.length || c < 0 || c >= g[0].length) return;
  if (g[r][c] != old) return;             // wall / different color
  g[r][c] = neu;                           // recolor (also marks visited)
  fill(g, r+1, c, old, neu); fill(g, r-1, c, old, neu);
  fill(g, r, c+1, old, neu); fill(g, r, c-1, old, neu);
}
\`\`\`

**O(R·C)** — each cell recolored once. Recoloring **is** the "visited" mark, so no separate seen array is needed.

:::gotcha
Guard \`old == neu\` before starting, or the recursion never terminates (a cell already the new color is indistinguishable from a fresh one, causing infinite spread).
:::`,
  },
  {
    id: 'dsa-graph-num-islands',
    question: 'How do you count the number of islands in a grid of land and water?',
    difficulty: 'Medium',
    category: 'Graphs',
    tags: ['dfs', 'bfs', 'grid', 'connected-components'],
    answer: `An island is a **connected component** of land cells. Scan every cell; each time you hit **unvisited land**, launch a DFS/BFS that sinks (marks) the whole island, and increment the count.

\`\`\`java
int count = 0;
for (int r = 0; r < R; r++)
  for (int c = 0; c < C; c++)
    if (grid[r][c] == '1') { count++; sink(grid, r, c); }

void sink(char[][] g, int r, int c) {
  if (r < 0 || r >= R || c < 0 || c >= C || g[r][c] != '1') return;
  g[r][c] = '0';                     // mark visited by sinking
  sink(g, r+1, c); sink(g, r-1, c); sink(g, r, c+1); sink(g, r, c-1);
}
\`\`\`

**O(R·C)** — each cell visited a constant number of times. This is "count connected components" on an implicit grid graph; the same scaffold solves max-area-of-island and surrounded-regions.

:::note
Sinking mutates the input. If you must preserve it, use a separate \`visited\` matrix or a union-find over land cells instead.
:::`,
  },
  {
    id: 'dsa-graph-multi-source-bfs',
    question: 'How do you find the time for all oranges to rot (multi-source BFS)?',
    difficulty: 'Medium',
    category: 'Graphs',
    tags: ['bfs', 'multi-source', 'grid'],
    answer: `When many sources spread **simultaneously**, seed the BFS queue with **all** of them at once and expand level by level; the number of levels is the answer.

\`\`\`java
Queue<int[]> q = new ArrayDeque<>();
int fresh = 0;
for (int r = 0; r < R; r++)
  for (int c = 0; c < C; c++)
    if (grid[r][c] == 2) q.add(new int[]{r, c});   // all rotten sources
    else if (grid[r][c] == 1) fresh++;

int minutes = 0;
while (!q.isEmpty() && fresh > 0) {
  minutes++;
  for (int i = q.size(); i > 0; i--) {             // one minute = one level
    int[] cell = q.poll();
    // for each fresh neighbour: rot it, fresh--, enqueue
  }
}
return fresh == 0 ? minutes : -1;                   // -1 if any stay fresh
\`\`\`

**O(R·C).** Seeding every source at level 0 makes BFS expand as a single unified wavefront — equivalent to adding a virtual super-source connected to all sources.

:::senior
Multi-source BFS gives the **shortest distance to the nearest source** for every cell in one pass (e.g. "distance to nearest 0", "walls and gates"). Don't run BFS separately per source.
:::`,
  },
  {
    id: 'dsa-graph-clone-graph',
    question: 'How do you deep-copy an arbitrary connected graph?',
    difficulty: 'Medium',
    category: 'Graphs',
    tags: ['bfs', 'dfs', 'clone', 'hash-map'],
    answer: `Traverse the graph while keeping a **map from original node to its clone**. The map both **prevents revisiting** (cycles) and lets you wire up edges to already-created clones.

\`\`\`java
Map<Node,Node> clones = new HashMap<>();
Node clone(Node node) {
  if (node == null) return null;
  if (clones.containsKey(node)) return clones.get(node); // already copied
  Node copy = new Node(node.val);
  clones.put(node, copy);                                 // record BEFORE recursing
  for (Node nb : node.neighbors)
    copy.neighbors.add(clone(nb));
  return copy;
}
\`\`\`

**O(V + E) time and space.**

:::gotcha
Put the clone in the map **before** recursing into neighbours. In a cyclic graph a neighbour may point back at \`node\`; without the early registration you'd recurse forever.
:::`,
  },
  {
    id: 'dsa-graph-course-schedule',
    question: 'Given course prerequisites, can all courses be finished (course schedule)?',
    difficulty: 'Medium',
    category: 'Graphs',
    tags: ['topological-sort', 'cycle-detection', 'dag'],
    answer: `Courses are a directed graph; you can finish them **iff there is no cycle** (no circular prerequisite). This is a topological-sort feasibility check — **Kahn's algorithm** answers it directly.

\`\`\`java
int[] indeg = new int[n];
for (int[] p : prereqs) indeg[p[0]]++;          // p[0] depends on p[1]
Queue<Integer> q = new ArrayDeque<>();
for (int i = 0; i < n; i++) if (indeg[i] == 0) q.add(i);
int done = 0;
while (!q.isEmpty()) {
  int u = q.poll(); done++;
  for (int v : adj.get(u)) if (--indeg[v] == 0) q.add(v);
}
return done == n;      // all scheduled → acyclic
\`\`\`

If \`done < n\`, the leftover courses form a **cycle** and can never reach in-degree 0. **O(V + E).**

:::note
The follow-up "return an actual valid order" just collects the polled vertices — Kahn's output *is* a topological ordering. A DFS with gray/black coloring detects the cycle equivalently.
:::`,
  },
  {
    id: 'dsa-graph-topo-dfs',
    question: 'How do you produce a topological order using DFS instead of Kahn\'s algorithm?',
    difficulty: 'Medium',
    category: 'Graphs',
    tags: ['topological-sort', 'dfs', 'postorder'],
    answer: `Run DFS and **push each vertex onto a stack when it finishes** (post-order). The **reversed** finish order is a valid topological sort — a vertex finishes only after all its descendants, so reversing puts it before them.

\`\`\`java
void dfs(int u) {
  state[u] = GRAY;
  for (int v : adj.get(u)) {
    if (state[v] == GRAY) throw new IllegalStateException("cycle");
    if (state[v] == WHITE) dfs(v);
  }
  state[u] = BLACK;
  stack.push(u);         // record on completion
}
// answer = stack popped top-to-bottom (i.e. reverse finish order)
\`\`\`

**O(V + E).** Track gray (on-stack) vertices to detect a **back edge** → cycle, which means no topo order exists.

:::senior
Kahn's (BFS/in-degree) vs DFS post-order are the two canonical topo-sort implementations. Kahn's detects cycles by a short output; DFS detects them via the gray/back-edge state. Know both — interviewers often ask for the alternative.
:::`,
  },
  {
    id: 'dsa-graph-bipartite',
    question: 'How do you check whether a graph is bipartite (2-colorable)?',
    difficulty: 'Medium',
    category: 'Graphs',
    tags: ['bfs', 'dfs', 'coloring', 'bipartite'],
    answer: `A graph is bipartite iff you can **2-color** it so no edge joins same-colored vertices — equivalently, it has **no odd-length cycle**. BFS/DFS, coloring each neighbour the **opposite** color:

\`\`\`java
int[] color = new int[n];         // 0 = uncolored, 1/-1 = the two sides
Arrays.fill(color, 0);
for (int s = 0; s < n; s++) {
  if (color[s] != 0) continue;
  Queue<Integer> q = new ArrayDeque<>(); q.add(s); color[s] = 1;
  while (!q.isEmpty()) {
    int u = q.poll();
    for (int v : adj.get(u)) {
      if (color[v] == 0) { color[v] = -color[u]; q.add(v); }
      else if (color[v] == color[u]) return false;   // clash → odd cycle
    }
  }
}
return true;
\`\`\`

**O(V + E).** Loop over all vertices to handle a **disconnected** graph. A same-color edge is proof of an odd cycle, which no 2-coloring can satisfy.`,
  },
  {
    id: 'dsa-graph-dfs-iterative',
    question: 'How do you write DFS iteratively with an explicit stack?',
    difficulty: 'Medium',
    category: 'Graphs',
    tags: ['dfs', 'stack', 'iterative'],
    answer: `Replace the call stack with an explicit **\`Deque\`**. Push the start; repeatedly pop, and if unvisited, mark it and push its neighbours.

\`\`\`java
Deque<Integer> st = new ArrayDeque<>();
st.push(start);
while (!st.isEmpty()) {
  int u = st.pop();
  if (visited[u]) continue;      // may be pushed multiple times
  visited[u] = true;
  process(u);
  for (int v : adj.get(u)) if (!visited[v]) st.push(v);
}
\`\`\`

**O(V + E).** Prefer this over recursion when the graph is **deep** (recursion would overflow the stack) or when you need explicit control over the traversal.

:::gotcha
Mark visited **on pop**, not on push, and skip already-visited pops — a vertex can be pushed by several neighbours before it is processed. The visit order differs slightly from recursive DFS but is still a valid depth-first traversal.
:::`,
  },
  {
    id: 'dsa-graph-provinces-union-find',
    question: 'Count the number of provinces (friend circles) using union-find.',
    difficulty: 'Medium',
    category: 'Graphs',
    tags: ['union-find', 'connected-components', 'dsu'],
    answer: `Provinces are connected components of an undirected graph given as an adjacency **matrix**. **Union** every connected pair, then count **distinct roots**.

\`\`\`java
int[] parent = new int[n];
for (int i = 0; i < n; i++) parent[i] = i;
int count = n;                          // start: each its own province

int find(int x) {                       // with path compression
  while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
  return x;
}
for (int i = 0; i < n; i++)
  for (int j = i + 1; j < n; j++)
    if (isConnected[i][j] == 1) {
      int ri = find(i), rj = find(j);
      if (ri != rj) { parent[ri] = rj; count--; }  // merge → one fewer
    }
return count;
\`\`\`

Each successful union reduces the component count by one, so \`count\` is the answer directly. With path compression, effectively **O(V² · α)** for the matrix scan.

:::note
DFS/BFS solves this too in O(V²) for a matrix. Union-find shines when edges **arrive incrementally** (dynamic connectivity), where re-running a traversal each time would be wasteful.
:::`,
  },
  {
    id: 'dsa-graph-dijkstra-impl',
    question: 'Implement Dijkstra\'s shortest-path algorithm with a priority queue.',
    difficulty: 'Hard',
    category: 'Graphs',
    tags: ['dijkstra', 'priority-queue', 'shortest-path'],
    answer: `Grow shortest distances outward from the source, always **finalizing the closest unfinalized vertex** next. A min-heap keyed by tentative distance drives it.

\`\`\`java
int[] dist = new int[n];
Arrays.fill(dist, Integer.MAX_VALUE);
dist[src] = 0;
PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]); // {node, dist}
pq.offer(new int[]{src, 0});
while (!pq.isEmpty()) {
  int[] top = pq.poll();
  int u = top[0], d = top[1];
  if (d > dist[u]) continue;                 // stale entry — skip (lazy deletion)
  for (int[] e : adj.get(u)) {               // e = {neighbor, weight}
    int nd = d + e[1];
    if (nd < dist[e[0]]) {
      dist[e[0]] = nd;
      pq.offer(new int[]{e[0], nd});
    }
  }
}
\`\`\`

**O((V + E) log V).** The \`if (d > dist[u]) continue\` implements **lazy deletion** — instead of a decrease-key, you push a fresh entry and ignore outdated ones.

:::gotcha
Only works with **non-negative** weights: once a vertex is popped its distance is final, an assumption a negative edge would violate. Use Bellman-Ford for negatives.
:::`,
  },
  {
    id: 'dsa-graph-word-ladder',
    question: 'Find the shortest transformation from beginWord to endWord changing one letter at a time.',
    difficulty: 'Hard',
    category: 'Graphs',
    tags: ['bfs', 'implicit-graph', 'shortest-path'],
    answer: `Model each word as a **vertex**; two words are adjacent if they differ by **one letter**. Shortest transformation = shortest path in an **unweighted** graph → **BFS**.

\`\`\`java
Set<String> dict = new HashSet<>(wordList);
Queue<String> q = new ArrayDeque<>(); q.add(beginWord);
int steps = 1;
while (!q.isEmpty()) {
  for (int i = q.size(); i > 0; i--) {
    String w = q.poll();
    if (w.equals(endWord)) return steps;
    char[] arr = w.toCharArray();
    for (int j = 0; j < arr.length; j++) {
      char old = arr[j];
      for (char c = 'a'; c <= 'z'; c++) {
        arr[j] = c;
        String next = new String(arr);
        if (dict.remove(next)) q.add(next);   // remove = mark visited
      }
      arr[j] = old;
    }
  }
  steps++;
}
return 0;
\`\`\`

Generating neighbours by trying all 26 letters at each position costs **O(L·26)** per word; total **O(N·L·26)**. Removing a word from the dict when enqueued marks it visited in O(1).

:::senior
Building neighbours by mutating positions (rather than comparing all word pairs, O(N²·L)) is the key efficiency. **Bidirectional BFS** from both ends roughly halves the explored frontier — the senior-level optimization.
:::`,
  },
];

export default questions;
