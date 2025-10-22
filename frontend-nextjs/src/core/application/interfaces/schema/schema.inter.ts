import {
  AskEdge,
  BelongSchemaEdge,
  CalculateEdge,
  ColumnNodeMetadata,
  ColumnsByAliasIndex,
  ColumnsByTableAndNameIndex,
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
  SchemaNodeMetadata,
  SchemasByNameIndex,
  SubqueryEdge,
  SubQueryNodeMetadata,
  TableNodeMetadata,
  TablesByAliasIndex,
  TablesBySchemaAndNameIndex,
  TempConceptNodeMetadata,
  UseEdge,
  TUpdateConnOnSchemaInRqDto,
  TReadByConnectionFieldsDto,
  TCreateSchema,
  TSchemaOutRqDto,
  TUpdateConnOnSchema,
} from "../../dtos/schemaContext.dto";

export interface ISchemaRepository {
  // create
  createSchema(data: TCreateSchema): Promise<string>;
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
  // CREATE INDEXES
  createSchemasByNameIndex(
    schemaCtxId: string,
    data: SchemasByNameIndex
  ): Promise<SchemasByNameIndex>;
  createTablesBySchemaIndex(
    schemaCtxId: string,
    data: TablesBySchemaAndNameIndex
  ): Promise<TablesBySchemaAndNameIndex>;
  createColumnsByAliasIndex(
    schemaCtxId: string,
    data: ColumnsByTableAndNameIndex
  ): Promise<ColumnsByTableAndNameIndex>;
  createTablesByAliasIndex(
    schemaCtxId: string,
    data: TablesByAliasIndex
  ): Promise<TablesByAliasIndex>;
  createColumnsByAliasIndex(
    schemaCtxId: string,
    data: ColumnsByAliasIndex
  ): Promise<ColumnsByAliasIndex>;

  // UPDATE NODES
  updateConnOnSchema(id: string, data: TUpdateConnOnSchema): Promise<void>;
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
  // UPDATE INDEX
  updateSchemasByNameIndex(
    schemaCtxId: string,
    data: Partial<SchemasByNameIndex>
  ): Promise<SchemasByNameIndex>;
  updateTablesBySchemaIndex(
    schemaCtxId: string,
    data: Partial<TablesBySchemaAndNameIndex>
  ): Promise<TablesBySchemaAndNameIndex>;
  updateColumnsByTableAndNameIndex(
    schemaCtxId: string,
    data: Partial<ColumnsByTableAndNameIndex>
  ): Promise<ColumnsByTableAndNameIndex>;
  updateTablesByAliasIndex(
    schemaCtxId: string,
    data: Partial<TablesByAliasIndex>
  ): Promise<TablesByAliasIndex>;
  updateColumnsByAliasIndex(
    schemaCtxId: string,
    data: Partial<ColumnsByAliasIndex>
  ): Promise<ColumnsByAliasIndex>;

  // DELETE
  deleteSchema(id: string): Promise<void>;
  deleteConnOnSchema(id: string, connId: string): Promise<void>;

  // DELETE NODE
  deleteNodeById(schemaCtxId: string, nodeId: string): Promise<void>;

  // DELETE EDGE
  deleteEdgeById(schemaCtxId: string, edgeId: string): Promise<void>;

  // DELETE INDEX
  deleteSchemasByNameIndex(schemaCtxId: string, indexId: string): Promise<void>;
  deleteTablesBySchemaIndex(
    schemaCtxId: string,
    indexId: string
  ): Promise<void>;
  deleteColumnsByTableAndNameIndex(
    schemaCtxId: string,
    indexId: string
  ): Promise<void>;
  deleteTablesByAliasIndex(schemaCtxId: string, indexId: string): Promise<void>;
  deleteColumnsByAliasIndex(
    schemaCtxId: string,
    indexId: string
  ): Promise<void>;

  // READ
  findById(id: string): Promise<TSchemaOutRqDto | null>;
  findAll(): Promise<TSchemaOutRqDto[]>;
  findByConnectionFields(
    data: TReadByConnectionFieldsDto
  ): Promise<TSchemaOutRqDto | null>;
  findByConnId(connId: string): Promise<TSchemaOutRqDto | null>;

  // READ BY NODE
}
