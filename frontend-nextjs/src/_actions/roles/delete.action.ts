"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import { domain } from "@/utils/constants";

export async function DeleteRoleAction(id: string): Promise<void> {
  console.log("Deleting role (test)...", id);

  const roleRes = await fetch(`${domain}/api/roles/`, {
    method: "DELETE",
    body: JSON.stringify({ id }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log("Response:", roleRes);

  if (!roleRes.ok) {
    const errorData = await roleRes.json();
    console.error(
      "Error deleting role:",
      errorData.message || roleRes.statusText
    );
    throw new Error(
      `Failed to delete role: ${errorData.message || roleRes.statusText}`
    );
  }
}
