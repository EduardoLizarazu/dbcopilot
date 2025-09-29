"use server";

import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import { TNlqQaWitFeedbackOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadAllNlqQaBadAction(
  query: string
): Promise<TResOutContent<TNlqQaWitFeedbackOutRequestDto[]>> {
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
