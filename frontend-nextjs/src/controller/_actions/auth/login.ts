// controller/_actions/auth/login.ts
"use server";

import { TUser } from "@/core/application/dtos/user.app.dto";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";
import { FirebaseClientProvider } from "@/infrastructure/providers/firebase/firebase-client";
import { COOKIE_NAME } from "@/utils/constants";
import {
  signInWithCustomToken,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { cookies } from "next/headers";

export async function loginAction(email: string, password: string) {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!key) throw new Error("Missing FIREBASE_WEB_API_KEY");

  const fbAdmin = new FirebaseAdminProvider();
  const fbClient = new FirebaseClientProvider();

  const res = await signInWithEmailAndPassword(
    fbClient.getAuth(),
    email,
    password
  );

  // console.log("User credential: ", res);

  if (!res.user) throw new Error("fail on login");

  // Get the role's name from the user
  const user = await fbAdmin.db
    .collection(fbAdmin.coll.NLQ_USERS)
    .where("id", "==", res.user.uid)
    .get();
  if (user.empty) {
    console.log("No user found with UID:", res.user.uid);
    throw new Error("fail on login");
  }

  const userDoc = user.docs[0].data() as TUser;

  const rolesId: string[] = userDoc.roles || [];

  const roleDocs = await Promise.all(
    rolesId.map(async (roleId) => {
      const roleDoc = await fbAdmin.db
        .collection(fbAdmin.coll.NLQ_ROLES)
        .doc(roleId)
        .get();
      return roleDoc.data();
    })
  );

  const rolesNames = roleDocs.map((role) => role?.name);

  console.log("Role names:", rolesNames);

  // Create a custom token using the Admin SDK for this authenticated uid
  let customToken: string;
  try {
    customToken = await fbAdmin.auth.createCustomToken(res.user.uid, {
      roles: rolesNames,
    });
    console.log("Custom token created:", customToken);
  } catch (err) {
    // fail on token creation
    throw new Error(err.message || "fail on custom token creation");
  }

  // Sign in with the custom token to get the ID token (JWT)
  let localId: string;
  try {
    const userCredential = await signInWithCustomToken(
      fbClient.getAuth(),
      customToken
    );
    localId = userCredential.user.uid;
    console.log("User ID (UID):", localId);
  } catch (error) {
    throw new Error(error.message || "fail on verifying custom token");
  }

  // Verify the ID token to get the token string
  try {
    const idToken = await fbAdmin.auth.verifyIdToken(localId);
    console.log("ID Token (JWT):", idToken);
  } catch (error) {
    throw new Error(error.message || "fail on verifying ID token");
  }

  // Set secure, httpOnly cookie with the ID token (JWT) so server sessions continue to work
  try {
    const maxAge = Number.parseInt("3600", 10); // seconds
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, customToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge, // seconds
    });
  } catch (e) {
    // Non-fatal: cookie set failed — still return custom token
  }

  return {
    ok: true,
    uid: userDoc.id,
    email: userDoc.email,
    customToken,
    expiresIn: "3600",
  };
}
