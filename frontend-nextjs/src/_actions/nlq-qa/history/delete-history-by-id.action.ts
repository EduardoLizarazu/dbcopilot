"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function DeleteHistoryByIdAction(
  id: string
): Promise<TResOutContent<null>> {
  console.log("[DeleteHistoryByIdAction] Initiating history deletion", id);

  const historyRes = await fetch(`${domain}/api/nlq/history/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log("[DeleteHistoryByIdAction] API response received", historyRes);

  if (!historyRes.ok) {
    const errorData = await historyRes.json();
    console.error(
      "[DeleteHistoryByIdAction] Error during history deletion:",
      errorData.message || historyRes.statusText
    );
    throw new Error(
      `Failed to delete history: ${errorData.message || historyRes.statusText}`
    );
  }

  const historyData = await historyRes.json();
  console.log(
    "[DeleteHistoryByIdAction] History deleted successfully",
    historyData
  );

  return historyData;
}
