"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import { domain } from "@/utils/constants";

export async function ReadRoleByIdAction(id: string) {
  console.log("Reading role by ID (test)...", id);

  const roleRes = await fetch(`${domain}/api/roles/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log("Response:", roleRes);

  if (!roleRes.ok) {
    throw new Error(`Failed to read role: ${roleRes.statusText}`);
  }

  const roleData = await roleRes.json();
  console.log("Read role:", roleData);

  return roleData;
}
