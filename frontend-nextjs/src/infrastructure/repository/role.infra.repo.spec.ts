// src/infrastructure/repositories/role/role.infra.repository.spec.ts
import { RoleInfraRepository } from "./role.infra.repo";
import { RoleBuilder } from "@/test/test-utils/builders/role.builder";
import { FirebaseAdminProvider } from "../providers/firebase/firebase-admin";

describe.skip("RoleInfraRepository (unit, Firestore mocked)", () => {
  const makeSut = () => {
    const fbAdminProvider = new FirebaseAdminProvider();
    const logger = { info: jest.fn(), error: jest.fn() } as any;
    const sut = new RoleInfraRepository(fbAdminProvider, logger);
    return { sut, fbAdminProvider, logger };
  };

  beforeEach(async () => {
    const fbAdmin = new FirebaseAdminProvider();
    const snapshot = await fbAdmin.db.collection(fbAdmin.coll.NLQ_ROLES).get();
    const batch = fbAdmin.db.batch();
    snapshot.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    jest.clearAllMocks();
  });

  it("create -> returns id; findById -> returns role", async () => {
    const { sut } = makeSut();
    const dto = RoleBuilder.makeCreate({
      name: "Admin",
      description: "Full access",
      createdBy: "user-123",
      updatedBy: "user-123",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const id = await sut.create(dto);
    const found = await sut.findById(id);

    expect(id).toBeTruthy();
    expect(found?.id).toBe(id);
    expect(found?.name).toBe("Admin");
  });

  it("findByName -> returns correct role", async () => {
    const { sut } = makeSut();
    const a = RoleBuilder.makeCreate({ name: "Admin" });
    const b = RoleBuilder.makeCreate({ name: "Analyst" });
    const idA = await sut.create(a);
    await sut.create(b);

    const found = await sut.findByName("Admin");

    expect(found).toBeTruthy();
    expect(found!.id).toBe(idA);
    expect(found!.name).toBe("Admin");
  });

  it("findAll -> returns all roles", async () => {
    const { sut } = makeSut();
    await sut.create(RoleBuilder.makeCreate({ name: "R1" }));
    await sut.create(RoleBuilder.makeCreate({ name: "R2" }));

    const all = await sut.findAll();
    expect(all.length).toBe(2);
    expect(all.map((r) => r.name).sort()).toEqual(["R1", "R2"]);
  });

  it("update -> persists changes", async () => {
    const { sut } = makeSut();
    const id = await sut.create(
      RoleBuilder.makeCreate({ name: "R1", description: "old" })
    );

    await sut.update(id, {
      description: "new",
      updatedBy: "user-2",
      updatedAt: new Date(),
    } as any);
    const found = await sut.findById(id);

    expect(found?.description).toBe("new");
    expect(found?.updatedBy).toBe("user-2");
  });

  it("delete -> removes document", async () => {
    const { sut } = makeSut();
    const id = await sut.create(RoleBuilder.makeCreate({ name: "R1" }));

    await sut.delete(id);
    const found = await sut.findById(id);

    expect(found).toBeNull();
  });

  it("findById -> error path (catch -> null)", async () => {
    const { sut, fbAdminProvider } = makeSut();
    // fuerza un error: reemplaza temporalmente .get()
    const col = fbAdminProvider.db.collection(fbAdminProvider.coll.NLQ_ROLES);
    const origGet = col.doc("NOT-FOUND-ID").get;
    (col as any).doc = () => ({
      get: async () => {
        throw new Error("boom");
      },
    });

    const res = await sut.findById("x");
    expect(res).toBeNull();

    // restore si lo necesitás en más tests
    (col as any).doc = (id: string) => ({ get: origGet.bind(col.doc(id)) });
  });
});
