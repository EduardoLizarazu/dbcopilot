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
  update(id: string, data: TUpdateNlqQaDto): Promise<void> {
    throw new Error("Method not implemented.");
  }
  delete(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  findById(id: string): Promise<TNlqQaOutRequestDto | null> {
    throw new Error("Method not implemented.");
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
  findByQuestion(question: string): Promise<TNlqQaOutRequestDto[]> {
    throw new Error("Method not implemented.");
  }
  async softDeleteById(id: string): Promise<void> {
    try {
      // update the deleted by user to true
      await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_QA)
        .doc(id)
        .update({ deletedByUser: true });
    } catch (error) {
      this.logger.error("[NlqQaAppRepository] Error soft deleting NLQ QA", {
        error,
      });
      throw new Error("Error soft deleting NLQ QA");
    }
  }
}
