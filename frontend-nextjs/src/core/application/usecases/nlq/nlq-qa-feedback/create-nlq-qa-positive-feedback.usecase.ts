import {
  EnumDecision,
  TCreateNlqQaFeedbackDto,
  TNlqQaFeedbackOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";
import { NlqQaGoodWithExecutionStatus } from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ISimpleHashQueryHelp } from "@/core/application/helps/simple-hash-query.help";
import { ISimpleHashQuestionAndQueryHelp } from "@/core/application/helps/simple-hash-question-and-query.help";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaQueryGenerationPort } from "@/core/application/ports/nlq-qa-query-generation.port";
import { IReadDbConnectionWithSplitterAndSchemaQueryStep } from "@/core/application/steps/dbconn/read-dbconnection-with-splitter-and-schema-query.usecase.step";
import { IGenCurateJudgePositiveFbStep } from "@/core/application/steps/genQuery/gen-prune-judge-positive-fb.step";
import { IGenTableColumnsStep } from "@/core/application/steps/genTepology/gen-table-columns.step";
import { IAddToTheKnowledgeBaseStep } from "@/core/application/steps/knowledgeBased/add-to-knowledge-base.step";
import { IDeleteOnKnowledgeBaseByIdStep } from "@/core/application/steps/knowledgeBased/delete-on-knowledge-base-by-id.step";
import { ISearchSimilarQuestionOnKnowledgeBaseStep } from "@/core/application/steps/knowledgeBased/search-similar-question-on-knowledge-base.step";
import { ICreateNlqQaGoodStep } from "@/core/application/steps/nlq-qa-good/create-nlq-qa-good.step";
import { IDeleteNlqQaGoodStep } from "@/core/application/steps/nlq-qa-good/delete-nlq-qa-good.step";
import { IUpdateNlqQaGoodStep } from "@/core/application/steps/nlq-qa-good/update-nlq-qa-good.step";
import { IReadNlqQaByIdStep } from "@/core/application/steps/nlq-qa/read-nlq-qa-by-id.step";
import { IUpdateNlqQaGoodFieldFromGoodStep } from "@/core/application/steps/nlq-qa/update-nlq-qa-good-field-from-good.step";

/**
 * Use case interface for curating positive feedback in NLQ QA:
 * 0. Validate input data.
 * 1. Check if positive feedback exists for the given NLQ QA ID.
 * 2. If check if isGood is true, create positive feedback entry or dbConnectionId exist, else error.
 * 3. With the nlqQa retrieve the connectionDb used with the namespace of knowledge source.
 * 4. With the namespace retrieve top-1 relevant query from the vector DB according to the question.
 * 4.1 If hash of question+query matches existing, discard new query.
 * 4.2 If score is above threshold (<0.90), then save it as new relevant query.
 * 4.3 If score is below threshold (>0.95), then compare the new query with the existing one.
 * 4.4 If they are identical, discard the new query.
 * 4.5 If there is a conflict, use the LLM as Judge to decide: replace existing, keep both, discard new.
 * 5. Decision EnumDecision:
 *    - REPLACE = 0
 *    - KEEP_BOTH = 1
 *    - DISCARD_NEW = 2
 * 6. Return success or error message.
 */

export interface ICreateNlqQaPositiveFeedbackUseCase {
  execute(
    data: TCreateNlqQaFeedbackDto
  ): Promise<TResponseDto<TNlqQaFeedbackOutRequestDto>>;
}

