import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { updateNlqQaGoodComposer } from "@/infrastructure/services/composers/nlq/update-nlq-qa-good-composer.infra.service";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log("API: NLQ request...", req);
  const adapter = await nextAdapter(req, updateNlqQaGoodComposer(), {
    isTokenRequired: true,
  });
  console.log("API: NLQ response:", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
