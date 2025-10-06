"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import { TDbConnectionOutRequestDtoWithVbAndUser } from "@/core/application/dtos/dbconnection.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadDbConnectionByIdAction(
  id: string
): Promise<TResOutContent<TDbConnectionOutRequestDtoWithVbAndUser>> {
  console.log(
    "[ReadDbConnectionByIdAction] Initiating DB Connection retrieval",
    id
  );

  const dbConnectionRes = await fetch(`${domain}/api/dbconnection/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log(
    "[ReadDbConnectionByIdAction] API Response received",
    dbConnectionRes
  );

  if (!dbConnectionRes.ok) {
    const errorData = await dbConnectionRes.json();
    console.error(
      "[ReadDbConnectionByIdAction] Error during DB Connection retrieval:",
      errorData.message || dbConnectionRes.statusText
    );
    throw new Error(
      `Failed to retrieve DB Connection: ${errorData.message || dbConnectionRes.statusText}`
    );
  }

  const dbConnectionData = await dbConnectionRes.json();
  console.log(
    "[ReadDbConnectionByIdAction] DB Connection retrieved successfully",
    dbConnectionData
  );

  return dbConnectionData;
}
