"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
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
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response:", userRes);

  if (!userRes.ok) {
    const errorData = await userRes.json();
    console.error(
      "Error creating user:",
      errorData.message || userRes.statusText
    );
    return {
      ok: false,
      message: errorData.message || "Error creating user",
      data: null,
    };
  }

  const userData = await userRes.json();
  console.log("Created user:", userData);

  return {
    ok: true,
    message: userData.message || "User created successfully",
    data: userData.data,
  };
}
