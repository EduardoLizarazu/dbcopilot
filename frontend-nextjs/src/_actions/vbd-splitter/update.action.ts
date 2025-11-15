"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import {
  TVbdInRequestDto,
  TVbdOutRequestDto,
} from "@/core/application/dtos/vbd.dto";
import { domain } from "@/utils/constants";

export async function UpdateVbdSplitterAction(
  id: string,
  data: TVbdInRequestDto
): Promise<TResOutContent<TVbdOutRequestDto>> {
  console.log(
    "[UpdateVbdSplitterAction] Initiating request to update VBD Splitter by ID:",
    id
  );

  const vbdSplitterRes = await fetch(`${domain}/api/vbd-splitter/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
    body: JSON.stringify(data),
  });
  console.log("[UpdateVbdSplitterAction] Response received:", vbdSplitterRes);

  if (!vbdSplitterRes.ok) {
    const errorData = await vbdSplitterRes.json();
    console.warn(
      "[UpdateVbdSplitterAction] Error updating VBD Splitter:",
      errorData.message || vbdSplitterRes.statusText
    );
    return {
      ok: false,
      data: null,
      message: errorData.message || "Failed to update VBD Splitter",
    };
  }

  const vbdSplitterData = await vbdSplitterRes.json();
  console.log(
    "[UpdateVbdSplitterAction] Successfully updated VBD Splitter:",
    vbdSplitterData
  );

  return {
    ok: true,
    data: vbdSplitterData.data,
    message: vbdSplitterData.message || "VBD Splitter updated successfully",
  };
}
