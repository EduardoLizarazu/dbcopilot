import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { ReadAllVbdSplitterWithUserComposer } from "@/infrastructure/services/composers/vbd-splitter/read-all-vbd-splitter-with-user-composer.infra.service";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  console.log("API: VBD Splitter retrieval request received", req);
  const adapter = await nextAdapter(req, ReadAllVbdSplitterWithUserComposer(), {
    isTokenRequired: true,
  });
  console.log("API: VBD Splitter retrieval response", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
