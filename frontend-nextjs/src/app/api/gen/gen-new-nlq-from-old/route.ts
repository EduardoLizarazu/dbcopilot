import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { GenNewQuestionQueryFromOldComposer } from "@/infrastructure/services/composers/gen-query/gen-new-question-query-from-old-composer.service";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log("API: request...", req);
  const adapter = await nextAdapter(req, GenNewQuestionQueryFromOldComposer(), {
    isTokenRequired: true,
  });
  console.log("API: response:", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
