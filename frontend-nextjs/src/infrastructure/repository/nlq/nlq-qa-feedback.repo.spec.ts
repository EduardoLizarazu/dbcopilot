import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import type { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { NlqQaFeedbackRepository } from "./nlq-qa-feedback.repo";
import { NlqQaFeedbackBuilder } from "@/test/test-utils/builders/nlq-qa-feedback.builder";

describe("NlqQaFeedbackRepository (integration - Firestore)", () => {
  jest.setTimeout(30_000);

  const logger: jest.Mocked<ILogger> = {
    info: jest.fn(),
    error: jest.fn(),
  } as any;

  const fb = new FirebaseAdminProvider();
  const repo = new NlqQaFeedbackRepository(logger, fb);

  const createdIds: string[] = [];

  const clean = async () => {
    if (createdIds.length === 0) return;
    const batch = fb.db.batch();
    for (const id of createdIds) {
      const docRef = fb.db.collection(fb.coll.NLQ_FEEDBACKS).doc(id);
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
    const dto = NlqQaFeedbackBuilder.makeCreateDto({
      comment: "Integration test feedback",
      createdBy: "test-user",
    });

    const id = await repo.create(dto);
    createdIds.push(id);
    expect(id).toBeTruthy();

    const found = await repo.findById(id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(id);
    expect(found!.comment).toBe(dto.comment);
    expect(found!.createdBy).toBe(dto.createdBy);
  });

  it("findAll -> returns all feedbacks", async () => {
    const id1 = await repo.create(
      NlqQaFeedbackBuilder.makeCreateDto({
        comment: "Feedback 1",
        createdBy: "user1",
      })
    );
    const id2 = await repo.create(
      NlqQaFeedbackBuilder.makeCreateDto({
        comment: "Feedback 2",
        createdBy: "user2",
      })
    );

    createdIds.push(id1, id2);

    const all = await repo.findAll();
    const comments = all.map((f) => f.comment).sort();
    expect(comments).toContain("Feedback 1");
    expect(comments).toContain("Feedback 2");
  });

  it("update -> persists changes", async () => {
    const id = await repo.create(
      NlqQaFeedbackBuilder.makeCreateDto({
        comment: "Original comment",
        createdBy: "user1",
      })
    );

    createdIds.push(id);

    await repo.update(
      id,
      NlqQaFeedbackBuilder.makeUpdateDto({
        comment: "Updated comment",
      })
    );

    const found = await repo.findById(id);
    expect(found?.comment).toBe("Updated comment");
  });

  it("delete -> removes document", async () => {
    const id = await repo.create(
      NlqQaFeedbackBuilder.makeCreateDto({
        comment: "To be deleted",
        createdBy: "user1",
      })
    );

    createdIds.push(id);

    await repo.delete(id);
    const found = await repo.findById(id);
    expect(found).toBeNull();
  });

  it("findByIsItGood -> returns only matching feedbacks", async () => {
    const id1 = await repo.create(
      NlqQaFeedbackBuilder.makeCreateDto({
        isGood: true,
        comment: "Good feedback",
        createdBy: "user1",
      })
    );
    const id2 = await repo.create(
      NlqQaFeedbackBuilder.makeCreateDto({
        isGood: false,
        comment: "Bad feedback",
        createdBy: "user2",
      })
    );

    createdIds.push(id1, id2);

    const goodFeedbacks = await repo.findByIsItGood(true);
    const comments = goodFeedbacks.map((f) => f.comment);
    expect(comments).toContain("Good feedback");
    expect(comments).not.toContain("Bad feedback");
  });
});
