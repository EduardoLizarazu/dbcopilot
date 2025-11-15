"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
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
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response:", nlqQaGoodRes);

  if (!nlqQaGoodRes.ok) {
    const nlqQaGoodDateError = await nlqQaGoodRes.json();
    console.log(
      "NLQ QA Good update error:",
      nlqQaGoodDateError.message || nlqQaGoodRes.statusText
    );
    return {
      ok: false,
      data: null,
      message: nlqQaGoodDateError?.message || "Failed to update NLQ QA Good",
    };
  }

  const nlqQaGoodData = await nlqQaGoodRes.json();
  console.log("Updated NLQ QA Good:", nlqQaGoodData);

  return {
    ok: true,
    data: nlqQaGoodData.data,
    message: nlqQaGoodData.message || "Successfully updated NLQ QA Good",
  };
}
