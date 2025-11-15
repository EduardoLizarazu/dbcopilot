"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import {
  TNlqQaInRequestDto,
  TNlqQaOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function CreateNlqQaAction(
  input: TNlqQaInRequestDto
): Promise<TResOutContent<TNlqQaOutRequestDto>> {
  console.log("Creating NLQ QA (test)...", input);

  const nlqQaRes = await fetch(`${domain}/api/nlq`, {
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
      message: errorData.message || "Failed to create NLQ QA",
      data: null,
    };
  }

  const nlqQaData = await nlqQaRes.json();
  console.log("Created NLQ QA:", nlqQaData);

  return {
    ok: true,
    message: nlqQaData.message || "NLQ QA created successfully",
    data: nlqQaData.data,
  };
}
