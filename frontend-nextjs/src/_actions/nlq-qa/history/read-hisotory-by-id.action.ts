"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TNlqQaHistoryOutDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadNlqQaHistoryById(data: {
  nlqId: string;
}): Promise<TResOutContent<TNlqQaHistoryOutDto>> {
  console.log("Reading NLQ history...");
  if (!data?.nlqId) {
    throw new Error("NLQ ID is required");
  }
  const nlqRes = await fetch(`${domain}/api/nlq/history/${data.nlqId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response:", nlqRes);
  if (!nlqRes.ok) {
    const errorData = await nlqRes.json();
    console.warn("Error fetching NLQ:", errorData.message || nlqRes.statusText);
    return {
      ok: false,
      message: errorData.message || "Failed to fetch NLQ history",
      data: null,
    };
  }
  const nlqData = await nlqRes.json();
  console.log("Fetched NLQ:", nlqData);
  return {
    ok: true,
    message: nlqData.message || "NLQ history fetched successfully",
    data: nlqData.data,
  };
}
