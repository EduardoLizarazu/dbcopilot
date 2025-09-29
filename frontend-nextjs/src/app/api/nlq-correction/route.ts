import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { ReadAllNlqQaFbOrErrorComposer } from "@/infrastructure/services/composers/nlq-qa-correction/read-all-nlq-fb-or-error-composer.infra.service";
import { ReadAllBadNlqQaComposer } from "@/infrastructure/services/composers/nlq/read-all-bad-nlq-composer.infra.service";
import { NextRequest } from "next/server";

// read all by query
export async function POST(req: NextRequest) {
  console.log("API: NLQ request...", req);
  const adapter = await nextAdapter(req, ReadAllNlqQaFbOrErrorComposer(), {
    isTokenRequired: true,
  });
  console.log("API: NLQ response:", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
