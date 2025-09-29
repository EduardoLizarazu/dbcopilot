import { TNlqQaWitFeedbackOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaRepository } from "@/core/application/interfaces/nlq/nlq-qa.app.inter";

export interface IReadAllNlqQaFbOrErrorUseCase {
  execute(
    query?: string
  ): Promise<TResponseDto<TNlqQaWitFeedbackOutRequestDto[]>>;
}

export class ReadAllNlqQaFbOrErrorUseCase
  implements IReadAllNlqQaFbOrErrorUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaRepo: INlqQaRepository
  ) {}
  async execute(
    query?: string
  ): Promise<TResponseDto<TNlqQaWitFeedbackOutRequestDto[]>> {
    try {
      // 1. Find all NLQ QAs with user and feedback and error.
      const nlqQaUserFbError =
        await this.nlqQaRepo.findAllWithUserAndFeedback();

      this.logger.info(
        "[ReadAllNlqQaFbOrErrorUseCase] Successfully fetched all NLQ QA feedback",
        { count: nlqQaUserFbError.length }
      );

      //   2. Filter only the isGood === false on NlqQa
      const nlqQaUserFbErrorBad = nlqQaUserFbError.filter(
        (nlq) => nlq.isGood === false
      );
      this.logger.info(
        "[ReadAllNlqQaFbOrErrorUseCase] Successfully fetched all bad NLQ QA feedback",
        { count: nlqQaUserFbErrorBad.length }
      );

      // 3. Filter by query on the fields: question, user.name, user.email, feedback.comment, error.message
      let filteredResults = nlqQaUserFbErrorBad;
      if (query) {
        const lowerQuery = query.toLowerCase();
        filteredResults = nlqQaUserFbErrorBad.filter((nlq) => {
          const questionMatch = nlq.question
            ? nlq.question.toLowerCase().includes(lowerQuery)
            : false;
          const userNameMatch = nlq.user?.name
            ? nlq.user.name.toLowerCase().includes(lowerQuery)
            : false;
          const userEmailMatch = nlq.user?.email
            ? nlq.user.email.toLowerCase().includes(lowerQuery)
            : false;
          const feedbackCommentMatch = nlq.feedback?.comment
            ? nlq.feedback.comment.toLowerCase().includes(lowerQuery)
            : false;
          const errorMessageMatch = nlq.error?.errorMessage
            ? nlq.error.errorMessage.toLowerCase().includes(lowerQuery)
            : false;
          return (
            questionMatch ||
            userNameMatch ||
            userEmailMatch ||
            feedbackCommentMatch ||
            errorMessageMatch
          );
        });
        this.logger.info(
          "[ReadAllNlqQaFbOrErrorUseCase] Successfully filtered NLQ QA feedback by query",
          { query, count: filteredResults.length }
        );
      }

      // 4. Return the filtered results
      return {
        success: true,
        data: filteredResults,
        message: "Successfully fetched all NLQ QA feedback",
      };
    } catch (error) {
      this.logger.error(
        "[ReadAllNlqQaFbOrErrorUseCase] Error fetching all NLQ QA feedback",
        {
          error,
        }
      );
      return {
        success: false,
        data: null,
        message: `Error fetching all NLQ QA feedback: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
}
