"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import { domain } from "@/utils/constants";

export async function DeleteRoleAction(id: string) {
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
    throw new Error(`Failed to delete role: ${roleRes.statusText}`);
  }

  const roleData = await roleRes.json();
  console.log("Deleted role:", roleData);

  return roleData;
}
