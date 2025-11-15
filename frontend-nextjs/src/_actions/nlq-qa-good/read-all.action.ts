"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TNlqQaGoodOutWithUserAndConnRequestDto } from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadAllNlqQaGoodAction(): Promise<
  TResOutContent<TNlqQaGoodOutWithUserAndConnRequestDto[]>
> {
  console.log("Reading all NLQ QA Good entries...");
  const nlqQaGoodRes = await fetch(`${domain}/api/nlq-qa-good`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response status:", nlqQaGoodRes.status);
  if (!nlqQaGoodRes.ok) {
    const errorData = await nlqQaGoodRes.json();
    console.warn(
      "Error fetching NLQ QA Good entries:",
      errorData || nlqQaGoodRes.statusText
    );
    return {
      ok: false,
      data: null,
      message: errorData?.message || "Failed to fetch NLQ QA Good entries",
    };
  }
  const nlqQaGoodData = await nlqQaGoodRes.json();
  console.log("Fetched NLQ QA Good entries:", nlqQaGoodData);
  return {
    ok: true,
    data: nlqQaGoodData.data,
    message:
      nlqQaGoodData.message || "Successfully fetched NLQ QA Good entries",
  };
}
