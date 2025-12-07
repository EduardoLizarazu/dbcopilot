import {
  EnumCurateDecision,
  SCurateDecision,
  TCreateNlqQaFeedbackDto,
  TCurateDecision,
} from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ISimpleHashQueryHelp } from "@/core/application/helps/simple-hash-query.help";
import { ISimpleHashQuestionAndQueryHelp } from "@/core/application/helps/simple-hash-question-and-query.help";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IReadDbConnectionWithSplitterAndSchemaQueryStep } from "@/core/application/steps/dbconn/read-dbconnection-with-splitter-and-schema-query.usecase.step";
import { IGenTableColumnsStep } from "@/core/application/steps/genTepology/gen-table-columns.step";
import { ISearchSimilarQuestionOnKnowledgeBaseStep } from "@/core/application/steps/knowledgeBased/search-similar-question-on-knowledge-base.step";
import { IReadNlqQaByIdStep } from "@/core/application/steps/nlq-qa/read-nlq-qa-by-id.step";
import { IReadNlqQaByQuestionQueryHashStep } from "../../steps/nlq-qa/read-nlq-qa-by-question-query-hash.step";

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

export interface ICreateNlqQaGoodDuplicateFlow {
  execute(
    data: TCreateNlqQaFeedbackDto
  ): Promise<TResponseDto<TCurateDecision>>;
}

export class CreateNlqQaGoodDuplicateFlow
  implements ICreateNlqQaGoodDuplicateFlow
{
  constructor(
    private readonly logger: ILogger,
    private readonly readNlqQaByIdStep: IReadNlqQaByIdStep,
    private readonly readNlqQaByQuestionAndQueryHashStep: IReadNlqQaByQuestionQueryHashStep,
    private readonly readNlqQaByQuestionQueryHashStep: IReadNlqQaByQuestionQueryHashStep,
    private readonly readDbConnWithSplitterStep: IReadDbConnectionWithSplitterAndSchemaQueryStep,
    private readonly hashQuestionAndQueryHelp: ISimpleHashQuestionAndQueryHelp,
    private readonly hashQueryHelp: ISimpleHashQueryHelp,
    private readonly searchKnowledgeSourceQueriesStep: ISearchSimilarQuestionOnKnowledgeBaseStep,
    private readonly genTableColumnsStep: IGenTableColumnsStep
  ) {}
  async execute(
    data: TCreateNlqQaFeedbackDto
  ): Promise<TResponseDto<TCurateDecision>> {
    try {
      let decision: EnumCurateDecision | null = null;
      // 0. Validate input data.
      if (!data?.nlqQaId || data?.isGood !== true) {
        this.logger.error(
          "[ICreateNlqQaGoodDuplicateFlow] Invalid input data.",
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
          `[ICreateNlqQaGoodDuplicateFlow] NLQ QA with ID ${data.nlqQaId} not found.`
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
          `[ICreateNlqQaGoodDuplicateFlow] NLQ QA a field is missing`,
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
      const currentQuestionQueryHash = await this.hashQuestionAndQueryHelp.help(
        {
          question: nlqQa.question,
          query: nlqQa.query,
        }
      );

      // 2.2 Generate hash for the query alone.
      const queryHash = await this.hashQueryHelp.help({
        query: nlqQa.query,
      });
      const currentQueryHash = queryHash.queryHash;

      // 3. With the nlqQa retrieve the connectionDb used with the namespace of knowledge source.
      const dbConn = await this.readDbConnWithSplitterStep.run({
        dbConnectionId: nlqQa.dbConnectionId,
      });

      //   3.1 Check if splitter name exists
      if (!dbConn?.vbd_splitter?.name) {
        this.logger.error(
          "[ICreateNlqQaGoodDuplicateFlow] Splitter name does not exist."
        );
        return {
          success: false,
          message: "Splitter name does not exist.",
          data: null,
        };
      }

      const existingNlqQaByQuestionQueryHash =
        await this.readNlqQaByQuestionAndQueryHashStep.run(
          currentQuestionQueryHash
        );
      const existingNlqQaByQueryHash =
        await this.readNlqQaByQuestionQueryHashStep.run(currentQueryHash);

      if (existingNlqQaByQuestionQueryHash) {
        this.logger.info(
          "[ICreateNlqQaGoodDuplicateFlow] Existing NLQ QA found with the same question and query hash. Discarding new query."
        );
        return {
          success: true,
          message: "Duplicate NLQ QA found. Discarding new query.",
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

      // 4.2 If score is above threshold (<0.90), then save it as new relevant query.
      if (topKnowledgeSource.score < 0.9)
        decision = EnumCurateDecision.ADD_AS_NEW;

      // 4.3 If score is below threshold (>0.95), then compare the new query with the existing one.
      // 4.4 If they are identical, discard the new query.
      if (
        topKnowledgeSource.score > 0.95 &&
        topKnowledgeSource?.queryHash === currentQueryHash
      )
        decision = EnumCurateDecision.DISCARD_NEW;

      // 4.5 If there is a conflict, use the LLM as Judge to decide: replace existing, keep both, discard new.
      const combined = {
        newQuery: "",
        newQuestion: "",
      };
      // Use LLM to decide only if score > 0.95 and hashes of the query are different
      // if (
      //   topKnowledgeSource.score > 0.95 &&
      //   topKnowledgeSource?.queryHash !== currentQueryHash.queryHash
      // ) {
      //   const judgeRes = await this.genCurateJudgePositiveFbStep.run({
      //     prevQuestion: topKnowledgeSource.question,
      //     prevQuery: topKnowledgeSource.query,
      //     currentQuestion: nlqQa.question,
      //     currentQuery: nlqQa.query,
      //     schemaCtx: [],
      //   });
      //   decision = judgeRes.decision;
      //   combined.newQuestion = judgeRes.question;
      //   combined.newQuery = judgeRes.query;
      // }

      if (decision === null) decision = EnumCurateDecision.ADD_AS_NEW; // default action

      const vOut = await SCurateDecision.safeParseAsync({
        decision,
        question: combined.newQuestion,
        query: combined.newQuery,
      });

      if (!vOut.success) {
        this.logger.error(
          "[CuratePositiveFeedbackUseCase]: Invalid decision output.",
          vOut.error.format()
        );
        return {
          success: false,
          message: "Validation failed for decision output.",
          data: null,
        };
      }

      return {
        success: false,
        message: "Unhandled decision case in positive feedback curation.",
        data: vOut.data,
      };
    } catch (error) {
      this.logger.error(
        "[CuratePositiveFeedbackUseCase]:",
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
