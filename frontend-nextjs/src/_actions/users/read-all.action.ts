import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TUserOutRequestWithRoles } from "@/core/application/dtos/user.app.dto";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";

export async function ReadAllUserAction(): Promise<
  TResOutContent<TUserOutRequestWithRoles[]>
> {
  console.log("Reading all users...");

  const userRes = await fetch(`${domain}/api/users`, {
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
      "Error creating user:",
      errorData.message || userRes.statusText
    );
    return {
      ok: false,
      message: errorData.message || "Error reading users",
      data: null,
    };
  }

  const userData = await userRes.json();
  console.log("Fetched users:", userData);

  return {
    ok: true,
    message: userData.message || "Users fetched successfully",
    data: userData.data,
  };
}
