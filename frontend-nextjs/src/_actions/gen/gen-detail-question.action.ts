"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function GenDetailQuestionAction(input: {
  question: string;
  query: string;
}): Promise<TResOutContent<{ detailQuestion: string }>> {
  console.log("[GenDetailQuestionAction] Creating NLQ QA (test)...", input);

  const nlqQaRes = await fetch(`${domain}/api/gen/detail-question`, {
    method: "POST",
    body: JSON.stringify({ ...input }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("[GenDetailQuestionAction] Response:", nlqQaRes);

  if (!nlqQaRes.ok) {
    const errorData = await nlqQaRes.json();
    console.log(
      "[GenDetailQuestionAction] Failed response:",
      errorData.message || nlqQaRes.statusText
    );
    throw new Error(
      `[GenDetailQuestionAction] Failed to create NLQ QA: ${
        errorData.message || nlqQaRes.statusText
      }`
    );
  }

  const nlqQaData = await nlqQaRes.json();
  console.log("[GenDetailQuestionAction] Created NLQ QA:", nlqQaData);

  return nlqQaData;
}
