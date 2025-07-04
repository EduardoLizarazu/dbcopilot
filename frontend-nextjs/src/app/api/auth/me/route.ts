"use server";
// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const COOKIE_NAME = process.env.COOKIE_NAME || "default_cookie_name";
  const token = cookieStore.get(COOKIE_NAME)?.value;

  console.log("GET ROUTE JWT: ", token);

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    return NextResponse.json({
      roles: payload.roles || [],
      username: payload.username,
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
