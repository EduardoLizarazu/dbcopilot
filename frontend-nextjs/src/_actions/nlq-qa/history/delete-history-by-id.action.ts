"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function DeleteHistoryByIdAction(
  id: string
): Promise<TResOutContent<null>> {
  console.log("[DeleteHistoryByIdAction] Initiating history deletion", id);

  const historyRes = await fetch(`${domain}/api/nlq/history/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("[DeleteHistoryByIdAction] API response received", historyRes);

  if (!historyRes.ok) {
    const errorData = await historyRes.json();
    console.warn(
      "[DeleteHistoryByIdAction] Error during history deletion:",
      errorData.message || historyRes.statusText
    );
    return {
      ok: false,
      message: errorData.message || "Failed to delete history entry",
      data: null,
    };
  }

  const historyData = await historyRes.json();
  console.log(
    "[DeleteHistoryByIdAction] History deleted successfully",
    historyData
  );

  return {
    ok: true,
    message: "History entry deleted successfully",
    data: null,
  };
}
