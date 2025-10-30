"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import { TNlqQaHistoryOutDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadNlqQaHistoryById(data: {
  nlqId: string;
}): Promise<TResOutContent<TNlqQaHistoryOutDto>> {
  console.log("Reading NLQ history...");
  if (!data?.nlqId) {
    throw new Error("NLQ ID is required");
  }
  const nlqRes = await fetch(`${domain}/api/nlq/history/${data.nlqId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
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
