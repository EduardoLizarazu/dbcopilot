"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import { TDbConnectionOutRequestDto } from "@/core/application/dtos/dbconnection.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadAllDbConnectionAction(): Promise<
  TResOutContent<TDbConnectionOutRequestDto[]>
> {
  console.log(
    "[ReadAllDbConnectionAction] Initiating DB Connections retrieval"
  );

  const dbConnectionRes = await fetch(`${domain}/api/dbconnection`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log(
    "[ReadAllDbConnectionAction] API Response received",
    dbConnectionRes
  );

  if (!dbConnectionRes.ok) {
    const errorData = await dbConnectionRes.json();
    console.error(
      "[ReadAllDbConnectionAction] Error during DB Connections retrieval:",
      errorData.message || dbConnectionRes.statusText
    );
    throw new Error(
      `Failed to retrieve DB Connections: ${errorData.message || dbConnectionRes.statusText}`
    );
  }

  const dbConnectionData = await dbConnectionRes.json();
  console.log(
    "[ReadAllDbConnectionAction] DB Connections retrieved successfully",
    dbConnectionData
  );

  return dbConnectionData;
}
