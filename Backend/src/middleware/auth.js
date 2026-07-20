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

export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden('Insufficient role'));
    next();
  };
