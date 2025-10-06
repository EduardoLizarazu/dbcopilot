import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { DeleteVbdSplitterComposer } from "@/infrastructure/services/composers/vbd-splitter/delete-vbd-splitter-composer.infra.service";
import { ReadAllVbdSplitterComposer } from "@/infrastructure/services/composers/vbd-splitter/read-all-vbd-splitter-composer.infra.service";
import { ReadVbdSplitterByIdComposer } from "@/infrastructure/services/composers/vbd-splitter/read-vbd-splitter-by-id-composer.infra.service";
import { UpdateVbdSplitterComposer } from "@/infrastructure/services/composers/vbd-splitter/update-vbd-splitter-composer.infra.service";
import { NextRequest } from "next/server";

// EDIT
export async function POST(req: NextRequest) {
  console.log("API: VBD Splitter update request received", req);
  const adapter = await nextAdapter(req, UpdateVbdSplitterComposer(), {
    isTokenRequired: true,
  });
  console.log("API: VBD Splitter update response", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}

// GET BY ID
export async function GET(req: NextRequest) {
  console.log("API: VBD Splitter fetch by ID request received", req);
  const adapter = await nextAdapter(req, ReadVbdSplitterByIdComposer(), {
    isTokenRequired: true,
  });
  console.log("API: VBD Splitter fetch by ID response", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}

// DELETE BY ID
export async function DELETE(req: NextRequest) {
  console.log("API: VBD Splitter delete by ID request received", req);
  const adapter = await nextAdapter(req, DeleteVbdSplitterComposer(), {
    isTokenRequired: true,
  });
  console.log("API: VBD Splitter delete by ID response", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
