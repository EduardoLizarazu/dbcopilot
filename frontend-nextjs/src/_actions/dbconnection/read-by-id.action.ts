"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
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
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
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
    return {
      ok: false,
      message:
        errorData.message ||
        dbConnectionRes.statusText ||
        "Error retrieving DB Connection",
      data: null,
    };
  }

  const dbConnectionData = await dbConnectionRes.json();
  console.log(
    "[ReadDbConnectionByIdAction] DB Connection retrieved successfully",
    dbConnectionData
  );

  return {
    ok: true,
    message: dbConnectionData.message || "DB Connection retrieved successfully",
    data: dbConnectionData.data,
  };
}
