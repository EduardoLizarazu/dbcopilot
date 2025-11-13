import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { genTopologyComposer } from "@/infrastructure/services/composers/gen-topo/gen-topology-composer.infra.service";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log("API: request...", req);
  const adapter = await nextAdapter(req, genTopologyComposer(), {
    isTokenRequired: true,
  });
  console.log("API: response:", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
