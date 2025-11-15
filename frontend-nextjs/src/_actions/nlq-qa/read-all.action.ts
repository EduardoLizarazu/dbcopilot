"use server";

import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TNlqQaOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadAllNlqAction(): Promise<
  TResOutContent<TNlqQaOutRequestDto[]>
> {
  console.log("Reading all NLQ...");
  const nlqRes = await fetch(`${domain}/api/nlq`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response:", nlqRes);
  if (!nlqRes.ok) {
    const errorData = await nlqRes.json();
    console.error(
      "Error fetching NLQ:",
      errorData.message || nlqRes.statusText
    );
    return {
      ok: false,
      message: errorData.message || "Failed to fetch NLQ",
      data: null,
    };
  }
  const nlqData = await nlqRes.json();
  console.log("Fetched NLQ:", nlqData);
  return nlqData;
}

export async function ReadAllNlqQaForBad() {
  const nlq = await ReadAllNlqAction();
  const nlqBad = nlq.data.filter((item) => item.isGood === false);
  return {
    ok: nlq.ok,
    message: nlq.message,
    data: nlqBad,
  };
}
