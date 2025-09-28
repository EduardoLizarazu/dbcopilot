"use server";

import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { TReadNlqQaBadOutRequestDto } from "@/core/application/usecases/nlq/nlq-qa/read-all-bad-for-correction.usecase";
import { domain } from "@/utils/constants";

export async function ReadAllNlqQaBadAction(
  query: string
): Promise<TResOutContent<TReadNlqQaBadOutRequestDto[]>> {
  console.log("Reading all NLQ...");
  const nlqRes = await fetch(`${domain}/api/nlq-correction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
    body: JSON.stringify({ query }),
  });
  console.log("Response:", nlqRes);
  if (!nlqRes.ok) {
    throw new Error(`Failed to fetch NLQ: ${nlqRes.statusText}`);
  }
  const nlqData = await nlqRes.json();
  console.log("Fetched NLQ:", nlqData);
  return nlqData;
}
