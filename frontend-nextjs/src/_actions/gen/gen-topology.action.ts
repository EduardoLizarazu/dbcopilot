"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import {
  TGenTopologyInRequestDto,
  TGenTopologyOutRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function GenTopologyAction(
  input: TGenTopologyInRequestDto
): Promise<TResOutContent<TGenTopologyOutRequestDto>> {
  console.log("[GenTopologyAction] Creating NLQ QA (test)...", input);

  const nlqQaRes = await fetch(`${domain}/api/gen/topology`, {
    method: "POST",
    body: JSON.stringify({ ...input }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log("[GenTopologyAction] Response:", nlqQaRes);

  if (!nlqQaRes.ok) {
    const errorData = await nlqQaRes.json();
    console.log(
      "[GenTopologyAction] Failed response:",
      errorData.message || nlqQaRes.statusText
    );
    throw new Error(
      `[GenTopologyAction] Failed to create NLQ QA: ${
        errorData.message || nlqQaRes.statusText
      }`
    );
  }

  const nlqQaData = await nlqQaRes.json();
  console.log("[GenTopologyAction] Created NLQ QA:", nlqQaData);

  return nlqQaData;
}
