"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import {
  TCreateDbConnInReqDto,
  TDbConnectionOutRequestDto,
} from "@/core/application/dtos/dbconnection.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function CreateDbConnectionAction(
  input: TCreateDbConnInReqDto
): Promise<TResOutContent<TDbConnectionOutRequestDto>> {
  console.log(
    "[CreateDbConnectionAction] Initiating DB Connection creation",
    input
  );

  const dbConnectionRes = await fetch(`${domain}/api/dbconnection`, {
    method: "POST",
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log(
    "[CreateDbConnectionAction] API Response received",
    dbConnectionRes
  );

  if (!dbConnectionRes.ok) {
    const errorData = await dbConnectionRes.json();
    console.error(
      "[CreateDbConnectionAction] Error during DB Connection creation:",
      errorData.message || dbConnectionRes.statusText
    );
    throw new Error(
      `Failed to create DB Connection - ${errorData.message || dbConnectionRes.statusText}`
    );
  }

  const dbConnectionData = await dbConnectionRes.json();
  console.log(
    "[CreateDbConnectionAction] DB Connection created successfully",
    dbConnectionData
  );

  return dbConnectionData;
}
