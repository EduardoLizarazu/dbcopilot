"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TNlqQaWitFeedbackOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadAllNlqHistoryAction(): Promise<
  TResOutContent<TNlqQaWitFeedbackOutRequestDto[]>
> {
  console.log("Reading all NLQ...");
  const nlqRes = await fetch(`${domain}/api/nlq/history`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response:", nlqRes);
  if (!nlqRes.ok) {
    const errorData = await nlqRes.json();
    console.error(
      "Error fetching NLQ:",
      errorData.message || nlqRes.statusText
    );
    return {
      ok: false,
      message: errorData.message || "Failed to fetch NLQ history",
      data: [],
    };
  }
  const nlqData = await nlqRes.json();
  console.log("Fetched NLQ:", nlqData);
  return {
    ok: true,
    message: nlqData.message || "NLQ history fetched successfully",
    data: nlqData.data || [],
  };
}
