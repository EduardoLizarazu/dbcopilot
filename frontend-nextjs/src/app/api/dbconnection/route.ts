import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { CreateDbConnectionComposer } from "@/infrastructure/services/composers/dbconnection/create-dbconnection-composer.infra.service";
import { ReadAllDbConnectionWithVbdComposer } from "@/infrastructure/services/composers/dbconnection/read-all-dbconnection-with-vbd-composer.infra.service";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log("API: DB Connection creation request received", req);
  const adapter = await nextAdapter(req, CreateDbConnectionComposer(), {
    isTokenRequired: true,
  });
  console.log("API: DB Connection creation response", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(req: NextRequest) {
  console.log("API: DB Connection retrieval request received", req);
  const adapter = await nextAdapter(req, ReadAllDbConnectionWithVbdComposer(), {
    isTokenRequired: true,
  });
  console.log("API: DB Connection retrieval response", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
