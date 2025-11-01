"use server";
import { COOKIE_NAME } from "@/utils/constants";
import { cookies } from "next/headers";

export async function ReadTokenFromCookieAction() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return token;
}
