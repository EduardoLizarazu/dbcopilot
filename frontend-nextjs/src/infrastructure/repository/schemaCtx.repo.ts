import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { ISchemaCtxRepository } from "@/core/application/interfaces/schemaCtx.inter";
import { FirebaseAdminProvider } from "../providers/firebase/firebase-admin";
import {
  TCreateSchemaCtxBaseDto,
  TSchemaCtxBaseDto,
} from "@/core/application/dtos/schemaCtx.dto";

export class SchemaCtxRepository implements ISchemaCtxRepository {
  constructor(
    private readonly logger: ILogger,
    private firebaseAdmin: FirebaseAdminProvider
  ) {}
  async create(data: TCreateSchemaCtxBaseDto): Promise<string> {
    try {
      this.logger.info("[SchemaCtxRepository] Creating new schema context");
      const db = this.firebaseAdmin.db;
      const docRef = await db
        .collection(this.firebaseAdmin.coll.SCHEMA_CTX)
        .add({ ...data });
      this.logger.info(
        "[SchemaCtxRepository] Created schema context with ID:",
        docRef.id
      );
      await docRef.set({ id: docRef.id }, { merge: true });
      return docRef.id;
    } catch (error) {
      this.logger.error(
        "[SchemaCtxRepository] Error in create method: ",
        error.message
      );
      throw new Error(error.message || "Error creating schema context");
    }
  }
  async update(id: string, data: Partial<TSchemaCtxBaseDto>): Promise<void> {
    try {
      this.logger.info(
        "[SchemaCtxRepository] Updating schema context by ID:",
        id
      );
      const db = this.firebaseAdmin.db;
      const docRef = db.collection(this.firebaseAdmin.coll.SCHEMA_CTX).doc(id);
      await docRef.update({ ...data });
      return;
    } catch (error) {
      this.logger.error(
        "[SchemaCtxRepository] Error in update method: ",
        error.message
      );
      throw new Error(error.message || "Error updating schema context by ID");
    }
  }
  async delete(id: string): Promise<void> {
    try {
      this.logger.info(
        "[SchemaCtxRepository] Deleting schema context by ID:",
        id
      );
      const db = this.firebaseAdmin.db;
      const docRef = db.collection(this.firebaseAdmin.coll.SCHEMA_CTX).doc(id);
      await docRef.delete();
      return;
    } catch (error) {
      this.logger.error(
        "[SchemaCtxRepository] Error in delete method: ",
        error.message
      );
      throw new Error(error.message || "Error deleting schema context by ID");
    }
  }
  async findById(id: string): Promise<TSchemaCtxBaseDto | null> {
    try {
      this.logger.info(
        "[SchemaCtxRepository] Retrieving schema context by ID:",
        id
      );
      const db = this.firebaseAdmin.db;
      const docRef = db.collection(this.firebaseAdmin.coll.SCHEMA_CTX).doc(id);
      const doc = await docRef.get();
      if (!doc.exists) {
        this.logger.info(
          "[SchemaCtxRepository] No schema context found with ID:",
          id
        );
        return null;
      }
      const schemaCtx = doc.data() as TSchemaCtxBaseDto;
      return schemaCtx;
    } catch (error) {
      this.logger.error(
        "[SchemaCtxRepository] Error in findById method: ",
        error.message
      );
      throw new Error(error.message || "Error retrieving schema context by ID");
    }
  }
  async findAll(): Promise<TSchemaCtxBaseDto[]> {
    try {
      this.logger.info("[SchemaCtxRepository] Retrieving all schema contexts");
      const db = this.firebaseAdmin.db;
      const schemaCtxCollection = await db
        .collection(this.firebaseAdmin.coll.SCHEMA_CTX)
        .get();

      const schemaCtxs: TSchemaCtxBaseDto[] = [];
      schemaCtxCollection.forEach((doc) => {
        schemaCtxs.push(doc.data() as TSchemaCtxBaseDto);
      });

      return schemaCtxs;
    } catch (error) {
      this.logger.error(
        "[SchemaCtxRepository] Error in findAll method: ",
        error.message
      );
      throw new Error(error.message || "Error retrieving all schema contexts");
    }
  }
}
