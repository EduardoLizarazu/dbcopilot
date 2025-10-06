import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { DeleteDbConnectionComposer } from "@/infrastructure/services/composers/dbconnection/delete-dbconnectin-composert.infra.service";
import { ReadDbConnectionWithVbdByIdComposer } from "@/infrastructure/services/composers/dbconnection/read-dbconnection-with-vbd-by-id.infra.service";
import { UpdateDbConnectionComposer } from "@/infrastructure/services/composers/dbconnection/update-dbconnection-composer.infra.service";
import { NextRequest } from "next/server";

// EDIT
export async function PUT(req: NextRequest) {
  console.log("API: DB Connection update request received", req);
  const adapter = await nextAdapter(req, UpdateDbConnectionComposer(), {
    isTokenRequired: true,
  });
  console.log("API: DB Connection update response", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}

// GET BY ID
export async function GET(req: NextRequest) {
  console.log("API: DB Connection fetch by ID request received", req);
  const adapter = await nextAdapter(
    req,
    ReadDbConnectionWithVbdByIdComposer(),
    {
      isTokenRequired: true,
    }
  );
  console.log("API: DB Connection fetch by ID response", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}

// DELETE BY ID
export async function DELETE(req: NextRequest) {
  console.log("API: DB Connection delete by ID request received", req);
  const adapter = await nextAdapter(req, DeleteDbConnectionComposer(), {
    isTokenRequired: true,
  });
  console.log("API: DB Connection delete by ID response", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
