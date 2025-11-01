// controller/_actions/auth/logout.ts
"use server";

import { FirebaseClientProvider } from "@/infrastructure/providers/firebase/firebase-client";
import { COOKIE_NAME } from "@/utils/constants";
import { signOut } from "firebase/auth";
import { cookies } from "next/headers";

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  const auth = new FirebaseClientProvider().getAuth();
  await signOut(auth);
  return { ok: true };
}
