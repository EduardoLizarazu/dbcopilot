import type { NextRequest } from "next/server";

/**
 * Adapts Next.js request to the application's request format and calls the provided controller.
 *
 * @async
 * @param {NextRequest} request - The Next.js request object.
 * @param {IController} apiRoute - The controller to handle the request.
 * @returns {Promise<IHttpResponse>} The response from the controller.
 */

import { IController } from "../controllers/IController.http.controller";
import { HttpRequest } from "../helpers/HttpRequest.http";
import { IHttpResponse } from "../helpers/IHttResponse.http";
import { IHttpRequest } from "../helpers/IHttpRequest.http";
import { DecodeTokenAdapter } from "@/infrastructure/adapters/decode-token.adapter";
import { WinstonLoggerProvider } from "@/infrastructure/providers/logging/winstom-logger.infra.provider";
import { FirebaseAdminProvider } from "@/infrastructure/providers/firebase/firebase-admin";

type AuthContext = { uid?: string } | null;

// Helpers
const getBearer = (headers: Record<string, string>) => {
  const h = headers["authorization"] || headers["Authorization"] || "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
};

export async function nextAdapter(
  request: NextRequest,
  apiRoute: IController,
  opts?: { isTokenRequired: boolean }
): Promise<IHttpResponse> {
  const body = await request.json().catch(() => null);
  console.log("[next adapter] Parsed body:", body);

  if (!body) {
    return {
      statusCode: 400,
      body: { success: "false", message: "Invalid JSON body" },
    };
  }

  // request.headers to plain object
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  console.log("[next adapter] Parsed headers:", headers);

  // Extract the `id` from the path (e.g., `/api/nlq/feedback/:id`)
  const path = request.nextUrl.pathname;
  const pathSegments = path.split("/").filter(Boolean); // Split and remove empty segments
  const id = pathSegments[pathSegments.length - 1]; // Assuming `id` is the last segment
  console.log("[next adapter] Extracted id:", id);

  // Optional decode
  const decodeToken = new DecodeTokenAdapter(
    new WinstonLoggerProvider(),
    new FirebaseAdminProvider()
  );
  let auth: AuthContext = null;
  const token = getBearer(headers);
  console.log("[next adapter] Extracted token:", token);

  if (token && opts?.isTokenRequired) {
    try {
      const decoded = await decodeToken.decodeToken(token);
      console.log("[next adapter] Decoded token:", decoded);
      auth = { uid: decoded?.uid };
    } catch (e) {
      // leave auth = null; controller can decide to reject or allow public access
    }
  }

  const httpRequest: IHttpRequest<typeof body> = new HttpRequest({
    header: headers,
    body: body,
    path: request.nextUrl.pathname,
    query: request.nextUrl.searchParams,
    auth: auth?.uid ? { uid: auth.uid } : null,
    // params: id ? { id } : {},
  });
  console.log("next adapter: Created HttpRequest:", httpRequest);

  const httpResponse: IHttpResponse = await apiRoute.handle(httpRequest);
  console.log("next adapter: Controller response:", httpResponse);
  return httpResponse;
}
