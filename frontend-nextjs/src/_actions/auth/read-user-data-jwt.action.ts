"use server";
import { jwtVerify } from "jose";
import dotenv from "dotenv";
import { cookies } from "next/headers";
import { JWTExpired } from "jose/errors";

dotenv.config();

const JWT_COOKIE_NAME: string =
  process.env.JWT_COOKIE_NAME || "default_cookie_name";

export async function ReadUserDataJwtAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(JWT_COOKIE_NAME)?.value;
    if (!token) return null;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return {
      roles: payload.roles || [],
      username: payload.username,
    };
  } catch (error) {
    if (error instanceof JWTExpired) return null;
    console.error("Logout error:", error);
    throw new Error("Logout failed");
  }
}
