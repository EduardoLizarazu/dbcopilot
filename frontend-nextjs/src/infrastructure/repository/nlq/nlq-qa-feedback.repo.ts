import {
  TCreateNlqQaFeedbackDto,
  TNlqQaFeedbackOutRequestDto,
  TUpdateNlqQaFeedbackDto,
} from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaFeedbackRepository } from "@/core/application/interfaces/nlq/nlq-qa-feedback.app.inter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";

export class NlqQaFeedbackRepository implements INlqQaFeedbackRepository {
  constructor(
    private readonly logger: ILogger,
    private firebaseAdmin: FirebaseAdminProvider
  ) {}
  async create(data: TCreateNlqQaFeedbackDto): Promise<string> {
    try {
      // Use Firebase Admin SDK to insert NLQ QA Feedback
      const feedbackDocRef = await this.firebaseAdmin.db
        .collection(this.firebaseAdmin.coll.NLQ_FEEDBACKS)
        .add(data);
      this.logger.info("NlqQaFeedbackRepository: Created NLQ QA Feedback:", {
        id: feedbackDocRef.id,
        ...data,
      });
      return feedbackDocRef.id;
    } catch (error) {
      this.logger.error(
        "NlqQaFeedbackRepository: Error creating NLQ QA Feedback:",
        error
      );
      throw new Error("Error creating NLQ QA Feedback");
    }
  }
  async update(id: string, data: TUpdateNlqQaFeedbackDto): Promise<void> {
    try {
      await this.firebaseAdmin.db
        .collection(this.firebaseAdmin.coll.NLQ_FEEDBACKS)
        .doc(id)
        .update({ ...data });
      this.logger.info("NlqQaFeedbackRepository: Updated NLQ QA Feedback:", {
        ...data,
      });
    } catch (error) {
      this.logger.error(
        "NlqQaFeedbackRepository: Error updating NLQ QA Feedback:",
        error
      );
      throw new Error("Error updating NLQ QA Feedback");
    }
  }
  async delete(id: string): Promise<void> {
    try {
      await this.firebaseAdmin.db
        .collection(this.firebaseAdmin.coll.NLQ_FEEDBACKS)
        .doc(id)
        .delete();
      this.logger.info("NlqQaFeedbackRepository: Deleted NLQ QA Feedback:", {
        id,
      });
    } catch (error) {
      this.logger.error(
        "NlqQaFeedbackRepository: Error deleting NLQ QA Feedback:",
        error
      );
      throw new Error("Error deleting NLQ QA Feedback");
    }
  }
  async findByIsItGood(
    isGood: boolean
  ): Promise<TNlqQaFeedbackOutRequestDto[]> {
    try {
      const snapshot = await this.firebaseAdmin.db
        .collection(this.firebaseAdmin.coll.NLQ_FEEDBACKS)
        .where("isGood", "==", isGood)
        .get();
      const feedbacks: TNlqQaFeedbackOutRequestDto[] = [];
      snapshot.forEach((doc) => {
        feedbacks.push({
          id: doc.id,
          ...doc.data(),
        } as TNlqQaFeedbackOutRequestDto);
      });
      return feedbacks;
    } catch (error) {
      this.logger.error(
        "NlqQaFeedbackRepository: Error finding NLQ QA Feedback by isGood:",
        error
      );
      throw new Error("Error finding NLQ QA Feedback by isGood");
    }
  }
  async findById(id: string): Promise<TNlqQaFeedbackOutRequestDto | null> {
    try {
      const feedbackDoc = this.firebaseAdmin.db
        .collection(this.firebaseAdmin.coll.NLQ_FEEDBACKS)
        .doc(id);
      const feedbackData = await feedbackDoc.get();
      if (feedbackData.exists) {
        return {
          id: feedbackData.id,
          ...feedbackData.data(),
        } as TNlqQaFeedbackOutRequestDto;
      }
      return null;
    } catch (error) {
      this.logger.error(
        "NlqQaFeedbackRepository: Error finding NLQ QA Feedback by ID:",
        error
      );
      throw new Error("Error finding NLQ QA Feedback by ID");
    }
  }
  async findAll(): Promise<TNlqQaFeedbackOutRequestDto[]> {
    try {
      const snapshot = await this.firebaseAdmin.db
        .collection(this.firebaseAdmin.coll.NLQ_FEEDBACKS)
        .get();
      const feedbacks: TNlqQaFeedbackOutRequestDto[] = [];
      snapshot.forEach((doc) => {
        feedbacks.push({
          id: doc.id,
          ...doc.data(),
        } as TNlqQaFeedbackOutRequestDto);
      });
      return feedbacks;
    } catch (error) {
      this.logger.error(
        "NlqQaFeedbackRepository: Error finding all NLQ QA Feedback:",
        error
      );
      throw new Error("Error finding all NLQ QA Feedback");
    }
  }
}
