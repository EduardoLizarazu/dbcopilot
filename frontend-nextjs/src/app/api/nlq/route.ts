import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { createNlqQaComposer } from "@/infrastructure/services/composers/nlq/create-nlq-qa-composer.infra.service";
import { readAllNlqQaComposer } from "@/infrastructure/services/composers/nlq/read-all-nlq-qa-composer.infra.service";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log("API: NLQ request...", req);
  const adapter = await nextAdapter(req, createNlqQaComposer(), {
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
  const adapter = await nextAdapter(req, readAllNlqQaComposer(), {
    isTokenRequired: true,
  });
  console.log("API: NLQ response:", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
