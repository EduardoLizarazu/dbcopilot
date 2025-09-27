import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import { TRoleOutRequestDto } from "@/core/application/dtos/role.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadAllUserAction(): Promise<
  TResOutContent<TRoleOutRequestDto[]>
> {
  console.log("Reading all users...");

  const userRes = await fetch(`${domain}/api/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log("Response:", userRes);

  if (!userRes.ok) {
    throw new Error(`Failed to read users: ${userRes.statusText}`);
  }

  const userData = await userRes.json();
  console.log("Fetched users:", userData);

  return userData;
}
