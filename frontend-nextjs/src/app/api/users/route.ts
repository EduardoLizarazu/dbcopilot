import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { createUserComposer } from "@/infrastructure/services/composers/users/create-user-composer.infra.service";
import { readAllUserComposer } from "@/infrastructure/services/composers/users/read-all-user-composer.infra.service";
import { NextRequest, NextResponse } from "next/server";

// POST /api/users
export async function POST(req: NextRequest) {
  console.log("API: Creating User request...", req);
  const adapter = await nextAdapter(req, createUserComposer(), {
    isTokenRequired: true,
  });
  console.log("API: User creation response:", adapter);
  return NextResponse.json(adapter.body, { status: adapter.statusCode });
}

export async function GET(req: NextRequest) {
  console.log("API: Getting User request...", req);
  const adapter = await nextAdapter(req, readAllUserComposer(), {
    isTokenRequired: true,
  });
  console.log("API: User getting response:", adapter);
  return NextResponse.json(adapter.body, { status: adapter.statusCode });
}
