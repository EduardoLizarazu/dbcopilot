"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import {
  TNlqInfoConnDto,
  TNlqInformationData,
} from "@/core/application/dtos/nlq/nlq-qa-information.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ExtractSchemaAction(
  input: TNlqInfoConnDto
): Promise<TResOutContent<TNlqInformationData>> {
  console.log("[ExtractSchemaAction] Initiating schema extraction", input);

  const dbConnectionRes = await fetch(
    `${domain}/api/dbconnection/extract-schema`,
    {
      method: "POST",
      body: JSON.stringify(input),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await readTokenFromCookie()}`,
      },
    }
  );
  console.log("[ExtractSchemaAction] API Response received", dbConnectionRes);

  if (!dbConnectionRes.ok) {
    const errorData = await dbConnectionRes.json();
    console.error(
      "[ExtractSchemaAction] Error during schema extraction:",
      errorData.message || dbConnectionRes.statusText
    );
    throw new Error(
      `Failed to extract schema: ${errorData.message || dbConnectionRes.statusText}`
    );
  }

  const dbConnectionData = await dbConnectionRes.json();
  console.log(
    "[ExtractSchemaAction] Schema extracted successfully",
    dbConnectionData
  );

  return dbConnectionData;
}
