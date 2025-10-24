const IdGen = require("../utils/id-gen");

class IdMetadataGraph {
  constructor() {
    // Use generated string ids to keep ids stable and unique
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
    // generate a unique string id
    let id = IdGen();
    while (this.adj.has(id)) id = IdGen();
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
      // handle weight separately because edge.metadata does not include weight
      if (matchMetadata.weight !== undefined) {
        // if weights differ, keep this edge
        if (e.weight !== matchMetadata.weight) return true;
      }

      // build match object without weight before matching metadata
      const metaToMatch = Object.assign({}, matchMetadata);
      delete metaToMatch.weight;

      // if there is no other metadata to check, weight (if matched) is enough -> remove
      if (Object.keys(metaToMatch).length === 0) return false;

      // otherwise remove only when metadata matches
      return !this._metaMatches(e.metadata, metaToMatch);
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
    // if x is already an id (string) present in the graph, return it
    if (this.adj.has(x)) return x;
    // if x is a known label, return id
    if (this.labelToId.has(x)) return this.labelToId.get(x);
    // otherwise create a new node with label x
    return this.addNode(x, {});
  }

  _resolveExistingNode(x) {
    // if x is an id present in the graph
    if (this.adj.has(x)) return x;
    if (!this.labelToId.has(x)) throw new Error(`label or id '${x}' not found`);
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
  // Return a plain object mapping label -> id
  getLabelToId() {
    const out = {};
    for (const [label, id] of this.labelToId.entries()) out[label] = id;
    return out;
  }

  // Return a plain object mapping id -> label
  getIdToLabel() {
    const out = {};
    for (const [id, label] of this.idToLabel.entries()) out[id] = label;
    return out;
  }

  // Console-friendly printers
  displayLabelToId() {
    console.log("labelToId:", this.getLabelToId());
  }

  displayIdToLabel() {
    console.log("idToLabel:", this.getIdToLabel());
  }

  // Return a plain object mapping id -> node metadata
  getNodeMeta() {
    const out = {};
    for (const [id, meta] of this.nodeMeta.entries()) out[id] = meta;
    return out;
  }

  // Console-friendly printer for node metadata
  displayNodeMeta() {
    console.log("nodeMeta:", this.getNodeMeta());
  }

  // Return adjacency as a plain object mapping id -> array of edges { toId, toLabel, weight, metadata }
  getAdj() {
    const out = {};
    for (const [id, edges] of this.adj.entries()) {
      out[id] = edges.map((e) => ({
        toId: e.to,
        toLabel: this.idToLabel.get(e.to),
        weight: e.weight,
        metadata: e.metadata,
      }));
    }
    return out;
  }

  // Console-friendly printer for adjacency
  displayAdj() {
    console.log("adj:", this.getAdj());
  }

  getEdgesRaw() {
    const out = [];
    for (const [fromId, edges] of this.adj.entries()) {
      for (const e of edges)
        out.push({
          fromId,
          toId: e.to,
          weight: e.weight,
          metadata: e.metadata,
        });
    }
    return out;
  }

  displayEdgesRaw() {
    const edges = this.getEdgesRaw();
    if (edges.length === 0) {
      console.log("No edges");
      return;
    }
    console.log("edges raw: ", edges);
  }
}

function IdMetadataGraphTest() {
  const g = new IdMetadataGraph();

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

  // Show the label->id and id->label maps
  console.log("\nMappings:");
  g.displayLabelToId();
  g.displayIdToLabel();
  g.displayNodeMeta();
  g.displayEdgesRaw();
  g.displayAdj();

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

module.exports = IdMetadataGraphTest;
