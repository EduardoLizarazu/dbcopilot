import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { deleteUserComposer } from "@/infrastructure/services/composers/users/delete-user-composer.infra.service";
import { readUserByIdComposer } from "@/infrastructure/services/composers/users/read-user-by-idcomposer.infra.service";
import { updateUserComposer } from "@/infrastructure/services/composers/users/update-user-composer.infra.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("API: Getting User request...", req);
  const adapter = await nextAdapter(req, readUserByIdComposer(), {
    isTokenRequired: true,
  });
  console.log("API: User getting response:", adapter);
  return NextResponse.json(adapter.body, { status: adapter.statusCode });
}

export async function PUT(req: NextRequest) {
  console.log("API: Updating User request...", req);
  const adapter = await nextAdapter(req, updateUserComposer(), {
    isTokenRequired: true,
  });
  console.log("API: User updating response:", adapter);
  return NextResponse.json(adapter.body, { status: adapter.statusCode });
}

export async function DELETE(req: NextRequest) {
  console.log("API: Deleting User request...", req);
  const adapter = await nextAdapter(req, deleteUserComposer(), {
    isTokenRequired: true,
  });
  console.log("API: User deleting response:", adapter);
  return NextResponse.json(adapter.body, { status: adapter.statusCode });
}
