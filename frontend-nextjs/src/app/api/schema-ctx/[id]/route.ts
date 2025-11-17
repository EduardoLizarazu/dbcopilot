import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { DeleteSchemaCtxComposer } from "@/infrastructure/services/composers/schemaCtx/delete-schema-ctx-composer.infra.service";
import { ReadAllSchemaCtxComposer } from "@/infrastructure/services/composers/schemaCtx/read-all-schema-ctx-composer.infra.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("API: Getting role request...", req);
  const adapter = await nextAdapter(req, ReadAllSchemaCtxComposer(), {
    isTokenRequired: true,
  });
  console.log("API: Role getting response:", adapter);
  return NextResponse.json(adapter.body, { status: adapter.statusCode });
}

// export async function PUT(req: NextRequest) {
//   console.log("API: Updating role request...", req);
//   const adapter = await nextAdapter(req, updateRoleComposer(), {
//     isTokenRequired: true,
//   });
//   console.log("API: Role updating response:", adapter);
//   return NextResponse.json(adapter.body, { status: adapter.statusCode });
// }

export async function DELETE(req: NextRequest) {
  console.log("API: Deleting role request...", req);
  const adapter = await nextAdapter(req, DeleteSchemaCtxComposer(), {
    isTokenRequired: true,
  });
  console.log("API: Role deleting response:", adapter);
  return NextResponse.json(adapter.body, { status: adapter.statusCode });
}
