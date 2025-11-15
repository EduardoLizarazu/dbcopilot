"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
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
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("[CreateVbdSplitterAction] API Response received", vbdRes);

  if (!vbdRes.ok) {
    const errorData = await vbdRes.json();
    console.warn(
      "[CreateVbdSplitterAction] Error during VBD Splitter creation:",
      errorData.message || vbdRes.statusText
    );
    return {
      ok: false,
      data: null,
      message: errorData.message || "Failed to create VBD Splitter",
    };
  }

  const vbdData = await vbdRes.json();
  console.log(
    "[CreateVbdSplitterAction] VBD Splitter created successfully",
    vbdData
  );

  return {
    ok: true,
    data: vbdData.data,
    message: vbdData.message || "VBD Splitter created successfully",
  };
}
