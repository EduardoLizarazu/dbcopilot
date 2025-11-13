import {
  TGenTopologyInRequestDto,
  TGenTopologyOutRequestDto,
} from "../../dtos/nlq/nlq-qa-good.app.dto";
import { TResponseDto } from "../../dtos/utils/response.app.dto";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { IGenSemanticFieldsStep } from "../../steps/genTepology/gen-semantic-fields.step";
import { IGenSemanticFlagsStep } from "../../steps/genTepology/gen-semantic-flags.step";
import { IGenSemanticTableStep } from "../../steps/genTepology/gen-semantic-table.step";
import { IGenTableColumnsStep } from "../../steps/genTepology/gen-table-columns.step";
import { IGenThinkingProcessStep } from "../../steps/genTepology/gen-thinking-process.step";
import { IGenTopologyValidDataInRqStep } from "../../steps/genTepology/gen-topo-valid-data-in-rq.step";

export interface IGenTopologyUseCase {
  execute(
    data: TGenTopologyInRequestDto
  ): Promise<TResponseDto<TGenTopologyOutRequestDto>>;
}

/**
 * Use case for generating topology from a question and query:
 * 1. Validates the input data.
 * 2. Generate tableColumns ["[TABLE].[COLUMN]"].
 * 3. Generate Semantic Fields.
 * 4. Generate Semantic Tables.
 * 5. Generate Semantic Flags.
 * 6. Generate thinking process.
 */

export class GenTopologyUseCase implements IGenTopologyUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly genTopologyValidDataInRqStep: IGenTopologyValidDataInRqStep,
    private readonly genTableColumnsStep: IGenTableColumnsStep,
    private readonly genSemanticFieldsStep: IGenSemanticFieldsStep,
    private readonly genSemanticTablesStep: IGenSemanticTableStep,
    private readonly genSemanticFlagsStep: IGenSemanticFlagsStep,
    private readonly genThinkingProcessStep: IGenThinkingProcessStep
  ) {}

  async execute(
    data: TGenTopologyInRequestDto
  ): Promise<TResponseDto<TGenTopologyOutRequestDto>> {
    try {
      this.logger.info(
        "[GenTopologyUseCase] Input data validated successfully",
        data
      );
      // 1. Validate input data
      const validData = await this.genTopologyValidDataInRqStep.run(data);

      //   2. Generate tableColumns ["[TABLE].[COLUMN]"].
      const tableColumns = await this.genTableColumnsStep.run({
        query: validData.query,
      });

      // 3. Generate Semantic Fields.
      const semanticFields = await this.genSemanticFieldsStep.run({
        question: validData.question,
        query: validData.query,
      });

      // 4. Generate Semantic Tables.
      const semanticTables = await this.genSemanticTablesStep.run({
        question: validData.question,
        query: validData.query,
      });

      // 5. Generate Semantic Flags.
      const semanticFlags = await this.genSemanticFlagsStep.run({
        question: validData.question,
        query: validData.query,
      });

      // 6. Generate thinking process.
      const thinkingProcess = await this.genThinkingProcessStep.run({
        question: validData.question,
        query: validData.query,
      });

      const responseData: TGenTopologyOutRequestDto = {
        tablesColumns: tableColumns.tablesColumns,
        semanticFields: Array.isArray(semanticFields)
          ? semanticFields
          : semanticFields.semanticFields,
        semanticTables: Array.isArray(semanticTables)
          ? semanticTables
          : semanticTables.semanticTables,
        flags: Array.isArray(semanticFlags)
          ? semanticFlags
          : Array.isArray(semanticFlags.flags)
            ? semanticFlags.flags.map(
                (f: { flag: string; purpose: string }) => ({
                  flag: f.flag,
                  field: f.purpose, // or map to the correct field if available
                })
              )
            : [],
        think:
          typeof thinkingProcess === "string"
            ? thinkingProcess
            : thinkingProcess.think,
      };

      this.logger.info(
        "[GenTopologyUseCase] Response data generated successfully",
        responseData
      );

      return {
        success: true,
        message: "Topology generated successfully",
        data: responseData,
      };
    } catch (error) {
      this.logger.error(`[GenTopologyUseCase] Error: ${error.message}`);
      return {
        success: false,
        message:
          "Error generating topology: " + (error as Error).message || error,
        data: null,
      };
    }
  }
}
