"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TRoleOutRequestDto } from "@/core/application/dtos/role.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadRoleByIdAction(
  id: string
): Promise<TResOutContent<TRoleOutRequestDto>> {
  console.log("Reading role by ID (test)...", id);

  const roleRes = await fetch(`${domain}/api/roles/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response:", roleRes);

  if (!roleRes.ok) {
    const errorData = await roleRes.json();
    console.error(
      "Error reading role:",
      errorData.message || roleRes.statusText
    );
    return {
      ok: false,
      message: errorData.message || "Failed to read role",
      data: null,
    };
  }

  const roleData = await roleRes.json();
  console.log("Read role:", roleData);

  return {
    ok: true,
    message: roleData.message || "Role read successfully",
    data: roleData.data,
  };
}
