"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TNlqQaFeedbackOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadFeedbackByIdAction(
  id: string
): Promise<TResOutContent<TNlqQaFeedbackOutRequestDto>> {
  console.log("Reading feedback by ID (test)...", id);

  const feedbackRes = await fetch(`${domain}/api/feedback/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response:", feedbackRes);

  if (!feedbackRes.ok) {
    throw new Error(`Failed to read feedback: ${feedbackRes.statusText}`);
  }

  const feedbackData = await feedbackRes.json();
  console.log("Read feedback:", feedbackData);

  return feedbackData;
}
