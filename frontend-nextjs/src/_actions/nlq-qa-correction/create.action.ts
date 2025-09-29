"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import {
  TCreateNlqQaGoodDto,
  TNlqQaGoodOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function CreateNlqQaGoodAction(
  input: TCreateNlqQaGoodDto
): Promise<TResOutContent<TNlqQaGoodOutRequestDto>> {
  console.log("Creating NLQ QA (test)...", input);

  const nlqQaRes = await fetch(
    `${domain}/api/nlq-correction/${input.originId}`,
    {
      method: "POST",
      body: JSON.stringify({
        originId: input.originId,
        question: input.question,
        query: input.query,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await readTokenFromCookie()}`,
      },
    }
  );
  console.log("Response:", nlqQaRes);

  if (!nlqQaRes.ok) {
    throw new Error(`Failed to create NLQ QA: ${nlqQaRes.statusText}`);
  }

  const nlqQaData = await nlqQaRes.json();
  console.log("Created NLQ QA:", nlqQaData);

  return nlqQaData;
}
