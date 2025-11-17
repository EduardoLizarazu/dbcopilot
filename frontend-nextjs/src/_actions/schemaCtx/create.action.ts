"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import {
  TCreateSchemaCtxBaseInReqDto,
  TSchemaCtxBaseDto,
} from "@/core/application/dtos/schemaCtx.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function CreateSchemaCtxAction(
  input: TCreateSchemaCtxBaseInReqDto
): Promise<TResOutContent<TSchemaCtxBaseDto>> {
  console.log("Creating schema context (test)...", input);

  const res = await fetch(`${domain}/api/schema-ctx`, {
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
    console.error(
      "Error creating schema context:",
      errorData.message || res.statusText
    );
    return {
      ok: false,
      message: errorData.message || "Failed to create schema context",
      data: null,
    };
  }

  const resData = await res.json();
  console.log("Created schema context:", resData);

  return {
    ok: true,
    message: resData.message,
    data: resData.data,
  };
}
