"use server";
import { cookies } from "next/headers";

export async function readTokenFromCookie() {
  const token = (await cookies()).get("fb_id_token")?.value;
  return token;
}
