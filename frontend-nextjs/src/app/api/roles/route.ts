import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { createRoleComposer } from "@/infrastructure/services/composers/roles/create-role-composer.infra.service";
import { deleteRoleComposer } from "@/infrastructure/services/composers/roles/delete-role-composer.infra.service";
import { readAllRoleComposer } from "@/infrastructure/services/composers/roles/read-all-role-composer.infra.service";
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

export async function GET(req: NextRequest) {
  console.log("API: Getting role request...", req);
  const adapter = await nextAdapter(req, readAllRoleComposer(), {
    isTokenRequired: true,
  });
  console.log("API: Role getting response:", adapter);
  return NextResponse.json(adapter.body, { status: adapter.statusCode });
}

export async function DELETE(req: NextRequest) {
  console.log("API: Deleting role request...", req);
  const adapter = await nextAdapter(req, deleteRoleComposer(), {
    isTokenRequired: true,
  });
  console.log("API: Role deleting response:", adapter);
  return NextResponse.json(adapter.body, { status: adapter.statusCode });
}
