"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TGenNewQuestionQueryFromOldDto } from "@/core/application/dtos/gen-query.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function GenNewQuestionQueryFromOldAction(
  input: TGenNewQuestionQueryFromOldDto
): Promise<TResOutContent<{ question: string; query: string }>> {
  console.log(
    "[GenNewQuestionQueryFromOldAction] Creating NLQ QA (test)...",
    input
  );

  const res = await fetch(`${domain}/api/gen/gen-new-nlq-from-old`, {
    method: "POST",
    body: JSON.stringify({ ...input }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("[GenNewQuestionQueryFromOldAction] Response:", res);

  if (!res.ok) {
    const errorData = await res.json();
    console.log(
      "[GenNewQuestionQueryFromOldAction] Failed response:",
      errorData.message || res.statusText
    );
    return {
      ok: false,
      data: null,
      message: errorData.message || "Failed to create NLQ QA",
    };
  }

  const resData = await res.json();
  console.log("[GenNewQuestionQueryFromOldAction] ResData: ", resData);

  return {
    ok: true,
    data: resData.data,
    message: resData.message || "Created successfully",
  };
}
