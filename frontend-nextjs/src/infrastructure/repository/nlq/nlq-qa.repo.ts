import { TNlqQaErrorOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa-error.app.dto";
import { TNlqQaFeedbackOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";
import {
  TCreateNlqQaDto,
  TNlqQaOutRequestDto,
  TNlqQaWitFeedbackOutRequestDto,
  TUpdateNlqQaDto,
} from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TUserOutputRequestDto } from "@/core/application/dtos/user.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaRepository } from "@/core/application/interfaces/nlq/nlq-qa.app.inter";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";

export class NlqQaAppRepository implements INlqQaRepository {
  constructor(
    private readonly logger: ILogger,
    private readonly fbAdminProvider: FirebaseAdminProvider
  ) {}
  async findByIdWithUserAndFeedback(
    id: string
  ): Promise<TNlqQaWitFeedbackOutRequestDto> {
    try {
      // Find the NLQ QA by Id
      const nlqDoc = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_QA)
        .doc(id)
        .get();

      if (!nlqDoc.exists) {
        this.logger.warn("[NlqQaAppRepository] NLQ QA not found", { id });
        throw new Error("NLQ QA not found");
      }

      const nlqData = {
        id: nlqDoc.id,
        ...nlqDoc.data(),
      } as TNlqQaOutRequestDto;

      // Find the feedback related to the NLQ QA by feedbackId
      const feedbackSnapshot = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_FEEDBACKS)
        .where("nlqQaId", "==", nlqData.id)
        .get();
      const feedbacksData = feedbackSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TNlqQaFeedbackOutRequestDto[];

      // Find the user who created the NLQ Qa By Id createdBy
      const userDoc = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_USERS)
        .doc(nlqData.createdBy)
        .get();

      if (!userDoc.exists) {
        this.logger.warn("[NlqQaAppRepository] User not found", {
          createdBy: nlqData.createdBy,
        });
        throw new Error("User not found");
      }

      const userData = {
        id: userDoc.id,
        ...userDoc.data(),
      } as TUserOutputRequestDto;

      // Find error related to the NLQ QA by nlqErrorId
      const errorDoc = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_ERRORS)
        .doc(nlqData.nlqErrorId)
        .get();
      const errorData = errorDoc.exists
        ? ({ id: errorDoc.id, ...errorDoc.data() } as TNlqQaErrorOutRequestDto)
        : null;

      return {
        ...nlqData,
        feedback: feedbacksData.length > 0 ? feedbacksData[0] : null,
        user: userData,
        error: errorData,
      };
    } catch (error) {
      this.logger.error("[NlqQaAppRepository] Error finding NLQ QA by ID", {
        error,
      });
      throw new Error("Error finding NLQ QA by ID");
    }
  }

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
