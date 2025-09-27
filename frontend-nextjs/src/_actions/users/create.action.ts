"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import {
  TCreateUserDto,
  TUserOutputRequestDto,
} from "@/core/application/dtos/user.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function CreateUserAction(
  input: TCreateUserDto
): Promise<TResOutContent<TUserOutputRequestDto>> {
  console.log("Creating user (test)...", input);

  const userRes = await fetch(`${domain}/api/users`, {
    method: "POST",
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log("Response:", userRes);

  if (!userRes.ok) {
    throw new Error(`Failed to create role: ${userRes.statusText}`);
  }

  const userData = await userRes.json();
  console.log("Created user:", userData);

  return userData;
}
