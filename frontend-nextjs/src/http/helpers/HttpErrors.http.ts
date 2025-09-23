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
  error_401(): IHttpResponse {
    return {
      statusCode: 401,
      body: { error: "Unauthorized" },
    };
  }
  /**
   * Returns a 422 Unprocessable Entity HTTP error response.
   * @returns The HTTP error response.
   */
  error_422(): IHttpResponse {
    return {
      statusCode: 422,
      body: { error: "Unprocessable Entity" },
    };
  }

  /**
   * Returns a 400 Bad Request HTTP error response.
   * @returns The HTTP error response.
   */
  error_400(): IHttpResponse {
    return {
      statusCode: 400,
      body: { error: "Bad Request" },
    };
  }

  /**
   * Returns a 404 Not Found HTTP error response.
   * @returns The HTTP error response.
   */
  error_404(): IHttpResponse {
    return {
      statusCode: 404,
      body: { error: "Not Found" },
    };
  }

  /**
   * Returns a 500 Internal Server Error HTTP error response.
   * @returns The HTTP error response.
   */
  error_500(): IHttpResponse {
    return {
      statusCode: 500,
      body: { error: "Internal Error" },
    };
  }
}
