"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TNlqSchemaProfileBasicsDto } from "@/core/application/dtos/nlq/nlq-qa-information.app.dto";
import { TSchemaCtxColumnProfileDto } from "@/core/application/dtos/schemaCtx.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function InfoProfileExtractorAction(input: {
  connectionIds: string[];
  schema: TNlqSchemaProfileBasicsDto;
}): Promise<TResOutContent<TSchemaCtxColumnProfileDto | null>> {
  console.log(
    "[InfoProfileExtractorAction] Initiating information extraction",
    input
  );

  const res = await fetch(`${domain}/api/info-extractor/profile`, {
    method: "POST",
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("[InfoProfileExtractorAction] API Response received", res);

  if (!res.ok) {
    const errorData = await res.json();
    console.error(
      "[InfoProfileExtractorAction] Error during information extraction:",
      errorData.message || res.statusText
    );
    return {
      ok: false,
      message: errorData.message || "Failed to extract information",
      data: null,
    };
  }

  const resData = await res.json();
  console.log(
    "[InfoProfileExtractorAction] Information extracted successfully",
    resData
  );

  return {
    ok: true,
    message: resData.message || "Information extracted successfully",
    data: resData.data,
  };
}
