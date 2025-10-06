"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
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
      Authorization: `Bearer ${await readTokenFromCookie()}`,
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
    throw new Error(
      `Failed to delete DB Connection: ${errorData.message || dbConnectionRes.statusText}`
    );
  }

  const dbConnectionData = await dbConnectionRes.json();
  console.log(
    "[DeleteDbConnectionAction] DB Connection deleted successfully",
    dbConnectionData
  );

  return dbConnectionData;
}
