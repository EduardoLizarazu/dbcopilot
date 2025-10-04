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
import { INlqQaTopologyGenerationPort } from "@/core/application/ports/nlq-qa-topology-generation.port";
import { INlqQaKnowledgePort } from "@/core/application/ports/nlq-qa-knowledge.app.inter";
import { INlqQaRepository } from "@/core/application/interfaces/nlq/nlq-qa.app.inter";

export interface ICreateNlqQaGoodUseCase {
  execute(
    data: TNlqQaGoodInRequestDto
  ): Promise<TResponseDto<TNlqQaGoodOutRequestDto>>;
}

export class CreateNlqQaGoodUseCase implements ICreateNlqQaGoodUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaRepo: INlqQaRepository,
    private readonly nlqQaGoodRepository: INlqQaGoodRepository,
    private readonly topologyGenPort: INlqQaTopologyGenerationPort,
    private readonly knowledgePort: INlqQaKnowledgePort
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
      this.logger.info(
        "[CreateNlqQaGoodUseCase] Input data validated successfully",
        dateValidate.data
      );
      // 2. GENERATION STEPS

      // 2.1 Generate detail question.
      const { detailQuestion } = await this.topologyGenPort.genDetailQuestion({
        question: data.question,
        query: data.query,
      });

      this.logger.info(
        "[CreateNlqQaGoodUseCase] Generated detail question:",
        detailQuestion
      );

      // 2.2 Generate tableColumns ["[TABLE].[COLUMN]"] .
      const { tablesColumns } = await this.topologyGenPort.genTablesColumns({
        query: data.query,
      });

      this.logger.info(
        "[CreateNlqQaGoodUseCase] Generated tablesColumns:",
        tablesColumns
      );

      // 2.3 Generate Semantic Fields
      const { semanticFields } = await this.topologyGenPort.genSemanticFields({
        question: detailQuestion,
        query: data.query,
      });

      this.logger.info(
        "[CreateNlqQaGoodUseCase] Generated semanticFields:",
        semanticFields
      );

      // 2.4 Generate Semantic Tables.
      const { semanticTables } = await this.topologyGenPort.genSemanticTables({
        question: detailQuestion,
        query: data.query,
      });

      this.logger.info(
        "[CreateNlqQaGoodUseCase] Generated semanticTables:",
        semanticTables
      );

      // 2.5 Generate Semantic Flags
      const { flags } = await this.topologyGenPort.genFlags({
        question: detailQuestion,
        query: data.query,
      });

      this.logger.info("[CreateNlqQaGoodUseCase] Generated flags:", flags);

      // 2.6 Generate thinking process
      const { think } = await this.topologyGenPort.genThinkProcess({
        question: detailQuestion,
        query: data.query,
      });

      this.logger.info(
        "[CreateNlqQaGoodUseCase] Generated thinking process:",
        think
      );

      // 3. Create NLQ QA Good
      const nlqQaGoodId = await this.nlqQaGoodRepository.create({
        ...dateValidate.data,
        originId: data.originId || "",
        questionBy: data.questionBy || "",
        detailQuestion,
        tablesColumns,
        semanticFields,
        semanticTables,
        flags,
        think,
        knowledgeSourceId: "",
        isOnKnowledgeSource: true,
        updatedBy: data.createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDelete: false,
      });
      if (!nlqQaGoodId) {
        this.logger.error(
          "[CreateNlqQaGoodUseCase] Failed to create NLQ QA Good"
        );
        return {
          success: false,
          message: "Failed to create NLQ QA Good",
          data: null,
        };
      }

      // 4. Add to knowledge source if not exists
      const knowledgeSourceId = await this.knowledgePort.create({
        question: data.question,
        query: data.query,
        nlqQaGoodId: nlqQaGoodId,
        id: nlqQaGoodId,
        tablesColumns: tablesColumns,
      });

      // 5. Search the created record to return
      const result = await this.nlqQaGoodRepository.findById(nlqQaGoodId);
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
      this.logger.info(
        "[CreateNlqQaGoodUseCase] Created NLQ QA Good found:",
        result
      );

      // 6. Update the nlq qa
      await this.nlqQaRepo.update(data.originId, {
        isGood: true,
        nlqQaGoodId: nlqQaGoodId,
        updatedAt: new Date(),
        updatedBy: data.createdBy,
      });

      // Return success response
      return {
        success: true,
        data: result,
        message: "NLQ QA Good created successfully",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : JSON.stringify(error);

      this.logger.error(
        "[CreateNlqQaGoodUseCase] Error creating NLQ QA Good:",
        errorMessage
      );

      return {
        success: false,
        message: `Error creating NLQ QA Good: ${errorMessage}`,
        data: null,
      };
    }
  }
}
