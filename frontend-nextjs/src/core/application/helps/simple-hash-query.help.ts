import { ILogger } from "../interfaces/ilog.app.inter";
import crypto from "crypto";

export interface ISimpleHashQueryHelp {
  help(data: { query: string }): Promise<{ queryHash: string }>;
}

export class SimpleHashQueryHelp implements ISimpleHashQueryHelp {
  constructor(private readonly logger: ILogger) {}
  async help(data: { query: string }): Promise<{ queryHash: string }> {
    try {
      // Verify input data
      if (!data?.query) {
        this.logger.error("[HashQueryHelp]: Missing query in input data.");
        throw new Error("Query must be provided.");
      }

      // Normalize the query
      const normalizedQuery = data.query
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

      const hash = crypto
        .createHash("sha256")
        .update(normalizedQuery)
        .digest("hex");

      return { queryHash: hash };
    } catch (error) {
      this.logger.error("[HashQueryHelp]: ", error.message || "Unknown error");
      throw new Error(
        error.message || "Failed to generate help for hash query."
      );
    }
  }
}
