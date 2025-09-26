// src/test/e2e/nlq.post.e2e.spec.ts
import { NextRequest } from "next/server";

// 👇 Mocks **ANTES** de importar la ruta
// 1) Autorización (roles) – como permitiste:
jest.mock("@/infrastructure/repository/auth.repo", () => ({
  AuthorizationRepository: jest.fn().mockImplementation(() => ({
    findRolesNamesByUserId: jest
      .fn()
      .mockResolvedValue({ roleNames: ["ADMIN"] }),
    hasRoles: jest.fn().mockResolvedValue({ hasAuth: true }),
  })),
}));

// 2) Decoder de token – como permitiste:
jest.mock("@/infrastructure/adapters/decode-token.adapter", () => ({
  DecodeTokenAdapter: jest.fn().mockImplementation(() => ({
    decodeToken: jest.fn().mockResolvedValue({ uid: "test-user-1" }),
  })),
}));

// 3) Adapters/Providers pesados (OpenAI/Oracle/Pinecone) para que el use case sea determinista
//    Si tu composer usa estos módulos, los dejamos “buenos” para el happy path:
jest.mock("@/infrastructure/adapters/nlq-qa-knowledge.adapter", () => ({
  NlqQaKnowledgeAdapter: jest.fn().mockImplementation(() => ({
    // similar questions vacías
    findByQuestion: jest.fn().mockResolvedValue([]),
  })),
}));

jest.mock("@/infrastructure/adapters/nlq-qa-information.adapter", () => ({
  NlqQaInformationAdapter: jest.fn().mockImplementation(() => ({
    // esquema mínimo válido
    extractSchemaBased: jest.fn().mockResolvedValue([
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
    ]),
    // ejecutar query devuelve datos
    executeQuery: jest.fn().mockResolvedValue({ data: [{ id: 1 }] }),
  })),
}));

jest.mock("@/infrastructure/adapters/nlq-qa-generation.adapter", () => ({
  NlqQaGenerationAdapter: jest.fn().mockImplementation(() => ({
    // prompt template no vacío
    createPromptTemplateToGenerateQuery: jest
      .fn()
      .mockResolvedValue({ promptTemplate: "PROMPT..." }),
    // respuesta con bloque ```sql
    queryGeneration: jest
      .fn()
      .mockResolvedValue({ answer: "```sql\nSELECT * FROM ORDERS\n```" }),
    // extracción de SQL
    extractQueryFromGenerationResponse: jest
      .fn()
      .mockResolvedValue({ query: "SELECT * FROM ORDERS" }),
    // seguro
    safeQuery: jest
      .fn()
      .mockResolvedValue({ query: "SELECT * FROM ORDERS", isSafe: true }),
    // fallback de sugerencias (no se usará en happy path)
    extractSuggestionsFromGenerationResponse: jest
      .fn()
      .mockResolvedValue({ suggestion: "" }),
  })),
}));

// 4) Repo de persistencia (Firestore) – puedes elegir:
//    a) Usar Firestore real (dev/test) -> NO mockear este repo
//    b) Mockear para que sea 100% determinista y no requiera red
//    Aquí lo mockeamos para E2E estable:
jest.mock("@/infrastructure/repository/nlq/nlq-qa.repo", () => ({
  NlqQaAppRepository: jest.fn().mockImplementation(() => {
    let lastId = "nlq-1";
    const stored = {
      id: lastId,
      question: "How many orders last month?",
      query: "SELECT * FROM ORDERS",
      isGood: true,
      timeQuestion: new Date(),
      timeQuery: new Date(),
      knowledgeSourceUsedId: [],
      userDeleted: false,
      feedbackId: "",
      createdBy: "test-user-1",
      updatedBy: "test-user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return {
      create: jest.fn().mockResolvedValue(lastId),
      findById: jest.fn().mockResolvedValue(stored),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn().mockResolvedValue([stored]),
      softDeleteById: jest.fn(),
    };
  }),
}));

// 5) Si tu composer (createNlqQaComposer) construye con los módulos anteriores,
//    no es necesario mockear el composer. Si tu path es distinto, ajusta el import de la ruta debajo.

// 🔹 Importa la route real (después de mocks)
import { POST as NLQ_POST } from "@/app/api/nlq/route";

// Helper: construir NextRequest con JSON
const makeNextJsonRequest = (
  url: string,
  body: unknown,
  headers: Record<string, string> = {}
) =>
  new NextRequest(new URL(url, "http://localhost"), {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  } as any);

describe("E2E /api/nlq POST", () => {
  it("201 -> crea un NLQ cuando está autorizado y el flujo es correcto", async () => {
    const req = makeNextJsonRequest(
      "/api/nlq",
      { question: "How many orders last month?" },
      { Authorization: `Bearer FAKE_TOKEN` }
    );

    const res = await NLQ_POST(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    console.log("[TEST-E2E][nlq-post-201]", json);

    // tu controller responde con success_201({ message, data })
    expect(json?.message).toMatch(/created successfully/i);
    // y el usecase.data debería venir en data.data
    expect(json?.data?.query).toBe("SELECT * FROM ORDERS");
  });

  it("400 -> falta el parámetro 'question'", async () => {
    const req = makeNextJsonRequest(
      "/api/nlq",
      { invalid: true },
      { Authorization: `Bearer FAKE_TOKEN` }
    );

    const res = await NLQ_POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(String(json.message)).toMatch(/Missing param|No body|Invalid/i);
  });

  it("400 -> sin token Bearer", async () => {
    const req = makeNextJsonRequest("/api/nlq", { question: "Q?" });
    const res = await NLQ_POST(req);
    expect(res.status).toBe(400); // tu controller devuelve 400 si no hay Bearer en headers
    const json = await res.json();
    expect(String(json.message)).toMatch(/Error creating NLQ QA|token/i);
  });
});
