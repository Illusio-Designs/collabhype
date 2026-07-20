import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';

export const requireAuth = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing bearer token'));
  }
  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    // Special-purpose tokens (e.g. password-reset, kind:'reset') are signed with
    // the same secret but must NOT authenticate API requests. Only accept normal
    // auth tokens (no `kind`, or an explicit auth kind).
    if (payload.kind && payload.kind !== 'auth') {
      return next(ApiError.unauthorized('Invalid or expired token'));
    }
    req.user = payload;
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
};

// Attaches req.user when a valid auth token is present, but never rejects —
// for endpoints that work anonymously yet want to attribute logged-in users
// (e.g. analytics ingest).
export const optionalAuth = (req, _res, next) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const payload = verifyToken(header.slice(7));
      if (!payload.kind || payload.kind === 'auth') req.user = payload;
    } catch {
      /* ignore — treat as anonymous */
    }
  }
  next();
};

export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden('Insufficient role'));
    next();
  };
