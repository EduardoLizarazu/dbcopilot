// src/test/e2e/nlq-qa-error.repository.int.spec.ts
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import type { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { NlqQaErrorRepository } from "./nlq-qa-error.repo";
import { NlqQaErrorBuilder } from "@/test/test-utils/builders/nlq-qa-error.builder";

const logger: jest.Mocked<ILogger> = {
  info: jest.fn(),
  error: jest.fn(),
} as any;

describe.skip("NlqQaErrorRepository (integration - Firestore)", () => {
  jest.setTimeout(30_000);

  const fb = new FirebaseAdminProvider(); // usa tu proyecto dev/test
  const repo = new NlqQaErrorRepository(logger, fb);

  const clean = async () => {
    const snap = await fb.db.collection(fb.coll.NLQ_ERRORS).get();
    if (snap.empty) return;
    const batch = fb.db.batch();
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await clean();
  });

  it("create -> returns id; findById -> returns inserted doc", async () => {
    const dto = NlqQaErrorBuilder.makeCreateDto({
      question: "Why failed?",
      query: "SELECT * FROM orders",
      errorMessage: "timeout",
      createdBy: "user-1",
    });

    const id = await repo.create(dto);
    expect(id).toBeTruthy();

    const found = await repo.findById(id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(id);
    expect(found!.question).toBe(dto.question);
    expect(found!.query).toBe(dto.query);
    expect(found!.errorMessage).toBe("timeout");
    expect(found!.createdBy).toBe("user-1");
  });

  it("findAll -> returns all errors", async () => {
    await repo.create(
      NlqQaErrorBuilder.makeCreateDto({
        question: "Q1",
        query: "SELECT 1",
        errorMessage: "bad syntax",
        createdBy: "u1",
      })
    );
    await repo.create(
      NlqQaErrorBuilder.makeCreateDto({
        question: "Q2",
        query: "SELECT 2",
        errorMessage: "timeout",
        createdBy: "u2",
      })
    );

    const all = await repo.findAll();
    const qs = all.map((e) => e.question).sort();
    expect(qs).toEqual(["Q1", "Q2"]);
  });

  it("update -> persists changes", async () => {
    const id = await repo.create(
      NlqQaErrorBuilder.makeCreateDto({
        question: "Q",
        query: "SELECT * FROM t",
        errorMessage: "orig",
        createdBy: "u1",
      })
    );

    await repo.update(
      id,
      NlqQaErrorBuilder.makeUpdateDto({
        errorMessage: "fixed info",
      })
    );

    const found = await repo.findById(id);
    expect(found?.errorMessage).toBe("fixed info");
  });

  it("delete -> removes document", async () => {
    const id = await repo.create(
      NlqQaErrorBuilder.makeCreateDto({
        question: "To delete",
        query: "SELECT 1",
        errorMessage: "boom",
        createdBy: "u1",
      })
    );

    await repo.delete(id);
    const found = await repo.findById(id);
    expect(found).toBeNull();
  });

  it("findByUserId -> returns only user’s errors", async () => {
    await repo.create(
      NlqQaErrorBuilder.makeCreateDto({
        question: "U1 err",
        query: "SELECT a",
        errorMessage: "e1",
        createdBy: "u1",
      })
    );
    await repo.create(
      NlqQaErrorBuilder.makeCreateDto({
        question: "U2 err",
        query: "SELECT b",
        errorMessage: "e2",
        createdBy: "u2",
      })
    );
    await repo.create(
      NlqQaErrorBuilder.makeCreateDto({
        question: "U1 err 2",
        query: "SELECT c",
        errorMessage: "e3",
        createdBy: "u1",
      })
    );

    const onlyU1 = await repo.findByUserId("u1");
    const qs = onlyU1.map((e) => e.question).sort();
    expect(qs).toEqual(["U1 err", "U1 err 2"]);
  });
});
