import {
  EnumCurateDecision,
  SCurateDecision,
  TCurateDecision,
} from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { ISearchSimilarQuestionOnKnowledgeBaseStep } from "@/core/application/steps/knowledgeBased/search-similar-question-on-knowledge-base.step";
import { IReadNlqQaGoodByQuestionQueryHashStep } from "../../steps/nlq-qa-good/read-nlq-qa-good-by-question-query-hash.step";

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
  flow(data: {
    currentQuestion: string;
    currentQuery: string;
    currentNamespace: string;
    currentQuestionQueryHash: string;
    currentQueryHash: string;
  }): Promise<TCurateDecision | null>;
}

export class CurateNlqQaGoodDuplicateFlow
  implements ICurateNlqQaGoodDuplicateFlow
{
  constructor(
    private readonly logger: ILogger,
    private readonly readNlqQaGoodByQuestionQueryHashStep: IReadNlqQaGoodByQuestionQueryHashStep,
    private readonly searchKnowledgeSourceQueriesStep: ISearchSimilarQuestionOnKnowledgeBaseStep
  ) {}
  async flow(data: {
    currentQuestion: string;
    currentQuery: string;
    currentNamespace: string;
    currentQuestionQueryHash: string;
    currentQueryHash: string;
  }): Promise<TCurateDecision | null> {
    try {
      let decision: EnumCurateDecision | null = null;
      // 0. Validate input data.
      if (
        !data?.currentQuestion ||
        !data?.currentQuery ||
        !data?.currentNamespace ||
        !data?.currentQuestionQueryHash ||
        !data?.currentQueryHash
      ) {
        this.logger.error(
          "[ICurateNlqQaGoodDuplicateFlow] Invalid input data.",
          data
        );
        throw new Error(
          "Invalid input data for curating NLQ QA good duplicate."
        );
      }

      const existingNlqQaGoodByQuestionQueryHash =
        await this.readNlqQaGoodByQuestionQueryHashStep.run(
          data.currentQuestionQueryHash
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
        topKnowledgeSource?.queryHash === data.currentQueryHash
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
