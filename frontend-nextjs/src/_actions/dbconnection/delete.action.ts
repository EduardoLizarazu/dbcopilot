"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function DeleteDbConnectionAction(
  id: string
): Promise<TResOutContent<null>> {
  console.log(
    "[DeleteDbConnectionAction] Initiating DB Connection deletion",
    id
  );

  const dbConnectionRes = await fetch(`${domain}/api/dbconnection/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log(
    "[DeleteDbConnectionAction] API Response received",
    dbConnectionRes
  );

  if (!dbConnectionRes.ok) {
    const errorData = await dbConnectionRes.json();
    console.error(
      "[DeleteDbConnectionAction] Error during DB Connection deletion:",
      errorData.message || dbConnectionRes.statusText
    );
    return {
      ok: false,
      message:
        errorData.message ||
        dbConnectionRes.statusText ||
        "Error deleting DB Connection",
      data: null,
    };
  }

  const dbConnectionData = await dbConnectionRes.json();
  console.log(
    "[DeleteDbConnectionAction] DB Connection deleted successfully",
    dbConnectionData
  );

  return {
    ok: true,
    message: dbConnectionData.message || "DB Connection deleted successfully",
    data: dbConnectionData.data,
  };
}
