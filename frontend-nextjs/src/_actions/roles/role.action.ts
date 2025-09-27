"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import { CreateRoleInput } from "@/controller/_actions/role/create";
import { domain } from "@/utils/constants";

export async function CreateRoleAction(input: CreateRoleInput) {
  console.log("Creating role (test)...", input);

  const roleRes = await fetch(`${domain}/api/roles`, {
    method: "POST",
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log("Response:", roleRes);

  if (!roleRes.ok) {
    throw new Error(`Failed to create role: ${roleRes.statusText}`);
  }

  const roleData = await roleRes.json();
  console.log("Created role:", roleData);

  return roleData;
}

export async function ReadAllRolesAction() {
  console.log("Reading all roles...");
  const rolesRes = await fetch(`${domain}/api/roles`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await readTokenFromCookie()}`,
    },
  });
  console.log("Response:", rolesRes);
  if (!rolesRes.ok) {
    throw new Error(`Failed to fetch roles: ${rolesRes.statusText}`);
  }
  const rolesData = await rolesRes.json();
  console.log("Fetched roles:", rolesData);
  return rolesData;
}
