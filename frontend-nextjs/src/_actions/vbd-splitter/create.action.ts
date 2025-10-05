"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import {
  TCreateVbdDto,
  TVbdOutRequestDto,
} from "@/core/application/dtos/vbd.dto";
import { domain } from "@/utils/constants";

export async function CreateVbdSplitterAction(
  input: TCreateVbdDto
): Promise<TResOutContent<TVbdOutRequestDto>> {
  console.log(
    "[CreateVbdSplitterAction] Initiating VBD Splitter creation",
    input
  );

  const vbdRes = await fetch(`${domain}/api/vbd-splitter`, {
    method: "POST",
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log("[CreateVbdSplitterAction] API Response received", vbdRes);

  if (!vbdRes.ok) {
    const errorData = await vbdRes.json();
    console.error(
      "[CreateVbdSplitterAction] Error during VBD Splitter creation:",
      errorData.message || vbdRes.statusText
    );
    throw new Error(
      `Failed to create VBD Splitter: ${errorData.message || vbdRes.statusText}`
    );
  }

  const vbdData = await vbdRes.json();
  console.log(
    "[CreateVbdSplitterAction] VBD Splitter created successfully",
    vbdData
  );

  return vbdData;
}
