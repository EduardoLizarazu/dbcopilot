import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { FirebaseAdminProvider } from "../providers/firebase/firebase-admin";
import { IDbConnectionRepository } from "@/core/application/interfaces/dbconnection.inter";
import {
  TDbConnectionOutRequestDto,
  TCreateDbConnectionDto,
  TDbConnectionOutRequestDtoWithVbd,
  TUpdateDbConnectionDto,
} from "@/core/application/dtos/dbconnection.dto";
import { TVbdOutRequestDto } from "@/core/application/dtos/vbd.dto";

export class DbConnectionRepository implements IDbConnectionRepository {
  constructor(
    private readonly logger: ILogger,
    private firebaseAdmin: FirebaseAdminProvider
  ) {}
  async create(data: TCreateDbConnectionDto): Promise<string> {
    try {
      this.logger.info("Creating DB Connection:", { ...data });

      // Use Firebase Admin SDK to insert DB Connection
      const db = this.firebaseAdmin.db;
      const dbConnDocRef = await db
        .collection(this.firebaseAdmin.coll.DB_CONNECTIONS)
        .add(data);

      await dbConnDocRef.update({ id: dbConnDocRef.id });

      this.logger.info("Created DB Connection:", {
        id: dbConnDocRef.id,
        ...data,
      });

      return dbConnDocRef.id;
    } catch (error) {
      const errorMessage =
        error.errorMessage || error.message || JSON.stringify(error);
      this.logger.error("Failed to create DB Connection:", {
        error: errorMessage,
      });
      throw new Error(`Failed to create DB Connection: ${errorMessage}`);
    }
  }
  async update(id: string, data: TUpdateDbConnectionDto): Promise<void> {
    try {
      this.logger.info("Updating DB Connection:", { id, ...data });
      // Use Firebase Admin SDK to update DB Connection
      const db = this.firebaseAdmin.db;
      await db
        .collection(this.firebaseAdmin.coll.DB_CONNECTIONS)
        .doc(id)
        .update(data);
      this.logger.info("Updated DB Connection:", { id, ...data });
      return;
    } catch (error) {
      const errorMessage =
        error.errorMessage || error.message || JSON.stringify(error);
      this.logger.error("Failed to update DB Connection:", {
        error: errorMessage,
      });
      throw new Error(`Failed to update DB Connection: ${errorMessage}`);
    }
  }
  async delete(id: string): Promise<void> {
    try {
      this.logger.info("Deleting DB Connection:", { id });
      // Use Firebase Admin SDK to delete DB Connection
      const db = this.firebaseAdmin.db;
      await db
        .collection(this.firebaseAdmin.coll.DB_CONNECTIONS)
        .doc(id)
        .delete();
      this.logger.info("Deleted DB Connection:", { id });
      return;
    } catch (error) {
      const errorMessage =
        error.errorMessage || error.message || JSON.stringify(error);
      this.logger.error("Failed to delete DB Connection:", {
        error: errorMessage,
      });
      throw new Error(`Failed to delete DB Connection: ${errorMessage}`);
    }
  }
  async findByFields(
    data: Partial<TCreateDbConnectionDto>
  ): Promise<TDbConnectionOutRequestDto | null> {
    try {
      const db = this.firebaseAdmin.db;
      const snapshotQuery = db
        .collection(this.firebaseAdmin.coll.DB_CONNECTIONS)
        .where("type", "==", data.type)
        .where("host", "==", data.host)
        .where("port", "==", data.port)
        .where("database", "==", data.database)
        .where("username", "==", data.username);

      if (data.sid) {
        snapshotQuery.where("sid", "==", data.sid);
      }

      const snapshot = await snapshotQuery.get();

      if (snapshot.empty) {
        this.logger.info("No DB Connection found by fields:", { ...data });
        return null;
      }

      const doc = snapshot.docs[0];
      const result = {
        id: doc.id,
        ...doc.data(),
      } as TDbConnectionOutRequestDto;
      this.logger.info("Found DB Connection by fields:", { ...data, result });
      return result;
    } catch (error) {
      const errorMessage =
        error.errorMessage || error.message || JSON.stringify(error);
      this.logger.error("Failed to find DB Connection by fields:", {
        error: errorMessage,
      });
      throw new Error(
        `Failed to find DB Connection by fields: ${errorMessage}`
      );
    }
  }
  async findAllWithVbd(): Promise<TDbConnectionOutRequestDtoWithVbd[]> {
    try {
      this.logger.info("Finding all DB Connections with VBD");
      // 1. Get all db connections
      const db = this.firebaseAdmin.db;
      const dbConnDocs = await db
        .collection(this.firebaseAdmin.coll.DB_CONNECTIONS)
        .get();

      if (dbConnDocs.empty) {
        this.logger.info("No DB Connections found");
        return [];
      }

      const dbConnection;
    } catch (error) {
      const errorMessage =
        error.errorMessage || error.message || JSON.stringify(error);
      this.logger.error("Failed to find all DB Connections with VBD:", {
        error: errorMessage,
      });
      throw new Error(
        `Failed to find all DB Connections with VBD: ${errorMessage}`
      );
    }
  }
  async findWithVbdById(
    id: string
  ): Promise<TDbConnectionOutRequestDtoWithVbd | null> {
    try {
      // 1. Get DB connection by ID
      const dbConn = await this.findById(id);
      if (!dbConn) {
        this.logger.info("No DB Connection found with VBD by ID:", { id });
        return null;
      }
      // 2. Get associated VBD Splitter with dbConn.id_vbd_splitter
      const db = this.firebaseAdmin.db;
      let vbd: TVbdOutRequestDto | null = null;
      if (dbConn.id_vbd_splitter) {
        const vbdDoc = await db
          .collection(this.firebaseAdmin.coll.VBD_SPLITTERS)
          .doc(dbConn.id_vbd_splitter)
          .get();
        if (vbdDoc.exists) {
          vbd = {
            id: vbdDoc.id,
            ...vbdDoc.data(),
          } as TVbdOutRequestDto;
        }
      }

      // 3. Get associated User with dbConn.createdBy
      let user: { id: string; email: string } | null = null;
      if (dbConn.createdBy) {
        const userDoc = await db
          .collection(this.firebaseAdmin.coll.NLQ_USERS)
          .doc(dbConn.createdBy)
          .get();
        if (userDoc.exists) {
          user = {
            id: userDoc.id,
            email: userDoc.data().email,
          };
        }
      }
      const dbConnWithVbd: TDbConnectionOutRequestDtoWithVbd = {
        ...dbConn,
        vbd_splitter: vbd,
        user,
      };

      return dbConnWithVbd;
    } catch (error) {
      const errorMessage =
        error.errorMessage || error.message || JSON.stringify(error);
      this.logger.error("Failed to find DB Connection with VBD by ID:", {
        error: errorMessage,
      });
      throw new Error(
        `Failed to find DB Connection with VBD by ID: ${errorMessage}`
      );
    }
  }
  async findById(id: string): Promise<TDbConnectionOutRequestDto | null> {
    try {
      // Use Firebase Admin SDK to fetch DB Connection by ID
      const db = this.firebaseAdmin.db;
      const dbConnDoc = await db
        .collection(this.firebaseAdmin.coll.DB_CONNECTIONS)
        .doc(id)
        .get();
      if (!dbConnDoc.exists) {
        return null;
      }
      return {
        id: dbConnDoc.id,
        ...dbConnDoc.data(),
      } as TDbConnectionOutRequestDto;
    } catch (error) {
      const errorMessage =
        error.errorMessage || error.message || JSON.stringify(error);
      this.logger.error("Failed to find DB Connection by ID:", {
        error: errorMessage,
      });
      throw new Error(`Failed to find DB Connection by ID: ${errorMessage}`);
    }
  }
  async findAll(): Promise<TDbConnectionOutRequestDto[]> {
    try {
      const db = this.firebaseAdmin.db;
      const dbConnDocs = await db
        .collection(this.firebaseAdmin.coll.DB_CONNECTIONS)
        .get();
      return dbConnDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TDbConnectionOutRequestDto[];
    } catch (error) {
      const errorMessage =
        error.errorMessage || error.message || JSON.stringify(error);
      this.logger.error("Failed to find all DB Connections:", {
        error: errorMessage,
      });
      throw new Error(`Failed to find all DB Connections: ${errorMessage}`);
    }
  }
  async findByName(name: string): Promise<TDbConnectionOutRequestDto | null> {
    try {
      const db = this.firebaseAdmin.db;
      const dbConnDocs = await db
        .collection(this.firebaseAdmin.coll.DB_CONNECTIONS)
        .where("name", "==", name)
        .get();
      if (dbConnDocs.empty) {
        return null;
      }
      const doc = dbConnDocs.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as TDbConnectionOutRequestDto;
    } catch (error) {
      const errorMessage =
        error.errorMessage || error.message || JSON.stringify(error);
      this.logger.error("Failed to find DB Connection by name:", {
        error: errorMessage,
      });
      throw new Error(`Failed to find DB Connection by name: ${errorMessage}`);
    }
  }
}
