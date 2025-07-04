"use server";
import dotenv from "dotenv";
import { cookies } from "next/headers";

dotenv.config();

const COOKIE_NAME: string = process.env.COOKIE_NAME || "default_cookie_name";

export async function LogOutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    return cookieStore.has(COOKIE_NAME);
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Logout failed");
  }
}
