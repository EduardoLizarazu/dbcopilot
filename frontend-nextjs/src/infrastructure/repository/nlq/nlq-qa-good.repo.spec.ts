import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import type { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { NlqQaGoodRepository } from "./nlq-qa-good.repo";
import { NlqQaGoodBuilder } from "@/test/test-utils/builders/nlq-qa-good.builder";

describe("NlqQaGoodRepository (integration - Firestore)", () => {
  jest.setTimeout(30_000);

  const logger: jest.Mocked<ILogger> = {
    info: jest.fn(),
    error: jest.fn(),
  } as any;

  const fb = new FirebaseAdminProvider();
  const repo = new NlqQaGoodRepository(logger, fb);

  const createdIds: string[] = [];

  const clean = async () => {
    if (createdIds.length === 0) return;
    const batch = fb.db.batch();
    for (const id of createdIds) {
      const docRef = fb.db.collection(fb.coll.NLQ_GOODS).doc(id);
      batch.delete(docRef);
    }
    await batch.commit();
    createdIds.length = 0;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await clean();
  });

  afterEach(async () => {
    await clean();
  });

  it("create -> returns id; findById -> returns inserted doc", async () => {
    const dto = NlqQaGoodBuilder.makeCreate({
      question: "Integration test question",
      createdBy: "test-user",
    });

    const id = await repo.create(dto);
    createdIds.push(id);
    expect(id).toBeTruthy();

    const found = await repo.findById(id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(id);
    expect(found!.question).toBe(dto.question);
    expect(found!.createdBy).toBe(dto.createdBy);
  });

  it("findAll -> returns all goods", async () => {
    const id1 = await repo.create(
      NlqQaGoodBuilder.makeCreate({
        question: "Good 1",
        createdBy: "user1",
      })
    );
    const id2 = await repo.create(
      NlqQaGoodBuilder.makeCreate({
        question: "Good 2",
        createdBy: "user2",
      })
    );

    createdIds.push(id1, id2);

    const all = await repo.findAll();
    const questions = all.map((g) => g.question).sort();
    expect(questions).toContain("Good 1");
    expect(questions).toContain("Good 2");
  });

  it("update -> persists changes", async () => {
    const id = await repo.create(
      NlqQaGoodBuilder.makeCreate({
        question: "Original question",
        createdBy: "user1",
      })
    );

    createdIds.push(id);

    await repo.update(id, { question: "Updated question" });

    const found = await repo.findById(id);
    expect(found?.question).toBe("Updated question");
  });

  it("delete -> removes document", async () => {
    const id = await repo.create(
      NlqQaGoodBuilder.makeCreate({
        question: "To be deleted",
        createdBy: "user1",
      })
    );

    createdIds.push(id);

    await repo.delete(id);
    const found = await repo.findById(id);
    expect(found).toBeNull();
  });

  it("findByUserId -> returns only user’s goods", async () => {
    const id1 = await repo.create(
      NlqQaGoodBuilder.makeCreate({
        question: "User1 Good",
        createdBy: "user1",
      })
    );
    const id2 = await repo.create(
      NlqQaGoodBuilder.makeCreate({
        question: "User2 Good",
        createdBy: "user2",
      })
    );
    const id3 = await repo.create(
      NlqQaGoodBuilder.makeCreate({
        question: "User1 Good 2",
        createdBy: "user1",
      })
    );

    createdIds.push(id1, id2, id3);

    const user1Goods = await repo.findByUserId("user1");
    const questions = user1Goods.map((g) => g.question).sort();
    expect(questions).toEqual(["User1 Good", "User1 Good 2"]);
  });
});
