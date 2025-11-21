import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { ReadChangesWithExecBySchemaComposer } from "@/infrastructure/services/composers/nlq-qa-good/read-changes-with-exec-by-schema-composer.http.service";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log("API: NLQ request...", req);
  const adapter = await nextAdapter(
    req,
    ReadChangesWithExecBySchemaComposer(),
    {
      isTokenRequired: true,
    }
  );
  console.log("API: NLQ response:", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
