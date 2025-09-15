import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { createRoleComposer } from "@/infrastructure/services/composers/roles/create-role-composer.infra.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const adapter = await nextAdapter(req, createRoleComposer());
  return NextResponse.json(adapter.body, { status: adapter.statusCode });
}
