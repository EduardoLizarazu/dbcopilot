"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
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
        Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
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
    return {
      ok: false,
      message:
        errorData.message ||
        dbConnectionRes.statusText ||
        "Error extracting schema",
      data: null,
    };
  }

  const dbConnectionData = await dbConnectionRes.json();
  console.log(
    "[ExtractSchemaAction] Schema extracted successfully",
    dbConnectionData
  );

  return {
    ok: true,
    message: dbConnectionData.message || "Schema extracted successfully",
    data: dbConnectionData.data,
  };
}
