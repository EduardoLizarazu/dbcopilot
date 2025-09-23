import { IHttpErrors } from "./IHttpErrors.http";
import { IHttpResponse } from "./IHttResponse.http";

/**
 * Implementation of IHttpErrors for generating common HTTP error responses.
 */
export class HttpErrors implements IHttpErrors {
  /**
   * Returns a 401 Unauthorized HTTP error response.
   * @returns The HTTP error response.
   */
  error_401(message: string): IHttpResponse {
    return {
      statusCode: 401,
      body: { error: "Unauthorized", message },
    };
  }
  /**
   * Returns a 422 Unprocessable Entity HTTP error response.
   * @returns The HTTP error response.
   */
  error_422(message: string): IHttpResponse {
    return {
      statusCode: 422,
      body: { error: "Unprocessable Entity", message },
    };
  }

  /**
   * Returns a 400 Bad Request HTTP error response.
   * @returns The HTTP error response.
   */
  error_400(message: string): IHttpResponse {
    return {
      statusCode: 400,
      body: { error: "Bad Request", message },
    };
  }

  /**
   * Returns a 404 Not Found HTTP error response.
   * @returns The HTTP error response.
   */
  error_404(message: string): IHttpResponse {
    return {
      statusCode: 404,
      body: { error: "Not Found", message },
    };
  }

  /**
   * Returns a 500 Internal Server Error HTTP error response.
   * @returns The HTTP error response.
   */
  error_500(message: string): IHttpResponse {
    return {
      statusCode: 500,
      body: { error: "Internal Error", message },
    };
  }
}
