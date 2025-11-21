"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TNlqQaGoodWithExecutionDto } from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadChangesWithExecBySchemaAction(input: {
  dbConnectionIds: string[];
}): Promise<TResOutContent<TNlqQaGoodWithExecutionDto[]>> {
  console.log("Reading changes with execution by schema (test)...", input);

  const res = await fetch(`${domain}/api/nlq-qa-good/exec-by-conn-ids`, {
    method: "POST",
    body: JSON.stringify({ ...input }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response:", res);

  if (!res.ok) {
    const errorData = await res.json();
    console.log("Failed response:", errorData.message || res.statusText);
    return {
      ok: false,
      data: null,
      message:
        errorData?.message || "Failed to read changes with execution by schema",
    };
  }

  const resData = await res.json();
  console.log("Read changes with execution by schema:", resData);
  return {
    ok: true,
    data: resData.data,
    message:
      resData.message || "Successfully read changes with execution by schema",
  };
}
