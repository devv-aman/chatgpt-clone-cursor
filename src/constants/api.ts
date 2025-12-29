export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
  HEADERS: {
    CONTENT_TYPE: 'Content-Type',
    AUTHORIZATION: 'Authorization',
    ACCEPT: 'Accept',
  },
  CONTENT_TYPES: {
    JSON: 'application/json',
    EVENT_STREAM: 'text/event-stream',
  },
} as const;

export const API_ENDPOINTS = {
  HEALTH: '/health',
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    REFRESH: '/api/v1/auth/refresh',
    LOGOUT: '/api/v1/auth/logout',
    ME: '/api/v1/auth/me',
  },
  CHAT: {
    STREAM: '/api/v1/chat/stream',
    STOP_STREAM: (streamId: string) => `/api/v1/chat/stream/${streamId}/stop`,
    LIST: '/api/v1/chats',
    DETAIL: (chatId: string) => `/api/v1/chats/${chatId}`,
    MESSAGES: (chatId: string) => `/api/v1/chats/${chatId}/messages`,
  },
} as const;

