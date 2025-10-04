"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import {
  TUpdateUserDto,
  TUserOutputRequestDto,
} from "@/core/application/dtos/user.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function UpdateUserAction(
  input: TUpdateUserDto
): Promise<TResOutContent<TUserOutputRequestDto>> {
  console.log("Updating user (test)...", input);

  const userRes = await fetch(`${domain}/api/users/${input.id}`, {
    method: "PUT",
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log("Response:", userRes);

  if (!userRes.ok) {
    const errorData = await userRes.json();
    console.error(
      "Error updating user:",
      errorData.message || userRes.statusText
    );
    throw new Error(
      `Failed to update user: ${errorData.message || userRes.statusText}`
    );
  }

  const userData = await userRes.json();
  console.log("Updated user:", userData);

  return userData;
}
