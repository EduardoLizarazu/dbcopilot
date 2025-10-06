"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import {
  TDbConnectionInRequestDto,
  TDbConnectionOutRequestDto,
} from "@/core/application/dtos/dbconnection.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function UpdateDbConnectionAction(
  id: string,
  input: TDbConnectionInRequestDto
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
      Authorization: `Bearer ${await readTokenFromCookie()}`,
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
    throw new Error(
      `Failed to update DB Connection: ${errorData.message || dbConnectionRes.statusText}`
    );
  }

  const dbConnectionData = await dbConnectionRes.json();
  console.log(
    "[UpdateDbConnectionAction] DB Connection updated successfully",
    dbConnectionData
  );

  return dbConnectionData;
}
