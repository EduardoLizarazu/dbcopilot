import {
  EnumCurateDecision,
  TCreateNlqQaFeedbackDto,
  TNlqQaFeedbackOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ICurateNlqQaGoodDuplicateFlow } from "@/core/application/flows/nlq-qa-duplicate/curate-nlq-qa-good-duplicate.flow";
import { ICreateNlqQaGoodWithKnowledgeBasedFlow } from "@/core/application/flows/nlq-qa-good-flow/create-nlq-qa-good-with-knowledge.flow";
import { IDeleteNlqQaGoodFlow } from "@/core/application/flows/nlq-qa-good-flow/delete-nlq-qa-good-with-knowledge.flow";
import { ISimpleHashQueryHelp } from "@/core/application/helps/simple-hash-query.help";
import { ISimpleHashQuestionAndQueryHelp } from "@/core/application/helps/simple-hash-question-and-query.help";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IReadDbConnectionWithSplitterAndSchemaQueryStep } from "@/core/application/steps/dbconn/read-dbconnection-with-splitter-and-schema-query.usecase.step";
import { IGenTableColumnsStep } from "@/core/application/steps/genTepology/gen-table-columns.step";
import { IReadNlqQaByIdStep } from "@/core/application/steps/nlq-qa/read-nlq-qa-by-id.step";

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
 * 5. Decision EnumCurateDecision:
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
    private readonly curateNlqQaGoodDuplicateFlow: ICurateNlqQaGoodDuplicateFlow,
    private readonly createNlqQaGoodFlow: ICreateNlqQaGoodWithKnowledgeBasedFlow,
    private readonly deleteNlqQaGoodFlow: IDeleteNlqQaGoodFlow,
    private readonly genTableColumnsStep: IGenTableColumnsStep
  ) {}
  async execute(
    data: TCreateNlqQaFeedbackDto
  ): Promise<TResponseDto<TNlqQaFeedbackOutRequestDto>> {
    try {
      // 0. Validate input data.
      if (!data?.nlqQaId || data?.isGood !== true) {
        this.logger.error(
          "[ICreateNlqQaPositiveFeedbackUseCase] Invalid input data.",
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
          `[ICreateNlqQaPositiveFeedbackUseCase] NLQ QA with ID ${data.nlqQaId} not found.`
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
          `[ICreateNlqQaPositiveFeedbackUseCase] NLQ QA a field is missing`,
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
          "[ICreateNlqQaPositiveFeedbackUseCase] Splitter name does not exist."
        );
        return {
          success: false,
          message: "Splitter name does not exist.",
          data: null,
        };
      }

      // Prune
      const curateDecision = await this.curateNlqQaGoodDuplicateFlow.flow({
        currentQuestion: nlqQa.question,
        currentQuery: nlqQa.query,
        currentNamespace: dbConn.vbd_splitter.name,
        currentQuestionQueryHash: currentQuestionQueryHash,
        currentQueryHash: queryHash,
      });

      // 4. Based on decision, create or not the positive feedback entry.
      if (curateDecision.decision === EnumCurateDecision.DISCARD_NEW) {
        // Discard new entry
        this.logger.info(
          `[ICreateNlqQaPositiveFeedbackUseCase] Discarding new positive feedback for NLQ QA ID ${data.nlqQaId} based on duplicate curation decision.`
        );
        return {
          success: true,
          message: "Positive feedback discarded based on duplicate curation.",
          data: null,
        };
      } else if (curateDecision.decision === EnumCurateDecision.REPLACE) {
        // Delete existing good entry
        await this.deleteNlqQaGoodFlow.flow(curateDecision.deleteId || "");

        // Create new good entry
        await this.createNlqQaGoodFlow.flow(
          {
            question: curateDecision.question,
            query: curateDecision.query,
            dbConnectionId: nlqQa.dbConnectionId,
            tablesColumns: currentNlqQaTableColumns.tablesColumns || [],
            questionQueryHash: currentQuestionQueryHash,
            queryHash: queryHash,
            createdBy: data.createdBy,
          },
          dbConn.vbd_splitter.name
        );
      } else if (
        curateDecision.decision === EnumCurateDecision.KEEP_BOTH ||
        curateDecision.decision === EnumCurateDecision.ADD_AS_NEW
      ) {
        // Create new good entry
        await this.createNlqQaGoodFlow.flow(
          {
            question: nlqQa.question,
            query: nlqQa.query,
            dbConnectionId: nlqQa.dbConnectionId,
            tablesColumns: currentNlqQaTableColumns.tablesColumns || [],
            questionQueryHash: currentQuestionQueryHash,
            queryHash: queryHash,
            createdBy: data.createdBy,
          },
          dbConn.vbd_splitter.name
        );
      } else {
        this.logger.error(
          `[ICreateNlqQaPositiveFeedbackUseCase] Unknown curation decision for NLQ QA ID ${data.nlqQaId}.`
        );
        return {
          success: false,
          message: "Unknown curation decision.",
          data: null,
        };
      }
      return {
        success: true,
        message: "Positive feedback curated successfully.",
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
