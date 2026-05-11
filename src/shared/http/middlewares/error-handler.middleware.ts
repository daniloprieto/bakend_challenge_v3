import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { isPostgresError } from '../../database/postgres-error.js';
import { HttpError } from '../errors/http-error.js';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        details: error.issues.map((issue) => ({
          message: issue.message,
          path: issue.path.join('.'),
        })),
        message: 'Invalid request data',
      },
    });
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  if (isInvalidJsonError(error)) {
    response.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON payload',
      },
    });
    return;
  }

  if (isPostgresError(error)) {
    const mappedError = mapPostgresError(error);

    if (mappedError) {
      response.status(mappedError.statusCode).json({
        error: {
          code: mappedError.code,
          message: mappedError.message,
        },
      });
      return;
    }
  }

  response.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected server error',
    },
  });
};

function mapPostgresError(error: {
  code?: string;
  constraint?: string;
}): HttpError | null {
  if (error.code === '23505') {
    if (error.constraint === 'person_email_key') {
      return new HttpError(
        'Contact with that email already exists',
        409,
        'CONTACT_EMAIL_ALREADY_EXISTS',
      );
    }

    return new HttpError('Resource already exists', 409, 'RESOURCE_CONFLICT');
  }

  if (error.code === '23503') {
    return new HttpError('Referenced resource was not found', 400, 'INVALID_REFERENCE');
  }

  if (error.code === '23514') {
    return new HttpError('Database constraint violated', 400, 'CONSTRAINT_VIOLATION');
  }

  return null;
}

function isInvalidJsonError(error: unknown): boolean {
  return (
    error instanceof SyntaxError &&
    'status' in error &&
    error.status === 400 &&
    'body' in error
  );
}
