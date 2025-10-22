import {
  TCreateSchemaCtxKnowledgeGraphInRq,
  SchemaNodeMetadata,
  TableNodeMetadata,
  ColumnNodeMetadata,
  FilterNodeMetadata,
  MetricNodeMetadata,
  TempConceptNodeMetadata,
  GrainNodeMetadata,
  QueryNodeMetadata,
  SubQueryNodeMetadata,
  QuestionNodeMetadata,
  BelongSchemaEdge,
  JoinEdge,
  FilterEdge,
  CalculateEdge,
  GrainEdge,
  ScheduleEdge,
  SubqueryEdge,
  QueryEdge,
  AskEdge,
  UseEdge,
  SchemasByNameIndex,
  TablesBySchemaAndNameIndex,
  ColumnsByTableAndNameIndex,
  ColumnsByAliasIndex,
  TablesByAliasIndex,
  TUpdateConnOnSchemaGraph,
  TSchemaCtxKnowledgeGraphOutRq,
  TReadByConnectionFieldsDto,
  TCreateSchema,
} from "@/core/application/dtos/schemaContext.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { ISchemaRepository } from "@/core/application/interfaces/schema/schema.inter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";

export class SchemaRepository implements ISchemaRepository {
  constructor(
    private readonly logger: ILogger,
    private readonly fbAdmin: FirebaseAdminProvider
  ) {}
  createSchema(data: TCreateSchema): Promise<string> {
    throw new Error("Method not implemented.");
  }

