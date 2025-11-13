import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { ReadNlqQaFbOrErrorByIdComposer } from "@/infrastructure/services/composers/nlq-qa-correction/read-nlq-fb-or-error-by-id.infra.service";
import { createNlqQaGoodComposer } from "@/infrastructure/services/composers/nlq-qa-good/create-nlq-qa-good-composer.infra.service";
import { NextRequest } from "next/server";

// create
export async function POST(req: NextRequest) {
  console.log("API: NLQ request...", req);
  const adapter = await nextAdapter(req, createNlqQaGoodComposer(), {
    isTokenRequired: true,
  });
  console.log("API: NLQ response:", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
export async function GET(req: NextRequest) {
  console.log("API: NLQ request...", req);
  const adapter = await nextAdapter(req, ReadNlqQaFbOrErrorByIdComposer(), {
    isTokenRequired: true,
  });
  console.log("API: NLQ response:", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
