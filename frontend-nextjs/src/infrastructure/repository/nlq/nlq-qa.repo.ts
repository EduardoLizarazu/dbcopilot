import { TDbConnectionOutRequestDto } from "@/core/application/dtos/dbconnection.dto";
import { TNlqQaErrorOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa-error.app.dto";
import { TNlqQaFeedbackOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";
import { TNlqQaGoodOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import {
  TCreateNlqQaDto,
  TNlqQaHistoryOutDto,
  TNlqQaOutRequestDto,
  TNlqQaWitFeedbackOutRequestDto,
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
  async findAllByUserId(userId: string): Promise<TNlqQaHistoryOutDto[]> {
    try {
      this.logger.info("[NlqQaAppRepository] Finding NLQ QA by User ID", {
        userId,
      });

      // Query NLQ QA collection where createdBy equals userId
      const db = this.fbAdminProvider.db;
      const nlqQas: TNlqQaHistoryOutDto[] = [];
      const querySnapshot = await db
        .collection(this.fbAdminProvider.coll.NLQ_QA)
        .where("createdBy", "==", userId)
        .get();

      querySnapshot.forEach((doc) => {
        nlqQas.push({ id: doc.id, ...doc.data() } as TNlqQaHistoryOutDto);
      });

      this.logger.info(
        `[NlqQaAppRepository] Found ${nlqQas.length} NLQ QA records for User ID: ${userId}`
      );
      return nlqQas;
    } catch (error) {
      this.logger.error(
        "[NlqQaAppRepository] Error finding NLQ QA by User ID",
        {
          error,
        }
      );
      throw new Error(error.message || "Error finding NLQ QA by User ID");
    }
  }
  async findAllWithUserAndFeedback(): Promise<
    TNlqQaWitFeedbackOutRequestDto[]
  > {
    try {
      // Fetch all NLQ QAs
      const nlqSnapshot = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_QA)
        .get();
      const nlqQas: TNlqQaOutRequestDto[] = [];
      nlqSnapshot.forEach((doc) => {
        nlqQas.push({ id: doc.id, ...doc.data() } as TNlqQaOutRequestDto);
      });

      this.logger.info("[NlqQaAppRepository] Fetched all NLQ QAs", {
        count: nlqQas.length,
      });

      // Find feedback (feedbackId), error (nlqErrorId), user (createdBy) for each NLQ QA
      const results: TNlqQaWitFeedbackOutRequestDto[] = [];
      for (const nlqData of nlqQas) {
        // Find the feedback related to the NLQ QA by feedbackId
        const feedbackSnapshot = await this.fbAdminProvider.db
          .collection(this.fbAdminProvider.coll.NLQ_FEEDBACKS)
          .where("nlqQaId", "==", nlqData.id)
          .get();
        const feedbacksData = feedbackSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TNlqQaFeedbackOutRequestDto[];

        this.logger.info("[NlqQaAppRepository] Fetched feedback for NLQ QA", {
          nlqQaId: nlqData.id,
          countFeedback: feedbacksData.length,
        });

        // Find the user who created the NLQ Qa By Id createdBy
        const userData = nlqData.createdBy
          ? await this.fbAdminProvider.db
              .collection(this.fbAdminProvider.coll.NLQ_USERS)
              .doc(nlqData.createdBy)
              .get()
              .then((doc) =>
                doc.exists
                  ? {
                      id: doc.id,
                      ...doc.data(),
                    }
                  : null
              )
          : null; // Return null if createdBy is invalid

        this.logger.info("[NlqQaAppRepository] Fetched user for NLQ QA", {
          nlqQaId: nlqData.id,
          userId: nlqData.createdBy,
          userExists: !!userData,
        });

        // Find error related to the NLQ QA by nlqErrorId
        const errorData = nlqData.nlqErrorId
          ? await this.fbAdminProvider.db
              .collection(this.fbAdminProvider.coll.NLQ_ERRORS)
              .doc(nlqData.nlqErrorId)
              .get()
              .then((doc) =>
                doc.exists
                  ? {
                      id: doc.id,
                      ...doc.data(),
                    }
                  : null
              )
          : null; // Return null if nlqErrorId is null or empty string

        this.logger.info("[NlqQaAppRepository] Fetched error for NLQ QA", {
          nlqQaId: nlqData.id || "-",
          nlqErrorId: nlqData.nlqErrorId || "-",
          errorExists: !!errorData,
        });

        // Find dbConnection related to the NLQ QA by dbConnectionId
        const dbConnectionData = nlqData.dbConnectionId
          ? await this.fbAdminProvider.db
              .collection(this.fbAdminProvider.coll.DB_CONNECTIONS)
              .doc(nlqData.dbConnectionId)
              .get()
              .then((doc) =>
                doc.exists
                  ? {
                      id: doc.id,
                      ...doc.data(),
                    }
                  : null
              )
          : null;

        this.logger.info(
          "[NlqQaAppRepository] Fetched dbConnection for NLQ QA",
          {
            nlqQaId: nlqData.id || "-",
            dbConnectionId: nlqData.dbConnectionId || "-",
            dbConnectionExists: !!dbConnectionData,
          }
        );

        // Find nlqQaGood by NlqQa knowledgeSourceUsedId list
        // you have to find all nlqQaGood that is on the knowledgeSourceUsedId list
        // Therefore, you need to iterate over the knowledgeSourceUsedId list and fetch each nlqQaGood
        const nlqQaGoodData = await Promise.all(
          nlqData.knowledgeSourceUsedId.map((knowledgeSourceId) =>
            this.fbAdminProvider.db
              .collection(this.fbAdminProvider.coll.NLQ_GOODS)
              .where("id", "==", knowledgeSourceId)
              .get()
              .then((snapshot) => {
                this.logger.info(
                  "[NlqQaAppRepository] Fetched nlqQaGood for NLQ QA",
                  {
                    nlqQaId: nlqData.id || "-",
                    knowledgeSourceId: knowledgeSourceId || "-",
                    countNlqQaGood: snapshot.size || 0,
                  }
                );
                return snapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                })) as TNlqQaGoodOutRequestDto;
              })
          )
        );

        results.push({
          ...nlqData,
          feedback: feedbacksData.length > 0 ? feedbacksData[0] : null,
          user: userData, // User can now be null
          error: errorData,
          dbConnection: dbConnectionData,
          nlqQaGoodUsed: nlqQaGoodData,
        });
      }

      return results;
    } catch (error) {
      this.logger.error("[NlqQaAppRepository] Error fetching all NLQ QA", {
        error: error.message,
      });
      throw new Error("Error fetching all NLQ QA");
    }
  }
  async findByIdWithUserAndFeedback(
    id: string
  ): Promise<TNlqQaWitFeedbackOutRequestDto> {
    try {
      this.logger.info("[NlqQaAppRepository] Finding NLQ QA by ID", { id });

      // Find the NLQ QA by Id
      const nlqData = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_QA)
        .doc(id)
        .get()
        .then((doc) => {
          if (!doc.exists) {
            this.logger.warn("[NlqQaAppRepository] NLQ QA not found", { id });
            throw new Error("NLQ QA not found");
          }
          this.logger.info("[NlqQaAppRepository] NLQ QA document fetched", {
            id,
            exists: doc.exists,
          });
          return { id: doc.id, ...doc.data() } as TNlqQaOutRequestDto;
        });

      // Find the feedback related to the NLQ QA by feedbackId
      const feedbackData = await this.fbAdminProvider.db
        .collection(this.fbAdminProvider.coll.NLQ_FEEDBACKS)
        .where("nlqQaId", "==", nlqData.id)
        .get()
        .then((snapshot) => {
          this.logger.info("[NlqQaAppRepository] Fetched feedback for NLQ QA", {
            nlqQaId: nlqData.id || "-",
            countFeedback: snapshot.size || 0,
          });
          const feedbacks = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as TNlqQaFeedbackOutRequestDto[];
          return feedbacks.length > 0 ? feedbacks[0] : null;
        });

      // Find the user who created the NLQ Qa By Id createdBy
      const userData = nlqData.createdBy
        ? await this.fbAdminProvider.db
            .collection(this.fbAdminProvider.coll.NLQ_USERS)
            .doc(nlqData.createdBy)
            .get()
            .then((doc) => {
              this.logger.info("[NlqQaAppRepository] Fetched user for NLQ QA", {
                nlqQaId: nlqData.id || "-",
                userId: nlqData.createdBy || "-",
                userExists: doc.exists || false,
              });
              return doc.exists
                ? {
                    id: doc.id,
                    ...doc.data(),
                  }
                : null;
            })
        : null;

      // Find error related to the NLQ QA by nlqErrorId
      const errorData = nlqData.nlqErrorId
        ? await this.fbAdminProvider.db
            .collection(this.fbAdminProvider.coll.NLQ_ERRORS)
            .doc(nlqData.nlqErrorId)
            .get()
            .then((doc) => {
              this.logger.info(
                "[NlqQaAppRepository] Fetched error for NLQ QA",
                {
                  nlqQaId: nlqData.id || "-",
                  nlqErrorId: nlqData.nlqErrorId || "-",
                  errorExists: doc.exists || false,
                }
              );
              return doc.exists
                ? ({ id: doc.id, ...doc.data() } as TNlqQaErrorOutRequestDto)
                : null;
            })
        : null;

      // Find dbConnection related to the NLQ QA by dbConnectionId
      const dbConnectionData = nlqData.dbConnectionId
        ? await this.fbAdminProvider.db
            .collection(this.fbAdminProvider.coll.DB_CONNECTIONS)
            .doc(nlqData.dbConnectionId)
            .get()
            .then((doc) => {
              this.logger.info(
                "[NlqQaAppRepository] Fetched dbConnection for NLQ QA",
                {
                  nlqQaId: nlqData.id || "-",
                  dbConnectionId: nlqData.dbConnectionId || "-",
                  dbConnectionExists: doc.exists || false,
                }
              );
              return doc.exists
                ? ({ id: doc.id, ...doc.data() } as TDbConnectionOutRequestDto)
                : null;
            })
        : null;

      // Find nlqQaGood by NlqQa knowledgeSourceUsedId list
      // you have to find all nlqQaGood that is on the knowledgeSourceUsedId list
      // Therefore, you need to iterate over the knowledgeSourceUsedId list and fetch each nlqQaGood

      const nlqQaGoodData = await Promise.all(
        nlqData.knowledgeSourceUsedId.map((knowledgeSourceId) =>
          this.fbAdminProvider.db
            .collection(this.fbAdminProvider.coll.NLQ_GOODS)
            .where("id", "==", knowledgeSourceId)
            .limit(1)
            .get()
            .then((snapshot) => {
              this.logger.info(
                "[NlqQaAppRepository] Fetched nlqQaGood for NLQ QA",
                {
                  nlqQaId: nlqData.id || "-",
                  countNlqQaGood: snapshot.size || 0,
                }
              );
              return snapshot.size === 1
                ? ({
                    id: snapshot.docs[0].id,
                    ...snapshot.docs[0].data(),
                  } as TNlqQaGoodOutRequestDto)
                : null;
            })
        )
      );

      return {
        ...nlqData,
        feedback: feedbackData, // Feedback can now be null
        user: userData, // User can now be null
        error: errorData, // Error can now be null
        dbConnection: dbConnectionData, // DB Connection can now be null
        nlqQaGoodUsed: nlqQaGoodData, // NlqQaGood can now be null
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
        .add({ ...data, id: "" }); // Temporarily set id as empty

      // Update the document with its generated ID
      await docRef.update({ id: docRef.id });

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
