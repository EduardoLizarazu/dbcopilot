import {
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
  TReadByConnectionFieldsDto,
  TCreateSchema,
  TSchemaOutRqDto,
  TUpdateConnOnSchema,
  TSchema,
} from "@/core/application/dtos/schemaContext.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { ISchemaRepository } from "@/core/application/interfaces/schema/schema.inter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";

export class SchemaRepository implements ISchemaRepository {
  constructor(
    private readonly logger: ILogger,
    private readonly fbAdmin: FirebaseAdminProvider
  ) {}

  // CREATE SCHEMA
  async createSchema(data: TCreateSchema): Promise<string> {
    try {
      // Use Firebase Admin SDK to insert Schema Context Knowledge Graph
      const schemaDocRef = await this.fbAdmin.db
        .collection(this.fbAdmin.coll.SCHEMA)
        .add(data);

      await schemaDocRef.update({ id: schemaDocRef.id });
      this.logger.info("SchemaRepository: Created schema:", {
        id: schemaDocRef.id,
        ...data,
      });
      return schemaDocRef.id;
    } catch (error) {
      this.logger.error(
        "[SchemaRepository] Error creating schema:",
        error.message
      );
      throw new Error(error.message || "Error creating schema");
    }
  }
  // CREATE NODES
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
  //   CREATE EDGES
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

  //   UPDATE SCHEMA
  async updateConnOnSchema(
    id: string,
    data: TUpdateConnOnSchema
  ): Promise<void> {
    try {
      this.logger.info(
        `[SchemaRepository] Updating connection on schema with ID ${id}:`,
        data
      );
      // Use Firebase Admin SDK to update the schema document
      await this.fbAdmin.db
        .collection(this.fbAdmin.coll.SCHEMA)
        .doc(id)
        .update({ ...data });
      this.logger.info(
        `[SchemaRepository] Updated connection on schema with ID ${id}`
      );
    } catch (error) {
      this.logger.error(
        `[SchemaRepository] Error updating connection on schema with ID ${id}:`,
        error.message
      );
      throw new Error(error.message || "Error updating connection on schema");
    }
  }
  // UPDATE NODES
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
  //   UPDATE EDGES
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
  //  UPDATE INDEX
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
  //   DELETE
  async deleteSchema(id: string): Promise<void> {
    try {
      this.logger.info(`[SchemaRepository] Deleting schema with ID ${id}`);
      await this.fbAdmin.db
        .collection(this.fbAdmin.coll.SCHEMA)
        .doc(id)
        .delete();
      this.logger.info(`[SchemaRepository] Deleted schema with ID ${id}`);
    } catch (error) {
      this.logger.error(
        `[SchemaRepository] Error deleting schema with ID ${id}:`,
        error.message
      );
      throw new Error(error.message || "Error deleting schema");
    }
  }
  async deleteConnOnSchema(id: string, connId: string): Promise<void> {
    try {
      this.logger.info(
        `[SchemaRepository] Deleting connection ${connId} from schema ${id}`
      );
      const schemaDocRef = this.fbAdmin.db
        .collection(this.fbAdmin.coll.SCHEMA)
        .doc(id);
      const schemaDoc = await schemaDocRef.get();

      if (!schemaDoc.exists) {
        throw new Error(`Schema with ID ${id} does not exist`);
      }
      const schemaData = schemaDoc.data() as TSchema;
      const connList = schemaData.connStringRef || [];
      const updateConnList = connList.filter((conn) => conn !== connId);
      await schemaDocRef.update({ connStringRef: updateConnList });
      this.logger.info(
        `[SchemaRepository] Deleted connection ${connId} from schema ${id}`
      );
    } catch (error) {
      this.logger.error(
        `[SchemaRepository] Error deleting connection ${connId} from schema ${id}:`,
        error.message
      );
      throw new Error(error.message || "Error deleting connection from schema");
    }
  }
  // DELETE NODE
  deleteNodeById(schemaCtxId: string, nodeId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  // DELETE EDGE
  deleteEdgeById(schemaCtxId: string, edgeId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  // DELETE INDEX
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
  // READ
  async findById(id: string): Promise<TSchemaOutRqDto | null> {
    try {
      this.logger.info(`[SchemaRepository] Finding schema by ID ${id}`);
      const schemaDoc = await this.fbAdmin.db
        .collection(this.fbAdmin.coll.SCHEMA)
        .doc(id)
        .get();
      if (!schemaDoc.exists) {
        this.logger.info(
          `[SchemaRepository] Schema with ID ${id} does not exist`
        );
        return null;
      }
      return schemaDoc.data() as TSchemaOutRqDto;
    } catch (error) {
      this.logger.error(
        `[SchemaRepository] Error finding schema by ID ${id}:`,
        error.message
      );
      throw new Error(error.message || "Error finding schema by ID");
    }
  }
  async findAll(): Promise<TSchemaOutRqDto[]> {
    try {
      this.logger.info(`[SchemaRepository] Finding all schemas`);
      const snapshot = await this.fbAdmin.db
        .collection(this.fbAdmin.coll.SCHEMA)
        .get();
      const schemas: TSchemaOutRqDto[] = [];
      snapshot.forEach((doc) => {
        schemas.push(doc.data() as TSchemaOutRqDto);
      });
      return schemas;
    } catch (error) {
      this.logger.error(
        `[SchemaRepository] Error finding all schemas:`,
        error.message
      );
      throw new Error(error.message || "Error finding all schemas");
    }
  }
  async findByConnectionFields(
    data: TReadByConnectionFieldsDto
  ): Promise<TSchemaOutRqDto | null> {
    try {
      this.logger.info(
        `[SchemaRepository] Finding schema by connection fields:`,
        data
      );
      // iterate through collection with where clauses (connStringRef is an array of objects)
      const snapshot = await this.fbAdmin.db
        .collection(this.fbAdmin.coll.SCHEMA)
        .get();

      const schemas = snapshot.docs.map((doc) => doc.data() as TSchemaOutRqDto);
      const foundSchema = schemas.find((schema) => {
        return schema.connStringRef?.some(
          (conn) =>
            conn.host === data.host &&
            conn.port === data.port &&
            conn.database === data.database &&
            conn.sid === data.sid
        );
      });
      if (!foundSchema) {
        this.logger.info(
          `[SchemaRepository] No schema found with the given connection fields`
        );
        return null;
      }
      return foundSchema;
    } catch (error) {
      this.logger.error(
        `[SchemaRepository] Error finding schema by connection fields:`,
        error.message
      );
      throw new Error(
        error.message || "Error finding schema by connection fields"
      );
    }
  }
  async findByConnId(connId: string): Promise<TSchemaOutRqDto | null> {
    try {
      this.logger.info(
        `[SchemaRepository] Finding schema by connection ID ${connId}`
      );
      const snapshot = await this.fbAdmin.db
        .collection(this.fbAdmin.coll.SCHEMA)
        .get();

      const schemas = snapshot.docs.map((doc) => doc.data() as TSchemaOutRqDto);
      const foundSchema = schemas.find((schema) =>
        schema.connStringRef?.some((conn) => conn.id === connId)
      );

      if (!foundSchema) {
        this.logger.info(
          `[SchemaRepository] No schema found with connection ID ${connId}`
        );
        return null;
      }
      return foundSchema;
    } catch (error) {
      this.logger.error(
        `[SchemaRepository] Error finding schema by connection ID ${connId}:`,
        error.message
      );
      throw new Error(error.message || "Error finding schema by connection ID");
    }
  }
}
