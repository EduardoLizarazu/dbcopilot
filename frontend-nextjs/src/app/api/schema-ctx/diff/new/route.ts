import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { ReadNewSchemasByConnIdsComposer } from "@/infrastructure/services/composers/schemaCtx/read-new-schemas-ctx-composer.infra.service";
import { NextRequest, NextResponse } from "next/server";

// POST /api/schema-ctx/diff
export async function POST(req: NextRequest) {
  console.log("API: Creating schemaCtx request...", req);
  const adapter = await nextAdapter(req, ReadNewSchemasByConnIdsComposer(), {
    isTokenRequired: true,
  });
  console.log("API: SchemaCtx creation response:", adapter);
  return NextResponse.json(adapter.body, { status: adapter.statusCode });
}
