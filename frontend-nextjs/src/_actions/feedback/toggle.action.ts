"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import {
  TNlqQaFeedbackInOrqDto,
  TNlqQaFeedbackOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ToggleFeedbackAction(
  input: TNlqQaFeedbackInOrqDto
): Promise<TResOutContent<TNlqQaFeedbackOutRequestDto>> {
  console.log("Creating feedback (test)...", input);

  const feedbackRes = await fetch(`${domain}/api/feedback`, {
    method: "POST",
    body: JSON.stringify({
      comment: input.comment,
      isGood: input.isGood,
      nlqQaId: input.nlqQaId,
      feedbackId: input.feedbackId,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response:", feedbackRes);

  if (!feedbackRes.ok) {
    throw new Error(`Failed to create role: ${feedbackRes.statusText}`);
  }

  const userData = await feedbackRes.json();
  console.log("Created user:", userData);

  return userData;
}