export class CreateNlqQaPositiveFeedbackUseCase
  implements ICreateNlqQaPositiveFeedbackUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly readNlqQaByIdStep: IReadNlqQaByIdStep,
    private readonly readDbConnWithSplitterStep: IReadDbConnectionWithSplitterAndSchemaQueryStep,
    private readonly hashQuestionAndQueryHelp: ISimpleHashQuestionAndQueryHelp,
    private readonly hashQueryHelp: ISimpleHashQueryHelp,
    private readonly searchKnowledgeSourceQueriesStep: ISearchSimilarQuestionOnKnowledgeBaseStep,
    private readonly createNlqQaGoodStep: ICreateNlqQaGoodStep,
    private readonly updateNlqQaGoodByIdStep: IUpdateNlqQaGoodStep,
    private readonly addToKnowledgeBaseStep: IAddToTheKnowledgeBaseStep,
    private readonly deleteOnKnowledgeBaseByIdStep: IDeleteOnKnowledgeBaseByIdStep,
    private readonly deleteNlqQaGoodByIdStep: IDeleteNlqQaGoodStep,
    private readonly updateNlqQaGoodFieldFromGoodByIdStep: IUpdateNlqQaGoodFieldFromGoodStep,
    private readonly genTableColumnsStep: IGenTableColumnsStep,
    private readonly genCurateJudgePositiveFbStep: IGenCurateJudgePositiveFbStep
  ) {}
  async execute(
    data: TCreateNlqQaFeedbackDto
  ): Promise<TResponseDto<TNlqQaFeedbackOutRequestDto>> {
    try {
      let decision: EnumDecision | null = null;
      // 0. Validate input data.
      if (!data?.nlqQaId || data?.isGood !== true) {
        this.logger.error(
          "[ICuratePositiveFeedbackUseCase] Invalid input data.",
          data
        );
        return {
          success: false,
          message: "Invalid input data",
          data: null,
        };
      }

      // 1. Retrieve NLQ QA by ID.
      const nlqQa = await this.readNlqQaByIdStep.run(data.nlqQaId);
      if (!nlqQa) {
        this.logger.error(
          `[ICuratePositiveFeedbackUseCase] NLQ QA with ID ${data.nlqQaId} not found.`
        );
        return {
          success: false,
          message: `NLQ QA not found.`,
          data: null,
        };
      }

      //  2. If check if isGood is true, create positive feedback entry, else error or dbConnection does not exist.
      if (
        !nlqQa?.isGood ||
        !nlqQa?.dbConnectionId ||
        !nlqQa?.question ||
        !nlqQa?.query
      ) {
        this.logger.error(
          `[ICuratePositiveFeedbackUseCase] NLQ QA a field is missing`,
          nlqQa
        );
        return {
          success: false,
          message: `NLQ QA is missing required fields for positive feedback curation.`,
          data: null,
        };
      }

      // 2.0.0 Generate table columns from query of NLQ QA
      const currentNlqQaTableColumns = await this.genTableColumnsStep.run({
        query: nlqQa.query,
      });

      //   2.1 Generate hash for question and query.
      const currentHash = await this.hashQuestionAndQueryHelp.help({
        question: nlqQa.question,
        query: nlqQa.query,
      });

      // 2.2 Generate hash for the query alone.
      const currentQueryHash = await this.hashQueryHelp.help({
        query: nlqQa.query,
      });
      const queryHash = currentQueryHash.queryHash;

      // 3. With the nlqQa retrieve the connectionDb used with the namespace of knowledge source.
      const dbConn = await this.readDbConnWithSplitterStep.run({
        dbConnectionId: nlqQa.dbConnectionId,
      });

      //   3.1 Check if splitter name exists
      if (!dbConn?.vbd_splitter?.name) {
        this.logger.error(
          "[ICuratePositiveFeedbackUseCase] Splitter name does not exist."
        );
        return {
          success: false,
          message: "Splitter name does not exist.",
          data: null,
        };
      }

      // 4. With the namespace retrieve top-1 relevant query from the vector DB according to the question.
      const knowledgeSources = await this.searchKnowledgeSourceQueriesStep.run({
        question: nlqQa?.question,
        splitterName: dbConn?.vbd_splitter?.name,
      });
      //   4.0 Keep the highest scored knowledge source
      const topKnowledgeSource = knowledgeSources?.[0];
      if (!topKnowledgeSource?.questionQueryHash) {
        const topKwSourceHash = await this.hashQuestionAndQueryHelp.help({
          question: topKnowledgeSource.question,
          query: topKnowledgeSource.query,
        });
        topKnowledgeSource.questionQueryHash = topKwSourceHash;
      }

      if (!topKnowledgeSource.queryHash) {
        const topKwSourceQueryHash = await this.hashQueryHelp.help({
          query: topKnowledgeSource.query,
        });
        topKnowledgeSource.queryHash = topKwSourceQueryHash.queryHash;
      }

      // 4.1 If hash of question+query matches existing, discard new query.
      if (currentHash === topKnowledgeSource.questionQueryHash) {
        decision = EnumDecision.DISCARD_NEW;
      }

      // 4.2 If score is above threshold (<0.90), then save it as new relevant query.
      if (topKnowledgeSource.score < 0.9) decision = EnumDecision.ADD_AS_NEW;

      // 4.3 If score is below threshold (>0.95), then compare the new query with the existing one.
      // 4.4 If they are identical, discard the new query.
      if (
        topKnowledgeSource.score > 0.95 &&
        topKnowledgeSource?.queryHash === currentQueryHash.queryHash
      )
        decision = EnumDecision.DISCARD_NEW;

      // 4.5 If there is a conflict, use the LLM as Judge to decide: replace existing, keep both, discard new.
      const combined = {
        newQuery: "",
        newQuestion: "",
      };
      // Use LLM to decide only if score > 0.95 and hashes of the query are different
      if (
        topKnowledgeSource.score > 0.95 &&
        topKnowledgeSource?.queryHash !== currentQueryHash.queryHash
      ) {
        const judgeRes = await this.genCurateJudgePositiveFbStep.run({
          prevQuestion: topKnowledgeSource.question,
          prevQuery: topKnowledgeSource.query,
          currentQuestion: nlqQa.question,
          currentQuery: nlqQa.query,
          schemaCtx: [],
        });
        decision = judgeRes.decision;
        combined.newQuestion = judgeRes.question;
        combined.newQuery = judgeRes.query;
      }

      if (decision === null) decision = EnumDecision.ADD_AS_NEW; // default action

      if (
        decision === EnumDecision.ADD_AS_NEW ||
        decision === EnumDecision.KEEP_BOTH
      ) {
        // 4.2.1 Create nlqQaGood entry and retrieve its ID.
        const NlqQaGoodId = await this.createNlqQaGoodStep.run({
          question: nlqQa.question,
          query: nlqQa.query,
          executionStatus: NlqQaGoodWithExecutionStatus.OK,
          originId: nlqQa.id,
          isOnKnowledgeSource: false,
          dbConnectionId: nlqQa.dbConnectionId,
          questionBy: nlqQa.createdBy,
          createdBy: nlqQa.createdBy,
          detailQuestion: "",
          tablesColumns: currentNlqQaTableColumns.tablesColumns || [],
        });
        // 4.2.2 Add to knowledge base with the id.
        const kwId = await this.addToKnowledgeBaseStep.run({
          id: NlqQaGoodId.id,
          question: nlqQa.question,
          nlqQaGoodId: NlqQaGoodId.id,
          query: nlqQa.query,
          tablesColumns: currentNlqQaTableColumns.tablesColumns || [],
          namespace: dbConn.vbd_splitter.name,
        });

        const updatedNlqQaGood = await this.updateNlqQaGoodByIdStep.run({
          id: NlqQaGoodId.id,
          isOnKnowledgeSource: true,
          knowledgeSourceId: kwId.id,
        });

        // 4.2.3 Update isGood field on nlqQa entry and add the nlqQaGoodId.
        await this.updateNlqQaGoodFieldFromGoodByIdStep.run({
          id: nlqQa.id,
          isGood: true,
          nlqQaGoodId: NlqQaGoodId.id,
        });
        return {
          success: true,
          message: "Positive feedback curated successfully. New query added.",
          data: updatedNlqQaGood,
        };
      }
      if (decision === EnumDecision.REPLACE) {
        // Delete existing from knowledge base.
        await this.deleteOnKnowledgeBaseByIdStep.run({
          id: topKnowledgeSource.id,
          splitterName: dbConn.vbd_splitter.name,
        });
        await this.deleteNlqQaGoodByIdStep.run(topKnowledgeSource.nlqQaGoodId);
        // Add new to knowledge base with existing id.
        // Create nlqQaGood entry and retrieve its ID.
        const NlqQaGoodId = await this.createNlqQaGoodStep.run({
          question: nlqQa.question,
          query: nlqQa.query,
          executionStatus: NlqQaGoodWithExecutionStatus.OK,
          originId: nlqQa.id,
          isOnKnowledgeSource: false,
          dbConnectionId: nlqQa.dbConnectionId,
          questionBy: nlqQa.createdBy,
          createdBy: nlqQa.createdBy,
          detailQuestion: "",
          tablesColumns: currentNlqQaTableColumns.tablesColumns || [],
        });
        // Add to knowledge base with the id.
        const kwId = await this.addToKnowledgeBaseStep.run({
          id: NlqQaGoodId.id,
          question: nlqQa.question,
          nlqQaGoodId: NlqQaGoodId.id,
          query: nlqQa.query,
          tablesColumns: currentNlqQaTableColumns.tablesColumns || [],
          namespace: dbConn.vbd_splitter.name,
        });

        const updatedNlqQaGood = await this.updateNlqQaGoodByIdStep.run({
          id: NlqQaGoodId.id,
          isOnKnowledgeSource: true,
          knowledgeSourceId: kwId.id,
        });

        // Update isGood field on nlqQa entry and add the nlqQaGoodId.
        await this.updateNlqQaGoodFieldFromGoodByIdStep.run({
          id: nlqQa.id,
          isGood: true,
          nlqQaGoodId: NlqQaGoodId.id,
        });
        return {
          success: true,
          message:
            "Positive feedback curated successfully. Delete and replaced old query",
          data: updatedNlqQaGood,
        };
      }
      if (decision === EnumDecision.DISCARD_NEW) {
        // Only update isGood and nlqQaGoodId on nlqQa entry.
        await this.updateNlqQaGoodFieldFromGoodByIdStep.run({
          id: nlqQa.id,
          isGood: true,
          nlqQaGoodId: topKnowledgeSource.nlqQaGoodId,
        });
        return {
          success: true,
          message:
            "Positive feedback curated successfully. New query discarded.",
          data: null,
        };
      }
      if (
        decision === EnumDecision.COMBINED &&
        combined.newQuery &&
        combined.newQuestion
      ) {
        const tableColumn = await this.genTableColumnsStep.run({
          query: combined.newQuery,
        });

        // Delete existing from knowledge base.
        await this.deleteOnKnowledgeBaseByIdStep.run({
          id: topKnowledgeSource.id,
          splitterName: dbConn.vbd_splitter.name,
        });
        await this.deleteNlqQaGoodByIdStep.run(topKnowledgeSource.nlqQaGoodId);
        // Add new to knowledge base with existing id.
        // Create nlqQaGood entry and retrieve its ID.
        const NlqQaGoodId = await this.createNlqQaGoodStep.run({
          question: combined.newQuestion,
          query: combined.newQuery,
          executionStatus: NlqQaGoodWithExecutionStatus.OK,
          originId: nlqQa.id,
          isOnKnowledgeSource: false,
          dbConnectionId: nlqQa.dbConnectionId,
          questionBy: nlqQa.createdBy,
          createdBy: nlqQa.createdBy,
          detailQuestion: "",
          tablesColumns: tableColumn.tablesColumns || [],
        });
        // Add to knowledge base with the id.
        const kwId = await this.addToKnowledgeBaseStep.run({
          id: NlqQaGoodId.id,
          question: combined.newQuestion,
          nlqQaGoodId: NlqQaGoodId.id,
          query: combined.newQuery,
          tablesColumns: tableColumn.tablesColumns || [],
          namespace: dbConn.vbd_splitter.name,
        });

        const updatedNlqQaGood = await this.updateNlqQaGoodByIdStep.run({
          id: NlqQaGoodId.id,
          isOnKnowledgeSource: true,
          knowledgeSourceId: kwId.id,
        });

        // Update isGood field on nlqQa entry and add the nlqQaGoodId.
        await this.updateNlqQaGoodFieldFromGoodByIdStep.run({
          id: nlqQa.id,
          isGood: true,
          nlqQaGoodId: NlqQaGoodId.id,
        });

        return {
          success: true,
          message:
            "Positive feedback curated successfully. Combined decision made.",
          data: null,
        };
      }

      return {
        success: false,
        message: "Unhandled decision case in positive feedback curation.",
        data: null,
      };
    } catch (error) {
      this.logger.error(
        "[CuratePositiveFeedbackUseCase]: ",
        error.message || "Unknown error"
      );
      return {
        success: false,
        message:
          error.message || "Failed to curate positive feedback for NLQ QA.",
        data: null,
      };
    }
  }
}
