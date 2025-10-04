"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import { TNlqQaGoodOutWithUserRequestDto } from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadAllNlqQaGoodAction(): Promise<
  TResOutContent<TNlqQaGoodOutWithUserRequestDto[]>
> {
  console.log("Reading all NLQ QA Good entries...");
  const nlqQaGoodRes = await fetch(`${domain}/api/nlq-qa-good`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log("Response status:", nlqQaGoodRes.status);
  if (!nlqQaGoodRes.ok) {
    const errorData = await nlqQaGoodRes.json();
    console.error(
      "Error fetching NLQ QA Good entries:",
      errorData || nlqQaGoodRes.statusText
    );
    throw new Error(
      `Failed to fetch NLQ QA Good entries: ${errorData.message || "Unknown error occurred"}`
    );
  }
  const nlqQaGoodData = await nlqQaGoodRes.json();
  console.log("Fetched NLQ QA Good entries:", nlqQaGoodData);
  return nlqQaGoodData;
}
