import { cookies } from "next/headers";
import { adminAuth } from "@/infrastructure/providers/firebase/firebase-admin"; // your Admin SDK init

export type DecodedUser = {
  uid: string;
  email?: string;
  // Future-ready: support either a boolean claim or a string role
  admin?: boolean;
  role?: string;
  [key: string]: any; // allow custom claims
};

export async function getCurrentUser(): Promise<DecodedUser | null> {
  const token = (await cookies()).get("fb_id_token")?.value;
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded as DecodedUser;
  } catch {
    return null;
  }
}
