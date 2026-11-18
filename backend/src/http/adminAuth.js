import { createHash, timingSafeEqual } from "node:crypto";
import { ForbiddenError, UnauthorizedError } from "../shared/errors.js";

const digest = (value) => createHash("sha256").update(value).digest();

// True when the header is exactly "Bearer <apiKey>". Compares hashes in constant time.
export function isAuthorized(authorizationHeader, apiKey) {
  const match = /^Bearer (.+)$/.exec(authorizationHeader ?? "");
  return Boolean(match && apiKey && timingSafeEqual(digest(match[1]), digest(apiKey)));
}

// Middleware for write endpoints. With no ADMIN_API_KEY configured, writes are switched off
// instead of left open.
export function createRequireAdmin(apiKey) {
  return (req, _res, next) => {
    if (!apiKey) return next(new ForbiddenError("Catalog writes are disabled: set ADMIN_API_KEY"));
    if (!isAuthorized(req.get("authorization"), apiKey)) return next(new UnauthorizedError());
    return next();
  };
}
