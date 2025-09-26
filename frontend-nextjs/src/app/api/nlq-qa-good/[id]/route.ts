import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { readNlqQaGoodByIdComposer } from "@/infrastructure/services/composers/nlq-qa-good/read-nlq-qa-good-by-id-composer.infra.service";
import { updateNlqQaGoodComposer } from "@/infrastructure/services/composers/nlq-qa-good/update-nlq-qa-good-composer.infra.service";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
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

export async function GET(req: NextRequest) {
  console.log("API: NLQ request...", req);
  const adapter = await nextAdapter(req, readNlqQaGoodByIdComposer(), {
    isTokenRequired: true,
  });
  console.log("API: NLQ response:", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
