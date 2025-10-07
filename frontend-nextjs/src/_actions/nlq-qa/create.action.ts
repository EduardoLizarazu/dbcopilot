"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
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
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log("Response:", nlqQaRes);

  if (!nlqQaRes.ok) {
    console.error("Failed to create NLQ QA:", nlqQaRes.statusText);
    const errorData = await nlqQaRes.json();
    console.error("Error details:", errorData);
    throw new Error(
      `Failed to create NLQ QA: ${errorData.message || nlqQaRes.statusText}`
    );
  }

  const nlqQaData = await nlqQaRes.json();
  console.log("Created NLQ QA:", nlqQaData);

  return nlqQaData;
}
