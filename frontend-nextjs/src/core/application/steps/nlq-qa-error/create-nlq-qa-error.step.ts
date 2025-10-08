import {
  createNlqQaErrorSchema,
  TCreateNlqQaErrorDto,
  TNlqQaErrorOutRequestDto,
} from "../../dtos/nlq/nlq-qa-error.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaErrorRepository } from "../../interfaces/nlq/nlq-qa-error.app.inter";

export interface ICreateNlqQaErrorStep {
  run(data: TCreateNlqQaErrorDto): Promise<TNlqQaErrorOutRequestDto>;
}

export class CreateNlqQaErrorStep implements ICreateNlqQaErrorStep {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqErrorRepo: INlqQaErrorRepository
  ) {}

  async run(data: TCreateNlqQaErrorDto): Promise<TNlqQaErrorOutRequestDto> {
    try {
      // 1. Validate input
      const validData = await createNlqQaErrorSchema.safeParseAsync(data);

      if (!validData.success) {
        this.logger.error(
          `[CreateNlqQaErrorStep] Validation failed: ${validData.error}`
        );
        throw new Error("Validation failed: " + validData.error);
      }

      // 2. Create NLQ QA Error entry in the repository
      const id = await this.nlqErrorRepo.create(validData.data);
      this.logger.info(
        `[CreateNlqQaErrorStep] Created NLQ QA Error with ID: ${id}`
      );

      // 3. Retrieve and return the created entry
      const createdEntry = await this.nlqErrorRepo.findById(id);
      if (!createdEntry) {
        this.logger.error(
          `[CreateNlqQaErrorStep] Failed to retrieve created NLQ QA Error with ID: ${id}`
        );
        throw new Error("Failed to retrieve created NLQ QA Error");
      }

      return createdEntry;
    } catch (error) {
      this.logger.error(`[CreateNlqQaErrorStep] Error: ${error.message}`);
      throw new Error("Error creating NLQ QA Error: " + error.message);
    }
  }
}
