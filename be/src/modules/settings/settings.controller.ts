import type { Request, Response, NextFunction } from 'express';
import { settingsService } from './settings.service.js';
import { HTTP_STATUS } from '../../constants/api.js';
import { STRINGS } from '../../constants/strings.js';
import { UnauthorizedError } from '../../utils/errors.js';
import { ERROR_MESSAGES, ERROR_CODES } from '../../constants/errors.js';
import type { SaveOpenAIKeyInput, OpenAIKeyStatusResponse } from './settings.schema.js';
import type { ApiResponse } from '../../types/common.types.js';

const requireUser = (req: Request): string => {
  if (!req.user) {
    throw new UnauthorizedError(
      ERROR_MESSAGES.AUTH.UNAUTHORIZED,
      ERROR_CODES.UNAUTHORIZED
    );
  }
  return req.user.profile.id;
};

export const saveOpenAIKey = async (
  req: Request<Record<string, string>, unknown, SaveOpenAIKeyInput>,
  res: Response<ApiResponse<null>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = requireUser(req);
    await settingsService.saveOpenAIKey(userId, req.body);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: STRINGS.SETTINGS.OPENAI_KEY_SAVED,
    });
  } catch (error) {
    next(error);
  }
};

export const getOpenAIKeyStatus = async (
  req: Request,
  res: Response<ApiResponse<OpenAIKeyStatusResponse>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = requireUser(req);
    const status = await settingsService.hasOpenAIKey(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: status.hasKey ? STRINGS.SETTINGS.OPENAI_KEY_EXISTS : STRINGS.SETTINGS.OPENAI_KEY_NOT_SET,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOpenAIKey = async (
  req: Request,
  res: Response<ApiResponse<null>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = requireUser(req);
    await settingsService.deleteOpenAIKey(userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: STRINGS.SETTINGS.OPENAI_KEY_DELETED,
    });
  } catch (error) {
    next(error);
  }
};

export const settingsController = {
  saveOpenAIKey,
  getOpenAIKeyStatus,
  deleteOpenAIKey,
};
