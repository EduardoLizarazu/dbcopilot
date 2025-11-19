import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { DeleteSchemaCtxComposer } from "@/infrastructure/services/composers/schemaCtx/delete-schema-ctx-composer.infra.service";
import { ReadByIdSchemaCtxComposer } from "@/infrastructure/services/composers/schemaCtx/read-by-id-schema-ctx-composer.infra.service";
import { UpdateSchemaCtxComposer } from "@/infrastructure/services/composers/schemaCtx/update-schema-ctx-composer.infra.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("API: Getting schema request...", req);
  const adapter = await nextAdapter(req, ReadByIdSchemaCtxComposer(), {
    isTokenRequired: true,
  });
  console.log("API: Schema getting response:", adapter);
  return NextResponse.json(adapter.body, { status: adapter.statusCode });
}

export async function PUT(req: NextRequest) {
  console.log("API: Updating schema request...", req);
  const adapter = await nextAdapter(req, UpdateSchemaCtxComposer(), {
    isTokenRequired: true,
  });
  console.log("API: Schema updating response:", adapter);
  return NextResponse.json(adapter.body, { status: adapter.statusCode });
}

export async function DELETE(req: NextRequest) {
  console.log("API: Deleting schema request...", req);
  const adapter = await nextAdapter(req, DeleteSchemaCtxComposer(), {
    isTokenRequired: true,
  });
  console.log("API: Schema deleting response:", adapter);
  return NextResponse.json(adapter.body, { status: adapter.statusCode });
}
