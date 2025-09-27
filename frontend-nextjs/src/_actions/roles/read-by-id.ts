"use server";
import { readTokenFromCookie } from "@/controller/_actions/auth/token/read-token-from-cookie";
import { TRoleOutRequestDto } from "@/core/application/dtos/role.app.dto";
import { domain } from "@/utils/constants";

export type TResContent<T> = {
  message: string | null;
  data: T | null;
} | null;

export async function ReadRoleByIdAction(
  id: string
): Promise<TResContent<TRoleOutRequestDto>> {
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
