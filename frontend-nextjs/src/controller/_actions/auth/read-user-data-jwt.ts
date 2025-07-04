"use server";
import { jwtVerify } from "jose";
import dotenv from "dotenv";
import { cookies } from "next/headers";

dotenv.config();

const COOKIE_NAME: string = process.env.COOKIE_NAME || "default_cookie_name";

export async function ReadUserDataJwt() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return {
      roles: payload.roles || [],
      username: payload.username,
    };
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Logout failed");
  }
}
