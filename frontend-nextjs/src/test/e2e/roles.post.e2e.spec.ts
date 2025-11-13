// Antes de importar tu route/composer:
jest.mock("@/infrastructure/repository/auth.repo", () => {
  return {
    AuthorizationRepository: jest.fn().mockImplementation(() => ({
      findRolesNamesByUserId: jest
        .fn()
        .mockResolvedValue({ roleNames: ["ADMIN"] }),
      hasRoles: jest.fn().mockResolvedValue({ hasAuth: true }),
    })),
  };
});

// Mockea también el decoder:
jest.mock("@/infrastructure/adapters/decode-token.adapter", () => ({
  DecodeTokenAdapter: jest.fn().mockImplementation(() => ({
    decodeToken: jest.fn().mockResolvedValue({ uid: "test-user-1" }),
  })),
}));

// tests-e2e/roles.route.e2e.spec.ts
import { NextRequest } from "next/server";
import { POST as RolesPOST } from "@/app/api/roles/route"; // <-- your route file
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { token } from "../test-utils/constants";

// helper to build a NextRequest with JSON body
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

describe("E2E /api/roles POST", () => {
  const fb = new FirebaseAdminProvider(); // points to your dev/test project

  beforeEach(async () => {
    // clean the roles collection so tests are isolated
    const snap = await fb.db.collection(fb.coll.NLQ_ROLES).get();
    const batch = fb.db.batch();
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  });

  it("201 creates a role when authorized", async () => {
    const req = makeNextJsonRequest(
      "/api/roles",
      {
        name: "New-Role",
        description: "Full access",
      },
      { Authorization: `Bearer ${token}` }
    );

    const res = await RolesPOST(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    console.log("Response JSON 201:", json);
    expect(json.name).toBe("New-Role");
    expect(json.description).toBe("Full access");
  });

  it("401 without token", async () => {
    const req = makeNextJsonRequest("/api/roles", {
      name: "Analyst",
      description: "Read",
    });
    const res = await RolesPOST(req);
    expect(res.status).toBe(401);
  });

  it("400 missing params", async () => {
    const req = makeNextJsonRequest(
      "/api/roles",
      { name: "NoDesc" },
      { Authorization: `Bearer ${token}` }
    );
    const res = await RolesPOST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(String(json.message)).toMatch(/Missing parameters/i);
  });
});
