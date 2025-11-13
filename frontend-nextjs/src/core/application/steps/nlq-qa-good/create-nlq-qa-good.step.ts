import {
  createNlqQaGoodSchema,
  TCreateNlqQaGoodDto,
  TNlqQaGoodOutRequestDto,
} from "../../dtos/nlq/nlq-qa-good.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaGoodRepository } from "../../interfaces/nlq/nlq-qa-good.app.inter";

export interface ICreateNlqQaGoodStep {
  run(data: TCreateNlqQaGoodDto): Promise<TNlqQaGoodOutRequestDto>;
}

export class CreateNlqQaGoodStep implements ICreateNlqQaGoodStep {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaGoodRepo: INlqQaGoodRepository
  ) {}
  async run(data: TCreateNlqQaGoodDto): Promise<TNlqQaGoodOutRequestDto> {
    try {
      const now = new Date();
      this.logger.info("[CreateNlqQaGoodStep]: Creating NLQ QA Good:", data);
      // 1. Validate input
      const validData = await createNlqQaGoodSchema.safeParseAsync({
        ...data,
        updated: now,
        createdAt: now,
        updatedBy: data.createdBy,
      });
      if (!validData.success) {
        this.logger.error(
          "[CreateNlqQaGoodStep]: Invalid data:",
          validData.error.errors
        );
        throw new Error(
          `Invalid data: ${JSON.stringify(validData.error.issues)}`
        );
      }
      // 2. Create NLQ QA Good entry
      const createdEntryId = await this.nlqQaGoodRepo.create(validData.data);
      this.logger.info(
        `[CreateNlqQaGoodStep]: Created NLQ QA Good with ID: ${createdEntryId}`
      );

      // 3. Retrieve the created entry
      const createdEntry = await this.nlqQaGoodRepo.findById(createdEntryId);
      if (!createdEntry) {
        this.logger.error(
          `[CreateNlqQaGoodStep]: Failed to retrieve created NLQ QA Good with ID: ${createdEntryId}`
        );
        throw new Error("Failed to retrieve created NLQ QA Good");
      }
      return createdEntry;
    } catch (error) {
      this.logger.error(
        "[CreateNlqQaGoodStep]: Error creating NLQ QA Good:",
        error.message
      );
      throw new Error("Error creating NLQ QA Good: " + error.message);
    }
  }
}
