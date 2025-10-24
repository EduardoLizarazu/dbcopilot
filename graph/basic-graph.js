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

  // Remove an edge from u -> v. If `weight` is provided, only remove edges matching the weight;
  // otherwise remove all edges from u to v. Returns number of removed edges.
  removeEdge(uLabelOrId, vLabelOrId, weight) {
    const u = this._resolveNode(uLabelOrId);
    const v = this._resolveNode(vLabelOrId);
    const before = this.adj[u].length;
    if (weight === undefined) {
      this.adj[u] = this.adj[u].filter(([to, w]) => to !== v);
    } else {
      this.adj[u] = this.adj[u].filter(
        ([to, w]) => !(to === v && w === weight)
      );
    }
    return before - this.adj[u].length;
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

  // Remove a node (by id or label). This removes the node, all outgoing edges from it,
  // and all incoming edges to it. Node ids are reindexed (0..N-1) after removal.
  // Returns the label of the removed node.
  removeNode(labelOrId) {
    // resolve without auto-creating: if label doesn't exist, throw
    let id;
    if (typeof labelOrId === "number") {
      id = labelOrId;
      if (id < 0 || id >= this.adj.length)
        throw new Error(`node id ${id} out of range`);
    } else {
      if (!this.labelToId.has(labelOrId))
        throw new Error(`label '${labelOrId}' not found`);
      id = this.labelToId.get(labelOrId);
    }

    const removedLabel = this.labels[id];

    // Remove outgoing edges by removing the adjacency list entry
    this.adj.splice(id, 1);
    // Remove label and rebuild labelToId map
    this.labels.splice(id, 1);

    // Remove incoming edges and fix indexes in remaining adjacency lists
    for (let i = 0; i < this.adj.length; i++) {
      // remove edges that pointed to the removed node
      this.adj[i] = this.adj[i].filter(([to, w]) => to !== id);
      // decrement indices greater than removed id
      this.adj[i] = this.adj[i].map(([to, w]) => [to > id ? to - 1 : to, w]);
    }

    // Rebuild labelToId map to reflect new indexes
    this.labelToId.clear();
    for (let i = 0; i < this.labels.length; i++)
      this.labelToId.set(this.labels[i], i);

    return removedLabel;
  }
}

module.exports = BasicGraph;
