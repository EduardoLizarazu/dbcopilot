"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function DeleteUserAction(
  id: string
): Promise<TResOutContent<null>> {
  console.log("Deleting user by ID (test)...", id);

  const userRes = await fetch(`${domain}/api/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response:", userRes);

  if (!userRes.ok) {
    const errorData = await userRes.json();
    console.warn(
      "Error deleting user:",
      errorData.message || userRes.statusText
    );
    throw new Error(
      `Failed to delete user: ${errorData.message || userRes.statusText}`
    );
  }

  const userData = await userRes.json();
  console.log("Deleted user:", userData);
  return userData;
}
