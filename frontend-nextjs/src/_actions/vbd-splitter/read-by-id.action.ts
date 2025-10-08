"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
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
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log("[ReadVbdSplitterByIdAction] Response received:", vbdSplitterRes);

  if (!vbdSplitterRes.ok) {
    const errorData = await vbdSplitterRes.json();
    console.warn(
      "[ReadVbdSplitterByIdAction] Error reading VBD Splitter:",
      errorData.message || vbdSplitterRes.statusText
    );
    return errorData;
  }

  const vbdSplitterData = await vbdSplitterRes.json();
  console.log(
    "[ReadVbdSplitterByIdAction] Successfully read VBD Splitter:",
    vbdSplitterData
  );

  return vbdSplitterData;
}
