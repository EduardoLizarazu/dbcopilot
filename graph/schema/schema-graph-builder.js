/**
 * Build an IdMetadataGraph with schema, table, and (optional) column nodes.
 *
 * Nodes:
 *  - schema:<schema>                 { kind:"schema", schema }
 *  - <schema>.<table>                { kind:"table",  schema, table }
 *  - <schema>.<table>.<column>       { kind:"column", schema, table, column, dataType }
 *
 * Edges:
 *  - schema:<s> -> <s>.<t>                         { rel:"has_table" }              weight=hasTableWeight
 *  - (opt) <s>.<t> -> schema:<s>                   { rel:"belongs_to" }             weight=belongsToWeight
 *  - <s>.<t> -> <s>.<t>.<c>                        { rel:"has_column", dataType }   weight=hasColumnWeight
 *  - <s1>.<t1> ⇄ <s2>.<t2>  (same column name)     { rel:"can_join", via:"exact_column_name", column, on } weight=joinWeight
 */

const { IdMetadataGraph } = require("../graph/id-metadata-graph");
const { schemaV1 } = require("../const/schemav1");
const {
  mapRawSchemaToOrganizationSchema,
} = require("../mapper/row-schema-to-orginize-schema");

function buildGraphFromSchemaV2(
  schemaV2,
  {
    addColumnNodes = true,
    caseInsensitive = false,
    filterDataTypesEqual = false,
    joinWeight = 0.95,
    hasTableWeight = 1,
    belongsToWeight = 1,
    hasColumnWeight = 1,
    addBelongsToEdge = true, // table -> schema reverse edge
  } = {}
) {
  const g = new IdMetadataGraph({ autoCreateNodes: false });
  const norm = (s) => (caseInsensitive ? String(s).toLowerCase() : String(s));

  // Indexes
  const colIndex = new Map(); // key: normalized colName -> [{ tableLabel, schema, table, column, dataType }]
  const schemaIdByLabel = new Map(); // 'schema:<s>' -> id

  // 1) Create schema + table (+ column) nodes and edges
  for (const sch of schemaV2) {
    const schemaName = sch.schema;
    const schemaLabel = `schema:${schemaName}`;

    // schema node (once)
    if (!schemaIdByLabel.has(schemaLabel)) {
      g.addNode(schemaLabel, { kind: "schema", schema: schemaName });
      schemaIdByLabel.set(schemaLabel, true);
    }

    for (const tbl of sch.tables) {
      const tableName = tbl.name;
      const tableLabel = `${schemaName}.${tableName}`;

      // table node
      g.addNode(tableLabel, {
        kind: "table",
        schema: schemaName,
        table: tableName,
      });

      // schema -> table
      g.addEdge(schemaLabel, tableLabel, { rel: "has_table" }, hasTableWeight);

      // (optional) table -> schema
      if (addBelongsToEdge) {
        g.addEdge(
          tableLabel,
          schemaLabel,
          { rel: "belongs_to" },
          belongsToWeight
        );
      }

      // columns
      if (addColumnNodes) {
        for (const c of tbl.columns) {
          const colLabel = `${tableLabel}.${c.name}`;
          g.addNode(colLabel, {
            kind: "column",
            schema: schemaName,
            table: tableName,
            column: c.name,
            dataType: c.dataType,
          });
          g.addEdge(
            tableLabel,
            colLabel,
            { rel: "has_column", dataType: c.dataType },
            hasColumnWeight
          );
        }
      }

      // index columns for join inference
      for (const c of tbl.columns) {
        const key = norm(c.name);
        if (!colIndex.has(key)) colIndex.set(key, []);
        colIndex.get(key).push({
          tableLabel,
          schema: schemaName,
          table: tableName,
          column: c.name,
          dataType: c.dataType,
        });
      }
    }
  }

  // 2) Infer table joins by exact column name equality
  const seen = new Set();
  for (const [colKey, entries] of colIndex.entries()) {
    if (entries.length < 2) continue;

    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const A = entries[i],
          B = entries[j];

        if (filterDataTypesEqual && A.dataType !== B.dataType) continue;

        // same raw column name by construction (keyed by normalized name)
        const col = A.column;
        const on = `${A.tableLabel}.${col} = ${B.tableLabel}.${col}`;

        // dedupe A↔B by a deterministic key
        const key = `${A.tableLabel}::${B.tableLabel}::${col}`;
        const rkey = `${B.tableLabel}::${A.tableLabel}::${col}`;
        if (seen.has(key) || seen.has(rkey)) continue;
        seen.add(key);

        const meta = {
          rel: "can_join",
          via: "exact_column_name",
          column: col,
          on,
        };

        // bidirectional join edges
        g.addEdge(A.tableLabel, B.tableLabel, meta, joinWeight);
        g.addEdge(B.tableLabel, A.tableLabel, meta, joinWeight);
      }
    }
  }

  return g;
}

function buildGraphFromSchemaV2Test() {
  // 1) schemaV2 = transformSchemaV1ToV2(schemaV1)  // del paso anterior
  const g = buildGraphFromSchemaV2(mapRawSchemaToOrganizationSchema(schemaV1), {
    addColumnNodes: true,
    addBelongsToEdge: true,
    caseInsensitive: false,
    filterDataTypesEqual: true, // si querés exigir mismo tipo
  });

  // 2) Inspección
  g.displayLabelToId();
  g.displayIdToLabel();
  g.displayNodeMeta();
  g.displayEdgesRaw();
  g.displayAdj();
}

module.exports = { buildGraphFromSchemaV2, buildGraphFromSchemaV2Test };
