import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { readAllSchemaComposer } from "@/infrastructure/services/composers/schema/read-all-schema-composer.infra.service";
import { NextRequest, NextResponse } from "next/server";

// POST /api/schema
// export async function POST(req: NextRequest) {
//   console.log("API: Creating role request...", req);
//   const adapter = await nextAdapter(req, createRoleComposer(), {
//     isTokenRequired: true,
//   });
//   console.log("API: Role creation response:", adapter);
//   return NextResponse.json(adapter.body, { status: adapter.statusCode });
// }

export async function GET(req: NextRequest) {
  console.log("API: Getting schema request...", req);
  const adapter = await nextAdapter(req, readAllSchemaComposer(), {
    isTokenRequired: true,
  });
  console.log("API: Schema getting response:", adapter);
  return NextResponse.json(adapter.body, { status: adapter.statusCode });
}
