import {
  TCreateNlqQaGoodDetailsDto,
  TNlqQaGoodDetailsOutRequestDto,
  TUpdateNlqQaGoodDetailsDto,
} from "@/core/application/dtos/nlq/nlq-qa-good-detail.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaGoodDetailsRepository } from "@/core/application/interfaces/nlq/nlq-qa-good-details.app.inter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";

export class NlqQaGoodDetailsRepository implements INlqQaGoodDetailsRepository {
  constructor(
    private readonly logger: ILogger,
    private fbAdminProvider: FirebaseAdminProvider
  ) {}
  async create(data: TCreateNlqQaGoodDetailsDto): Promise<string> {
    try {
      // Use Firebase Admin SDK to insert NLQ QA Good Details
      const goodDetailsDocRef = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_GOODS_DETAILS)
        .add(data);
      this.logger.info(
        "NlqQaGoodDetailsRepository: Created NLQ QA Good Details:",
        {
          id: goodDetailsDocRef.id,
          ...data,
        }
      );
      return goodDetailsDocRef.id;
    } catch (error) {
      this.logger.error("Error creating NLQ QA Good Details", error);
      throw new Error("Error creating NLQ QA Good Details");
    }
  }
  async update(id: string, data: TUpdateNlqQaGoodDetailsDto): Promise<void> {
    try {
      const goodDetailsDocRef = this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_GOODS_DETAILS)
        .doc(id);
      await goodDetailsDocRef.update({ ...data });
      this.logger.info(
        "NlqQaGoodDetailsRepository: Updated NLQ QA Good Details:",
        {
          ...data,
        }
      );
    } catch (error) {
      this.logger.error("Error updating NLQ QA Good Details", error);
      throw new Error("Error updating NLQ QA Good Details");
    }
  }
  async delete(id: string): Promise<void> {
    try {
      const goodDetailsDocRef = this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_GOODS_DETAILS)
        .doc(id);
      await goodDetailsDocRef.delete();
      this.logger.info(
        "NlqQaGoodDetailsRepository: Deleted NLQ QA Good Details:",
        {
          id,
        }
      );
    } catch (error) {
      this.logger.error("Error deleting NLQ QA Good Details", error);
      throw new Error("Error deleting NLQ QA Good Details");
    }
  }
  async findById(id: string): Promise<TNlqQaGoodDetailsOutRequestDto | null> {
    try {
      const goodDetailsDoc = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_GOODS_DETAILS)
        .doc(id)
        .get();
      if (!goodDetailsDoc.exists) {
        return null;
      }
      return {
        id: goodDetailsDoc.id,
        ...goodDetailsDoc.data(),
      } as TNlqQaGoodDetailsOutRequestDto;
    } catch (error) {
      this.logger.error("Error finding NLQ QA Good Details by ID", error);
      throw new Error("Error finding NLQ QA Good Details by ID");
    }
  }
  async findAll(): Promise<TNlqQaGoodDetailsOutRequestDto[]> {
    try {
      const goodDetailsSnapshot = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_GOODS_DETAILS)
        .get();
      return goodDetailsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TNlqQaGoodDetailsOutRequestDto[];
    } catch (error) {
      this.logger.error("Error finding all NLQ QA Good Details", error);
      throw new Error("Error finding all NLQ QA Good Details");
    }
  }
}
