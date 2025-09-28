import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { ReadAllBadNlqQaComposer } from "@/infrastructure/services/composers/nlq/read-all-bad-nlq-composer.infra.service";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log("API: NLQ request...", req);
  const adapter = await nextAdapter(req, ReadAllBadNlqQaComposer(), {
    isTokenRequired: true,
  });
  console.log("API: NLQ response:", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
