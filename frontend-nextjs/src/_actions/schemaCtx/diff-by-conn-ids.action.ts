"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import {
  TSchemaCtxCounterDto,
  TSchemaCtxDiffBaseDto,
  TSchemaCtxSchemaDto,
} from "@/core/application/dtos/schemaCtx.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadDiffSchemaCtxAction(input: {
  oldSchema: TSchemaCtxSchemaDto[];
  connIds: string[];
}): Promise<
  TResOutContent<{
    diffSchemas: TSchemaCtxDiffBaseDto[];
    diffCount: TSchemaCtxCounterDto;
  }>
> {
  console.log("Reading diff schema context (test)...", input);

  const res = await fetch(`${domain}/api/schema-ctx/diff/compare`, {
    method: "POST",
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response:", res);

  if (!res.ok) {
    const errorData = await res.json();
    console.warn(
      "Error reading diff schema context:",
      errorData.message || res.statusText
    );
    return {
      ok: false,
      message: errorData.message || "Failed to read diff schema context",
      data: null,
    };
  }

  const resData = await res.json();
  console.log("Read diff schema context:", resData);

  return {
    ok: true,
    message: resData.message,
    data: resData.data,
  };
}
