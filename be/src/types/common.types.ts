import type { Request, Response, NextFunction } from 'express';
import type { Profile } from '../db/types.js';
import type { User } from '@supabase/supabase-js';

export interface AuthenticatedUser {
  supabaseUser: User;
  profile: Profile;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

export type AsyncRequestHandler<
  TParams = Record<string, string>,
  TBody = unknown,
  TQuery = Record<string, string>,
> = (
  req: Request<TParams, unknown, TBody, TQuery>,
  res: Response,
  next: NextFunction
) => Promise<void>;

export type AuthenticatedRequestHandler<
  TParams = Record<string, string>,
  TBody = unknown,
  TQuery = Record<string, string>,
> = (
  req: AuthenticatedRequest & Request<TParams, unknown, TBody, TQuery>,
  res: Response,
  next: NextFunction
) => Promise<void>;

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    statusCode: number;
    details?: unknown;
    timestamp: string;
  };
}

