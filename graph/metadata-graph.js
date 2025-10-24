class MetadataGraph {
  constructor() {
    // Use stable numeric ids (incrementing) to avoid reindexing on removals
    this.nextId = 0;
    this.adj = new Map(); // id -> array of edges { to: id, metadata: {}, weight }
    this.labelToId = new Map(); // label -> id
    this.idToLabel = new Map(); // id -> label
    this.nodeMeta = new Map(); // id -> metadata object
  }

  // Add a node with a label and optional metadata. If label exists, returns existing id
  addNode(label, metadata = {}) {
    if (label === undefined || label === null)
      throw new Error("label required");
    if (this.labelToId.has(label)) return this.labelToId.get(label);
    const id = this.nextId++;
    this.labelToId.set(label, id);
    this.idToLabel.set(id, label);
    this.nodeMeta.set(id, metadata);
    this.adj.set(id, []);
    return id;
  }

  // Add a directed edge from u -> v with edge metadata and optional numeric weight.
  // Signature: addEdge(u, v, metadata = {}, weight = undefined)
  // For backwards convenience you can call addEdge(u, v, weight) (number as third arg).
  addEdge(uLabelOrId, vLabelOrId, metadata = {}, weight = undefined) {
    // support addEdge(u, v, weight)
    if (typeof metadata === "number") {
      weight = metadata;
      metadata = {};
    }
    const u = this._resolveNode(uLabelOrId);
    const v = this._resolveNode(vLabelOrId);
    const edges = this.adj.get(u);
    edges.push({ to: v, metadata, weight });
  }

  // Remove edges from u -> v. If matchMetadata is provided (object), only remove edges
  // whose metadata shallowly matches all keys in matchMetadata. Returns number removed.
  removeEdge(uLabelOrId, vLabelOrId, matchMetadata) {
    const u = this._resolveExistingNode(uLabelOrId);
    const v = this._resolveExistingNode(vLabelOrId);
    const edges = this.adj.get(u) || [];
    const before = edges.length;
    const filtered = edges.filter((e) => {
      if (e.to !== v) return true; // keep
      if (matchMetadata === undefined || matchMetadata === null) return false; // remove all to v
      // If matchMetadata specifies a weight, require it to match
      if (matchMetadata.weight !== undefined) {
        if (e.weight !== matchMetadata.weight) return true; // keep if weight differs
      }
      return !this._metaMatches(e.metadata, matchMetadata);
    });
    this.adj.set(u, filtered);
    return before - filtered.length;
  }

  // Remove a node by id or label. This deletes the node entry and removes incoming edges.
  // Returns removed node label. Throws if node doesn't exist.
  removeNode(labelOrId) {
    const id = this._resolveExistingNode(labelOrId);
    const removedLabel = this.idToLabel.get(id);

    // remove outgoing edges and node metadata
    this.adj.delete(id);
    this.nodeMeta.delete(id);
    this.idToLabel.delete(id);
    this.labelToId.delete(removedLabel);

    // remove incoming edges from all other nodes
    for (const [from, edges] of this.adj.entries()) {
      this.adj.set(
        from,
        edges.filter((e) => e.to !== id)
      );
    }

    return removedLabel;
  }

  // Return adjacency in readable form: { label, metadata, edges: [{toLabel, metadata}] }
  getAdjList() {
    const out = [];
    for (const [id, edges] of this.adj.entries()) {
      out.push({
        id,
        label: this.idToLabel.get(id),
        metadata: this.nodeMeta.get(id),
        edges: edges.map((e) => ({
          to: this.idToLabel.get(e.to),
          metadata: e.metadata,
          weight: e.weight,
        })),
      });
    }
    return out;
  }

  displayAdjList() {
    for (const [id, edges] of this.adj.entries()) {
      const label = this.idToLabel.get(id);
      const nodeMeta = this.nodeMeta.get(id);
      let line = `${label} (meta=${JSON.stringify(nodeMeta)}): `;
      for (const e of edges) {
        const toLabel = this.idToLabel.get(e.to);
        line += `{to: ${toLabel}, weight: ${e.weight}, meta: ${JSON.stringify(
          e.metadata
        )}} `;
      }
      console.log(line.trim());
    }
  }

  // Helpers
  _resolveNode(x) {
    if (typeof x === "number") {
      if (!this.adj.has(x)) throw new Error(`node id ${x} not found`);
      return x;
    }
    // label: if exists return id, otherwise create node with empty metadata
    if (this.labelToId.has(x)) return this.labelToId.get(x);
    return this.addNode(x, {});
  }

  _resolveExistingNode(x) {
    if (typeof x === "number") {
      if (!this.adj.has(x)) throw new Error(`node id ${x} not found`);
      return x;
    }
    if (!this.labelToId.has(x)) throw new Error(`label '${x}' not found`);
    return this.labelToId.get(x);
  }

  _metaMatches(meta, matchMeta) {
    // shallow match: every key in matchMeta must exist in meta with === equality
    for (const k of Object.keys(matchMeta)) {
      if (meta === undefined) return false;
      if (meta[k] !== matchMeta[k]) return false;
    }
    return true;
  }
}

function MetadataGraphTest() {
  const g = new MetadataGraph();

  // Add nodes with metadata (e.g., schema info)
  g.addNode("public.users", { schema: "public", table: "users" });
  g.addNode("sales.customers", { schema: "sales", table: "customers" });
  g.addNode("sales.orders", { schema: "sales", table: "orders" });

  // Add edges with metadata (e.g., relation type)
  // Add edges with metadata and weights
  g.addEdge(
    "sales.orders",
    "sales.customers",
    { type: "fk", column: "customer_id" },
    5
  );
  g.addEdge(
    "sales.orders",
    "public.users",
    { type: "audit", column: "created_by" },
    1
  );

  console.log("\nInitial Metadata Graph:");
  g.displayAdjList();

  // Remove an edge by matching metadata
  console.log("\nRemove the audit edge from sales.orders -> public.users");
  const removedEdges = g.removeEdge("sales.orders", "public.users", {
    type: "audit",
  });
  console.log(`removed edges: ${removedEdges}`);
  g.displayAdjList();

  // Remove a node entirely
  console.log("\nRemove node sales.customers");
  const removedLabel = g.removeNode("sales.customers");
  console.log(`removed node: ${removedLabel}`);
  g.displayAdjList();
}

module.exports = MetadataGraphTest;
