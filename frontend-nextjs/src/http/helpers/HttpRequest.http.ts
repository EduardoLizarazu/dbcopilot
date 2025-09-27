import { IHttpRequest } from "./IHttpRequest.http";

/**
 * Implementation of IHttpRequest representing an HTTP request.
 */
export class HttpRequest<B> implements IHttpRequest<B> {
  /**
   * Represents the headers of the HTTP request.
   */
  header?: unknown;

  /**
   * Represents the body of the HTTP request.
   */
  body?: B;

  /**
   * Represents the query parameters of the HTTP request.
   */
  query?: unknown;

  /**
   * Represents the path parameters of the HTTP request.
   */
  path?: unknown;

  auth: { uid: string } | null = null;

  params?: Record<string, string>;

  /**
   * Initializes a new instance of the `HttpRequest` class.
   * @param init - An optional object containing properties to initialize the instance.
   */
  constructor(init?: HttpRequest<B>) {
    Object.assign(this, init);
  }
}
