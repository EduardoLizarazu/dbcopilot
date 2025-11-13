"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import {
  TNlqQaGoodInRequestDto,
  TNlqQaGoodOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function CreateNlqQaGoodAction(
  input: TNlqQaGoodInRequestDto
): Promise<TResOutContent<TNlqQaGoodOutRequestDto>> {
  console.log("Creating NLQ QA (test)...", input);

  const nlqQaRes = await fetch(
    `${domain}/api/nlq-correction/${input.originId}`,
    {
      method: "POST",
      body: JSON.stringify({ ...input }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
      },
    }
  );
  console.log("Response:", nlqQaRes);

  if (!nlqQaRes.ok) {
    const errorData = await nlqQaRes.json();
    console.log("Failed response:", errorData.message || nlqQaRes.statusText);
    throw new Error(
      `Failed to create NLQ QA: ${errorData.message || nlqQaRes.statusText}`
    );
  }

  const nlqQaData = await nlqQaRes.json();
  console.log("Created NLQ QA:", nlqQaData);

  return nlqQaData;
}
