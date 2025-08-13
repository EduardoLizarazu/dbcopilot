// controller/_actions/auth/login.ts
"use server";

import { cookies } from "next/headers";

type FirebaseSignInResponse = {
  idToken: string; // Firebase ID Token (JWT)
  refreshToken: string;
  expiresIn: string; // seconds as string (e.g., "3600")
  localId: string; // uid
  email?: string;
  registered?: boolean;
};

export async function loginAction(email: string, password: string) {
  const key = process.env.FIREBASE_WEB_API_KEY;
  if (!key) throw new Error("Missing FIREBASE_WEB_API_KEY");

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // returnSecureToken:true is required to get idToken/refreshToken
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      // Ensure this request is not cached by any edge
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const data = (await res.json()) as any;
    const code: string | undefined = data?.error?.message;
    throw new Error(mapFirebaseError(code));
  }

  const data = (await res.json()) as FirebaseSignInResponse;

  // Set secure, httpOnly cookie with the ID token (JWT)
  // You can rename it if you prefer, e.g. 'fb_session'
  const maxAge = Number.parseInt(data.expiresIn || "3600", 10); // seconds
  const cookieStore = await cookies();
  cookieStore.set("fb_id_token", data.idToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge, // seconds
  });

  // (Optional) also store refreshToken client-accessible if you plan to refresh server-side:
  // cookieStore.set('fb_refresh_token', data.refreshToken, { httpOnly:true, ... })

  return {
    ok: true,
    uid: data.localId,
    email: data.email,
    idToken: data.idToken, // returned to caller if you need it immediately
    expiresIn: data.expiresIn,
  };
}

function mapFirebaseError(code?: string) {
  switch (code) {
    case "EMAIL_NOT_FOUND":
    case "INVALID_PASSWORD":
    case "INVALID_EMAIL":
      return "Incorrect email or password.";
    case "USER_DISABLED":
      return "This account is disabled.";
    case "TOO_MANY_ATTEMPTS_TRY_LATER":
      return "Too many attempts. Try again later.";
    default:
      return "Unable to sign in. Please try again.";
  }
}
