"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
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
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("[GenTopologyAction] Response:", nlqQaRes);

  if (!nlqQaRes.ok) {
    const errorData = await nlqQaRes.json();
    console.log(
      "[GenTopologyAction] Failed response:",
      errorData.message || nlqQaRes.statusText
    );
    return {
      ok: false,
      data: null,
      message: errorData.message || "Failed to create NLQ QA",
    };
  }

  const nlqQaData = await nlqQaRes.json();
  console.log("[GenTopologyAction] Created NLQ QA:", nlqQaData);

  return {
    ok: true,
    data: nlqQaData.data,
    message: nlqQaData.message || "NLQ QA created successfully",
  };
}
