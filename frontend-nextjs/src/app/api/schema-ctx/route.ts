import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { CreateSchemaCtxComposer } from "@/infrastructure/services/composers/schemaCtx/create-schema-ctx-composer.infra.service";
import { ReadAllSchemaCtxComposer } from "@/infrastructure/services/composers/schemaCtx/read-all-schema-ctx-composer.infra.service";
import { NextRequest, NextResponse } from "next/server";

// POST /api/schema-ctx
export async function POST(req: NextRequest) {
  console.log("API: Creating schemaCtx request...", req);
  const adapter = await nextAdapter(req, CreateSchemaCtxComposer(), {
    isTokenRequired: true,
  });
  console.log("API: SchemaCtx creation response:", adapter);
  return NextResponse.json(adapter.body, { status: adapter.statusCode });
}

export async function GET(req: NextRequest) {
  console.log("API: Getting schemaCtx request...", req);
  const adapter = await nextAdapter(req, ReadAllSchemaCtxComposer(), {
    isTokenRequired: true,
  });
  console.log("API: SchemaCtx getting response:", adapter);
  return NextResponse.json(adapter.body, { status: adapter.statusCode });
}
