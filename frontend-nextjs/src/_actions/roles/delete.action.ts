"use server";
import { ReadTokenFromCookieAction } from "@/_actions/auth/read-token-from-cookie.action";
import { TResOutContent } from "@/core/application/dtos/utils/response.app.dto";
import { domain } from "@/utils/constants";
import { ok } from "assert";

export async function DeleteRoleAction(
  id: string
): Promise<TResOutContent<null>> {
  console.log("Deleting role (test)...", id);

  const roleRes = await fetch(`${domain}/api/roles/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${await ReadTokenFromCookieAction()}`,
    },
  });
  console.log("Response:", roleRes);

  if (!roleRes.ok) {
    const errorData = await roleRes.json();
    console.error(
      "Error deleting role:",
      errorData.message || roleRes.statusText
    );
    return {
      ok: false,
      data: null,
      message: errorData.message || "Failed to delete role",
    };
  }
  const res = await roleRes.json();
  return {
    ok: true,
    data: null,
    message: res.message || "Role deleted successfully",
  };
}
