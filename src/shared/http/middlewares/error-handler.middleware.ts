import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { HttpError } from '../errors/http-error.js';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: 'ValidationError',
      issues: error.issues,
      message: 'Invalid request data',
    });
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      error: error.name,
      message: error.message,
    });
    return;
  }

  response.status(500).json({
    error: 'InternalServerError',
    message: 'Unexpected server error',
  });
};
