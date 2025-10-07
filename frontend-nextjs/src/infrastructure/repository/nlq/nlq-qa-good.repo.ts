import {
  TCreateNlqQaGoodDto,
  TNlqQaGoodOutRequestDto,
  TNlqQaGoodOutWithUserAndConnRequestDto,
  TUpdateNlqQaGoodDto,
} from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "@/core/application/interfaces/nlq/nlq-qa-good.app.inter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";

export class NlqQaGoodRepository implements INlqQaGoodRepository {
  constructor(
    private readonly logger: ILogger,
    private readonly fbAdminProvider: FirebaseAdminProvider
  ) {}

  async switchSoftDelete(id: string): Promise<void> {
    try {
      const record = await this.findById(id); // Ensure the record exists
      if (!record) {
        throw new Error("NLQ QA Good not found");
      }
      await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_GOODS)
        .doc(id)
        .update({ isDelete: !record.isDelete });
    } catch (error) {
      this.logger.error(
        "[NlqQaGoodRepository] Error soft deleting NLQ QA Good",
        error.message
      );
      throw new Error("Error soft deleting NLQ QA Good");
    }
  }

  async create(data: TCreateNlqQaGoodDto): Promise<string> {
    try {
      // Use Firebase Admin SDK to insert NLQ QA Good
      const goodDocRef = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_GOODS)
        .add(data);

      const createdId = goodDocRef.id;
      // Update the document with its generated ID
      await goodDocRef.update({ id: createdId });

      this.logger.info("[NlqQaGoodRepository] Created NLQ QA Good:", {
        id: goodDocRef.id,
        ...data,
      });
      return goodDocRef.id;
    } catch (error) {
      this.logger.error(
        "[NlqQaGoodRepository] Error creating NLQ QA Good",
        error.message
      );
      throw new Error("Error creating NLQ QA Good: " + error.message);
    }
  }
  async update(id: string, data: TUpdateNlqQaGoodDto): Promise<void> {
    try {
      await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_GOODS)
        .doc(id)
        .update({ ...data });
      this.logger.info("[NlqQaGoodRepository] Updated NLQ QA Good:", {
        ...data,
      });
    } catch (error) {
      this.logger.error(
        "[NlqQaGoodRepository] Error updating NLQ QA Good",
        error.message
      );
      throw new Error("Error updating NLQ QA Good");
    }
  }
  async delete(id: string): Promise<void> {
    try {
      await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_GOODS)
        .doc(id)
        .delete();
      this.logger.info("[NlqQaGoodRepository] Deleted NLQ QA Good:", { id });
    } catch (error) {
      this.logger.error(
        "[NlqQaGoodRepository] Error deleting NLQ QA Good",
        error
      );
      throw new Error("Error deleting NLQ QA Good");
    }
  }

  async findByUserId(uid: string): Promise<TNlqQaGoodOutRequestDto[]> {
    try {
      const snapshot = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_GOODS)
        .where("createdBy", "==", uid)
        .get();
      const goods: TNlqQaGoodOutRequestDto[] = [];
      snapshot.forEach((doc) => {
        goods.push({ id: doc.id, ...doc.data() } as TNlqQaGoodOutRequestDto);
      });
      return goods;
    } catch (error) {
      this.logger.error(
        "[NlqQaGoodRepository] Error finding NLQ QA Goods by user ID",
        error
      );
      throw new Error("Error finding NLQ QA Goods by user ID");
    }
  }
  async findById(id: string): Promise<TNlqQaGoodOutRequestDto | null> {
    try {
      const doc = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_GOODS)
        .doc(id)
        .get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() } as TNlqQaGoodOutRequestDto;
    } catch (error) {
      this.logger.error(
        "[NlqQaGoodRepository] Error finding NLQ QA Good by ID",
        error
      );
      throw new Error("Error finding NLQ QA Good by ID");
    }
  }
  async findAll(): Promise<TNlqQaGoodOutRequestDto[]> {
    try {
      const snapshot = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_GOODS)
        .get();
      const goods: TNlqQaGoodOutRequestDto[] = [];
      snapshot.forEach((doc) => {
        goods.push({ id: doc.id, ...doc.data() } as TNlqQaGoodOutRequestDto);
      });
      return goods;
    } catch (error) {
      this.logger.error(
        "[NlqQaGoodRepository] Error finding all NLQ QA Goods",
        error
      );
      throw new Error("Error finding all NLQ QA Goods");
    }
  }
  async findAllWithUserAndConn(): Promise<
    TNlqQaGoodOutWithUserAndConnRequestDto[]
  > {
    try {
      // 1. Fetch all nlq qa goods
      const snapshot = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_GOODS)
        .get();
      const goods: TNlqQaGoodOutWithUserAndConnRequestDto[] = [];

      // 2. Iterate and fetch user for each good based on createdBy and fetch connection with dbConnectionId
      for (const doc of snapshot.docs) {
        const data = { id: doc.id, ...doc.data() } as TNlqQaGoodOutRequestDto;
        let user = null;
        let connection = null;
        if (data.questionBy) {
          const userDoc = await this.fbAdminProvider.db
            .collection(this.fbAdminProvider.coll.NLQ_USERS)
            .doc(data.questionBy)
            .get();
          user = userDoc.exists
            ? { id: userDoc.id, email: userDoc.data().email }
            : null;
        } else if (data.createdBy) {
          const userDoc = await this.fbAdminProvider.db
            .collection(this.fbAdminProvider.coll.NLQ_USERS)
            .doc(data.createdBy)
            .get();
          user = userDoc.exists
            ? { id: userDoc.id, email: userDoc.data().email }
            : null;
        }
        if (data.dbConnectionId) {
          const connDoc = await this.fbAdminProvider.db
            .collection(this.fbAdminProvider.coll.DB_CONNECTIONS)
            .doc(data.dbConnectionId)
            .get();
          connection = connDoc.exists
            ? { id: connDoc.id, ...connDoc.data() }
            : null;
        }
        goods.push({ ...data, user, dbConnection: connection });
      }
      return goods;
    } catch (error) {
      this.logger.error(
        "[NlqQaGoodRepository] Error finding all NLQ QA Goods with user",
        error
      );
      throw new Error("Error finding all NLQ QA Goods with user");
    }
  }
  async findWithUserAndConnById(
    id: string
  ): Promise<TNlqQaGoodOutWithUserAndConnRequestDto | null> {
    try {
      // 1. Fetch the nlq qa good by ID
      const doc = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_GOODS)
        .doc(id)
        .get();

      if (!doc.exists) {
        return null;
      }

      const data = { id: doc.id, ...doc.data() } as TNlqQaGoodOutRequestDto;

      // 2. Fetch user based on createdBy and fetch connection with dbConnectionId
      let user = null;
      let connection = null;
      if (data.questionBy) {
        const userDoc = await this.fbAdminProvider.db
          .collection(this.fbAdminProvider.coll.NLQ_USERS)
          .doc(data.questionBy)
          .get();
        user = userDoc.exists
          ? { id: userDoc.id, email: userDoc.data().email }
          : null;
      } else if (data.createdBy) {
        const userDoc = await this.fbAdminProvider.db
          .collection(this.fbAdminProvider.coll.NLQ_USERS)
          .doc(data.createdBy)
          .get();
        user = userDoc.exists
          ? { id: userDoc.id, email: userDoc.data().email }
          : null;
      }
      if (data.dbConnectionId) {
        const connDoc = await this.fbAdminProvider.db
          .collection(this.fbAdminProvider.coll.DB_CONNECTIONS)
          .doc(data.dbConnectionId)
          .get();
        connection = connDoc.exists
          ? { id: connDoc.id, ...connDoc.data() }
          : null;
      }

      return { ...data, user, dbConnection: connection };
    } catch (error) {
      this.logger.error(
        "[NlqQaGoodRepository] Error finding NLQ QA Good with user by ID",
        error
      );
      throw new Error("Error finding NLQ QA Good with user by ID");
    }
  }
}
