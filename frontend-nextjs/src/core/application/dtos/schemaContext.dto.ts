import { z } from "zod";
import { dbType } from "./dbconnection.dto";

// NODES METADATA
export const nodeBase = z.object({
  id: z.string().min(2).max(100), // unique node identifier
  kind: z.enum([
    "schema",
    "table",
    "column",
    "filter",
    "metric",
    "temp_concept",
    "grain",
    "query",
    "subquery",
    "question",
  ]),
  name: z.string().min(1),
  alias: z.string().default(""),
  description: z.string().default(""),
});

export const schemaNodeMetadata = nodeBase.extend({
  kind: z.enum(["schema"]),
});
export type SchemaNodeMetadata = z.infer<typeof schemaNodeMetadata>;

export const tableNodeMetadata = nodeBase.extend({
  kind: z.enum(["table"]),
});
export type TableNodeMetadata = z.infer<typeof tableNodeMetadata>;
export const profileColumnMetadata = z
  .object({
    distinctCount: z.number().default(0),
    nullCount: z.number().default(0),
    minValue: z.string().default(""),
    maxValue: z.string().default(""),
    avgValue: z.number().default(0),
    stdDev: z.number().default(0),
    sampleDistinctValues: z.array(z.string()).default([]), // possible filters
  })
  .default({});
export const columnNodeMetadata = nodeBase.extend({
  kind: z.enum(["column"]),
  dataType: z.string().min(1),
  profile: profileColumnMetadata,
});
export type ColumnNodeMetadata = z.infer<typeof columnNodeMetadata>;

export const filterNodeMetadata = nodeBase.extend({
  kind: z.enum(["filter"]),
  expr: z.string().min(1), // expression
});
export type FilterNodeMetadata = z.infer<typeof filterNodeMetadata>;

export const metricNodeMetadata = nodeBase.extend({
  kind: z.enum(["metric"]),
  type: z
    .enum(["count", "sum", "avg", "min", "max", "custom"])
    .default("custom"),
  expr: z.string().min(1), // expression
});
export type MetricNodeMetadata = z.infer<typeof metricNodeMetadata>;

export const tempConceptNodeMetadata = nodeBase.extend({
  kind: z.enum(["temp_concept"]),
  expr: z.string().min(1), // expression
});
export type TempConceptNodeMetadata = z.infer<typeof tempConceptNodeMetadata>;

export const grainNodeMetadata = nodeBase.extend({
  kind: z.enum(["grain"]),
  expr: z.string().min(1), // expression
});
export type GrainNodeMetadata = z.infer<typeof grainNodeMetadata>;

export const queryNodeMetadata = nodeBase.extend({
  kind: z.enum(["query"]),
  expr: z.string().min(1), // expression
});
export type QueryNodeMetadata = z.infer<typeof queryNodeMetadata>;

export const subQueryNodeMetadata = nodeBase.extend({
  kind: z.enum(["subquery"]),
  goal: z.string().min(1).default(""),
  expr: z.string().min(1), // expression
});
export type SubQueryNodeMetadata = z.infer<typeof subQueryNodeMetadata>;

export const questionNodeMetadata = nodeBase.extend({
  kind: z.enum(["question"]),
  question: z.string().min(1),
});
export type QuestionNodeMetadata = z.infer<typeof questionNodeMetadata>;

export const nodeUnion = z.union([
  schemaNodeMetadata,
  tableNodeMetadata,
  columnNodeMetadata,
  filterNodeMetadata,
  metricNodeMetadata,
  tempConceptNodeMetadata,
  grainNodeMetadata,
  queryNodeMetadata,
  subQueryNodeMetadata,
  questionNodeMetadata,
]);

