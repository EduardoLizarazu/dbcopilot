"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import {
  TNlqQaFeedbackOutRequestDto,
  TUpdateNlqQaFeedbackDto,
} from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function UpdateFeedbackAction(
  input: TUpdateNlqQaFeedbackDto
): Promise<TResOutContent<TNlqQaFeedbackOutRequestDto>> {
  console.log("Updating feedback (test)...", input);

  const feedbackRes = await fetch(`${domain}/api/feedback/${input.id}`, {
    method: "PUT",
    body: JSON.stringify({
      id: input.id,
      comment: input.comment,
      isGood: input.isGood,
      nlqQaId: input.nlqQaId,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response:", feedbackRes);

  if (!feedbackRes.ok) {
    throw new Error(`Failed to update feedback: ${feedbackRes.statusText}`);
  }

  const userData = await feedbackRes.json();
  console.log("Updated feedback:", userData);

  return userData;
}
