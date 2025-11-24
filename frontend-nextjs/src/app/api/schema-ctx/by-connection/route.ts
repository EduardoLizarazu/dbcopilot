import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { ReadSchemaCtxByConnIdComposer } from "@/infrastructure/services/composers/schemaCtx/read-schema-ctx-by-conn-id-composer.infra.service";
import { NextRequest, NextResponse } from "next/server";

// POST /api/schema-ctx
export async function POST(req: NextRequest) {
  console.log("API: Creating schemaCtx request...", req);
  const adapter = await nextAdapter(req, ReadSchemaCtxByConnIdComposer(), {
    isTokenRequired: true,
  });
  console.log("API: SchemaCtx creation response:", adapter);
  return NextResponse.json(adapter.body, { status: adapter.statusCode });
}
