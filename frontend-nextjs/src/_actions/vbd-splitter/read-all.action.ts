"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { TVbdOutRequestDto } from "@/core/application/dtos/vbd.dto";
import { domain } from "@/utils/constants";

export async function ReadAllVbdSplitterAction(): Promise<
  TResOutContent<TVbdOutRequestDto[]>
> {
  console.log(
    "[ReadAllVbdSplitterAction] Initiating retrieval of all VBD Splitters"
  );

  const vbdRes = await fetch(`${domain}/api/vbd-splitter`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("[ReadAllVbdSplitterAction] API Response received", vbdRes);

  if (!vbdRes.ok) {
    const errorData = await vbdRes.json();
    console.warn(
      "[ReadAllVbdSplitterAction] Error during retrieval of VBD Splitters:",
      errorData || vbdRes.statusText
    );
    return {
      ok: false,
      data: null,
      message: errorData.message || "Failed to retrieve VBD Splitters",
    };
  }

  const vbdData = await vbdRes.json();
  console.log(
    "[ReadAllVbdSplitterAction] Successfully retrieved all VBD Splitters",
    vbdData
  );

  return {
    ok: true,
    data: vbdData.data,
    message: vbdData.message || "VBD Splitters retrieved successfully",
  };
}
