import { HTTP_STATUS } from '../constants/api.js';
import { ERROR_CODES } from '../constants/errors.js';

export interface AppErrorOptions {
  message: string;
  statusCode: number;
  code: string;
  details?: unknown;
  isOperational?: boolean;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: unknown;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = this.constructor.name;
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;
    this.isOperational = options.isOperational ?? true;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        ...(this.details !== undefined && { details: this.details }),
        timestamp: this.timestamp,
      },
    };
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: unknown) {
    super({
      message,
      statusCode: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      details,
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, code: string = ERROR_CODES.UNAUTHORIZED) {
    super({
      message,
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      code,
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super({
      message,
      statusCode: HTTP_STATUS.FORBIDDEN,
      code: ERROR_CODES.FORBIDDEN,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super({
      message,
      statusCode: HTTP_STATUS.NOT_FOUND,
      code: ERROR_CODES.NOT_FOUND,
    });
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super({
      message,
      statusCode: HTTP_STATUS.CONFLICT,
      code: ERROR_CODES.CONFLICT,
    });
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super({
      message,
      statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      code: ERROR_CODES.VALIDATION_ERROR,
      details,
    });
  }
}

export class InternalServerError extends AppError {
  constructor(message: string, details?: unknown) {
    super({
      message,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      code: ERROR_CODES.INTERNAL_ERROR,
      details,
      isOperational: false,
    });
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super({
      message,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      code: ERROR_CODES.DATABASE_ERROR,
      details,
      isOperational: false,
    });
  }
}

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

