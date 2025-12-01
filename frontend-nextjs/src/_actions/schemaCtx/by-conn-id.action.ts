"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TSchemaCtxBaseDto } from "@/core/application/dtos/schemaCtx.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadSchemaCtxByConnIdAction(input: {
  connId: string;
}): Promise<TResOutContent<TSchemaCtxBaseDto>> {
  console.log("Creating schema context (test)...", input);

  const res = await fetch(`/api/schema-ctx/by-connection`, {
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
      "Error reading schema context by connection ID:",
      errorData.message || res.statusText
    );
    return {
      ok: false,
      message:
        errorData.message || "Failed to read schema context by connection ID",
      data: null,
    };
  }

  const resData = await res.json();
  console.log("Read schema context by connection ID:", resData);

  return {
    ok: true,
    message: resData.message,
    data: resData.data,
  };
}
