// lib/auth.server.ts
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/firebase-admin"; // from your Admin SDK init

export async function getCurrentUser() {
  const token = (await cookies()).get("fb_id_token")?.value;
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    // decoded contains uid, email, custom claims, etc.
    return decoded;
  } catch {
    return null;
  }
}
