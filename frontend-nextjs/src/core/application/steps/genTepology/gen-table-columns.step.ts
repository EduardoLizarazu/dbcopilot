import { ILogger } from "../../interfaces/ilog.app.inter";
import { INlqQaTopologyGenerationPort } from "../../ports/nlq-qa-topology-generation.port";

export interface IGenTableColumnsStep {
  run(data: { query: string }): Promise<{ tablesColumns: string[] }>;
}

export class GenTableColumnsStep implements IGenTableColumnsStep {
  constructor(
    private readonly logger: ILogger,
    private readonly genTopoPort: INlqQaTopologyGenerationPort
  ) {}
  async run(data: { query: string }): Promise<{ tablesColumns: string[] }> {
    try {
      this.logger.info(
        `[GenTableColumnsStep] Running table columns generation from topology`,
        data
      );
      // 1. Validate input
      if (!data.query || data.query.trim() === "") {
        this.logger.error(
          `[GenTableColumnsStep] Invalid input query: ${data?.query}`
        );
        throw new Error("Invalid input query");
      }
      // 2. Generate table columns using the generation port
      const response = await this.genTopoPort.genTablesColumns({
        query: data.query,
      });

      if (!response?.tablesColumns || response.tablesColumns.length === 0) {
        this.logger.error(
          `[GenTableColumnsStep] No table columns generated from topology`
        );
        throw new Error("No table columns generated from topology");
      }
      return { tablesColumns: response.tablesColumns };
    } catch (error) {
      this.logger.error(`[GenTableColumnsStep] Error: ${error.message}`);
      throw new Error(`[GenTableColumnsStep] Error: ${error.message}`);
    }
  }
}
