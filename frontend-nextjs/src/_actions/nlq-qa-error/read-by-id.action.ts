"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TNlqQaErrorOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa-error.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadNlqQaErrorByIdAction(
  id: string
): Promise<TResOutContent<TNlqQaErrorOutRequestDto>> {
  console.log("Reading NLQ QA Error by ID (test)...", id);

  const nlqQaErrorRes = await fetch(`${domain}/api/nlq-qa-error/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response:", nlqQaErrorRes);

  if (!nlqQaErrorRes.ok) {
    const errorData = await nlqQaErrorRes.json();
    console.error(
      "Error reading NLQ QA Error:",
      errorData.message || nlqQaErrorRes.statusText
    );
    throw new Error(
      `Failed to read NLQ QA Error: ${errorData.message || nlqQaErrorRes.statusText}`
    );
  }

  const nlqQaErrorData = await nlqQaErrorRes.json();
  console.log("Read NLQ QA Error:", nlqQaErrorData);

  return nlqQaErrorData;
}
