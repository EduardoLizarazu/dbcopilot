import {
  NlqQaGoodWithExecutionStatus,
  TNlqQaGoodInRequestDto,
  TNlqQaGoodOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "../../../interfaces/ilog.app.inter";
import { IValidateCreateNlqQaGoodInputDataStep } from "@/core/application/steps/nlq-qa-good/validate-create-nlq-qa-good-input-data.step";
import { IReadDbConnectionWithSplitterAndSchemaQueryStep } from "@/core/application/steps/dbconn/read-dbconnection-with-splitter-and-schema-query.usecase.step";
import { ICreateNlqQaGoodStep } from "@/core/application/steps/nlq-qa-good/create-nlq-qa-good.step";
import { IAddToTheKnowledgeBaseStep } from "@/core/application/steps/knowledgeBased/add-to-knowledge-base.step";
import { IUpdateNlqQaGoodFieldFromGoodStep } from "@/core/application/steps/nlq-qa/update-nlq-qa-good-field-from-good.step";
import { IUpdateNlqQaGoodKnowledgeStep } from "@/core/application/steps/nlq-qa-good/update-nlq-qa-good-knowledge.step";
import { IGenTableColumnsStep } from "@/core/application/steps/genTepology/gen-table-columns.step";

export interface ICreateNlqQaGoodUseCase {
  execute(
    data: TNlqQaGoodInRequestDto
  ): Promise<TResponseDto<TNlqQaGoodOutRequestDto>>;
}

/**
 * Use case for creating a new NLQ QA Good entry:
 * 1. Validates the input data.
 * 2. Ensure dbConnection exists with splitter.
 * 3. Creates the NLQ QA Good entry.
 * 4. Adds the entry to the knowledge source if onKnowledgeSource is true and update the Nlq Qa Good onKnowledgeSource to true and add knowledgeSourceId.
 * 5. If an originId is provided, updates the corresponding NLQ QA entry to mark it as "good".
 * 6. Returns the created or updated NLQ QA Good entry or an error message if any step fails.
 */
export class CreateNlqQaGoodUseCase implements ICreateNlqQaGoodUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly validateInputDataStep: IValidateCreateNlqQaGoodInputDataStep,
    private readonly ensureDbConnWithSplitterExistsStep: IReadDbConnectionWithSplitterAndSchemaQueryStep,
    private readonly createNlqQaGoodStep: ICreateNlqQaGoodStep,
    private readonly addToKnowledgeSource: IAddToTheKnowledgeBaseStep,
    private readonly updateNlqQaGoodOnKnowledgeStep: IUpdateNlqQaGoodKnowledgeStep,
    private readonly updateNlqQaIfOriginIdStep: IUpdateNlqQaGoodFieldFromGoodStep,
    private readonly genTableColumnsStep: IGenTableColumnsStep
  ) {}

  async execute(
    data: TNlqQaGoodInRequestDto
  ): Promise<TResponseDto<TNlqQaGoodOutRequestDto>> {
    try {
      this.logger.info(
        "[CreateNlqQaGoodUseCase] Starting execution with input data:",
        data
      );

      // Step 1: Validate input data
      const validData = await this.validateInputDataStep.run(data);

      // Generate tablesColumns if not provided
      // const schemaRepresentation = await this.genTableColumnsStep.run({
      //   query: validData.query,
      // });

      // Step 2: Ensure dbConnection exists with splitter
      const dbConn = await this.ensureDbConnWithSplitterExistsStep.run({
        dbConnectionId: validData.dbConnectionId,
      });

      // Step 3: Creates the NLQ QA Good entry.
      let nlqGood = null;
      const createdNlqQaGood = await this.createNlqQaGoodStep.run({
        question: validData.question,
        query: validData.query,
        executionStatus: NlqQaGoodWithExecutionStatus.OK,
        originId: validData.originId,
        dbConnectionId: validData.dbConnectionId,
        questionBy: validData.questionBy,
        createdBy: validData.actorId,
        detailQuestion: validData.detailQuestion,
        think: validData.think,
        tablesColumns: validData.tablesColumns,
        // tablesColumns: schemaRepresentation?.tablesColumns,
        semanticFields: validData.semanticFields,
        semanticTables: validData.semanticTables,
        flags: validData.flags,
      });
      nlqGood = createdNlqQaGood; // store for return later

      // Step 4: Adds the entry to the knowledge source if onKnowledgeSource is true and update the Nlq Qa Good onKnowledgeSource to true and add knowledgeSourceId.
      if (validData.isOnKnowledgeSource) {
        const knowledgeSourceId = await this.addToKnowledgeSource.run({
          id: createdNlqQaGood.id,
          question: createdNlqQaGood.question,
          query: createdNlqQaGood.query,
          nlqQaGoodId: createdNlqQaGood.id,
          tablesColumns: createdNlqQaGood.tablesColumns,
          namespace: dbConn.vbd_splitter.name,
        });

        // Update the createdNlqQaGood with knowledgeSourceId and isOnKnowledgeSource = true
        const updatedNlqQaGood = await this.updateNlqQaGoodOnKnowledgeStep.run({
          id: createdNlqQaGood.id,
          knowledgeSourceId: knowledgeSourceId.id,
          isOnKnowledgeSource: true,
        });
        nlqGood = updatedNlqQaGood; // store for return later
      }

      // Step 5: If an originId is provided, updates the corresponding NLQ QA entry to mark it as "good".
      if (validData.originId) {
        await this.updateNlqQaIfOriginIdStep.run({
          id: validData.originId,
          nlqQaGoodId: createdNlqQaGood.id,
          isGood: true,
        });
      }

      // Step 6: Return the created or updated NLQ QA Good entry
      this.logger.info(
        "[CreateNlqQaGoodUseCase] Successfully created NLQ QA Good entry:",
        nlqGood
      );
      return {
        success: true,
        message: "NLQ QA Good created successfully",
        data: nlqGood,
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
        message: `Error creating NLQ QA Good: ${errorMessage || error.message}`,
        data: null,
      };
    }
  }
}
