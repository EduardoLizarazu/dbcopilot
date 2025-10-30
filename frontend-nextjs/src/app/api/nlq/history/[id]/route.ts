import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { readNlqQaHistoryByIdComposer } from "@/infrastructure/services/composers/nlq/read-nlq-qa-history-by-id-composer.infra.service";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  console.log("API: NLQ request...", req);
  const adapter = await nextAdapter(req, readNlqQaHistoryByIdComposer(), {
    isTokenRequired: true,
  });
  console.log("API: NLQ response:", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
