import { NotFoundError, toHttpError } from "../shared/errors.js";

export function notFoundHandler(_req, _res, next) {
  next(new NotFoundError("Route not found"));
}

export function errorHandler(error, _req, res, _next) {
  const { status, body } = toHttpError(error);
  if (status >= 500) console.error(error);
  res.status(status).json(body);
}
