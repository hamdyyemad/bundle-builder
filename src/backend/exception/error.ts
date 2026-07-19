/**
 * HTTP-mapped error types.
 *
 * Throwing one of these from a handler produces the matching status code and
 * a client-safe message. Anything else becomes a generic 500, so internal
 * failures never leak details to the caller.
 */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    /** Extra fields merged into the JSON body. */
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** 400 — malformed or invalid request. */
export class BadRequestError extends HttpError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(400, message, details);
  }
}

/** 401 — missing or wrong credentials. */
export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}

/** 404 — resource does not exist. */
export class NotFoundError extends HttpError {
  constructor(message = "Not found") {
    super(404, message);
  }
}

/**
 * 503 — the server is missing configuration it needs (e.g. an unset secret).
 * Distinct from 500: the request was fine, the deployment is not.
 */
export class ServiceUnavailableError extends HttpError {
  constructor(message = "Not configured") {
    super(503, message);
  }
}
