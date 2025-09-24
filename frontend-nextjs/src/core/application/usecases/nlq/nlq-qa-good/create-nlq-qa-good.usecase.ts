import {
  createNlqQaGoodSchema,
  nlqQaGoodInRequestSchema,
  TCreateNlqQaGoodDto,
  TNlqQaGoodInRequestDto,
  TNlqQaGoodOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "../../../interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "../../../interfaces/nlq/nlq-qa-good.app.inter";

export interface ICreateNlqQaGoodUseCase {
  execute(
    data: TNlqQaGoodInRequestDto
  ): Promise<TResponseDto<TNlqQaGoodOutRequestDto>>;
}

export class CreateNlqQaGoodUseCasePayload implements ICreateNlqQaGoodUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGoodRepository: INlqQaGoodRepository
  ) {}

  async execute(
    data: TNlqQaGoodInRequestDto
  ): Promise<TResponseDto<TNlqQaGoodOutRequestDto>> {
    try {
      // 1. Validate input data
      const dateValidate = await nlqQaGoodInRequestSchema.safeParseAsync(data);
      if (!dateValidate.success) {
        this.logger.error(
          `[CreateNlqQaGoodUseCase] Invalid input data: ${JSON.stringify(
            dateValidate.error.issues
          )}`
        );
        return {
          success: false,
          message: "Invalid input data",
          data: null,
        };
      }

      // 2. Upload to knowledge source

      // 3. GENERATION STEPS

      // 3.1 Generate detail question.

      // 3.2 Generate tableColumns ["[TABLE].[COLUMN]"] .

      // 3.3 Generate Semantic Fields

      // 3.4 Generate Semantic Tables.

      // 3.5 Generate Semantic Flags

      // 3.6 Generate thinking process

      // 4. Create NLQ QA Good
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

      // 5. Search the created record to return
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

      // Return success response
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
