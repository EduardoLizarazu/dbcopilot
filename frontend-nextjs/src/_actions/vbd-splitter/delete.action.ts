"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { TVbdOutRequestDto } from "@/core/application/dtos/vbd.dto";
import { domain } from "@/utils/constants";

export async function DeleteVbdSplitterAction(
  id: string
): Promise<TResOutContent<null>> {
  console.log(
    "[DeleteVbdSplitterAction] Initiating request to delete VBD Splitter by ID:",
    id
  );

  const vbdSplitterRes = await fetch(`${domain}/api/vbd-splitters/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log("[DeleteVbdSplitterAction] Response received:", vbdSplitterRes);

  if (!vbdSplitterRes.ok) {
    const errorData = await vbdSplitterRes.json();
    console.error(
      "[DeleteVbdSplitterAction] Error deleting VBD Splitter:",
      errorData.message || vbdSplitterRes.statusText
    );
    throw new Error(
      `Failed to delete VBD Splitter: ${errorData.message || vbdSplitterRes.statusText}`
    );
  }

  console.log("[DeleteVbdSplitterAction] Successfully deleted VBD Splitter.");

  return null;
}
