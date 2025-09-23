import {
  TCreateNlqQaDto,
  TNlqQaOutRequestDto,
  TUpdateNlqQaDto,
} from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaRepository } from "@/core/application/interfaces/nlq/nlq-qa.app.inter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";

export class NlqQaAppRepository implements INlqQaRepository {
  constructor(
    private readonly logger: ILogger,
    private readonly fbAdminProvider: FirebaseAdminProvider
  ) {}

  async create(data: TCreateNlqQaDto): Promise<string> {
    try {
      const docRef = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_QA)
        .add({ ...data });
      return docRef.id;
    } catch (error) {
      this.logger.error("[NlqQaAppRepository] Error creating NLQ QA", {
        error,
      });
      throw new Error("Error creating NLQ QA");
    }
  }
  async update(id: string, data: TUpdateNlqQaDto): Promise<void> {
    try {
      await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_QA)
        .doc(id)
        .update({ ...data });
    } catch (error) {
      this.logger.error("[NlqQaAppRepository] Error updating NLQ QA", {
        error,
      });
      throw new Error("Error updating NLQ QA");
    }
  }
  async delete(id: string): Promise<void> {
    try {
      await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_QA)
        .doc(id)
        .delete();
    } catch (error) {
      this.logger.error("[NlqQaAppRepository] Error deleting NLQ QA", {
        error,
      });
      throw new Error("Error deleting NLQ QA");
    }
  }
  async findById(id: string): Promise<TNlqQaOutRequestDto | null> {
    try {
      const doc = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_QA)
        .doc(id)
        .get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() } as TNlqQaOutRequestDto;
      }
      return null;
    } catch (error) {
      this.logger.error("[NlqQaAppRepository] Error finding NLQ QA by ID", {
        error,
      });
      throw new Error("Error finding NLQ QA by ID");
    }
  }
  async findAll(): Promise<TNlqQaOutRequestDto[]> {
    try {
      const snapshot = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_QA)
        .get();
      const results: TNlqQaOutRequestDto[] = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as TNlqQaOutRequestDto);
      });
      return results;
    } catch (error) {
      this.logger.error("[NlqQaAppRepository] Error finding all NLQ QA", {
        error,
      });
      throw new Error("Error finding all NLQ QA");
    }
  }
  async softDeleteById(id: string): Promise<void> {
    try {
      // update the deleted by user to true
      await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_QA)
        .doc(id)
        .update({ userDeleted: true });
    } catch (error) {
      this.logger.error("[NlqQaAppRepository] Error soft deleting NLQ QA", {
        error,
      });
      throw new Error("Error soft deleting NLQ QA");
    }
  }
}
