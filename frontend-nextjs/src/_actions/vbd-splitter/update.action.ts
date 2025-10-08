"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
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
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
    body: JSON.stringify(data),
  });
  console.log("[UpdateVbdSplitterAction] Response received:", vbdSplitterRes);

  if (!vbdSplitterRes.ok) {
    const errorData = await vbdSplitterRes.json();
    console.error(
      "[UpdateVbdSplitterAction] Error updating VBD Splitter:",
      errorData.message || vbdSplitterRes.statusText
    );
    throw new Error(
      `Failed to update VBD Splitter: ${errorData.message || vbdSplitterRes.statusText}`
    );
  }

  const vbdSplitterData = await vbdSplitterRes.json();
  console.log(
    "[UpdateVbdSplitterAction] Successfully updated VBD Splitter:",
    vbdSplitterData
  );

  return vbdSplitterData;
}