// EDGES METADATA
export const weight = z.object({
  weight: z.number().min(0).max(1).default(0),
  countPos: z.number().default(0),
  countNeg: z.number().default(0),
  alpha: z.number().min(0).default(1),
});
export const edgeBase = z.object({
  id: z.string().min(2).max(100), // unique edgeBase identifier
  kind: z.enum([
    "belongs_to",
    "join",
    "filter",
    "calculate",
    "grain",
    "schedule",
    "subquery",
    "query",
    "ask",
  ]),
  inverse: z.boolean(),
  from: z.string().min(2).max(100), // from node id
  to: z.string().min(2).max(100), // to node id
  name: z.string(),
  description: z.string().default(""),
  formula: weight,
});

// schema belongs_to edge
export const belongSchema = edgeBase.extend({
  kind: z.enum(["belongs_to"]),
});
export type BelongSchemaEdge = z.infer<typeof belongSchema>;

// join edge
// from: left and to: right
export const joinEdge = edgeBase.extend({
  kind: z.enum(["join"]),
  joinType: z.enum(["INNER", "LEFT", "RIGHT", "FULL"]).default("INNER"), // JOIN Type = INNER / LEFT / RIGHT / FULL
});
export type JoinEdge = z.infer<typeof joinEdge>;

// filter edge
export const filterEdge = edgeBase.extend({
  kind: z.enum(["filter"]),
  type: z.enum([
    "equals",
    "not_equals",
    "greater_than",
    "less_than",
    "in",
    "not_in",
    "like",
    "not_like",
  ]),
  expr: z.string().min(1), // filter expression
});
export type FilterEdge = z.infer<typeof filterEdge>;

// calculate edge
export const calculateEdge = edgeBase.extend({
  kind: z.enum(["calculate"]),
  type: z.enum(["sum", "avg", "count", "custom"]).default("custom"),
  expr: z.string().min(1), // calculation expression
});
export type CalculateEdge = z.infer<typeof calculateEdge>;

// grain edge
export const grainEdge = edgeBase.extend({
  kind: z.enum(["grain"]),
  expr: z.string().min(1), // grain expression
});
export type GrainEdge = z.infer<typeof grainEdge>;

// temporal edge
export const scheduleEdge = edgeBase.extend({
  kind: z.enum(["schedule"]),
  expr: z.string().min(1), // temporal expression
});
export type ScheduleEdge = z.infer<typeof scheduleEdge>;

// subquery edge
export const subqueryEdge = edgeBase.extend({
  kind: z.enum(["subquery"]),
  expr: z.string().min(1), // subquery expression
});
export type SubqueryEdge = z.infer<typeof subqueryEdge>;

// query edge
export const queryEdge = edgeBase.extend({
  kind: z.enum(["query"]),
  expr: z.string().min(1), // query expression
});
export type QueryEdge = z.infer<typeof queryEdge>;

// ask edge
export const askEdge = edgeBase.extend({
  kind: z.enum(["ask"]),
});
export type AskEdge = z.infer<typeof askEdge>;

// use edge sql to the rest
export const useEdge = edgeBase.extend({
  kind: z.enum(["use"]),
});
export type UseEdge = z.infer<typeof useEdge>;

export const edgeUnion = z.union([
  joinEdge,
  filterEdge,
  calculateEdge,
  grainEdge,
  scheduleEdge,
  subqueryEdge,
  queryEdge,
  askEdge,
  useEdge,
]);

// INDEX (Scope index (name → id))
export const Id = z.string().min(2).max(100);
// 1) schemas_by_name: nombreSchema -> schemaId
export const schemasByNameIndex = z.record(z.string(), Id);
export type SchemasByNameIndex = z.infer<typeof schemasByNameIndex>;
// 2) tables_by_schema_and_name: schemaId -> (nombreTabla -> tableId)
export const tablesBySchemaAndNameIndex = z.record(
  Id,
  z.record(z.string(), Id)
);
export type TablesBySchemaAndNameIndex = z.infer<
  typeof tablesBySchemaAndNameIndex
>;
// 3) columns_by_table_and_name: tableId -> (nombreColumna -> columnId)
export const columnsByTableAndNameIndex = z.record(
  Id,
  z.record(z.string(), Id)
);
export type ColumnsByTableAndNameIndex = z.infer<
  typeof columnsByTableAndNameIndex
>;

