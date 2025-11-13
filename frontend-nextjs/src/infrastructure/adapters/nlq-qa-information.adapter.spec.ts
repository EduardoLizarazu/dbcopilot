// src/test/unit/nlq-qa-information.adapter.spec.ts
import type { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import type { OracleProvider } from "@/infrastructure/providers/database/oracle.infra.provider";
import { NlqQaInformationAdapter } from "./nlq-qa-information.adapter";

describe("NlqQaInformationAdapter (unit)", () => {
  const logger: jest.Mocked<ILogger> = {
    info: jest.fn(),
    error: jest.fn(),
  } as any;

  const dataSource = { query: jest.fn() } as unknown as { query: jest.Mock };
  const oracleProvider = { dataSource } as unknown as OracleProvider;

  const makeSut = () => new NlqQaInformationAdapter(logger, oracleProvider);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("extractSchemaBased", () => {
    it("should call dataSource.query with schema extraction SQL and return rows", async () => {
      const sut = makeSut();

      const rows = [
        {
          table_schema: "TMPRD",
          table_name: "ORDERS",
          column_name: "ID",
          data_type: "NUMBER",
          data_length: 22,
          data_precision: 10,
          data_scale: 0,
          nullable: "N",
          is_primary_key: "TRUE",
          is_foreign_key: "FALSE",
          referenced_table_schema: null,
          referenced_table_name: null,
          referenced_column_name: null,
        },
      ];

      dataSource.query.mockResolvedValue(rows);

      const out = await sut.extractSchemaBased(["ORDERS"]);
      expect(out).toEqual(rows);

      // Aseguramos que el SQL corresponde (no comparamos todo el string largo)
      const sql = dataSource.query.mock.calls[0][0] as string;
      expect(sql).toMatch(/FROM\s+ALL_TAB_COLUMNS/i);
      expect(sql).toMatch(/WHERE\s+[\s\S]*ac\.owner\s*=\s*'TMPRD'/i);
      expect(logger.info).toHaveBeenCalledWith(
        "[NlqQaInformationInfraRepository] Schema extracted",
        expect.objectContaining({ result: rows })
      );
    });

    it("should log error and rethrow when query fails", async () => {
      const sut = makeSut();
      dataSource.query.mockRejectedValue(new Error("oracle down"));

      await expect(sut.extractSchemaBased([])).rejects.toThrow(/oracle down/i);
      expect(logger.error).toHaveBeenCalledWith(
        "Error extracting schema",
        expect.any(Error)
      );
    });
  });

  describe("executeQuery", () => {
    it("should run the provided SQL and return the result as-is", async () => {
      const sut = makeSut();
      const result = { data: [{ id: 1, total: 10 }] };
      dataSource.query.mockResolvedValue(result);

      const out = await sut.executeQuery("SELECT 1");
      expect(out).toEqual(result);
      expect(dataSource.query).toHaveBeenCalledWith("SELECT 1");
    });

    it("should log error and rethrow on failure", async () => {
      const sut = makeSut();
      dataSource.query.mockRejectedValue(new Error("timeout"));

      await expect(sut.executeQuery("SELECT * FROM x")).rejects.toThrow(
        /timeout/i
      );
      expect(logger.error).toHaveBeenCalledWith(
        "Error executing query",
        expect.any(Error)
      );
    });
  });
});
