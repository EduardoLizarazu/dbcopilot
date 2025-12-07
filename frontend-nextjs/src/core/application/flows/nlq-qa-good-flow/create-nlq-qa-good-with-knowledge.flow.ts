import {
  createNlqQaGoodSchema,
  TCreateNlqQaGoodDto,
  TNlqQaGoodDto,
} from "../../dtos/nlq/nlq-qa-good.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IAddToTheKnowledgeBaseStep } from "../../steps/knowledgeBased/add-to-knowledge-base.step";
import { ICreateNlqQaGoodStep } from "../../steps/nlq-qa-good/create-nlq-qa-good.step";
import { IUpdateNlqQaGoodKnowledgeStep } from "../../steps/nlq-qa-good/update-nlq-qa-good-knowledge.step";
import { IUpdateNlqQaGoodFieldFromGoodStep } from "../../steps/nlq-qa/update-nlq-qa-good-field-from-good.step";

export interface ICreateNlqQaGoodWithKnowledgeBasedFlow {
  flow(data: TCreateNlqQaGoodDto, namespace: string): Promise<TNlqQaGoodDto>;
}

export class CreateNlqQaGoodWithKnowledgeBasedFlow
  implements ICreateNlqQaGoodWithKnowledgeBasedFlow
{
  constructor(
    private readonly logger: ILogger,
    private readonly createNlqQaGoodStep: ICreateNlqQaGoodStep,
    private readonly addToKnowledgeSource: IAddToTheKnowledgeBaseStep,
    private readonly updateNlqQaGoodOnKnowledgeStep: IUpdateNlqQaGoodKnowledgeStep,
    private readonly updateNlqQaIfOriginIdStep: IUpdateNlqQaGoodFieldFromGoodStep
  ) {}

  async flow(
    data: TCreateNlqQaGoodDto,
    namespace: string
  ): Promise<TNlqQaGoodDto> {
    try {
      this.logger.info(
        `[CreateNlqQaGoodWithKnowledgeBasedFlow] Starting flow with data: `,
        data
      );

      const vData = await createNlqQaGoodSchema.safeParseAsync(data);
      if (!vData.success) {
        this.logger.error(
          `[CreateNlqQaGoodWithKnowledgeBasedFlow] Validation failed: `,
          vData.error.errors
        );
        throw new Error("Validation failed");
      }
      data = { ...vData.data };

      // 3. Create NLQ QA Good
      const nlqQaGood = await this.createNlqQaGoodStep.run({
        ...data,
        questionBy: data.questionBy || "",
        originId: data.originId || "",
        questionQueryHash: data.questionQueryHash,
        queryHash: data.queryHash,
        tablesColumns: data.tablesColumns,
      });

      let out = nlqQaGood;
      if (nlqQaGood.isOnKnowledgeSource) {
        // 4. Create knowledge source
        const knowledgeSourceId = await this.addToKnowledgeSource.run({
          question: nlqQaGood.question,
          query: nlqQaGood.query,
          namespace: namespace,
          nlqQaGoodId: nlqQaGood.id,
          tablesColumns: nlqQaGood.tablesColumns,
          queryHash: nlqQaGood.queryHash,
          questionQueryHash: nlqQaGood.questionQueryHash,
        });

        // 5. Update NLQ QA Good with knowledge source info
        out = await this.updateNlqQaGoodOnKnowledgeStep.run({
          id: nlqQaGood.id,
          knowledgeSourceId: knowledgeSourceId.id,
        });
      }

      // 6. If originId is provided, update the NLQ QA entry to link to this good feedback
      if (data.originId && data.originId.trim() !== "") {
        await this.updateNlqQaIfOriginIdStep.run({
          id: data.originId,
          isGood: true,
          nlqQaGoodId: nlqQaGood.id,
        });
      }

      this.logger.info(
        `[CreateNlqQaGoodWithKnowledgeBasedFlow] Flow completed successfully for NLQ QA Good ID: ${nlqQaGood.id}`
      );
      return out;
    } catch (error) {
      this.logger.error(
        `[CreateNlqQaGoodWithKnowledgeBasedFlow] Error executing flow: `,
        error.message
      );
      throw new Error(error.message || "Error executing flow");
    }
  }
}
