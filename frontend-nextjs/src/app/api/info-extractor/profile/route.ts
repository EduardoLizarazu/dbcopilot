import { nextAdapter } from "@/http/adapters/next-adapter.http";
import { ProfileExtractorComposer } from "@/infrastructure/services/composers/info-extractor/profile-extractor-composer.infra.service";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log("API: Profile Extractor request...", req);
  const adapter = await nextAdapter(req, ProfileExtractorComposer(), {
    isTokenRequired: true,
  });
  console.log("API: Profile Extractor response:", adapter);
  return new Response(JSON.stringify(adapter.body), {
    status: adapter.statusCode,
    headers: { "Content-Type": "application/json" },
  });
}
