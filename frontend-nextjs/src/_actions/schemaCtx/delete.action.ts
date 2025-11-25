"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TSchemaCtxBaseDto } from "@/core/application/dtos/schemaCtx.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function DeleteSchemaCtxByIdAction(
  id: string
): Promise<TResOutContent<TSchemaCtxBaseDto>> {
  console.log(`Deleting schema context by id (test)...`, id);

  const res = await fetch(`${domain}/api/schema-ctx/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response:", res);

  if (!res.ok) {
    const errorData = await res.json();
    console.warn(
      "Error deleting schema context by id:",
      errorData.message || res.statusText
    );
    return {
      ok: false,
      message: errorData.message || "Failed to delete schema context by id",
      data: null,
    };
  }

  const resData = await res.json();
  console.log("Delete schema context by id:", resData);

  return {
    ok: true,
    message: resData.message,
    data: resData.data,
  };
}
