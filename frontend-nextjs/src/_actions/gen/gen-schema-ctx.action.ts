"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TSchemaCtxSimpleSchemaDto } from "@/core/application/dtos/schemaCtx.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function GenSchemaCtxAction(
  input: TSchemaCtxSimpleSchemaDto
): Promise<TResOutContent<TSchemaCtxSimpleSchemaDto>> {
  console.log("[GenSchemaCtxAction] Creating NLQ QA (test)...", input);

  const res = await fetch(`${domain}/api/gen/schema-ctx`, {
    method: "POST",
    body: JSON.stringify({ ...input }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("[GenSChemaCtxAction] Response:", res);

  if (!res.ok) {
    const errorData = await res.json();
    console.log(
      "[GenSchemaCtxAction] Failed response:",
      errorData.message || res.statusText
    );
    return {
      ok: false,
      data: null,
      message: errorData.message || "Failed to create NLQ QA",
    };
  }

  const resData = await res.json();
  console.log("[GenSchemaCtxAction] Created NLQ QA:", resData);

  return {
    ok: true,
    data: resData.data,
    message: resData.message || "NLQ QA created successfully",
  };
}
