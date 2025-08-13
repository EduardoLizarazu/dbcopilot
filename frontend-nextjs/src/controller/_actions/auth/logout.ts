// controller/_actions/auth/logout.ts
"use server";

import { cookies } from "next/headers";

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set("fb_id_token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return { ok: true };
}
