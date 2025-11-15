"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TDbConnectionOutRequestDtoWithVbAndUser } from "@/core/application/dtos/dbconnection.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadAllDbConnectionAction(): Promise<
  TResOutContent<TDbConnectionOutRequestDtoWithVbAndUser[]>
> {
  console.log(
    "[ReadAllDbConnectionAction] Initiating DB Connections retrieval"
  );

  const dbConnectionRes = await fetch(`${domain}/api/dbconnection`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
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
    return {
      ok: false,
      message:
        errorData.message ||
        dbConnectionRes.statusText ||
        "Error retrieving DB Connections",
      data: null,
    };
  }

  const dbConnectionData = await dbConnectionRes.json();
  console.log(
    "[ReadAllDbConnectionAction] DB Connections retrieved successfully",
    dbConnectionData
  );

  return {
    ok: true,
    message:
      dbConnectionData.message || "DB Connections retrieved successfully",
    data: dbConnectionData.data,
  };
}
