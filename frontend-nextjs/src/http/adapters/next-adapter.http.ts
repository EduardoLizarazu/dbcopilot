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
  const httpRequest: IHttpRequest = new HttpRequest({
    header: request.headers,
    body: request.body,
    path: request.nextUrl.pathname,
    query: request.nextUrl.searchParams,
  });
  return apiRoute.handle(httpRequest);
}
