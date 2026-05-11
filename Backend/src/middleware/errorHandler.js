import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const errorHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Invalid request payload',
      details: err.flatten(),
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: err.name,
      message: err.message,
      details: err.details,
    });
  }

  console.error('[unhandled]', err);
  return res.status(500).json({
    error: 'InternalServerError',
    message: env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
};

export const notFound = (_req, res) => {
  res.status(404).json({ error: 'NotFound', message: 'Route not found' });
};
