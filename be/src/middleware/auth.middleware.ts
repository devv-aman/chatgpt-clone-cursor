import type { Request, Response, NextFunction } from 'express';
import { getSupabaseClient, getSupabaseAdminClient } from '../db/client.js';
import { UnauthorizedError } from '../utils/errors.js';
import { ERROR_MESSAGES, ERROR_CODES } from '../constants/index.js';
import { HEADERS } from '../constants/api.js';
import type { AuthenticatedUser } from '../types/common.types.js';
import { logger } from '../utils/logger.js';

const BEARER_PREFIX = 'Bearer ';

const extractToken = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith(BEARER_PREFIX)) {
    return null;
  }
  return authHeader.slice(BEARER_PREFIX.length);
};

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers[HEADERS.AUTHORIZATION.toLowerCase()];
    const token = extractToken(authHeader as string | undefined);

    if (!token) {
      throw new UnauthorizedError(
        ERROR_MESSAGES.AUTH.TOKEN_MISSING,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    // Verify the token with Supabase
    const supabase = getSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      logger.warn({ error: userError }, 'Token verification failed');
      throw new UnauthorizedError(
        ERROR_MESSAGES.AUTH.TOKEN_INVALID,
        ERROR_CODES.TOKEN_INVALID
      );
    }

    // Fetch the user's profile
    const adminClient = getSupabaseAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .is('deleted_at', null)
      .single();

    if (profileError || !profile) {
      logger.warn({ error: profileError, userId: user.id }, 'Profile not found');
      throw new UnauthorizedError(
        ERROR_MESSAGES.AUTH.USER_NOT_FOUND,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    // Attach user to request
    const authenticatedUser: AuthenticatedUser = {
      supabaseUser: user,
      profile,
    };

    req.user = authenticatedUser;
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers[HEADERS.AUTHORIZATION.toLowerCase()];
    const token = extractToken(authHeader as string | undefined);

    if (!token) {
      // No token provided, continue without auth
      return next();
    }

    // Verify the token with Supabase
    const supabase = getSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      // Invalid token, continue without auth
      return next();
    }

    // Fetch the user's profile
    const adminClient = getSupabaseAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .is('deleted_at', null)
      .single();

    if (!profileError && profile) {
      const authenticatedUser: AuthenticatedUser = {
        supabaseUser: user,
        profile,
      };
      req.user = authenticatedUser;
    }

    next();
  } catch {
    // On any error, continue without auth
    next();
  }
};

