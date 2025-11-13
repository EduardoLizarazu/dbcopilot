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
    throw new Error(
      `Failed to read user: ${errorData.message || userRes.statusText}`
    );
  }

  const userData = await userRes.json();
  console.log("Read user:", userData);

  return userData;
}
