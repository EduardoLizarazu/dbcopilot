import {
  createNlqQaSchema,
  TCreateNlqQaDto,
  TNlqQaOutRequestDto,
} from "../../dtos/nlq/nlq-qa.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaRepository } from "../../interfaces/nlq/nlq-qa.app.inter";

export interface ICreateNlqQaStep {
  run(data: TCreateNlqQaDto): Promise<TNlqQaOutRequestDto>;
}

export class CreateNlqQaStep implements ICreateNlqQaStep {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaRepo: INlqQaRepository
  ) {}

  async run(data: TCreateNlqQaDto): Promise<TNlqQaOutRequestDto> {
    try {
      const now = new Date();
      this.logger.info(
        `[createNlqQaStep] Creating NLQ QA with data: ${JSON.stringify({
          ...data,
        })}`
      );
      //   1. Validate input
      const validData = await createNlqQaSchema.safeParseAsync({
        ...data,
        userDeleted: false,
        timeQuestion: now,
        timeQuery: now,
        createdAt: now,
        updatedAt: now,
        nlqQaGoodId: "",
        feedbackId: "",
      });
      if (!validData.success) {
        this.logger.error(
          `[createNlqQaStep] Invalid input data: ${JSON.stringify(validData.error)}`
        );
        throw new Error("Invalid input data");
      }

      const id = await this.nlqQaRepo.create(validData.data);
      this.logger.info(`[createNlqQaStep] Created NLQ QA with id: ${id}`);

      const result = await this.nlqQaRepo.findById(id);
      this.logger.info(`[createNlqQaStep] Retrieved NLQ QA with id: ${id}`);

      if (!result) {
        this.logger.error(
          `[createNlqQaStep] NLQ QA not found after creation with id: ${id}`
        );
        throw new Error("NLQ QA not found after creation");
      }

      return result;
    } catch (error) {
      this.logger.error(
        `[createNlqQaStep] Error occurred while creating NLQ QA: ${error.message}`
      );
      throw new Error("Error creating NLQ QA: " + error.message);
    }
  }
}
