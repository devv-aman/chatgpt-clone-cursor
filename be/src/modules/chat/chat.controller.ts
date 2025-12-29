import type { Request, Response, NextFunction } from 'express';
import { chatService } from './chat.service.js';
import { HTTP_STATUS } from '../../constants/api.js';
import { STRINGS } from '../../constants/strings.js';
import { CHAT_CONSTANTS } from './chat.constants.js';
import { UnauthorizedError } from '../../utils/errors.js';
import { ERROR_MESSAGES, ERROR_CODES } from '../../constants/errors.js';
import type {
  StreamChatInput,
  ChatParams,
  StreamParams,
  SSEEvent,
  MessagesResponse,
  ChatsResponse,
} from './chat.schema.js';
import type { ApiResponse } from '../../types/common.types.js';
import type { Chat } from '../../db/types.js';

const sendSSEEvent = (res: Response, event: SSEEvent): void => {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
};

const requireUser = (req: Request): string => {
  if (!req.user) {
    throw new UnauthorizedError(
      ERROR_MESSAGES.AUTH.UNAUTHORIZED,
      ERROR_CODES.UNAUTHORIZED
    );
  }
  return req.user.profile.id;
};

export const streamChat = async (
  req: Request<Record<string, string>, unknown, StreamChatInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = requireUser(req);

    // Set SSE headers
    res.setHeader('Content-Type', CHAT_CONSTANTS.SSE.HEADERS.CONTENT_TYPE);
    res.setHeader('Cache-Control', CHAT_CONSTANTS.SSE.HEADERS.CACHE_CONTROL);
    res.setHeader('Connection', CHAT_CONSTANTS.SSE.HEADERS.CONNECTION);
    res.setHeader('X-Accel-Buffering', CHAT_CONSTANTS.SSE.HEADERS.X_ACCEL_BUFFERING);
    res.flushHeaders();

    // Handle client disconnect
    let isClientConnected = true;
    req.on('close', () => {
      isClientConnected = false;
    });

    const sendEvent = (event: SSEEvent): void => {
      if (isClientConnected) {
        sendSSEEvent(res, event);
      }
    };

    const onComplete = (): void => {
      if (isClientConnected) {
        res.end();
      }
    };

    await chatService.streamChat(userId, req.body, sendEvent, onComplete);
  } catch (error) {
    // If headers already sent, we need to send error via SSE
    if (res.headersSent) {
      sendSSEEvent(res, {
        type: CHAT_CONSTANTS.SSE.EVENT_TYPES.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      res.end();
    } else {
      next(error);
    }
  }
};

export const stopStream = async (
  req: Request<StreamParams>,
  res: Response<ApiResponse<null>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = requireUser(req);
    const { streamId } = req.params;

    await chatService.stopChatStream(streamId, userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: STRINGS.CHAT.STREAM_STOPPED,
    });
  } catch (error) {
    next(error);
  }
};

export const getChats = async (
  req: Request,
  res: Response<ApiResponse<ChatsResponse>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = requireUser(req);
    const limitParam = req.query.limit as string | undefined;
    const offsetParam = req.query.offset as string | undefined;
    const limit = Math.min(
      limitParam ? parseInt(limitParam, 10) : CHAT_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
      CHAT_CONSTANTS.PAGINATION.MAX_LIMIT
    );
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

    const result = await chatService.getUserChats(userId, limit, offset);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: STRINGS.CHAT.CHATS_FETCHED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getChat = async (
  req: Request<ChatParams>,
  res: Response<ApiResponse<Chat>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = requireUser(req);
    const { chatId } = req.params;

    const chat = await chatService.getChatSession(chatId, userId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: STRINGS.CHAT.CHAT_FETCHED,
      data: chat,
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (
  req: Request<ChatParams>,
  res: Response<ApiResponse<MessagesResponse>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = requireUser(req);
    const { chatId } = req.params;
    const limitParam = req.query.limit as string | undefined;
    const offsetParam = req.query.offset as string | undefined;
    const limit = Math.min(
      limitParam ? parseInt(limitParam, 10) : CHAT_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
      CHAT_CONSTANTS.PAGINATION.MAX_LIMIT
    );
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

    const result = await chatService.getMessagesForChat(chatId, userId, limit, offset);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: STRINGS.CHAT.MESSAGES_FETCHED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const chatController = {
  streamChat,
  stopStream,
  getChats,
  getChat,
  getMessages,
};
