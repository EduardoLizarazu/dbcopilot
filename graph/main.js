// Function to add an edge between two vertices
const BasicGraph = require("./basic-graph");

function main() {
  // Create a graph and add nodes/edges (matches the original example)
  const g = new BasicGraph();

  // create 3 nodes with labels 0,1,2
  g.addNode(0);
  g.addNode(1);
  g.addNode(2);

  // Now add edges one by one
  g.addEdge(1, 0, 4);
  g.addEdge(1, 2, 3);
  g.addEdge(2, 0, 1);

  console.log("Adjacency List Representation:");
  g.displayAdjList();

  // Demonstrate removeEdge: remove edge 1 -> 2
  console.log("\nRemoving edge 1 -> 2");
  const removedCount = g.removeEdge(1, 2);
  console.log(`removed edges: ${removedCount}`);
  g.displayAdjList();

  // Demonstrate removeNode: remove node labeled 0
  console.log("\nRemoving node 0");
  const removedLabel = g.removeNode(0);
  console.log(`removed node label: ${removedLabel}`);
  g.displayAdjList();
}

main();

// Expected output:
// Adjacency List Representation:
// 0:
// 1: {0, 4} {2, 3}
// 2: {0, 1}
