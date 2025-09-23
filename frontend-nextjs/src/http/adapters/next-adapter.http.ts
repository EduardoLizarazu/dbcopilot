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

export async function nextAdapter(
  request: NextRequest,
  apiRoute: IController
): Promise<IHttpResponse> {
  const body = await request.json().catch(() => null);
  console.log("next adapter: Parsed body:", body);

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
  console.log("next adapter: Parsed headers:", headers);
  const httpRequest: IHttpRequest<typeof body> = new HttpRequest({
    header: headers,
    body: body,
    path: request.nextUrl.pathname,
    query: request.nextUrl.searchParams,
  });
  console.log("next adapter: Created HttpRequest:", httpRequest);

  const httpResponse: IHttpResponse = await apiRoute.handle(httpRequest);
  console.log("next adapter: Controller response:", httpResponse);
  return httpResponse;
}
