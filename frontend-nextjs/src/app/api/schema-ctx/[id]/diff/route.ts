import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { ReadDiffSchemasByConnIdsComposer } from "@/infrastructure/services/composers/schemaCtx/read-diff-schemas-by-conn-ids-composer.infra.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("API: Read schemaCtx request...", req);
  const adapter = await nextAdapter(req, ReadDiffSchemasByConnIdsComposer(), {
    isTokenRequired: true,
  });
  console.log("API: SchemaCtx read response:", adapter);
  return NextResponse.json(adapter.body, { status: adapter.statusCode });
}
