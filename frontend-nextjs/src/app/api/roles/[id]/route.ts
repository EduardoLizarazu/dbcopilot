import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { deleteRoleComposer } from "@/infrastructure/services/composers/roles/delete-role-composer.infra.service";
import { readRoleByIdComposer } from "@/infrastructure/services/composers/roles/read-role-by-id-composer.infra.service";
import { updateRoleComposer } from "@/infrastructure/services/composers/roles/update-role-composer.infra.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("API: Getting role request...", req);
  const adapter = await nextAdapter(req, readRoleByIdComposer(), {
    isTokenRequired: true,
  });
  console.log("API: Role getting response:", adapter);
  return NextResponse.json(adapter.body, { status: adapter.statusCode });
}

export async function PUT(req: NextRequest) {
  console.log("API: Updating role request...", req);
  const adapter = await nextAdapter(req, updateRoleComposer(), {
    isTokenRequired: true,
  });
  console.log("API: Role updating response:", adapter);
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
