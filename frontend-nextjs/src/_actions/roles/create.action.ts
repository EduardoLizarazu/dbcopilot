"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { CreateRoleInput } from "@/controller/_actions/role/create";
import { TRoleOutRequestDto } from "@/core/application/dtos/role.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function CreateRoleAction(
  input: CreateRoleInput
): Promise<TResOutContent<TRoleOutRequestDto[]>> {
  console.log("Creating role (test)...", input);

  const roleRes = await fetch(`${domain}/api/roles`, {
    method: "POST",
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response:", roleRes);

  if (!roleRes.ok) {
    const errorData = await roleRes.json();
    console.error(
      "Error creating role:",
      errorData.message || roleRes.statusText
    );
    throw new Error(
      `Failed to create role: ${errorData.message || roleRes.statusText}`
    );
  }

  const roleData = await roleRes.json();
  console.log("Created role:", roleData);

  return roleData;
}
