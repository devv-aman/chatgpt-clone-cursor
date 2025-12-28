import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { isAppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { HTTP_STATUS } from '../constants/api.js';
import { ERROR_MESSAGES, ERROR_CODES } from '../constants/errors.js';
import { isProduction } from '../config/index.js';
import type { ErrorResponse } from '../types/common.types.js';

const formatZodError = (error: ZodError): string => {
  return error.errors
    .map((e) => {
      const path = e.path.join('.');
      return path ? `${path}: ${e.message}` : e.message;
    })
    .join(', ');
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log the error
  if (isAppError(err) && err.isOperational) {
    logger.warn({ err, code: err.code }, err.message);
  } else {
    logger.error({ err }, 'Unexpected error occurred');
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: formatZodError(err),
        code: ERROR_CODES.VALIDATION_ERROR,
        statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
        details: err.errors,
        timestamp: new Date().toISOString(),
      },
    };
    res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json(response);
    return;
  }

  // Handle AppError instances
  if (isAppError(err)) {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: err.message,
        code: err.code,
        statusCode: err.statusCode,
        ...(err.details !== undefined && !isProduction && { details: err.details }),
        timestamp: err.timestamp,
      },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle unknown errors
  const response: ErrorResponse = {
    success: false,
    error: {
      message: isProduction ? ERROR_MESSAGES.SERVER.INTERNAL_ERROR : err.message,
      code: ERROR_CODES.INTERNAL_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ...(!isProduction && { details: err.stack }),
      timestamp: new Date().toISOString(),
    },
  };
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const response: ErrorResponse = {
    success: false,
    error: {
      message: `Cannot ${req.method} ${req.path}`,
      code: ERROR_CODES.NOT_FOUND,
      statusCode: HTTP_STATUS.NOT_FOUND,
      timestamp: new Date().toISOString(),
    },
  };
  res.status(HTTP_STATUS.NOT_FOUND).json(response);
};
