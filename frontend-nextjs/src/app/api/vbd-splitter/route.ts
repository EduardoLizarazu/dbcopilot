// import { nextAdapter } from "@/http/adapters/next-adapter.http";
// import { CreateVbdSplitterComposer } from "@/infrastructure/services/composers/vbd-splitter/create-vbd-splitter-composer.infra.service";
// import { ReadAllVbdSplitterComposer } from "@/infrastructure/services/composers/vbd-splitter/read-all-vbd-splitter-composer.infra.service";
// import { NextRequest } from "next/server";

// export async function POST(req: NextRequest) {
//   console.log("API: VBD Splitter creation request received", req);
//   const adapter = await nextAdapter(req, CreateVbdSplitterComposer(), {
//     isTokenRequired: true,
//   });
//   console.log("API: VBD Splitter creation response", adapter);
//   return new Response(JSON.stringify(adapter.body), {
//     status: adapter.statusCode,
//     headers: { "Content-Type": "application/json" },
//   });
// }

// export async function GET(req: NextRequest) {
//   console.log("API: VBD Splitter retrieval request received", req);
//   const adapter = await nextAdapter(req, ReadAllVbdSplitterComposer(), {
//     isTokenRequired: true,
//   });
//   console.log("API: VBD Splitter retrieval response", adapter);
//   return new Response(JSON.stringify(adapter.body), {
//     status: adapter.statusCode,
//     headers: { "Content-Type": "application/json" },
//   });
// }

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "GET request successful" });
}

export async function POST() {
  return NextResponse.json({ message: "POST request successful" });
}
