import { TCreateNlqQaGoodDto } from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "../../../interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "../../../interfaces/nlq/nlq-qa-good.app.inter";

export interface ICreateNlqQaGoodUseCase {
  execute(
    data: TCreateNlqQaGoodDto
  ): Promise<TResponseDto<TCreateNlqQaGoodDto>>;
}

export class CreateNlqQaGoodUseCasePayload implements ICreateNlqQaGoodUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGoodRepository: INlqQaGoodRepository
  ) {}

  async execute(
    data: TCreateNlqQaGoodDto
  ): Promise<TResponseDto<TCreateNlqQaGoodDto>> {
    try {
      const id = await this.nlqQaGoodRepository.create(data);
      if (!id) {
        this.logger.error(
          "[CreateNlqQaGoodUseCase] Failed to create NLQ QA Good"
        );
        return {
          success: false,
          message: "Failed to create NLQ QA Good",
          data: null,
        };
      }

      // search the created record to return
      const result = await this.nlqQaGoodRepository.findById(id);
      if (!result) {
        this.logger.error(
          "[CreateNlqQaGoodUseCase] Created NLQ QA Good not found"
        );
        return {
          success: false,
          message: "Created NLQ QA Good not found",
          data: null,
        };
      }

      return {
        success: true,
        data: result,
        message: "NLQ QA Good created successfully",
      };
    } catch (error) {
      this.logger.error(
        "[CreateNlqQaGoodUseCase] Error creating NLQ QA Good",
        error
      );
      return {
        success: false,
        message: "Error creating NLQ QA Good",
        data: null,
      };
    }
  }
}