  createSchemaNode(
    schemaCtxId: string,
    data: SchemaNodeMetadata
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }
  createTableNode(
    schemaCtxKwId: string,
    data: TableNodeMetadata
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }
  createColumnNode(
    schemaCtxKwId: string,
    data: ColumnNodeMetadata
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }
  createFilterNode(
    schemaCtxKwId: string,
    data: FilterNodeMetadata
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }
  createMetricNode(
    schemaCtxKwId: string,
    data: MetricNodeMetadata
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }
  createTempConceptNode(
    schemaCtxKwId: string,
    data: TempConceptNodeMetadata
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }
  createGrainNode(
    schemaCtxKwId: string,
    data: GrainNodeMetadata
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }
  createQueryNode(
    schemaCtxKwId: string,
    data: QueryNodeMetadata
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }
  createSubQueryNode(
    schemaCtxKwId: string,
    data: SubQueryNodeMetadata
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }
  createQuestionNode(
    schemaCtxKwId: string,
    data: QuestionNodeMetadata
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }
  createBelongToEdge(
    schemaCtxKwId: string,
    data: BelongSchemaEdge
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }
  createJoinEdge(schemaCtxKwId: string, data: JoinEdge): Promise<string> {
    throw new Error("Method not implemented.");
  }
  createFilterEdge(schemaCtxKwId: string, data: FilterEdge): Promise<string> {
    throw new Error("Method not implemented.");
  }
  createCalculateEdge(
    schemaCtxKwId: string,
    data: CalculateEdge
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }
  createGrainEdge(schemaCtxKwId: string, data: GrainEdge): Promise<string> {
    throw new Error("Method not implemented.");
  }
  createScheduleEdge(
    schemaCtxKwId: string,
    data: ScheduleEdge
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }
  createSubqueryEdge(
    schemaCtxKwId: string,
    data: SubqueryEdge
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }
  createQueryEdge(schemaCtxId: string, data: QueryEdge): Promise<string> {
    throw new Error("Method not implemented.");
  }
  createAskEdge(schemaCtxId: string, data: AskEdge): Promise<string> {
    throw new Error("Method not implemented.");
  }
  createUseEdge(schemaCtxId: string, data: UseEdge): Promise<string> {
    throw new Error("Method not implemented.");
  }
  createSchemasByNameIndex(
    schemaCtxId: string,
    data: SchemasByNameIndex
  ): Promise<SchemasByNameIndex> {
    throw new Error("Method not implemented.");
  }
  createTablesBySchemaIndex(
    schemaCtxId: string,
    data: TablesBySchemaAndNameIndex
  ): Promise<TablesBySchemaAndNameIndex> {
    throw new Error("Method not implemented.");
  }
  createColumnsByAliasIndex(
    schemaCtxId: string,
    data: ColumnsByTableAndNameIndex
  ): Promise<ColumnsByTableAndNameIndex>;
  createColumnsByAliasIndex(
    schemaCtxId: string,
    data: ColumnsByAliasIndex
  ): Promise<ColumnsByAliasIndex>;
  createColumnsByAliasIndex(
    schemaCtxId: unknown,
    data: unknown
  ):
    | Promise<Record<string, string>>
    | Promise<Record<string, Record<string, string>>> {
    throw new Error("Method not implemented.");
  }
  createTablesByAliasIndex(
    schemaCtxId: string,
    data: TablesByAliasIndex
  ): Promise<TablesByAliasIndex> {
    throw new Error("Method not implemented.");
  }
  updateConnOnSchemaGraph(
    id: string,
    data: TUpdateConnOnSchemaGraph[]
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateSchemaNode(
    id: string,
    data: Partial<SchemaNodeMetadata>
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateTableNode(id: string, data: Partial<TableNodeMetadata>): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateColumnNode(
    id: string,
    data: Partial<ColumnNodeMetadata>
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateFilterNode(
    id: string,
    data: Partial<FilterNodeMetadata>
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateMetricNode(
    id: string,
    data: Partial<MetricNodeMetadata>
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateTempConceptNode(
    id: string,
    data: Partial<TempConceptNodeMetadata>
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateGrainNode(id: string, data: Partial<GrainNodeMetadata>): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateQueryNode(id: string, data: Partial<QueryNodeMetadata>): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateSubQueryNode(
    id: string,
    data: Partial<SubQueryNodeMetadata>
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateQuestionNode(
    id: string,
    data: Partial<QuestionNodeMetadata>
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateBelongToEdge(
    id: string,
    data: Partial<BelongSchemaEdge>
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateJoinEdge(id: string, data: Partial<JoinEdge>): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateFilterEdge(id: string, data: Partial<FilterEdge>): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateCalculateEdge(id: string, data: Partial<CalculateEdge>): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateGrainEdge(id: string, data: Partial<GrainEdge>): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateScheduleEdge(id: string, data: Partial<ScheduleEdge>): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateSubqueryEdge(id: string, data: Partial<SubqueryEdge>): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateQueryEdge(id: string, data: Partial<QueryEdge>): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateAskEdge(id: string, data: Partial<AskEdge>): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateUseEdge(id: string, data: Partial<UseEdge>): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateSchemasByNameIndex(
    schemaCtxId: string,
    data: Partial<SchemasByNameIndex>
  ): Promise<SchemasByNameIndex> {
    throw new Error("Method not implemented.");
  }
  updateTablesBySchemaIndex(
    schemaCtxId: string,
    data: Partial<TablesBySchemaAndNameIndex>
  ): Promise<TablesBySchemaAndNameIndex> {
    throw new Error("Method not implemented.");
  }
  updateColumnsByTableAndNameIndex(
    schemaCtxId: string,
    data: Partial<ColumnsByTableAndNameIndex>
  ): Promise<ColumnsByTableAndNameIndex> {
    throw new Error("Method not implemented.");
  }
  updateTablesByAliasIndex(
    schemaCtxId: string,
    data: Partial<TablesByAliasIndex>
  ): Promise<TablesByAliasIndex> {
    throw new Error("Method not implemented.");
  }
  updateColumnsByAliasIndex(
    schemaCtxId: string,
    data: Partial<ColumnsByAliasIndex>
  ): Promise<ColumnsByAliasIndex> {
    throw new Error("Method not implemented.");
  }
  deleteSchemaCtxKnowledgeGraph(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  deleteNodeById(schemaCtxId: string, nodeId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  deleteEdgeById(schemaCtxId: string, edgeId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  deleteSchemasByNameIndex(
    schemaCtxId: string,
    indexId: string
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  deleteTablesBySchemaIndex(
    schemaCtxId: string,
    indexId: string
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  deleteColumnsByTableAndNameIndex(
    schemaCtxId: string,
    indexId: string
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  deleteTablesByAliasIndex(
    schemaCtxId: string,
    indexId: string
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  deleteColumnsByAliasIndex(
    schemaCtxId: string,
    indexId: string
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  findSchemaCtxKnowledgeGraphById(
    id: string
  ): Promise<TSchemaCtxKnowledgeGraphOutRq | null> {
    throw new Error("Method not implemented.");
  }
  findAllSchemaCtxKnowledgeGraph(): Promise<TSchemaCtxKnowledgeGraphOutRq[]> {
    throw new Error("Method not implemented.");
  }
  findByConnectionFields(
    data: TReadByConnectionFieldsDto
  ): Promise<TSchemaCtxKnowledgeGraphOutRq | null> {
    throw new Error("Method not implemented.");
  }
  // Implement the methods defined in the interface
}
