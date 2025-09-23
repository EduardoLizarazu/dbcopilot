import {
  createNlqQaSchema,
  TCreateNlqQaDto,
  TNlqQaOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaRepository } from "@/core/application/interfaces/nlq/nlq-qa.app.inter";
export interface ICreateNlqQaAppUseCase {
  execute(data: TCreateNlqQaDto): Promise<TResponseDto<TNlqQaOutRequestDto>>;
}

export class CreateNlqQaAppUseCase implements ICreateNlqQaAppUseCase {
  constructor(
    private nlqQaRepository: INlqQaRepository,
    private logger: ILogger
  ) {}

  async execute(
    data: TCreateNlqQaDto
  ): Promise<TResponseDto<TNlqQaOutRequestDto>> {
    try {
      this.logger.info("[CreateNlqQaUseCase]: Creating NLQ QA...", {
        data,
      });

      // VALIDATE

      // Validate data
      const nlqQaValidation = createNlqQaSchema.safeParse(data);
      if (!nlqQaValidation.success) {
        this.logger.error(
          "[CreateNlqQaUseCase]: Invalid data:",
          nlqQaValidation.error.errors
        );
        return {
          data: null,
          success: false,
          message: "Invalid data",
        };
      }

      // CREATE NLQ QA
      const nlqQaId = await this.nlqQaRepository.create({
        ...nlqQaValidation.data,
      });
      this.logger.info("[CreateNlqQaUseCase]: NLQ QA created successfully", {
        nlqQaId,
      });

      // Find by id to return full object
      const nlqQaResponse = await this.nlqQaRepository.findById(nlqQaId);

      return {
        success: true,
        data: nlqQaResponse,
        message: "NLQ QA created",
      };
    } catch (error) {
      this.logger.error("[CreateNlqQaUseCase]: Error creating NLQ QA", {
        error,
      });
      return {
        data: null,
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
