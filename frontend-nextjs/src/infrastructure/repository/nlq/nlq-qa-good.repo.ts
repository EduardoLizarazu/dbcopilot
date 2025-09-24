import {
  TCreateNlqQaGoodDto,
  TNlqQaGoodOutRequestDto,
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
  async create(data: TCreateNlqQaGoodDto): Promise<string> {
    try {
      // Use Firebase Admin SDK to insert NLQ QA Good
      const goodDocRef = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_GOODS)
        .add(data);
      this.logger.info("[NlqQaGoodRepository] Created NLQ QA Good:", {
        id: goodDocRef.id,
        ...data,
      });
      return goodDocRef.id;
    } catch (error) {
      this.logger.error(
        "[NlqQaGoodRepository] Error creating NLQ QA Good",
        error
      );
      throw new Error("Error creating NLQ QA Good");
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
        error
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
}
