import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { createRoleComposer } from "@/infrastructure/services/composers/roles/create-role-composer.infra.service";
import { NextRequest, NextResponse } from "next/server";

// POST /api/roles
export async function POST(req: NextRequest) {
  console.log("API: Creating role request...", req);
  const adapter = await nextAdapter(req, createRoleComposer(), {
    isTokenRequired: true,
  });
  console.log("API: Role creation response:", adapter);
  return NextResponse.json(adapter.body, { status: adapter.statusCode });
}
