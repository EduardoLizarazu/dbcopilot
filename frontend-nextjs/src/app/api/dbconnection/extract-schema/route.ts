import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { ExtractSchemaDbConnectionComposer } from "@/infrastructure/services/composers/dbconnection/extract-schema-dbconnection.infra.service";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log("API: DB Connection creation request received", req);
  const adapter = await nextAdapter(req, ExtractSchemaDbConnectionComposer(), {
    isTokenRequired: true,
  });
  console.log("API: DB Connection creation response", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
