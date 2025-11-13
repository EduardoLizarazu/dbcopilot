import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { NlqQaInfoExecQueryComposer } from "@/infrastructure/services/composers/nlq-qa-info/nlq-qa-info-exec-query-composer.infra.service";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log("API: NLQ request...", req);
  const adapter = await nextAdapter(req, NlqQaInfoExecQueryComposer(), {
    isTokenRequired: true,
  });
  console.log("API: NLQ response:", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
