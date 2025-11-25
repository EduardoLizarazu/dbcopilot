"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TSchemaCtxSchemaDto } from "@/core/application/dtos/schemaCtx.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadNewSchemaCtxAction(input: {
  connIds: string[];
}): Promise<TResOutContent<TSchemaCtxSchemaDto[]>> {
  console.log("Reading new schema context (test)...", input);

  const res = await fetch(`${domain}/api/schema-ctx/diff/new`, {
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
      "Error reading new schema context:",
      errorData.message || res.statusText
    );
    return {
      ok: false,
      message: errorData.message || "Failed to read new schema context",
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
