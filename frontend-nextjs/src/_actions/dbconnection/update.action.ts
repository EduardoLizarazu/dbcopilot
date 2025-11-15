"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import {
  TUpdateDbConnInReqDto,
  TDbConnectionOutRequestDto,
} from "@/core/application/dtos/dbconnection.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function UpdateDbConnectionAction(
  id: string,
  input: TUpdateDbConnInReqDto
): Promise<TResOutContent<TDbConnectionOutRequestDto>> {
  console.log(
    "[UpdateDbConnectionAction] Initiating DB Connection update",
    input
  );

  const dbConnectionRes = await fetch(`${domain}/api/dbconnection/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log(
    "[UpdateDbConnectionAction] API Response received",
    dbConnectionRes
  );

  if (!dbConnectionRes.ok) {
    const errorData = await dbConnectionRes.json();
    console.error(
      "[UpdateDbConnectionAction] Error during DB Connection update:",
      errorData.message || dbConnectionRes.statusText
    );
    return {
      ok: false,
      message:
        errorData.message ||
        dbConnectionRes.statusText ||
        "Error updating DB Connection",
      data: null,
    };
  }

  const dbConnectionData = await dbConnectionRes.json();
  console.log(
    "[UpdateDbConnectionAction] DB Connection updated successfully",
    dbConnectionData
  );

  return {
    ok: true,
    message: dbConnectionData.message || "DB Connection updated successfully",
    data: dbConnectionData.data,
  };
}
