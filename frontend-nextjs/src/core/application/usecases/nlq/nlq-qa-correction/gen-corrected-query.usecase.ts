import {
  genQueryCorrectionDto,
  TGenQueryCorrectionDto,
} from "@/core/application/dtos/gen-query.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaQueryGenerationPort } from "@/core/application/ports/nlq-qa-query-generation.port";
import { IGenTableColumnsStep } from "@/core/application/steps/genTepology/gen-table-columns.step";
import { IReadSchemaCtxByConnIdStep } from "@/core/application/steps/schemaCtx/read-schema-ctx-by-conn-id.step";

export interface IGenCorrectedQueryUseCase {
  execute(
    data: TGenQueryCorrectionDto
  ): Promise<TResponseDto<{ newQuery: string }>>;
}

export class GenCorrectedQueryUseCase implements IGenCorrectedQueryUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly readSchemaCtxByConnId: IReadSchemaCtxByConnIdStep,
    private readonly genTableColumnsStep: IGenTableColumnsStep,
    private readonly nlqQaQueryGenerationPort: INlqQaQueryGenerationPort
  ) {}
  async execute(
    data: TGenQueryCorrectionDto
  ): Promise<TResponseDto<{ newQuery: string }>> {
    try {
      this.logger.info(
        `[IGenCorrectedQueryUseCase] Generating corrected query for previous query: ${data.wrongQuery} with hint: ${data.hint}`
      );
      const vData = await genQueryCorrectionDto.safeParseAsync(data);
      if (!vData.success) {
        this.logger.error(
          `[IGenCorrectedQueryUseCase] Validation failed: `,
          JSON.stringify(vData.error.format())
        );
        return {
          success: false,
          message: "Validation failed.",
          data: null,
        };
      }
      const validData = vData.data;

      // Generate table columns for wrong query
      const wrongQueryTableColumns = await this.genTableColumnsStep.run({
        query: validData.wrongQuery,
      });

      // Read schema context from DB connection ID
      const schemaCtxBase = await this.readSchemaCtxByConnId.run({
        connId: validData.dbConnectionId,
      });

      //   Extract from schema context only the schema/tables/columns used in nlqGoodUsed and wrongQueryTableColumns
      //   items [schema.table.column]
      //   nlqGoodUsed.tableColumns + wrongQueryTableColumns
      //   const totalTableColumns = [
      //     ...wrongQueryTableColumns.tablesColumns,
      //     ...validData.nlqGoodUsed.flatMap((nlq) => nlq.tableColumns || []),
      //   ];

      //   validData.schemaCtx = schemaCtxBase?.schemaCtx?.map((schema) => {
      //     if (schema.id) {
      //     }
      //   });
      validData.schemaCtx = schemaCtxBase?.schemaCtx || [];

      const { query } =
        await this.nlqQaQueryGenerationPort.genCorrectQuery(validData);
      return {
        success: true,
        message: "Corrected query generated successfully.",
        data: { newQuery: query },
      };
    } catch (error) {
      this.logger.error(
        `[IGenCorrectedQueryUseCase] Error generating corrected query: `,
        error.message
      );
      return {
        success: false,
        message: error.message || "Failed to generate corrected query.",
        data: null,
      };
    }
  }
}
