import type { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { HTTP_STATUS } from '../../constants/api.js';
import { STRINGS } from '../../constants/strings.js';
import { HEADERS } from '../../constants/api.js';
import { UnauthorizedError } from '../../utils/errors.js';
import { ERROR_MESSAGES, ERROR_CODES } from '../../constants/errors.js';
import type { RegisterInput, LoginInput, RefreshTokenInput, RegisterResponse } from './auth.schema.js';
import type { ApiResponse } from '../../types/common.types.js';
import type { AuthResponse, UserResponse } from './auth.schema.js';
import type { AuthTokens } from './auth.service.js';

const BEARER_PREFIX = 'Bearer ';

export const register = async (
  req: Request<unknown, unknown, RegisterInput>,
  res: Response<ApiResponse<RegisterResponse>>,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.register(req.body);

    const message = result.confirmationRequired
      ? STRINGS.AUTH.REGISTER_CONFIRMATION_REQUIRED
      : STRINGS.AUTH.REGISTER_SUCCESS;

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<unknown, unknown, LoginInput>,
  res: Response<ApiResponse<AuthResponse>>,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.login(req.body);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: STRINGS.AUTH.LOGIN_SUCCESS,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers[HEADERS.AUTHORIZATION.toLowerCase()];
    
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith(BEARER_PREFIX)) {
      throw new UnauthorizedError(
        ERROR_MESSAGES.AUTH.TOKEN_MISSING,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const token = authHeader.slice(BEARER_PREFIX.length);
    await authService.logout(token);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: STRINGS.AUTH.LOGOUT_SUCCESS,
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: Request,
  res: Response<ApiResponse<UserResponse>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError(
        ERROR_MESSAGES.AUTH.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const user = await authService.getCurrentUser(req.user.profile.id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: STRINGS.AUTH.USER_FETCHED,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request<Record<string, string>, unknown, RefreshTokenInput>,
  res: Response<ApiResponse<AuthTokens>>,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.refreshToken(req.body);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: STRINGS.AUTH.TOKEN_REFRESHED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const authController = {
  register,
  login,
  logout,
  me,
  refresh,
};

