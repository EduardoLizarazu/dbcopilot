import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import { TNlqQaGoodOutWithUserRequestDto } from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadAllNlqQaGoodAction(): Promise<
  TResOutContent<TNlqQaGoodOutWithUserRequestDto[]>
> {
  console.log("Reading all roles...");
  const nlqQaGoodRes = await fetch(`${domain}/api/nlq-qa-good`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log("Response:", nlqQaGoodRes);
  if (!nlqQaGoodRes.ok) {
    const errorDate = await nlqQaGoodRes.json();
    console.error("Error fetching roles:", errorDate);
    throw new Error(
      `Failed to fetch roles: ${errorDate.message || nlqQaGoodRes.statusText}`
    );
  }
  const nlqQaGoodData = await nlqQaGoodRes.json();
  console.log("Fetched roles:", nlqQaGoodData);
  return nlqQaGoodData;
}
