const MetadataGraph = require("./metadata-graph");

function main() {
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

main();
