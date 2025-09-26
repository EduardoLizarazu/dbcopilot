import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { createNlqQaFeedbackComposer } from "@/infrastructure/services/composers/nlq/create-nlq-qa-feecbak-composer.infra.service";
import { deleteNlqQaFeedbackComposer } from "@/infrastructure/services/composers/nlq/delete-nlq-qa-feedback-composer.infra.service";
import { UpdateNlqQaFeedbackComposer } from "@/infrastructure/services/composers/nlq/update-nlq-qa-feedback-composer.infra.service";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log("API: NLQ Feedback request...", req);
  const adapter = await nextAdapter(req, createNlqQaFeedbackComposer(), {
    isTokenRequired: true,
  });
  console.log("API: NLQ Feedback response:", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(req: NextRequest) {
  console.log("API: NLQ Feedback DELETE request...", req);
  const adapter = await nextAdapter(req, deleteNlqQaFeedbackComposer(), {
    isTokenRequired: true,
  });
  console.log("API: NLQ Feedback DELETE response:", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}

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
