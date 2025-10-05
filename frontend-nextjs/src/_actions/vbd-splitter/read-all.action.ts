"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import { CreateRoleInput } from "@/controller/_actions/role/create";
import { TRoleOutRequestDto } from "@/core/application/dtos/role.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import {
  TCreateVbdDto,
  TVbdOutRequestDto,
} from "@/core/application/dtos/vbd.dto";
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
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log("[ReadAllVbdSplitterAction] API Response received", vbdRes);

  if (!vbdRes.ok) {
    const errorData = await vbdRes.json();
    console.error(
      "[ReadAllVbdSplitterAction] Error during retrieval of VBD Splitters:",
      errorData.message || vbdRes.statusText
    );
    throw new Error(
      `Failed to retrieve VBD Splitters: ${errorData.message || vbdRes.statusText}`
    );
  }

  const vbdData = await vbdRes.json();
  console.log(
    "[ReadAllVbdSplitterAction] Successfully retrieved all VBD Splitters",
    vbdData
  );

  return vbdData;
}
