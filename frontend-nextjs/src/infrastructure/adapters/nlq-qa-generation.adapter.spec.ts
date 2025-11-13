// src/test/unit/nlq-qa-generation.adapter.spec.ts
import type { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import type { OpenAIProvider } from "@/infrastructure/providers/ai/openai.infra.provider";
import type { TCreateNlqQaGenerationPromptTemplate } from "@/core/application/dtos/nlq/nlq-qa-generation.dto";
import { NlqQaGenerationAdapter } from "./nlq-qa-generation.adapter";

describe("NlqQaGenerationAdapter (unit)", () => {
  const logger: jest.Mocked<ILogger> = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn?.() || (jest.fn() as any),
  } as any;

  const openai = {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  };
  const aiProvider = { openai } as unknown as OpenAIProvider;

  const makeSut = () => new NlqQaGenerationAdapter(logger, aiProvider);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("queryGeneration", () => {
    it("returns trimmed content from OpenAI", async () => {
      const sut = makeSut();
      openai.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: "  SELECT 1  " } }],
      } as any);

      const out = await sut.queryGeneration("PROMPT");
      expect(openai.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: expect.any(String),
          messages: expect.any(Array),
        })
      );
      expect(out).toEqual({ answer: "SELECT 1" });
    });

    it("logs and throws on provider error", async () => {
      const sut = makeSut();
      openai.chat.completions.create.mockRejectedValue(new Error("api down"));

      await expect(sut.queryGeneration("PROMPT")).rejects.toThrow(
        /Error generating query from prompt/
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("createPromptTemplateToGenerateQuery", () => {
    it("builds a template including schema, question and similarKnowledge", async () => {
      const sut = makeSut();
      const dto: TCreateNlqQaGenerationPromptTemplate = {
        question: "Total orders last month?",
        similarKnowledgeBased: [
          {
            id: "k1",
            nlqQaGoodId: "g1",
            question: "How many orders today?",
            query: "SELECT COUNT(*) FROM orders",
            tablesColumns: ["orders.id"],
            score: 0.9,
          },
        ],
        schemaBased: [
          {
            TABLE_SCHEMA: "TMPRD",
            TABLE_NAME: "ORDERS",
            COLUMN_NAME: "ID",
            DATA_TYPE: "NUMBER",
            DATA_LENGTH: 22,
            DATA_PRECISION: 10,
            DATA_SCALE: 0,
            NULLABLE: "N",
            IS_PRIMARY_KEY: "TRUE",
            IS_FOREIGN_KEY: "FALSE",
            REFERENCED_TABLE_SCHEMA: null,
            REFERENCED_TABLE_NAME: null,
            REFERENCED_COLUMN_NAME: null,
          },
        ],
      };

      const { promptTemplate } =
        await sut.createPromptTemplateToGenerateQuery(dto);

      expect(typeof promptTemplate).toBe("string");
      expect(promptTemplate).toMatch(/Database Schema oracle19c/i);
      expect(promptTemplate).toMatch(/Similar Questions with SQL/i);
      expect(promptTemplate).toContain("TMPRD");
      expect(promptTemplate).toContain("ORDERS");
      expect(promptTemplate).toContain("Total orders last month?");
    });
  });

  describe("extractQueryFromGenerationResponse", () => {
    it("extracts SQL inside ```sql ... ```", async () => {
      const sut = makeSut();
      const { query } = await sut.extractQueryFromGenerationResponse(`
        some text
        \`\`\`sql
        SELECT * FROM orders o
        JOIN customers c ON c.id = o.customer_id
        \`\`\`
      `);
      expect(query).toMatch(/SELECT \* FROM orders/i);
    });

    it("returns empty query if no sql block", async () => {
      const sut = makeSut();
      const { query } =
        await sut.extractQueryFromGenerationResponse("No code block here");
      expect(query).toBe("");
    });
  });

  describe("safeQuery", () => {
    it("marks SELECT as safe", async () => {
      const sut = makeSut();
      const out = await sut.safeQuery("SELECT * FROM orders");
      expect(out).toEqual({ query: "SELECT * FROM orders", isSafe: true });
    });

    it("marks destructive statements as unsafe", async () => {
      const sut = makeSut();
      const cases = [
        "DELETE FROM t",
        "DROP TABLE t",
        "UPDATE t SET x=1",
        "INSERT INTO t VALUES(1)",
        "ALTER TABLE t ADD c INT",
      ];
      for (const q of cases) {
        const out = await sut.safeQuery(q);
        expect(out.isSafe).toBe(false);
      }
    });
  });

  describe("extractSuggestionsFromGenerationResponse", () => {
    it("extracts suggestion inside ```NOT_ANSWERED ... ```", async () => {
      const sut = makeSut();
      const { suggestion } =
        await sut.extractSuggestionsFromGenerationResponse(`
        \`\`\`NOT_ANSWERED
        I don't know because schema lacks ORDER_DATE.
        \`\`\`
      `);
      expect(suggestion).toMatch(/schema lacks ORDER_DATE/i);
    });

    it("returns empty suggestion if block not present", async () => {
      const sut = makeSut();
      const { suggestion } =
        await sut.extractSuggestionsFromGenerationResponse("plain text");
      expect(suggestion).toBe("");
    });
  });
});
