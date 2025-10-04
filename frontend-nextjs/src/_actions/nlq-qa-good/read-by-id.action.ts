"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import { TNlqQaGoodOutWithUserRequestDto } from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadNlqQaGoodByIdAction(
  id: string
): Promise<TResOutContent<TNlqQaGoodOutWithUserRequestDto>> {
  console.log("Reading NLQ QA Good by ID (test)...", id);

  const nlqQaGoodRes = await fetch(`${domain}/api/nlq-qa-good/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log("Response:", nlqQaGoodRes);

  if (!nlqQaGoodRes.ok) {
    const errorData = await nlqQaGoodRes.json();
    console.log(
      "Failed response:",
      errorData.message || nlqQaGoodRes.statusText
    );
    throw new Error(
      `Failed to read NLQ QA Good: ${errorData.message || nlqQaGoodRes.statusText}`
    );
  }

  const nlqQaGoodData = await nlqQaGoodRes.json();
  console.log("Read NLQ QA Good:", nlqQaGoodData);

  return nlqQaGoodData;
}
