import { z } from 'zod';
import { ERROR_MESSAGES } from '../../constants/errors.js';
import { CHAT_CONSTANTS } from './chat.constants.js';
import type { Message, Chat } from '../../db/types.js';

// Stream request schema
export const streamChatSchema = z.object({
  message: z.string().min(1, ERROR_MESSAGES.MESSAGE.EMPTY_CONTENT),
  model: z.string().optional().default(CHAT_CONSTANTS.DEFAULT_MODEL),
  chatId: z.string().uuid().optional(),
});

export type StreamChatInput = z.infer<typeof streamChatSchema>;

// Stop stream request schema
export const stopStreamSchema = z.object({
  streamId: z.string().uuid(),
});

export type StopStreamInput = z.infer<typeof stopStreamSchema>;

// Chat params schema
export const chatParamsSchema = z.object({
  chatId: z.string().uuid(),
});

export type ChatParams = z.infer<typeof chatParamsSchema>;

// Stream params schema
export const streamParamsSchema = z.object({
  streamId: z.string().uuid(),
});

export type StreamParams = z.infer<typeof streamParamsSchema>;

// Messages query schema
export const messagesQuerySchema = z.object({
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
});

export type MessagesQuery = z.infer<typeof messagesQuerySchema>;

// Chats query schema
export const chatsQuerySchema = z.object({
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
});

export type ChatsQuery = z.infer<typeof chatsQuerySchema>;

// Response types
export interface SessionEvent {
  type: 'session';
  chatId: string;
  streamId: string;
}

export interface ContentEvent {
  type: 'content';
  delta: string;
}

export interface DoneEvent {
  type: 'done';
  messageId: string;
}

export interface ErrorEvent {
  type: 'error';
  message: string;
}

export type SSEEvent = SessionEvent | ContentEvent | DoneEvent | ErrorEvent;

export interface ChatResponse extends Chat {
  messageCount?: number;
}

export interface MessagesResponse {
  messages: Message[];
  total: number;
}

export interface ChatsResponse {
  chats: ChatResponse[];
  total: number;
}

