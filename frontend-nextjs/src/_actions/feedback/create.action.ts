"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import {
  TCreateNlqQaFeedbackDto,
  TNlqQaFeedbackOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function CreateFeedbackAction(
  input: TCreateNlqQaFeedbackDto
): Promise<TResOutContent<TNlqQaFeedbackOutRequestDto>> {
  console.log("Creating feedback (test)...", input);

  const feedbackRes = await fetch(`${domain}/api/feedback`, {
    method: "POST",
    body: JSON.stringify({
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
    const errorData = await feedbackRes.json();
    console.error(
      "Error creating feedback:",
      errorData.message || feedbackRes.statusText
    );
    throw new Error(
      `Failed to create feedback: ${errorData.message || feedbackRes.statusText}`
    );
  }

  const userData = await feedbackRes.json();
  console.log("Created user:", userData);

  return userData;
}
