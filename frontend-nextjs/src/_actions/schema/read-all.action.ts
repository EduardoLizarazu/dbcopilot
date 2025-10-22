"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import { TSchemaOutRqDto } from "@/core/application/dtos/schemaContext.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadAllSchemaAction(): Promise<
  TResOutContent<TSchemaOutRqDto[]>
> {
  console.log("[ReadAllSchemaAction] Initiating schema retrieval");

  const schemaRes = await fetch(`${domain}/api/schema`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log("[ReadAllSchemaAction] API Response received", schemaRes);

  if (!schemaRes.ok) {
    const errorData = await schemaRes.json();
    console.error(
      "[ReadAllSchemaAction] Error during schema retrieval:",
      errorData.message || schemaRes.statusText
    );
    throw new Error(
      `Failed to retrieve schemas: ${errorData.message || schemaRes.statusText}`
    );
  }

  const schemaData = await schemaRes.json();
  console.log(
    "[ReadAllSchemaAction] Schemas retrieved successfully",
    schemaData
  );

  return schemaData;
}
