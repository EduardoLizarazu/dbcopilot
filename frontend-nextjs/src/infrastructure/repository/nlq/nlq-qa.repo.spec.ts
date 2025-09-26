// src/test/e2e/nlq-qa.repository.int.spec.ts
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import type { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { NlqQaAppRepository } from "./nlq-qa.repo";
import { NlqQaBuilder } from "@/test/test-utils/builders/nlq-qa.builder";

const logger: jest.Mocked<ILogger> = {
  info: jest.fn(),
  error: jest.fn(),
} as any;

describe.skip("NlqQaAppRepository (integration - Firestore)", () => {
  jest.setTimeout(30_000);

  const fb = new FirebaseAdminProvider(); // Usa tu proyecto de dev/test
  const repo = new NlqQaAppRepository(logger, fb);

  const clean = async () => {
    const snap = await fb.db.collection(fb.coll.NLQ_QA).get();
    const batch = fb.db.batch();
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await clean();
  });

  it("create -> returns id; findById -> returns inserted document", async () => {
    const createDto = NlqQaBuilder.makeCreateDto({
      question: "How many orders last month?",
      query: "SELECT COUNT(*) FROM orders WHERE date >= '2024-08-01'",
      knowledgeSourceUsedId: ["k1"],
    });

    const id = await repo.create(createDto);
    expect(id).toBeTruthy();

    const found = await repo.findById(id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(id);
    expect(found!.question).toBe(createDto.question);
    expect(found!.query).toBe(createDto.query);
    expect(found!.knowledgeSourceUsedId).toEqual(["k1"]);
    expect(found!.isGood).toBe(true);
    expect(found!.userDeleted).toBe(false);
  });

  it("findAll -> returns all documents", async () => {
    const a = NlqQaBuilder.makeCreateDto({
      question: "Q1",
      query: "SELECT 1",
      knowledgeSourceUsedId: ["k1"],
    });
    const b = NlqQaBuilder.makeCreateDto({
      question: "Q2",
      query: "SELECT 2",
      knowledgeSourceUsedId: ["k2"],
    });
    await repo.create(a);
    await repo.create(b);

    const all = await repo.findAll();
    const names = all.map((d) => d.question).sort();
    expect(names).toEqual(["Q1", "Q2"]);
  });

  it("update -> persists changes", async () => {
    const id = await repo.create(
      NlqQaBuilder.makeCreateDto({
        question: "Q",
        query: "SELECT * FROM orders",
        knowledgeSourceUsedId: ["k1"],
      })
    );

    await repo.update(
      id,
      NlqQaBuilder.makeUpdateDto({
        query: "SELECT * FROM orders WHERE status = 'PAID'",
        updatedBy: "user-2",
        updatedAt: new Date(),
      })
    );

    const found = await repo.findById(id);
    expect(found?.query).toMatch(/status = 'PAID'/);
    expect(found?.updatedBy).toBe("user-2");
  });

  it("softDeleteById -> sets userDeleted=true", async () => {
    const id = await repo.create(
      NlqQaBuilder.makeCreateDto({
        question: "To delete",
        query: "SELECT 1",
        knowledgeSourceUsedId: ["k1"],
      })
    );

    await repo.softDeleteById(id);

    const found = await repo.findById(id);
    expect(found).not.toBeNull();
    expect(found!.userDeleted).toBe(true);
  });

  it("delete -> removes document", async () => {
    const id = await repo.create(
      NlqQaBuilder.makeCreateDto({
        question: "Temp",
        query: "SELECT 1",
        knowledgeSourceUsedId: ["k1"],
      })
    );

    await repo.delete(id);

    const found = await repo.findById(id);
    expect(found).toBeNull();
  });
});
