import { NextRequest, NextResponse } from "next/server";
import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { ReadNlqQaErrorByIdComposer } from "@/infrastructure/services/composers/nlq-qa-error/read-nlq-qa-error-by-id-composer.infra.service";

export async function GET(req: NextRequest) {
  console.log("API: Getting NLQ QA Error request...", req);
  const adapter = await nextAdapter(req, ReadNlqQaErrorByIdComposer(), {
    isTokenRequired: true,
  });
  console.log("API: NLQ QA Error getting response:", adapter);
  return NextResponse.json(adapter.body, { status: adapter.statusCode });
}
