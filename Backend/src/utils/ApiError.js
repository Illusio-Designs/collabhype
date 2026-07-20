const STATUS_NAMES = {
  400: 'BadRequest',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'NotFound',
  409: 'Conflict',
  503: 'ServiceUnavailable',
};

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    // Set an explicit name so the error handler emits a meaningful `error` code
    // (e.g. "NotFound"/"Conflict") instead of the inherited "Error" — clients
    // branch on this code.
    this.name = STATUS_NAMES[status] || 'ApiError';
    this.status = status;
    this.details = details;
  }

  static badRequest(msg = 'Bad request', details) {
    return new ApiError(400, msg, details);
  }
  static unauthorized(msg = 'Unauthorized') {
    return new ApiError(401, msg);
  }
  static forbidden(msg = 'Forbidden') {
    return new ApiError(403, msg);
  }
  static notFound(msg = 'Not found') {
    return new ApiError(404, msg);
  }
  static conflict(msg = 'Conflict') {
    return new ApiError(409, msg);
  }
  static serviceUnavailable(msg = 'Service unavailable') {
    return new ApiError(503, msg);
  }
}
