"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TSchemaCtxBaseDto } from "@/core/application/dtos/schemaCtx.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function UpdateSchemaCtxAction(
  id: string,
  input: TSchemaCtxBaseDto
): Promise<TResOutContent<TSchemaCtxBaseDto>> {
  console.log("Updating schema context (test)...", input);

  const res = await fetch(`${domain}/api/schema-ctx/${id}`, {
    method: "PUT",
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
      "Error updating schema context:",
      errorData.message || res.statusText
    );
    return {
      ok: false,
      message: errorData.message || "Failed to update schema context",
      data: null,
    };
  }

  const resData = await res.json();
  console.log("Updated schema context:", resData);

  return {
    ok: true,
    message: resData.message,
    data: resData.data,
  };
}
