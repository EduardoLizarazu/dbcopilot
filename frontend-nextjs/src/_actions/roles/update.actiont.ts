"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import {
  TRoleOutRequestDto,
  TUpdateRoleDto,
} from "@/core/application/dtos/role.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function UpdateRoleAction(
  input: TUpdateRoleDto
): Promise<TResOutContent<TRoleOutRequestDto>> {
  console.log("Updating role (test)...", input);

  const roleRes = await fetch(`${domain}/api/roles/${input.id}`, {
    method: "PUT",
    body: JSON.stringify({
      id: input.id,
      name: input.name,
      description: input.description,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log("Response:", roleRes);

  if (!roleRes.ok) {
    const errorData = await roleRes.json();
    console.error(
      "Error updating role:",
      errorData.message || roleRes.statusText
    );
    throw new Error(
      `Failed to update role: ${errorData.message || roleRes.statusText}`
    );
  }

  const roleData = await roleRes.json();
  console.log("Updated role:", roleData);

  return roleData;
}
