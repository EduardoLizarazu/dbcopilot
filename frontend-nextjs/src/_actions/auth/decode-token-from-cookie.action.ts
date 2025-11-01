import { cookies } from "next/headers";
import { adminAuth } from "@/infrastructure/providers/firebase/firebase-admin"; // your Admin SDK init
import { JWT_COOKIE_NAME } from "@/utils/constants";

export type DecodedUser = {
  uid: string;
  email: string;
  // Future-ready: support either a boolean claim or a string role
  roles?: string[];
  [key: string]: any; // allow custom claims
};

export async function DecodeTokenFromCookieAction(): Promise<DecodedUser | null> {
  const token = (await cookies()).get(JWT_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded as DecodedUser;
  } catch {
    return null;
  }
}
