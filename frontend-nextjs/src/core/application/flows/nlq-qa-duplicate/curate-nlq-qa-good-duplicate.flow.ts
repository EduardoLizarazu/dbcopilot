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
import { IReadNlqQaGoodByQuestionQueryHashStep } from "../../steps/nlq-qa-good/read-nlq-qa-good-by-question-query-hash.step";
import { IReadNlqQaGoodByQueryHashStep } from "../../steps/nlq-qa-good/read-nlq-qa-good-by-query-hash.step";
import { IReadNlqQaGoodByIdStep } from "../../steps/nlq-qa-good/read-nlq-qa-good-by-id.step";

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

export interface ICurateNlqQaGoodDuplicateFlow {
  execute(data: {
    currentQuestion: string;
    currentQuery: string;
    currentNamespace: string;
  }): Promise<TCurateDecision | null>;
}

export class CurateNlqQaGoodDuplicateFlow
  implements ICurateNlqQaGoodDuplicateFlow
{
  constructor(
    private readonly logger: ILogger,
    private readonly readNlqQaGoodByQuestionQueryHashStep: IReadNlqQaGoodByQuestionQueryHashStep,
    private readonly hashQuestionAndQueryHelp: ISimpleHashQuestionAndQueryHelp,
    private readonly hashQueryHelp: ISimpleHashQueryHelp,
    private readonly searchKnowledgeSourceQueriesStep: ISearchSimilarQuestionOnKnowledgeBaseStep,
    private readonly genTableColumnsStep: IGenTableColumnsStep
  ) {}
  async execute(data: {
    currentQuestion: string;
    currentQuery: string;
    currentNamespace: string;
  }): Promise<TCurateDecision | null> {
    try {
      let decision: EnumCurateDecision | null = null;
      // 0. Validate input data.
      if (
        !data?.currentQuestion ||
        !data?.currentQuery ||
        !data?.currentNamespace
      ) {
        this.logger.error(
          "[ICurateNlqQaGoodDuplicateFlow] Invalid input data.",
          data
        );
        throw new Error(
          "Invalid input data for curating NLQ QA good duplicate."
        );
      }

      // 2.0.0 Generate table columns from query of NLQ QA
      const currentNlqQaTableColumns = await this.genTableColumnsStep.run({
        query: data.currentQuery,
      });

      //   2.1 Generate hash for question and query.
      const currentQuestionQueryHash = await this.hashQuestionAndQueryHelp.help(
        {
          question: data.currentQuestion,
          query: data.currentQuery,
        }
      );

      // 2.2 Generate hash for the query alone.
      const queryHash = await this.hashQueryHelp.help({
        query: data.currentQuery,
      });
      const currentQueryHash = queryHash.queryHash;

      const existingNlqQaGoodByQuestionQueryHash =
        await this.readNlqQaGoodByQuestionQueryHashStep.run(
          currentQuestionQueryHash
        );
      if (existingNlqQaGoodByQuestionQueryHash) {
        this.logger.info(
          "[ICurateNlqQaGoodDuplicateFlow] Existing NLQ QA found with the same question and query hash. Discarding new query."
        );
        decision = EnumCurateDecision.DISCARD_NEW;
        return {
          decision,
          question: "",
          query: "",
        };
      }

      // 4. With the namespace retrieve top-1 relevant query from the vector DB according to the question.
      const knowledgeSources = await this.searchKnowledgeSourceQueriesStep.run({
        question: data?.currentQuestion,
        splitterName: data?.currentNamespace,
      });

      // 4.2 If score is above threshold (<0.90), then save it as new relevant query.
      const topKnowledgeSource = knowledgeSources[0];
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
        throw new Error(
          "Invalid decision output in curating positive feedback."
        );
      }

      return vOut.data;
    } catch (error) {
      this.logger.error(
        "[CuratePositiveFeedbackUseCase]:",
        error.message || "Unknown error"
      );
      throw new Error(error.message || "Error in curating positive feedback.");
    }
  }
}