// 4) índices por alias
export const tablesByAliasIndex = z.record(z.string(), Id);
export type TablesByAliasIndex = z.infer<typeof tablesByAliasIndex>;
export const columnsByAliasIndex = z.record(z.string(), Id);
export type ColumnsByAliasIndex = z.infer<typeof columnsByAliasIndex>;

// INDEX GRAPH COMPLETE
export const graphIndex = z.object({
  schemas_by_name: schemasByNameIndex.default({}),
  tables_by_schema_and_name: tablesBySchemaAndNameIndex.default({}),
  columns_by_table_and_name: columnsByTableAndNameIndex.default({}),
  tables_by_alias: tablesByAliasIndex.default({}),
  columns_by_alias: columnsByAliasIndex.default({}),
});

// MAIN GRAPH
export const schemaCtxKnowledgeGraph = z.object({
  id: z.string().min(2).max(100),
  connStringRef: z.array(
    z.object({
      id: z.string().min(2).max(100),
      name: z.string().min(1),
      type: dbType,
      host: z.string().min(1),
      port: z.number().min(1),
      database: z.string().min(1),
      username: z.string().min(1),
      password: z.string().min(1),
    })
  ),
  nodes: z.record(z.string(), nodeUnion).default({}),
  edges: z.record(z.string(), edgeUnion).default({}),
  index: graphIndex.default({}),
});

export type TSchemaCtxKnowledgeGraph = z.infer<typeof schemaCtxKnowledgeGraph>;

export const createSchemaCtxKnowledgeGraphInRq = z.object({
  id: z.string().min(2).max(100),
  name: z.string().min(1),
  type: dbType,
  host: z.string().min(1),
  port: z.number().min(1),
  database: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
});

export type TCreateSchemaCtxKnowledgeGraphInRq = z.infer<
  typeof createSchemaCtxKnowledgeGraphInRq
>;

export const CreateSchema = schemaCtxKnowledgeGraph.omit({
  id: true,
});
export type TCreateSchema = z.infer<typeof CreateSchema>;

export const schemaCtxKnowledgeGraphOutRq = schemaCtxKnowledgeGraph;
export type TSchemaCtxKnowledgeGraphOutRq = z.infer<
  typeof schemaCtxKnowledgeGraphOutRq
>;

export const updateConnOnSchemaGraph = schemaCtxKnowledgeGraph
  .omit({
    connStringRef: true,
    nodes: true,
    edges: true,
    index: true,
  })
  .extend({
    connStringRef: z.object({
      id: z.string().min(2).max(100),
      name: z.string().min(1),
      type: dbType,
      host: z.string().min(1),
      port: z.number().min(1),
      database: z.string().min(1),
      username: z.string().min(1),
      password: z.string().min(1),
    }),
  });

export type TUpdateConnOnSchemaGraph = z.infer<typeof updateConnOnSchemaGraph>;

export const readByConnectionFieldsDto = z.object({
  type: dbType,
  host: z.string().min(1),
  port: z.number().min(1),
  database: z.string().min(1),
});

export type TReadByConnectionFieldsDto = z.infer<
  typeof readByConnectionFieldsDto
>;
// -----------------------

export const schemaCtxKnowledge = schemaCtxKnowledgeGraph
  .pick({
    id: true,
    connStringRef: true,
  })
  .extend({
    schemaCtxKw: z.array(
      z.object({
        schema: schemaNodeMetadata,
        table: tableNodeMetadata,
        column: columnNodeMetadata,
        filters: z.array(filterNodeMetadata).default([]),
        metrics: z.array(metricNodeMetadata).default([]),
        tempConcepts: z.array(tempConceptNodeMetadata).default([]),
        grains: z.array(grainNodeMetadata).default([]),
        queries: z.array(queryNodeMetadata).default([]),
        subqueries: z.array(subQueryNodeMetadata).default([]),
        questions: z.array(questionNodeMetadata).default([]),
      })
    ),
  });

export type SchemaCtxKnowledge = z.infer<typeof schemaCtxKnowledge>;
