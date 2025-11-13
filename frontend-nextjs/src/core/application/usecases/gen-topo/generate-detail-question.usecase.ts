import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IGenDetailQuestionStep } from "../../steps/genTepology/gen-detail-question.step";

export interface IGenerateDetailQuestionUseCase {
  execute(data: {
    question: string;
    query: string;
  }): Promise<TResponseDto<{ detailQuestion: string }>>;
}

export class GenerateDetailQuestionUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly genDetailQuestionStep: IGenDetailQuestionStep
  ) {}

  async execute(data: {
    question: string;
    query: string;
  }): Promise<TResponseDto<{ detailQuestion: string }>> {
    try {
      this.logger.info("Generating detail question...");
      const result = await this.genDetailQuestionStep.run(data);
      this.logger.info("Detail question generated.");
      return {
        success: true,
        data: { detailQuestion: result.detailQuestion },
        message: "Detail question generated successfully",
      };
    } catch (error) {
      this.logger.error(
        "Error generating detail question:",
        JSON.stringify(error)
      );
      return {
        success: false,
        message: "Failed to generate detail question: " + error.message,
        data: null,
      };
    }
  }
}
