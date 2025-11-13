import { TNlqQaWitFeedbackOutRequestDto } from "../../dtos/nlq/nlq-qa.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaRepository } from "../../interfaces/nlq/nlq-qa.app.inter";

export interface IReadAllWithUserFeedbackErrorStep {
  run(): Promise<TNlqQaWitFeedbackOutRequestDto[]>;
}

export class ReadAllWithUserFeedbackErrorStep
  implements IReadAllWithUserFeedbackErrorStep
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaRepo: INlqQaRepository
  ) {}

  async run(): Promise<TNlqQaWitFeedbackOutRequestDto[]> {
    this.logger.info("[ReadAllWithUserFeedbackErrorStep] Running ");
    try {
      const result = await this.nlqQaRepo.findAllWithUserAndFeedback();
      this.logger.info(
        "[ReadAllWithUserFeedbackErrorStep] Successfully retrieved NLQ QA with user feedback"
      );
      return result;
    } catch (error) {
      this.logger.error(
        "[ReadAllWithUserFeedbackErrorStep] Error retrieving NLQ QA with user feedback",
        error.message
      );
      throw new Error(
        error.message || "Error retrieving NLQ QA with user feedback"
      );
    }
  }
}
