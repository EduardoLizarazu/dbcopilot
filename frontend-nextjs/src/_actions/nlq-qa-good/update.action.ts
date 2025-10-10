"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import {
  TNlqQaGoodOutRequestDto,
  TUpdateNlqQaGoodInRqDto,
} from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function UpdateNlqQaGoodAction(
  input: TUpdateNlqQaGoodInRqDto
): Promise<TResOutContent<TNlqQaGoodOutRequestDto>> {
  console.log("Updating NLQ QA Good...", input);

  const nlqQaGoodRes = await fetch(`${domain}/api/nlq-qa-good/${input.id}`, {
    method: "PUT",
    body: JSON.stringify({ ...input }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log("Response:", nlqQaGoodRes);

  if (!nlqQaGoodRes.ok) {
    const nlqQaGoodDateError = await nlqQaGoodRes.json();
    console.log(
      "NLQ QA Good update error:",
      nlqQaGoodDateError.message || nlqQaGoodRes.statusText
    );
    throw new Error(
      `Failed to update NLQ QA Good: ${nlqQaGoodDateError.message || nlqQaGoodRes.statusText}`
    );
  }

  const nlqQaGoodData = await nlqQaGoodRes.json();
  console.log("Updated NLQ QA Good:", nlqQaGoodData);

  return nlqQaGoodData;
}
