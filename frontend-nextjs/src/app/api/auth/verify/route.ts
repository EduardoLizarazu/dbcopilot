import { NextResponse } from "next/server";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";

// This API route runs in the Node server runtime and uses the Admin SDK to verify
// the Firebase ID token (JWT). It is intentionally separate from middleware so
// the middleware can remain Edge-compatible.

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body?.token;
    if (!token) {
      return new NextResponse(JSON.stringify({ error: "no token" }), {
        status: 401,
      });
    }

    const fbAdmin = new FirebaseAdminProvider();
    try {
      const decoded = await fbAdmin.auth.verifyIdToken(token);
      // Return decoded token (claims) to middleware
      return NextResponse.json(decoded);
    } catch (err) {
      return new NextResponse(JSON.stringify({ error: "invalid token" }), {
        status: 401,
      });
    }
  } catch (err) {
    return new NextResponse(JSON.stringify({ error: "internal" }), {
      status: 500,
    });
  }
}
