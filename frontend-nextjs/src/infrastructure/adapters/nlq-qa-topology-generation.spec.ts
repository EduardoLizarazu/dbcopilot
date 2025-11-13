// src/test/unit/nlq-qa-topology-generation.adapter.spec.ts
import type { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import type { OpenAIProvider } from "@/infrastructure/providers/ai/openai.infra.provider";
import { NlqQaTopologyGenerationAdapter } from "./nlq-qa-topology-generation";

describe("NlqQaTopologyGenerationAdapter (unit)", () => {
  const logger: jest.Mocked<ILogger> = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn() as any,
  } as any;

  // Mock OpenAI chat completions
  const openai = {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  };
  const openaiProvider = { openai } as unknown as OpenAIProvider;

  const makeSut = () =>
    new NlqQaTopologyGenerationAdapter(logger, openaiProvider);

  const mockCreateOnce = (content: string) => {
    openai.chat.completions.create.mockResolvedValueOnce({
      choices: [{ message: { content } }],
    } as any);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------- genDetailQuestion ----------
  it("genDetailQuestion: extrae bloque ```question``` y devuelve solo la pregunta", async () => {
    const sut = makeSut();
    const content = `
\`\`\`question
¿Cuántas órdenes del último mes por cliente?
\`\`\`
`;
    mockCreateOnce(content);

    const out = await sut.genDetailQuestion({
      question: "¿Órdenes del mes?",
      query: "SELECT ...",
    });
    expect(out.detailQuestion).toMatch(
      /¿Cuántas órdenes del último mes por cliente\?/
    );
    expect(logger.info).toHaveBeenCalled();
  });

  it("genDetailQuestion: si no hay bloque, devuelve el contenido crudo", async () => {
    const sut = makeSut();
    mockCreateOnce("Pregunta detallada sin bloque");
    const out = await sut.genDetailQuestion({ question: "Q", query: "SELECT" });
    expect(out.detailQuestion).toBe("Pregunta detallada sin bloque");
    expect(logger.warn).toHaveBeenCalled();
  });

  it("genDetailQuestion: error -> log y throw", async () => {
    const sut = makeSut();
    openai.chat.completions.create.mockRejectedValueOnce(new Error("api down"));
    await expect(
      sut.genDetailQuestion({ question: "Q", query: "SELECT" })
    ).rejects.toThrow(/Error generating detailed question/);
    expect(logger.error).toHaveBeenCalled();
  });

  // ---------- genTablesColumns ----------
  it("genTablesColumns: extrae JSON dentro de ```json``` y lo parsea", async () => {
    const sut = makeSut();
    const content = `
\`\`\`json
["orders.id","orders.date","customers"]
\`\`\`
`;
    mockCreateOnce(content);
    const out = await sut.genTablesColumns({ query: "SELECT * FROM orders" });
    expect(out.tablesColumns).toEqual([
      "orders.id",
      "orders.date",
      "customers",
    ]);
  });

  it("genTablesColumns: sin bloque -> []", async () => {
    const sut = makeSut();
    mockCreateOnce("no block");
    const out = await sut.genTablesColumns({ query: "SELECT 1" });
    expect(out.tablesColumns).toEqual([]);
    expect(logger.warn).toHaveBeenCalled();
  });

  it("genTablesColumns: error -> log y throw", async () => {
    const sut = makeSut();
    openai.chat.completions.create.mockRejectedValueOnce(new Error("bad"));
    await expect(sut.genTablesColumns({ query: "SELECT" })).rejects.toThrow(
      /Error generating tables and columns/
    );
    expect(logger.error).toHaveBeenCalled();
  });

  // ---------- genSemanticFields ----------
  it("genSemanticFields: extrae JSON con {field,purpose}[]", async () => {
    const sut = makeSut();
    const content = `
\`\`\`json
[
  {"field":"orders.id","purpose":"identificar orden"},
  {"field":"orders.date","purpose":"filtrar por mes"}
]
\`\`\`
`;
    mockCreateOnce(content);
    const out = await sut.genSemanticFields({ question: "Q", query: "SELECT" });
    expect(out.semanticFields).toEqual([
      { field: "orders.id", purpose: "identificar orden" },
      { field: "orders.date", purpose: "filtrar por mes" },
    ]);
  });

  it("genSemanticFields: sin bloque -> []", async () => {
    const sut = makeSut();
    mockCreateOnce("no json");
    const out = await sut.genSemanticFields({ question: "Q", query: "SELECT" });
    expect(out.semanticFields).toEqual([]);
    expect(logger.warn).toHaveBeenCalled();
  });

  it("genSemanticFields: error -> log y throw", async () => {
    const sut = makeSut();
    openai.chat.completions.create.mockRejectedValueOnce(new Error("oops"));
    await expect(
      sut.genSemanticFields({ question: "Q", query: "SELECT" })
    ).rejects.toThrow(/Error generating semantic fields/);
    expect(logger.error).toHaveBeenCalled();
  });

  // ---------- genSemanticTables ----------
  it("genSemanticTables: extrae JSON con {table,purpose}[]", async () => {
    const sut = makeSut();
    const content = `
\`\`\`json
[
  {"table":"orders","purpose":"fuente principal"},
  {"table":"customers","purpose":"join para nombre"}
]
\`\`\`
`;
    mockCreateOnce(content);
    const out = await sut.genSemanticTables({ question: "Q", query: "SELECT" });
    expect(out.semanticTables).toEqual([
      { table: "orders", purpose: "fuente principal" },
      { table: "customers", purpose: "join para nombre" },
    ]);
  });

  it("genSemanticTables: sin bloque -> []", async () => {
    const sut = makeSut();
    mockCreateOnce("empty");
    const out = await sut.genSemanticTables({ question: "Q", query: "SELECT" });
    expect(out.semanticTables).toEqual([]);
    expect(logger.warn).toHaveBeenCalled();
  });

  it("genSemanticTables: error -> log y throw", async () => {
    const sut = makeSut();
    openai.chat.completions.create.mockRejectedValueOnce(new Error("err"));
    await expect(
      sut.genSemanticTables({ question: "Q", query: "SELECT" })
    ).rejects.toThrow(/Error generating semantic tables/);
    expect(logger.error).toHaveBeenCalled();
  });

  // ---------- genFlags ----------
  it("genFlags: extrae JSON con {field,flag}[]", async () => {
    const sut = makeSut();
    const content = `
\`\`\`json
[
  {"field":"orders.status","flag":"posible falta WHERE por fecha"},
  {"field":"customers.id","flag":"join sin índice"}
]
\`\`\`
`;
    mockCreateOnce(content);
    const out = await sut.genFlags({ question: "Q", query: "SELECT" });
    expect(out.flags).toEqual([
      { field: "orders.status", flag: "posible falta WHERE por fecha" },
      { field: "customers.id", flag: "join sin índice" },
    ]);
  });

  it("genFlags: sin bloque -> []", async () => {
    const sut = makeSut();
    mockCreateOnce("plain");
    const out = await sut.genFlags({ question: "Q", query: "SELECT" });
    expect(out.flags).toEqual([]);
    expect(logger.warn).toHaveBeenCalled();
  });

  it("genFlags: error -> log y throw", async () => {
    const sut = makeSut();
    openai.chat.completions.create.mockRejectedValueOnce(new Error("fail"));
    await expect(
      sut.genFlags({ question: "Q", query: "SELECT" })
    ).rejects.toThrow(/Error generating flags/);
    expect(logger.error).toHaveBeenCalled();
  });

  // ---------- genThinkProcess ----------
  it("genThinkProcess: extrae bloque ```think``` y devuelve solo el contenido", async () => {
    const sut = makeSut();
    const content = `
\`\`\`think
- Identifico tablas principales (orders, customers)
- Filtro por rango de fechas del último mes
- Cuento registros por cliente
\`\`\`
`;
    mockCreateOnce(content);
    const out = await sut.genThinkProcess({ question: "Q", query: "SELECT" });
    expect(out.think).toMatch(/Identifico tablas principales/);
  });

  it("genThinkProcess: sin bloque -> devuelve el crudo", async () => {
    const sut = makeSut();
    mockCreateOnce("explicación directa sin bloque");
    const out = await sut.genThinkProcess({ question: "Q", query: "SELECT" });
    expect(out.think).toBe("explicación directa sin bloque");
    expect(logger.warn).toHaveBeenCalled();
  });

  it("genThinkProcess: error -> log y throw", async () => {
    const sut = makeSut();
    openai.chat.completions.create.mockRejectedValueOnce(new Error("down"));
    await expect(
      sut.genThinkProcess({ question: "Q", query: "SELECT" })
    ).rejects.toThrow(/Error generating think process/);
    expect(logger.error).toHaveBeenCalled();
  });
});
