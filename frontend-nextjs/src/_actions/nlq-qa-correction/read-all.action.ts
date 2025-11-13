"use server";

import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
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
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
    body: JSON.stringify({ query }),
  });
  console.log("Response:", nlqRes);
  if (!nlqRes.ok) {
    const errorData = await nlqRes.json();
    console.error(
      "Error fetching NLQ:",
      errorData.message || nlqRes.statusText
    );
    throw new Error(
      `Failed to fetch NLQ: ${errorData.message || nlqRes.statusText}`
    );
  }
  const nlqData = await nlqRes.json();
  console.log("Fetched NLQ:", nlqData);
  return nlqData;
}
