export class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.details = details;
  }
}
export class ValidationError extends AppError {
  constructor(details) { super(400, "Invalid input", details); }
}
export class UnauthorizedError extends AppError {
  constructor() { super(401, "Missing or invalid API key"); }
}
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") { super(403, message); }
}
export class NotFoundError extends AppError {
  constructor(message = "Not found") { super(404, message); }
}
export class ConflictError extends AppError {
  constructor(message = "Already exists") { super(409, message); }
}

// Turns any thrown value into an HTTP status and JSON body. Unexpected errors never leak details.
export function toHttpError(error) {
  if (error instanceof AppError) {
    return { status: error.status, body: { error: error.message, ...(error.details ? { details: error.details } : {}) } };
  }
  // Body-parser errors (malformed JSON, body too large) are the client's fault and safe to show.
  if (Number.isInteger(error?.status) && error.status >= 400 && error.status < 500 && error.expose) {
    return { status: error.status, body: { error: error.message } };
  }
  return { status: 500, body: { error: "Internal server error" } };
}
