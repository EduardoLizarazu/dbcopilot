"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TNlqQaOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function CreateNlqQaAction(input: {
  nlqQaId: string;
  isIgnore: boolean;
}): Promise<TResOutContent<TNlqQaOutRequestDto>> {
  console.log("Toggling NLQ QA ignore (test)...", input);

  const nlqQaRes = await fetch(`${domain}/api/nlq/ignore`, {
    method: "POST",
    body: JSON.stringify({
      ...input,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response:", nlqQaRes);

  if (!nlqQaRes.ok) {
    const errorData = await nlqQaRes.json();
    console.warn("Error details:", errorData.message);
    return {
      ok: false,
      message: errorData.message || "Failed to toggle NLQ QA ignore",
      data: null,
    };
  }

  const nlqQaData = await nlqQaRes.json();
  console.log("Toggled NLQ QA ignore:", nlqQaData);

  return {
    ok: true,
    message: nlqQaData.message || "NLQ QA toggle ignore successfully",
    data: nlqQaData.data,
  };
}
