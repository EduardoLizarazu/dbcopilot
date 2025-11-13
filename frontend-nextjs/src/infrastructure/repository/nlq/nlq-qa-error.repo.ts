import {
  TCreateNlqQaErrorDto,
  TNlqQaErrorOutRequestDto,
  TUpdateNlqQaErrorDto,
} from "@/core/application/dtos/nlq/nlq-qa-error.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaErrorRepository } from "@/core/application/interfaces/nlq/nlq-qa-error.app.inter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";

export class NlqQaErrorRepository implements INlqQaErrorRepository {
  constructor(
    private readonly logger: ILogger,
    private readonly fbAdminProvider: FirebaseAdminProvider
  ) {}

  async create(data: TCreateNlqQaErrorDto): Promise<string> {
    try {
      this.logger.info("[NlqQaErrorRepository] Creating NLQ QA Error", data);
      // On nlq-error collection, create a new document with the data provided
      const docRef = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_ERRORS)
        .add({
          ...data,
        });

      await docRef.update({ id: docRef.id });

      this.logger.info(
        `[NlqQaErrorRepository] NLQ QA Error created with ID: ${docRef.id}`
      );

      return docRef.id;
    } catch (error) {
      this.logger.error(
        "[NlqQaErrorRepository] Error creating NLQ QA Error",
        error
      );
      throw new Error("Error creating NLQ QA Error");
    }
  }
  async update(id: string, data: TUpdateNlqQaErrorDto): Promise<void> {
    try {
      await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_ERRORS)
        .doc(id)
        .update({ ...data });
    } catch (error) {
      this.logger.error(
        "[NlqQaErrorRepository] Error updating NLQ QA Error",
        error
      );
      throw new Error("Error updating NLQ QA Error");
    }
  }
  async delete(id: string): Promise<void> {
    try {
      await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_ERRORS)
        .doc(id)
        .delete();
    } catch (error) {
      this.logger.error(
        "[NlqQaErrorRepository] Error deleting NLQ QA Error",
        error
      );
      throw new Error("Error deleting NLQ QA Error");
    }
  }
  async findById(id: string): Promise<TNlqQaErrorOutRequestDto | null> {
    try {
      const doc = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_ERRORS)
        .doc(id)
        .get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() } as TNlqQaErrorOutRequestDto;
      }
      return null;
    } catch (error) {
      this.logger.error(
        "[NlqQaErrorRepository] Error finding NLQ QA Error by ID",
        error
      );
      throw new Error("Error finding NLQ QA Error by ID");
    }
  }
  async findAll(): Promise<TNlqQaErrorOutRequestDto[]> {
    try {
      const snapshot = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_ERRORS)
        .get();
      const errors: TNlqQaErrorOutRequestDto[] = [];
      snapshot.forEach((doc) => {
        errors.push({ id: doc.id, ...doc.data() } as TNlqQaErrorOutRequestDto);
      });
      return errors;
    } catch (error) {
      this.logger.error("Error finding all NLQ QA Errors", error);
      throw new Error("Error finding all NLQ QA Errors");
    }
  }

  async findByUserId(uid: string): Promise<TNlqQaErrorOutRequestDto[]> {
    try {
      const snapshot = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_ERRORS)
        .where("createdBy", "==", uid)
        .get();
      const errors: TNlqQaErrorOutRequestDto[] = [];
      snapshot.forEach((doc) => {
        errors.push({ id: doc.id, ...doc.data() } as TNlqQaErrorOutRequestDto);
      });
      return errors;
    } catch (error) {
      this.logger.error("Error finding NLQ QA Errors by user ID", error);
      throw new Error("Error finding NLQ QA Errors by user ID");
    }
  }
}
