import {
  TCreateNlqQaKnowledgeDto,
  TNlqQaKnowledgeOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-knowledge.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaKnowledgeRepository } from "@/core/application/interfaces/nlq/nlq-qa-knowledge.app.inter";

export interface ICreateNlqQaKnowledgeUseCase {
  execute(
    data: TCreateNlqQaKnowledgeDto
  ): Promise<TResponseDto<TNlqQaKnowledgeOutRequestDto>>;
}

export class CreateNlqQaKnowledgeUseCase
  implements ICreateNlqQaKnowledgeUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaKnowledgeRepository: INlqQaKnowledgeRepository
  ) {}

  async execute(
    data: TCreateNlqQaKnowledgeDto
  ): Promise<TResponseDto<TNlqQaKnowledgeOutRequestDto>> {
    try {
      this.logger.info(
        "[CreateNlqQaKnowledgeUseCase] Executing use case",
        data
      );
      const id = await this.nlqQaKnowledgeRepository.create(data);
      this.logger.info(
        `[CreateNlqQaKnowledgeUseCase] Use case executed successfully with ID: ${id}`
      );
      const createdKnowledge = await this.nlqQaKnowledgeRepository.findById(id);
      return {
        data: createdKnowledge,
        message: "NLQ QA Knowledge created successfully",
        success: true,
      };
    } catch (error) {
      this.logger.error(
        "[CreateNlqQaKnowledgeUseCase] Error creating NLQ QA Knowledge",
        error
      );
      return {
        data: null,
        message: "Error creating NLQ QA Knowledge",
        success: false,
      };
    }
  }
}
