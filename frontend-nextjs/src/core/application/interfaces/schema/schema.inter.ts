import {
  AskEdge,
  BelongSchemaEdge,
  CalculateEdge,
  ColumnNodeMetadata,
  createSchemaCtxKnowledgeGraphInRq,
  FilterEdge,
  FilterNodeMetadata,
  GrainEdge,
  GrainNodeMetadata,
  JoinEdge,
  MetricNodeMetadata,
  QueryEdge,
  QueryNodeMetadata,
  QuestionNodeMetadata,
  ScheduleEdge,
  SchemaCtxKnowledge,
  SchemaCtxKnowledgeGraph,
  SchemaNodeMetadata,
  SubqueryEdge,
  SubQueryNodeMetadata,
  TableNodeMetadata,
  TempConceptNodeMetadata,
  updateSchemaCtxKnowledgeGraphInRq,
  UseEdge,
} from "../../dtos/schemaContext.dto";

export interface ISchemaCtxKnowledgeGraphRepository {
  // create
  createSchemaCtxKnowledgeGraph(
    data: createSchemaCtxKnowledgeGraphInRq
  ): Promise<string>;
  //  CREATE NODES
  createSchemaNode(
    schemaCtxId: string,
    data: SchemaNodeMetadata
  ): Promise<string>;
  createTableNode(
    schemaCtxKwId: string,
    data: TableNodeMetadata
  ): Promise<string>;
  createColumnNode(
    schemaCtxKwId: string,
    data: ColumnNodeMetadata
  ): Promise<string>;
  createFilterNode(
    schemaCtxKwId: string,
    data: FilterNodeMetadata
  ): Promise<string>;
  createMetricNode(
    schemaCtxKwId: string,
    data: MetricNodeMetadata
  ): Promise<string>;
  createTempConceptNode(
    schemaCtxKwId: string,
    data: TempConceptNodeMetadata
  ): Promise<string>;
  createGrainNode(
    schemaCtxKwId: string,
    data: GrainNodeMetadata
  ): Promise<string>;
  createQueryNode(
    schemaCtxKwId: string,
    data: QueryNodeMetadata
  ): Promise<string>;
  createSubQueryNode(
    schemaCtxKwId: string,
    data: SubQueryNodeMetadata
  ): Promise<string>;
  createQuestionNode(
    schemaCtxKwId: string,
    data: QuestionNodeMetadata
  ): Promise<string>;
  //   CREATE EDGES
  createBelongToEdge(
    schemaCtxKwId: string,
    data: BelongSchemaEdge
  ): Promise<string>;
  createJoinEdge(schemaCtxKwId: string, data: JoinEdge): Promise<string>;
  createFilterEdge(schemaCtxKwId: string, data: FilterEdge): Promise<string>;
  createCalculateEdge(
    schemaCtxKwId: string,
    data: CalculateEdge
  ): Promise<string>;
  createGrainEdge(schemaCtxKwId: string, data: GrainEdge): Promise<string>;
  createScheduleEdge(
    schemaCtxKwId: string,
    data: ScheduleEdge
  ): Promise<string>;
  createSubqueryEdge(
    schemaCtxKwId: string,
    data: SubqueryEdge
  ): Promise<string>;
  createQueryEdge(schemaCtxId: string, data: QueryEdge): Promise<string>;
  createAskEdge(schemaCtxId: string, data: AskEdge): Promise<string>;
  createUseEdge(schemaCtxId: string, data: UseEdge): Promise<string>;

  // UPDATE NODES
  updateSchemaCtxKnowledgeGraph(
    id: string,
    data: updateSchemaCtxKnowledgeGraphInRq
  ): Promise<void>;
  updateSchemaNode(
    id: string,
    data: Partial<SchemaNodeMetadata>
  ): Promise<void>;
  updateTableNode(id: string, data: Partial<TableNodeMetadata>): Promise<void>;
  updateColumnNode(
    id: string,
    data: Partial<ColumnNodeMetadata>
  ): Promise<void>;
  updateFilterNode(
    id: string,
    data: Partial<FilterNodeMetadata>
  ): Promise<void>;
  updateMetricNode(
    id: string,
    data: Partial<MetricNodeMetadata>
  ): Promise<void>;
  updateTempConceptNode(
    id: string,
    data: Partial<TempConceptNodeMetadata>
  ): Promise<void>;
  updateGrainNode(id: string, data: Partial<GrainNodeMetadata>): Promise<void>;
  updateQueryNode(id: string, data: Partial<QueryNodeMetadata>): Promise<void>;
  updateSubQueryNode(
    id: string,
    data: Partial<SubQueryNodeMetadata>
  ): Promise<void>;
  updateQuestionNode(
    id: string,
    data: Partial<QuestionNodeMetadata>
  ): Promise<void>;

  // UPDATE EDGES
  updateBelongToEdge(
    id: string,
    data: Partial<BelongSchemaEdge>
  ): Promise<void>;
  updateJoinEdge(id: string, data: Partial<JoinEdge>): Promise<void>;
  updateFilterEdge(id: string, data: Partial<FilterEdge>): Promise<void>;
  updateCalculateEdge(id: string, data: Partial<CalculateEdge>): Promise<void>;
  updateGrainEdge(id: string, data: Partial<GrainEdge>): Promise<void>;
  updateScheduleEdge(id: string, data: Partial<ScheduleEdge>): Promise<void>;
  updateSubqueryEdge(id: string, data: Partial<SubqueryEdge>): Promise<void>;
  updateQueryEdge(id: string, data: Partial<QueryEdge>): Promise<void>;
  updateAskEdge(id: string, data: Partial<AskEdge>): Promise<void>;
  updateUseEdge(id: string, data: Partial<UseEdge>): Promise<void>;

  // delete
  deleteSchemaCtxKnowledgeGraph(id: string): Promise<void>;
  deleteNodeById(id: string): Promise<void>;
  deleteEdgeById(id: string): Promise<void>;

  // read
  findSchemaCtxKnowledgeGraphById(
    id: string
  ): Promise<SchemaCtxKnowledge | null>;
  findAllSchemaCtxKnowledgeGraph(): Promise<SchemaCtxKnowledge[]>;
}
