"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TSchemaCtxBaseDto } from "@/core/application/dtos/schemaCtx.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadByIdSchemaCtxAction(
  id: string
): Promise<TResOutContent<TSchemaCtxBaseDto>> {
  console.log(`Reading schema context by id (test)...`, id);

  const res = await fetch(`/api/schema-ctx/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response:", res);

  if (!res.ok) {
    const errorData = await res.json();
    console.warn(
      "Error reading schema context by id:",
      errorData.message || res.statusText
    );
    return {
      ok: false,
      message: errorData.message || "Failed to read schema context by id",
      data: null,
    };
  }

  const resData = await res.json();
  console.log("Read schema context by id:", resData);

  return {
    ok: true,
    message: resData.message,
    data: resData.data,
  };
}
