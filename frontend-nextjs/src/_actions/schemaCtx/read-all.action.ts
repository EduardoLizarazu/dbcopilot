"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TSchemaCtxBaseDto } from "@/core/application/dtos/schemaCtx.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadAllSchemaCtxAction(): Promise<
  TResOutContent<TSchemaCtxBaseDto[]>
> {
  console.log("Reading all schema contexts (test)...");

  const res = await fetch(`${domain}/api/schema-ctx`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response:", res);

  if (!res.ok) {
    const errorData = await res.json();
    console.warn(
      "Error reading all schema contexts:",
      errorData.message || res.statusText
    );
    return {
      ok: false,
      message: errorData.message || "Failed to read all schema contexts",
      data: null,
    };
  }

  const resData = await res.json();
  console.log("Read all schema contexts:", resData);

  return {
    ok: true,
    message: resData.message,
    data: resData.data,
  };
}
