"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { TVbdOutRequestDto } from "@/core/application/dtos/vbd.dto";
import { domain } from "@/utils/constants";

export async function ReadVbdSplitterByIdAction(
  id: string
): Promise<TResOutContent<TVbdOutRequestDto>> {
  console.log(
    "[ReadVbdSplitterByIdAction] Initiating request to read VBD Splitter by ID:",
    id
  );

  const vbdSplitterRes = await fetch(`${domain}/api/vbd-splitter/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("[ReadVbdSplitterByIdAction] Response received:", vbdSplitterRes);

  if (!vbdSplitterRes.ok) {
    const errorData = await vbdSplitterRes.json();
    console.warn(
      "[ReadVbdSplitterByIdAction] Error reading VBD Splitter:",
      errorData.message || vbdSplitterRes.statusText
    );
    return {
      ok: false,
      data: null,
      message: errorData.message || "Failed to read VBD Splitter",
    };
  }

  const vbdSplitterData = await vbdSplitterRes.json();
  console.log(
    "[ReadVbdSplitterByIdAction] Successfully read VBD Splitter:",
    vbdSplitterData
  );

  return {
    ok: true,
    data: vbdSplitterData.data,
    message: vbdSplitterData.message || "VBD Splitter retrieved successfully",
  };
}
