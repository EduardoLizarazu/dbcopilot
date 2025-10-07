"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import {
  TNlqInformationData,
  TNlqQaInfoExtractorInRequestDto,
} from "@/core/application/dtos/nlq/nlq-qa-information.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function InfoExtractorAction(
  input: TNlqQaInfoExtractorInRequestDto
): Promise<TResOutContent<TNlqInformationData>> {
  console.log("[InfoExtractorAction] Initiating information extraction", input);

  const dbConnectionRes = await fetch(`${domain}/api/info-extractor`, {
    method: "POST",
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log("[InfoExtractorAction] API Response received", dbConnectionRes);

  if (!dbConnectionRes.ok) {
    const errorData = await dbConnectionRes.json();
    console.error(
      "[InfoExtractorAction] Error during information extraction:",
      errorData.message || dbConnectionRes.statusText
    );
    throw new Error(
      `Failed to extract information: ${errorData.message || dbConnectionRes.statusText}`
    );
  }

  const dbConnectionData = await dbConnectionRes.json();
  console.log(
    "[InfoExtractorAction] Information extracted successfully",
    dbConnectionData
  );

  return dbConnectionData;
}
