import { NextRequest } from "next/server";
import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { UpdateNlqQaFeedbackComposer } from "@/infrastructure/services/composers/nlq-qa-feedback/update-nlq-qa-feedback-composer.infra.service";
import { readNlqQaFeedbackByIdComposer } from "@/infrastructure/services/composers/nlq-qa-feedback/read-nlq-qa-feedback-by-id-composer.infra.service";

export async function PUT(req: NextRequest) {
  console.log("API: NLQ Feedback PUT request...", req);
  const adapter = await nextAdapter(req, UpdateNlqQaFeedbackComposer(), {
    isTokenRequired: true,
  });
  console.log("API: NLQ Feedback PUT response:", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(req: NextRequest) {
  console.log("API: NLQ Feedback GET request...", req);
  const adapter = await nextAdapter(req, readNlqQaFeedbackByIdComposer(), {
    isTokenRequired: true,
  });
  console.log("API: NLQ Feedback GET response:", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
