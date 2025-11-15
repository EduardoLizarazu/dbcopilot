"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function DeleteVbdSplitterAction(
  id: string
): Promise<TResOutContent<null>> {
  console.log(
    "[DeleteVbdSplitterAction] Initiating request to delete VBD Splitter by ID:",
    id
  );

  const vbdSplitterRes = await fetch(`${domain}/api/vbd-splitter/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("[DeleteVbdSplitterAction] Response received:", vbdSplitterRes);

  if (!vbdSplitterRes.ok) {
    const errorData = await vbdSplitterRes.json();
    console.warn(
      "[DeleteVbdSplitterAction] Error deleting VBD Splitter:",
      errorData.message || vbdSplitterRes.statusText
    );
    return {
      ok: false,
      data: null,
      message: errorData.message || "Failed to delete VBD Splitter",
    };
  }

  console.log("[DeleteVbdSplitterAction] Successfully deleted VBD Splitter.");
  const res = await vbdSplitterRes.json();
  console.log("[DeleteVbdSplitterAction] Response data:", res);

  return {
    ok: true,
    data: res.data,
    message: res.message || "VBD Splitter deleted successfully",
  };
}
