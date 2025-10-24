// Graph class: supports labeled nodes and weighted directed edges.
// Methods:
// - addNode(label): adds a node with the given label (if not exists) and returns its id
// - addEdge(u, v, w=1): adds a directed edge from u to v with optional weight w.
//   u and v may be numeric ids or labels; unknown labels are auto-created.
// - displayAdjList(): prints a readable adjacency list using labels
// - getAdjList(): returns adjacency lists using labels and weights

class BasicGraph {
  constructor() {
    this.adj = []; // array of neighbors: each is [toId, weight]
    this.labelToId = new Map();
    this.labels = []; // index -> label
  }

  addNode(label) {
    if (label === undefined || label === null)
      throw new Error("label required");
    if (this.labelToId.has(label)) return this.labelToId.get(label);
    const id = this.adj.length;
    this.labelToId.set(label, id);
    this.labels.push(label);
    this.adj.push([]);
    return id;
  }

  addEdge(uLabelOrId, vLabelOrId, weight = 1) {
    const u = this._resolveNode(uLabelOrId);
    const v = this._resolveNode(vLabelOrId);
    this.adj[u].push([v, weight]);
  }

  _resolveNode(x) {
    if (typeof x === "number") {
      if (x < 0 || x >= this.adj.length)
        throw new Error(`node id ${x} out of range`);
      return x;
    }
    // treat as label
    if (!this.labelToId.has(x)) return this.addNode(x);
    return this.labelToId.get(x);
  }

  displayAdjList() {
    for (let i = 0; i < this.adj.length; i++) {
      let line = `${this._labelFor(i)}: `;
      for (let [v, w] of this.adj[i]) {
        line += `{${this._labelFor(v)}, ${w}} `;
      }
      console.log(line.trim());
    }
  }

  _labelFor(id) {
    return this.labels[id] !== undefined ? this.labels[id] : String(id);
  }

  getAdjList() {
    return this.adj.map((neighbors, i) =>
      neighbors.map(([v, w]) => ({ to: this._labelFor(v), weight: w }))
    );
  }
}

module.exports = BasicGraph;
