"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
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
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response:", roleRes);

  if (!roleRes.ok) {
    const errorData = await roleRes.json();
    console.error(
      "Error updating role:",
      errorData.message || roleRes.statusText
    );
    return {
      ok: false,
      message: errorData.message || roleRes.statusText || "Error updating role",
      data: null,
    };
  }

  const roleData = await roleRes.json();
  console.log("Updated role:", roleData);

  return {
    ok: true,
    message: roleData.message || "Role updated successfully",
    data: roleData.data,
  };
}
