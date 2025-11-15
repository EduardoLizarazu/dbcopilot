"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function DeleteNqlQaGoodByIdAction(
  id: string
): Promise<TResOutContent<void>> {
  console.log(
    "[DeleteNqlQaGoodByIdAction] Deleting NLQ QA Good by ID (test)...",
    id
  );

  const nlqQaGoodRes = await fetch(`${domain}/api/nlq-qa-good/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("[DeleteNqlQaGoodByIdAction] Response:", nlqQaGoodRes);

  if (!nlqQaGoodRes.ok) {
    const errorData = await nlqQaGoodRes.json();
    console.log(
      "[DeleteNqlQaGoodByIdAction] Failed response:",
      errorData.message || nlqQaGoodRes.statusText
    );
    return {
      ok: false,
      data: null,
      message: errorData?.message || "Failed to delete NLQ QA Good",
    };
  }

  const nlqQaGoodData = await nlqQaGoodRes.json();
  console.log(
    "[DeleteNqlQaGoodByIdAction] Deleted NLQ QA Good:",
    nlqQaGoodData
  );

  return {
    ok: true,
    data: null,
    message: nlqQaGoodData.message || "Successfully deleted NLQ QA Good",
  };
}
