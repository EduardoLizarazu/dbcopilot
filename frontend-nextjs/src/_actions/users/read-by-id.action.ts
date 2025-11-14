"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TRoleOutRequestDto } from "@/core/application/dtos/role.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadUserByIdAction(
  id: string
): Promise<TResOutContent<TRoleOutRequestDto>> {
  console.log("Reading user by ID (test)...", id);

  const userRes = await fetch(`${domain}/api/users/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response:", userRes);

  if (!userRes.ok) {
    const errorData = await userRes.json();
    console.error(
      "Error reading user:",
      errorData.message || userRes.statusText
    );
    return {
      ok: false,
      message: errorData.message || "Failed to read user",
      data: null,
    };
  }

  const userData = await userRes.json();
  console.log("Read user:", userData);

  return {
    ok: true,
    message: userData.message || "User read successfully",
    data: userData.data,
  };
}
